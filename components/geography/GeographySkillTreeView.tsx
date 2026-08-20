"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Geography matches every
// other subject. Geography-specific logic stays in lib/geography-student-model.

import geographySkillTreeData from "@/data/geography-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/geography-grade-map";
import {
  getGeographySkillStatus,
  getGeographyLevelProgress,
} from "@/lib/geography-student-model";
import type { GeographySkillTree, GeographyStudentProfile } from "@/types/geography";
import GradeLockedSkillTree, { computeGradeTreeStats } from "@/components/shared/GradeLockedSkillTree";

const tree = geographySkillTreeData as unknown as GeographySkillTree;

/** Stats for the subject landing screen, without mounting the tree. */
export function getGeographyStats(grade: number, profile: GeographyStudentProfile | null) {
  return computeGradeTreeStats(
    tree,
    grade,
    seedForGrade,
    (id) => getGeographySkillStatus(id, profile),
    (ids) => (profile ? getGeographyLevelProgress(ids, profile.skill_mastery) : 0)
  );
}

interface GeographySkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: GeographyStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function GeographySkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: GeographySkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="sky"
      title="Geography Skill Tree"
      backLabel="Geography"
      subhead="Mastery 75% · 20 questions per topic"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getGeographySkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getGeographyLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Geography grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Geography starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
