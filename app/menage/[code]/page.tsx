import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { MENAGE_SECTION, PRESTATION_PREFIX, parseDone, parseTasks } from '@/lib/menage';
import { fetchImages } from '@/lib/data';
import MenageApp from '@/components/MenageApp';

export const revalidate = 0;
export const metadata: Metadata = { title: 'Ménage', robots: { index: false, follow: false } };

export default async function MenagePage({ params }: { params: { code: string } }) {
  const section = `${PRESTATION_PREFIX}${params.code}`;
  const supabase = createAdminClient();
  const { data } = await supabase.from('content').select('section,key,value').in('section', [section, MENAGE_SECTION]);
  const rows = data ?? [];
  if (!rows.some((r) => r.section === section)) notFound();
  const images = (await fetchImages()).filter((i) => i.section === MENAGE_SECTION);
  const get = (sec: string, key: string) => rows.find((r) => r.section === sec && r.key === key)?.value ?? '';

  return (
    <MenageApp
      code={params.code}
      person={get(section, 'person')}
      date={get(section, 'date')}
      time={get(section, 'time')}
      duration={get(section, 'duration')}
      note={get(section, 'note')}
      images={images}
      groups={parseTasks(get(MENAGE_SECTION, 'tasks'))}
      initialDone={parseDone(get(section, 'done'))}
      thanksTitle={get(MENAGE_SECTION, 'thanks_title')}
      thanksMessage={get(MENAGE_SECTION, 'thanks_message')}
    />
  );
}
