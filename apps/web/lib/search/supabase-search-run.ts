import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

import { IN_APP_EXPORT_DESTINATION } from '@/lib/export-constants';
import { buildStubLeadRowsForSearch } from '@/lib/search/stub-pipeline';

export type SupabaseSearchRunResult = {
  searchId: string;
  placesMatched: number;
  rowsUpserted: number;
};

/**
 * Production path: persists stub Places results to Supabase + logs a run (no Google Sheets push).
 * TODO: Queue worker — keep in sync with any API route changes.
 */
export async function executeSupabaseSearchRun(
  supabase: SupabaseClient<Database>,
  userId: string,
  searchId: string
): Promise<SupabaseSearchRunResult> {
  const { data: search, error: searchError } = await supabase
    .from('lead_searches_lp')
    .select('*')
    .eq('id', searchId)
    .maybeSingle();

  if (searchError || !search || search.user_id !== userId) {
    throw new Error('Search not found');
  }

  await supabase.from('lead_searches_lp').update({ status: 'running' }).eq('id', search.id);

  const rows = await buildStubLeadRowsForSearch({
    searchId: search.id,
    queryText: search.query_text,
    locationBias: search.location_bias,
    radiusMeters: search.radius_meters,
  });

  if (rows.length > 0) {
    const { error: upsertError } = await supabase.from('lead_locations_lp').upsert(rows, {
      onConflict: 'search_id,place_id',
    });
    if (upsertError) {
      await supabase.from('lead_searches_lp').update({ status: 'error' }).eq('id', search.id);
      throw new Error(upsertError.message);
    }
  }

  await supabase.from('lead_exports_lp').insert({
    search_id: search.id,
    sheet_url: IN_APP_EXPORT_DESTINATION,
    row_count: rows.length,
    status: 'completed',
    payload: { stub: true, destination: 'in_app_preview' },
  });

  const now = new Date().toISOString();
  await supabase
    .from('lead_searches_lp')
    .update({ last_run_at: now, status: 'idle' })
    .eq('id', search.id);

  return {
    searchId: search.id,
    placesMatched: rows.length,
    rowsUpserted: rows.length,
  };
}
