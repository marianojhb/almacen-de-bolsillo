import type { CreateSupplierDto, UpdateSupplierDto } from "@almacen/shared";

import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

const SupplierWithRelationsArgs = {
  include: {
    products: {
      orderBy: {
        shortname: "asc",
      },
    },
    purchaseOrders: {
      orderBy: {
        date: "desc",
      },
    },
  },
} satisfies Prisma.SupplierDefaultArgs;

const getSuppliersFromDatabase = async () =>
  prisma.supplier.findMany({
    ...SupplierWithRelationsArgs,
    orderBy: {
      name: "asc",
    },
  });

const getSupplierByIdFromDatabase = async (supplierId: number) =>
  prisma.supplier.findFirst({
    ...SupplierWithRelationsArgs,
    where: {
      id: supplierId,
      isActive: true,
    },
  });

const postSupplierToDatabase = async (supplierData: CreateSupplierDto) =>
  prisma.supplier.create({
    ...SupplierWithRelationsArgs,
    data: supplierData,
  });

const updateSupplierFromDatabase = async (supplierId: number, supplierData: UpdateSupplierDto) => {
  const { productIds, ...supplierFields } = supplierData;

  return prisma.supplier.update({
    ...SupplierWithRelationsArgs,
    where: {
      id: supplierId,
    },
    data: {
      ...supplierFields,

      ...(productIds !== undefined && {
        products: {
          set: productIds.map((productId) => ({
            id: productId,
          })),
        },
      }),
    },
  });
};
const deleteSupplierFromDatabase = async (supplierId: number) =>
  prisma.supplier.update({
    ...SupplierWithRelationsArgs,
    where: {
      id: supplierId,
    },
    data: {
      isActive: false,
    },
  });

export {
  getSuppliersFromDatabase,
  getSupplierByIdFromDatabase,
  postSupplierToDatabase,
  updateSupplierFromDatabase,
  deleteSupplierFromDatabase,
};
