"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase, getStudentProfile } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase, getReadingProfile } from "@/lib/reading-student-model";
import { getMathsLiteracyProfile } from "@/lib/maths-literacy-student-model";
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
import {
  HIGHEST_AVAILABLE_LEVEL as MATHS_LITERACY_MAX_GRADE,
  LOWEST_AVAILABLE_LEVEL as MATHS_LITERACY_MIN_GRADE,
} from "@/lib/maths-literacy-grade-map";
import type { MathsLiteracyStudentProfile } from "@/types/maths-literacy";
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
const MatricPhysSciSkillTreeView = dynamic(() => import("@/components/matric-phys-sci/MatricPhysSciSkillTreeView"), { ssr: false });
const MathsLiteracySkillTreeView = dynamic(() => import("@/components/maths-literacy/MathsLiteracySkillTreeView"), { ssr: false });

type SubjectId =
  | "discover"
  | "maths"
  | "english"
  | "life-skills"
  | "afrikaans"
  | "social-sciences"
  | "nst"
  | "matric-phys-sci"
  | "maths-literacy"
  | "life-sciences"
  | "history"
  | "business-studies";

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

function SubjectRow({ subject }: { subject: SubjectMeta }) {
  return (
    <div className="w-full self-start flex flex-col items-start gap-3 px-1 pt-1">
      <div
        className={`w-[120px] h-[120px] lg:w-[140px] lg:h-[140px] flex-shrink-0 rounded-2xl bg-gradient-to-br ${subject.accentFrom} ${subject.accentTo} flex items-center justify-center overflow-hidden`}
      >
        {subject.thumbnail ? (
          <img src={subject.thumbnail} alt={subject.label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl leading-none">{subject.placeholderEmoji}</span>
        )}
      </div>
      <div className="min-w-0 w-full">
        <span className="block font-semibold text-gray-900 text-base leading-tight">{subject.label}</span>
        <span className="block text-xs text-gray-500 leading-snug line-clamp-2 mt-0.5">{subject.caption}</span>
        {subject.badge && (
          <span className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${subject.badgeColor ?? "bg-gray-100 text-gray-600"}`}>
            {subject.badge}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SubjectsHub({ onNavigate }: SubjectsHubProps) {
  const { t } = useT();
  const [mathsProfile, setMathsProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [mathsLiteracyProfile, setMathsLiteracyProfile] = useState<MathsLiteracyStudentProfile | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      hydrateStudentProfileFromSupabase(),
      hydrateReadingProfileFromSupabase(),
      fetchAuthorisedGrade(),
    ]).then(([mp, rp, auth]) => {
      setMathsProfile(mp ?? getStudentProfile());
      setReadingProfile((rp as ReadingStudentProfile | null) ?? getReadingProfile());
      setMathsLiteracyProfile(getMathsLiteracyProfile());
      setGrade(auth?.grade ?? null);
      setLoading(false);
    });
  }, []);

  // Fail open: when the learner's grade can't be read (e.g. a legacy account
  // with no saved grade), show every subject rather than silently defaulting
  // to a grade and hiding the wrong ones. A learner with a known grade only
  // ever sees the subjects that grade is entitled to.
  const gradeKnown = grade !== null;
  const learnerGrade = grade ?? 0;
  const showLifeSkills = !gradeKnown || learnerGrade <= LIFE_SKILLS_MAX_GRADE;
  const showAfrikaans = !gradeKnown || learnerGrade <= AFRIKAANS_MAX_GRADE;
  const showSocialSciences =
    !gradeKnown ||
    (learnerGrade >= SOCIAL_SCIENCES_MIN_GRADE && learnerGrade <= SOCIAL_SCIENCES_MAX_GRADE);
  const showNst =
    !gradeKnown || (learnerGrade >= NST_MIN_GRADE && learnerGrade <= NST_MAX_GRADE);
  const showMatricPhysSci = !gradeKnown || learnerGrade === 12;
  const showMathsLiteracy =
    !gradeKnown ||
    (learnerGrade >= MATHS_LITERACY_MIN_GRADE && learnerGrade <= MATHS_LITERACY_MAX_GRADE);
  // Life Sciences is a FET subject (Gr 10–12 only). Free for all plans.
  const showLifeSciences = !gradeKnown || (learnerGrade >= 10 && learnerGrade <= 12);
  // History is a FET subject (Gr 10–12 only). Free for all plans.
  const showHistory = !gradeKnown || (learnerGrade >= 10 && learnerGrade <= 12);
  // Business Studies is a FET subject (Gr 10–12 only). Free for all plans.
  const showBusinessStudies = !gradeKnown || (learnerGrade >= 10 && learnerGrade <= 12);

  const mathsLiteracyMastered = mathsLiteracyProfile
    ? Object.values(mathsLiteracyProfile.skill_mastery ?? {}).filter(
        (m) => m.status === "mastered"
      ).length
    : 0;
  const mathsLiteracyBadge = loading
    ? "..."
    : mathsLiteracyMastered > 0
    ? `${mathsLiteracyMastered} mastered`
    : "Not started";

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
    if (showMatricPhysSci) {
      all.push({
        id: "matric-phys-sci",
        thumbnail: "/thumbnails/physical-science.jpeg",
        label: "Physical Sciences",
        caption: "Grade 12 NSC · 42 skills across P1 Physics and P2 Chemistry",
        badge: "Matric",
        badgeColor: "bg-rose-100 text-rose-700",
        accentFrom: "from-rose-500",
        accentTo: "to-amber-500",
        navigateTo: "matric-phys-sci",
      });
    }
    if (showMathsLiteracy) {
      all.push({
        id: "maths-literacy",
        thumbnail: "/thumbnails/maths-literacy.jpeg",
        label: "Maths Literacy",
        caption: `Applied maths for Grades ${MATHS_LITERACY_MIN_GRADE}–${MATHS_LITERACY_MAX_GRADE} · 85 skills across 10 levels`,
        badge: mathsLiteracyBadge,
        badgeColor: mathsLiteracyMastered > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600",
        accentFrom: "from-indigo-500",
        accentTo: "to-blue-600",
        navigateTo: "maths-literacy",
      });
    }
    if (showLifeSciences) {
      all.push({
        id: "life-sciences",
        thumbnail: "/thumbnails/life-sciences.jpeg",
        label: "Life Sciences",
        caption: "Cells, life processes, ecology and diversity · Grades 10–12 · 70 topics",
        badge: "FET",
        badgeColor: "bg-emerald-100 text-emerald-700",
        accentFrom: "from-emerald-500",
        accentTo: "to-green-600",
        navigateTo: "life-sciences",
      });
    }
    if (showHistory) {
      all.push({
        id: "history",
        thumbnail: "/thumbnails/history.jpeg",
        label: "History",
        caption: "Precolonial African empires, source-work and argument-building · Grades 10–12",
        badge: "FET",
        badgeColor: "bg-amber-100 text-amber-700",
        accentFrom: "from-amber-500",
        accentTo: "to-orange-600",
        navigateTo: "history",
      });
    }
    if (showBusinessStudies) {
      all.push({
        id: "business-studies",
        thumbnail: "/thumbnails/business-studies.jpeg",
        label: "Business Studies",
        caption: "Business environments, ventures, roles and operations · Grades 10–12",
        badge: "FET",
        badgeColor: "bg-sky-100 text-sky-700",
        accentFrom: "from-sky-500",
        accentTo: "to-blue-600",
        navigateTo: "business-studies",
      });
    }
    return all;
  }, [
    discoverBadge, discoverBadgeColor,
    mathsBadge, mathsBadgeColor,
    readingBadge, readingBadgeColor,
    showLifeSkills, showAfrikaans, showSocialSciences, showNst, showMatricPhysSci,
    showMathsLiteracy, mathsLiteracyBadge, mathsLiteracyMastered,
    showLifeSciences,
    showHistory,
    showBusinessStudies,
  ]);

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
  const startMathsLiteracyReplay = (skillId: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem("ruby_maths_literacy_replay_skill", skillId);
    onNavigate("maths-literacy");
  };
  const continueMathsLiteracy = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("ruby_maths_literacy_replay_skill");
    onNavigate("maths-literacy");
  };

  function renderSubjectPanel(subject: SubjectMeta) {
    switch (subject.id) {
      case "discover":
        return (
          <div className="p-5 flex flex-col items-center text-center gap-3">
            <div className="text-3xl">🧭</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Discovery places you on the right starting rung of the Maths and Reading skill trees.
            </p>
            <button
              onClick={() => onNavigate("discover")}
              className="px-4 py-2 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white font-semibold text-sm transition-colors shadow-sm"
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
            compact
          />
        );
      case "english":
        return (
          <ReadingSkillTreeView
            profile={readingProfile}
            onReplaySkill={startReadingReplay}
            onContinue={continueReading}
            compact
          />
        );
      case "life-skills":
        return <LifeSkillsSkillTreeView onPickTopic={() => onNavigate("life-skills")} compact />;
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
      case "matric-phys-sci":
        return <MatricPhysSciSkillTreeView onPickSkill={() => onNavigate("matric-phys-sci")} compact />;
      case "maths-literacy":
        return (
          <MathsLiteracySkillTreeView
            profile={mathsLiteracyProfile}
            onReplaySkill={startMathsLiteracyReplay}
            onContinue={continueMathsLiteracy}
            compact
          />
        );
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

          {/* One grid: each subject = one row of [card | tree]. CSS Grid
              auto-stretches the card to match its row's tree height. */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 gap-y-3">
            {subjects.map((s) => (
              <Fragment key={s.id}>
                <SubjectRow subject={s} />
                <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  {renderSubjectPanel(s)}
                </section>
              </Fragment>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
