import { normalizePermissions } from "@almacen/shared";
import { prisma } from "../config/prisma.js";
import type { CommerceRole, Prisma } from "../../../generated/prisma/index.js";
import { ApiError, readBody, readText, readBoolean } from "../auth/request.utils.js";

const roleInclude = { permissions: { include: { permission: true } } } satisfies Prisma.CommerceRoleInclude;

const validateRole = (body: unknown, creating: boolean) => {
  const source = readBody(body, ["name", "description", "permissions", ...(creating ? [] : ["isActive"])]);
  const data: { name?: string; description?: string | null; permissions?: string[]; isActive?: boolean } = {};
  if (source.name !== undefined || creating) data.name = readText(source.name, "name", 100);
  if (source.description !== undefined) data.description = source.description === null ? null : readText(source.description, "description", 1000, true);
  if (source.isActive !== undefined) data.isActive = readBoolean(source.isActive);
  if (source.permissions !== undefined || creating) {
    if (!Array.isArray(source.permissions) || source.permissions.length > 200 ||
      !source.permissions.every((code): code is string => typeof code === "string" && code.length <= 100) ||
      new Set(source.permissions).size !== source.permissions.length) {
      throw new ApiError(400, "La lista de permisos no es válida.");
    }
    data.permissions = normalizePermissions(source.permissions);
  }
  return data;
};

const getRolesFromDatabase = (commerceId: number) =>
  prisma.commerceRole.findMany({ where: { commerceId }, include: roleInclude, orderBy: { name: "asc" } });

const getRoleByIdFromDatabase = (id: number, commerceId: number) =>
  prisma.commerceRole.findUnique({ where: { id, commerceId }, include: roleInclude });

const getPermissionsFromDatabase = () =>
  prisma.permission.findMany({ orderBy: { code: "asc" } });

const saveRoleToDatabase = (body: unknown, commerceId: number, id?: number) =>
  prisma.$transaction(async (tx) => {
    const data = validateRole(body, id === undefined);
    if (id !== undefined) {
      await tx.commerceRole.findUniqueOrThrow({ where: { id, commerceId }, select: { id: true } });
      const owner = await tx.commerce.findUniqueOrThrow({ where: { id: commerceId }, select: { ownerId: true } });
      const ownerRole = await tx.user.findFirst({ where: { commerceId, id: owner.ownerId, roleId: id }, select: { id: true } });
      if (ownerRole) throw new ApiError(409, "No se puede modificar el rol del dueño del comercio.");
    }
    const permissions = data.permissions === undefined ? undefined : await tx.permission.findMany({
      where: { code: { in: data.permissions } }, select: { id: true },
    });
    if (permissions !== undefined && permissions.length !== data.permissions!.length) {
      throw new ApiError(400, "Uno o más permisos no existen en el catálogo.");
    }
    const fields = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };
    let role: CommerceRole;
    if (id === undefined) {
      if (!data.name) throw new ApiError(400, "El nombre del rol es obligatorio.");
      role = await tx.commerceRole.create({ data: { ...fields, name: data.name, commerceId } });
    } else {
      role = await tx.commerceRole.update({ where: { id, commerceId }, data: fields });
    }
    if (permissions !== undefined) {
      await tx.rolePermission.deleteMany({ where: { roleId: role.id, role: { commerceId } } });
      if (permissions.length) await tx.rolePermission.createMany({ data: permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id })) });
    }
    if (data.isActive === false) {
      await tx.authSession.updateMany({
        where: { user: { roleId: role.id, commerceId }, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return tx.commerceRole.findUniqueOrThrow({ where: { id: role.id, commerceId }, include: roleInclude });
  });

const deleteRoleFromDatabase = (id: number, commerceId: number) =>
  prisma.$transaction(async (tx) => {
    await tx.commerceRole.findUniqueOrThrow({ where: { id, commerceId }, select: { id: true } });
    if (await tx.user.count({ where: { roleId: id, commerceId } })) {
      throw new ApiError(409, "El rol tiene usuarios asignados y no puede eliminarse.");
    }
    return tx.commerceRole.delete({ where: { id, commerceId } });
  });

export { getRolesFromDatabase, getRoleByIdFromDatabase, getPermissionsFromDatabase, saveRoleToDatabase, deleteRoleFromDatabase };
