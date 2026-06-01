"use client";

import { useEffect, useMemo, useState } from "react";
import skillTreeData from "@/data/skill-tree.json";
import { StudentProfile } from "@/types/ruby";
import { getSkillStatus } from "@/lib/student-model";
import { getLevelProgress } from "@/lib/mastery-engine";
import { useT } from "@/lib/i18n";
import SkillTreeShell, { type TreeLevel, type SkillTreeStatus } from "@/components/shared/SkillTreeShell";

interface SkillTreeViewProps {
  profile: StudentProfile | null;
  /** When provided, skills the student has already completed/attained become
   *  tappable to replay (extra practice — no progression is changed). */
  onReplaySkill?: (skillId: string) => void;
  /** When provided, shows a "Continue where you left off" affordance (and makes
   *  the active skill tile tappable) that resumes the current skill's session. */
  onContinue?: () => void;
  /** Optional back action — shows a "← Subjects" button when provided. */
  onBack?: () => void;
  /** When true, renders only the learner's current level by default and
   *  exposes a "View full tree" toggle. */
  compact?: boolean;
}

export default function SkillTreeView({ profile, onReplaySkill, onContinue, onBack, compact }: SkillTreeViewProps) {
  const { t } = useT();
  const [showAllLevels, setShowAllLevels] = useState<boolean>(!compact);
  useEffect(() => { setShowAllLevels(!compact); }, [compact]);
  const currentLevelId = profile?.current_level ?? 1;

  const levelProgress = useMemo(() => {
    if (!profile) return {} as Record<number, number>;
    const result: Record<number, number> = {};
    for (const level of skillTreeData.levels) {
      const allSkillIds = level.tiers.flatMap((t) => t.atomic_skills.map((s) => s.id));
      result[level.id] = getLevelProgress(allSkillIds, profile.skill_mastery);
    }
    return result;
  }, [profile]);

  const statline = useMemo(() => {
    let totalTiers = 0, totalSkills = 0, masteredTiers = 0, masteredSkills = 0, masteredLevels = 0;
    const mastery = profile?.skill_mastery ?? {};
    const isMastered = (id: string) => {
      const s = mastery[id]?.status;
      return s === "mastered" || s === "assumed";
    };
    for (const level of skillTreeData.levels) {
      totalTiers += level.tiers.length;
      let levelSkillCount = 0, levelMasteredCount = 0;
      for (const tier of level.tiers) {
        totalSkills += tier.atomic_skills.length;
        const tierMastered = tier.atomic_skills.filter((s) => isMastered(s.id)).length;
        masteredSkills += tierMastered;
        levelSkillCount += tier.atomic_skills.length;
        levelMasteredCount += tierMastered;
        if (tier.atomic_skills.length > 0 && tierMastered === tier.atomic_skills.length) masteredTiers++;
      }
      if (levelSkillCount > 0 && levelMasteredCount === levelSkillCount) masteredLevels++;
    }
    return `${masteredLevels}/${skillTreeData.levels.length} Levels · ${masteredTiers}/${totalTiers} Tiers · ${masteredSkills}/${totalSkills} Atomic skills`;
  }, [profile]);

  const autoCompletedIds = useMemo(
    () => new Set(profile?.placement?.autoCompletedSkillIds ?? []),
    [profile],
  );
  const entrySkillId = profile?.placement?.entrySkillId ?? null;
  const hardGatePassed = profile?.placement?.hardGatePassed ?? true;

  function getExtendedStatus(skillId: string): SkillTreeStatus {
    if (!profile) return "locked";
    if (skillId === profile.current_skill_id) return "active";
    if (skillId === entrySkillId && !autoCompletedIds.has(skillId)) return "entry_point";
    if (autoCompletedIds.has(skillId)) return "auto_complete";
    const base = getSkillStatus(skillId, profile) as SkillTreeStatus;
    if (!hardGatePassed && base === "locked") {
      const level = parseInt(skillId.split(".")[0].replace("L", ""));
      if (level >= 5) return "hard_gate";
    }
    return base;
  }

  const levels: TreeLevel[] = useMemo(() => {
    if (!profile) return [];
    const source = showAllLevels
      ? skillTreeData.levels
      : skillTreeData.levels.filter((l) => l.id === currentLevelId);
    return source.map((level): TreeLevel => {
      const progress = levelProgress[level.id] || 0;
      const isCurrent = level.id === profile.current_level;
      const isHardGateLevel = level.id === 5;

      let banner: TreeLevel["banner"];
      if (isHardGateLevel && !hardGatePassed) {
        banner = { tone: "amber", icon: "🔒", text: "Hard Gate — multiplication mastery required before advancing" };
      } else if (isHardGateLevel && hardGatePassed && profile.placementCompleted) {
        banner = { tone: "green", icon: "✅", text: "Hard Gate passed" };
      }

      const preBarrier =
        level.id === 5 && !hardGatePassed && profile.placementCompleted
          ? { text: "Hard Gate — master multiplication to unlock advanced maths" }
          : undefined;

      return {
        id: level.id,
        badge: `L${level.id}`,
        title: level.title,
        description: level.description,
        progressPct: progress,
        isCurrent,
        defaultOpen: isCurrent,
        banner,
        preBarrier,
        tiers: level.tiers.map((tier) => ({
          id: tier.id,
          title: tier.title,
          skills: tier.atomic_skills.map((skill) => {
            const status = getExtendedStatus(skill.id);
            const isActive = status === "active";
            const canReplay = !!onReplaySkill && (status === "mastered" || status === "auto_complete");
            const canResume = !!onContinue && isActive;
            return {
              id: skill.id,
              title: skill.title,
              status,
              replay: canReplay,
              hardGateNote: status === "hard_gate" ? "Complete this challenge to unlock" : undefined,
              onClick: canResume ? onContinue : canReplay ? () => onReplaySkill!(skill.id) : undefined,
            };
          }),
        })),
      };
    });
  }, [profile, showAllLevels, currentLevelId, levelProgress, hardGatePassed, autoCompletedIds, entrySkillId, onReplaySkill, onContinue]);

  return (
    <SkillTreeShell
      accent="blue"
      title={t("nav.maths_skill_tree")}
      statline={statline}
      levels={levels}
      compact={compact}
      onBack={onBack}
      emptyState={
        !profile ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🌳</p>
            <p className="font-medium text-gray-600">Start a diagnostic session to unlock the skill tree</p>
          </div>
        ) : undefined
      }
      footerToggle={
        compact && profile
          ? {
              label: showAllLevels ? "Show only current level ▲" : "View full tree ▼",
              onClick: () => setShowAllLevels((v) => !v),
            }
          : undefined
      }
    />
  );
}
