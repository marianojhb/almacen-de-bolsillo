# Requerimientos funcionales — Almacén de Bolsillo

> **Versión documentada:** 1.0.0
>
> **Estado:** ready
>
> **Última actualización:** octubre de 2026

Este documento reúne el alcance funcional de la aplicación y distingue las funciones disponibles en la versión 1.0.0 de las propuestas para versiones futuras.

## Convenciones

- **Disponible:** incluido en el alcance de la versión 1.0.0.
- **Parcial:** existe una implementación básica que puede ampliarse.
- **Hoja de ruta:** propuesta fuera del alcance actual.

## RF-01: Gestionar ventas — Disponible

- **RF-01.1** Registrar una venta con uno o más productos.
- **RF-01.2** Consultar el historial y el detalle de ventas.
- **RF-01.3** Validar el stock disponible antes de confirmar la operación.
- **RF-01.4** Calcular subtotales, descuentos, impuestos y total.
- **RF-01.5** Registrar la forma de pago.
- **RF-01.6** Asociar la venta al usuario vendedor.
- **RF-01.7** Generar el ingreso correspondiente en el registro de transacciones.
- **RF-01.8** Venta rápida desde las acciones del inicio — **Parcial**.
- **RF-01.9** Escaneo de códigos de barras — **Hoja de ruta**.

## RF-02: Gestionar stock — Disponible

- **RF-02.1** Registrar productos y categorías.
- **RF-02.2** Modificar o desactivar productos existentes.
- **RF-02.3** Validar la unicidad del SKU cuando se informa.
- **RF-02.4** Registrar movimientos por compra, venta, entrada, salida o ajuste manual.
- **RF-02.5** Definir y controlar el stock mínimo de cada producto.
- **RF-02.6** Mostrar alertas de productos con stock mínimo o crítico.
- **RF-02.7** Consultar el historial de movimientos de un producto.
- **RF-02.8** Reposición predictiva automática — **Hoja de ruta**.
- **RF-02.9** Detección de productos sin rotación — **Hoja de ruta**.
- **RF-02.10** Notificaciones diarias de stock crítico — **Hoja de ruta**.

## RF-03: Gestionar proveedores — Disponible

- **RF-03.1** Registrar proveedores.
- **RF-03.2** Modificar sus datos y estado.
- **RF-03.3** Consultar y filtrar proveedores.
- **RF-03.4** Realizar una baja lógica mediante su estado.
- **RF-03.5** Validar la unicidad del CUIT cuando se informa.
- **RF-03.6** Consultar compras y productos asociados a un proveedor.

## RF-04: Gestionar compras — Disponible

- **RF-04.1** Registrar una orden de compra.
- **RF-04.2** Asociar la compra a un proveedor y a un usuario comprador.
- **RF-04.3** Registrar productos, cantidades, precios y descuentos.
- **RF-04.4** Actualizar el stock y generar sus movimientos de forma atómica.
- **RF-04.5** Generar el egreso correspondiente en el registro de transacciones.
- **RF-04.6** Reflejar las compras en el resumen financiero del dashboard.
- **RF-04.7** Generar una lista de compra sugerida por proveedor — **Hoja de ruta**.

## RF-05: Gestionar empleados — Disponible

- **RF-05.1** Registrar empleados y sus credenciales de acceso.
- **RF-05.2** Modificar datos personales, laborales y de acceso.
- **RF-05.3** Consultar y filtrar empleados.
- **RF-05.4** Activar, desactivar o eliminar registros según los permisos del rol.
- **RF-05.5** Validar la unicidad del DNI cuando se informa.
- **RF-05.6** Asignar un identificador único a cada empleado.
- **RF-05.7** Asociar las ventas al usuario responsable.

## RF-06: Gestionar turnos laborales — Disponible

- **RF-06.1** Crear tipos de turno y asignarlos a empleados.
- **RF-06.2** Modificar asignaciones y tipos de turno.
- **RF-06.3** Eliminar o cancelar asignaciones.
- **RF-06.4** Consultar el calendario de turnos.
- **RF-06.5** Conservar fechas de creación y actualización de las asignaciones — **Parcial**.

## RF-07: Monitorear el negocio — Disponible

- **RF-07.1** Visualizar un dashboard general.
- **RF-07.2** Consultar indicadores diarios, semanales y mensuales.
- **RF-07.3** Diferenciar ingresos por ventas y egresos por compras.
- **RF-07.4** Calcular totales y balance operativo por período.
- **RF-07.5** Consultar ventas recientes.
- **RF-07.6** Visualizar alertas de stock mínimo o crítico.
- **RF-07.7** Visualizar la evolución comparativa de ingresos y egresos.
- **RF-07.8** Registrar cierres de caja y consultar su historial.
- **RF-07.9** Calcular la ganancia real por producto — **Hoja de ruta**.
- **RF-07.10** Sugerir precios según un margen objetivo — **Hoja de ruta**.
- **RF-07.11** Consultar un resultado general estimado a partir de las ventas activas, los movimientos históricos de caja y la mercadería disponible valuada a costos corrientes.
- **RF-07.12** Desglosar el resultado estimado en ventas en efectivo, cobros digitales, egresos, aportes, retiros y valor del stock.
- **RF-07.13** Advertir cuando existan productos activos con stock que no pueda valuarse por falta de un precio utilizable de un proveedor activo.
- **RF-07.14** Restringir la consulta de rentabilidad al dueño del comercio.

## RF-08: Gestionar acceso y configuración — Parcial

- **RF-08.1** Crear la cuenta inicial del dueño del comercio.
- **RF-08.2** Gestionar usuarios vinculados con empleados.
- **RF-08.3** Asignar los roles `ADMIN`, `BUSINESS_OWNER`, `SUPERVISOR` y `EMPLOYEE`.
- **RF-08.4** Validar credenciales y estado del usuario durante el inicio de sesión.
- **RF-08.5** Controlar en la interfaz las acciones permitidas para cada rol.
- **RF-08.6** Registrar el último acceso del usuario.
- **RF-08.7** Auditoría integral de actividad — **Hoja de ruta**.
- **RF-08.8** Operación sin conexión y sincronización posterior — **Hoja de ruta**.

## Alcance de la versión 1.0.0

La versión 1.0.0 cubre el circuito principal del comercio:

1. autenticación y administración de empleados;
2. catálogo de productos, categorías y control de stock;
3. gestión de proveedores y compras;
4. registro de ventas y medios de pago;
5. movimientos contables, dashboard, cierres de caja y resultado estimado de rentabilidad;
6. planificación de turnos laborales;
7. permisos de interfaz según el rol.

Las funciones predictivas, el escaneo de códigos de barras, las notificaciones automáticas, la auditoría completa y el modo sin conexión permanecen en la hoja de ruta.
