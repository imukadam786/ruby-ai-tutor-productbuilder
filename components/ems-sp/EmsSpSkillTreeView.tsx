"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Economic & Management Sciences SP
// matches every other subject. Subject-specific logic stays in
// lib/ems-sp-student-model. Accent: violet.

import emsSpSkillTreeData from "@/data/ems-sp-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/ems-sp-grade-map";
import {
  getEmsSpSkillStatus,
  getEmsSpLevelProgress,
} from "@/lib/ems-sp-student-model";
import type {
  EmsSpSkillTree,
  EmsSpStudentProfile,
} from "@/types/ems-sp";
import GradeLockedSkillTree, { computeGradeTreeStats } from "@/components/shared/GradeLockedSkillTree";

const tree = emsSpSkillTreeData as unknown as EmsSpSkillTree;

/** Stats for the subject landing screen, without mounting the tree. */
export function getEmsSpStats(grade: number, profile: EmsSpStudentProfile | null) {
  return computeGradeTreeStats(
    tree,
    grade,
    seedForGrade,
    (id) => getEmsSpSkillStatus(id, profile),
    (ids) => (profile ? getEmsSpLevelProgress(ids, profile.skill_mastery) : 0)
  );
}

interface EmsSpSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: EmsSpStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function EmsSpSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: EmsSpSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="violet"
      title="Economic & Management Sciences Skill Tree"
      backLabel="Economic & Management Sciences"
      subhead="The Economy · Financial Literacy · Entrepreneurship · master each topic at 75%"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getEmsSpSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getEmsSpLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Economic & Management Sciences grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Economic & Management Sciences starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
