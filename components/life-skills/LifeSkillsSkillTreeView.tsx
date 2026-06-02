"use client";

import { useEffect, useMemo, useState } from "react";
import lifeSkillsTreeData from "@/data/life-skills-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/life-skills-grade-map";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import type { LifeSkillsSkillTree } from "@/types/life-skills";
import SkillTreeShell, { type TreeLevel, type SkillTreeStatus } from "@/components/shared/SkillTreeShell";

const tree = lifeSkillsTreeData as unknown as LifeSkillsSkillTree;

interface LifeSkillsSkillTreeViewProps {
  onPickTopic: (skillId: string) => void;
  masteryStatus?: Record<string, "mastered" | "in_progress" | "available">;
  onBack?: () => void;
  /** When true, renders only the learner's current grade-level by default
   *  and exposes a "View full tree" toggle. */
  compact?: boolean;
}

export default function LifeSkillsSkillTreeView({
  onPickTopic,
  masteryStatus,
  onBack,
  compact,
}: LifeSkillsSkillTreeViewProps) {
  const [showAllLevels, setShowAllLevels] = useState<boolean>(!compact);
  useEffect(() => { setShowAllLevels(!compact); }, [compact]);
  const [grade, setGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorisedGrade().then((data) => {
      setGrade(data?.grade ?? 1);
      setLoading(false);
    });
  }, []);

  const seed = useMemo(() => seedForGrade(grade ?? 1), [grade]);
  const currentLevelId = seed.level;
  const mastery = masteryStatus ?? {};

  const { statline, levelProgress } = useMemo(() => {
    let totalTiers = 0, totalSkills = 0, masteredTiers = 0, masteredSkills = 0, masteredLevels = 0;
    const levelProgress: Record<number, number> = {};
    for (const level of tree.levels) {
      totalTiers += level.tiers.length;
      let levelSkillCount = 0, levelMasteredCount = 0;
      for (const tier of level.tiers) {
        totalSkills += tier.atomic_skills.length;
        const tierMastered = tier.atomic_skills.filter((s) => mastery[s.id] === "mastered").length;
        masteredSkills += tierMastered;
        levelSkillCount += tier.atomic_skills.length;
        levelMasteredCount += tierMastered;
        if (tier.atomic_skills.length > 0 && tierMastered === tier.atomic_skills.length) masteredTiers++;
      }
      if (levelSkillCount > 0 && levelMasteredCount === levelSkillCount) masteredLevels++;
      levelProgress[level.id] = levelSkillCount > 0 ? Math.round((levelMasteredCount / levelSkillCount) * 100) : 0;
    }
    return {
      statline: `${masteredLevels}/${tree.levels.length} Levels · ${masteredTiers}/${totalTiers} Tiers · ${masteredSkills}/${totalSkills} Atomic skills`,
      levelProgress,
    };
  }, [mastery]);

  const levels: TreeLevel[] = useMemo(() => {
    if (loading) return [];
    const source = showAllLevels ? tree.levels : tree.levels.filter((l) => l.id === currentLevelId);
    return source.map((level): TreeLevel => {
      const isCurrent = level.id === currentLevelId;
      return {
        id: level.id,
        badge: `L${level.id}`,
        title: level.title,
        description: level.description,
        progressPct: levelProgress[level.id] || 0,
        isCurrent,
        defaultOpen: isCurrent,
        tiers: level.tiers.map((tier) => ({
          id: tier.id,
          title: tier.title,
          skills: tier.atomic_skills.map((skill) => ({
            id: skill.id,
            title: skill.title,
            status: (mastery[skill.id] ?? "available") as SkillTreeStatus,
            onClick: () => onPickTopic(skill.id),
          })),
        })),
      };
    });
  }, [loading, showAllLevels, currentLevelId, levelProgress, mastery, onPickTopic]);

  const notice =
    !loading && (seed.belowContent || seed.beyondContent) ? (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
        {seed.belowContent
          ? `Life Skills starts at Grade ${LOWEST_AVAILABLE_LEVEL}. Here's a peek at Grade ${LOWEST_AVAILABLE_LEVEL}.`
          : `More grades coming soon. Here are Grade ${HIGHEST_AVAILABLE_LEVEL} topics for now.`}
      </div>
    ) : undefined;

  return (
    <SkillTreeShell
      accent="pink"
      title="Life Skills Skill Tree"
      statline={statline}
      levels={levels}
      compact={compact}
      onBack={onBack}
      notice={notice}
      footerToggle={
        compact
          ? {
              label: showAllLevels ? "Show only current level ▲" : "View full tree ▼",
              onClick: () => setShowAllLevels((v) => !v),
            }
          : undefined
      }
    />
  );
}
