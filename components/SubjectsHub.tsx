"use client";

import { useEffect, useMemo, useState } from "react";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase, getStudentProfile } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase, getReadingProfile } from "@/lib/reading-student-model";
import { getMathsLiteracyProfile } from "@/lib/maths-literacy-student-model";
import { fetchAuthorisedGrade, readCachedGrade, writeCachedGrade } from "@/lib/onboarding-reader";
import { useOfflineDownload } from "@/lib/offline/useOfflineDownload";
import OfflineBadge from "@/components/OfflineBadge";
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
import SavedReportView from "@/components/SavedReportView";
import DiscoverCard from "@/components/shared/DiscoverCard";
import { supabase } from "@/lib/supabase";
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

type SubjectId =
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
  /** Fires when the hub switches between the subject grid and a subject
   *  landing screen, so the app shell can hide its mobile top bar there. */
  onModeChange?: (mode: "grid" | "landing") => void;
}

// Where "Continue Learning" on a subject's landing screen should go, and which
// stashed target-skill key (if any) to clear first so it resumes naturally
// instead of jumping back to a specific topic from a previous visit. Mirrors
// the navigation targets `startContentSkill` used inside the old compact tree.
const CONTINUE_TARGET: Partial<Record<SubjectId, { view: ActiveView; key?: string }>> = {
  "life-skills": { view: "life-skills", key: "ruby_life-skills_target_skill" },
  afrikaans: { view: "afrikaans-fal", key: "ruby_afrikaans_target_skill" },
  "social-sciences": { view: "social-sciences", key: "ruby_social-sciences_target_skill" },
  nst: { view: "natural-sciences-tech", key: "ruby_nst_target_skill" },
  "matric-phys-sci": { view: "matric-phys-sci" },
  "grade-10-phys-sci": { view: "grade-10-phys-sci" },
  "grade-11-phys-sci": { view: "grade-11-phys-sci" },
  "life-sciences": { view: "life-sciences", key: "ruby_life-sciences_target_skill" },
  history: { view: "history", key: "ruby_history_target_skill" },
  "business-studies": { view: "business-studies", key: "ruby_business-studies_target_skill" },
  accounting: { view: "accounting", key: "ruby_accounting_target_skill" },
  economics: { view: "economics", key: "ruby_economics_target_skill" },
  tourism: { view: "tourism", key: "ruby_tourism_target_skill" },
  geography: { view: "geography", key: "ruby_geography_target_skill" },
  "natural-sciences-sp": { view: "natural-sciences-sp", key: "ruby_natural_sciences_sp_target_skill" },
  "social-sciences-sp": { view: "social-sciences-sp", key: "ruby_social_sciences_sp_target_skill" },
  "ems-sp": { view: "ems-sp", key: "ruby_ems_sp_target_skill" },
  "technology-sp": { view: "technology-sp", key: "ruby_technology_sp_target_skill" },
  "life-orientation-sp": { view: "life-orientation-sp", key: "ruby_life_orientation_sp_target_skill" },
  "creative-arts-sp": { view: "creative-arts-sp", key: "ruby_creative_arts_sp_target_skill" },
};

// Remembers which subject landing screen was open across a tree-page round
// trip, since the tree's own "← Subject" back button always returns to the
// Subjects tab fresh — without this, the learner would land back on the grid
// instead of the subject page they came from.
const LANDING_BREADCRUMB_KEY = "ruby_subjects_landing_id";

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

