export type MCQOptions = {
  A: string;
  B?: string; C?: string; D?: string; E?: string;
  F?: string; G?: string; H?: string; I?: string; J?: string;
};

export interface MatchRow {
  label: string;  // e.g. "1.4.1"
  term: string;   // the COLUMN A term
}

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
  type?: "written" | "mcq" | "calculation" | "two-column" | "match-group" | "answer-book";
  /** Required when type === "mcq" */
  options?: MCQOptions;
  /** Word bank for fill-in-the-blank questions — renders as tappable chips instead of a textarea */
  wordBank?: string[];
  /** Column labels for type === "two-column". For "answer-book" overrides section labels (defaults: "Workings" / "Statement (R)") */
  col1Label?: string;
  col2Label?: string;
  /** Required when type === "match-group": the COLUMN A rows */
  matchRows?: MatchRow[];
  /** Required when type === "match-group": the COLUMN B options keyed by letter */
  matchOptions?: Record<string, string>;
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

// Paper metadata + per-paper dynamic loader live in ./paper-index.ts (auto-
// generated from data/papers/*.json). UI components import PAPER_INDEX for
// list views and call loadPaperById() to fetch a single paper's full content
// on demand. This file keeps only the shared types + helpers.

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
