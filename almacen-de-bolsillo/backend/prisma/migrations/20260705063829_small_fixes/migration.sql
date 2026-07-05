/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `transactions_t` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user_u` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions_t" DROP COLUMN "paymentMethod",
ADD COLUMN     "payment_method_t" "PaymentMethod" NOT NULL DEFAULT 'EFECTIVO';

-- AlterTable
ALTER TABLE "user_u" DROP COLUMN "role",
ADD COLUMN     "role_u" "Role" NOT NULL DEFAULT 'EMPLOYEE';
