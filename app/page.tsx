"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import LessonPlan from "@/components/LessonPlan";
import ProgressTracker from "@/components/ProgressTracker";
import DiagnosticSession from "@/components/ruby/DiagnosticSession";
import SkillTreeView from "@/components/ruby/SkillTreeView";
import StudentDashboard from "@/components/ruby/StudentDashboard";
import OnboardingFlow, { OnboardingData } from "@/components/onboarding/OnboardingFlow";
import HomeScreen from "@/components/HomeScreen";
import { ActiveView } from "@/types";
import { getProgress, incrementSession } from "@/lib/storage";
import { getStudentProfile } from "@/lib/student-model";
import { StudentProfile } from "@/types/ruby";

const viewLabels: Record<ActiveView, string> = {
  home: "Home",
  chat: "Chat",
  lessons: "Homework",
  progress: "Progress",
  ruby: "Study Room",
  "skill-tree": "Skill Tree",
  "student-dashboard": "Account",
  watch: "Watch",
};

export default function Home() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalMessages: 0,
    lessonsCompleted: 0,
    topicsCount: 0,
  });
  const [rubyProfile, setRubyProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const done = localStorage.getItem("onboardingComplete") === "true";
    setOnboardingDone(done);
  }, []);

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
    if (onboardingDone) {
      incrementSession();
      refreshStats();
    }
  }, [onboardingDone, refreshStats]);

  const handleOnboardingComplete = (_data: OnboardingData) => {
    setOnboardingDone(true);
  };

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    if (view === "skill-tree" || view === "student-dashboard") {
      setRubyProfile(getStudentProfile());
    }
  };

  // Waiting for localStorage check
  if (onboardingDone === null) return null;

  // Show onboarding if not completed
  if (!onboardingDone) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-full bg-gray-100">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            R
          </div>
          <span className="font-semibold text-gray-800 text-sm">{viewLabels[activeView]}</span>
        </div>
      </header>

      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        totalMessages={stats.totalMessages}
        lessonsCompleted={stats.lessonsCompleted}
        topicsCount={stats.topicsCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-hidden pt-14 md:pt-0">
        {activeView === "home" && <HomeScreen onNavigate={handleViewChange} />}
        {activeView === "chat" && <ChatInterface onMessageSent={refreshStats} />}
        {activeView === "lessons" && <LessonPlan onLessonCompleted={refreshStats} />}
        {activeView === "progress" && <ProgressTracker />}
        {activeView === "ruby" && <DiagnosticSession />}
        {activeView === "skill-tree" && <SkillTreeView profile={rubyProfile} />}
        {activeView === "student-dashboard" && <StudentDashboard profile={rubyProfile} />}
        {activeView === "watch" && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Coming soon
          </div>
        )}
      </main>
    </div>
  );
}