export default function SubjectsHub({ onNavigate, onModeChange }: SubjectsHubProps) {
  const { t } = useT();
  // Every profile and the grade are seeded synchronously from the local cache so
  // the trees paint with the learner's real progress (and the right subject
  // subset) on the very first frame. Supabase then refreshes them in the
  // background below — without blocking the initial render.
  const [mathsProfile, setMathsProfile] = useState<StudentProfile | null>(() => getStudentProfile());
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(() => getReadingProfile());
  const [mathsLiteracyProfile, setMathsLiteracyProfile] = useState<MathsLiteracyStudentProfile | null>(() => getMathsLiteracyProfile());
  // Subjects hub navigation: null = the standalone subject-card grid; a subject
  // id = that card tapped open, showing its landing screen (Continue Learning
  // hero + stats + Learning path link) until the learner taps "← Subjects".
  const [landingId, setLandingId] = useState<SubjectId | null>(null);
  const [landingStats, setLandingStats] = useState<{ grade: number; mastered: number; total: number; progress: number } | null>(null);
  const [userPlan, setUserPlan] = useState<string>("freebie");
  const [discoverViewReport, setDiscoverViewReport] = useState<"maths" | "reading" | null>(null);
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
        writeCachedGrade(auth.grade);
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

  // Restore whichever subject landing screen was open, so a round trip through
  // that subject's full-page tree ("← Subject") returns here instead of the grid.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LANDING_BREADCRUMB_KEY);
      if (saved) setLandingId(saved as SubjectId);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try {
      if (landingId) sessionStorage.setItem(LANDING_BREADCRUMB_KEY, landingId);
      else sessionStorage.removeItem(LANDING_BREADCRUMB_KEY);
    } catch { /* ignore */ }
  }, [landingId]);

  // Plan (freebie vs paid) drives the Discover freebie-lock on the Maths/
  // Reading landing screens, mirroring DiscoverHub's own gating.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .maybeSingle();
      setUserPlan(data?.status === "active" && data?.plan ? data.plan : "freebie");
    });
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

  // Landing-screen stats (mastered/total/progress) for whichever subject is
  // open. Dynamically imports just that subject's module — same chunk the
  // lazy tree view already uses — so opening the Subjects tab never pulls in
  // every subject's curriculum data up front.
  useEffect(() => {
    if (!landingId) { setLandingStats(null); return; }
    let cancelled = false;
    setLandingStats(null);
    const g = grade ?? 10;
    const load = async (): Promise<{ grade: number; mastered: number; total: number; progress: number } | null> => {
      switch (landingId) {
        case "accounting": return (await import("@/components/accounting/AccountingSkillTreeView")).getAccountingStats(g, accountingProfile);
        case "technology-sp": return (await import("@/components/technology-sp/TechnologySpSkillTreeView")).getTechnologySpStats(g, technologySpProfile);
        case "tourism": return (await import("@/components/tourism/TourismSkillTreeView")).getTourismStats(g, tourismProfile);
        case "social-sciences-sp": return (await import("@/components/social-sciences-sp/SocialSciencesSpSkillTreeView")).getSocialSciencesSpStats(g, socialSciencesSpProfile);
        case "natural-sciences-sp": return (await import("@/components/natural-sciences-sp/NaturalSciencesSpSkillTreeView")).getNaturalSciencesSpStats(g, naturalSciencesSpProfile);
        case "life-sciences": return (await import("@/components/life-sciences/LifeSciencesSkillTreeView")).getLifeSciencesStats(g, lifeSciencesProfile);
        case "life-orientation-sp": return (await import("@/components/life-orientation-sp/LifeOrientationSpSkillTreeView")).getLifeOrientationSpStats(g, lifeOrientationSpProfile);
        case "history": return (await import("@/components/history/HistorySkillTreeView")).getHistoryStats(g, historyProfile);
        case "ems-sp": return (await import("@/components/ems-sp/EmsSpSkillTreeView")).getEmsSpStats(g, emsSpProfile);
        case "geography": return (await import("@/components/geography/GeographySkillTreeView")).getGeographyStats(g, geographyProfile);
        case "economics": return (await import("@/components/economics/EconomicsSkillTreeView")).getEconomicsStats(g, economicsProfile);
        case "creative-arts-sp": return (await import("@/components/creative-arts-sp/CreativeArtsSpSkillTreeView")).getCreativeArtsSpStats(g, creativeArtsSpProfile);
        case "business-studies": return (await import("@/components/business-studies/BusinessStudiesSkillTreeView")).getBusinessStudiesStats(g, businessStudiesProfile);
        default: return null;
      }
    };
    load().then((stats) => { if (!cancelled) setLandingStats(stats); });
    return () => { cancelled = true; };
  }, [
    landingId, grade,
    accountingProfile, technologySpProfile, tourismProfile, socialSciencesSpProfile,
    naturalSciencesSpProfile, lifeSciencesProfile, lifeOrientationSpProfile, historyProfile,
    emsSpProfile, geographyProfile, economicsProfile, creativeArtsSpProfile, businessStudiesProfile,
  ]);

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

  const mathsBadge = loading ? "..." : mathsDone ? `${mathsMastered} mastered` : "Not started";
  const readingBadge = loading ? "..." : readingDone ? `${readingMastered} mastered` : "Not started";

  const mathsBadgeColor = mathsDone ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600";
  const readingBadgeColor = readingDone ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600";

  const subjects = useMemo<SubjectMeta[]>(() => {
    const all: SubjectMeta[] = [
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
    // Every subject is ordered alphabetically by label — the same order for
    // every grade.
    return [...fetFiltered].sort((a, b) => a.label.localeCompare(b.label));
  }, [
    grade, selectedSubjects,
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

  // Pre-cache the learner's own subjects for offline use (silent on wifi; a
  // tap-to-save badge on metered/unknown connections). See lib/offline/.
  const offline = useOfflineDownload(useMemo(() => subjects.map((s) => s.id), [subjects]));

  // ── Maths / Reading / Maths-Literacy continue handlers (mirror app/page.tsx) ──
  const continueMaths = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("ruby_maths_replay_skill");
    onNavigate("ruby");
  };
  const continueReading = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("ruby_reading_replay_skill");
    onNavigate("reading");
  };
  const continueMathsLiteracy = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("ruby_maths_literacy_replay_skill");
    onNavigate("maths-literacy");
  };
  // "Continue Learning" on a subject's landing screen — clears any stashed
  // target-skill first so it resumes naturally rather than jumping to a
  // specific topic left over from a previous visit.
  const continueLanding = () => {
    if (!landingId) return;
    if (landingId === "maths") return continueMaths();
    if (landingId === "english") return continueReading();
    if (landingId === "maths-literacy") return continueMathsLiteracy();
    const target = CONTINUE_TARGET[landingId];
    if (!target) return;
    if (typeof window !== "undefined" && target.key) sessionStorage.removeItem(target.key);
    onNavigate(target.view);
  };

  const onUpgradeNeeded = () =>
    document.dispatchEvent(
      new CustomEvent("ruby-upgrade-needed", { detail: { reason: "Upgrade to unlock both Maths and Reading Discovery Activities." } })
    );
  const isFreebie = userPlan === "freebie";
  const mathsLocked = isFreebie && !mathsDone && readingDone;
  const readingLocked = isFreebie && !readingDone && mathsDone;

  // FET learners (Gr 10–12) with no saved subject selection are gated into
  // picking before the hub opens. While the grade / saved subjects are still
  // resolving we wait (skeleton) rather than flashing the wrong content or the
  // gate prematurely. Grades 1–9 and learners with a saved selection skip both.
  const needsSubjectChoice = isFetGrade(grade) && !selectedSubjects;
  const waitingForGrade = loading && (!gradeKnown || needsSubjectChoice);
  // The card tapped open (if any). Falls back to the grid when the id no longer
  // matches a subject the learner takes (e.g. after a grade/subject change).
  const landingSubject = landingId ? subjects.find((s) => s.id === landingId) ?? null : null;

  useEffect(() => {
    onModeChange?.(landingSubject || discoverViewReport ? "landing" : "grid");
  }, [landingSubject, discoverViewReport, onModeChange]);

  if (discoverViewReport) {
    return (
      <div className="h-full overflow-hidden">
        <SavedReportView subject={discoverViewReport} onBack={() => setDiscoverViewReport(null)} />
      </div>
    );
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
          ) : landingSubject ? (
            /* Subject landing screen: the grade/progress is the hero, not
               artwork — no subject image here. "Continue Learning" is the one
               primary action; "Learning path" (was "Open full tree") is
               secondary. Maths/English also surface Discover/placement here
               instead of as its own card on the grid. */
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setLandingId(null)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
              >
                ← Subjects
              </button>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">{landingSubject.label}</h1>
              <p className="text-gray-500 text-sm mb-6">
                {landingId === "maths"
                  ? `Level ${mathsProfile?.current_level ?? "—"} · ${mathsMastered} mastered`
                  : landingId === "english"
                  ? `Level ${readingProfile?.current_level ?? "—"} · ${readingMastered} mastered`
                  : landingId === "maths-literacy"
                  ? `${mathsLiteracyMastered} skills mastered`
                  : landingStats
                  ? `Grade ${landingStats.grade} • ${landingStats.progress}% Complete`
                  : grade != null
                  ? `Grade ${grade}`
                  : null}
              </p>

              <button
                onClick={continueLanding}
                className="w-full flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-5 py-5 mb-4 shadow-lip active:translate-y-[3px] active:shadow-none transition-all text-left"
              >
                <span className="text-3xl flex-shrink-0" aria-hidden>▶️</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Continue Learning</p>
                  <p className="text-xl font-extrabold text-gray-900 truncate">{landingSubject.label}</p>
                </div>
                <span className="text-2xl text-gray-300 flex-shrink-0" aria-hidden>→</span>
              </button>

              {landingStats && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 px-1">
                  <span>Grade {landingStats.grade}</span>
                  <span aria-hidden>·</span>
                  <span>{landingStats.progress}% Complete</span>
                  <span aria-hidden>·</span>
                  <span>{Math.max(landingStats.total - landingStats.mastered, 0)} Topics Remaining</span>
                </div>
              )}

              <button
                onClick={() => onNavigate(landingSubject.navigateTo)}
                className="w-full flex items-center justify-between rounded-2xl border-2 border-gray-100 bg-white px-5 py-4 mb-6 shadow-lip active:translate-y-[3px] active:shadow-none transition-all text-left"
              >
                <span className="font-semibold text-gray-900">Learning path</span>
                <span className="text-gray-300" aria-hidden>→</span>
              </button>

              {landingId === "maths" && (
                <DiscoverCard
                  subject="maths"
                  done={mathsDone}
                  locked={mathsLocked}
                  loading={loading}
                  onNavigate={onNavigate}
                  onViewReport={() => setDiscoverViewReport("maths")}
                  onUpgradeNeeded={onUpgradeNeeded}
                />
              )}
              {landingId === "english" && (
                <DiscoverCard
                  subject="reading"
                  done={readingDone}
                  locked={readingLocked}
                  loading={loading}
                  onNavigate={onNavigate}
                  onViewReport={() => setDiscoverViewReport("reading")}
                  onUpgradeNeeded={onUpgradeNeeded}
                />
              )}
            </div>
          ) : (
            /* Standalone subject cards. Tapping one opens its landing screen
               above (the "landingSubject" branch). */
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setLandingId(s.id)}
                  className="group rounded-2xl transition-all text-left overflow-hidden flex flex-col active:scale-[0.98]"
                >
                  <div className={`relative h-28 sm:h-36 rounded-2xl bg-gradient-to-br ${s.accentFrom} ${s.accentTo} flex items-center justify-center`}>
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
                    {offline.isEligible(s.id) && (
                      <OfflineBadge
                        status={offline.status[s.id] ?? "idle"}
                        onSave={() => offline.download(s.id)}
                      />
                    )}
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
