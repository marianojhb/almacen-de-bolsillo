import type { Request, Response } from 'express';
import {
  getUsersFromDatabase,
  getUserByIdFromDatabase,
  postUserToDatabase,
  updateUserFromDatabase,
  updateProfileImage,
  deleteUserFromDatabase,
} from './users.service.js';

import { unlink } from "node:fs/promises";

const getUsers = async (req: Request, res: Response) => {
  try {
    res.json(await getUsersFromDatabase());
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getUserById = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  try {
    const user = await getUserByIdFromDatabase(userId);
    user ? res.json(user) : res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const postUser = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await postUserToDatabase(req.body));
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updateUser = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  try {
    res.json(await updateUserFromDatabase(userId, req.body));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const uploadProfileImage = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  const file = req.file;
  if (!Number.isInteger(userId) || userId <= 0) {
    if (file) await unlink(file.path).catch(() => undefined);
    res.status(400).json({ message: 'El usuario indicado no es válido.' });
    return;
  }
  if (!file) {
    res.status(400).json({ message: 'Seleccioná una imagen de perfil.' });
    return;
  }

  try {
    const user = await updateProfileImage(userId, file.filename);
    if (!user) {
      await unlink(file.path).catch(() => undefined);
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }
    res.json({ profileImageUrl: user.profileImageUrl });
  } catch (error) {
    await unlink(file.path).catch(() => undefined);
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'No se pudo guardar la foto de perfil.' });
  }
};
const deleteUser = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  try {
    await deleteUserFromDatabase(userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getUsers, getUserById, postUser, updateUser, uploadProfileImage, deleteUser };
