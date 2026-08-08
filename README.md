status: in-progress

# Almacen de Bolsillo

Welcome to our final project at Universidad Tecnológica Nacional - Técnico Universitario en Programación (2025)

We are a team of two students who developed an app called **Almacen de Bolsillo** which lets small drugstores keep their business organized.

## Installation

Esta documentación explica cómo instalar, configurar y ejecutar el proyecto después de clonarlo desde Git.

---

## 📋 Requisitos previos

Antes de comenzar, asegurarse de tener instaladas las siguientes herramientas:

- Git
- Node.js
- npm
- pnpm
- Microsoft Visual C++ Redistributable

Se recomienda utilizar **Visual Studio Code** como editor.

### Instalar pnpm

Si `pnpm` no está instalado:

```bash
npm install -g pnpm
```

Comprobar la instalación:

```bash
pnpm --version
```

---

# 🚀 Instalación

## 1. Clonar el repositorio

Clonar el proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Entrar a la carpeta:

```bash
cd almacen-de-bolsillo
```

La estructura principal del proyecto es:

```text
almacen-de-bolsillo/
│
├── backend/
├── frontend/
├── packages/
│   └── shared/
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

---

## 2. Instalar las dependencias

El proyecto utiliza **pnpm workspaces**, por lo que todas las dependencias se instalan desde la raíz.

Ejecutar:

```bash
pnpm install
```

Este comando instala las dependencias necesarias para:

```text
Root
├── Backend
├── Frontend
└── Packages
```

No es necesario ejecutar `pnpm install` individualmente dentro de cada carpeta.

---

# 🧩 Paquete compartido `@almacen/shared`

El proyecto utiliza el paquete:

```text
@almacen/shared
```

Este contiene código compartido entre el frontend y el backend.

## 3. Compilar `@almacen/shared`

Después de instalar las dependencias:

```bash
pnpm --filter @almacen/shared build
```

Esto genera los archivos compilados necesarios para que el frontend y backend puedan utilizar el paquete.

Si se realizan modificaciones dentro de:

```text
packages/shared
```

se puede volver a compilar manualmente usando el mismo comando.
---

# 🔐 Variables de entorno

## 4. Crear los archivos `.env`

Los archivos `.env` no están incluidos en el repositorio.

Después de realizar un `git clone`, crear manualmente:

```text
frontend/.env
backend/.env
```

> [!IMPORTANT]
> No subir archivos `.env` al repositorio, ya que pueden contener credenciales e información sensible.

---

# 📱 Configuración del Frontend

## 5. Crear `frontend/.env`

Crear:

```text
frontend/.env
```

El frontend necesita conocer la dirección IP de la computadora donde se está ejecutando el backend.

Ejemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.100:3000
```

Reemplazar:

```text
192.168.0.100
```

por la IP local de la computadora.

### Obtener la IP en Windows

Ejecutar:

```powershell
ipconfig
```

Buscar:

```text
Dirección IPv4
```

> [!IMPORTANT]
> Si se utiliza Expo Go desde un teléfono físico, el teléfono debe poder comunicarse por red con la computadora donde se ejecuta el backend.

---

# 🖥️ Configuración del Backend

## 6. Crear `backend/.env`

Crear:

```text
backend/.env
```

Configurar la conexión a PostgreSQL:

```env
DATABASE_URL=postgresql://USUARIO:CONTRASEÑA@localhost:5432/NOMBRE_BASE_DATOS
```

Ejemplo:

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5432/almacen
```

Los valores corresponden a:

| Valor | Descripción |
|---|---|
| `USUARIO` | Usuario de PostgreSQL |
| `CONTRASEÑA` | Contraseña de PostgreSQL |
| `localhost` | Servidor PostgreSQL |
| `5432` | Puerto por defecto de PostgreSQL |
| `NOMBRE_BASE_DATOS` | Nombre de la base de datos |

---

# 🔄 Modo desarrollo de `@almacen/shared`

## 7. Iniciar el paquete compartido

Desde la raíz:

```bash
pnpm --filter @almacen/shared dev
```

Este proceso debe mantenerse ejecutándose mientras se trabaja en el proyecto.

El modo desarrollo permite que los cambios realizados dentro de:

```text
packages/shared
```

se recompilen automáticamente.

Se recomienda mantener este proceso abierto en una terminal separada.

---

# ⚙️ Backend

## 8. Iniciar el Backend

Desde la raíz:

```bash
pnpm --filter backend dev
```

También puede iniciarse entrando directamente a la carpeta:

```bash
cd backend
pnpm dev
```

---

# 📲 Frontend

## 9. Iniciar el Frontend

Desde la raíz:

```bash
pnpm --filter frontend start
```

También puede iniciarse entrando directamente a la carpeta:

```bash
cd frontend
pnpm start
```

Después de iniciar Expo se mostrará un código QR para abrir la aplicación.

---

# ▶️ Orden recomendado de ejecución

Durante el desarrollo se recomienda utilizar **3 terminales**.

## Terminal 1 — Shared

```bash
pnpm --filter @almacen/shared dev
```

## Terminal 2 — Backend

```bash
pnpm --filter backend start
```

o, si utiliza modo desarrollo:

```bash
pnpm --filter backend dev
```

## Terminal 3 — Frontend

```bash
pnpm --filter frontend start
```

En caso de problemas con la caché de Metro:

```bash
pnpm --filter frontend exec expo start --clear
```

---

# ✅ Instalación completa desde cero

Después de clonar el proyecto en una computadora nueva, seguir este orden:

```text
1. Instalar Git
2. Instalar Node.js
3. Instalar pnpm
4. Instalar Microsoft Visual C++ Redistributable
5. Instalar herramientas de C++ si fueran necesarias
6. Instalar PostgreSQL
7. Clonar el repositorio
8. Entrar a la raíz del proyecto
9. Ejecutar pnpm install
10. Crear frontend/.env
11. Configurar EXPO_PUBLIC_API_URL con la IP de la PC
12. Crear backend/.env
13. Configurar DATABASE_URL
14. Configurar PostgreSQL
15. Compilar @almacen/shared
16. Iniciar @almacen/shared en modo desarrollo
17. Iniciar el backend
18. Iniciar el frontend
```

---

## Documentation

[Functional Requirements](./docs/almacen_bolsillo_rfs_extendido_mvp.md) [More FR](./docs/almacen_de_bolsillo_rfs_innovadores.md) [Roles and permissions](./docs/matriz_permisos_uml_almacen_bolsillo_md_2026.md) [Naming conventions](./docs/NamingConventions.md) [Entity Relational Design](./docs/DER%20v1.drawio.png) or dark mode also available [Entity Relational Design - dark mode](./docs/DER%20v1_oscuro.drawio.png)

## Stack

Currently [this is a complete list](./docs/Stack.md) of technologies we have used.

## Authors

- [Mariano Belgrano](mbelgrano@gmail.com)
- [Lautaro Flor Kovinchich](lautaroflor.k@gmail.com)
