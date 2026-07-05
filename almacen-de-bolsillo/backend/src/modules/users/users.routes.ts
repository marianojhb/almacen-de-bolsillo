import { Router } from 'express';
import { getUsers, getUserById, postUser, updateUser, deleteUser } from './users.controller.js';

const usersRouter: Router = Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUserById);
usersRouter.post('/', postUser);
usersRouter.put('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;
