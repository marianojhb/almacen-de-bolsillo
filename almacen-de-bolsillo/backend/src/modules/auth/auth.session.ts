import { normalizePermissions, getUserDisplayName, type AuthSessionInfo } from "@almacen/shared";
import type { Prisma } from "../../../generated/prisma/index.js";
import { isUserEnabled } from "./auth.access.js";

// Datos que necesitamos de la sesión y sus relaciones. No consultamos passwordHash:
// la contraseña se comprueba al iniciar sesión, no en cada petición.
const authSessionSelect = {
  id: true, tokenHash: true, issuedAt: true, expiresAt: true, revokedAt: true,
  user: {
    select: {
      id: true, commerceId: true, username: true, email: true, last_access: true, isActive: true,
      firstname: true, lastname: true,
      employee: {
        select: { id: true, commerceId: true, commerceEmployeeId: true, firstname: true, lastname: true, fullname: true, isActive: true },
      },
      commerce: {
        select: {
          id: true, name: true, username: true, country: true, currency: true, timeZone: true,
          ownerId: true, isActive: true,
        },
      },
      role: {
        select: {
          id: true, name: true, commerceId: true, isActive: true,
          permissions: { select: { permission: { select: { code: true } } } },
        },
      },
    },
  },
} satisfies Prisma.AuthSessionSelect;

// Prisma obtiene el tipo del resultado a partir del select anterior.
// Así el tipo y los campos consultados no se mantienen por separado.
type SessionWithRelations = Prisma.AuthSessionGetPayload<{ select: typeof authSessionSelect }>;

// sessionId y tokenHash son internos del backend; session contiene los datos
// que sí puede recibir la app: usuario, comercio, empleado y permisos.
type AuthenticatedSession = {
  sessionId: number;
  tokenHash: string;
  session: AuthSessionInfo;
};

// Convierte el registro de la base de datos al formato usado por la aplicación.
// Devuelve null si la sesión ya no permite acceder, aunque el token exista.
const mapAuthSession = (record: SessionWithRelations, now = Date.now()): AuthenticatedSession | null => {
  const { user } = record;
  const { commerce, role, employee } = user;
  if (record.revokedAt !== null || record.expiresAt.getTime() <= now || !isUserEnabled(user)) return null;

  return {
    sessionId: record.id,
    tokenHash: record.tokenHash,
    session: {
      user: { id: user.id, username: user.username, email: user.email, name: getUserDisplayName(user), lastAccess: user.last_access?.toISOString() ?? null },
      commerce: {
        id: commerce.id, name: commerce.name, username: commerce.username,
        country: commerce.country, currency: commerce.currency, timeZone: commerce.timeZone,
      },
      role: { id: role.id, name: role.name },
      isOwner: commerce.ownerId === user.id,
      employee: employee ? {
        id: employee.id,
        name: employee.fullname || [employee.firstname, employee.lastname].filter(Boolean).join(" ") || `Empleado #${employee.commerceEmployeeId}`,
      } : null,
      // Incluye las consultas necesarias para las acciones del rol.
      // Por ejemplo, crear productos también necesita consultar productos.
      permissions: normalizePermissions(role.permissions.map((item) => item.permission.code)),
      issuedAt: record.issuedAt.toISOString(),
      expiresAt: record.expiresAt.toISOString(),
    },
  };
};

export type { AuthenticatedSession };
export { authSessionSelect, mapAuthSession };
