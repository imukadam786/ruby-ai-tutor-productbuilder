"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type FeedbackCategory = "bug" | "feature" | "content" | "general";

const CATEGORIES: { id: FeedbackCategory; emoji: string; label: string }[] = [
  { id: "bug",     emoji: "🐛", label: "Something is broken" },
  { id: "feature", emoji: "💡", label: "I have an idea" },
  { id: "content", emoji: "📚", label: "Content feedback" },
  { id: "general", emoji: "💬", label: "General feedback" },
];

type Step = "button" | "category" | "describe" | "done";

export default function FloatingFeedback() {
  const [step, setStep] = useState<Step>("button");
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Allow BetaBanner to open this programmatically
  useEffect(() => {
    const handler = () => setStep("category");
    document.addEventListener("open-feedback", handler);
    return () => document.removeEventListener("open-feedback", handler);
  }, []);

  const close = () => {
    setStep("button");
    setCategory(null);
    setText("");
  };

  const selectCategory = (cat: FeedbackCategory) => {
    setCategory(cat);
    setStep("describe");
    setTimeout(() => textRef.current?.focus(), 100);
  };

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Try to get name from onboarding data first, fall back to auth metadata
      let fullName: string | null = null;
      try {
        const raw = localStorage.getItem("onboardingData");
        if (raw) fullName = JSON.parse(raw).name ?? null;
      } catch { /* ignore */ }
      if (!fullName) fullName = user?.user_metadata?.full_name ?? null;

      await supabase.from("feedback").insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        name: fullName,
        category,
        text: text.trim(),
        url: window.location.href,
      });
    } catch {
      // Fallback to localStorage if DB unavailable
      const existing = JSON.parse(localStorage.getItem("beta_feedback") || "[]");
      existing.push({ category, text: text.trim(), url: window.location.href, ts: new Date().toISOString() });
      localStorage.setItem("beta_feedback", JSON.stringify(existing));
    }
    setSubmitting(false);
    setStep("done");
  };

  const selectedCat = CATEGORIES.find((c) => c.id === category);

  // ── Button hidden — opened only via BetaBanner "Share feedback" event ───────
  if (step === "button") return null;

  // ── Modal backdrop ────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

      {/* Panel */}
      <div className="relative w-full sm:w-96 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {step === "describe" && (
              <button onClick={() => setStep("category")} className="p-1 -ml-1 rounded-lg text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <span className="font-bold text-[#1a2744] text-sm">
              {step === "category" && "What would you like to share?"}
              {step === "describe" && `${selectedCat?.emoji} ${selectedCat?.label}`}
              {step === "done" && "Thank you! 🎉"}
            </span>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step: Category */}
        {step === "category" && (
          <div className="p-5 grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className="flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-left active:scale-95"
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-semibold text-[#1a2744] leading-snug">{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step: Describe */}
        {step === "describe" && (
          <div className="p-5 space-y-4">
            <textarea
              ref={textRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us what's on your mind... the more detail the better!"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
            <button
              onClick={submit}
              disabled={!text.trim() || submitting}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-700 transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending...
                </>
              ) : "Send Feedback"}
            </button>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
            <h3 className="font-bold text-[#1a2744] text-base">Feedback received!</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              You're helping shape Ruby. We read every single message and use it to improve your experience.
            </p>
            <button
              onClick={close}
              className="mt-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Ruby
            </button>
          </div>
        )}

        {/* Beta label */}
        <div className="px-5 pb-4 flex justify-center">
          <span className="text-xs text-gray-300">Ruby Beta — your feedback matters 💙</span>
        </div>
      </div>
    </div>
  );
}
