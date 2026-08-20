"use client";

import { useState, useCallback, useEffect } from "react";

export interface SlideData {
  subtitle: string;
  description: string;
  Mockup: React.ComponentType<{ isMobile: boolean }>;
}

interface Props {
  onComplete: () => void;
  slides: readonly SlideData[];
  featureName: string;
  featureIcon: React.ReactNode;
  finalBtnLabel: string;
}

export default function FeatureTutorialShell({ onComplete, slides, featureName, featureIcon, finalBtnLabel }: Props) {
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [slideIn, setSlideIn] = useState(true);

  const isFirst = step === 0;
  const isLast = step === slides.length - 1;
  const current = slides[step];

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white w-full md:w-auto md:min-w-[480px] md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: isMobile ? "92vh" : "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {featureIcon}
            <span className="text-base font-bold text-[#1a2744]">{featureName}</span>
          </div>
          <button
            onClick={onComplete}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            Skip
          </button>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5 px-5 pt-4 flex-shrink-0">
          {slides.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                backgroundColor: i === step ? "rgb(var(--brand-alt))" : "#e5e7eb",
              }}
            />
          ))}
        </div>

        {/* Slide text */}
        <div
          className="px-5 pt-3 pb-1 flex-shrink-0 transition-all duration-200"
          style={{ opacity: slideIn ? 1 : 0, transform: slideIn ? "translateY(0)" : "translateY(8px)" }}
        >
          <h3 className="text-lg font-semibold text-[#1a2744] mb-1 leading-snug">{current.subtitle}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{current.description}</p>
        </div>

        {/* Mockup */}
        <div
          className="flex-1 min-h-0 transition-all duration-200"
          style={{ opacity: slideIn ? 1 : 0, transform: slideIn ? "translateY(0)" : "translateY(12px)" }}
        >
          <Mockup isMobile={isMobile} />
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-t border-gray-100">
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
          ) : <span />}

          <span className="text-xs text-gray-400">{step + 1} of {slides.length}</span>

          <button
            onClick={advance}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors active:scale-95"
          >
            {isLast ? finalBtnLabel : "Next"}
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
