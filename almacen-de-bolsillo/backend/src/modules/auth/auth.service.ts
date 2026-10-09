import type { LoginDto, LoginResponse, RegisterCommerceDto, RegisterCommerceResponse } from "@almacen/shared";
import type { Prisma } from "../../../generated/prisma/index.js";
import { prisma } from "../config/prisma.js";
import { hashPassword, verifyPassword } from "./auth.password.js";
import { ApiError } from "./request.utils.js";
import { canUseLoginMode, isUserEnabled } from "./auth.access.js";
import { authSessionSelect, mapAuthSession, type AuthenticatedSession } from "./auth.session.js";
import { permissionCatalog } from "./auth.permissions.js";
import { SESSION_DURATION_MS, createSessionToken, hashSessionToken, isValidSessionToken } from "./auth.tokens.js";

const registerCommerceInDatabase = async (
  data: RegisterCommerceDto,
): Promise<RegisterCommerceResponse | null> => {
  
  const existingCommerce = await prisma.commerce.findFirst({
    where: { username: { equals: data.commerce.username, mode: "insensitive" } },
    select: { id: true },
  });
  if (existingCommerce) return null;

  const passwordHash = await hashPassword(data.owner.password);
  return prisma.$transaction(async (tx) => {
    
    // Comercio necesita el ID de su dueño y el dueño necesita el ID del comercio.
    // Reservamos el ID del usuario antes de crearlo. Las FK diferibles se comprueban
    // al confirmar la transacción, cuando ambos registros ya existen.
    // Si algo falla, se deshacen los registros creados; la secuencia puede dejar un salto.
    await tx.$executeRaw`SET CONSTRAINTS ALL DEFERRED`;
    const [reservedOwner] = await tx.$queryRaw<{ id: number }[]>`
      SELECT nextval(pg_get_serial_sequence('users_u', 'id_user_u'))::integer AS id
    `;
    if (!reservedOwner) throw new Error("No se pudo reservar el identificador del dueño.");

    const commerce = await tx.commerce.create({
      data: {
        name: data.commerce.name, username: data.commerce.username,
        country: data.commerce.country, currency: data.commerce.currency,
        timeZone: data.commerce.timeZone, ownerId: reservedOwner.id,
      },
      select: {
        id: true, name: true, username: true, country: true, currency: true, timeZone: true,
      },
    });

    const role = await tx.commerceRole.create({
      data: {
        name: "Administrador", description: "Administración completa de este comercio.",
        commerceId: commerce.id,
      },
      select: { id: true, name: true },
    });

    const owner = await tx.user.create({
      data: {
        id: reservedOwner.id, commerceId: commerce.id, roleId: role.id,
        username: null, email: data.owner.email, firstname: data.owner.firstname,
        lastname: data.owner.lastname, dni: data.owner.dni, passwordHash,
      },
      select: { id: true, firstname: true, lastname: true },
    });

    await tx.permission.createMany({ data: permissionCatalog, skipDuplicates: true });
    const permissions = await tx.permission.findMany({
      where: { code: { in: permissionCatalog.map((permission) => permission.code) } },
      select: { id: true },
    });

    await tx.rolePermission.createMany({
      data: permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
    });

    return { message: "El comercio se registró correctamente.", commerce,
      owner: { id: owner.id, firstname: owner.firstname!, lastname: owner.lastname! }, role };
  });
};


// Si el usuario no existe, igualmente verificamos una contraseña ficticia.
// Esto reduce la diferencia de tiempo entre usuario inexistente y contraseña incorrecta.
// El hash se genera una sola vez por proceso porque Argon2 es costoso.
let dummyPasswordHashPromise: Promise<string> | undefined;
const getDummyPasswordHash = (): Promise<string> => {
  dummyPasswordHashPromise ??= hashPassword(createSessionToken());
  return dummyPasswordHashPromise;
};

