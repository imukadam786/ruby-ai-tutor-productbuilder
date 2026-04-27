"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

// Reflects actual QuestionCard during a discovery/diagnostic session
function MockupDiscovery({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        {/* Template badge */}
        <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 bg-purple-50 flex-shrink-0">
          <span>📖</span>
          <span className="text-purple-700 text-sm font-medium">Word Problem</span>
          <span className="ml-auto text-xs text-[#B7182E] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-semibold">Discovery Activity</span>
        </div>
        <div className="flex-1 px-5 py-4 flex flex-col justify-between">
          <p className="text-gray-800 text-sm leading-relaxed font-medium">
            A farmer has 48 apples. She packs them equally into 6 bags. How many apples are in each bag?
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 bg-gray-50">
                Your answer…
              </div>
              <div
                className="px-4 py-2 rounded-xl bg-[#B7182E] text-white text-sm font-semibold flex-shrink-0"
                style={{ boxShadow: "0 0 0 3px rgba(183,24,46,0.15)" }}
              >
                Submit
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
              <span className="text-[10px] text-[#B7182E] font-medium">Ruby uses your answers to find the right level</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reflects actual DiagnosticReportView: red header + student stats + domain cards
function MockupReport({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="rounded-2xl overflow-hidden flex flex-col shadow-lg"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        {/* Red header — matches DiagnosticReportView */}
        <div className="bg-[#B7182E] px-4 py-3 flex-shrink-0">
          <p className="text-[#F9A8B4] text-[9px] font-bold uppercase tracking-widest">ruby</p>
          <h1 className="text-white text-sm font-bold leading-tight">Discovery Report</h1>
          <p className="text-[#FDA4AF] text-[10px] mt-0.5">Maths · Diagnostic Placement</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: "Student", value: "Sipho M.", sub: "Grade 8" },
              { label: "Working Level", value: "Level 2", sub: "1 level before expected" },
              { label: "Score", value: "7/10", sub: "Placement reliable" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[#FDA4AF] text-[8px] font-semibold uppercase tracking-wide">{item.label}</p>
                <p className="text-white font-bold text-xs">{item.value}</p>
                <p className="text-[#FDA4AF] text-[9px] leading-tight">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body — domain cards */}
        <div className="flex-1 bg-gray-50 px-3 py-2.5 space-y-2 overflow-hidden">
          {/* Where student starts — green section */}
          <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2">
            <p className="text-green-800 text-[10px] font-bold">📍 Where Sipho starts on Ruby</p>
            <p className="text-green-700 text-[9px] leading-relaxed mt-0.5">Ruby will start at Level 2, building foundational algebra skills before advancing.</p>
          </div>
          {/* Domain cards */}
          {[
            { domain: "Number Sense", score: 85, label: "Strong foundation" as const, color: "green" },
            { domain: "Algebra", score: 45, label: "Building skills" as const, color: "amber" },
          ].map((d) => (
            <div key={d.domain} className={`rounded-xl border px-3 py-2 bg-white ${d.color === "green" ? "border-green-200" : "border-amber-200"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-gray-800 text-[10px]">{d.domain}</span>
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${d.color === "green" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                  {d.label}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100">
                <div
                  className={`h-1.5 rounded-full ${d.color === "green" ? "bg-green-500" : "bg-amber-400"}`}
                  style={{ width: `${d.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Find your exact level in under 5 minutes",
    description: "Answer a few short questions and Ruby pinpoints exactly where you are, not too easy, not too hard.",
    Mockup: MockupDiscovery,
  },
  {
    subtitle: "See every gap and strength you have, in one clear report",
    description: "Ruby generates your personal Discovery Report, showing your level, what you're strong at, and where to start.",
    Mockup: MockupReport,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-[#B7182E]/10 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  </div>
);

export default function DiscoveryTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Discovery Activity"
      featureIcon={ICON}
      finalBtnLabel="Got it"
    />
  );
}
