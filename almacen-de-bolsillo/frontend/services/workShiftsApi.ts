import type {
  CreateWorkShiftDto,
  UpdateWorkShiftDto,
  WorkShift,
  WorkShiftCalendarResponse,
} from "@almacen/shared";

import { apiRequest } from "./apiClient";

export function getWorkShiftByIdRequest(id: number): Promise<WorkShift> {
  return apiRequest(`/work-shifts/${id}`);
}

export function getWorkShiftsRequest(
  from: string,
  to: string,
): Promise<WorkShiftCalendarResponse> {
  const query = new URLSearchParams({ from, to });

  return apiRequest(`/work-shifts?${query.toString()}`);
}

export function createWorkShiftRequest(
  data: CreateWorkShiftDto,
): Promise<WorkShift> {
  return apiRequest("/work-shifts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function updateWorkShiftRequest(
  id: number,
  data: UpdateWorkShiftDto,
): Promise<WorkShift> {
  return apiRequest(`/work-shifts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function deleteWorkShiftRequest(
  id: number,
): Promise<void> {
  return apiRequest(`/work-shifts/${id}`, {
    method: "DELETE",
  });
}
