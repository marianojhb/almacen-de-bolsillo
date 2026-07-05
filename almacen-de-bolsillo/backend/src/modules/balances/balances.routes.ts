import { Router } from 'express';
import { getBalances, getBalanceById, postBalance, updateBalance, deleteBalance } from './balances.controller.js';

const balancesRouter: Router = Router();

balancesRouter.get('/', getBalances);
balancesRouter.get('/:id', getBalanceById);
balancesRouter.post('/', postBalance);
balancesRouter.put('/:id', updateBalance);
balancesRouter.delete('/:id', deleteBalance);

export default balancesRouter;
