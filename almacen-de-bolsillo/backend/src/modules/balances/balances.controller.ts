import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { readId, sendApiError } from "../auth/request.utils.js";
import {
  getBalancesFromDatabase,
  getBalanceByIdFromDatabase,
  postBalanceToDatabase,
  updateBalanceFromDatabase,
  deleteBalanceFromDatabase,
} from "./balances.service.js";

const getBalances = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getBalancesFromDatabase(session.commerce.id);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const getBalanceById = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getBalanceByIdFromDatabase(readId(req.params.id), session.commerce.id);
    if (!result) {
      res.status(404).json({ message: "Balance no encontrado en este comercio." });
      return;
    }
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const postBalance = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await postBalanceToDatabase(req.body, session.commerce.id);
    res.status(201).json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const updateBalance = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await updateBalanceFromDatabase(readId(req.params.id), req.body, session.commerce.id);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const deleteBalance = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await deleteBalanceFromDatabase(readId(req.params.id), session.commerce.id);
    res.status(204).send();
  } catch (error) {
    sendApiError(res, error);
  }
};

export { getBalances, getBalanceById, postBalance, updateBalance, deleteBalance };
