import { createContext } from "react";
import type { CommerceUserDto, CreateCommerceUserDto, UpdateCommerceUserDto } from "@almacen/shared";

type UsersContextType = {
  users: CommerceUserDto[];
  isLoadingUsers: boolean;
  usersError: string | null;
  refreshUsers: () => Promise<void>;
  addUser: (data: CreateCommerceUserDto) => Promise<CommerceUserDto>;
  updateUser: (id: number, data: UpdateCommerceUserDto) => Promise<CommerceUserDto>;
  deleteUser: (id: number) => Promise<void>;
};

export const UsersContext = createContext<UsersContextType | undefined>(undefined);
