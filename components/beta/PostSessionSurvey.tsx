"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";

interface Props {
  sessionType: "maths" | "reading" | "chat";
  onClose: () => void;
}

const EMOJIS = [
  { value: 1, emoji: "😞", label: "Poor" },
  { value: 2, emoji: "😐", label: "Okay" },
  { value: 3, emoji: "🙂", label: "Good" },
  { value: 4, emoji: "😊", label: "Great" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

const SESSION_LABELS: Record<Props["sessionType"], string> = {
  maths:   "maths session",
  reading: "reading session",
  chat:    "homework session",
};

export default function PostSessionSurvey({ sessionType, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<"rate" | "comment" | "done">("rate");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const selectRating = (val: number) => {
    setSelected(val);
    // Low rating (1-2) → ask for comment. High (3-5) → go straight to done after short delay
    if (val <= 2) {
      setTimeout(() => setStep("comment"), 400);
    } else {
      setTimeout(() => {
        save(val, "");
        setStep("done");
      }, 500);
    }
  };

  const save = async (rating: number, text: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("session_surveys").insert({
        user_id: user?.id ?? null,
        session_type: sessionType,
        rating,
        comment: text.trim() || null,
      });
    } catch {
      // Fallback to localStorage
      const existing = JSON.parse(localStorage.getItem("beta_session_surveys") || "[]");
      existing.push({ sessionType, rating, comment: text.trim(), ts: new Date().toISOString() });
      localStorage.setItem("beta_session_surveys", JSON.stringify(existing));
    }
  };

  const submitComment = () => {
    if (selected) save(selected, comment);
    setStep("done");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={dismiss} />

      {/* Sheet — bottom on mobile, centered card on desktop */}
      <div
        className="relative w-full sm:w-[420px] sm:max-w-sm bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl px-6 pb-8 pt-5"
        style={{
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(100%) scale(1)",
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* STEP: Rate */}
        {step === "rate" && (
          <>
            <p className="text-center font-bold text-[#1a2744] text-base mb-1">
              How was that {SESSION_LABELS[sessionType]}?
            </p>
            <p className="text-center text-gray-400 text-xs mb-6">Takes 2 seconds — it really helps us improve!</p>
            <div className="flex justify-between px-2">
              {EMOJIS.map(({ value, emoji, label }) => (
                <button
                  key={value}
                  onClick={() => selectRating(value)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span
                    className="text-3xl transition-transform group-hover:scale-125 group-active:scale-110"
                    style={{
                      filter: selected === value ? "drop-shadow(0 0 6px #3b82f6)" : "none",
                      transform: selected === value ? "scale(1.25)" : "scale(1)",
                      transition: "transform 0.2s ease, filter 0.2s ease",
                    }}
                  >
                    {emoji}
                  </span>
                  <span className="text-xs text-gray-400">{label}</span>
                </button>
              ))}
            </div>
            <button onClick={dismiss} className="mt-6 w-full text-center text-xs text-gray-300 hover:text-gray-400">
              Skip
            </button>
          </>
        )}

        {/* STEP: Comment (low rating) */}
        {step === "comment" && (
          <>
            <p className="font-bold text-[#1a2744] text-base mb-1">What went wrong?</p>
            <p className="text-gray-400 text-xs mb-4">Help us fix it for next time.</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. The questions were too hard / something didn't load..."
              rows={3}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={dismiss}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={submitComment}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </div>
          </>
        )}

        {/* STEP: Done */}
        {step === "done" && (
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <span className="text-4xl">
              {selected && selected >= 4 ? "🎉" : "🙏"}
            </span>
            <p className="font-bold text-[#1a2744] text-base">
              {selected && selected >= 4 ? "Love to hear it!" : "Thanks for the feedback!"}
            </p>
            <p className="text-gray-400 text-sm">
              {selected && selected >= 4
                ? "Keep it up — you're doing great."
                : "We'll use this to make Ruby better for you."}
            </p>
            <button
              onClick={dismiss}
              className="mt-2 px-8 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
