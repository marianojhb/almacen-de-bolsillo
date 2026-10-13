export function formatFullName(firstname?: string | null, lastname?: string | null): string {
  return [lastname?.trim(), firstname?.trim()].filter(Boolean).join(" ");
}
