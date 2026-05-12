import {
  buildSheetRows,
  sheetsAppendRows,
} from '@lead-phantom/services';

import type { Database } from '@/lib/database.types';

import { POC_USER_ID } from '@/lib/config/app-mode';
import { buildStubLeadRowsForSearch } from '@/lib/search/stub-pipeline';

type ProfileRow = Database['public']['Tables']['profiles_lp']['Row'];
type SearchRow = Database['public']['Tables']['lead_searches_lp']['Row'];
type LocationRow = Database['public']['Tables']['lead_locations_lp']['Row'];
type ExportRow = Database['public']['Tables']['lead_exports_lp']['Row'];
type CredRow = Database['public']['Tables']['api_credentials_lp']['Row'];

type Store = {
  profile: ProfileRow;
  searches: SearchRow[];
  locations: LocationRow[];
  exports: ExportRow[];
  credentials: CredRow[];
};

const SEARCH_DALLAS = '22222222-2222-4222-8222-222222222222';
const SEARCH_AUSTIN = '33333333-3333-4333-8333-333333333333';

const nowIso = () => new Date().toISOString();

function initialStore(): Store {
  const t = nowIso();
  return {
    profile: {
      id: POC_USER_ID,
      company_name: 'Phantom Demo Co.',
      industry: 'Home services',
      sheet_url: 'https://docs.google.com/spreadsheets/d/demo-sheet-id/edit',
      google_api_key: null,
      onboarded: false,
      created_at: t,
      updated_at: t,
    },
    searches: [
      {
        id: SEARCH_DALLAS,
        user_id: POC_USER_ID,
        name: 'Dallas HVAC',
        query_text: 'HVAC contractors',
        location_bias: 'Dallas, TX',
        radius_meters: 25000,
        status: 'idle',
        last_run_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: t,
        updated_at: t,
      },
      {
        id: SEARCH_AUSTIN,
        user_id: POC_USER_ID,
        name: 'Austin Dentists',
        query_text: 'family dentist',
        location_bias: 'Austin, TX',
        radius_meters: 15000,
        status: 'idle',
        last_run_at: new Date(Date.now() - 172800000).toISOString(),
        created_at: t,
        updated_at: t,
      },
    ],
    locations: [
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        search_id: SEARCH_DALLAS,
        place_id: 'demo_place_dallas_1',
        name: 'Neon Cool HVAC',
        address: '100 Specter Ln, Dallas, TX',
        phone: '214-555-0101',
        website: 'https://example.com/neon-hvac',
        rating: 4.8,
        status: 'active',
        last_seen_at: t,
      },
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
        search_id: SEARCH_DALLAS,
        place_id: 'demo_place_dallas_2',
        name: 'Phantom Air Pros',
        address: '404 Glow Dr, Dallas, TX',
        phone: '214-555-0102',
        website: null,
        rating: 4.5,
        status: 'active',
        last_seen_at: t,
      },
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
        search_id: SEARCH_AUSTIN,
        place_id: 'demo_place_austin_1',
        name: 'Smile Spectrum Dental',
        address: '9 Circuit Ave, Austin, TX',
        phone: '512-555-0199',
        website: 'https://example.com/smile',
        rating: 4.9,
        status: 'active',
        last_seen_at: t,
      },
    ],
    exports: [
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
        search_id: SEARCH_DALLAS,
        sheet_url: 'https://docs.google.com/spreadsheets/d/demo-sheet-id/edit',
        row_count: 2,
        status: 'completed',
        ran_at: new Date(Date.now() - 43200000).toISOString(),
        payload: { demo: true },
      },
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
        search_id: SEARCH_AUSTIN,
        sheet_url: 'https://docs.google.com/spreadsheets/d/demo-sheet-id/edit',
        row_count: 1,
        status: 'completed',
        ran_at: new Date(Date.now() - 108000000).toISOString(),
        payload: { demo: true },
      },
    ],
    credentials: [],
  };
}

const g = globalThis as typeof globalThis & { __leadPhantomPocStore?: Store };

function getStore(): Store {
  if (!g.__leadPhantomPocStore) {
    g.__leadPhantomPocStore = initialStore();
  }
  return g.__leadPhantomPocStore;
}

export function pocGetProfile(): ProfileRow {
  return getStore().profile;
}

export function pocUpdateProfile(partial: {
  sheet_url: string | null;
  google_api_key: string | null;
}): void {
  const s = getStore();
  const t = nowIso();
  s.profile = {
    ...s.profile,
    ...partial,
    updated_at: t,
  };
  if (partial.google_api_key) {
    const existing = s.credentials.findIndex(
      (c) => c.user_id === POC_USER_ID && c.provider === 'google_places'
    );
    const row: CredRow = {
      id: existing >= 0 ? s.credentials[existing].id : crypto.randomUUID(),
      user_id: POC_USER_ID,
      provider: 'google_places',
      encrypted_key: partial.google_api_key,
      created_at: existing >= 0 ? s.credentials[existing].created_at : t,
      updated_at: t,
    };
    if (existing >= 0) s.credentials[existing] = row;
    else s.credentials.push(row);
  }
}

