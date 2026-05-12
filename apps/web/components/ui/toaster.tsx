'use client';

import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastRecord = ToastInput & {
  id: number;
};

let counter = 0;
const listeners = new Set<(t: ToastRecord) => void>();

export function toast(input: ToastInput): void {
  if (typeof window === 'undefined') return;
  const record: ToastRecord = { id: ++counter, variant: 'info', durationMs: 4000, ...input };
  listeners.forEach((fn) => fn(record));
}

const VARIANT_STYLES: Record<ToastVariant, { ring: string; icon: ReactNode }> = {
  success: {
    ring: 'ring-emerald-400/40',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />,
  },
  error: {
    ring: 'ring-rose-400/40',
    icon: <TriangleAlert className="h-4 w-4 text-rose-300" aria-hidden />,
  },
  info: {
    ring: 'ring-cyan-400/40',
    icon: <Info className="h-4 w-4 text-cyan-300" aria-hidden />,
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  useEffect(() => {
    function push(t: ToastRecord) {
      setToasts((cur) => [...cur, t]);
      window.setTimeout(() => {
        setToasts((cur) => cur.filter((x) => x.id !== t.id));
      }, t.durationMs ?? 4000);
    }
    listeners.add(push);
    return () => {
      listeners.delete(push);
    };
  }, []);

  function dismiss(id: number) {
    setToasts((cur) => cur.filter((x) => x.id !== id));
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
    >
      {toasts.map((t) => {
        const v = VARIANT_STYLES[t.variant ?? 'info'];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-white/10 bg-card/95 px-4 py-3 text-sm text-foreground shadow-lg backdrop-blur ring-1',
              v.ring,
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2'
            )}
            data-state="open"
          >
            <span className="mt-0.5 shrink-0">{v.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-tight text-foreground">{t.title}</p>
              {t.description ? (
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
