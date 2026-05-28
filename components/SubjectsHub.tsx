"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase, getStudentProfile } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase, getReadingProfile } from "@/lib/reading-student-model";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import { HIGHEST_AVAILABLE_LEVEL as LIFE_SKILLS_MAX_GRADE } from "@/lib/life-skills-grade-map";
import { HIGHEST_AVAILABLE_LEVEL as AFRIKAANS_MAX_GRADE } from "@/lib/afrikaans-grade-map";
import {
  HIGHEST_AVAILABLE_LEVEL as SOCIAL_SCIENCES_MAX_GRADE,
  LOWEST_AVAILABLE_LEVEL as SOCIAL_SCIENCES_MIN_GRADE,
} from "@/lib/social-sciences-grade-map";
import {
  HIGHEST_AVAILABLE_LEVEL as NST_MAX_GRADE,
  LOWEST_AVAILABLE_LEVEL as NST_MIN_GRADE,
} from "@/lib/nst-grade-map";
import { ReadingStudentProfile } from "@/types/reading";
import { StudentProfile } from "@/types/ruby";
import EduBackground from "@/components/EduBackground";
import { useT } from "@/lib/i18n";

const SkillTreeView           = dynamic(() => import("@/components/ruby/SkillTreeView"),                       { ssr: false });
const ReadingSkillTreeView    = dynamic(() => import("@/components/reading/ReadingSkillTreeView"),             { ssr: false });
const LifeSkillsSkillTreeView = dynamic(() => import("@/components/life-skills/LifeSkillsSkillTreeView"),     { ssr: false });
const AfrikaansSkillTreeView  = dynamic(() => import("@/components/afrikaans/AfrikaansSkillTreeView"),         { ssr: false });
const SocialSciencesSkillTreeView = dynamic(() => import("@/components/social-sciences/SocialSciencesSkillTreeView"), { ssr: false });
const NstSkillTreeView        = dynamic(() => import("@/components/nst/NstSkillTreeView"),                     { ssr: false });

type SubjectId =
  | "discover"
  | "maths"
  | "english"
  | "life-skills"
  | "afrikaans"
  | "social-sciences"
  | "nst";

interface SubjectsHubProps {
  onNavigate: (view: ActiveView) => void;
}

interface SubjectMeta {
  id: SubjectId;
  thumbnail?: string;
  placeholderEmoji?: string;
  label: string;
  caption: string;
  badge?: string;
  badgeColor?: string;
  accentFrom: string;
  accentTo: string;
  navigateTo: ActiveView;
}

interface SubjectRowProps {
  subject: SubjectMeta;
  active: boolean;
  onSelect: () => void;
}

