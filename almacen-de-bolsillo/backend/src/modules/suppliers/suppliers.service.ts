import { prisma } from '../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/index.js';

const getSuppliersFromDatabase = async () => prisma.supplier.findMany();

const getSupplierByIdFromDatabase = async (supplierId: number) =>
  prisma.supplier.findUnique({ where: { id: supplierId } });

const postSupplierToDatabase = async (supplierData: Prisma.SupplierCreateInput) =>
  prisma.supplier.create({ data: supplierData });

const updateSupplierFromDatabase = async (supplierId: number, supplierData: Prisma.SupplierUpdateInput) =>
  prisma.supplier.update({ where: { id: supplierId }, data: supplierData });

const deleteSupplierFromDatabase = async (supplierId: number) => prisma.supplier.delete({ where: { id: supplierId } });

export {
  getSuppliersFromDatabase,
  getSupplierByIdFromDatabase,
  postSupplierToDatabase,
  updateSupplierFromDatabase,
  deleteSupplierFromDatabase,
};
