/*
  Warnings:

  - Added the required column `supplierId` to the `suppliers_s` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "purchase_orders_po" DROP CONSTRAINT "purchase_orders_po_id_supplier_po_fkey";

-- AlterTable
ALTER TABLE "suppliers_s" ADD COLUMN     "supplierId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "suppliers_s" ADD CONSTRAINT "suppliers_s_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "purchase_orders_po"("id_purchase_orders_po") ON DELETE RESTRICT ON UPDATE CASCADE;
