import { NextResponse } from 'next/server';

import { isPocMode } from '@/lib/config/app-mode';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { executeSupabaseSearchRun } from '@/lib/search/supabase-search-run';

/**
 * POST /api/searches/run
 * Disabled when `NEXT_PUBLIC_POC_MODE=true` — dashboard uses server actions + mock store instead.
 * TODO: Move orchestration to a durable queue (Inngest, Temporal, Supabase Queues) with retries + rate limits.
 */
export async function POST(request: Request) {
  if (isPocMode()) {
    return NextResponse.json(
      { error: 'Run API is disabled in POC mode. Use “Run sync” in the dashboard.' },
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

  try {
    const result = await executeSupabaseSearchRun(supabase, user.id, searchId);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Run failed';
    const status = message === 'Search not found' ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
