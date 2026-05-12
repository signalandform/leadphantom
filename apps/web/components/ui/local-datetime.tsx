'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type Props = {
  value: string | null | undefined;
  fallback?: string;
  className?: string;
  format?: 'full' | 'date' | 'time';
};

function formatValue(value: string, format: NonNullable<Props['format']>): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  switch (format) {
    case 'date':
      return d.toLocaleDateString();
    case 'time':
      return d.toLocaleTimeString();
    case 'full':
    default:
      return d.toLocaleString();
  }
}

/** Renders a stable placeholder on the server, then formats the timestamp client-side after mount.
 *  Prevents hydration mismatches caused by `toLocaleString()` differing between server and browser. */
export function LocalDateTime({ value, fallback = '—', className, format = 'full' }: Props) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setText(null);
      return;
    }
    setText(formatValue(value, format));
  }, [value, format]);

  if (!value) {
    return <span className={cn(className)}>{fallback}</span>;
  }

  return (
    <span
      className={cn(className)}
      suppressHydrationWarning
      title={text ?? value}
    >
      {text ?? '…'}
    </span>
  );
}
