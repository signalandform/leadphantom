import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { isPocMode } from '@/lib/config/app-mode';
import { pocOverviewStats } from '@/lib/mock/poc-store';

export default async function DashboardOverviewPage() {
  let placesCount: number;
  let exportedRows: number;
  let lastSync: string | null;

  if (isPocMode()) {
    const s = pocOverviewStats();
    placesCount = s.placesCount;
    exportedRows = s.exportedRows;
    lastSync = s.lastSync;
  } else {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: searches } = await supabase
      .from('lead_searches_lp')
      .select('id')
      .eq('user_id', user.id);

    const searchIds = searches?.map((s) => s.id) ?? [];

    const { count } =
      searchIds.length === 0
        ? { count: 0 }
        : await supabase
            .from('lead_locations_lp')
            .select('*', { count: 'exact', head: true })
            .in('search_id', searchIds);

    placesCount = count ?? 0;

    const { data: exports } =
      searchIds.length === 0
        ? { data: [] as { row_count: number; ran_at: string }[] }
        : await supabase
            .from('lead_exports_lp')
            .select('row_count, ran_at')
            .in('search_id', searchIds)
            .order('ran_at', { ascending: false });

    exportedRows = exports?.reduce((acc, row) => acc + (row.row_count ?? 0), 0) ?? 0;
    lastSync = exports?.[0]?.ran_at ?? null;
  }

  const stats = [
    {
      label: 'Places monitored',
      value: placesCount,
      hint: 'Rows in lead_locations_lp for your searches',
    },
    {
      label: 'Rows from sync runs',
      value: exportedRows,
      hint: 'Sum of row_count per logged sync — CSV export is separate',
    },
    {
      label: 'Last sync',
      value: lastSync ? new Date(lastSync).toLocaleString() : 'Never',
      hint: 'Latest sync completion time (lead_exports_lp.ran_at)',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Overview</h1>
        <p className="text-muted-foreground">
          {isPocMode()
            ? 'POC mode: stats reflect in-memory mock data (resets when the dev server restarts).'
            : 'Stats load from Supabase when connected.'}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-white/10 bg-card/70">
            <CardHeader>
              <CardTitle className="text-base text-primary">{s.label}</CardTitle>
              <CardDescription>{s.hint}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
