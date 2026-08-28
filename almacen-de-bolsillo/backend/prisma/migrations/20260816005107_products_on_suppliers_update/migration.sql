/*
  Warnings:

  - Added the required column `price_per_paq_pos` to the `products_on_suppliers_pos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products_on_suppliers_pos" ADD COLUMN     "price_per_paq_pos" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "units_per_paq_pos" SET DEFAULT 1,
ALTER COLUMN "minimum_quantity_pos" SET DEFAULT 1;
