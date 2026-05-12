/** Stored in `lead_exports_lp.sheet_url` when sync did not push to an external spreadsheet. */
export const IN_APP_EXPORT_DESTINATION = 'in-app';

export function formatExportDestination(sheetUrl: string): string {
  return sheetUrl === IN_APP_EXPORT_DESTINATION ? 'Browser preview / CSV export' : sheetUrl;
}
