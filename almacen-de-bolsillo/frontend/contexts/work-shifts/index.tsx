import type {
  CreateWorkShiftDto,
  CreateWorkShiftTypeDto,
  UpdateWorkShiftDto,
  UpdateWorkShiftTypeDto,
  WorkShift,
  WorkShiftType,
} from "@almacen/shared";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

import {
  createWorkShiftRequest,
  deleteWorkShiftRequest,
  getWorkShiftsRequest,
  updateWorkShiftRequest,
} from "@/services/workShiftsApi";

import {
  createWorkShiftTypeRequest,
  deactivateWorkShiftTypeRequest,
  getWorkShiftTypesRequest,
  updateWorkShiftTypeRequest,
} from "@/services/workShiftTypesApi";

import { getCalendarRange } from "@/utils/work-shift-calendar";
import { assignWorkShiftDates, type AssignmentResult } from "@/utils/assign-work-shifts";

type WorkShiftsContextType = {
  month: Date;
  workShifts: WorkShift[];
  workShiftTypes: WorkShiftType[];
  isLoading: boolean;
  error: string | null;

  previousMonth: () => void;
  nextMonth: () => void;
  currentMonth: () => void;
  refresh: () => Promise<void>;

  addWorkShift: (
    data: CreateWorkShiftDto,
  ) => Promise<WorkShift>;

  updateWorkShift: (
    id: number,
    data: UpdateWorkShiftDto,
  ) => Promise<WorkShift>;

  deleteWorkShift: (id: number) => Promise<void>;
  addWorkShifts: (data: CreateWorkShiftDto[]) => Promise<AssignmentResult>;

  addWorkShiftType: (
    data: CreateWorkShiftTypeDto,
  ) => Promise<WorkShiftType>;

  updateWorkShiftType: (
    id: number,
    data: UpdateWorkShiftTypeDto,
  ) => Promise<WorkShiftType>;

  deactivateWorkShiftType: (
    id: number,
  ) => Promise<void>;
};

const WorkShiftsContext =
  createContext<WorkShiftsContextType | null>(null);

function initialMonth(): Date {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );
}

export function WorkShiftsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const { can } = usePermissions();

  const [month, setMonth] = useState(initialMonth);
  const [workShifts, setWorkShifts] =
    useState<WorkShift[]>([]);

  const [workShiftTypes, setWorkShiftTypes] =
    useState<WorkShiftType[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);

  const { from, to } = useMemo(
    () => getCalendarRange(month),
    [month],
  );

  const canRead = can("workShifts", "read");

  const canManage =
    can("workShifts", "create") ||
    can("workShifts", "update") ||
    can("workShifts", "delete");

  const canReadTypes = can("workShiftTypes", "read");

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;

    if (!user || !canRead) {
      setWorkShifts([]);
      setWorkShiftTypes([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [calendar, journeys] = await Promise.all([
        getWorkShiftsRequest(from, to),

        canReadTypes
          ? getWorkShiftTypesRequest(true)
          : Promise.resolve<WorkShiftType[]>([]),
      ]);

      if (currentRequest !== requestId.current) {
        return;
      }

      const visibleShifts = canManage
        ? calendar.workShifts
        : calendar.workShifts.filter(
            (shift) => shift.employee.userId === user.id,
          );

      setWorkShifts(visibleShifts);
      setWorkShiftTypes(journeys);
    } catch (failure) {
      if (currentRequest !== requestId.current) {
        return;
      }

      setWorkShifts([]);
      setWorkShiftTypes([]);

      setError(
        failure instanceof Error
          ? failure.message
          : "No se pudieron cargar los turnos.",
      );
    } finally {
      if (currentRequest === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [
    user,
    canRead,
    canManage,
    canReadTypes,
    from,
    to,
  ]);

  useEffect(() => {
    // La carga remota cambia al navegar de mes o iniciar sesión.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();

    return () => {
      requestId.current += 1;
    };
  }, [refresh]);

  const previousMonth = () => {
    setMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1,
        ),
    );
  };

  const nextMonth = () => {
    setMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1,
        ),
    );
  };

  const currentMonth = () => {
    setMonth(initialMonth());
  };

  const addWorkShift = async (
    data: CreateWorkShiftDto,
  ): Promise<WorkShift> => {
    if (!can("workShifts", "create")) {
      throw new Error("No tenés permiso para asignar turnos.");
    }

    const shift = await createWorkShiftRequest(data);
    await refresh();

    return shift;
  };

  const addWorkShifts = async (data: CreateWorkShiftDto[]): Promise<AssignmentResult> => {
    if (!can("workShifts", "create")) {
      throw new Error("No tenés permiso para asignar turnos.");
    }
    const result = await assignWorkShiftDates(data, createWorkShiftRequest);
    await refresh();
    return result;
  };

  const updateWorkShift = async (
    id: number,
    data: UpdateWorkShiftDto,
  ): Promise<WorkShift> => {
    if (!can("workShifts", "update")) {
      throw new Error("No tenés permiso para editar turnos.");
    }

    const shift = await updateWorkShiftRequest(id, data);
    await refresh();

    return shift;
  };

  const deleteWorkShift = async (
    id: number,
  ): Promise<void> => {
    if (!can("workShifts", "delete")) {
      throw new Error("No tenés permiso para eliminar turnos.");
    }

    await deleteWorkShiftRequest(id);
    await refresh();
  };

  const addWorkShiftType = async (
    data: CreateWorkShiftTypeDto,
  ): Promise<WorkShiftType> => {
    if (!can("workShiftTypes", "create")) {
      throw new Error("No tenés permiso para crear jornadas.");
    }

    const journey = await createWorkShiftTypeRequest(data);
    await refresh();

    return journey;
  };

  const updateWorkShiftType = async (
    id: number,
    data: UpdateWorkShiftTypeDto,
  ): Promise<WorkShiftType> => {
    if (!can("workShiftTypes", "update")) {
      throw new Error("No tenés permiso para editar jornadas.");
    }

    const journey = await updateWorkShiftTypeRequest(id, data);
    await refresh();

    return journey;
  };

  const deactivateWorkShiftType = async (
    id: number,
  ): Promise<void> => {
    if (!can("workShiftTypes", "delete")) {
      throw new Error("No tenés permiso para desactivar jornadas.");
    }

    await deactivateWorkShiftTypeRequest(id);
    await refresh();
  };

  return (
    <WorkShiftsContext.Provider
      value={{
        month,
        workShifts,
        workShiftTypes,
        isLoading,
        error,
        previousMonth,
        nextMonth,
        currentMonth,
        refresh,
        addWorkShift,
        addWorkShifts,
        updateWorkShift,
        deleteWorkShift,
        addWorkShiftType,
        updateWorkShiftType,
        deactivateWorkShiftType,
      }}
    >
      {children}
    </WorkShiftsContext.Provider>
  );
}

export function useWorkShifts(): WorkShiftsContextType {
  const context = useContext(WorkShiftsContext);

  if (!context) {
    throw new Error(
      "useWorkShifts debe usarse dentro de WorkShiftsProvider.",
    );
  }

  return context;
}
