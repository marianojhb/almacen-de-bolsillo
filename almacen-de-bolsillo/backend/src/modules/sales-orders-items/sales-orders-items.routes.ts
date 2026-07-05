import { Router } from 'express';
import {
  getSalesOrdersItems,
  getSalesOrderItemById,
  postSalesOrderItem,
  updateSalesOrderItem,
  deleteSalesOrderItem,
} from './sales-orders-items.controller.js';

const salesOrdersItemsRouter: Router = Router();

salesOrdersItemsRouter.get('/', getSalesOrdersItems);
salesOrdersItemsRouter.get('/:salesOrderId/:productId', getSalesOrderItemById);
salesOrdersItemsRouter.post('/', postSalesOrderItem);
salesOrdersItemsRouter.put('/:salesOrderId/:productId', updateSalesOrderItem);
salesOrdersItemsRouter.delete('/:salesOrderId/:productId', deleteSalesOrderItem);

export default salesOrdersItemsRouter;
