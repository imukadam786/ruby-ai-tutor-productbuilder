"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * Global ruby celebration overlay (Phase 1.5).
 *
 * Mounted once. Listens for `ruby-celebrate` CustomEvents and shows a celebration
 * CARD (animation + what happened + rubies earned), then auto-dismisses. Cards —
 * not bare animations — so the learner always knows WHY something popped.
 *
 * Honours prefers-reduced-motion (skips it; the counter + "+N" still convey the
 * reward) and never blocks input (pointer-events-none).
 */

export type CelebrationKind =
  | "skill_mastered"
  | "combo"
  | "tier_complete"
  | "level_up"
  | "tree_complete"
  | "daily_login";

type Meta = {
  title: (streak?: number) => string;
  subtitle: string;
  assets: string[]; // file stems in /public/lottie/, layered back-to-front
  anim: "md" | "lg" | "xl";
  ms: number;
};

const META: Record<Exclude<CelebrationKind, "daily_login">, Meta> = {
  combo:          { title: (s) => `${s ?? 5} in a row!`, subtitle: "Streak bonus!",                      assets: ["success-burst"],          anim: "md", ms: 2600 },
  skill_mastered: { title: () => "Skill mastered!",       subtitle: "You've got this one down.",          assets: ["success-burst"],          anim: "md", ms: 2600 },
  tier_complete:  { title: () => "Topic complete!",       subtitle: "On to the next one.",                assets: ["confetti"],               anim: "lg", ms: 2800 },
  level_up:       { title: () => "Level up!",             subtitle: "You're moving up.",                  assets: ["confetti"],               anim: "lg", ms: 3000 },
  tree_complete:  { title: () => "Subject complete!",     subtitle: "You finished the whole tree — wow!", assets: ["confetti", "trophy"],     anim: "xl", ms: 4500 },
};

const ANIM_CLASS = { md: "w-52 h-52", lg: "w-60 h-60", xl: "w-72 h-72" } as const;

type Active = { kind: CelebrationKind; rubies?: number; streak?: number; id: number };

export default function RubyCelebrations() {
  const [active, setActive] = useState<Active | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const handler = (e: Event) => {
      if (reduce) return;
      const detail = (e as CustomEvent).detail as
        | { kind?: CelebrationKind; rubies?: number; streak?: number }
        | undefined;
      const kind = detail?.kind;
      if (!kind) return;
      const ms = kind === "daily_login" ? 3500 : META[kind]?.ms;
      if (!ms) return;

      const id = ++seq.current;
      setActive({ kind, rubies: detail?.rubies, streak: detail?.streak, id });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setActive((cur) => (cur?.id === id ? null : cur));
      }, ms);
    };

    document.addEventListener("ruby-celebrate", handler);
    return () => {
      document.removeEventListener("ruby-celebrate", handler);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!active) return null;

  // Daily login = a centered card (same prominent treatment as the other
  // celebrations), sized to match the tutorial card. Fires on load, auto-dismisses.
  if (active.kind === "daily_login") {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none p-4 bg-black/40 backdrop-blur-sm ruby-celebrate-pop">
        <div className="relative bg-white rounded-[2rem] shadow-2xl border border-gray-100 px-10 py-9 flex flex-col items-center text-center w-[min(26rem,92vw)]">
          <DotLottieReact src="/lottie/streak-fire.json" autoplay loop className="w-32 h-32 flex-shrink-0" />
          <p className="text-2xl font-bold text-[#1a2744] mt-2">Welcome back!</p>
          <p className="text-lg text-gray-600 flex items-center gap-1.5 mt-1">
            <span>{active.streak && active.streak > 1 ? `${active.streak}-day streak` : "Day 1"}</span>
            {active.rubies ? (
              <span className="flex items-center gap-1 font-semibold text-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                · <img src="/rubytransparent.webp" alt="" className="w-5 h-5 object-contain" /> +{active.rubies}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    );
  }

  const meta = META[active.kind];

  return (
    // Dim + blur the page behind the celebration so the card is the clear focus.
    // pointer-events-none keeps it non-blocking — it still auto-dismisses.
    <div className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none p-4 bg-black/40 backdrop-blur-sm ruby-celebrate-pop">
      <div className="relative bg-white rounded-[2rem] shadow-2xl border border-gray-100 px-10 py-9 flex flex-col items-center text-center w-[min(26rem,92vw)]">
        <div className={`relative ${ANIM_CLASS[meta.anim]}`}>
          {meta.assets.map((asset) => (
            <DotLottieReact
              key={asset}
              src={`/lottie/${asset}.json`}
              autoplay
              loop={false}
              className="absolute inset-0 w-full h-full"
            />
          ))}
        </div>
        <h3 className="text-3xl font-extrabold text-[#1a2744]">{meta.title(active.streak)}</h3>
        <p className="text-base text-gray-500 mt-1">{meta.subtitle}</p>
        {active.rubies ? (
          <div className="mt-4 inline-flex items-center gap-2 bg-rose-50 text-brand font-bold text-lg px-4 py-1.5 rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/rubytransparent.webp" alt="" className="w-5 h-5 object-contain" /> +{active.rubies}
          </div>
        ) : null}
      </div>
    </div>
  );
}
