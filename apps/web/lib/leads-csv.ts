import {
  buildSheetRows,
  LEAD_SHEET_COLUMN_HEADERS,
  type LeadLocationInsert,
} from '@lead-phantom/services';

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** RFC-style CSV (comma-separated) with header row; suitable for Excel / Sheets import. */
export function buildLeadsCsv(locations: LeadLocationInsert[]): string {
  const header = [...LEAD_SHEET_COLUMN_HEADERS].map(escapeCsvCell).join(',');
  const lines = buildSheetRows(locations).map((row) =>
    row.map((cell) => escapeCsvCell(cell)).join(',')
  );
  return [header, ...lines].join('\n');
}
