# Repository instructions

## Scope and layout

- The Git root contains project documentation and the application workspace in `almacen-de-bolsillo/`.
- Run pnpm workspace commands from `almacen-de-bolsillo/` unless a command explicitly targets a package.
- `almacen-de-bolsillo/backend/` is the Node.js, Express, TypeScript, Prisma, and PostgreSQL API.
- `almacen-de-bolsillo/frontend/` is the Expo and React Native application.
- `almacen-de-bolsillo/packages/shared/` is the `@almacen/shared` TypeScript workspace package used by the backend and frontend.
- Instructions in `almacen-de-bolsillo/frontend/AGENTS.md` additionally apply to frontend work and must be followed.

## Authoritative project documentation

- Start with `README.md` for setup and project context.
- Follow `docs/NamingConventions.md` for TypeScript, React, Prisma, and PostgreSQL naming.
- Consult the functional requirements, permissions matrix, and data model under `docs/` before changing behavior or persistence.
- Keep specifications indexed in `specs/INDEX.md`; do not create empty specifications.

## Setup and common commands

From `almacen-de-bolsillo/`:

```sh
pnpm install
pnpm dev
pnpm dev:backend
pnpm dev:frontend
pnpm dev:shared
```

Targeted verification:

```sh
pnpm --dir backend build
pnpm --dir frontend lint
pnpm --dir packages/shared build
```

- The root and backend `test` scripts are placeholders that intentionally fail; do not report them as successful test suites.
- Run the smallest relevant checks while developing, then all applicable targeted checks before finishing.

## Code and data conventions

- Use camelCase for TypeScript variables, functions, properties, and Prisma fields; PascalCase for types, classes, Prisma models, and React components.
- Use snake_case for PostgreSQL identifiers. Project table names must end in an underscore plus identifying initial, as documented in `docs/NamingConventions.md`.
- Map Prisma names to PostgreSQL names with `@map` and `@@map` rather than leaking database naming into TypeScript APIs.
- Reuse contracts from `@almacen/shared` when data crosses package boundaries.
- Keep changes scoped to the relevant workspace and preserve established local patterns.

## Safety

- Never commit or disclose values from `.env`, `.env.bak`, `supabase.env`, credentials, or generated secret files.
- Do not edit generated output in `dist/`, `generated/`, `.expo/`, or `node_modules/`; change source or generator configuration instead.
- Treat Prisma schema and migration changes as persistent data changes: inspect the current model and migration history before modifying them.
- Do not discard unrelated working-tree changes.
