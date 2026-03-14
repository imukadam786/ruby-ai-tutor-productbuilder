"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { getProgress, getStreakData } from "@/lib/storage";
import { getStudentProfile } from "@/lib/student-model";
import { useT } from "@/lib/i18n";

interface HomeScreenProps {
  onNavigate: (view: ActiveView) => void;
}

function RubyAvatar({ size = "w-12 h-12" }: { size?: string }) {
  return (
    <div className={`${size} rounded-full overflow-hidden flex-shrink-0`}>
      <img
        src="/ruby-avatar.png"
        alt="Ruby"
        className="w-full h-full object-fill"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "flex";
        }}
      />
      <div
        className="w-full h-full bg-rose-600 rounded-full items-center justify-center text-white font-bold text-lg"
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
      id: "lessons" as ActiveView,
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
      id: "chat" as ActiveView,
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
    <div className="h-full overflow-y-auto bg-[#FFF5F6] relative">
      {/* Education symbol background pattern */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.10 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="edu-bg" x="0" y="0" width="280" height="260" patternUnits="userSpaceOnUse">

            {/* ── Row 1 ── */}
            <text x="8"  y="28" fill="#C41930" fontSize="22" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-12,8,28)">2</text>
            <text x="52" y="16" fill="#C41930" fontSize="16" fontFamily="Nunito,sans-serif" transform="rotate(8,52,16)">+</text>
            <text x="98" y="36" fill="#C41930" fontSize="18" fontFamily="Nunito,sans-serif" fontStyle="italic" transform="rotate(-5,98,36)">x</text>
            <text x="148" y="22" fill="#C41930" fontSize="20" fontFamily="Nunito,sans-serif" fontWeight="700" transform="rotate(14,148,22)">3</text>
            {/* Pencil */}
            <g transform="translate(192,4) rotate(-28)">
              <rect x="0" y="0" width="6" height="18" rx="1.5" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <polygon points="0,18 3,24 6,18" fill="none" stroke="#C41930" strokeWidth="1.1" strokeLinejoin="round"/>
              <line x1="0" y1="5" x2="6" y2="5" stroke="#C41930" strokeWidth="1"/>
            </g>
            <text x="238" y="30" fill="#C41930" fontSize="19" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-8,238,30)">6</text>

            {/* ── Row 2 ── */}
            {/* Ruler */}
            <g transform="translate(4,52) rotate(12)">
              <rect x="0" y="0" width="30" height="8" rx="1.5" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <line x1="5"  y1="0" x2="5"  y2="3" stroke="#C41930" strokeWidth="1"/>
              <line x1="10" y1="0" x2="10" y2="5" stroke="#C41930" strokeWidth="1"/>
              <line x1="15" y1="0" x2="15" y2="3" stroke="#C41930" strokeWidth="1"/>
              <line x1="20" y1="0" x2="20" y2="5" stroke="#C41930" strokeWidth="1"/>
              <line x1="25" y1="0" x2="25" y2="3" stroke="#C41930" strokeWidth="1"/>
            </g>
            <text x="62"  y="74" fill="#C41930" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(20,62,74)">×</text>
            <text x="108" y="65" fill="#C41930" fontSize="17" fontFamily="Nunito,sans-serif" fontWeight="700" transform="rotate(-8,108,65)">A</text>
            <text x="152" y="80" fill="#C41930" fontSize="19" fontFamily="Nunito,sans-serif" transform="rotate(5,152,80)">√</text>
            <text x="200" y="62" fill="#C41930" fontSize="22" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-10,200,62)">7</text>
            {/* Lightbulb */}
            <g transform="translate(244,46) rotate(6)">
              <path d="M11,0 C6,0 2,4 2,9 C2,12 4,14 6,16 L6,19 L16,19 L16,16 C18,14 20,12 20,9 C20,4 16,0 11,0 Z" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <line x1="6"  y1="21" x2="16" y2="21" stroke="#C41930" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="7"  y1="23" x2="15" y2="23" stroke="#C41930" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="11" y1="0"  x2="11" y2="-3" stroke="#C41930" strokeWidth="1.2" strokeLinecap="round"/>
            </g>

            {/* ── Row 3 ── */}
            <text x="6"   y="116" fill="#C41930" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(-15,6,116)">=</text>
            {/* Open Book */}
            <g transform="translate(38,96) rotate(-5)">
              <path d="M22,3 C22,3 13,1 4,4 L4,20 C13,17 22,19 22,19 Z" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <path d="M22,3 C22,3 31,1 40,4 L40,20 C31,17 22,19 22,19 Z" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <line x1="22" y1="3" x2="22" y2="19" stroke="#C41930" strokeWidth="1.2"/>
            </g>
            <text x="105" y="106" fill="#C41930" fontSize="18" fontFamily="Nunito,sans-serif" transform="rotate(12,105,106)">π</text>
            <text x="155" y="126" fill="#C41930" fontSize="21" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-3,155,126)">5</text>
            <text x="205" y="110" fill="#C41930" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(18,205,110)">÷</text>
            {/* Brain */}
            <g transform="translate(236,94) rotate(-5)">
              <path d="M18,5 C18,5 22,2 26,5 C30,8 29,14 26,16 C26,16 28,20 24,21 C22,22 20,21 19,20" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <path d="M18,5 C18,5 14,2 10,5 C6,8 7,14 10,16 C10,16 8,20 12,21 C14,22 16,21 17,20" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <line x1="18" y1="5" x2="18" y2="20" stroke="#C41930" strokeWidth="0.9" strokeDasharray="2,2"/>
            </g>

            {/* ── Row 4 ── */}
            {/* Backpack */}
            <g transform="translate(4,142) rotate(5)">
              <rect x="2" y="6" width="18" height="18" rx="3" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <path d="M7,6 L7,3 C7,1 13,1 13,3 L13,6" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <line x1="2" y1="14" x2="20" y2="14" stroke="#C41930" strokeWidth="1"/>
              <rect x="8" y="11" width="6" height="5" rx="1" fill="none" stroke="#C41930" strokeWidth="1"/>
            </g>
            <text x="48"  y="158" fill="#C41930" fontSize="16" fontFamily="Nunito,sans-serif" fontStyle="italic" transform="rotate(-8,48,158)">y</text>
            <text x="92"  y="172" fill="#C41930" fontSize="15" fontFamily="Nunito,sans-serif" fontWeight="700" transform="rotate(10,92,172)">B</text>
            {/* Magnet */}
            <g transform="translate(128,142) rotate(10)">
              <path d="M4,0 L4,12 C4,18 18,18 18,12 L18,0" fill="none" stroke="#C41930" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="0"  y1="0" x2="8"  y2="0" stroke="#C41930" strokeWidth="2.2" strokeLinecap="round"/>
              <line x1="14" y1="0" x2="22" y2="0" stroke="#C41930" strokeWidth="2.2" strokeLinecap="round"/>
            </g>
            <text x="182" y="155" fill="#C41930" fontSize="16" fontFamily="Nunito,sans-serif" transform="rotate(-12,182,155)">∑</text>
            <text x="232" y="165" fill="#C41930" fontSize="20" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(5,232,165)">4</text>

            {/* ── Row 5 ── */}
            <text x="8"   y="198" fill="#C41930" fontSize="14" fontFamily="Nunito,sans-serif" transform="rotate(15,8,198)">α</text>
            {/* Protractor */}
            <g transform="translate(34,185) rotate(-8)">
              <path d="M0,16 A16,16 0 0,1 32,16" fill="none" stroke="#C41930" strokeWidth="1.3"/>
              <line x1="0"  y1="16" x2="32" y2="16" stroke="#C41930" strokeWidth="1"/>
              <line x1="16" y1="16" x2="16" y2="0"  stroke="#C41930" strokeWidth="0.9"/>
              <line x1="16" y1="16" x2="8"  y2="2"  stroke="#C41930" strokeWidth="0.8"/>
              <line x1="16" y1="16" x2="24" y2="2"  stroke="#C41930" strokeWidth="0.8"/>
              <line x1="16" y1="16" x2="4"  y2="9"  stroke="#C41930" strokeWidth="0.7"/>
              <line x1="16" y1="16" x2="28" y2="9"  stroke="#C41930" strokeWidth="0.7"/>
            </g>
            <text x="100" y="208" fill="#C41930" fontSize="20" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-5,100,208)">9</text>
            <text x="148" y="198" fill="#C41930" fontSize="16" fontFamily="Nunito,sans-serif" transform="rotate(8,148,198)">−</text>
            <text x="192" y="194" fill="#C41930" fontSize="14" fontFamily="Nunito,sans-serif" transform="rotate(-10,192,194)">∞</text>
            <text x="240" y="205" fill="#C41930" fontSize="18" fontFamily="Nunito,sans-serif" fontWeight="700" transform="rotate(7,240,205)">f</text>

            {/* ── Row 6 ── */}
            <text x="14"  y="246" fill="#C41930" fontSize="18" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-10,14,246)">8</text>
            <text x="58"  y="252" fill="#C41930" fontSize="14" fontFamily="Nunito,sans-serif" fontStyle="italic" transform="rotate(6,58,252)">Δ</text>
            <text x="100" y="242" fill="#C41930" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(-8,100,242)">%</text>
            <text x="148" y="255" fill="#C41930" fontSize="16" fontFamily="Nunito,sans-serif" fontStyle="italic" transform="rotate(12,148,255)">z</text>
            <text x="192" y="244" fill="#C41930" fontSize="13" fontFamily="Nunito,sans-serif" transform="rotate(-6,192,244)">²</text>
            <text x="235" y="252" fill="#C41930" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(9,235,252)">≠</text>

          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#edu-bg)" />
      </svg>
      {/* Wider container: max-w-4xl ≈ 896px, generous side padding */}
      <div className="relative max-w-4xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center sm:justify-start gap-4 mb-6">
          <RubyAvatar size="w-14 h-14" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hi {firstName} 👋</h1>
            <p className="text-gray-500 text-sm mt-0.5">Ready to keep learning?</p>
          </div>
        </div>

        {/* ── Progress Stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
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

        {/* ── Current Streak ────────────────────────────────────────────── */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm mb-8">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🔥</span>
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
