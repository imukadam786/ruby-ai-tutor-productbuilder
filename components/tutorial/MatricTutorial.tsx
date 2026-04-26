"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

// Reflects actual SubjectSelect UI — matches prepui screenshot
function MockupPapers({ isMobile }: { isMobile: boolean }) {
  const subjects = [
    { name: "Mathematics", available: true, color: "#1e40af", emoji: "📐" },
    { name: "Physical Science", available: true, color: "#15803d", emoji: "⚗️" },
    { name: "History", available: true, color: "#92400e", emoji: "📜" },
    { name: "Afrikaans", available: true, color: "#7c3aed", emoji: "🗣️" },
    { name: "Life Sciences", available: false, color: "#6b7280", emoji: "🌿" },
    { name: "Accounting", available: false, color: "#6b7280", emoji: "📊" },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-[#F4F4F5] rounded-2xl overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="px-4 py-2.5 flex-shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Choose a subject</p>
        </div>
        <div className="flex-1 px-4 pb-3 overflow-hidden">
          <div className="grid grid-cols-3 gap-2">
            {subjects.map((s) => (
              <div
                key={s.name}
                className={`rounded-xl text-left bg-white border border-gray-200 overflow-hidden shadow-sm ${!s.available ? "opacity-50" : ""}`}
              >
                {/* Coloured thumbnail */}
                <div
                  className="w-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: s.color, aspectRatio: "1/0.55" }}
                >
                  {s.emoji}
                </div>
                <div className="px-2 py-1.5">
                  <p className="font-bold text-gray-800 text-[9px] leading-snug truncate">{s.name}</p>
                  {s.available ? (
                    <p className="text-[8px] text-[#BE1832] font-semibold">Papers available →</p>
                  ) : (
                    <p className="text-[8px] text-gray-400">Coming soon</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reflects actual session layout: question on left + Ruby panel on right (guided mode)
function MockupTutor({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        {/* Left: question area */}
        <div className="flex-1 flex flex-col border-r border-gray-100">
          <div className="px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-700">Mathematics · Paper 1 · Q3</p>
          </div>
          <div className="flex-1 px-3 py-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              Given f(x) = 2x² − 3x + 1, determine f′(x) using first principles.
            </p>
          </div>
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="border border-gray-200 rounded-xl px-2 py-1.5 text-[10px] text-gray-400 bg-gray-50">
              Write your working…
            </div>
          </div>
        </div>
        {/* Right: Ruby tutor panel — matches actual right panel */}
        <div className="w-[42%] flex flex-col bg-white">
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#B7182E] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">R</div>
            <span className="text-xs font-semibold text-gray-700">Ruby</span>
            <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">English</span>
          </div>
          <div className="flex-1 px-3 py-3">
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5 space-y-2">
              <p className="text-[10px] text-gray-700 leading-relaxed">
                Start with the definition: f′(x) = lim(h→0) [f(x+h) − f(x)] / h. Expand f(x+h) first.
              </p>
              <div className="flex items-center gap-1.5 pt-1 border-t border-rose-100">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">2/5 marks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reflects actual marks feedback badge styling from session
function MockupMarks({ isMobile }: { isMobile: boolean }) {
  const questions = [
    { label: "Q1 · Algebra", marks: "5/5", state: "full" },
    { label: "Q2 · Calculus", marks: "3/5", state: "partial" },
    { label: "Q3 · Geometry", marks: "—", state: "pending" },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">Marks Tracker</span>
          <span className="text-xs font-semibold text-[#B7182E]">8 / 15 so far</span>
        </div>
        <div className="flex-1 px-4 py-4 space-y-3">
          {questions.map((q) => (
            <div key={q.label} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                q.state === "full" ? "bg-green-100 text-green-700" :
                q.state === "partial" ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-400"
              }`}>
                {q.state === "full" ? "✓" : q.state === "partial" ? "~" : "?"}
              </div>
              <span className="text-xs font-medium text-gray-700 flex-1">{q.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                q.state === "full" ? "bg-green-100 text-green-700" :
                q.state === "partial" ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-400"
              }`}>
                {q.marks} {q.state === "full" ? "marks" : q.state === "partial" ? "marks" : ""}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1 pt-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E]" />
            <span className="text-[10px] text-[#B7182E] font-medium">Know where to focus your revision</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reflects PrepPapers 2026: prediction chips + "2026" heading
function MockupPrepPapers({ isMobile }: { isMobile: boolean }) {
  const topics = ["Trigonometry", "Calculus", "Probability", "Algebra", "Statistics", "Geometry"];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
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
    subtitle: "Build real exam confidence by practising on actual NSC papers",
    description: "Work through past papers across all major subjects — the same papers used in real NSC exams.",
    Mockup: MockupPapers,
  },
  {
    subtitle: "Understand every question, even the ones that stump you",
    description: "Submit your answer for any question and get personalised feedback in Practice or Guide mode — just like having a tutor in the room.",
    Mockup: MockupTutor,
  },
  {
    subtitle: "Walk into your exam already knowing which topics to focus on",
    description: "We've analysed 10 years of NSC data to predict what's most likely to appear in your exam.",
    Mockup: MockupPrepPapers,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-[#B7182E]/10 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  </div>
);

export default function MatricTutorial({ onComplete }: { onComplete: () => void }) {
  return (
    <FeatureTutorialShell
      onComplete={onComplete}
      slides={SLIDES}
      featureName="Matric Prep"
      featureIcon={ICON}
      finalBtnLabel="Open Papers"
    />
  );
}
