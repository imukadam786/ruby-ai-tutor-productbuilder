"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Creative Arts SP
// matches every other subject. Subject-specific logic stays in
// lib/creative-arts-sp-student-model. Accent: pink.

import creativeArtsSpSkillTreeData from "@/data/creative-arts-sp-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/creative-arts-sp-grade-map";
import {
  getCreativeArtsSpSkillStatus,
  getCreativeArtsSpLevelProgress,
} from "@/lib/creative-arts-sp-student-model";
import type {
  CreativeArtsSpSkillTree,
  CreativeArtsSpStudentProfile,
} from "@/types/creative-arts-sp";
import GradeLockedSkillTree, { computeGradeTreeStats } from "@/components/shared/GradeLockedSkillTree";

const tree = creativeArtsSpSkillTreeData as unknown as CreativeArtsSpSkillTree;

/** Stats for the subject landing screen, without mounting the tree. */
export function getCreativeArtsSpStats(grade: number, profile: CreativeArtsSpStudentProfile | null) {
  return computeGradeTreeStats(
    tree,
    grade,
    seedForGrade,
    (id) => getCreativeArtsSpSkillStatus(id, profile),
    (ids) => (profile ? getCreativeArtsSpLevelProgress(ids, profile.skill_mastery) : 0)
  );
}

interface CreativeArtsSpSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: CreativeArtsSpStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function CreativeArtsSpSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: CreativeArtsSpSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="pink"
      title="Creative Arts Skill Tree"
      backLabel="Creative Arts"
      subhead="Music · Visual Arts · master each topic at 75%"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getCreativeArtsSpSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getCreativeArtsSpLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Creative Arts grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Creative Arts (Music &amp; Visual Arts) starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
