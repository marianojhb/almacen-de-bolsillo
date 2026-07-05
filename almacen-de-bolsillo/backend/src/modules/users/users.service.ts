import { prisma } from '../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/index.js';

const getUsersFromDatabase = async () => prisma.user.findMany();
const getUserByIdFromDatabase = async (userId: number) => prisma.user.findUnique({ where: { id: userId } });
const postUserToDatabase = async (userData: Prisma.UserCreateInput) => prisma.user.create({ data: userData });
const updateUserFromDatabase = async (userId: number, userData: Prisma.UserUpdateInput) =>
  prisma.user.update({ where: { id: userId }, data: userData });
const deleteUserFromDatabase = async (userId: number) => prisma.user.delete({ where: { id: userId } });

export {
  getUsersFromDatabase,
  getUserByIdFromDatabase,
  postUserToDatabase,
  updateUserFromDatabase,
  deleteUserFromDatabase,
};
