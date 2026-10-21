import { CITIES, YARDS, REGIONS } from '@/data/cities';
import type { City } from '@/data/types';

const EARTH_MI = 3958.8;

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MI * Math.asin(Math.sqrt(a));
}

type YardKey = keyof typeof YARDS;

let cache: City[] | null = null;

export function getCities(): City[] {
  if (cache) return cache;
  const yardKeys = Object.keys(YARDS) as YardKey[];
  cache = CITIES.map((c) => {
    const dists = yardKeys.map((k) => ({
      k,
      d: haversineMiles(c.lat, c.lng, YARDS[k].lat, YARDS[k].lng),
    }));
    dists.sort((a, b) => a.d - b.d);
    const yard = dists[0].k;
    const yardMiles = Math.round(dists[0].d * 10) / 10;
    const nearby = CITIES.filter((o) => o.slug !== c.slug)
      .map((o) => ({
        slug: o.slug,
        d: haversineMiles(c.lat, c.lng, o.lat, o.lng),
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 5)
      .map((o) => o.slug);
    return { ...c, yard, yardMiles, nearby };
  });
  return cache;
}

export function getCity(slug: string): City | undefined {
  return getCities().find((c) => c.slug === slug);
}

export function citiesByRegion(): { region: string; cities: City[] }[] {
  const cities = getCities();
  return REGIONS.map((region) => ({
    region,
    cities: cities.filter((c) => c.region === region),
  })).filter((g) => g.cities.length > 0);
}
