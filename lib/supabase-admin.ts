import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS.
 * Server-side use only (API routes / webhooks).
 * Lazy singleton so it is never instantiated at build time.
 */
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return _supabaseAdmin;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin: any = new Proxy({} as any, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_target: any, prop: string) {
    return (getSupabaseAdmin() as any)[prop];
  },
});
