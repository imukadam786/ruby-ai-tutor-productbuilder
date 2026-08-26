"use client";

// Shared adapter for the grade-locked FET content subjects (History, Geography,
// Tourism, Business Studies, Life Sciences). They all behave identically: the
// learner's onboarding grade selects exactly one level, its tiers (CAPS terms /
// strands) become sub-sections, and each topic is a tappable skill that opens a
// session. Everything renders through SkillTreeShell so it matches every other
// subject. Subject-specific status/progress logic stays in the caller and is
// passed in as closures — no back-end logic lives here.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchAuthorisedGrade, readCachedGrade, writeCachedGrade } from "@/lib/onboarding-reader";
import SkillTreeShell, {
  type TreeLevel,
  type SkillTreeStatus,
  type SkillTreeAccent,
} from "@/components/shared/SkillTreeShell";

type BaseStatus = "locked" | "available" | "in_progress" | "mastered";

interface GradeTier {
  id: string;
  title: string;
  atomic_skills: Array<{ id: string; title: string }>;
}
interface GradeLevel {
  id: number;
  tiers: GradeTier[];
}

/** Pure mastered/total/progress computation for a grade-locked subject, usable
 *  without mounting the tree (e.g. for a subject landing screen's stats line).
 *  Mirrors the calculation GradeLockedSkillTree does internally. */
export function computeGradeTreeStats(
  tree: { levels: GradeLevel[] },
  grade: number,
  seedForGrade: (grade: number) => { level: number; belowContent?: boolean; beyondContent?: boolean },
  statusFor: (skillId: string) => BaseStatus,
  progressFor: (skillIds: string[]) => number
): { grade: number; mastered: number; total: number; progress: number } {
  const seed = seedForGrade(grade);
  const level = tree.levels.find((l) => l.id === seed.level);
  if (!level) return { grade: seed.level, mastered: 0, total: 0, progress: 0 };
  let mastered = 0;
  const ids: string[] = [];
  for (const tier of level.tiers) {
    for (const skill of tier.atomic_skills) {
      ids.push(skill.id);
      if (statusFor(skill.id) === "mastered") mastered += 1;
    }
  }
  return { grade: seed.level, mastered, total: ids.length, progress: progressFor(ids) };
}

export interface GradeLockedSkillTreeProps {
  accent: SkillTreeAccent;
  /** Header title, e.g. "History Skill Tree". */
  title: string;
  /** Short subject name for the back row, e.g. "History" → "← History". */
  backLabel?: string;
  /** Level-card sub-line, e.g. "Mastery 75% · 20 questions per topic". */
  subhead?: string;
  tree: { levels: GradeLevel[] };
  defaultGrade: number;
  seedForGrade: (grade: number) => { level: number; belowContent?: boolean; beyondContent?: boolean };
  /** Resolve a skill's base status (closure capturing the caller's profile). */
  statusFor: (skillId: string) => BaseStatus;
  /** Resolve level progress 0–100 (closure capturing the caller's profile). */
  progressFor: (skillIds: string[]) => number;
  onPickSkill: (skillId: string) => void;
  onBack?: () => void;
  compact?: boolean;
  /** Shown when no level exists for the learner's grade yet. */
  comingSoon: ReactNode;
  noticeBelow?: ReactNode;
  noticeBeyond?: ReactNode;
}

