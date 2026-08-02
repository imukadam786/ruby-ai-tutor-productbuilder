"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Life Orientation SP
// matches every other subject. Subject-specific logic stays in
// lib/life-orientation-sp-student-model. Accent: lime.

import lifeOrientationSpSkillTreeData from "@/data/life-orientation-sp-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/life-orientation-sp-grade-map";
import {
  getLifeOrientationSpSkillStatus,
  getLifeOrientationSpLevelProgress,
} from "@/lib/life-orientation-sp-student-model";
import type {
  LifeOrientationSpSkillTree,
  LifeOrientationSpStudentProfile,
} from "@/types/life-orientation-sp";
import GradeLockedSkillTree, { computeGradeTreeStats } from "@/components/shared/GradeLockedSkillTree";

const tree = lifeOrientationSpSkillTreeData as unknown as LifeOrientationSpSkillTree;

/** Stats for the subject landing screen, without mounting the tree. */
export function getLifeOrientationSpStats(grade: number, profile: LifeOrientationSpStudentProfile | null) {
  return computeGradeTreeStats(
    tree,
    grade,
    seedForGrade,
    (id) => getLifeOrientationSpSkillStatus(id, profile),
    (ids) => (profile ? getLifeOrientationSpLevelProgress(ids, profile.skill_mastery) : 0)
  );
}

interface LifeOrientationSpSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: LifeOrientationSpStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function LifeOrientationSpSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: LifeOrientationSpSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="lime"
      title="Life Orientation Skill Tree"
      backLabel="Life Orientation"
      subhead="Development of the self · Health & responsibility · Constitutional rights · World of work · master each topic at 75%"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getLifeOrientationSpSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getLifeOrientationSpLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Life Orientation grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Life Orientation starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
        </div>
      }
      noticeBeyond={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          You&apos;re past the Grade {HIGHEST_AVAILABLE_LEVEL} content. Here&apos;s the Grade {HIGHEST_AVAILABLE_LEVEL} work to revise.
        </div>
      }
    />
  );
}
