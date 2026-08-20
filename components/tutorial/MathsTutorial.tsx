"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

// Reflects actual QuestionCard: template badge + question text + text answer input
function MockupDiscovery({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        {/* Template badge — matches actual QuestionCard */}
        <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 bg-orange-50 flex-shrink-0">
          <span>🔢</span>
          <span className="text-orange-700 text-sm font-medium">Symbolic</span>
          <span className="ml-auto text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">Grade 8 · Discovery</span>
        </div>
        {/* Question */}
        <div className="px-5 py-4 flex-1">
          <p className="text-gray-800 text-base leading-relaxed font-medium">
            Solve for x: &nbsp; 2x + 6 = 14
          </p>
        </div>
        {/* Answer input + submit — matches QuestionCard input row */}
        <div className="px-5 pb-4 flex items-center gap-2 flex-shrink-0">
          <div className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 bg-gray-50">
            Your answer…
          </div>
          <div
            className="px-4 py-2 rounded-xl bg-brand-alt text-white text-sm font-semibold"
            style={{ boxShadow: "0 0 0 3px rgba(183,24,46,0.15)" }}
          >
            Submit
          </div>
        </div>
      </div>
    </div>
  );
}

// Reflects actual FeedbackCard incorrect state — matches mfeedback screenshot
function MockupFeedback({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-[#FFF8EE] rounded-2xl border border-orange-200 overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        {/* Header — pencil icon + "Not quite" + "Execution Slip" + Play */}
        <div className="px-4 py-3 bg-[#FFF0D6] border-b border-orange-200 flex items-center gap-2 flex-shrink-0">
          <span className="text-lg">✏️</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-orange-900 leading-tight">Not quite</p>
            <p className="text-xs text-orange-600">Execution Slip</p>
          </div>
          <button className="flex items-center gap-1 text-xs text-orange-600 font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            Play
          </button>
        </div>

        {/* Feedback body */}
        <div className="px-4 py-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Feedback</p>
              <p className="text-sm text-gray-800 font-medium">Not quite, give it another try!</p>
            </div>
            {/* Yellow learning box */}
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 px-3 py-2.5">
              <p className="text-xs font-semibold text-yellow-800 mb-1">Let&apos;s learn from this</p>
              <p className="text-xs text-gray-700 leading-relaxed">
                Physically remove and cover the subtracted objects. Count only what remains uncovered.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <span className="text-[11px] text-gray-400">Click for next question</span>
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reflects actual SkillTreeView: level rows with L-badge, progress bar, skill pills
function MockupSkillTree({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-800">Maths Skill Tree</p>
        </div>
        <div className="flex-1 overflow-hidden px-4 py-3 space-y-3">
          {/* Level 1 row — mastered */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">L1</span>
                <span className="text-xs font-semibold text-gray-700">Number Sense</span>
              </div>
              <span className="text-xs font-bold text-green-600">100%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full w-full" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["✅ Integers", "✅ Fractions", "✅ Decimals"].map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg border text-xs font-medium bg-green-50 text-green-700 border-green-200">{s}</span>
              ))}
            </div>
          </div>
          {/* Level 2 row — in progress, with "Current" badge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">L2</span>
                <span className="text-xs font-semibold text-gray-700">Algebra Basics</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Current</span>
              </div>
              <span className="text-xs font-bold text-gray-600">40%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "40%" }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg border text-xs font-medium bg-green-50 text-green-700 border-green-200">✅ Expressions</span>
              <span className="px-2.5 py-1 rounded-lg border text-xs font-medium bg-orange-50 text-orange-700 border-orange-200 ring-2 ring-blue-500 ring-offset-1">⚡ Linear Eq.</span>
              <span className="px-2.5 py-1 rounded-lg border text-xs font-medium bg-gray-100 text-gray-400 border-gray-200">🔒 Quadratic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Skip what you already know and focus only on what will move you forward",
    description: "A short Discovery places you at your exact level so every question is a productive challenge.",
    Mockup: MockupDiscovery,
  },
  {
    subtitle: "Turn every mistake into a skill you actually understand",
    description: "Each question has instant personalised feedback. Ruby explains in your home language what went wrong and why, so you don't repeat it.",
    Mockup: MockupFeedback,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-brand-alt/10 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-brand-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
