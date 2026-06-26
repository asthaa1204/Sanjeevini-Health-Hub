import { createServerFn } from "@tanstack/react-start";

export type RemoteReview = {
  name: string;
  initials: string;
  rating: number;
  timeAgo: string;
  text: string;
  photo?: string | null;
};

export type GoogleReviewsPayload = {
  configured: boolean;
  rating: number | null;
  total: number | null;
  reviews: RemoteReview[];
  error?: string;
};

// Module-scope in-memory cache. Worker isolates are short-lived but this
// still avoids hammering Places API across rapid SSR renders.
let cache: { expires: number; data: GoogleReviewsPayload } | null = null;
const TTL_MS = 60 * 60 * 1000; // 1 hour

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "G";
}

export const getGoogleReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<GoogleReviewsPayload> => {
    if (cache && cache.expires > Date.now()) return cache.data;

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
      return { configured: false, rating: null, total: null, reviews: [] };
    }

    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "rating,userRatingCount,reviews",
          },
        },
      );
      if (!res.ok) {
        return {
          configured: true,
          rating: null,
          total: null,
          reviews: [],
          error: `Places API ${res.status}`,
        };
      }
      const json = (await res.json()) as {
        rating?: number;
        userRatingCount?: number;
        reviews?: Array<{
          rating?: number;
          relativePublishTimeDescription?: string;
          text?: { text?: string };
          originalText?: { text?: string };
          authorAttribution?: { displayName?: string; photoUri?: string };
        }>;
      };
      const data: GoogleReviewsPayload = {
        configured: true,
        rating: json.rating ?? null,
        total: json.userRatingCount ?? null,
        reviews: (json.reviews ?? []).slice(0, 6).map((r) => {
          const name = r.authorAttribution?.displayName ?? "Google User";
          return {
            name,
            initials: initialsOf(name),
            rating: r.rating ?? 5,
            timeAgo: r.relativePublishTimeDescription ?? "",
            text: r.text?.text ?? r.originalText?.text ?? "",
            photo: r.authorAttribution?.photoUri ?? null,
          };
        }),
      };
      cache = { expires: Date.now() + TTL_MS, data };
      return data;
    } catch (err) {
      return {
        configured: true,
        rating: null,
        total: null,
        reviews: [],
        error: err instanceof Error ? err.message : "fetch_failed",
      };
    }
  },
);