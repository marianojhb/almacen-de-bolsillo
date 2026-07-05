import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  postTransaction,
  updateTransaction,
  deleteTransaction,
} from './transactions.controller.js';

const transactionsRouter: Router = Router();

transactionsRouter.get('/', getTransactions);
transactionsRouter.get('/:id', getTransactionById);
transactionsRouter.post('/', postTransaction);
transactionsRouter.put('/:id', updateTransaction);
transactionsRouter.delete('/:id', deleteTransaction);

export default transactionsRouter;
