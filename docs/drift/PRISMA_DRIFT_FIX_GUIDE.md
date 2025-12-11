# Prisma Migration Drift Fix Guide

## What is Migration Drift?

Migration drift occurs when your production database has tables/structures that don't have corresponding migration files in your local `prisma/migrations/` directory. This causes Prisma to refuse applying new migrations.

## Common Causes

- Tables created manually via SQL
- Migrations applied directly to database without being committed to git
- Migration files lost/deleted locally
- Working across multiple environments/developers

---

## ✅ THE SOLUTION: Baseline Migration

### Quick Reference

```bash
# 1. Apply baseline migration to production
npx prisma migrate deploy

# 2. Generate Prisma Client
npx prisma generate

# 3. Verify
npx prisma migrate status
```

### Key Principle

**Always use `npx prisma migrate deploy` for production databases with existing data.**

- ❌ `prisma migrate dev` - Uses shadow database, expects clean slate
- ✅ `prisma migrate deploy` - Applies directly to production, works with existing data

---

## Step-by-Step Solution

### Step 1: Clean Up Migration History (if needed)

If migrations exist in the database but not locally, remove them from Supabase:

```sql
-- Run in Supabase SQL Editor
DELETE FROM "_prisma_migrations"
WHERE migration_name IN (
  'migration_name_1',
  'migration_name_2'
);
```

To find these migrations:

```sql
SELECT migration_name, finished_at
FROM "_prisma_migrations"
ORDER BY finished_at DESC;
```

### Step 2: Create Baseline Migration

Create a migration that includes all existing tables using conditional statements:

```bash
mkdir -p prisma/migrations/YYYYMMDDHHMMSS_baseline_existing_tables
```

In `migration.sql`, use these patterns:

#### Create Enums (with error handling)

```sql
DO $$ BEGIN
    CREATE TYPE "EnumName" AS ENUM ('VALUE1', 'VALUE2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

#### Create Tables (conditional)

```sql
CREATE TABLE IF NOT EXISTS "table_name" (
    "id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "table_name_pkey" PRIMARY KEY ("id")
);
```

#### Create Indexes (conditional)

```sql
CREATE UNIQUE INDEX IF NOT EXISTS "index_name" ON "table_name"("field");
CREATE INDEX IF NOT EXISTS "index_name" ON "table_name"("field");
```

#### Add Foreign Keys (conditional)

```sql
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fkey_name') THEN
        ALTER TABLE "table_name"
        ADD CONSTRAINT "fkey_name"
        FOREIGN KEY ("field")
        REFERENCES "other_table"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END $$;
```

### Step 3: Apply the Baseline Migration

```bash
npx prisma migrate deploy
```

**Important**: Use `deploy`, not `dev`!

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Verify Success

```bash
npx prisma migrate status
```

Expected output: `"Database schema is up to date!"`

---

## Why This Works

✅ **Non-destructive**: `IF NOT EXISTS` clauses skip existing structures  
✅ **Safe for production**: No data loss, only adds metadata  
✅ **Idempotent**: Can run multiple times safely  
✅ **No shadow DB**: `migrate deploy` works directly with production

---

## Troubleshooting

### Still seeing drift after baseline migration?

Check if your schema matches the database:

```bash
npx prisma db pull
```

This generates a schema from your database. Compare it with your current `schema.prisma`.

### Migration fails with constraint errors?

The conditional checks might not be working. Verify constraints don't already exist:

```sql
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conname LIKE '%your_table%';
```

### Can't apply new migrations after baseline?

Ensure the baseline migration ran successfully:

```sql
SELECT * FROM "_prisma_migrations"
WHERE migration_name LIKE '%baseline%';
```

---

## Prevention Tips

1. **Always commit migration files** to git after creating them
2. **Use version control** for all schema changes
3. **Document manual SQL changes** and create corresponding migrations
4. **Sync team regularly** on schema changes
5. **Use `migrate deploy`** for production, `migrate dev` for local development only

---

## Quick Command Reference

```bash
# Check migration status
npx prisma migrate status

# Apply migrations (production)
npx prisma migrate deploy

# Create new migration (development)
npx prisma migrate dev --name migration_name

# Generate Prisma Client
npx prisma generate

# Pull schema from database
npx prisma db pull

# View migrations in database
# Run in Supabase SQL Editor:
SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at DESC;
```
