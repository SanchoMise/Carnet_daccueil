import { Lang } from './types';

export type FieldDef = {
  key: string;
  /** true: one value per language. false: single value, reused across languages (codes, times, phone numbers...). */
  translatable: boolean;
  label: Record<Lang, string>;
  type?: 'text' | 'textarea';
};

export type SectionDef = {
  id: string;
  icon: string;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  fields: FieldDef[];
};

export const SECTIONS: SectionDef[] = [
  {
    id: 'arrivee',
    icon: 'door',
    title: { fr: 'Arrivée & départ', en: 'Check-in & check-out', es: 'Llegada & salida' },
    subtitle: { fr: 'Codes, clés, horaires', en: 'Codes, keys, schedule', es: 'Códigos, llaves, horarios' },
    fields: [
      { key: 'key_warning', translatable: true, type: 'textarea', label: { fr: 'Avertissement clés', en: 'Key warning', es: 'Aviso sobre las llaves' } },
      { key: 'doors_note', translatable: true, type: 'textarea', label: { fr: 'Description des 3 portes', en: 'The 3 doors', es: 'Las 3 puertas' } },
      { key: 'digicode', translatable: false, type: 'text', label: { fr: 'Digicode 2ème porte (hall)', en: 'Keypad code (hall door)', es: 'Código de la puerta del hall' } },
      { key: 'entrance_note', translatable: true, type: 'textarea', label: { fr: "Note porte de l'immeuble", en: 'Building entrance note', es: 'Nota de la entrada' } },
      { key: 'apartment_note', translatable: true, type: 'textarea', label: { fr: "Étage / porte de l'appartement", en: 'Floor / apartment door', es: 'Piso / puerta del apartamento' } },
      { key: 'checkin_time', translatable: false, type: 'text', label: { fr: "Heure d'arrivée", en: 'Check-in time', es: 'Hora de llegada' } },
      { key: 'checkin_note', translatable: true, type: 'textarea', label: { fr: "Note arrivée", en: 'Check-in note', es: 'Nota de llegada' } },
      { key: 'checkout_time', translatable: false, type: 'text', label: { fr: 'Heure de départ', en: 'Check-out time', es: 'Hora de salida' } },
      { key: 'checkout_note', translatable: true, type: 'textarea', label: { fr: 'Note départ', en: 'Check-out note', es: 'Nota de salida' } },
    ],
  },
  {
    id: 'wifi',
    icon: 'wifi',
    title: { fr: 'Wifi & équipements', en: 'Wifi & appliances', es: 'Wifi & electrodomésticos' },
    subtitle: { fr: 'Connexion, TV, appareils', en: 'Connection, TV, devices', es: 'Conexión, TV, aparatos' },
    fields: [
      { key: 'wifi_ssid', translatable: false, type: 'text', label: { fr: 'Nom du réseau (SSID)', en: 'Network name (SSID)', es: 'Nombre de la red (SSID)' } },
      { key: 'wifi_password', translatable: false, type: 'text', label: { fr: 'Mot de passe wifi', en: 'Wifi password', es: 'Contraseña wifi' } },
      { key: 'devices_note', translatable: true, type: 'textarea', label: { fr: 'Appareils (TV, Sonos, lave-linge...)', en: 'Appliances (TV, Sonos, washer...)', es: 'Aparatos (TV, Sonos, lavadora...)' } },
      { key: 'lights_fans_note', translatable: true, type: 'textarea', label: { fr: 'Lumières & ventilateurs de plafond', en: 'Lights & ceiling fans', es: 'Luces y ventiladores de techo' } },
      { key: 'tv_note', translatable: true, type: 'textarea', label: { fr: 'Vidéoprojecteur / TV', en: 'Projector / TV', es: 'Proyector / TV' } },
    ],
  },
  {
    id: 'cuisine',
    icon: 'kitchen',
    title: { fr: 'Cuisine', en: 'Kitchen', es: 'Cocina' },
    subtitle: { fr: 'Équipements & consignes', en: 'Equipment & tips', es: 'Equipamiento & consejos' },
    fields: [
      { key: 'equipment_note', translatable: true, type: 'textarea', label: { fr: 'Équipements disponibles', en: 'Available equipment', es: 'Equipamiento disponible' } },
      { key: 'induction_note', translatable: true, type: 'textarea', label: { fr: 'Plaque à induction', en: 'Induction hob', es: 'Placa de inducción' } },
      { key: 'dishwasher_note', translatable: true, type: 'textarea', label: { fr: 'Lave-vaisselle', en: 'Dishwasher', es: 'Lavavajillas' } },
      { key: 'coffee_note', translatable: true, type: 'textarea', label: { fr: 'Machine à café', en: 'Coffee machine', es: 'Cafetera' } },
      { key: 'sink_note', translatable: true, type: 'textarea', label: { fr: 'Évier & vaisselle', en: 'Sink & washing up', es: 'Fregadero' } },
      { key: 'bins_location', translatable: true, type: 'textarea', label: { fr: 'Tri des déchets & poubelles', en: 'Waste sorting & bins', es: 'Reciclaje y basura' } },
    ],
  },
  {
    id: 'regles',
    icon: 'rules',
    title: { fr: 'Règles du logement', en: 'House rules', es: 'Normas del alojamiento' },
    subtitle: { fr: 'Pour un séjour serein', en: 'For a peaceful stay', es: 'Para una estancia tranquila' },
    fields: [
      { key: 'rules_note', translatable: true, type: 'textarea', label: { fr: 'Règles', en: 'Rules', es: 'Normas' } },
    ],
  },
  {
    id: 'transports',
    icon: 'transport',
    title: { fr: 'Transports', en: 'Getting around', es: 'Transportes' },
    subtitle: { fr: 'Métro, bus, vélo, parking', en: 'Metro, bus, bike, parking', es: 'Metro, bus, bici, aparcamiento' },
    fields: [
      { key: 'transports_note', translatable: true, type: 'textarea', label: { fr: 'Transports', en: 'Getting around', es: 'Transportes' } },
    ],
  },
  {
    id: 'bons-plans',
    icon: 'pin',
    title: { fr: 'Bons plans du quartier', en: 'Neighbourhood tips', es: 'Recomendaciones del barrio' },
    subtitle: { fr: 'Nos adresses préférées', en: 'Our favourite spots', es: 'Nuestros sitios favoritos' },
    fields: [],
  },
  {
    id: 'urgences',
    icon: 'phone',
    title: { fr: 'Urgences & contacts', en: 'Emergency contacts', es: 'Urgencias & contactos' },
    subtitle: { fr: 'Numéros utiles', en: 'Useful numbers', es: 'Números útiles' },
    fields: [
      { key: 'host_phone', translatable: false, type: 'text', label: { fr: "Téléphone de l'hôte", en: 'Host phone', es: 'Teléfono del anfitrión' } },
      { key: 'plumber_phone', translatable: false, type: 'text', label: { fr: 'Plombier / dépannage', en: 'Plumber / repairs', es: 'Fontanero / reparaciones' } },
      { key: 'pharmacy_note', translatable: true, type: 'textarea', label: { fr: 'Pharmacie / hôpital le plus proche', en: 'Nearest pharmacy / hospital', es: 'Farmacia / hospital más cercano' } },
      { key: 'pharmacy_link', translatable: false, type: 'text', label: { fr: 'Lien Google Maps pharmacie', en: 'Pharmacy Google Maps link', es: 'Enlace de Google Maps' } },
      { key: 'electrical_note', translatable: true, type: 'textarea', label: { fr: 'Tableau électrique / plombs', en: 'Electrical panel / fuses', es: 'Cuadro eléctrico / fusibles' } },
    ],
  },
  {
    id: 'checklist',
    icon: 'check',
    title: { fr: 'Checklist départ', en: 'Departure checklist', es: 'Lista de salida' },
    subtitle: { fr: 'Avant de rendre les clés', en: 'Before handing back the keys', es: 'Antes de devolver las llaves' },
    fields: [
      { key: 'cleaning_note', translatable: true, type: 'textarea', label: { fr: 'Ménage en cours de séjour', en: 'Cleaning during your stay', es: 'Limpieza durante la estancia' } },
    ],
  },
];

