import type { Request, Response } from "express";

import {
  getCategoriesFromDatabase,
  getCategoryByIdFromDatabase,
  postCategoryToDatabase,
  updateCategoryFromDatabase,
  deleteCategoryFromDatabase,
} from "./categories.service.js";

const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getCategoriesFromDatabase();
    res.json(categories.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);

  try {
    const category = await getCategoryByIdFromDatabase(categoryId);

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const postCategory = async (req: Request, res: Response) => {
  const categoryData = req.body;

  try {
    const newCategory = await postCategoryToDatabase(categoryData);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);
  const categoryData = req.body;

  try {
    const updatedCategory = await updateCategoryFromDatabase(categoryId, categoryData);
    res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);

  try {
    await deleteCategoryFromDatabase(categoryId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getCategories, getCategoryById, postCategory, updateCategory, deleteCategory };
