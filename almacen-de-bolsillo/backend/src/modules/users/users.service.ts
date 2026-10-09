import { isValidEmail, getUserDisplayName } from "@almacen/shared";
import { prisma } from "../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import { hashPassword } from "../auth/auth.password.js";
import { ApiError, readBody, readId, readText, readBoolean } from "../auth/request.utils.js";

// Selección explícita: el hash nunca forma parte de una respuesta.
const publicUserSelect = {
  id: true, username: true, email: true, last_access: true,
  firstname: true, lastname: true,
  createdAt: true, updatedAt: true, isActive: true,
  role: { select: { id: true, name: true } },
  commerce: { select: { ownerId: true } },
  employee: {
    select: { id: true, commerceEmployeeId: true, fullname: true, firstname: true, lastname: true, isActive: true },
  },
} satisfies Prisma.UserSelect;

const toUserResponse = (record: Prisma.UserGetPayload<{ select: typeof publicUserSelect }>) => {
  const { last_access, commerce, role, employee, ...user } = record;
  return {
    ...user, name: getUserDisplayName(user), lastAccess: last_access, isActive: user.isActive && (employee?.isActive ?? true),
    commerceRole: role, isOwner: commerce.ownerId === user.id,
    employee: employee ? {
      id: employee.id,
      name: employee.fullname || [employee.firstname, employee.lastname].filter(Boolean).join(" ") || `Empleado #${employee.commerceEmployeeId}`,
      isActive: employee.isActive,
    } : null,
  };
};

const getUsersFromDatabase = async (commerceId: number) => {
  const users = await prisma.user.findMany({
    where: { commerceId }, select: publicUserSelect, orderBy: { username: "asc" },
  });
  return users.map(toUserResponse).sort((first, second) =>
    Number(second.isOwner) - Number(first.isOwner) || first.name.localeCompare(second.name, "es"));
};

const getUserByIdFromDatabase = async (userId: number, commerceId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId, commerceId }, select: publicUserSelect });
  return user ? toUserResponse(user) : null;
};

const validateUser = (body: unknown, creating: boolean) => {
  const source = readBody(body, ["username", "email", "password", "roleId", "employeeId", ...(creating ? [] : ["isActive"])]);
  const data: { username?: string; email?: string; password?: string; roleId?: number; employeeId?: number | null; isActive?: boolean } = {};
  if (source.username !== undefined || creating) {
    const username = readText(source.username, "username", 40).toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{2,39}$/.test(username)) throw new ApiError(400, "El usuario debe tener entre 3 y 40 caracteres y usar letras, números, guiones o guiones bajos.");
    data.username = username;
  }
  if (source.email !== undefined || creating) {
    const email = readText(source.email, "email", 254).toLowerCase();
    if (!isValidEmail(email)) throw new ApiError(400, "El correo no es válido.");
    data.email = email;
  }
  if (source.password !== undefined || creating) {
    if (typeof source.password !== "string" || source.password.length < 8 || source.password.length > 128) {
      throw new ApiError(400, "La contraseña debe tener entre 8 y 128 caracteres.");
    }
    data.password = source.password;
  }
  if (source.roleId !== undefined || creating) data.roleId = readId(source.roleId);
  if (source.isActive !== undefined) data.isActive = readBoolean(source.isActive);
  if (source.employeeId !== undefined) data.employeeId = source.employeeId === null ? null : readId(source.employeeId);
  return data;
};

const validateEmployeeLink = async (tx: Prisma.TransactionClient, employeeId: number, commerceId: number, userId?: number) => {
  // Compartir el bloqueo con la baja del empleado evita vincular una cuenta
  // en paralelo justo después de que se haya cerrado su acceso laboral.
  await tx.$queryRaw`
    SELECT id_employee_e FROM employees_e
    WHERE id_employee_e = ${employeeId} AND id_commerce_e = ${commerceId}
    FOR UPDATE
  `;
  const employee = await tx.employee.findUnique({
    where: { id: employeeId, commerceId },
    select: { isActive: true, user: { select: { id: true } } },
  });
  if (!employee) throw new ApiError(404, "Empleado no encontrado en este comercio.");
  if (!employee.isActive) throw new ApiError(409, "El empleado está desactivado. Reactivalo antes de habilitar su cuenta.");
  if (employee.user && employee.user.id !== userId) {
    throw new ApiError(409, "Este empleado ya tiene una cuenta vinculada.");
  }
};

const getEmployeeAccountOptions = async (commerceId: number) => {
  const employees = await prisma.employee.findMany({
    where: { commerceId }, orderBy: [{ lastname: "asc" }, { firstname: "asc" }],
    select: {
      id: true, commerceEmployeeId: true, fullname: true, firstname: true, lastname: true,
      isActive: true, user: { select: { id: true } },
    },
  });
  return employees.map((employee) => ({
    id: employee.id,
    commerceEmployeeId: employee.commerceEmployeeId,
    name: employee.fullname || [employee.firstname, employee.lastname].filter(Boolean).join(" ") || `Empleado #${employee.commerceEmployeeId}`,
    isActive: employee.isActive, userId: employee.user?.id ?? null,
  }));
};

