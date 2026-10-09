import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  postCategory,
  updateCategory,
  deleteCategory,
} from './categories.controller.js';
import { requireAuth, requirePermission } from "../auth/auth.middleware.js";

const categoriesRouter: Router = Router();
categoriesRouter.use(requireAuth);

categoriesRouter.get('/', requirePermission("categories.read"), getCategories);

categoriesRouter.get('/:id', requirePermission("categories.read"), getCategoryById);

categoriesRouter.post('/', requirePermission("categories.create"), postCategory);

categoriesRouter.put('/:id', requirePermission("categories.update"), updateCategory);

categoriesRouter.delete('/:id', requirePermission("categories.delete"), deleteCategory);

export default categoriesRouter;
