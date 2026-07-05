import type { Request, Response } from 'express';

import {
  getEmployeesFromDatabase,
  getEmployeeByIdFromDatabase,
  postEmployeeToDatabase,
  updateEmployeeFromDatabase,
  deleteEmployeeFromDatabase,
} from './employees.service.js';

const getEmployees = async (req: Request, res: Response) => {
  try {
    res.json(await getEmployeesFromDatabase());
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getEmployeeById = async (req: Request, res: Response) => {
  const employeeId = Number(req.params.id);

  try {
    const employee = await getEmployeeByIdFromDatabase(employeeId);
    employee ? res.json(employee) : res.status(404).json({ message: 'Employee not found' });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const postEmployee = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await postEmployeeToDatabase(req.body));
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateEmployee = async (req: Request, res: Response) => {
  const employeeId = Number(req.params.id);

  try {
    res.json(await updateEmployeeFromDatabase(employeeId, req.body));
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteEmployee = async (req: Request, res: Response) => {
  const employeeId = Number(req.params.id);

  try {
    await deleteEmployeeFromDatabase(employeeId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getEmployees, getEmployeeById, postEmployee, updateEmployee, deleteEmployee };
