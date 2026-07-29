import { Router } from 'express';
import {
  getSalesOrders,
  getSalesOrdersWithItems,
  getSalesOrderById,
  postSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
} from './sales-orders.controller.js';

const salesOrdersRouter: Router = Router();

salesOrdersRouter.get('/', getSalesOrders);
salesOrdersRouter.get('/with-items', getSalesOrdersWithItems);
salesOrdersRouter.get('/:id', getSalesOrderById);
salesOrdersRouter.post('/', postSalesOrder);
salesOrdersRouter.put('/:id', updateSalesOrder);
salesOrdersRouter.delete('/:id', deleteSalesOrder);

export default salesOrdersRouter;
