'use client';

import { useState } from 'react';

import { submitPocOnboarding } from '@/app/dashboard/onboarding-actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabase } from '@/hooks/use-supabase';

type Props = {
  open: boolean;
  pocMode?: boolean;
  userId: string;
  onCompleted: () => void;
};

export function OnboardingWizard({ open, pocMode = false, userId, onCompleted }: Props) {
  const supabase = useSupabase();
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setLoading(true);
    setError(null);
    try {
      if (pocMode) {
        await submitPocOnboarding({
          companyName,
          industry,
          sheetUrl,
          googleApiKey,
        });
        onCompleted();
        return;
      }

      const { error: profileErr } = await supabase
        .from('profiles_lp')
        .update({
          company_name: companyName || null,
          industry: industry || null,
          sheet_url: sheetUrl || null,
          // TODO: Encrypt before persist — Supabase Vault/KMS or server-side crypto.
          google_api_key: googleApiKey || null,
          onboarded: true,
        })
        .eq('id', userId);

      if (profileErr) throw profileErr;

      if (googleApiKey) {
        const { error: credErr } = await supabase.from('api_credentials_lp').upsert(
          {
            user_id: userId,
            provider: 'google_places',
            // TODO: Store ciphertext only; placeholder echoes plaintext for demo scaffolding.
            encrypted_key: googleApiKey,
          },
          { onConflict: 'user_id,provider' }
        );
        if (credErr) throw credErr;
      }

      onCompleted();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to save onboarding');
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (step < 3) setStep(step + 1);
    else void finish();
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg border-primary/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to Lead Phantom</DialogTitle>
          <DialogDescription>
            Step {step} of 3 — profile and optional integrations.
            {pocMode ? ' (Saved to mock store only.)' : null}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company name</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Specter HVAC Co."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Home services, dental, legal..."
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sheet">Google Sheet URL (optional)</Label>
              <Input
                id="sheet"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
              <p className="text-xs text-muted-foreground">
                Lead Phantom does not auto-push to Sheets — preview and CSV export happen in the dashboard. This URL is
                stored for future integrations only.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="gkey">Optional Google API key</Label>
              <Input
                id="gkey"
                type="password"
                autoComplete="off"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                placeholder="AIza..."
              />
              <p className="text-xs text-muted-foreground">
                Stored as plaintext in dev — replace with Vault/KMS encryption before production.
              </p>
            </div>
          </div>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" onClick={next} disabled={loading}>
            {step === 3 ? (loading ? 'Saving…' : 'Finish') : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
