"use client";

import { useEffect, useState } from "react";
import { getProgress, getStreakData, StreakData } from "@/lib/storage";
import { getSkillById, hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { StudentProfile } from "@/types/ruby";
import { ReadingStudentProfile } from "@/types/reading";
import { ProgressData } from "@/types";
import EduBackground from "@/components/EduBackground";
import { useT } from "@/lib/i18n";
import SkillTreeView from "@/components/ruby/SkillTreeView";
import ReadingSkillTreeView from "@/components/reading/ReadingSkillTreeView";
import lifeSkillsTreeData from "@/data/life-skills-skill-tree.json";
import type { LifeSkillsSkillTree } from "@/types/life-skills";
import { getLifeSkillsMasteryMap } from "@/lib/life-skills-student-model";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import afrikaansTreeData from "@/data/afrikaans-skill-tree.json";
import type { AfrikaansSkillTree, AfrikaansStudentProfile } from "@/types/afrikaans";
import { HIGHEST_AVAILABLE_LEVEL as AFRIKAANS_MAX_GRADE } from "@/lib/afrikaans-grade-map";
import { HIGHEST_AVAILABLE_LEVEL as LIFE_SKILLS_MAX_GRADE } from "@/lib/life-skills-grade-map";
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
import socialSciencesTreeData from "@/data/social-sciences-skill-tree.json";
import type { SocialSciencesSkillTree } from "@/types/social-sciences";
import NstSkillTreeView from "@/components/nst/NstSkillTreeView";
import MatricPhysSciSkillTreeView from "@/components/matric-phys-sci/MatricPhysSciSkillTreeView";
import MathsLiteracySkillTreeView from "@/components/maths-literacy/MathsLiteracySkillTreeView";
import LifeSciencesSkillTreeView from "@/components/life-sciences/LifeSciencesSkillTreeView";
import HistorySkillTreeView from "@/components/history/HistorySkillTreeView";
import BusinessStudiesSkillTreeView from "@/components/business-studies/BusinessStudiesSkillTreeView";
import TourismSkillTreeView from "@/components/tourism/TourismSkillTreeView";
import GeographySkillTreeView from "@/components/geography/GeographySkillTreeView";
import NaturalSciencesSpSkillTreeView from "@/components/natural-sciences-sp/NaturalSciencesSpSkillTreeView";
import { getMathsLiteracyProfile } from "@/lib/maths-literacy-student-model";
import type { MathsLiteracyStudentProfile } from "@/types/maths-literacy";
import {
  loadSocialSciencesProfile,
  hydrateSocialSciencesProfileFromSupabase,
  type SocialSciencesProfile,
  type SocialSciencesTopicStatus,
} from "@/lib/social-sciences-student-model";
import {
  getAfrikaansSkillStatus,
  loadAfrikaansProfile,
  hydrateAfrikaansProfileFromSupabase,
} from "@/lib/afrikaans-student-model";

const lifeSkillsTree = lifeSkillsTreeData as unknown as LifeSkillsSkillTree;
const afrikaansTree = afrikaansTreeData as unknown as AfrikaansSkillTree;
const socialSciencesTree = socialSciencesTreeData as unknown as SocialSciencesSkillTree;

// Subject tabs shown on the Progress screen. Only one tree renders at a time so
// the page stays short regardless of how tall the Maths/Reading trees get.
type SubjectTabId =
  | "maths"
  | "reading"
  | "lifeskills"
  | "afrikaans"
  | "socialsciences"
  | "nst"
  | "matricphyssci"
  | "mathsliteracy"
  | "lifesciences"
  | "history"
  | "businessstudies"
  | "tourism"
  | "geography"
  | "naturalsciencessp";
interface SubjectConfig {
  id: SubjectTabId;
  emoji: string;
  label: string;
  hex: string;
  activeCard: string;
  activeBorder: string;
}
// Ordered alphabetically by label (matches the Subjects page). "Maths" stays
// the default-selected tab regardless of its position here.
const SUBJECTS: SubjectConfig[] = [
  { id: "afrikaans",      emoji: "🇿🇦", label: "Afrikaans",         hex: "#10b981", activeCard: "bg-emerald-50",  activeBorder: "border-emerald-400" },
  { id: "businessstudies",emoji: "💼", label: "Business Studies",  hex: "#0284c7", activeCard: "bg-sky-50",      activeBorder: "border-sky-400" },
  { id: "reading",        emoji: "📖", label: "English",           hex: "#a855f7", activeCard: "bg-purple-50",   activeBorder: "border-purple-400" },
  { id: "geography",      emoji: "🗺️", label: "Geography",         hex: "#06b6d4", activeCard: "bg-cyan-50",     activeBorder: "border-cyan-400" },
  { id: "history",        emoji: "📜", label: "History",           hex: "#d97706", activeCard: "bg-amber-50",    activeBorder: "border-amber-400" },
  { id: "lifesciences",   emoji: "🧬", label: "Life Sciences",     hex: "#16a34a", activeCard: "bg-green-50",    activeBorder: "border-green-400" },
  { id: "lifeskills",     emoji: "🌟", label: "Life Skills",       hex: "#f59e0b", activeCard: "bg-amber-50",    activeBorder: "border-amber-400" },
  { id: "maths",          emoji: "🧮", label: "Maths",             hex: "#3b82f6", activeCard: "bg-blue-50",     activeBorder: "border-blue-400" },
  { id: "mathsliteracy",  emoji: "📊", label: "Maths Literacy",    hex: "#6366f1", activeCard: "bg-indigo-50",   activeBorder: "border-indigo-400" },
  { id: "naturalsciencessp", emoji: "🔭", label: "Natural Sciences", hex: "#e11d48", activeCard: "bg-rose-50",   activeBorder: "border-rose-400" },
  { id: "nst",            emoji: "🔬", label: "Natural Sci & Tech", hex: "#10b981", activeCard: "bg-emerald-50",  activeBorder: "border-emerald-400" },
  { id: "matricphyssci",  emoji: "⚗️", label: "Physical Sciences", hex: "#e11d48", activeCard: "bg-rose-50",     activeBorder: "border-rose-400" },
  { id: "socialsciences", emoji: "🌍", label: "Social Sciences",   hex: "#0ea5e9", activeCard: "bg-sky-50",      activeBorder: "border-sky-400" },
  { id: "tourism",        emoji: "🧳", label: "Tourism",           hex: "#0d9488", activeCard: "bg-teal-50",     activeBorder: "border-teal-400" },
];

type LifeSkillsTopicStatus = "mastered" | "in_progress" | "available";

// Reads the topic→status map from the Life Skills profile (localStorage-backed,
// mirrored to Supabase). Replaces the old direct "life-skills-mastery-v1" read.
function readLifeSkillsMastery(): Record<string, LifeSkillsTopicStatus> {
  return getLifeSkillsMasteryMap();
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="#D97706" viewBox="0 0 24 24">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.99 5.99 0 0011 17v2H7v2h10v-2h-4v-2a5.99 5.99 0 003.61-4.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}
function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_MODE = false;

const DEMO_STATS = { skillsMastered: 16, inProgress: 3, lessonsDone: 40, studySessions: 24 };
// Sessions per day: Mon–Sun (sums to 24+ to feel realistic)
const DEMO_WEEK_COUNTS = [4, 6, 2, 8, 5, 3, 4];
const DEMO_STREAK = { currentStreak: 7, bestStreak: 15, lastActiveDate: "", dailyActivity: {} };

// One colour per weekday bar (Mon → Sun)
const BAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-rose-500",
];
const BAR_COLORS_DIM = [
  "bg-violet-200",
  "bg-blue-200",
  "bg-cyan-200",
  "bg-emerald-200",
  "bg-amber-200",
  "bg-orange-200",
  "bg-rose-200",
];

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getCurrentWeek(): { date: string; label: string; isToday: boolean }[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: toDateStr(d), label, isToday: toDateStr(d) === toDateStr(today) };
  });
}

