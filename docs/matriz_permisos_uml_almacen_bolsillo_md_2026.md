# Matriz de roles y permisos — Almacén de Bolsillo

> **Versión documentada:** 1.0.0
>
> **Fuente de implementación:** `packages/shared/src/auth/permissions.ts`
>
> **Última actualización:** octubre de 2026

La aplicación utiliza control de acceso basado en roles (RBAC) para habilitar rutas y acciones en la interfaz.

## Roles

| Identificador | Nombre visible | Responsabilidad |
| --- | --- | --- |
| `ADMIN` | Administrador | Acceso completo a los recursos configurados. |
| `BUSINESS_OWNER` | Dueño del comercio | Acceso completo a la operación de su comercio. |
| `SUPERVISOR` | Supervisor | Gestión operativa sin eliminación de ventas, productos, proveedores ni compras. |
| `EMPLOYEE` | Empleado | Registro y consulta de ventas, consulta de productos y de sus turnos. |

## Acciones

- **C — Create:** crear o registrar.
- **R — Read:** consultar.
- **U — Update:** modificar.
- **D — Delete:** eliminar, cancelar o desactivar, según el recurso.
- **—:** sin acceso configurado.

## Matriz vigente

| Recurso | Admin | Dueño | Supervisor | Empleado |
| --- | --- | --- | --- | --- |
| Ventas | C / R / U / D | C / R / U / D | C / R / U | C / R |
| Productos y stock | C / R / U / D | C / R / U / D | C / R / U | R |
| Proveedores | C / R / U / D | C / R / U / D | C / R / U | — |
| Compras | C / R / U / D | C / R / U / D | C / R / U | — |
| Empleados | C / R / U / D | C / R / U / D | R | — |
| Turnos laborales | C / R / U / D | C / R / U / D | C / R / U / D | R |
| Tipos de turno | C / R / U / D | C / R / U / D | C / R / U / D | — |

## Reglas por rol

### Administrador

Puede crear, consultar, modificar y eliminar todos los recursos incluidos en la matriz.

### Dueño del comercio

Posee acceso operativo completo. Además, la interfaz le presenta información financiera y acciones específicas del negocio, como indicadores de compras, ventas y cierres de caja.

### Supervisor

Puede gestionar la operación diaria, pero no eliminar ventas, productos, proveedores ni compras. Puede consultar empleados y administrar turnos y tipos de turno.

### Empleado

Puede registrar y consultar ventas, consultar productos y ver sus turnos. No administra compras, proveedores, empleados ni tipos de turno.

## Diagrama textual

```text
ADMIN ───────────────► acceso completo
BUSINESS_OWNER ──────► acceso completo + información financiera
SUPERVISOR ──────────► operación y turnos, con eliminación restringida
EMPLOYEE ────────────► ventas + consulta de productos y turnos
```

## Consideraciones de seguridad

- La matriz actual se comparte entre frontend y backend como contrato de dominio, pero los controles visibles se aplican principalmente en la navegación y en los componentes del frontend.
- Toda operación sensible debería validar los permisos también en la API antes de considerarse protegida frente a solicitudes externas.
- Los cierres de caja, transacciones y dashboard poseen reglas adicionales en la interfaz que todavía no están modeladas como recursos dentro de la matriz compartida.
