# Migration history (frozen)

The numbered `.sql` files in this directory document schema changes made
between the initial schema and migration 009. They are kept for historical
reference only - **do not add new files here.**

## Current pattern

1. New tables go in `database/schema.sql` (`CREATE TABLE IF NOT EXISTS ...`).
   `npm run setup-db` creates any tables that don't exist yet.
2. New columns or indexes on existing tables go in
   `lib/schema-migrations.ts` as idempotent
   `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`
   statements.
3. `ensureSchema()` (`lib/db.ts`) runs every statement in
   `lib/schema-migrations.ts` before each repo sync, so the live database
   self-heals automatically - no separate deploy step or script run is
   required.
4. To apply schema changes immediately (without waiting for a sync), run
   `npm run migrate`.

This replaced a sprawl of one-off `scripts/add-*.ts` / `scripts/migrate-*.ts`
files and unauthenticated `/api/add-columns` / `/api/migrate` routes, which
made it easy to ship code depending on a column that was never added to the
production database (e.g. `repos.prs_ready_count`).
