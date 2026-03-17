import { Message, ProgressData } from "@/types";

const MESSAGES_KEY = "ai_tutor_messages";
const PROGRESS_KEY = "ai_tutor_progress";

// Keys that are wiped only when a DIFFERENT user logs in on this device.
// Never cleared on logout — same user must see their data when they log back in.
export const PERSISTENT_USER_KEYS = [
  MESSAGES_KEY,
  PROGRESS_KEY,
  "ruby_streak",
  "ruby_student_profile",
  "ruby_reading_profile",
  "onboardingData",
  "survey_count_chat",
  "beta_session_surveys",
  "beta_feedback",
  "matric_waitlist",
];

export function clearAllUserData(): void {
  if (typeof window === "undefined") return;
  PERSISTENT_USER_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function getMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: Message[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function getProgress(): ProgressData {
  if (typeof window === "undefined") {
    return {
      totalMessages: 0,
      topicsStudied: [],
      lessonsCompleted: 0,
      lessonsStarted: 0,
      sessionCount: 0,
      lastSession: new Date().toISOString(),
      subjectBreakdown: {},
    };
  }
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          totalMessages: 0,
          topicsStudied: [],
          lessonsCompleted: 0,
          lessonsStarted: 0,
          sessionCount: 0,
          lastSession: new Date().toISOString(),
          subjectBreakdown: {},
        };
  } catch {
    return {
      totalMessages: 0,
      topicsStudied: [],
      lessonsCompleted: 0,
      lessonsStarted: 0,
      sessionCount: 0,
      lastSession: new Date().toISOString(),
      subjectBreakdown: {},
    };
  }
}

export function updateProgress(updates: Partial<ProgressData>): void {
  if (typeof window === "undefined") return;
  const current = getProgress();
  const updated = { ...current, ...updates };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
}

export function incrementMessageCount(): void {
  const progress = getProgress();
  updateProgress({ totalMessages: progress.totalMessages + 1 });
  recordDailyActivity();
}

export function addTopicStudied(topic: string): void {
  const progress = getProgress();
  if (!progress.topicsStudied.includes(topic)) {
    updateProgress({ topicsStudied: [...progress.topicsStudied, topic] });
  }
}

export function incrementSession(): void {
  const progress = getProgress();
  updateProgress({
    sessionCount: progress.sessionCount + 1,
    lastSession: new Date().toISOString(),
  });
}

// ── Streak & daily activity ───────────────────────────────────────────────────

const STREAK_KEY = "ruby_streak";

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // "YYYY-MM-DD"
  dailyActivity: Record<string, number>; // "YYYY-MM-DD" → count
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

export function getStreakData(): StreakData {
  if (typeof window === "undefined") return { ...EMPTY_STREAK };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { ...EMPTY_STREAK };
  } catch {
    return { ...EMPTY_STREAK };
  }
}

export function recordDailyActivity(): void {
  if (typeof window === "undefined") return;
  const data = getStreakData();
  const today = toDateStr(new Date());

  const updatedActivity = {
    ...data.dailyActivity,
    [today]: (data.dailyActivity[today] || 0) + 1,
  };

  let { currentStreak, bestStreak } = data;

  if (data.lastActiveDate === today) {
    // Same day — just bump activity count, streak unchanged
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (data.lastActiveDate === toDateStr(yesterday)) {
      currentStreak += 1; // consecutive day
    } else {
      currentStreak = 1; // streak broken (or first day)
    }
    bestStreak = Math.max(bestStreak, currentStreak);
  }

  localStorage.setItem(
    STREAK_KEY,
    JSON.stringify({ currentStreak, bestStreak, lastActiveDate: today, dailyActivity: updatedActivity })
  );
}
