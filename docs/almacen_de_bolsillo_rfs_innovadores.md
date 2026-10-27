# Funcionalidades innovadoras y hoja de ruta

> **Proyecto:** Almacén de Bolsillo
>
> **Versión de referencia:** 1.0.0
>
> **Última actualización:** octubre de 2026

Este documento reúne oportunidades de evolución posteriores a la versión 1.0.0. No forman parte del alcance comprometido salvo cuando se indica que ya existe una base funcional.

## Resumen

| Propuesta | Requerimiento relacionado | Estado en v1.0.0 |
| --- | --- | --- |
| Reposición predictiva | RF-02.8 | Hoja de ruta |
| Compra sugerida por proveedor | RF-04.7 | Hoja de ruta |
| Venta ultrarrápida | RF-01.8 | Base disponible |
| Escaneo de códigos de barras | RF-01.9 | Hoja de ruta |
| Cierre diario de caja | RF-07.8 | Disponible con confirmación manual |
| Productos sin rotación | RF-02.9 | Hoja de ruta |
| Precio sugerido | RF-07.10 | Hoja de ruta |
| Modo sin conexión | RF-08.8 | Hoja de ruta |
| Alertas diarias | RF-02.10 | Hoja de ruta |
| Ganancia por producto | RF-07.9 | Hoja de ruta |

## 1. Reposición predictiva

Estimar la fecha probable de agotamiento a partir del stock disponible y el ritmo reciente de ventas.

**Ejemplo:** si se venden 12 botellas de aceite por semana y quedan 8 unidades, la aplicación podría advertir que el producto se agotará aproximadamente en cuatro días.

**Valor:** anticipar faltantes en lugar de informar únicamente que el stock ya es bajo.

## 2. Compra sugerida por proveedor

Preparar una propuesta de compra que considere ventas recientes, stock actual, stock mínimo, presentación de compra y proveedor asociado.

**Ejemplo:** “Se sugiere comprar 24 unidades de azúcar”.

## 3. Venta ultrarrápida

Extender el acceso rápido a ventas con una cuadrícula de productos frecuentes y controles optimizados para una operación de kiosco. La versión 1.0.0 ya ofrece acceso directo a una nueva venta desde el dashboard.

## 4. Escaneo de códigos de barras

Usar la cámara del dispositivo para buscar productos, agregarlos a una venta o asistir en la carga de stock.

## 5. Cierre diario asistido

La versión 1.0.0 permite registrar cierres de caja con apertura, ingresos, egresos, cierre esperado, cierre real, diferencia y empleado responsable. Una evolución futura puede generar el cierre automáticamente al finalizar el día y enviar su resumen.

## 6. Detector de productos sin rotación

Identificar artículos que no registran ventas durante un período configurable.

**Ejemplo:** “Este producto no registra ventas desde hace 18 días”.

## 7. Precio sugerido por margen

Calcular un precio de venta recomendado a partir del costo de compra y un margen objetivo.

**Ejemplo:** para un costo de `$800` y un margen del `40 %`, sugerir un precio según la fórmula comercial definida por el negocio.

## 8. Modo sin conexión

Permitir operaciones esenciales sin conectividad y sincronizarlas de manera segura cuando la conexión se restablezca. La solución deberá contemplar conflictos, duplicados y operaciones parciales.

## 9. Alertas inteligentes diarias

Generar avisos priorizados, por ejemplo: “Hay tres productos con stock crítico” o “Conviene revisar la categoría Bebidas”.

## 10. Ganancia real por producto

Combinar costos históricos, descuentos e ingresos para diferenciar los productos de mayor facturación de los que aportan mayor rentabilidad.

## Criterio de priorización

Antes de incorporar una propuesta se deberá definir su alcance, reglas de negocio, permisos, comportamiento sin conexión y criterios verificables de aceptación.
