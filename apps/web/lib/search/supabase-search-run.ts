import {
  buildSheetRows,
  sheetsAppendRows,
} from '@lead-phantom/services';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

import { buildStubLeadRowsForSearch } from '@/lib/search/stub-pipeline';

export type SupabaseSearchRunResult = {
  searchId: string;
  placesMatched: number;
  rowsUpserted: number;
  sheets: { appended: number };
};

/**
 * Production path: persists stub Places results to Supabase + logs export.
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

  const { data: profile } = await supabase
    .from('profiles_lp')
    .select('sheet_url')
    .eq('id', userId)
    .maybeSingle();

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

  const sheetRows = buildSheetRows(rows);
  const sheetTarget =
    profile?.sheet_url ??
    'https://docs.google.com/spreadsheets/d/demo-placeholder/edit'; /* TODO: require configured sheet */
  const sheetsResult = await sheetsAppendRows({
    spreadsheetIdOrUrl: sheetTarget,
    rows: sheetRows,
  });

  await supabase.from('lead_exports_lp').insert({
    search_id: search.id,
    sheet_url: sheetTarget,
    row_count: rows.length,
    status: 'completed',
    payload: { appended: sheetsResult.appended, stub: true },
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
    sheets: sheetsResult,
  };
}
