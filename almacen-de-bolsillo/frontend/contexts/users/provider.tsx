import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { CommerceUserDto, CreateCommerceUserDto, UpdateCommerceUserDto } from "@almacen/shared";
import { useAuth } from "@/contexts/auth";
import { getUsersRequest, createUserRequest, updateUserRequest, deleteUserRequest } from "@/services/usersApi";
import { UsersContext } from "./context";

const sortUsers = (items: CommerceUserDto[]) =>
  [...items].sort((first, second) => Number(second.isOwner) - Number(first.isOwner)
    || first.name.localeCompare(second.name, "es"));

export function UsersProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const canRead = session?.permissions.includes("users.read") ?? false;
  const canManage = session?.permissions.includes("users.manage") ?? false;
  const [users, setUsers] = useState<CommerceUserDto[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(canRead);
  const [usersError, setUsersError] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const mounted = useRef(false);

  const refreshUsersRequest = useRef<Promise<void> | null>(null);
  const refreshUsers = useCallback(async () => {
    if (refreshUsersRequest.current) return refreshUsersRequest.current;
    async function load() {
      const version = ++requestVersion.current;
      if (!canRead) {
        setUsers([]);
        setUsersError(null);
        setIsLoadingUsers(false);
        return;
      }
      setIsLoadingUsers(true);
      setUsersError(null);
      try {
        const items = await getUsersRequest();
        if (mounted.current && version === requestVersion.current) setUsers(sortUsers(items));
      } catch (error) {
        if (mounted.current && version === requestVersion.current) {
          setUsers([]);
          setUsersError(error instanceof Error ? error.message : "No se pudieron cargar los usuarios.");
        }
      } finally {
        if (mounted.current && version === requestVersion.current) setIsLoadingUsers(false);
      }
    }

    const request = load();
    refreshUsersRequest.current = request;
    return request.finally(() => {
      if (refreshUsersRequest.current === request) {
        refreshUsersRequest.current = null;
      }
    });
  }, [canRead]);

  useEffect(() => {
    mounted.current = true;
    void refreshUsers();
    return () => {
      mounted.current = false;
      requestVersion.current += 1;
      refreshUsersRequest.current = null;
    };
  }, [refreshUsers]);

  const addUser = async (data: CreateCommerceUserDto) => {
    if (!canManage) throw new Error("No tenés permiso para gestionar usuarios.");
    const item = await createUserRequest(data);
    if (mounted.current) {
      requestVersion.current += 1;
      setIsLoadingUsers(false);
      setUsersError(null);
      setUsers((current) => sortUsers([...current, item]));
    }
    return item;
  };

  const updateUser = async (id: number, data: UpdateCommerceUserDto) => {
    if (!canManage) throw new Error("No tenés permiso para gestionar usuarios.");
    const item = await updateUserRequest(id, data);
    if (mounted.current) {
      requestVersion.current += 1;
      setIsLoadingUsers(false);
      setUsersError(null);
      setUsers((current) => sortUsers(current.map((existing) => existing.id === item.id ? item : existing)));
    }
    return item;
  };

  const deleteUser = async (id: number) => {
    if (!canManage) throw new Error("No tenés permiso para gestionar usuarios.");
    await deleteUserRequest(id);
    if (mounted.current) {
      requestVersion.current += 1;
      setIsLoadingUsers(false);
      setUsersError(null);
      setUsers((current) => current.filter((item) => item.id !== id));
    }
  };

  return (
    <UsersContext.Provider value={{
      users, isLoadingUsers, usersError, refreshUsers, addUser, updateUser, deleteUser,
    }}>
      {children}
    </UsersContext.Provider>
  );
}
