"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { ReadingStudentProfile } from "@/types/reading";
import { StudentProfile } from "@/types/ruby";
import SavedReportView from "@/components/SavedReportView";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useT } from "@/lib/i18n";

interface DiscoverHubProps {
  onNavigate: (view: ActiveView) => void;
}

export default function DiscoverHub({ onNavigate }: DiscoverHubProps) {
  const { t } = useT();
  const [mathsProfile, setMathsProfile] = useState<StudentProfile | null>(null);
  const [readingProfile, setReadingProfile] = useState<ReadingStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewReport, setViewReport] = useState<"maths" | "reading" | null>(null);
  const [userPlan, setUserPlan] = useState<string>("freebie");

  useEffect(() => {
    const planPromise = supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return "freebie";
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.status === "active" && data?.plan ? data.plan : "freebie";
    });

    Promise.all([
      hydrateStudentProfileFromSupabase(),
      hydrateReadingProfileFromSupabase(),
      planPromise,
    ]).then(([mp, rp, plan]) => {
      setMathsProfile(mp);
      setReadingProfile(rp as ReadingStudentProfile | null);
      setUserPlan(plan as string);
      setLoading(false);
    });
  }, []);

  if (viewReport) {
    return (
      <div className="h-full overflow-hidden">
        <SavedReportView subject={viewReport} onBack={() => setViewReport(null)} />
      </div>
    );
  }

  const mathsDone = mathsProfile?.placementCompleted ?? false;
  const readingDone = readingProfile?.placementCompleted ?? false;

  // Freebie allows only 1 discovery total. If one is done, lock the other.
  const isFreebie = userPlan === "freebie";
  const mathsLocked = isFreebie && !mathsDone && readingDone;
  const readingLocked = isFreebie && !readingDone && mathsDone;

  const upgradePrompt = (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        Your Freebie plan includes 1 Discovery Activity. Upgrade to Scholar or Master to unlock both.
      </p>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => document.dispatchEvent(new CustomEvent("ruby-upgrade-needed", { detail: { reason: "Upgrade to unlock both Maths and Reading Discovery Activities." } }))}
      >
        Upgrade Plan 🔓
      </Button>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-[#F4F4F5]">
      <div className="max-w-lg mx-auto px-5 py-8 sm:px-8 sm:py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🧭</span>
            <h1 className="text-2xl font-bold text-gray-900">{t("discover.title")}</h1>
          </div>
          <p className="text-gray-500 text-base leading-relaxed">
            Find your level so Ruby knows exactly where to start. Takes about 10 minutes and makes every session count.
          </p>
        </div>

        {/* Maths card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">🧮</span>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Discovery</p>
              <h2 className="text-white font-bold text-lg leading-tight">{t("home.maths_title")}</h2>
            </div>
            {mathsDone && (
              <span className="ml-auto bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Completed
              </span>
            )}
          </div>

          <div className="px-5 py-4">
            {mathsLocked ? upgradePrompt : mathsDone ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Ruby has found your starting Maths level. View your report or retake to update your placement.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setViewReport("maths")}
                    className="flex-1"
                  >
                    View Report
                  </Button>
                  <button
                    onClick={() => {
                      // Force a fresh placement (mirror Reading) so Retake re-runs
                      // Discovery instead of resuming the already-placed profile.
                      try { sessionStorage.setItem("ruby_maths_retake", "1"); } catch { /* ignore */ }
                      onNavigate("discover-maths");
                    }}
                    className="flex-1 border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium text-sm py-2.5 rounded-xl transition-colors active:scale-[0.97]"
                  >
                    Retake
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  A short adaptive quiz that finds your exact Maths level, no guessing, just the right fit.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => onNavigate("discover-maths")}
                  disabled={loading}
                >
                  Start Maths Discovery
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Reading card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Discovery</p>
              <h2 className="text-white font-bold text-lg leading-tight">{t("home.reading_title")}</h2>
            </div>
            {readingDone && (
              <span className="ml-auto bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Completed
              </span>
            )}
          </div>

          <div className="px-5 py-4">
            {readingLocked ? upgradePrompt : readingDone ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Ruby has found your reading level. View your report or retake to update your placement.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setViewReport("reading")}
                    className="flex-1"
                  >
                    View Report
                  </Button>
                  <button
                    onClick={() => {
                      // Signal a full Discovery retake. ReadingSession reads this on
                      // mount and starts a fresh placement instead of resuming the
                      // already-placed profile (BUG #3 — retake was skipping Discovery).
                      try { sessionStorage.setItem("ruby_reading_retake", "1"); } catch { /* ignore */ }
                      onNavigate("discover-reading");
                    }}
                    className="flex-1 border border-purple-200 text-purple-600 hover:bg-purple-50 font-medium text-sm py-2.5 rounded-xl transition-colors active:scale-[0.97]"
                  >
                    Retake
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  A short adaptive quiz that finds your exact Reading level, personalising your journey from the very first session.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => onNavigate("discover-reading")}
                  disabled={loading}
                >
                  Start Reading Discovery
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
