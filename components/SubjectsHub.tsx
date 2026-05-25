"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase, getStudentProfile } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase, getReadingProfile } from "@/lib/reading-student-model";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import { ReadingStudentProfile } from "@/types/reading";
import { StudentProfile } from "@/types/ruby";
import EduBackground from "@/components/EduBackground";
import { useT } from "@/lib/i18n";

interface SubjectsHubProps {
  onNavigate: (view: ActiveView) => void;
}

interface SubjectCardProps {
  thumbnail?: string;
  placeholderEmoji?: string;
  label: string;
  caption: string;
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
  caption,
  badge,
  badgeColor = "bg-gray-100 text-gray-600",
  accentFrom,
  accentTo,
  onClick,
}: SubjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100 flex flex-col active:opacity-80 transition-all text-left hover:shadow-xl hover:-translate-y-1"
    >
      {/* Square gradient header */}
      <div
        className={`w-full bg-gradient-to-br ${accentFrom} ${accentTo} flex items-center justify-center overflow-hidden flex-shrink-0`}
        style={{ aspectRatio: "1 / 1" }}
      >
        {thumbnail ? (
          <img src={thumbnail} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span style={{ fontSize: "5rem", lineHeight: 1 }}>{placeholderEmoji}</span>
        )}
      </div>
      {/* Label + caption + badge */}
      <div className="px-5 pt-4 pb-5 flex flex-col items-start gap-1.5">
        <span className="font-bold text-gray-900 text-xl">{label}</span>
        <span className="text-sm text-gray-500 leading-snug">{caption}</span>
        {badge && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap mt-2 ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}

export default function SubjectsHub({ onNavigate }: SubjectsHubProps) {
  const { t } = useT();
  const [mathsProfile, setMathsProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      hydrateStudentProfileFromSupabase(),
      hydrateReadingProfileFromSupabase(),
      fetchAuthorisedGrade(),
    ]).then(([mp, rp, auth]) => {
      // Supabase is best-effort/async and empty for anonymous or unsynced
      // testers — fall back to the local profile (where a just-completed
      // placement actually lives) so status badges reflect reality.
      setMathsProfile(mp ?? getStudentProfile());
      setReadingProfile((rp as ReadingStudentProfile | null) ?? getReadingProfile());
      setGrade(auth?.grade ?? null);
      setLoading(false);
    });
  }, []);

  // Life Skills & Afrikaans are Foundation Phase (Gr 1–3) only — hide them for
  // Grade 4+ learners. Default to showing while the grade is still loading.
  const showFoundationSubjects = (grade ?? 1) <= 3;

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
    ? "..."
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
      : "bg-gray-100 text-gray-600";

  const mathsBadgeColor = mathsDone ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600";
  const readingBadgeColor = readingDone ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600";

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 pt-8 pb-8">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t("subjects.title")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("subjects.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Discover */}
            <SubjectCard
              placeholderEmoji="🧭"
              label="Discover"
              caption="Take the placement and find your starting point"
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
              caption="Personalised lessons that adapt to your level"
              badge={mathsBadge}
              badgeColor={mathsBadgeColor}
              accentFrom="from-blue-600"
              accentTo="to-blue-700"
              onClick={() => onNavigate("ruby")}
            />

            {/* English — unified reading + writing skill tree (Levels 1–8) */}
            <SubjectCard
              thumbnail="/thumbnails/english.jpeg"
              label="English"
              caption="Reading, comprehension and writing — adapts to your grade"
              badge={readingBadge}
              badgeColor={readingBadgeColor}
              accentFrom="from-purple-600"
              accentTo="to-purple-700"
              onClick={() => onNavigate("reading")}
            />

            {/* Life Skills & Afrikaans are Foundation Phase (Gr 1–3) — hidden
                for Grade 4+ learners. */}
            {showFoundationSubjects && (
              <>
                {/* Life Skills — Foundation Phase (Gr 1–3), open to all plans */}
                <SubjectCard
                  thumbnail="/thumbnails/life-skills.png"
                  label="Life Skills"
                  caption="Beginning Knowledge & Health for Grades 1–3"
                  badge="Foundation Phase"
                  badgeColor="bg-amber-100 text-amber-700"
                  accentFrom="from-amber-500"
                  accentTo="to-rose-500"
                  onClick={() => onNavigate("life-skills")}
                />

                {/* Afrikaans FAL — Foundation Phase (Gr 1–3), free (no Scholar badge).
                    Uses the same thumbnail as the Matric Afrikaans FAL subject. */}
                <SubjectCard
                  thumbnail="/thumbnails/afrikaans-fal.jpeg"
                  label="Afrikaans"
                  caption="First Additional Language — listen, choose and learn (Grades 1–3)"
                  accentFrom="from-emerald-500"
                  accentTo="to-teal-600"
                  onClick={() => onNavigate("afrikaans-fal")}
                />
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
