import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminRequest } from '@/lib/adminAuth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const mapsUrl = body.maps_url || (body.address ? `https://maps.google.com/?q=${encodeURIComponent(body.address)}` : undefined);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('places')
    .update({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.description_fr !== undefined && { description_fr: body.description_fr }),
      ...(body.description_en !== undefined && { description_en: body.description_en }),
      ...(body.description_es !== undefined && { description_es: body.description_es }),
      ...(body.address !== undefined && { address: body.address }),
      ...(mapsUrl !== undefined && { maps_url: mapsUrl }),
      ...(body.position !== undefined && { position: body.position }),
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('places').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
