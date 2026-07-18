import { ContentMap, Lang, LANGS } from './types';

export function getValue(map: ContentMap, section: string, key: string, lang: Lang, translatable: boolean): string {
  const entry = map[section]?.[key];
  if (!entry) return '';
  if (translatable) return entry[lang] || '';
  for (const l of LANGS) {
    if (entry[l]) return entry[l];
  }
  return '';
}