const loginToDatabase = async (data: LoginDto): Promise<LoginResponse | null> => {
  const userWhere: Prisma.UserWhereInput = { commerce: { username: data.commerceUsername } };
  if (data.mode === "commerce") {
    const commerce = await prisma.commerce.findUnique({where: { username: data.commerceUsername }, select: { ownerId: true }});
    userWhere.id = commerce?.ownerId ?? -1;
  } else {
    userWhere.username = { equals: data.username, mode: "insensitive" };
  }

  const user = await prisma.user.findFirst({
    where: userWhere,
    select: {
      id: true, commerceId: true, passwordHash: true, isActive: true,
      commerce: { select: { id: true, ownerId: true, isActive: true } },
      role: { select: { commerceId: true, isActive: true } },
      employee: { select: { commerceId: true, isActive: true } },
    },
  });
  const passwordHash = user?.passwordHash ?? await getDummyPasswordHash();
  let passwordMatches = false;
  try {
    passwordMatches = await verifyPassword(passwordHash, data.password);
  } catch {
    return null;
  }
  if (!user || !passwordMatches || !canUseLoginMode(user, data.mode)) return null;
  if (!isUserEnabled(user)) {
    throw new ApiError(403, "La cuenta está desactivada o su acceso al comercio no está habilitado. Contactá al administrador.");
  }

  const token = createSessionToken();
  return prisma.$transaction(async (tx) => {
    const issuedAt = new Date();
    
    // La cuenta pudo cambiar mientras comprobábamos la contraseña.
    // Solo seguimos si conserva su contraseña, comercio y estado activo.
    // La actualización también toma un bloqueo de escritura sobre ese usuario.
    const updated = await tx.user.updateMany({
      where: {
        AND: [userWhere, { id: user.id, commerceId: user.commerceId, passwordHash, isActive: true }],
      },
      data: { last_access: issuedAt },
    });
    if (updated.count !== 1) {
      throw new ApiError(403, "El acceso a la cuenta cambió. Iniciá sesión nuevamente.");
    }

    const activeUser = await tx.user.findUniqueOrThrow({
      where: { id: user.id, commerceId: user.commerceId },
      select: {
        id: true, commerceId: true, isActive: true,
        commerce: { select: { id: true, ownerId: true, isActive: true } },
        role: { select: { commerceId: true, isActive: true } },
        employee: { select: { commerceId: true, isActive: true } },
      },
    });

    if (!isUserEnabled(activeUser) || !canUseLoginMode(activeUser, data.mode)) {
      throw new ApiError(403, "El acceso a la cuenta cambió. Contactá al administrador.");
    }

    // El token original se entrega a la app. En la base solo guardamos su hash,
    // que permite buscarlo sin almacenar la credencial utilizable directamente.
    const sessionData = {
      tokenHash: hashSessionToken(token), issuedAt, revokedAt: null,
      expiresAt: new Date(issuedAt.getTime() + SESSION_DURATION_MS),
    };

    // userId es único: hay una fila de sesión por usuario, no un historial de logins.
    // upsert crea la fila si falta o reemplaza su token y fechas si ya existe.
    // Por eso iniciar sesión otra vez deja sin validez el token anterior.
    const record = await tx.authSession.upsert({
      where: { userId: activeUser.id },
      create: { userId: activeUser.id, ...sessionData },
      update: sessionData,
      select: authSessionSelect,
    });

    const authenticatedSession = mapAuthSession(record);
    if (!authenticatedSession) throw new ApiError(403, "El acceso a la cuenta dejó de estar habilitado.");
    return { token, session: authenticatedSession.session };
  });
};

// Se consulta en cada petición protegida: los estados y permisos vienen de la base,
// no de datos enviados por el cliente ni de permisos antiguos guardados en el token.
const getAuthSessionFromDatabase = async (token: string): Promise<AuthenticatedSession | null> => {
  if (!isValidSessionToken(token)) return null;
  const record = await prisma.authSession.findUnique({
    where: { tokenHash: hashSessionToken(token) }, select: authSessionSelect,
  });
  return record ? mapAuthSession(record) : null;
};

// Se compara también el hash para que un cierre de sesión antiguo no revoque
// un inicio de sesión más reciente que reutilizó la misma fila.
const revokeAuthSessionFromDatabase = async (sessionId: number, tokenHash: string) =>
  prisma.authSession.updateMany({
    where: { id: sessionId, tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });

export type { AuthenticatedSession };
export { registerCommerceInDatabase, loginToDatabase, getAuthSessionFromDatabase, revokeAuthSessionFromDatabase };
