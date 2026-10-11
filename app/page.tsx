import { fetchContentMap, fetchPlaces, fetchImages } from '@/lib/data';
import { applyStay, pickStay } from '@/lib/stay';
import VisitorApp from '@/components/VisitorApp';

export const revalidate = 0;

export default async function HomePage({ searchParams }: { searchParams: { s?: string } }) {
  const [rawMap, places, images] = await Promise.all([
    fetchContentMap(),
    fetchPlaces(),
    fetchImages(),
  ]);
  const { map: contentMap, stay } = applyStay(rawMap, pickStay(rawMap, searchParams.s));

  return <VisitorApp contentMap={contentMap} places={places} images={images} stay={stay} />;
}
