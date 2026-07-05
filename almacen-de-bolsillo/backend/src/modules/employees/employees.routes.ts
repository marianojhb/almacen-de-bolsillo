import { Router } from 'express';
import { getEmployees, getEmployeeById, postEmployee, updateEmployee, deleteEmployee } from './employees.controller.js';

const employeesRouter: Router = Router();

employeesRouter.get('/', getEmployees);
employeesRouter.get('/:id', getEmployeeById);
employeesRouter.post('/', postEmployee);
employeesRouter.put('/:id', updateEmployee);
employeesRouter.delete('/:id', deleteEmployee);

export default employeesRouter;
