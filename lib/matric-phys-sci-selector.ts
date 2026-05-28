/**
 * Matric Physical Sciences question selector. Mirrors lib/nst-selector.ts but
 * uses the Matric bank's native field names (id / answerMode / expectedAnswer /
 * errorSignals) rather than translating into the NST dialect.
 *
 * Bank shape: items live under `skills` keyed by skill_id (e.g. "L1.T1.A2").
 * Each skill is 1:1 with one atomic skill in the tree. Items have an
 * answerMode of "text" | "choice" | "numeric" | "multiField".
 */

import bankData from "@/data/matric-physical-sciences-question-bank.json";
import type {
  MatricPhysSciBank,
  MatricPhysSciBankItem,
  MatricPhysSciBankSkill,
  MatricPhysSciGeneratedQuestion,
  MatricPhysSciStudentProfile,
} from "@/types/matric-phys-sci";

const bank = bankData as unknown as MatricPhysSciBank;

// ─── Skill lookup ─────────────────────────────────────────────────────────────

export function getSkill(skillId: string): MatricPhysSciBankSkill | null {
  return bank.skills[skillId] ?? null;
}

export function hasSkill(skillId: string): boolean {
  return bank.skills[skillId] !== undefined;
}

// ─── Question selection ───────────────────────────────────────────────────────

/**
 * Selects an item from the skill's pool, excluding already-used refs.
 * When the pool is exhausted the full pool resets so the learner can keep
 * practising.
 *
 * @param skillId    e.g. "L1.T1.A2"
 * @param usedRefs   item ids already shown to this learner for this skill
 * @param isReteach  reserved for future use; currently no-op
 */
export function selectItem(
  skillId: string,
  usedRefs: string[],
  _isReteach = false,
): MatricPhysSciBankItem | null {
  const skill = bank.skills[skillId];
  if (!skill) return null;

  const pool = skill.items;
  if (pool.length === 0) return null;

  let available = pool.filter((q) => !usedRefs.includes(q.id));
  if (available.length === 0) {
    available = [...pool];
  }

  return available[Math.floor(Math.random() * available.length)];
}

// ─── Profile bookkeeping ──────────────────────────────────────────────────────

export function markItemUsed(
  profile: MatricPhysSciStudentProfile,
  skillId: string,
  itemId: string,
): MatricPhysSciStudentProfile {
  const existing = profile.used_questions?.[skillId] || [];
  return {
    ...profile,
    used_questions: {
      ...(profile.used_questions || {}),
      [skillId]: [...existing, itemId],
    },
    updated_at: new Date().toISOString(),
  };
}

export function getUsedRefs(
  profile: MatricPhysSciStudentProfile,
  skillId: string,
): string[] {
  return profile.used_questions?.[skillId] || [];
}

// ─── Build a generated question from a bank item ─────────────────────────────

export function itemToGenerated(
  item: MatricPhysSciBankItem,
  skillId: string,
): MatricPhysSciGeneratedQuestion {
  return {
    id: `q_matricps_${skillId}_${item.id}_${Date.now()}`,
    skill_id: skillId,
    question_ref: item.id,
    answerMode: item.answerMode,
    question: item.question,
    options: item.options,
    fields: item.fields,
    expected_answer: item.expectedAnswer,
    tolerance: item.tolerance,
    unit: item.unit,
    marks: item.marks,
    explanation: item.explanation,
  };
}

// ─── Pass threshold ──────────────────────────────────────────────────────────

export function passThresholdForSkill(skillId: string): number {
  const skill = bank.skills[skillId];
  if (!skill) return 0.6;
  // All items in a skill share the same passThreshold (set per item, but the
  // skill-level threshold is what we use for mastery). Read from the first
  // item; default to 0.7 (the value set in our authored banks).
  return skill.items[0]?.passThreshold ?? 0.7;
}

export function targetItemCount(skillId: string): number {
  const skill = bank.skills[skillId];
  return skill?.items.length ?? 20;
}
