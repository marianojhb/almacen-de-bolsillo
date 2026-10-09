import type { WorkShiftCalendarDto } from "@almacen/shared";

// Solo memoria de esta sesión. No persiste datos entre cuentas ni dispositivos.
export function createCalendarCache(ttl = 60000, limit = 12) {
  const entries = new Map<string, { data: WorkShiftCalendarDto; expiresAt: number }>();
  return {
    read(key: string, now = Date.now()): WorkShiftCalendarDto | undefined {
      const entry = entries.get(key);
      return entry && entry.expiresAt > now ? entry.data : undefined;
    },
    write(key: string, data: WorkShiftCalendarDto, now = Date.now()) {
      entries.delete(key);
      entries.set(key, { data, expiresAt: now + ttl });
      if (entries.size > limit) entries.delete(entries.keys().next().value!);
    },
    clear() { entries.clear(); },
  };
}
