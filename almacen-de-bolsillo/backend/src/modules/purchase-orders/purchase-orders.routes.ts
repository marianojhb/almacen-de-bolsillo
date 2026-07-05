import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  postPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from './purchase-orders.controller.js';

const purchaseOrdersRouter: Router = Router();

purchaseOrdersRouter.get('/', getPurchaseOrders);
purchaseOrdersRouter.get('/:id', getPurchaseOrderById);
purchaseOrdersRouter.post('/', postPurchaseOrder);
purchaseOrdersRouter.put('/:id', updatePurchaseOrder);
purchaseOrdersRouter.delete('/:id', deletePurchaseOrder);

export default purchaseOrdersRouter;
