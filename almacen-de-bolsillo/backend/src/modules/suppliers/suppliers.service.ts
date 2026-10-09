import { ApiError } from "../auth/request.utils.js";
import type { CreateSupplierDto, UpdateSupplierDto, CreateProductOnSupplierFromSupplierDto } from "@almacen/shared";
import { assertProductQuantity } from "../products/products.rules.js";
import { productValuesResponse, supplierConditionsResponse } from "../products/products.response.js";
import { prisma } from "../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

type SupplierRelationsOptions = {
  includeProducts: boolean;
  includePurchases: boolean;
};


const getSupplierRelationsArgs = (commerceId: number, options: SupplierRelationsOptions) => ({
  include: {
    products: {
      where: {
        commerceId, product: { commerceId },
        // Sin permiso la relación se devuelve como una lista vacía.
        ...(!options.includeProducts && { productId: { in: [] } }),
      },
      include: { product: true },
      orderBy: { product: { shortname: "asc" } },
    },
    purchaseOrders: {
      where: {
        commerceId,
        ...(!options.includePurchases && { id: { in: [] } }),
      },
      orderBy: { date: "desc" },
    },
  },
} satisfies Prisma.SupplierDefaultArgs);

type SupplierRecord = Prisma.SupplierGetPayload<ReturnType<typeof getSupplierRelationsArgs>>;
const supplierResponse = (supplier: SupplierRecord) => ({ ...supplier,
  products: supplier.products.map(({ product, ...relation }) => ({ ...supplierConditionsResponse(relation), product: productValuesResponse(product) })),
});

const getSuppliersFromDatabase = async (commerceId: number, options: SupplierRelationsOptions) =>
  prisma.supplier.findMany({
    ...getSupplierRelationsArgs(commerceId, options),
    where: { commerceId },
    orderBy: { name: "asc" },
  }).then((records) => records.map(supplierResponse));

const getSupplierByIdFromDatabase = async (supplierId: number, commerceId: number, options: SupplierRelationsOptions) =>
  prisma.supplier.findFirst({
    ...getSupplierRelationsArgs(commerceId, options),
    where: { id: supplierId, commerceId, isActive: true },
  }).then((record) => record ? supplierResponse(record) : null);

const postSupplierToDatabase = async (supplierData: CreateSupplierDto, commerceId: number, options: SupplierRelationsOptions) =>
  prisma.supplier.create({
    ...getSupplierRelationsArgs(commerceId, options),
    data: {
      name: supplierData.name,
      cuit: supplierData.cuit,
      commerceId,
      ...(supplierData.phoneCountryCode !== undefined && { phoneCountryCode: supplierData.phoneCountryCode }),
      ...(supplierData.phone !== undefined && { phone: supplierData.phone }),
      ...(supplierData.email !== undefined && { email: supplierData.email }),
      ...(supplierData.address !== undefined && { address: supplierData.address }),
    },
  }).then(supplierResponse);

