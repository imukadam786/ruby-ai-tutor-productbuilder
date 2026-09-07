// ─── Per-topic wrong-answer feedback for content subjects ────────────────────
//
// Some content subjects (the Senior-Phase set plus Life Sciences) label each
// question with a near-unique fact code rather than a shared misconception
// taxonomy, so there is no error-code map to build a feedback card from. What
// they DO carry is one authored `recovery_strategy` sentence per TOPIC, plus
// CAPS metadata. This module turns that into the two card parts that aren't
// already covered:
//
//   • "Where you'll see this"  — built here from CAPS strand / grade / term
//     (no new authoring — see buildTopicWhere)
//   • "Think of it like this"  — one everyday analogy per topic, authored in
//     lib/<subject>-topic-feedback.ts and looked up by skill/topic id
//
// "Why this happens" stays the per-question `memo`; "How to fix it" is the
// topic's `recovery_strategy`; "What went wrong" is the answer comparison.

/** Human-readable subject name for the "where" line. */
export const SUBJECT_LABEL: Record<string, string> = {
  "ems-sp": "Economic & Management Sciences",
  "life-sciences": "Life Sciences",
  "technology-sp": "Technology",
  "social-sciences-sp": "Social Sciences",
  "life-orientation-sp": "Life Orientation",
  "creative-arts-sp": "Creative Arts",
  "social-sciences": "Social Sciences",
  "natural-sciences-sp": "Natural Sciences",
  "business-studies": "Business Studies",
  "history": "History",
  "accounting": "Accounting",
  "economics": "Economics",
  "geography": "Geography",
  "tourism": "Tourism",
  "physical-sciences": "Physical Sciences",
  "afrikaans": "Afrikaans First Additional Language",
};

// "G7 T1" / "G10 T3" → "Term 1"; "G7", "T1-T4" (a range) or missing → "".
function termPhrase(capsTerm?: string): string {
  if (!capsTerm || /T\s*[1-4]\s*[-–]\s*T?\s*[1-4]/i.test(capsTerm)) return "";
  const m = capsTerm.match(/T\s*([1-4])/i);
  return m ? `Term ${m[1]}` : "";
}

// Strand strings often carry a " · Term 1" tail — drop it for the topic name.
function cleanStrand(strand?: string): string {
  return (strand ?? "").replace(/\s*·\s*Term\s*[1-4]\s*$/i, "").trim();
}

/**
 * Build the "Where you'll see this" line from a topic's CAPS metadata. No
 * authored content — pure formatting of fields already in the question bank.
 */
export function buildTopicWhere(opts: {
  subjectSlug: string;
  grade?: number;
  capsTopic?: string;
  strand?: string;
  capsTerm?: string;
}): string {
  const { subjectSlug, grade, capsTopic, strand, capsTerm } = opts;
  const label = SUBJECT_LABEL[subjectSlug] ?? subjectSlug;
  const topicName = capsTopic || cleanStrand(strand);
  const term = termPhrase(capsTerm);
  const head = [label, grade ? `Grade ${grade}` : "", term].filter(Boolean).join(" · ");
  const inTopic = topicName ? ` It sits in the “${topicName}” topic.` : "";
  const assess = grade && grade >= 10 ? "your exams" : "class tests and assessments";
  return `${head}.${inTopic} Expect questions on it in ${assess}.`;
}

// Input types whose submitted answer is a single readable value, so the card's
// "What went wrong" answer-vs-correct line makes sense. Structured mechanics
// (sort-buckets, sequence, highlight-source, argument-builder, …) submit a
// joined/encoded blob that reads badly, so they skip the comparison.
const SIMPLE_ANSWER_TYPES = [
  "choice", "true-false", "text", "short-text", "short-response", "scenario",
  "numeric", "diagram-label", "fill-blank", "cloze", "audio-tap", "image-match",
];

interface TopicMeta {
  recovery_strategy?: string;
  grade?: number;
  caps_topic?: string;
  strand?: string;
  caps_term?: string;
  title?: string;
}

/**
 * Build the extra FeedbackExplanation props for a content-subject wrong answer
 * whose feedback is topic-driven (no shared error-code taxonomy): the topic's
 * recovery strategy as "how", an authored analogy as the example, a CAPS-built
 * "where" line, and the answer comparison for simple input types. Returns {} on
 * a correct answer or when the topic can't be resolved, so it spreads harmlessly.
 */
export function topicFeedbackProps(opts: {
  isCorrect: boolean;
  subjectSlug: string;
  topic?: TopicMeta | null;
  examples: Record<string, string>;
  skillId: string | null;
  inputType: string;
  lastAnswer: string;
  correctAnswer?: string | number | null;
}): {
  howOverride?: string;
  exampleOverride?: string;
  whereOverride?: string;
  studentAnswer?: string;
  correctAnswer?: string;
} {
  const { isCorrect, subjectSlug, topic, examples, skillId, inputType, lastAnswer, correctAnswer } = opts;
  if (isCorrect || !skillId) return {};
  const simple = SIMPLE_ANSWER_TYPES.includes(inputType);
  return {
    howOverride: topic?.recovery_strategy || undefined,
    exampleOverride: examples[skillId] || undefined,
    whereOverride: topic
      ? buildTopicWhere({
          subjectSlug,
          grade: topic.grade,
          capsTopic: topic.caps_topic || topic.title,
          strand: topic.strand,
          capsTerm: topic.caps_term,
        })
      : undefined,
    studentAnswer: simple && lastAnswer ? lastAnswer : undefined,
    correctAnswer: simple && correctAnswer != null ? String(correctAnswer) : undefined,
  };
}
