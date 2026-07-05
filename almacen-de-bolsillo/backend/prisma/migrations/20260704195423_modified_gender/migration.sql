/*
  Warnings:

  - You are about to drop the column `gender_e` on the `employee_e` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F', 'OTHER');

-- AlterTable
ALTER TABLE "categories_c" ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "description_c" DROP NOT NULL;

-- AlterTable
ALTER TABLE "employee_e" DROP COLUMN "gender_e",
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'M',
ALTER COLUMN "firstname_e" DROP NOT NULL,
ALTER COLUMN "lastname_e" DROP NOT NULL,
ALTER COLUMN "fullname_e" DROP NOT NULL,
ALTER COLUMN "dni_e" DROP NOT NULL,
ALTER COLUMN "cuil_e" DROP NOT NULL,
ALTER COLUMN "dob_e" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products_p" ALTER COLUMN "sku_p" DROP NOT NULL;

-- AlterTable
ALTER TABLE "purchase_orders_items_poi" ALTER COLUMN "discount_poi" SET DEFAULT 0,
ALTER COLUMN "subtotal_poi" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "sales_orders_items_soi" ALTER COLUMN "quantity_soi" SET DEFAULT 0,
ALTER COLUMN "shortname_soi" DROP NOT NULL,
ALTER COLUMN "longname_soi" DROP NOT NULL,
ALTER COLUMN "price_soi" SET DEFAULT 0,
ALTER COLUMN "subtotal_soi" SET DEFAULT 0,
ALTER COLUMN "discount_soi" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "sales_orders_so" ALTER COLUMN "invoice_so" DROP NOT NULL,
ALTER COLUMN "discount_so" SET DEFAULT 0,
ALTER COLUMN "iva_so" SET DEFAULT 0,
ALTER COLUMN "total_so" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "suppliers_s" ALTER COLUMN "cuit_s" DROP NOT NULL,
ALTER COLUMN "phone_s" DROP NOT NULL,
ALTER COLUMN "email_s" DROP NOT NULL,
ALTER COLUMN "address_s" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transactions_t" ALTER COLUMN "paymentMethod" SET DEFAULT 'EFECTIVO';
