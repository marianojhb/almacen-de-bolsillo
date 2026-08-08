import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

const ProductWithRelationsArgs = {
  include: {
    category: {
      select: {
        id: true,
        name: true,
      },
    },
    suppliers: {
      select: {
        id: true,
        name: true,
      },
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

const postProductToDatabase = async (productData: Prisma.ProductUncheckedCreateInput) => {
  const product = await prisma.product.create({
    data: productData,
    ...ProductWithRelationsArgs,
  });

  return product;
};

const updateProductFromDatabase = async (
  productId: number,
  productData: Prisma.ProductUncheckedUpdateInput,
  suppliers?: number[],
) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...productData,

      ...(suppliers !== undefined && {
        suppliers: {
          set: suppliers.map((id) => ({ id })),
        },
      }),
    },
    ...ProductWithRelationsArgs,
  });

  return product;
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
