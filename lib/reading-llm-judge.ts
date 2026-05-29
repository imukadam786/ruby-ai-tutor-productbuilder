// ─── Reading LLM-Judge — open-response grading ────────────────────────────────
// Alternative to the (disproven) single-reference embedding scorer for the
// open-response skills (L6.A1 main idea, A2 details, B1 data, B3 vocab).
// One small structured model call returns GREEN / AMBER / RED + the fired
// error, applying the bank's own rubric. Deterministic prompt, temperature 0.
//
// Cost: ~one gpt-4o-mini call per submitted open-response answer (fractions of
// a cent) — only on these 4 skill types, not per question render.

export type JudgeBand = "GREEN" | "AMBER" | "RED";

export interface JudgeResult {
  band: JudgeBand;
  pass: boolean;                // GREEN or AMBER both count as mastery-eligible
  firedError: string | null;    // DETAIL_AS_MAIN | TOPIC_LABEL | VERBATIM_COPY | OFF_TOPIC | null
  reason: string;
}

export interface JudgeInput {
  studentAnswer: string;
  /** Source passage (Reading L6). Optional for subjects whose questions stand
   *  alone, e.g. Life Sciences short-response items. */
  sourceText?: string;
  referenceMainIdea?: string;   // bank model answer (main-idea skill); optional
  /** What a correct answer must do for THIS skill. When set, the judge grades
   *  against this task instead of the default "main idea" framing. Used for
   *  Find Supporting Details / Vocabulary / Data lookup. */
  task?: string;
  /** Binary checks (writing skills C1–C3). When set, the judge marks the
   *  answer against these and bands by how many pass. */
  checklist?: string[];
  /** Rubric-checklist mode (Life Sciences short-response). The judge checks
   *  whether the answer mentions every phrase in the list — paraphrasing is
   *  fine. GREEN = all covered; RED with PARTIAL_RUBRIC = some covered; RED
   *  with OFF_TOPIC = none covered. Strict: only GREEN counts as pass. */
  mustMention?: string[];
  /** Optional question text shown to the model in mustMention mode so it can
   *  judge "does the answer respond to THIS question". */
  questionText?: string;
}

/** Pluggable chat client (OpenAI-shaped). */
export type ChatComplete = (args: {
  model: string;
  temperature: number;
  response_format: { type: "json_object" };
  messages: { role: "system" | "user"; content: string }[];
}) => Promise<{ choices: { message: { content: string | null } }[] }>;

const MUST_MENTION_SYSTEM = `You grade a high-school learner's short written answer in a science subject.

You are given the question, the learner's answer, and a list of REQUIRED points (the rubric). A required point counts as "covered" if the learner's answer mentions it in any wording — exact phrasing is NOT required, paraphrasing in everyday language is fine. Be lenient on spelling and grammar; judge meaning only.

Rules:
- GREEN: every required point is covered.
- RED with firedError PARTIAL_RUBRIC: at least one required point is covered, but not all.
- RED with firedError OFF_TOPIC: zero required points are covered, or the answer is empty / a non-attempt ("idk", "no").

Respond ONLY with JSON:
{"band":"GREEN|RED","firedError":"PARTIAL_RUBRIC|OFF_TOPIC|null","reason":"<=15 words","covered":<integer count of required points covered>}`;

const SYSTEM = `You grade a Grade-4 child's ONE-SENTENCE statement of the MAIN IDEA of a text.

Apply this rubric exactly:
- GREEN: captures what the WHOLE text is mainly about — the overall point, not just one detail. Paraphrasing is good. Be lenient on spelling/grammar; judge meaning only.
- AMBER: on topic and not a mere detail, but too narrow or thin — misses a key part of the overall point.
- RED with error DETAIL_AS_MAIN: states only one fact/event/character, not the overall point.
- RED with error TOPIC_LABEL: only names the subject with no statement about it (e.g. "recycling", "the water cycle").
- RED with error VERBATIM_COPY: copied (almost) word-for-word from the text AND it is only a detail / not the overall point.
- AMBER with error VERBATIM_COPY: copied (almost) word-for-word from the text BUT the copied sentence genuinely states the whole main idea. It passes, but is flagged so the learner is nudged to use their own words next time.
- RED with error OFF_TOPIC: unrelated, or a non-attempt ("i dont know").

A child paraphrasing the whole point in simple words is GREEN even if it does not match the reference wording. A fluent sentence that only restates one detail is RED. Copying is never GREEN: a correct-but-copied main idea is AMBER (flagged), a copied detail is RED.

Respond ONLY with JSON: {"band":"GREEN|AMBER|RED","firedError":"DETAIL_AS_MAIN|TOPIC_LABEL|VERBATIM_COPY|OFF_TOPIC|null","reason":"<=15 words"}`;

