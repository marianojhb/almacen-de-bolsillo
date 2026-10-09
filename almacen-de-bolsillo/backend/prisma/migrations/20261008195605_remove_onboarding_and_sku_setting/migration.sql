/*
  Warnings:

  - You are about to drop the column `onboarding_completed_c` on the `commerces_c` table. All the data in the column will be lost.
  - You are about to drop the column `sku_enabled_c` on the `commerces_c` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "commerces_c" DROP COLUMN "onboarding_completed_c",
DROP COLUMN "sku_enabled_c";
