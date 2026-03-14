"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { getProgress, getStreakData } from "@/lib/storage";
import { getStudentProfile } from "@/lib/student-model";
import { useT } from "@/lib/i18n";
import EduBackground from "@/components/EduBackground";

interface HomeScreenProps {
  onNavigate: (view: ActiveView) => void;
}

function RubyAvatar({ size = "w-12 h-12" }: { size?: string }) {
  return (
    <div className={`${size} flex-shrink-0`}>
      <img
        src="/ruby-avatar.png"
        alt="Ruby"
        className="w-full h-full object-contain"
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

function loadStats(): Stats {
  const progress = getProgress();
  const profile = getStudentProfile();
  const mastery = profile?.skill_mastery ?? {};
  const values = Object.values(mastery);
  return {
    skillsMastered: values.filter((m) => m.status === "mastered").length,
    inProgress: values.filter((m) => m.status === "in_progress").length,
    lessonsDone: progress.lessonsCompleted,
    studySessions: progress.sessionCount,
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
    {
      id: "chat" as ActiveView,
      title: t("home.homework_title"),
      subtitle: t("home.homework_mode_desc"),
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
        </svg>
      ),
    },
    {
      id: "ruby" as ActiveView,
      title: t("home.maths_title"),
      subtitle: t("home.maths_mode_desc"),
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: "reading" as ActiveView,
      title: t("home.reading_title"),
      subtitle: t("home.reading_mode_desc"),
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "watch" as ActiveView,
      title: t("home.watch_title"),
      subtitle: t("home.watch_mode_desc"),
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const [firstName, setFirstName] = useState("there");
  const [stats, setStats] = useState<Stats>({
    skillsMastered: 0,
    inProgress: 0,
    lessonsDone: 0,
    studySessions: 0,
  });
  const [streak, setStreak] = useState({ currentStreak: 0, bestStreak: 0 });

  useEffect(() => {
    // Load name
    try {
      const raw = localStorage.getItem("onboardingData");
      if (raw) {
        const parsed = JSON.parse(raw);
        const first = (parsed.name as string | undefined)?.trim().split(/\s+/)[0];
        if (first) setFirstName(first);
      }
    } catch { /* ignore */ }

    // Load stats
    setStats(loadStats());
    setStreak(getStreakData());
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />
      {/* Wider container: max-w-4xl ≈ 896px, generous side padding */}
      <div className="relative max-w-4xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

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

        {/* ── Current Streak ────────────────────────────────────────────── */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm mb-8">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🔥</span>
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
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
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
                <div className={`w-10 h-10 ${mode.iconBg} ${mode.iconColor} rounded-xl flex items-center justify-center`}>
                  {mode.icon}
                </div>
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