export function pocListSearches(): SearchRow[] {
  return [...getStore().searches].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function pocInsertSearch(input: {
  name: string;
  query_text: string;
  location_bias: string | null;
  radius_meters: number | null;
}): void {
  const s = getStore();
  const t = nowIso();
  s.searches.push({
    id: crypto.randomUUID(),
    user_id: POC_USER_ID,
    name: input.name,
    query_text: input.query_text,
    location_bias: input.location_bias,
    radius_meters: input.radius_meters,
    status: 'idle',
    last_run_at: null,
    created_at: t,
    updated_at: t,
  });
}

export function pocUpdateSearch(
  id: string,
  input: {
    name: string;
    query_text: string;
    location_bias: string | null;
    radius_meters: number | null;
  }
): void {
  const s = getStore();
  const idx = s.searches.findIndex((x) => x.id === id && x.user_id === POC_USER_ID);
  if (idx < 0) throw new Error('Search not found');
  const t = nowIso();
  s.searches[idx] = {
    ...s.searches[idx],
    ...input,
    updated_at: t,
  };
}

export function pocDeleteSearch(id: string): void {
  const s = getStore();
  s.searches = s.searches.filter((x) => !(x.id === id && x.user_id === POC_USER_ID));
  s.locations = s.locations.filter((l) => l.search_id !== id);
  s.exports = s.exports.filter((e) => e.search_id !== id);
}

export function pocListExports(): ExportRow[] {
  const ids = new Set(getStore().searches.filter((x) => x.user_id === POC_USER_ID).map((x) => x.id));
  return getStore()
    .exports.filter((e) => ids.has(e.search_id))
    .sort((a, b) => new Date(b.ran_at).getTime() - new Date(a.ran_at).getTime());
}

export function pocOverviewStats(): {
  placesCount: number;
  exportedRows: number;
  lastSync: string | null;
} {
  const s = getStore();
  const searchIds = new Set(s.searches.filter((x) => x.user_id === POC_USER_ID).map((x) => x.id));
  const placesCount = s.locations.filter((l) => searchIds.has(l.search_id)).length;
  const relevantExports = s.exports.filter((e) => searchIds.has(e.search_id));
  const exportedRows = relevantExports.reduce((acc, e) => acc + e.row_count, 0);
  const lastSync =
    relevantExports.length > 0
      ? [...relevantExports].sort(
          (a, b) => new Date(b.ran_at).getTime() - new Date(a.ran_at).getTime()
        )[0].ran_at
      : null;
  return { placesCount, exportedRows, lastSync };
}

/** Runs stub Places pipeline into mock store (mirrors production persistence shape). */
export async function pocRunSearchSync(searchId: string): Promise<void> {
  const s = getStore();
  const search = s.searches.find((x) => x.id === searchId && x.user_id === POC_USER_ID);
  if (!search) throw new Error('Search not found');

  search.status = 'running';

  const inserts = await buildStubLeadRowsForSearch({
    searchId: search.id,
    queryText: search.query_text,
    locationBias: search.location_bias,
    radiusMeters: search.radius_meters,
  });

  for (const ins of inserts) {
    const idx = s.locations.findIndex(
      (l) => l.search_id === ins.search_id && l.place_id === ins.place_id
    );
    const row: LocationRow = {
      id: idx >= 0 ? s.locations[idx].id : crypto.randomUUID(),
      search_id: ins.search_id,
      place_id: ins.place_id,
      name: ins.name,
      address: ins.address,
      phone: ins.phone,
      website: ins.website,
      rating: ins.rating,
      status: ins.status,
      last_seen_at: ins.last_seen_at,
    };
    if (idx >= 0) s.locations[idx] = row;
    else s.locations.push(row);
  }

  const sheetRows = buildSheetRows(inserts);
  const sheetTarget =
    s.profile.sheet_url ??
    'https://docs.google.com/spreadsheets/d/demo-placeholder/edit';
  const sheetsResult = await sheetsAppendRows({
    spreadsheetIdOrUrl: sheetTarget,
    rows: sheetRows,
  });

  const ranAt = nowIso();
  s.exports.push({
    id: crypto.randomUUID(),
    search_id: search.id,
    sheet_url: sheetTarget,
    row_count: inserts.length,
    status: 'completed',
    ran_at: ranAt,
    payload: { appended: sheetsResult.appended, stub: true, poc: true },
  });

  search.last_run_at = ranAt;
  search.status = 'idle';
  search.updated_at = ranAt;
}

export function pocUpdateOnboarding(updates: {
  company_name: string | null;
  industry: string | null;
  sheet_url: string | null;
  google_api_key: string | null;
  onboarded: boolean;
}): void {
  const s = getStore();
  const t = nowIso();
  s.profile = {
    ...s.profile,
    company_name: updates.company_name,
    industry: updates.industry,
    sheet_url: updates.sheet_url,
    google_api_key: updates.google_api_key || null,
    onboarded: updates.onboarded,
    updated_at: t,
  };
  if (updates.google_api_key) {
    const existing = s.credentials.findIndex(
      (c) => c.user_id === POC_USER_ID && c.provider === 'google_places'
    );
    const row: CredRow = {
      id: existing >= 0 ? s.credentials[existing].id : crypto.randomUUID(),
      user_id: POC_USER_ID,
      provider: 'google_places',
      encrypted_key: updates.google_api_key,
      created_at: existing >= 0 ? s.credentials[existing].created_at : t,
      updated_at: t,
    };
    if (existing >= 0) s.credentials[existing] = row;
    else s.credentials.push(row);
  }
}
