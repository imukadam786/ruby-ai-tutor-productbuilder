"use client";

import type { OfflineStatus } from "@/lib/offline/useOfflineDownload";

// Small corner badge on a subject card showing its offline state. On a confirmed
// wifi connection the subject auto-downloads, so this mostly shows "Saving…" then
// "Offline ✓". On metered/unknown connections it stays as a tap-to-save control,
// so the learner chooses when to spend data. Rendered inside the card <button>,
// so the interactive states stop propagation to avoid opening the subject.

const base =
  "absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full select-none";

export default function OfflineBadge({
  status,
  onSave,
}: {
  status: OfflineStatus;
  onSave: () => void;
}) {
  if (status === "ready") {
    return (
      <span className={`${base} bg-emerald-500/90 text-white`} title="Saved for offline use">
        <span aria-hidden>✓</span> Offline
      </span>
    );
  }

  if (status === "downloading") {
    return (
      <span className={`${base} bg-white/90 text-gray-700`} title="Saving for offline use">
        <span
          aria-hidden
          className="w-2.5 h-2.5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"
        />
        Saving…
      </span>
    );
  }

  // idle or error → tap to save.
  const tap = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSave();
  };
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={tap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") tap(e);
      }}
      className={`${base} cursor-pointer bg-white/90 text-gray-700 hover:bg-white active:scale-95 transition ${
        status === "error" ? "text-rose-600" : ""
      }`}
      title={status === "error" ? "Download failed — tap to retry" : "Save this subject for offline use"}
    >
      <span aria-hidden>↓</span> {status === "error" ? "Retry" : "Offline"}
    </span>
  );
}
