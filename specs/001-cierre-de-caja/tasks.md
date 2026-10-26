# Tareas — Spec 001 Cierre de Caja

- [x] **T1. Extender los contratos compartidos de balances.** RF-9, RF-12
  - Agregar `employeeId` nullable a la respuesta y `userId` a la entrada de creación sin permitir `employeeId` como dato elegible por el cliente.
  - Hecho cuando: `pnpm --dir packages/shared build` compila los contratos actualizados.

- [x] **T2. Incorporar la relación opcional entre balances y empleados.** RF-9, RF-10
  - Actualizar el esquema Prisma y crear una migración que agregue `balance_b.id_employee_e`, su índice y su clave foránea, preservando balances históricos con valor nulo.
  - Hecho cuando: Prisma valida y genera el cliente, y el SQL no asigna responsables retroactivamente ni modifica datos existentes.

- [x] **T3. Validar la entrada HTTP para crear balances.** RF-9, RF-11, RF-12
  - Escribir primero pruebas con `node:test` para entradas válidas e inválidas y luego implementar el parser puro del cuerpo.
  - Hecho cuando: las pruebas demuestran que solo se aceptan los campos y formatos previstos, incluido un `userId` entero positivo.

- [x] **T4. Resolver y persistir el empleado responsable.** RF-9, RF-10, RF-12
  - Escribir primero pruebas del servicio con dobles en memoria y luego implementar la búsqueda del empleado por `userId`, la conexión al balance y el error cuando no existe asociación.
  - Hecho cuando: las pruebas verifican que un cierre nuevo guarda el `employeeId` correcto, que no reemplaza cierres anteriores y que no crea registros sin responsable.

- [x] **T5. Traducir errores de creación en el controlador.** RF-11, RF-12
  - Integrar el parser y los errores de dominio para responder `400`, `422` o `500` según corresponda.
  - Hecho cuando: el backend compila y cada clase de error produce el estado y mensaje definidos sin enviar directamente `req.body` a Prisma.

- [x] **T6. Enviar la cuenta activa desde el cierre de caja.** RF-9, RF-11, RF-12
  - Incorporar `user.id` al pedido de creación y normalizar `employeeId` nullable en la respuesta, conservando el importe ante errores.
  - Hecho cuando: el frontend compila o pasa el lint del archivo modificado y el cierre exitoso incluye `userId`, mientras un rechazo mantiene el valor ingresado.

- [ ] **T7. Verificar el flujo completo y cerrar la especificación.** RF-1 a RF-12
  - Ejecutar pruebas, builds y lint aplicables; comprobar creación con empleado, rechazo sin asociación y compatibilidad con balances históricos.
  - Hecho cuando: los resultados y limitaciones quedan registrados, todos los RF tienen evidencia, `spec.md` vuelve a estado implementada y `specs/INDEX.md` queda actualizado.
