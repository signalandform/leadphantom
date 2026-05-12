import { isPocMode } from '@/lib/config/app-mode';
import type { Database } from '@/lib/database.types';
import { pocListLocationsForSearch, pocListSearches } from '@/lib/mock/poc-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';

import { CreateSearchForm, SearchCard } from './search-forms';

type LocationRow = Database['public']['Tables']['lead_locations_lp']['Row'];

export default async function SearchesPage() {
  let searches: {
    id: string;
    name: string;
    query_text: string;
    location_bias: string | null;
    radius_meters: number | null;
    status: string;
    last_run_at: string | null;
  }[];
  let locationsBySearchId = new Map<string, LocationRow[]>();

  if (isPocMode()) {
    searches = pocListSearches();
    for (const s of searches) {
      locationsBySearchId.set(s.id, pocListLocationsForSearch(s.id));
    }
  } else {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from('lead_searches_lp')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    searches = data ?? [];

    const searchIds = searches.map((x) => x.id);
    const { data: locRows } =
      searchIds.length === 0
        ? { data: [] as LocationRow[] }
        : await supabase.from('lead_locations_lp').select('*').in('search_id', searchIds);

    locationsBySearchId = new Map();
    for (const row of locRows ?? []) {
      const existing = locationsBySearchId.get(row.search_id) ?? [];
      existing.push(row);
      locationsBySearchId.set(row.search_id, existing);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Searches</h1>
        <p className="text-muted-foreground">
          {isPocMode()
            ? 'CRUD + run sync use the in-memory mock store (same shapes as `lead_searches_lp`).'
            : 'CRUD backed by `lead_searches_lp`. Sync persists leads — preview and CSV export stay in the browser.'}
        </p>
      </div>
      <CreateSearchForm />
      <div className="space-y-4">
        {searches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No searches yet — create one above.</p>
        ) : (
          searches.map((s) => (
            <SearchCard key={s.id} search={s} locations={locationsBySearchId.get(s.id) ?? []} />
          ))
        )}
      </div>
    </div>
  );
}
