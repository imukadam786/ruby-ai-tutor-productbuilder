"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMathsLiteracyLevels,
  getMathsLiteracyProfile,
  getMathsLiteracySkillStatus,
} from "@/lib/maths-literacy-student-model";
import type { MathsLiteracyStudentProfile } from "@/types/maths-literacy";
import SkillTreeShell, { type TreeLevel } from "@/components/shared/SkillTreeShell";

interface Props {
  profile?: MathsLiteracyStudentProfile | null;
  onReplaySkill?: (skillId: string) => void;
  onContinue?: () => void;
  onBack?: () => void;
  /** When true, only the level containing the current skill renders by
   *  default. A toggle reveals the full tree. */
  compact?: boolean;
}

export default function MathsLiteracySkillTreeView({
  profile: profileProp,
  onReplaySkill,
  onContinue,
  onBack,
  compact,
}: Props) {
  const allLevels = useMemo(() => getMathsLiteracyLevels(), []);
  const [showAllLevels, setShowAllLevels] = useState<boolean>(!compact);
  useEffect(() => { setShowAllLevels(!compact); }, [compact]);

  const [loadedProfile, setLoadedProfile] = useState<MathsLiteracyStudentProfile | null>(
    profileProp ?? null,
  );
  useEffect(() => {
    if (profileProp === undefined) setLoadedProfile(getMathsLiteracyProfile());
    else setLoadedProfile(profileProp);
  }, [profileProp]);
  const profile = loadedProfile;

  const currentSkillId = profile?.current_skill_id ?? "L1.T1.A1";
  const currentLevelId = useMemo(() => {
    const m = currentSkillId.match(/^L(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }, [currentSkillId]);

  // Header stat-line: mastered/total across Levels · Tiers · Atomic skills.
  const statline = useMemo(() => {
    let totalTiers = 0, totalSkills = 0, masteredTiers = 0, masteredSkills = 0, masteredLevels = 0;
    const isMastered = (id: string) => profile?.skill_mastery[id]?.status === "mastered";
    for (const lvl of allLevels) {
      totalTiers += lvl.tiers.length;
      let lvlSkills = 0, lvlMastered = 0;
      for (const tier of lvl.tiers) {
        totalSkills += tier.atomic_skills.length;
        const m = tier.atomic_skills.filter((s) => isMastered(s.id)).length;
        masteredSkills += m;
        lvlSkills += tier.atomic_skills.length;
        lvlMastered += m;
        if (tier.atomic_skills.length > 0 && m === tier.atomic_skills.length) masteredTiers++;
      }
      if (lvlSkills > 0 && lvlMastered === lvlSkills) masteredLevels++;
    }
    return `${masteredLevels}/${allLevels.length} Levels · ${masteredTiers}/${totalTiers} Tiers · ${masteredSkills}/${totalSkills} Atomic skills · ${totalSkills > 0 ? Math.round((masteredSkills / totalSkills) * 100) : 0}%`;
  }, [allLevels, profile]);

  const levels: TreeLevel[] = useMemo(() => {
    const source = showAllLevels ? allLevels : allLevels.filter((l) => l.id === currentLevelId);
    return source.map((level) => {
      let total = 0, mastered = 0;
      const tiers = level.tiers.map((tier) => ({
        id: tier.id,
        title: `${tier.id} · ${tier.title}`,
        skills: tier.atomic_skills.map((skill) => {
          total += 1;
          const base = getMathsLiteracySkillStatus(skill.id, profile);
          if (base === "mastered") mastered += 1;
          const isActive = skill.id === currentSkillId && base !== "locked";
          const status = isActive ? ("active" as const) : base;
          const m = profile?.skill_mastery[skill.id];

          const canResume = isActive && !!onContinue;
          const canReplay = base === "mastered" && !!onReplaySkill;

          return {
            id: skill.id,
            title: skill.title,
            status,
            replay: canReplay,
            // In-progress label shows cumulative distinct questions answered
            // toward mastery (coverage), not the old correct/3 streak. The
            // exact required count depends on the skill's pool size (known only
            // server-side), so we surface progress as "<n> answered".
            label:
              base === "in_progress" && m
                ? `${new Set(profile?.used_questions?.[skill.id] ?? []).size || m.attempt_count} answered`
                : undefined,
            onClick: canResume
              ? onContinue
              : canReplay
              ? () => onReplaySkill?.(skill.id)
              : undefined,
          };
        }),
      }));
      const isCurrent = level.id === currentLevelId;
      return {
        id: level.id,
        badge: `L${level.id}`,
        title: level.title,
        description: level.description,
        progressPct: total > 0 ? Math.round((mastered / total) * 100) : 0,
        isCurrent,
        defaultOpen: isCurrent,
        tiers,
      };
    });
  }, [allLevels, showAllLevels, currentLevelId, currentSkillId, profile, onContinue, onReplaySkill]);

  return (
    <SkillTreeShell
      accent="teal"
      title="Maths Literacy skill tree"
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
