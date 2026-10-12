import assert from "node:assert/strict";

import {
  hashPassword,
  verifyPassword,
} from "../src/modules/auth/password.js";

async function main() {
  // Contraseña ficticia usada únicamente para esta comprobación.
  const password = "Prueba-de-password-123";

  const firstHash = await hashPassword(password);
  const secondHash = await hashPassword(password);

  assert.notEqual(firstHash, password);
  assert.notEqual(firstHash, secondHash);

  assert.equal(
    await verifyPassword(password, firstHash),
    true,
  );

  assert.equal(
    await verifyPassword("Password-equivocada", firstHash),
    false,
  );

  assert.equal(
    await verifyPassword(password, "hash-invalido"),
    false,
  );

  assert.equal(
    await verifyPassword(password, `${firstHash}:extra`),
    false,
  );

  console.log("Verificación de contraseñas correcta.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});