import { isPocMode } from '@/lib/config/app-mode';
import { cn } from '@/lib/utils';

type Variant = 'verbose' | 'slim';

/** Thin banner when running UI-only proof-of-concept mode. */
export function PocBanner({ variant = 'verbose' }: { variant?: Variant } = {}) {
  if (!isPocMode()) return null;

  if (variant === 'slim') {
    return (
      <div className="border-b border-primary/30 bg-primary/5 px-4 py-1 text-center text-[11px] text-primary/90">
        POC preview — data is mocked.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-b border-primary/40 bg-primary/10 px-4 py-2 text-center text-xs text-primary md:text-sm'
      )}
    >
      POC mode (default): mock data in memory — no auth, database, or APIs. Set{' '}
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
        NEXT_PUBLIC_POC_MODE=false
      </code>{' '}
      to enable Supabase + real persistence (see README).
    </div>
  );
}
