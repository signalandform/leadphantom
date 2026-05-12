'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { MarketingNav } from '@/components/marketing/marketing-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabase } from '@/hooks/use-supabase';

const pocDefault =
  typeof process.env.NEXT_PUBLIC_POC_MODE === 'undefined' ||
  process.env.NEXT_PUBLIC_POC_MODE !== 'false';

export function SignupForm() {
  const supabase = useSupabase();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage(null);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
      return;
    }
    setStatus('sent');
    setMessage('Check your inbox for the Lead Phantom magic link.');
  }

  return (
    <div className="min-h-screen bg-phantom-void">
      <MarketingNav />
      <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-16">
        {pocDefault ? (
          <Card className="border-primary/30 shadow-neon">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Auth not used in POC mode</CardTitle>
              <CardDescription>
                Magic links and Supabase login are disabled while{' '}
                <span className="font-mono text-primary">NEXT_PUBLIC_POC_MODE</span> is unset or not{' '}
                <span className="font-mono">false</span>. Open the dashboard to try mock data flows.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                When you are ready for real auth + persistence, set{' '}
                <code className="font-mono text-primary">NEXT_PUBLIC_POC_MODE=false</code> and
                configure Supabase (see README).
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/30 shadow-neon">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Sign in with magic link</CardTitle>
              <CardDescription>
                Passwordless auth powered by Supabase — production installs should configure SMTP /
                custom domains.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={sendMagicLink}>
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending…' : 'Email me a link'}
                </Button>
              </form>
              {message ? (
                <p
                  className={`mt-4 text-sm ${status === 'error' ? 'text-destructive' : 'text-primary'}`}
                >
                  {message}
                </p>
              ) : null}
              <p className="mt-6 text-xs text-muted-foreground">
                Local demo seed includes{' '}
                <span className="font-mono text-primary">founder@leadphantom.com</span> with password{' '}
                <span className="font-mono">demo-password-change-me</span> — magic link still
                recommended for staging.
              </p>
            </CardContent>
          </Card>
        )}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            ← Back to marketing site
          </Link>
        </p>
      </div>
    </div>
  );
}
