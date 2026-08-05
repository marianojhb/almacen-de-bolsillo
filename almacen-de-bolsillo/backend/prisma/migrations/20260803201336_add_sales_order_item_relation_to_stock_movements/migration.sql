/*
  Warnings:

  - A unique constraint covering the columns `[id_sales_order_sm,product_id_sm]` on the table `stock_movements_sm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "stock_movements_sm" ADD COLUMN     "id_sales_order_sm" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_sm_id_sales_order_sm_product_id_sm_key" ON "stock_movements_sm"("id_sales_order_sm", "product_id_sm");

-- AddForeignKey
ALTER TABLE "stock_movements_sm" ADD CONSTRAINT "stock_movements_sm_id_sales_order_sm_product_id_sm_fkey" FOREIGN KEY ("id_sales_order_sm", "product_id_sm") REFERENCES "sales_orders_items_soi"("id_sales_order_soi", "id_product_soi") ON DELETE RESTRICT ON UPDATE CASCADE;
