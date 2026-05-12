'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4 rounded-xl border border-white/10 bg-card/60 p-4 md:grid-cols-2"
      action={(fd) =>
        startTransition(async () => {
          await createSearch(fd);
        })
      }
    >
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Dallas HVAC" required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="query_text">Query text</Label>
        <Input id="query_text" name="query_text" placeholder="HVAC contractors" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location_bias">Location bias</Label>
        <Input id="location_bias" name="location_bias" placeholder="Dallas, TX" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="radius_meters">Radius (meters)</Label>
        <Input id="radius_meters" name="radius_meters" type="number" placeholder="25000" />
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
  const [pending, startTransition] = useTransition();

  async function runSearch() {
    await runSearchSync(search.id);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-background/40 p-4">
      <form
        className="grid gap-3 md:grid-cols-2"
        action={(fd) =>
          startTransition(async () => {
            fd.append('id', search.id);
            await updateSearch(fd);
          })
        }
      >
        <input type="hidden" name="id" value={search.id} />
        <div className="space-y-2">
          <Label>Name</Label>
          <Input name="name" defaultValue={search.name} required />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex h-10 items-center rounded-md border border-input bg-muted/30 px-3 text-sm text-muted-foreground">
            {search.status}
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Query</Label>
          <Input name="query_text" defaultValue={search.query_text} required />
        </div>
        <div className="space-y-2">
          <Label>Location bias</Label>
          <Input name="location_bias" defaultValue={search.location_bias ?? ''} />
        </div>
        <div className="space-y-2">
          <Label>Radius (m)</Label>
          <Input name="radius_meters" type="number" defaultValue={search.radius_meters ?? ''} />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit" variant="secondary" disabled={pending}>
            Save
          </Button>
          <Button type="button" variant="outline" disabled={pending} onClick={() => void runSearch()}>
            Sync
          </Button>
          <LeadPreviewSheet searchName={search.name} locations={locations} />
          <LeadCsvExportButton searchName={search.name} locations={locations} />
        </div>
      </form>
      <form
        className="mt-3 inline-block"
        action={(fd) =>
          startTransition(async () => {
            fd.append('id', search.id);
            await deleteSearch(fd);
          })
        }
      >
        <input type="hidden" name="id" value={search.id} />
        <Button type="submit" variant="destructive" size="sm" disabled={pending}>
          Delete
        </Button>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">
        Last run:{' '}
        {search.last_run_at ? new Date(search.last_run_at).toLocaleString() : 'Not yet scheduled'}
      </p>
    </div>
  );
}
