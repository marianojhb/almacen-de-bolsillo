# Spec 001 — Cierre de Caja

**Estado:** implementada

## Contexto y objetivo

El equipo del comercio necesita conciliar el efectivo disponible con las ventas y gastos registrados desde el último cierre, identificar diferencias y conservar cada arqueo en el historial de balances.

## Usuarios

Administradores, propietarios, supervisores y empleados autenticados.

## Historias de usuario

- **HU-1.** Como integrante del comercio, quiero acceder al cierre desde el Dashboard y desde Más para iniciar el arqueo rápidamente.
- **HU-2.** Como integrante del comercio, quiero comparar el efectivo esperado con el efectivo real para detectar diferencias.
- **HU-3.** Como integrante del comercio, quiero ver por separado las ventas de Mercado Pago y Ualá para conocer los cobros no efectivos del período.
- **HU-4.** Como integrante del comercio, quiero guardar varios cierres consecutivos para conciliar distintos períodos de trabajo.

## Definiciones

- **Cierre anterior:** balance con la fecha más reciente anterior al inicio del nuevo cierre.
- **Apertura:** efectivo real registrado en el cierre anterior; es cero cuando todavía no existe un cierre.
- **Período:** intervalo posterior al cierre anterior y hasta el momento en que se cargan los datos. Sin cierre anterior, comienza a las 00:00 del día actual.
- **Efectivo esperado:** apertura más ventas activas en efectivo menos gastos en efectivo.
- **Diferencia:** efectivo real menos efectivo esperado.

## Requisitos funcionales

- **RF-1:** EL SISTEMA permite acceder a Cierre de Caja desde las acciones rápidas del Dashboard y desde Más a todos los roles autenticados.
- **RF-2:** EL SISTEMA muestra temporalmente el Dashboard existente a todos los roles.
- **RF-3:** CUANDO se prepara un cierre, EL SISTEMA utiliza como apertura el efectivo real del cierre más reciente.
- **RF-4:** SI no existe un cierre anterior, ENTONCES EL SISTEMA utiliza apertura cero y operaciones desde las 00:00 del día actual.
- **RF-5:** CUANDO se prepara un cierre, EL SISTEMA suma por separado las ventas activas en efectivo, Mercado Pago y Ualá pertenecientes al período.
- **RF-6:** CUANDO se prepara un cierre, EL SISTEMA suma como gastos únicamente las transacciones de egreso en efectivo pertenecientes al período.
- **RF-7:** MIENTRAS el usuario ingresa el efectivo real, EL SISTEMA calcula la diferencia respecto del efectivo esperado.
- **RF-8:** SI la diferencia es distinta de cero, ENTONCES EL SISTEMA la presenta en color rojo.
- **RF-9:** CUANDO el usuario confirma un importe real válido, EL SISTEMA registra un nuevo balance con apertura, entradas y salidas de efectivo, efectivo esperado, efectivo real y diferencia; tras completar el registro, vuelve al Dashboard reemplazando la pantalla de cierre en el historial de navegación.
- **RF-10:** EL SISTEMA permite registrar múltiples cierres sin reemplazar cierres anteriores.
- **RF-11:** SI falla la consulta o el guardado, ENTONCES EL SISTEMA conserva el dato ingresado e informa cómo reintentar.

## Requisitos no funcionales

- **RNF-1:** Los importes se presentan en pesos argentinos.
- **RNF-2:** La pantalla es utilizable con un ancho de 375 px y con tema claro u oscuro.
- **RNF-3:** El botón de confirmación no queda habilitado con un importe vacío, negativo o no numérico.

## Casos límite

- No existen ventas ni gastos en el período.
- El cierre anterior pertenece a un día previo.
- Existen ventas inactivas dentro del período.
- El efectivo real es cero.
- La diferencia es positiva o negativa.
- El registro falla y el usuario debe permanecer en la pantalla con el importe ingresado.

## Fuera de alcance

- Dashboard específico por rol.
- Edición o eliminación de cierres anteriores.
- Persistencia de totales de Mercado Pago y Ualá en la tabla de balances.
- Selección manual del período.

## Criterios de finalización

- Todos los requisitos funcionales son verificables desde la aplicación.
- Los contratos compartidos y el frontend compilan sin errores.
- El flujo principal y los estados de error se validan en vista móvil.

## Dudas abiertas

Ninguna.
