"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
// ── Always-needed (static imports) ──────────────────────────────────────────
import Sidebar from "@/components/Sidebar";
import HomeScreen from "@/components/HomeScreen";
import OnboardingFlow, { OnboardingData } from "@/components/onboarding/OnboardingFlow";
import BetaBanner from "@/components/beta/BetaBanner";

// ── Loaded on demand (dynamic imports) ──────────────────────────────────────
const ChatInterface        = dynamic(() => import("@/components/ChatInterface"),                       { ssr: false });
const ProgressTracker      = dynamic(() => import("@/components/ProgressTracker"),                     { ssr: false });
const DiagnosticSession    = dynamic(() => import("@/components/ruby/DiagnosticSession"),               { ssr: false });
const SkillTreeView        = dynamic(() => import("@/components/ruby/SkillTreeView"),                   { ssr: false });
const StudentDashboard     = dynamic(() => import("@/components/ruby/StudentDashboard"),                { ssr: false });
const ReadingSession       = dynamic(() => import("@/components/reading/ReadingSession"),               { ssr: false });
const ReadingSkillTreeView = dynamic(() => import("@/components/reading/ReadingSkillTreeView"),         { ssr: false });
const SettingsView         = dynamic(() => import("@/components/SettingsView"),                        { ssr: false });
const MatricComingSoon     = dynamic(() => import("@/components/MatricComingSoon"),                     { ssr: false });
const WatchComingSoon      = dynamic(() => import("@/components/WatchComingSoon"),                      { ssr: false });
const LanguagePickerModal  = dynamic(() => import("@/components/LanguagePickerModal"),                  { ssr: false });
const PostSessionSurvey    = dynamic(() => import("@/components/beta/PostSessionSurvey"),               { ssr: false });
const FloatingFeedback     = dynamic(() => import("@/components/beta/FloatingFeedback"),                { ssr: false });
import ErrorBoundary from "@/components/ErrorBoundary";
const TrialExpiredScreen = dynamic(() => import("@/components/TrialExpiredScreen"), { ssr: false });
import { supabase } from "@/lib/supabase";
import { ActiveView } from "@/types";
import { LanguageProvider, useT } from "@/lib/i18n";
import { getProgress, incrementSession, clearAllUserData, PERSISTENT_USER_KEYS } from "@/lib/storage";
import { getStudentProfile } from "@/lib/student-model";
import { getReadingProfile } from "@/lib/reading-student-model";
import { StudentProfile } from "@/types/ruby";
import { ReadingStudentProfile } from "@/types/reading";

