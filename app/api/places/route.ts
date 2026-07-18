import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminRequest } from '@/lib/adminAuth';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const mapsUrl = body.maps_url || (body.address ? `https://maps.google.com/?q=${encodeURIComponent(body.address)}` : null);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('places')
    .insert({
      name: body.name,
      category: body.category ?? null,
      description_fr: body.description_fr ?? null,
      description_en: body.description_en ?? null,
      description_es: body.description_es ?? null,
      address: body.address ?? null,
      maps_url: mapsUrl,
      walk_minutes: body.walk_minutes ?? null,
      position: body.position ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
