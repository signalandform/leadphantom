import Link from 'next/link';

import { APP_NAME } from '@lead-phantom/shared';

import { isPocMode } from '@/lib/config/app-mode';
import { Button } from '@/components/ui/button';

export function MarketingNav() {
  const poc = isPocMode();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-phantom-void/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt={APP_NAME} width={160} height={36} className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="hover:text-primary">
            How it works
          </a>
          <a href="#pricing" className="hover:text-primary">
            Pricing
          </a>
          <a href="#faq" className="hover:text-primary">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {poc ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Open POC</Link>
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
      </div>
    </header>
  );
}
