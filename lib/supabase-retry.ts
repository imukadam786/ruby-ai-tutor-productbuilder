/**
 * Retry wrapper for Supabase writes.
 * Supabase client returns { error } rather than throwing, so we check that.
 * Retries up to `attempts` times with linear backoff (delayMs * attempt).
 * Always fire-and-forget — call with void, errors are logged not thrown.
 */
export async function retrySupabase(
  fn: () => PromiseLike<{ error: unknown }>,
  attempts = 3,
  delayMs = 1000
): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    const { error } = await fn();
    if (!error) return;
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    } else {
      console.error("[supabase-retry] Write failed after", attempts, "attempts:", error);
    }
  }
}
