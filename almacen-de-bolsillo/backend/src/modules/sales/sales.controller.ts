import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { readId, sendApiError, checkPermission } from "../auth/request.utils.js";
import {
  getSalesOrdersFromDatabase,
  getSalesOrderByIdFromDatabase,
  postSalesOrderToDatabase,
  updateSalesOrderFromDatabase,
  deleteSalesOrderFromDatabase,
} from "./sales.service.js";

const getSalesOrders = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getSalesOrdersFromDatabase(session.commerce.id);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const getSalesOrderById = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getSalesOrderByIdFromDatabase(readId(req.params.id), session.commerce.id);
    if (!result) {
      res.status(404).json({ message: "Venta no encontrado en este comercio." });
      return;
    }
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const postSalesOrder = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await postSalesOrderToDatabase(req.body, session.commerce.id, session.user.id);
    res.status(201).json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const updateSalesOrder = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    if (req.body?.isActive === false) checkPermission(session.permissions, "sales.delete");
    const result = await updateSalesOrderFromDatabase(readId(req.params.id), req.body, session.commerce.id);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const deleteSalesOrder = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await deleteSalesOrderFromDatabase(readId(req.params.id), session.commerce.id);
    res.status(204).send();
  } catch (error) {
    sendApiError(res, error);
  }
};

export { getSalesOrders, getSalesOrderById, postSalesOrder, updateSalesOrder, deleteSalesOrder };
