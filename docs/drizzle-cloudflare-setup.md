# Setting Up Drizzle ORM with Cloudflare D1

This guide covers how to set up Drizzle ORM with Cloudflare Workers and D1 database from scratch.

## Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Authenticated with Cloudflare (`wrangler login`)

## 1. Install Dependencies

```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

## 2. Create D1 Database

Create a new D1 database via Wrangler:

```bash
wrangler d1 create my-database
```

This outputs a database ID - save it for the next step:

```
Created D1 database 'my-database'
database_id = "abc123-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## 3. Configure wrangler.jsonc

Add the D1 binding to your Wrangler configuration:

```jsonc
{
  "name": "my-app",
  "main": "src/index.tsx",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-database",
      "database_id": "abc123-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "migrations_dir": "drizzle",
    },
  ],
}
```

For environment-specific databases (staging/production), add separate environments:

```jsonc
{
  "env": {
    "staging": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "my-database-staging",
          "database_id": "staging-database-id-here",
          "migrations_dir": "drizzle",
          "remote": true,
        },
      ],
    },
    "production": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "my-database",
          "database_id": "production-database-id-here",
          "migrations_dir": "drizzle",
          "remote": true,
        },
      ],
    },
  },
}
```

## 4. Create drizzle.config.ts

Create a minimal Drizzle configuration file at the project root:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
});
```

## 5. Define Your Schema

Create `src/db/schema.ts`:

```typescript
import { relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  int,
  index,
} from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

// Users table
export const usersTable = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    email: text("email").unique(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("users_email_idx").on(table.email)],
);

// Posts table with foreign key
export const postsTable = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid()),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id),
    title: text("title").notNull(),
    content: text("content"),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("posts_user_id_idx").on(table.userId)],
);

// Define relations for type-safe joins
export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
}));

export const postsRelations = relations(postsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [postsTable.userId],
    references: [usersTable.id],
  }),
}));

// Export types for use in application code
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;

// Export schema for relational queries
import * as schema from "./schema";
export { schema };
```

### Schema Patterns

**Timestamps with auto-default:**

```typescript
createdAt: int("created_at", { mode: "timestamp" })
  .notNull()
  .$defaultFn(() => new Date()),
```

**Public IDs with nanoid:**

```typescript
publicId: text("public_id")
  .notNull()
  .unique()
  .$defaultFn(() => nanoid()),
```

**Indexes for query performance:**

```typescript
(table) => [
  index("table_column_idx").on(table.column),
  index("table_composite_idx").on(table.col1, table.col2),
];
```

## 6. Add npm Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate:local": "wrangler d1 migrations apply DB --local",
    "db:migrate:staging": "wrangler d1 migrations apply DB --env staging --remote",
    "db:migrate:remote": "wrangler d1 migrations apply DB --remote",
    "db:studio": "drizzle-kit studio"
  }
}
```

## 7. Set Up TypeScript Bindings

In your main entry file (e.g., `src/index.tsx`), define the Bindings type:

```typescript
import { Hono } from "hono";

export type Bindings = {
  DB: D1Database;
  // Add other bindings here (R2, KV, secrets, etc.)
};

const app = new Hono<{ Bindings: Bindings }>();

export default app;
```

## 8. Initialize Database Client

Create the Drizzle client from the D1 binding in each function that needs database access:

```typescript
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { Context } from "hono";
import { usersTable } from "../db/schema";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export async function findUserById<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
) {
  const db = drizzle(c.env.DB);
  return db.select().from(usersTable).where(eq(usersTable.id, userId)).get();
}
```

## 9. Query Examples

### SELECT Queries

```typescript
import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc, isNotNull } from "drizzle-orm";

// Single result
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.id, 1))
  .get(); // Returns single row or undefined

// Multiple results
const users = await db
  .select()
  .from(usersTable)
  .where(isNotNull(usersTable.email))
  .orderBy(desc(usersTable.createdAt))
  .all(); // Returns array

// Select specific columns
const emails = await db
  .select({ email: usersTable.email })
  .from(usersTable)
  .all();
```

### INSERT Queries

```typescript
// Insert and return the created row
const newUser = await db
  .insert(usersTable)
  .values({
    name: "John Doe",
    email: "john@example.com",
  })
  .returning()
  .get();

// Insert multiple rows
await db
  .insert(usersTable)
  .values([
    { name: "User 1", email: "user1@example.com" },
    { name: "User 2", email: "user2@example.com" },
  ])
  .run();
```

