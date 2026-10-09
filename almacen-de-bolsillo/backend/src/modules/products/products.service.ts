import { ApiError } from "../auth/request.utils.js";
import { assertProductQuantity, assertProductUnitChange } from "./products.rules.js";
import { productValuesResponse, supplierConditionsResponse } from "./products.response.js";
import { prisma } from "../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import type {
  CreateProductDto,
  CreateProductOnSupplierFromProductDto,
  UpdateProductDto,
} from "@almacen/shared";

const getProductRelationsArgs = (commerceId: number) => ({
  include: {
    category: {
      select: {
        id: true,
        name: true,
      },
    },
    suppliers: {
      where: { commerceId, supplier: { commerceId } },
      include: { supplier: { select: { id: true, name: true, isActive: true } } },
    },
  },
} satisfies Prisma.ProductDefaultArgs);


const validateProductRelations = async (tx: Prisma.TransactionClient, commerceId: number, categoryId: number, 
  supplierRelations?: CreateProductOnSupplierFromProductDto[]) => {
  const category = await tx.category.findUnique({
    where: { id: categoryId, commerceId },
    select: { id: true },
  });
  if (!category) throw new ApiError(400, "La categoría no está disponible en este comercio.");

  if (supplierRelations?.length) {
    const supplierIds = supplierRelations.map((relation) => relation.supplierId);
    const count = await tx.supplier.count({ where: { id: { in: supplierIds }, commerceId } });
    if (count !== supplierIds.length) {
      throw new ApiError(400, "Uno o más proveedores no están disponibles en este comercio.");
    }
  }
};

const getProductsFromDatabase = async (commerceId: number, { includeInactive = true }: { includeInactive?: boolean } = {}) => {
  const products = await prisma.product.findMany({
    ...getProductRelationsArgs(commerceId),
    where: { commerceId, category: { commerceId }, ...(!includeInactive && { isActive: true }) },
    orderBy: { shortname: "asc" },
  });
  return products.map(productResponse);
};

const getProductByIdFromDatabase = async (productId: number, commerceId: number) => {
  const product = await prisma.product.findUnique({
    ...getProductRelationsArgs(commerceId),
    where: { id: productId, commerceId, category: { commerceId } },
  });
  return product ? productResponse(product) : null;
};

type ProductRecord = Prisma.ProductGetPayload<ReturnType<typeof getProductRelationsArgs>>;
const productResponse = (product: ProductRecord) => ({
  ...product,
  ...productValuesResponse(product),
  suppliers: product.suppliers.map((relation) => ({ ...relation, ...supplierConditionsResponse(relation) })),
});

const postProductToDatabase = async (productData: CreateProductDto, commerceId: number) => {
  const { supplierRelations, ...productFields } = productData;
  return prisma.$transaction(async (tx) => {
    assertProductQuantity(productData.stock, productData.measurementUnit);
    assertProductQuantity(productData.stockMin, productData.measurementUnit);
    for (const relation of supplierRelations ?? []) {
      if (relation.minimumQuantity != null) assertProductQuantity(relation.minimumQuantity, productData.measurementUnit);
    }
    await validateProductRelations(tx, commerceId, productData.categoryId, supplierRelations);
    const product = await tx.product.create({ data: { ...productFields, commerceId } });
    if (supplierRelations?.length) await tx.productOnSupplier.createMany({
      data: supplierRelations.map((relation) => ({ ...relation, productId: product.id, commerceId })),
    });
    return productResponse(await tx.product.findUniqueOrThrow({ where: { id: product.id, commerceId }, ...getProductRelationsArgs(commerceId) }));
  });
};

const updateProductFromDatabase = async (productId: number, productData: UpdateProductDto, commerceId: number) => {
  const { supplierRelations, ...productFields } = productData;
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id_product_p" FROM "products_p"
      WHERE "id_product_p" = ${productId} AND "id_commerce_p" = ${commerceId} FOR UPDATE`;
    const current = await tx.product.findUnique({
      where: { id: productId, commerceId },
      include: { suppliers: { where: { commerceId } }, _count: { select: { purchaseOrdersItems: true, salesOrderItems: true, stockMovements: true } } },
    });
    if (!current) return null;
    const unit = productData.measurementUnit ?? current.measurementUnit;
    assertProductUnitChange(current.measurementUnit, unit, Number(current.stock),
      current._count.purchaseOrdersItems + current._count.salesOrderItems + current._count.stockMovements > 0);
    assertProductQuantity(Number(current.stock), unit);
    assertProductQuantity(productData.stockMin ?? Number(current.stockMin), unit);
    for (const relation of supplierRelations ?? current.suppliers) {
      if (relation.minimumQuantity != null) assertProductQuantity(Number(relation.minimumQuantity), unit);
    }
    if (unit !== current.measurementUnit && current.suppliers.length && supplierRelations === undefined) {
      throw new ApiError(409, "Al cambiar la unidad, revisá y enviá también las condiciones de los proveedores.");
    }
    await validateProductRelations(tx, commerceId, productData.categoryId ?? current.categoryId, supplierRelations);
    await tx.product.update({ where: { id: productId, commerceId }, data: productFields });
    if (supplierRelations !== undefined) {
      await tx.productOnSupplier.deleteMany({ where: { productId, commerceId } });
      if (supplierRelations.length) await tx.productOnSupplier.createMany({
        data: supplierRelations.map((relation) => ({ ...relation, productId, commerceId })),
      });
    }
    return productResponse(await tx.product.findUniqueOrThrow({ where: { id: productId, commerceId }, ...getProductRelationsArgs(commerceId) }));
  });
};

const deleteProductFromDatabase = async (productId: number, commerceId: number) => {
  const product = await prisma.product.update({
    where: { id: productId, commerceId },
    data: { isActive: false },
    ...getProductRelationsArgs(commerceId),
  });
  return product;
};

export {
  getProductsFromDatabase,
  getProductByIdFromDatabase,
  postProductToDatabase,
  updateProductFromDatabase,
  deleteProductFromDatabase,
};
