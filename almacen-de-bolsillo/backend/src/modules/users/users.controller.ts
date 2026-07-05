import type { Request, Response } from 'express';
import {
  getUsersFromDatabase,
  getUserByIdFromDatabase,
  postUserToDatabase,
  updateUserFromDatabase,
  deleteUserFromDatabase,
} from './users.service.js';

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

export { getUsers, getUserById, postUser, updateUser, deleteUser };
