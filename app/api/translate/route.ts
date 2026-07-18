import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

type TranslateItem = { text: string; target: 'en' | 'es' };

async function translateOne(text: string, target: 'en' | 'es'): Promise<string> {
  if (!text.trim()) return '';

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|${target}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const json = await res.json();
    const translated = json?.responseData?.translatedText;
    // MyMemory returns an English warning string instead of an error when the free daily quota is hit.
    if (!translated || /MYMEMORY WARNING/i.test(translated)) return text;
    return translated;
  } catch {
    return text;
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { items: TranslateItem[] };
  if (!body.items || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const results = await Promise.all(body.items.map((i) => translateOne(i.text, i.target)));
  return NextResponse.json({ results });
}
