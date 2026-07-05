import { prisma } from '../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/index.js';

const getEmployeesFromDatabase = async () => prisma.employee.findMany();
const getEmployeeByIdFromDatabase = async (employeeId: number) =>
  prisma.employee.findUnique({ where: { id: employeeId } });
const postEmployeeToDatabase = async (employeeData: Prisma.EmployeeCreateInput) =>
  prisma.employee.create({ data: employeeData });
const updateEmployeeFromDatabase = async (employeeId: number, employeeData: Prisma.EmployeeUpdateInput) =>
  prisma.employee.update({ where: { id: employeeId }, data: employeeData });
const deleteEmployeeFromDatabase = async (employeeId: number) => prisma.employee.delete({ where: { id: employeeId } });

export {
  getEmployeesFromDatabase,
  getEmployeeByIdFromDatabase,
  postEmployeeToDatabase,
  updateEmployeeFromDatabase,
  deleteEmployeeFromDatabase,
};
