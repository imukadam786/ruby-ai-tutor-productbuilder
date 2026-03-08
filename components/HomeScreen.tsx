"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { getProgress } from "@/lib/storage";
import { getStudentProfile } from "@/lib/student-model";

interface HomeScreenProps {
  onNavigate: (view: ActiveView) => void;
}

function RubyAvatar({ size = "w-12 h-12" }: { size?: string }) {
  return (
    <div className={`${size} rounded-full overflow-hidden flex-shrink-0`}>
      <img
        src="/ruby-avatar.png"
        alt="Ruby"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "flex";
        }}
      />
      <div
        className="w-full h-full bg-blue-600 rounded-full items-center justify-center text-white font-bold text-lg"
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

const statDefs = [
  {
    key: "skillsMastered" as const, label: "Skills Mastered", color: "text-blue-600", iconBg: "bg-blue-100",
    icon: <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.99 5.99 0 0011 17v2H7v2h10v-2h-4v-2a5.99 5.99 0 003.61-4.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" /></svg>,
  },
  {
    key: "inProgress" as const, label: "In Progress", color: "text-amber-500", iconBg: "bg-amber-100",
    icon: <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  },
  {
    key: "lessonsDone" as const, label: "Lessons Done", color: "text-green-600", iconBg: "bg-green-100",
    icon: <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    key: "studySessions" as const, label: "Study Sessions", color: "text-purple-600", iconBg: "bg-purple-100",
    icon: <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
];

const quickActions = [
  {
    id: "continue",
    title: "Continue Learning",
    subtitle: "Pick up where you left off",
    view: "chat" as ActiveView,
    bg: "bg-blue-600",
    hover: "hover:bg-blue-700",
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
  },
  {
    id: "challenge",
    title: "Daily Challenge",
    subtitle: "Answer a question, earn 5 rubies",
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
    id: "lessons" as ActiveView,
    title: "Homework",
    subtitle: "Get help with school assignments",
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
    title: "Maths",
    subtitle: "Practice math skills and solve problems",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19V5a1 1 0 011-1h14a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "chat" as ActiveView,
    title: "Reading",
    subtitle: "Improve reading and comprehension",
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
    title: "Watch",
    subtitle: "Learn through educational videos",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [firstName, setFirstName] = useState("there");
  const [stats, setStats] = useState<Stats>({
    skillsMastered: 0,
    inProgress: 0,
    lessonsDone: 0,
    studySessions: 0,
  });

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
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Wider container: max-w-4xl ≈ 896px, generous side padding */}
      <div className="max-w-4xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <RubyAvatar size="w-14 h-14" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hi {firstName} 👋</h1>
            <p className="text-gray-500 text-sm mt-0.5">Ready to keep learning?</p>
          </div>
        </div>

        {/* ── Progress Stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {statDefs.map((s) => (
            <div key={s.key} className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{s.label}</span>
                {s.icon}
              </div>
              <span className={`text-2xl font-bold ${s.color}`}>{stats[s.key]}</span>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
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
                  <p className="text-white font-semibold text-sm">{action.title}</p>
                  <p className="text-white/75 text-xs mt-0.5">{action.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Learning Modes ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Learning Modes</h2>
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
                  <p className="font-semibold text-gray-800 text-sm">{mode.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{mode.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