function SubjectRow({ subject, active, onSelect }: SubjectRowProps) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={active}
      className={`w-full text-left rounded-xl bg-white border transition-all flex items-center gap-3 px-3 py-2.5 hover:shadow-md hover:-translate-y-px ${
        active ? "border-[#BE1832] ring-2 ring-[#BE1832]/15 shadow-md" : "border-gray-100"
      }`}
    >
      <div
        className={`w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 rounded-lg bg-gradient-to-br ${subject.accentFrom} ${subject.accentTo} flex items-center justify-center overflow-hidden`}
      >
        {subject.thumbnail ? (
          <img src={subject.thumbnail} alt={subject.label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl leading-none">{subject.placeholderEmoji}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="block font-semibold text-gray-900 text-sm leading-tight">{subject.label}</span>
        <span className="block text-[11px] text-gray-500 leading-snug line-clamp-2">{subject.caption}</span>
        {subject.badge && (
          <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${subject.badgeColor ?? "bg-gray-100 text-gray-600"}`}>
            {subject.badge}
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
  const [selectedId, setSelectedId] = useState<SubjectId>(() => {
    if (typeof window === "undefined") return "maths";
    return (sessionStorage.getItem("ruby_last_subject") as SubjectId | null) ?? "maths";
  });

  useEffect(() => {
    Promise.all([
      hydrateStudentProfileFromSupabase(),
      hydrateReadingProfileFromSupabase(),
      fetchAuthorisedGrade(),
    ]).then(([mp, rp, auth]) => {
      setMathsProfile(mp ?? getStudentProfile());
      setReadingProfile((rp as ReadingStudentProfile | null) ?? getReadingProfile());
      setGrade(auth?.grade ?? null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") sessionStorage.setItem("ruby_last_subject", selectedId);
  }, [selectedId]);

  const learnerGrade = grade ?? 1;
  const showLifeSkills = learnerGrade <= LIFE_SKILLS_MAX_GRADE;
  const showAfrikaans = learnerGrade <= AFRIKAANS_MAX_GRADE;
  const showSocialSciences =
    learnerGrade >= SOCIAL_SCIENCES_MIN_GRADE && learnerGrade <= SOCIAL_SCIENCES_MAX_GRADE;
  const showNst =
    learnerGrade >= NST_MIN_GRADE && learnerGrade <= NST_MAX_GRADE;

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

  const subjects = useMemo<SubjectMeta[]>(() => {
    const all: SubjectMeta[] = [
      {
        id: "discover",
        thumbnail: "/thumbnails/discover.png",
        label: "Discover",
        caption: "Take the placement and find your starting point",
        badge: discoverBadge,
        badgeColor: discoverBadgeColor,
        accentFrom: "from-slate-600",
        accentTo: "to-slate-700",
        navigateTo: "discover",
      },
      {
        id: "maths",
        thumbnail: "/thumbnails/mathematics.jpeg",
        label: "Maths",
        caption: "Personalised lessons that adapt to your level",
        badge: mathsBadge,
        badgeColor: mathsBadgeColor,
        accentFrom: "from-blue-600",
        accentTo: "to-blue-700",
        navigateTo: "ruby",
      },
      {
        id: "english",
        thumbnail: "/thumbnails/english.jpeg",
        label: "English",
        caption: "Reading, comprehension and writing — adapts to your grade",
        badge: readingBadge,
        badgeColor: readingBadgeColor,
        accentFrom: "from-purple-600",
        accentTo: "to-purple-700",
        navigateTo: "reading",
      },
    ];
    if (showLifeSkills) {
      all.push({
        id: "life-skills",
        thumbnail: "/thumbnails/life-skills.png",
        label: "Life Skills",
        caption: `Beginning Knowledge & Health for Grades 1–${LIFE_SKILLS_MAX_GRADE}`,
        badge: "Foundation Phase",
        badgeColor: "bg-amber-100 text-amber-700",
        accentFrom: "from-amber-500",
        accentTo: "to-rose-500",
        navigateTo: "life-skills",
      });
    }
    if (showAfrikaans) {
      all.push({
        id: "afrikaans",
        thumbnail: "/thumbnails/afrikaans-fal.jpeg",
        label: "Afrikaans",
        caption: `First Additional Language — listen, choose and learn (Grades 1–${AFRIKAANS_MAX_GRADE})`,
        accentFrom: "from-emerald-500",
        accentTo: "to-teal-600",
        navigateTo: "afrikaans-fal",
      });
    }
    if (showSocialSciences) {
      all.push({
        id: "social-sciences",
        thumbnail: "/thumbnails/social-sciences.png",
        label: "Social Sciences",
        caption: `History & Geography for Grades ${SOCIAL_SCIENCES_MIN_GRADE}–${SOCIAL_SCIENCES_MAX_GRADE}`,
        badge: "Intermediate Phase",
        badgeColor: "bg-sky-100 text-sky-700",
        accentFrom: "from-sky-500",
        accentTo: "to-indigo-600",
        navigateTo: "social-sciences",
      });
    }
    if (showNst) {
      all.push({
        id: "nst",
        placeholderEmoji: "🔬",
        label: "Natural Sciences & Tech",
        caption: `Science and Technology for Grades ${NST_MIN_GRADE}–${NST_MAX_GRADE}`,
        badge: "Intermediate Phase",
        badgeColor: "bg-sky-100 text-sky-700",
        accentFrom: "from-green-500",
        accentTo: "to-teal-600",
        navigateTo: "natural-sciences-tech",
      });
    }
    return all;
  }, [
    discoverBadge, discoverBadgeColor,
    mathsBadge, mathsBadgeColor,
    readingBadge, readingBadgeColor,
    showLifeSkills, showAfrikaans, showSocialSciences, showNst,
  ]);

  // Keep selection valid if the chosen subject is no longer visible for this grade.
  useEffect(() => {
    if (!subjects.find((s) => s.id === selectedId)) {
      setSelectedId(subjects[0]?.id ?? "maths");
    }
  }, [subjects, selectedId]);

  const selected = subjects.find((s) => s.id === selectedId);

  // ── Maths / Reading replay + continue handlers (mirror app/page.tsx logic) ──
  const startMathsReplay = (skillId: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem("ruby_maths_replay_skill", skillId);
    onNavigate("ruby");
  };
  const startReadingReplay = (skillId: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem("ruby_reading_replay_skill", skillId);
    onNavigate("reading");
  };
  const continueMaths = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("ruby_maths_replay_skill");
    onNavigate("ruby");
  };
  const continueReading = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("ruby_reading_replay_skill");
    onNavigate("reading");
  };
  const startAfrikaansSkill = (skillId: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem("ruby_afrikaans_target_skill", skillId);
    onNavigate("afrikaans-fal");
  };

  function renderRightPane() {
    if (!selected) return null;
    switch (selected.id) {
      case "discover":
        return (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-4">
            <div className="text-5xl">🧭</div>
            <h3 className="text-lg font-bold text-gray-900">{selected.label}</h3>
            <p className="text-sm text-gray-600 max-w-md leading-relaxed">
              Discovery places you on the right starting rung of the Maths and Reading skill trees.
              {mathsDone && readingDone
                ? " You've completed both — open Discover to view your placement reports."
                : mathsDone || readingDone
                ? " One down, one to go."
                : ""}
            </p>
            <button
              onClick={() => onNavigate("discover")}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {mathsDone && readingDone ? "View placement results →" : "Open Discover →"}
            </button>
          </div>
        );
      case "maths":
        return (
          <SkillTreeView
            profile={mathsProfile}
            onReplaySkill={startMathsReplay}
            onContinue={continueMaths}
          />
        );
      case "english":
        return (
          <ReadingSkillTreeView
            profile={readingProfile}
            onReplaySkill={startReadingReplay}
            onContinue={continueReading}
          />
        );
      case "life-skills":
        return <LifeSkillsSkillTreeView onPickTopic={() => onNavigate("life-skills")} />;
      case "afrikaans":
        return (
          <AfrikaansSkillTreeView
            onPickSkill={startAfrikaansSkill}
            profile={null}
          />
        );
      case "social-sciences":
        return <SocialSciencesSkillTreeView onPickTopic={() => onNavigate("social-sciences")} />;
      case "nst":
        return <NstSkillTreeView onPickTopic={() => onNavigate("natural-sciences-tech")} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">

          <div className="mb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t("subjects.title")}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{t("subjects.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
            {/* Left: stacked subjects */}
            <aside className="space-y-2">
              {subjects.map((s) => (
                <SubjectRow
                  key={s.id}
                  subject={s}
                  active={s.id === selectedId}
                  onSelect={() => setSelectedId(s.id)}
                />
              ))}
              {selected && selected.id !== "discover" && (
                <button
                  onClick={() => onNavigate(selected.navigateTo)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-[#BE1832] hover:bg-[#a01528] text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  Open {selected.label} →
                </button>
              )}
            </aside>

            {/* Right: selected subject's skill tree (the journey) */}
            <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[60vh] lg:min-h-[70vh]">
              {renderRightPane()}
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
