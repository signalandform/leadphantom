import { isPocMode } from '@/lib/config/app-mode';

/** Thin banner when running UI-only proof-of-concept mode. */
export function PocBanner() {
  if (!isPocMode()) return null;

  return (
    <div className="border-b border-primary/40 bg-primary/10 px-4 py-2 text-center text-xs text-primary md:text-sm">
      POC mode (default): mock data in memory — no auth, database, or APIs. Set{' '}
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
        NEXT_PUBLIC_POC_MODE=false
      </code>{' '}
      to enable Supabase + real persistence (see README).
    </div>
  );
}
