/*
  Warnings:

  - Added the required column `discount_so` to the `sales_orders_so` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iva_so` to the `sales_orders_so` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_so` to the `sales_orders_so` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `sales_orders_so` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sales_orders_so" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discount_so" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "iva_so" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "status_so" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "total_so" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "suppliers_s" ALTER COLUMN "status_s" SET DEFAULT true;

-- AlterTable
ALTER TABLE "user_u" ALTER COLUMN "status_u" SET DEFAULT true;

-- CreateTable
CREATE TABLE "sales_orders_items_soi" (
    "id_sales_orders_items_soi" INTEGER NOT NULL,
    "id_product_soi" INTEGER NOT NULL,
    "quantity_soi" INTEGER NOT NULL,
    "shortname_soi" TEXT NOT NULL,
    "longname_soi" TEXT NOT NULL,
    "price_soi" DECIMAL(10,2) NOT NULL,
    "subtotal_soi" DECIMAL(10,2) NOT NULL,
    "discount_soi" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_items_soi_pkey" PRIMARY KEY ("id_sales_orders_items_soi","id_product_soi")
);

-- AddForeignKey
ALTER TABLE "sales_orders_items_soi" ADD CONSTRAINT "sales_orders_items_soi_id_sales_orders_items_soi_fkey" FOREIGN KEY ("id_sales_orders_items_soi") REFERENCES "sales_orders_so"("id_sales_orders_so") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders_items_soi" ADD CONSTRAINT "sales_orders_items_soi_id_product_soi_fkey" FOREIGN KEY ("id_product_soi") REFERENCES "products_p"("id_product_p") ON DELETE RESTRICT ON UPDATE CASCADE;
