"use client";

import PricingPlans from "./PricingPlans";

interface UpgradeModalProps {
  onDismiss: () => void;
  reason?: string;
  matricOnly?: boolean;
}

export default function UpgradeModal({ onDismiss, reason, matricOnly }: UpgradeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss(); }}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-extrabold text-[#1a2744] text-lg">
              {matricOnly ? "🎓 Unlock Matric Access" : "Unlock full access"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {reason ?? (matricOnly
                ? "Choose between the Matric Exam Pack (once-off) or Master plan (monthly) to unlock all matric content."
                : "You've reached your daily limit, upgrade to continue")}
            </p>
          </div>
          {/* Always-visible exit. Lives in the sticky header so a learner who
              taps a locked subject (e.g. Matric on the free plan) can never get
              stuck — filled + sized up so it reads as tappable on mobile. */}
          <button
            onClick={onDismiss}
            className="ml-4 flex-shrink-0 flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 hover:text-gray-900 font-semibold text-sm pl-3 pr-3.5 py-2 transition-all"
            aria-label="Close and go back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Back</span>
          </button>
        </div>

        <PricingPlans mode={matricOnly ? "matric" : "upgrade"} showHeader={false} />

        <div className="pb-6 text-center">
          <button
            onClick={onDismiss}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
