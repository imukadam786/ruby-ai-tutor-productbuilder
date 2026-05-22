"use client";

// Cloned from components/reading/ReadingSkillTreeView.tsx for the prerequisite
// locking + per-skill status, but made interactive like the Life Skills tree:
// each skill is a tappable tile and `onPickSkill` opens the session. Renders the
// 5 Afrikaans FAL strands (Luister, Klanke, Woordeskat, Lees & Kyk,
// Taalstruktuur) for the learner's grade. Locked skills stay locked until their
// prerequisites are mastered.

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

const statusConfig = {
  locked:      { bg: "bg-gray-100",  text: "text-gray-400",   border: "border-gray-200",  icon: "🔒", label: "Locked" },
  available:   { bg: "bg-white",     text: "text-[#1a2744]",  border: "border-amber-200", icon: "▶",  label: "Ready" },
  in_progress: { bg: "bg-amber-50",  text: "text-amber-800",  border: "border-amber-300", icon: "⚡", label: "In progress" },
  mastered:    { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-300", icon: "✅", label: "Mastered" },
};

function strandCode(tierId: string): string {
  return tierId.split(".")[2] ?? "";
}

interface AfrikaansSkillTreeViewProps {
  onPickSkill: (skillId: string) => void;
  /** Drives per-skill status + prerequisite locking. */
  profile: AfrikaansStudentProfile | null;
}

export default function AfrikaansSkillTreeView({
  onPickSkill,
  profile,
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
    <div className="flex flex-col h-full bg-[#F4F4F5] relative overflow-y-auto">
      <EduBackground />
      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-6 pb-12 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2744]">
            Afrikaans · Graad {seed.level}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Pick a skill to start. Instructions are in English; you&apos;ll hear and
            answer in Afrikaans.
          </p>
          {seed.beyondContent && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              More grades coming soon. Here&apos;s Grade {HIGHEST_AVAILABLE_LEVEL} for now.
            </p>
          )}
          {/* Level progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Progress
              </span>
              <span className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-amber-700"}`}>
                {progress}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-amber-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Strands */}
        <div className="space-y-6">
          {level.tiers.map((tier) => (
            <div key={tier.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl" aria-hidden>
                  {STRAND_EMOJI[strandCode(tier.id)] ?? "⭐"}
                </span>
                <h2 className="text-lg font-bold text-[#1a2744]">{tier.title}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tier.atomic_skills.map((skill) => {
                  const status = getAfrikaansSkillStatus(skill.id, profile);
                  const config = statusConfig[status];
                  const isLocked = status === "locked";
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
                      aria-label={`${skill.title} — ${config.label}`}
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
                          {config.label}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
