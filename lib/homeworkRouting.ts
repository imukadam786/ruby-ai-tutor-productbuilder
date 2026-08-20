// ─── lib/homeworkRouting.ts ─────────────────────────────────────────────────
// Instant, client-side "which tutor should handle this?" guess from typed text.
// No API call — pure keyword matching against each tutor's subjects, plus
// common synonyms a learner is more likely to actually type than the formal
// subject name (e.g. "algebra" rather than "Maths").
//
// This deliberately stays a simple keyword map rather than a model call: the
// chat backend (app/api/chat/route.ts) doesn't vary its behaviour by tutor, so
// getting this "recommendation" right matters for UX (who a learner lands on),
// not for answer quality. Image-only uploads use the heavier
// /api/classify-subject call instead — see HomeworkStart.tsx.

import { TUTORS, Tutor } from "@/lib/tutors";

// Canonical subject → extra keywords a learner might type instead of the
// subject name itself. Every tutor.subjects entry is already matched as a
// keyword automatically, so only add synonyms here.
const SUBJECT_SYNONYMS: Record<string, string[]> = {
  English: ["essay", "grammar", "comprehension", "poem", "novel", "spelling", "vocabulary", "writing"],
  Afrikaans: ["afrikaans"],
  Languages: [],
  Maths: ["algebra", "equation", "fraction", "geometry", "trigonometry", "calculus", "solve for x", "maths", "math"],
  "Maths Literacy": ["maths lit", "budget", "interest rate", "exchange rate"],
  "Business Studies": ["business plan", "entrepreneur", "marketing"],
  Accounting: ["ledger", "balance sheet", "journal entry", "trial balance", "debit", "credit"],
  Economics: ["gdp", "inflation", "market", "supply and demand", "economics"],
  Geography: ["map", "climate", "geography", "contour"],
  History: ["history", "world war", "apartheid", "cold war", "revolution"],
  Tourism: ["tourism", "travel", "itinerary"],
  "Life Skills": ["life skills", "life orientation"],
  "Social Studies": ["social studies"],
  NST: ["natural sciences and technology", "nst"],
  "Natural Science": ["biology", "cell", "photosynthesis", "ecosystem", "natural science"],
  "Physical Sciences": ["physics", "chemistry", "chemical reaction", "force", "physical science"],
};

interface SubjectHit {
  subject: string;
  tutor: Tutor;
}

function buildSubjectIndex(): SubjectHit[] {
  const index: SubjectHit[] = [];
  for (const tutor of TUTORS) {
    for (const subject of tutor.subjects) {
      index.push({ subject, tutor });
    }
  }
  return index;
}

const SUBJECT_INDEX = buildSubjectIndex();

export type RoutingConfidence = "high" | "ambiguous" | "none";

export interface RoutingResult {
  tutor: Tutor | null;
  /** Alternate tutors worth offering when confidence is "ambiguous". */
  alternates: Tutor[];
  subject: string | null;
  confidence: RoutingConfidence;
}

/** Resolve a subject name (as returned by /api/classify-subject, or matched
    directly) to the tutor that covers it. */
export function tutorForSubject(subject: string): Tutor | null {
  const hit = SUBJECT_INDEX.find((h) => h.subject.toLowerCase() === subject.toLowerCase());
  return hit?.tutor ?? null;
}

/** Instant keyword match against typed homework text. */
export function matchTutorByText(text: string): RoutingResult {
  const normalized = text.toLowerCase();
  if (!normalized.trim()) {
    return { tutor: null, alternates: [], subject: null, confidence: "none" };
  }

  const matchedTutors = new Map<string, { tutor: Tutor; subject: string }>();

  for (const { subject, tutor } of SUBJECT_INDEX) {
    const keywords = [subject, ...(SUBJECT_SYNONYMS[subject] ?? [])];
    const hit = keywords.some((kw) => kw && normalized.includes(kw.toLowerCase()));
    if (hit && !matchedTutors.has(tutor.name)) {
      matchedTutors.set(tutor.name, { tutor, subject });
    }
  }

  const matches = Array.from(matchedTutors.values());

  if (matches.length === 0) {
    return { tutor: null, alternates: [], subject: null, confidence: "none" };
  }
  if (matches.length === 1) {
    return { tutor: matches[0].tutor, alternates: [], subject: matches[0].subject, confidence: "high" };
  }
  // Multiple plausible tutors — recommend the first hit, offer the rest as alternates.
  return {
    tutor: matches[0].tutor,
    alternates: matches.slice(1).map((m) => m.tutor),
    subject: matches[0].subject,
    confidence: "ambiguous",
  };
}
