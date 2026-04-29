"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

// Reflects actual ProgressTracker: 4 stat cards (2x2 grid) + streak card beneath
function MockupStats({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-900">Progress</p>
          <p className="text-xs text-gray-500">Your skill tree journey</p>
        </div>
        <div className="flex-1 px-4 py-3 space-y-2.5">
          {/* 4 stat cards — matches actual layout */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-2xl border border-gray-100 px-3 py-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Skills Mastered</p>
              <span className="text-xl font-bold text-blue-600">12</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 px-3 py-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">In Progress</p>
              <span className="text-xl font-bold text-amber-500">4</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 px-3 py-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Study Sessions</p>
              <span className="text-xl font-bold text-purple-600">24</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 px-3 py-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Accuracy</p>
              <span className="text-xl font-bold text-green-600">78%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reflects actual streak card: orange-50 bg, flame icon, current + best streak
function MockupStreak({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <p className="text-sm font-semibold text-gray-900">Progress</p>
        </div>
        <div className="flex-1 px-4 py-4 flex flex-col justify-center gap-3">
          {/* Streak card — matches actual orange-50 streak component */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-orange-600 font-medium">Current Streak</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-orange-600">5</span>
                  <span className="text-sm text-orange-500">days</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-orange-400">Best</p>
              <p className="text-lg font-bold text-orange-500">14 days</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Consistency beats cramming every time</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLIDES: readonly SlideData[] = [
  {
    subtitle: "Everything in one place",
    description: "Your skills mastered, sessions done, and accuracy, all tracked automatically as you learn.",
    Mockup: MockupStats,
  },
  {
    subtitle: "Keep your streak alive",
    description: "Every day you study adds to your streak. Consistency beats cramming every time.",
    Mockup: MockupStreak,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  </div>
);

export default function ProgressTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Progress"
      featureIcon={ICON}
      finalBtnLabel="See My Progress"
    />
  );
}
