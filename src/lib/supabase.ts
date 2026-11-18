import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  subject: string | null;
  due_date: string | null;
  priority: Priority;
  completed: boolean;
  created_at: string;
}
