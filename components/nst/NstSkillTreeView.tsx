"use client";

import { useEffect, useMemo, useState } from "react";
import nstTreeData from "@/data/nst-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/nst-grade-map";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import EduBackground from "@/components/EduBackground";
import type { NstSkillTree } from "@/types/nst";

// Per-topic emojis. Each one evocative of the topic content so the learner
// can scan the grid visually.
const TOPIC_EMOJI: Record<string, string> = {
  // Grade 4 — Life & Living
  "NST.L4.LL.T01": "🌱", "NST.L4.LL.T02": "🌳", "NST.L4.LL.T03": "💧",
  "NST.L4.LL.T04": "🏞️", "NST.L4.LL.T05": "🏠",
  // Grade 4 — Matter & Materials
  "NST.L4.MM.T01": "🧊", "NST.L4.MM.T02": "🪵", "NST.L4.MM.T03": "📰", "NST.L4.MM.T04": "🌉",
  // Grade 4 — Energy & Change
  "NST.L4.EC.T01": "⚡", "NST.L4.EC.T02": "🔋", "NST.L4.EC.T03": "🥁", "NST.L4.EC.T04": "🔊",
  // Grade 4 — Planet Earth & Beyond
  "NST.L4.PEB.T01": "🌍", "NST.L4.PEB.T02": "☀️", "NST.L4.PEB.T03": "🛰️",
  "NST.L4.PEB.T04": "🌙", "NST.L4.PEB.T05": "🚀",

  // Grade 5 — Life & Living
  "NST.L5.LL.T01": "🐾", "NST.L5.LL.T02": "🦴", "NST.L5.LL.T03": "🦀",
  "NST.L5.LL.T04": "🌾", "NST.L5.LL.T05": "🐛",
  // Grade 5 — Matter & Materials
  "NST.L5.MM.T01": "⚙️", "NST.L5.MM.T02": "🔩", "NST.L5.MM.T03": "🧱", "NST.L5.MM.T04": "🏺",
  // Grade 5 — Energy & Change
  "NST.L5.EC.T01": "🔥", "NST.L5.EC.T02": "💡", "NST.L5.EC.T03": "🎯", "NST.L5.EC.T04": "🚗",
  // Grade 5 — Planet Earth & Beyond
  "NST.L5.PEB.T01": "🌐", "NST.L5.PEB.T02": "🪨", "NST.L5.PEB.T03": "🏔️", "NST.L5.PEB.T04": "🦖",

  // Grade 6 — Life & Living
  "NST.L6.LL.T01": "🌿", "NST.L6.LL.T02": "🥗", "NST.L6.LL.T03": "🍎",
  "NST.L6.LL.T04": "🍞", "NST.L6.LL.T05": "🌳",
  // Grade 6 — Matter & Materials
  "NST.L6.MM.T01": "💨", "NST.L6.MM.T02": "🥣", "NST.L6.MM.T03": "🧂",
  "NST.L6.MM.T04": "🥤", "NST.L6.MM.T05": "🏞️", "NST.L6.MM.T06": "🚰",
  // Grade 6 — Energy & Change
  "NST.L6.EC.T01": "💡", "NST.L6.EC.T02": "🔌", "NST.L6.EC.T03": "🚦", "NST.L6.EC.T04": "🏭",
  // Grade 6 — Planet Earth & Beyond
  "NST.L6.PEB.T01": "🪐", "NST.L6.PEB.T02": "🔄", "NST.L6.PEB.T03": "🌗",
  "NST.L6.PEB.T04": "🔭", "NST.L6.PEB.T05": "🛸",
};

const tree = nstTreeData as unknown as NstSkillTree;

interface NstSkillTreeViewProps {
  onPickTopic: (skillId: string) => void;
  masteryStatus?: Record<string, "mastered" | "in_progress" | "available">;
  onBack?: () => void;
}

export default function NstSkillTreeView({
  onPickTopic,
  masteryStatus,
  onBack,
}: NstSkillTreeViewProps) {
  const [grade, setGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorisedGrade().then((data) => {
      setGrade(data?.grade ?? 4);
      setLoading(false);
    });
  }, []);

  const seed = useMemo(() => seedForGrade(grade ?? 4), [grade]);
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
        <p className="text-gray-600">No Natural Sciences &amp; Tech content available for this grade yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />
      <div className="relative flex-1 overflow-y-auto">
       <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-5 pb-12 w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] flex items-center gap-1"
          >
            ← Subjects
          </button>
        )}

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2744]">
            Natural Sciences &amp; Tech · Grade {seed.level}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Pick a topic to start. Ruby will read each question to you.
          </p>
          {seed.belowContent && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              Natural Sciences &amp; Tech starts at Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s a peek at Grade {LOWEST_AVAILABLE_LEVEL}.
            </p>
          )}
          {seed.beyondContent && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              More grades coming soon. Here are Grade {HIGHEST_AVAILABLE_LEVEL} topics for now.
            </p>
          )}
        </div>

        {/* One section per strand (CAPS terms): Life & Living → Matter & Materials
            → Energy & Change → Planet Earth & Beyond. */}
        {level.tiers.map((tier) => {
          const topics = tier.atomic_skills ?? [];
          return (
            <section key={tier.id} className="mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-[#1a2744] mb-3 px-1">
                {tier.title}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {topics.map((skill) => {
                  const status = masteryStatus?.[skill.id] ?? "available";
                  const emoji = TOPIC_EMOJI[skill.id] ?? "🔬";
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
                      <span className="text-sm sm:text-base font-bold text-[#1a2744] text-center leading-tight">
                        {skill.title}
                      </span>
                      {status === "mastered" && (
                        <span className="text-xs font-semibold text-green-700">🏆 Mastered</span>
                      )}
                      {status === "in_progress" && (
                        <span className="text-xs font-semibold text-amber-700">In progress</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
       </div>
      </div>
    </div>
  );
}
