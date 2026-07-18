-- Contenu initial du carnet d'accueil (FR uniquement — EN/ES à compléter via /admin).
-- À exécuter après supabase/schema.sql. Idempotent : peut être rejoué sans dupliquer.

-- ── ARRIVÉE & DÉPART ──────────────────────────────────────────────
insert into content (section, key, lang, value) values
  ('arrivee', 'key_warning', 'fr', 'Les clés servent à ouvrir toutes les portes. Si vous les oubliez, vous ne pourrez plus rentrer.'),
  ('arrivee', 'doors_note', 'fr', E'1ère porte (dans la rue) : badge Vigik sur le trousseau de clés, ou sonnez à « Sandrez Larbouillat » si quelqu\'un est à l\'appartement.\n2ème porte (dans le hall) : code ci-dessous.\n3ème porte : accès à l\'appartement.'),
  ('arrivee', 'digicode', 'fr', '7926'),
  ('arrivee', 'entrance_note', 'fr', 'Badge Vigik sur le trousseau, ou interphone « Sandrez Larbouillat ».')
on conflict (section, key, lang) do update set value = excluded.value, updated_at = now();

-- ── WIFI & ÉQUIPEMENTS ────────────────────────────────────────────
insert into content (section, key, lang, value) values
  ('wifi', 'lights_fans_note', 'fr', E'Pour allumer les lumières des pièces équipées d\'un ventilateur de plafond (entrée et chambres), utilisez la télécommande murale et appuyez sur l\'icône ampoule ; ré-appuyez pour éteindre.\nPour le ventilateur, appuyez sur 1, 2 ou 3 selon l\'intensité souhaitée, puis sur l\'icône d\'arrêt pour l\'éteindre.\nMerci de tout couper (lumière et ventilation) en quittant la pièce ou l\'appartement : ce sont des ventilateurs, pas des climatiseurs, inutile de les laisser tourner.'),
  ('wifi', 'tv_note', 'fr', E'Nous avons un vidéoprojecteur, installé dans le meuble gris au-dessus du canapé (pensez à fermer les volets ou à projeter le soir).\nAllumez-le en appuyant sur le côté, puis avec la petite télécommande (1) — visez bien le vidéoprojecteur — sélectionnez Menu > HDMI, puis coupez le son.\nUtilisez ensuite la grande télécommande (2) pour passer en mode TV et choisir votre programme : le son sortira de la barre de son.')
on conflict (section, key, lang) do update set value = excluded.value, updated_at = now();

-- ── CUISINE ───────────────────────────────────────────────────────
insert into content (section, key, lang, value) values
  ('cuisine', 'equipment_note', 'fr', 'Micro-ondes, four et plaque à induction sont à votre disposition.'),
  ('cuisine', 'induction_note', 'fr', E'Vous pouvez utiliser les 3 feux de la plaque à induction. Attention, le « P » est un booster très puissant : restez à proximité de la plaque lorsqu\'il est activé.\nMerci d\'utiliser des cuillères en bois lors de la cuisson (pas de fourchette ni d\'ustensile métallique) pour ne pas abîmer les poêles.'),
  ('cuisine', 'dishwasher_note', 'fr', E'Appuyez sur ON/OFF, choisissez le programme « intensif » puis lancez. C\'est un cycle long (environ 3h30) mais c\'est le seul qui lave vraiment bien — les autres programmes sont peu efficaces.\nLes tablettes sont rangées dans le meuble à droite de l\'évier, en bas.'),
  ('cuisine', 'coffee_note', 'fr', E'Allumez la machine à café en appuyant sur le bouton du haut, puis laissez-la se lancer : elle va faire couler un peu d\'eau dans le petit bol.\nPlacez ensuite votre tasse et choisissez le programme : café court, 2 cafés courts (dans une tasse ou 2 en simultané), café long, ou 2 cafés longs en simultané.\nPour l\'éteindre, replacez le bol vide et appuyez sur le bouton du haut : la machine fait couler un peu d\'eau puis s\'éteint.'),
  ('cuisine', 'sink_note', 'fr', 'Le liquide vaisselle se trouve dans le flacon transparent, sous l''évier. Pour vous laver les mains, utilisez la savonnette à côté de l''évier.'),
  ('cuisine', 'bins_location', 'fr', E'Un vide-ordures est disponible sur le palier, dans les escaliers (pour de petites quantités uniquement). Sinon, descendez au -1 (à pied ou en ascenseur) : vous y trouverez la poubelle jaune, la poubelle classique et la poubelle à verre.\nNous trions nos déchets : poubelles jaune, classique et verre se jettent directement dans l\'immeuble. Pour le compost, direction les bornes collectives en ville — par exemple près du métro Voltaire, place du Manège.')
on conflict (section, key, lang) do update set value = excluded.value, updated_at = now();

