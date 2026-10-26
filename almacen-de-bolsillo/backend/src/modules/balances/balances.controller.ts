import type { Request, Response } from 'express';
import type { CreateBalanceDto } from '@almacen/shared';
import { BalanceInputError, parseCreateBalanceInput } from './balances.input.js';

import {
  BalanceResponsibleEmployeeError,
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

export function createPostBalanceHandler(
  createBalance: (data: CreateBalanceDto) => Promise<unknown> = postBalanceToDatabase,
) {
  return async (req: Request, res: Response) => {
    try {
      const input = parseCreateBalanceInput(req.body);
      const balance = await createBalance(input);
      res.status(201).json(balance);
    } catch (error) {
      if (error instanceof BalanceInputError) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error instanceof BalanceResponsibleEmployeeError) {
        res.status(422).json({ message: error.message });
        return;
      }
      console.error('Error creating balance:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

const postBalance = createPostBalanceHandler();

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
