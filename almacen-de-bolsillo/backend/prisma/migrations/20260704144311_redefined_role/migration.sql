/*
  Warnings:

  - You are about to drop the column `id_role_u` on the `user_u` table. All the data in the column will be lost.
  - You are about to drop the column `password_u` on the `user_u` table. All the data in the column will be lost.
  - You are about to drop the column `status_u` on the `user_u` table. All the data in the column will be lost.
  - You are about to drop the `role_r` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username_u]` on the table `user_u` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email_u]` on the table `user_u` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `passwordHash_u` to the `user_u` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BUSINESS_OWNER', 'SUPERVISOR', 'EMPLOYEE');

-- DropForeignKey
ALTER TABLE "user_u" DROP CONSTRAINT "user_u_id_role_u_fkey";

-- AlterTable
ALTER TABLE "user_u" DROP COLUMN "id_role_u",
DROP COLUMN "password_u",
DROP COLUMN "status_u",
ADD COLUMN     "is_active_u" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passwordHash_u" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'EMPLOYEE';

-- DropTable
DROP TABLE "role_r";

-- DropEnum
DROP TYPE "RoleType";

-- CreateIndex
CREATE UNIQUE INDEX "user_u_username_u_key" ON "user_u"("username_u");

-- CreateIndex
CREATE UNIQUE INDEX "user_u_email_u_key" ON "user_u"("email_u");
