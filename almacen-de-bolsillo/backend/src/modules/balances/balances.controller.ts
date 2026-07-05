import type { Request, Response } from 'express';

import {
  getBalancesFromDatabase,
  getBalanceByIdFromDatabase,
  postBalanceToDatabase,
  updateBalanceFromDatabase,
  deleteBalanceFromDatabase,
} from './balances.service.js';

const getBalances = async (req: Request, res: Response) => {
  try {
    res.json(await getBalancesFromDatabase());
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBalanceById = async (req: Request, res: Response) => {
  const balanceId = Number(req.params.id);

  try {
    const balance = await getBalanceByIdFromDatabase(balanceId);
    balance ? res.json(balance) : res.status(404).json({ message: 'Balance not found' });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const postBalance = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await postBalanceToDatabase(req.body));
  } catch (error) {
    console.error('Error creating balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBalance = async (req: Request, res: Response) => {
  const balanceId = Number(req.params.id);

  try {
    res.json(await updateBalanceFromDatabase(balanceId, req.body));
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBalance = async (req: Request, res: Response) => {
  const balanceId = Number(req.params.id);

  try {
    await deleteBalanceFromDatabase(balanceId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getBalances, getBalanceById, postBalance, updateBalance, deleteBalance };
