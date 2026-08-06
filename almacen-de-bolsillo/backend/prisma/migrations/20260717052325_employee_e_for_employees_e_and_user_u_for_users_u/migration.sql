-- AlterTable
ALTER TABLE "employees_e" RENAME CONSTRAINT "employee_e_pkey" TO "employees_e_pkey";

-- AlterTable
ALTER TABLE "users_u" RENAME CONSTRAINT "user_u_pkey" TO "users_u_pkey";

-- RenameIndex
ALTER INDEX "user_u_email_u_key" RENAME TO "users_u_email_u_key";

-- RenameIndex
ALTER INDEX "user_u_username_u_key" RENAME TO "users_u_username_u_key";
