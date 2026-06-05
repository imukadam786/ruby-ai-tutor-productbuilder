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

  const res = await fetch(input, { ...init, headers });

  // Subject answer routes return 429 with `{ upgradeRequired: true }` once the
  // learner has used up their shared daily Freebie pool (chat messages +
  // subject questions). Surface the upgrade modal centrally so every subject
  // session gets it without bespoke handling. Read a clone so the caller still
  // gets the body. Chat keeps its own 429 path (it does not send this marker),
  // so the modal never double-fires.
  if (res.status === 429 && typeof document !== "undefined") {
    res
      .clone()
      .json()
      .then((body) => {
        if (body?.upgradeRequired) {
          document.dispatchEvent(
            new CustomEvent("ruby-upgrade-needed", {
              detail: {
                reason:
                  "You've used your 5 free questions and messages for today. Upgrade to keep learning.",
              },
            }),
          );
        }
      })
      .catch(() => {
        /* non-JSON 429 body — nothing to surface */
      });
  }

  // Keep the usage meter live: a successful subject answer just spent one unit
  // of the shared daily pool, so tell the meter to refetch its counts. (Chat
  // and voice fire this event from their own flows; placement quizzes hit the
  // diagnostic routes, not "/submit-answer", so they're correctly skipped.)
  if (res.ok && typeof document !== "undefined") {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.href
        : (input as Request).url;
    if (url.includes("/submit-answer")) {
      document.dispatchEvent(new CustomEvent("ruby-usage-changed"));

      // Rubies (Phase 1): the answer routes return a `rubies` award when a
      // logged-in learner earns. Surface it so the balance counter can bump and
      // a "+N" toast can fire — read a clone so the caller still gets the body.
      res
        .clone()
        .json()
        .then((body) => {
          const award = body?.rubies;
          if (award && award.awarded > 0) {
            document.dispatchEvent(
              new CustomEvent("ruby-earned", { detail: award }),
            );
            // A streak milestone (5/8/10 in a row) was hit → combo celebration.
            if (award.milestone_bonus > 0) {
              document.dispatchEvent(
                new CustomEvent("ruby-celebrate", {
                  detail: { kind: "combo", rubies: award.milestone_bonus },
                }),
              );
            }
          }
        })
        .catch(() => {
          /* non-JSON body — nothing to surface */
        });
    }
  }

  return res;
}
