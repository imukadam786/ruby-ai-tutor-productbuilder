"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Accounting matches
// every other subject. Subject logic stays in lib/accounting-student-model.

import accountingSkillTreeData from "@/data/accounting-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/accounting-grade-map";
import {
  getAccountingSkillStatus,
  getAccountingLevelProgress,
} from "@/lib/accounting-student-model";
import type { AccountingSkillTree, AccountingStudentProfile } from "@/types/accounting";
import GradeLockedSkillTree from "@/components/shared/GradeLockedSkillTree";

const tree = accountingSkillTreeData as unknown as AccountingSkillTree;

interface AccountingSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: AccountingStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function AccountingSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: AccountingSkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="emerald"
      title="Accounting Skill Tree"
      subhead="Mastery 75% · 20 questions per topic"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getAccountingSkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getAccountingLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More Accounting grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Accounting starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
