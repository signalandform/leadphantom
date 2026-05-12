'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalDateTime } from '@/components/ui/local-datetime';
import { StatusBadge } from '@/components/ui/status-badge';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

import type { Database } from '@/lib/database.types';

import { createSearch, deleteSearch, runSearchSync, updateSearch } from './actions';
import { LeadCsvExportButton, LeadPreviewSheet } from './lead-preview-sheet';

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

export function CreateSearchForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      className="grid gap-4 rounded-xl border border-white/10 bg-card/60 p-4 md:grid-cols-2"
      action={(fd) =>
        startTransition(async () => {
          try {
            await createSearch(fd);
            formRef.current?.reset();
            toast({ variant: 'success', title: 'Search created' });
          } catch (e) {
            toast({
              variant: 'error',
              title: 'Could not create search',
              description: e instanceof Error ? e.message : 'Check the form and try again.',
            });
          }
        })
      }
    >
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="create-name">Name</Label>
        <Input id="create-name" name="name" placeholder="Dallas HVAC" required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="create-query">Query text</Label>
        <Input id="create-query" name="query_text" placeholder="HVAC contractors" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-location">Location bias</Label>
        <Input id="create-location" name="location_bias" placeholder="Dallas, TX" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-radius">Radius (meters)</Label>
        <Input
          id="create-radius"
          name="radius_meters"
          type="number"
          placeholder="25000"
        />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Create search'}
        </Button>
      </div>
    </form>
  );
}

export function SearchCard({
  search,
  locations,
}: {
  search: SearchRow;
  locations: LocationRow[];
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [savePending, startSave] = useTransition();
  const [syncPending, startSync] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const liveStatus = syncPending ? 'syncing' : search.status;
  const busy = savePending || syncPending || deletePending;

  function handleSave(fd: FormData) {
    startSave(async () => {
      try {
        await updateSearch(fd);
        toast({ variant: 'success', title: `Saved ${search.name}` });
        router.refresh();
      } catch (e) {
        toast({
          variant: 'error',
          title: 'Save failed',
          description: e instanceof Error ? e.message : 'Try again.',
        });
      }
    });
  }

  function handleSync() {
    startSync(async () => {
      try {
        await runSearchSync(search.id);
        toast({
          variant: 'success',
          title: `Synced ${search.name}`,
          description: 'Refreshing leads…',
        });
        router.refresh();
      } catch (e) {
        toast({
          variant: 'error',
          title: 'Sync failed',
          description: e instanceof Error ? e.message : 'Try again.',
        });
      }
    });
  }

  function handleDelete() {
    startDelete(async () => {
      try {
        await deleteSearch(search.id);
        toast({ variant: 'success', title: `Deleted ${search.name}` });
        router.refresh();
      } catch (e) {
        toast({
          variant: 'error',
          title: 'Delete failed',
          description: e instanceof Error ? e.message : 'Try again.',
        });
      }
    });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-background/40">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-white">{search.name}</span>
            <StatusBadge status={liveStatus} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
            <span className="truncate">{search.query_text}</span>
            {search.location_bias ? (
              <>
                <span>·</span>
                <span className="truncate">{search.location_bias}</span>
              </>
            ) : null}
            {search.radius_meters != null ? (
              <>
                <span>·</span>
                <span>{search.radius_meters}m</span>
              </>
            ) : null}
            <span>·</span>
            <span>
              Last run{' '}
              {search.last_run_at ? <LocalDateTime value={search.last_run_at} /> : 'never'}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
          aria-hidden
        />
      </button>
      {expanded ? (
        <div className="border-t border-white/10 p-4">
          <form
            className="grid gap-3 md:grid-cols-2"
            action={(fd) => {
              fd.set('id', search.id);
              handleSave(fd);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor={`name-${search.id}`}>Name</Label>
              <Input
                id={`name-${search.id}`}
                name="name"
                defaultValue={search.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted/30 px-3 text-sm">
                <StatusBadge status={liveStatus} />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`query-${search.id}`}>Query</Label>
              <Input
                id={`query-${search.id}`}
                name="query_text"
                defaultValue={search.query_text}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`location-${search.id}`}>Location bias</Label>
              <Input
                id={`location-${search.id}`}
                name="location_bias"
                defaultValue={search.location_bias ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`radius-${search.id}`}>Radius (m)</Label>
              <Input
                id={`radius-${search.id}`}
                name="radius_meters"
                type="number"
                defaultValue={search.radius_meters ?? ''}
              />
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button type="submit" variant="secondary" disabled={busy}>
                {savePending ? 'Saving…' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleSync}
              >
                {syncPending ? (
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
                onSyncComplete={() => router.refresh()}
              />
              <LeadCsvExportButton searchName={search.name} locations={locations} />
              <ConfirmDialog
                trigger={
                  <Button type="button" variant="destructive" size="sm" disabled={busy}>
                    {deletePending ? 'Deleting…' : 'Delete'}
                  </Button>
                }
                title={`Delete "${search.name}"?`}
                description={
                  <>
                    This will permanently remove <strong>{search.name}</strong>, its collected
                    leads, and its sync history. This action cannot be undone.
                  </>
                }
                confirmLabel="Delete search"
                onConfirm={handleDelete}
              />
            </div>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Last run:{' '}
            {search.last_run_at ? (
              <LocalDateTime value={search.last_run_at} />
            ) : (
              'Not yet scheduled'
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}
