/*
  Warnings:

  - You are about to drop the column `id_usuario_so` on the `sales_orders_so` table. All the data in the column will be lost.
  - Added the required column `id_user_so` to the `sales_orders_so` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sales_orders_so" DROP CONSTRAINT "sales_orders_so_id_usuario_so_fkey";

-- AlterTable
ALTER TABLE "sales_orders_so" DROP COLUMN "id_usuario_so",
ADD COLUMN     "id_user_so" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "sales_orders_so" ADD CONSTRAINT "sales_orders_so_id_user_so_fkey" FOREIGN KEY ("id_user_so") REFERENCES "user_u"("id_user_u") ON DELETE RESTRICT ON UPDATE CASCADE;
