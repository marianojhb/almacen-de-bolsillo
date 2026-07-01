# Naming Conventions

Since this project is part of our goal to learn and apply software development best practices, it is important to document the conventions used throughout the codebase.

Naming conventions are part of a broader set of **coding standards**. They help keep the project consistent, readable, and easier to maintain.

This project follows common conventions used in the JavaScript, TypeScript, React, Expo, PostgreSQL, and Prisma ecosystem.

## TypeScript / JavaScript / Express

- Variables and functions use **camelCase**.

```ts
const userName = 'johnconnor';

function getUserName() {
  return userName;
}
```

- Classes use **PascalCase**.

```ts
class Invoice {
  // class implementation
}
```

- Constants that represent fixed configuration values may use **SCREAMING_SNAKE_CASE**.

```ts
const MAX_USERS = 100;
const DATABASE_URL = process.env.DATABASE_URL;
```

## React / Expo

- Components use **PascalCase**.

```tsx
<Dashboard />
<UserProfile />
<ProductCard />
```

- Component files may also use **PascalCase**.

```txt
Dashboard.tsx
UserProfile.tsx
ProductCard.tsx
```

## PostgreSQL

PostgreSQL database objects use **snake_case**.

- Table names use **snake_case**.

```sql
users
products
user_profiles
```

- Field names use **snake_case**.

```sql
user_name
created_at
product_id
```

### Project-specific table suffix convention

In this project, table names must end with an underscore followed by an identifying initial.

```txt
users      ❌
users_u    ✔️

products   ❌
products_p ✔️
```

This is a project-specific rule and not a general PostgreSQL standard.

## Prisma

Prisma uses conventions that match the JavaScript/TypeScript ecosystem.

- Models use **PascalCase**.

```prisma
model User {
}
```

- Fields use **camelCase**.

```prisma
firstName
createdAt
productId
```

- Prisma models and fields are mapped to PostgreSQL tables and columns using `@@map` and `@map`.

Example:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  firstName String   @map("first_name")
  createdAt DateTime @map("created_at")

  @@map("users_u")
}
```

In this example:

- `User` is the Prisma model name.
- `firstName` and `createdAt` are Prisma field names.
- `first_name` and `created_at` are PostgreSQL column names.
- `users_u` is the PostgreSQL table name.

## Summary of Common Naming Conventions

| Convention | Example | Common use |
| --- | --- | --- |
| **camelCase** | `userName`, `createdAt` | JavaScript/TypeScript variables, functions, object properties, Prisma fields |
| **PascalCase** | `User`, `ProductController`, `Dashboard` | Classes, React components, TypeScript types, Prisma models |
| **snake_case** | `user_name`, `created_at`, `product_id` | PostgreSQL tables and columns |
| **kebab-case** | `user-profile`, `created-at` | URLs, CSS classes, file names in some projects |
| **SCREAMING_SNAKE_CASE** | `DATABASE_URL`, `MAX_USERS` | Constants and environment variables |
