'use server';

import { revalidatePath } from 'next/cache';

import { pocUpdateOnboarding } from '@/lib/mock/poc-store';

export async function submitPocOnboarding(input: {
  companyName: string;
  industry: string;
  sheetUrl: string;
  googleApiKey: string;
}) {
  pocUpdateOnboarding({
    company_name: input.companyName || null,
    industry: input.industry || null,
    sheet_url: input.sheetUrl || null,
    google_api_key: input.googleApiKey || null,
    onboarded: true,
  });
  revalidatePath('/dashboard');
}
