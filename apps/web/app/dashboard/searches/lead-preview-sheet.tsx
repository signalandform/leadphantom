'use client';

import { LEAD_SHEET_COLUMN_HEADERS, type LeadLocationInsert } from '@lead-phantom/services';
import { Download, Loader2 } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

import { runSearchSync } from '@/app/dashboard/searches/actions';
import { Button } from '@/components/ui/button';
import { LocalDateTime } from '@/components/ui/local-datetime';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from '@/components/ui/toaster';
import type { Database } from '@/lib/database.types';
import { buildLeadsCsv } from '@/lib/leads-csv';

type LocationRow = Database['public']['Tables']['lead_locations_lp']['Row'];

function rowToInsert(row: LocationRow): LeadLocationInsert {
  return {
    search_id: row.search_id,
    place_id: row.place_id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    website: row.website,
    rating: row.rating,
    status: row.status,
    last_seen_at: row.last_seen_at,
  };
}

export function slugifyLeadsFilename(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'leads';
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Immediate CSV download using current row snapshot (no sheet UI). */
export function LeadCsvExportButton({
  searchName,
  locations,
  size = 'sm',
}: {
  searchName: string;
  locations: LocationRow[];
  size?: 'sm' | 'default';
}) {
  const [pending, setPending] = useState(false);

  async function downloadCsv() {
    if (pending) return;
    if (locations.length === 0) {
      toast({ variant: 'info', title: 'Nothing to export', description: 'Run Sync to collect leads first.' });
      return;
    }
    setPending(true);
    try {
      const csv = buildLeadsCsv(locations.map(rowToInsert));
      const filename = `${slugifyLeadsFilename(searchName)}-leads.csv`;
      triggerDownload(csv, filename);
      toast({
        variant: 'success',
        title: 'CSV downloaded',
        description: `${locations.length} row${locations.length === 1 ? '' : 's'} · ${filename}`,
      });
    } catch (e) {
      toast({
        variant: 'error',
        title: 'Export failed',
        description: e instanceof Error ? e.message : 'Unable to build the CSV.',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={pending || locations.length === 0}
      onClick={() => void downloadCsv()}
    >
      {pending ? (
        <span className="inline-flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Exporting…
        </span>
      ) : (
        'Export'
      )}
    </Button>
  );
}

export function LeadPreviewSheet({
  searchId,
  searchName,
  locations,
  triggerLabel = 'Preview',
  onSyncComplete,
}: {
  searchId?: string;
  searchName: string;
  locations: LocationRow[];
  triggerLabel?: string;
  onSyncComplete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const csv = useMemo(() => buildLeadsCsv(locations.map(rowToInsert)), [locations]);
  const [downloadPending, setDownloadPending] = useState(false);
  const [syncPending, startSync] = useTransition();

  function downloadCsv() {
    if (downloadPending) return;
    if (locations.length === 0) return;
    setDownloadPending(true);
    try {
      const filename = `${slugifyLeadsFilename(searchName)}-leads.csv`;
      triggerDownload(csv, filename);
      toast({
        variant: 'success',
        title: 'CSV downloaded',
        description: `${locations.length} row${locations.length === 1 ? '' : 's'} · ${filename}`,
      });
    } finally {
      setDownloadPending(false);
    }
  }

  function runSync() {
    if (!searchId) return;
    startSync(async () => {
      try {
        await runSearchSync(searchId);
        toast({ variant: 'success', title: `Synced ${searchName}`, description: 'Refreshing leads…' });
        onSyncComplete?.();
      } catch (e) {
        toast({
          variant: 'error',
          title: 'Sync failed',
          description: e instanceof Error ? e.message : 'Try again.',
        });
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex h-full max-h-screen w-full flex-col gap-4 overflow-hidden sm:max-w-[min(96vw,72rem)]"
      >
        <SheetHeader className="shrink-0 pr-8">
          <SheetTitle className="text-primary">Lead preview — {searchName}</SheetTitle>
          <SheetDescription>
            Spreadsheet-style view of stored places for this search. Export is manual — nothing is pushed to Google
            Sheets automatically.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {locations.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-white/15 bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No leads yet. Run Sync to populate this list.
              </p>
              {searchId ? (
                <Button type="button" disabled={syncPending} onClick={() => runSync()}>
                  {syncPending ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Syncing…
                    </span>
                  ) : (
                    'Sync now'
                  )}
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Button type="button" size="sm" onClick={downloadCsv} disabled={downloadPending}>
                  {downloadPending ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Exporting…
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <Download className="mr-2 h-4 w-4" aria-hidden />
                      Download CSV
                    </span>
                  )}
                </Button>
                <span className="flex items-center text-xs text-muted-foreground">
                  {locations.length} row{locations.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-white/10">
                <table className="min-w-max text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
                    <tr>
                      {LEAD_SHEET_COLUMN_HEADERS.map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-2 font-medium text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((row) => (
                      <tr key={row.id} className="border-t border-white/5 hover:bg-muted/20">
                        <td
                          className="max-w-[10rem] truncate px-3 py-2 font-mono text-primary"
                          title={row.place_id ?? ''}
                        >
                          {row.place_id}
                        </td>
                        <td className="max-w-[12rem] truncate px-3 py-2" title={row.name ?? ''}>
                          {row.name ?? ''}
                        </td>
                        <td className="max-w-[14rem] truncate px-3 py-2" title={row.address ?? ''}>
                          {row.address ?? ''}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">{row.phone ?? ''}</td>
                        <td
                          className="max-w-[12rem] truncate px-3 py-2 text-muted-foreground"
                          title={row.website ?? ''}
                        >
                          {row.website ?? ''}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">{row.rating ?? ''}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                          <LocalDateTime value={row.last_seen_at} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
