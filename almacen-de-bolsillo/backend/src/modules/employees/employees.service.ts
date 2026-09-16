import type { CreateEmployeeDto, UpdateEmployeeDto } from "@almacen/shared";

import { prisma } from "../../config/prisma.js";

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

  ...(employeeData.pto !== undefined && {
    pto: employeeData.pto?.trim() || null
  }),

  ...(employeeData.gender !== undefined && {
    gender: employeeData.gender
  }),

  ...(employeeData.isActive !== undefined && {
    isActive: employeeData.isActive
  }),
});

const getEmployeesFromDatabase = async (includeInactive: boolean) =>
  prisma.employee.findMany({
    where: includeInactive
      ? {}
      : {
          isActive: true,
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

const getEmployeeByIdFromDatabase = async (employeeId: number) =>
  prisma.employee.findUnique({
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

const postEmployeeToDatabase = async (employeeData: CreateEmployeeDto) =>
  prisma.employee.create({
    data: {
      ...mapEmployeeFields(employeeData),

      fullname: buildFullname(
        employeeData.firstname,
        employeeData.lastname,
      ),
    },
  });

const updateEmployeeFromDatabase = async (employeeId: number, employeeData: UpdateEmployeeDto) => {
  const currentEmployee = await prisma.employee.findUniqueOrThrow({
    where: {
      id: employeeId,
    },
    select: {
      firstname: true,
      lastname: true,
    },
  });

  const firstname = employeeData.firstname ?? currentEmployee.firstname;

  const lastname = employeeData.lastname ?? currentEmployee.lastname;

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
    },
  });
};

const deactivateEmployeeFromDatabase = async (employeeId: number) =>
  prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      isActive: false,
    },
  });

const permanentlyDeleteEmployeeFromDatabase = async (employeeId: number) =>
    prisma.employee.delete({
      where: {
        id: employeeId,
      },
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