/*
  Warnings:

  - You are about to drop the column `status` on the `products_p` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `purchase_orders_items_poi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `purchase_orders_po` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'MERCADOPAGO', 'UALA');

-- AlterTable
ALTER TABLE "products_p" DROP COLUMN "status",
ADD COLUMN     "status_p" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "purchase_orders_items_poi" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "purchase_orders_po" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "transactions_t" (
    "id_transaction_t" SERIAL NOT NULL,
    "date_t" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount_t" DECIMAL(10,2) NOT NULL,
    "type" "PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_t_pkey" PRIMARY KEY ("id_transaction_t")
);

-- CreateTable
CREATE TABLE "balance_b" (
    "id_balance_b" SERIAL NOT NULL,
    "date_b" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cash_in_b" DECIMAL(10,2) NOT NULL,
    "cash_out_b" DECIMAL(10,2) NOT NULL,
    "expected_closing_b" DECIMAL(65,30) NOT NULL,
    "actual_closing_b" DECIMAL(65,30) NOT NULL,
    "difference_b" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "balance_b_pkey" PRIMARY KEY ("id_balance_b")
);
