"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ActiveView } from "@/types";

type Step = {
  icon: string;
  title: string;
  desc: string;
  view: ActiveView | null;
  spotlightTarget?: string; // data-tutorial attribute value
};

const STEPS: Step[] = [
  {
    icon: "👋",
    title: "Welcome to Ruby!",
    desc: "Your personal AI tutor. Let's take a quick look at everything you can do.",
    view: null,
  },
  {
    icon: "📚",
    title: "Homework Help",
    desc: "Ask Ruby anything — homework, concepts, or exam prep. Get clear, step-by-step answers instantly in your language.",
    view: "chat",
  },
  {
    icon: "🎯",
    title: "Maths Engine",
    desc: "Adaptive maths questions tailored to your exact level. Every answer helps Ruby understand how to help you better.",
    view: "ruby",
  },
  {
    icon: "✏️",
    title: "Reading Engine",
    desc: "Build your reading comprehension step by step with questions matched to your skill level.",
    view: "reading",
  },
  {
    icon: "📊",
    title: "Track Your Growth",
    desc: "Every question you answer moves you forward. Watch your skills and scores level up in real time.",
    view: "progress",
  },
  {
    icon: "🚀",
    title: "You're all set!",
    desc: "Tap the menu icon to explore every section whenever you need it. Ruby is ready when you are.",
    view: "home",
    spotlightTarget: "hamburger",
  },
];

interface SpotlightRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  onComplete: () => void;
  onViewChange: (view: ActiveView) => void;
}

export default function TutorialOverlay({ onComplete, onViewChange }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isAnimating = useRef(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const totalSteps = STEPS.length;

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setCardVisible(true), 150);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  // On step change: switch view + compute spotlight
  useEffect(() => {
    if (current.view) onViewChange(current.view);

    setSpotlight(null);
    if (current.spotlightTarget) {
      // Wait for the view to render before measuring
      const timer = setTimeout(() => {
        const el = document.querySelector(`[data-tutorial="${current.spotlightTarget}"]`);
        if (el) {
          const r = el.getBoundingClientRect();
          setSpotlight({ x: r.left, y: r.top, w: r.width, h: r.height });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const advance = useCallback(() => {
    if (isAnimating.current) return;
    if (isLast) { onComplete(); return; }

    isAnimating.current = true;
    setCardVisible(false);
    setTimeout(() => {
      setStep((s) => s + 1);
      setCardVisible(true);
      isAnimating.current = false;
    }, 220);
  }, [isLast, onComplete]);

  // Touch swipe-up
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > 45) advance();
    touchStartY.current = null;
  };

  const PAD = 14;
  const hasSpotlight = !!spotlight;

  // Card should appear near the spotlight on the last step,
  // otherwise it's a bottom sheet
  const cardStyle: React.CSSProperties = hasSpotlight && spotlight
    ? {
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        top: spotlight.y + spotlight.h + PAD + 12,
        width: "min(88vw, 340px)",
      }
    : {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
      };

  return (
    <div
      className="fixed inset-0 z-[9999]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      {/* ── Dark overlay (with spotlight cutout if applicable) ── */}
      {hasSpotlight && spotlight ? (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <mask id="tmask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={spotlight.x - PAD} y={spotlight.y - PAD}
                width={spotlight.w + PAD * 2} height={spotlight.h + PAD * 2}
                rx="10" fill="black"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.82)" mask="url(#tmask)" />
          {/* Glowing border */}
          <rect
            x={spotlight.x - PAD} y={spotlight.y - PAD}
            width={spotlight.w + PAD * 2} height={spotlight.h + PAD * 2}
            rx="10" fill="none"
            stroke="#60a5fa" strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 0 6px #3b82f6)" }}
          />
        </svg>
      ) : (
        <div className="absolute inset-0 bg-black/78" style={{ zIndex: 0 }} />
      )}

      {/* ── Skip button ── */}
      <button
        onClick={onComplete}
        className="absolute top-16 right-4 z-10 text-white/60 text-sm hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 md:top-4"
      >
        Skip
      </button>

      {/* ── Card ── */}
      {!hasSpotlight ? (
        /* Bottom sheet card */
        <div
          className="absolute left-0 right-0 bottom-0 z-10 rounded-t-3xl bg-white shadow-2xl"
          style={{
            transform: cardVisible ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Swipe hint */}
          <div className="flex flex-col items-center gap-0.5 py-2">
            <div
              className="animate-bounce"
              style={{ animationDuration: "1.2s" }}
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Swipe up for next</span>
          </div>

          <div className="px-6 pb-8 pt-2">
            {/* Step dots */}
            <div className="flex gap-1.5 mb-5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 20 : 8,
                    height: 8,
                    backgroundColor: i === step ? "#3b82f6" : "#e5e7eb",
                  }}
                />
              ))}
            </div>

            {/* Icon + text */}
            <div
              style={{
                opacity: cardVisible ? 1 : 0,
                transform: cardVisible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.2s ease, transform 0.2s ease",
              }}
            >
              <div className="text-4xl mb-3">{current.icon}</div>
              <h2 className="text-xl font-bold text-[#1a2744] mb-2 leading-snug">{current.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{current.desc}</p>
            </div>

            {/* Action row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{step + 1} of {totalSteps}</span>
              <button
                onClick={advance}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors active:scale-95"
              >
                {isLast ? "Let's go!" : "Next"}
                {!isLast && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Spotlight card — compact, floating near the element */
        <div
          className="z-10 rounded-2xl bg-white shadow-2xl p-5"
          style={{
            ...cardStyle,
            width: "min(88vw, 340px)",
            opacity: cardVisible ? 1 : 0,
            transform: cardVisible
              ? `translateX(-50%) translateY(0)`
              : `translateX(-50%) translateY(10px)`,
            transition: "opacity 0.25s ease, transform 0.25s ease",
          }}
        >
          <div className="flex gap-1.5 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  backgroundColor: i === step ? "#3b82f6" : "#e5e7eb",
                }}
              />
            ))}
          </div>
          <div className="text-3xl mb-2">{current.icon}</div>
          <h2 className="text-lg font-bold text-[#1a2744] mb-1">{current.title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{current.desc}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{step + 1} of {totalSteps}</span>
            <button
              onClick={advance}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors active:scale-95"
            >
              {isLast ? "Let's go!" : "Next"}
              {!isLast && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
