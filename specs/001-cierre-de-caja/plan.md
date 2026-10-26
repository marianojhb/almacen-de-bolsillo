# Plan técnico — Spec 001 Cierre de Caja

## Alcance del cambio

El cambio agrega trazabilidad del empleado que confirma cada cierre nuevo. Los balances históricos permanecen válidos sin responsable. El flujo, los cálculos y la interfaz existentes se conservan.

## Archivos y responsabilidades

### Persistencia

- `almacen-de-bolsillo/backend/prisma/schema.prisma`
  - Agregar `employeeId` opcional y la relación `Balance.employee`.
  - Agregar la colección inversa `Employee.balances`.
  - Mapear el campo Prisma `employeeId` a la columna PostgreSQL `id_employee_e`.
  - Cubrir RF-9 y la compatibilidad histórica indicada en los casos límite.
- `almacen-de-bolsillo/backend/prisma/migrations/<timestamp>_add_balance_employee/migration.sql`
  - Agregar `balance_b.id_employee_e` como columna inicialmente nullable.
  - Crear índice y clave foránea hacia `employees_e.id_employee_e`, con actualización en cascada y borrado restringido.
  - No completar automáticamente balances históricos.
  - Cubrir RF-9 y preservar RF-10.

### Contratos compartidos

- `almacen-de-bolsillo/packages/shared/src/balances/balance.types.ts`
  - Agregar `employeeId: number | null` a `BalanceDto`.
  - Hacer que `CreateBalanceDto` reciba `userId`, además de los importes y la fecha, pero no permita que el cliente elija directamente `employeeId`.
  - Cubrir RF-9 y RF-12.

### Backend

- `almacen-de-bolsillo/backend/src/modules/balances/balances.input.ts`
  - Incorporar una función pura que valide y normalice el cuerpo de creación, incluido un `userId` entero positivo.
  - Definir un error de entrada distinguible por el controlador.
  - Cubrir RF-9, RF-11 y RF-12.
- `almacen-de-bolsillo/backend/src/modules/balances/balances.input.test.ts`
  - Probar con `node:test` entradas válidas, `userId` ausente y valores inválidos.
  - Cubrir RF-9 y RF-12.
- `almacen-de-bolsillo/backend/src/modules/balances/balances.service.ts`
  - Buscar el empleado asociado a `userId` y derivar internamente su identificador.
  - Crear el balance conectado a ese empleado dentro de una única operación de persistencia.
  - Emitir un error de dominio si la cuenta no tiene empleado asociado.
  - Mantener las lecturas compatibles con balances cuyo `employeeId` sea nulo.
  - Cubrir RF-9, RF-10 y RF-12.
- `almacen-de-bolsillo/backend/src/modules/balances/balances.service.test.ts`
  - Probar la creación con el empleado derivado de la cuenta y el rechazo cuando no existe asociación.
  - Usar dependencias inyectadas o dobles en memoria para no requerir una base real.
  - Cubrir RF-9 y RF-12.
- `almacen-de-bolsillo/backend/src/modules/balances/balances.controller.ts`
  - Validar el cuerpo antes de llamar al servicio.
  - Responder `400` ante datos inválidos y `422` cuando no se puede identificar al empleado responsable.
  - Conservar el `500` para errores inesperados.
  - Cubrir RF-11 y RF-12.

### Frontend

- `almacen-de-bolsillo/frontend/app/(tabs)/more/cash-closing/index.tsx`
  - Obtener la cuenta actual mediante `useAuth` y enviar su `user.id` al crear el balance.
  - Mantener el importe ingresado y mostrar el mensaje devuelto si el registro es rechazado.
  - No mostrar el empleado responsable, según el fuera de alcance aprobado.
  - Cubrir RF-9, RF-11 y RF-12.
- `almacen-de-bolsillo/frontend/services/balancesApi.ts`
  - Normalizar `employeeId` como número o `null` en las respuestas.
  - Cubrir RF-9 y la compatibilidad con balances históricos.

## Funciones de lógica

### `parseCreateBalanceInput(input)`

Función pura, sin acceso a red, reloj ni base de datos.

- Comprueba que el cuerpo sea un objeto.
- Valida `userId` como entero positivo.
- Valida la fecha y los importes requeridos con las reglas actuales del cierre.
- Devuelve un objeto normalizado apto para el servicio o un error de entrada.
- No recibe `employeeId`, para evitar que el cliente seleccione directamente al responsable.

No interviene la fecha actual; por lo tanto, no se necesita un parámetro `hoy`.

### `resolveResponsibleEmployee(userId, employeeRepository)`

Operación de dominio con dependencia inyectable:

- Busca un empleado por el identificador de usuario.
- Devuelve su identificador si existe la relación.
- Produce un error de dominio verificable si no existe.

## Algoritmo en pseudocódigo

