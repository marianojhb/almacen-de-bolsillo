-- AlterTable
ALTER TABLE "purchase_orders_po" ADD COLUMN     "id_user_po" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "sales_orders_so" ALTER COLUMN "id_user_so" SET DEFAULT 3;

-- AddForeignKey
ALTER TABLE "purchase_orders_po" ADD CONSTRAINT "purchase_orders_po_id_user_po_fkey" FOREIGN KEY ("id_user_po") REFERENCES "users_u"("id_user_u") ON DELETE RESTRICT ON UPDATE CASCADE;
