"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { ReadingStudentProfile } from "@/types/reading";
import { StudentProfile } from "@/types/ruby";

interface SubjectsHubProps {
  onNavigate: (view: ActiveView) => void;
}

interface SubjectCardProps {
  emoji: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  accentFrom: string;
  accentTo: string;
  textColor: string;
  onClick: () => void;
  subOptions?: { label: string; onClick: () => void }[];
  expanded?: boolean;
  onToggle?: () => void;
}

function SubjectCard({
  emoji,
  label,
  badge,
  badgeColor = "bg-white/20 text-white",
  accentFrom,
  accentTo,
  textColor,
  onClick,
  subOptions,
  expanded,
  onToggle,
}: SubjectCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={subOptions ? onToggle : onClick}
        className={`w-full bg-gradient-to-r ${accentFrom} ${accentTo} flex items-center justify-between px-5 py-4 transition-opacity active:opacity-80`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <span className={`font-bold text-lg ${textColor}`}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
          {subOptions && (
            <svg
              className={`w-4 h-4 ${textColor} transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
          {!subOptions && (
            <svg className={`w-4 h-4 ${textColor} opacity-60`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </button>

      {subOptions && expanded && (
        <div className="bg-white border border-gray-100 divide-y divide-gray-50">
          {subOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              className="w-full flex items-center justify-between px-6 py-3.5 text-left hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              <span className="font-medium text-gray-700 text-base">{opt.label}</span>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SubjectsHub({ onNavigate }: SubjectsHubProps) {
  const [mathsProfile, setMathsProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matricExpanded, setMatricExpanded] = useState(false);

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
    <div className="h-full overflow-y-auto bg-[#F4F4F5]">
      <div className="max-w-lg mx-auto px-5 py-8 sm:px-8 sm:py-10 space-y-3">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 text-sm mt-1">Choose what to work on today.</p>
        </div>

        {/* Discover */}
        <SubjectCard
          emoji="🧭"
          label="Discover"
          badge={discoverBadge}
          badgeColor={discoverBadgeColor}
          accentFrom="from-slate-600"
          accentTo="to-slate-700"
          textColor="text-white"
          onClick={() => onNavigate("discover")}
        />

        {/* Maths */}
        <SubjectCard
          emoji="🧮"
          label="Maths"
          badge={mathsBadge}
          badgeColor={mathsBadgeColor}
          accentFrom="from-blue-500"
          accentTo="to-blue-600"
          textColor="text-white"
          onClick={() => onNavigate("ruby")}
        />

        {/* English */}
        <SubjectCard
          emoji="📖"
          label="English"
          badge={readingBadge}
          badgeColor={readingBadgeColor}
          accentFrom="from-purple-500"
          accentTo="to-purple-600"
          textColor="text-white"
          onClick={() => onNavigate("reading")}
        />

        {/* Matrics */}
        <SubjectCard
          emoji="🎓"
          label="Matrics"
          accentFrom="from-[#BE1832]"
          accentTo="to-[#C94060]"
          textColor="text-white"
          onClick={() => {}}
          subOptions={[
            { label: "Matric Past Papers",     onClick: () => onNavigate("matric") },
            { label: "Prep Papers 2026",        onClick: () => onNavigate("prep-papers-2026") },
            { label: "Study Guides",            onClick: () => onNavigate("matric") },
          ]}
          expanded={matricExpanded}
          onToggle={() => setMatricExpanded((v) => !v)}
        />

      </div>
    </div>
  );
}
