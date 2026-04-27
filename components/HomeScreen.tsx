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

// ── Demo data shown when user has no real activity yet ────────────────────────
const DEMO_STATS = { skillsMastered: 16, inProgress: 3, lessonsDone: 40, studySessions: 40 };
const DEMO_STREAK = { currentStreak: 28, bestStreak: 31 };
const DEMO_DAILY = [8, 6, 7, 5, 9, 4, 2]; // Mon→Sun activity counts

function getRubyAvatar({ size = "w-12 h-12" }: { size?: string }) {
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

function RubyAvatar({ size = "w-12 h-12" }: { size?: string }) {
  return getRubyAvatar({ size });
}

interface DisplayStats {
  skillsMastered: number;
  inProgress: number;
  lessonsDone: number;
  studySessions: number;
}

function buildStats(profile: StudentProfile | null, progress: ProgressData): DisplayStats {
  const mastery = profile?.skill_mastery ?? {};
  const values = Object.values(mastery);
  return {
    skillsMastered: values.filter((m) => m.status === "mastered" || m.status === "assumed").length,
    inProgress: values.filter((m) => m.status === "in_progress").length,
    lessonsDone: progress.lessonsCompleted,
    studySessions: progress.sessionCount || (profile?.session_count ?? 0),
  };
}

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

function buildDemoActivity(weekDays: { date: string }[]): Record<string, number> {
  const out: Record<string, number> = {};
  weekDays.forEach(({ date }, i) => { if (DEMO_DAILY[i]) out[date] = DEMO_DAILY[i]; });
  return out;
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

  const learningModes = [
    { id: "chat"    as ActiveView, title: t("home.homework_title"), subtitle: t("home.homework_mode_desc"), iconBg: "bg-purple-100", emoji: "📚" },
    { id: "ruby"    as ActiveView, title: t("home.maths_title"),    subtitle: t("home.maths_mode_desc"),    iconBg: "bg-green-100",  emoji: "🎯" },
    { id: "reading" as ActiveView, title: t("home.reading_title"),  subtitle: t("home.reading_mode_desc"),  iconBg: "bg-amber-100",  emoji: "✏️" },
    { id: "watch"   as ActiveView, title: t("home.watch_title"),    subtitle: t("home.watch_mode_desc"),    iconBg: "bg-blue-100",   emoji: "▶️" },
  ];

  const [firstName, setFirstName] = useState("there");
  const [rawStats, setRawStats] = useState<DisplayStats>({ skillsMastered: 0, inProgress: 0, lessonsDone: 0, studySessions: 0 });
  const [rawStreak, setRawStreak] = useState<Pick<StreakData, "currentStreak" | "bestStreak">>({ currentStreak: 0, bestStreak: 0 });
  const [rawActivity, setRawActivity] = useState<Record<string, number>>({});
  const [hasRealData, setHasRealData] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [mathsDone, setMathsDone] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [viewReport, setViewReport] = useState<"maths" | "reading" | null>(null);

  const weekDays = getCurrentWeek();

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
      const s = buildStats(profile, progress);
      setRawStats(s);
      setRawStreak({ currentStreak: streakData.currentStreak, bestStreak: streakData.bestStreak });
      setRawActivity(streakData.dailyActivity ?? {});
      const hasActivity = !!(profile || progress.sessionCount > 0 || streakData.currentStreak > 0);
      setHasRealData(hasActivity);
      setMathsDone(profile?.placementCompleted ?? false);
      setReadingDone((readingProfile as ReadingStudentProfile | null)?.placementCompleted ?? false);

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (
        streakData.lastActiveDate &&
        streakData.lastActiveDate !== today &&
        streakData.lastActiveDate !== yesterday &&
        !sessionStorage.getItem("welcome_back_shown")
      ) {
        sessionStorage.setItem("welcome_back_shown", "1");
        setShowWelcomeBack(true);
      }
    };
    load();
  }, []);

  const stats = hasRealData ? rawStats : DEMO_STATS;
  const streak = hasRealData ? rawStreak : DEMO_STREAK;
  const activity = hasRealData ? rawActivity : buildDemoActivity(weekDays);
  const maxActivity = Math.max(...weekDays.map((d) => activity[d.date] || 0), 1);

  if (viewReport) {
    return (
      <div className="h-full overflow-hidden">
        <SavedReportView subject={viewReport} onBack={() => setViewReport(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

          {/* ── Welcome back banner ───────────────────────────────────────── */}
          {showWelcomeBack && (
            <div className="mb-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl px-5 py-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👋</span>
                <div>
                  <p className="font-bold text-white text-base">Welcome back, {firstName}!</p>
                  <p className="text-indigo-100 text-sm">Great to see you again, let&apos;s pick up where you left off.</p>
                </div>
              </div>
              <button
                onClick={() => setShowWelcomeBack(false)}
                className="text-white/70 hover:text-white ml-3 flex-shrink-0 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-center sm:justify-start gap-4 mb-6">
            <RubyAvatar size="w-14 h-14" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hi {firstName} 👋</h1>
              <p className="text-gray-500 text-base mt-0.5">Ready to keep learning?</p>
            </div>
          </div>

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

          {/* ── Streak + Weekly Graph ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Streak */}
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

            {/* Weekly graph */}
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-3">This Week</p>
              <div className="flex items-end justify-between gap-1 h-12">
                {weekDays.map(({ date, label, isToday }) => {
                  const count = activity[date] || 0;
                  const heightPct = count > 0 ? Math.max(12, Math.round((count / maxActivity) * 100)) : 0;
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: "36px" }}>
                        {count > 0 ? (
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 ${isToday ? "bg-blue-500" : "bg-blue-200"}`}
                            style={{ height: `${heightPct}%` }}
                          />
                        ) : (
                          <div className="w-full rounded-t-md bg-gray-100" style={{ height: "4px" }} />
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
          </div>

          {/* ── Discovery CTAs ────────────────────────────────────────────── */}
          <section className="mb-8 space-y-3">
            {mathsDone ? (
              <button
                onClick={() => setViewReport("maths")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧮</span>
                  <div>
                    <p className="font-semibold text-white">Maths Discovery</p>
                    <p className="text-sm text-blue-100 mt-0.5">View your placement results</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full">View →</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("discover-maths")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧮</span>
                  <div>
                    <p className="font-semibold text-white">Start Maths Discovery</p>
                    <p className="text-sm text-blue-100 mt-0.5">Find your Maths level</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full">Start →</span>
              </button>
            )}

            {readingDone ? (
              <button
                onClick={() => setViewReport("reading")}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="font-semibold text-white">Reading Discovery</p>
                    <p className="text-sm text-purple-100 mt-0.5">View your placement results</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full">View →</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("discover-reading")}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="font-semibold text-white">Start Reading Discovery</p>
                    <p className="text-sm text-purple-100 mt-0.5">Find your Reading level</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full">Start →</span>
              </button>
            )}
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
    </div>
  );
}
