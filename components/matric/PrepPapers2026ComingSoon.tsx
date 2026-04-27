"use client";

import EduBackground from "@/components/EduBackground";

export default function PrepPapers2026ComingSoon() {
  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative max-w-2xl mx-auto px-5 py-16 flex flex-col items-center text-center space-y-6">

        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Coming Soon
          </span>
        </div>

        <div className="text-6xl">🗓️</div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-gray-900">Prep Papers 2026</h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-md mx-auto">
            The 2026 prep papers are on their way. Check back very soon, they&apos;ll be available here with full AI-guided tutoring support.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm max-w-sm w-full space-y-2">
          <p className="text-sm font-semibold text-gray-700">In the meantime, try:</p>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-[#BE1832]">Past Papers</span>, work through real NSC exam papers from previous years with step-by-step AI coaching.
          </p>
        </div>

      </div>
    </div>
  );
}
