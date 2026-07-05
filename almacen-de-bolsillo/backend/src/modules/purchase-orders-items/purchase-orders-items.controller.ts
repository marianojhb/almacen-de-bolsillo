import type { Request, Response } from 'express';

import {
  getPurchaseOrdersItemsFromDatabase,
  getPurchaseOrderItemByIdFromDatabase,
  postPurchaseOrderItemToDatabase,
  updatePurchaseOrderItemFromDatabase,
  deletePurchaseOrderItemFromDatabase,
} from './purchase-orders-items.service.js';

const getPurchaseOrdersItems = async (req: Request, res: Response) => {
  try {
    res.json(await getPurchaseOrdersItemsFromDatabase());
  } catch (error) {
    console.error('Error fetching purchase order items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPurchaseOrderItemById = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  const purchaseOrderId = Number(req.params.purchaseOrderId);

  try {
    const purchaseOrderItem = await getPurchaseOrderItemByIdFromDatabase(productId, purchaseOrderId);
    purchaseOrderItem ? res.json(purchaseOrderItem) : res.status(404).json({ message: 'Purchase order item not found' });
  } catch (error) {
    console.error('Error fetching purchase order item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const postPurchaseOrderItem = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await postPurchaseOrderItemToDatabase(req.body));
  } catch (error) {
    console.error('Error creating purchase order item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePurchaseOrderItem = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  const purchaseOrderId = Number(req.params.purchaseOrderId);

  try {
    res.json(await updatePurchaseOrderItemFromDatabase(productId, purchaseOrderId, req.body));
  } catch (error) {
    console.error('Error updating purchase order item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deletePurchaseOrderItem = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  const purchaseOrderId = Number(req.params.purchaseOrderId);

  try {
    await deletePurchaseOrderItemFromDatabase(productId, purchaseOrderId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting purchase order item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getPurchaseOrdersItems,
  getPurchaseOrderItemById,
  postPurchaseOrderItem,
  updatePurchaseOrderItem,
  deletePurchaseOrderItem,
};
