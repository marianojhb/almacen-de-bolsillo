import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { readId, sendApiError, checkPermission } from "../auth/request.utils.js";
import {
  getPurchaseOrdersFromDatabase,
  getPurchaseOrderByIdFromDatabase,
  postPurchaseOrderToDatabase,
  updatePurchaseOrderFromDatabase,
  deletePurchaseOrderFromDatabase,
} from "./purchase.service.js";

const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getPurchaseOrdersFromDatabase(session.commerce.id);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const getPurchaseOrderById = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getPurchaseOrderByIdFromDatabase(readId(req.params.id), session.commerce.id);
    if (!result) {
      res.status(404).json({ message: "Compra no encontrado en este comercio." });
      return;
    }
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const postPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await postPurchaseOrderToDatabase(req.body, session.commerce.id, session.user.id);
    res.status(201).json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const updatePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    if (req.body?.isActive === false) checkPermission(session.permissions, "purchases.delete");
    const result = await updatePurchaseOrderFromDatabase(readId(req.params.id), req.body, session.commerce.id);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const deletePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await deletePurchaseOrderFromDatabase(readId(req.params.id), session.commerce.id);
    res.status(204).send();
  } catch (error) {
    sendApiError(res, error);
  }
};

export { getPurchaseOrders, getPurchaseOrderById, postPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder };
