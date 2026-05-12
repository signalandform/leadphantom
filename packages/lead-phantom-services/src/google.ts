/**
 * Typed shapes for Google Places (Text Search / Details) and Sheets integration.
 * TODO: Replace stub implementations with real HTTP calls + error handling / retries.
 */

export type LeadLocationInsert = {
  search_id: string;
  place_id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  status: string;
  last_seen_at: string;
};

/** Minimal subset of Place Details JSON we normalize from the Places API. */
export type GooglePlaceDetailsPayload = {
  place_id?: string;
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
};

export type TextSearchResultStub = {
  place_id: string;
  name?: string;
};

/**
 * Maps a Google Place Details-like payload to the row shape stored in `lead_locations_lp`.
 * TODO: Extend when wiring real Places API field masks / newer Places API (New) responses.
 */
export function normalizePlaceDetails(
  searchId: string,
  payload: GooglePlaceDetailsPayload
): LeadLocationInsert {
  const placeId = payload.place_id ?? payload.id ?? '';
  const name = payload.displayName?.text ?? null;
  const phone =
    payload.nationalPhoneNumber ?? payload.internationalPhoneNumber ?? null;
  const lastSeen = new Date().toISOString();

  return {
    search_id: searchId,
    place_id: placeId,
    name,
    address: payload.formattedAddress ?? null,
    phone,
    website: payload.websiteUri ?? null,
    rating: typeof payload.rating === 'number' ? payload.rating : null,
    status: 'active',
    last_seen_at: lastSeen,
  };
}

export type SheetRow = string[];

/** Header labels aligned with each column produced by `buildSheetRows` (CSV / Sheets). */
export const LEAD_SHEET_COLUMN_HEADERS = [
  'place_id',
  'name',
  'address',
  'phone',
  'website',
  'rating',
  'last_seen_at',
] as const;

/**
 * Builds tabular rows for Google Sheets append requests.
 * Column order matches `LEAD_SHEET_COLUMN_HEADERS`.
 * TODO: Locale-specific formatting, batch limits.
 */
export function buildSheetRows(locations: LeadLocationInsert[]): SheetRow[] {
  return locations.map((loc) => [
    loc.place_id,
    loc.name ?? '',
    loc.address ?? '',
    loc.phone ?? '',
    loc.website ?? '',
    loc.rating !== null && loc.rating !== undefined ? String(loc.rating) : '',
    loc.last_seen_at,
  ]);
}

export type PlacesTextSearchParams = {
  query: string;
  locationBias?: string;
  radiusMeters?: number;
};

export type PlacesDetailsParams = {
  placeId: string;
};

/**
 * Stub: Text Search — replace with Google Places API HTTP client.
 * TODO: Use GOOGLE_API_KEY from server env; respect quotas; paginate next_page_token.
 */
export async function placesTextSearch(
  _params: PlacesTextSearchParams
): Promise<TextSearchResultStub[]> {
  return [
    { place_id: 'stub_place_1', name: 'Stub Business One' },
    { place_id: 'stub_place_2', name: 'Stub Business Two' },
  ];
}

/**
 * Stub: Place Details — replace with Place Details request.
 */
export async function placesDetails(
  params: PlacesDetailsParams
): Promise<GooglePlaceDetailsPayload> {
  return {
    place_id: params.placeId,
    displayName: { text: `Details for ${params.placeId}` },
    formattedAddress: '123 Phantom Ave',
    nationalPhoneNumber: '555-0100',
    websiteUri: 'https://example.com',
    rating: 4.7,
  };
}

export type SheetsAppendParams = {
  spreadsheetIdOrUrl: string;
  rows: SheetRow[];
};

/**
 * Stub: append rows to a spreadsheet.
 * TODO: Parse spreadsheet ID from URL; use OAuth or service account per product decision.
 */
export async function sheetsAppendRows(_params: SheetsAppendParams): Promise<{ appended: number }> {
  return { appended: _params.rows.length };
}
