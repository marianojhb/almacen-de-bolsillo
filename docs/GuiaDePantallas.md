# Guía de pantallas — Almacén de Bolsillo

> **Versión documentada:** 1.0.0
>
> **Última actualización:** octubre de 2026

Esta guía presenta las principales pantallas de Almacén de Bolsillo y resume la función de cada una. Las capturas incluyen variantes de tema, estados intermedios y pasos de los flujos operativos.

## Inicio de la aplicación

### Pantalla de presentación

La animación de inicio presenta la identidad visual de la aplicación mientras se prepara la experiencia inicial. El video puede reproducirse o descargarse desde el siguiente enlace:

[Reproducir animación de inicio](./screenshots/almacendb-splash.mp4)

### Inicio de sesión

Permite ingresar a la aplicación con las credenciales de una cuenta habilitada. El rol asociado determina las secciones y acciones disponibles para el usuario.

<img src="./screenshots/almacendb-login.png" alt="Pantalla de inicio de sesión" width="320" />

## Dashboard

Es la pantalla principal de la aplicación. Centraliza el resumen operativo del comercio y ofrece acceso a las acciones frecuentes, como registrar ventas, compras o movimientos de caja. También presenta indicadores y alertas relevantes. El dueño del comercio dispone además de un acceso directo a la consulta de rentabilidad.

| Tema claro | Tema oscuro |
| --- | --- |
| <img src="./screenshots/almacendb-dashboard.png" alt="Dashboard en tema claro" width="320" /> | <img src="./screenshots/almacendb-dashboard-dark-mode.png" alt="Dashboard en tema oscuro" width="320" /> |

## Ventas

### Historial de ventas

Presenta las ventas registradas y permite acceder al detalle de cada operación. La pantalla está disponible en tema claro y oscuro.

| Tema claro | Tema oscuro |
| --- | --- |
| <img src="./screenshots/almacendb-sales.png" alt="Listado de ventas en tema claro" width="320" /> | <img src="./screenshots/almacendb-sales-dark-mode.png" alt="Listado de ventas en tema oscuro" width="320" /> |

### Nueva venta

Inicia el flujo para registrar una venta y preparar sus datos antes de confirmarla.

<img src="./screenshots/almacendb-sales-new.png" alt="Pantalla de nueva venta" width="320" />

### Selección de productos

Permite buscar y agregar productos a la venta en preparación.

<img src="./screenshots/almacendb-sales-new-add-products.png" alt="Selección de productos para una nueva venta" width="320" />

### Ejemplos del armado de una venta

Las siguientes capturas muestran distintos estados del formulario durante la preparación de una venta, con productos ya incorporados antes de confirmar la operación.

| Ejemplo 1 | Ejemplo 2 |
| --- | --- |
| <img src="./screenshots/almacendb-sales-new-example1.png" alt="Primer ejemplo de una venta en preparación" width="320" /> | <img src="./screenshots/almacendb-sales-new-example2.png" alt="Segundo ejemplo de una venta en preparación" width="320" /> |

## Productos y stock

### Catálogo de productos

Permite consultar el inventario del comercio y acceder a las acciones disponibles sobre cada producto.

| Tema claro | Tema oscuro |
| --- | --- |
| <img src="./screenshots/almacendb-products.png" alt="Listado de productos en tema claro" width="320" /> | <img src="./screenshots/almacendb-products-dark-mode.png" alt="Listado de productos en tema oscuro" width="320" /> |

### Filtros de productos

Ayuda a reducir el listado y localizar productos según los criterios disponibles en la pantalla.

<img src="./screenshots/almacendb-products-filter.png" alt="Filtros del catálogo de productos" width="320" />

### Detalle de producto

Reúne la información de un producto seleccionado y brinda acceso a sus operaciones relacionadas, como edición, movimientos o ajustes de stock.

<img src="./screenshots/almacendb-products-detail.png" alt="Detalle de un producto" width="320" />

### Registro de un producto

El alta de productos permite cargar la información necesaria para incorporarlos al catálogo y gestionar su inventario. Las capturas documentan las dos secciones del formulario.

| Primera sección | Segunda sección |
| --- | --- |
| <img src="./screenshots/almacendb-products-new-1.png" alt="Primera sección del formulario de nuevo producto" width="320" /> | <img src="./screenshots/almacendb-products-new-2.png" alt="Segunda sección del formulario de nuevo producto" width="320" /> |

## Compras

### Historial de compras

Muestra las compras registradas y permite ingresar al detalle de cada orden. Cuenta con variantes para tema claro y oscuro.

