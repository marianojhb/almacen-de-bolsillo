BEGIN;

ALTER TABLE public."balance_b"
ADD COLUMN "movement_type_b" CHAR(1) NOT NULL DEFAULT 'R';

ALTER TABLE public."balance_b"
ADD CONSTRAINT "balance_b_movement_type_b_check"
CHECK ("movement_type_b" IN ('C', 'R'));

COMMIT;
