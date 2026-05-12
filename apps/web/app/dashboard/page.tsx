import Link from 'next/link';

import { OverviewSearchList } from '@/app/dashboard/overview-search-list';
import { LocalDateTime } from '@/components/ui/local-datetime';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { isPocMode } from '@/lib/config/app-mode';
import type { Database } from '@/lib/database.types';
import {
  pocListLocationsForSearch,
  pocListSearches,
  pocOverviewStats,
} from '@/lib/mock/poc-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type LocationRow = Database['public']['Tables']['lead_locations_lp']['Row'];

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default async function DashboardOverviewPage() {
  let placesCount: number;
  let leadsAddedLast30Days: number;
  let lastSync: string | null;
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
    const s = pocOverviewStats();
    placesCount = s.placesCount;
    leadsAddedLast30Days = s.exportedRows;
    lastSync = s.lastSync;
    searches = pocListSearches();
    for (const x of searches) {
      locationsBySearchId.set(x.id, pocListLocationsForSearch(x.id));
    }
  } else {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data } = await supabase
      .from('lead_searches_lp')
      .select('*')
      .eq('user_id', user.id)
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

    placesCount = (locRows ?? []).length;

    const { data: exports } =
      searchIds.length === 0
        ? { data: [] as { row_count: number; ran_at: string }[] }
        : await supabase
            .from('lead_exports_lp')
            .select('row_count, ran_at')
            .in('search_id', searchIds)
            .order('ran_at', { ascending: false });

    const cutoff = Date.now() - THIRTY_DAYS_MS;
    leadsAddedLast30Days =
      exports?.reduce((acc, row) => {
        const ranAt = new Date(row.ran_at).getTime();
        return Number.isFinite(ranAt) && ranAt >= cutoff ? acc + (row.row_count ?? 0) : acc;
      }, 0) ?? 0;
    lastSync = exports?.[0]?.ran_at ?? null;
  }

  const locationsRecord = Object.fromEntries(locationsBySearchId) as Record<string, LocationRow[]>;

  const stats: { label: string; value: React.ReactNode; tooltip: string }[] = [
    {
      label: 'Total leads collected',
      value: placesCount,
      tooltip: 'Rows in lead_locations_lp for your searches.',
    },
    {
      label: 'Leads added in the last 30 days',
      value: leadsAddedLast30Days,
      tooltip: 'Sum of row_count per sync run in the last 30 days.',
    },
    {
      label: 'Last sync',
      value: <LocalDateTime value={lastSync} fallback="Never" />,
      tooltip: 'Latest sync completion time (lead_exports_lp.ran_at).',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Overview</h1>
        <p className="text-muted-foreground">
          {isPocMode()
            ? 'POC mode: mock data resets when the dev server restarts.'
            : 'Production runs hosted Maps-style lookups on Lead Phantom infrastructure — subscription & usage metering TODO. Manage sync, preview, and CSV export here; edit saved searches on the Searches tab.'}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-white/10 bg-card/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                {s.label}
                <span
                  aria-label={s.tooltip}
                  title={s.tooltip}
                  className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-white/20 text-[10px] text-muted-foreground"
                >
                  ?
                </span>
              </CardTitle>
              <CardDescription className="sr-only">{s.tooltip}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-card/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-primary">Searches</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sync, preview, and export per saved search —{' '}
            <Link href="/dashboard/searches" className="text-primary underline-offset-4 hover:underline">
              full editor on the Searches tab
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <OverviewSearchList searches={searches} locationsBySearchId={locationsRecord} />
        </CardContent>
      </Card>
    </div>
  );
}
