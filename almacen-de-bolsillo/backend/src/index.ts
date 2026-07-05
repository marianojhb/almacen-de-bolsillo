import express from 'express';
import productsRouter from './modules/products/products.routes.js';
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

// const PORT = process.env.PORT || 3000;
function getPORT(): number {
  return process.env.PORT ? parseInt(process.env.PORT) : 3000;
}
app.listen(getPORT(), () => {
  console.log(`Server is running on port ${getPORT()}`);
  console.log(`Server is running at http://localhost:${getPORT()}`);
});
