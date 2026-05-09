const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 300;

export async function retrySupabase<T>(
  fn: () => PromiseLike<T>,
  attempts = MAX_ATTEMPTS,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, BASE_DELAY_MS * 2 ** (i - 1)));
    try {
      const result = await fn();
      return result;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