| Tema claro | Tema oscuro |
| --- | --- |
| <img src="./screenshots/almacendb-purchases.png" alt="Listado de compras en tema claro" width="320" /> | <img src="./screenshots/almacendb-purchases-dark-mode.png" alt="Listado de compras en tema oscuro" width="320" /> |

### Registro de una compra

El flujo de compra está dividido en tres etapas:

1. **Borrador:** inicia la orden y permite preparar sus datos.
2. **Selección:** incorpora los productos o elementos necesarios para la compra.
3. **Revisión:** presenta el resumen final antes de registrar la operación.

#### 1. Borrador

<img src="./screenshots/almacendb-purchases-new-1-draft.png" alt="Borrador de una nueva compra" width="320" />

#### 2. Selección

<img src="./screenshots/almacendb-purchases-new-2-select.png" alt="Selección durante el registro de una compra" width="320" />

#### 3. Revisión

<img src="./screenshots/almacendb-purchases-new-3-review.png" alt="Revisión final de una nueva compra" width="320" />

## Proveedores

Permite consultar y administrar los proveedores vinculados con el comercio. Desde este módulo se accede a su información y a las operaciones relacionadas.

<img src="./screenshots/almacendb-suppliers.png" alt="Pantalla de proveedores" width="320" />

## Empleados

Centraliza la consulta y administración de empleados, sus estados y los datos asociados con sus cuentas y roles.

<img src="./screenshots/almacendb-employees.png" alt="Pantalla de empleados" width="320" />

## Turnos laborales

### Calendario de turnos

Organiza las asignaciones de los empleados en una vista de calendario para facilitar la planificación laboral.

<img src="./screenshots/almacendb-timetable-calendar.png" alt="Calendario de turnos laborales" width="320" />

### Detalle de turno

Permite consultar la información y el seguimiento de un turno seleccionado.

<img src="./screenshots/almacendb-timetable-followup.png" alt="Detalle y seguimiento de un turno" width="320" />

## Caja y movimientos contables

### Ingresos y egresos

Resume los movimientos de entrada y salida de dinero para facilitar el control operativo.

<img src="./screenshots/almacendb-cash-in-out.png" alt="Ingresos y egresos de caja" width="320" />

### Operación de caja

La pantalla de caja registra los importes necesarios para controlar la operación y determinar diferencias. Debido a su extensión vertical, se documenta mediante dos capturas consecutivas de la misma pantalla.

| Parte superior | Continuación |
| --- | --- |
| <img src="./screenshots/almacendb-cash-1.png" alt="Parte superior de la pantalla de caja" width="320" /> | <img src="./screenshots/almacendb-cash-2.png" alt="Continuación de la pantalla de caja" width="320" /> |

### Historial de caja

Permite consultar los registros anteriores de caja y revisar los resultados de cada operación.

<img src="./screenshots/almacendb-cash-history.png" alt="Historial de operaciones de caja" width="320" />

### Transacciones

Reúne los movimientos contables generados por las operaciones del comercio para facilitar el seguimiento de ingresos y egresos.

<img src="./screenshots/almacendb-transactions.png" alt="Listado de transacciones" width="320" />

## Rentabilidad

Presenta al dueño del comercio una referencia general del resultado acumulado del negocio. El cálculo incorpora las ventas activas en efectivo y por medios digitales, los egresos de cierres regulares, los aportes y retiros de capital, y la mercadería disponible valuada al mejor costo corriente informado por proveedores activos.

La pantalla desglosa cada componente e informa cuando existen productos con stock que no puede valuarse por falta de un precio utilizable. El resultado es una estimación orientativa basada en los registros disponibles: no representa la ganancia real por producto ni reemplaza un estado contable.

<img src="./screenshots/almacendb-profitability.png" alt="Resumen estimado de rentabilidad del negocio" width="320" />

## Más opciones

Agrupa el acceso a funciones complementarias, configuraciones y módulos administrativos. Está disponible en tema claro y oscuro.

| Tema claro | Tema oscuro |
| --- | --- |
| <img src="./screenshots/almacendb-more.png" alt="Menú Más en tema claro" width="320" /> | <img src="./screenshots/almacendb-more-dark-mode.png" alt="Menú Más en tema oscuro" width="320" /> |

## Cuenta

Muestra los datos de la cuenta activa y ofrece las acciones personales disponibles para la sesión del usuario.

<img src="./screenshots/almacendb-account.png" alt="Pantalla de cuenta" width="320" />

## Temas visuales

Las capturas del dashboard, ventas, productos, compras y menú de opciones muestran que la interfaz se adapta tanto al tema claro como al oscuro. El usuario puede utilizar la apariencia que resulte más adecuada para su dispositivo y entorno.