### UPDATE Queries

```typescript
// Update and return affected rows
const updated = await db
  .update(usersTable)
  .set({
    name: "Jane Doe",
    updatedAt: new Date(),
  })
  .where(eq(usersTable.id, 1))
  .returning()
  .get();

// Update without returning (use .run())
await db
  .update(usersTable)
  .set({ name: "Updated Name" })
  .where(eq(usersTable.email, "john@example.com"))
  .run();
```

### DELETE Queries

```typescript
await db.delete(usersTable).where(eq(usersTable.id, 1)).run();
```

### JOIN Queries

```typescript
// Explicit JOIN
const postsWithUsers = await db
  .select({
    postId: postsTable.id,
    postTitle: postsTable.title,
    userName: usersTable.name,
  })
  .from(postsTable)
  .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
  .all();

// Relational query (requires schema import)
import * as schema from "../db/schema";

const db = drizzle(c.env.DB, { schema });

const postWithUser = await db.query.postsTable.findFirst({
  where: eq(postsTable.id, 1),
  with: {
    user: true, // Automatically joins via relations
  },
});
```

### Query Execution Methods

| Method               | Use Case                                | Returns               |
| -------------------- | --------------------------------------- | --------------------- |
| `.get()`             | Single row expected                     | Row or `undefined`    |
| `.all()`             | Multiple rows expected                  | Array (empty if none) |
| `.run()`             | No return needed (mutations)            | Execution result      |
| `.returning().get()` | Insert/update with single row return    | Inserted/updated row  |
| `.returning().all()` | Insert/update with multiple rows return | Array of rows         |

## 10. Migration Workflow

### Initial Setup

```bash
# Generate initial migration
npm run db:generate

# Apply to local development database
npm run db:migrate:local
```

### Making Schema Changes

1. **Modify the schema** in `src/db/schema.ts`

2. **Generate migration:**

   ```bash
   npm run db:generate
   ```

   This creates a new SQL file in `drizzle/` (e.g., `0001_cool_name.sql`)

3. **Review the generated SQL** in `drizzle/XXXX_name.sql`

4. **Apply locally:**

   ```bash
   npm run db:migrate:local
   ```

5. **Test your changes locally**

6. **Deploy to staging:**

   ```bash
   npm run db:migrate:staging
   npm run deploy:staging
   ```

7. **Deploy to production:**
   ```bash
   npm run db:migrate:remote
   npm run deploy
   ```

### Debugging with Drizzle Studio

```bash
npm run db:studio
```

Opens a web UI to browse and edit your local database.

### Direct SQL Queries

For quick queries during development:

```bash
# Local database
npx wrangler d1 execute DB --local --command "SELECT * FROM users LIMIT 5"

# Remote database
npx wrangler d1 execute DB --remote --command "SELECT * FROM users LIMIT 5"
```

## Common Patterns

### Model Layer Structure

Organize database access in model files:

```typescript
// src/models/user.ts
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { Context } from "hono";
import { usersTable, User, NewUser } from "../db/schema";

type DatabaseContext = { Bindings: { DB: D1Database } };

export async function findUserById<Env extends DatabaseContext>(
  c: Context<Env>,
  id: number,
): Promise<User | undefined> {
  const db = drizzle(c.env.DB);
  return db.select().from(usersTable).where(eq(usersTable.id, id)).get();
}

export async function createUser<Env extends DatabaseContext>(
  c: Context<Env>,
  data: NewUser,
): Promise<User> {
  const db = drizzle(c.env.DB);
  return db.insert(usersTable).values(data).returning().get();
}

export async function updateUser<Env extends DatabaseContext>(
  c: Context<Env>,
  id: number,
  data: Partial<NewUser>,
): Promise<User | undefined> {
  const db = drizzle(c.env.DB);
  return db
    .update(usersTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning()
    .get();
}
```

### Using Models in Routes

```typescript
// src/routes/users.tsx
import { Hono } from "hono";
import { Bindings } from "../index";
import { findUserById, createUser } from "../models/user";

export const usersRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const user = await findUserById(c, id);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
  })
  .post("/", async (c) => {
    const body = await c.req.json();
    const user = await createUser(c, body);
    return c.json(user, 201);
  });
```
