/*
  Warnings:

  - Made the column `id_transaction_po` on table `purchase_orders_po` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "purchase_orders_po" DROP CONSTRAINT "purchase_orders_po_transactionId_fkey";

-- AlterTable
ALTER TABLE "purchase_orders_po" ALTER COLUMN "id_transaction_po" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_orders_po" ADD CONSTRAINT "purchase_orders_po_id_transaction_po_fkey" FOREIGN KEY ("id_transaction_po") REFERENCES "transactions_t"("id_transaction_t") ON DELETE RESTRICT ON UPDATE CASCADE;
