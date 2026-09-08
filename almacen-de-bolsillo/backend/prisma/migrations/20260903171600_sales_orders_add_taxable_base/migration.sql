-- AlterTable
ALTER TABLE "sales_orders_so" ADD COLUMN     "taxable_base_so" DECIMAL(10,2) NOT NULL DEFAULT 0;
