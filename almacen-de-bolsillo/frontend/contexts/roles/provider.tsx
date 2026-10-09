import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { CommerceRoleDto, CreateCommerceRoleDto, UpdateCommerceRoleDto, PermissionDto } from "@almacen/shared";
import { useAuth } from "@/contexts/auth";
import { getRolesRequest, createRoleRequest, updateRoleRequest, getPermissionsRequest, deleteRoleRequest } from "@/services/rolesApi";
import { RolesContext } from "./context";

const sortRoles = (items: CommerceRoleDto[]) =>
  [...items].sort((first, second) => first.name.localeCompare(second.name, "es"));

export function RolesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const canRead = session?.permissions.includes("roles.read") ?? false;
  const canManage = session?.permissions.includes("roles.manage") ?? false;
  const [roles, setRoles] = useState<CommerceRoleDto[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(canRead);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const mounted = useRef(false);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(canRead && canManage);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const permissionsVersion = useRef(0);

  const refreshRolesRequest = useRef<Promise<void> | null>(null);
  const refreshRoles = useCallback(async () => {
    if (refreshRolesRequest.current) return refreshRolesRequest.current;
    async function load() {
      const version = ++requestVersion.current;
      if (!canRead) {
        setRoles([]);
        setRolesError(null);
        setIsLoadingRoles(false);
        return;
      }
      setIsLoadingRoles(true);
      setRolesError(null);
      try {
        const items = await getRolesRequest();
        if (mounted.current && version === requestVersion.current) setRoles(sortRoles(items));
      } catch (error) {
        if (mounted.current && version === requestVersion.current) {
          setRoles([]);
          setRolesError(error instanceof Error ? error.message : "No se pudieron cargar los roles.");
        }
      } finally {
        if (mounted.current && version === requestVersion.current) setIsLoadingRoles(false);
      }
    }

    const request = load();
    refreshRolesRequest.current = request;
    return request.finally(() => {
      if (refreshRolesRequest.current === request) {
        refreshRolesRequest.current = null;
      }
    });
  }, [canRead]);

  const refreshPermissionsRequest = useRef<Promise<void> | null>(null);
  const refreshPermissions = useCallback(async () => {
    if (refreshPermissionsRequest.current) return refreshPermissionsRequest.current;
    async function load() {
      const version = ++permissionsVersion.current;
      if (!canRead || !canManage) {
        setPermissions([]);
        setPermissionsError(null);
        setIsLoadingPermissions(false);
        return;
      }
      setIsLoadingPermissions(true);
      setPermissionsError(null);
      try {
        const items = await getPermissionsRequest();
        if (mounted.current && version === permissionsVersion.current) setPermissions(items);
      } catch (error) {
        if (mounted.current && version === permissionsVersion.current) {
          setPermissions([]);
          setPermissionsError(error instanceof Error ? error.message : "No se pudo cargar el catálogo de permisos.");
        }
      } finally {
        if (mounted.current && version === permissionsVersion.current) setIsLoadingPermissions(false);
      }
    }

    const request = load();
    refreshPermissionsRequest.current = request;
    return request.finally(() => {
      if (refreshPermissionsRequest.current === request) {
        refreshPermissionsRequest.current = null;
      }
    });
  }, [canRead, canManage]);

  useEffect(() => {
    mounted.current = true;
    void refreshRoles();
    void refreshPermissions();
    return () => {
      mounted.current = false;
      requestVersion.current += 1;
      permissionsVersion.current += 1;
      refreshRolesRequest.current = null;
      refreshPermissionsRequest.current = null;
    };
  }, [refreshRoles, refreshPermissions]);

  const addRole = async (data: CreateCommerceRoleDto) => {
    if (!canManage) throw new Error("No tenés permiso para gestionar roles.");
    const item = await createRoleRequest(data);
    if (mounted.current) {
      requestVersion.current += 1;
      setIsLoadingRoles(false);
      setRolesError(null);
      setRoles((current) => sortRoles([...current, item]));
    }
    return item;
  };

  const updateRole = async (id: number, data: UpdateCommerceRoleDto) => {
    if (!canManage) throw new Error("No tenés permiso para gestionar roles.");
    const item = await updateRoleRequest(id, data);
    if (mounted.current) {
      requestVersion.current += 1;
      setIsLoadingRoles(false);
      setRolesError(null);
      setRoles((current) => sortRoles(current.map((existing) => existing.id === item.id ? item : existing)));
    }
    return item;
  };

  const deleteRole = async (id: number) => {
    if (!canManage) throw new Error("No tenés permiso para gestionar roles.");
    if (id === session?.role.id) throw new Error("No podés eliminar el rol de tu sesión.");
    await deleteRoleRequest(id);
    if (mounted.current) {
      requestVersion.current += 1;
      setIsLoadingRoles(false);
      setRolesError(null);
      setRoles((current) => current.filter((item) => item.id !== id));
    }
  };

  return (
    <RolesContext.Provider value={{
      roles, isLoadingRoles, rolesError, refreshRoles, addRole, updateRole, deleteRole,
      permissions, isLoadingPermissions, permissionsError, refreshPermissions,
    }}>
      {children}
    </RolesContext.Provider>
  );
}
