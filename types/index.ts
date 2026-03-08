export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface LessonSection {
  title: string;
  content: string;
  examples?: string[];
  practice?: string;
}

export interface LessonPlan {
  id: string;
  topic: string;
  subject: string;
  level: string;
  sections: LessonSection[];
  summary: string;
  createdAt: string;
  completed: boolean;
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

export type ActiveView = "home" | "chat" | "lessons" | "progress" | "ruby" | "skill-tree" | "student-dashboard" | "watch" | "reading" | "reading-skill-tree";
