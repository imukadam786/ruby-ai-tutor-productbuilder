// ─── RubyIcon ────────────────────────────────────────────────────────────────
//
// The little ruby gem we show in place of the old ⭐ throughout the progress and
// mastery UI. One component so the gem looks identical everywhere it appears.

interface RubyIconProps {
  /** Tailwind size classes, e.g. "w-4 h-4". Defaults to a text-aligned 1em. */
  className?: string;
}

export default function RubyIcon({ className = "w-[1.1em] h-[1.1em]" }: RubyIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/rubytransparent.webp"
      alt="ruby"
      aria-hidden
      className={`inline-block object-contain align-[-0.15em] ${className}`}
    />
  );
}
