import type {
  CreateWorkShiftTypeDto,
  UpdateWorkShiftTypeDto,
  WorkShiftType,
} from "@almacen/shared";

import { apiRequest } from "./apiClient";

export function getWorkShiftTypesRequest(
  includeInactive = false,
): Promise<WorkShiftType[]> {
  return apiRequest(
    `/work-shift-types?includeInactive=${includeInactive}`,
  );
}

export function createWorkShiftTypeRequest(
  data: CreateWorkShiftTypeDto,
): Promise<WorkShiftType> {
  return apiRequest("/work-shift-types", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function updateWorkShiftTypeRequest(
  id: number,
  data: UpdateWorkShiftTypeDto,
): Promise<WorkShiftType> {
  return apiRequest(`/work-shift-types/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function deactivateWorkShiftTypeRequest(
  id: number,
): Promise<void> {
  return apiRequest(`/work-shift-types/${id}`, {
    method: "DELETE",
  });
}