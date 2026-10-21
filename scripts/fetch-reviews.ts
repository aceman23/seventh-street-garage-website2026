import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------- types ----------
interface PlacesReviewAuthor {
  displayName?: string;
  profilePhotoUrl?: string;
}

interface PlacesReview {
  rating?: number;
  text?: { text?: string };
  authorAttribution?: PlacesReviewAuthor;
  relativePublishTimeDescription?: string;
  publishTime?: string;
}

interface PlacesResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
}

interface OutputReview {
  author: string;
  photo: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
}

interface OutputFile {
  source: string;
  updated: string;
  placeUrl: string;
  reviews: OutputReview[];
}

// ---------- config ----------
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;

if (!API_KEY || !PLACE_ID) {
  console.error(
    'Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID. Copy .env.example to .env and fill in both values.',
  );
  process.exit(1);
}

const FIELD_MASK =
  'rating,userRatingCount,googleMapsUri,reviews';
const URL = `https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE_ID)}`;

async function main(): Promise<void> {
  const res = await fetch(URL, {
    headers: {
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': FIELD_MASK,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Google Places API error ${res.status}: ${body}`);
    process.exit(1);
  }

  const data = (await res.json()) as PlacesResponse;

  const allReviews = data.reviews ?? [];
  const filtered: OutputReview[] = allReviews
    .filter((r) => (r.rating ?? 0) >= 4 && (r.text?.text ?? '').trim().length > 0)
    .map((r) => ({
      author: r.authorAttribution?.displayName ?? 'Google user',
      photo: r.authorAttribution?.profilePhotoUrl ?? '',
      rating: r.rating ?? 0,
      text: (r.text?.text ?? '').trim(),
      relativeTime: r.relativePublishTimeDescription ?? '',
      time: r.publishTime
        ? Math.floor(new Date(r.publishTime).getTime() / 1000)
        : 0,
    }));

  const output: OutputFile = {
    source: 'google_places',
    updated: new Date().toISOString(),
    placeUrl: data.googleMapsUri ?? '',
    reviews: filtered,
  };

  const outPath = resolve(process.cwd(), 'public/data/reviews.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`Wrote ${filtered.length} reviews to ${outPath}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