-- ── URGENCES & CONTACTS ───────────────────────────────────────────
insert into content (section, key, lang, value) values
  ('urgences', 'electrical_note', 'fr', 'Si les plombs sautent, le tableau électrique se trouve dans le couloir menant aux chambres, sur la droite.')
on conflict (section, key, lang) do update set value = excluded.value, updated_at = now();

-- ── CHECKLIST DÉPART ──────────────────────────────────────────────
insert into content (section, key, lang, value) values
  ('checklist', 'cleaning_note', 'fr', 'Un aspirateur balai Dyson est à votre disposition pour l''entretien quotidien.')
on conflict (section, key, lang) do update set value = excluded.value, updated_at = now();

-- ── BONS PLANS DU QUARTIER ────────────────────────────────────────
insert into places (name, category, description_fr, address, walk_minutes, position)
select * from (values
  ('Boulangerie de dépannage', 'Boulangerie', 'À l''angle de la rue de Charonne et de la rue Basfroi, la plus proche de l''appartement. Baguette tradition correcte.', 'Angle rue de Charonne / rue Basfroi', 1, 1),
  ('Façon', 'Boulangerie', 'Vers le métro Charonne, à l''angle avec la rue Ledru-Rollin. Bon pain, bonnes viennoiseries et bonne pâtisserie — coup de cœur pour le flan.', 'Rue Ledru-Rollin, vers métro Charonne', 3, 2),
  ('Magali', 'Boulangerie', 'Autre bonne boulangerie du quartier.', null, 5, 3),
  ('Lendemain', 'Boulangerie', 'Autre bonne boulangerie du quartier.', null, 5, 4),
  ('Brutus', 'Boulangerie', 'Autre bonne boulangerie du quartier — coup de cœur pour la tartelette au chocolat.', null, 5, 5),
  ('La Main Verte', 'Primeur', 'Bons fruits et légumes, au bout de la rue Basfroi.', 'Rue Basfroi', 2, 6),
  ('Tapisserie', 'Pâtisserie', 'Excellentes pâtisseries, de la même maison que le restaurant étoilé Le Septime. Coup de cœur pour le chou à la flouve.', 'Rue de Charonne', null, 7),
  ('Paris Hanoï', 'Restaurant', 'Restaurant vietnamien, rue de Charonne.', 'Rue de Charonne', null, 8),
  ('Napoli Gang', 'Restaurant', 'Pizzas idéales à commander et à déguster à la maison.', 'Rue de Charonne', null, 9),
  ('Rue de la Roquette & Faubourg Saint-Antoine', 'Quartier', 'De nombreux restaurants — l''embarras du choix.', null, null, 10),
  ('Quartier Cyril Lignac', 'Quartier', 'Restaurant, boulangerie et chocolaterie du chef.', null, 5, 11),
  ('Square Raoul Nordling', 'Parc', 'Espace de jeux pour petits et grands, bancs pour les adultes.', 'Rue Saint-Bernard', 2, 12),
  ('Jardin de la Folie-Titon', 'Parc', 'Bac à sable, toboggan et pelouse pour pique-niquer ou se détendre, quartier Lignac.', null, 5, 13),
  ('Autres parcs du quartier', 'Parc', 'Plusieurs autres parcs à 5-10 minutes à pied.', null, null, 14),
  ('Monoprix Voltaire', 'Supermarché', 'Ouvert jusqu''à 21h (métro Voltaire).', '166 avenue Ledru-Rollin, 75011 Paris', 8, 15),
  ('Monoprix Faubourg Saint-Antoine', 'Supermarché', 'Ouvert jusqu''à 21h (métro Ledru-Rollin).', '99 rue du Faubourg Saint-Antoine, 75011 Paris', 8, 16)
) as v(name, category, description_fr, address, walk_minutes, position)
where not exists (select 1 from places p where p.name = v.name);

-- Backfill pour les bases où ces adresses avaient déjà été semées avant
-- l'ajout de la colonne walk_minutes (idempotent, sans dupliquer de lignes).
update places set walk_minutes = 1 where name = 'Boulangerie de dépannage' and walk_minutes is null;
update places set walk_minutes = 3 where name = 'Façon' and walk_minutes is null;
update places set walk_minutes = 5 where name in ('Magali', 'Lendemain', 'Brutus', 'Quartier Cyril Lignac', 'Jardin de la Folie-Titon') and walk_minutes is null;
update places set walk_minutes = 2 where name in ('La Main Verte', 'Square Raoul Nordling') and walk_minutes is null;
update places set walk_minutes = 8 where name in ('Monoprix Voltaire', 'Monoprix Faubourg Saint-Antoine') and walk_minutes is null;

-- Pas de maps_url ici : le carnet génère automatiquement le lien Google Maps
-- à partir de l'adresse quand maps_url est vide (voir components/VisitorApp.tsx).
