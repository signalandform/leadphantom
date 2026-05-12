/**
 * Non-empty fallbacks allow `next build` / static analysis without a configured Supabase project.
 * Replace with real values via apps/web/.env.local for runtime.
 */
export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_REPLACE_ME______________________________________________________'
  );
}

export function getSupabaseServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    'sb_secret_REPLACE_ME______________________________________________________________'
  );
}
