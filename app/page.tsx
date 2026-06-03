"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
// ── Always-needed (static imports) ──────────────────────────────────────────
import Sidebar from "@/components/Sidebar";
import UsageMeter from "@/components/UsageMeter";
import HomeScreen from "@/components/HomeScreen";
import OnboardingFlow, { OnboardingData } from "@/components/onboarding/OnboardingFlow";
import HomeworkTutorial   from "@/components/tutorial/HomeworkTutorial";
const DiscoveryTutorial  = dynamic(() => import("@/components/tutorial/DiscoveryTutorial"),  { ssr: false });
const ReadingTutorial    = dynamic(() => import("@/components/tutorial/ReadingTutorial"),    { ssr: false });
const MathsTutorial      = dynamic(() => import("@/components/tutorial/MathsTutorial"),      { ssr: false });
const SkillTreeTutorial  = dynamic(() => import("@/components/tutorial/SkillTreeTutorial"),  { ssr: false });
const MatricTutorial     = dynamic(() => import("@/components/tutorial/MatricTutorial"),     { ssr: false });
const SubjectsTutorial   = dynamic(() => import("@/components/tutorial/SubjectsTutorial"),   { ssr: false });
const PrepPapersTutorial = dynamic(() => import("@/components/tutorial/PrepPapersTutorial"), { ssr: false });
const ProgressTutorial   = dynamic(() => import("@/components/tutorial/ProgressTutorial"),   { ssr: false });

