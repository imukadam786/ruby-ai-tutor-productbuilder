"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import lifeSkillsTreeData from "@/data/life-skills-skill-tree.json";
import {
  HIGHEST_AVAILABLE_LEVEL,
  LOWEST_AVAILABLE_LEVEL,
  seedForGrade,
} from "@/lib/life-skills-grade-map";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import EduBackground from "@/components/EduBackground";
import type { LifeSkillsSkillTree } from "@/types/life-skills";

const tree = lifeSkillsTreeData as unknown as LifeSkillsSkillTree;

const statusConfig = {
  locked:      { bg: "bg-gray-100",  text: "text-gray-400",   border: "border-gray-200",   icon: "🔒", label: "Locked" },
  available:   { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  icon: "🚀", label: "Ready" },
  in_progress: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "⚡", label: "In Progress" },
  mastered:    { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  icon: "🏆", label: "Mastered" },
};

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

  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(() => new Set([currentLevelId]));
  useEffect(() => {
    setExpandedLevels((prev) => {
      if (prev.has(currentLevelId)) return prev;
      const next = new Set(prev);
      next.add(currentLevelId);
      return next;
    });
  }, [currentLevelId]);

  const toggleLevel = (id: number) =>
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const mastery = masteryStatus ?? {};

  const { totalLevels, totalTiers, totalSkills, masteredLevels, masteredTiers, masteredSkills, levelProgress } = useMemo(() => {
    let totalTiers = 0, totalSkills = 0, masteredTiers = 0, masteredSkills = 0, masteredLevels = 0;
    const levelProgress: Record<number, number> = {};
    for (const level of tree.levels) {
      totalTiers += level.tiers.length;
      let levelSkillCount = 0;
      let levelMasteredCount = 0;
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
      totalLevels: tree.levels.length,
      totalTiers,
      totalSkills,
      masteredLevels,
      masteredTiers,
      masteredSkills,
      levelProgress,
    };
  }, [mastery]);

  const currentLevelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (loading) return;
    const id = window.requestAnimationFrame(() => {
      currentLevelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [loading, currentLevelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F4F4F5]">
        <p className="text-gray-500 text-lg">Loading…</p>
      </div>
    );
  }

  function statusFor(skillId: string): keyof typeof statusConfig {
    return (mastery[skillId] ?? "available") as keyof typeof statusConfig;
  }

  return (
    <div className="relative isolate flex flex-col h-full bg-gray-50">
      <div className="absolute inset-0 -z-10"><EduBackground /></div>
      <div className="hidden md:block bg-amber-50 border-b border-amber-200 px-6 py-4">
        <h2 className="font-semibold text-amber-700 text-lg">Life Skills Skill Tree</h2>
        <p className="text-amber-500 text-sm">
          {masteredLevels}/{totalLevels} Levels · {masteredTiers}/{totalTiers} Tiers · {masteredSkills}/{totalSkills} Atomic skills
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
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
          {seed.belowContent && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
              Life Skills starts at Grade {LOWEST_AVAILABLE_LEVEL}. Here&apos;s a peek at Grade 1.
            </div>
          )}
          {seed.beyondContent && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700">
              More grades coming soon. Here are Grade {HIGHEST_AVAILABLE_LEVEL} topics for now.
            </div>
          )}

          {(showAllLevels ? tree.levels : tree.levels.filter((l) => l.id === currentLevelId)).map((level) => {
            const progress = levelProgress[level.id] || 0;
            const isCurrent = level.id === currentLevelId;
            const isExpanded = expandedLevels.has(level.id);
            return (
              <div key={level.id} ref={isCurrent ? currentLevelRef : undefined}>
                <div
                  className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                    isCurrent ? "border-amber-300 shadow-md shadow-amber-500/10" : "border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleLevel(level.id)}
                    aria-expanded={isExpanded}
                    className={`w-full text-left px-5 py-4 ${isCurrent ? "bg-amber-50" : ""} hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`min-w-[2.25rem] h-8 px-1.5 rounded-lg flex items-center justify-center text-sm font-bold ${
                          progress === 100
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-amber-500 text-white"
                            : progress > 0
                            ? "bg-orange-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}>
                          L{level.id}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{level.title}</p>
                          {level.description && (
                            <p className="text-gray-400 text-xs">{level.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-gray-600"}`}>
                            {progress}%
                          </p>
                          {isCurrent && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <svg
                          aria-hidden
                          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-amber-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4">
                      {level.tiers.map((tier) => (
                        <div key={tier.id} className="mt-3">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                            {tier.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tier.atomic_skills.map((skill) => {
                              const status = statusFor(skill.id);
                              const config = statusConfig[status];
                              return (
                                <button
                                  key={skill.id}
                                  type="button"
                                  onClick={() => onPickTopic(skill.id)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium text-left ${config.bg} ${config.text} ${config.border} cursor-pointer hover:ring-2 hover:ring-amber-300 hover:shadow-sm transition-all`}
                                  title={`${skill.title} — ${config.label}`}
                                >
                                  <span className="mr-1">{config.icon}</span>
                                  {skill.title}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {compact && (
            <button
              type="button"
              onClick={() => setShowAllLevels((v) => !v)}
              className="w-full text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] py-2"
            >
              {showAllLevels ? "Show only current level ▲" : "View full tree ▼"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
