"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/fetch";

// All translatable UI strings (English defaults)
export const UI_STRINGS: Record<string, string> = {
  // Sidebar
  "sidebar.home": "Home",
  "sidebar.home_desc": "Dashboard",
  "sidebar.progress": "Progress",
  "sidebar.progress_desc": "Your journey",
  "sidebar.general_tutor": "General Tutor",
  "sidebar.homework": "Homework",
  "sidebar.homework_desc": "Ask Ruby anything",
  "sidebar.watch": "Watch",
  "sidebar.watch_desc": "Video learning",
  "sidebar.maths_engine": "Maths Engine",
  "sidebar.maths": "Maths",
  "sidebar.maths_desc": "Adaptive math tutor",
  "sidebar.skill_tree": "Skill Tree",
  "sidebar.skill_tree_desc": "72 atomic skills",
  "sidebar.reading_engine": "Reading Engine",
  "sidebar.reading": "Reading",
  "sidebar.reading_desc": "Reading & comprehension",
  "sidebar.reading_skill_tree_desc": "Reading skills",
  "sidebar.settings": "Settings",
  "sidebar.settings_desc": "Preferences",
  "sidebar.logout": "Logout",
  "sidebar.logout_desc": "Sign out",
  "sidebar.powered_by": "Powered by Hula",
  // Home
  "home.ready": "Ready to keep learning?",
  "home.skills_mastered": "Skills Mastered",
  "home.in_progress": "In Progress",
  "home.lessons_done": "Lessons Done",
  "home.study_sessions": "Study Sessions",
  "home.current_streak": "Current Streak",
  "home.day": "day",
  "home.days": "days",
  "home.best": "Best",
  "home.quick_actions": "Quick Actions",
  "home.continue_learning": "Continue Learning",
  "home.continue_desc": "Pick up where you left off",
  "home.daily_challenge": "Daily Challenge",
  "home.daily_desc": "Answer a question, earn 5 rubies",
  "home.learning_modes": "Learning Modes",
  "home.homework_title": "Homework",
  "home.homework_mode_desc": "Get help with school assignments",
  "home.maths_title": "Maths",
  "home.maths_mode_desc": "Practice math skills and solve problems",
  "home.reading_title": "Reading",
  "home.reading_mode_desc": "Improve reading and comprehension",
  "home.watch_title": "Watch",
  "home.watch_mode_desc": "Learn through educational videos",
  // Progress
  "progress.title": "Progress",
  "progress.subtitle": "Your skill tree journey",
  "progress.skills_mastered": "Skills Mastered",
  "progress.in_progress": "In Progress",
  "progress.accuracy": "Accuracy",
  "progress.sessions": "Sessions",
  "progress.current_streak": "Current Streak",
  "progress.best": "Best",
  "progress.current_focus": "Current Focus",
  "progress.active_skill": "Active skill",
  "progress.level_progress": "Level progress",
  "progress.skills": "skills",
  "progress.in_progress_skills": "In Progress",
  "progress.mastered_skills": "Mastered Skills",
  "progress.weekly_activity": "Weekly Activity",
  // Chat
  "chat.title": "Chat with Ruby",
  "chat.clear": "Clear",
  "chat.disclaimer": "Ruby can make mistakes. Double-check important info.",
  "chat.placeholder": "Ask Ruby anything...",
  // Maths engine
  "maths.start_session": "Start Maths Session",
  "maths.session_label": "Session",
  "maths.current_skill": "Current Skill",
  "maths.skill_mastered": "Skill Mastered!",
  "maths.mastered_desc": "You've mastered",
  "maths.continue_next": "Continue to Next Skill →",
  "maths.swipe_up": "Swipe up for next question",
  "maths.feedback": "Feedback",
  "maths.learn_from": "Let's learn from this",
  "maths.correct": "Correct!",
  "maths.not_quite": "Not quite",
  // Reading engine
  "reading.title": "Reading Skill Tree",
  "reading.subtitle": "5 levels · 14 tiers · 34 atomic skills",
  "reading.start": "Start a reading session to unlock the skill tree",
  "reading.swipe_up": "Swipe up for next question",
  "reading.correct": "Correct!",
  "reading.not_quite": "Not quite right",
  "reading.tip": "Tip: ",
  // Skill tree
  "skilltree.locked": "Locked",
  "skilltree.available": "Available",
  "skilltree.in_progress": "In Progress",
  "skilltree.mastered": "Mastered",
  "skilltree.current": "Current",
  // Settings
  "settings.title": "Settings",
  "settings.profile": "Profile",
  "settings.profile_desc": "Manage your account identity and contact details.",
  "settings.full_name": "Full name",
  "settings.email": "Email address",
  "settings.phone": "Phone number",
  "settings.account_lang": "Account language",
  "settings.change_password": "Change password",
  "settings.delete_account": "Delete account",
  "settings.learning": "Learning Settings",
  "settings.learning_desc": "Control how Ruby teaches and interacts with the learner.",
  "settings.preferred_lang": "Preferred System Language",
  "settings.dark_mode": "Dark mode",
  "settings.download_report": "Download progress report (PDF)",
  "settings.subscription": "Subscription",
  "settings.subscription_desc": "Manage billing and plan details.",
  "settings.current_plan": "Current plan",
  "settings.plan_features": "Plan features",
  "settings.billing_cycle": "Billing cycle",
  "settings.payment_method": "Payment method",
  "settings.update_payment": "Update payment details",
  "settings.billing_history": "Billing history & invoices",
  "settings.cancel_sub": "Cancel subscription",
  "settings.support": "Support",
  "settings.support_desc": "Get help and contact the Ruby team.",
  "settings.faq": "Frequently asked questions",
  "settings.contact": "Contact support",
  "settings.feedback": "Provide feedback",
  "settings.report_bug": "Report a bug",
  "settings.suggest": "Suggest a feature",
  "settings.save": "Save",
  "settings.preferences": "Preferences",
  // Nav bar labels
  "nav.maths_skill_tree": "Maths Skill Tree",
  "nav.reading_skill_tree": "Reading Skill Tree",
  "nav.account": "Account",
  "nav.lesson_plans": "Lesson Plans",
  // Common
  "common.coming_soon": "Coming soon",
  "common.ai_tutor": "AI Tutor",
  "common.back": "Back",
  "common.send": "Send",
  "common.cancel": "Cancel",
};

