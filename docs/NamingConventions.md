# Convenciones de nombres

> **Versión:** 1.0.0
>
> **Última actualización:** octubre de 2026

Estas reglas mantienen consistentes el código TypeScript, los componentes React Native, los contratos compartidos, Prisma y PostgreSQL.

## TypeScript y JavaScript

### Variables, funciones y propiedades

Usar **camelCase** y nombres descriptivos.

```ts
const userName = "johnconnor";

function getUserName() {
  return userName;
}
```

### Tipos, interfaces, clases y enums

Usar **PascalCase**.

```ts
type ProductSummary = {
  productId: number;
};

class InvoiceService {}
```

### Constantes globales y variables de entorno

Usar **SCREAMING_SNAKE_CASE** para valores fijos compartidos y nombres de variables de entorno.

```ts
const MAX_USERS = 100;
const DATABASE_URL = process.env.DATABASE_URL;
```

## React Native y Expo

- Componentes: **PascalCase** (`ProductCard`, `EmployeeForm`).
- Hooks: **camelCase** con el prefijo `use` (`useProducts`, `usePermissions`).
- Contextos y providers: nombre del dominio seguido por `Context` o `Provider`.
- Props: nombre del componente seguido por `Props`.
- Rutas de Expo Router: minúsculas y **kebab-case** cuando contienen más de una palabra.

```text
components/products/ProductCard.tsx
contexts/products/provider.tsx
app/(tabs)/more/work-shifts/index.tsx
```

## Archivos y directorios

- Componentes React: **PascalCase**.
- Módulos, utilidades, servicios y rutas: **kebab-case** o el patrón ya establecido en el módulo.
- Pruebas: mismo nombre de la unidad con sufijo `.test.ts` o `.test.mjs`.
- Directorios de dominio: nombres en plural y **kebab-case**.

No se deben introducir dos estilos diferentes dentro de un mismo módulo.

## API y contratos compartidos

- Los recursos de la API usan rutas en minúsculas y **kebab-case**: `/sales-orders`, `/stock-movements`.
- Los datos que cruzan la frontera entre frontend y backend deben declararse o reutilizarse desde `@almacen/shared`.
- Los DTO usan un nombre en **PascalCase** y el sufijo `Dto`: `CreateSalesOrderDto`.
- Los identificadores usan el nombre de la entidad seguido por `Id`: `productId`, `employeeId`.

## PostgreSQL

Los identificadores físicos usan **snake_case**.

```sql
user_name
created_at
product_id
```

### Sufijo de tablas del proyecto

Las tablas de dominio deben terminar con un guion bajo y una abreviatura identificadora.

```text
users_u
products_p
sales_orders_so
stock_movements_sm
```

Esta es una regla específica del proyecto, no una convención general de PostgreSQL. Las tablas existentes que no la cumplan deberán normalizarse únicamente mediante una migración planificada; no se deben renombrar directamente en producción.

## Prisma

- Modelos y enums: **PascalCase**.
- Campos y relaciones: **camelCase**.
- Valores de enums: **SCREAMING_SNAKE_CASE**.
- Usar `@map` y `@@map` para conservar nombres idiomáticos en TypeScript sin trasladar los nombres físicos de PostgreSQL a la API.

```prisma
model User {
  id        Int      @id @default(autoincrement()) @map("id_user_u")
  firstName String   @map("first_name_u")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users_u")
}
```

## Resumen

| Convención | Ejemplo | Uso |
| --- | --- | --- |
| `camelCase` | `createdAt`, `getProducts` | Variables, funciones, propiedades y campos Prisma |
| `PascalCase` | `User`, `ProductCard` | Tipos, clases, componentes y modelos Prisma |
| `snake_case` | `created_at`, `users_u` | Identificadores PostgreSQL |
| `kebab-case` | `stock-movements` | Rutas, módulos y directorios con varias palabras |
| `SCREAMING_SNAKE_CASE` | `DATABASE_URL`, `BUSINESS_OWNER` | Entorno, constantes globales y valores de enums |
