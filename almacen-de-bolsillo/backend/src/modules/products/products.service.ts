import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

type GetProductsOptions = {
  includeInactive?: boolean;
};

const getProductsFromDatabase = async ({ includeInactive = false }: GetProductsOptions = {}) => {
  const query = {
    include: {
      category: true,
    },
  };
  if (includeInactive) {
    return prisma.product.findMany(query);
  }

  return prisma.product.findMany({
    ...query,
    where: { isActive: true },
  });
};

const getProductByIdFromDatabase = async (productId: number) => {
    const query = {
    include: {
      category: true,
    },
  };
  const product = await prisma.product.findUnique({
    ...query,
    where: { id: productId },
  });
  return product;
};

const postProductToDatabase = async (productData: Prisma.ProductCreateInput) => {
  const product = await prisma.product.create({
    data: productData,
  });

  return product;
};

const updateProductFromDatabase = async (productId: number, productData: Prisma.ProductUpdateInput) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: productData,
  });
  return product;
};

const deleteProductFromDatabase = async (productId: number) => {
  const product = await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
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
