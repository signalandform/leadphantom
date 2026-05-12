import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env';

export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  ) as unknown as SupabaseClient<Database>;
}
