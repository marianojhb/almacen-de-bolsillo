/*
  Warnings:

  - A unique constraint covering the columns `[dni_e]` on the table `employees_e` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "employees_e_dni_e_key" ON "employees_e"("dni_e");
