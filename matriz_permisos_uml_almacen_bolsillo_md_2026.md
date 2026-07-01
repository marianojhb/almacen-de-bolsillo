# Matriz de permisos por Requerimiento Funcional — Almacén en el Bolsillo

## Convención de permisos
- **C** = Crear / Registrar
- **M** = Modificar
- **K** = Consultar
- **E** = Eliminar / Desactivar / Cancelar
- **–** = Sin acceso

> Nota: en algunos RF, la eliminación puede interpretarse como baja lógica o cancelación.

---

# Matriz de permisos por Requerimiento Funcional

| RF | Admin | Business-Owner | Supervisors | Employees |
|---|---|---|---|---|
| **RF-01 Gestionar Ventas** | C / M / K / E | K | C / M / K | C / K |
| **RF-02 Gestionar el Stock** | C / M / K / E | K | C / M / K | C / M / K |
| **RF-03 Gestionar Proveedores** | C / M / K / E | C / M / K | C / M / K | – |
| **RF-04 Gestionar Compras** | C / M / K / E | C / M / K | C / M / K | – |
| **RF-05 Gestionar Empleados** | C / M / K / E | C / M / K | K | – |
| **RF-06 Gestionar Turnos Laborales** | C / M / K / E | C / M / K | C / M / K / E | K |
| **RF-07 Monitorear la Performance del Negocio** | K | K | K | – |
| **RF-08 Gestionar Configuración General** | C / M / K / E | K | – | – |

---

# Justificación breve por RF

## RF-01 Gestionar Ventas
Los empleados participan en la registración y consulta de sus operaciones. Los supervisores controlan y corrigen desvíos operativos. El owner consulta resultados. El admin conserva control total.

## RF-02 Gestionar el Stock
Los empleados pueden registrar movimientos operativos, mientras que supervisores y admin gestionan cambios más amplios. El owner consulta el estado general para tomar decisiones.

## RF-03 Gestionar Proveedores
Por su impacto administrativo y comercial, queda restringido a niveles de supervisión y superiores.

## RF-04 Gestionar Compras
Se limita a roles con responsabilidad sobre abastecimiento y egresos del negocio.

## RF-05 Gestionar Empleados
Por tratarse de información sensible, su administración queda reservada a owner y admin. Supervisors solo consultan cuando sea necesario.

## RF-06 Gestionar Turnos Laborales
Supervisors operan activamente los turnos del equipo. Employees solamente consultan sus asignaciones.

## RF-07 Monitorear la Performance del Negocio
Es un módulo esencialmente analítico, orientado a perfiles de control y toma de decisiones.

## RF-08 Gestionar Configuración General
Por seguridad, la operación queda centralizada en admin. El owner puede consultar configuraciones generales según política del sistema.

---

# Mini-diagrama textual estilo UML

```text
[Admin]
  -> RF-01 Ventas
  -> RF-02 Stock
  -> RF-03 Proveedores
  -> RF-04 Compras
  -> RF-05 Empleados
  -> RF-06 Turnos
  -> RF-07 Dashboard
  -> RF-08 Configuración

[Business-Owner]
  -> RF-01 Consultar Ventas
  -> RF-02 Consultar Stock
  -> RF-03 Proveedores
  -> RF-04 Compras
  -> RF-05 Empleados
  -> RF-06 Turnos
  -> RF-07 Dashboard
  -> RF-08 Consultar Configuración

[Supervisors]
  -> RF-01 Ventas
  -> RF-02 Stock
  -> RF-03 Proveedores
  -> RF-04 Compras
  -> RF-05 Consultar Empleados
  -> RF-06 Turnos
  -> RF-07 Dashboard

[Employees]
  -> RF-01 Ventas
  -> RF-02 Stock
  -> RF-06 Consultar Turnos
```