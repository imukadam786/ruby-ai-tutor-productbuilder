export type MCQOptions = { A: string; B: string; C: string; D: string; E?: string };

export interface SubQuestion {
  id: string;
  label: string;
  questionText: string;
  marks: number;
  memoText: string;
  topic: string;
  diagramUrl?: string;
  /** Completed sketch shown to student after submission (memo version of diagram) */
  memoImageUrl?: string;
  /** "mcq" renders A/B/C/D option cards. Defaults to "written" if omitted. */
  type?: "written" | "mcq";
  /** Required when type === "mcq" */
  options?: MCQOptions;
}

export interface PaperQuestion {
  number: number;
  title: string;
  totalMarks: number;
  diagramUrl?: string;
  subQuestions: SubQuestion[];
}

export interface InfoSheet {
  title: string;
  /** Render from the pre-built markdown formula sheets (Maths) */
  formulaSheetVariant?: import("./formula-sheets").FormulaSheetVariant;
  /** Render a PDF in an iframe (upload PDF to Supabase storage) */
  pdfUrl?: string;
  /** Render from Supabase-hosted images (fallback for image-based sheets) */
  imageUrls?: string[];
}

export interface Paper {
  id: string;
  subject: string;
  paperCode: string;
  year: number;
  session: string;
  totalMarks: number;
  durationHours: number;
  questions: PaperQuestion[];
  questionPaperUrl?: string;
  memoUrl?: string;
  /** Info / formula / data sheet shown in-session */
  infoSheet?: InfoSheet;
}

import { MATHS_PAPERS } from "./papers-maths";
import { PHYSICS_PAPERS } from "./papers-physics";
import { ENGLISH_PAPERS } from "./papers-english";
import { AFRIKAANS_PAPERS } from "./papers-afrikaans";
import { HISTORY_PAPERS } from "./papers-history";

export const PAPERS: Paper[] = [
  ...MATHS_PAPERS,
  ...PHYSICS_PAPERS,
  ...ENGLISH_PAPERS,
  ...AFRIKAANS_PAPERS,
  ...(HISTORY_PAPERS as unknown as Paper[]),
];

export function getFlatSubQuestions(paper: Paper): SubQuestion[] {
  return paper.questions.flatMap((q) => q.subQuestions);
}

export function getTopicBreakdown(
  paper: Paper,
  attempts: Record<string, { marksEarned: number; submitted: boolean }>
): Record<string, { earned: number; total: number; question: number }> {
  const topics: Record<string, { earned: number; total: number; question: number }> = {};
  for (const q of paper.questions) {
    for (const sq of q.subQuestions) {
      if (!topics[sq.topic]) {
        topics[sq.topic] = { earned: 0, total: 0, question: q.number };
      }
      topics[sq.topic].total += sq.marks;
      if (attempts[sq.id]?.submitted) {
        topics[sq.topic].earned += attempts[sq.id]?.marksEarned ?? 0;
      }
    }
  }
  return topics;
}
