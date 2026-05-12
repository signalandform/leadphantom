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
    q: 'Do I need a Google Cloud billing account?',
    a: 'You will need Places API access for production traffic. This scaffold ships with stubs so you can demo UI flows without billing enabled.',
  },
  {
    q: 'How often does Lead Phantom sync?',
    a: 'Right now sync is manual via the dashboard / API. TODO: add scheduled queue workers with retries and rate limiting.',
  },
  {
    q: 'Is my spreadsheet data secure?',
    a: 'Exports should use least-privilege OAuth or service accounts. TODO: wire dedicated credentials and audit logs.',
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
                Phantom-grade Maps intel
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
                <CardTitle className="text-primary">Live phantom pulse</CardTitle>
                <CardDescription>
                  Neon telemetry preview — wire your Supabase project to see real counts.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Places monitored', value: '128', hint: 'demo stat' },
                  { label: 'Leads exported', value: '960', hint: 'last 30d' },
                  { label: 'Sync latency', value: '< 5m', hint: 'TODO queue SLA' },
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
              Define geo searches, let Places stubs (later: live API) populate structured rows,
              then pipe everything into your spreadsheet.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: '1 · Configure searches',
                body: 'Save named queries with radius + location bias — CRUD lives in Supabase.',
              },
              {
                title: '2 · Harvest Places',
                body: 'Route handlers call Google service stubs, normalize payloads, upsert leads.',
              },
              {
                title: '3 · Export quietly',
                body: 'Append rows to Sheets with audited exports logged per run.',
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
            <h2 className="mb-10 text-3xl font-semibold text-white">Pricing</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  name: 'Starter',
                  price: '$49',
                  bullets: ['5 active searches', '2k exports / mo', 'Email support'],
                },
                {
                  name: 'Growth',
                  price: '$149',
                  featured: true,
                  bullets: ['25 searches', '25k exports', 'Priority sync TODO'],
                },
                {
                  name: 'Phantom',
                  price: 'Talk to us',
                  bullets: ['Custom queues', 'Dedicated regions', 'SLA drafting'],
                },
              ].map((tier) => (
                <Card
                  key={tier.name}
                  className={
                    tier.featured
                      ? 'border-primary shadow-neon'
                      : 'border-white/10 bg-background/40'
                  }
                >
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription className="text-3xl font-semibold text-white">
                      {tier.price}
                      {tier.price.startsWith('$') ? (
                        <span className="text-base font-normal text-muted-foreground"> / mo</span>
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
                      variant={tier.featured ? 'default' : 'outline'}
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
              <p className="text-muted-foreground">Spin up Supabase locally and invite your team.</p>
            </div>
            <Button size="lg" asChild>
              <Link href={startHref}>Create your workspace</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Demo scaffolding — replace pricing before launch.
      </footer>
    </div>
  );
}
