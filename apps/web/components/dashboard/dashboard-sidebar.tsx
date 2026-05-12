'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { APP_NAME } from '@lead-phantom/shared';
import { LayoutDashboard, Search, Sheet, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/searches', label: 'Searches', icon: Search },
  { href: '/dashboard/exports', label: 'Exports', icon: Sheet },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar({ pocMode = false }: { pocMode?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-phantom-ink/90 p-4 md:block">
      <Link href="/" className="mb-8 block text-lg font-semibold tracking-tight text-primary">
        {APP_NAME}
      </Link>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/15 text-primary shadow-[0_0_16px_rgba(34,211,238,0.15)]'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 space-y-2 text-xs text-muted-foreground">
        {pocMode ? (
          <p>
            POC mode: in-memory mock store. Set{' '}
            <span className="font-mono text-primary">NEXT_PUBLIC_POC_MODE=false</span> to use
            Supabase + APIs (see README).
          </p>
        ) : (
          <p>
            Background sync jobs run via route handlers for now.{' '}
            <span className="text-primary/80">TODO:</span> queue worker.
          </p>
        )}
      </div>
    </aside>
  );
}
