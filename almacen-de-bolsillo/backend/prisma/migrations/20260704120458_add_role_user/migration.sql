-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'OWNER', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "role_r" (
    "id_role_r" SERIAL NOT NULL,
    "name_r" TEXT NOT NULL,
    "type" "RoleType" NOT NULL,

    CONSTRAINT "role_r_pkey" PRIMARY KEY ("id_role_r")
);

-- CreateTable
CREATE TABLE "user_u" (
    "id_user_u" INTEGER NOT NULL,
    "username_u" TEXT NOT NULL,
    "email_u" TEXT NOT NULL,
    "password_u" TEXT NOT NULL,
    "status_u" BOOLEAN NOT NULL,
    "last_access_u" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "user_u_pkey" PRIMARY KEY ("id_user_u")
);

-- AddForeignKey
ALTER TABLE "user_u" ADD CONSTRAINT "user_u_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role_r"("id_role_r") ON DELETE RESTRICT ON UPDATE CASCADE;
