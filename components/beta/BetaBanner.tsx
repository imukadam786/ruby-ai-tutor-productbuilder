"use client";

import { useState } from "react";

export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium flex-shrink-0">
      <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-green-300 flex-shrink-0" />
      <span>
        🚀 <strong>Ruby Beta</strong> — You&apos;re one of our first users! Everything is free while we improve.
        <button
          onClick={() => {
            // Trigger floating feedback
            document.dispatchEvent(new CustomEvent("open-feedback"));
          }}
          className="ml-2 underline underline-offset-2 hover:no-underline opacity-90 hover:opacity-100"
        >
          Share feedback
        </button>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
