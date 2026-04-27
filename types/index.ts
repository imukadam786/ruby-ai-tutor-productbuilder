export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ProgressData {
  totalMessages: number;
  topicsStudied: string[];
  lessonsCompleted: number;
  lessonsStarted: number;
  sessionCount: number;
  lastSession: string;
  subjectBreakdown: Record<string, number>;
}

export type ActiveView = "home" | "chat" | "progress" | "ruby" | "skill-tree" | "student-dashboard" | "watch" | "reading" | "reading-skill-tree" | "settings" | "matric" | "prep-papers-2026" | "discover-maths" | "discover-reading" | "discover" | "subjects";