// ── Loaded on demand (dynamic imports) ──────────────────────────────────────
const ChatInterface        = dynamic(() => import("@/components/ChatInterface"),                       { ssr: false });
const CharacterPicker      = dynamic(() => import("@/components/CharacterPicker"),                      { ssr: false });
const ProgressTracker      = dynamic(() => import("@/components/ProgressTracker"),                     { ssr: false });
const DiagnosticSession    = dynamic(() => import("@/components/ruby/DiagnosticSession"),               { ssr: false });
const SkillTreeView        = dynamic(() => import("@/components/ruby/SkillTreeView"),                   { ssr: false });
const StudentDashboard     = dynamic(() => import("@/components/ruby/StudentDashboard"),                { ssr: false });
const ReadingSession       = dynamic(() => import("@/components/reading/ReadingSession"),               { ssr: false });
const ReadingSkillTreeView = dynamic(() => import("@/components/reading/ReadingSkillTreeView"),         { ssr: false });
const LifeSkillsSession        = dynamic(() => import("@/components/life-skills/LifeSkillsSession"),         { ssr: false });
const LifeSkillsSkillTreeView  = dynamic(() => import("@/components/life-skills/LifeSkillsSkillTreeView"),   { ssr: false });
const AfrikaansSession         = dynamic(() => import("@/components/afrikaans/AfrikaansSession"),            { ssr: false });
const AfrikaansSkillTreeView   = dynamic(() => import("@/components/afrikaans/AfrikaansSkillTreeView"),      { ssr: false });
const SocialSciencesSession        = dynamic(() => import("@/components/social-sciences/SocialSciencesSession"),         { ssr: false });
const SocialSciencesSkillTreeView  = dynamic(() => import("@/components/social-sciences/SocialSciencesSkillTreeView"),   { ssr: false });
const NstSession                   = dynamic(() => import("@/components/nst/NstSession"),                                 { ssr: false });
const NstSkillTreeView             = dynamic(() => import("@/components/nst/NstSkillTreeView"),                           { ssr: false });
const MatricPhysSciSession         = dynamic(() => import("@/components/matric-phys-sci/MatricPhysSciSession"),           { ssr: false });
const MatricPhysSciSkillTreeView   = dynamic(() => import("@/components/matric-phys-sci/MatricPhysSciSkillTreeView"),     { ssr: false });
const MathsLiteracyEngine          = dynamic(() => import("@/components/maths-literacy/MathsLiteracyEngine"),              { ssr: false });
const MathsLiteracySkillTreeView   = dynamic(() => import("@/components/maths-literacy/MathsLiteracySkillTreeView"),       { ssr: false });
const LifeSciencesSession          = dynamic(() => import("@/components/life-sciences/LifeSciencesSession"),               { ssr: false });
const LifeSciencesSkillTreeView    = dynamic(() => import("@/components/life-sciences/LifeSciencesSkillTreeView"),         { ssr: false });
const HistorySession               = dynamic(() => import("@/components/history/HistorySession"),                          { ssr: false });
const HistorySkillTreeView         = dynamic(() => import("@/components/history/HistorySkillTreeView"),                    { ssr: false });
const BusinessStudiesSession       = dynamic(() => import("@/components/business-studies/BusinessStudiesSession"),         { ssr: false });
const BusinessStudiesSkillTreeView = dynamic(() => import("@/components/business-studies/BusinessStudiesSkillTreeView"),   { ssr: false });
const TourismSession               = dynamic(() => import("@/components/tourism/TourismSession"),                          { ssr: false });
const TourismSkillTreeView         = dynamic(() => import("@/components/tourism/TourismSkillTreeView"),                    { ssr: false });
const GeographySession             = dynamic(() => import("@/components/geography/GeographySession"),                      { ssr: false });
const GeographySkillTreeView       = dynamic(() => import("@/components/geography/GeographySkillTreeView"),                { ssr: false });
const NaturalSciencesSpSession     = dynamic(() => import("@/components/natural-sciences-sp/NaturalSciencesSpSession"),     { ssr: false });
const NaturalSciencesSpSkillTreeView = dynamic(() => import("@/components/natural-sciences-sp/NaturalSciencesSpSkillTreeView"), { ssr: false });
const SettingsView         = dynamic(() => import("@/components/SettingsView"),                        { ssr: false });
const MatricPastPapers         = dynamic(() => import("@/components/matric/MatricPastPapers"),             { ssr: false });
const PrepPapers2026           = dynamic(() => import("@/components/matric/PrepPapers2026"),               { ssr: false });
const StudyGuides              = dynamic(() => import("@/components/matric/StudyGuides"),                   { ssr: false });
const DiscoverHub              = dynamic(() => import("@/components/DiscoverHub"),                         { ssr: false });
const SubjectsHub              = dynamic(() => import("@/components/SubjectsHub"),                         { ssr: false });
const MatricsHub               = dynamic(() => import("@/components/matric/MatricsHub"),                    { ssr: false });
const WatchComingSoon      = dynamic(() => import("@/components/WatchComingSoon"),                      { ssr: false });
const LanguagePickerModal  = dynamic(() => import("@/components/LanguagePickerModal"),                  { ssr: false });
const PostSessionSurvey    = dynamic(() => import("@/components/beta/PostSessionSurvey"),               { ssr: false });
const FloatingFeedback     = dynamic(() => import("@/components/beta/FloatingFeedback"),                { ssr: false });
import ErrorBoundary from "@/components/ErrorBoundary";
import PricingPlans from "@/components/PricingPlans";
const UpgradeModal = dynamic(() => import("@/components/UpgradeModal"), { ssr: false });
import { supabase } from "@/lib/supabase";
import { ActiveView } from "@/types";
import { LanguageProvider, useT } from "@/lib/i18n";
import { getProgress, incrementSession } from "@/lib/storage";
import { hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { StudentProfile } from "@/types/ruby";
import { ReadingStudentProfile } from "@/types/reading";

// ── Placement guard shown when user navigates to a subject before Discovery ───
function PlacementGuardScreen({
  subject,
  onGoToDiscover,
}: {
  subject: "maths" | "reading";
  onGoToDiscover: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center space-y-4 mx-4">
        <div className="text-5xl">🧭</div>
        <h2 className="text-xl font-bold text-gray-800">Complete Discovery First</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Take the Discovery Activity so Ruby can find the right starting point for your{" "}
          {subject === "maths" ? "Maths" : "Reading"} journey.
        </p>
        <button
          onClick={onGoToDiscover}
          className="w-full py-3 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white font-semibold text-base transition-colors"
        >
          Start Discovery Activity
        </button>
      </div>
    </div>
  );
}

// ── Maps each tutorial-eligible nav view to its localStorage seen-key ────────
const FEATURE_TUTORIAL_KEYS: Partial<Record<ActiveView, string>> = {
  chat:              "ruby_tut_chat",
  subjects:          "ruby_tut_subjects",
  discover:          "ruby_tut_discover",
  ruby:              "ruby_tut_maths",
  reading:           "ruby_tut_reading",
  "skill-tree":      "ruby_tut_skill_tree",
  matric:            "ruby_tut_matric",
  "prep-papers-2026": "ruby_tut_prep_papers",
  progress:          "ruby_tut_progress",
};

// Views where the learner answers questions ("skill questions"). Freebie users
// see their daily usage counters pinned to the top of these (chat shows its own
// counters in its header, so it's intentionally excluded here).
const SESSION_VIEWS: ActiveView[] = [
  "ruby", "discover-maths", "reading", "discover-reading",
  "life-skills", "social-sciences", "natural-sciences-tech", "matric-phys-sci",
  "afrikaans-fal", "maths-literacy", "life-sciences", "history",
  "business-studies", "tourism", "geography", "natural-sciences-sp",
];

// ── Inner app — must live inside LanguageProvider to access useT ──────────────
function AppContent({ initialView, onPostDiscovery, showUpgradeOnMount }: { initialView?: ActiveView; onPostDiscovery?: () => void; showUpgradeOnMount?: boolean }) {
  const { t } = useT();

  const [activeView, setActiveView] = useState<ActiveView>(initialView ?? "home");
  const postDiscoveryFiredRef = useRef(false);
  const [paymentReturn, setPaymentReturn] = useState<"success" | "cancelled" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({ lessonsCompleted: 0 });
  const [rubyProfile, setRubyProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [survey, setSurvey] = useState<{ type: "maths" | "reading" | "chat" } | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<ActiveView | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  // The tutor whose chat is currently open (null = general Ruby chat).
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);

  // Only the freebie plan has daily limits; paid plans are unlimited, so the
  // usage counters are removed for them entirely. (Matches UsageMeter, which
  // only renders for plan === "freebie".)
  const isFreebie = userPlan === "freebie";

  const viewLabels: Record<ActiveView, string> = {
    home: t("sidebar.home"),
    chat: t("sidebar.homework"),
    progress: t("sidebar.progress"),
    ruby: t("sidebar.maths"),
    "skill-tree": t("nav.maths_skill_tree"),
    "student-dashboard": t("nav.account"),
    watch: t("sidebar.watch"),
    reading: t("sidebar.reading"),
    "reading-skill-tree": t("nav.reading_skill_tree"),
    settings: t("sidebar.settings"),
    matric: "Matric Preparation",
    "prep-papers-2026": "Prep Papers 2026",
    "discover-maths": "Discover · Maths",
    "discover-reading": "Discover · Reading",
    "discover": "Discover",
    subjects: "Subjects",
    matrics: "Matrics",
    "study-guides": "Study Guides",
    "life-skills": "Life Skills",
    "life-skills-skill-tree": "Life Skills · Topics",
    "afrikaans-fal": "Afrikaans",
    "afrikaans-fal-skill-tree": "Afrikaans · Skills",
    "social-sciences": "Social Sciences",
    "social-sciences-skill-tree": "Social Sciences · Topics",
    "natural-sciences-tech": "Natural Sciences & Tech",
    "natural-sciences-tech-skill-tree": "Natural Sciences & Tech · Topics",
    "matric-phys-sci": "Matric Physical Sciences",
    "matric-phys-sci-skill-tree": "Matric Physical Sciences · Skills",
    "maths-literacy": "Maths Literacy",
    "maths-literacy-skill-tree": "Maths Literacy · Skills",
    "life-sciences": "Life Sciences",
    "life-sciences-skill-tree": "Life Sciences · Topics",
    "history": "History",
    "history-skill-tree": "History · Topics",
    "business-studies": "Business Studies",
    "business-studies-skill-tree": "Business Studies · Topics",
    "tourism": "Tourism",
    "tourism-skill-tree": "Tourism · Topics",
    "geography": "Geography",
    "geography-skill-tree": "Geography · Topics",
    "natural-sciences-sp": "Natural Sciences",
    "natural-sciences-sp-skill-tree": "Natural Sciences · Topics",
  };

  const refreshStats = useCallback(() => {
    void getProgress().then((progress) => {
      setStats({ lessonsCompleted: progress.lessonsCompleted });
    });
    void hydrateStudentProfileFromSupabase().then((profile) => setRubyProfile(profile));
  }, []);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);
  const [upgradeMatricOnly, setUpgradeMatricOnly] = useState(false);
  const [streakToast, setStreakToast] = useState<number | null>(null);

  // Track chat engagement (at least one message sent this session)
  const [chatEngaged, setChatEngaged] = useState(false);
  const [showInstall, setShowInstall] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("installPromptDismissed") !== "1";
  });
  const fetchUserPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .single();
    setUserPlan(data?.status === "active" ? (data?.plan ?? "freebie") : "freebie");
  }, []);

  // Handle PayFast return redirect — navigate to settings and show result.
  // ITN runs server-side asynchronously, so retry the plan fetch a few times
  // before giving up; otherwise the navigation gate stays on the pre-payment plan
  // until the user reloads.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success" || payment === "cancelled") {
      setPaymentReturn(payment);
      setActiveView("settings");
      window.history.replaceState({}, "", "/");
    }
    if (payment !== "success") return;
    const timers = [2000, 6000, 12000].map((ms) =>
      setTimeout(() => { void fetchUserPlan(); }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [fetchUserPlan]);

  useEffect(() => {
    const onUpgradeNeeded = (e: Event) => {
      const detail = (e as CustomEvent<{ reason?: string; matricOnly?: boolean }>).detail;
      setUpgradeReason(detail?.reason);
      setUpgradeMatricOnly(detail?.matricOnly ?? false);
      setShowUpgradeModal(true);
    };
    document.addEventListener("ruby-upgrade-needed", onUpgradeNeeded);
    return () => document.removeEventListener("ruby-upgrade-needed", onUpgradeNeeded);
  }, []);

  useEffect(() => {
    if (showUpgradeOnMount) {
      setUpgradeMatricOnly(true);
      setShowUpgradeModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshStats();

    // Maths + reading: trigger survey after each micro skill is mastered
    const onSkillMastered = (e: Event) => {
      const type = (e as CustomEvent).detail?.type as "maths" | "reading";
      if (!type) return;
      // During onboarding discovery, skip the survey — onSelectPlan in the
      // session component handles the transition to PostDiscoveryScreen.
      if (onPostDiscovery) return;
      setSurvey({ type });
    };
    document.addEventListener("ruby-skill-mastered", onSkillMastered);

    // Streak milestone toast — fires when a new-day streak update happens
    const STREAK_MILESTONES = [3, 7, 14, 30];
    const onStreakUpdated = (e: Event) => {
      const newStreak = (e as CustomEvent<{ streak: number }>).detail?.streak;
      if (!newStreak) return;
      const key = `streak_milestone_${newStreak}_shown`;
      if (STREAK_MILESTONES.includes(newStreak) && !localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        setStreakToast(newStreak);
      }
    };
    document.addEventListener("ruby-streak-updated", onStreakUpdated);

    return () => {
      document.removeEventListener("ruby-skill-mastered", onSkillMastered);
      document.removeEventListener("ruby-streak-updated", onStreakUpdated);
    };
  }, [refreshStats, onPostDiscovery]);

  useEffect(() => { void fetchUserPlan(); }, [fetchUserPlan]);

  // Hydrate the reading profile on mount too (refreshStats only does maths), so
  // a reading-skill-tree initial view — e.g. landing here straight after
  // onboarding Discovery — has the learner's placement to show.
  useEffect(() => {
    void hydrateReadingProfileFromSupabase().then((p) => setReadingProfile(p));
  }, []);

  // Paid matric *features* only. The Physical Sciences subject tree
  // (matric-phys-sci / matric-phys-sci-skill-tree) is a learning subject and is
  // free for all plans, so it is intentionally NOT gated here.
  const MATRIC_VIEWS: ActiveView[] = ["matrics", "matric", "prep-papers-2026", "study-guides"];

  const MATRIC_PLANS = ["master", "matric-pack"];

  const handleViewChange = (view: ActiveView) => {
    // Gate matric features — accessible on Master and Matric Pack plans
    if (MATRIC_VIEWS.includes(view) && userPlan !== null && !MATRIC_PLANS.includes(userPlan)) {
      document.dispatchEvent(
        new CustomEvent("ruby-upgrade-needed", {
          detail: {
            reason: "Matric Past Papers, Study Guides and Prep Papers require the Matric Exam Pack or Master plan.",
            matricOnly: true,
          },
        })
      );
      return;
    }

    // Chat: trigger survey when leaving chat after sending at least one message
    if (activeView === "chat" && chatEngaged) {
      const key = "survey_count_chat";
      const count = parseInt(localStorage.getItem(key) || "0", 10) + 1;
      localStorage.setItem(key, String(count));
      // Fire every 3rd chat exit where a message was sent
      if (count % 3 === 0) setSurvey({ type: "chat" });
      setChatEngaged(false);
    }
    // Opening chat from the nav is the general Ruby chat; a tutor card sets the
    // tutor right after this call, so the last write (the tutor) wins.
    if (view === "chat") setSelectedTutor(null);
    setActiveView(view);
    if (view === "skill-tree" || view === "student-dashboard" || view === "ruby" || view === "discover-maths") {
      void hydrateStudentProfileFromSupabase().then((p) => setRubyProfile(p));
    }
    if (view === "reading" || view === "reading-skill-tree" || view === "discover-reading") {
      void hydrateReadingProfileFromSupabase().then((p) => setReadingProfile(p));
    }

    // Show feature tutorial on first visit
    const tutKey = FEATURE_TUTORIAL_KEYS[view];
    if (tutKey && !localStorage.getItem(tutKey)) {
      localStorage.setItem(tutKey, "1");
      setActiveTutorial(view);
    }
  };

  // ── Tap-to-replay (Maths / Reading) ───────────────────────────────────────
  // A completed/attained skill tapped in the tree opens the session in an
  // isolated "replay" mode: same questions, but no progression is written.
  // We stash the target skill in sessionStorage (same pattern as the existing
  // ruby_reading_retake flag) and the session reads it on mount.
  const startMathsReplay = (skillId: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem("ruby_maths_replay_skill", skillId);
    handleViewChange("ruby");
  };
  const startReadingReplay = (skillId: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem("ruby_reading_replay_skill", skillId);
    handleViewChange("reading");
  };
  // Open the Afrikaans subject and jump straight into the picked skill.
  const startAfrikaansSkill = (skillId: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem("ruby_afrikaans_target_skill", skillId);
    handleViewChange("afrikaans-fal");
  };

  // ── Continue where you left off (Maths / Reading) ─────────────────────────
  // Resume the current skill's session. We clear any stale replay flag first so
  // this is a normal resume (progression on), not an isolated replay.
  const continueMaths = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("ruby_maths_replay_skill");
    handleViewChange("ruby");
  };
  const continueReading = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("ruby_reading_replay_skill");
    handleViewChange("reading");
  };

  // ── Maths Literacy replay + continue ──────────────────────────────────────
  const startMathsLiteracyReplay = (skillId: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem("ruby_maths_literacy_replay_skill", skillId);
    handleViewChange("maths-literacy");
  };
  const continueMathsLiteracy = () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("ruby_maths_literacy_replay_skill");
    handleViewChange("maths-literacy");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100">
      {/* ── Streak milestone toast ──────────────────────────────────────── */}
      {streakToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3 max-w-sm w-[calc(100%-2rem)] animate-bounce-once">
          <span className="text-3xl">🔥</span>
          <div className="flex-1">
            <p className="font-bold text-base">{streakToast}-day streak!</p>
            <p className="text-orange-100 text-sm">You&apos;re on a roll, keep it up!</p>
          </div>
          <button
            onClick={() => setStreakToast(null)}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {showInstall && <InstallPrompt onDismiss={() => setShowInstall(false)} />}

      {/* Mobile top bar — in normal flow so banner shows above it */}
      <header className="md:hidden flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
          data-tutorial="hamburger"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="flex-1 min-w-0 truncate font-semibold text-gray-800 text-sm">{viewLabels[activeView]}</span>
        <UsageMeter variant="compact" theme="light" />
        {["chat", "ruby", "reading", "discover-maths", "discover-reading", "discover", "subjects"].includes(activeView) ? (
          <button
            onClick={() => document.dispatchEvent(new CustomEvent("ruby-action"))}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label="Restart / Clear"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => setShowLangPicker(true)}
            className="p-1.5 rounded-lg transition-opacity hover:opacity-80"
            aria-label="Change language"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
          </button>
        )}
      </header>

      {/* Inner row: sidebar + main content side by side */}
      <div className="flex flex-1 overflow-hidden min-h-0">

      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onSettings={() => handleViewChange("settings")}
        onOpenLangPicker={() => setShowLangPicker(true)}
        userPlan={userPlan}
        onLogout={async () => {
          // Do NOT wipe localStorage on logout — data belongs to this user and
          // must still be visible when they log back in on the same device.
          await supabase.auth.signOut();
          window.location.reload();
        }}
      />

      {showLangPicker && <LanguagePickerModal onClose={() => setShowLangPicker(false)} />}

      <main className="flex-1 overflow-hidden h-full flex flex-col min-h-0">
        {/* Daily usage counters pinned to the top of skill-question views for
            freebie users (desktop). Mobile already shows them in the top bar;
            paid plans are unlimited, so nothing renders for them. */}
        {isFreebie && SESSION_VIEWS.includes(activeView) && (
          <div className="hidden md:flex flex-shrink-0 items-center justify-center gap-2 bg-white border-b border-gray-200 px-4 py-2">
            <span className="text-xs font-medium text-gray-500">Today&apos;s usage:</span>
            <UsageMeter variant="compact" theme="light" />
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
        {activeView === "home" && <HomeScreen onNavigate={handleViewChange} userPlan={userPlan} onOpenLangPicker={() => setShowLangPicker(true)} onOpenChatWithTutor={(name) => { handleViewChange("chat"); setSelectedTutor(name); }} />}
        {activeView === "chat" && (
          selectedTutor
            ? <ChatInterface onMessageSent={() => { refreshStats(); setChatEngaged(true); }} tutorName={selectedTutor} onChangeTutor={() => setSelectedTutor(null)} />
            : <CharacterPicker onPick={(name) => setSelectedTutor(name)} />
        )}
        {activeView === "progress" && <ProgressTracker
          onMathsReplaySkill={startMathsReplay}
          onReadingReplaySkill={startReadingReplay}
          onMathsContinue={continueMaths}
          onReadingContinue={continueReading}
          onAfrikaansPickSkill={startAfrikaansSkill}
          onSocialSciencesOpen={() => handleViewChange("social-sciences")}
          onLifeSkillsPickTopic={() => handleViewChange("life-skills")}
          onNstOpen={() => handleViewChange("natural-sciences-tech")}
          onMatricPhysSciPickSkill={() => handleViewChange("matric-phys-sci")}
          onMathsLiteracyContinue={continueMathsLiteracy}
          onMathsLiteracyReplaySkill={startMathsLiteracyReplay}
          onLifeSciencesPickSkill={() => handleViewChange("life-sciences")}
          onHistoryPickSkill={() => handleViewChange("history")}
          onBusinessStudiesPickSkill={() => handleViewChange("business-studies")}
          onTourismPickSkill={() => handleViewChange("tourism")}
          onGeographyPickSkill={() => handleViewChange("geography")}
          onNaturalSciencesSpPickSkill={() => handleViewChange("natural-sciences-sp")}
        />}
        {activeView === "ruby" && <ErrorBoundary><DiagnosticSession onExitReplay={() => handleViewChange("skill-tree")} /></ErrorBoundary>}
        {activeView === "discover-maths" && <ErrorBoundary><DiagnosticSession onSelectPlan={onPostDiscovery} /></ErrorBoundary>}
        {activeView === "skill-tree" && <SkillTreeView profile={rubyProfile} onReplaySkill={startMathsReplay} onContinue={continueMaths} onBack={() => handleViewChange("subjects")} />}
        {activeView === "student-dashboard" && <StudentDashboard profile={rubyProfile} />}
        {activeView === "reading" && <ErrorBoundary><ReadingSession onExitReplay={() => handleViewChange("reading-skill-tree")} /></ErrorBoundary>}
        {activeView === "discover-reading" && <ErrorBoundary><ReadingSession onSelectPlan={onPostDiscovery} /></ErrorBoundary>}
        {activeView === "reading-skill-tree" && <ReadingSkillTreeView profile={readingProfile} onReplaySkill={startReadingReplay} onContinue={continueReading} onBack={() => handleViewChange("subjects")} />}
        {activeView === "life-skills" && <ErrorBoundary><LifeSkillsSession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "life-skills-skill-tree" && <LifeSkillsSkillTreeView onPickTopic={() => handleViewChange("life-skills")} onBack={() => handleViewChange("subjects")} />}
        {activeView === "social-sciences" && <ErrorBoundary><SocialSciencesSession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "social-sciences-skill-tree" && <SocialSciencesSkillTreeView onPickTopic={() => handleViewChange("social-sciences")} onBack={() => handleViewChange("subjects")} />}
        {activeView === "natural-sciences-tech" && <ErrorBoundary><NstSession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "natural-sciences-tech-skill-tree" && <NstSkillTreeView onPickTopic={() => handleViewChange("natural-sciences-tech")} onBack={() => handleViewChange("subjects")} />}
        {activeView === "matric-phys-sci" && <ErrorBoundary><MatricPhysSciSession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "matric-phys-sci-skill-tree" && <MatricPhysSciSkillTreeView onPickSkill={() => handleViewChange("matric-phys-sci")} onBack={() => handleViewChange("subjects")} />}
        {/* Afrikaans FAL — free, like reading (not in the Scholar/MATRIC gated lists) */}
        {activeView === "afrikaans-fal" && <ErrorBoundary><AfrikaansSession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "afrikaans-fal-skill-tree" && <AfrikaansSkillTreeView onPickSkill={() => handleViewChange("afrikaans-fal")} profile={null} onBack={() => handleViewChange("subjects")} />}
        {/* Maths Literacy — FET Phase (Gr 10–12) */}
        {activeView === "maths-literacy" && <ErrorBoundary><MathsLiteracyEngine onBack={() => handleViewChange("subjects")} onExitReplay={() => handleViewChange("maths-literacy-skill-tree")} /></ErrorBoundary>}
        {activeView === "maths-literacy-skill-tree" && <MathsLiteracySkillTreeView onReplaySkill={startMathsLiteracyReplay} onContinue={continueMathsLiteracy} onBack={() => handleViewChange("subjects")} />}
        {/* Life Sciences — FET Phase (Gr 10–12), free like Reading */}
        {activeView === "life-sciences" && <ErrorBoundary><LifeSciencesSession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "life-sciences-skill-tree" && <LifeSciencesSkillTreeView onPickSkill={() => handleViewChange("life-sciences")} profile={null} onBack={() => handleViewChange("subjects")} />}
        {/* History — FET Phase (Gr 10–12), free like Life Sciences */}
        {activeView === "history" && <ErrorBoundary><HistorySession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "history-skill-tree" && <HistorySkillTreeView onPickSkill={() => handleViewChange("history")} profile={null} onBack={() => handleViewChange("subjects")} />}
        {/* Business Studies — FET Phase (Gr 10–12), free like History */}
        {activeView === "business-studies" && <ErrorBoundary><BusinessStudiesSession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "business-studies-skill-tree" && <BusinessStudiesSkillTreeView onPickSkill={() => handleViewChange("business-studies")} profile={null} onBack={() => handleViewChange("subjects")} />}
        {/* Tourism — FET Phase (Gr 10–12), free like History */}
        {activeView === "tourism" && <ErrorBoundary><TourismSession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "tourism-skill-tree" && <TourismSkillTreeView onPickSkill={() => handleViewChange("tourism")} profile={null} onBack={() => handleViewChange("subjects")} />}
        {/* Geography — FET Phase (Gr 10–12), free like History */}
        {activeView === "geography" && <ErrorBoundary><GeographySession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "geography-skill-tree" && <GeographySkillTreeView onPickSkill={() => handleViewChange("geography")} profile={null} onBack={() => handleViewChange("subjects")} />}
        {/* Natural Sciences — Senior Phase (Gr 7–9), free like Geography */}
        {activeView === "natural-sciences-sp" && <ErrorBoundary><NaturalSciencesSpSession onBack={() => handleViewChange("subjects")} /></ErrorBoundary>}
        {activeView === "natural-sciences-sp-skill-tree" && <NaturalSciencesSpSkillTreeView onPickSkill={() => handleViewChange("natural-sciences-sp")} profile={null} onBack={() => handleViewChange("subjects")} />}
        {activeView === "settings" && <SettingsView onBack={() => handleViewChange("home")} paymentReturn={paymentReturn} onNavigate={handleViewChange} />}
        {activeView === "discover" && <DiscoverHub onNavigate={handleViewChange} />}
        {activeView === "subjects" && <SubjectsHub onNavigate={handleViewChange} />}
        {activeView === "matrics" && <MatricsHub onNavigate={handleViewChange} />}
        {activeView === "matric" && <MatricPastPapers onBack={() => handleViewChange("matrics")} />}
        {activeView === "prep-papers-2026" && <PrepPapers2026 onBack={() => handleViewChange("matrics")} />}
        {activeView === "watch" && <WatchComingSoon />}
        {activeView === "study-guides" && <StudyGuides onBack={() => handleViewChange("matrics")} />}
        </div>
      </main>

      </div>{/* end inner row */}

      {survey && (
        <PostSessionSurvey
          sessionType={survey.type}
          onClose={() => setSurvey(null)}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          reason={upgradeReason}
          matricOnly={upgradeMatricOnly}
          onDismiss={() => { setShowUpgradeModal(false); setUpgradeReason(undefined); setUpgradeMatricOnly(false); }}
        />
      )}

      {/* Contextual feature tutorials — shown first time user visits each feature */}
      {activeTutorial === "subjects"    && <SubjectsTutorial   onComplete={() => setActiveTutorial(null)} />}
      {activeTutorial === "discover"    && <DiscoveryTutorial  onComplete={() => setActiveTutorial(null)} />}
      {activeTutorial === "ruby"        && <MathsTutorial      onComplete={() => setActiveTutorial(null)} />}
      {activeTutorial === "reading"     && <ReadingTutorial    onComplete={() => setActiveTutorial(null)} />}
      {activeTutorial === "chat"        && <HomeworkTutorial   onComplete={() => setActiveTutorial(null)} />}
      {activeTutorial === "skill-tree"  && <SkillTreeTutorial  onComplete={() => setActiveTutorial(null)} />}
      {activeTutorial === "matric"      && <MatricTutorial     onComplete={() => setActiveTutorial(null)} />}
      {activeTutorial === "prep-papers-2026" && <PrepPapersTutorial onComplete={() => setActiveTutorial(null)} />}
      {activeTutorial === "progress"    && <ProgressTutorial   onComplete={() => setActiveTutorial(null)} />}

      <FloatingFeedback />
    </div>
  );
}

