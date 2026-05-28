"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";

type UsageType = "chat" | "hint" | "tts";
type UsageMap = Record<UsageType, { used: number; limit: number }>;

interface UsageMeterProps {
  /** "compact" = single line for sidebar/footer; "row" = stacked rows. */
  variant?: "compact" | "row";
  /** Badge palette for the compact variant — "dark" sits on the dark sidebar,
   *  "light" sits on white headers. Ignored for the row variant. */
  theme?: "dark" | "light";
  className?: string;
}

const ROW_LABELS: Record<UsageType, string> = {
  chat: "Chat",
  hint: "Hints",
  tts: "Audio",
};

export default function UsageMeter({ variant = "compact", theme = "dark", className = "" }: UsageMeterProps) {
  const [plan, setPlan] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageMap | null>(null);

  const fetchUsage = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setPlan(null);
      setUsage(null);
      return;
    }
    try {
      const res = await apiFetch("/api/usage", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const body = await res.json();
      setPlan(body.plan ?? null);
      setUsage(body.usage ?? null);
    } catch {
      // Silent — meter just won't render this tick.
    }
  }, []);

  useEffect(() => {
    void fetchUsage();
    const handler = () => { void fetchUsage(); };
    document.addEventListener("ruby-usage-changed", handler);
    return () => document.removeEventListener("ruby-usage-changed", handler);
  }, [fetchUsage]);

  // Only the freebie plan has finite daily limits; paid plans get no meter.
  if (!plan || plan !== "freebie" || !usage) return null;

  const types: UsageType[] = ["chat", "hint", "tts"];

  if (variant === "compact") {
    const restClass =
      theme === "light"
        ? "bg-gray-100 text-gray-700 border-gray-200"
        : "bg-white/15 text-white border-white/20";
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {types.map((t) => {
          const { used, limit } = usage[t];
          const exhausted = used >= limit;
          return (
            <span
              key={t}
              title={`${ROW_LABELS[t]}: ${used} of ${limit} used today`}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold leading-none flex items-center gap-1 border ${
                exhausted ? "bg-red-50 text-red-700 border-red-200" : restClass
              }`}
            >
              {t === "chat" ? "💬" : t === "hint" ? "💡" : "🔊"}
              <span>{used}/{limit}</span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {types.map((t) => {
        const { used, limit } = usage[t];
        const pct = Math.min(100, Math.round((used / limit) * 100));
        const exhausted = used >= limit;
        return (
          <div key={t} className="text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">{ROW_LABELS[t]}</span>
              <span className={exhausted ? "text-red-600 font-semibold" : "text-gray-500"}>
                {used} / {limit}
              </span>
            </div>
            <div className="h-1 mt-0.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${exhausted ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
