import { Message, ProgressData } from "@/types";
import { supabase } from "@/lib/supabase";

// Keys wiped only when a DIFFERENT user logs in on this device (survey counter stays local).
export const PERSISTENT_USER_KEYS: string[] = [];

export function clearAllUserData(): void {
  // No-op: all user data now lives in Supabase, keyed by auth user_id.
  // A different user logging in on the same device will see their own DB data automatically.
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getAuthUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function getMessages(): Promise<Message[]> {
  const user = await getAuthUser();
  if (!user) return [];
  const { data } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (!data) return [];
  return data.map((r) => ({
    id: r.id as string,
    role: r.role as "user" | "assistant",
    content: r.content as string,
    timestamp: r.created_at as string,
  }));
}

export function saveMessages(messages: Message[]): void {
  if (messages.length === 0) return;
  void (async () => {
    const user = await getAuthUser();
    if (!user) return;
    await supabase.from("chat_messages").upsert(
      messages.map((m) => ({
        id: m.id,
        user_id: user.id,
        role: m.role,
        content: m.content,
        created_at: m.timestamp,
      })),
      { onConflict: "id" }
    );
  })();
}

// ── Progress ──────────────────────────────────────────────────────────────────

const DEFAULT_PROGRESS: ProgressData = {
  totalMessages: 0,
  topicsStudied: [],
  lessonsCompleted: 0,
  lessonsStarted: 0,
  sessionCount: 0,
  lastSession: new Date().toISOString(),
  subjectBreakdown: {},
};

export async function getProgress(): Promise<ProgressData> {
  const user = await getAuthUser();
  if (!user) return { ...DEFAULT_PROGRESS };
  const { data } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!data) return { ...DEFAULT_PROGRESS };
  return {
    totalMessages: (data.total_messages as number) ?? 0,
    topicsStudied: (data.topics_studied as string[]) ?? [],
    lessonsCompleted: (data.lessons_completed as number) ?? 0,
    lessonsStarted: (data.lessons_started as number) ?? 0,
    sessionCount: (data.session_count as number) ?? 0,
    lastSession: (data.last_session as string) ?? new Date().toISOString(),
    subjectBreakdown: (data.subject_breakdown as Record<string, number>) ?? {},
  };
}

export function updateProgress(updates: Partial<ProgressData>): void {
  void (async () => {
    const user = await getAuthUser();
    if (!user) return;
    const current = await getProgress();
    const merged = { ...current, ...updates };
    await supabase.from("progress").upsert(
      {
        user_id: user.id,
        total_messages: merged.totalMessages,
        topics_studied: merged.topicsStudied,
        lessons_completed: merged.lessonsCompleted,
        lessons_started: merged.lessonsStarted,
        session_count: merged.sessionCount,
        last_session: merged.lastSession,
        subject_breakdown: merged.subjectBreakdown,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  })();
}

export function incrementMessageCount(): void {
  void (async () => {
    const user = await getAuthUser();
    if (!user) return;
    const progress = await getProgress();
    updateProgress({ totalMessages: progress.totalMessages + 1 });
    recordDailyActivity();
  })();
}

export function addTopicStudied(topic: string): void {
  void (async () => {
    const user = await getAuthUser();
    if (!user) return;
    const progress = await getProgress();
    if (!progress.topicsStudied.includes(topic)) {
      updateProgress({ topicsStudied: [...progress.topicsStudied, topic] });
    }
  })();
}

export function incrementSession(): void {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem("session_counted")) return;
  sessionStorage.setItem("session_counted", "1");
  void (async () => {
    const user = await getAuthUser();
    if (!user) return;
    const progress = await getProgress();
    updateProgress({
      sessionCount: progress.sessionCount + 1,
      lastSession: new Date().toISOString(),
    });
  })();
}

// ── Streak & daily activity ───────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  dailyActivity: Record<string, number>;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

const EMPTY_STREAK: StreakData = {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: "",
  dailyActivity: {},
};

export async function getStreakData(): Promise<StreakData> {
  const user = await getAuthUser();
  if (!user) return { ...EMPTY_STREAK };
  const { data } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!data) return { ...EMPTY_STREAK };
  return {
    currentStreak: (data.current_streak as number) ?? 0,
    bestStreak: (data.best_streak as number) ?? 0,
    lastActiveDate: (data.last_active_date as string) ?? "",
    dailyActivity: (data.daily_activity as Record<string, number>) ?? {},
  };
}

export function recordDailyActivity(): void {
  void (async () => {
    const user = await getAuthUser();
    if (!user) return;
    const data = await getStreakData();
    const today = toDateStr(new Date());
    const updatedActivity = {
      ...data.dailyActivity,
      [today]: (data.dailyActivity[today] || 0) + 1,
    };
    let { currentStreak, bestStreak } = data;
    if (data.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (data.lastActiveDate === toDateStr(yesterday)) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      bestStreak = Math.max(bestStreak, currentStreak);
    }
    await supabase.from("user_streaks").upsert(
      {
        user_id: user.id,
        current_streak: currentStreak,
        best_streak: bestStreak,
        last_active_date: today,
        daily_activity: updatedActivity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  })();
}
