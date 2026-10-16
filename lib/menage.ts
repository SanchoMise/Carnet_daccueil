export type TaskGroup = { title: string; tasks: string[] };

/** One task per line; a line starting with "## " opens a new group. */
export function parseTasks(text: string): TaskGroup[] {
  const groups: TaskGroup[] = [];
  let current: TaskGroup | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('## ')) {
      current = { title: line.slice(3).trim(), tasks: [] };
      groups.push(current);
    } else {
      if (!current) {
        current = { title: '', tasks: [] };
        groups.push(current);
      }
      current.tasks.push(line.replace(/^[-•]\s*/, ''));
    }
  }
  return groups;
}

export function allTasks(groups: TaskGroup[]): string[] {
  return groups.flatMap((g) => g.tasks);
}

export function parseDone(raw: string | undefined): string[] {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export const PRESTATION_PREFIX = 'prestation-';
export const MENAGE_SECTION = 'menage-pro';

export function fillTemplate(text: string, vars: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export function formatLongDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d))
  );
}

/** `images.field_key` for photos attached to one checklist task (changes if the task text is edited). */
export const taskImageKey = (task: string) => `task:${task}`;
