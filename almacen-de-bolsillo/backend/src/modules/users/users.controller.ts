import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { readId, sendApiError } from "../auth/request.utils.js";
import {
  getUsersFromDatabase,
  getUserByIdFromDatabase,
  postUserToDatabase,
  updateUserFromDatabase,
  deleteUserFromDatabase,
  getEmployeeAccountOptions,
} from "./users.service.js";

const getUsers = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getUsersFromDatabase(session.commerce.id);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const getEmployeeOptions = async (_req: Request, res: Response) => {
  try { res.json(await getEmployeeAccountOptions(getRequestSession(res).commerce.id)); }
  catch (error) { sendApiError(res, error); }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await getUserByIdFromDatabase(readId(req.params.id), session.commerce.id);
    if (!result) {
      res.status(404).json({ message: "Usuario no encontrado en este comercio." });
      return;
    }
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const postUser = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await postUserToDatabase(req.body, session.commerce.id);
    res.status(201).json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await updateUserFromDatabase(readId(req.params.id), req.body, session.commerce.id, session.user.id);
    res.json(result);
  } catch (error) {
    sendApiError(res, error);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const session = getRequestSession(res);
    const result = await deleteUserFromDatabase(readId(req.params.id), session.commerce.id, session.user.id);
    res.status(204).send();
  } catch (error) {
    sendApiError(res, error);
  }
};

export { getUsers, getUserById, postUser, updateUser, deleteUser, getEmployeeOptions };
