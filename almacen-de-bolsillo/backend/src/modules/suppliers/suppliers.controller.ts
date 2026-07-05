import type { Request, Response } from 'express';

import {
  getSuppliersFromDatabase,
  getSupplierByIdFromDatabase,
  postSupplierToDatabase,
  updateSupplierFromDatabase,
  deleteSupplierFromDatabase,
} from './suppliers.service.js';

const getSuppliers = async (req: Request, res: Response) => {
  try {
    res.json(await getSuppliersFromDatabase());
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSupplierById = async (req: Request, res: Response) => {
  const supplierId = Number(req.params.id);

  try {
    const supplier = await getSupplierByIdFromDatabase(supplierId);
    supplier ? res.json(supplier) : res.status(404).json({ message: 'Supplier not found' });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const postSupplier = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await postSupplierToDatabase(req.body));
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateSupplier = async (req: Request, res: Response) => {
  const supplierId = Number(req.params.id);

  try {
    res.json(await updateSupplierFromDatabase(supplierId, req.body));
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteSupplier = async (req: Request, res: Response) => {
  const supplierId = Number(req.params.id);

  try {
    await deleteSupplierFromDatabase(supplierId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getSuppliers, getSupplierById, postSupplier, updateSupplier, deleteSupplier };
