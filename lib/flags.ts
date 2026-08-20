// ─── Feature flags ───────────────────────────────────────────────────────────
// Concept C (the gem redesign) ships behind this flag so the new UI and the
// current UI can coexist. Read this instead of process.env directly so the flag
// has one home and can later grow into per-user / staged rollout.
//
// Resolution order:
//   1. NEXT_PUBLIC_CONCEPT_C, if set, always wins ("1"/"true" on, "0"/"false" off).
//   2. Otherwise ON for preview deploys, the dev branch, and local dev.
//   3. Otherwise OFF.
//
// Step 2 fails CLOSED: a real production deploy (master/main) gets `undefined`
// from the checks below and stays on the current UI. The redesign cannot reach
// live learners by accident — that takes an explicit env var.
//
// NOTE: this is inlined at BUILD time, so a change needs a redeploy.

const explicit = process.env.NEXT_PUBLIC_CONCEPT_C;

// Vercel system env vars (auto-exposed for Next.js projects). If a project has
// "Automatically expose System Environment Variables" turned off, both are
// undefined and the flag falls back to off — set NEXT_PUBLIC_CONCEPT_C=1 then.
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;            // production | preview | development
const gitBranch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF; // e.g. "dev"

const onByDefault =
  vercelEnv === "preview" ||
  vercelEnv === "development" ||
  // Belt and braces: on even if `dev` is ever set as the production branch.
  gitBranch === "dev" ||
  // Local `next dev` and local builds.
  process.env.NODE_ENV === "development";

export const CONCEPT_C =
  explicit === "1" || explicit === "true"
    ? true
    : explicit === "0" || explicit === "false"
      ? false
      : onByDefault;
