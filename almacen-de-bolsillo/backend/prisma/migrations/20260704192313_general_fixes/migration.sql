/*
  Warnings:

  - You are about to drop the column `status_e` on the `employee_e` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `transactions_t` table. All the data in the column will be lost.
  - Added the required column `opening_b` to the `balance_b` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `balance_b` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_c` to the `categories_c` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `transactions_t` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "balance_b" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "opening_b" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "categories_c" ADD COLUMN     "description_c" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "employee_e" DROP COLUMN "status_e",
ADD COLUMN     "is_active_e" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "transactions_t" DROP COLUMN "type",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL;
