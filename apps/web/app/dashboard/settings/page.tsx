import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { isPocMode } from '@/lib/config/app-mode';
import { pocGetProfile } from '@/lib/mock/poc-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';

import { updateSettings } from './actions';

export default async function SettingsPage() {
  let sheetUrl = '';
  let googleKey = '';

  if (isPocMode()) {
    const profile = pocGetProfile();
    sheetUrl = profile.sheet_url ?? '';
    googleKey = profile.google_api_key ?? '';
  } else {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from('profiles_lp')
      .select('sheet_url, google_api_key')
      .eq('id', user!.id)
      .maybeSingle();

    sheetUrl = profile?.sheet_url ?? '';
    googleKey = profile?.google_api_key ?? '';
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="text-muted-foreground">
          {isPocMode()
            ? 'Updates apply to the mock profile only. Flip POC mode off to persist to Supabase.'
            : 'Sync stores leads in Lead Phantom; CSV export is manual from each search. Optional fields below are reserved for future Places / Sheets integrations — nothing is pushed to Sheets automatically today.'}
        </p>
      </div>
      <form
        action={updateSettings}
        className="space-y-6 rounded-xl border border-white/10 bg-card/60 p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="sheet_url">Google Sheet URL (optional — not used for auto-export)</Label>
          <Input
            id="sheet_url"
            name="sheet_url"
            defaultValue={sheetUrl}
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="google_api_key">Google API key</Label>
          <Input
            id="google_api_key"
            name="google_api_key"
            type="password"
            autoComplete="off"
            defaultValue={googleKey}
            placeholder="AIza..."
          />
          <p className="text-xs text-muted-foreground">
            Production path mirrors into `api_credentials_lp` with provider `google_places`.
          </p>
        </div>
        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
