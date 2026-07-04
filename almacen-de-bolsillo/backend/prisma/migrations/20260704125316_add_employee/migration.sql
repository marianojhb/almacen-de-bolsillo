-- CreateTable
CREATE TABLE "employee_e" (
    "id_employee_e" SERIAL NOT NULL,
    "firstname_e" TEXT NOT NULL,
    "lastname_e" TEXT NOT NULL,
    "fullname_e" TEXT NOT NULL,
    "dni_e" TEXT NOT NULL,
    "cuil_e" TEXT NOT NULL,
    "dob_e" TIMESTAMP(3) NOT NULL,
    "gender_e" TEXT NOT NULL,
    "status_e" BOOLEAN NOT NULL DEFAULT true,
    "salary_e" DECIMAL(10,2) NOT NULL,
    "job_title_e" TEXT NOT NULL,
    "pto_e" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_e_pkey" PRIMARY KEY ("id_employee_e")
);
