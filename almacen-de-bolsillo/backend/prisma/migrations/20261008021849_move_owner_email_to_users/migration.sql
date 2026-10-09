-- AlterTable
ALTER TABLE "users_u" ADD COLUMN     "dni_u" TEXT,
ADD COLUMN     "firstname_u" TEXT,
ADD COLUMN     "lastname_u" TEXT,
ALTER COLUMN "username_u" DROP NOT NULL;