interface I18nContextValue {
  language: string;
  t: (key: string, vars?: Record<string, string>) => string;
  setLanguage: (lang: string) => Promise<void>;
  isTranslating: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  language: "English",
  t: (key) => UI_STRINGS[key] ?? key,
  setLanguage: async () => {},
  isTranslating: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("English");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("ruby_language") ?? "English";
      setLanguageState(savedLang);
      if (savedLang !== "English") {
        const cached = localStorage.getItem(`ruby_translations_${savedLang}`);
        if (cached) setTranslations(JSON.parse(cached));
      }
    } catch { /* ignore */ }
  }, []);

  const setLanguage = useCallback(async (lang: string) => {
    setLanguageState(lang);
    try { localStorage.setItem("ruby_language", lang); } catch { /* ignore */ }

    if (lang === "English") {
      setTranslations({});
      return;
    }

    const cacheKey = `ruby_translations_${lang}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTranslations(JSON.parse(cached));
        return;
      }
    } catch { /* ignore */ }

    setIsTranslating(true);
    try {
      const res = await apiFetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strings: UI_STRINGS, targetLanguage: lang }),
      });
      const data = await res.json();
      if (data.translations) {
        setTranslations(data.translations);
        try { localStorage.setItem(cacheKey, JSON.stringify(data.translations)); } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    finally { setIsTranslating(false); }
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string>) => {
    const str = (language !== "English" ? translations[key] : undefined) ?? UI_STRINGS[key] ?? key;
    if (!vars) return str;
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str);
  }, [language, translations]);

  return (
    <I18nContext.Provider value={{ language, t, setLanguage, isTranslating }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext);
}
