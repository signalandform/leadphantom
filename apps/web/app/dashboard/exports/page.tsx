import { isPocMode } from '@/lib/config/app-mode';
import { formatExportDestination } from '@/lib/export-constants';
import { pocListExports } from '@/lib/mock/poc-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function ExportsPage() {
  let exports: {
    id: string;
    search_id: string;
    sheet_url: string;
    row_count: number;
    status: string;
    ran_at: string;
  }[];

  if (isPocMode()) {
    exports = pocListExports();
  } else {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: searches } = await supabase
      .from('lead_searches_lp')
      .select('id')
      .eq('user_id', user!.id);

    const ids = searches?.map((s) => s.id) ?? [];

    const { data } =
      ids.length === 0
        ? { data: [] }
        : await supabase
            .from('lead_exports_lp')
            .select('*')
            .in('search_id', ids)
            .order('ran_at', { ascending: false });

    exports = data ?? [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Exports</h1>
        <p className="text-muted-foreground">
          {isPocMode()
            ? 'Mock run history — mirrors `lead_exports_lp`. Destination reflects how rows were handled.'
            : 'Sync runs append rows to stored leads and log runs here. Use Preview & CSV on each search — Google Sheets is not pushed automatically.'}
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Search</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Rows</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ran at</th>
            </tr>
          </thead>
          <tbody>
            {exports.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                  No exports yet — run a search sync from the Searches tab.
                </td>
              </tr>
            ) : (
              exports.map((exp) => (
                <tr key={exp.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{exp.search_id}</td>
                  <td className="max-w-md truncate px-4 py-3 text-muted-foreground">
                    {formatExportDestination(exp.sheet_url)}
                  </td>
                  <td className="px-4 py-3">{exp.row_count}</td>
                  <td className="px-4 py-3">{exp.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(exp.ran_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
