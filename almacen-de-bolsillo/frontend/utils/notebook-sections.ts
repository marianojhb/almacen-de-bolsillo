export function groupRecordsByDay<T extends { createdAt: string }>(records: T[]) {
  const groups = new Map<string, { title: string; data: T[] }>();
  const ordered = [...records].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  for (const record of ordered) {
    const date = new Date(record.createdAt);
    const valid = Number.isFinite(date.getTime());
    const key = valid ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : "undated";
    const section = groups.get(key) ?? {
      title: valid ? date.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) : "Sin fecha",
      data: [],
    };
    section.data.push(record);
    groups.set(key, section);
  }
  return [...groups.values()];
}
