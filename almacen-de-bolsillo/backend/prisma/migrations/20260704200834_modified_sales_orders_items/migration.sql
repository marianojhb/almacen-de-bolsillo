/*
  Warnings:

  - Made the column `shortname_soi` on table `sales_orders_items_soi` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "sales_orders_items_soi" ALTER COLUMN "shortname_soi" SET NOT NULL;