interface ProgressTrackerProps {
  /** Launch an isolated replay of a completed Maths skill (no progression change). */
  onMathsReplaySkill?: (skillId: string) => void;
  /** Launch an isolated replay of a completed Reading skill (no progression change). */
  onReadingReplaySkill?: (skillId: string) => void;
  /** Resume the learner's current Maths skill (progression on) — wires the
   *  "Continue where you left off" CTA inside the Maths tree on this page. */
  onMathsContinue?: () => void;
  /** Resume the learner's current Reading skill (progression on). */
  onReadingContinue?: () => void;
  /** Open the Afrikaans subject and start the picked (non-locked) skill. */
  onAfrikaansPickSkill?: (skillId: string) => void;
  /** Open the Social Sciences subject (lands on the topic tree for the learner's grade). */
  onSocialSciencesOpen?: () => void;
  /** Open the Life Skills subject — clicking a topic opens that session. */
  onLifeSkillsPickTopic?: (skillId: string) => void;
  /** Open the NST subject for the learner's grade. */
  onNstOpen?: () => void;
  /** Open the Physical Sciences subject. */
  onMatricPhysSciPickSkill?: (skillId: string) => void;
  /** Resume current Maths Literacy skill. */
  onMathsLiteracyContinue?: () => void;
  /** Replay a completed Maths Literacy skill. */
  onMathsLiteracyReplaySkill?: (skillId: string) => void;
  /** Open Life Sciences — clicking a topic opens that session. */
  onLifeSciencesPickSkill?: (skillId: string) => void;
  /** Open History — clicking a topic opens that session. */
  onHistoryPickSkill?: (skillId: string) => void;
  /** Open Business Studies — clicking a topic opens that session. */
  onBusinessStudiesPickSkill?: (skillId: string) => void;
  /** Open Tourism — clicking a topic opens that session. */
  onTourismPickSkill?: (skillId: string) => void;
  /** Open Geography — clicking a topic opens that session. */
  onGeographyPickSkill?: (skillId: string) => void;
  /** Open Natural Sciences (Senior Phase) — clicking a topic opens that session. */
  onNaturalSciencesSpPickSkill?: (skillId: string) => void;
}

