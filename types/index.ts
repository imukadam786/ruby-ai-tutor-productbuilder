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

export type ActiveView = "home" | "chat" | "progress" | "ruby" | "skill-tree" | "student-dashboard" | "watch" | "reading" | "reading-skill-tree" | "settings" | "matric" | "prep-papers-2026" | "discover-maths" | "discover-reading" | "discover" | "subjects" | "matrics" | "study-guides" | "life-skills" | "life-skills-skill-tree" | "afrikaans-fal" | "afrikaans-fal-skill-tree" | "social-sciences" | "social-sciences-skill-tree" | "natural-sciences-tech" | "natural-sciences-tech-skill-tree" | "matric-phys-sci" | "matric-phys-sci-skill-tree" | "maths-literacy" | "maths-literacy-skill-tree" | "life-sciences" | "life-sciences-skill-tree" | "history" | "history-skill-tree" | "business-studies" | "business-studies-skill-tree" | "tourism" | "tourism-skill-tree" | "geography" | "geography-skill-tree";
