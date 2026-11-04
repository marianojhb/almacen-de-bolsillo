import { unlink } from "node:fs/promises";
import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../../generated/prisma/index.js";
import { filenameFromProfileImageUrl, profileImageUrl, profileImagesDirectory } from "./profile-image.js";

const getUsersFromDatabase = async () => prisma.user.findMany();
const getUserByIdFromDatabase = async (userId: number) => prisma.user.findUnique({ where: { id: userId } });
const postUserToDatabase = async (userData: Prisma.UserCreateInput) => prisma.user.create({ data: userData });
const updateUserFromDatabase = async (userId: number, userData: Prisma.UserUpdateInput) =>
  prisma.user.update({ where: { id: userId }, data: userData });

const updateProfileImage = async (userId: number, filename: string) => {
  const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { profileImageUrl: true } });
  if (!currentUser) return null;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profileImageUrl: profileImageUrl(filename) },
  });

  const previousFilename = filenameFromProfileImageUrl(currentUser.profileImageUrl);
  if (previousFilename) {
    await unlink(`${profileImagesDirectory}/${previousFilename}`).catch(() => undefined);
  }

  return updatedUser;
};
const deleteUserFromDatabase = async (userId: number) => prisma.user.delete({ where: { id: userId } });

export {
  getUsersFromDatabase,
  getUserByIdFromDatabase,
  postUserToDatabase,
  updateUserFromDatabase,
  updateProfileImage,
  deleteUserFromDatabase,
};
