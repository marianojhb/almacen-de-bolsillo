export type OwnerDetails = { firstname: string; lastname: string; dni: string | null };

// Validación de formato, no verificación de identidad ni consulta a registros oficiales.
export function validateOwnerDetails(owner: { firstname?: unknown; lastname?: unknown; dni?: unknown }, country: string):
  { ok: true; data: OwnerDetails } | { ok: false; message: string } {
  const firstname = typeof owner.firstname === "string" ? owner.firstname.trim() : "";
  const lastname = typeof owner.lastname === "string" ? owner.lastname.trim() : "";
  if (!firstname || firstname.length > 80 || !lastname || lastname.length > 80) {
    return { ok: false, message: "Ingresá nombre y apellido del dueño, de hasta 80 caracteres cada uno." };
  }
  let dni: string | null = null;
  if (country === "AR") {
    dni = typeof owner.dni === "string" ? owner.dni.replace(/[.\s]/g, "") : "";
    if (!/^\d{7,8}$/.test(dni)) return { ok: false, message: "Ingresá un DNI de 7 u 8 dígitos para el dueño." };
  }
  return { ok: true, data: { firstname, lastname, dni } };
}

export function getUserDisplayName(user: { firstname?: string | null; lastname?: string | null; username?: string | null }): string {
  return [user.firstname, user.lastname].filter(Boolean).join(" ") || user.username || "Creador del comercio";
}
