import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MENAGE_SECTION, PRESTATION_PREFIX, allTasks, parseDone, parseTasks } from '@/lib/menage';

// Public endpoint used by the cleaner's page: the secret code in the URL is the credential.
export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code;
  if (!/^[a-z0-9]{8,32}$/.test(code)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const section = `${PRESTATION_PREFIX}${code}`;

  const body = (await request.json().catch(() => null)) as { task?: string; checked?: boolean } | null;
  if (!body || typeof body.task !== 'string' || typeof body.checked !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data } = await supabase.from('content').select('section,key,value').in('section', [section, MENAGE_SECTION]);
  const rows = data ?? [];
  const get = (sec: string, key: string) => rows.find((r) => r.section === sec && r.key === key)?.value ?? '';

  if (!rows.some((r) => r.section === section)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const tasks = allTasks(parseTasks(get(MENAGE_SECTION, 'tasks')));
  if (!tasks.includes(body.task)) return NextResponse.json({ error: 'Unknown task' }, { status: 400 });

  const done = new Set(parseDone(get(section, 'done')));
  if (body.checked) done.add(body.task);
  else done.delete(body.task);

  const complete = tasks.length > 0 && tasks.every((t) => done.has(t));
  const now = new Date().toISOString();
  const upserts = [
    { key: 'done', value: JSON.stringify([...done]) },
    { key: 'last_update', value: now },
    { key: 'completed_at', value: complete ? get(section, 'completed_at') || now : '' },
  ].map((r) => ({ section, lang: 'fr', updated_at: now, ...r }));

  const { error } = await supabase.from('content').upsert(upserts, { onConflict: 'section,key,lang' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, done: [...done], complete });
}
