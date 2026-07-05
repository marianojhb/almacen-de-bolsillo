/*
  Warnings:

  - You are about to drop the column `status_so` on the `sales_orders_so` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sales_orders_so" DROP COLUMN "status_so",
ADD COLUMN     "is_active_so" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'EFECTIVO';
