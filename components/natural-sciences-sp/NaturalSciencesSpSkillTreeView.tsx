"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Natural Sciences SP
// matches every other subject. Subject-specific logic stays in
// lib/natural-sciences-sp-student-model. Accent matches Physical Sciences (rose).

import naturalSciencesSpSkillTreeData from "@/data/natural-sciences-sp-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/natural-sciences-sp-grade-map";
import {
  getNaturalSciencesSpSkillStatus,
  getNaturalSciencesSpLevelProgress,
} from "@/lib/natural-sciences-sp-student-model";
import type {
  NaturalSciencesSpSkillTree,
  NaturalSciencesSpStudentProfile,
} from "@/types/natural-sciences-sp";
import GradeLockedSkillTree from "@/components/shared/GradeLockedSkillTree";

const tree = naturalSciencesSpSkillTreeData as unknown as NaturalSciencesSpSkillTree;

interface NaturalSciencesSpSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: NaturalSciencesSpStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function NaturalSciencesSpSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: NaturalSciencesSpSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="rose"
      title="Natural Sciences Skill Tree"
      subhead="Mastery 75% · 20 questions per topic"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getNaturalSciencesSpSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getNaturalSciencesSpLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Natural Sciences grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Natural Sciences starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
