/**
 * Authenticated fetch wrapper.
 * Automatically attaches:
 *   - X-Ruby-Secret  (internal API guard, read from NEXT_PUBLIC_RUBY_API_SECRET)
 *   - Authorization  (Supabase JWT, read from the active session when available)
 */
import { supabase } from "@/lib/supabase";

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);

  // Attach API secret for internal route protection
  const secret = process.env.NEXT_PUBLIC_RUBY_API_SECRET;
  if (secret) {
    headers.set("x-ruby-secret", secret);
  }

  // Attach Bearer token if a session exists
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return fetch(input, { ...init, headers });
}
