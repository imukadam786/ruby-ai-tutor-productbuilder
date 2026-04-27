"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { ReadingStudentProfile } from "@/types/reading";
import { StudentProfile } from "@/types/ruby";
import EduBackground from "@/components/EduBackground";

interface SubjectsHubProps {
  onNavigate: (view: ActiveView) => void;
}

interface SubjectCardProps {
  thumbnail?: string;
  placeholderEmoji?: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  accentFrom: string;
  accentTo: string;
  onClick: () => void;
}

function SubjectCard({
  thumbnail,
  placeholderEmoji,
  label,
  badge,
  badgeColor = "bg-white/20 text-white",
  accentFrom,
  accentTo,
  onClick,
}: SubjectCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl overflow-hidden shadow-sm bg-gradient-to-r ${accentFrom} ${accentTo} flex items-center justify-between px-5 py-4 transition-opacity active:opacity-80`}
    >
      <div className="flex items-center gap-3">
        {thumbnail ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/30">
            <img src={thumbnail} alt={label} className="w-full h-full object-cover" />
          </div>
        ) : (
          <span className="text-2xl">{placeholderEmoji}</span>
        )}
        <span className="font-bold text-lg text-white">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
        <svg className="w-4 h-4 text-white opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

export default function SubjectsHub({ onNavigate }: SubjectsHubProps) {
  const [mathsProfile, setMathsProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const mathsDone = mathsProfile?.placementCompleted ?? false;
  const readingDone = readingProfile?.placementCompleted ?? false;

  const mathsMastered = mathsProfile
    ? Object.values(mathsProfile.skill_mastery ?? {}).filter(
        (m) => m.status === "mastered" || m.status === "assumed"
      ).length
    : 0;

  const readingMastered = readingProfile
    ? Object.values((readingProfile as ReadingStudentProfile).skill_mastery ?? {}).filter(
        (m) => (m as { status: string }).status === "mastered"
      ).length
    : 0;

  const discoverBadge = loading
    ? "Loading..."
    : mathsDone && readingDone
    ? "Both done"
    : mathsDone || readingDone
    ? "1 of 2 done"
    : "Not started";

  const mathsBadge = loading ? "..." : mathsDone ? `${mathsMastered} mastered` : "Not started";
  const readingBadge = loading ? "..." : readingDone ? `${readingMastered} mastered` : "Not started";

  const discoverBadgeColor =
    mathsDone && readingDone
      ? "bg-green-100 text-green-700"
      : mathsDone || readingDone
      ? "bg-amber-100 text-amber-700"
      : "bg-white/20 text-white";

  const mathsBadgeColor = mathsDone ? "bg-blue-100 text-blue-700" : "bg-white/20 text-white";
  const readingBadgeColor = readingDone ? "bg-purple-100 text-purple-700" : "bg-white/20 text-white";

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-8 sm:px-8 sm:py-10 space-y-3">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
            <p className="text-gray-500 text-sm mt-1">Choose what to work on today.</p>
          </div>

          {/* Discover */}
          <SubjectCard
            placeholderEmoji="🧭"
            label="Discover"
            badge={discoverBadge}
            badgeColor={discoverBadgeColor}
            accentFrom="from-slate-600"
            accentTo="to-slate-700"
            onClick={() => onNavigate("discover")}
          />

          {/* Maths */}
          <SubjectCard
            thumbnail="/thumbnails/mathematics.jpeg"
            label="Maths"
            badge={mathsBadge}
            badgeColor={mathsBadgeColor}
            accentFrom="from-blue-600"
            accentTo="to-blue-700"
            onClick={() => onNavigate("ruby")}
          />

          {/* Reading */}
          <SubjectCard
            thumbnail="/thumbnails/english.jpeg"
            label="Reading"
            badge={readingBadge}
            badgeColor={readingBadgeColor}
            accentFrom="from-purple-600"
            accentTo="to-purple-700"
            onClick={() => onNavigate("reading")}
          />

        </div>
      </div>
    </div>
  );
}
