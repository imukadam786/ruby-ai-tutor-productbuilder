"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

function MockupSubjects({ isMobile }: { isMobile: boolean }) {
  const items = [
    { emoji: "🧭", label: "Discover", badge: "Find your level", color: "from-slate-600 to-slate-700" },
    { emoji: "🧮", label: "Maths",    badge: "12 mastered",    color: "from-blue-500 to-blue-600" },
    { emoji: "📖", label: "English",  badge: "Not started",    color: "from-purple-500 to-purple-600" },
    { emoji: "🎓", label: "Matrics",  badge: "Past Papers",    color: "from-rose-700 to-rose-800" },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-[#F4F4F5] rounded-2xl overflow-hidden shadow-sm flex flex-col gap-2 p-3"
        style={{ width: isMobile ? "100%" : 360, height: isMobile ? 240 : 280 }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            className={`bg-gradient-to-r ${item.color} rounded-xl px-4 py-2.5 flex items-center justify-between flex-shrink-0`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{item.emoji}</span>
              <span className="text-white font-bold text-sm">{item.label}</span>
            </div>
            <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupMatrics({ isMobile }: { isMobile: boolean }) {
  const opts = ["Matric Past Papers", "Prep Papers 2026", "Study Guides"];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
        style={{ width: isMobile ? "100%" : 360, height: isMobile ? 200 : 240 }}
      >
        <div className="bg-gradient-to-r from-rose-700 to-rose-800 px-4 py-3 flex items-center gap-2">
          <span className="text-lg">🎓</span>
          <span className="text-white font-bold">Matrics</span>
          <svg className="w-3 h-3 text-white ml-auto rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {opts.map((opt) => (
          <div key={opt} className="px-5 py-3 flex items-center justify-between border-b border-gray-50 last:border-0">
            <span className="font-medium text-gray-700 text-sm">{opt}</span>
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Everything in one place",
    description: "Subjects brings together Discovery, Maths, English, and Matric resources. Your progress badge is shown on each card so you can see where you are at a glance.",
    Mockup: MockupSubjects,
  },
  {
    subtitle: "Matric resources at your fingertips",
    description: "Tap Matrics to expand Past Papers, Prep Papers 2026, and Study Guides without leaving the screen.",
    Mockup: MockupMatrics,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-[#B7182E]/10 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  </div>
);

export default function SubjectsTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Subjects"
      featureIcon={ICON}
      finalBtnLabel="Got it"
    />
  );
}
