"use client";

import { useState } from "react";
import EduBackground from "@/components/EduBackground";

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
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Remove anxiety with structured exam practice",
    desc: "Build real confidence by practising the way the exam actually works.",
  },
];

export default function MatricComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    // Save to localStorage — wired to backend post-launch
    const existing = JSON.parse(localStorage.getItem("matric_waitlist") || "[]");
    existing.push({ email: email.trim(), ts: new Date().toISOString() });
    localStorage.setItem("matric_waitlist", JSON.stringify(existing));
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative max-w-5xl mx-auto px-5 py-10 sm:px-8 sm:py-14 space-y-16">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* Left — copy */}
          <div className="space-y-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Coming Soon
            </span>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Matric<br />
                <span className="text-[#BE1832]">Preparation</span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                Ruby will soon help matric students work through real past exam papers with step-by-step guidance designed to strengthen understanding and build exam confidence.
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-2">
              {submitted ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="font-semibold text-green-800 text-base">You're on the list!</p>
                    <p className="text-green-600 text-sm">We'll notify you the moment Matric Prep launches.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#BE1832] hover:bg-[#a31529] text-white font-semibold text-base px-6 py-3 rounded-xl transition-colors shadow-sm disabled:opacity-60 whitespace-nowrap"
                  >
                    {submitting ? "Joining…" : "Join the Waitlist"}
                  </button>
                </form>
              )}
              {!submitted && (
                <p className="text-gray-400 text-sm pl-1">Be the first to know when this launches.</p>
              )}
            </div>
          </div>

          {/* Right — visual */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              {/* Mock exam card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">NSC Mathematics</span>
                  <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2.5 py-1 rounded-full">Paper 1</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Question 4.1</p>
                  <p className="text-sm text-gray-500 leading-relaxed">Write down the coordinates of M, the point where the asymptotes of <span className="font-mono text-gray-700">f</span> intersect.</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Student answer</p>
                  <p className="text-sm text-gray-700 font-medium">M = (3, 4)</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <span className="text-base mt-0.5">✅</span>
                  <div>
                    <p className="text-xs font-semibold text-green-700">Correct — 2/2 marks</p>
                    <p className="text-xs text-green-600 mt-0.5">The vertical asymptote is x = 3 and the horizontal asymptote is y = 4.</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span>4 / 15 marks</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#BE1832] rounded-full" style={{ width: "27%" }} />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md rotate-3">
                May 2025
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature cards ─────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-gray-800">What students will be able to do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-rose-50 text-[#BE1832] flex items-center justify-center">
                  {f.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{f.title}</p>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#BE1832] to-[#E8305A] rounded-3xl px-8 py-10 text-center space-y-5 shadow-lg">
          <p className="text-white/80 text-sm font-medium uppercase tracking-widest">Launching before Matric exams</p>
          <h2 className="text-white font-extrabold text-2xl sm:text-3xl leading-tight">
            Be notified when Matric<br className="hidden sm:block" /> Preparation launches
          </h2>

          {submitted ? (
            <div className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl text-base">
              🎉 You're on the waitlist!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-4 py-3 rounded-xl border-0 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-white text-[#BE1832] font-bold text-base px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60 whitespace-nowrap"
              >
                {submitting ? "Joining…" : "Join the Waitlist"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