// ── Onboarding gate — wraps AppContent in LanguageProvider ───────────────────
// ── Account-created welcome screen ────────────────────────────────────────────
const InstallPrompt = dynamic(() => import("@/components/InstallPrompt"), { ssr: false });

function WelcomeScreen({ name, onStartLearning }: { name: string; onStartLearning: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
        <h1 className="text-2xl font-bold text-[#1a2744]">
          Welcome, {name}! 🎉
        </h1>
        <p className="text-gray-500 text-base">Your account has been created and you&apos;re all set to start your learning journey.</p>

        <div className="flex justify-center">
          <img
            src="/ruby-heroes.png"
            alt="Ruby superheroes"
            className="h-44 w-auto object-contain"
          />
        </div>

        <button
          onClick={onStartLearning}
          className="w-full py-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-colors shadow-md"
        >
          Select Your Plan 🚀
        </button>
      </div>
    </div>
  );
}

// ── Post-onboarding discovery prompt ──────────────────────────────────────────
function DiscoveryPromptScreen({
  name,
  grade,
  onSelect,
  onMatricPrep,
  onSkip,
}: {
  name: string;
  grade?: string;
  onSelect: (subject: "maths" | "reading") => void;
  onMatricPrep?: () => void;
  onSkip: () => void;
}) {
  const isGrade12 = grade === "12";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6B1020] via-[#C41930] to-[#FF6080] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
        <div className="text-5xl">🧭</div>
        <h1 className="text-2xl font-bold text-[#1a2744]">
          Welcome, {name}! Let&apos;s find your level
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          {isGrade12
            ? "Jump straight into Matric Prep, or take a Discovery Activity so Ruby knows where to start."
            : "Take a quick Discovery Activity so Ruby knows exactly where to start your learning journey."}
        </p>
        <div className="space-y-3 pt-1">
          {isGrade12 && onMatricPrep && (
            <button
              onClick={onMatricPrep}
              className="w-full py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>🎓</span> Go to Matric Prep
            </button>
          )}
          {isGrade12 && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or take a Discovery first</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}
          <button
            onClick={() => onSelect("maths")}
            className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span>🧮</span> Start Maths Discovery
          </button>
          <button
            onClick={() => onSelect("reading")}
            className="w-full py-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span>📖</span> Start Reading Discovery
          </button>
          <button
            onClick={onSkip}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            I&apos;ll do this later
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Post-discovery bridge — shown after Discovery completes, before plan selection ──
function PostDiscoveryScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold text-[#1a2744]">
          Discovery complete!
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Ruby now knows your starting level. To unlock your full personalised learning journey, choose a plan that works for you.
        </p>
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] text-white font-bold text-lg transition-colors shadow-md"
        >
          Choose a Plan
        </button>
      </div>
    </div>
  );
}

