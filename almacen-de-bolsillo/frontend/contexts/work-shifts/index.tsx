import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { getWorkShiftLocalFields, isWorkShiftDate, type AuthSessionInfo, type WorkShiftAssignmentDraft, type WorkShiftCalendarDto, type WorkShiftTypeDto } from "@almacen/shared";
import { useAuth } from "@/contexts/auth";
import { getWorkShiftCalendarRequest, getWorkShiftEmployeesRequest, getWorkShiftTypesRequest } from "@/services/workShiftsApi";
import { calendarAssignmentConflicts, pendingAssignmentDrafts, calendarDays, type PendingAssignment, type CalendarView, type WorkShiftSection } from "@/components/work-shifts/work-shift-calendar.utils";
import { createCalendarCache } from "@/components/work-shifts/work-shift-calendar.cache";

type WorkShiftsContextValue = {
  session: AuthSessionInfo | null;
  timeZone: string;
  now: number;
  today: string;
  canReadAll: boolean;
  canManage: boolean;
  section: WorkShiftSection;
  setSection: Dispatch<SetStateAction<WorkShiftSection>>;
  view: CalendarView;
  setView: Dispatch<SetStateAction<CalendarView>>;
  anchor: string;
  selectedDay: string;
  setSelectedDay: Dispatch<SetStateAction<string>>;
  dayDetailsOpen: boolean;
  setDayDetailsOpen: Dispatch<SetStateAction<boolean>>;
  navigateDate: (day: string) => void;
  employeeId: string;
  changeEmployee: (id: string) => void;
  employees: { id: number; name: string }[];
  types: WorkShiftTypeDto[];
  selectedType: WorkShiftTypeDto | undefined;
  selectedTypeId: string;
  setSelectedTypeId: Dispatch<SetStateAction<string>>;
  chooseType: (id: string) => void;
  editing: boolean;
  setEditing: Dispatch<SetStateAction<boolean>>;
  pendingAssignments: PendingAssignment[];
  setPendingAssignments: Dispatch<SetStateAction<PendingAssignment[]>>;
  toggleDayAssignment: (date: string) => void;
  assignmentWarning: string | null;
  setAssignmentWarning: Dispatch<SetStateAction<string | null>>;
  assignmentBusy: boolean;
  setAssignmentBusy: Dispatch<SetStateAction<boolean>>;
  assignmentNotice: string | null;
  setAssignmentNotice: Dispatch<SetStateAction<string | null>>;
  draftSelection: { drafts: WorkShiftAssignmentDraft[]; error: string | null };
  calendar: WorkShiftCalendarDto | null;
  calendarError: string | null;
  optionsError: string | null;
  loading: boolean;
  refreshCalendar: () => Promise<void>;
  refreshOptions: () => Promise<void>;
};

