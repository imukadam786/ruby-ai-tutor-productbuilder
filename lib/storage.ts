import { Message, LessonPlan, ProgressData } from "@/types";

const MESSAGES_KEY = "ai_tutor_messages";
const LESSONS_KEY = "ai_tutor_lessons";
const PROGRESS_KEY = "ai_tutor_progress";

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

export function getLessons(): LessonPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLesson(lesson: LessonPlan): void {
  if (typeof window === "undefined") return;
  const lessons = getLessons();
  const idx = lessons.findIndex((l) => l.id === lesson.id);
  if (idx >= 0) {
    lessons[idx] = lesson;
  } else {
    lessons.unshift(lesson);
  }
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
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
