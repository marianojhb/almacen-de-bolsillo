import { Router } from 'express';
import { getSuppliers, getSupplierById, postSupplier, updateSupplier, deleteSupplier } from './suppliers.controller.js';

const suppliersRouter: Router = Router();

suppliersRouter.get('/', getSuppliers);
suppliersRouter.get('/:id', getSupplierById);
suppliersRouter.post('/', postSupplier);
suppliersRouter.put('/:id', updateSupplier);
suppliersRouter.delete('/:id', deleteSupplier);

export default suppliersRouter;
