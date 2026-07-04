/*
  Warnings:

  - You are about to drop the column `type` on the `role_r` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `user_u` table. All the data in the column will be lost.
  - Added the required column `type_r` to the `role_r` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `role_r` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_role_u` to the `user_u` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_u` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_u" DROP CONSTRAINT "user_u_roleId_fkey";

-- AlterTable
ALTER TABLE "role_r" DROP COLUMN "type",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type_r" "RoleType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "user_u" DROP COLUMN "roleId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_role_u" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "user_u" ADD CONSTRAINT "user_u_id_role_u_fkey" FOREIGN KEY ("id_role_u") REFERENCES "role_r"("id_role_r") ON DELETE RESTRICT ON UPDATE CASCADE;
