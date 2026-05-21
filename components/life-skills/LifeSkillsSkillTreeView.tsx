"use client";

import { useEffect, useMemo, useState } from "react";
import lifeSkillsTreeData from "@/data/life-skills-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/life-skills-grade-map";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import EduBackground from "@/components/EduBackground";
import type { LifeSkillsSkillTree } from "@/types/life-skills";

const TOPIC_EMOJI: Record<string, string> = {
  "LS.L1.BKH.T01": "👤", "LS.L1.BKH.T02": "🏫", "LS.L1.BKH.T03": "👨‍👩‍👧", "LS.L1.BKH.T04": "🚌",
  "LS.L1.BKH.T05": "🐾", "LS.L1.BKH.T06": "🍎", "LS.L1.BKH.T07": "🌦️", "LS.L1.BKH.T08": "🌿",
  "LS.L1.BKH.T09": "💧", "LS.L1.BKH.T10": "🛟", "LS.L1.BKH.T11": "🤝", "LS.L1.BKH.T12": "🎉",
  "LS.L2.BKH.T01": "🧠", "LS.L2.BKH.T02": "📚", "LS.L2.BKH.T03": "🌍", "LS.L2.BKH.T04": "🛣️",
  "LS.L2.BKH.T05": "🦁", "LS.L2.BKH.T06": "🥗", "LS.L2.BKH.T07": "☀️", "LS.L2.BKH.T08": "💛",
  "LS.L2.BKH.T09": "🪴", "LS.L2.BKH.T10": "🚒", "LS.L2.BKH.T11": "👪", "LS.L2.BKH.T12": "🎊",
  "LS.L3.BKH.T01": "🪞", "LS.L3.BKH.T02": "🏘️", "LS.L3.BKH.T03": "🗺️", "LS.L3.BKH.T04": "🚦",
  "LS.L3.BKH.T05": "🩺", "LS.L3.BKH.T06": "🍽️", "LS.L3.BKH.T07": "🌡️", "LS.L3.BKH.T08": "🤗",
  "LS.L3.BKH.T09": "🌳", "LS.L3.BKH.T10": "🚨", "LS.L3.BKH.T11": "🌟", "LS.L3.BKH.T12": "🎈",
};

const tree = lifeSkillsTreeData as unknown as LifeSkillsSkillTree;

interface LifeSkillsSkillTreeViewProps {
  onPickTopic: (skillId: string) => void;
  /** Map of skill_id → "mastered"/"in_progress" so the tile shows status.
   *  Optional — when omitted, all topics render as "available". */
  masteryStatus?: Record<string, "mastered" | "in_progress" | "available">;
}

export default function LifeSkillsSkillTreeView({
  onPickTopic,
  masteryStatus,
}: LifeSkillsSkillTreeViewProps) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F4F4F5]">
        <p className="text-gray-500 text-lg">Loading…</p>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F4F4F5] p-6 text-center">
        <p className="text-gray-600">No Life Skills content available for this grade yet.</p>
      </div>
    );
  }

  const tier = level.tiers[0]; // BK&H — only strand at launch
  const topics = tier?.atomic_skills ?? [];

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative overflow-y-auto">
      <EduBackground />
      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-6 pb-12 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2744]">
            Life Skills · Grade {seed.level}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Pick a topic to start. Ruby will read each question to you.
          </p>
          {seed.belowContent && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              Life Skills starts at Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s a peek at Grade 1.
            </p>
          )}
          {seed.beyondContent && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              More grades coming soon. Here are Grade {HIGHEST_AVAILABLE_LEVEL} topics for now.
            </p>
          )}
        </div>

        {/* Topic grid — 2 columns on mobile, 3 on tablet+ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {topics.map((skill) => {
            const status = masteryStatus?.[skill.id] ?? "available";
            const emoji = TOPIC_EMOJI[skill.id] ?? "🌟";
            const ringClass =
              status === "mastered"
                ? "ring-2 ring-green-400 bg-green-50"
                : status === "in_progress"
                ? "ring-2 ring-amber-400 bg-amber-50"
                : "bg-white";
            return (
              <button
                key={skill.id}
                onClick={() => onPickTopic(skill.id)}
                className={`${ringClass} rounded-3xl shadow-md p-5 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform border border-gray-100 hover:shadow-xl`}
                style={{ minHeight: "10rem" }}
                aria-label={skill.title}
              >
                <span style={{ fontSize: "3rem", lineHeight: 1 }} aria-hidden>
                  {emoji}
                </span>
                <span className="text-base sm:text-lg font-bold text-[#1a2744] text-center leading-tight">
                  {skill.title}
                </span>
                {status === "mastered" && (
                  <span className="text-xs font-semibold text-green-700">✓ Mastered</span>
                )}
                {status === "in_progress" && (
                  <span className="text-xs font-semibold text-amber-700">In progress</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
