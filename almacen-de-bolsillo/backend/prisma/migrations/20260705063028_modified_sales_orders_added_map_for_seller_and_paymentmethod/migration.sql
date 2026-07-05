/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `sales_orders_so` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `sales_orders_so` table. All the data in the column will be lost.
  - Added the required column `id_usuario_so` to the `sales_orders_so` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sales_orders_so" DROP CONSTRAINT "sales_orders_so_sellerId_fkey";

-- AlterTable
ALTER TABLE "sales_orders_so" DROP COLUMN "paymentMethod",
DROP COLUMN "sellerId",
ADD COLUMN     "id_usuario_so" INTEGER NOT NULL,
ADD COLUMN     "payment_method_so" "PaymentMethod" NOT NULL DEFAULT 'EFECTIVO';

-- AddForeignKey
ALTER TABLE "sales_orders_so" ADD CONSTRAINT "sales_orders_so_id_usuario_so_fkey" FOREIGN KEY ("id_usuario_so") REFERENCES "user_u"("id_user_u") ON DELETE RESTRICT ON UPDATE CASCADE;
