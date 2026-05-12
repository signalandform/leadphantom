import Link from 'next/link';

import { APP_NAME, APP_TAGLINE } from '@lead-phantom/shared';

import { MarketingNav } from '@/components/marketing/marketing-nav';
import { isPocMode } from '@/lib/config/app-mode';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const faqs = [
  {
    q: 'Do I need my own Google Cloud billing account?',
    a: 'No — core Maps discovery runs on Lead Phantom’s pooled infrastructure and API keys. You pay us for included query quota per plan; optional BYOK may appear later for power users.',
  },
  {
    q: 'How are Maps queries billed?',
    a: 'Subscriptions bundle a monthly allotment of hosted Places-style lookups executed on our side. Overages and metering UI are TODO — wire Stripe (or similar) + usage counters before charging customers.',
  },
  {
    q: 'How often does Lead Phantom sync?',
    a: 'Right now sync is manual via the dashboard / API. TODO: add scheduled queue workers with retries and rate limits aligned to paid quotas.',
  },
  {
    q: 'Where do my leads go?',
    a: 'Rows stay in your workspace; preview and CSV export are in the dashboard. Optional push integrations (e.g. Sheets) should keep least-privilege credentials and audit logs.',
  },
];

export default function HomePage() {
  const startHref = isPocMode() ? '/dashboard' : '/signup';
  return (
    <div className="flex min-h-screen flex-col bg-phantom-void bg-phantom-grid bg-grid">
      <MarketingNav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-24 md:flex-row md:items-center md:py-28">
            <div className="flex-1 space-y-6">
              <p className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Hosted Maps queries · metered plans
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                Haunt Google Maps for{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                  high-intent leads
                </span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">{APP_TAGLINE}</p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href={startHref}>Get started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how">See how it works</Link>
                </Button>
              </div>
            </div>
            <Card className="flex-1 border-primary/30 shadow-neon">
              <CardHeader>
                <CardTitle className="text-primary">Hosted query pulse</CardTitle>
                <CardDescription>
                  Illustrative counters — production ties Places requests to subscription quota and our API keys.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Places monitored', value: 'XXX', hint: 'demo stat' },
                  { label: 'Maps runs (30d)', value: 'X,XXX', hint: 'hosted on LP infra' },
                  { label: 'Sync latency', value: '< Xm', hint: 'TODO queue SLA' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white/10 bg-background/40 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                    <p className="text-xs text-primary/80">{item.hint}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold text-white">How it works</h2>
            <p className="text-muted-foreground">
              Define geo searches; Lead Phantom executes Places-style lookups on our servers and pooled Maps keys under
              your plan quota, normalizes results, and stores structured leads for preview and CSV export.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: '1 · Configure searches',
                body: 'Save named queries with radius + location bias — CRUD lives in Supabase when POC mode is off.',
              },
              {
                title: '2 · Hosted Maps harvest',
                body: 'Paid tiers consume quota against Lead Phantom–managed Places requests (stubs today; production keys stay server-side).',
              },
              {
                title: '3 · Own your rows',
                body: 'Review leads in-app, export CSV, and audit sync runs — no surprise pushes to your spreadsheet.',
              },
            ].map((step) => (
              <Card key={step.title} className="border-white/10 bg-card/60">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{step.title}</CardTitle>
                  <CardDescription>{step.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing" className="border-y border-white/10 bg-gradient-to-b from-transparent to-phantom-mist/40">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="mb-4 text-3xl font-semibold text-white">Pricing</h2>
            <p className="mb-6 max-w-2xl text-muted-foreground">
              All figures are placeholders — ship metering + Stripe before quoting customers. You sell hosted Maps query
              capacity; keys never ship to the browser.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {(
                [
                  {
                    name: 'Starter',
                    price: '$XX.XX',
                    perMonth: true,
                    bullets: [
                      'Up to X active searches',
                      'X,XXX hosted Maps / Places lookups / mo (quota TBD)',
                      'In-app preview + CSV export',
                      'Email support',
                    ],
                  },
                  {
                    name: 'Growth',
                    price: '$XX.XX',
                    perMonth: true,
                    featured: true,
                    bullets: [
                      'Up to X active searches',
                      'XX,XXX hosted Maps / Places lookups / mo (quota TBD)',
                      'Higher sync priority (TODO)',
                      'Priority support',
                    ],
                  },
                  {
                    name: 'Phantom',
                    price: 'Custom',
                    priceSubtext: 'Volume floors from $XX.XX / mo (placeholder)',
                    bullets: [
                      'Custom hosted-query pools & regions',
                      'Dedicated rate limits (TODO)',
                      'Security review + SLA drafting',
                    ],
                  },
                ] as const
              ).map((tier) => (
                <Card
                  key={tier.name}
                  className={
                    'featured' in tier && tier.featured
                      ? 'border-primary shadow-neon'
                      : 'border-white/10 bg-background/40'
                  }
                >
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription className="space-y-1 text-3xl font-semibold text-white">
                      <div>
                        {tier.price}
                        {'perMonth' in tier && tier.perMonth ? (
                          <span className="text-base font-normal text-muted-foreground"> / mo</span>
                        ) : null}
                      </div>
                      {'priceSubtext' in tier && tier.priceSubtext ? (
                        <p className="text-sm font-normal text-muted-foreground">{tier.priceSubtext}</p>
                      ) : null}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {tier.bullets.map((b) => (
                        <li key={b}>• {b}</li>
                      ))}
                    </ul>
                    <Button
                      className="mt-6 w-full"
                      variant={'featured' in tier && tier.featured ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href={startHref}>Choose {tier.name}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="mb-6 text-3xl font-semibold text-white">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="border-t border-white/10 bg-phantom-ink/80 py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-semibold text-white">Ready to glide through Maps?</h3>
              <p className="text-muted-foreground">
                Subscribe for hosted Maps discovery quota, then invite your team — billing gates live requests.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href={startHref}>Create your workspace</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Pricing shown as $XX.XX placeholders — connect billing + usage meters
        before launch.
      </footer>
    </div>
  );
}