export default function GradeLockedSkillTree({
  accent,
  title,
  backLabel,
  subhead,
  tree,
  defaultGrade,
  seedForGrade,
  statusFor,
  progressFor,
  onPickSkill,
  onBack,
  compact,
  comingSoon,
  noticeBelow,
  noticeBeyond,
}: GradeLockedSkillTreeProps) {
  // Seed synchronously from the last-known grade (shared with the Subjects
  // hub's cache) so the tree paints immediately instead of blocking on a
  // network round-trip every time it mounts. Supabase then confirms/corrects
  // it in the background below.
  const [grade, setGrade] = useState<number | null>(() => readCachedGrade());
  const [loading, setLoading] = useState(() => readCachedGrade() === null);

  useEffect(() => {
    fetchAuthorisedGrade().then((data) => {
      if (data?.grade != null) {
        setGrade(data.grade);
        writeCachedGrade(data.grade);
      } else {
        setGrade((g) => g ?? defaultGrade);
      }
      setLoading(false);
    });
  }, [defaultGrade]);

  const seed = useMemo(() => seedForGrade(grade ?? defaultGrade), [grade, defaultGrade, seedForGrade]);
  const level = tree.levels.find((l) => l.id === seed.level);

  // "Current" = first not-yet-mastered, unlocked topic in CAPS order.
  const currentSkillId = useMemo<string | null>(() => {
    if (!level) return null;
    for (const tier of level.tiers) {
      for (const skill of tier.atomic_skills) {
        const status = statusFor(skill.id);
        if (status === "available" || status === "in_progress") return skill.id;
      }
    }
    return null;
  }, [level, statusFor]);

  const { tiers, mastered, total, masteredTiers, totalTiers, progress } = useMemo(() => {
    if (!level)
      return { tiers: [] as TreeLevel["tiers"], mastered: 0, total: 0, masteredTiers: 0, totalTiers: 0, progress: 0 };
    let mastered = 0, total = 0, masteredTiers = 0;
    const tiers = level.tiers.map((tier) => {
      let tierTotal = 0, tierMastered = 0;
      const skills = tier.atomic_skills.map((skill) => {
        total += 1;
        tierTotal += 1;
        const rawStatus = statusFor(skill.id);
        // Exam-season override: Grade 12 sees nothing locked (it was already
        // tappable either way — this only drops the cosmetic "locked" look).
        // Temporary for the exam period — remove this to restore normal
        // grade-locked cosmetics.
        const base = grade === 12 && rawStatus === "locked" ? "available" : rawStatus;
        if (base === "mastered") { mastered += 1; tierMastered += 1; }
        const status: SkillTreeStatus =
          skill.id === currentSkillId && base === "available" ? "current" : base;
        return {
          id: skill.id,
          title: skill.title,
          status,
          // Every skill is tappable, regardless of mastery/prerequisite status —
          // no section is gated behind unlocking another one first.
          onClick: () => onPickSkill(skill.id),
        };
      });
      if (tierTotal > 0 && tierMastered === tierTotal) masteredTiers += 1;
      return { id: tier.id, title: tier.title, skills };
    });
    const ids = level.tiers.flatMap((t) => t.atomic_skills.map((s) => s.id));
    return { tiers, mastered, total, masteredTiers, totalTiers: level.tiers.length, progress: progressFor(ids) };
  }, [level, statusFor, progressFor, currentSkillId, onPickSkill]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F4F4F5]">
        <p className="text-gray-500 text-lg">Loading…</p>
      </div>
    );
  }

  if (!level || level.tiers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F4F4F5] p-6 text-center">
        <p className="text-gray-600">{comingSoon}</p>
      </div>
    );
  }

  const levels: TreeLevel[] = [
    {
      id: level.id,
      badge: `G${seed.level}`,
      title: `Grade ${seed.level}`,
      description: subhead,
      progressPct: progress,
      isCurrent: true,
      defaultOpen: true,
      tiers,
    },
  ];

  const notice = seed.belowContent ? noticeBelow : seed.beyondContent ? noticeBeyond : undefined;

  return (
    <SkillTreeShell
      accent={accent}
      title={title}
      backLabel={backLabel}
      statline={`${total > 0 && mastered === total ? 1 : 0}/1 Levels · ${masteredTiers}/${totalTiers} Tiers · ${mastered}/${total} Atomic skills · ${progress}%`}
      levels={levels}
      compact={compact}
      onBack={onBack}
      notice={notice}
    />
  );
}
