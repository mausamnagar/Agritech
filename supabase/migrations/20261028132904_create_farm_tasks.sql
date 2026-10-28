/*
# Create shared farm task list

1. New Tables
- `farm_tasks`
- `id` (uuid, primary key)
- `title` (text, task description)
- `category` (text, operational grouping)
- `due_label` (text, human-readable timing label)
- `priority` (text, low/medium/high urgency)
- `completed` (boolean, completion state)
- `created_at` (timestamp, creation time)

2. Security
- Row level security is enabled.
- Anonymous and authenticated roles can read and manage the intentionally shared single-farm task list.
- CRUD grants are limited to the verbs used by the dashboard.

3. Notes
- This app does not include sign-in, so the dashboard uses a single shared workspace.
- Seed tasks provide a useful first-run experience and are inserted only when absent.
*/

CREATE TABLE IF NOT EXISTS public.farm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  due_label text NOT NULL DEFAULT 'Today',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.farm_tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_tasks TO anon, authenticated;

DROP POLICY IF EXISTS "Shared farm tasks can be read" ON public.farm_tasks;
CREATE POLICY "Shared farm tasks can be read" ON public.farm_tasks FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Shared farm tasks can be created" ON public.farm_tasks;
CREATE POLICY "Shared farm tasks can be created" ON public.farm_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Shared farm tasks can be updated" ON public.farm_tasks;
CREATE POLICY "Shared farm tasks can be updated" ON public.farm_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Shared farm tasks can be deleted" ON public.farm_tasks;
CREATE POLICY "Shared farm tasks can be deleted" ON public.farm_tasks FOR DELETE TO anon, authenticated USING (true);

INSERT INTO public.farm_tasks (title, category, due_label, priority)
SELECT seed.title, seed.category, seed.due_label, seed.priority
FROM (VALUES
  ('Inspect irrigation lines', 'Irrigation', 'Today · 10:00 AM', 'high'),
  ('Apply organic fertilizer to North Field', 'Crop care', 'Tomorrow', 'medium'),
  ('Review pest monitoring traps', 'Crop health', 'Friday', 'low')
) AS seed(title, category, due_label, priority)
WHERE NOT EXISTS (SELECT 1 FROM public.farm_tasks);
