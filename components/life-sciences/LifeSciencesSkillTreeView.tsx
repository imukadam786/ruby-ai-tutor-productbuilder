"use client";

// Cloned from components/afrikaans/AfrikaansSkillTreeView.tsx for the
// prerequisite-locked tappable-tile pattern. The learner's grade comes from
// onboarding (no in-app grade picker — selecting a grade at sign-up locks the
// content shown here).
//
// Highlights the "current" topic (first not-yet-mastered in CAPS term order —
// the tree's existing order IS CAPS order) so learners don't have to hunt for
// where to begin.

import { useEffect, useMemo, useState } from "react";
import lifeSciencesSkillTreeData from "@/data/life-sciences-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/life-sciences-grade-map";
import {
  getLifeSciencesSkillStatus,
  getLifeSciencesLevelProgress,
} from "@/lib/life-sciences-student-model";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import EduBackground from "@/components/EduBackground";
import type {
  LifeSciencesSkillTree,
  LifeSciencesStudentProfile,
} from "@/types/life-sciences";

const tree = lifeSciencesSkillTreeData as unknown as LifeSciencesSkillTree;

// Strand code (third segment of the tier id, e.g. L10.S1 → "S1") → emoji.
const STRAND_EMOJI: Record<string, string> = {
  S1: "🧬",
  S2: "🫀",
  S3: "🌍",
  S4: "🦋",
};

const statusConfig = {
  locked:      { bg: "bg-gray-100",     text: "text-gray-400",      border: "border-gray-200",    icon: "🔒", label: "Locked" },
  available:   { bg: "bg-white",        text: "text-[#1a2744]",     border: "border-emerald-200", icon: "🚀", label: "Ready" },
  in_progress: { bg: "bg-amber-50",     text: "text-amber-800",     border: "border-amber-300",   icon: "⚡", label: "In progress" },
  mastered:    { bg: "bg-green-50",     text: "text-green-700",     border: "border-green-300",   icon: "🏆", label: "Mastered" },
  current:     { bg: "bg-emerald-50",   text: "text-emerald-800",   border: "border-emerald-400", icon: "🎯", label: "Start here" },
};

type SkillStatus = "locked" | "available" | "in_progress" | "mastered";
type DisplayStatus = SkillStatus | "current";

function strandCode(tierId: string): string {
  return tierId.split(".")[1] ?? "";
}

interface LifeSciencesSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  profile: LifeSciencesStudentProfile | null;
  onBack?: () => void;
  /** Embed inside another page (e.g. Progress): drop the full-page chrome. */
  compact?: boolean;
}

