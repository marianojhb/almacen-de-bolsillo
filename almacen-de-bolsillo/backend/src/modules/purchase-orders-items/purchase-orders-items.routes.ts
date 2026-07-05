import { Router } from 'express';
import {
  getPurchaseOrdersItems,
  getPurchaseOrderItemById,
  postPurchaseOrderItem,
  updatePurchaseOrderItem,
  deletePurchaseOrderItem,
} from './purchase-orders-items.controller.js';

const purchaseOrdersItemsRouter: Router = Router();

purchaseOrdersItemsRouter.get('/', getPurchaseOrdersItems);
purchaseOrdersItemsRouter.get('/:purchaseOrderId/:productId', getPurchaseOrderItemById);
purchaseOrdersItemsRouter.post('/', postPurchaseOrderItem);
purchaseOrdersItemsRouter.put('/:purchaseOrderId/:productId', updatePurchaseOrderItem);
purchaseOrdersItemsRouter.delete('/:purchaseOrderId/:productId', deletePurchaseOrderItem);

export default purchaseOrdersItemsRouter;
