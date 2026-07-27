# Carnet d'accueil — contexte projet

Carnet d'accueil web trilingue (FR/EN/ES) pour un appartement HomeExchange
(6 passage Rauch, 75011 Paris). Next.js 14 (App Router) + Supabase + Vercel.

- **Repo GitHub** : `SanchoMise/Carnet_daccueil` — déploie automatiquement sur Vercel à chaque `git push origin main`.
- **Site public** : https://carnet-daccueil.vercel.app
- **Admin** : `/admin?key=ADMIN_KEY` (voir `.env.local`, jamais commité)

## Démarrage rapide (nouvelle session / nouvelle machine)

```bash
npm install
cp .env.local.example .env.local   # puis remplir avec les vraies valeurs (jamais dans git)
npm run dev
```

`.env.local` n'est **pas** dans git (secrets). À transférer manuellement entre machines
(ex. AirDrop), jamais coller son contenu dans le chat.

## Stack & architecture

- Next.js 14 App Router, TypeScript, Tailwind. Déployé sur Vercel, connecté à GitHub (push = deploy).
- Supabase : Postgres (tables `content`, `places`, `images`) + Storage (bucket public `welcome-book`).
- `middleware.ts` protège `/admin*` : vérifie `?key=` contre `ADMIN_KEY`, sinon 404.
- `lib/sections.ts` est la **source de vérité unique** de la structure du carnet (liste des
  rubriques et de leurs sous-parties/champs). Ajouter une rubrique = éditer ce fichier
  (pas de gestion dynamique côté admin actuellement — voir "Limites connues").
- `components/VisitorApp.tsx` : rendu public, un composant `*Body` par rubrique (certaines
  génériques comme `GenericBody`/`SimpleBody`, d'autres sur-mesure comme `CuisineBody`).
- `components/AdminApp.tsx` : formulaires d'édition, un par rubrique, générés depuis
  `lib/sections.ts`. Upload d'images avec sous-partie cible + légende.

## Contenu (table `content`)

- Clé unique `(section, key, lang)`. `lang` toujours `'fr'|'en'|'es'`.
- Champs `translatable: false` (codes, horaires, tel) : stockés une seule fois en `fr`,
  réutilisés pour toutes les langues (voir `lib/contentValue.ts`).
- **Traduction auto** : l'admin ne saisit que le français. À l'enregistrement,
  `app/api/translate/route.ts` traduit via l'API gratuite MyMemory (pas de clé, découpage
  en chunks <500 caractères car c'est la limite de l'API).

## Photos (table `images`)

- Chaque photo est rattachée à une **sous-partie précise** via `field_key` (colonne nullable,
  correspond à une `key` de `lib/sections.ts`). Pas de photo "générale" au niveau section —
  option retirée intentionnellement (elle ne s'affichait nulle part côté visiteur).
- S'affichent après le texte de leur sous-partie, avec légende éditable en `text-xs`
  (sauvegarde auto ~700ms après la dernière frappe, voir `CaptionInput` dans `AdminApp.tsx`).

## Bons plans (table `places`)

- Recherche d'adresse dans l'admin via OpenStreetMap/Nominatim (`app/api/geocode/route.ts`,
  gratuit, sans clé — respecter le rate-limit et le User-Agent requis par leur politique d'usage).
- Distance à pied calculée par vol d'oiseau + facteur de détour urbain (`lib/geo.ts`,
  coordonnées de l'appart en dur), pas d'API de routing payante.
- Lien Google Maps généré en recherche texte `"nom + adresse"` (pas de coordonnées brutes :
  ça n'ouvre qu'un pin sans fiche commerce).

## Migrations Supabase — point de friction connu

Je n'ai **pas d'accès DDL** à Supabase (pas d'`ALTER TABLE`/`CREATE POLICY` via l'API REST).
Toute modification de schéma nécessite que l'utilisateur exécute `supabase/schema.sql`
manuellement dans le SQL Editor. Ce fichier est idempotent (safe à rejouer).

En revanche, j'ai la `SUPABASE_SERVICE_ROLE_KEY` en local (`.env.local`) et peux insérer/modifier
du **contenu** directement via l'API REST Supabase (curl) sans passer par l'admin UI ni demander
à l'utilisateur de lancer du SQL — c'est la méthode à privilégier pour peupler du contenu.
`supabase/seed.sql` existe mais l'utilisateur préfère que j'agisse directement par API.

**Avant toute migration de colonne** : vérifier son existence réelle via un `select` REST
avant de supposer qu'une migration précédemment demandée a été appliquée.

## Pièges déjà rencontrés (pour ne pas les refaire)

- **Collision de clé React** : deux composants frères sous le même parent avec la même
  valeur de `key` → React n'en démonte qu'un, l'autre reste affiché en double. Toujours
  préfixer les clés (`content-${id}`, `images-${id}`) quand plusieurs composants partagent
  un même identifiant de section.
- **State non réinitialisé en changeant de section admin** : sans `key` sur un composant
  dont le state dépend de la section active, React réutilise l'instance et garde l'ancien
  state (ex. `targetField` d'upload d'image resté sur la valeur de la rubrique précédente).
- Les échecs de sauvegarde (colonne manquante, etc.) doivent **toujours** remonter un message
  d'erreur visible (`flash(msg, true)`), jamais échouer silencieusement.
- Le panneau de navigateur de test a un bug connu : viewport parfois bloqué à 0×0, et les
  captures d'écran peuvent être blanches après un `scrollIntoView`. Fiabiliser via le DOM/JS
  (`getBoundingClientRect`, lecture directe des valeurs) plutôt que de se fier aux screenshots
  dans ces cas.

## Préférences de l'utilisateur

- Ne pas afficher de secrets (clés API, `.env.local`) dans le chat, même partiellement —
  proposer un fichier à copier/AirDrop à la place.
- Toujours committer + pousser après une modif validée (l'utilisateur ne relance pas le
  déploiement lui-même).
- Préfère que j'agisse directement en base via l'API plutôt que de lui fournir du SQL à copier-coller,
  sauf pour les vraies migrations de schéma (inévitables).
- Sessions Claude Code très longues à éviter : repartir d'une conversation neuve régulièrement,
  et utiliser Sonnet plutôt qu'Opus pour les modifications courantes (économie de contexte/coût).