function useWorkShiftState(): WorkShiftsContextValue {
  const { session } = useAuth();
  const timeZone = session?.commerce.timeZone ?? "America/Argentina/Buenos_Aires";
  const canReadAll = session?.permissions.includes("work_shifts.read") ?? false;
  const canManage = session?.permissions.includes("work_shifts.manage") ?? false;
  const [now, setNow] = useState(Date.now());
  const today = getWorkShiftLocalFields(new Date(now), timeZone).date;
  const [section, setSection] = useState<WorkShiftSection>("calendar");
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today);
  const [dayDetailsOpen, setDayDetailsOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(session?.employee ? String(session.employee.id) : "");
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
  const [types, setTypes] = useState<WorkShiftTypeDto[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [editing, setEditing] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [assignmentWarning, setAssignmentWarning] = useState<string | null>(null);
  const [assignmentBusy, setAssignmentBusy] = useState(false);
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);
  const [calendarRecord, setCalendarRecord] = useState<{ key: string; data: WorkShiftCalendarDto } | null>(null);
  const calendarCache = useMemo(() => createCalendarCache(), []);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const calendarVersion = useRef(0);
  const optionsVersion = useRef(0);
  const days = useMemo(() => calendarDays(anchor, section === "tracking" ? view : "month"), [anchor, section, view]);
  const from = days[0];
  const to = days[days.length - 1];
  const queryKey = `${session?.user.id}:${session?.commerce.id}:${timeZone}:${canReadAll ? employeeId || "all" : `mine-${session?.employee?.id}`}:${from}:${to}`;
  const hasCalendar = section !== "types" && (canReadAll ? !!employeeId : !!session?.employee);
  const calendar = hasCalendar ? (calendarRecord?.key === queryKey ? calendarRecord.data : calendarCache.read(queryKey) ?? null) : null;
  const selectedType = types.find((type) => String(type.id) === selectedTypeId && type.isActive);
  const draftSelection = useMemo(() => pendingAssignmentDrafts(pendingAssignments, timeZone), [pendingAssignments, timeZone]);

  const refreshOptions = useCallback(async () => {
    const version = ++optionsVersion.current;
    if (!canReadAll) { setEmployees([]); setTypes([]); setOptionsError(null); return; }
    try {
      const [people, definitions] = await Promise.all([getWorkShiftEmployeesRequest(), getWorkShiftTypesRequest(canManage)]);
      if (version !== optionsVersion.current) return;
      setEmployees(people);
      setTypes(definitions);
      setOptionsError(null);
    } catch (error) {
      if (version === optionsVersion.current) setOptionsError(error instanceof Error ? error.message : "No se pudieron cargar las opciones.");
    }
  }, [canManage, canReadAll]);

  const loadCalendar = useCallback(async (useCache: boolean) => {
    const version = ++calendarVersion.current;
    if (!useCache) calendarCache.clear();
    if (!hasCalendar) {
      setCalendarRecord(null); setCalendarError(null); setLoading(false); return;
    }
    const cached = useCache ? calendarCache.read(queryKey) : undefined;
    if (cached) { setCalendarRecord({ key: queryKey, data: cached }); setCalendarError(null); setLoading(false); return; }
    setLoading(true);
    setCalendarError(null);
    try {
      const result = await getWorkShiftCalendarRequest({ from, to, ...(canReadAll && employeeId && { employeeId: Number(employeeId) }) }, !canReadAll);
      if (version === calendarVersion.current) {
        calendarCache.write(queryKey, result);
        setCalendarRecord({ key: queryKey, data: result });
      }
    } catch (error) {
      if (version === calendarVersion.current) {
        calendarCache.clear(); setCalendarRecord(null);
        setCalendarError(error instanceof Error ? error.message : "No se pudo cargar el calendario.");
      }
    } finally {
      if (version === calendarVersion.current) setLoading(false);
    }
  }, [canReadAll, employeeId, from, to, hasCalendar, queryKey, calendarCache]);
  const refreshCalendar = useCallback(() => loadCalendar(false), [loadCalendar]);

  useEffect(() => {
    setCalendarError(null);
    void loadCalendar(true);
    return () => { calendarVersion.current += 1; };
  }, [loadCalendar]);
  useEffect(() => {
    void refreshOptions();
    return () => { optionsVersion.current += 1; };
  }, [refreshOptions]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const changeEmployee = (value: string) => {
    if (assignmentBusy || value === employeeId) return;
    calendarVersion.current += 1;
    setCalendarRecord(null); setCalendarError(null); setLoading(false);
    setEmployeeId(value); setPendingAssignments([]); setSelectedTypeId(""); setEditing(false); setDayDetailsOpen(false); setAssignmentNotice(null); setAssignmentWarning(null);
  };
  const navigateDate = (day: string) => {
    if (assignmentBusy) return;
    if (!isWorkShiftDate(day)) return;
    try { calendarDays(day, "month"); }
    catch { setCalendarError("La fecha está fuera del rango disponible del calendario."); return; }
    setAnchor(day); setSelectedDay(day); setDayDetailsOpen(false);
  };
  const chooseType = (id: string) => {
    if (assignmentBusy) return;
    if (id === selectedTypeId) {
      setSelectedTypeId("");
      setPendingAssignments((current) => current.filter((item) => String(item.type.id) !== id));
    } else setSelectedTypeId(id);
    setAssignmentWarning(null);
  };
  const toggleDayAssignment = (date: string) => {
    if (assignmentBusy || !selectedType || !calendar || loading) return;
    const exists = pendingAssignments.some((item) => item.date === date && item.type.id === selectedType.id);
    if (exists) {
      setPendingAssignments((current) => current.filter((item) => item.date !== date || item.type.id !== selectedType.id));
      return;
    }
    if (pendingAssignments.length >= 184) { setAssignmentWarning("Guardá estas asignaciones antes de agregar más."); return; }
    const next = [...pendingAssignments, { date, type: selectedType }];
    const preview = pendingAssignmentDrafts(next, timeZone);
    if (preview.error) { setAssignmentWarning(preview.error); return; }
    const conflicts = calendarAssignmentConflicts(preview.drafts, calendar, timeZone);
    if (conflicts.length) { setAssignmentWarning(conflicts[0].message); return; }
    setPendingAssignments(next); setAssignmentNotice(null);
  };
  return {
    session, timeZone, now, today, canReadAll, canManage, section, setSection,
    view, setView, anchor, selectedDay, setSelectedDay, dayDetailsOpen, setDayDetailsOpen, navigateDate,
    employeeId, changeEmployee, employees, types, selectedType, selectedTypeId, setSelectedTypeId, chooseType,
    editing, setEditing, pendingAssignments, setPendingAssignments, toggleDayAssignment, assignmentWarning, setAssignmentWarning,
    assignmentBusy, setAssignmentBusy, assignmentNotice, setAssignmentNotice, draftSelection,
    calendar, calendarError, optionsError, loading, refreshCalendar, refreshOptions,
  };
}

const WorkShiftsContext = createContext<WorkShiftsContextValue | null>(null);

export function WorkShiftsProvider({ children }: { children: ReactNode }) {
  const value = useWorkShiftState();
  return <WorkShiftsContext.Provider value={value}>{children}</WorkShiftsContext.Provider>;
}

export function useWorkShifts() {
  const context = useContext(WorkShiftsContext);
  if (!context) throw new Error("useWorkShifts debe usarse dentro de WorkShiftsProvider.");
  return context;
}
