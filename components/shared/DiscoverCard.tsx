"use client";

import { ActiveView } from "@/types";
import Button from "@/components/ui/Button";
import { useT } from "@/lib/i18n";
import { CONCEPT_C } from "@/lib/flags";

// Chunky pressable card shell when Concept C is on; the current soft card otherwise.
const CARD_SHELL = CONCEPT_C
  ? "shadow-lip border-2 border-gray-100"
  : "shadow-sm border border-gray-100";

const SUBJECT_META = {
  maths: {
    icon: "🧮",
    titleKey: "home.maths_title",
    gradient: "from-blue-500 to-blue-600",
    accentBorder: "border-blue-200",
    accentText: "text-blue-600",
    accentHover: "hover:bg-blue-50",
    discoverView: "discover-maths" as ActiveView,
    retakeKey: "ruby_maths_retake",
    doneCopy: "Ruby has found your starting Maths level. View your report or retake to update your placement.",
    blurb: "A short adaptive quiz that finds your exact Maths level, no guessing, just the right fit.",
    startLabel: "Start Maths Discovery",
  },
  reading: {
    icon: "📖",
    titleKey: "home.reading_title",
    gradient: "from-purple-500 to-purple-600",
    accentBorder: "border-purple-200",
    accentText: "text-purple-600",
    accentHover: "hover:bg-purple-50",
    discoverView: "discover-reading" as ActiveView,
    retakeKey: "ruby_reading_retake",
    doneCopy: "Ruby has found your reading level. View your report or retake to update your placement.",
    blurb: "A short adaptive quiz that finds your exact Reading level, personalising your journey from the very first session.",
    startLabel: "Start Reading Discovery",
  },
} as const;

interface DiscoverCardProps {
  subject: "maths" | "reading";
  done: boolean;
  locked: boolean;
  loading?: boolean;
  onNavigate: (view: ActiveView) => void;
  onViewReport: () => void;
  onUpgradeNeeded: () => void;
}

/** Per-subject placement/Discovery card — status, "Start"/"View Report"/"Retake".
 *  Shared by DiscoverHub (Settings' "Re-take Discovery" entry) and the Maths/
 *  Reading subject landing screens. */
export default function DiscoverCard({
  subject,
  done,
  locked,
  loading,
  onNavigate,
  onViewReport,
  onUpgradeNeeded,
}: DiscoverCardProps) {
  const { t } = useT();
  const meta = SUBJECT_META[subject];

  const upgradePrompt = (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        Your Freebie plan includes 1 Discovery Activity. Upgrade to Scholar or Master to unlock both.
      </p>
      <Button variant="primary" size="lg" fullWidth onClick={onUpgradeNeeded}>
        Upgrade Plan 🔓
      </Button>
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl overflow-hidden ${CARD_SHELL}`}>
      <div className={`bg-gradient-to-r ${meta.gradient} px-5 py-4 flex items-center gap-3`}>
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Discovery</p>
          <h2 className="text-white font-bold text-lg leading-tight">{t(meta.titleKey)}</h2>
        </div>
        {done && (
          <span className="ml-auto bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Completed
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        {locked ? (
          upgradePrompt
        ) : done ? (
          <>
            <p className="text-sm text-gray-500 mb-4">{meta.doneCopy}</p>
            <div className="flex gap-2">
              <Button variant="primary" size="md" onClick={onViewReport} className="flex-1">
                View Report
              </Button>
              <button
                onClick={() => {
                  try { sessionStorage.setItem(meta.retakeKey, "1"); } catch { /* ignore */ }
                  onNavigate(meta.discoverView);
                }}
                className={`flex-1 border ${meta.accentBorder} ${meta.accentText} ${meta.accentHover} font-medium text-sm py-2.5 rounded-xl transition-colors active:scale-[0.97]`}
              >
                Retake
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{meta.blurb}</p>
            <Button variant="primary" size="lg" fullWidth onClick={() => onNavigate(meta.discoverView)} disabled={loading}>
              {meta.startLabel}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
