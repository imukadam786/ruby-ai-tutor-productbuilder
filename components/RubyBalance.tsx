"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";

/**
 * Rubies balance counter (Phase 1 / 1.5 — display only, no spending).
 *
 * Shows the balance with a count-up on change and a Diamond glint on each earn.
 * Listens for `ruby-earned` (from lib/fetch.ts + reward-client) and, once per
 * app load, fires the daily-login reward. Big milestone celebrations are handled
 * separately by <RubyCelebrations>.
 */

// Module-scoped so daily login fires once per app load even though the counter
// is mounted in more than one place (sidebar + mobile top bar).
let dailyLoginFired = false;

interface RubyBalanceProps {
  theme?: "dark" | "light";
  /** "sm" = compact sidebar/top-bar pill; "lg" = prominent header badge. */
  size?: "sm" | "lg";
  className?: string;
}

export default function RubyBalance({ theme = "dark", size = "sm", className = "" }: RubyBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [display, setDisplay] = useState<number>(0); // animated count-up value
  const [pop, setPop] = useState<number | null>(null);
  const [glint, setGlint] = useState(0); // bump to replay the icon glint
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const fetchBalance = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setBalance(null);
      return;
    }
    try {
      const res = await apiFetch("/api/rewards/balance");
      if (!res.ok) return;
      const body = await res.json();
      setBalance(body.balance ?? 0);
    } catch {
      /* silent — counter just won't render this tick */
    }
  }, []);

  const onEarn = useCallback((amount: number) => {
    if (amount <= 0) return;
    setPop(amount);
    setGlint((g) => g + 1);
    if (popTimer.current) clearTimeout(popTimer.current);
    popTimer.current = setTimeout(() => setPop(null), 1600);
  }, []);

  // Count-up animation whenever the balance changes.
  useEffect(() => {
    if (balance === null) return;
    const from = display;
    const to = balance;
    if (from === to) return;
    const start = performance.now();
    const dur = 600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) * (1 - t); // ease-out
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [balance]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial balance + once-per-load daily login.
  useEffect(() => {
    void fetchBalance();

    if (!dailyLoginFired) {
      dailyLoginFired = true;
      void (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        try {
          const res = await apiFetch("/api/rewards/daily-login", { method: "POST" });
          const body = await res.json();
          const award = body?.rubies;
          if (award && typeof award.new_balance === "number") {
            setBalance(award.new_balance);
            if (award.awarded > 0) {
              onEarn(award.awarded);
              document.dispatchEvent(
                new CustomEvent("ruby-celebrate", {
                  detail: { kind: "daily_login", rubies: award.awarded, streak: award.streak },
                }),
              );
            }
          }
        } catch {
          /* non-blocking */
        }
      })();
    }
  }, [fetchBalance, onEarn]);

  // Earn events (answers, mastery, effort floor, daily login).
  useEffect(() => {
    const handler = (e: Event) => {
      const award = (e as CustomEvent).detail as { awarded?: number; new_balance?: number } | undefined;
      if (award && typeof award.new_balance === "number") {
        setBalance(award.new_balance);
        if (award.awarded) onEarn(award.awarded);
      } else {
        void fetchBalance();
      }
    };
    document.addEventListener("ruby-earned", handler);
    return () => document.removeEventListener("ruby-earned", handler);
  }, [fetchBalance, onEarn]);

  useEffect(() => () => { if (popTimer.current) clearTimeout(popTimer.current); }, []);

  // Only render for logged-in learners.
  if (balance === null) return null;

  const palette =
    theme === "light"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-white/15 text-white border-white/20";

  const lg = size === "lg";
  const sizing = lg
    ? "gap-1.5 px-3 py-1 text-base"
    : "gap-1 px-2 py-0.5 text-[11px]";
  const icon = lg ? "w-5 h-5" : "w-4 h-4";

  return (
    <span
      title={`${balance} rubies earned`}
      className={`relative inline-flex items-center rounded-full font-semibold leading-none border ${sizing} ${palette} ${className}`}
    >
      <span className={`relative flex-shrink-0 ${icon}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/rubytransparent.webp" alt="rubies" className={`${icon} object-contain`} />
        {glint > 0 && (
          <DotLottieReact
            key={glint}
            src="/lottie/ruby-gem.json"
            autoplay
            loop={false}
            className={`absolute inset-0 pointer-events-none ${icon}`}
          />
        )}
      </span>
      <span>{display.toLocaleString()}</span>
      {pop !== null && (
        <span
          className="absolute -top-3 right-0 text-[11px] font-bold text-rose-500 animate-bounce pointer-events-none"
          aria-hidden
        >
          +{pop}
        </span>
      )}
    </span>
  );
}
