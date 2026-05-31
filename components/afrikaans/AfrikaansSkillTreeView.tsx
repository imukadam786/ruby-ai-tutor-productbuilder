"use client";

// Cloned from components/reading/ReadingSkillTreeView.tsx for the prerequisite
// locking + per-skill status, but made interactive like the Life Skills tree:
// each skill is a tappable tile and `onPickSkill` opens the session. Renders the
// 5 Afrikaans FAL strands (Luister, Klanke, Woordeskat, Lees & Kyk,
// Taalstruktuur) for the learner's grade. Locked skills stay locked until their
// prerequisites are mastered. Strands are collapsible and a "Start here" card
// surfaces the next skill so learners don't have to hunt for where to begin.

import { useEffect, useMemo, useState } from "react";
import afrikaansSkillTreeData from "@/data/afrikaans-skill-tree.json";
import { HIGHEST_AVAILABLE_LEVEL, seedForGrade } from "@/lib/afrikaans-grade-map";
import {
  getAfrikaansSkillStatus,
  getAfrikaansLevelProgress,
} from "@/lib/afrikaans-student-model";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import EduBackground from "@/components/EduBackground";
import type { AfrikaansSkillTree, AfrikaansStudentProfile } from "@/types/afrikaans";

const tree = afrikaansSkillTreeData as unknown as AfrikaansSkillTree;

// Strand code (middle segment of the tier id, e.g. AF.G1.KLK → "KLK") → emoji.
const STRAND_EMOJI: Record<string, string> = {
  LUI: "👂",
  KLK: "🔤",
  WRD: "🖼️",
  LEE: "📖",
  TAA: "🧩",
};

// Palette mirrors components/life-skills/LifeSkillsSkillTreeView.tsx so the two
// trees read as one family.
const statusConfig = {
  locked:      { bg: "bg-gray-100",  text: "text-gray-400",   border: "border-gray-200",   icon: "🔒", label: "Locked" },
  available:   { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  icon: "🚀", label: "Ready" },
  in_progress: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "⚡", label: "In progress" },
  mastered:    { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  icon: "🏆", label: "Mastered" },
};

type SkillStatus = keyof typeof statusConfig;

function strandCode(tierId: string): string {
  return tierId.split(".")[2] ?? "";
}

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
  // Explicit user expand/collapse overrides keyed by tier id. When a tier is
  // absent here we fall back to a sensible default (open if it has any unlocked
  // skill, collapsed if everything in it is still locked).
  const [openOverride, setOpenOverride] = useState<Record<string, boolean>>({});

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

  // Per-tier status, mastered counts, and whether anything in the tier is unlocked.
  const tierMeta = useMemo(() => {
    if (!level) return [];
    return level.tiers.map((tier) => {
      const skills = tier.atomic_skills.map((s) => ({
        skill: s,
        status: getAfrikaansSkillStatus(s.id, profile) as SkillStatus,
      }));
      const hasUnlocked = skills.some((s) => s.status !== "locked");
      const mastered = skills.filter((s) => s.status === "mastered").length;
      return { tier, skills, hasUnlocked, mastered, total: skills.length };
    });
  }, [level, profile]);

  // Header stats — mirrors the "X/Y Tiers · X/Y Atomic skills" line in the
  // Life Skills tree header.
  const totalStrands = tierMeta.length;
  const masteredStrands = tierMeta.filter((t) => t.total > 0 && t.mastered === t.total).length;
  const totalSkills = tierMeta.reduce((n, t) => n + t.total, 0);
  const masteredSkills = tierMeta.reduce((n, t) => n + t.mastered, 0);

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
          More Afrikaans grades are coming soon. Content is ready for Grade 1.
        </p>
      </div>
    );
  }

  return (
    <div className="relative isolate flex flex-col h-full bg-gray-50">
      <div className="absolute inset-0 -z-10"><EduBackground /></div>

      {/* Amber header bar — mirrors the Life Skills tree header. */}
      <div className="hidden md:block bg-amber-50 border-b border-amber-200 px-6 py-4">
        <h2 className="font-semibold text-amber-700 text-lg">Afrikaans Skill Tree</h2>
        <p className="text-amber-500 text-sm">
          Graad {seed.level} · {masteredStrands}/{totalStrands} Strands · {masteredSkills}/{totalSkills} Skills · {progress}%
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Back */}
        {onBack && (
          <div className="max-w-2xl mx-auto mb-4">
            <button
              onClick={onBack}
              className="text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] flex items-center gap-1"
            >
              ← Subjects
            </button>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Instruction note + progress, styled like the Life Skills info cards. */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
            <p className="text-sm text-amber-700">
              Instructions are in English; you&apos;ll hear and answer in Afrikaans.
            </p>
            <div className="mt-3 h-1.5 bg-amber-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-amber-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {seed.beyondContent && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
              More grades coming soon. Here&apos;s Grade {HIGHEST_AVAILABLE_LEVEL} for now.
            </p>
          )}

          {/* Strands — collapsible. Locked strands start collapsed. */}
          <div className="space-y-3">
            {tierMeta.map(({ tier, skills, hasUnlocked, mastered, total }) => {
              const open = isOpen(tier.id, hasUnlocked);
              return (
                <div key={tier.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
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
                        const sub = isLocked ? "Unlocks after earlier skills" : config.label;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => !isLocked && onPickSkill(skill.id)}
                            disabled={isLocked}
                            title={
                              isLocked
                                ? "Master the earlier skill(s) first to unlock this one"
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
