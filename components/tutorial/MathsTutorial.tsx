"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

function MockupDiscovery({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#B7182E] flex items-center justify-center text-white text-xs font-bold">R</div>
            <span className="text-sm font-semibold text-gray-800">Maths Discovery</span>
          </div>
          <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full border border-rose-200">Grade 8</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-2">Solve for x:</p>
            <p className="text-base font-bold text-[#1a2744] mb-3">2x + 6 = 14</p>
            <div className="grid grid-cols-2 gap-2">
              {["x = 2", "x = 4", "x = 6", "x = 8"].map((opt, i) => (
                <div
                  key={opt}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-medium text-center transition-all ${
                    i === 1
                      ? "border-rose-500 bg-rose-50 text-rose-600"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Ruby finds your exact starting point</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupFeedback({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#B7182E] flex items-center justify-center text-white text-xs font-bold">R</div>
          <span className="text-sm font-semibold text-gray-800">Instant Feedback</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col gap-2.5 overflow-hidden">
          <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-base">🤔</span>
            <span className="text-xs font-semibold text-amber-700">Not quite — let&apos;s look at why</span>
          </div>
          <div
            className="flex gap-2 items-start p-2.5 rounded-xl border-2 border-[#B7182E] bg-rose-50/40"
            style={{ boxShadow: "0 0 0 3px rgba(183,24,46,0.1)" }}
          >
            <div className="w-5 h-5 rounded-full bg-[#B7182E] flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold mt-0.5">R</div>
            <p className="text-xs text-gray-600 leading-relaxed">
              You subtracted 6 instead of dividing. Try: subtract 6 first, then divide both sides by 2.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Explained in your home language</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupSkillTree({ isMobile }: { isMobile: boolean }) {
  const nodes = [
    "#22c55e","#22c55e","#22c55e","#22c55e",
    "#22c55e","#f59e0b","#f59e0b","#d1d5db",
    "#d1d5db","#d1d5db","#d1d5db","#d1d5db",
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">Your Skill Tree</span>
          <span className="text-xs text-gray-400">72 Skills · 17 Levels</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col justify-between">
          <div className="grid grid-cols-4 gap-2">
            {nodes.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  {color === "#22c55e" ? "✓" : color === "#f59e0b" ? "…" : ""}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[10px] text-gray-500">Mastered</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-[10px] text-gray-500">In Progress</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-gray-300" /><span className="text-[10px] text-gray-500">Locked</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Ruby finds exactly where you are",
    description: "We start with a short Discovery — Ruby places you at the right level, not too easy, not too hard.",
    Mockup: MockupDiscovery,
  },
  {
    subtitle: "Answer. Get feedback. Level up.",
    description: "Each question has instant personalised feedback. Ruby explains in your home language what went wrong and why, so you actually understand.",
    Mockup: MockupFeedback,
  },
  {
    subtitle: "Watch your skills grow",
    description: "Every skill you master unlocks the next. Your Skill Tree shows exactly where you are and where you're going.",
    Mockup: MockupSkillTree,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-[#B7182E]/10 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  </div>
);

export default function MathsTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Maths"
      featureIcon={ICON}
      finalBtnLabel="Start Maths"
    />
  );
}