export default function LifeSciencesSkillTreeView({
  onPickSkill,
  profile,
  onBack,
  compact,
}: LifeSciencesSkillTreeViewProps) {
  const [grade, setGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [openOverride, setOpenOverride] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAuthorisedGrade().then((data) => {
      setGrade(data?.grade ?? LOWEST_AVAILABLE_LEVEL);
      setLoading(false);
    });
  }, []);

  const seed = useMemo(() => seedForGrade(grade ?? LOWEST_AVAILABLE_LEVEL), [grade]);
  const level = tree.levels.find((l) => l.id === seed.level);

  const progress = useMemo(() => {
    if (!level || !profile) return 0;
    const ids = level.tiers.flatMap((t) => t.atomic_skills.map((s) => s.id));
    return getLifeSciencesLevelProgress(ids, profile.skill_mastery);
  }, [level, profile]);

  // "Current" = first skill in CAPS-term order (= tree order) that is not yet
  // mastered AND is available (prereqs met). This is the topic to highlight as
  // "Start here". Returns null when everything is mastered.
  const currentSkillId = useMemo<string | null>(() => {
    if (!level) return null;
    for (const tier of level.tiers) {
      for (const skill of tier.atomic_skills) {
        const status = getLifeSciencesSkillStatus(skill.id, profile);
        if (status === "available" || status === "in_progress") {
          return skill.id;
        }
      }
    }
    return null;
  }, [level, profile]);

  const tierMeta = useMemo(() => {
    if (!level) return [];
    return level.tiers.map((tier) => {
      const skills = tier.atomic_skills.map((s) => {
        const baseStatus = getLifeSciencesSkillStatus(s.id, profile) as SkillStatus;
        const status: DisplayStatus =
          s.id === currentSkillId && baseStatus === "available" ? "current" : baseStatus;
        return { skill: s, status };
      });
      const hasUnlocked = skills.some((s) => s.status !== "locked");
      const mastered = skills.filter((s) => s.status === "mastered").length;
      return { tier, skills, hasUnlocked, mastered, total: skills.length };
    });
  }, [level, profile, currentSkillId]);

  const isOpen = (tierId: string, hasUnlocked: boolean) =>
    openOverride[tierId] ?? hasUnlocked;
  const toggle = (tierId: string, hasUnlocked: boolean) =>
    setOpenOverride((prev) => ({ ...prev, [tierId]: !(prev[tierId] ?? hasUnlocked) }));

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
        <p className="text-gray-600">
          More Life Sciences grades are coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "relative" : "flex flex-col h-full bg-[#F4F4F5] relative"}>
      {!compact && <EduBackground />}
      <div className={compact ? "relative" : "relative flex-1 overflow-y-auto"}>
        <div className={`max-w-3xl mx-auto w-full ${compact ? "px-1 pt-1 pb-4" : "px-5 sm:px-8 pt-5 pb-12"}`}>
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] flex items-center gap-1"
            >
              ← Subjects
            </button>
          )}

          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2744]">
              Life Sciences · Grade {seed.level}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Pass mark 60% · No timer · 20 questions per topic
            </p>
            {seed.belowContent && (
              <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                Life Sciences starts in Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s the Grade {LOWEST_AVAILABLE_LEVEL} content to get a head start.
              </p>
            )}
            {seed.beyondContent && (
              <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                You&apos;re past the Grade {HIGHEST_AVAILABLE_LEVEL} content. Here&apos;s the Grade {HIGHEST_AVAILABLE_LEVEL} matric prep.
              </p>
            )}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Progress
                </span>
                <span className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-emerald-700"}`}>
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-emerald-500"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {tierMeta.map(({ tier, skills, hasUnlocked, mastered, total }) => {
              const open = isOpen(tier.id, hasUnlocked);
              return (
                <div key={tier.id} className="rounded-2xl border border-gray-200 bg-white/70 overflow-hidden">
                  <button
                    onClick={() => toggle(tier.id, hasUnlocked)}
                    aria-expanded={open}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0" aria-hidden>
                      {STRAND_EMOJI[strandCode(tier.id)] ?? "⭐"}
                    </span>
                    <h2 className="flex-1 min-w-0 text-base sm:text-lg font-bold text-[#1a2744] leading-tight">
                      {tier.title}
                    </h2>
                    {!hasUnlocked && (
                      <span className="flex-shrink-0 text-xs font-medium text-gray-400 flex items-center gap-1">
                        <span aria-hidden>🔒</span> Locked
                      </span>
                    )}
                    <span className="flex-shrink-0 text-xs text-gray-400">
                      {mastered}/{total}
                    </span>
                    <svg
                      className={`flex-shrink-0 w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {open && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 pb-4">
                      {skills.map(({ skill, status }) => {
                        const config = statusConfig[status];
                        const isLocked = status === "locked";
                        const sub = isLocked ? "Unlocks after earlier topics" : config.label;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => !isLocked && onPickSkill(skill.id)}
                            disabled={isLocked}
                            title={
                              isLocked
                                ? "Master the earlier topic(s) first to unlock this one"
                                : `${skill.title} — ${config.label}`
                            }
                            aria-label={`${skill.title} — ${sub}`}
                            className={`${config.bg} ${config.border} border-2 rounded-2xl px-4 py-4 flex items-start gap-3 text-left transition-all ${
                              isLocked
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:shadow-md active:scale-[0.99] cursor-pointer"
                            }`}
                          >
                            <span className="text-xl flex-shrink-0" aria-hidden>
                              {config.icon}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className={`block text-base font-semibold leading-tight ${config.text}`}>
                                {skill.title}
                              </span>
                              <span className="block text-xs text-gray-500 mt-0.5">
                                {sub}
                              </span>
                              {skill.caps_term && (
                                <span className="block text-[10px] uppercase tracking-wide text-gray-400 mt-1">
                                  {skill.caps_term}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
