"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
import { HubTreeContext } from "@/components/shared/SkillTreeShell";
import { useT } from "@/lib/i18n";
import {
  loadBusinessStudiesProfile,
  hydrateBusinessStudiesProfileFromSupabase,
} from "@/lib/business-studies-student-model";
import {
  loadLifeSciencesProfile,
  hydrateLifeSciencesProfileFromSupabase,
} from "@/lib/life-sciences-student-model";
import {
  loadHistoryProfile,
  hydrateHistoryProfileFromSupabase,
} from "@/lib/history-student-model";
import {
  loadTourismProfile,
  hydrateTourismProfileFromSupabase,
} from "@/lib/tourism-student-model";
import {
  loadGeographyProfile,
  hydrateGeographyProfileFromSupabase,
} from "@/lib/geography-student-model";
import {
  loadNaturalSciencesSpProfile,
  hydrateNaturalSciencesSpProfileFromSupabase,
} from "@/lib/natural-sciences-sp-student-model";
import {
  loadSocialSciencesSpProfile,
  hydrateSocialSciencesSpProfileFromSupabase,
} from "@/lib/social-sciences-sp-student-model";
import {
  loadEmsSpProfile,
  hydrateEmsSpProfileFromSupabase,
} from "@/lib/ems-sp-student-model";
import {
  loadAccountingProfile,
  hydrateAccountingProfileFromSupabase,
} from "@/lib/accounting-student-model";
import {
  loadAfrikaansProfile,
  hydrateAfrikaansProfileFromSupabase,
} from "@/lib/afrikaans-student-model";
import type { AfrikaansStudentProfile } from "@/types/afrikaans";
import type { BusinessStudiesStudentProfile } from "@/types/business-studies";
import type { LifeSciencesStudentProfile } from "@/types/life-sciences";
import type { HistoryStudentProfile } from "@/types/history";
import type { TourismStudentProfile } from "@/types/tourism";
import type { GeographyStudentProfile } from "@/types/geography";
import type { NaturalSciencesSpStudentProfile } from "@/types/natural-sciences-sp";
import type { SocialSciencesSpStudentProfile } from "@/types/social-sciences-sp";
import type { EmsSpStudentProfile } from "@/types/ems-sp";
import type { AccountingStudentProfile } from "@/types/accounting";

const SkillTreeView           = dynamic(() => import("@/components/ruby/SkillTreeView"),                       { ssr: false });
const ReadingSkillTreeView    = dynamic(() => import("@/components/reading/ReadingSkillTreeView"),             { ssr: false });
const LifeSkillsSkillTreeView = dynamic(() => import("@/components/life-skills/LifeSkillsSkillTreeView"),     { ssr: false });
const AfrikaansSkillTreeView  = dynamic(() => import("@/components/afrikaans/AfrikaansSkillTreeView"),         { ssr: false });
const SocialSciencesSkillTreeView = dynamic(() => import("@/components/social-sciences/SocialSciencesSkillTreeView"), { ssr: false });
const NstSkillTreeView        = dynamic(() => import("@/components/nst/NstSkillTreeView"),                     { ssr: false });
const MatricPhysSciSkillTreeView = dynamic(() => import("@/components/matric-phys-sci/MatricPhysSciSkillTreeView"), { ssr: false });
const MathsLiteracySkillTreeView = dynamic(() => import("@/components/maths-literacy/MathsLiteracySkillTreeView"), { ssr: false });
const LifeSciencesSkillTreeView    = dynamic(() => import("@/components/life-sciences/LifeSciencesSkillTreeView"),       { ssr: false });
const HistorySkillTreeView         = dynamic(() => import("@/components/history/HistorySkillTreeView"),                 { ssr: false });
const BusinessStudiesSkillTreeView = dynamic(() => import("@/components/business-studies/BusinessStudiesSkillTreeView"), { ssr: false });
const TourismSkillTreeView         = dynamic(() => import("@/components/tourism/TourismSkillTreeView"),                 { ssr: false });
const GeographySkillTreeView       = dynamic(() => import("@/components/geography/GeographySkillTreeView"),             { ssr: false });
const NaturalSciencesSpSkillTreeView = dynamic(() => import("@/components/natural-sciences-sp/NaturalSciencesSpSkillTreeView"), { ssr: false });
const SocialSciencesSpSkillTreeView = dynamic(() => import("@/components/social-sciences-sp/SocialSciencesSpSkillTreeView"), { ssr: false });
const EmsSpSkillTreeView = dynamic(() => import("@/components/ems-sp/EmsSpSkillTreeView"), { ssr: false });
const AccountingSkillTreeView = dynamic(() => import("@/components/accounting/AccountingSkillTreeView"), { ssr: false });

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
  | "business-studies"
  | "tourism"
  | "geography"
  | "natural-sciences-sp"
  | "social-sciences-sp"
  | "ems-sp"
  | "accounting";

