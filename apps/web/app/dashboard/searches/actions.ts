'use server';

import { revalidatePath } from 'next/cache';

import { isPocMode } from '@/lib/config/app-mode';
import {
  pocDeleteSearch,
  pocInsertSearch,
  pocRunSearchSync,
  pocUpdateSearch,
} from '@/lib/mock/poc-store';
import { executeSupabaseSearchRun } from '@/lib/search/supabase-search-run';
import { createServerSupabaseClient } from '@/lib/supabase/server';

async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return { supabase, user };
}

export async function createSearch(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const query_text = String(formData.get('query_text') ?? '').trim();
  const location_bias = String(formData.get('location_bias') ?? '').trim() || null;
  const radius_raw = formData.get('radius_meters');
  const radius_meters =
    radius_raw === '' || radius_raw === null ? null : Number.parseInt(String(radius_raw), 10);

  if (!name || !query_text) {
    throw new Error('Name and query are required');
  }

  if (isPocMode()) {
    pocInsertSearch({
      name,
      query_text,
      location_bias,
      radius_meters: Number.isFinite(radius_meters as number) ? radius_meters : null,
    });
    revalidatePath('/dashboard/searches');
    revalidatePath('/dashboard');
    return;
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from('lead_searches_lp').insert({
    user_id: user.id,
    name,
    query_text,
    location_bias,
    radius_meters: Number.isFinite(radius_meters as number) ? radius_meters : null,
    status: 'idle',
  });

  if (error) throw error;
  revalidatePath('/dashboard/searches');
}

export async function updateSearch(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const query_text = String(formData.get('query_text') ?? '').trim();
  const location_bias = String(formData.get('location_bias') ?? '').trim() || null;
  const radius_raw = formData.get('radius_meters');
  const radius_meters =
    radius_raw === '' || radius_raw === null ? null : Number.parseInt(String(radius_raw), 10);

  if (!id || !name || !query_text) {
    throw new Error('Invalid payload');
  }

  const radius = Number.isFinite(radius_meters as number) ? radius_meters : null;

  if (isPocMode()) {
    pocUpdateSearch(id, {
      name,
      query_text,
      location_bias,
      radius_meters: radius,
    });
    revalidatePath('/dashboard/searches');
    return;
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('lead_searches_lp')
    .update({
      name,
      query_text,
      location_bias,
      radius_meters: radius,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  revalidatePath('/dashboard/searches');
}

export async function deleteSearch(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing id');

  if (isPocMode()) {
    pocDeleteSearch(id);
    revalidatePath('/dashboard/searches');
    revalidatePath('/dashboard/exports');
    revalidatePath('/dashboard');
    return;
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase.from('lead_searches_lp').delete().eq('id', id).eq('user_id', user.id);

  if (error) throw error;
  revalidatePath('/dashboard/searches');
}

/** Runs stub Places pipeline into DB / mock store (no automatic Google Sheets push). */
export async function runSearchSync(searchId: string) {
  if (isPocMode()) {
    await pocRunSearchSync(searchId);
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/searches');
    revalidatePath('/dashboard/exports');
    return;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await executeSupabaseSearchRun(supabase, user.id, searchId);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/searches');
  revalidatePath('/dashboard/exports');
}
