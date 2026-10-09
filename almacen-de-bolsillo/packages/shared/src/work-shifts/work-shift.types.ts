export type WorkShiftStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type WorkShiftTimeBlock = {
  startTime: string;
  endTime: string;
  endsNextDay?: boolean;
};

// La asignación conserva sus horarios; solo se editan las observaciones.
export type UpdateWorkShiftDto = { notes?: string | null };

export type WorkShiftDraft = {
  date: string;
  startsAt: string;
  endsAt: string;
};

export type WorkShiftConflict = {
  draftIndex: number;
  existingShiftId: number | null;
  otherDraftIndex: number | null;
  existingNonWorkingDayId?: number;
  message: string;
};

// Nombre, apariencia y tolerancia se consultan del tipo; no son columnas del turno.
export type WorkShiftDto = {
  lateToleranceMinutes: number;
  id: number;
  commerceId: number;
  employeeId: number;
  workShiftTypeId: number;
  name: string;
  icon: string;
  iconColor: string;
  color: string;
  breaks: WorkShiftBreakDto[];
  startsAt: string;
  endsAt: string;
  actualStartedAt: string | null;
  actualEndedAt: string | null;
  status: WorkShiftStatus;
  notes: string | null;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  employee: { id: number; name: string; isActive: boolean };
  createdBy: { id: number; username: string | null; name: string };
};

export type WorkShiftFilters = {
  from: string;
  to: string;
  employeeId?: number;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  status?: WorkShiftStatus;
};

export type WorkShiftBreakMode = "FLEXIBLE" | "FIXED";

export type WorkShiftBreakInput =
  | { mode: "FLEXIBLE"; durationMinutes: number }
  | { mode: "FIXED"; startTime: string; endTime: string; startsNextDay?: boolean; endsNextDay?: boolean };

export type WorkShiftBreakDraft = {
  mode: WorkShiftBreakMode;
  durationMinutes: number | null;
  startsAt: string | null;
  endsAt: string | null;
};

export type WorkShiftBreakDto = WorkShiftBreakDraft & {
  id: number;
};

export type CreateWorkShiftTypeDto = {
  lateToleranceMinutes?: number;
  name: string;
  icon: string;
  iconColor?: string;
  color: string;
  isWorkingDay?: boolean;
  startTime?: string | null;
  endTime?: string | null;
  endsNextDay?: boolean;
  breaks?: WorkShiftBreakInput[];
};

export type UpdateWorkShiftTypeDto = Partial<CreateWorkShiftTypeDto> & { isActive?: boolean };

export type WorkShiftTypeData = {
  lateToleranceMinutes: number;
  name: string;
  icon: string;
  iconColor: string;
  color: string;
  isWorkingDay: boolean;
  startTime: string | null;
  endTime: string | null;
  endsNextDay: boolean;
  breaks: WorkShiftBreakInput[];
};

export type WorkShiftTypeDto = WorkShiftTypeData & {
  id: number;
  commerceId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkShiftAssignmentDto = {
  employeeId: number;
  workShiftTypeId: number;
  expectedTypeUpdatedAt?: string;
  dates?: string[];
  from?: string;
  to?: string;
  weekdays?: number[];
  notes?: string | null;
};

export type WorkShiftAssignmentDraft = {
  lateToleranceMinutes: number;
  kind: "WORK_SHIFT" | "NON_WORKING_DAY";
  workShiftTypeId: number;
  date: string;
  name: string;
  icon: string;
  iconColor: string;
  color: string;
  allDay: boolean;
  startsAt: string | null;
  endsAt: string | null;
  breaks: WorkShiftBreakDraft[];
};

// allDay y los extremos nulos son datos derivados, no campos almacenados.
export type EmployeeNonWorkingDayDto = {
  id: number;
  commerceId: number;
  employeeId: number;
  workShiftTypeId: number;
  date: string;
  name: string;
  icon: string;
  iconColor: string;
  color: string;
  allDay: true;
  startsAt: null;
  endsAt: null;
  notes: string | null;
  isActive: boolean;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  employee: WorkShiftDto["employee"];
  createdBy: WorkShiftDto["createdBy"];
};

export type UpdateNonWorkingDayDto = {
  date?: string;
  workShiftTypeId?: number;
  notes?: string | null;
  isActive?: boolean;
};

export type WorkShiftCalendarFilters = Pick<WorkShiftFilters, "from" | "to" | "employeeId">;

export type WorkShiftCalendarDto = {
  timeZone: string;
  employeeId: number | null;
  shifts: WorkShiftDto[];
  nonWorkingDays: EmployeeNonWorkingDayDto[];
};

export type WorkShiftAssignmentBatchDto = {
  employeeId: number;
  assignments: { workShiftTypeId: number; dates: string[]; expectedTypeUpdatedAt?: string }[];
};

export type WorkShiftAssignmentBatchPreview = {
  employee: { id: number; name: string };
  timeZone: string;
  drafts: WorkShiftAssignmentDraft[];
  conflicts: WorkShiftConflict[];
  canSave: boolean;
  workShiftTypes: { id: number; updatedAt: string }[];
};
