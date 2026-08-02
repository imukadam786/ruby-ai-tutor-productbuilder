"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Economics matches
// every other subject. Subject logic stays in lib/economics-student-model.

import economicsSkillTreeData from "@/data/economics-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/economics-grade-map";
import {
  getEconomicsSkillStatus,
  getEconomicsLevelProgress,
} from "@/lib/economics-student-model";
import type { EconomicsSkillTree, EconomicsStudentProfile } from "@/types/economics";
import GradeLockedSkillTree, { computeGradeTreeStats } from "@/components/shared/GradeLockedSkillTree";

const tree = economicsSkillTreeData as unknown as EconomicsSkillTree;

/** Stats for the subject landing screen, without mounting the tree. */
export function getEconomicsStats(grade: number, profile: EconomicsStudentProfile | null) {
  return computeGradeTreeStats(
    tree,
    grade,
    seedForGrade,
    (id) => getEconomicsSkillStatus(id, profile),
    (ids) => (profile ? getEconomicsLevelProgress(ids, profile.skill_mastery) : 0)
  );
}

interface EconomicsSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: EconomicsStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function EconomicsSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: EconomicsSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="indigo"
      title="Economics Skill Tree"
      backLabel="Economics"
      subhead="Mastery 75% · 20 questions per topic"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getEconomicsSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getEconomicsLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Economics content is coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Economics starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
        </div>
      }
      noticeBeyond={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          You&apos;re past the Grade {HIGHEST_AVAILABLE_LEVEL} content. Here&apos;s the Grade {HIGHEST_AVAILABLE_LEVEL} matric prep.
        </div>
      }
    />
  );
}
