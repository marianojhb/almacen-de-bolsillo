import type { CreateSupplierDto, UpdateSupplierDto } from "@almacen/shared";

import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";

const SupplierWithRelationsArgs = {
  include: {
    products: {
      include: {
        product: true,
      },
      orderBy: {
        product: {
          shortname: "asc",
        },
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
  const productRelations = productIds?.filter(
    (product): product is Exclude<(typeof productIds)[number], number> => typeof product !== "number",
  );
  const hasDetailedProductRelations = productRelations !== undefined && productRelations.length === productIds?.length;

  if (hasDetailedProductRelations) {
    const selectedProductIds = productRelations.map((product) => product.productId);

    await prisma.$transaction([
      prisma.supplier.update({
        where: {
          id: supplierId,
          isActive: true,
        },
        data: supplierFields,
      }),

      prisma.productOnSupplier.deleteMany({
        where: {
          supplierId,
          productId: {
            notIn: selectedProductIds,
          },
        },
      }),

      ...productRelations.map(
        ({
          productId,
          price,
          supplierCategory,
          unitsPerPaq,
          pricePerPaq,
          minimumQuantity,
          salesTerms,
          leadTimeDays,
        }) =>
          prisma.productOnSupplier.upsert({
            where: {
              supplierId_productId: {
                supplierId,
                productId,
              },
            },
            create: {
              supplierId,
              productId,
              pricePerPaq,
              ...(price !== undefined && { price }),
              ...(supplierCategory !== undefined && { supplierCategory }),
              ...(unitsPerPaq !== undefined && { unitsPerPaq }),
              ...(minimumQuantity !== undefined && { minimumQuantity }),
              ...(salesTerms !== undefined && { salesTerms }),
              ...(leadTimeDays !== undefined && { leadTimeDays }),
            },
            update: {
              pricePerPaq,
              ...(price !== undefined && { price }),
              ...(supplierCategory !== undefined && { supplierCategory }),
              ...(unitsPerPaq !== undefined && { unitsPerPaq }),
              ...(minimumQuantity !== undefined && { minimumQuantity }),
              ...(salesTerms !== undefined && { salesTerms }),
              ...(leadTimeDays !== undefined && { leadTimeDays }),
            },
          }),
      ),
    ]);

    return prisma.supplier.findFirstOrThrow({
      ...SupplierWithRelationsArgs,
      where: {
        id: supplierId,
        isActive: true,
      },
    });
  }

  return prisma.supplier.update({
    ...SupplierWithRelationsArgs,
    where: {
      id: supplierId,
      isActive: true,
    },
    data: {
      ...supplierFields,

      ...(productIds !== undefined && {
        products: {
          set: productIds.map((productId) => ({
            supplierId_productId: {
              supplierId,
              productId: productId as number,
            },
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
