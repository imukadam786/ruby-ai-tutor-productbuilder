"use client";

import { useEffect, useState } from "react";
import { getProgress, getStreakData, StreakData } from "@/lib/storage";
import { getSkillById, hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { StudentProfile } from "@/types/ruby";
import { ReadingStudentProfile } from "@/types/reading";
import { ProgressData } from "@/types";
import EduBackground from "@/components/EduBackground";
import SkillTreeView from "@/components/ruby/SkillTreeView";
import ReadingSkillTreeView from "@/components/reading/ReadingSkillTreeView";
import MathsJourneyRail from "@/components/ruby/MathsJourneyRail";
import ReadingJourneyRail from "@/components/reading/ReadingJourneyRail";

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
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getCurrentWeek(): { date: string; label: string; isToday: boolean }[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
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
  const [progress, setProgress] = useState<ProgressData>({
    totalMessages: 0, topicsStudied: [], lessonsCompleted: 0,
    lessonsStarted: 0, sessionCount: 0, lastSession: "", subjectBreakdown: {},
  });
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, bestStreak: 0, lastActiveDate: "", dailyActivity: {} });

  useEffect(() => {
    Promise.all([
      getProgress(),
      hydrateStudentProfileFromSupabase(),
      hydrateReadingProfileFromSupabase(),
      getStreakData(),
    ]).then(([p, prof, readProf, s]) => {
      setProgress(p);
      setProfile(prof);
      setReadingProfile(readProf);
      setStreak(s);
    });
  }, []);

  const mastery = profile?.skill_mastery ?? {};
  const masteredEntries = Object.entries(mastery).filter(([, m]) => m.status === "mastered" || m.status === "assumed");
  const inProgressEntries = Object.entries(mastery).filter(([, m]) => m.status === "in_progress");

  const realStats = {
    skillsMastered: masteredEntries.length,
    inProgress: inProgressEntries.length,
    lessonsDone: progress.lessonsCompleted,
    studySessions: progress.sessionCount,
  };
  const weekDays = getCurrentWeek();
  const activity = streak.dailyActivity ?? {};
  const maxActivity = Math.max(...weekDays.map((d) => activity[d.date] || 0), 1);

  const isEmpty = !profile && progress.sessionCount === 0;

  const [mathsTreeOpen, setMathsTreeOpen] = useState(false);
  const [readingTreeOpen, setReadingTreeOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />
      {/* Header */}
      <div className="relative hidden md:block bg-white border-b border-gray-100 px-6 py-4">
        <h2 className="text-gray-900 font-semibold text-xl">Progress</h2>
        <p className="text-gray-500 text-base">Your skill tree journey</p>
      </div>

      <div className="relative flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* ── 4 Stat Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Skills Mastered</span>
                <TrophyIcon className="w-5 h-5 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{realStats.skillsMastered}</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">In Progress</span>
                <ChartIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-amber-500">{realStats.inProgress}</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Lessons Done</span>
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-green-600">{realStats.lessonsDone}</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Study Sessions</span>
                <CalendarIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{realStats.studySessions}</span>
            </div>
          </div>

          {/* ── Streak ──────────────────────────────────────────────────── */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">🔥</span>
              <div>
                <p className="text-sm text-orange-600 font-medium">Current Streak</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-bold text-orange-600">{streak.currentStreak}</span>
                  <span className="text-base text-orange-500">day{streak.currentStreak !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-400">Best</p>
              <p className="text-xl font-bold text-orange-500">{streak.bestStreak} days</p>
            </div>
          </div>

          {/* ── Maths Journey Rail ─────────────────────────────────────── */}
          <MathsJourneyRail profile={profile} dailyActivity={activity} />

          {/* Collapsible full Maths skill list */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setMathsTreeOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left"
            >
              <span className="text-sm font-medium text-blue-600">
                🧮 See full Maths skill list
              </span>
              <span className="ml-3 text-blue-400">
                <ChevronDownIcon open={mathsTreeOpen} />
              </span>
            </button>
            {mathsTreeOpen && (
              <div className="border-t border-blue-100">
                <SkillTreeView profile={profile} />
              </div>
            )}
          </div>

          {/* ── Reading Journey Rail ────────────────────────────────────── */}
          <ReadingJourneyRail profile={readingProfile} dailyActivity={activity} />

          {/* Collapsible full Reading skill list */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setReadingTreeOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left"
            >
              <span className="text-sm font-medium text-purple-600">
                📖 See full Reading skill list
              </span>
              <span className="ml-3 text-purple-400">
                <ChevronDownIcon open={readingTreeOpen} />
              </span>
            </button>
            {readingTreeOpen && (
              <div className="border-t border-purple-100">
                <ReadingSkillTreeView profile={readingProfile} />
              </div>
            )}
          </div>

          {/* ── In Progress Skills ─────────────────────────────────────── */}
          {inProgressEntries.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-base mb-3">
                In Progress
                <span className="ml-2 bg-amber-100 text-amber-600 text-sm font-semibold px-2 py-0.5 rounded-full">
                  {inProgressEntries.length}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {inProgressEntries.map(([skillId]) => {
                  const skill = getSkillById(skillId);
                  return (
                    <span key={skillId} className="bg-amber-50 text-amber-700 text-sm px-3 py-1.5 rounded-full font-medium">
                      {skill?.title ?? skillId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Weekly Study Activity (bottom) ─────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-base mb-4">Weekly Study Activity</h3>
            <div className="flex items-end justify-between gap-1.5 h-24">
              {weekDays.map(({ date, label, isToday }) => {
                const count = activity[date] || 0;
                const heightPct = count > 0 ? Math.max(10, Math.round((count / maxActivity) * 100)) : 0;
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
                      {count > 0 ? (
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${isToday ? "bg-blue-500" : "bg-blue-200"}`}
                          style={{ height: `${heightPct}%` }}
                          title={`${count} session${count !== 1 ? "s" : ""}`}
                        />
                      ) : (
                        <div className="w-full rounded-t-lg bg-gray-100" style={{ height: "6px" }} />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Empty State ────────────────────────────────────────────── */}
          {isEmpty && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🌱</div>
              <p className="font-medium text-gray-600">Your learning journey starts here!</p>
              <p className="text-base mt-1">Head to Maths to start your first skill and track your progress here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
