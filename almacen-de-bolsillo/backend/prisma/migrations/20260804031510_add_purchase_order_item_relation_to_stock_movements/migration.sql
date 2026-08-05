-- AlterTable
ALTER TABLE "stock_movements_sm" ADD COLUMN     "id_purchase_order_sm" INTEGER;

-- AddForeignKey
ALTER TABLE "stock_movements_sm" ADD CONSTRAINT "stock_movements_sm_id_purchase_order_sm_product_id_sm_fkey" FOREIGN KEY ("id_purchase_order_sm", "product_id_sm") REFERENCES "purchase_orders_items_poi"("id_product_poi", "id_purchase_order_poi") ON DELETE RESTRICT ON UPDATE CASCADE;
