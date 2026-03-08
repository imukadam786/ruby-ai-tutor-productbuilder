"use client";

import { useMemo } from "react";
import { getProgress } from "@/lib/storage";
import { getStudentProfile, getSkillById, getLevelById } from "@/lib/student-model";

export default function ProgressTracker() {
  const progress = useMemo(() => getProgress(), []);
  const profile = useMemo(() => getStudentProfile(), []);

  const mastery = profile?.skill_mastery ?? {};
  const masteredEntries = Object.entries(mastery).filter(([, m]) => m.status === "mastered");
  const inProgressEntries = Object.entries(mastery).filter(([, m]) => m.status === "in_progress");

  const accuracy =
    profile && profile.total_attempts > 0
      ? Math.round((profile.total_correct / profile.total_attempts) * 100)
      : null;

  const currentLevel = profile ? getLevelById(profile.current_level) : null;
  const currentSkill = profile ? getSkillById(profile.current_skill_id) : null;

  // Skills mastered in current level
  const levelMastered = currentLevel
    ? currentLevel.tiers.flatMap((t) => t.atomic_skills).filter((s) => mastery[s.id]?.status === "mastered").length
    : 0;
  const levelTotal = currentLevel
    ? currentLevel.tiers.flatMap((t) => t.atomic_skills).length
    : 1;

  const isEmpty = !profile && progress.sessionCount === 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <h2 className="text-gray-900 font-semibold text-lg">Progress</h2>
        <p className="text-gray-500 text-sm">Your skill tree journey</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* ── Overview stats ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Skills Mastered", value: masteredEntries.length, color: "text-blue-600",   bg: "bg-blue-50" },
              { label: "In Progress",     value: inProgressEntries.length, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Study Sessions",  value: progress.sessionCount,   color: "text-purple-600", bg: "bg-purple-50" },
              {
                label: "Accuracy",
                value: accuracy !== null ? `${accuracy}%` : "—",
                color: "text-green-600",
                bg: "bg-green-50",
              },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl px-4 py-4 flex flex-col gap-1`}>
                <span className={`text-2xl font-bold ${color}`}>{value}</span>
                <span className="text-xs text-gray-500 leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Current focus ──────────────────────────────────────────── */}
          {profile && currentLevel && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Current Focus</h3>

              {/* Level badge + name */}
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Level {profile.current_level}
                </span>
                <span className="text-gray-700 text-sm font-medium">{currentLevel.title}</span>
              </div>

              {/* Current skill */}
              {currentSkill && (
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">Active skill</p>
                  <p className="text-gray-800 text-sm font-medium">{currentSkill.title}</p>
                  {currentSkill.description && (
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{currentSkill.description}</p>
                  )}
                </div>
              )}

              {/* Level progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Level progress</span>
                  <span>{levelMastered} / {levelTotal} skills</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((levelMastered / levelTotal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Mastered skills ────────────────────────────────────────── */}
          {masteredEntries.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">
                Mastered Skills
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {masteredEntries.length}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {masteredEntries.map(([skillId]) => {
                  const skill = getSkillById(skillId);
                  return (
                    <span
                      key={skillId}
                      className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium"
                      title={skillId}
                    >
                      {skill?.title ?? skillId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── In Progress skills ─────────────────────────────────────── */}
          {inProgressEntries.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">
                In Progress
                <span className="ml-2 bg-amber-100 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {inProgressEntries.length}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {inProgressEntries.map(([skillId]) => {
                  const skill = getSkillById(skillId);
                  return (
                    <span
                      key={skillId}
                      className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full font-medium"
                    >
                      {skill?.title ?? skillId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Empty state ────────────────────────────────────────────── */}
          {isEmpty && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🌱</div>
              <p className="font-medium text-gray-600">Your learning journey starts here!</p>
              <p className="text-sm mt-1">
                Head to Maths to start your first skill and track your progress here.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
