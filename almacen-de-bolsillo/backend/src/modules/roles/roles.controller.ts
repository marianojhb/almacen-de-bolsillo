import type { Request, Response } from "express";
import { getRequestSession } from "../auth/auth.middleware.js";
import { readId, sendApiError } from "../auth/request.utils.js";
import { getRolesFromDatabase, getRoleByIdFromDatabase, getPermissionsFromDatabase, saveRoleToDatabase, deleteRoleFromDatabase } from "./roles.service.js";

const getRoles = async (_req: Request, res: Response) => {
  try { res.json(await getRolesFromDatabase(getRequestSession(res).commerce.id)); }
  catch (error) { sendApiError(res, error); }
};
const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await getRoleByIdFromDatabase(readId(req.params.id), getRequestSession(res).commerce.id);
    if (!role) { res.status(404).json({ message: "Rol no encontrado en este comercio." }); return; }
    res.json(role);
  } catch (error) { sendApiError(res, error); }
};
const getPermissions = async (_req: Request, res: Response) => {
  try { res.json(await getPermissionsFromDatabase()); }
  catch (error) { sendApiError(res, error); }
};
const postRole = async (req: Request, res: Response) => {
  try { res.status(201).json(await saveRoleToDatabase(req.body, getRequestSession(res).commerce.id)); }
  catch (error) { sendApiError(res, error); }
};
const updateRole = async (req: Request, res: Response) => {
  try { res.json(await saveRoleToDatabase(req.body, getRequestSession(res).commerce.id, readId(req.params.id))); }
  catch (error) { sendApiError(res, error); }
};
const deleteRole = async (req: Request, res: Response) => {
  try {
    await deleteRoleFromDatabase(readId(req.params.id), getRequestSession(res).commerce.id);
    res.status(204).send();
  } catch (error) { sendApiError(res, error); }
};
export { getRoles, getRoleById, getPermissions, postRole, updateRole, deleteRole };
