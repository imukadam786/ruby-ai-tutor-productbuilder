"use client";

// One compact "read aloud" control used across every subject so the audio
// experience is identical (no autoplay anywhere — the learner taps this to
// hear the question). Sits next to the question text to save mobile space.
export default function SpeakButton({
  playing,
  onClick,
  label = "Read question aloud",
  className = "",
}: {
  playing: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={playing ? "Stop reading" : label}
      title={playing ? "Stop" : label}
      className={`flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-[#1a2744] text-lg flex items-center justify-center transition-all ${className}`}
    >
      {playing ? "⏹" : "🔊"}
    </button>
  );
}