export default function ProgressTracker({
  onMathsReplaySkill,
  onReadingReplaySkill,
  onMathsContinue,
  onReadingContinue,
  onAfrikaansPickSkill,
  onSocialSciencesOpen,
  onLifeSkillsPickTopic,
  onNstOpen,
  onMatricPhysSciPickSkill,
  onMathsLiteracyContinue,
  onMathsLiteracyReplaySkill,
  onLifeSciencesPickSkill,
  onHistoryPickSkill,
  onBusinessStudiesPickSkill,
  onTourismPickSkill,
  onGeographyPickSkill,
  onNaturalSciencesSpPickSkill,
}: ProgressTrackerProps = {}) {
  const { t } = useT();
  const [progress, setProgress] = useState<ProgressData>({
    totalMessages: 0, topicsStudied: [], lessonsCompleted: 0,
    lessonsStarted: 0, sessionCount: 0, lastSession: "", subjectBreakdown: {},
  });
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, bestStreak: 0, lastActiveDate: "", dailyActivity: {} });

  useEffect(() => {
    Promise.all([
      getProgress(),
      hydrateStudentProfileFromSupabase(),
      hydrateReadingProfileFromSupabase(),
      getStreakData(),
    ]).then(([p, prof, readProf, s]) => {
      setProgress(p);
      setProfile(prof);
      setReadingProfile(readProf);
      setStreak(s);
    });
  }, []);

  const mastery = profile?.skill_mastery ?? {};
  const masteredEntries = Object.entries(mastery).filter(([, m]) => m.status === "mastered" || m.status === "assumed");
  const inProgressEntries = Object.entries(mastery).filter(([, m]) => m.status === "in_progress");

  const realStats = {
    skillsMastered: masteredEntries.length,
    inProgress: inProgressEntries.length,
    lessonsDone: progress.lessonsCompleted,
    studySessions: progress.sessionCount,
  };
  const weekDays = getCurrentWeek();
  const activity = streak.dailyActivity ?? {};
  const maxActivity = Math.max(...weekDays.map((d) => activity[d.date] || 0), 1);

  const isEmpty = !DEMO_MODE && !profile && progress.sessionCount === 0;

  const [activeTab, setActiveTab] = useState<SubjectTabId>("maths");
  const [lifeSkillsMastery, setLifeSkillsMastery] = useState<Record<string, LifeSkillsTopicStatus>>({});
  const [grade, setGrade] = useState<number | null>(null);
  const [afrikaansProfile, setAfrikaansProfile] = useState<AfrikaansStudentProfile | null>(null);
  const [socialSciencesMastery, setSocialSciencesMastery] = useState<Record<string, SocialSciencesTopicStatus>>({});
  const [mathsLiteracyProfile, setMathsLiteracyProfile] = useState<MathsLiteracyStudentProfile | null>(null);
  // Per-level expand/collapse for Life Skills, Afrikaans, and Social Sciences trees.
  // Default: learner's own grade expanded; other grades collapsed.
  const [lifeSkillsExpanded, setLifeSkillsExpanded] = useState<Set<number>>(new Set());
  const [afrikaansExpanded, setAfrikaansExpanded] = useState<Set<number>>(new Set());
  const [socialSciencesExpanded, setSocialSciencesExpanded] = useState<Set<number>>(new Set());
  // Compact-by-default: hide non-current grades behind a "View other grades"
  // toggle so learners see only their current section.
  const [showAllLifeSkills, setShowAllLifeSkills] = useState(false);
  const [showAllAfrikaans, setShowAllAfrikaans] = useState(false);
  const [showAllSocialSciences, setShowAllSocialSciences] = useState(false);
  const toggleSet = <T,>(setter: (fn: (prev: Set<T>) => Set<T>) => void) => (id: T) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  const toggleLifeSkillsLevel = toggleSet<number>(setLifeSkillsExpanded);
  const toggleAfrikaansLevel = toggleSet<number>(setAfrikaansExpanded);
  const toggleSocialSciencesLevel = toggleSet<number>(setSocialSciencesExpanded);

  useEffect(() => {
    setLifeSkillsMastery(readLifeSkillsMastery());
    fetchAuthorisedGrade().then((data) => setGrade(data?.grade ?? 1));
    // Afrikaans persists primarily in localStorage; fall back to the Supabase
    // backup when this device has no local profile yet.
    const localAfrikaans = loadAfrikaansProfile();
    if (localAfrikaans) setAfrikaansProfile(localAfrikaans);
    else hydrateAfrikaansProfileFromSupabase().then((p) => { if (p) setAfrikaansProfile(p); });
    // Social Sciences mirrors the Afrikaans pattern.
    const localSocial = loadSocialSciencesProfile();
    if (localSocial) setSocialSciencesMastery(localSocial.mastery ?? {});
    else hydrateSocialSciencesProfileFromSupabase().then((p: SocialSciencesProfile | null) => {
      if (p) setSocialSciencesMastery(p.mastery ?? {});
    });
    setMathsLiteracyProfile(getMathsLiteracyProfile());
  }, []);

  // Once the learner's grade is known, default-expand that grade's level in
  // all three inline trees. Once-only; user clicks override.
  useEffect(() => {
    if (grade == null) return;
    setLifeSkillsExpanded((prev) => (prev.size === 0 ? new Set([grade]) : prev));
    setAfrikaansExpanded((prev) => (prev.size === 0 ? new Set([grade]) : prev));
    const ssSeed = Math.min(Math.max(grade, SOCIAL_SCIENCES_MIN_GRADE), SOCIAL_SCIENCES_MAX_GRADE);
    setSocialSciencesExpanded((prev) => (prev.size === 0 ? new Set([ssSeed]) : prev));
  }, [grade]);

  const lifeSkillsMasteredCount = Object.values(lifeSkillsMastery).filter((s) => s === "mastered").length;
  const readingMasteredCount = Object.values(readingProfile?.skill_mastery ?? {})
    .filter((m) => m.status === "mastered" || m.status === "assumed").length;
  const afrikaansMasteredCount = Object.values(afrikaansProfile?.skill_mastery ?? {})
    .filter((m) => m.status === "mastered" || m.status === "assumed").length;
  const socialSciencesMasteredCount = Object.values(socialSciencesMastery).filter((s) => s === "mastered").length;
  const mathsLiteracyMasteredCount = Object.values(mathsLiteracyProfile?.skill_mastery ?? {})
    .filter((m) => m.status === "mastered").length;

  // Mastered count per subject — drives the donut sizing and the card badges.
  const masteredCounts: Record<SubjectTabId, number> = {
    maths: masteredEntries.length,
    reading: readingMasteredCount,
    lifeskills: lifeSkillsMasteredCount,
    afrikaans: afrikaansMasteredCount,
    socialsciences: socialSciencesMasteredCount,
    nst: 0,
    matricphyssci: 0,
    mathsliteracy: mathsLiteracyMasteredCount,
    lifesciences: 0,
    history: 0,
    businessstudies: 0,
    tourism: 0,
    geography: 0,
    naturalsciencessp: 0,
  };

  // Each subject is gated by its own authored-content range, so it stays in
  // lock-step with the per-subject grade map (matches the Subjects page).
  // Default to showing while the grade is still loading.
  const learnerGrade = grade ?? 1;
  const showLifeSkills = learnerGrade <= LIFE_SKILLS_MAX_GRADE;
  const showAfrikaans = learnerGrade <= AFRIKAANS_MAX_GRADE;
  const showSocialSciences =
    learnerGrade >= SOCIAL_SCIENCES_MIN_GRADE && learnerGrade <= SOCIAL_SCIENCES_MAX_GRADE;
  const showNst =
    learnerGrade >= NST_MIN_GRADE && learnerGrade <= NST_MAX_GRADE;
  const showMatricPhysSci = learnerGrade === 12;
  const showMathsLiteracy =
    learnerGrade >= MATHS_LITERACY_MIN_GRADE && learnerGrade <= MATHS_LITERACY_MAX_GRADE;
  const visibleSubjects = SUBJECTS.filter((s) => {
    if (s.id === "lifeskills") return showLifeSkills;
    if (s.id === "afrikaans") return showAfrikaans;
    if (s.id === "socialsciences") return showSocialSciences;
    if (s.id === "nst") return showNst;
    if (s.id === "matricphyssci") return showMatricPhysSci;
    if (s.id === "mathsliteracy") return showMathsLiteracy;
    // FET subjects (Gr 10–12), free like the rest.
    if (
      s.id === "lifesciences" ||
      s.id === "history" ||
      s.id === "businessstudies" ||
      s.id === "tourism" ||
      s.id === "geography"
    )
      return learnerGrade >= 10 && learnerGrade <= 12;
    // Natural Sciences is a Senior-Phase subject (Gr 7–9), free like the rest.
    if (s.id === "naturalsciencessp") return learnerGrade >= 7 && learnerGrade <= 9;
    return true;
  });

  // Keep activeTab valid when the learner's grade range hides their current tab.
  useEffect(() => {
    if (!visibleSubjects.find((s) => s.id === activeTab)) {
      setActiveTab(visibleSubjects[0]?.id ?? "maths");
    }
  }, [visibleSubjects, activeTab]);

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />
      {/* Header */}
      <div className="relative hidden md:block bg-white border-b border-gray-100 px-6 py-4">
        <h2 className="text-gray-900 font-semibold text-xl">{t("progress.title")}</h2>
        <p className="text-gray-500 text-base">{t("progress.subtitle")}</p>
      </div>

      <div className="relative flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* ── 4 Stat Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Skills Mastered</span>
                <TrophyIcon className="w-5 h-5 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{realStats.skillsMastered}</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">In Progress</span>
                <ChartIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-amber-500">{realStats.inProgress}</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Lessons Done</span>
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-green-600">{realStats.lessonsDone}</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Study Sessions</span>
                <CalendarIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{realStats.studySessions}</span>
            </div>
          </div>

          {/* ── Streak ──────────────────────────────────────────────────── */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">🔥</span>
              <div>
                <p className="text-sm text-orange-600 font-medium">Current Streak</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-bold text-orange-600">{streak.currentStreak}</span>
                  <span className="text-base text-orange-500">day{streak.currentStreak !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-400">Best</p>
              <p className="text-xl font-bold text-orange-500">{streak.bestStreak} days</p>
            </div>
          </div>

          {/* ── Subject card grid (replaces the old 4-col flat tab strip) ── */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {visibleSubjects.map((s) => {
                const isActive = activeTab === s.id;
                const count = masteredCounts[s.id];
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveTab(s.id)}
                    aria-pressed={isActive}
                    className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 px-1.5 py-2.5 transition-colors ${
                      isActive ? `${s.activeCard} ${s.activeBorder}` : "bg-white border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl leading-none" aria-hidden>{s.emoji}</span>
                    <span className="text-[11px] sm:text-xs font-semibold leading-tight text-center text-gray-700">{s.label}</span>
                    {count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected subject's tree */}
            <div className="mt-3 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {activeTab === "maths" && <SkillTreeView profile={profile} onReplaySkill={onMathsReplaySkill} onContinue={onMathsContinue} compact />}
              {activeTab === "reading" && <ReadingSkillTreeView profile={readingProfile} onReplaySkill={onReadingReplaySkill} onContinue={onReadingContinue} compact />}

              {activeTab === "lifeskills" && (
                <div className="p-5 space-y-3">
                  {lifeSkillsTree.levels.length > 0 ? (
                    // Show every grade's topics, each grade as its own
                    // collapsible level header.
                    (showAllLifeSkills
                      ? lifeSkillsTree.levels
                      : lifeSkillsTree.levels.filter((l) => l.id === (grade ?? 1))
                    ).map((level) => {
                      const isExpanded = lifeSkillsExpanded.has(level.id);
                      const skills = level.tiers[0]?.atomic_skills ?? [];
                      const isCurrentGrade = grade === level.id;
                      return (
                        <div key={level.id} className="rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleLifeSkillsLevel(level.id)}
                            aria-expanded={isExpanded}
                            aria-controls={`lifeskills-body-${level.id}`}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${isCurrentGrade ? "bg-amber-50" : ""}`}
                          >
                            <h4 className="text-sm font-semibold text-[#1a2744]">{level.title}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{skills.length} topics</span>
                              <svg
                                aria-hidden
                                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          {isExpanded && (
                            <div id={`lifeskills-body-${level.id}`} className="px-4 pb-4 pt-1">
                              <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => {
                                  const status = lifeSkillsMastery[skill.id] ?? "available";
                                  const pillClass =
                                    status === "mastered"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : status === "in_progress"
                                      ? "bg-amber-50 text-amber-700 border-amber-300"
                                      : "bg-amber-50 text-amber-700 border-amber-200";
                                  const icon = status === "mastered" ? "🏆" : status === "in_progress" ? "⚡" : "🚀";
                                  const canStart = !!onLifeSkillsPickTopic;
                                  return (
                                    <button
                                      key={skill.id}
                                      type="button"
                                      disabled={!canStart}
                                      onClick={() => canStart && onLifeSkillsPickTopic!(skill.id)}
                                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${pillClass} ${
                                        canStart
                                          ? "cursor-pointer hover:ring-2 hover:ring-amber-300 hover:shadow-sm transition-all"
                                          : "cursor-default"
                                      }`}
                                      title={`${skill.title} — ${status.replace("_", " ")} · Tap to open`}
                                    >
                                      <span className="mr-1">{icon}</span>
                                      {skill.title}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No Life Skills content yet.</p>
                  )}
                  {lifeSkillsTree.levels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowAllLifeSkills((v) => !v)}
                      className="w-full text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] py-2"
                    >
                      {showAllLifeSkills ? "Show only current grade ▲" : "View other grades ▼"}
                    </button>
                  )}
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <span className="inline-block mr-3">🏆 Mastered</span>
                    <span className="inline-block mr-3">⚡ In progress</span>
                    <span className="inline-block">· Not started</span>
                  </div>
                </div>
              )}

              {activeTab === "afrikaans" && (
                <div className="p-5 space-y-3">
                  {afrikaansTree.levels.length > 0 ? (
                    // Show ALL grades' skills, each grade as its own collapsible
                    // level — was previously filtered to the learner's grade.
                    (showAllAfrikaans
                      ? afrikaansTree.levels
                      : afrikaansTree.levels.filter((l) => l.id === (grade ?? 1))
                    ).map((level) => {
                      const isExpanded = afrikaansExpanded.has(level.id);
                      const skillCount = level.tiers.reduce((n, t) => n + t.atomic_skills.length, 0);
                      const isCurrentGrade = grade === level.id;
                      return (
                        <div key={level.id} className="rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleAfrikaansLevel(level.id)}
                            aria-expanded={isExpanded}
                            aria-controls={`afrikaans-body-${level.id}`}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${isCurrentGrade ? "bg-emerald-50" : ""}`}
                          >
                            <h4 className="text-sm font-semibold text-[#1a2744]">{level.title}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{skillCount} skills</span>
                              <svg
                                aria-hidden
                                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          {isExpanded && (
                            <div id={`afrikaans-body-${level.id}`} className="px-4 pb-4 pt-1 space-y-4">
                              {level.tiers.map((tier) => (
                                <div key={tier.id}>
                                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                                    {tier.title}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {tier.atomic_skills.map((skill) => {
                                      const status = getAfrikaansSkillStatus(skill.id, afrikaansProfile);
                                      const isLocked = status === "locked";
                                      const pillClass =
                                        status === "mastered"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : status === "in_progress"
                                          ? "bg-amber-50 text-amber-700 border-amber-300"
                                          : isLocked
                                          ? "bg-gray-50 text-gray-400 border-gray-200"
                                          : "bg-white text-[#1a2744] border-emerald-200";
                                      const icon =
                                        status === "mastered" ? "🏆" : status === "in_progress" ? "⚡" : isLocked ? "🔒" : "🚀";
                                      const canStart = !isLocked && !!onAfrikaansPickSkill;
                                      return (
                                        <button
                                          key={skill.id}
                                          type="button"
                                          disabled={!canStart}
                                          onClick={() => canStart && onAfrikaansPickSkill!(skill.id)}
                                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${pillClass} ${
                                            canStart
                                              ? "cursor-pointer hover:ring-2 hover:ring-emerald-300 hover:shadow-sm transition-all"
                                              : "cursor-default"
                                          }`}
                                          title={
                                            isLocked
                                              ? `${skill.title} — locked`
                                              : `${skill.title} — ${status.replace("_", " ")} · Tap to start`
                                          }
                                        >
                                          <span className="mr-1">{icon}</span>
                                          {skill.title}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">More Afrikaans grades coming soon.</p>
                  )}
                  {afrikaansTree.levels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowAllAfrikaans((v) => !v)}
                      className="w-full text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] py-2"
                    >
                      {showAllAfrikaans ? "Show only current grade ▲" : "View other grades ▼"}
                    </button>
                  )}
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <span className="inline-block mr-3">🏆 Mastered</span>
                    <span className="inline-block mr-3">⚡ In progress</span>
                    <span className="inline-block mr-3">🚀 Ready</span>
                    <span className="inline-block">🔒 Locked</span>
                  </div>
                </div>
              )}

              {activeTab === "socialsciences" && (
                <div className="p-5 space-y-3">
                  {socialSciencesTree.levels.length > 0 ? (
                    (showAllSocialSciences
                      ? socialSciencesTree.levels
                      : socialSciencesTree.levels.filter((l) => l.id === (grade ?? 4))
                    ).map((level) => {
                      const isExpanded = socialSciencesExpanded.has(level.id);
                      const skillCount = level.tiers.reduce((n, t) => n + t.atomic_skills.length, 0);
                      const isCurrentGrade = grade === level.id;
                      return (
                        <div key={level.id} className="rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleSocialSciencesLevel(level.id)}
                            aria-expanded={isExpanded}
                            aria-controls={`social-body-${level.id}`}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${isCurrentGrade ? "bg-sky-50" : ""}`}
                          >
                            <h4 className="text-sm font-semibold text-[#1a2744]">{level.title}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{skillCount} topics</span>
                              <svg
                                aria-hidden
                                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          {isExpanded && (
                            <div id={`social-body-${level.id}`} className="px-4 pb-4 pt-1 space-y-4">
                              {level.tiers.map((tier) => (
                                <div key={tier.id}>
                                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                                    {tier.title}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {tier.atomic_skills.map((skill) => {
                                      const status = socialSciencesMastery[skill.id] ?? "available";
                                      const pillClass =
                                        status === "mastered"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : status === "in_progress"
                                          ? "bg-amber-50 text-amber-700 border-amber-300"
                                          : "bg-white text-[#1a2744] border-sky-200";
                                      const icon =
                                        status === "mastered" ? "🏆" : status === "in_progress" ? "⚡" : "🌍";
                                      const canStart = !!onSocialSciencesOpen;
                                      return (
                                        <button
                                          key={skill.id}
                                          type="button"
                                          disabled={!canStart}
                                          onClick={() => canStart && onSocialSciencesOpen!()}
                                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${pillClass} ${
                                            canStart
                                              ? "cursor-pointer hover:ring-2 hover:ring-sky-300 hover:shadow-sm transition-all"
                                              : "cursor-default"
                                          }`}
                                          title={`${skill.title} — ${status.replace("_", " ")} · Tap to open`}
                                        >
                                          <span className="mr-1">{icon}</span>
                                          {skill.title}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No Social Sciences content yet.</p>
                  )}
                  {socialSciencesTree.levels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSocialSciences((v) => !v)}
                      className="w-full text-sm font-semibold text-[#1a2744] hover:text-[#BE1832] py-2"
                    >
                      {showAllSocialSciences ? "Show only current grade ▲" : "View other grades ▼"}
                    </button>
                  )}
                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <span className="inline-block mr-3">🏆 Mastered</span>
                    <span className="inline-block mr-3">⚡ In progress</span>
                    <span className="inline-block">🌍 Ready</span>
                  </div>
                </div>
              )}

              {activeTab === "nst" && (
                <NstSkillTreeView onPickTopic={() => onNstOpen?.()} />
              )}

              {activeTab === "matricphyssci" && (
                <MatricPhysSciSkillTreeView onPickSkill={(skillId) => onMatricPhysSciPickSkill?.(skillId)} compact />
              )}

              {activeTab === "mathsliteracy" && (
                <MathsLiteracySkillTreeView
                  profile={mathsLiteracyProfile}
                  onReplaySkill={onMathsLiteracyReplaySkill}
                  onContinue={onMathsLiteracyContinue}
                  compact
                />
              )}

              {activeTab === "lifesciences" && (
                <LifeSciencesSkillTreeView onPickSkill={(id) => onLifeSciencesPickSkill?.(id)} profile={null} compact />
              )}

              {activeTab === "history" && (
                <HistorySkillTreeView onPickSkill={(id) => onHistoryPickSkill?.(id)} profile={null} compact />
              )}

              {activeTab === "businessstudies" && (
                <BusinessStudiesSkillTreeView onPickSkill={(id) => onBusinessStudiesPickSkill?.(id)} profile={null} compact />
              )}

              {activeTab === "tourism" && (
                <TourismSkillTreeView onPickSkill={(id) => onTourismPickSkill?.(id)} profile={null} compact />
              )}

              {activeTab === "geography" && (
                <GeographySkillTreeView onPickSkill={(id) => onGeographyPickSkill?.(id)} profile={null} compact />
              )}

              {activeTab === "naturalsciencessp" && (
                <NaturalSciencesSpSkillTreeView onPickSkill={(id) => onNaturalSciencesSpPickSkill?.(id)} profile={null} compact />
              )}
            </div>
          </div>

          {/* ── In Progress Skills ─────────────────────────────────────── */}
          {inProgressEntries.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-base mb-3">
                In Progress
                <span className="ml-2 bg-amber-100 text-amber-600 text-sm font-semibold px-2 py-0.5 rounded-full">
                  {inProgressEntries.length}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {inProgressEntries.map(([skillId]) => {
                  const skill = getSkillById(skillId);
                  return (
                    <span key={skillId} className="bg-amber-50 text-amber-700 text-sm px-3 py-1.5 rounded-full font-medium">
                      {skill?.title ?? skillId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Weekly Study Activity (bottom) ─────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-base mb-4">{t("progress.weekly_study")}</h3>
            <div className="flex items-end justify-between gap-1.5 h-24">
              {weekDays.map(({ date, label, isToday }, i) => {
                const count = activity[date] || 0;
                const heightPct = count > 0 ? Math.max(10, Math.round((count / maxActivity) * 100)) : 0;
                const colorFull = BAR_COLORS[i];
                const colorDim  = BAR_COLORS_DIM[i];
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
                      {count > 0 ? (
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${isToday ? colorFull : colorDim}`}
                          style={{ height: `${heightPct}%` }}
                          title={`${count} session${count !== 1 ? "s" : ""}`}
                        />
                      ) : (
                        <div className="w-full rounded-t-lg bg-gray-100" style={{ height: "6px" }} />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Empty State ────────────────────────────────────────────── */}
          {isEmpty && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🌱</div>
              <p className="font-medium text-gray-600">Your learning journey starts here!</p>
              <p className="text-base mt-1">Head to Maths to start your first skill and track your progress here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
