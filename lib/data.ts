import { createClient } from '@/lib/supabase/server';
import { ContentMap, ContentRow, ImageRow, PlaceRow, Lang } from '@/lib/types';

export async function fetchContentMap(): Promise<ContentMap> {
  const supabase = createClient();
  const { data } = await supabase.from('content').select('*');
  const rows = (data ?? []) as ContentRow[];

  const map: ContentMap = {};
  for (const row of rows) {
    map[row.section] ??= {};
    map[row.section][row.key] ??= { fr: '', en: '', es: '' } as Record<Lang, string>;
    map[row.section][row.key][row.lang] = row.value ?? '';
  }
  return map;
}

export async function fetchPlaces(): Promise<PlaceRow[]> {
  const supabase = createClient();
  const { data } = await supabase.from('places').select('*').order('position', { ascending: true });
  return (data ?? []) as PlaceRow[];
}

export async function fetchImages(): Promise<ImageRow[]> {
  const supabase = createClient();
  const { data } = await supabase.from('images').select('*').order('position', { ascending: true });
  return (data ?? []) as ImageRow[];
}