// ── Tutorial welcome screen — shown once after onboarding + discovery ─────────
function TutorialWelcomeScreen({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
        <h1 className="text-2xl font-bold text-[#1a2744]">
          Let&apos;s show you what Ruby can do for you
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          As you explore each feature for the first time, Ruby will give you a quick tip to help you get the most out of it.
        </p>
        <div className="flex justify-center">
          <img
            src="/ruby-heroes.png"
            alt="Ruby characters"
            className="h-44 w-auto object-contain"
          />
        </div>
        <button
          onClick={onStart}
          className="w-full py-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-colors shadow-md"
        >
          Let&apos;s go 🚀
        </button>
        <button
          onClick={onSkip}
          className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip tutorial
        </button>
      </div>
    </div>
  );
}

// ── App gate — checks session before showing onboarding ────────────────────────
export default function Home() {
  const [appState, setAppState] = useState<"loading" | "onboarding" | "welcome" | "plan-selection" | "discovery-prompt" | "post-discovery" | "tutorial-welcome" | "app" | "trial-expired">("loading");
  const [welcomeName, setWelcomeName] = useState("");
  const [welcomeGrade, setWelcomeGrade] = useState("");
  const [pendingDiscovery, setPendingDiscovery] = useState<"maths" | "reading" | null>(null);
  // Which subject's Discovery just finished, so the final post-onboarding mount
  // can land the learner in that skill tree instead of dumping them on Home.
  const [lastDiscovery, setLastDiscovery] = useState<"maths" | "reading" | null>(null);
  const [matricPrepPending, setMatricPrepPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== null) {
      supabase.auth.signOut();
      window.history.replaceState({}, "", window.location.pathname);
      setAppState("onboarding");
      return;
    }

    // Check for an existing valid session — if found, skip login entirely
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // If returning from a PayFast payment, skip trial check — ITN will update DB async
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("payment") === "success") {
          const pendingAfterPayment = localStorage.getItem("ruby_pending_step");
          if (pendingAfterPayment === "plan-selection" || pendingAfterPayment === "tutorial") {
            localStorage.removeItem("ruby_pending_step");
            setAppState("app");
          } else {
            setAppState("app");
          }
          return;
        }

        // Check trial expiry and subscription status
        const { data: userData } = await supabase
          .from("users")
          .select("trial_expires_at")
          .eq("id", session.user.id)
          .single();

        const { data: subData } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const hasActiveSub = subData?.status === "active";
        const trialExpired = userData?.trial_expires_at
          ? new Date(userData.trial_expires_at) < new Date()
          : false;

        if (!hasActiveSub && trialExpired) {
          setAppState("trial-expired");
        } else {
          const pendingStep = localStorage.getItem("ruby_pending_step");
          if (pendingStep === "plan-selection") {
            setAppState("plan-selection");
          } else {
            setAppState("app");
          }
        }
      } else {
        setAppState("onboarding");
      }
    });

    // Only reset to onboarding on explicit sign-out — never interrupt an active onboarding flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
        setAppState("onboarding");
      }
      // Count a session whenever Supabase reports an authenticated state.
      // Covers INITIAL_SESSION (cached login), SIGNED_IN (fresh sign-in), and refresh events.
      // sessionStorage guard inside incrementSession ensures one count per tab.
      if (session) incrementSession();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    if (data.plan === "existing") {
      setAppState("app");
    } else {
      // Clear any stale tutorial-seen keys so this new account always gets fresh tutorials
      Object.values(FEATURE_TUTORIAL_KEYS).forEach((k) => localStorage.removeItem(k));
      localStorage.setItem("ruby_pending_step", "plan-selection");
      setWelcomeName(data.name || "");
      setWelcomeGrade(data.grade || "");
      // Show tutorial-welcome immediately — before discovery — so it's never skipped
      setAppState("tutorial-welcome");
    }
  };

  if (appState === "loading") return null;

  if (appState === "onboarding") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (appState === "discovery-prompt") {
    return (
      <DiscoveryPromptScreen
        name={welcomeName}
        grade={welcomeGrade}
        onSelect={(subject) => {
          setPendingDiscovery(subject);
          setAppState("app");
        }}
        onMatricPrep={() => {
          setMatricPrepPending(true);
          setAppState("app");
        }}
        onSkip={() => {
          // User chose to skip Discovery for now — drop them straight into the app.
          // They can still take it later from the Home or Subjects pages.
          setPendingDiscovery(null);
          setLastDiscovery(null);
          setAppState("app");
        }}
      />
    );
  }

  if (appState === "welcome") {
    return (
      <WelcomeScreen
        name={welcomeName}
        onStartLearning={() => setAppState("plan-selection")}
      />
    );
  }

  if (appState === "plan-selection") {
    return (
      <div className="h-dvh bg-gradient-to-br from-[#6B1020] via-[#C41930] to-[#FF6080] flex items-center justify-center p-4">
        {/* White card is the scroll container — html+body are overflow:hidden */}
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl h-full overflow-y-auto">
          <PricingPlans
            mode="onboarding"
            showHeader
            onSelectFree={() => setAppState("app")}
          />
        </div>
      </div>
    );
  }

  if (appState === "tutorial-welcome") {
    return (
      <TutorialWelcomeScreen
        onStart={() => setAppState("discovery-prompt")}
        onSkip={() => setAppState("discovery-prompt")}
      />
    );
  }

  // ── Post-onboarding in-app discovery flow ──────────────────────────────────
  // Renders the full app UI with the discovery view pre-selected. After the
  // placement completes the user views the report, then is guided to the tutorial.
  if (pendingDiscovery && appState === "app") {
    const discoveryView: ActiveView = pendingDiscovery === "maths" ? "discover-maths" : "discover-reading";
    return (
      <LanguageProvider>
        <AppContent
          initialView={discoveryView}
          onPostDiscovery={() => {
            setLastDiscovery(pendingDiscovery);
            setPendingDiscovery(null);
            setAppState("post-discovery");
          }}
        />
      </LanguageProvider>
    );
  }

  if (appState === "post-discovery") {
    return (
      <PostDiscoveryScreen
        onContinue={() => setAppState("plan-selection")}
      />
    );
  }

  if (appState === "trial-expired") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6B1020] via-[#C41930] to-[#FF6080] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl my-4 overflow-hidden">
          <div className="text-center px-8 pt-8 pb-2">
            <div className="text-5xl mb-3">⏰</div>
            <h1 className="text-2xl font-bold text-[#1a2744]">Your 7-day trial has ended</h1>
            <p className="text-gray-400 text-sm mt-1">Upgrade to keep learning</p>
          </div>
          <PricingPlans mode="upgrade" showHeader={false} />
        </div>
      </div>
    );
  }

  // After onboarding Discovery, land the learner in the matching skill tree
  // (so the tree opens and their placement + "Continue" button are right there)
  // instead of dropping them on Home. Returning users get the default (home).
  const postOnboardingView: ActiveView | undefined =
    lastDiscovery === "reading" ? "reading-skill-tree"
    : lastDiscovery === "maths" ? "skill-tree"
    : undefined;

  return (
    <LanguageProvider>
      <AppContent
        initialView={postOnboardingView}
        onPostDiscovery={undefined}
        showUpgradeOnMount={matricPrepPending}
      />
    </LanguageProvider>
  );
}
