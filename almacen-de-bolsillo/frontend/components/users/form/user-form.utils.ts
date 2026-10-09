import { isValidEmail, type CommerceUserDto, type UpdateCommerceUserDto } from "@almacen/shared";

export type UserFormState = {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  roleId: number | null;
  employeeId: number | null;
};

export const createUserFormState = (user?: CommerceUserDto): UserFormState => ({
  username: user?.username?.toLowerCase() ?? "",
  email: user?.email ?? "",
  password: "",
  passwordConfirmation: "",
  roleId: user?.commerceRole.id ?? null,
  employeeId: user?.employee?.id ?? null,
});

type ValidationResult =
  | { ok: true; data: UpdateCommerceUserDto }
  | { ok: false; message: string };

export function validateUserForm(values: UserFormState, user?: CommerceUserDto): ValidationResult {
  const data: UpdateCommerceUserDto = {};
  const username = values.username.trim().toLowerCase();
  const email = values.email.trim().toLowerCase();

  if (!user?.isOwner && (!user || username !== user.username?.toLowerCase())) {
    if (!/^[a-z0-9][a-z0-9_-]{2,39}$/.test(username)) {
      return { ok: false, message: "El usuario debe tener entre 3 y 40 caracteres y usar letras, números, guiones o guiones bajos." };
    }
    data.username = username;
  }
  if (!user || email !== user.email?.toLowerCase()) {
    if (!isValidEmail(email)) {
      return { ok: false, message: "Ingresá un correo válido." };
    }
    data.email = email;
  }
  if (!user || values.password !== "" || values.passwordConfirmation !== "") {
    if (values.password.length < 8 || values.password.length > 128) {
      return { ok: false, message: "La contraseña debe tener entre 8 y 128 caracteres." };
    }
    if (values.password !== values.passwordConfirmation) {
      return { ok: false, message: "Las contraseñas no coinciden." };
    }
    data.password = values.password;
  }
  if (!user || values.roleId !== user.commerceRole.id) {
    if (values.roleId === null || !Number.isSafeInteger(values.roleId) || values.roleId <= 0) {
      return { ok: false, message: "Seleccioná un rol." };
    }
    data.roleId = values.roleId;
  }
  if (values.employeeId !== (user?.employee?.id ?? null)) {
    if (user?.employee) return { ok: false, message: "El empleado ya está vinculado. El vínculo se conserva para proteger el historial." };
    if (values.employeeId !== null && (!Number.isSafeInteger(values.employeeId) || values.employeeId <= 0)) {
      return { ok: false, message: "Seleccioná un empleado válido." };
    }
    data.employeeId = values.employeeId;
  }
  if (Object.keys(data).length === 0) return { ok: false, message: "No hay cambios para guardar." };
  return { ok: true, data };
}
