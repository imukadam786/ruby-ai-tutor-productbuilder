"use client";

export default function BetaBanner() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium flex-shrink-0 text-center">
      <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-green-300 flex-shrink-0" />
      <span>
        🚀 <strong>Ruby Beta</strong> — You&apos;re one of our first users! Everything is free while we improve.
        <button
          onClick={() => document.dispatchEvent(new CustomEvent("open-feedback"))}
          className="ml-2 underline underline-offset-2 hover:no-underline opacity-90 hover:opacity-100"
        >
          Share feedback
        </button>
      </span>
    </div>
  );
}
