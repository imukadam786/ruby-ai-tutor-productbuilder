// ─── lib/homeworkHistory.ts ─────────────────────────────────────────────────
// Client-side, per-device log of "who did I last ask for help, and what did I
// ask about" — powers the "Continue with [Tutor], last used 2 hours ago" card
// and the "Homework history" list on HomeworkStart.tsx.
//
// Deliberately localStorage-only (same tier as the existing survey_count_chat
// pattern in app/page.tsx), not a Supabase table: chat_messages has no
// subject/tutor column today, so there's no historical data to backfill —
// this only ever reflects sessions started after this feature shipped.

const STORAGE_KEY = "ruby_homework_history";
const MAX_ENTRIES = 10;

export interface HomeworkSession {
  tutorName: string;
  /** First line of what the learner asked, trimmed for display. */
  snippet: string;
  timestamp: string; // ISO
}

function readAll(): HomeworkSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(sessions: HomeworkSession[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_ENTRIES)));
  } catch {
    // Storage full or unavailable — losing history silently beats crashing the chat.
  }
}

/** Call once a message actually gets sent to a tutor's chat. */
export function recordHomeworkSession(tutorName: string, snippet: string): void {
  const trimmed = snippet.trim().slice(0, 80);
  const entry: HomeworkSession = {
    tutorName,
    snippet: trimmed || "Homework help",
    timestamp: new Date().toISOString(),
  };
  const rest = readAll().filter((s) => s.tutorName !== tutorName);
  writeAll([entry, ...rest]);
}

/** Most recent session overall, for the one-tap "Continue with [Tutor]" card. */
export function getLastTutor(): HomeworkSession | null {
  const all = readAll();
  return all[0] ?? null;
}

/** Recent sessions across all tutors, most recent first. */
export function getRecentSessions(limit = MAX_ENTRIES): HomeworkSession[] {
  return readAll().slice(0, limit);
}

/** Human-friendly "2 hours ago" style label. */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