const updateSupplierFromDatabase = async (
  supplierId: number,
  supplierData: UpdateSupplierDto,
  commerceId: number,
  options: SupplierRelationsOptions,
) => {
  const { productIds, ...supplierFields } = supplierData;

  return prisma.$transaction(async (tx) => {
    const currentSupplier = await tx.supplier.findUnique({
      where: { id: supplierId, commerceId },
      select: { id: true },
    });
    if (!currentSupplier) return null;

    if (productIds !== undefined) {
      const selectedIds = productIds.map((item) => typeof item === "number" ? item : item.productId);
      const detailedProducts = productIds.filter(
        (item): item is CreateProductOnSupplierFromSupplierDto => typeof item !== "number",
      );
      if (new Set(selectedIds).size !== selectedIds.length ||
        (detailedProducts.length > 0 && detailedProducts.length !== productIds.length)) {
        throw new ApiError(400, "La lista contiene productos repetidos o formatos mezclados.");
      }

      // El mismo orden evita bloqueos cruzados con cambios de unidad del producto.
      for (const id of [...selectedIds].sort((a, b) => a - b)) {
        await tx.$queryRaw`SELECT "id_product_p" FROM "products_p" WHERE "id_product_p" = ${id} AND "id_commerce_p" = ${commerceId} FOR UPDATE`;
      }
      const products = await tx.product.findMany({ where: { id: { in: selectedIds }, commerceId }, select: { id: true, measurementUnit: true } });
      if (products.length !== selectedIds.length) {
        throw new ApiError(400, "Uno o más productos no están disponibles en este comercio.");
      }

      for (const relation of detailedProducts) {
        const product = products.find((item) => item.id === relation.productId)!;
        if (relation.minimumQuantity != null) assertProductQuantity(relation.minimumQuantity, product.measurementUnit);
      }

      // Una lista de IDs conserva vínculos existentes, sin inventar precios para nuevos vínculos.
      if (detailedProducts.length === 0 && selectedIds.length > 0) {
        const relationCount = await tx.productOnSupplier.count({
          where: {
            supplierId,
            productId: { in: selectedIds },
            supplier: { commerceId },
            product: { commerceId },
          },
        });
        if (relationCount !== selectedIds.length) {
          throw new ApiError(400, "Para vincular un producto nuevo indicá también su precio por paquete.");
        }
      }
    }

    // Nunca permitir cambiar el ID ni el comercio del proveedor.
    await tx.supplier.update({
      where: { id: supplierId, commerceId },
      data: {
        ...(supplierFields.name !== undefined && { name: supplierFields.name }),
        ...(supplierFields.cuit !== undefined && { cuit: supplierFields.cuit }),
        ...(supplierFields.phoneCountryCode !== undefined && { phoneCountryCode: supplierFields.phoneCountryCode }),
        ...(supplierFields.phone !== undefined && { phone: supplierFields.phone }),
        ...(supplierFields.email !== undefined && { email: supplierFields.email }),
        ...(supplierFields.address !== undefined && { address: supplierFields.address }),
        ...(supplierFields.isActive !== undefined && { isActive: supplierFields.isActive }),
      },
      select: { id: true },
    });

    if (productIds !== undefined) {
      const selectedIds = productIds.map((item) => typeof item === "number" ? item : item.productId);
      await tx.productOnSupplier.deleteMany({
        where: {
          supplierId,
          supplier: { commerceId },
          product: { commerceId },
          productId: { notIn: selectedIds },
        },
      });

      for (const item of productIds) {
        if (typeof item === "number") continue;
        const { productId, ...conditions } = item;
        await tx.productOnSupplier.upsert({
          where: {
            supplierId_productId: { supplierId, productId },
            supplier: { commerceId },
            product: { commerceId },
          },
          create: { supplierId, productId, commerceId, ...conditions },
          update: conditions,
        });
      }
    }

    // Si se acaba de dar de baja, igualmente devolver el resultado de esa operación.
    return supplierResponse(await tx.supplier.findUniqueOrThrow({
      ...getSupplierRelationsArgs(commerceId, options),
      where: { id: supplierId, commerceId },
    }));
  });
};

const deleteSupplierFromDatabase = async (supplierId: number, commerceId: number) =>
  prisma.supplier.update({
    where: { id: supplierId, commerceId },
    data: { isActive: false },
    select: { id: true },
  });

const getSupplierOptionsFromDatabase = (commerceId: number) =>
  prisma.supplier.findMany({
    where: { commerceId, isActive: true },
    select: { id: true, name: true, isActive: true },
    orderBy: { name: "asc" },
  });

export {
  getSupplierOptionsFromDatabase,

  getSuppliersFromDatabase,
  getSupplierByIdFromDatabase,
  postSupplierToDatabase,
  updateSupplierFromDatabase,
  deleteSupplierFromDatabase,
};
