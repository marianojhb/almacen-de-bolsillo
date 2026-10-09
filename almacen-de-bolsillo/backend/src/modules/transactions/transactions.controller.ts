import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { readId, sendApiError } from "../auth/request.utils.js";
import {
  getTransactionsFromDatabase,
  getTransactionByIdFromDatabase,
  postTransactionToDatabase,
  updateTransactionFromDatabase,
  deleteTransactionFromDatabase,
} from "./transactions.service.js";

const getTransactions = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getTransactionsFromDatabase(session.commerce.id, req.query.from, req.query.to);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const getTransactionById = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getTransactionByIdFromDatabase(readId(req.params.id), session.commerce.id);
    if (!result) {
      res.status(404).json({ message: "Transacción no encontrado en este comercio." });
      return;
    }
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const postTransaction = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await postTransactionToDatabase(req.body, session.commerce.id);
    res.status(201).json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const updateTransaction = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await updateTransactionFromDatabase(readId(req.params.id), req.body, session.commerce.id);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await deleteTransactionFromDatabase(readId(req.params.id), session.commerce.id);
    res.status(204).send();
  } catch (error) {
    sendApiError(res, error);
  }
};

export { getTransactions, getTransactionById, postTransaction, updateTransaction, deleteTransaction };
