// ─── lib/report-generator.ts ─────────────────────────────────────────────────
// Calls OpenAI GPT-4o to generate personalised text content for the report.
// Returns a structured ReportContent object consumed by report-pdf.ts.
// Does NOT build the PDF — that is report-pdf.ts's responsibility.

export type ReportSubject = "maths" | "reading";

export type DiagnosticReportInput = {
  subject: ReportSubject;
  studentName: string;        // first name only
  studentGrade: number;       // school enrolment grade 1–12
  workingLevel: string;       // e.g. "Level 13 — Algebra, Patterns and Variables"
  gradeLevelGap: number;      // expected entry level minus actual entry level (0 = on track, positive = behind)
  questionsAnalysed: number;  // actual count from placement.tasks.length
  correctCount: number;       // number of correct answers in the placement
  domainScores: {
    domain: string;           // human-readable domain title
    score: number;            // 0–100
    label: "strong" | "practice" | "building";
    errorNote: string | null; // plain-language description of the specific error
  }[];
  dominantErrors: string[];   // top 1–3 error codes
  placementSkill: string;     // plain name of entry skill
  hardGateBlocked: boolean;
  skillsCompleted: number;    // auto-completed skills count
};

export type ReportContent = {
  placementSummary: string;
  strengthsNote: string;
  rootCauseSummary: string;
  learningPlan: {
    stepNumber: number;
    title: string;
    description: string;
    estimate: string;
  }[];
  experienceBullets: string[];
  parentGuidance: {
    whatYouMayNotice: string;
    howYouCanHelp: string;
  };
  expectedOutcomes: string[];
  nextSessionHook: string;
};

// ─── AI generation ────────────────────────────────────────────────────────────

export async function generateReportContent(
  input: DiagnosticReportInput
): Promise<ReportContent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const errorDescriptions = buildErrorDescriptions(input.dominantErrors, input.subject);
  const prompt = buildPrompt(input, errorDescriptions);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 2000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  // Strip markdown fences before parsing
  const clean = text.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(clean) as ReportContent;
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a specialist education writer for Ruby AI Tutor. Your job is to write personalised diagnostic reports for parents about their child's placement test results.

TONE RULES — follow these absolutely:
- Write for a parent, not a teacher. No education jargon.
- Always use the child's first name, never "your child" or "the student".
- Never use the words: diagnostic, assessment, test, score, data, algorithm, metric, threshold, rubric, tier, phase, node, skill ID.
- Positive and forward-looking. Never alarming. Never list what will go wrong — only what will improve.
- Short sentences. Plain words. A parent reading on a phone should understand every sentence.
- Never use bullet points in your output — use full sentences in all prose fields.
- The experienceBullets and expectedOutcomes fields ARE bullet points — keep them to one sentence each, no sub-bullets.

OUTPUT FORMAT: Respond with a single valid JSON object matching the ReportContent type exactly. No preamble, no explanation, no markdown fences. Just the JSON.`;

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(input: DiagnosticReportInput, errorDescriptions: string): string {
  const gapText =
    input.gradeLevelGap === 0
      ? "at the expected starting point"
      : input.gradeLevelGap > 0
      ? `${input.gradeLevelGap} level${input.gradeLevelGap > 1 ? "s" : ""} before the expected starting point`
      : "ahead of the expected starting point";

  const domainSummary = input.domainScores
    .map(
      (d) =>
        `${d.domain}: ${d.label} (${d.score}%)${d.errorNote ? ` — ${d.errorNote}` : ""}`
    )
    .join("\n");

  return `Generate a personalised diagnostic report for the following student.

STUDENT: ${input.studentName}
SCHOOL GRADE: Grade ${input.studentGrade}
SUBJECT: ${input.subject === "maths" ? "Maths" : "Reading"}
WORKING LEVEL: ${input.workingLevel} (${gapText})
SKILLS ALREADY KNOWN: ${input.skillsCompleted} skills auto-completed by the diagnostic
STARTING SKILL ON RUBY: ${input.placementSkill}
${input.hardGateBlocked ? "HARD GATE: Student must complete encoding foundation before reading skills unlock." : ""}

DOMAIN PERFORMANCE:
${domainSummary}

SPECIFIC ERROR PATTERNS FOUND:
${errorDescriptions}

