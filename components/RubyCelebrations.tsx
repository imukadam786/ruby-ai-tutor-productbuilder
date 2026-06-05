"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * Global ruby celebration overlay (Phase 1.5).
 *
 * Mounted once. Listens for `ruby-celebrate` CustomEvents and plays the matching
 * Lottie full-screen, then auto-dismisses. Subject screens don't import anything
 * — they just dispatch the event (most come free from the reward-client helpers).
 *
 * Honours prefers-reduced-motion (skips the animation; the counter + "+N" pop
 * still convey the reward) and never blocks input (pointer-events-none).
 *
 * Assets live in /public/lottie/ — see RubyCelebrations asset checklist.
 */

export type CelebrationKind =
  | "skill_mastered"
  | "combo"
  | "tier_complete"
  | "level_up"
  | "tree_complete"
  | "daily_login";

type CelebrationConfig = {
  assets: string[]; // file stems in /public/lottie/, layered back-to-front
  size: "sm" | "md" | "lg" | "xl";
  ms: number; // auto-dismiss after this long
  showCount: boolean; // overlay the "+N 💎" amount
};

const CONFIG: Record<CelebrationKind, CelebrationConfig> = {
  combo:          { assets: ["success-burst"],            size: "sm", ms: 1800, showCount: true },
  skill_mastered: { assets: ["success-burst"],            size: "md", ms: 2200, showCount: true },
  tier_complete:  { assets: ["confetti"],                 size: "md", ms: 2400, showCount: false },
  level_up:       { assets: ["confetti"],                 size: "lg", ms: 2800, showCount: false },
  tree_complete:  { assets: ["confetti", "trophy"],       size: "xl", ms: 4000, showCount: false },
  daily_login:    { assets: ["streak-fire"],              size: "sm", ms: 3500, showCount: false },
};

const SIZE_CLASS: Record<CelebrationConfig["size"], string> = {
  sm: "w-32 h-32",
  md: "w-56 h-56",
  lg: "w-80 h-80",
  xl: "w-[28rem] h-[28rem] max-w-[90vw] max-h-[90vw]",
};

type Active = { kind: CelebrationKind; rubies?: number; streak?: number; id: number };

export default function RubyCelebrations() {
  const [active, setActive] = useState<Active | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    // Respect reduced-motion: do nothing, the counter still updates.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const handler = (e: Event) => {
      if (reduce) return;
      const detail = (e as CustomEvent).detail as
        | { kind?: CelebrationKind; rubies?: number }
        | undefined;
      const kind = detail?.kind;
      if (!kind || !(kind in CONFIG)) return;

      const id = ++seq.current;
      setActive({ kind, rubies: detail?.rubies, streak: (detail as { streak?: number })?.streak, id });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        // Only clear if this is still the celebration on screen.
        setActive((cur) => (cur?.id === id ? null : cur));
      }, CONFIG[kind].ms);
    };

    document.addEventListener("ruby-celebrate", handler);
    return () => {
      document.removeEventListener("ruby-celebrate", handler);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!active) return null;
  const cfg = CONFIG[active.kind];

  // Daily login is a contextual top toast card, not a bare centre animation —
  // a lone flame mid-screen reads as "why did I just get a random flame?".
  if (active.kind === "daily_login") {
    return (
      <div className="fixed top-4 inset-x-0 z-[120] flex justify-center px-4 pointer-events-none">
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-3">
          <DotLottieReact src="/lottie/streak-fire.json" autoplay loop className="w-10 h-10 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-bold text-[#1a2744]">Welcome back!</p>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <span>{active.streak && active.streak > 1 ? `${active.streak}-day streak` : "Day 1"}</span>
              {active.rubies ? (
                <span className="flex items-center gap-0.5 font-semibold text-[#BE1832]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  · <img src="/rubytransparent.png" alt="" className="w-3.5 h-3.5 object-contain" /> +{active.rubies}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none">
      <div className={`relative ${SIZE_CLASS[cfg.size]}`}>
        {cfg.assets.map((asset) => (
          <DotLottieReact
            key={asset}
            src={`/lottie/${asset}.json`}
            autoplay
            loop={false}
            className="absolute inset-0 w-full h-full"
          />
        ))}
        {cfg.showCount && active.rubies ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-1 text-2xl font-extrabold text-[#BE1832] drop-shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rubytransparent.png" alt="" className="w-6 h-6 object-contain" />
              +{active.rubies}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
