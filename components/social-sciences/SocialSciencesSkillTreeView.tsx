"use client";

// Thin wrapper over the shared GradeLockedSkillTree so Social Sciences matches
// every other subject. Topics aren't prerequisite-locked, so every topic is
// tappable; status + progress come from the passed mastery map. History and
// Geography strands render as the level's tiers.

import socialSciencesTreeData from "@/data/social-sciences-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/social-sciences-grade-map";
import type { SocialSciencesSkillTree } from "@/types/social-sciences";
import GradeLockedSkillTree from "@/components/shared/GradeLockedSkillTree";

const tree = socialSciencesTreeData as unknown as SocialSciencesSkillTree;

interface SocialSciencesSkillTreeViewProps {
  onPickTopic: (skillId: string) => void;
  masteryStatus?: Record<string, "mastered" | "in_progress" | "available">;
  onBack?: () => void;
}

export default function SocialSciencesSkillTreeView({
  onPickTopic,
  masteryStatus,
  onBack,
}: SocialSciencesSkillTreeViewProps) {
  const mastery = masteryStatus ?? {};
  return (
    <GradeLockedSkillTree
      accent="amber"
      title="Social Sciences Skill Tree"
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
      comingSoon="No Social Sciences content available for this grade yet."
      noticeBelow={
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
          Social Sciences starts at Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s a peek at Grade {LOWEST_AVAILABLE_LEVEL}.
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
