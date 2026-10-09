import { ApiError } from "../auth/request.utils.js";

export const assertCanDeactivateEmployeeAccount = (userId: number, ownerId: number, actorId: number) => {
  if (userId === actorId || userId === ownerId) {
    throw new ApiError(409, "No podés desactivar al dueño ni tu propio acceso desde la ficha del empleado.");
  }
};

export const assertCanDeleteEmployee = (employee: {
  user: { id: number } | null;
  _count: { workShifts: number };
}) => {
  if (employee.user) {
    throw new ApiError(409, "El empleado tiene una cuenta vinculada. Primero eliminá esa cuenta desde Usuarios, si no tiene historial, o desactivá al empleado.");
  }
  if (employee._count.workShifts) {
    throw new ApiError(409, "El empleado tiene jornadas o días no laborales registrados. Desactivalo para conservar su historial.");
  }
};
