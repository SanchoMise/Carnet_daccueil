type TranslateItem = { text: string; target: 'en' | 'es' };

export async function translateBatch(items: TranslateItem[], adminKey: string): Promise<string[]> {
  if (items.length === 0) return [];

  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) return items.map((i) => i.text);

  const json = await res.json();
  return json.results ?? items.map((i) => i.text);
}
