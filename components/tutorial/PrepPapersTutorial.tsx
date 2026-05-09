"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

function MockupPredict({ isMobile }: { isMobile: boolean }) {
  const topics = ["Trigonometry", "Calculus", "Probability", "Algebra", "Statistics", "Geometry"];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">Prep Papers 2026</span>
          <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full border border-amber-200">Predicted</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col justify-between">
          <div className="flex flex-col items-center gap-2">
            <div
              className="text-4xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, #B7182E 0%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              2026
            </div>
            <p className="text-[10px] text-gray-400 text-center font-medium">Based on 10 years of NSC exam data</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                  style={{ borderColor: "#B7182E", color: "#B7182E", backgroundColor: "#fff5f5" }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-amber-600 font-medium">Practise the topics most likely to appear</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Look into the future",
    description: "We've analysed data to predict what questions will appear in Matric exams for 2026.",
    Mockup: MockupPredict,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  </div>
);

export default function PrepPapersTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Prep Papers 2026"
      featureIcon={ICON}
      finalBtnLabel="Explore 2026 Prep"
    />
  );
}
