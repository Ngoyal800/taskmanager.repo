import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  GraduationCap,
  Loader2,
  AlertCircle,
  ListTodo,
  CheckCheck,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { supabase, type Task } from '@/lib/supabase';

type Filter = 'all' | 'active' | 'done';
type Priority = 'high' | 'medium' | 'low';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'To do' },
  { key: 'done', label: 'Done' },
];

const PRIORITIES: { key: Priority; label: string }[] = [
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const PRIORITY_BADGE: Record<Priority, string> = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-sky-100 text-sky-700',
};

const PRIORITY_ACCENT: Record<Priority, string> = {
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-sky-400',
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data ?? []);
    } catch {
      setError('Could not load your tasks. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: trimmed,
          subject: subject.trim() || null,
          due_date: dueDate || null,
          priority,
        })
        .select()
        .single();

      if (error || !data) throw error;

      setTasks((prev) => [data, ...prev]);
      setTitle('');
      setSubject('');
      setDueDate('');
      setPriority('medium');
    } catch {
      setError('Could not add the task. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    const next = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: next } : t))
    );
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: next })
        .eq('id', task.id);

      if (error) throw error;
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
      setError('Could not update the task. Please try again.');
    }
  }

  async function deleteTask(task: Task) {
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);

      if (error) throw error;
    } catch {
      setTasks(snapshot);
      setError('Could not delete the task. Please try again.');
    }
  }

  const visible = useMemo(
    () =>
      tasks
        .filter((t) =>
          filter === 'all' ? true : filter === 'done' ? t.completed : !t.completed
        )
        .sort(
          (a, b) =>
            PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
            b.created_at.localeCompare(a.created_at)
        ),
    [tasks, filter]
  );

  const activeCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.length - activeCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-violet-950 tracking-tight">
            Student Task Manager
          </h1>
          <p className="mt-2 text-violet-600">
            Keep track of homework and stay on top of your studies.
          </p>
        </header>

        <form
          onSubmit={addTask}
          className="bg-white rounded-2xl shadow-sm ring-1 ring-violet-100 p-5 sm:p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="flex-1 rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3 text-violet-950 placeholder-violet-300 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200"
            />
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Add Task
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (optional)"
              className="rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-2.5 text-sm text-violet-950 placeholder-violet-300 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200"
            />
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-300" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-violet-200 bg-violet-50/50 pl-10 pr-4 py-2.5 text-sm text-violet-950 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-200"
              />
            </div>
            <div className="inline-flex rounded-xl border border-violet-200 bg-violet-50/50 p-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPriority(p.key)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    priority === p.key
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-violet-600 hover:bg-violet-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 mb-4 text-sm text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex rounded-xl bg-white ring-1 ring-violet-100 p-1 shadow-sm">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  filter === f.key
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-violet-600 hover:bg-violet-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-violet-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {activeCount} to do · {doneCount} done
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-violet-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading tasks...
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-violet-100 py-14 text-center shadow-sm">
            <ListTodo className="w-10 h-10 mx-auto text-violet-200 mb-3" />
            <p className="text-violet-500 font-medium">
              {filter === 'all'
                ? 'No tasks yet — add your first one above!'
                : filter === 'active'
                  ? 'Nothing left to do. Great job!'
                  : 'No completed tasks yet.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((task) => (
              <li
                key={task.id}
                className="group relative flex items-start gap-3 overflow-hidden rounded-2xl bg-white ring-1 ring-violet-100 p-4 pl-5 shadow-sm transition hover:ring-violet-200 hover:shadow"
              >
                <span
                  className={`absolute left-0 top-0 h-full w-1.5 ${
                    PRIORITY_ACCENT[task.priority]
                  }`}
                />
                <button
                  onClick={() => toggleTask(task)}
                  aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
                  className="mt-0.5 shrink-0 text-violet-300 transition hover:text-violet-500 active:scale-90"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium leading-snug transition ${
                      task.completed
                        ? 'text-violet-300 line-through'
                        : 'text-violet-950'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${
                        PRIORITY_BADGE[task.priority]
                      }`}
                    >
                      {task.priority} priority
                    </span>
                    {task.subject && (
                      <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 font-medium text-violet-700">
                        {task.subject}
                      </span>
                    )}
                    {task.due_date && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${
                          !task.completed && task.due_date < today()
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task)}
                  aria-label="Delete task"
                  className="shrink-0 rounded-lg p-2 text-violet-300 transition hover:bg-rose-50 hover:text-rose-500 active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {doneCount > 0 && filter === 'done' && (
          <p className="mt-6 text-center text-sm text-violet-500 flex items-center justify-center gap-1.5">
            <CheckCheck className="w-4 h-4" />
            {doneCount} task{doneCount > 1 ? 's' : ''} completed. Keep it up!
          </p>
        )}
      </div>
    </div>
  );
}

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDate(date: string) {
  const [y, m, day] = date.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
