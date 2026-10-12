import { ContentMap, Lang, LANGS } from './types';
import { STAY_SLOTS } from './sections';

export type ActiveStay = { id: string; guests: string; welcome?: Record<Lang, string> };

// stay key -> [section, key] it overrides when non-empty
const OVERRIDES: Record<string, [string, string]> = {
  checkin_time: ['arrivee', 'checkin_time'],
  checkin_note: ['arrivee', 'checkin_note'],
  checkout_time: ['arrivee', 'checkout_time'],
  checkout_note: ['arrivee', 'checkout_note'],
  cleaning_mode: ['menage', 'mode'],
  cleaning_extra: ['menage', 'extra'],
};

const first = (map: ContentMap, section: string, key: string) => {
  const e = map[section]?.[key];
  return e ? e.fr || e.en || e.es || '' : '';
};

function parisNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { date: `${g('year')}-${g('month')}-${g('day')}`, hour: Number(g('hour')) };
}

/** Explicit ?s=<link_code> wins; otherwise the stay covering today (Paris time). On a changeover day, before 14h the departing guests, after the arriving ones. */
export function pickStay(map: ContentMap, param?: string): string | null {
  if (param) {
    const id = STAY_SLOTS.find((s) => {
      const code = first(map, s, 'link_code');
      return code && code === param;
    });
    if (id) return id;
  }
  const { date, hour } = parisNow();
  const active = STAY_SLOTS.filter((id) => {
    const a = first(map, id, 'arrival_date');
    const d = first(map, id, 'departure_date');
    return a && d && a <= date && date <= d;
  }).sort((x, y) => first(map, x, 'arrival_date').localeCompare(first(map, y, 'arrival_date')));
  if (active.length === 0) return null;
  return hour < 14 ? active[0] : active[active.length - 1];
}

export function applyStay(map: ContentMap, id: string | null): { map: ContentMap; stay: ActiveStay | null } {
  if (!id || !map[id]) return { map, stay: null };
  const next: ContentMap = { ...map };
  for (const [k, [sec, key]] of Object.entries(OVERRIDES)) {
    const e = map[id][k];
    if (!e || !(e.fr || e.en || e.es)) continue;
    next[sec] = { ...next[sec], [key]: { ...(next[sec]?.[key] ?? { fr: '', en: '', es: '' }), ...e } as Record<Lang, string> };
    // non-translatable values are stored under fr only: expose them for every language
    const v = e.fr || e.en || e.es;
    if (['checkin_time', 'checkout_time', 'cleaning_mode'].includes(k)) next[sec][key] = Object.fromEntries(LANGS.map((l) => [l, v])) as Record<Lang, string>;
  }
  const guests = first(map, id, 'guests');
  const welcome = map[id].welcome_note;
  return { map: next, stay: { id, guests, welcome } };
}
