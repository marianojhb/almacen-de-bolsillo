/*
  Warnings:

  - You are about to drop the column `gender` on the `employee_e` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "employee_e" DROP COLUMN "gender",
ADD COLUMN     "gender_e" "Gender" NOT NULL DEFAULT 'M';
