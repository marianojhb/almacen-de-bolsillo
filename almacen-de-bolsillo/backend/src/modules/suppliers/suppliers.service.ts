import type { CreateSupplierDto, UpdateSupplierDto } from "@almacen/shared";

import { prisma } from "../../config/prisma.js";

const getSuppliersFromDatabase = async () =>
  prisma.supplier.findMany({
    orderBy: {
      name: "asc",
    },
  });

const getSupplierByIdFromDatabase = async (supplierId: number,) =>
  prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },
  });

const postSupplierToDatabase = async (supplierData: CreateSupplierDto,) =>
  prisma.supplier.create({
    data: supplierData,
  });

const updateSupplierFromDatabase = async (supplierId: number, supplierData: UpdateSupplierDto) =>
  prisma.supplier.update({
    where: {
      id: supplierId,
    },
    data: supplierData,
  });

const deleteSupplierFromDatabase = async (supplierId: number,) =>
  prisma.supplier.delete({
    where: {
      id: supplierId,
    },
  });

export {
  getSuppliersFromDatabase,
  getSupplierByIdFromDatabase,
  postSupplierToDatabase,
  updateSupplierFromDatabase,
  deleteSupplierFromDatabase,
};