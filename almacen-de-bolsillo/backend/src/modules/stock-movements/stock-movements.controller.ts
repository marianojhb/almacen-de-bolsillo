import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { readId, readText, sendApiError } from "../auth/request.utils.js";
import {
  getStockMovementsFromDatabase, getStockMovementByIdFromDatabase,
  getStockMovementsByProductIdFromDatabase, getStockMovementsByProductSkuFromDatabase,
  postStockMovementToDatabase,
} from "./stock-movements.service.js";

const getStockMovements = async (_req: Request, res: Response) => {
  try { res.json(await getStockMovementsFromDatabase(getRequestSession(res).commerce.id)); }
  catch (error) { sendApiError(res, error); }
};
const getStockMovementById = async (req: Request, res: Response) => {
  try {
    const movement = await getStockMovementByIdFromDatabase(readId(req.params.id), getRequestSession(res).commerce.id);
    if (!movement) { res.status(404).json({ message: "Movimiento no encontrado en este comercio." }); return; }
    res.json(movement);
  } catch (error) { sendApiError(res, error); }
};
const getStockMovementsByProductId = async (req: Request, res: Response) => {
  try { res.json(await getStockMovementsByProductIdFromDatabase(readId(req.params.productId), getRequestSession(res).commerce.id)); }
  catch (error) { sendApiError(res, error); }
};
const getStockMovementsByProductSku = async (req: Request, res: Response) => {
  try { res.json(await getStockMovementsByProductSkuFromDatabase(readText(req.params.productSku, "SKU"), getRequestSession(res).commerce.id)); }
  catch (error) { sendApiError(res, error); }
};
const postStockMovement = async (req: Request, res: Response) => {
  try { res.status(201).json(await postStockMovementToDatabase(req.body, getRequestSession(res).commerce.id)); }
  catch (error) { sendApiError(res, error); }
};
const updateStockMovement = (_req: Request, res: Response) => {
  res.set("Allow", "GET").status(405).json({ message: "El historial no se edita. Registrá un nuevo ajuste de stock." });
};
const deleteStockMovement = (_req: Request, res: Response) => {
  res.set("Allow", "GET").status(405).json({ message: "El historial de movimientos de stock no se elimina." });
};
export {
  getStockMovements, getStockMovementById, getStockMovementsByProductId,
  getStockMovementsByProductSku, postStockMovement, updateStockMovement, deleteStockMovement,
};
