"use client";

import { useEffect, useState } from "react";
import { ActiveView } from "@/types";
import { hydrateStudentProfileFromSupabase } from "@/lib/student-model";
import { hydrateReadingProfileFromSupabase } from "@/lib/reading-student-model";
import { ReadingStudentProfile } from "@/types/reading";
import { StudentProfile } from "@/types/ruby";
import SavedReportView from "@/components/SavedReportView";
import DiscoverCard from "@/components/shared/DiscoverCard";
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

  const onUpgradeNeeded = () =>
    document.dispatchEvent(
      new CustomEvent("ruby-upgrade-needed", { detail: { reason: "Upgrade to unlock both Maths and Reading Discovery Activities." } })
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

        <div className="mb-4">
          <DiscoverCard
            subject="maths"
            done={mathsDone}
            locked={mathsLocked}
            loading={loading}
            onNavigate={onNavigate}
            onViewReport={() => setViewReport("maths")}
            onUpgradeNeeded={onUpgradeNeeded}
          />
        </div>
        <DiscoverCard
          subject="reading"
          done={readingDone}
          locked={readingLocked}
          loading={loading}
          onNavigate={onNavigate}
          onViewReport={() => setViewReport("reading")}
          onUpgradeNeeded={onUpgradeNeeded}
        />

      </div>
    </div>
  );
}
