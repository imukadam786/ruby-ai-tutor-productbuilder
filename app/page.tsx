"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import ProgressTracker from "@/components/ProgressTracker";
import DiagnosticSession from "@/components/ruby/DiagnosticSession";
import SkillTreeView from "@/components/ruby/SkillTreeView";
import StudentDashboard from "@/components/ruby/StudentDashboard";
import ReadingSession from "@/components/reading/ReadingSession";
import ReadingSkillTreeView from "@/components/reading/ReadingSkillTreeView";
import OnboardingFlow, { OnboardingData } from "@/components/onboarding/OnboardingFlow";
import HomeScreen from "@/components/HomeScreen";
import SettingsView from "@/components/SettingsView";
import MatricComingSoon from "@/components/MatricComingSoon";
import WatchComingSoon from "@/components/WatchComingSoon";
import LanguagePickerModal from "@/components/LanguagePickerModal";
import PostSessionSurvey from "@/components/beta/PostSessionSurvey";
import BetaBanner from "@/components/beta/BetaBanner";
import FloatingFeedback from "@/components/beta/FloatingFeedback";
import { supabase } from "@/lib/supabase";
import { ActiveView } from "@/types";
import { LanguageProvider, useT } from "@/lib/i18n";
import { getProgress, incrementSession, clearAllUserData, PLACEMENT_PROFILE_KEYS } from "@/lib/storage";
import { getStudentProfile } from "@/lib/student-model";
import { getReadingProfile } from "@/lib/reading-student-model";
import { StudentProfile } from "@/types/ruby";
import { ReadingStudentProfile } from "@/types/reading";

// ── Inner app — must live inside LanguageProvider to access useT ──────────────
function AppContent() {
  const { t } = useT();

  const [activeView, setActiveView] = useState<ActiveView>("home");
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

  useEffect(() => {
    incrementSession();
    refreshStats();

    // Maths + reading: trigger survey after each micro skill is mastered
    const onSkillMastered = (e: Event) => {
      const type = (e as CustomEvent).detail?.type as "maths" | "reading";
      if (!type) return;
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
            className="p-1 rounded-lg transition-opacity hover:opacity-80"
            aria-label="Change language"
          >
            <span className="text-2xl leading-none">🌍</span>
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
        onLogout={() => {
          // Clear session data but preserve placement profiles so the discovery
          // activity is never repeated when the same user logs back in.
          clearAllUserData();
          supabase.auth.signOut();
          window.location.reload();
        }}
      />

      {showLangPicker && <LanguagePickerModal onClose={() => setShowLangPicker(false)} />}

      <main className="flex-1 overflow-hidden h-full">
        {activeView === "home" && <HomeScreen onNavigate={handleViewChange} />}
        {activeView === "chat" && <ChatInterface onMessageSent={() => { refreshStats(); setChatEngaged(true); }} />}
        {activeView === "progress" && <ProgressTracker />}
        {activeView === "ruby" && <DiagnosticSession />}
        {activeView === "skill-tree" && <SkillTreeView profile={rubyProfile} />}
        {activeView === "student-dashboard" && <StudentDashboard profile={rubyProfile} />}
        {activeView === "reading" && <ReadingSession />}
        {activeView === "reading-skill-tree" && <ReadingSkillTreeView profile={readingProfile} />}
        {activeView === "settings" && <SettingsView onBack={() => handleViewChange("home")} />}
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
function WelcomeScreen({ name, onStartLearning }: { name: string; onStartLearning: () => void }) {
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
          onClick={onStartLearning}
          className="w-full py-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-colors shadow-md"
        >
          Start Learning 🚀
        </button>
      </div>
    </div>
  );
}

// ── App gate — checks session before showing onboarding ────────────────────────
export default function Home() {
  const [appState, setAppState] = useState<"loading" | "onboarding" | "welcome" | "app">("loading");
  const [welcomeName, setWelcomeName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== null) {
      clearAllUserData();
      supabase.auth.signOut();
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Always show Create Account / Login first — everyone must authenticate
    setAppState("onboarding");

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
      // Returning user — only wipe data if a different user is logging in on this device
      if (isDifferentUser) {
        clearAllUserData();
        PLACEMENT_PROFILE_KEYS.forEach((k) => localStorage.removeItem(k));
      }
      if (data.userId) localStorage.setItem("current_user_id", data.userId);
      setAppState("app");
    } else {
      // New signup — clear everything including any prior user's placement profiles
      clearAllUserData();
      PLACEMENT_PROFILE_KEYS.forEach((k) => localStorage.removeItem(k));
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

  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
