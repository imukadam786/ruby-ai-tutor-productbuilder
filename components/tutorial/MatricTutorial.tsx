"use client";

import FeatureTutorialShell, { SlideData } from "./FeatureTutorialShell";

// Uses the actual subject selection screenshot for an authentic preview
function MockupPapers({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ width: isMobile ? "100%" : 420, maxHeight: isMobile ? 240 : 280 }}
      >
        <img
          src="/matric-subjects-preview.webp"
          alt="Choose a subject"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

// Mirrors the updated question player: top progress bar + marks pill, a
// "Question 1.2" heading, and the chunky 4-colour answer buttons with a
// correct-answer reveal (matches the real MCQ + feedback UI).
function MockupTutor({ isMobile }: { isMobile: boolean }) {
  // Same palette the real AnswerButton uses (lib/design/gemColors ANSWER_COLORS).
  const OPTIONS = [
    { letter: "A", text: "volt (V)", color: "#FF5D73" },
    { letter: "B", text: "ampere (A)", color: "#FFB323", correct: true },
    { letter: "C", text: "watt (W)", color: "#12C99B" },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        {/* Top bar: back + progress bar + marks pill */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-2/5 rounded-full" style={{ backgroundColor: "#FF5D73" }} />
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-brand-alt flex-shrink-0">
            2 marks
          </span>
        </div>

        {/* Question + chunky answer buttons */}
        <div className="flex-1 px-3 py-3 space-y-2.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-brand-alt/70">Question 1.2</p>
          <p className="text-xs font-semibold text-gray-800 leading-snug">
            The SI unit of electric <span className="font-extrabold">current</span> is the…
          </p>
          <div className="space-y-1.5">
            {OPTIONS.map((o) => (
              <div
                key={o.letter}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-white shadow-sm"
                style={{ backgroundColor: o.color }}
              >
                <span className="w-4 h-4 rounded-md bg-white/25 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                  {o.letter}
                </span>
                <span className="flex-1 text-[11px] font-bold">{o.text}</span>
                {o.correct && <span className="text-[11px] font-bold">✓</span>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            <span className="font-bold text-green-600">Correct.</span> The ampere measures current.
          </p>
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
          <span className="text-xs font-semibold text-brand-alt">8 / 15 so far</span>
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
            <div className="w-2 h-2 rounded-full bg-brand-alt" />
            <span className="text-[10px] text-brand-alt font-medium">Know where to focus your revision</span>
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
                  style={{ borderColor: "rgb(var(--brand-alt))", color: "rgb(var(--brand-alt))", backgroundColor: "#fff5f5" }}
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
    description: "Work through past papers across all major subjects, the same papers used in real NSC exams.",
    Mockup: MockupPapers,
  },
  {
    subtitle: "Understand every question, even the ones that stump you",
    description: "Submit your answer for any question and get personalised feedback in Practice or Guide mode, just like having a tutor in the room.",
    Mockup: MockupTutor,
  },
  {
    subtitle: "Walk into your exam already knowing which topics to focus on",
    description: "We've analysed 10 years of NSC data to predict what's most likely to appear in your exam.",
    Mockup: MockupPrepPapers,
  },
];

const ICON = (
  <div className="w-8 h-8 rounded-xl bg-brand-alt/10 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-brand-alt" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
