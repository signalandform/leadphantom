'use client';

import { LEAD_SHEET_COLUMN_HEADERS, type LeadLocationInsert } from '@lead-phantom/services';
import { Download } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  function downloadCsv() {
    const csv = buildLeadsCsv(locations.map(rowToInsert));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${slugifyLeadsFilename(searchName)}-leads.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={locations.length === 0}
      onClick={downloadCsv}
    >
      Export
    </Button>
  );
}

export function LeadPreviewSheet({
  searchName,
  locations,
  triggerLabel = 'Preview',
}: {
  searchName: string;
  locations: LocationRow[];
  triggerLabel?: string;
}) {
  const csv = useMemo(() => buildLeadsCsv(locations.map(rowToInsert)), [locations]);

  function downloadCsv() {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${slugifyLeadsFilename(searchName)}-leads.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-full max-h-screen w-full flex-col gap-4 overflow-hidden sm:max-w-[min(96vw,72rem)]">
        <SheetHeader className="shrink-0 pr-8">
          <SheetTitle className="text-primary">Lead preview — {searchName}</SheetTitle>
          <SheetDescription>
            Spreadsheet-style view of stored places for this search. Export is manual — nothing is pushed to Google
            Sheets automatically.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" size="sm" onClick={downloadCsv} disabled={locations.length === 0}>
              <Download className="mr-2 h-4 w-4" aria-hidden />
              Download CSV
            </Button>
            <span className="flex items-center text-xs text-muted-foreground">
              {locations.length === 0 ? 'No rows yet — run sync first.' : `${locations.length} row${locations.length === 1 ? '' : 's'}`}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-white/10">
            <table className="min-w-max text-left text-xs">
              <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm">
                <tr>
                  {LEAD_SHEET_COLUMN_HEADERS.map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {locations.map((row) => (
                  <tr key={row.id} className="border-t border-white/5 hover:bg-muted/20">
                    <td className="max-w-[10rem] truncate px-3 py-2 font-mono text-primary">{row.place_id}</td>
                    <td className="max-w-[12rem] truncate px-3 py-2">{row.name ?? ''}</td>
                    <td className="max-w-[14rem] truncate px-3 py-2">{row.address ?? ''}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.phone ?? ''}</td>
                    <td className="max-w-[12rem] truncate px-3 py-2 text-muted-foreground">{row.website ?? ''}</td>
                    <td className="whitespace-nowrap px-3 py-2">{row.rating ?? ''}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                      {new Date(row.last_seen_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
