/*
  Warnings:

  - You are about to drop the column `passwordHash_u` on the `user_u` table. All the data in the column will be lost.
  - Added the required column `password_hash_u` to the `user_u` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_u" DROP COLUMN "passwordHash_u",
ADD COLUMN     "password_hash_u" TEXT NOT NULL;
