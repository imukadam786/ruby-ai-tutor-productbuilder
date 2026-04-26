"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { ReadingStudentProfile } from "@/types/reading";
import { StudentProfile } from "@/types/ruby";
import SavedReportView from "@/components/SavedReportView";

interface DiscoverHubProps {
  onNavigate: (view: ActiveView) => void;
}

export default function DiscoverHub({ onNavigate }: DiscoverHubProps) {
  const [mathsProfile, setMathsProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewReport, setViewReport] = useState<"maths" | "reading" | null>(null);

  useEffect(() => {
    Promise.all([
      hydrateStudentProfileFromSupabase(),
      hydrateReadingProfileFromSupabase(),
    ]).then(([mp, rp]) => {
      setMathsProfile(mp);
      setReadingProfile(rp as ReadingStudentProfile | null);
      setLoading(false);
    });
  }, []);

  if (viewReport) {
    return (
      <div className="h-full overflow-hidden">
        <SavedReportView subject={viewReport} onBack={() => setViewReport(null)} />
      </div>
    );
  }

  const mathsDone = mathsProfile?.placementCompleted ?? false;
  const readingDone = readingProfile?.placementCompleted ?? false;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F4F4F5]">

      {/* ── Maths Discovery (top half) ──────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex-1 flex flex-col justify-between px-6 py-6 sm:py-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🧮</span>
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Discovery Activity</p>
                <h2 className="text-white font-bold text-xl leading-tight">Maths</h2>
              </div>
            </div>

            {mathsDone ? (
              <div className="bg-white/15 rounded-xl px-4 py-3 inline-block">
                <p className="text-white/90 text-sm font-medium">Discovery completed ✓</p>
                <p className="text-white/60 text-xs mt-0.5">Ruby has found your starting level</p>
              </div>
            ) : (
              <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                Find your Maths level so Ruby knows exactly where to start you — no guessing, just the right fit.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4">
            {mathsDone ? (
              <>
                <button
                  onClick={() => setViewReport("maths")}
                  className="bg-white text-emerald-600 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors active:scale-[0.97]"
                >
                  View Report
                </button>
                <button
                  onClick={() => onNavigate("discover-maths")}
                  className="bg-white/20 text-white font-medium text-sm px-5 py-2.5 rounded-full hover:bg-white/30 transition-colors active:scale-[0.97]"
                >
                  Retake Activity
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate("discover-maths")}
                disabled={loading}
                className="bg-white text-emerald-600 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors active:scale-[0.97] disabled:opacity-50"
              >
                Start Maths Discovery 👉
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/20 flex-shrink-0" />

      {/* ── Reading Discovery (bottom half) ─────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-br from-sky-400 to-blue-600 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex-1 flex flex-col justify-between px-6 py-6 sm:py-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">📖</span>
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Discovery Activity</p>
                <h2 className="text-white font-bold text-xl leading-tight">Reading</h2>
              </div>
            </div>

            {readingDone ? (
              <div className="bg-white/15 rounded-xl px-4 py-3 inline-block">
                <p className="text-white/90 text-sm font-medium">Discovery completed ✓</p>
                <p className="text-white/60 text-xs mt-0.5">Ruby has found your reading level</p>
              </div>
            ) : (
              <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                Find your Reading level so Ruby can personalise your reading journey from the very first session.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4">
            {readingDone ? (
              <>
                <button
                  onClick={() => setViewReport("reading")}
                  className="bg-white text-blue-600 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors active:scale-[0.97]"
                >
                  View Report
                </button>
                <button
                  onClick={() => onNavigate("discover-reading")}
                  className="bg-white/20 text-white font-medium text-sm px-5 py-2.5 rounded-full hover:bg-white/30 transition-colors active:scale-[0.97]"
                >
                  Retake Activity
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate("discover-reading")}
                disabled={loading}
                className="bg-white text-blue-600 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors active:scale-[0.97] disabled:opacity-50"
              >
                Start Reading Discovery 👉
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
