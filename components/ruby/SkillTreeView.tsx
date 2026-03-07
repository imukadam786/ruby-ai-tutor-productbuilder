"use client";

import { useMemo } from "react";
import skillTreeData from "@/data/skill-tree.json";
import { StudentProfile } from "@/types/ruby";
import { getSkillStatus, getLevelById } from "@/lib/student-model";
import { getLevelProgress } from "@/lib/mastery-engine";

interface SkillTreeViewProps {
  profile: StudentProfile | null;
}

const statusConfig = {
  locked: { bg: "bg-gray-100", text: "text-gray-400", border: "border-gray-200", icon: "🔒", label: "Locked" },
  available: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "📖", label: "Available" },
  in_progress: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "⚡", label: "In Progress" },
  mastered: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "✅", label: "Mastered" },
};

export default function SkillTreeView({ profile }: SkillTreeViewProps) {
  const levelProgress = useMemo(() => {
    if (!profile) return {};
    const result: Record<number, number> = {};
    for (const level of skillTreeData.levels) {
      const allSkillIds = level.tiers.flatMap((t) =>
        t.atomic_skills.map((s) => s.id)
      );
      result[level.id] = getLevelProgress(allSkillIds, profile.skill_mastery);
    }
    return result;
  }, [profile]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-gray-900 font-semibold text-lg">Skill Tree</h2>
        <p className="text-gray-500 text-sm">17 levels · 51 tiers · 72 atomic skills</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!profile ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🌳</p>
            <p className="font-medium text-gray-600">Start a diagnostic session to unlock the skill tree</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {skillTreeData.levels.map((level) => {
              const progress = levelProgress[level.id] || 0;
              const isCurrent = level.id === profile.current_level;

              return (
                <div
                  key={level.id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                    isCurrent ? "border-blue-300 shadow-md shadow-blue-500/10" : "border-gray-200"
                  }`}
                >
                  {/* Level header */}
                  <div className={`px-5 py-4 ${isCurrent ? "bg-blue-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          progress === 100
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-blue-500 text-white"
                            : progress > 0
                            ? "bg-orange-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}>
                          {level.id}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{level.title}</p>
                          <p className="text-gray-400 text-xs">{level.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-gray-600"}`}>
                          {progress}%
                        </p>
                        {isCurrent && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100 ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Skills grid (only show for current and nearby levels) */}
                  {(isCurrent || progress > 0) && (
                    <div className="px-5 pb-4">
                      {level.tiers.map((tier) => (
                        <div key={tier.id} className="mt-3">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                            {tier.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tier.atomic_skills.map((skill) => {
                              const status = profile
                                ? getSkillStatus(skill.id, profile)
                                : "locked";
                              const config = statusConfig[status];
                              const isCurrentSkill = profile?.current_skill_id === skill.id;

                              return (
                                <div
                                  key={skill.id}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${config.bg} ${config.text} ${config.border} ${
                                    isCurrentSkill ? "ring-2 ring-blue-400" : ""
                                  }`}
                                  title={`${skill.title} — ${config.label}`}
                                >
                                  <span className="mr-1">{config.icon}</span>
                                  {skill.title}
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
