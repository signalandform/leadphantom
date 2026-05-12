import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabase/env';

/**
 * Service-role client for trusted server-only jobs after explicit checks.
 * TODO: Prefer the cookie-bound anon client + RLS when the user context is enough.
 */
export function createServiceRoleClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey());
}
