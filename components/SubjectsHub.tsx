"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase, getStudentProfile } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase, getReadingProfile } from "@/lib/reading-student-model";
import { getMathsLiteracyProfile } from "@/lib/maths-literacy-student-model";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import EditSubjectsModal from "@/components/onboarding/EditSubjectsModal";
import {
  HUB_ID_TO_FET_KEY,
  isFetGrade,
  readCachedSubjects,
  writeCachedSubjects,
  SUBJECTS_UPDATED_EVENT,
  type FetSubjectKey,
} from "@/lib/fet-subjects";
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
import Button from "@/components/ui/Button";
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
  loadEconomicsProfile,
  hydrateEconomicsProfileFromSupabase,
} from "@/lib/economics-student-model";
import {
  loadTechnologySpProfile,
  hydrateTechnologySpProfileFromSupabase,
} from "@/lib/technology-sp-student-model";
import {
  loadLifeOrientationSpProfile,
  hydrateLifeOrientationSpProfileFromSupabase,
} from "@/lib/life-orientation-sp-student-model";
import {
  loadCreativeArtsSpProfile,
  hydrateCreativeArtsSpProfileFromSupabase,
} from "@/lib/creative-arts-sp-student-model";
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
import type { EconomicsStudentProfile } from "@/types/economics";
import type { TechnologySpStudentProfile } from "@/types/technology-sp";
import type { LifeOrientationSpStudentProfile } from "@/types/life-orientation-sp";
import type { CreativeArtsSpStudentProfile } from "@/types/creative-arts-sp";

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
const EconomicsSkillTreeView = dynamic(() => import("@/components/economics/EconomicsSkillTreeView"), { ssr: false });
const TechnologySpSkillTreeView = dynamic(() => import("@/components/technology-sp/TechnologySpSkillTreeView"), { ssr: false });
const LifeOrientationSpSkillTreeView = dynamic(() => import("@/components/life-orientation-sp/LifeOrientationSpSkillTreeView"), { ssr: false });
const CreativeArtsSpSkillTreeView = dynamic(() => import("@/components/creative-arts-sp/CreativeArtsSpSkillTreeView"), { ssr: false });

