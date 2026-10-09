import * as argon2 from "argon2";

// No guardamos ni recuperamos la contraseña original. Argon2 genera un hash
// con sal aleatoria; verify comprueba si la contraseña ingresada coincide.
const hashPassword = (password: string): Promise<string> => argon2.hash(password, { type: argon2.argon2id });

const verifyPassword = (passwordHash: string, password: string): Promise<boolean> => argon2.verify(passwordHash, password);

export { hashPassword, verifyPassword };
