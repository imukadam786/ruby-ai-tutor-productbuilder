"use client";

import { useMemo } from "react";
import { getProgress, getStreakData } from "@/lib/storage";
import { getStudentProfile, getSkillById, getLevelById } from "@/lib/student-model";
import { useT } from "@/lib/i18n";

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="#D97706" viewBox="0 0 24 24">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.99 5.99 0 0011 17v2H7v2h10v-2h-4v-2a5.99 5.99 0 003.61-4.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}
function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
    </svg>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getCurrentWeek(): { date: string; label: string; isToday: boolean }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: toDateStr(d), label, isToday: toDateStr(d) === toDateStr(today) };
  });
}

export default function ProgressTracker() {
  const progress = useMemo(() => getProgress(), []);
  const profile = useMemo(() => getStudentProfile(), []);
  const streak = useMemo(() => getStreakData(), []);

  const mastery = profile?.skill_mastery ?? {};
  const masteredEntries = Object.entries(mastery).filter(([, m]) => m.status === "mastered");
  const inProgressEntries = Object.entries(mastery).filter(([, m]) => m.status === "in_progress");

  const accuracy =
    profile && profile.total_attempts > 0
      ? Math.round((profile.total_correct / profile.total_attempts) * 100)
      : null;

  const currentLevel = profile ? getLevelById(profile.current_level) : null;
  const currentSkill = profile ? getSkillById(profile.current_skill_id) : null;

  const levelMastered = currentLevel
    ? currentLevel.tiers.flatMap((t) => t.atomic_skills).filter((s) => mastery[s.id]?.status === "mastered").length
    : 0;
  const levelTotal = currentLevel
    ? currentLevel.tiers.flatMap((t) => t.atomic_skills).length
    : 1;

  const weekDays = getCurrentWeek();
  const maxActivity = Math.max(...weekDays.map((d) => streak.dailyActivity[d.date] || 0), 1);

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

          {/* ── 4 Stat Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Skills Mastered */}
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Skills Mastered</span>
                <TrophyIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{masteredEntries.length}</span>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">In Progress</span>
                <ChartIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-amber-500">{inProgressEntries.length}</span>
            </div>

            {/* Study Sessions */}
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Study Sessions</span>
                <CalendarIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{progress.sessionCount}</span>
            </div>

            {/* Accuracy */}
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Accuracy</span>
                <TargetIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-green-600">{accuracy !== null ? `${accuracy}%` : "—"}</span>
            </div>
          </div>

          {/* ── Current Streak Card ────────────────────────────────────── */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FlameIcon className="w-5 h-5 text-orange-500" />
              </span>
              <div>
                <p className="text-xs text-orange-600 font-medium">Current Streak</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-bold text-orange-600">{streak.currentStreak}</span>
                  <span className="text-sm text-orange-500">day{streak.currentStreak !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-orange-400">Best</p>
              <p className="text-lg font-bold text-orange-500">{streak.bestStreak} days</p>
            </div>
          </div>

          {/* ── Current Focus ──────────────────────────────────────────── */}
          {profile && currentLevel && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Current Focus</h3>
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Level {profile.current_level}
                </span>
                <span className="text-gray-700 text-sm font-medium">{currentLevel.title}</span>
              </div>
              {currentSkill && (
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">Active skill</p>
                  <p className="text-gray-800 text-sm font-medium">{currentSkill.title}</p>
                  {currentSkill.description && (
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{currentSkill.description}</p>
                  )}
                </div>
              )}
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

          {/* ── Mastered Skills ────────────────────────────────────────── */}
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
                    <span key={skillId} className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">
                      {skill?.title ?? skillId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Weekly Study Activity ──────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Weekly Study Activity</h3>
            <div className="flex items-end justify-between gap-1.5 h-24">
              {weekDays.map(({ date, label, isToday }) => {
                const count = streak.dailyActivity[date] || 0;
                const heightPct = count > 0 ? Math.max(10, Math.round((count / maxActivity) * 100)) : 0;
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
                      {count > 0 ? (
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${isToday ? "bg-blue-500" : "bg-blue-200"}`}
                          style={{ height: `${heightPct}%` }}
                          title={`${count} action${count !== 1 ? "s" : ""}`}
                        />
                      ) : (
                        <div className="w-full rounded-t-lg bg-gray-100" style={{ height: "6px" }} />
                      )}
                    </div>
                    <span className={`text-xs font-medium ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── In Progress Skills ─────────────────────────────────────── */}
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
                    <span key={skillId} className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full font-medium">
                      {skill?.title ?? skillId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Empty State ────────────────────────────────────────────── */}
          {isEmpty && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🌱</div>
              <p className="font-medium text-gray-600">Your learning journey starts here!</p>
              <p className="text-sm mt-1">Head to Maths to start your first skill and track your progress here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