type SubjectId =
  | "discover"
  | "maths"
  | "english"
  | "life-skills"
  | "afrikaans"
  | "social-sciences"
  | "nst"
  | "matric-phys-sci"
  | "grade-10-phys-sci"
  | "grade-11-phys-sci"
  | "maths-literacy"
  | "life-sciences"
  | "history"
  | "business-studies"
  | "tourism"
  | "geography"
  | "natural-sciences-sp"
  | "social-sciences-sp"
  | "ems-sp"
  | "accounting"
  | "economics"
  | "technology-sp"
  | "life-orientation-sp"
  | "creative-arts-sp";

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
  // Subjects hub navigation: null = the standalone subject-card grid; a subject
  // id = that card tapped open, showing its condensed tree until the learner
  // taps "Open full tree" to go to the subject's own page.
  const [expandedId, setExpandedId] = useState<SubjectId | null>(null);
  const [businessStudiesProfile, setBusinessStudiesProfile] = useState<BusinessStudiesStudentProfile | null>(() => loadBusinessStudiesProfile());
  const [lifeSciencesProfile, setLifeSciencesProfile] = useState<LifeSciencesStudentProfile | null>(() => loadLifeSciencesProfile());
  const [historyProfile, setHistoryProfile] = useState<HistoryStudentProfile | null>(() => loadHistoryProfile());
  const [tourismProfile, setTourismProfile] = useState<TourismStudentProfile | null>(() => loadTourismProfile());
  const [geographyProfile, setGeographyProfile] = useState<GeographyStudentProfile | null>(() => loadGeographyProfile());
  const [naturalSciencesSpProfile, setNaturalSciencesSpProfile] = useState<NaturalSciencesSpStudentProfile | null>(() => loadNaturalSciencesSpProfile());
  const [socialSciencesSpProfile, setSocialSciencesSpProfile] = useState<SocialSciencesSpStudentProfile | null>(() => loadSocialSciencesSpProfile());
  const [emsSpProfile, setEmsSpProfile] = useState<EmsSpStudentProfile | null>(() => loadEmsSpProfile());
  const [accountingProfile, setAccountingProfile] = useState<AccountingStudentProfile | null>(() => loadAccountingProfile());
  const [economicsProfile, setEconomicsProfile] = useState<EconomicsStudentProfile | null>(() => loadEconomicsProfile());
  const [technologySpProfile, setTechnologySpProfile] = useState<TechnologySpStudentProfile | null>(() => loadTechnologySpProfile());
  const [lifeOrientationSpProfile, setLifeOrientationSpProfile] = useState<LifeOrientationSpStudentProfile | null>(() => loadLifeOrientationSpProfile());
  const [creativeArtsSpProfile, setCreativeArtsSpProfile] = useState<CreativeArtsSpStudentProfile | null>(() => loadCreativeArtsSpProfile());
  const [afrikaansProfile, setAfrikaansProfile] = useState<AfrikaansStudentProfile | null>(() => loadAfrikaansProfile());
  const [grade, setGrade] = useState<number | null>(() => readCachedGrade());
  // null = no saved selection → FET learners are gated into picking (see below).
  // Only ever filters Gr 10–12.
  const [selectedSubjects, setSelectedSubjects] = useState<FetSubjectKey[] | null>(() => readCachedSubjects());
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
      if (auth) {
        setSelectedSubjects(auth.subjects);
        writeCachedSubjects(auth.subjects);
      }
      setLoading(false);
    }).catch(() => setLoading(false)); // never strand the hub on a loading skeleton
  }, []);

  // Reflect edits made via the "My subjects" editor without a full reload.
  useEffect(() => {
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent<FetSubjectKey[] | null>).detail;
      setSelectedSubjects(detail && detail.length ? detail : null);
    };
    window.addEventListener(SUBJECTS_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(SUBJECTS_UPDATED_EVENT, onUpdated);
  }, []);

  // Background refresh for the FET content-subject profiles (already seeded from
  // the local copy above). Only overwrite when Supabase returns a newer mirror.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [bs, ls, hi, to, ge, ns, ss, em, ac, ec, ts, lo, ca, af] = await Promise.all([
        hydrateBusinessStudiesProfileFromSupabase(),
        hydrateLifeSciencesProfileFromSupabase(),
        hydrateHistoryProfileFromSupabase(),
        hydrateTourismProfileFromSupabase(),
        hydrateGeographyProfileFromSupabase(),
        hydrateNaturalSciencesSpProfileFromSupabase(),
        hydrateSocialSciencesSpProfileFromSupabase(),
        hydrateEmsSpProfileFromSupabase(),
        hydrateAccountingProfileFromSupabase(),
        hydrateEconomicsProfileFromSupabase(),
        hydrateTechnologySpProfileFromSupabase(),
        hydrateLifeOrientationSpProfileFromSupabase(),
        hydrateCreativeArtsSpProfileFromSupabase(),
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
      if (ec) setEconomicsProfile(ec);
      if (ts) setTechnologySpProfile(ts);
      if (lo) setLifeOrientationSpProfile(lo);
      if (ca) setCreativeArtsSpProfile(ca);
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
  //
  // (b) Subject-VISIBILITY grade: prefer the authoritative server grade, but fall
  // back to the grade in the learner's local profile so legacy/grade-less accounts
  // still get a filtered list instead of dumping every subject. This grade is
  // self-entered on the device, so it's used ONLY to decide which cards show —
  // Matric/Phys-Sci visibility below stays on the authoritative server grade so a
  // local grade can never surface paid Matric content (access is plan-gated too).
  const authGrade = grade;
  const authGradeKnown = authGrade !== null;
  const localProfileGrade = mathsProfile?.grade ?? readingProfile?.grade ?? null;
  const visGrade = grade ?? localProfileGrade;
  const gradeKnown = visGrade !== null;
  const learnerGrade = visGrade ?? 0;
  const showLifeSkills = !gradeKnown || learnerGrade <= LIFE_SKILLS_MAX_GRADE;
  const showAfrikaans = !gradeKnown || learnerGrade <= AFRIKAANS_MAX_GRADE;
  const showSocialSciences =
    !gradeKnown ||
    (learnerGrade >= SOCIAL_SCIENCES_MIN_GRADE && learnerGrade <= SOCIAL_SCIENCES_MAX_GRADE);
  const showNst =
    !gradeKnown || (learnerGrade >= NST_MIN_GRADE && learnerGrade <= NST_MAX_GRADE);
  // Physical Sciences is one subject with grade-specific trees (10 / 11 / 12).
  // Pick exactly ONE card by the authoritative server grade so it can never render
  // more than once (a null grade used to make all three appear). When the grade
  // isn't known yet we fall back to a single Matric card rather than three. Stays
  // on the server grade (not the local fallback) so a self-set device grade can't
  // surface paid Matric content.
  const physSciCardId: "matric-phys-sci" | "grade-10-phys-sci" | "grade-11-phys-sci" | null =
    authGrade === 10 ? "grade-10-phys-sci"
    : authGrade === 11 ? "grade-11-phys-sci"
    : authGrade === 12 ? "matric-phys-sci"
    : !authGradeKnown ? "matric-phys-sci"
    : null;
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
  // Economics is a FET subject (Gr 10–12 only). Free for all plans.
  const showEconomics = !gradeKnown || (learnerGrade >= 10 && learnerGrade <= 12);
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
  // Technology is a Senior-Phase subject (Gr 7–9 only). Free for all plans.
  const showTechnologySp = !gradeKnown || (learnerGrade >= 7 && learnerGrade <= 9);
  // Life Orientation is a Senior-Phase subject (Gr 7–9 only). Free for all plans.
  const showLifeOrientationSp = !gradeKnown || (learnerGrade >= 7 && learnerGrade <= 9);
  // Creative Arts (Music + Visual Arts) is a Senior-Phase subject (Gr 7–9 only). Free for all plans.
  const showCreativeArtsSp = !gradeKnown || (learnerGrade >= 7 && learnerGrade <= 9);

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
        thumbnail: "/thumbnails/natural-sciences-sp.webp",
        label: "Natural Sciences & Technology",
        caption: `Science & Technology for Grades ${NST_MIN_GRADE}–${NST_MAX_GRADE}`,
        badge: "Intermediate Phase",
        badgeColor: "bg-sky-100 text-sky-700",
        accentFrom: "from-green-500",
        accentTo: "to-teal-600",
        navigateTo: "natural-sciences-tech",
      });
    }
    if (physSciCardId === "matric-phys-sci") {
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
    if (physSciCardId === "grade-10-phys-sci") {
      all.push({
        id: "grade-10-phys-sci",
        thumbnail: "/thumbnails/physical-science.webp",
        label: "Physical Sciences",
        caption: "Grade 10 · 27 skills across P1 Physics and P2 Chemistry",
        badge: "Grade 10",
        badgeColor: "bg-rose-100 text-rose-700",
        accentFrom: "from-rose-500",
        accentTo: "to-amber-500",
        navigateTo: "grade-10-phys-sci",
      });
    }
    if (physSciCardId === "grade-11-phys-sci") {
      all.push({
        id: "grade-11-phys-sci",
        thumbnail: "/thumbnails/physical-science.webp",
        label: "Physical Sciences",
        caption: "Grade 11 · 24 skills across P1 Physics and P2 Chemistry",
        badge: "Grade 11",
        badgeColor: "bg-rose-100 text-rose-700",
        accentFrom: "from-rose-500",
        accentTo: "to-amber-500",
        navigateTo: "grade-11-phys-sci",
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
    if (showEconomics) {
      all.push({
        id: "economics",
        thumbnail: "/thumbnails/economics.webp",
        label: "Economics",
        caption: "Markets, the circular flow, growth, money, inflation & trade · Grades 10–12",
        badge: "FET",
        badgeColor: "bg-indigo-100 text-indigo-700",
        accentFrom: "from-indigo-500",
        accentTo: "to-blue-600",
        navigateTo: "economics",
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
    if (showTechnologySp) {
      all.push({
        id: "technology-sp",
        thumbnail: "/thumbnails/technology-sp.webp",
        label: "Technology",
        caption: "Structures, machines, electronics & making · Grades 7–9",
        badge: "Senior Phase",
        badgeColor: "bg-slate-100 text-slate-700",
        accentFrom: "from-slate-500",
        accentTo: "to-zinc-600",
        navigateTo: "technology-sp",
      });
    }
    if (showLifeOrientationSp) {
      all.push({
        id: "life-orientation-sp",
        thumbnail: "/thumbnails/life-orientation-sp.webp",
        placeholderEmoji: "🧭",
        label: "Life Orientation",
        caption: "Self, health, rights & the world of work · Grades 7–9",
        badge: "Senior Phase",
        badgeColor: "bg-lime-100 text-lime-700",
        accentFrom: "from-lime-500",
        accentTo: "to-green-600",
        navigateTo: "life-orientation-sp",
      });
    }
    if (showCreativeArtsSp) {
      all.push({
        id: "creative-arts-sp",
        thumbnail: "/thumbnails/creative-arts-sp.webp",
        placeholderEmoji: "🎨",
        label: "Creative Arts",
        caption: "Music & Visual Arts · Grades 7–9",
        badge: "Senior Phase",
        badgeColor: "bg-pink-100 text-pink-700",
        accentFrom: "from-pink-500",
        accentTo: "to-rose-600",
        navigateTo: "creative-arts-sp",
      });
    }
    // FET learners (Gr 10–12) who saved a subject selection during onboarding
    // see only the subjects they picked. Cards with no FET picker key (Discover)
    // always remain. Grades 1–9 and any account with no saved selection fail
    // open — every grade-entitled subject shows, exactly as before.
    const fetFiltered = isFetGrade(grade) && selectedSubjects
      ? all.filter((s) => {
          const key = HUB_ID_TO_FET_KEY[s.id];
          return !key || selectedSubjects.includes(key);
        })
      : all;
    // "Discover" is the placement entry point, not a curriculum subject, so it
    // stays pinned at the top. Every real subject is then ordered alphabetically
    // by label — the same order for every grade.
    const pinned = fetFiltered.filter((s) => s.id === "discover");
    const rest = fetFiltered
      .filter((s) => s.id !== "discover")
      .sort((a, b) => a.label.localeCompare(b.label));
    return [...pinned, ...rest];
  }, [
    grade, selectedSubjects,
    discoverBadge, discoverBadgeColor,
    mathsBadge, mathsBadgeColor,
    readingBadge, readingBadgeColor,
    showLifeSkills, showAfrikaans, showSocialSciences, showNst, physSciCardId,
    showMathsLiteracy, mathsLiteracyBadge, mathsLiteracyMastered,
    showLifeSciences,
    showHistory,
    showBusinessStudies,
    showAccounting,
    showEconomics,
    showTourism,
    showGeography,
    showNaturalSciencesSp,
    showSocialSciencesSp,
    showEmsSp,
    showTechnologySp,
    showLifeOrientationSp,
    showCreativeArtsSp,
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
      case "grade-10-phys-sci":
        return <MatricPhysSciSkillTreeView grade={10} onPickSkill={() => onNavigate("grade-10-phys-sci")} compact />;
      case "grade-11-phys-sci":
        return <MatricPhysSciSkillTreeView grade={11} onPickSkill={() => onNavigate("grade-11-phys-sci")} compact />;
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
      case "economics":
        return (
          <EconomicsSkillTreeView
            onPickSkill={startContentSkill("economics", "ruby_economics_target_skill")}
            profile={economicsProfile}
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
      case "technology-sp":
        return (
          <TechnologySpSkillTreeView
            onPickSkill={startContentSkill("technology-sp", "ruby_technology_sp_target_skill")}
            profile={technologySpProfile}
            compact
          />
        );
      case "life-orientation-sp":
        return (
          <LifeOrientationSpSkillTreeView
            onPickSkill={startContentSkill("life-orientation-sp", "ruby_life_orientation_sp_target_skill")}
            profile={lifeOrientationSpProfile}
            compact
          />
        );
      case "creative-arts-sp":
        return (
          <CreativeArtsSpSkillTreeView
            onPickSkill={startContentSkill("creative-arts-sp", "ruby_creative_arts_sp_target_skill")}
            profile={creativeArtsSpProfile}
            compact
          />
        );
      default:
        return null;
    }
  }

  // FET learners (Gr 10–12) with no saved subject selection are gated into
  // picking before the hub opens. While the grade / saved subjects are still
  // resolving we wait (skeleton) rather than flashing the wrong content or the
  // gate prematurely. Grades 1–9 and learners with a saved selection skip both.
  const needsSubjectChoice = isFetGrade(grade) && !selectedSubjects;
  const waitingForGrade = loading && (!gradeKnown || needsSubjectChoice);
  // The card tapped open (if any). Falls back to the grid when the id no longer
  // matches a subject the learner takes (e.g. after a grade/subject change).
  const expandedSubject = expandedId ? subjects.find((s) => s.id === expandedId) ?? null : null;

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">

          <div className="mb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t("subjects.title")}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{t("subjects.subtitle")}</p>
          </div>

          {waitingForGrade ? (
            /* Until the learner's grade (and saved subjects) resolve, show a
               skeleton rather than the fail-open "every subject" list — which
               would otherwise flash the wrong grades + a duplicated Physical
               Sciences before settling. */
            <div className="max-w-4xl mx-auto space-y-6" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-gray-200/60 animate-pulse" />
              ))}
            </div>
          ) : needsSubjectChoice ? (
            /* FET learners (Gr 10–12) must pick their subjects before the hub
               opens, so it only ever shows the subjects they actually take. The
               picker appears as a non-dismissible popup (like the in-app
               tutorial) over a soft skeleton — not as a card on the page. On
               save it fires SUBJECTS_UPDATED_EVENT, which clears this gate. */
            <>
              <div className="max-w-4xl mx-auto space-y-6" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-gray-200/60 animate-pulse" />
                ))}
              </div>
              <EditSubjectsModal
                initial={selectedSubjects}
                dismissible={false}
                onClose={() => { /* closes itself once the save fires SUBJECTS_UPDATED_EVENT */ }}
              />
            </>
          ) : expandedSubject ? (
            /* A card tapped open: its condensed tree (SkillTreeShell hub mode),
               with a way back to the grid and a button into the subject's own
               full-tree page. The thumbnail / emoji / accent are handed to the
               tree via HubTreeContext, exactly as before. */
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between gap-3 mb-4">
                <Button variant="ghost" size="sm" onClick={() => setExpandedId(null)}>
                  ← All subjects
                </Button>
                {expandedSubject.id !== "discover" && (
                  <Button variant="primary" size="sm" onClick={() => onNavigate(expandedSubject.navigateTo)}>
                    Open full tree →
                  </Button>
                )}
              </div>
              <HubTreeContext.Provider
                value={{ inHub: true, thumbnail: expandedSubject.thumbnail, emoji: expandedSubject.placeholderEmoji, label: expandedSubject.label, accentFrom: expandedSubject.accentFrom, accentTo: expandedSubject.accentTo }}
              >
                <section className="min-w-0">
                  <LazyMount eager>{renderSubjectPanel(expandedSubject)}</LazyMount>
                </section>
              </HubTreeContext.Provider>
            </div>
          ) : (
            /* Standalone subject cards. Tapping one opens its condensed tree
               above (the "expandedSubject" branch). */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setExpandedId(s.id)}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition-all text-left overflow-hidden flex flex-col"
                >
                  <div className={`relative aspect-square bg-gradient-to-br ${s.accentFrom} ${s.accentTo} flex items-center justify-center`}>
                    {s.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.thumbnail} alt={s.label} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl" aria-hidden>{s.placeholderEmoji ?? "📚"}</span>
                    )}
                    {s.badge && (
                      <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badgeColor ?? "bg-white/90 text-gray-700"}`}>
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-0.5">
                    <p className="font-bold text-gray-900 text-sm leading-tight">{s.label}</p>
                    <p className="text-gray-500 text-xs leading-snug line-clamp-2">{s.caption}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
