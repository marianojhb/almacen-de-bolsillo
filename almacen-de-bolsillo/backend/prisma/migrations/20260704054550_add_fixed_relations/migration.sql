/*
  Warnings:

  - You are about to drop the column `supplierId` on the `suppliers_s` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "suppliers_s" DROP CONSTRAINT "suppliers_s_supplierId_fkey";

-- AlterTable
ALTER TABLE "suppliers_s" DROP COLUMN "supplierId";

-- AddForeignKey
ALTER TABLE "purchase_orders_po" ADD CONSTRAINT "purchase_orders_po_id_supplier_po_fkey" FOREIGN KEY ("id_supplier_po") REFERENCES "suppliers_s"("id_supplier_s") ON DELETE RESTRICT ON UPDATE CASCADE;
