'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Icon } from './icons';
import { SECTIONS, CHECKLIST_ITEMS, UI_LABELS, fieldLabel, type SectionDef } from '@/lib/sections';
import { ContentMap, ImageRow, Lang, LANGS, PlaceRow } from '@/lib/types';
import { getValue } from '@/lib/contentValue';
import { APARTMENT_COORDS } from '@/lib/geo';

function t(dict: Record<Lang, string>, lang: Lang) {
  return dict[lang];
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);
  return isMobile;
}

export default function VisitorApp({
  contentMap,
  places,
  images,
}: {
  contentMap: ContentMap;
  places: PlaceRow[];
  images: ImageRow[];
}) {
  const [lang, setLang] = useState<Lang>('fr');
  const [openSection, setOpenSection] = useState<string | null>('arrivee');
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [wifiQrOpen, setWifiQrOpen] = useState(false);

  const openAndScrollTo = (id: string) => {
    setOpenSection(id);
    // Wait for the accordion layout change (other sections collapsing) to be
    // painted before measuring the scroll target, otherwise it aims at a stale position.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const v = (section: string, key: string, translatable: boolean) =>
    getValue(contentMap, section, key, lang, translatable);

  const toggleCheck = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const wifiSsid = v('wifi', 'wifi_ssid', false);
  const wifiPassword = v('wifi', 'wifi_password', false);

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between h-14 px-4 sm:px-8 bg-bg/90 backdrop-blur-md border-b border-border">
        <span className="font-serif text-lg text-ink">Chez Cyrielle, Mara, Zélie et Bertrand 🌈</span>
        <div className="flex gap-1">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                lang === l
                  ? 'bg-accent-light text-accent border-accent/20'
                  : 'border-transparent text-ink-2 hover:bg-accent-light hover:text-accent'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-[720px] mx-auto px-4 sm:px-8 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent mb-4 before:content-[''] before:block before:w-5 before:h-px before:bg-accent">
          {t(UI_LABELS.hero_eyebrow, lang)}
        </div>
        <h1 className="font-serif text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.1] tracking-tight text-ink mb-4">
          {t(UI_LABELS.hero_title_1, lang)}
          <br />
          <em className="not-italic italic text-accent">{t(UI_LABELS.hero_title_2, lang)}</em>
        </h1>
        <p className="text-[1.05rem] text-ink-2 max-w-[460px] leading-relaxed">{t(UI_LABELS.hero_sub, lang)}</p>
      </section>

      {/* SECTION NAV PILLS */}
      <div className="max-w-[720px] mx-auto px-4 sm:px-8 pb-8 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              openAndScrollTo(s.id);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-surface text-[0.82rem] text-ink-2 hover:bg-accent-light hover:border-accent/25 hover:text-accent transition-all no-underline"
          >
            <Icon name={s.icon} className="w-3.5 h-3.5 opacity-60 shrink-0" />
            {t(s.title, lang)}
          </a>
        ))}
      </div>

      {/* MAIN */}
      <main className="max-w-[720px] mx-auto px-4 sm:px-8 pb-24 flex flex-col gap-0.5">
        {SECTIONS.map((s) => {
          const isOpen = openSection === s.id;
          return (
            <div key={s.id} id={s.id} className="scroll-mt-20 bg-surface rounded-2xl border border-border overflow-hidden">
              <div
                onClick={() => (isOpen ? setOpenSection(null) : openAndScrollTo(s.id))}
                className="flex items-center gap-3.5 px-6 py-5 cursor-pointer select-none hover:bg-bg transition-colors"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-accent-light flex items-center justify-center shrink-0">
                  <Icon name={s.icon} className="w-[18px] h-[18px] text-accent" />
                </div>
                <div className="flex-1">
                  <div className="font-serif text-[1.1rem] text-ink tracking-tight">{t(s.title, lang)}</div>
                  <div className="text-xs text-ink-3 mt-0.5">{t(s.subtitle, lang)}</div>
                </div>
                <Icon
                  name="chevron"
                  className={`w-5 h-5 text-ink-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {isOpen && (
                <div className="px-6 pb-6 border-t border-border">
                  {s.id === 'arrivee' && <ArriveeBody v={v} lang={lang} images={images} />}
                  {s.id === 'wifi' && <WifiBody v={v} lang={lang} images={images} onShowQr={() => setWifiQrOpen(true)} />}
                  {s.id === 'entree' && <GenericBody section={s} v={v} lang={lang} images={images} />}
                  {s.id === 'salon' && <GenericBody section={s} v={v} lang={lang} images={images} />}
                  {s.id === 'laverie' && <GenericBody section={s} v={v} lang={lang} images={images} />}
                  {s.id === 'canicule' && <GenericBody section={s} v={v} lang={lang} images={images} />}
                  {s.id === 'cuisine' && <CuisineBody v={v} lang={lang} images={images} />}
                  {(s.id === 'chambre-parentale' || s.id === 'chambre-filles') && (
                    <RoomBody sectionId={s.id} v={v} lang={lang} images={images} />
                  )}
                  {s.id === 'regles' && (
                    <SimpleBody section="regles" fieldKey="rules_note" value={v('regles', 'rules_note', true)} images={images} />
                  )}
                  {s.id === 'transports' && (
                    <TransportsBody value={v('transports', 'transports_note', true)} images={images} />
                  )}
                  {s.id === 'bons-plans' && <BonsPlansBody places={places} lang={lang} />}
                  {s.id === 'urgences' && <UrgencesBody v={v} lang={lang} images={images} />}
                  {s.id === 'checklist' && <ChecklistBody v={v} lang={lang} checked={checked} onToggle={toggleCheck} />}
                </div>
              )}
            </div>
          );
        })}
      </main>

      <footer className="max-w-[720px] mx-auto px-4 sm:px-8 pt-4 pb-12 text-center text-xs text-ink-3">
        {t(UI_LABELS.footer, lang)}
      </footer>

      {wifiQrOpen && wifiSsid && (
        <WifiQrModal ssid={wifiSsid} password={wifiPassword} lang={lang} onClose={() => setWifiQrOpen(false)} />
      )}
    </div>
  );
}

function WifiQrModal({ ssid, password, lang, onClose }: { ssid: string; password: string; lang: Lang; onClose: () => void }) {
  const wifiUri = `WIFI:S:${ssid};T:WPA;P:${password};;`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(wifiUri)}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-xs w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-ink-2 mb-4">{t(UI_LABELS.wifi_qr_hint, lang)}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="QR code wifi" width={240} height={240} className="mx-auto rounded-sm" />
        <button
          onClick={onClose}
          className="mt-5 px-5 py-2.5 border border-border rounded-sm text-sm font-medium"
        >
          {t(UI_LABELS.close, lang)}
        </button>
      </div>
    </div>
  );
}

type VFn = (section: string, key: string, translatable: boolean) => string;

/** Photos attached to a specific field/sous-partie (not the section-level fallback). */
function imgFor(images: ImageRow[], section: string, fieldKey: string): ImageRow[] {
  return images.filter((img) => img.section === section && img.field_key === fieldKey);
}

function BlockImages({ images }: { images: ImageRow[] }) {
  if (images.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3 mt-3">
      {images.map((img) => (
        <figure key={img.id} className="w-40">
          <div className="relative w-40 h-28 rounded-sm overflow-hidden bg-bg">
            <Image src={img.url} alt={img.caption ?? ''} fill sizes="160px" className="object-cover" />
          </div>
          {img.caption && <figcaption className="text-xs text-ink-3 mt-1">{img.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function Block({ label, images, children }: { label?: string; images?: ImageRow[]; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-border last:border-b-0 last:pb-0">
      {label && <div className="text-xs font-bold uppercase tracking-wider text-accent mb-2">{label}</div>}
      {children}
      {images && <BlockImages images={images} />}
    </div>
  );
}

function HighlightBox({ icon, title, body }: { icon: string; title?: string; body: string }) {
  return (
    <div className="bg-accent-light rounded-sm p-4 flex items-start gap-3 my-4">
      <Icon name={icon} className="w-5 h-5 text-accent shrink-0 mt-px" />
      <div className="text-[0.9rem] text-ink leading-relaxed">
        {title && <strong className="block font-medium mb-0.5">{title}</strong>}
        {body}
      </div>
    </div>
  );
}

function ArriveeBody({ v, lang, images }: { v: VFn; lang: Lang; images: ImageRow[] }) {
  const keyWarning = v('arrivee', 'key_warning', true);
  const doorsNote = v('arrivee', 'doors_note', true);
  const digicode = v('arrivee', 'digicode', false);
  const entranceNote = v('arrivee', 'entrance_note', true);
  const apartmentNote = v('arrivee', 'apartment_note', true);
  const checkinTime = v('arrivee', 'checkin_time', false);
  const checkinNote = v('arrivee', 'checkin_note', true);
  const checkoutTime = v('arrivee', 'checkout_time', false);
  const checkoutNote = v('arrivee', 'checkout_note', true);

  return (
    <>
      {(keyWarning || doorsNote) && (
        <Block images={imgFor(images, 'arrivee', 'key_warning')}>
          {keyWarning && <HighlightBox icon="key" body={keyWarning} />}
          {doorsNote && <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line mt-2">{doorsNote}</p>}
        </Block>
      )}
      <Block images={imgFor(images, 'arrivee', 'entrance_note')}>
        <HighlightBox icon="building" body={entranceNote || UI_LABELS.to_complete[lang]} />
        {digicode && (
          <div className="inline-flex items-center gap-1 my-2">
            {digicode.split('').map((d, i) =>
              d === '-' || d === ' ' ? (
                <div key={i} className="w-1.5 h-0.5 bg-ink-3 rounded-full mx-0.5" />
              ) : (
                <div key={i} className="w-9 h-11 bg-ink text-white rounded-lg flex items-center justify-center font-serif text-xl font-light">
                  {d}
                </div>
              )
            )}
          </div>
        )}
      </Block>
      <Block images={imgFor(images, 'arrivee', 'apartment_note')}>
        <HighlightBox icon="home" body={apartmentNote || UI_LABELS.to_complete[lang]} />
      </Block>
      <Block>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-bg rounded-sm p-4 flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wider text-ink-3 font-medium">{t(UI_LABELS.checkin, lang)}</div>
            <div className="text-base font-medium text-ink">{checkinTime || '—'}</div>
            <div className="text-sm text-ink-2">{checkinNote}</div>
          </div>
          <div className="bg-bg rounded-sm p-4 flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wider text-ink-3 font-medium">{t(UI_LABELS.checkout, lang)}</div>
            <div className="text-base font-medium text-ink">{checkoutTime || '—'}</div>
            <div className="text-sm text-ink-2">{checkoutNote}</div>
          </div>
        </div>
      </Block>
    </>
  );
}

function CopyButton({ value, lang }: { value: string; lang: Lang }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable (e.g. insecure context) — silently ignore
    }
  };

  return (
    <button
      onClick={copy}
      className="text-xs text-accent font-medium px-2 py-0.5 rounded-full border border-accent/20 hover:bg-accent-light transition-colors shrink-0"
    >
      {copied ? t(UI_LABELS.copied, lang) : t(UI_LABELS.copy, lang)}
    </button>
  );
}

function WifiBody({ v, lang, images, onShowQr }: { v: VFn; lang: Lang; images: ImageRow[]; onShowQr: () => void }) {
  const ssid = v('wifi', 'wifi_ssid', false);
  const password = v('wifi', 'wifi_password', false);
  const devicesNote = v('wifi', 'devices_note', true);
  const isMobile = useIsMobile();

  return (
    <>
      <Block>
        <div className="flex flex-col gap-1.5 mb-2">
          <div className="flex items-center gap-2.5 text-sm text-ink-2">
            <span className="text-ink-3 text-xs w-20 shrink-0">{t(UI_LABELS.network, lang)}</span>
            <strong className="font-medium flex-1">{ssid || '—'}</strong>
            {ssid && <CopyButton value={ssid} lang={lang} />}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-ink-2">
            <span className="text-ink-3 text-xs w-20 shrink-0">{t(UI_LABELS.password, lang)}</span>
            <strong className="font-medium flex-1">{password || '—'}</strong>
            {password && <CopyButton value={password} lang={lang} />}
          </div>
        </div>
        {ssid && !isMobile && (
          <button
            onClick={onShowQr}
            className="inline-flex items-center gap-2.5 px-5 py-3 bg-accent text-white rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Icon name="wifi" className="w-[18px] h-[18px]" />
            {t(UI_LABELS.connect_wifi, lang)}
          </button>
        )}
        {ssid && isMobile && (
          <p className="text-xs text-ink-3 mt-1">{t(UI_LABELS.wifi_mobile_hint, lang)}</p>
        )}
      </Block>
      <Block images={imgFor(images, 'wifi', 'devices_note')}>
        <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">
          {devicesNote || UI_LABELS.to_complete[lang]}
        </p>
      </Block>
    </>
  );
}

function CuisineBody({ v, lang, images }: { v: VFn; lang: Lang; images: ImageRow[] }) {
  const equipmentNote = v('cuisine', 'equipment_note', true);
  const inductionNote = v('cuisine', 'induction_note', true);
  const dishwasherNote = v('cuisine', 'dishwasher_note', true);
  const coffeeNote = v('cuisine', 'coffee_note', true);
  const sinkNote = v('cuisine', 'sink_note', true);
  const lightsNote = v('cuisine', 'lights_note', true);
  const binsLocation = v('cuisine', 'bins_location', true);

  return (
    <>
      <Block images={imgFor(images, 'cuisine', 'equipment_note')}>
        <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">
          {equipmentNote || UI_LABELS.to_complete[lang]}
        </p>
      </Block>
      {inductionNote && (
        <Block label={fieldLabel('cuisine', 'induction_note')?.[lang]} images={imgFor(images, 'cuisine', 'induction_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{inductionNote}</p>
        </Block>
      )}
      {dishwasherNote && (
        <Block label={fieldLabel('cuisine', 'dishwasher_note')?.[lang]} images={imgFor(images, 'cuisine', 'dishwasher_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{dishwasherNote}</p>
        </Block>
      )}
      {coffeeNote && (
        <Block label={fieldLabel('cuisine', 'coffee_note')?.[lang]} images={imgFor(images, 'cuisine', 'coffee_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{coffeeNote}</p>
        </Block>
      )}
      {sinkNote && (
        <Block label={fieldLabel('cuisine', 'sink_note')?.[lang]} images={imgFor(images, 'cuisine', 'sink_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{sinkNote}</p>
        </Block>
      )}
      {lightsNote && (
        <Block label={fieldLabel('cuisine', 'lights_note')?.[lang]} images={imgFor(images, 'cuisine', 'lights_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{lightsNote}</p>
        </Block>
      )}
      <Block>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-sm p-3.5 flex flex-col items-center gap-1.5 text-center" style={{ background: '#FEF9EC', color: '#92700A' }}>
            <div className="text-sm font-medium leading-tight">{t(UI_LABELS.tri_yellow, lang)}</div>
            <div className="text-[0.7rem] leading-tight opacity-70">{t(UI_LABELS.tri_yellow_sub, lang)}</div>
          </div>
          <div className="rounded-sm p-3.5 flex flex-col items-center gap-1.5 text-center" style={{ background: '#EBF4EC', color: '#2D6A31' }}>
            <div className="text-sm font-medium leading-tight">{t(UI_LABELS.tri_green, lang)}</div>
            <div className="text-[0.7rem] leading-tight opacity-70">{t(UI_LABELS.tri_green_sub, lang)}</div>
          </div>
          <div className="rounded-sm p-3.5 flex flex-col items-center gap-1.5 text-center" style={{ background: '#F2F2F0', color: '#4A4A47' }}>
            <div className="text-sm font-medium leading-tight">{t(UI_LABELS.tri_gray, lang)}</div>
            <div className="text-[0.7rem] leading-tight opacity-70">{t(UI_LABELS.tri_gray_sub, lang)}</div>
          </div>
        </div>
      </Block>
      {binsLocation && (
        <Block label={fieldLabel('cuisine', 'bins_location')?.[lang]} images={imgFor(images, 'cuisine', 'bins_location')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{binsLocation}</p>
        </Block>
      )}
    </>
  );
}

/** Renders every filled field of a section as its own labeled block, in declaration order. */
function GenericBody({ section, v, lang, images }: { section: SectionDef; v: VFn; lang: Lang; images: ImageRow[] }) {
  const filled = section.fields.filter((f) => v(section.id, f.key, f.translatable));

  if (filled.length === 0) {
    return (
      <Block>
        <p className="text-[0.93rem] text-ink-2">{UI_LABELS.to_complete[lang]}</p>
      </Block>
    );
  }

  return (
    <>
      {filled.map((f) => (
        <Block key={f.key} label={f.label[lang]} images={imgFor(images, section.id, f.key)}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">
            {v(section.id, f.key, f.translatable)}
          </p>
        </Block>
      ))}
    </>
  );
}

function RoomBody({ sectionId, v, lang, images }: { sectionId: string; v: VFn; lang: Lang; images: ImageRow[] }) {
  const introNote = v(sectionId, 'intro_note', true);
  const voletNote = v(sectionId, 'volet_note', true);
  const cabinBedNote = v(sectionId, 'cabin_bed_note', true);
  const lightsNote = v(sectionId, 'lights_note', true);
  const sonosNote = v(sectionId, 'sonos_note', true);
  const fanNote = v(sectionId, 'fan_note', true);

  return (
    <>
      <Block images={imgFor(images, sectionId, 'intro_note')}>
        <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">
          {introNote || UI_LABELS.to_complete[lang]}
        </p>
      </Block>
      {voletNote && (
        <Block label={fieldLabel(sectionId, 'volet_note')?.[lang]} images={imgFor(images, sectionId, 'volet_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{voletNote}</p>
        </Block>
      )}
      {cabinBedNote && (
        <Block label={fieldLabel(sectionId, 'cabin_bed_note')?.[lang]} images={imgFor(images, sectionId, 'cabin_bed_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{cabinBedNote}</p>
        </Block>
      )}
      {lightsNote && (
        <Block label={fieldLabel(sectionId, 'lights_note')?.[lang]} images={imgFor(images, sectionId, 'lights_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{lightsNote}</p>
        </Block>
      )}
      {sonosNote && (
        <Block label={fieldLabel(sectionId, 'sonos_note')?.[lang]} images={imgFor(images, sectionId, 'sonos_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{sonosNote}</p>
        </Block>
      )}
      {fanNote && (
        <Block label={fieldLabel(sectionId, 'fan_note')?.[lang]} images={imgFor(images, sectionId, 'fan_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{fanNote}</p>
        </Block>
      )}
    </>
  );
}

function SimpleBody({ section, fieldKey, value, images }: { section: string; fieldKey: string; value: string; images: ImageRow[] }) {
  return (
    <Block images={imgFor(images, section, fieldKey)}>
      <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{value}</p>
    </Block>
  );
}

function TransportsBody({ value, images }: { value: string; images: ImageRow[] }) {
  return (
    <>
      <Block>
        <div className="rounded-sm overflow-hidden border border-border">
          <iframe
            title="Métro, bus et vélib autour de l'appartement"
            width="100%"
            height="320"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${APARTMENT_COORDS.lat},${APARTMENT_COORDS.lon}&z=17&output=embed`}
          />
        </div>
      </Block>
      {value && (
        <Block images={imgFor(images, 'transports', 'transports_note')}>
          <p className="text-[0.93rem] text-ink-2 leading-relaxed whitespace-pre-line">{value}</p>
        </Block>
      )}
    </>
  );
}

function BonsPlansBody({ places, lang }: { places: PlaceRow[]; lang: Lang }) {
  if (places.length === 0) {
    return (
      <Block>
        <p className="text-[0.93rem] text-ink-2">{UI_LABELS.to_complete[lang]}</p>
      </Block>
    );
  }

  const grouped = places.reduce<Record<string, PlaceRow[]>>((acc, p) => {
    const cat = p.category || 'Autres';
    acc[cat] ??= [];
    acc[cat].push(p);
    return acc;
  }, {});

  const descFor = (p: PlaceRow) =>
    (lang === 'fr' ? p.description_fr : lang === 'en' ? p.description_en : p.description_es) || '';

  return (
    <>
      {Object.entries(grouped).map(([cat, items]) => (
        <Block key={cat} label={cat}>
          {items.map((p) => (
            <div key={p.id} className="py-3.5 border-b border-border last:border-b-0">
              <div className="font-medium text-[0.93rem] mb-1">
                {p.name}
                {p.walk_minutes != null && (
                  <span className="text-xs text-ink-3 font-normal ml-1.5">
                    · 🚶 {p.walk_minutes} {t(UI_LABELS.walk_minutes, lang)}
                  </span>
                )}
              </div>
              {descFor(p) && <div className="text-sm text-ink-2 mb-1">{descFor(p)}</div>}
              {(p.maps_url || p.address) && (
                <a
                  href={p.maps_url || `https://maps.google.com/?q=${encodeURIComponent(p.address || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent font-medium"
                >
                  {p.address || 'Google Maps'} →
                </a>
              )}
            </div>
          ))}
        </Block>
      ))}
    </>
  );
}

function UrgencesBody({ v, lang, images }: { v: VFn; lang: Lang; images: ImageRow[] }) {
  const hostPhone = v('urgences', 'host_phone', false);
  const contact2Name = v('urgences', 'contact2_name', false);
  const contact2Phone = v('urgences', 'contact2_phone', false);
  const plumberPhone = v('urgences', 'plumber_phone', false);
  const electricalNote = v('urgences', 'electrical_note', true);
  const pharmacyName = v('urgences', 'pharmacy_name', false);
  const pharmacyAddress = v('urgences', 'pharmacy_address', false);
  const pharmacyMapsUrl = v('urgences', 'pharmacy_maps_url', false);
  const hospitalName = v('urgences', 'hospital_name', false);
  const hospitalAddress = v('urgences', 'hospital_address', false);
  const hospitalMapsUrl = v('urgences', 'hospital_maps_url', false);

  const rows = [
    { avatar: '👤', name: t(UI_LABELS.host, lang), role: t(UI_LABELS.host_role, lang), link: hostPhone ? `tel:${hostPhone}` : '#', label: hostPhone || UI_LABELS.to_complete[lang] },
    ...(contact2Name || contact2Phone
      ? [{ avatar: '👤', name: contact2Name || t(UI_LABELS.contact2_role, lang), role: t(UI_LABELS.contact2_role, lang), link: contact2Phone ? `tel:${contact2Phone}` : '#', label: contact2Phone || UI_LABELS.to_complete[lang] }]
      : []),
    { avatar: '🚨', name: t(UI_LABELS.emergency, lang), role: '15 · 17 · 18 · 112', link: 'tel:112', label: '112' },
    { avatar: '🔧', name: t(UI_LABELS.plumber, lang), role: t(UI_LABELS.plumber_role, lang), link: plumberPhone ? `tel:${plumberPhone}` : '#', label: plumberPhone || UI_LABELS.to_complete[lang] },
    { avatar: '💊', name: t(UI_LABELS.pharmacy, lang), role: pharmacyName || pharmacyAddress || UI_LABELS.to_complete[lang], link: pharmacyMapsUrl || '#', label: pharmacyMapsUrl ? 'Google Maps' : UI_LABELS.to_complete[lang] },
    { avatar: '🏥', name: t(UI_LABELS.hospital, lang), role: hospitalName || hospitalAddress || UI_LABELS.to_complete[lang], link: hospitalMapsUrl || '#', label: hospitalMapsUrl ? 'Google Maps' : UI_LABELS.to_complete[lang] },
  ];

  return (
    <div className="pt-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3.5 py-3.5 border-b border-border last:border-b-0">
          <div className="w-[38px] h-[38px] rounded-full bg-accent-light flex items-center justify-center text-lg shrink-0">
            {r.avatar}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{r.name}</div>
            <div className="text-xs text-ink-3">{r.role}</div>
          </div>
          <a href={r.link} className="text-sm text-accent font-medium whitespace-nowrap" target={r.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
            {r.label}
          </a>
        </div>
      ))}
      {electricalNote && (
        <div className="pt-3.5">
          <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1.5">
            {fieldLabel('urgences', 'electrical_note')?.[lang]}
          </div>
          <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">{electricalNote}</p>
          <BlockImages images={imgFor(images, 'urgences', 'electrical_note')} />
        </div>
      )}
    </div>
  );
}

function ChecklistBody({ v, lang, checked, onToggle }: { v: VFn; lang: Lang; checked: Set<number>; onToggle: (i: number) => void }) {
  const cleaningNote = v('checklist', 'cleaning_note', true);
  return (
    <>
      {cleaningNote && (
        <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line pt-2 pb-1">{cleaningNote}</p>
      )}
      <ul className="flex flex-col gap-2 pt-2">
      {CHECKLIST_ITEMS.map((item, i) => {
        const done = checked.has(i);
        return (
          <li
            key={i}
            onClick={() => onToggle(i)}
            className={`flex items-center gap-3 text-[0.92rem] cursor-pointer select-none transition-colors ${
              done ? 'text-ink-3 line-through' : 'text-ink-2'
            }`}
          >
            <div
              className={`w-[22px] h-[22px] rounded-md border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                done ? 'bg-accent border-accent' : 'bg-surface border-border'
              }`}
            >
              {done && <Icon name="checkmark" className="w-3 h-3 text-white" />}
            </div>
            {t(item, lang)}
          </li>
        );
      })}
      </ul>
    </>
  );
}
