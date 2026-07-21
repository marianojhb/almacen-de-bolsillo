-- AlterTable
ALTER TABLE "categories_c" ADD COLUMN     "is_active_c" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "products_p" ADD COLUMN     "is_active_p" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "purchase_orders_po" ADD COLUMN     "is_active_po" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "suppliers_s" ADD COLUMN     "is_active_s" BOOLEAN NOT NULL DEFAULT true;
