-- AlterTable
CREATE SEQUENCE user_u_id_user_u_seq;
ALTER TABLE "user_u" ALTER COLUMN "id_user_u" SET DEFAULT nextval('user_u_id_user_u_seq');
ALTER SEQUENCE user_u_id_user_u_seq OWNED BY "user_u"."id_user_u";
