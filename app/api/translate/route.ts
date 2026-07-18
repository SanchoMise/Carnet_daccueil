import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

type TranslateItem = { text: string; target: 'en' | 'es' };

// MyMemory's free tier rejects any single query over 500 characters.
const MAX_CHUNK_LEN = 450;

/**
 * Splits text into chunks under MAX_CHUNK_LEN, preferring paragraph (\n) then
 * sentence (". ") boundaries so translation quality stays as good as a single call.
 */
function chunkText(text: string): string[] {
  const paragraphs = text.split('\n');
  const chunks: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= MAX_CHUNK_LEN) {
      chunks.push(paragraph);
      continue;
    }

    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    let current = '';
    for (const sentence of sentences) {
      const candidate = current ? `${current} ${sentence}` : sentence;
      if (candidate.length > MAX_CHUNK_LEN && current) {
        chunks.push(current);
        current = sentence;
      } else {
        current = candidate;
      }
    }
    if (current) chunks.push(current);
  }

  return chunks;
}

async function translateChunk(text: string, target: 'en' | 'es'): Promise<string> {
  if (!text.trim()) return text;

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

async function translateOne(text: string, target: 'en' | 'es'): Promise<string> {
  if (!text.trim()) return '';

  if (text.length <= MAX_CHUNK_LEN) {
    return translateChunk(text, target);
  }

  // Preserve paragraph breaks: translate each line's chunks, then rejoin lines with \n.
  const lineChunks = text.split('\n').map((line) => (line.length <= MAX_CHUNK_LEN ? [line] : chunkText(line)));
  const translatedLines = await Promise.all(
    lineChunks.map(async (chunks) => {
      const translated = await Promise.all(chunks.map((c) => translateChunk(c, target)));
      return translated.join(' ');
    })
  );
  return translatedLines.join('\n');
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
