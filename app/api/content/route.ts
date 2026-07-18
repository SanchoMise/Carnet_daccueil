import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminRequest } from '@/lib/adminAuth';
import { Lang } from '@/lib/types';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('content').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

type ContentPayload = {
  section: string;
  key: string;
  lang: Lang;
  value: string;
};

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { items: ContentPayload[] };

  if (!body.items || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('content')
    .upsert(
      body.items.map((item) => ({ ...item, updated_at: new Date().toISOString() })),
      { onConflict: 'section,key,lang' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
