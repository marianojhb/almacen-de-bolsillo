BEGIN;

ALTER TABLE public."employees_e" DROP COLUMN "pto_e";
ALTER TABLE public."users_u" DROP COLUMN "username_u";

COMMIT;
