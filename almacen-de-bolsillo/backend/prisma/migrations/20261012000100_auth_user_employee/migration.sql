BEGIN;

-- Una cuenta nueva puede no haber iniciado sesión todavía.
ALTER TABLE public."users_u"
ALTER COLUMN "last_access_u" DROP NOT NULL;

-- Relación con usuarios, inicialmente opcional para empleados antiguos.
ALTER TABLE public."employees_e"
ADD COLUMN "id_user_e" INTEGER;

CREATE UNIQUE INDEX "employees_e_id_user_e_key"
ON public."employees_e" ("id_user_e");

ALTER TABLE public."employees_e"
ADD CONSTRAINT "employees_e_id_user_e_fkey"
FOREIGN KEY ("id_user_e")
REFERENCES public."users_u" ("id_user_u")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Impide emails duplicados por diferencias de mayúsculas o espacios.
CREATE UNIQUE INDEX "users_u_email_normalized_key"
ON public."users_u" (lower(btrim("email_u")));

-- Solo puede existir un BUSINESS_OWNER.
CREATE UNIQUE INDEX "users_u_single_business_owner_key"
ON public."users_u" ("role_u")
WHERE "role_u" = 'BUSINESS_OWNER';

COMMIT;