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
    <div className="h-full overflow-y-auto bg-[#F4F4F5]">
      <div className="max-w-lg mx-auto px-5 py-8 sm:px-8 sm:py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🧭</span>
            <h1 className="text-2xl font-bold text-gray-900">Discovery Activity</h1>
          </div>
          <p className="text-gray-500 text-base leading-relaxed">
            Find your level so Ruby knows exactly where to start. Takes about 10 minutes and makes every session count.
          </p>
        </div>

        {/* Maths card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">🧮</span>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Discovery</p>
              <h2 className="text-white font-bold text-lg leading-tight">Maths</h2>
            </div>
            {mathsDone && (
              <span className="ml-auto bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Completed
              </span>
            )}
          </div>

          <div className="px-5 py-4">
            {mathsDone ? (
              <p className="text-sm text-gray-500 mb-4">
                Ruby has found your starting Maths level. View your report or retake to update your placement.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                A short adaptive quiz that finds your exact Maths level, no guessing, just the right fit.
              </p>
            )}

            <div className="flex gap-2">
              {mathsDone ? (
                <>
                  <button
                    onClick={() => setViewReport("maths")}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors active:scale-[0.97]"
                  >
                    View Report
                  </button>
                  <button
                    onClick={() => onNavigate("discover-maths")}
                    className="flex-1 border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium text-sm py-2.5 rounded-xl transition-colors active:scale-[0.97]"
                  >
                    Retake
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate("discover-maths")}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm py-3 rounded-xl transition-colors active:scale-[0.97] disabled:opacity-50"
                >
                  Start Maths Discovery
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reading card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Discovery</p>
              <h2 className="text-white font-bold text-lg leading-tight">Reading</h2>
            </div>
            {readingDone && (
              <span className="ml-auto bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Completed
              </span>
            )}
          </div>

          <div className="px-5 py-4">
            {readingDone ? (
              <p className="text-sm text-gray-500 mb-4">
                Ruby has found your reading level. View your report or retake to update your placement.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                A short adaptive quiz that finds your exact Reading level, personalising your journey from the very first session.
              </p>
            )}

            <div className="flex gap-2">
              {readingDone ? (
                <>
                  <button
                    onClick={() => setViewReport("reading")}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors active:scale-[0.97]"
                  >
                    View Report
                  </button>
                  <button
                    onClick={() => onNavigate("discover-reading")}
                    className="flex-1 border border-purple-200 text-purple-600 hover:bg-purple-50 font-medium text-sm py-2.5 rounded-xl transition-colors active:scale-[0.97]"
                  >
                    Retake
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate("discover-reading")}
                  disabled={loading}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm py-3 rounded-xl transition-colors active:scale-[0.97] disabled:opacity-50"
                >
                  Start Reading Discovery
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
