/**
 * withRubies — Phase 1 reward hook for subject submit-answer routes.
 *
 * Wraps a route's POST handler so the rubies economy lives in ONE place instead
 * of being copy-pasted into 17 routes. It runs the original handler untouched,
 * then — only for a logged-in learner and a successful answer — awards rubies
 * based on the correctness the handler already computed, and merges a `rubies`
 * field into the JSON response.
 *
 * Why read correctness from the RESPONSE rather than re-grade: the server is the
 * only place correctness is known, and every route already returns it. The client
 * never asserts whether it was right, so this can't be gamed.
 *
 * Idempotency is derived from the request body (question id + attempt + day), so
 * a double-click / retry collapses to a single award — no client change needed.
 * Routes differ in how they name the question, so we try every known field and
 * fall back to a hash of the question text (reading has no per-question id).
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/server-usage";
import { rewardAnswer } from "@/lib/rewards";

type Handler = (req: NextRequest) => Promise<Response>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** A stable per-question discriminator across the routes' differing payloads. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function questionKey(body: any): string {
  const id =
    body?.question_id ??
    body?.question_ref ??
    body?.item_ref ??
    body?.item_id;
  if (id != null && id !== "") return String(id);
  // Reading (and any bank with no per-question id): hash the prompt text so two
  // different questions on the same skill don't collide on the same day.
  const text = body?.question ?? body?.prompt ?? body?.passage ?? body?.expected_answer ?? "";
  return "h" + djb2(String(text));
}

export function withRubies(subject: string, handler: Handler): Handler {
  return async (req: NextRequest): Promise<Response> => {
    // Clone BEFORE the handler consumes the body, so we can read it afterwards.
    const bodyClone = req.clone();
    const res = await handler(req);

    // Only award on a successful answer response.
    if (!res.ok) return res;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
      data = await res.clone().json();
    } catch {
      return res; // non-JSON success body — nothing to do
    }

    const isCorrect = data?.result?.is_correct ?? data?.is_correct;
    if (typeof isCorrect !== "boolean") return res;

    const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
    const userId = token ? await verifyToken(token) : null;
    if (!userId) return res; // anonymous learners don't earn

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = {};
    try {
      body = await bodyClone.json();
    } catch {
      /* keep {} — questionKey falls back to a hash of "" */
    }

    const rubies = await rewardAnswer({
      userId,
      isCorrect,
      subject,
      questionId: questionKey(body),
      skillId: body?.skill_id,
      attemptNumber: body?.attempt_number,
    });

    return NextResponse.json({ ...data, rubies }, { status: res.status });
  };
}
