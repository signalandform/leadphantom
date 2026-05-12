'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';

import { runSearchSync } from '@/app/dashboard/searches/actions';
import { LeadCsvExportButton, LeadPreviewSheet } from '@/app/dashboard/searches/lead-preview-sheet';
import { Button } from '@/components/ui/button';
import { LocalDateTime } from '@/components/ui/local-datetime';
import { StatusBadge } from '@/components/ui/status-badge';
import { toast } from '@/components/ui/toaster';
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
      try {
        await runSearchSync(search.id);
        toast({
          variant: 'success',
          title: `Synced ${search.name}`,
          description: 'Refreshing leads…',
        });
        onSyncComplete();
      } catch (e) {
        toast({
          variant: 'error',
          title: 'Sync failed',
          description: e instanceof Error ? e.message : 'Try again in a moment.',
        });
      }
    });
  }

  const metaBits: React.ReactNode[] = [];
  if (search.location_bias?.trim()) metaBits.push(search.location_bias.trim());
  if (search.radius_meters != null) metaBits.push(`${search.radius_meters}m`);
  if (search.last_run_at) {
    metaBits.push(
      <span key="last-run">
        Last run <LocalDateTime value={search.last_run_at} />
      </span>
    );
  }

  const liveStatus = pending ? 'syncing' : search.status;

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-white">{search.name}</span>
          <StatusBadge status={liveStatus} />
        </div>
        <div className="truncate text-sm text-muted-foreground">{search.query_text}</div>
        {metaBits.length > 0 ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-1 truncate text-xs text-muted-foreground">
            {metaBits.map((m, i) => (
              <span key={i} className="contents">
                {i > 0 ? <span className="mx-1">·</span> : null}
                {m}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => void runSync()}>
          {pending ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Syncing…
            </span>
          ) : (
            'Sync'
          )}
        </Button>
        <LeadPreviewSheet
          searchId={search.id}
          searchName={search.name}
          locations={locations}
          triggerLabel="Preview"
        />
        <LeadCsvExportButton searchName={search.name} locations={locations} />
      </div>
    </li>
  );
}
