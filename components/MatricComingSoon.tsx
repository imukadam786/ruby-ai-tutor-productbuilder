"use client";

import { useState } from "react";
import EduBackground from "@/components/EduBackground";
import { supabase } from "@/lib/supabase";

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Practise real past exam papers",
    desc: "Work through authentic NSC past papers across all major subjects.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Step-by-step guidance on difficult questions",
    desc: "Ruby walks you through each question at your pace, never just giving you the answer.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Understand your mistakes with clear explanations",
    desc: "Every wrong answer becomes a learning moment with targeted error feedback.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Strengthen core concepts before the exams",
    desc: "Ruby identifies the gaps behind your mistakes and rebuilds the foundations you need.",
  },
];

export default function MatricComingSoon() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setSubmitting(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email ?? null;
      await supabase.from("matric_waitlist").insert({
        user_id: user?.id ?? null,
        email,
      });
      setSubmitted(true);
    } catch {
      // Fallback to localStorage if table not yet created
      const existing = JSON.parse(localStorage.getItem("matric_waitlist") || "[]");
      existing.push({ ts: new Date().toISOString() });
      localStorage.setItem("matric_waitlist", JSON.stringify(existing));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative max-w-3xl mx-auto px-5 py-12 sm:px-8 sm:py-16 space-y-14">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-6">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Coming Soon
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              Matric <span className="text-[#BE1832]">Preparation</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
              Ruby will soon help matric students work through real past exam papers with step-by-step guidance designed to strengthen understanding and build exam confidence.
            </p>
          </div>
        </div>

        {/* ── Feature cards ─────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-gray-800 text-center">What students will be able to do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-rose-50 text-[#BE1832] flex items-center justify-center">
                  {f.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{f.title}</p>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Waitlist CTA ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          {submitted ? (
            <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-6 py-4">
              <span className="text-2xl">🎉</span>
              <div className="text-left">
                <p className="font-semibold text-green-800 text-base">You're on the list!</p>
                <p className="text-green-600 text-sm">We'll notify you the moment Matric Prep launches.</p>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={handleJoin}
                disabled={submitting}
                className="bg-[#BE1832] hover:bg-[#a31529] text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-60"
              >
                {submitting ? "Joining…" : "Join the Waitlist"}
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <p className="text-gray-400 text-sm">Be the first to know when this launches.</p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
