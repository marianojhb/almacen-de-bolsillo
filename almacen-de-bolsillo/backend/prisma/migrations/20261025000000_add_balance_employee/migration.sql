BEGIN;

-- Los balances históricos permanecen sin responsable hasta que exista evidencia para atribuirlos.
ALTER TABLE public."balance_b"
ADD COLUMN "id_employee_e" INTEGER;

CREATE INDEX "balance_b_id_employee_e_idx"
ON public."balance_b" ("id_employee_e");

ALTER TABLE public."balance_b"
ADD CONSTRAINT "balance_b_id_employee_e_fkey"
FOREIGN KEY ("id_employee_e")
REFERENCES public."employees_e" ("id_employee_e")
ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
