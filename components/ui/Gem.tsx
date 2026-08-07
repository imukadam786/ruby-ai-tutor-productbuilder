// ─── Gem ─────────────────────────────────────────────────────────────────────
// The one gem used across Concept C — identity, currency, progress and reward in
// a single faceted mark. Give it a colour and a state; it draws the right gem.
//   rough    — unlearned         (grey, flat)
//   cutting  — in progress       (colour, muted)
//   polished — mastered          (full colour + soft glow)
//   rare     — whole topic done  (gold + glow)
//   locked   — can't open yet    (grey, faded)
//
// One component so a gem looks identical everywhere it appears (mirrors the
// existing RubyIcon pattern, but colour- and state-aware).

import { GemState, GEM_GOLD, GEM_ROUGH } from "@/lib/design/gemColors";

interface GemProps {
  /** Gem hex — the subject's colour (see lib/design/gemColors). */
  color: string;
  state?: GemState;
  /** Tailwind size classes, e.g. "w-6 h-7". Defaults to a text-aligned gem. */
  className?: string;
  /** Accessible label; falls back to the state. */
  title?: string;
}

export default function Gem({
  color,
  state = "polished",
  className = "w-[1.1em] h-[1.3em]",
  title,
}: GemProps) {
  const fill =
    state === "rough" || state === "locked"
      ? GEM_ROUGH
      : state === "rare"
      ? GEM_GOLD
      : color;
  const opacity = state === "locked" ? 0.4 : state === "cutting" ? 0.65 : 1;
  const glow = state === "polished" || state === "rare";
  const glowRgb = state === "rare" ? "224,144,15" : hexToRgb(color);

  return (
    <span
      className={`inline-block align-[-0.2em] ${className}`}
      style={glow ? { filter: `drop-shadow(0 2px 5px rgba(${glowRgb},0.45))` } : undefined}
      role="img"
      aria-label={title ?? `${state} gem`}
    >
      <svg viewBox="0 0 100 120" width="100%" height="100%" style={{ display: "block", opacity }}>
        <polygon points="50,2 90,34 74,118 26,118 10,34" fill={fill} />
        <polygon points="50,2 90,34 50,50 10,34" fill="#ffffff" opacity="0.34" />
        <polygon points="10,34 50,50 26,118" fill="#000000" opacity="0.10" />
        <polygon points="90,34 50,50 74,118" fill="#000000" opacity="0.20" />
        <polygon points="50,50 26,118 74,118" fill="#ffffff" opacity="0.12" />
        <line x1="50" y1="2" x2="50" y2="50" stroke="#ffffff" strokeWidth="1.4" opacity="0.35" />
      </svg>
    </span>
  );
}

/** "#3B82F6" → "59,130,246" for use inside an rgba() glow. */
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
