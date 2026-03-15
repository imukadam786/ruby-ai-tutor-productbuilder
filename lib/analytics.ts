// ─── lib/analytics.ts ────────────────────────────────────────────────────────
// Typed PostHog event capture. All product analytics go through this file.
// Import posthog-js and call these functions from client components only.
// Server-side events (API routes) should use posthog-node directly.
//
// Requires env vars:
//   NEXT_PUBLIC_POSTHOG_KEY   — from posthog.com project settings
//   NEXT_PUBLIC_POSTHOG_HOST  — https://app.posthog.com (or EU: https://eu.posthog.com)

import posthog from "posthog-js";

// ─── Identity ─────────────────────────────────────────────────────────────────

export function identifyStudent(opts: {
  id: string;
  name: string;
  grade: number;
}) {
  posthog.identify(opts.id, {
    name: opts.name,
    grade: opts.grade,
  });
}

// ─── Placement events ─────────────────────────────────────────────────────────

export function trackPlacementStarted(opts: {
  subject: "maths" | "reading";
  grade: number;
}) {
  posthog.capture("placement_started", opts);
}

export function trackPlacementCompleted(opts: {
  subject: "maths" | "reading";
  grade: number;
  entry_level: number;
  grade_gap: number;
  hard_gate_passed: boolean;
  questions_analysed: number;
  skills_auto_completed: number;
  placement_block: number | null;
  early_exit_reason: string | null;
}) {
  posthog.capture("placement_completed", opts);
}

// ─── Question events ──────────────────────────────────────────────────────────

export function trackQuestionAnswered(opts: {
  subject: "maths" | "reading";
  skill_id: string;
  template: string;
  is_correct: boolean;
  used_hint: boolean;
  attempt_number: number;
  decision: string; // reteach | practice | accelerate | advance | backtrack
}) {
  posthog.capture("question_answered", opts);
}

// ─── Skill state events ───────────────────────────────────────────────────────

export function trackSkillMastered(opts: {
  subject: "maths" | "reading";
  skill_id: string;
  level: number;
  session_attempt_count: number;
  session_correct: number;
}) {
  posthog.capture("skill_mastered", opts);
}

export function trackSkillAdvanced(opts: {
  subject: "maths" | "reading";
  from_skill_id: string;
  to_skill_id: string;
}) {
  posthog.capture("skill_advanced", opts);
}

export function trackReteach(opts: {
  subject: "maths" | "reading";
  skill_id: string;
  error_type: string;
  reteach_count: number;
}) {
  posthog.capture("skill_reteach", opts);
}

export function trackBacktrack(opts: {
  subject: "maths" | "reading";
  from_skill_id: string;
  to_prereq_id: string;
}) {
  posthog.capture("skill_backtrack", opts);
}

export function trackAccelerate(opts: {
  subject: "maths" | "reading";
  skill_id: string;
}) {
  posthog.capture("skill_accelerate", opts);
}

// ─── Session events ───────────────────────────────────────────────────────────

export function trackSessionStarted(opts: {
  subject: "maths" | "reading";
  current_skill_id: string;
  current_level: number;
}) {
  posthog.capture("session_started", opts);
}

export function trackSessionEnded(opts: {
  subject: "maths" | "reading";
  questions_answered: number;
  correct: number;
  accuracy: number;
}) {
  posthog.capture("session_ended", opts);
}

// ─── Review (spaced repetition) events ───────────────────────────────────────

export function trackReviewStarted(opts: { skill_count: number }) {
  posthog.capture("review_started", opts);
}

export function trackReviewCompleted(opts: {
  skills_reviewed: number;
  skills_passed: number;
}) {
  posthog.capture("review_completed", opts);
}

// ─── Report events ────────────────────────────────────────────────────────────

export function trackReportGenerated(opts: {
  subject: "maths" | "reading";
  grade_gap: number;
}) {
  posthog.capture("report_generated", opts);
}
