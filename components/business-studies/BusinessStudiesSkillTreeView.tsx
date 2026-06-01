"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Business Studies matches
// every other subject. Subject logic stays in lib/business-studies-student-model.

import businessStudiesSkillTreeData from "@/data/business-studies-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/business-studies-grade-map";
import {
  getBusinessStudiesSkillStatus,
  getBusinessStudiesLevelProgress,
} from "@/lib/business-studies-student-model";
import type { BusinessStudiesSkillTree, BusinessStudiesStudentProfile } from "@/types/business-studies";
import GradeLockedSkillTree from "@/components/shared/GradeLockedSkillTree";

const tree = businessStudiesSkillTreeData as unknown as BusinessStudiesSkillTree;

interface BusinessStudiesSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: BusinessStudiesStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function BusinessStudiesSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: BusinessStudiesSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="amber"
      title="Business Studies Skill Tree"
      subhead="Pass mark 60% · No timer · 20 questions per topic"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getBusinessStudiesSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getBusinessStudiesLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Business Studies grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Business Studies starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
