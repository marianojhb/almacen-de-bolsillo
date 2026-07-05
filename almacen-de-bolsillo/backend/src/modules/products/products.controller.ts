import type { Request, Response } from 'express';

import {
  getProductsFromDatabase,
  getProductByIdFromDatabase,
  postProductToDatabase,
  updateProductFromDatabase,
  deleteProductFromDatabase,
} from './products.service.js';

const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await getProductsFromDatabase();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  try {
    const product = await getProductByIdFromDatabase(productId);

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

const postProduct = async (req: Request, res: Response) => {
  const productData = req.body;

  try {
    const newProduct = await postProductToDatabase(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const productData = req.body;

  try {
    const updatedProduct = await updateProductFromDatabase(productId, productData);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  try {
    await deleteProductFromDatabase(productId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getProducts, getProductById, postProduct, updateProduct, deleteProduct };
