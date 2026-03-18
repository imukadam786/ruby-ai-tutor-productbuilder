/**
 * Knowledge Graph Engine
 *
 * When a student masters a skill, look up outgoing transfer edges in
 * data/knowledge-graph.json and boost the p_learned of connected skills.
 *
 * This gives "transfer credit": skills that share conceptual foundations
 * start slightly higher than the default p_init = 0.10, so students
 * who are cognitively ready for them get there faster.
 */

import graphData from "@/data/knowledge-graph.json";
import { applyTransfer, initBKT, DEFAULT_BKT_PARAMS } from "@/lib/bkt";
import type { StudentProfile, SkillMastery } from "@/types/ruby";
import type { ReadingStudentProfile, ReadingSkillMastery } from "@/types/reading";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransferEdge {
  from: string;
  to: string;
  type: string;
  weight: number;
  rationale: string;
}

interface GraphData {
  edges: (TransferEdge | { note: string })[];
}

// ─── Load edges once ──────────────────────────────────────────────────────────

const TRANSFER_EDGES: TransferEdge[] = (graphData as GraphData).edges.filter(
  (e): e is TransferEdge => "from" in e && "to" in e && e.type === "transfer"
);

/** All outgoing transfer edges from a given skill id. */
function getOutgoingEdges(skillId: string): TransferEdge[] {
  return TRANSFER_EDGES.filter((e) => e.from === skillId);
}

// ─── Maths profile transfer ────────────────────────────────────────────────────

/**
 * Apply knowledge-graph transfer credit to a maths student profile.
 * Call this immediately after a skill reaches "mastered" status.
 *
 * @param profile       the maths student profile
 * @param masteredSkillId  the skill that was just mastered
 * @returns updated profile with boosted p_learned on connected skills
 */
export function applyMathsTransfers(
  profile: StudentProfile,
  masteredSkillId: string
): StudentProfile {
  const edges = getOutgoingEdges(masteredSkillId);
  if (edges.length === 0) return profile;

  const sourceMastery = profile.skill_mastery[masteredSkillId];
  const sourceP = sourceMastery?.p_learned ?? 0.95;

  let updatedMastery = { ...profile.skill_mastery };
  let changed = false;

  for (const edge of edges) {
    const targetId = edge.to;
    const existing: SkillMastery | undefined = updatedMastery[targetId];
    const currentP = existing?.p_learned ?? initBKT(DEFAULT_BKT_PARAMS);

    const newP = applyTransfer(currentP, sourceP, edge.weight);
    if (newP <= currentP) continue; // no improvement — skip

    changed = true;
    if (existing) {
      updatedMastery = {
        ...updatedMastery,
        [targetId]: { ...existing, p_learned: newP },
      };
    } else {
      // Skill not yet in mastery map — initialise with boosted p_learned
      updatedMastery = {
        ...updatedMastery,
        [targetId]: {
          skill_id: targetId,
          status: "locked",
          correct_count: 0,
          attempt_count: 0,
          formats_used: [],
          scaffolded_attempts: 0,
          last_attempted: new Date().toISOString(),
          session_history: [],
          attempts: [],
          p_learned: newP,
        },
      };
    }
  }

  if (!changed) return profile;
  return { ...profile, skill_mastery: updatedMastery };
}

// ─── Reading profile transfer ──────────────────────────────────────────────────

/**
 * Apply knowledge-graph transfer credit to a reading student profile.
 * Call this immediately after a reading skill reaches "mastered" status.
 */
export function applyReadingTransfers(
  profile: ReadingStudentProfile,
  masteredSkillId: string
): ReadingStudentProfile {
  const edges = getOutgoingEdges(masteredSkillId);
  if (edges.length === 0) return profile;

  const sourceMastery = profile.skill_mastery[masteredSkillId];
  const sourceP = sourceMastery?.p_learned ?? 0.95;

  let updatedMastery = { ...profile.skill_mastery };
  let changed = false;

  for (const edge of edges) {
    const targetId = edge.to;
    const existing: ReadingSkillMastery | undefined = updatedMastery[targetId];
    const currentP = existing?.p_learned ?? initBKT(DEFAULT_BKT_PARAMS);

    const newP = applyTransfer(currentP, sourceP, edge.weight);
    if (newP <= currentP) continue;

    changed = true;
    if (existing) {
      updatedMastery = {
        ...updatedMastery,
        [targetId]: { ...existing, p_learned: newP },
      };
    } else {
      updatedMastery = {
        ...updatedMastery,
        [targetId]: {
          skill_id: targetId,
          status: "locked",
          correct_count: 0,
          attempt_count: 0,
          formats_used: [],
          scaffolded_attempts: 0,
          last_attempted: new Date().toISOString(),
          attempts: [],
          p_learned: newP,
        },
      };
    }
  }

  if (!changed) return profile;
  return { ...profile, skill_mastery: updatedMastery };
}