```text
AL RECIBIR POST /balances
  intentar validar y normalizar el cuerpo
  si el cuerpo es inválido
    responder 400 con un mensaje accionable

  buscar empleado cuyo userId corresponda al userId recibido
  si no existe empleado asociado
    responder 422 indicando que no se pudo identificar al responsable

  crear balance con los importes normalizados
  conectar el balance al employeeId encontrado
  responder 201 con el balance y su employeeId

SI falla inesperadamente la persistencia
  responder 500
  el frontend conserva el efectivo real ingresado y permite reintentar
```

## Representación en la interfaz

- No se agrega información visual ni un selector de empleados.
- El guardado exitoso mantiene la navegación actual al Dashboard.
- Ante ausencia de empleado asociado, la pantalla conserva el valor de efectivo real y muestra el mensaje del backend.
- Los balances históricos con `employeeId: null` siguen pudiendo consultarse sin cambios visuales.

## Decisiones técnicas

### Derivar el empleado a partir del usuario

**Decisión:** el frontend envía el `userId` de la cuenta activa y el backend busca el empleado asociado; el cliente no envía `employeeId`.

**Justificación:** reutiliza la relación única `Employee.userId`, reduce el riesgo de guardar accidentalmente un empleado distinto y no exige ampliar `AuthUser` con datos internos.

**Alternativa descartada:** enviar directamente `employeeId` desde el frontend. Se descarta porque permitiría elegir un responsable sin comprobar su asociación con la cuenta.

**Limitación existente:** la API actual no usa tokens ni sesiones de servidor, por lo que no puede comprobar criptográficamente que el `userId` recibido pertenezca al solicitante. Incorporar autenticación de API completa sería un cambio transversal fuera del alcance de esta spec.

### Columna nullable para compatibilidad histórica

**Decisión:** `id_employee_e` será nullable en persistencia, pero obligatorio por regla de servicio para toda creación nueva.

**Justificación:** permite migrar sin inventar responsables para balances existentes y satisface RF-9 para los registros nuevos.

**Alternativa descartada:** columna `NOT NULL` con un empleado por defecto. Se descarta porque atribuiría cierres históricos sin evidencia y podría impedir la migración si existen datos.

### Integridad referencial con borrado restringido

**Decisión:** usar una clave foránea a `employees_e` con `ON DELETE RESTRICT` y `ON UPDATE CASCADE`.

**Justificación:** un empleado responsable forma parte de la trazabilidad del cierre y no debe desaparecer físicamente mientras tenga balances asociados.

**Alternativa descartada:** `ON DELETE SET NULL`. Se descarta porque perdería trazabilidad de registros nuevos ante un borrado físico posterior.

### Validación antes de Prisma

**Decisión:** reemplazar el uso directo de `req.body` como entrada Prisma por un parser explícito.

**Justificación:** evita aceptar campos arbitrarios, distingue errores de cliente de fallos internos y permite pruebas puras.

**Alternativa descartada:** conservar `Prisma.BalanceCreateInput` como contrato HTTP. Se descarta porque expone detalles de persistencia y no expresa RF-12.

## Estrategia de pruebas y verificación

1. Ejecutar primero las pruebas nuevas en rojo:
   - `node --import tsx --test src/modules/balances/balances.input.test.ts`
   - `node --import tsx --test src/modules/balances/balances.service.test.ts`
2. Casos mínimos:
   - una entrada válida conserva fecha e importes y acepta un `userId` positivo;
   - `userId` ausente, decimal, cero o negativo se rechaza;
   - una cuenta con empleado crea el balance con su `employeeId`;
   - una cuenta sin empleado no crea el balance y produce el error de RF-12;
   - una respuesta histórica con `employeeId: null` se normaliza sin fallar.
3. Regenerar Prisma mediante el script del backend; no editar `generated/` manualmente.
4. Verificaciones estáticas:
   - `pnpm --dir packages/shared build`
   - `pnpm --dir backend build`
   - `pnpm --dir frontend lint`
5. Verificación manual del flujo:
   - iniciar sesión con una cuenta asociada a empleado;
   - registrar un cierre y comprobar que `balance_b.id_employee_e` coincide con el empleado de esa cuenta;
   - simular una cuenta sin asociación y comprobar rechazo, mensaje y conservación del importe.

## Trazabilidad completa

- **RF-1 a RF-8:** el acceso, preparación y cálculo actuales no cambian; se cubrirán con verificación de regresión del flujo.
- **RF-9:** contrato, migración, relación Prisma, resolución del empleado, creación y envío desde frontend.
- **RF-10:** inserción de un balance nuevo y preservación de los anteriores.
- **RF-11:** errores tipados en backend y conservación del estado actual en frontend.
- **RF-12:** validación de `userId`, búsqueda de la asociación y respuesta `422` sin crear el balance.
