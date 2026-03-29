import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS.
 * Server-side use only (API routes / webhooks).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
