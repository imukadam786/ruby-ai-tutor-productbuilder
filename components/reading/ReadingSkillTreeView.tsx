"use client";

import { useMemo } from "react";
import readingSkillTreeData from "@/data/reading-skill-tree.json";
import { ReadingStudentProfile } from "@/types/reading";
import { getReadingSkillStatus, getReadingLevelProgress } from "@/lib/reading-student-model";

interface ReadingSkillTreeViewProps {
  profile: ReadingStudentProfile | null;
}

const statusConfig = {
  locked:        { bg: "bg-gray-100",    text: "text-gray-400",    border: "border-gray-200",    icon: "🔒", label: "Locked" },
  available:     { bg: "bg-purple-50",   text: "text-purple-700",  border: "border-purple-200",  icon: "📖", label: "Available" },
  in_progress:   { bg: "bg-orange-50",   text: "text-orange-700",  border: "border-orange-200",  icon: "⚡", label: "In Progress" },
  mastered:      { bg: "bg-green-50",    text: "text-green-700",   border: "border-green-200",   icon: "✅", label: "Mastered" },
  auto_complete: { bg: "bg-green-50",    text: "text-green-600",   border: "border-green-200",   icon: "⚡", label: "Auto-completed" },
  entry_point:   { bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-300",    icon: "🎯", label: "Entry Point" },
};

type TreeData = {
  levels: Array<{
    id: number;
    title: string;
    description: string;
    tiers: Array<{
      id: string;
      title: string;
      atomic_skills: Array<{ id: string; title: string }>;
    }>;
  }>;
};

const treeData = readingSkillTreeData as unknown as TreeData;

export default function ReadingSkillTreeView({ profile }: ReadingSkillTreeViewProps) {
  const levelProgress = useMemo(() => {
    if (!profile) return {};
    const result: Record<number, number> = {};
    for (const level of treeData.levels) {
      const allSkillIds = level.tiers.flatMap((t) => t.atomic_skills.map((s) => s.id));
      result[level.id] = getReadingLevelProgress(allSkillIds, profile.skill_mastery);
    }
    return result;
  }, [profile]);

  const autoCompletedIds = useMemo(
    () => new Set(profile?.placement?.autoCompletedSkillIds ?? []),
    [profile]
  );
  const entrySkillId = profile?.placement?.entrySkillId ?? null;
  const hardGatePassed = profile?.placement?.hardGatePassed ?? true;

  function getExtendedStatus(skillId: string) {
    if (skillId === entrySkillId) return "entry_point";
    if (autoCompletedIds.has(skillId)) return "auto_complete";
    return getReadingSkillStatus(skillId, profile!);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="hidden md:block bg-purple-50 border-b border-purple-200 px-6 py-4">
        <h2 className="font-semibold text-purple-700 text-lg">Reading Skill Tree</h2>
        <p className="text-purple-400 text-sm">5 levels · 14 tiers · 34 atomic skills</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!profile ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🌳</p>
            <p className="font-medium text-gray-600">Start a reading session to unlock the skill tree</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Placement summary banner */}
            {profile.placementCompleted && profile.placement && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-blue-800 font-semibold text-sm">Placement complete</p>
                  <p className="text-blue-600 text-xs">
                    {autoCompletedIds.size} skill{autoCompletedIds.size !== 1 ? "s" : ""} auto-completed
                    {" · "}Entry: <span className="font-mono">{entrySkillId}</span>
                    {!hardGatePassed && " · "}
                    {!hardGatePassed && <span className="text-amber-600 font-medium">🔑 Hard Gate active</span>}
                  </p>
                </div>
              </div>
            )}

            {treeData.levels.map((level) => {
              const progress = levelProgress[level.id] || 0;
              const isCurrent = level.id === profile.current_level;
              // Level 3 hard gate indicator
              const isHardGateLevel = level.id === 3;

              return (
                <div
                  key={level.id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                    isCurrent ? "border-purple-300 shadow-md shadow-purple-500/10" : "border-gray-200"
                  }`}
                >
                  {/* Hard gate banner for Level 3 */}
                  {isHardGateLevel && !hardGatePassed && (
                    <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2">
                      <span className="text-amber-500">🔑</span>
                      <p className="text-amber-700 text-xs font-medium">
                        Hard Gate — encoding mastery required before advancing
                      </p>
                    </div>
                  )}
                  {isHardGateLevel && hardGatePassed && profile.placementCompleted && (
                    <div className="bg-green-50 border-b border-green-100 px-5 py-2 flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      <p className="text-green-700 text-xs font-medium">Hard Gate passed</p>
                    </div>
                  )}

                  {/* Level header */}
                  <div className={`px-5 py-4 ${isCurrent ? "bg-purple-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`min-w-[2.25rem] h-8 px-1.5 rounded-lg flex items-center justify-center text-sm font-bold ${
                          progress === 100
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-purple-500 text-white"
                            : progress > 0
                            ? "bg-orange-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}>
                          L{level.id}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{level.title}</p>
                          <p className="text-gray-400 text-xs">{level.description}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-gray-600"}`}>
                          {progress}%
                        </p>
                        {isCurrent && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-purple-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Skills grid */}
                  {(isCurrent || progress > 0) && (
                    <div className="px-5 pb-4">
                      {level.tiers.map((tier) => (
                        <div key={tier.id} className="mt-3">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                            {tier.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tier.atomic_skills.map((skill) => {
                              const extStatus = getExtendedStatus(skill.id);
                              const config = statusConfig[extStatus as keyof typeof statusConfig] ?? statusConfig.locked;
                              const isCurrentSkill = profile.current_skill_id === skill.id;
                              const isAutoComplete = autoCompletedIds.has(skill.id);
                              const isEntry = skill.id === entrySkillId;

                              return (
                                <div
                                  key={skill.id}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${config.bg} ${config.text} ${config.border} ${
                                    isCurrentSkill ? "ring-2 ring-purple-400" : ""
                                  } ${isEntry ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}
                                  title={`${skill.title} — ${config.label}`}
                                >
                                  <span className="mr-1">{config.icon}</span>
                                  {skill.title}
                                  {isAutoComplete && (
                                    <span className="ml-1.5 text-green-500 text-xs" title="Auto-completed via placement">✦</span>
                                  )}
                                  {isEntry && (
                                    <span className="ml-1.5 text-blue-500 text-xs" title="Placement entry point">★</span>
                                  )}
                                </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
