'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { APP_NAME } from '@lead-phantom/shared';

import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/searches', label: 'Searches' },
  { href: '/dashboard/exports', label: 'Exports' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-phantom-void/90 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-base font-semibold tracking-tight text-primary">
          {APP_NAME}
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 text-sm" aria-label="Dashboard sections">
        {links.map(({ href, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 transition-colors',
                active
                  ? 'bg-primary/20 text-primary ring-1 ring-inset ring-primary/40'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
