"use client";

// Shown when the learner opens the Homework tab before a tutor is chosen. It
// presents the tutor characters in a swipeable carousel — one card per view on
// mobile, three on desktop — and calls onPick(name) once the learner taps one,
// which hands off to ChatInterface personalised to that tutor.

import { useEffect, useRef, useState } from "react";
import EduBackground from "@/components/EduBackground";
import { TUTORS } from "@/lib/tutors";

interface CharacterPickerProps {
  onPick: (tutorName: string) => void;
}

export default function CharacterPicker({ onPick }: CharacterPickerProps) {
  // One card per view on phones, three on desktop. Tracked in state (not just
  // CSS) so the page count + dots + swipe maths line up with what's visible.
  const [perPage, setPerPage] = useState(3);
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setPerPage(mq.matches ? 3 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const pages = Math.ceil(TUTORS.length / perPage);

  // Keep the current page in range when the viewport (and perPage) changes.
  useEffect(() => {
    setPage((p) => Math.min(p, pages - 1));
  }, [pages]);

  const go = (next: number) => setPage(Math.max(0, Math.min(next, pages - 1)));

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Choose your tutor</h1>
            <p className="text-gray-500 text-base mt-1">
              Pick a character to help with your homework.
            </p>
          </div>

          <div className="relative">
            {/* Desktop arrows */}
            {pages > 1 && (
              <>
                <button
                  onClick={() => go(page - 1)}
                  disabled={page === 0}
                  aria-label="Previous tutors"
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-[#BE1832] disabled:opacity-30 disabled:cursor-default transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => go(page + 1)}
                  disabled={page === pages - 1}
                  aria-label="Next tutors"
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-[#BE1832] disabled:opacity-30 disabled:cursor-default transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div
              className="overflow-hidden"
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (dx < -40) go(page + 1);
                else if (dx > 40) go(page - 1);
                touchStartX.current = null;
              }}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${page * 100}%)` }}
              >
                {Array.from({ length: pages }).map((_, p) => (
                  <div
                    key={p}
                    className="w-full flex-shrink-0 grid gap-3 sm:gap-4"
                    style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}
                  >
                    {TUTORS.slice(p * perPage, p * perPage + perPage).map((tutor) => (
                      <button
                        key={tutor.name}
                        onClick={() => onPick(tutor.name)}
                        className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-3 text-center hover:shadow-md hover:border-[#BE1832]/40 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BE1832]/50"
                      >
                        <p className="font-semibold text-gray-800 text-base sm:text-lg">{tutor.name}</p>
                        <div className="w-full aspect-square rounded-xl bg-white overflow-hidden flex items-center justify-center">
                          <img
                            src={tutor.img}
                            alt={tutor.name}
                            className="w-full h-full object-contain"
                            draggable={false}
                          />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-[#BE1832] leading-tight">
                          {tutor.subjects.join(" · ")}
                        </p>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page dots */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: pages }).map((_, p) => (
                <button
                  key={p}
                  onClick={() => go(p)}
                  aria-label={`Go to page ${p + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    page === p ? "w-6 bg-[#BE1832]" : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
