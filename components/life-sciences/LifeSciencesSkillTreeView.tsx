"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Life Sciences matches
// every other subject. Subject logic stays in lib/life-sciences-student-model.

import lifeSciencesSkillTreeData from "@/data/life-sciences-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/life-sciences-grade-map";
import {
  getLifeSciencesSkillStatus,
  getLifeSciencesLevelProgress,
} from "@/lib/life-sciences-student-model";
import type { LifeSciencesSkillTree, LifeSciencesStudentProfile } from "@/types/life-sciences";
import GradeLockedSkillTree from "@/components/shared/GradeLockedSkillTree";

const tree = lifeSciencesSkillTreeData as unknown as LifeSciencesSkillTree;

interface LifeSciencesSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: LifeSciencesStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function LifeSciencesSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: LifeSciencesSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="emerald"
      title="Life Sciences Skill Tree"
      subhead="Pass mark 60% · No timer · 20 questions per topic"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getLifeSciencesSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getLifeSciencesLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Life Sciences grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Life Sciences starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
