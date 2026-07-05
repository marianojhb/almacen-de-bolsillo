import { Router } from 'express';
import { getProducts, getProductById, postProduct, updateProduct, deleteProduct } from './products.controller.js';

const productsRouter: Router = Router();

productsRouter.get('/', getProducts);

productsRouter.get('/:id', getProductById);

productsRouter.post('/', postProduct);

productsRouter.put('/:id', updateProduct);

productsRouter.delete('/:id', deleteProduct);

export default productsRouter;
