/**
 * Client-side ruby award triggers (Phase 1).
 *
 * Thin fire-and-forget helpers the subject session components call when a skill
 * is mastered or a lesson finishes. Both POST to the rewards endpoints (which
 * award server-side, idempotently) and, on a positive award, dispatch the
 * `ruby-earned` event so the balance counter bumps and the "+N" pop fires.
 */
import { apiFetch } from "@/lib/fetch";

function emitEarned(body: { rubies?: { awarded?: number } } | null): void {
  if (body?.rubies && (body.rubies.awarded ?? 0) > 0) {
    document.dispatchEvent(new CustomEvent("ruby-earned", { detail: body.rubies }));
  }
}

/** First-time skill/topic mastery bonus (idempotent per skill server-side). */
export function rewardSkillMastered(subject: string, skillId: string, profileId?: string): void {
  void apiFetch("/api/rewards/skill-mastered", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, skillId, profileId }),
  })
    .then((r) => r.json())
    .then((b) => {
      emitEarned(b);
      // Celebrate the mastery itself — independent of the payout. The reward is
      // legitimately 0 on repeat mastery (idempotent) or when the anti-cheat guard
      // blocks it, so gating the celebration on it left learners with no feedback.
      // The "+N" line only shows when rubies were actually awarded.
      const awarded = b?.rubies?.awarded ?? 0;
      document.dispatchEvent(
        new CustomEvent("ruby-celebrate", {
          detail: { kind: "skill_mastered", rubies: awarded > 0 ? awarded : undefined },
        }),
      );
    })
    .catch(() => {
      // Even if the reward call fails, the learner still mastered the skill — celebrate.
      document.dispatchEvent(
        new CustomEvent("ruby-celebrate", { detail: { kind: "skill_mastered" } }),
      );
    });
}

/** Effort floor — finished a lesson/topic run, even with wrong answers. */
export function rewardEffortFloor(subject: string, lessonId: string): void {
  void apiFetch("/api/rewards/effort-floor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, lessonId }),
  })
    .then((r) => r.json())
    .then(emitEarned)
    .catch(() => { /* non-blocking */ });
}
