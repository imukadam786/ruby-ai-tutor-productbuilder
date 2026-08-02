"use client";

// Thin wrapper over the shared GradeLockedSkillTree so History matches every
// other subject. All History-specific status/progress logic stays in
// lib/history-student-model; only presentation is delegated.

import historySkillTreeData from "@/data/history-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/history-grade-map";
import {
  getHistorySkillStatus,
  getHistoryLevelProgress,
} from "@/lib/history-student-model";
import type { HistorySkillTree, HistoryStudentProfile } from "@/types/history";
import GradeLockedSkillTree, { computeGradeTreeStats } from "@/components/shared/GradeLockedSkillTree";

const tree = historySkillTreeData as unknown as HistorySkillTree;

/** Stats for the subject landing screen, without mounting the tree. */
export function getHistoryStats(grade: number, profile: HistoryStudentProfile | null) {
  return computeGradeTreeStats(
    tree,
    grade,
    seedForGrade,
    (id) => getHistorySkillStatus(id, profile),
    (ids) => (profile ? getHistoryLevelProgress(ids, profile.skill_mastery) : 0)
  );
}

interface HistorySkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: HistoryStudentProfile | null;
  onBack?: () => void;
  compact?: boolean;
}

export default function HistorySkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: HistorySkillTreeViewProps) {
  return (
    <GradeLockedSkillTree
      accent="amber"
      title="History Skill Tree"
      backLabel="History"
      subhead="Mastery 75% · 20 questions per topic"
      tree={tree}
      defaultGrade={LOWEST_AVAILABLE_LEVEL}
      seedForGrade={seedForGrade}
      statusFor={(id) => getHistorySkillStatus(id, profile)}
      progressFor={(ids) => (profile ? getHistoryLevelProgress(ids, profile.skill_mastery) : 0)}
      onPickSkill={onPickSkill}
      onBack={onBack}
      compact={compact}
      comingSoon="More History grades are coming soon."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          History starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
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
