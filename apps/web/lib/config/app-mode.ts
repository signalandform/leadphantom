/**
 * Proof-of-concept mode (default): UI runs on in-memory mock data — no Supabase auth, DB, or HTTP APIs required.
 * Set `NEXT_PUBLIC_POC_MODE=false` to enable production wiring (Supabase, auth, `/api/*`).
 */
export function isPocMode(): boolean {
  return process.env.NEXT_PUBLIC_POC_MODE !== 'false';
}

export const POC_USER_ID = '00000000-0000-4000-8000-000000000001';
