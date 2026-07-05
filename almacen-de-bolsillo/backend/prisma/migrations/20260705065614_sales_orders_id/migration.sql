/*
  Warnings:

  - The primary key for the `sales_orders_items_soi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_sales_orders_soi` on the `sales_orders_items_soi` table. All the data in the column will be lost.
  - Added the required column `id_sales_order_soi` to the `sales_orders_items_soi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sales_orders_items_soi" DROP CONSTRAINT "sales_orders_items_soi_id_sales_orders_soi_fkey";

-- AlterTable
ALTER TABLE "sales_orders_items_soi" DROP CONSTRAINT "sales_orders_items_soi_pkey",
DROP COLUMN "id_sales_orders_soi",
ADD COLUMN     "id_sales_order_soi" INTEGER NOT NULL,
ADD CONSTRAINT "sales_orders_items_soi_pkey" PRIMARY KEY ("id_sales_order_soi", "id_product_soi");

-- AddForeignKey
ALTER TABLE "sales_orders_items_soi" ADD CONSTRAINT "sales_orders_items_soi_id_sales_order_soi_fkey" FOREIGN KEY ("id_sales_order_soi") REFERENCES "sales_orders_so"("id_sales_orders_so") ON DELETE RESTRICT ON UPDATE CASCADE;
