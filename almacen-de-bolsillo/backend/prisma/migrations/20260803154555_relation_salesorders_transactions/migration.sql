-- AlterTable
ALTER TABLE "sales_orders_so" ADD COLUMN     "id_transaction_so" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "sales_orders_so" ADD CONSTRAINT "sales_orders_so_id_transaction_so_fkey" FOREIGN KEY ("id_transaction_so") REFERENCES "transactions_t"("id_transaction_t") ON DELETE RESTRICT ON UPDATE CASCADE;
