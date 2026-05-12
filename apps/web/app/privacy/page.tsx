import Link from 'next/link';

import { APP_NAME } from '@lead-phantom/shared';

import { MarketingNav } from '@/components/marketing/marketing-nav';

export const metadata = {
  title: 'Privacy',
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-phantom-void bg-phantom-grid bg-grid">
      <MarketingNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <h1 className="text-3xl font-semibold text-white">Privacy</h1>
        <p className="mt-4 text-muted-foreground">
          {APP_NAME} is in early preview. A full privacy policy will live here before billing goes
          live. For questions, reach us at{' '}
          <a className="text-primary hover:underline" href="mailto:hello@leadphantom.app">
            hello@leadphantom.app
          </a>
          .
        </p>
        <p className="mt-8 text-sm">
          <Link href="/" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
