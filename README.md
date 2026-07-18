# Carnet d'accueil

Carnet d'accueil web trilingue (FR/EN/ES) pour appartement HomeExchange, avec back-office
d'édition sans authentification (clé secrète en query param).

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (Postgres + Storage)
- Tailwind CSS
- Déploiement Vercel

## Setup

### 1. Dépendances

```bash
npm install
```

### 2. Base de données Supabase

Dans le dashboard Supabase → SQL Editor, exécuter le contenu de
[`supabase/schema.sql`](supabase/schema.sql). Cela crée :

- les tables `content`, `places`, `images` (+ RLS lecture publique)
- le bucket Storage public `welcome-book`

Puis exécuter [`supabase/seed.sql`](supabase/seed.sql) pour préremplir le carnet avec le contenu
déjà rédigé (arrivée, cuisine, urgences, bons plans du quartier — en français uniquement ; les
traductions EN/ES restent à ajouter via `/admin`). Ce script est idempotent, il peut être rejoué.

### 3. Variables d'environnement

Copier `.env.local.example` vers `.env.local` et renseigner :

```
NEXT_PUBLIC_SUPABASE_URL=https://cgnrslxnbwnkxukebhdm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_KEY=...
```

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` : dashboard Supabase → Project Settings → API.
- `ADMIN_KEY` : choisissez une chaîne aléatoire longue (ex: `openssl rand -hex 24`). C'est la clé
  à mettre dans l'URL `/admin?key=...`.

Sur Vercel, renseigner ces mêmes variables dans Project Settings → Environment Variables.

### 4. Lancer en local

```bash
npm run dev
```

- Carnet visiteur : http://localhost:3000
- Admin : http://localhost:3000/admin?key=VOTRE_ADMIN_KEY (toute clé absente ou incorrecte renvoie une 404)

## Structure

- `app/page.tsx` — page visiteur, fetch Supabase côté serveur, rendu par `components/VisitorApp.tsx`
- `app/admin/page.tsx` — page admin (protégée par `middleware.ts`), édition via `components/AdminApp.tsx`
- `app/api/content`, `app/api/places`, `app/api/places/[id]`, `app/api/upload`, `app/api/images` — routes API
- `lib/sections.ts` — structure fixe des 8 rubriques, champs éditables et libellés d'interface (FR/EN/ES, non traduits en base)
- `lib/supabase/{client,server,admin}.ts` — clients Supabase (navigateur, server component, service role pour les routes API)
- `supabase/schema.sql` — schéma des tables + policies RLS + bucket Storage

## Rubriques

1. Arrivée & départ (digicode, étage, horaires)
2. Wifi & équipements (connexion 1 clic, appareils)
3. Cuisine (équipements, tri sélectif jaune/vert/gris)
4. Règles du logement
5. Transports
6. Bons plans du quartier (table `places`, avec lien Google Maps auto-généré si non fourni)
7. Urgences & contacts (liens `tel:`)
8. Checklist départ (état non persisté, remis à zéro à chaque visite)

## Déploiement Vercel

```bash
vercel
```

Renseigner les 4 variables d'environnement dans le dashboard Vercel avant le premier déploiement.
