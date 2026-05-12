import {
  buildStubLeadRowsForSearch,
} from '@/lib/search/stub-pipeline';
import { NextResponse } from 'next/server';

import { isPocMode } from '@/lib/config/app-mode';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/** POST /api/searches/preview — disabled in POC mode (no HTTP API surface). */
export async function POST(request: Request) {
  if (isPocMode()) {
    return NextResponse.json(
      { error: 'Preview API is disabled in POC mode. Use the dashboard only.' },
      { status: 404 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { searchId?: string };
  try {
    body = (await request.json()) as { searchId?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const searchId = body.searchId;
  if (!searchId) {
    return NextResponse.json({ error: 'searchId required' }, { status: 400 });
  }

  const { data: search, error: searchError } = await supabase
    .from('lead_searches_lp')
    .select('*')
    .eq('id', searchId)
    .maybeSingle();

  if (searchError || !search || search.user_id !== user.id) {
    return NextResponse.json({ error: 'Search not found' }, { status: 404 });
  }

  const normalized = await buildStubLeadRowsForSearch({
    searchId: search.id,
    queryText: search.query_text,
    locationBias: search.location_bias,
    radiusMeters: search.radius_meters,
  });

  return NextResponse.json({
    searchId: search.id,
    previewCount: normalized.length,
    rows: normalized,
  });
}
