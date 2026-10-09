import type {
  EmployeeNonWorkingDayDto, UpdateNonWorkingDayDto, UpdateWorkShiftDto,
  UpdateWorkShiftTypeDto, CreateWorkShiftTypeDto,
  WorkShiftCalendarDto, WorkShiftCalendarFilters,
  WorkShiftDto, WorkShiftTypeDto, WorkShiftAssignmentBatchDto, WorkShiftAssignmentBatchPreview,
} from "@almacen/shared";
import { apiFetch, ApiError } from "./apiClient";

async function request(path: string, method = "GET", data?: unknown): Promise<Response> {
  const response = await apiFetch(`/work-shifts${path}`, {
    method,
    ...(data !== undefined && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
  });
  if (!response.ok) {
    let message = "No se pudo completar la operación de turnos laborales.";
    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") message = body.message;
    } catch { /* Conservar el mensaje general. */ }
    throw new ApiError(message, response.status);
  }
  return response;
}

async function requestData<T>(path: string, method = "GET", data?: unknown): Promise<T> {
  const response = await request(path, method, data);
  return response.json();
}

export const getWorkShiftEmployeesRequest = () => requestData<{ id: number; name: string }[]>("/employees");
export const getWorkShiftTypesRequest = (includeInactive = false) => requestData<WorkShiftTypeDto[]>(`/types${includeInactive ? "?includeInactive=true" : ""}`);
export const getWorkShiftTypeRequest = (id: number) => requestData<WorkShiftTypeDto>(`/types/${id}`);
export const createWorkShiftTypeRequest = (data: CreateWorkShiftTypeDto) => requestData<WorkShiftTypeDto>("/types", "POST", data);
export const updateWorkShiftTypeRequest = (id: number, data: UpdateWorkShiftTypeDto) => requestData<WorkShiftTypeDto>(`/types/${id}`, "PATCH", data);
export const deleteWorkShiftTypeRequest = async (id: number): Promise<void> => {
  await request(`/types/${id}`, "DELETE");
};
export const getWorkShiftRequest = (id: number) => requestData<WorkShiftDto>(`/${id}`);
export const updateWorkShiftRequest = (id: number, data: UpdateWorkShiftDto) => requestData<WorkShiftDto>(`/${id}`, "PATCH", data);
export const cancelWorkShiftRequest = (id: number, reason: string) => requestData<WorkShiftDto>(`/${id}/cancel`, "POST", { reason });
export const recordWorkShiftRequest = (id: number, action: "start" | "finish") => requestData<WorkShiftDto>(`/${id}/${action}`, "POST", {});
export const previewWorkShiftAssignmentsRequest = (data: WorkShiftAssignmentBatchDto) => requestData<WorkShiftAssignmentBatchPreview>("/calendar/preview-batch", "POST", data);
export const assignWorkShiftTypesRequest = (data: WorkShiftAssignmentBatchDto) => requestData<{ createdCount: number }>("/calendar/assign-batch", "POST", data);
export const updateNonWorkingDayRequest = (id: number, data: UpdateNonWorkingDayDto) => requestData<EmployeeNonWorkingDayDto>(`/non-working-days/${id}`, "PATCH", data);
export const cancelNonWorkingDayRequest = (id: number, reason: string) => requestData<EmployeeNonWorkingDayDto>(`/non-working-days/${id}/cancel`, "POST", { reason });

export function getWorkShiftCalendarRequest(filters: WorkShiftCalendarFilters, ownOnly: boolean) {
  const query = new URLSearchParams({ from: filters.from, to: filters.to });
  if (!ownOnly && filters.employeeId !== undefined) query.set("employeeId", String(filters.employeeId));
  return requestData<WorkShiftCalendarDto>(`/calendar${ownOnly ? "/mine" : ""}?${query}`);
}
