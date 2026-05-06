export type MCQOptions = { A: string; B?: string; C?: string; D?: string; E?: string };

export interface SubQuestion {
  id: string;
  label: string;
  questionText: string;
  marks: number;
  memoText: string;
  topic: string;
  /** Passage text (poem, extract) shown as a blockquote above the question. Cascades: overrides question-level passageText for this subQ and all following ones until the next override. */
  passageText?: string;
  diagramUrl?: string;
  /** Multiple reference images shown stacked (e.g. financial statement A + B for the same question) */
  diagramUrls?: string[];
  /** Completed sketch shown to student after submission (memo version of diagram) */
  memoImageUrl?: string;
  /** Input layout variant. Defaults to "written" if omitted. */
  type?: "written" | "mcq" | "calculation" | "two-column";
  /** Required when type === "mcq" */
  options?: MCQOptions;
  /** Column labels for type === "two-column" (col1 defaults to "Workings", col2 defaults to "Answer") */
  col1Label?: string;
  col2Label?: string;
}

export interface PaperQuestion {
  number: number;
  title: string;
  totalMarks: number;
  /** Passage text (poem, extract A) shown as a blockquote. Overridden per-subQuestion for subsequent extracts. */
  passageText?: string;
  diagramUrl?: string;
  diagramUrls?: string[];
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
import { GEO_PAPERS } from "./papers-geo";
import { LIFE_SCI_PAPERS } from "./papers-life-sci";
import { ACC_PAPERS } from "./papers-acc";
import { TOURISM_PAPERS } from "./papers-tourism";
import { BUS_STUD_PAPERS } from "./papers-bus-stud";
import { ECONOMICS_PAPERS } from "./papers-economics";
import { MATHS_LIT_PAPERS } from "./papers-maths-lit";

export const PAPERS: Paper[] = [
  ...MATHS_PAPERS,
  ...PHYSICS_PAPERS,
  ...ENGLISH_PAPERS,
  ...AFRIKAANS_PAPERS,
  ...(HISTORY_PAPERS as unknown as Paper[]),
  ...GEO_PAPERS,
  ...LIFE_SCI_PAPERS,
  ...ACC_PAPERS,
  ...TOURISM_PAPERS,
  ...BUS_STUD_PAPERS,
  ...ECONOMICS_PAPERS,
  ...MATHS_LIT_PAPERS,
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
