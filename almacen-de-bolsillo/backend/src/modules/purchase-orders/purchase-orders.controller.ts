import type { Request, Response } from 'express';

import {
  getPurchaseOrdersFromDatabase,
  getPurchaseOrderByIdFromDatabase,
  postPurchaseOrderToDatabase,
  updatePurchaseOrderFromDatabase,
  deletePurchaseOrderFromDatabase,
} from './purchase-orders.service.js';

const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    res.json(await getPurchaseOrdersFromDatabase());
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPurchaseOrderById = async (req: Request, res: Response) => {
  const purchaseOrderId = Number(req.params.id);
  try {
    const purchaseOrder = await getPurchaseOrderByIdFromDatabase(purchaseOrderId);
    purchaseOrder ? res.json(purchaseOrder) : res.status(404).json({ message: 'Purchase order not found' });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const postPurchaseOrder = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await postPurchaseOrderToDatabase(req.body));
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePurchaseOrder = async (req: Request, res: Response) => {
  const purchaseOrderId = Number(req.params.id);
  try {
    res.json(await updatePurchaseOrderFromDatabase(purchaseOrderId, req.body));
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deletePurchaseOrder = async (req: Request, res: Response) => {
  const purchaseOrderId = Number(req.params.id);
  try {
    await deletePurchaseOrderFromDatabase(purchaseOrderId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getPurchaseOrders, getPurchaseOrderById, postPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder };
