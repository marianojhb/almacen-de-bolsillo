BEGIN;

-- Crea o actualiza el owner principal del comercio.
-- Cambiar únicamente el email de la siguiente línea.
SELECT set_config('app.owner_email', 'nuevo-owner@example.com', TRUE);
-- La contraseña resultante es: 123
--
-- IMPORTANTE: cambiar esta contraseña después del primer inicio de sesión.

DO $$
DECLARE
  target_user_id INTEGER;
  owner_email TEXT := lower(btrim(current_setting('app.owner_email')));
  password_hash TEXT := 'scrypt-v1:c5e000904b099c43d4f02c3e47d7505e:158e9188920d22f50675047c946189ed05ce29edc5b75fc8e98e98da2534de7a09a7fb661537998a92106f88eb76ac1ec7e0049de52ae2ec599fefb92eb6f48b';
BEGIN
  IF owner_email = '' OR position('@' IN owner_email) < 2 THEN
    RAISE EXCEPTION 'El email del owner no es válido: %', owner_email;
  END IF;

  -- El esquema permite un solo BUSINESS_OWNER.
  UPDATE public."users_u"
  SET "role_u" = 'EMPLOYEE'::"Role",
      "updated_at" = NOW()
  WHERE "role_u" = 'BUSINESS_OWNER'::"Role"
    AND lower(btrim("email_u")) <> owner_email;

  SELECT "id_user_u"
  INTO target_user_id
  FROM public."users_u"
  WHERE lower(btrim("email_u")) = owner_email
  FOR UPDATE;

  IF target_user_id IS NULL THEN
    INSERT INTO public."users_u" (
      "email_u",
      "last_access_u",
      "created_at",
      "updated_at",
      "is_active_u",
      "password_hash_u",
      "role_u"
    ) VALUES (
      owner_email,
      NULL,
      NOW(),
      NOW(),
      TRUE,
      password_hash,
      'BUSINESS_OWNER'::"Role"
    );
  ELSE
    UPDATE public."users_u"
    SET "email_u" = owner_email,
        "password_hash_u" = password_hash,
        "role_u" = 'BUSINESS_OWNER'::"Role",
        "is_active_u" = TRUE,
        "updated_at" = NOW()
    WHERE "id_user_u" = target_user_id;
  END IF;
END $$;

-- Verificación: debe devolver exactamente una fila.
SELECT "id_user_u", "email_u", "role_u", "is_active_u"
FROM public."users_u"
WHERE lower(btrim("email_u")) = current_setting('app.owner_email');

COMMIT;
