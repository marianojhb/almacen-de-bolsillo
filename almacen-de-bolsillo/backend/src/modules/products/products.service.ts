import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

type GetProductsOptions = {
  includeInactive?: boolean;
};

const productWithCategoryQuery = {
  include: {
    category: {
      select: {
        id: true,
        name: true,
      },
    },
  },
} satisfies Prisma.ProductDefaultArgs;

const getProductsFromDatabase = async ({ includeInactive = false }: GetProductsOptions = {}) => {
  if (includeInactive) {
    return prisma.product.findMany(productWithCategoryQuery);
  }

  return prisma.product.findMany({
    ...productWithCategoryQuery,
    where: { isActive: true },
  });
};

const getProductByIdFromDatabase = async (productId: number) => {
  const product = await prisma.product.findUnique({
    ...productWithCategoryQuery,
    where: { id: productId },
  });
  return product;
};

const postProductToDatabase = async (productData: Prisma.ProductUncheckedCreateInput) => {
  const product = await prisma.product.create({
    data: productData,
    ...productWithCategoryQuery,
  });

  return product;
};

const updateProductFromDatabase = async (productId: number, productData: Prisma.ProductUncheckedUpdateInput) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: productData,
    ...productWithCategoryQuery,
  });
  return product;
};

const deleteProductFromDatabase = async (productId: number) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
    ...productWithCategoryQuery,
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
