import { apiFetch } from "@/lib/fetch";

// Gets the next skill-tree question, working offline. When online it uses the
// server route exactly as before; when offline — or if that request fails — it
// falls back to selecting locally from the subject's bundled question bank.
// This is what makes downloaded subjects playable with no connection: the
// server was only ever picking a question the app already ships on the device.
//
// `localSelect` runs the same selection the route runs (getDomainForSkill →
// selectQuestion → bankQuestionToGenerated), returning the generated question or
// null when the skill has no bank/pool. It is synchronous and pure, so it works
// with no network. The generated shape is identical to the server's, so nothing
// downstream (rendering, scoring, feedback) changes.

interface Options<Q> {
  /** Server route, e.g. "/api/history/generate-question". */
  url: string;
  /** POST body the route expects (skill_id, used_refs, ability_level, …). */
  body: unknown;
  /** Local fallback: pick a question from the bundled bank. */
  localSelect: () => Q | null;
}

export async function fetchQuestionOrLocal<Q>({ url, body, localSelect }: Options<Q>): Promise<Q | null> {
  const online = typeof navigator === "undefined" || navigator.onLine;
  if (online) {
    try {
      const res = await apiFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = (await res.json()) as { question?: Q | null };
        // A successful response is authoritative — including a deliberate
        // { question: null } ("no more questions"), which the local bank would
        // also return. Only fall through to local when the response is unusable.
        if (data && "question" in data) return data.question ?? null;
      }
    } catch {
      /* network error — fall through to the on-device bank */
    }
  }
  return localSelect();
}
