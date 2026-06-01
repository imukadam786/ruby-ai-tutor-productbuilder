"use client";

// Shared adapter for the grade-locked FET content subjects (History, Geography,
// Tourism, Business Studies, Life Sciences). They all behave identically: the
// learner's onboarding grade selects exactly one level, its tiers (CAPS terms /
// strands) become sub-sections, and each topic is a tappable skill that opens a
// session. Everything renders through SkillTreeShell so it matches every other
// subject. Subject-specific status/progress logic stays in the caller and is
// passed in as closures — no back-end logic lives here.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
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

export interface GradeLockedSkillTreeProps {
  accent: SkillTreeAccent;
  /** Header title, e.g. "History Skill Tree". */
  title: string;
  /** Level-card sub-line, e.g. "Pass mark 60% · No timer · 20 questions per topic". */
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
  const [grade, setGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorisedGrade().then((data) => {
      setGrade(data?.grade ?? defaultGrade);
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

  const { tiers, mastered, total, progress } = useMemo(() => {
    if (!level) return { tiers: [] as TreeLevel["tiers"], mastered: 0, total: 0, progress: 0 };
    let mastered = 0, total = 0;
    const tiers = level.tiers.map((tier) => ({
      id: tier.id,
      title: tier.title,
      skills: tier.atomic_skills.map((skill) => {
        total += 1;
        const base = statusFor(skill.id);
        if (base === "mastered") mastered += 1;
        const status: SkillTreeStatus =
          skill.id === currentSkillId && base === "available" ? "current" : base;
        return {
          id: skill.id,
          title: skill.title,
          status,
          onClick: base === "locked" ? undefined : () => onPickSkill(skill.id),
        };
      }),
    }));
    const ids = level.tiers.flatMap((t) => t.atomic_skills.map((s) => s.id));
    return { tiers, mastered, total, progress: progressFor(ids) };
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
      statline={`Grade ${seed.level} · ${mastered}/${total} topics · ${progress}%`}
      levels={levels}
      compact={compact}
      onBack={onBack}
      notice={notice}
    />
  );
}
