import { readId, sendApiError } from "../auth/request.utils.js";
import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { validateCategory } from "./categories.validation.js";
import {
  getCategoriesFromDatabase,
  getCategoryByIdFromDatabase,
  postCategoryToDatabase,
  updateCategoryFromDatabase,
  deleteCategoryFromDatabase,
} from "./categories.service.js";

const databaseMessages = {
  "notFound": "Categoría no encontrada.",
  "related": "No se puede eliminar una categoría que tiene productos asociados."
};

const getCategories = async (_req: Request, res: Response) => {
  try {
    const commerceId = getRequestSession(res).commerce.id;
    const categories = await getCategoriesFromDatabase(commerceId);
    res.json(categories.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  try {
    const commerceId = getRequestSession(res).commerce.id;
    const categoryId = readId(req.params.id);
    const category = await getCategoryByIdFromDatabase(categoryId, commerceId);
    if (!category) {
      res.status(404).json({ message: "Categoría no encontrada." });
      return;
    }
    res.json(category);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const postCategory = async (req: Request, res: Response) => {
  try {
    const commerceId = getRequestSession(res).commerce.id;
    const data = validateCategory(req.body);
    const category = await postCategoryToDatabase(data, commerceId);
    res.status(201).json(category);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const commerceId = getRequestSession(res).commerce.id;
    const categoryId = readId(req.params.id);
    const data = validateCategory(req.body);
    const category = await updateCategoryFromDatabase(categoryId, data, commerceId);
    res.json(category);
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const commerceId = getRequestSession(res).commerce.id;
    const categoryId = readId(req.params.id);
    const category = await deleteCategoryFromDatabase(categoryId, commerceId);
    if (!category) {
      res.status(404).json({ message: "Categoría no encontrada." });
      return;
    }
    res.status(204).send();
  } catch (error) {
    sendApiError(res, error, databaseMessages);
  }
};

export { getCategories, getCategoryById, postCategory, updateCategory, deleteCategory };