export function makeLLMJudge(complete: ChatComplete, model = "gpt-4o-mini") {
  return async (input: JudgeInput): Promise<JudgeResult> => {
    // mustMention mode → use the rubric-checklist system prompt and a
    // question-anchored user message. Returns strict GREEN/RED with a count.
    if (input.mustMention && input.mustMention.length > 0) {
      const user =
        `QUESTION: ${input.questionText ?? "(see required points below)"}\n\n` +
        `REQUIRED POINTS (the rubric):\n- ${input.mustMention.join("\n- ")}\n\n` +
        `LEARNER'S ANSWER: ${input.studentAnswer}`;
      const res = await complete({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: MUST_MENTION_SYSTEM },
          { role: "user", content: user },
        ],
      });
      const raw = res.choices[0]?.message?.content ?? "{}";
      let parsed: { band?: string; firedError?: string; reason?: string; covered?: number };
      try { parsed = JSON.parse(raw); } catch { parsed = {}; }
      const band = (parsed.band === "GREEN" ? "GREEN" : "RED") as JudgeBand;
      const fe = parsed.firedError && parsed.firedError !== "null" ? parsed.firedError : null;
      return {
        band,
        pass: band === "GREEN",
        firedError: band === "GREEN" ? null : fe,
        reason: (parsed.reason || "").slice(0, 120),
      };
    }

    let user: string;
    if (input.checklist && input.checklist.length > 0) {
      // Writing skills (C1–C3): mark against a checklist.
      user =
        `TASK: Mark this child's writing.\nIt must satisfy these checks:\n- ` +
        `${input.checklist.join("\n- ")}\n` +
        `GREEN = all or nearly all checks pass; AMBER = about half pass; RED = few pass. Apply the copy rule too.\n\n` +
        `WRITING PROMPT / TEXT:\n${input.sourceText}\n\nCHILD'S ANSWER: ${input.studentAnswer}`;
    } else if (input.task) {
      // Non-main-idea open response (details / data / vocabulary): grade
      // against the skill's own task, not "main idea".
      user =
        `TASK: ${input.task}\n` +
        `Grade the child's answer against THIS task (not "main idea"). Use the same GREEN/AMBER/RED bands and the copy rule.\n\n` +
        `TEXT:\n${input.sourceText}\n` +
        `${input.referenceMainIdea ? `A correct answer (reference): ${input.referenceMainIdea}\n` : ""}` +
        `\nCHILD'S ANSWER: ${input.studentAnswer}`;
    } else {
      // Default: Find the Main Idea — identical to the calibrated prompt.
      user = `TEXT:\n${input.sourceText}\n\nA correct main idea (reference): ${input.referenceMainIdea}\n\nCHILD'S ANSWER: ${input.studentAnswer}`;
    }
    const res = await complete({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    });
    const raw = res.choices[0]?.message?.content ?? "{}";
    let parsed: { band?: string; firedError?: string; reason?: string };
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const band = (["GREEN", "AMBER", "RED"].includes(parsed.band || "")
      ? parsed.band
      : "RED") as JudgeBand;
    const fe = parsed.firedError && parsed.firedError !== "null" ? parsed.firedError : null;
    // GREEN never carries an error; AMBER may carry a flag (e.g. VERBATIM_COPY
    // on a correct-but-copied main idea — passes, but nudges paraphrasing).
    return {
      band,
      pass: band === "GREEN" || band === "AMBER",
      firedError: band === "GREEN" ? null : fe,
      reason: (parsed.reason || "").slice(0, 120),
    };
  };
}

/** OpenAI-backed judge. Mirrors openAIEmbedder wiring. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openAIJudge(client: { chat: { completions: { create: (a: any) => Promise<any> } } }, model = "gpt-4o-mini") {
  const complete: ChatComplete = (args) => client.chat.completions.create(args);
  return makeLLMJudge(complete, model);
}
