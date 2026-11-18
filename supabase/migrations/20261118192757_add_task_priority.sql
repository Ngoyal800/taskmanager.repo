/*
# Add task priority to tasks table

1. Modified Tables
- `tasks`
  - `priority` (text, default 'medium') — task priority: 'high', 'medium', or 'low'.

2. Security
- No changes: RLS policies and existing grants already cover the new column (table-level grants).

3. Notes
- Column is added conditionally so the migration is idempotent and safe to re-run.
- Existing rows get 'medium' priority by default.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tasks'
      AND column_name = 'priority'
  ) THEN
    ALTER TABLE tasks ADD COLUMN priority text NOT NULL DEFAULT 'medium';
  END IF;
END $$;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO anon, authenticated;
