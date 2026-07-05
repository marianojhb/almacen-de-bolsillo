import { Router } from 'express';
import { getProducts, getProductById } from '../controllers/product.controller.js';

const productsRouter: Router = Router();



productsRouter.get('/', getProducts);


productsRouter.get('/:id', getProductById);

export default productsRouter;
