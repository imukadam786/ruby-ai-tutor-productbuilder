// ─── Past-paper topic → skill-tree skill map (Physical Sciences) ─────────────
//
// Past-paper sub-questions are tagged with a free-text `topic` (e.g. "Newton's
// Laws"); the skill tree is keyed on structured skill IDs (e.g. "L1.T1.A1").
// Nothing links the two, so a weak topic on a paper report can't route the
// learner to the skill that fixes it. This map is that bridge.
//
// In Physical Sciences the paper topics line up almost 1:1 with skill-tree
// LEVELS, so each topic maps to that level's ordered skills. The learner is sent
// to the first skill in the list; the rest are there for a future "this topic
// covers N skills" chooser.
//
// FIRST DRAFT — authored from the matric bank's skill titles, pending head-of-ed
// review. Grade 12 (matric) skill IDs, since the past papers are matric papers.
// It is deliberately data-only (no AI) so routing is instant and free.

/** Normalise a topic string so "Acids & Bases" and "Acids and Bases" match. */
function normalizeTopic(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[/]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Keyed by normalised topic → the level's skill IDs, in teaching order.
const TOPIC_SKILLS: Record<string, string[]> = {
  // ── Mechanics ──
  "newtons laws": ["L1.T1.A1", "L1.T1.A2", "L1.T1.A3"],
  "vertical projectile motion": ["L2.T1.A1", "L2.T1.A2"],
  "work energy and power": ["L3.T1.A1", "L3.T1.A2", "L3.T1.A3"],
  "momentum and impulse": ["L4.T1.A1", "L4.T1.A2"],
  "gravitation": ["L10.T1.A1", "L10.T1.A2"],
  // ── Waves, sound & light ──
  "doppler effect": ["L5.T1.A1", "L5.T1.A2"],
  "photoelectric effect": ["L9.T1.A1", "L9.T1.A2"],
  "photoelectric effect and emission absorption spectra": ["L9.T1.A1", "L9.T1.A2"],
  // ── Electricity & magnetism ──
  "electrostatics": ["L6.T1.A1", "L6.T1.A2", "L6.T1.A3"],
  "electric circuits": ["L7.T1.A1", "L7.T1.A2", "L7.T1.A3"],
  "circuits": ["L7.T1.A1", "L7.T1.A2", "L7.T1.A3"],
  "electromagnetic induction": ["L8.T1.A1", "L8.T1.A2"],
  // ── Chemistry ──
  "organic chemistry": ["L11.T1.A1", "L11.T1.A2", "L11.T1.A3", "L11.T1.A4"],
  "organic nomenclature": ["L11.T1.A1", "L11.T1.A2"],
  "organic reactions": ["L11.T1.A4"],
  "electrochemistry": ["L12.T1.A1", "L12.T1.A2", "L12.T1.A3"],
  "chemical equilibrium": ["L13.T1.A1", "L13.T1.A2", "L13.T1.A3"],
  "industrial chemistry": ["L13.T1.A2"],
  "acids and bases": ["L14.T1.A1", "L14.T1.A2", "L14.T1.A3", "L14.T1.A4"],
  "reaction rate": ["L15.T1.A1", "L15.T1.A2"],
  "intermolecular forces": ["L16.T1.A1", "L16.T1.A2"],
};

/** All skill IDs a paper topic maps to (teaching order), or null when unmapped. */
export function resolveTopicSkills(topic: string): string[] | null {
  const skills = TOPIC_SKILLS[normalizeTopic(topic)];
  return skills && skills.length > 0 ? skills : null;
}

/** The single skill to send a learner to for this topic (the first), or null. */
export function resolvePrimarySkill(topic: string): string | null {
  return resolveTopicSkills(topic)?.[0] ?? null;
}