export function fieldLabel(sectionId: string, key: string): Record<Lang, string> | undefined {
  return SECTIONS.find((s) => s.id === sectionId)?.fields.find((f) => f.key === key)?.label;
}

export const CHECKLIST_ITEMS: Record<Lang, string>[] = [
  { fr: "Laisser les clés sur la table de l'entrée", en: 'Leave keys on the entrance table', es: 'Dejar las llaves en la mesa de la entrada' },
  { fr: 'Éteindre toutes les lumières et ventilateurs', en: 'Turn off all lights and fans', es: 'Apagar todas las luces y ventiladores' },
  { fr: 'Vider et nettoyer le réfrigérateur', en: 'Empty and clean the fridge', es: 'Vaciar y limpiar el frigorífico' },
  { fr: 'Vider les poubelles', en: 'Take out the bins', es: 'Sacar la basura' },
  { fr: 'Faire la vaisselle', en: 'Do the washing-up', es: 'Fregar los platos' },
  { fr: 'Réunir le linge (draps, serviettes, torchons) dans la salle de bain', en: 'Gather the linens (sheets, towels, tea towels) in the bathroom', es: 'Reunir la ropa (sábanas, toallas, paños) en el baño' },
  { fr: 'Fermer les fenêtres et les volets (chambres et salon)', en: 'Close the windows and shutters (bedrooms and living room)', es: 'Cerrar las ventanas y las persianas (dormitorios y salón)' },
  { fr: "Laisser un petit mot si quelque chose s'est passé", en: 'Leave a note if anything happened', es: 'Dejar una nota si algo ocurrió' },
];

