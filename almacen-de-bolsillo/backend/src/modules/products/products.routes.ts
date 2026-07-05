import { Router } from 'express';
import { getProducts, getProductById } from './product.controller.js';

const productsRouter: Router = Router();

productsRouter.get('/', getProducts);

productsRouter.get('/:id', getProductById);

export default productsRouter;
