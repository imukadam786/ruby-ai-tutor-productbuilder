// ─── Feature flags ───────────────────────────────────────────────────────────
// Concept C (the gem redesign) ships behind this flag so the new UI and the
// current UI can coexist on dev. Set NEXT_PUBLIC_CONCEPT_C=1 to turn it on.
//
// Read this instead of process.env directly so the flag has one home and can
// later grow into per-user / staged rollout without touching call sites.

export const CONCEPT_C =
  process.env.NEXT_PUBLIC_CONCEPT_C === "1" ||
  process.env.NEXT_PUBLIC_CONCEPT_C === "true";
