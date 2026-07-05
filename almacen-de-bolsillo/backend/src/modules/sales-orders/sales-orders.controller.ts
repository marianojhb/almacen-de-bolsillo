import type { Request, Response } from 'express';

import {
  getSalesOrdersFromDatabase,
  getSalesOrderByIdFromDatabase,
  postSalesOrderToDatabase,
  updateSalesOrderFromDatabase,
  deleteSalesOrderFromDatabase,
} from './sales-orders.service.js';

const getSalesOrders = async (req: Request, res: Response) => {
  try {
    res.json(await getSalesOrdersFromDatabase());
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSalesOrderById = async (req: Request, res: Response) => {
  const salesOrderId = Number(req.params.id);

  try {
    const salesOrder = await getSalesOrderByIdFromDatabase(salesOrderId);
    salesOrder ? res.json(salesOrder) : res.status(404).json({ message: 'Sales order not found' });
  } catch (error) {
    console.error('Error fetching sales order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const postSalesOrder = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await postSalesOrderToDatabase(req.body));
  } catch (error) {
    console.error('Error creating sales order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateSalesOrder = async (req: Request, res: Response) => {
  const salesOrderId = Number(req.params.id);

  try {
    res.json(await updateSalesOrderFromDatabase(salesOrderId, req.body));
  } catch (error) {
    console.error('Error updating sales order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteSalesOrder = async (req: Request, res: Response) => {
  const salesOrderId = Number(req.params.id);

  try {
    await deleteSalesOrderFromDatabase(salesOrderId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting sales order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getSalesOrders, getSalesOrderById, postSalesOrder, updateSalesOrder, deleteSalesOrder };
