import type { CreateEmployeeDto, UpdateEmployeeDto } from "@almacen/shared";

import { prisma } from "../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import { assertCanDeactivateEmployeeAccount, assertCanDeleteEmployee } from "./employees.access.js";

const employeeAccountInclude = {
  user: { select: {
    id: true, username: true,
    role: { select: { id: true, name: true } },
  } },
} satisfies Prisma.EmployeeInclude;

type EmployeeWithAccount = Prisma.EmployeeGetPayload<{ include: typeof employeeAccountInclude }>;

const toEmployeeResponse = (record: EmployeeWithAccount) => {
  const { user, ...employee } = record;
  return {
    ...employee,
    account: user ? {
      id: user.id,
      username: user.username,
      role: { id: user.role.id, name: user.role.name },
    } : null,
  };
};

const buildFullname = (firstname: string | null | undefined, lastname: string | null | undefined) => {
  const fullname = [firstname, lastname]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  return fullname || null;
};

const mapEmployeeFields = (employeeData: UpdateEmployeeDto) => ({
  ...(employeeData.firstname !== undefined && { 
    firstname: employeeData.firstname.trim() 
  }),

  ...(employeeData.lastname !== undefined && { 
    lastname: employeeData.lastname.trim() 
  }),

  ...(employeeData.dni !== undefined && { 
    dni: employeeData.dni.replace(/\D/g, "") 
  }),

  ...(employeeData.cuil !== undefined && { 
    cuil: employeeData.cuil 
    ? employeeData.cuil.replace(/\D/g, "") : null 
  }),

  ...(employeeData.dob !== undefined && { 
    dob: employeeData.dob ? new Date(`${employeeData.dob}T00:00:00.000Z`) : null,
  }),

  ...(employeeData.salary !== undefined && {
    salary: employeeData.salary,
  }),

  ...(employeeData.jobTitle !== undefined && {
    jobTitle: employeeData.jobTitle?.trim() || null
  }),

  ...(employeeData.gender !== undefined && {
    gender: employeeData.gender
  }),

  ...(employeeData.isActive !== undefined && {
    isActive: employeeData.isActive
  }),
});

const getEmployeesFromDatabase = async (includeInactive: boolean, commerceId: number) => {
  const employees = await prisma.employee.findMany({
    include: employeeAccountInclude,
    where: { commerceId, ...(!includeInactive && { isActive: true }) },
    orderBy: [
      {
        lastname: "asc",
      },
      {
        firstname: "asc",
      },
    ],
  });
  return employees.map(toEmployeeResponse);
};

const getEmployeeByIdFromDatabase = async (employeeId: number, commerceId: number) => {
  const employee = await prisma.employee.findUnique({
    include: employeeAccountInclude,
    where: {
      id: employeeId,
      commerceId,
    },
  });
  return employee ? toEmployeeResponse(employee) : null;
};

const getEmployeeByDniFromDatabase = async (dni: string, commerceId: number, excludedEmployeeId?: number) =>
  prisma.employee.findFirst({
    where: {
      dni,
      commerceId,
      ...(excludedEmployeeId !== undefined && {
        id: {
          not: excludedEmployeeId,
        },
      }),
    },
    select: {
      id: true,
    },
  });

const postEmployeeToDatabase = async (employeeData: CreateEmployeeDto, commerceId: number) =>
  prisma.$transaction(async (tx) => {
    const commerce = await tx.commerce.update({
      where: { id: commerceId, isActive: true },
      data: { lastEmployeeNumber: { increment: 1 } },
      select: { lastEmployeeNumber: true },
    });
    const employee = await tx.employee.create({
      include: employeeAccountInclude,
      data: {
        ...mapEmployeeFields(employeeData),
        commerceId,
        commerceEmployeeId: commerce.lastEmployeeNumber,
        fullname: buildFullname(employeeData.firstname, employeeData.lastname),
      },
    });
    return toEmployeeResponse(employee);
  });

const closeEmployeeAccess = async (tx: Prisma.TransactionClient, employeeId: number, commerceId: number, actorId: number) => {
  const user = await tx.user.findUnique({ where: { employeeId_commerceId: { employeeId, commerceId } }, select: { id: true } });
  if (!user) return;
  const commerce = await tx.commerce.findUniqueOrThrow({ where: { id: commerceId }, select: { ownerId: true } });
  assertCanDeactivateEmployeeAccount(user.id, commerce.ownerId, actorId);
  await tx.user.update({ where: { id: user.id, commerceId }, data: { isActive: false } });
  await tx.authSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
};

const updateEmployeeFromDatabase = async (employeeId: number, employeeData: UpdateEmployeeDto, commerceId: number, actorId: number) =>
prisma.$transaction(async (tx) => {
  const currentEmployee = await tx.employee.findUniqueOrThrow({
    where: {
      id: employeeId,
      commerceId,
    },
    select: {
      firstname: true,
      lastname: true,
    },
  });

  const firstname = employeeData.firstname ?? currentEmployee.firstname;

  const lastname = employeeData.lastname ?? currentEmployee.lastname;

  const employee = await tx.employee.update({
    include: employeeAccountInclude,
    where: {
      id: employeeId,
      commerceId,
    },
    data: {
      ...mapEmployeeFields(employeeData),

      fullname: buildFullname(
        firstname,
        lastname,
      ),
    },
  });
  if (employeeData.isActive === false) await closeEmployeeAccess(tx, employeeId, commerceId, actorId);
  return toEmployeeResponse(employee);
});

const deactivateEmployeeFromDatabase = async (employeeId: number, commerceId: number, actorId: number) =>
  updateEmployeeFromDatabase(employeeId, { isActive: false }, commerceId, actorId);

const permanentlyDeleteEmployeeFromDatabase = async (employeeId: number, commerceId: number) =>
  prisma.$transaction(async (tx) => {
    const employee = await tx.employee.findUniqueOrThrow({
      where: { id: employeeId, commerceId },
      select: {
        user: { select: { id: true } },
        _count: { select: { workShifts: true } },
      },
    });
    assertCanDeleteEmployee(employee);
    return tx.employee.delete({ where: { id: employeeId, commerceId } });
  });

export {
  deactivateEmployeeFromDatabase,
  getEmployeeByDniFromDatabase,
  getEmployeeByIdFromDatabase,
  getEmployeesFromDatabase,
  permanentlyDeleteEmployeeFromDatabase,
  postEmployeeToDatabase,
  updateEmployeeFromDatabase,
};
