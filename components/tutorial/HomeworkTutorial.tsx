"use client";

import { useState, useCallback, useEffect } from "react";

// ── Mockup components ─────────────────────────────────────────────────────────

function MockupAsk({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#B7182E] flex items-center justify-center text-white text-xs font-bold">R</div>
          <span className="text-sm font-semibold text-gray-800">Chat with Ruby</span>
        </div>

        <div className="flex-1 px-4 py-3 overflow-hidden">
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-[#B7182E] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">R</div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-600 max-w-[80%] leading-relaxed">
              I&apos;m here to help when something doesn&apos;t make sense. What are you stuck on?
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 flex-shrink-0">
          <div
            className="flex items-center gap-2 bg-gray-50 border-2 border-[#B7182E] rounded-2xl px-3 py-2"
            style={{ boxShadow: "0 0 0 3px rgba(183,24,46,0.15)" }}
          >
            <div className="w-7 h-7 rounded-lg bg-[#B7182E]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs text-gray-400 flex-1">Ask anything...</span>
            <div className="w-7 h-7 rounded-full bg-[#B7182E] flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5 px-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E] flex-shrink-0" />
            <span className="text-[10px] text-[#B7182E] font-medium">Type a question or tap + to upload homework</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupExplain({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#B7182E] flex items-center justify-center text-white text-xs font-bold">R</div>
          <span className="text-sm font-semibold text-gray-800">Chat with Ruby</span>
        </div>

        <div className="flex-1 px-4 py-3 space-y-3 overflow-hidden">
          <div className="flex justify-end">
            <div className="bg-[#B7182E] text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs max-w-[70%] leading-relaxed">
              What is photosynthesis?
            </div>
          </div>

          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-[#B7182E] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">R</div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 leading-relaxed">
                Photosynthesis is how plants make their own food using sunlight, water and CO₂...
              </div>
              <div
                className="flex items-center gap-2 mt-1.5 px-2 py-1 rounded-xl border-2 border-[#B7182E] bg-[#B7182E]/5 w-fit"
                style={{ boxShadow: "0 0 0 3px rgba(183,24,46,0.1)" }}
              >
                <button className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Play
                </button>
                <button className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  Hint
                </button>
              </div>
              <div className="flex items-center gap-1 mt-1 px-1">
                <div className="w-2 h-2 rounded-full bg-[#B7182E] flex-shrink-0" />
                <span className="text-[10px] text-[#B7182E] font-medium">Listen to Ruby or ask for a hint</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupMore({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100"
        style={{ width: isMobile ? "100%" : 420, height: isMobile ? 240 : 280 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#B7182E] flex items-center justify-center text-white text-xs font-bold">R</div>
          <span className="text-sm font-semibold text-gray-800 flex-1">Chat with Ruby</span>
          <div
            className="p-1.5 rounded-lg border-2 border-[#B7182E] bg-[#B7182E]/5"
            style={{ boxShadow: "0 0 0 3px rgba(183,24,46,0.1)" }}
          >
            <svg className="w-3.5 h-3.5 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
        </div>

        <div className="flex-1 px-4 py-3 overflow-hidden">
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-[#B7182E] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">R</div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-600 max-w-[80%] leading-relaxed">
              Great question! Let me explain that...
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs text-gray-400 flex-1">Ask anything...</span>
            <div
              className="w-7 h-7 rounded-full border-2 border-[#B7182E] bg-[#B7182E]/10 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "0 0 0 3px rgba(183,24,46,0.1)" }}
            >
              <svg className="w-3.5 h-3.5 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5 px-1">
            <div className="w-2 h-2 rounded-full bg-[#B7182E] flex-shrink-0" />
            <span className="text-[10px] text-[#B7182E] font-medium">Speak your question · Clear chat to start fresh</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slide data ────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    subtitle: "Ask Ruby Anything",
    description:
      "Type your homework question or tap + to upload a photo of your worksheet. Ruby will explain it step by step.",
    Mockup: MockupAsk,
  },
  {
    subtitle: "Get Clear Explanations",
    description:
      "Ruby breaks down every answer clearly. Press Play to hear it read aloud, or tap Hint if you need a nudge without the full answer.",
    Mockup: MockupExplain,
  },
  {
    subtitle: "More Ways to Learn",
    description:
      "Tap the mic to ask by voice. Use the clear button at the top right to reset the conversation and start a fresh topic.",
    Mockup: MockupMore,
  },
] as const;

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onComplete: () => void;
}

export default function HomeworkTutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [slideIn, setSlideIn] = useState(true);

  const isFirst = step === 0;
  const isLast = step === SLIDES.length - 1;
  const current = SLIDES[step];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const transition = useCallback((nextStep: number) => {
    if (animating) return;
    setAnimating(true);
    setSlideIn(false);
    setTimeout(() => {
      setStep(nextStep);
      setSlideIn(true);
      setAnimating(false);
    }, 200);
  }, [animating]);

  const advance = useCallback(() => {
    if (isLast) { onComplete(); return; }
    transition(step + 1);
  }, [animating, isLast, onComplete, step, transition]);

  const goBack = useCallback(() => {
    if (isFirst) return;
    transition(step - 1);
  }, [animating, isFirst, step, transition]);

  const { Mockup } = current;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 bg-white w-full md:w-auto md:min-w-[480px] md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: isMobile ? "92vh" : "85vh" }}
      >
        {/* ── Static section header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Homework icon */}
            <div className="w-8 h-8 rounded-xl bg-[#B7182E]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#B7182E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-base font-bold text-[#1a2744]">Homework</span>
          </div>
          <button
            onClick={onComplete}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            Skip
          </button>
        </div>

        {/* ── Step dots ── */}
        <div className="flex items-center gap-1.5 px-5 pt-4 flex-shrink-0">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                backgroundColor: i === step ? "#B7182E" : "#e5e7eb",
              }}
            />
          ))}
        </div>

        {/* ── Slide text (subtitle + description animate) ── */}
        <div
          className="px-5 pt-3 pb-1 flex-shrink-0 transition-all duration-200"
          style={{ opacity: slideIn ? 1 : 0, transform: slideIn ? "translateY(0)" : "translateY(8px)" }}
        >
          <h3 className="text-lg font-semibold text-[#1a2744] mb-1 leading-snug">{current.subtitle}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{current.description}</p>
        </div>

        {/* ── Mockup illustration ── */}
        <div
          className="flex-1 min-h-0 transition-all duration-200"
          style={{ opacity: slideIn ? 1 : 0, transform: slideIn ? "translateY(0)" : "translateY(12px)" }}
        >
          <Mockup isMobile={isMobile} />
        </div>

        {/* ── Bottom nav: Back · counter · Next ── */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-t border-gray-100">
          {/* Back button — hidden on first slide */}
          {!isFirst ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <span />
          )}

          <span className="text-xs text-gray-400">{step + 1} of {SLIDES.length}</span>

          <button
            onClick={advance}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#B7182E] text-white text-sm font-semibold hover:bg-[#9a1426] transition-colors active:scale-95"
          >
            {isLast ? "Start Chatting" : "Next"}
            {!isLast && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
