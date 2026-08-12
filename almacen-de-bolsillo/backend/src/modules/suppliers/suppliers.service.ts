import type { CreateSupplierDto, UpdateSupplierDto } from "@almacen/shared";

import { prisma } from "../../config/prisma.js";

const getSuppliersFromDatabase = async () =>
  prisma.supplier.findMany({
    orderBy: {
      name: "asc",
    },
  });

const getSupplierByIdFromDatabase = async (supplierId: number) =>
  prisma.supplier.findFirst({
    where: {
      id: supplierId,
      isActive: true,
    },
  });

const postSupplierToDatabase = async (supplierData: CreateSupplierDto) =>
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

const deleteSupplierFromDatabase = async (supplierId: number) =>
  prisma.supplier.update({
    where: {
      id: supplierId,
    },
    data: {
      isActive: false,
    },
  });

/*
Baja Logica: Se comenta la función de eliminación física del proveedor para implementar la baja lógica

const deleteSupplierFromDatabase = async (supplierId: number) =>
   prisma.supplier.delete({
     where: {
       id: supplierId,
     },
   });
*/

// Supplier with products

const getSupplierWithProductsFromDatabase = async (supplierId: number) =>
  prisma.supplier.findUnique({
    where: {
      id: supplierId,
    },
    include: {
      products: {
        orderBy: {
          shortname: "asc",
        },
      },
    },
  });

const updateSupplierProductsFromDatabase = async (supplierId: number, productIds: number[]) =>
  prisma.supplier.update({
    where: {
      id: supplierId,
    },
    data: {
      products: {
        set: productIds.map((id) => ({
          id,
        })),
      },
    },
    include: {
      products: {
        orderBy: {
          shortname: "asc",
        },
      },
    },
  });

export {
  getSuppliersFromDatabase,
  getSupplierByIdFromDatabase,
  postSupplierToDatabase,
  updateSupplierFromDatabase,
  deleteSupplierFromDatabase,
  getSupplierWithProductsFromDatabase,
  updateSupplierProductsFromDatabase,
};
