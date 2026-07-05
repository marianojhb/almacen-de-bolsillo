import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  postCategory,
  updateCategory,
  deleteCategory,
} from './categories.controller.js';

const categoriesRouter: Router = Router();

categoriesRouter.get('/', getCategories);

categoriesRouter.get('/:id', getCategoryById);

categoriesRouter.post('/', postCategory);

categoriesRouter.put('/:id', updateCategory);

categoriesRouter.delete('/:id', deleteCategory);

export default categoriesRouter;
