"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Social Sciences SP
// matches every other subject. Subject-specific logic stays in
// lib/social-sciences-sp-student-model. Accent: orange.

import socialSciencesSpSkillTreeData from "@/data/social-sciences-sp-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/social-sciences-sp-grade-map";
import {
  getSocialSciencesSpSkillStatus,
  getSocialSciencesSpLevelProgress,
} from "@/lib/social-sciences-sp-student-model";
import type {
  SocialSciencesSpSkillTree,
  SocialSciencesSpStudentProfile,
} from "@/types/social-sciences-sp";
import GradeLockedSkillTree from "@/components/shared/GradeLockedSkillTree";

const tree = socialSciencesSpSkillTreeData as unknown as SocialSciencesSpSkillTree;

interface SocialSciencesSpSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: SocialSciencesSpStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function SocialSciencesSpSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: SocialSciencesSpSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="orange"
      title="Social Sciences Skill Tree"
      subhead="History &amp; Geography · master each topic at 75%"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getSocialSciencesSpSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getSocialSciencesSpLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Social Sciences grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Social Sciences starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
