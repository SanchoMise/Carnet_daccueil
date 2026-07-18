import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get('section');
  const supabase = createAdminClient();

  let query = supabase.from('images').select('*').order('position', { ascending: true });
  if (section) {
    query = query.eq('section', section);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
