/**
 * Social Sciences question selector. Mirrors lib/life-skills-selector.ts.
 *
 * Topics live under `topics` keyed by topic_id (e.g. "SS.L4.HIS.T01"). Each
 * topic is 1:1 with a skill — so for Social Sciences, the topic_id IS the
 * skill_id.
 */

import socialSciencesBankData from "@/data/social-sciences-question-bank.json";
import type {
  SocialSciencesBank,
  SocialSciencesBankQuestion,
  SocialSciencesGeneratedQuestion,
  SocialSciencesTopic,
} from "@/types/social-sciences";

const bank = socialSciencesBankData as unknown as SocialSciencesBank;

export function getDomainForSkill(skillId: string): string | null {
  if (bank.topics[skillId]) return skillId;
  return null;
}

export function getTopic(topicId: string): SocialSciencesTopic | null {
  return bank.topics[topicId] ?? null;
}

export function selectQuestion(
  topicId: string,
  usedRefs: string[],
  isReteach = false,
  _skillId = "",
  abilityLevel?: number,
): SocialSciencesBankQuestion | null {
  const topic = bank.topics[topicId];
  if (!topic) return null;

  const pool = topic.questions;
  if (pool.length === 0) return null;

  let available = pool.filter((q) => !usedRefs.includes(q.ref));
  if (available.length === 0) {
    available = [...pool];
  }

  if (abilityLevel !== undefined) {
    const target = isReteach ? Math.max(1, abilityLevel - 1) : abilityLevel;

    const exact = available.filter(
      (q) => q.difficulty !== undefined && q.difficulty === target,
    );
    if (exact.length > 0) {
      return exact[Math.floor(Math.random() * exact.length)];
    }

    const near = available.filter(
      (q) => q.difficulty !== undefined && Math.abs(q.difficulty - target) <= 1,
    );
    if (near.length > 0) {
      return near[Math.floor(Math.random() * near.length)];
    }
  }

  return available[Math.floor(Math.random() * available.length)];
}

export function bankQuestionToGenerated(
  q: SocialSciencesBankQuestion,
  skillId: string,
): SocialSciencesGeneratedQuestion {
  return {
    id: `q_ss_${skillId}_${q.ref}_${Date.now()}`,
    skill_id: skillId,
    question_ref: q.ref,
    input_type: q.input_type,
    question: q.question,
    ruby_prompt: q.ruby_prompt,
    context: q.context,
    options: q.options,
    expected_answer: q.expected,
    memo: q.memo,
    difficulty: q.difficulty,
  };
}

export function listTopicsForLevel(level: number): Array<{ id: string; topic: SocialSciencesTopic }> {
  return Object.entries(bank.topics)
    .filter(([, t]) => t.grade === level)
    .map(([id, topic]) => ({ id, topic }));
}
