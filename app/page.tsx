import { fetchContentMap, fetchPlaces, fetchImages } from '@/lib/data';
import VisitorApp from '@/components/VisitorApp';

export const revalidate = 0;

export default async function HomePage() {
  const [contentMap, places, images] = await Promise.all([
    fetchContentMap(),
    fetchPlaces(),
    fetchImages(),
  ]);

  return <VisitorApp contentMap={contentMap} places={places} images={images} />;
}
