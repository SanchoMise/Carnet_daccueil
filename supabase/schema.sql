-- Carnet d'accueil — schéma Supabase
-- À exécuter dans l'éditeur SQL du dashboard Supabase.

create extension if not exists pgcrypto;

create table if not exists content (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  key text not null,
  lang text not null check (lang in ('fr','en','es')),
  value text,
  updated_at timestamptz default now(),
  unique(section, key, lang)
);

create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description_fr text,
  description_en text,
  description_es text,
  address text,
  maps_url text,
  walk_minutes integer,
  position integer default 0,
  created_at timestamptz default now()
);

-- Migration : ajoute la colonne si la table "places" existe déjà sans elle.
alter table places add column if not exists walk_minutes integer;

create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  url text not null,
  caption text,
  position integer default 0,
  created_at timestamptz default now()
);

-- Row Level Security: lecture publique (le carnet est visible sans auth),
-- écriture réservée aux routes API qui utilisent la service role key
-- (celle-ci bypass RLS, donc aucune policy d'écriture n'est nécessaire ici).

alter table content enable row level security;
alter table places enable row level security;
alter table images enable row level security;

create policy "Public read content" on content for select using (true);
create policy "Public read places" on places for select using (true);
create policy "Public read images" on images for select using (true);

-- Storage: bucket public pour les images du carnet.
insert into storage.buckets (id, name, public)
values ('welcome-book', 'welcome-book', true)
on conflict (id) do nothing;

create policy "Public read welcome-book bucket"
on storage.objects for select
using (bucket_id = 'welcome-book');
