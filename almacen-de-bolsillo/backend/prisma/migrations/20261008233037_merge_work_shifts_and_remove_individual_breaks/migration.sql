/*
  Warnings:

  - You are about to drop the `employee_non_working_days_enwd` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_shift_breaks_wsb` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date_ws` to the `work_shifts_ws` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "employee_non_working_days_enwd" DROP CONSTRAINT "employee_non_working_days_enwd_id_commerce_enwd_fkey";

-- DropForeignKey
ALTER TABLE "employee_non_working_days_enwd" DROP CONSTRAINT "employee_non_working_days_enwd_id_created_by_enwd_id_comme_fkey";

-- DropForeignKey
ALTER TABLE "employee_non_working_days_enwd" DROP CONSTRAINT "employee_non_working_days_enwd_id_employee_enwd_id_commerc_fkey";

-- DropForeignKey
ALTER TABLE "employee_non_working_days_enwd" DROP CONSTRAINT "employee_non_working_days_enwd_id_work_shift_type_enwd_id__fkey";

-- DropForeignKey
ALTER TABLE "work_shift_breaks_wsb" DROP CONSTRAINT "work_shift_breaks_wsb_id_work_shift_wsb_id_commerce_wsb_fkey";

-- DropIndex
DROP INDEX "work_shifts_ws_id_commerce_ws_id_employee_ws_starts_at_ws_idx";

-- DropIndex
DROP INDEX "work_shifts_ws_id_commerce_ws_starts_at_ws_idx";

-- AlterTable
ALTER TABLE "work_shifts_ws" ADD COLUMN     "date_ws" DATE NOT NULL,
ALTER COLUMN "starts_at_ws" DROP NOT NULL,
ALTER COLUMN "ends_at_ws" DROP NOT NULL;

-- DropTable
DROP TABLE "employee_non_working_days_enwd";

-- DropTable
DROP TABLE "work_shift_breaks_wsb";

-- CreateIndex
CREATE INDEX "work_shifts_ws_id_commerce_ws_date_ws_idx" ON "work_shifts_ws"("id_commerce_ws", "date_ws");

-- CreateIndex
CREATE INDEX "work_shifts_ws_id_commerce_ws_id_employee_ws_date_ws_idx" ON "work_shifts_ws"("id_commerce_ws", "id_employee_ws", "date_ws");
