BEGIN;

CREATE TABLE public."work_shift_types" (
  "id_work_shift_type" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "is_non_working_day" BOOLEAN NOT NULL DEFAULT false,
  "start_time" VARCHAR(5),
  "end_time" VARCHAR(5),
  "color" VARCHAR(7) NOT NULL DEFAULT '#2563EB',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "work_shift_types_pkey"
    PRIMARY KEY ("id_work_shift_type")
);

CREATE UNIQUE INDEX "work_shift_types_name_key"
ON public."work_shift_types" ("name");

CREATE TABLE public."work_shifts" (
  "id_work_shift" SERIAL NOT NULL,
  "date" DATE NOT NULL,
  "id_employee" INTEGER NOT NULL,
  "id_work_shift_type" INTEGER NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "work_shifts_pkey"
    PRIMARY KEY ("id_work_shift")
);

CREATE UNIQUE INDEX
  "work_shifts_id_employee_date_id_work_shift_type_key"
ON public."work_shifts" (
  "id_employee",
  "date",
  "id_work_shift_type"
);

CREATE INDEX "work_shifts_date_idx"
ON public."work_shifts" ("date");

ALTER TABLE public."work_shifts"
ADD CONSTRAINT "work_shifts_id_employee_fkey"
FOREIGN KEY ("id_employee")
REFERENCES public."employees_e" ("id_employee_e")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE public."work_shifts"
ADD CONSTRAINT "work_shifts_id_work_shift_type_fkey"
FOREIGN KEY ("id_work_shift_type")
REFERENCES public."work_shift_types" ("id_work_shift_type")
ON DELETE RESTRICT
ON UPDATE CASCADE;

COMMIT;