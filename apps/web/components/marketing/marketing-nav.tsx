'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { APP_NAME } from '@lead-phantom/shared';

import { Button } from '@/components/ui/button';
import { isPocMode } from '@/lib/config/app-mode';

const sections = [
  { href: '#how', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export function MarketingNav() {
  const poc = isPocMode();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-phantom-void/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt={APP_NAME} width={160} height={36} className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {sections.map((s) => (
            <a key={s.href} href={s.href} className="hover:text-primary">
              {s.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {poc ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/signup">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Start free</Link>
              </Button>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="marketing-mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div id="marketing-mobile-menu" className="border-t border-white/10 bg-phantom-void/95 md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3 text-sm">
            {sections.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-3">
            {poc ? (
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link href="/signup">Sign in</Link>
                </Button>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/signup">Start free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
