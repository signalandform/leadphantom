import { cn } from '@/lib/utils';

type Status = 'idle' | 'syncing' | 'running' | 'synced' | 'completed' | 'error' | 'failed' | string;

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  idle: {
    label: 'Idle',
    classes: 'bg-muted/60 text-muted-foreground ring-1 ring-inset ring-white/10',
  },
  syncing: {
    label: 'Syncing',
    classes: 'bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/40',
  },
  running: {
    label: 'Syncing',
    classes: 'bg-cyan-500/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/40',
  },
  synced: {
    label: 'Synced',
    classes: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/40',
  },
  completed: {
    label: 'Synced',
    classes: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/40',
  },
  error: {
    label: 'Error',
    classes: 'bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-400/40',
  },
  failed: {
    label: 'Error',
    classes: 'bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-400/40',
  },
};

export function StatusBadge({
  status,
  className,
  label,
}: {
  status: Status;
  className?: string;
  label?: string;
}) {
  const key = (status ?? '').toLowerCase();
  const conf = STATUS_STYLES[key] ?? {
    label: status || 'Unknown',
    classes: 'bg-muted/60 text-muted-foreground ring-1 ring-inset ring-white/10',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        conf.classes,
        className
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label ?? conf.label}
    </span>
  );
}
