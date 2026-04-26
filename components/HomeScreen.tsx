"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { getProgress, getStreakData, StreakData } from "@/lib/storage";
import { hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { StudentProfile } from "@/types/ruby";
import { ReadingStudentProfile } from "@/types/reading";
import { ProgressData } from "@/types";
import { useT } from "@/lib/i18n";
import EduBackground from "@/components/EduBackground";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import SavedReportView from "@/components/SavedReportView";

interface HomeScreenProps {
  onNavigate: (view: ActiveView) => void;
}

function RubyAvatar({ size = "w-12 h-12" }: { size?: string }) {
  return (
    <div className={`${size} flex-shrink-0 rounded-full overflow-hidden bg-white`}>
      <img
        src="/icons/icon-192.png"
        alt="Ruby"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "flex";
        }}
      />
      <div
        className="w-full h-full bg-rose-600 rounded-full items-center justify-center text-white font-bold text-xl"
        style={{ display: "none" }}
      >
        R
      </div>
    </div>
  );
}

interface Stats {
  skillsMastered: number;
  inProgress: number;
  lessonsDone: number;
  studySessions: number;
}

function buildStats(profile: StudentProfile | null, progress: ProgressData): Stats {
  const mastery = profile?.skill_mastery ?? {};
  const values = Object.values(mastery);
  return {
    skillsMastered: values.filter((m) => m.status === "mastered" || m.status === "assumed").length,
    inProgress: values.filter((m) => m.status === "in_progress").length,
    lessonsDone: progress.lessonsCompleted,
    studySessions: progress.sessionCount || (profile?.session_count ?? 0),
  };
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { t } = useT();

  const statDefs = [
    {
      key: "skillsMastered" as const, label: t("home.skills_mastered"), color: "text-blue-600", iconBg: "bg-blue-100",
      icon: <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#D97706" }} fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.99 5.99 0 0011 17v2H7v2h10v-2h-4v-2a5.99 5.99 0 003.61-4.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" /></svg>,
    },
    {
      key: "inProgress" as const, label: t("home.in_progress"), color: "text-amber-500", iconBg: "bg-amber-100",
      icon: <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
    {
      key: "lessonsDone" as const, label: t("home.lessons_done"), color: "text-green-600", iconBg: "bg-green-100",
      icon: <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      key: "studySessions" as const, label: t("home.study_sessions"), color: "text-purple-600", iconBg: "bg-purple-100",
      icon: <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
  ];

  const quickActions = [
    {
      id: "continue",
      title: t("home.continue_learning"),
      subtitle: t("home.continue_desc"),
      view: "chat" as ActiveView,
      bg: "bg-rose-600",
      hover: "hover:bg-rose-700",
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      ),
    },
    {
      id: "challenge",
      title: t("home.daily_challenge"),
      subtitle: t("home.daily_desc"),
      view: "ruby" as ActiveView,
      bg: "bg-orange-500",
      hover: "hover:bg-orange-600",
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
        </svg>
      ),
    },
  ];

  const learningModes = [
    { id: "chat"    as ActiveView, title: t("home.homework_title"), subtitle: t("home.homework_mode_desc"), iconBg: "bg-purple-100", emoji: "📚" },
    { id: "ruby"    as ActiveView, title: t("home.maths_title"),    subtitle: t("home.maths_mode_desc"),    iconBg: "bg-green-100",  emoji: "🎯" },
    { id: "reading" as ActiveView, title: t("home.reading_title"),  subtitle: t("home.reading_mode_desc"),  iconBg: "bg-amber-100",  emoji: "✏️" },
    { id: "watch"   as ActiveView, title: t("home.watch_title"),    subtitle: t("home.watch_mode_desc"),    iconBg: "bg-blue-100",   emoji: "▶️" },
  ];

  const [firstName, setFirstName] = useState("there");
  const [stats, setStats] = useState<Stats>({
    skillsMastered: 0,
    inProgress: 0,
    lessonsDone: 0,
    studySessions: 0,
  });
  const [streak, setStreak] = useState<Pick<StreakData, "currentStreak" | "bestStreak">>({ currentStreak: 0, bestStreak: 0 });
  const [mathsDone, setMathsDone] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [viewReport, setViewReport] = useState<"maths" | "reading" | null>(null);

  useEffect(() => {
    const load = async () => {
      const [auth, profile, readingProfile, progress, streakData] = await Promise.all([
        fetchAuthorisedGrade(),
        hydrateStudentProfileFromSupabase(),
        hydrateReadingProfileFromSupabase(),
        getProgress(),
        getStreakData(),
      ]);
      if (auth?.name) setFirstName(auth.name.split(" ")[0]);
      setStats(buildStats(profile, progress));
      setStreak({ currentStreak: streakData.currentStreak, bestStreak: streakData.bestStreak });
      setMathsDone(profile?.placementCompleted ?? false);
      setReadingDone((readingProfile as ReadingStudentProfile | null)?.placementCompleted ?? false);
    };
    load();
  }, []);

  if (viewReport) {
    return (
      <div className="h-full overflow-hidden">
        <SavedReportView subject={viewReport} onBack={() => setViewReport(null)} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />
      <div className="relative max-w-4xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center sm:justify-start gap-4 mb-6">
          <RubyAvatar size="w-14 h-14" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hi {firstName} 👋</h1>
            <p className="text-gray-500 text-base mt-0.5">Ready to keep learning?</p>
          </div>
        </div>

        {/* ── Discovery CTAs ────────────────────────────────────────────── */}
        <section className="mb-6 space-y-3">
          {/* Maths Discovery */}
          {mathsDone ? (
            <button
              onClick={() => setViewReport("maths")}
              className="w-full bg-white border-2 border-rose-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧮</span>
                <div>
                  <p className="font-semibold text-gray-800">Maths Discovery Report</p>
                  <p className="text-sm text-gray-400 mt-0.5">View your placement results</p>
                </div>
              </div>
              <span className="text-rose-600 font-semibold text-sm">View →</span>
            </button>
          ) : (
            <div className="bg-white border-2 border-rose-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧮</span>
                <p className="font-semibold text-gray-800">Start Maths Discovery</p>
              </div>
              <button
                onClick={() => onNavigate("discover-maths")}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 active:scale-[0.97]"
              >
                Go! 👉
              </button>
            </div>
          )}

          {/* Reading Discovery */}
          {readingDone ? (
            <button
              onClick={() => setViewReport("reading")}
              className="w-full bg-white border-2 border-amber-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <p className="font-semibold text-gray-800">Reading Discovery Report</p>
                  <p className="text-sm text-gray-400 mt-0.5">View your placement results</p>
                </div>
              </div>
              <span className="text-amber-600 font-semibold text-sm">View →</span>
            </button>
          ) : (
            <div className="bg-white border-2 border-amber-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📖</span>
                <p className="font-semibold text-gray-800">Start Reading Discovery</p>
              </div>
              <button
                onClick={() => onNavigate("discover-reading")}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 active:scale-[0.97]"
              >
                Go! 👉
              </button>
            </div>
          )}
        </section>

        {/* ── Progress Stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {statDefs.map((s) => (
            <div key={s.key} className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{s.label}</span>
                {s.icon}
              </div>
              <span className={`text-2xl font-bold ${s.color}`}>{stats[s.key]}</span>
            </div>
          ))}
        </div>

        {/* ── Current Streak ────────────────────────────────────────────── */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm mb-8">
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

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigate(action.view)}
                className={`${action.bg} ${action.hover} rounded-2xl p-5 flex items-center gap-4 text-left transition-colors active:scale-[0.98]`}
              >
                <div className="flex-shrink-0">
                  {action.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-base">{action.title}</p>
                  <p className="text-white/75 text-sm mt-0.5">{action.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Learning Modes ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Learning Modes</h2>
          <div className="grid grid-cols-2 gap-3">
            {learningModes.map((mode) => (
              <button
                key={mode.id + mode.title}
                onClick={() => onNavigate(mode.id)}
                className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <span className="text-2xl">{mode.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-base">{mode.title}</p>
                  <p className="text-gray-400 text-sm mt-0.5 leading-relaxed">{mode.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
