/**
 * Internal fetch wrapper — automatically adds the X-Ruby-Secret header
 * to every request going to our own API routes.
 * Use this instead of bare fetch() for all /api/* calls.
 */
export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const secret = process.env.NEXT_PUBLIC_RUBY_API_SECRET ?? "";
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      "x-ruby-secret": secret,
    },
  });
}
