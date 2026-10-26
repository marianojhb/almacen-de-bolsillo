# Estado SDD

## 001 — Cierre de Caja

- T3 completada: parser puro `parseCreateBalanceInput` y error `BalanceInputError` (RF-9, RF-11, RF-12).
- El parser valida usuario, fecha e importes y rechaza campos ajenos al contrato, incluido `employeeId`.
- Verificación: 11 pruebas del parser y 2 de migración aprobadas con `node --import tsx --test`; build del backend aprobado.
- T4 completada: el servicio deriva el empleado mediante `userId` y crea el balance con `employee.connect`; si no existe asociación lanza `BalanceResponsibleEmployeeError` sin crear registros (RF-9, RF-10, RF-12).
- Verificación T4: 5 pruebas nuevas en memoria; 18 pruebas aprobadas en conjunto (servicio, parser y migración); build del backend aprobado.
- T5 completada: el controlador valida y normaliza el cuerpo antes de llamar al servicio; responde `400` para entradas inválidas, `422` sin empleado asociado y `500` para errores inesperados (RF-11, RF-12).
- Verificación T5: 4 pruebas nuevas del controlador; 22 pruebas aprobadas en conjunto; build del backend aprobado.
- T6 completada: el cierre obtiene la cuenta con `useAuth`, envía `userId` y evita solicitudes sin sesión; la API normaliza `employeeId` a número o `null` (RF-9, RF-11, RF-12).
- Verificación T6: 5 pruebas aprobadas con `node --test frontend/test/cash-closing-save.test.mjs` (ejecutado desde frontend como `node --test test/cash-closing-save.test.mjs`); usan dobles de hooks, navegación y API, sin renderizado nativo ni red. Cubren envío del usuario, navegación exitosa, preservación del importe ante rechazo y normalización de respuestas.
- ESLint de los 3 archivos frontend nuevos/modificados aprobado. TypeScript global falla en `AuthShell.tsx` y `StartupLogo.tsx`; lint global falla con 3 errores de efectos en proveedores y movimientos, ajenos a T6.
- Migración `20261025000000_add_balance_employee` aplicada a la base configurada con autorización explícita del usuario. Era la única pendiente; `prisma migrate status` confirma que el esquema está actualizado.
- Verificados `balance_b.id_employee_e` nullable, el índice y la clave foránea a empleados con borrado restringido y actualización en cascada. No se asignaron responsables retroactivamente.
- La comprobación posterior de `GET http://localhost:3000/balances` no pudo conectarse al backend (curl: código 7); no se confirmó aún la respuesta HTTP tras migrar.
- T7 sigue pendiente: falta validar el flujo visual y resolver los bloqueos de TypeScript, lint y NativeWind detectados en la revisión.
