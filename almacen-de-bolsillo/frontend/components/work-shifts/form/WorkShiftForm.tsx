import type { CreateWorkShiftDto } from "@almacen/shared";
import { useState } from "react";
import { Text } from "react-native";
import { useEmployees } from "@/contexts/employees";
import { useWorkShifts } from "@/contexts/work-shifts";
import { formatCalendarDate } from "@/utils/work-shift-calendar";
import type { AssignmentResult } from "@/utils/assign-work-shifts";
import { Field, FormPage, SelectField } from "./FormControls";
import { ShiftDatePicker } from "./ShiftDatePicker";

export function WorkShiftForm({ initialValues, editing = false, onSubmit, onCancel }: {
  initialValues?: Partial<CreateWorkShiftDto>;
  editing?: boolean;
  onSubmit: (data: CreateWorkShiftDto[]) => Promise<AssignmentResult>;
  onCancel: () => void;
}) {
  const { employees, isLoadingEmployees, employeesError } = useEmployees();
  const { workShiftTypes, isLoading, error: calendarError } = useWorkShifts();
  const [employeeId, setEmployeeId] = useState(initialValues?.employeeId ?? 0);
  const [workShiftTypeId, setWorkShiftTypeId] = useState(initialValues?.workShiftTypeId ?? 0);
  const [dates, setDates] = useState(() => {
    const candidate = initialValues?.date;
    const parsed = candidate ? new Date(`${candidate}T12:00:00Z`) : null;
    const valid = candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate) && parsed && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === candidate;
    return [valid ? candidate : formatCalendarDate(new Date())];
  });
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = saving || isLoadingEmployees || isLoading;
  const employeeOptions = employees.filter((item) => item.isActive || item.id === initialValues?.employeeId)
    .map((item) => ({ id: item.id, label: item.fullname || `${item.firstname ?? ""} ${item.lastname ?? ""}`.trim() || `Empleado ${item.id}` }));
  const journeyOptions = workShiftTypes.filter((item) => item.isActive || item.id === initialValues?.workShiftTypeId)
    .map((item) => ({ id: item.id, label: `${item.name} · ${item.isNonWorkingDay ? "No laboral" : `${item.startTime} a ${item.endTime}`}${item.isActive ? "" : " (desactivada)"}` }));

  async function save() {
    if (busy) return;
    setError(null);
    if (!employeeId || !workShiftTypeId) {
      setError("Seleccioná un empleado y una jornada.");
      return;
    }
    if (dates.length === 0) {
      setError("Seleccioná al menos una fecha en el calendario.");
      return;
    }
    try {
      setSaving(true);
      const result = await onSubmit(dates.map((date) => ({ employeeId, workShiftTypeId, date, notes: notes.trim() || null })));
      if (result.failures.length > 0) {
        setDates(result.failures.map((item) => item.date));
        const prefix = result.savedDates.length > 0 ? `Se guardaron ${result.savedDates.length} turnos. ` : "";
        setError(`${prefix}No se pudieron guardar estas fechas: ${result.failures.map((item) => `${item.date}: ${item.message}`).join("; ")}`);
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo guardar el turno.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormPage saving={busy} onSave={() => void save()} onCancel={onCancel}>
      <SelectField label="Empleado" value={employeeId} options={employeeOptions} disabled={busy} onChange={setEmployeeId} />
      <SelectField label="Jornada" value={workShiftTypeId} options={journeyOptions} disabled={busy} onChange={setWorkShiftTypeId} />
      <ShiftDatePicker dates={dates} multiple={!editing} disabled={busy} onChange={setDates} />
      <Field label="Notas (opcional)" value={notes} onChangeText={setNotes} multiline maxLength={500} editable={!busy} />
      {(error || employeesError || calendarError) && <Text className="text-red-600 dark:text-red-400">{error || employeesError || calendarError}</Text>}
    </FormPage>
  );
}
