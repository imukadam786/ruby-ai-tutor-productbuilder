"use client";

import EduBackground from "@/components/EduBackground";

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: "Explore curated educational videos aligned with their subjects",
    desc: "Every video is hand-picked to match the curriculum students are already working through.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Discover engaging content that makes learning easier to grasp",
    desc: "Short, focused videos that break down tricky concepts in a way that actually sticks.",
  },
];

export default function WatchComingSoon() {
  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative max-w-3xl mx-auto px-5 py-12 sm:px-8 sm:py-16 space-y-14">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Coming Soon
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              Watch &amp; <span className="text-[#BE1832]">Learn</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
              Instead of searching through endless videos online, students will find focused content
              designed to support their learning journey and strengthen classroom understanding.
            </p>
          </div>
        </div>

        {/* ── Feature cards ─────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-gray-800 text-center">When Watch launches, students will be able to</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  {f.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{f.title}</p>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
