-- AlterTable
ALTER TABLE "purchase_orders_po" ADD COLUMN     "transactionId" INTEGER;

-- AddForeignKey
ALTER TABLE "purchase_orders_po" ADD CONSTRAINT "purchase_orders_po_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions_t"("id_transaction_t") ON DELETE SET NULL ON UPDATE CASCADE;