interface SubjectsHubProps {
  onNavigate: (view: ActiveView) => void;
}

// The learner's authorised grade is only fetchable over the network, so the
// first hub paint would otherwise show all 13 subjects, then reflow down to the
// entitled subset once Supabase answers. Caching the last-known grade lets us
// seed the correct subset synchronously on subsequent visits — no reflow.
const GRADE_CACHE_KEY = "ruby_authorised_grade";
function readCachedGrade(): number | null {
  if (typeof window === "undefined") return null;
  const n = parseInt(window.localStorage.getItem(GRADE_CACHE_KEY) ?? "", 10);
  return !isNaN(n) && n >= 1 && n <= 12 ? n : null;
}

// Defers mounting a subject's (heavy) skill tree until it nears the viewport, so
// opening the Subjects tab paints instantly instead of mounting every tree (and
// its curriculum data) at once. The first couple render eagerly (above the fold).
function LazyMount({
  children,
  eager = false,
  minHeight = 300,
}: {
  children: ReactNode;
  eager?: boolean;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(eager);
  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);
  return (
    <div ref={ref} style={shown ? undefined : { minHeight }}>
      {shown ? children : null}
    </div>
  );
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

export default function SubjectsHub({ onNavigate }: SubjectsHubProps) {
  const { t } = useT();
  // Every profile and the grade are seeded synchronously from the local cache so
  // the trees paint with the learner's real progress (and the right subject
  // subset) on the very first frame. Supabase then refreshes them in the
  // background below — without blocking the initial render.
  const [mathsProfile, setMathsProfile] = useState<StudentProfile | null>(() => getStudentProfile());
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(() => getReadingProfile());
  const [mathsLiteracyProfile, setMathsLiteracyProfile] = useState<MathsLiteracyStudentProfile | null>(() => getMathsLiteracyProfile());
  const [businessStudiesProfile, setBusinessStudiesProfile] = useState<BusinessStudiesStudentProfile | null>(() => loadBusinessStudiesProfile());
  const [lifeSciencesProfile, setLifeSciencesProfile] = useState<LifeSciencesStudentProfile | null>(() => loadLifeSciencesProfile());
  const [historyProfile, setHistoryProfile] = useState<HistoryStudentProfile | null>(() => loadHistoryProfile());
  const [tourismProfile, setTourismProfile] = useState<TourismStudentProfile | null>(() => loadTourismProfile());
  const [geographyProfile, setGeographyProfile] = useState<GeographyStudentProfile | null>(() => loadGeographyProfile());
  const [naturalSciencesSpProfile, setNaturalSciencesSpProfile] = useState<NaturalSciencesSpStudentProfile | null>(() => loadNaturalSciencesSpProfile());
  const [socialSciencesSpProfile, setSocialSciencesSpProfile] = useState<SocialSciencesSpStudentProfile | null>(() => loadSocialSciencesSpProfile());
  const [emsSpProfile, setEmsSpProfile] = useState<EmsSpStudentProfile | null>(() => loadEmsSpProfile());
  const [accountingProfile, setAccountingProfile] = useState<AccountingStudentProfile | null>(() => loadAccountingProfile());
  const [afrikaansProfile, setAfrikaansProfile] = useState<AfrikaansStudentProfile | null>(() => loadAfrikaansProfile());
  const [grade, setGrade] = useState<number | null>(() => readCachedGrade());
  const [loading, setLoading] = useState(true);

  // Background refresh: pull the authoritative profiles + grade from Supabase
  // and update state (and the grade cache) once they arrive. The page is already
  // interactive from the local seed, so this never blocks first paint.
  useEffect(() => {
    Promise.all([
      hydrateStudentProfileFromSupabase(),
      hydrateReadingProfileFromSupabase(),
      fetchAuthorisedGrade(),
    ]).then(([mp, rp, auth]) => {
      if (mp) setMathsProfile(mp);
      if (rp) setReadingProfile(rp as ReadingStudentProfile);
      setMathsLiteracyProfile(getMathsLiteracyProfile());
      if (auth?.grade != null) {
        setGrade(auth.grade);
        try { window.localStorage.setItem(GRADE_CACHE_KEY, String(auth.grade)); } catch { /* quota / private mode */ }
      }
      setLoading(false);
    });
  }, []);

  // Background refresh for the FET content-subject profiles (already seeded from
  // the local copy above). Only overwrite when Supabase returns a newer mirror.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [bs, ls, hi, to, ge, ns, ss, em, ac, af] = await Promise.all([
        hydrateBusinessStudiesProfileFromSupabase(),
        hydrateLifeSciencesProfileFromSupabase(),
        hydrateHistoryProfileFromSupabase(),
        hydrateTourismProfileFromSupabase(),
        hydrateGeographyProfileFromSupabase(),
        hydrateNaturalSciencesSpProfileFromSupabase(),
        hydrateSocialSciencesSpProfileFromSupabase(),
        hydrateEmsSpProfileFromSupabase(),
        hydrateAccountingProfileFromSupabase(),
        hydrateAfrikaansProfileFromSupabase(),
      ]);
      if (cancelled) return;
      if (bs) setBusinessStudiesProfile(bs);
      if (ls) setLifeSciencesProfile(ls);
      if (hi) setHistoryProfile(hi);
      if (to) setTourismProfile(to);
      if (ge) setGeographyProfile(ge);
      if (ns) setNaturalSciencesSpProfile(ns);
      if (ss) setSocialSciencesSpProfile(ss);
      if (em) setEmsSpProfile(em);
      if (ac) setAccountingProfile(ac);
      if (af) setAfrikaansProfile(af);
    })();
    return () => {
      cancelled = true;
    };
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
  // Accounting is a FET subject (Gr 10–12 only). Free for all plans.
  const showAccounting = !gradeKnown || (learnerGrade >= 10 && learnerGrade <= 12);
  // Tourism is a FET subject (Gr 10–12 only). Free for all plans.
  const showTourism = !gradeKnown || (learnerGrade >= 10 && learnerGrade <= 12);
  // Geography is a FET subject (Gr 10–12 only). Free for all plans.
  const showGeography = !gradeKnown || (learnerGrade >= 10 && learnerGrade <= 12);
  // Natural Sciences is a Senior-Phase subject (Gr 7–9 only). Free for all plans.
  const showNaturalSciencesSp = !gradeKnown || (learnerGrade >= 7 && learnerGrade <= 9);
  // Social Sciences (History + Geography) is a Senior-Phase subject (Gr 7–9 only). Free for all plans.
  const showSocialSciencesSp = !gradeKnown || (learnerGrade >= 7 && learnerGrade <= 9);
  // EMS (Economic & Management Sciences) is a Senior-Phase subject (Gr 7–9 only). Free for all plans.
  const showEmsSp = !gradeKnown || (learnerGrade >= 7 && learnerGrade <= 9);

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
        thumbnail: "/thumbnails/discover.webp",
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
        thumbnail: "/thumbnails/mathematics.webp",
        label: "Mathematics",
        caption: "Personalised lessons that adapt to your level",
        badge: mathsBadge,
        badgeColor: mathsBadgeColor,
        accentFrom: "from-blue-600",
        accentTo: "to-blue-700",
        navigateTo: "ruby",
      },
      {
        id: "english",
        thumbnail: "/thumbnails/english.webp",
        label: "English",
        caption: "Reading, comprehension and writing — adapts to your level",
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
        thumbnail: "/thumbnails/life-skills.webp",
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
        thumbnail: "/thumbnails/afrikaans-fal.webp",
        label: "Afrikaans",
        caption: `First Additional Language · listen, choose and learn (Grades 1–${AFRIKAANS_MAX_GRADE})`,
        accentFrom: "from-emerald-500",
        accentTo: "to-teal-600",
        navigateTo: "afrikaans-fal",
      });
    }
    if (showSocialSciences) {
      all.push({
        id: "social-sciences",
        thumbnail: "/thumbnails/social-sciences.webp",
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
        thumbnail: "/thumbnails/natural-sciences-tech.webp",
        label: "Natural Sciences & Technology",
        caption: `Science & Technology for Grades ${NST_MIN_GRADE}–${NST_MAX_GRADE}`,
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
        thumbnail: "/thumbnails/physical-science.webp",
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
        thumbnail: "/thumbnails/maths-literacy.webp",
        label: "Mathematical Literacy",
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
        thumbnail: "/thumbnails/life-sciences.webp",
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
        thumbnail: "/thumbnails/history.webp",
        label: "History",
        caption: "Precolonial African empires, source-work and argument-building · Grades 10–12",
        badge: "FET",
        badgeColor: "bg-amber-100 text-amber-700",
        accentFrom: "from-amber-500",
        accentTo: "to-orange-600",
        navigateTo: "history",
      });
    }
    if (showAccounting) {
      all.push({
        id: "accounting",
        thumbnail: "/thumbnails/accounting.webp",
        label: "Accounting",
        caption: "Bookkeeping, financial statements, companies, cost accounting & budgeting · Grades 10–12",
        badge: "FET",
        badgeColor: "bg-emerald-100 text-emerald-700",
        accentFrom: "from-emerald-500",
        accentTo: "to-green-600",
        navigateTo: "accounting",
      });
    }
    if (showBusinessStudies) {
      all.push({
        id: "business-studies",
        thumbnail: "/thumbnails/business-studies.webp",
        label: "Business Studies",
        caption: "Business environments, ventures, roles and operations · Grades 10–12",
        badge: "FET",
        badgeColor: "bg-sky-100 text-sky-700",
        accentFrom: "from-sky-500",
        accentTo: "to-blue-600",
        navigateTo: "business-studies",
      });
    }
    if (showTourism) {
      all.push({
        id: "tourism",
        thumbnail: "/thumbnails/tourism.webp",
        label: "Tourism",
        caption: "Tourist sectors, map work, attractions, sustainability & customer care · Grades 10–12",
        badge: "FET",
        badgeColor: "bg-teal-100 text-teal-700",
        accentFrom: "from-teal-500",
        accentTo: "to-cyan-600",
        navigateTo: "tourism",
      });
    }
    if (showGeography) {
      all.push({
        id: "geography",
        thumbnail: "/thumbnails/geography.webp",
        label: "Geography",
        caption: "Atmosphere, geomorphology, settlement, mapwork · Grades 10–12",
        badge: "FET",
        badgeColor: "bg-cyan-100 text-cyan-700",
        accentFrom: "from-cyan-500",
        accentTo: "to-sky-600",
        navigateTo: "geography",
      });
    }
    if (showNaturalSciencesSp) {
      all.push({
        id: "natural-sciences-sp",
        thumbnail: "/thumbnails/natural-sciences-sp.webp",
        label: "Natural Sciences",
        caption: "Life, matter, energy, planet Earth & beyond · Grades 7–9",
        badge: "Senior Phase",
        badgeColor: "bg-rose-100 text-rose-700",
        accentFrom: "from-rose-500",
        accentTo: "to-pink-600",
        navigateTo: "natural-sciences-sp",
      });
    }
    if (showSocialSciencesSp) {
      all.push({
        id: "social-sciences-sp",
        thumbnail: "/thumbnails/social-sciences-sp.webp",
        label: "Social Sciences",
        caption: "History & Geography · Grades 7–9",
        badge: "Senior Phase",
        badgeColor: "bg-orange-100 text-orange-700",
        accentFrom: "from-orange-500",
        accentTo: "to-amber-600",
        navigateTo: "social-sciences-sp",
      });
    }
    if (showEmsSp) {
      all.push({
        id: "ems-sp",
        thumbnail: "/thumbnails/ems-sp.webp",
        label: "Economic & Management Sciences",
        caption: "The economy, money & business · Grades 7–9",
        badge: "Senior Phase",
        badgeColor: "bg-violet-100 text-violet-700",
        accentFrom: "from-violet-500",
        accentTo: "to-fuchsia-600",
        navigateTo: "ems-sp",
      });
    }
    // "Discover" is the placement entry point, not a curriculum subject, so it
    // stays pinned at the top. Every real subject is then ordered alphabetically
    // by label — the same order for every grade.
    const pinned = all.filter((s) => s.id === "discover");
    const rest = all
      .filter((s) => s.id !== "discover")
      .sort((a, b) => a.label.localeCompare(b.label));
    return [...pinned, ...rest];
  }, [
    discoverBadge, discoverBadgeColor,
    mathsBadge, mathsBadgeColor,
    readingBadge, readingBadgeColor,
    showLifeSkills, showAfrikaans, showSocialSciences, showNst, showMatricPhysSci,
    showMathsLiteracy, mathsLiteracyBadge, mathsLiteracyMastered,
    showLifeSciences,
    showHistory,
    showBusinessStudies,
    showAccounting,
    showTourism,
    showGeography,
    showNaturalSciencesSp,
    showSocialSciencesSp,
    showEmsSp,
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
  // Content subjects (FET + Life Skills / Social Sciences / NST): tapping a
  // topic stashes its id, then that subject's session reads the key on mount
  // and opens straight into the topic's questions — skipping its topic picker.
  const startContentSkill = (view: ActiveView, key: string) => (skillId: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem(key, skillId);
    onNavigate(view);
  };

  function renderSubjectPanel(subject: SubjectMeta) {
    switch (subject.id) {
      case "discover":
        return (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col items-center text-center gap-3">
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
        return (
          <LifeSkillsSkillTreeView
            onPickTopic={startContentSkill("life-skills", "ruby_life-skills_target_skill")}
            compact
          />
        );
      case "afrikaans":
        return (
          <AfrikaansSkillTreeView
            onPickSkill={startAfrikaansSkill}
            profile={afrikaansProfile}
            compact
          />
        );
      case "social-sciences":
        return (
          <SocialSciencesSkillTreeView
            onPickTopic={startContentSkill("social-sciences", "ruby_social-sciences_target_skill")}
            compact
          />
        );
      case "nst":
        return (
          <NstSkillTreeView
            onPickTopic={startContentSkill("natural-sciences-tech", "ruby_nst_target_skill")}
            compact
          />
        );
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
      // FET content subjects: render the real tree inline. Tapping a topic
      // opens straight into that topic's questions (every topic is unlocked).
      case "life-sciences":
        return (
          <LifeSciencesSkillTreeView
            onPickSkill={startContentSkill("life-sciences", "ruby_life-sciences_target_skill")}
            profile={lifeSciencesProfile}
            compact
          />
        );
      case "history":
        return (
          <HistorySkillTreeView
            onPickSkill={startContentSkill("history", "ruby_history_target_skill")}
            profile={historyProfile}
            compact
          />
        );
      case "business-studies":
        return (
          <BusinessStudiesSkillTreeView
            onPickSkill={startContentSkill("business-studies", "ruby_business-studies_target_skill")}
            profile={businessStudiesProfile}
            compact
          />
        );
      case "accounting":
        return (
          <AccountingSkillTreeView
            onPickSkill={startContentSkill("accounting", "ruby_accounting_target_skill")}
            profile={accountingProfile}
            compact
          />
        );
      case "tourism":
        return (
          <TourismSkillTreeView
            onPickSkill={startContentSkill("tourism", "ruby_tourism_target_skill")}
            profile={tourismProfile}
            compact
          />
        );
      case "geography":
        return (
          <GeographySkillTreeView
            onPickSkill={startContentSkill("geography", "ruby_geography_target_skill")}
            profile={geographyProfile}
            compact
          />
        );
      case "natural-sciences-sp":
        return (
          <NaturalSciencesSpSkillTreeView
            onPickSkill={startContentSkill("natural-sciences-sp", "ruby_natural_sciences_sp_target_skill")}
            profile={naturalSciencesSpProfile}
            compact
          />
        );
      case "social-sciences-sp":
        return (
          <SocialSciencesSpSkillTreeView
            onPickSkill={startContentSkill("social-sciences-sp", "ruby_social_sciences_sp_target_skill")}
            profile={socialSciencesSpProfile}
            compact
          />
        );
      case "ems-sp":
        return (
          <EmsSpSkillTreeView
            onPickSkill={startContentSkill("ems-sp", "ruby_ems_sp_target_skill")}
            profile={emsSpProfile}
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

          {/* Each subject renders as a self-contained two-column unit (enlarged
              thumbnail + stat-line on the left, skill-tree card on the right) —
              that whole layout lives in SkillTreeShell's hub mode, so every
              subject's tree looks identical. The thumbnail, emoji fallback and
              subject name are handed down via HubTreeContext. */}
          <div className="max-w-4xl mx-auto space-y-6">
            {subjects.map((s, i) => (
              <HubTreeContext.Provider
                key={s.id}
                value={{ inHub: true, thumbnail: s.thumbnail, emoji: s.placeholderEmoji, label: s.label, accentFrom: s.accentFrom, accentTo: s.accentTo }}
              >
                <section className="min-w-0">
                  <LazyMount eager={i < 2}>{renderSubjectPanel(s)}</LazyMount>
                </section>
              </HubTreeContext.Provider>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
