/*
  Warnings:

  - A unique constraint covering the columns `[product_id_sm,id_purchase_order_sm]` on the table `stock_movements_sm` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "stock_movements_sm" DROP CONSTRAINT "stock_movements_sm_id_purchase_order_sm_product_id_sm_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_sm_product_id_sm_id_purchase_order_sm_key" ON "stock_movements_sm"("product_id_sm", "id_purchase_order_sm");

-- AddForeignKey
ALTER TABLE "stock_movements_sm" ADD CONSTRAINT "stock_movements_sm_product_id_sm_id_purchase_order_sm_fkey" FOREIGN KEY ("product_id_sm", "id_purchase_order_sm") REFERENCES "purchase_orders_items_poi"("id_product_poi", "id_purchase_order_poi") ON DELETE RESTRICT ON UPDATE CASCADE;
