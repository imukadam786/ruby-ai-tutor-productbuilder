"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { ReadingStudentProfile } from "@/types/reading";
import { useT } from "@/lib/i18n";
import EduBackground from "@/components/EduBackground";
import { fetchAuthorisedGrade } from "@/lib/onboarding-reader";
import SavedReportView from "@/components/SavedReportView";

interface HomeScreenProps {
  onNavigate: (view: ActiveView) => void;
  userPlan: string | null;
  onOpenLangPicker?: () => void;
}

const MATRIC_PLANS = ["master", "matric-pack"];

function RubyAvatar({ size = "w-12 h-12" }: { size?: string }) {
  return (
    <div className={`${size} flex-shrink-0 rounded-full overflow-hidden bg-white`}>
      <img
        src="/icons/icon-192.png"
        alt="Ruby"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "flex";
        }}
      />
      <div
        className="w-full h-full bg-rose-600 items-center justify-center text-white font-bold text-xl"
        style={{ display: "none" }}
      >
        R
      </div>
    </div>
  );
}

export default function HomeScreen({ onNavigate, userPlan, onOpenLangPicker }: HomeScreenProps) {
  const hasMatricAccess = userPlan !== null && MATRIC_PLANS.includes(userPlan);
  const isFreebie = userPlan === "freebie" || userPlan === null;

  const handleMatricPrepClick = () => {
    if (hasMatricAccess) {
      onNavigate("matrics");
    } else {
      document.dispatchEvent(
        new CustomEvent("ruby-upgrade-needed", {
          detail: {
            reason: "Matric Past Papers, Study Guides and Prep Papers require the Matric Exam Pack or Master plan.",
            matricOnly: true,
          },
        })
      );
    }
  };

  const handleUpgradeClick = () => {
    document.dispatchEvent(
      new CustomEvent("ruby-upgrade-needed", {
        detail: { reason: undefined, matricOnly: false },
      })
    );
  };

  const { t } = useT();

  const [firstName, setFirstName] = useState("there");
  const [mathsDone, setMathsDone] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [viewReport, setViewReport] = useState<"maths" | "reading" | null>(null);

  useEffect(() => {
    const load = async () => {
      const [auth, profile, readingProfile] = await Promise.all([
        fetchAuthorisedGrade(),
        hydrateStudentProfileFromSupabase(),
        hydrateReadingProfileFromSupabase(),
      ]);
      if (auth?.name) setFirstName(auth.name.split(" ")[0]);
      setMathsDone(profile?.placementCompleted ?? false);
      setReadingDone((readingProfile as ReadingStudentProfile | null)?.placementCompleted ?? false);
    };
    load();
  }, []);

  if (viewReport) {
    return (
      <div className="h-full overflow-hidden">
        <SavedReportView subject={viewReport} onBack={() => setViewReport(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F4F4F5] relative">
      <EduBackground />

      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 py-8 sm:px-8 sm:py-10">

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-center sm:justify-start gap-4 mb-8">
            <RubyAvatar size="w-14 h-14" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("home.greeting", { name: firstName })}</h1>
              <p className="text-gray-500 text-base mt-0.5">Ready to keep learning?</p>
            </div>
          </div>

          {/* ── Quick actions (Language / Upgrade / FAQ) ─────────────────── */}
          <section className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onOpenLangPicker?.()}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl flex-shrink-0">🌍</span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-base leading-tight">Language</p>
                  <p className="text-gray-500 text-xs mt-0.5">Change app language</p>
                </div>
              </button>

              <button
                onClick={handleUpgradeClick}
                className="bg-gradient-to-br from-[#BE1832] to-[#E8305A] rounded-2xl p-4 flex items-center gap-3 border border-transparent hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center text-xl flex-shrink-0">⭐</span>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-base leading-tight">
                    {isFreebie ? "Upgrade" : "Manage plan"}
                  </p>
                  <p className="text-white/80 text-xs mt-0.5">
                    {isFreebie ? "Unlock unlimited learning" : `Current: ${userPlan}`}
                  </p>
                </div>
              </button>

              <button
                onClick={() => onNavigate("settings")}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">❓</span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-base leading-tight">FAQ</p>
                  <p className="text-gray-500 text-xs mt-0.5">Frequently asked questions</p>
                </div>
              </button>
            </div>
          </section>

          {/* ── Discovery CTAs ────────────────────────────────────────────── */}
          <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleMatricPrepClick}
              className="w-full h-full bg-gradient-to-br from-green-600 to-green-700 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎓</span>
                <div className="min-w-0">
                  <p className="font-semibold text-white leading-tight">Matric Prep</p>
                  <p className="text-sm text-green-100 mt-0.5 leading-snug">
                    {hasMatricAccess
                      ? "Past papers, prep papers and study guides"
                      : "Unlock past papers, prep papers and study guides"}
                  </p>
                </div>
              </div>
              <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full self-end">
                {hasMatricAccess ? "View →" : "Upgrade →"}
              </span>
            </button>

            {mathsDone ? (
              <button
                onClick={() => setViewReport("maths")}
                className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🧮</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white leading-tight">Maths Discovery</p>
                    <p className="text-sm text-blue-100 mt-0.5 leading-snug">View your placement results</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full self-end">View →</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("discover-maths")}
                className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🧮</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white leading-tight">Start Maths Discovery</p>
                    <p className="text-sm text-blue-100 mt-0.5 leading-snug">Find your Maths level</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full self-end">Start →</span>
              </button>
            )}

            {readingDone ? (
              <button
                onClick={() => setViewReport("reading")}
                className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📖</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white leading-tight">Reading Discovery</p>
                    <p className="text-sm text-purple-100 mt-0.5 leading-snug">View your placement results</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full self-end">View →</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("discover-reading")}
                className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📖</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white leading-tight">Start Reading Discovery</p>
                    <p className="text-sm text-purple-100 mt-0.5 leading-snug">Find your Reading level</p>
                  </div>
                </div>
                <span className="bg-white/20 text-white font-semibold text-xs px-3 py-1 rounded-full self-end">Start →</span>
              </button>
            )}
          </section>

          {/* ── Learning Modes ────────────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{t("home.learning_modes")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "chat"    as ActiveView, title: t("home.homework_title"), subtitle: t("home.homework_mode_desc"), emoji: "📚" },
                { id: "ruby"    as ActiveView, title: t("home.maths_title"),    subtitle: t("home.maths_mode_desc"),    emoji: "🎯" },
                { id: "reading" as ActiveView, title: t("home.reading_title"),  subtitle: t("home.reading_mode_desc"),  emoji: "✏️" },
                { id: "watch"   as ActiveView, title: t("home.watch_title"),    subtitle: t("home.watch_mode_desc"),    emoji: "▶️" },
              ].map((mode) => (
                <button
                  key={mode.id + mode.title}
                  onClick={() => onNavigate(mode.id)}
                  className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100 hover:shadow-md active:scale-[0.98] transition-all text-left"
                >
                  <span className="text-2xl">{mode.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-base">{mode.title}</p>
                    <p className="text-gray-400 text-sm mt-0.5 leading-relaxed">{mode.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
