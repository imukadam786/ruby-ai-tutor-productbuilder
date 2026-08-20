"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Technology SP
// matches every other subject. Subject-specific logic stays in
// lib/technology-sp-student-model. Accent: violet.

import technologySpSkillTreeData from "@/data/technology-sp-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/technology-sp-grade-map";
import {
  getTechnologySpSkillStatus,
  getTechnologySpLevelProgress,
} from "@/lib/technology-sp-student-model";
import type {
  TechnologySpSkillTree,
  TechnologySpStudentProfile,
} from "@/types/technology-sp";
import GradeLockedSkillTree, { computeGradeTreeStats } from "@/components/shared/GradeLockedSkillTree";

const tree = technologySpSkillTreeData as unknown as TechnologySpSkillTree;

/** Stats for the subject landing screen, without mounting the tree. */
export function getTechnologySpStats(grade: number, profile: TechnologySpStudentProfile | null) {
  return computeGradeTreeStats(
    tree,
    grade,
    seedForGrade,
    (id) => getTechnologySpSkillStatus(id, profile),
    (ids) => (profile ? getTechnologySpLevelProgress(ids, profile.skill_mastery) : 0)
  );
}

interface TechnologySpSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: TechnologySpStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function TechnologySpSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: TechnologySpSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="slate"
      title="Technology Skill Tree"
      backLabel="Technology"
      subhead="The Economy · Financial Literacy · Entrepreneurship · master each topic at 75%"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getTechnologySpSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getTechnologySpLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Technology grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Technology starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
