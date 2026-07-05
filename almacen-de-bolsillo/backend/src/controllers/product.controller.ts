import type { Request, Response } from 'express';

import { prisma } from '../config/prisma.js';

const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getProducts, getProductById };
