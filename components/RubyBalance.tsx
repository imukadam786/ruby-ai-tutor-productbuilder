"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";

/**
 * Rubies balance counter (Phase 1 — display only, no spending).
 *
 * Shows the logged-in learner's ruby balance and pops a "+N" when they earn.
 * Listens for the `ruby-earned` event fired by lib/fetch.ts on a rewarded
 * answer, and on first mount per app load it fires the daily-login reward.
 */

// Module-scoped so daily login fires once per app load even though the counter
// is mounted in more than one place (sidebar + mobile top bar).
let dailyLoginFired = false;

interface RubyBalanceProps {
  theme?: "dark" | "light";
  className?: string;
}

export default function RubyBalance({ theme = "dark", className = "" }: RubyBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [pop, setPop] = useState<number | null>(null);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const showPop = useCallback((amount: number) => {
    if (amount <= 0) return;
    setPop(amount);
    if (popTimer.current) clearTimeout(popTimer.current);
    popTimer.current = setTimeout(() => setPop(null), 1600);
  }, []);

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
            if (award.awarded > 0) showPop(award.awarded);
          }
        } catch {
          /* non-blocking */
        }
      })();
    }
  }, [fetchBalance, showPop]);

  // Earn events from answered questions.
  useEffect(() => {
    const handler = (e: Event) => {
      const award = (e as CustomEvent).detail as { awarded?: number; new_balance?: number } | undefined;
      if (award && typeof award.new_balance === "number") {
        setBalance(award.new_balance);
        if (award.awarded) showPop(award.awarded);
      } else {
        void fetchBalance();
      }
    };
    document.addEventListener("ruby-earned", handler);
    return () => document.removeEventListener("ruby-earned", handler);
  }, [fetchBalance, showPop]);

  useEffect(() => () => { if (popTimer.current) clearTimeout(popTimer.current); }, []);

  // Only render for logged-in learners.
  if (balance === null) return null;

  const palette =
    theme === "light"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-white/15 text-white border-white/20";

  return (
    <span
      title={`${balance} rubies earned`}
      className={`relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold leading-none border ${palette} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/rubytransparent.png" alt="rubies" className="w-4 h-4 object-contain" />
      <span>{balance.toLocaleString()}</span>
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
