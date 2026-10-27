# Stack tecnológico

> **Versión documentada:** 1.0.0
>
> **Última actualización:** octubre de 2026

Este documento describe las tecnologías presentes en el código de Almacén de Bolsillo. Las versiones exactas se administran desde los archivos `package.json` y `pnpm-lock.yaml`.

## Arquitectura

El proyecto utiliza un workspace de pnpm con tres unidades principales:

| Workspace         | Responsabilidad                               |
| ----------------- | --------------------------------------------- |
| `frontend`        | Aplicación móvil y web                        |
| `backend`         | API REST y acceso a datos                     |
| `@almacen/shared` | Tipos, DTO, permisos y utilidades compartidas |

## Frontend

- Expo 58
- React 19
- React Native 0.88
- TypeScript
- Expo Router para navegación basada en archivos
- React Navigation
- NativeWind y Tailwind CSS para estilos
- React Context API para estado de sesión y dominios
- Fetch API para comunicación HTTP
- AsyncStorage para preferencias locales
- Expo Image, Haptics, Symbols y Web Browser
- React Native Reanimated y Gesture Handler

La aplicación admite Android, iOS y una salida web estática. EAS está configurado como proyecto de compilación de Expo.

## Backend

- Node.js
- Express 5
- TypeScript
- Prisma ORM 7
- Driver `pg` y adaptador PostgreSQL de Prisma
- CORS
- Dotenv
- `tsx` para desarrollo con recarga

La API expone recursos para autenticación, usuarios, empleados, productos, categorías, proveedores, compras, ventas, movimientos de stock, transacciones, balances y turnos laborales.

## Base de datos

- PostgreSQL
- Migraciones administradas con Prisma Migrate
- Modelos Prisma con mapeo explícito hacia nombres físicos en PostgreSQL
- Transacciones de Prisma para mantener consistentes ventas, compras, stock y movimientos contables

## Autenticación y autorización

- Inicio de sesión mediante email y contraseña.
- Hash de contraseñas con `scrypt` de Node.js, salt aleatorio y comparación segura.
- Roles compartidos: `ADMIN`, `BUSINESS_OWNER`, `SUPERVISOR` y `EMPLOYEE`.
- Matriz RBAC definida en `@almacen/shared` y consumida por el frontend.

La versión actual no implementa tokens JWT. Los permisos de la interfaz no reemplazan una validación de autorización en la API.

## Calidad y herramientas

- ESLint con la configuración de Expo para el frontend.
- TypeScript en los tres workspaces.
- Pruebas puntuales con el test runner nativo de Node.js.
- Git y GitHub para control de versiones.
- GitHub Issues y Projects para seguimiento del trabajo.
- pnpm 11.9.0 para dependencias y ejecución del workspace.

## Ejecución local

Desde `almacen-de-bolsillo/`:

```bash
pnpm install
pnpm dev
```

Comandos de verificación disponibles:

```bash
pnpm --dir backend build
pnpm --dir frontend lint
pnpm --dir packages/shared build
```

Los scripts `test` de la raíz y del backend continúan siendo marcadores y no representan una suite completa.
