import { isPocMode } from '@/lib/config/app-mode';
import { pocListSearches } from '@/lib/mock/poc-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';

import { CreateSearchForm, SearchCard } from './search-forms';

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

  if (isPocMode()) {
    searches = pocListSearches();
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
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Searches</h1>
        <p className="text-muted-foreground">
          {isPocMode()
            ? 'CRUD + run sync use the in-memory mock store (same shapes as `lead_searches_lp`).'
            : 'CRUD backed by `lead_searches_lp`. Run sync uses server actions + Supabase.'}
        </p>
      </div>
      <CreateSearchForm />
      <div className="space-y-4">
        {searches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No searches yet — create one above.</p>
        ) : (
          searches.map((s) => <SearchCard key={s.id} search={s} />)
        )}
      </div>
    </div>
  );
}
