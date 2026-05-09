"use client";

import { useMemo } from "react";
import { StudentProfile, ErrorType } from "@/types/ruby";
import skillTreeData from "@/data/skill-tree.json";
import { getLevelProgress } from "@/lib/mastery-engine";

interface StudentDashboardProps {
  profile: StudentProfile | null;
}

const errorLabels: Record<ErrorType, { label: string; color: string; desc: string }> = {
  correct: { label: "Correct", color: "green", desc: "Unaided correct answers" },
  conceptual_gap: { label: "Conceptual Gap", color: "red", desc: "Misunderstanding of core concept" },
  strategy_gap: { label: "Strategy Gap", color: "orange", desc: "Wrong method or approach used" },
  representation_confusion: { label: "Representation", color: "purple", desc: "Confusion between different forms" },
  execution_slip: { label: "Execution Slip", color: "yellow", desc: "Minor arithmetic or procedural error" },
};

export default function StudentDashboard({ profile }: StudentDashboardProps) {
  const stats = useMemo(() => {
    if (!profile) return null;

    const masteredSkills = Object.values(profile.skill_mastery).filter(
      (m) => m.status === "mastered"
    ).length;
    const inProgressSkills = Object.values(profile.skill_mastery).filter(
      (m) => m.status === "in_progress"
    ).length;
    const totalSkills = skillTreeData.levels.reduce(
      (t, l) => t + l.tiers.reduce((tt, tier) => tt + tier.atomic_skills.length, 0),
      0
    );
    const accuracy =
      profile.total_attempts > 0
        ? Math.round((profile.total_correct / profile.total_attempts) * 100)
        : 0;

    const overallProgress = Math.round((masteredSkills / totalSkills) * 100);

    const levelProgresses = skillTreeData.levels.map((level) => {
      const allSkillIds = level.tiers.flatMap((t) => t.atomic_skills.map((s) => s.id));
      return {
        id: level.id,
        title: level.title,
        progress: getLevelProgress(allSkillIds, profile.skill_mastery),
      };
    });

    return {
      masteredSkills,
      inProgressSkills,
      totalSkills,
      accuracy,
      overallProgress,
      levelProgresses,
    };
  }, [profile]);

  if (!profile || !stats) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-gray-900 font-semibold text-lg">Student Dashboard</h2>
          <p className="text-gray-500 text-sm">Your personalised learning profile</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">👤</p>
            <p className="font-medium text-gray-600">Start a Ruby session to see your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  const totalErrors = Object.values(profile.error_history).reduce((t, n) => t + n, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-semibold text-lg">Student Dashboard</h2>
          <p className="text-gray-500 text-sm">{profile.name} · Year {profile.grade}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Overall progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.overallProgress}%</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Key stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Skills Mastered", value: stats.masteredSkills, icon: "🏆", color: "text-green-600" },
              { label: "In Progress", value: stats.inProgressSkills, icon: "⚡", color: "text-orange-600" },
              { label: "Accuracy", value: `${stats.accuracy}%`, icon: "🎯", color: "text-blue-600" },
              { label: "Sessions", value: profile.session_count, icon: "📅", color: "text-purple-600" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-1">{icon}</div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Overall progress bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between mb-2">
              <p className="font-semibold text-gray-800">Overall Skill Progress</p>
              <p className="text-sm text-gray-500">{stats.masteredSkills} / {stats.totalSkills} skills</p>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Error analysis */}
          {totalErrors > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Error Pattern Analysis</h3>
              <div className="space-y-3">
                {(Object.entries(profile.error_history) as [ErrorType, number][])
                  .filter(([type, count]) => type !== "correct" && count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const info = errorLabels[type as ErrorType] ?? errorLabels["execution_slip"];
                    const pct = Math.round((count / profile.total_attempts) * 100);
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-1">
                          <div>
                            <span className={`text-sm font-medium text-${info.color}-700`}>
                              {info.label}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">{info.desc}</span>
                          </div>
                          <span className="text-sm text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${info.color}-400 rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              {profile.error_history.execution_slip > profile.error_history.conceptual_gap && (
                <p className="text-xs text-gray-500 mt-3 bg-gray-50 rounded-lg p-2">
                  💡 Most errors are execution slips, you understand the concepts well! Focus on checking your calculations carefully.
                </p>
              )}
              {profile.error_history.conceptual_gap > profile.error_history.execution_slip && (
                <p className="text-xs text-gray-500 mt-3 bg-gray-50 rounded-lg p-2">
                  💡 Some conceptual gaps detected, Ruby will automatically revisit foundational skills to strengthen your understanding.
                </p>
              )}
            </div>
          )}

          {/* Level progress */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Level Progress</h3>
            <div className="space-y-3">
              {stats.levelProgresses.map((level) => (
                <div key={level.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">
                      <span className="text-gray-400 mr-1">L{level.id}</span>
                      {level.title}
                    </span>
                    <span className={`font-medium ${level.progress === 100 ? "text-green-600" : "text-gray-500"}`}>
                      {level.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        level.progress === 100 ? "bg-green-500" : "bg-blue-400"
                      }`}
                      style={{ width: `${level.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent attempts summary */}
          {profile.total_attempts > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Learning Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="text-gray-400">Total attempts: </span>
                  <span className="font-medium text-gray-800">{profile.total_attempts}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total correct: </span>
                  <span className="font-medium text-green-700">{profile.total_correct}</span>
                </div>
                <div>
                  <span className="text-gray-400">Current level: </span>
                  <span className="font-medium text-gray-800">Level {profile.current_level}</span>
                </div>
                <div>
                  <span className="text-gray-400">Last active: </span>
                  <span className="font-medium text-gray-800">
                    {new Date(profile.last_active).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
