"use client";

import { useEffect, useMemo, useState } from "react";
import treeData from "@/data/matric-physical-sciences-skill-tree.json";
import EduBackground from "@/components/EduBackground";
import { getMatricPhysSciMasteryMap } from "@/lib/matric-phys-sci-student-model";
import type { MatricPhysSciSkillTree } from "@/types/matric-phys-sci";

const tree = treeData as unknown as MatricPhysSciSkillTree;

const statusConfig = {
  locked:      { bg: "bg-gray-100",  text: "text-gray-400",   border: "border-gray-200",   icon: "🔒", label: "Locked" },
  available:   { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  icon: "🚀", label: "Ready" },
  in_progress: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "⚡", label: "In Progress" },
  mastered:    { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  icon: "🏆", label: "Mastered" },
};

interface Props {
  onPickSkill: (skillId: string) => void;
  masteryStatus?: Record<string, "mastered" | "in_progress" | "available">;
  onBack?: () => void;
  /** When true, only the first level (or the level with the most progress)
   *  renders by default. A toggle reveals the full tree. */
  compact?: boolean;
}

export default function MatricPhysSciSkillTreeView({
  onPickSkill,
  masteryStatus,
  onBack,
  compact,
}: Props) {
  const [showAllLevels, setShowAllLevels] = useState<boolean>(!compact);
  useEffect(() => { setShowAllLevels(!compact); }, [compact]);
  const [localMastery, setLocalMastery] = useState<Record<string, "mastered" | "in_progress" | "available">>({});
  useEffect(() => {
    if (!masteryStatus) setLocalMastery(getMatricPhysSciMasteryMap());
  }, [masteryStatus]);
  const mastery = masteryStatus ?? localMastery;

  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(() => new Set([tree.levels[0]?.id ?? 1]));
  const toggleLevel = (id: number) =>
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

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

  function statusFor(skillId: string): keyof typeof statusConfig {
    return (mastery[skillId] ?? "available") as keyof typeof statusConfig;
  }

  return (
    <div className={`relative isolate bg-gray-50 ${compact ? "" : "flex flex-col h-full"}`}>
      <div className="absolute inset-0 -z-10"><EduBackground /></div>
      <div className="hidden md:block bg-rose-50 border-b border-rose-200 px-6 py-4">
        <h2 className="font-semibold text-rose-700 text-lg">Physical Sciences Skill Tree</h2>
        <p className="text-rose-400 text-sm">
          {masteredLevels}/{totalLevels} Levels · {masteredTiers}/{totalTiers} Tiers · {masteredSkills}/{totalSkills} Atomic skills
        </p>
      </div>

      <div className={compact ? "p-6" : "flex-1 overflow-y-auto p-6"}>
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
          {(showAllLevels
            ? tree.levels
            : (() => {
                const inProg = tree.levels.find((l) =>
                  l.tiers.some((t) => t.atomic_skills.some((s) => mastery[s.id] === "in_progress"))
                );
                if (inProg) return [inProg];
                const partial = tree.levels.find((l) => (levelProgress[l.id] || 0) > 0 && (levelProgress[l.id] || 0) < 100);
                return [partial ?? tree.levels[0]];
              })()
          ).map((level) => {
            const progress = levelProgress[level.id] || 0;
            const isExpanded = expandedLevels.has(level.id);
            return (
              <div
                key={level.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleLevel(level.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`min-w-[2.25rem] h-8 px-1.5 rounded-lg flex items-center justify-center text-sm font-bold ${
                        progress === 100
                          ? "bg-green-500 text-white"
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
                      className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-rose-500"}`}
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
                                onClick={() => onPickSkill(skill.id)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium text-left ${config.bg} ${config.text} ${config.border} cursor-pointer hover:ring-2 hover:ring-rose-300 hover:shadow-sm transition-all`}
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
