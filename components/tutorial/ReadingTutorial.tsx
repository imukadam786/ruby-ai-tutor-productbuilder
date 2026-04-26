"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

function MockupPlacement({ isMobile }: { isMobile: boolean }) {
  const stages = ["Sounds", "Words", "Passages"];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">R</div>
          <span className="text-sm font-semibold text-gray-800">Reading Discovery</span>
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-3">Ruby finds your reading level</p>
            <div className="flex items-center gap-1 mb-4">
              {stages.map((stage, i) => (
                <div key={stage} className="flex items-center gap-1 flex-1">
                  <div className={`flex-1 py-2 rounded-xl text-center text-xs font-semibold border-2 ${
                    i === 0 ? "border-purple-500 bg-purple-50 text-purple-600" : "border-gray-200 text-gray-400"
                  }`}>
                    {stage}
                  </div>
                  {i < stages.length - 1 && (
                    <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-purple-50 rounded-xl px-3 py-2.5 border border-purple-100">
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-purple-700">Current: </span>
                Phonological Awareness — identifying sounds in spoken words
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] text-purple-600 font-medium">No reading or writing required to get started</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupPractice({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex-1 px-5 py-4 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-1.5">
              Do &apos;cake&apos; and &apos;lake&apos; rhyme?
            </p>
            <button className="flex items-center gap-1.5 text-xs text-blue-500 font-medium mb-4">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Hear the question
            </button>
            <div className="rounded-2xl bg-blue-50 flex items-center justify-center py-5 px-4">
              <span className="text-2xl font-bold text-blue-600 tracking-tight">
                cake <span className="text-blue-400 mx-1">•</span> lake
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="py-2.5 rounded-xl border-2 border-gray-200 text-center text-sm font-semibold text-gray-600">Yes</div>
            <div className="py-2.5 rounded-xl border-2 border-gray-200 text-center text-sm font-semibold text-gray-600">No</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupReadingTree({ isMobile }: { isMobile: boolean }) {
  const nodes = [
    "#9333ea","#9333ea","#9333ea",
    "#9333ea","#a855f7","#d1d5db",
    "#d1d5db","#d1d5db","#d1d5db",
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">Reading Journey</span>
          <span className="text-xs text-gray-400">34 Skills · 5 Levels</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-3">
            {nodes.map((color, i) => (
              <div key={i} className="flex items-center justify-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  {color === "#9333ea" ? "✓" : color === "#a855f7" ? "…" : ""}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-purple-600" /><span className="text-[10px] text-gray-500">Mastered</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-purple-400" /><span className="text-[10px] text-gray-500">In Progress</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-gray-300" /><span className="text-[10px] text-gray-500">Locked</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Build real reading skills from exactly where you are right now",
    description: "Ruby starts at the right skill level for you — whether that's sounds, words, or full passages.",
    Mockup: MockupPlacement,
  },
  {
    subtitle: "Practise reading in a way that feels natural and easy",
    description: "Questions use your voice, flash cards, and choices to build real reading skill — not just guessing.",
    Mockup: MockupPractice,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  </div>
);

export default function ReadingTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Reading"
      featureIcon={ICON}
      finalBtnLabel="Start Reading"
    />
  );
}
