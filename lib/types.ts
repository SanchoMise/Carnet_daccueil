export type Lang = 'fr' | 'en' | 'es';

export const LANGS: Lang[] = ['fr', 'en', 'es'];

export type ContentRow = {
  id: string;
  section: string;
  key: string;
  lang: Lang;
  value: string | null;
  updated_at: string;
};

export type PlaceRow = {
  id: string;
  name: string;
  category: string | null;
  description_fr: string | null;
  description_en: string | null;
  description_es: string | null;
  address: string | null;
  maps_url: string | null;
  walk_minutes: number | null;
  position: number;
  created_at: string;
};

export type ImageRow = {
  id: string;
  section: string;
  url: string;
  caption: string | null;
  position: number;
  created_at: string;
};

/** section -> key -> lang -> value */
export type ContentMap = Record<string, Record<string, Record<Lang, string>>>;
