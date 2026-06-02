"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Tourism matches every
// other subject. Tourism-specific logic stays in lib/tourism-student-model.

import tourismSkillTreeData from "@/data/tourism-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/tourism-grade-map";
import {
  getTourismSkillStatus,
  getTourismLevelProgress,
} from "@/lib/tourism-student-model";
import type { TourismSkillTree, TourismStudentProfile } from "@/types/tourism";
import GradeLockedSkillTree from "@/components/shared/GradeLockedSkillTree";

const tree = tourismSkillTreeData as unknown as TourismSkillTree;

interface TourismSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: TourismStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function TourismSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: TourismSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="cyan"
      title="Tourism Skill Tree"
      subhead="Pass mark 60% · No timer · 20 questions per topic"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getTourismSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getTourismLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Tourism grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Tourism starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
