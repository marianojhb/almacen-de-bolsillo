import { Router } from 'express';
import { getUsers, getUserById, postUser, updateUser, uploadProfileImage, deleteUser } from './users.controller.js';
import { profileImageUpload } from "./profile-image.js";

const usersRouter: Router = Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUserById);
usersRouter.post('/', postUser);
usersRouter.put('/:id', updateUser);
usersRouter.post('/:id/profile-image', profileImageUpload.single("photo"), uploadProfileImage);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;
