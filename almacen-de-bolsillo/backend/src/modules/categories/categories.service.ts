import { ApiError } from "../auth/request.utils.js";
import { prisma } from "../config/prisma.js";
import type { CreateCategoryDto } from "@almacen/shared";


const getCategoriesFromDatabase = async (commerceId: number) => {
  const categories = await prisma.category.findMany({ where: { commerceId }, orderBy: { name: "asc" } });
  return categories;
};

const getCategoryByIdFromDatabase = async (categoryId: number, commerceId: number) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId, commerceId },
  });
  return category;
};

const postCategoryToDatabase = async (categoryData: CreateCategoryDto, commerceId: number) => {
  const category = await prisma.category.create({
    data: { name: categoryData.name, commerceId },
  });

  return category;
};

const updateCategoryFromDatabase = async (categoryId: number, categoryData: CreateCategoryDto, commerceId: number) => {
  const category = await prisma.category.update({
    where: { id: categoryId, commerceId },
    data: { name: categoryData.name },
  });
  return category;
};

const deleteCategoryFromDatabase = async (categoryId: number, commerceId: number) => {
  return prisma.$transaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id: categoryId, commerceId },
      select: { id: true, _count: { select: { products: true } } },
    });
    if (!category) return null;
    if (category._count.products > 0) {
      throw new ApiError(409, "No se puede eliminar una categoría que tiene productos asociados.");
    }
    return tx.category.delete({ where: { id: categoryId, commerceId } });
  });
};

export {

  getCategoriesFromDatabase,
  getCategoryByIdFromDatabase,
  postCategoryToDatabase,
  updateCategoryFromDatabase,
  deleteCategoryFromDatabase,
};
