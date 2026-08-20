"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Natural Sciences & Tech
// matches every other subject. NST topics aren't prerequisite-locked, so every
// topic is tappable; status + progress come from the passed mastery map.

import nstTreeData from "@/data/nst-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/nst-grade-map";
import type { NstSkillTree } from "@/types/nst";
import GradeLockedSkillTree from "@/components/shared/GradeLockedSkillTree";

const tree = nstTreeData as unknown as NstSkillTree;

interface NstSkillTreeViewProps {
  onPickTopic: (skillId: string) => void;
  masteryStatus?: Record<string, "mastered" | "in_progress" | "available">;
  onBack?: () => void;
  compact?: boolean;
}

export default function NstSkillTreeView({
  onPickTopic,
  masteryStatus,
  onBack,
  compact,
}: NstSkillTreeViewProps) {
  const mastery = masteryStatus ?? {};
  return (
    <GradeLockedSkillTree
      accent="lime"
      title="Natural Sciences & Tech Skill Tree"
      subhead="Pick a topic to start. Ruby will read each question to you."
      tree={tree}
      defaultGrade={4}
      seedForGrade={seedForGrade}
      statusFor={(id) => mastery[id] ?? "available"}
      progressFor={(ids) => {
        if (ids.length === 0) return 0;
        const done = ids.filter((id) => mastery[id] === "mastered").length;
        return Math.round((done / ids.length) * 100);
      }}
      onPickSkill={onPickTopic}
      onBack={onBack}
      compact={compact}
      comingSoon="No Natural Sciences & Tech content available for this grade yet."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Natural Sciences &amp; Tech starts at Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s a peek at Grade {LOWEST_AVAILABLE_LEVEL}.
        </div>
      }
      noticeBeyond={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          More grades coming soon. Here are Grade {HIGHEST_AVAILABLE_LEVEL} topics for now.
        </div>
      }
    />
  );
}
