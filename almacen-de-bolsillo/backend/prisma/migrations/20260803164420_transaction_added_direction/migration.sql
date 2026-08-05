-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('INCOME', 'EXPENSE');

-- AlterTable
ALTER TABLE "sales_orders_so" ALTER COLUMN "id_transaction_so" DROP DEFAULT;

-- AlterTable
ALTER TABLE "transactions_t" ADD COLUMN     "direction_t" "Direction";
