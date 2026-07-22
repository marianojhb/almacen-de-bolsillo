import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

const getCategoriesFromDatabase = async () => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return categories;
};

const getCategoryByIdFromDatabase = async (categoryId: number) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  return category;
};

const postCategoryToDatabase = async (categoryData: Prisma.CategoryCreateInput) => {
  const category = await prisma.category.create({
    data: categoryData,
  });

  return category;
};

const updateCategoryFromDatabase = async (categoryId: number, categoryData: Prisma.CategoryUpdateInput) => {
  const category = await prisma.category.update({
    where: { id: categoryId },
    data: categoryData,
  });
  return category;
};

const deleteCategoryFromDatabase = async (categoryId: number) => {
  const category = await prisma.category.delete({
    where: { id: categoryId },
  });
  return category;
};

export {
  getCategoriesFromDatabase,
  getCategoryByIdFromDatabase,
  postCategoryToDatabase,
  updateCategoryFromDatabase,
  deleteCategoryFromDatabase,
};
