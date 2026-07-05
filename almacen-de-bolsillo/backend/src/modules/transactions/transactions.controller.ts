import type { Request, Response } from 'express';

import {
  getTransactionsFromDatabase,
  getTransactionByIdFromDatabase,
  postTransactionToDatabase,
  updateTransactionFromDatabase,
  deleteTransactionFromDatabase,
} from './transactions.service.js';

const getTransactions = async (req: Request, res: Response) => {
  try {
    res.json(await getTransactionsFromDatabase());
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTransactionById = async (req: Request, res: Response) => {
  const transactionId = Number(req.params.id);

  try {
    const transaction = await getTransactionByIdFromDatabase(transactionId);
    transaction ? res.json(transaction) : res.status(404).json({ message: 'Transaction not found' });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const postTransaction = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await postTransactionToDatabase(req.body));
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTransaction = async (req: Request, res: Response) => {
  const transactionId = Number(req.params.id);

  try {
    res.json(await updateTransactionFromDatabase(transactionId, req.body));
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteTransaction = async (req: Request, res: Response) => {
  const transactionId = Number(req.params.id);

  try {
    await deleteTransactionFromDatabase(transactionId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getTransactions, getTransactionById, postTransaction, updateTransaction, deleteTransaction };
