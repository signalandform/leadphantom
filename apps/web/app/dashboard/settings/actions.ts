'use server';

import { revalidatePath } from 'next/cache';

import { isPocMode } from '@/lib/config/app-mode';
import { pocUpdateProfile } from '@/lib/mock/poc-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function updateSettings(formData: FormData) {
  const sheet_url = String(formData.get('sheet_url') ?? '').trim() || null;
  const google_api_key = String(formData.get('google_api_key') ?? '').trim() || null;

  if (isPocMode()) {
    pocUpdateProfile({
      sheet_url,
      google_api_key,
    });
    revalidatePath('/dashboard/settings');
    return;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error: profileError } = await supabase
    .from('profiles_lp')
    .update({
      sheet_url,
      // TODO: Encrypt using Vault/KMS before storing google_api_key.
      google_api_key,
    })
    .eq('id', user.id);

  if (profileError) throw profileError;

  if (google_api_key) {
    const { error: credError } = await supabase.from('api_credentials_lp').upsert(
      {
        user_id: user.id,
        provider: 'google_places',
        encrypted_key: google_api_key,
      },
      { onConflict: 'user_id,provider' }
    );
    if (credError) throw credError;
  }

  revalidatePath('/dashboard/settings');
}
