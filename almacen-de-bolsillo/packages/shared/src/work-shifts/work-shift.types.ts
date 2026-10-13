export type WorkShiftType = {
    id: number;
    name: string;
    isNonWorkingDay: boolean;
    startTime: string | null;
    endTime: string | null;
    color: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateWorkShiftTypeDto = {
  name: string;
  isNonWorkingDay: boolean;
  startTime: string | null;
  endTime: string | null;
  color: string;
};

export type UpdateWorkShiftTypeDto =
  Partial<CreateWorkShiftTypeDto> & {
    isActive?: boolean;
  };

export type WorkShiftEmployee = {
  id: number;
  fullname: string | null;
  firstname: string | null;
  lastname: string | null;
  userId: number | null;
  isActive: boolean;
};

export type WorkShift = {
  id: number;

  // Fecha de calendario: AAAA-MM-DD.
  date: string;

  employeeId: number;
  workShiftTypeId: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  employee: WorkShiftEmployee;
  workShiftType: WorkShiftType;
};

export type CreateWorkShiftDto = {
  employeeId: number;
  workShiftTypeId: number;
  date: string;
  notes?: string | null;
};

export type UpdateWorkShiftDto =
  Partial<CreateWorkShiftDto>;

export type WorkShiftCalendarQuery = {
  from: string;
  to: string;
};

export type WorkShiftCalendarResponse = {
  workShifts: WorkShift[];
};