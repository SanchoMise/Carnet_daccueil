'use client';

import { useCallback, useEffect, useState } from 'react';
import { SECTIONS } from '@/lib/sections';
import { ContentMap, ContentRow, ImageRow, Lang, PlaceRow } from '@/lib/types';
import { translateBatch } from '@/lib/translateClient';

type FieldValues = Record<string, Record<Lang, string>>;

function contentMapFromRows(rows: ContentRow[]): ContentMap {
  const map: ContentMap = {};
  for (const row of rows) {
    map[row.section] ??= {};
    map[row.section][row.key] ??= { fr: '', en: '', es: '' } as Record<Lang, string>;
    map[row.section][row.key][row.lang] = row.value ?? '';
  }
  return map;
}

export default function AdminApp({ adminKey }: { adminKey: string }) {
  const [contentMap, setContentMap] = useState<ContentMap>({});
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const headers = { 'Content-Type': 'application/json', 'x-admin-key': adminKey };

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [contentRes, placesRes, imagesRes] = await Promise.all([
      fetch('/api/content', { headers }),
      fetch('/api/places', { headers }),
      fetch('/api/images', { headers }),
    ]);
    const [contentJson, placesJson, imagesJson] = await Promise.all([
      contentRes.json(),
      placesRes.json(),
      imagesRes.json(),
    ]);
    setContentMap(contentMapFromRows(contentJson.data ?? []));
    setPlaces(placesJson.data ?? []);
    setImages(imagesJson.data ?? []);
    setLoading(false);
  }, [adminKey]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 2500);
  };

  if (loading) {
    return <div className="p-8 text-ink-2">Chargement…</div>;
  }

  const section = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif text-xl">Administration — Carnet d&apos;accueil</h1>
        {status && <span className="text-sm text-accent font-medium">{status}</span>}
      </header>

      <div className="flex">
        <nav className="w-56 shrink-0 border-r border-border min-h-[calc(100vh-65px)] p-4 flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`text-left px-3 py-2 rounded-sm text-sm ${
                activeSection === s.id ? 'bg-accent-light text-accent font-medium' : 'text-ink-2 hover:bg-bg'
              }`}
            >
              {s.title.fr}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-6 max-w-3xl">
          {section.fields.length > 0 && (
            <ContentForm
              key={section.id}
              section={section.id}
              fields={section.fields}
              contentMap={contentMap}
              adminKey={adminKey}
              onSaved={(items) => {
                setContentMap((prev) => {
                  const next = { ...prev, [section.id]: { ...prev[section.id] } };
                  for (const item of items) {
                    next[section.id][item.key] ??= { fr: '', en: '', es: '' } as Record<Lang, string>;
                    next[section.id][item.key] = { ...next[section.id][item.key], [item.lang]: item.value };
                  }
                  return next;
                });
                flash('Enregistré ✓');
              }}
            />
          )}

          {section.id === 'bons-plans' && (
            <PlacesEditor places={places} adminKey={adminKey} onChange={setPlaces} flash={flash} />
          )}

          <ImagesEditor
            section={section.id}
            images={images.filter((i) => i.section === section.id)}
            adminKey={adminKey}
            onChange={(sectionImages) =>
              setImages((prev) => [...prev.filter((i) => i.section !== section.id), ...sectionImages])
            }
            flash={flash}
          />
        </main>
      </div>
    </div>
  );
}

function ContentForm({
  section,
  fields,
  contentMap,
  adminKey,
  onSaved,
}: {
  section: string;
  fields: typeof SECTIONS[number]['fields'];
  contentMap: ContentMap;
  adminKey: string;
  onSaved: (items: { section: string; key: string; lang: Lang; value: string }[]) => void;
}) {
  const [values, setValues] = useState<FieldValues>(() => {
    const init: FieldValues = {};
    for (const f of fields) {
      init[f.key] = {
        fr: contentMap[section]?.[f.key]?.fr ?? '',
        en: contentMap[section]?.[f.key]?.en ?? '',
        es: contentMap[section]?.[f.key]?.es ?? '',
      };
    }
    return init;
  });
  const [saving, setSaving] = useState(false);

  const setVal = (key: string, lang: Lang, val: string) => {
    setValues((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: val } }));
  };

  const save = async () => {
    setSaving(true);

    const translatableFields = fields.filter((f) => f.translatable && values[f.key].fr.trim());
    const translations: Record<string, { en: string; es: string }> = {};

    if (translatableFields.length > 0) {
      const items = translatableFields.flatMap((f) => [
        { text: values[f.key].fr, target: 'en' as const },
        { text: values[f.key].fr, target: 'es' as const },
      ]);
      const results = await translateBatch(items, adminKey);
      translatableFields.forEach((f, i) => {
        translations[f.key] = { en: results[i * 2] ?? '', es: results[i * 2 + 1] ?? '' };
      });
    }

    const items: { section: string; key: string; lang: Lang; value: string }[] = [];
    for (const f of fields) {
      if (f.translatable) {
        items.push({ section, key: f.key, lang: 'fr', value: values[f.key].fr });
        items.push({ section, key: f.key, lang: 'en', value: translations[f.key]?.en ?? values[f.key].en });
        items.push({ section, key: f.key, lang: 'es', value: translations[f.key]?.es ?? values[f.key].es });
      } else {
        items.push({ section, key: f.key, lang: 'fr', value: values[f.key].fr });
      }
    }
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ items }),
    });
    setSaving(false);
    if (res.ok) onSaved(items);
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
      <h2 className="font-serif text-lg mb-4">Textes</h2>
      <p className="text-xs text-ink-3 mb-4">
        Remplissez uniquement le français : l&apos;anglais et l&apos;espagnol sont générés automatiquement à l&apos;enregistrement.
      </p>
      <div className="flex flex-col gap-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-3 mb-1.5">
              {f.label.fr}
              {f.translatable && <span className="normal-case font-normal text-ink-3/70"> · 🌐 traduit auto</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                value={values[f.key].fr}
                onChange={(e) => setVal(f.key, 'fr', e.target.value)}
                rows={2}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
              />
            ) : (
              <input
                value={values[f.key].fr}
                onChange={(e) => setVal(f.key, 'fr', e.target.value)}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-5 px-5 py-2.5 bg-accent text-white rounded-sm text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </div>
  );
}

function emptyPlace(): Partial<PlaceRow> {
  return { name: '', category: '', description_fr: '', description_en: '', description_es: '', address: '', maps_url: '', walk_minutes: null };
}

function PlacesEditor({
  places,
  adminKey,
  onChange,
  flash,
}: {
  places: PlaceRow[];
  adminKey: string;
  onChange: (places: PlaceRow[]) => void;
  flash: (msg: string) => void;
}) {
  const [newForm, setNewForm] = useState<Partial<PlaceRow>>(emptyPlace());
  const [editForm, setEditForm] = useState<Partial<PlaceRow>>(emptyPlace());
  const [editingId, setEditingId] = useState<string | null>(null);
  const headers = { 'Content-Type': 'application/json', 'x-admin-key': adminKey };

  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const buildPayload = async (form: Partial<PlaceRow>) => {
    if (!form.description_fr?.trim()) return form;
    const [description_en, description_es] = await translateBatch(
      [
        { text: form.description_fr, target: 'en' },
        { text: form.description_fr, target: 'es' },
      ],
      adminKey
    );
    return { ...form, description_en, description_es };
  };

  const submitNew = async () => {
    if (!newForm.name) return;
    setAddSubmitting(true);
    const payload = await buildPayload(newForm);
    const res = await fetch('/api/places', { method: 'POST', headers, body: JSON.stringify(payload) });
    const json = await res.json();
    if (res.ok) {
      onChange([...places, json.data]);
      flash('Adresse ajoutée ✓');
      setNewForm(emptyPlace());
    }
    setAddSubmitting(false);
  };

  const submitEdit = async () => {
    if (!editingId || !editForm.name) return;
    setEditSubmitting(true);
    const payload = await buildPayload(editForm);
    const res = await fetch(`/api/places/${editingId}`, { method: 'PATCH', headers, body: JSON.stringify(payload) });
    const json = await res.json();
    if (res.ok) {
      onChange(places.map((p) => (p.id === editingId ? json.data : p)));
      flash('Adresse mise à jour ✓');
      setEditingId(null);
    }
    setEditSubmitting(false);
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/places/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      onChange(places.filter((p) => p.id !== id));
      flash('Adresse supprimée ✓');
      if (editingId === id) setEditingId(null);
    }
  };

  const edit = (p: PlaceRow) => {
    setEditForm(p);
    setEditingId(p.id);
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
      <h2 className="font-serif text-lg mb-4">Bons plans</h2>

      <div className="flex flex-col gap-2 mb-6">
        {places.map((p) => (
          <div key={p.id} className="border border-border rounded-sm">
            <div className="flex items-center justify-between px-4 py-2.5">
              <div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent-light text-accent font-medium mr-2">
                  {p.category || '—'}
                </span>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => (editingId === p.id ? setEditingId(null) : edit(p))}
                  className="text-xs text-accent font-medium"
                >
                  {editingId === p.id ? 'Fermer' : 'Modifier'}
                </button>
                <button onClick={() => remove(p.id)} className="text-xs text-red-600 font-medium">
                  Supprimer
                </button>
              </div>
            </div>
            {editingId === p.id && (
              <div className="border-t border-border p-4 bg-bg/50">
                <PlaceFields form={editForm} setForm={setEditForm} />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={submitEdit}
                    disabled={editSubmitting}
                    className="px-5 py-2.5 bg-accent text-white rounded-sm text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {editSubmitting ? 'Enregistrement…' : 'Mettre à jour'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-5 py-2.5 border border-border rounded-sm text-sm font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {places.length === 0 && <p className="text-sm text-ink-3">Aucune adresse pour le moment.</p>}
      </div>

      <h3 className="text-sm font-medium mb-3">Ajouter une adresse</h3>
      <PlaceFields form={newForm} setForm={setNewForm} />
      <div className="flex gap-2 mt-4">
        <button
          onClick={submitNew}
          disabled={addSubmitting}
          className="px-5 py-2.5 bg-accent text-white rounded-sm text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {addSubmitting ? 'Enregistrement…' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}

function PlaceFields({
  form,
  setForm,
}: {
  form: Partial<PlaceRow>;
  setForm: (form: Partial<PlaceRow>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <input
        placeholder="Nom"
        value={form.name ?? ''}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="border border-border rounded-sm px-3 py-2 text-sm"
      />
      <input
        placeholder="Catégorie (ex: Café, Resto, Marché)"
        value={form.category ?? ''}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="border border-border rounded-sm px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Description (FR — traduite auto en EN/ES) 🌐"
        value={form.description_fr ?? ''}
        onChange={(e) => setForm({ ...form, description_fr: e.target.value })}
        className="border border-border rounded-sm px-3 py-2 text-sm col-span-2"
        rows={2}
      />
      <input
        placeholder="Adresse postale"
        value={form.address ?? ''}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        className="border border-border rounded-sm px-3 py-2 text-sm"
      />
      <input
        placeholder="Lien Google Maps (optionnel)"
        value={form.maps_url ?? ''}
        onChange={(e) => setForm({ ...form, maps_url: e.target.value })}
        className="border border-border rounded-sm px-3 py-2 text-sm"
      />
      <input
        type="number"
        min={0}
        placeholder="Distance à pied (minutes)"
        value={form.walk_minutes ?? ''}
        onChange={(e) => setForm({ ...form, walk_minutes: e.target.value === '' ? null : Number(e.target.value) })}
        className="border border-border rounded-sm px-3 py-2 text-sm"
      />
    </div>
  );
}

function ImagesEditor({
  section,
  images,
  adminKey,
  onChange,
  flash,
}: {
  section: string;
  images: ImageRow[];
  adminKey: string;
  onChange: (images: ImageRow[]) => void;
  flash: (msg: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', section);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey },
      body: formData,
    });
    const json = await res.json();
    setUploading(false);
    if (res.ok) {
      onChange([...images, json.data]);
      flash('Image ajoutée ✓');
    }
  };

  const remove = async (id: string) => {
    const res = await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      onChange(images.filter((i) => i.id !== id));
      flash('Image supprimée ✓');
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <h2 className="font-serif text-lg mb-4">Images</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        {images.map((img) => (
          <div key={img.id} className="relative w-32 h-24 rounded-sm overflow-hidden border border-border group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => remove(img.id)}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        className={`flex items-center justify-center border-2 border-dashed rounded-sm h-24 text-sm cursor-pointer transition-colors ${
          dragOver ? 'border-accent bg-accent-light text-accent' : 'border-border text-ink-3'
        }`}
      >
        {uploading ? 'Envoi…' : 'Glissez-déposez une image ou cliquez pour choisir'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </label>
    </div>
  );
}