const postUserToDatabase = async (body: unknown, commerceId: number) => {
  const data = validateUser(body, true);
  const passwordHash = await hashPassword(data.password!);
  return prisma.$transaction(async (tx) => {
    await tx.commerceRole.findUniqueOrThrow({ where: { id: data.roleId!, commerceId, isActive: true }, select: { id: true } });
    if (data.employeeId != null) await validateEmployeeLink(tx, data.employeeId, commerceId);
    const duplicate = await tx.user.findFirst({ where: { commerceId, OR: [
      { username: { equals: data.username!, mode: "insensitive" } },
      { email: { equals: data.email!, mode: "insensitive" } },
    ] }, select: { id: true } });
    if (duplicate) throw new ApiError(409, "El usuario o correo ya está registrado en este comercio.");
    const user = await tx.user.create({
      data: {
        commerceId, roleId: data.roleId!, employeeId: data.employeeId ?? null,
        username: data.username!, email: data.email!, passwordHash,
      },
      select: publicUserSelect,
    });
    return toUserResponse(user);
  });
};

const updateUserFromDatabase = async (userId: number, body: unknown, commerceId: number, actorId: number) => {
  const data = validateUser(body, false);
  const passwordHash = data.password === undefined ? undefined : await hashPassword(data.password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId, commerceId },
      select: { employeeId: true, commerce: { select: { ownerId: true } } },
    });
    if (userId === user.commerce.ownerId && (actorId !== userId || data.isActive === false || data.roleId !== undefined || data.employeeId !== undefined)) {
      throw new ApiError(409, "No se puede desactivar ni cambiar el rol del dueño. Solo el dueño puede editar su cuenta.");
    }
    if (userId === user.commerce.ownerId && data.username !== undefined) {
      throw new ApiError(409, "El dueño no tiene usuario personal. Su acceso se realiza desde Comercio.");
    }
    if (actorId === userId && (data.isActive === false || data.roleId !== undefined)) {
      throw new ApiError(409, "No podés desactivarte ni cambiar tu propio rol desde esta operación.");
    }
    const changesEmployee = data.employeeId !== undefined && data.employeeId !== user.employeeId;
    if (changesEmployee && user.employeeId !== null) {
      throw new ApiError(409, "La cuenta ya está vinculada a un empleado. El vínculo no puede cambiarse para conservar la atribución de su historial.");
    }
    if (data.employeeId != null || (data.isActive === true && user.employeeId !== null)) {
      await validateEmployeeLink(tx, data.employeeId ?? user.employeeId!, commerceId, userId);
    }
    if (data.roleId !== undefined) await tx.commerceRole.findUniqueOrThrow({
      where: { id: data.roleId, commerceId, isActive: true }, select: { id: true },
    });
    if (data.username !== undefined || data.email !== undefined) {
      const duplicate = await tx.user.findFirst({ where: {
        commerceId, id: { not: userId },
        OR: [
          ...(data.username !== undefined ? [{ username: { equals: data.username, mode: "insensitive" as const } }] : []),
          ...(data.email !== undefined ? [{ email: { equals: data.email, mode: "insensitive" as const } }] : []),
        ],
      }, select: { id: true } });
      if (duplicate) throw new ApiError(409, "El usuario o correo ya está registrado en este comercio.");
    }
    const result = await tx.user.update({
      // Comprobar también el vínculo leído evita reemplazar uno asignado en paralelo.
      where: { id: userId, commerceId, employeeId: user.employeeId },
      data: {
        ...(data.username !== undefined && { username: data.username }),
        ...(data.email !== undefined && { email: data.email }),
        ...(passwordHash !== undefined && { passwordHash }),
        ...(data.roleId !== undefined && { roleId: data.roleId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.employeeId !== undefined && { employeeId: data.employeeId }),
      },
      select: publicUserSelect,
    });
    if (passwordHash !== undefined || data.isActive === false || data.roleId !== undefined || changesEmployee) {
      await tx.authSession.updateMany({
        where: { userId, revokedAt: null }, data: { revokedAt: new Date() },
      });
    }
    return toUserResponse(result);
  });
};

const deleteUserFromDatabase = async (userId: number, commerceId: number, actorId: number) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId, commerceId },
      select: {
        commerce: { select: { ownerId: true } },
        _count: { select: { salesOrders: true, purchaseOrders: true, createdWorkShifts: true } },
      },
    });
    if (userId === actorId || userId === user.commerce.ownerId ||
      user._count.salesOrders || user._count.purchaseOrders || user._count.createdWorkShifts) {
      throw new ApiError(409, "No se puede eliminar al dueño, tu propia cuenta o una cuenta con historial relacionado. Si corresponde, desactivá su acceso.");
    }
    // La sesión se elimina por cascada; la ficha del empleado permanece intacta.
    await tx.user.delete({ where: { id: userId, commerceId } });
  });

export {
  publicUserSelect, getUsersFromDatabase, getUserByIdFromDatabase, postUserToDatabase,
  updateUserFromDatabase, deleteUserFromDatabase, getEmployeeAccountOptions,
};