export const UI_LABELS = {
  hero_eyebrow: { fr: "Carnet d'accueil · HomeExchange", en: 'Welcome book · HomeExchange', es: 'Cuaderno de bienvenida · HomeExchange' },
  hero_title_1: { fr: 'Bienvenue', en: 'Welcome', es: 'Bienvenido' },
  hero_title_2: { fr: 'chez nous.', en: 'to our home.', es: 'a nuestra casa.' },
  hero_sub: {
    fr: "Tout ce qu'il faut savoir pour vous sentir comme à la maison. N'hésitez pas à nous contacter si vous avez la moindre question.",
    en: 'Everything you need to feel at home. Feel free to reach out if you have any questions.',
    es: 'Todo lo que necesitas saber para sentirte como en casa. No dudes en contactarnos si tienes alguna pregunta.',
  },
  footer: {
    fr: 'Bon séjour chez nous 🏠 — Merci d\'être nos hôtes HomeExchange',
    en: 'Enjoy your stay 🏠 — Thank you for being our HomeExchange guests',
    es: '¡Que disfrutes tu estancia! 🏠 — Gracias por ser nuestros huéspedes',
  },
  connect_wifi: { fr: 'Afficher le QR code wifi', en: 'Show wifi QR code', es: 'Mostrar código QR wifi' },
  wifi_qr_hint: {
    fr: "Scannez ce code avec l'appareil photo de votre téléphone pour vous connecter automatiquement.",
    en: 'Scan this code with your phone camera to connect automatically.',
    es: 'Escanea este código con la cámara de tu teléfono para conectarte automáticamente.',
  },
  close: { fr: 'Fermer', en: 'Close', es: 'Cerrar' },
  network: { fr: 'Réseau', en: 'Network', es: 'Red' },
  password: { fr: 'Mot de passe', en: 'Password', es: 'Contraseña' },
  copy: { fr: 'Copier', en: 'Copy', es: 'Copiar' },
  copied: { fr: 'Copié ✓', en: 'Copied ✓', es: 'Copiado ✓' },
  wifi_mobile_hint: {
    fr: 'Copiez le mot de passe puis allez dans Réglages → Wifi pour vous connecter.',
    en: 'Copy the password, then go to Settings → Wifi to connect.',
    es: 'Copia la contraseña y ve a Ajustes → Wifi para conectarte.',
  },
  checkin: { fr: 'Arrivée', en: 'Check-in', es: 'Llegada' },
  checkout: { fr: 'Départ', en: 'Check-out', es: 'Salida' },
  tri_yellow: { fr: 'Jaune', en: 'Yellow', es: 'Amarillo' },
  tri_yellow_sub: { fr: 'Plastiques, métaux, cartons', en: 'Plastics, metals, cardboard', es: 'Plásticos, metales, cartón' },
  tri_green: { fr: 'Vert', en: 'Green', es: 'Verde' },
  tri_green_sub: { fr: 'Verre uniquement', en: 'Glass only', es: 'Solo vidrio' },
  tri_gray: { fr: 'Gris / noir', en: 'Gray / black', es: 'Gris / negro' },
  tri_gray_sub: { fr: 'Déchets non recyclables', en: 'Non-recyclable waste', es: 'Residuos no reciclables' },
  host: { fr: 'Votre hôte', en: 'Your host', es: 'Vuestro anfitrión' },
  host_role: { fr: 'Pour toute question', en: 'For any question', es: 'Para cualquier pregunta' },
  emergency: { fr: 'SAMU / Urgences', en: 'Emergency services', es: 'Servicios de emergencia' },
  plumber: { fr: 'Plombier / dépannage', en: 'Plumber / repairs', es: 'Fontanero / reparaciones' },
  plumber_role: { fr: 'En cas de problème technique', en: 'For technical issues', es: 'Para problemas técnicos' },
  pharmacy: { fr: 'Pharmacie / hôpital', en: 'Pharmacy / hospital', es: 'Farmacia / hospital' },
  to_complete: { fr: 'À compléter', en: 'To complete', es: 'Por completar' },
  walk_minutes: { fr: 'min à pied', en: 'min walk', es: 'min a pie' },
} satisfies Record<string, Record<Lang, string>>;
