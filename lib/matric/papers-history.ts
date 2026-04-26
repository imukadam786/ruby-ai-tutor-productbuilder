import type { Paper } from "./papers";

// ── History-specific types ────────────────────────────────────────────────────

export type HistoryQuestionType =
  | "quote"
  | "identify"
  | "explain"
  | "define"
  | "comment"
  | "compare"
  | "reliability"
  | "paragraph"
  | "written"
  | "essay";

export interface HistoryRubricLevel {
  marks: string;
  descriptor: string;
}

export interface HistoryRubric {
  level1: HistoryRubricLevel;
  level2: HistoryRubricLevel;
  level3: HistoryRubricLevel;
  level4?: HistoryRubricLevel;
}

export interface HistorySource {
  id: string;
  title: string;
  type: "text" | "image";
  content: string | null;
  imageUrl: string | null;
}

export interface HistorySubQuestion {
  id: string;
  label: string;
  questionText: string;
  marks: number;
  memoText?: string;
  topic: string;
  requiredSources: string[];
  questionType: HistoryQuestionType;
  rubric?: HistoryRubric;
}

export interface HistoryPaperQuestion {
  number: number;
  title: string;
  totalMarks: number;
  sources: HistorySource[];
  subQuestions: HistorySubQuestion[];
}

export interface HistoryPaper extends Omit<Paper, "questions"> {
  questions: HistoryPaperQuestion[];
}

// ── Papers ────────────────────────────────────────────────────────────────────

import histP1_2025 from "@/data/papers/hist-p1-may-jun-2025.json";
import histP2_2025 from "@/data/papers/hist-p2-may-jun-2025.json";
import histP1_2024 from "@/data/papers/hist-p1-may-jun-2024.json";
import histP2_2024 from "@/data/papers/hist-p2-may-jun-2024.json";
import histP1_2023 from "@/data/papers/hist-p1-may-jun-2023.json";
import histP2_2023 from "@/data/papers/hist-p2-may-jun-2023.json";
import histP1_2022 from "@/data/papers/hist-p1-may-jun-2022.json";
import histP2_2022 from "@/data/papers/hist-p2-may-jun-2022.json";
import histP1_2021 from "@/data/papers/hist-p1-may-jun-2021.json";
import histP2_2021 from "@/data/papers/hist-p2-may-jun-2021.json";

export const HISTORY_PAPERS: HistoryPaper[] = [
  histP1_2025 as unknown as HistoryPaper,
  histP2_2025 as unknown as HistoryPaper,
  histP1_2024 as unknown as HistoryPaper,
  histP2_2024 as unknown as HistoryPaper,
  histP1_2023 as unknown as HistoryPaper,
  histP2_2023 as unknown as HistoryPaper,
  histP1_2022 as unknown as HistoryPaper,
  histP2_2022 as unknown as HistoryPaper,
  histP1_2021 as unknown as HistoryPaper,
  histP2_2021 as unknown as HistoryPaper,
];
