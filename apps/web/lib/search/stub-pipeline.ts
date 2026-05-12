import {
  normalizePlaceDetails,
  placesDetails,
  placesTextSearch,
  type LeadLocationInsert,
} from '@lead-phantom/services';

/** Shared Places stub pipeline — used by POC mock store and production Supabase runs. */
export async function buildStubLeadRowsForSearch(params: {
  searchId: string;
  queryText: string;
  locationBias: string | null;
  radiusMeters: number | null;
}): Promise<LeadLocationInsert[]> {
  const textHits = await placesTextSearch({
    query: params.queryText,
    locationBias: params.locationBias ?? undefined,
    radiusMeters: params.radiusMeters ?? undefined,
  });

  const rows: LeadLocationInsert[] = [];
  for (const hit of textHits) {
    const details = await placesDetails({ placeId: hit.place_id });
    rows.push(normalizePlaceDetails(params.searchId, details));
  }
  return rows;
}
