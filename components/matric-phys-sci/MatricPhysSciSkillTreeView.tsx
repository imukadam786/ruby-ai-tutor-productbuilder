"use client";

import { useEffect, useMemo, useState } from "react";
import { getMatricPhysSciMasteryMap } from "@/lib/matric-phys-sci-student-model";
import { physSciConfig, type PhysSciGrade } from "@/lib/phys-sci-grade";
import SkillTreeShell, { type TreeLevel, type SkillTreeStatus } from "@/components/shared/SkillTreeShell";

interface Props {
  onPickSkill: (skillId: string) => void;
  masteryStatus?: Record<string, "mastered" | "in_progress" | "available">;
  onBack?: () => void;
  /** When true, only the first level (or the level with the most progress)
   *  renders by default. A toggle reveals the full tree. */
  compact?: boolean;
  /** Which Physical Sciences grade's tree to show. Defaults to 12 (matric). */
  grade?: PhysSciGrade;
}

export default function MatricPhysSciSkillTreeView({
  onPickSkill,
  masteryStatus,
  onBack,
  compact,
  grade = 12,
}: Props) {
  const config = physSciConfig(grade);
  const tree = config.tree;
  const [showAllLevels, setShowAllLevels] = useState<boolean>(!compact);
  useEffect(() => { setShowAllLevels(!compact); }, [compact]);
  const [localMastery, setLocalMastery] = useState<Record<string, "mastered" | "in_progress" | "available">>({});
  useEffect(() => {
    if (!masteryStatus) setLocalMastery(getMatricPhysSciMasteryMap(grade));
  }, [masteryStatus, grade]);
  const mastery = masteryStatus ?? localMastery;

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
      statline: `${masteredLevels}/${tree.levels.length} Levels · ${masteredTiers}/${totalTiers} Tiers · ${masteredSkills}/${totalSkills} Atomic skills · ${totalSkills > 0 ? Math.round((masteredSkills / totalSkills) * 100) : 0}%`,
      levelProgress,
    };
  }, [mastery, tree]);

  const levels: TreeLevel[] = useMemo(() => {
    const source = showAllLevels
      ? tree.levels
      : (() => {
          const inProg = tree.levels.find((l) =>
            l.tiers.some((t) => t.atomic_skills.some((s) => mastery[s.id] === "in_progress")),
          );
          if (inProg) return [inProg];
          const partial = tree.levels.find((l) => (levelProgress[l.id] || 0) > 0 && (levelProgress[l.id] || 0) < 100);
          return [partial ?? tree.levels[0]];
        })();
    const firstId = tree.levels[0]?.id;
    return source.map((level): TreeLevel => ({
      id: level.id,
      badge: `L${level.id}`,
      title: level.title,
      description: level.description,
      progressPct: levelProgress[level.id] || 0,
      defaultOpen: showAllLevels ? level.id === firstId : true,
      tiers: level.tiers.map((tier) => ({
        id: tier.id,
        title: tier.title,
        skills: tier.atomic_skills.map((skill) => ({
          id: skill.id,
          title: skill.title,
          status: (mastery[skill.id] ?? "available") as SkillTreeStatus,
          onClick: () => onPickSkill(skill.id),
        })),
      })),
    }));
  }, [showAllLevels, mastery, levelProgress, onPickSkill, tree]);

  return (
    <SkillTreeShell
      accent="rose"
      title={config.treeTitle}
      statline={statline}
      levels={levels}
      compact={compact}
      onBack={onBack}
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
