'use client';

import { createClient } from '@/lib/supabase/client';
import { useMemo } from 'react';

/** Browser Supabase client for use in Client Components. */
export function useSupabase() {
  return useMemo(() => createClient(), []);
}
