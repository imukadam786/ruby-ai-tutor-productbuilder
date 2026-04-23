"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

function MockupMap({ isMobile }: { isMobile: boolean }) {
  const nodes = [
    { color: "#22c55e", label: "L1" }, { color: "#22c55e", label: "L1" }, { color: "#22c55e", label: "L1" }, { color: "#22c55e", label: "L1" },
    { color: "#22c55e", label: "L2" }, { color: "#22c55e", label: "L2" }, { color: "#f59e0b", label: "L2" }, { color: "#d1d5db", label: "L3" },
    { color: "#d1d5db", label: "L3" }, { color: "#d1d5db", label: "L3" }, { color: "#d1d5db", label: "L3" }, { color: "#d1d5db", label: "L4" },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">Skill Tree</span>
          <span className="text-xs text-gray-400">72 skills · 17 levels</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col justify-between">
          <div className="grid grid-cols-4 gap-2">
            {nodes.map((node, i) => (
              <div key={i} className="flex items-center justify-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm"
                  style={{ backgroundColor: node.color }}
                >
                  {node.color === "#22c55e" ? "✓" : node.color === "#f59e0b" ? "…" : node.label}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[10px] text-gray-500">Mastered</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-[10px] text-gray-500">Active</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-gray-300" /><span className="text-[10px] text-gray-500">Locked</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupUnlock({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">Skills Unlock in Order</span>
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">✓</span>
              </div>
              <span className="text-[10px] text-gray-500 font-medium text-center">Linear<br />Equations</span>
            </div>
            <div className="flex flex-col items-center gap-1 pb-5">
              <svg className="w-6 h-6 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[9px] text-[#B7182E] font-semibold">Unlocks</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-14 h-14 rounded-full border-4 border-amber-400 bg-amber-50 flex items-center justify-center shadow-md"
                style={{ boxShadow: "0 0 0 4px rgba(251,191,36,0.2)" }}
              >
                <span className="text-amber-500 text-xl font-bold">…</span>
              </div>
              <span className="text-[10px] text-gray-500 font-medium text-center">Quadratic<br />Equations</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Master one skill and the next opens automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Your personal learning map",
    description: "Every circle is a skill. Green means mastered, yellow means in progress, grey means locked — for now.",
    Mockup: MockupMap,
  },
  {
    subtitle: "Skills unlock in order",
    description: "Ruby builds on what you know. Master one skill and the next one opens up automatically.",
    Mockup: MockupUnlock,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
);

export default function SkillTreeTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Skill Tree"
      featureIcon={ICON}
      finalBtnLabel="View My Skills"
    />
  );
}
