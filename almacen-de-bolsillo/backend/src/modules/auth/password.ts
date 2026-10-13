import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const HASH_VERSION = "scrypt-v1";
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

// Estos parámetros pertenecen al formato scrypt-v1.
const SCRYPT_OPTIONS = {
  N: 32768,
  r: 8,
  p: 3,
  maxmem: 64 * 1024 * 1024,
};

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(password, salt);

  return [HASH_VERSION, salt.toString("hex"), key.toString("hex")].join(":");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const [version, saltHex, keyHex] = parts;

  if (
    version !== HASH_VERSION ||
    !saltHex ||
    !keyHex ||
    !/^[a-f0-9]{32}$/.test(saltHex) ||
    !/^[a-f0-9]{128}$/.test(keyHex)
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const storedKey = Buffer.from(keyHex, "hex");
  const candidateKey = await deriveKey(password, salt);

  return timingSafeEqual(storedKey, candidateKey);
}
