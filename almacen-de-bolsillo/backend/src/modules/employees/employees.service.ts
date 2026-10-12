import type { CreateEmployeeWithUserDto, UpdateEmployeeDto } from "@almacen/shared";
import { formatFullName } from "@almacen/shared";

import { prisma } from "../../config/prisma.js";
import { hashPassword } from "../auth/password.js";

const employeeUserInclude = {
  user: {
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  },
} as const;

const buildFullname = (firstname: string | null | undefined, lastname: string | null | undefined) => {
  const fullname = formatFullName(firstname, lastname);

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

const getEmployeesFromDatabase = async (includeInactive: boolean) => {
  const employees = await prisma.employee.findMany({
    include: employeeUserInclude,
    where: {
      ...(includeInactive ? {} : { isActive: true }),
      OR: [{ user: null }, { user: { is: { role: { not: "BUSINESS_OWNER" } } } }],
    },
    orderBy: [
      {
        lastname: "asc",
      },
      {
        firstname: "asc",
      },
    ],
  });
  return employees.map((employee) => ({ ...employee, fullname: buildFullname(employee.firstname, employee.lastname) }));
};

const getEmployeeByIdFromDatabase = async (employeeId: number) =>
  prisma.employee.findUnique({
    include: employeeUserInclude,
    where: {
      id: employeeId,
    },
  });

const getEmployeeByDniFromDatabase = async (dni: string, excludedEmployeeId?: number) =>
  prisma.employee.findFirst({
    where: {
      dni,
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

const postEmployeeToDatabase = async (employeeData: CreateEmployeeWithUserDto) => {
  const email = employeeData.email.trim().toLowerCase();
  const passwordHash = await hashPassword(employeeData.password);

  return prisma.employee.create({
    data: {
      ...mapEmployeeFields(employeeData),

      fullname: buildFullname(
        employeeData.firstname,
        employeeData.lastname,
      ),
      user: {
        create: {
          email,
          passwordHash,
          role: employeeData.role,
          isActive: true,
        },
      },
    },
    include: employeeUserInclude,
  });
};

const updateEmployeeFromDatabase = async (employeeId: number, employeeData: UpdateEmployeeDto) => {
  const currentEmployee = await prisma.employee.findUniqueOrThrow({
    where: {
      id: employeeId,
    },
    select: {
      firstname: true,
      lastname: true,
      userId: true,
    },
  });

  const firstname = employeeData.firstname ?? currentEmployee.firstname;

  const lastname = employeeData.lastname ?? currentEmployee.lastname;

  const accountData = {
    ...(employeeData.email !== undefined && {
      email: employeeData.email.trim().toLowerCase(),
    }),
    ...(employeeData.role !== undefined && { role: employeeData.role }),
    ...(employeeData.password !== undefined && {
      passwordHash: await hashPassword(employeeData.password),
    }),
    ...(employeeData.isActive !== undefined && { isActive: employeeData.isActive }),
  };

  const hasAccountChanges = Object.keys(accountData).length > 0;

  return prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      ...mapEmployeeFields(employeeData),

      fullname: buildFullname(
        firstname,
        lastname,
      ),
      ...(hasAccountChanges && currentEmployee.userId !== null && {
          user: {
            update: accountData,
          },
        }),
    },
    include: employeeUserInclude,
  });
};

const deactivateEmployeeFromDatabase = async (employeeId: number) =>
  prisma.$transaction(async (tx) => {
    const employee = await tx.employee.update({
      where: { id: employeeId },
      data: { isActive: false },
    });

    if (employee.userId !== null) {
      await tx.user.update({
        where: { id: employee.userId },
        data: { isActive: false },
      });
    }

    return employee;
  });

const permanentlyDeleteEmployeeFromDatabase = async (employeeId: number) =>
  prisma.$transaction(async (tx) => {
    const employee = await tx.employee.delete({
      where: { id: employeeId },
    });

    if (employee.userId !== null) {
      // Si existen referencias de ventas o compras, se revierte toda la operación.
      await tx.user.delete({
        where: { id: employee.userId },
      });
    }

    return employee;
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
