/*
# Create tasks table for Student Task Manager

1. New Tables
- `tasks`
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null) — the task description
  - `subject` (text) — optional subject/category label
  - `due_date` (date) — optional due date
  - `completed` (boolean, default false) — whether the task is done
  - `created_at` (timestamp, default now) — when the task was added

2. Security
- Enable RLS on `tasks`.
- Grant SELECT, INSERT, UPDATE, DELETE to `anon` and `authenticated` so the app (which has no sign-in) can read and write through the Data API.
- Allow full CRUD to `anon` + `authenticated` with `USING (true)` / `WITH CHECK (true)` because this is a single-tenant, intentionally shared task list (no accounts).

3. Notes
- No sign-in is required; the whole app shares one task list.
- Migration is idempotent (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text,
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE
  TO anon, authenticated USING (true);
