import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    footway?: string;
  };
};

/** Builds a short "182 Boulevard Voltaire"-style address from Nominatim's structured fields. */
function shortAddress(r: NominatimResult): string {
  const road = r.address?.road || r.address?.pedestrian || r.address?.footway;
  if (!road) return r.display_name;
  return r.address?.house_number ? `${r.address.house_number} ${road}` : road;
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        // Required by Nominatim's usage policy: https://operations.osmfoundation.org/policies/nominatim/
        'User-Agent': 'CarnetAccueil/1.0 (personal HomeExchange welcome book)',
      },
    });
    if (!res.ok) return NextResponse.json({ results: [] });

    const data = (await res.json()) as NominatimResult[];
    const results = data.map((r) => ({
      label: r.display_name,
      address: shortAddress(r),
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