// ── Inner app — must live inside LanguageProvider to access useT ──────────────
function AppContent() {
  const { t } = useT();

  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [paymentReturn, setPaymentReturn] = useState<"success" | "cancelled" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ lessonsCompleted: 0 });
  const [rubyProfile, setRubyProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [survey, setSurvey] = useState<{ type: "maths" | "reading" | "chat" } | null>(null);

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
  };

  const refreshStats = useCallback(() => {
    const progress = getProgress();
    setStats({ lessonsCompleted: progress.lessonsCompleted });
    setRubyProfile(getStudentProfile());
  }, []);

  // Track chat engagement (at least one message sent this session)
  const [chatEngaged, setChatEngaged] = useState(false);
  const chatMessageCountRef = useRef(0);

  // Handle PayFast return redirect — navigate to settings and show result
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success" || payment === "cancelled") {
      setPaymentReturn(payment);
      setActiveView("settings");
      // Clean URL without reload
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    refreshStats();

    // Maths + reading: count session + trigger survey after each micro skill is mastered
    const onSkillMastered = (e: Event) => {
      const type = (e as CustomEvent).detail?.type as "maths" | "reading";
      if (!type) return;
      incrementSession();
      setSurvey({ type });
    };
    document.addEventListener("ruby-skill-mastered", onSkillMastered);
    return () => document.removeEventListener("ruby-skill-mastered", onSkillMastered);
  }, [refreshStats]);

  const handleViewChange = (view: ActiveView) => {
    // Chat: trigger survey when leaving chat after sending at least one message
    if (activeView === "chat" && chatEngaged) {
      const key = "survey_count_chat";
      const count = parseInt(localStorage.getItem(key) || "0", 10) + 1;
      localStorage.setItem(key, String(count));
      // Fire every 3rd chat exit where a message was sent
      if (count % 3 === 0) setSurvey({ type: "chat" });
      setChatEngaged(false);
    }
    setActiveView(view);
    if (view === "skill-tree" || view === "student-dashboard") {
      setRubyProfile(getStudentProfile());
    }
    if (view === "reading" || view === "reading-skill-tree") {
      setReadingProfile(getReadingProfile());
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100">
      <BetaBanner />

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
        <span className="flex-1 font-semibold text-gray-800 text-sm">{viewLabels[activeView]}</span>
        {["chat", "ruby", "reading"].includes(activeView) ? (
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
        onSettings={() => handleViewChange("settings")}
        onOpenLangPicker={() => setShowLangPicker(true)}
        onLogout={async () => {
          // Do NOT wipe localStorage on logout — data belongs to this user and
          // must still be visible when they log back in on the same device.
          await supabase.auth.signOut();
          window.location.reload();
        }}
      />

      {showLangPicker && <LanguagePickerModal onClose={() => setShowLangPicker(false)} />}

      <main className="flex-1 overflow-hidden h-full">
        {activeView === "home" && <HomeScreen onNavigate={handleViewChange} />}
        {activeView === "chat" && <ChatInterface onMessageSent={() => { chatMessageCountRef.current += 1; if (chatMessageCountRef.current >= 3) incrementSession(); refreshStats(); setChatEngaged(true); }} />}
        {activeView === "progress" && <ProgressTracker />}
        {activeView === "ruby" && <ErrorBoundary><DiagnosticSession /></ErrorBoundary>}
        {activeView === "skill-tree" && <SkillTreeView profile={rubyProfile} />}
        {activeView === "student-dashboard" && <StudentDashboard profile={rubyProfile} />}
        {activeView === "reading" && <ErrorBoundary><ReadingSession /></ErrorBoundary>}
        {activeView === "reading-skill-tree" && <ReadingSkillTreeView profile={readingProfile} />}
        {activeView === "settings" && <SettingsView onBack={() => handleViewChange("home")} paymentReturn={paymentReturn} />}
        {activeView === "matric" && <MatricComingSoon />}
        {activeView === "watch" && <WatchComingSoon />}
      </main>

      </div>{/* end inner row */}

      {survey && (
        <PostSessionSurvey
          sessionType={survey.type}
          onClose={() => setSurvey(null)}
        />
      )}
      <FloatingFeedback />
    </div>
  );
}

// ── Onboarding gate — wraps AppContent in LanguageProvider ───────────────────
// ── Account-created welcome screen ────────────────────────────────────────────
const InstallPrompt = dynamic(() => import("@/components/InstallPrompt"), { ssr: false });

function WelcomeScreen({ name, onStartLearning }: { name: string; onStartLearning: () => void }) {
  const [showInstall, setShowInstall] = useState(false);

  const handleStartLearning = () => {
    setShowInstall(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
        <h1 className="text-2xl font-bold text-[#1a2744]">
          Welcome, {name}! 🎉
        </h1>
        <p className="text-gray-500 text-base">Your account has been created and you&apos;re all set to start your learning journey.</p>

        {/* Hero characters */}
        <div className="flex justify-center">
          <img
            src="/ruby-heroes.png"
            alt="Ruby superheroes"
            className="h-44 w-auto object-contain"
          />
        </div>

        <button
          onClick={handleStartLearning}
          className="w-full py-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-colors shadow-md"
        >
          Start Learning 🚀
        </button>
      </div>

      {showInstall && (
        <InstallPrompt onDismiss={onStartLearning} />
      )}
    </div>
  );
}

// ── App gate — checks session before showing onboarding ────────────────────────
export default function Home() {
  const [appState, setAppState] = useState<"loading" | "onboarding" | "welcome" | "app" | "trial-expired">("loading");
  const [welcomeName, setWelcomeName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== null) {
      clearAllUserData();
      supabase.auth.signOut();
      window.history.replaceState({}, "", window.location.pathname);
      setAppState("onboarding");
      return;
    }

    // Check for an existing valid session — if found, skip login entirely
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        if (session.user.id) localStorage.setItem("current_user_id", session.user.id);
        // Ensure onboardingData has the user's name — may be absent on a fresh device
        try {
          const raw = localStorage.getItem("onboardingData");
          const existing = raw ? JSON.parse(raw) : {};
          if (!existing.name) {
            const fullName =
              (session.user.user_metadata?.full_name as string | undefined) ||
              (session.user.email?.split("@")[0] ?? "");
            if (fullName) {
              localStorage.setItem(
                "onboardingData",
                JSON.stringify({ ...existing, name: fullName })
              );
            }
          }
        } catch { /* ignore */ }

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
          .single();

        const hasActiveSub = subData?.status === "active";
        const trialExpired = userData?.trial_expires_at
          ? new Date(userData.trial_expires_at) < new Date()
          : false;

        if (!hasActiveSub && trialExpired) {
          setAppState("trial-expired");
        } else {
          setAppState("app");
        }
      } else {
        setAppState("onboarding");
      }
    });

    // Handle session loss (e.g. token expiry, logout from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setAppState("onboarding");
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    const storedUserId = localStorage.getItem("current_user_id");
    const isDifferentUser = data.userId && storedUserId && storedUserId !== data.userId;

    if (data.plan === "existing") {
      // Returning user — only wipe data if a DIFFERENT user is logging in on this device
      if (isDifferentUser) {
        PERSISTENT_USER_KEYS.forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem("current_user_id");
      }
      if (data.userId) localStorage.setItem("current_user_id", data.userId);
      setAppState("app");
    } else {
      // New signup — wipe any previous user's data, then restore fresh onboarding data
      PERSISTENT_USER_KEYS.forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem("current_user_id");
      localStorage.setItem("onboardingData", JSON.stringify(data));
      if (data.userId) localStorage.setItem("current_user_id", data.userId);
      setWelcomeName(data.name || "");
      setAppState("welcome");
    }
  };

  if (appState === "loading") return null;

  if (appState === "onboarding") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (appState === "welcome") {
    return (
      <WelcomeScreen
        name={welcomeName}
        onStartLearning={() => setAppState("app")}
      />
    );
  }

  if (appState === "trial-expired") {
    return <TrialExpiredScreen />;
  }

  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
