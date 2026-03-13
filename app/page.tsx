"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import LessonPlan from "@/components/LessonPlan";
import ProgressTracker from "@/components/ProgressTracker";
import DiagnosticSession from "@/components/ruby/DiagnosticSession";
import SkillTreeView from "@/components/ruby/SkillTreeView";
import StudentDashboard from "@/components/ruby/StudentDashboard";
import ReadingSession from "@/components/reading/ReadingSession";
import ReadingSkillTreeView from "@/components/reading/ReadingSkillTreeView";
import OnboardingFlow, { OnboardingData } from "@/components/onboarding/OnboardingFlow";
import TutorialOverlay from "@/components/tutorial/TutorialOverlay";
import HomeScreen from "@/components/HomeScreen";
import SettingsView from "@/components/SettingsView";
import LanguagePickerModal from "@/components/LanguagePickerModal";
import FloatingFeedback from "@/components/beta/FloatingFeedback";
import PostSessionSurvey from "@/components/beta/PostSessionSurvey";
import BetaBanner from "@/components/beta/BetaBanner";
import { ActiveView } from "@/types";
import { LanguageProvider, useT } from "@/lib/i18n";
import { getProgress, incrementSession } from "@/lib/storage";
import { getStudentProfile } from "@/lib/student-model";
import { getReadingProfile } from "@/lib/reading-student-model";
import { StudentProfile } from "@/types/ruby";
import { ReadingStudentProfile } from "@/types/reading";

// ── Inner app — must live inside LanguageProvider to access useT ──────────────
function AppContent() {
  const { t } = useT();

  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [stats, setStats] = useState({
    totalMessages: 0,
    lessonsCompleted: 0,
    topicsCount: 0,
  });
  const [rubyProfile, setRubyProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [survey, setSurvey] = useState<{ type: "maths" | "reading" | "chat" } | null>(null);

  const viewLabels: Record<ActiveView, string> = {
    home: t("sidebar.home"),
    chat: t("sidebar.homework"),
    lessons: t("nav.lesson_plans"),
    progress: t("sidebar.progress"),
    ruby: t("sidebar.maths"),
    "skill-tree": t("nav.maths_skill_tree"),
    "student-dashboard": t("nav.account"),
    watch: t("sidebar.watch"),
    reading: t("sidebar.reading"),
    "reading-skill-tree": t("nav.reading_skill_tree"),
    settings: t("sidebar.settings"),
  };

  const refreshStats = useCallback(() => {
    const progress = getProgress();
    setStats({
      totalMessages: progress.totalMessages,
      lessonsCompleted: progress.lessonsCompleted,
      topicsCount: progress.topicsStudied.length,
    });
    setRubyProfile(getStudentProfile());
  }, []);

  useEffect(() => {
    incrementSession();
    refreshStats();
    if (!localStorage.getItem("tutorialComplete")) {
      setShowTutorial(true);
    }
    // FloatingFeedback listens for "open-feedback" internally
  }, [refreshStats]);

  // Trigger post-session survey every 3rd completed session per type
  const triggerSurvey = useCallback((type: "maths" | "reading" | "chat") => {
    const key = `survey_count_${type}`;
    const count = parseInt(localStorage.getItem(key) || "0", 10) + 1;
    localStorage.setItem(key, String(count));
    if (count % 3 === 0) setSurvey({ type });
  }, []);

  const handleViewChange = (view: ActiveView) => {
    // Trigger post-session survey when leaving a session view
    setActiveView((prev) => {
      if (prev === "ruby")    triggerSurvey("maths");
      if (prev === "reading") triggerSurvey("reading");
      if (prev === "chat")    triggerSurvey("chat");
      return view;
    });
    if (view === "skill-tree" || view === "student-dashboard") {
      setRubyProfile(getStudentProfile());
    }
    if (view === "reading-skill-tree") {
      setReadingProfile(getReadingProfile());
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100">
      <BetaBanner />
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
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
        {/* Pencil (restart/clear) on action views, globe elsewhere */}
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

      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        totalMessages={stats.totalMessages}
        lessonsCompleted={stats.lessonsCompleted}
        topicsCount={stats.topicsCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSettings={() => handleViewChange("settings")}
        onOpenLangPicker={() => setShowLangPicker(true)}
        onLogout={() => {
          localStorage.removeItem("onboardingComplete");
          localStorage.removeItem("onboardingData");
          window.location.reload();
        }}
      />

      {showLangPicker && <LanguagePickerModal onClose={() => setShowLangPicker(false)} />}

      <main className="flex-1 overflow-hidden pt-14 md:pt-0 h-full">
        {activeView === "home" && <HomeScreen onNavigate={handleViewChange} />}
        {activeView === "chat" && <ChatInterface onMessageSent={refreshStats} />}
        {activeView === "lessons" && <LessonPlan onLessonCompleted={refreshStats} />}
        {activeView === "progress" && <ProgressTracker />}
        {activeView === "ruby" && <DiagnosticSession />}
        {activeView === "skill-tree" && <SkillTreeView profile={rubyProfile} />}
        {activeView === "student-dashboard" && <StudentDashboard profile={rubyProfile} />}
        {activeView === "reading" && <ReadingSession />}
        {activeView === "reading-skill-tree" && <ReadingSkillTreeView profile={readingProfile} />}
        {activeView === "settings" && <SettingsView onBack={() => handleViewChange("home")} />}
        {activeView === "watch" && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            {t("common.coming_soon")}
          </div>
        )}
      </main>

      {showTutorial && (
        <TutorialOverlay
          onViewChange={handleViewChange}
          onComplete={() => {
            localStorage.setItem("tutorialComplete", "true");
            setShowTutorial(false);
            handleViewChange("home");
          }}
        />
      )}

      <FloatingFeedback />

      {survey && (
        <PostSessionSurvey
          sessionType={survey.type}
          onClose={() => setSurvey(null)}
        />
      )}
    </div>
  );
}

// ── Onboarding gate — wraps AppContent in LanguageProvider ───────────────────
export default function Home() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== null) {
      localStorage.removeItem("onboardingComplete");
      localStorage.removeItem("onboardingData");
      window.history.replaceState({}, "", window.location.pathname);
    }
    const done = localStorage.getItem("onboardingComplete") === "true";
    setOnboardingDone(done);
  }, []);

  const handleOnboardingComplete = (_data: OnboardingData) => {
    setOnboardingDone(true);
  };

  if (onboardingDone === null) return null;

  if (!onboardingDone) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
