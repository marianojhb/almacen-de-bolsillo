import express from 'express';
import productsRouter from './modules/products/products.routes.js';
import categoriesRouter from './modules/categories/categories.routes.js';
import suppliersRouter from './modules/suppliers/suppliers.routes.js';
import purchaseOrdersRouter from './modules/purchase-orders/purchase-orders.routes.js';
import purchaseOrdersItemsRouter from './modules/purchase-orders-items/purchase-orders-items.routes.js';
import usersRouter from './modules/users/users.routes.js';
import salesOrdersRouter from './modules/sales-orders/sales-orders.routes.js';
import salesOrdersItemsRouter from './modules/sales-orders-items/sales-orders-items.routes.js';
import employeesRouter from './modules/employees/employees.routes.js';
import balancesRouter from './modules/balances/balances.routes.js';
import transactionsRouter from './modules/transactions/transactions.routes.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.send(`Server is running at http://localhost:${getPORT()}`);
});

app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/suppliers', suppliersRouter);
app.use('/purchase-orders', purchaseOrdersRouter);
app.use('/purchase-orders-items', purchaseOrdersItemsRouter);
app.use('/users', usersRouter);
app.use('/sales-orders', salesOrdersRouter);
app.use('/sales-orders-items', salesOrdersItemsRouter);
app.use('/employees', employeesRouter);
app.use('/balances', balancesRouter);
app.use('/transactions', transactionsRouter);

// const PORT = process.env.PORT || 3000;
function getPORT(): number {
  return process.env.PORT ? Number(process.env.PORT) : 3000;
}
app.listen(getPORT(), () => {
  console.log(`Server is running on port ${getPORT()}`);
  console.log(`Server is running at http://localhost:${getPORT()}`);
});
