import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import type {
  CreateProductDto,
  CreateProductOnSupplierFromProductDto,
  UpdateProductDto,
} from "@almacen/shared";

const ProductWithRelationsArgs = {
  include: {
    category: {
      select: {
        id: true,
        name: true,
      },
    },
    suppliers: {
      include: { supplier: true },
    },
  },
} satisfies Prisma.ProductDefaultArgs;

const getProductsFromDatabase = async ({ includeInactive = true }: { includeInactive?: boolean } = {}) => {
  if (includeInactive) {
    return prisma.product.findMany({
      ...ProductWithRelationsArgs,
      orderBy: { shortname: "asc" },
    });
  }

  return prisma.product.findMany({
    ...ProductWithRelationsArgs,
    where: { isActive: true },
    orderBy: { shortname: "asc" },
  });
};

const getProductByIdFromDatabase = async (productId: number) => {
  const product = await prisma.product.findUnique({
    ...ProductWithRelationsArgs,
    where: { id: productId },
  });
  return product;
};

const toUncheckedSupplierCreate = ({
  supplierId,
  ...relationFields
}: CreateProductOnSupplierFromProductDto): Prisma.ProductOnSupplierUncheckedCreateWithoutProductInput => ({
  supplierId,
  ...relationFields,
});

const postProductToDatabase = async (productData: CreateProductDto) => {
  const { supplierRelations, ...productFields } = productData;

  const data: Prisma.ProductUncheckedCreateInput = {
    ...productFields,
    ...(supplierRelations && supplierRelations.length > 0
      ? {
          suppliers: {
            create: supplierRelations.map(toUncheckedSupplierCreate),
          },
        }
      : {}),
  };

  const product = await prisma.product.create({
    data,
    ...ProductWithRelationsArgs,
  });

  return product;
};

const updateProductFromDatabase = async (productId: number, productData: UpdateProductDto) => {
  const { supplierRelations, ...productFields } = productData;

  const data: Prisma.ProductUncheckedUpdateInput = {
    ...productFields,
    ...(supplierRelations !== undefined && {
      suppliers: {
        deleteMany: {},
        create: supplierRelations.map(toUncheckedSupplierCreate),
      },
    }),
  };

  return prisma.product.update({
    where: { id: productId },
    data,
    ...ProductWithRelationsArgs,
  });
};

const deleteProductFromDatabase = async (productId: number) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
    ...ProductWithRelationsArgs,
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