INSTRUCTIONS:
1. placementSummary: Tell the parent where ${input.studentName} starts and why this is a good thing. Mention the ${input.skillsCompleted} skills already known if > 0. Make it reassuring. 2–3 sentences.
2. strengthsNote: Identify the strongest domain. Explain specifically how Ruby will use that strength as the entry point into the weaker areas. 2–3 sentences.
3. rootCauseSummary: Explain in plain language why the main focus area matters — what it connects to, why fixing it will unlock other things. 3–4 sentences. Name the subject-specific connection (e.g. fractions → algebra for Maths, phonics → fluency → comprehension for Reading).
4. learningPlan: Generate 3–4 steps in sequence. Each step should have a short title (4–6 words), a 2–3 sentence description using ${input.studentName}'s name at least once, and a realistic session estimate (format: "2–3 sessions · about 15–20 minutes each"). Build logically on the previous step.
5. experienceBullets: 4–5 one-sentence bullets describing what ${input.studentName} will actually see and do on Ruby. Focus on the experience, not the curriculum.
6. parentGuidance.whatYouMayNotice: Describe 2–3 specific observable behaviours at home that are typical for a student with ${input.studentName}'s error pattern. End with a reassurance.
7. parentGuidance.howYouCanHelp: Give 2–3 specific, practical things the parent can do THIS WEEK that directly target the specific errors found. Use everyday situations. Be concrete.
8. expectedOutcomes: 3–4 one-sentence bullets. Start each with a verb. Focus on observable improvements the parent will notice.
9. nextSessionHook: 1–2 sentences. Tell the parent what happens next. Mention Ruby will send an update after the first session.`;
}

// ─── Error description maps ───────────────────────────────────────────────────

const MATHS_ERROR_PLAIN: Record<string, string> = {
  // Generic parents
  execution_slip: "Makes procedural errors — knows the method but makes slips applying it",
  strategy_gap: "Does not know which method to choose for a problem type",
  representation_confusion: "Understands a concept in one format but fails when it looks different",
  conceptual_gap: "Has a gap in the underlying understanding of what the operation means",
  // Specific codes
  ERR_COUNT_SKIP: "Skips numbers when counting — affects foundations of addition and multiplication",
  ERR_SIGN_ERROR: "Applies the wrong operation (e.g. subtracts when the sign says add)",
  ERR_CALC_SLIP: "Makes arithmetic fact errors mid-calculation (e.g. 7+8=16) despite knowing the method",
  ERR_STEP_SKIP: "Omits a required step in a procedure (e.g. forgets to carry in column addition)",
  ERR_NO_STRATEGY: "Attempts problems with no identifiable method — trial and error only",
  ERR_WRONG_STRATEGY: "Applies a real strategy to the wrong problem type",
  ERR_PLACE_VALUE: "Confuses the value of digits in different positions (tens, units, hundreds)",
  ERR_INVERSE_UNKNOWN: "Does not recognise that addition/subtraction or multiplication/division reverse each other",
  ERR_SYMBOLIC_ONLY: "Can calculate with numbers but fails when the same problem appears as a word or diagram",
  ERR_CONCRETE_ONLY: "Understands problems with objects but cannot work with written number sentences",
  ERR_GRAPH_MISREAD: "Cannot read values correctly from charts, tables, or number lines",
  ERR_FRACTION_FORM: "Knows fractions in one format (e.g. shaded shapes) but fails in others (e.g. number line)",
  ERR_OP_MEANING: "No mental model of what the operation does — knows procedures by rote only",
  ERR_ZERO_IDENTITY: "Misapplies zero rules (e.g. believes n×0=n)",
  ERR_EQUALITY_MISREAD: "Treats the equals sign as 'write the answer here' rather than as a balance",
  ERR_PART_WHOLE: "Cannot decompose numbers into parts or understand that parts sum to a whole",
};

const READING_ERROR_PLAIN: Record<string, string> = {
  ERR_PHONEME_CONF: "Confuses similar sounds — e.g. /p/ and /b/, /d/ and /t/",
  ERR_SOUND_RECALL: "Cannot retrieve the sound for a letter they have been taught",
  ERR_BLEND_FAIL: "Can produce individual sounds but cannot merge them into a word",
  ERR_SOUND_OMIT: "Leaves out a sound when reading or spelling a word",
  ERR_SOUND_INSERT: "Adds an extra sound that is not in the word",
  ERR_VOWEL_CONF: "Confuses vowel sounds — short/long vowels, vowel teams, r-controlled vowels",
  ERR_ORTHO_GUESS: "Guesses words from their shape or first letter rather than decoding",
  ERR_SIGHT_MISS: "Cannot automatically recognise common irregular words (said, does, was)",
  ERR_MULTI_BREAK: "Can decode syllables separately but cannot blend them into the full word",
  ERR_FLUENCY_HES: "Reads accurately but slowly — hesitates on words they know",
  ERR_MEANING_BLIND: "Reads words correctly but does not understand what the passage means",
  ERR_SELF_MON: "Does not notice or correct errors that make the sentence nonsensical",
};

export function describeError(code: string, subject: ReportSubject): string | undefined {
  const map = subject === "maths" ? MATHS_ERROR_PLAIN : READING_ERROR_PLAIN;
  return map[code];
}

function buildErrorDescriptions(
  dominantErrors: string[],
  subject: ReportSubject
): string {
  const map = subject === "maths" ? MATHS_ERROR_PLAIN : READING_ERROR_PLAIN;
  if (!dominantErrors.length) return "No dominant error pattern — performance was consistent.";
  return dominantErrors
    .map((code) => `${code}: ${map[code] ?? "Error pattern detected — see domain scores"}`)
    .join("\n");
}
