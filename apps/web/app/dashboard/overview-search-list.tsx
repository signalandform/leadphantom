'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { runSearchSync } from '@/app/dashboard/searches/actions';
import { LeadCsvExportButton, LeadPreviewSheet } from '@/app/dashboard/searches/lead-preview-sheet';
import { Button } from '@/components/ui/button';
import type { Database } from '@/lib/database.types';

type SearchRow = {
  id: string;
  name: string;
  query_text: string;
  location_bias: string | null;
  radius_meters: number | null;
  status: string;
  last_run_at: string | null;
};

type LocationRow = Database['public']['Tables']['lead_locations_lp']['Row'];

export function OverviewSearchList({
  searches,
  locationsBySearchId,
}: {
  searches: SearchRow[];
  locationsBySearchId: Record<string, LocationRow[]>;
}) {
  const router = useRouter();

  if (searches.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
        No searches yet —{' '}
        <Link href="/dashboard/searches" className="text-primary underline-offset-4 hover:underline">
          create one on the Searches tab
        </Link>
        .
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-card/40">
      {searches.map((search) => (
        <OverviewSearchRow
          key={search.id}
          search={search}
          locations={locationsBySearchId[search.id] ?? []}
          onSyncComplete={() => router.refresh()}
        />
      ))}
    </ul>
  );
}

function OverviewSearchRow({
  search,
  locations,
  onSyncComplete,
}: {
  search: SearchRow;
  locations: LocationRow[];
  onSyncComplete: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function runSync() {
    startTransition(async () => {
      await runSearchSync(search.id);
      onSyncComplete();
    });
  }

  const metaBits = [
    search.location_bias?.trim() || null,
    search.radius_meters != null ? `${search.radius_meters}m` : null,
    search.last_run_at ? `Last run ${new Date(search.last_run_at).toLocaleString()}` : null,
  ].filter(Boolean);

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-white">{search.name}</div>
        <div className="truncate text-sm text-muted-foreground">{search.query_text}</div>
        {metaBits.length > 0 ? (
          <div className="mt-1 truncate text-xs text-muted-foreground">{metaBits.join(' · ')}</div>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => void runSync()}>
          {pending ? 'Sync…' : 'Sync'}
        </Button>
        <LeadPreviewSheet searchName={search.name} locations={locations} triggerLabel="Preview" />
        <LeadCsvExportButton searchName={search.name} locations={locations} />
      </div>
    </li>
  );
}
