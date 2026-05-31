import { supabaseAdmin } from "@/lib/supabase-admin";

export type UsageType = "chat" | "hint" | "tts";

const DAILY_LIMITS: Record<string, Record<UsageType, number>> = {
  freebie: { chat: 5, hint: 5, tts: 5 },
  scholar:  { chat: Infinity, hint: Infinity, tts: Infinity },
  master:   { chat: Infinity, hint: Infinity, tts: Infinity },
};

function getLimit(plan: string, type: UsageType): number {
  return DAILY_LIMITS[plan]?.[type] ?? 5;
}

/** Verify a user JWT and return the user ID, or null if invalid. */
export async function verifyToken(token: string): Promise<string | null> {
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  return user?.id ?? null;
}

/** Look up the user's active plan key, defaulting to "freebie". */
export async function getUserPlan(userId: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.status === "active" && data?.plan ? data.plan : "freebie";
}

/**
 * Check whether the user is within their daily limit for the given type,
 * and if so, increment the counter.
 * Returns { allowed, used, limit }.
 */
export async function checkAndIncrement(
  userId: string,
  type: UsageType,
  plan?: string,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const userPlan = plan ?? (await getUserPlan(userId));
  const limit = getLimit(userPlan, type);

  if (!isFinite(limit)) {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabaseAdmin
    .from("daily_usage")
    .select("chat_count, hint_count, tts_count")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  const counts = {
    chat_count: (data?.chat_count as number) ?? 0,
    hint_count: (data?.hint_count as number) ?? 0,
    tts_count:  (data?.tts_count  as number) ?? 0,
  };

  const currentCount = counts[`${type}_count` as keyof typeof counts];

  if (currentCount >= limit) {
    return { allowed: false, used: currentCount, limit };
  }

  await supabaseAdmin.from("daily_usage").upsert(
    {
      user_id: userId,
      date: today,
      ...counts,
      [`${type}_count`]: currentCount + 1,
    },
    { onConflict: "user_id,date" },
  );

  return { allowed: true, used: currentCount + 1, limit };
}

/**
 * Read today's usage for the user without incrementing. Returns a per-type
 * { used, limit } map plus the resolved plan, so the client can render a counter.
 */
export async function getUsage(
  userId: string,
  plan?: string,
): Promise<{ plan: string; usage: Record<UsageType, { used: number; limit: number }> }> {
  const userPlan = plan ?? (await getUserPlan(userId));
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabaseAdmin
    .from("daily_usage")
    .select("chat_count, hint_count, tts_count")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  const counts = {
    chat: (data?.chat_count as number) ?? 0,
    hint: (data?.hint_count as number) ?? 0,
    tts:  (data?.tts_count  as number) ?? 0,
  };

  return {
    plan: userPlan,
    usage: {
      chat: { used: counts.chat, limit: getLimit(userPlan, "chat") },
      hint: { used: counts.hint, limit: getLimit(userPlan, "hint") },
      tts:  { used: counts.tts,  limit: getLimit(userPlan, "tts")  },
    },
  };
}
