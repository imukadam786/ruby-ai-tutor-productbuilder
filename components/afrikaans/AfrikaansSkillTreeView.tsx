"use client";

// Renders the learner's Afrikaans FAL grade through the shared SkillTreeShell so
// it matches every other subject. Strands (Luister, Klanke, Woordeskat, Lees &
// Kyk, Taalstruktuur) become the level's tiers; locked skills stay locked until
// their prerequisites are mastered.

import { useEffect, useMemo, useState } from "react";
import afrikaansSkillTreeData from "@/data/afrikaans-skill-tree.json";
import { seedForGrade } from "@/lib/afrikaans-grade-map";
import {
  getAfrikaansSkillStatus,
  getAfrikaansLevelProgress,
} from "@/lib/afrikaans-student-model";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import type { AfrikaansSkillTree, AfrikaansStudentProfile } from "@/types/afrikaans";
import SkillTreeShell, { type TreeLevel, type SkillTreeStatus } from "@/components/shared/SkillTreeShell";

const tree = afrikaansSkillTreeData as unknown as AfrikaansSkillTree;

interface AfrikaansSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  /** Drives per-skill status + prerequisite locking. */
  profile: AfrikaansStudentProfile | null;
  /** Optional back action — shows a "← Subjects" button when provided. */
  onBack?: () => void;
}

export default function AfrikaansSkillTreeView({
  onPickSkill,
  profile,
  onBack,
}: AfrikaansSkillTreeViewProps) {
  const [grade, setGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorisedGrade().then((data) => {
      setGrade(data?.grade ?? 1);
      setLoading(false);
    });
  }, []);

  const seed = useMemo(() => seedForGrade(grade ?? 1), [grade]);
  const level = tree.levels.find((l) => l.id === seed.level);

  const progress = useMemo(() => {
    if (!level || !profile) return 0;
    const ids = level.tiers.flatMap((t) => t.atomic_skills.map((s) => s.id));
    return getAfrikaansLevelProgress(ids, profile.skill_mastery);
  }, [level, profile]);

  const { tiers, masteredStrands, totalStrands, masteredSkills, totalSkills } = useMemo(() => {
    if (!level) return { tiers: [] as TreeLevel["tiers"], masteredStrands: 0, totalStrands: 0, masteredSkills: 0, totalSkills: 0 };
    let masteredStrands = 0, masteredSkills = 0, totalSkills = 0;
    const tiers = level.tiers.map((tier) => {
      const skills = tier.atomic_skills.map((s) => {
        const status = getAfrikaansSkillStatus(s.id, profile) as SkillTreeStatus;
        return {
          id: s.id,
          title: s.title,
          status,
          onClick: status === "locked" ? undefined : () => onPickSkill(s.id),
        };
      });
      const mastered = skills.filter((s) => s.status === "mastered").length;
      masteredSkills += mastered;
      totalSkills += skills.length;
      if (skills.length > 0 && mastered === skills.length) masteredStrands += 1;
      return { id: tier.id, title: tier.title, skills };
    });
    return { tiers, masteredStrands, totalStrands: level.tiers.length, masteredSkills, totalSkills };
  }, [level, profile, onPickSkill]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F4F4F5]">
        <p className="text-gray-500 text-lg">Loading…</p>
      </div>
    );
  }

  if (!level || level.tiers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F4F4F5] p-6 text-center">
        <p className="text-gray-600">More Afrikaans grades are coming soon. Content is ready for Grade 1.</p>
      </div>
    );
  }

  const levels: TreeLevel[] = [
    {
      id: level.id,
      badge: `G${seed.level}`,
      title: `Graad ${seed.level}`,
      description: "Instructions are in English; you'll hear and answer in Afrikaans.",
      progressPct: progress,
      isCurrent: true,
      defaultOpen: true,
      tiers,
    },
  ];

  return (
    <SkillTreeShell
      accent="orange"
      title="Afrikaans Skill Tree"
      statline={`Graad ${seed.level} · ${masteredStrands}/${totalStrands} Strands · ${masteredSkills}/${totalSkills} Skills · ${progress}%`}
      levels={levels}
      onBack={onBack}
      notice={
        seed.beyondContent ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
            More grades coming soon. Here&apos;s Grade {seed.level} for now.
          </div>
        ) : undefined
      }
    />
  );
}
