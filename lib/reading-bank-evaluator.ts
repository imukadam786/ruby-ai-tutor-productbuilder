// ─── Reading Bank Evaluator — similarity-band scoring ─────────────────────────
// Grades open-response reading answers (L6.A1/A2/A3, B3 …) against a bank
// reference, with no teacher judgement. One scoped service shared by every
// `similarity-band` skill across L6–L8.
//
// Pipeline (order matters):
//   1. no predicate / topic-label shape  → RED, TOPIC_LABEL  (structural; judged
//      first so a 1-word answer can't be mis-scored as a copy)
//   2. copyScore ≥ copyRejectAt          → RED, VERBATIM_COPY
//   3. coverage ≥ green                  → GREEN  (pass)
//   4. coverage ≥ amber                  → AMBER  (pass, flagged)
//   5. else                              → RED, DETAIL_AS_MAIN
//
// `coverage` is semantic. Production injects OpenAI embeddings; the offline
// fallback is a deterministic lexical cosine (weaker on synonyms — that gap is
// exactly why embeddings are the production path).

export type Band = "GREEN" | "AMBER" | "RED";

export interface SimilarityBandInput {
  studentAnswer: string;
  sourceText: string;
  reference: string;
  bands: { green: number; amber: number };
  copyRejectAt: number;
  /** ERR variants this item may fire, from the bank item. */
  errorSignals: string[];
}

export interface SimilarityBandResult {
  band: Band;
  pass: boolean;            // GREEN or AMBER both count as mastery-eligible
  coverage: number;         // 0–1 semantic coverage vs reference
  copyScore: number;        // 0–1 fraction of answer n-grams lifted from source
  firedError: string | null;
  flagged: boolean;         // AMBER → log + flag if it persists
  scorer: "embeddings" | "lexical";
}

/** Pluggable text→vector. Production: OpenAI text-embedding-3-small. */
export type Embedder = (texts: string[]) => Promise<number[][]>;

const STOPWORDS = new Set(
  ("a an the and or but if then so of to in on at by for with as is are was were be been " +
   "being it its this that these those he she they we you i his her their our your them him " +
   "from into out up down over under than too very can will just not no do does did has have had")
    .split(" ")
);

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}
function contentTokens(s: string): string[] {
  return tokens(s).filter((t) => !STOPWORDS.has(t) && t.length > 1);
}
function ngrams(arr: string[], n: number): string[] {
  if (arr.length < n) return arr.length ? [arr.join(" ")] : [];
  const out: string[] = [];
  for (let i = 0; i <= arr.length - n; i++) out.push(arr.slice(i, i + n).join(" "));
  return out;
}

/** Fraction of the answer's word-4-grams lifted verbatim from the source.
 *  Only meaningful for full sentences — a fragment cannot be a "copied
 *  sentence", and short answers trivially share words with the source, so
 *  answers under 6 words return 0 (topic-label/detail logic handles those). */
export function copyScore(answer: string, source: string): number {
  const a = tokens(answer);
  if (a.length < 6) return 0;
  const n = 4;
  const aGrams = ngrams(a, n);
  if (aGrams.length === 0) return 0;
  const srcGrams = new Set(ngrams(tokens(source), n));
  const hit = aGrams.filter((g) => srcGrams.has(g)).length;
  return hit / aGrams.length;
}

/** Topic-label = a subject named with no predicate verb (spec definition).
 *  Heuristic: very short AND no finite-verb signal. The one check that most
 *  benefits from an LLM-judge fallback; deliberately conservative here. */
function isTopicLabel(answer: string): boolean {
  const toks = tokens(answer);
  if (toks.length === 0) return true;
  // ≤2 content words cannot form a subject + predicate → topic label by
  // definition (covers "Recycling", "The water cycle", "Dogs").
  if (contentTokens(answer).length <= 2) return true;
  if (toks.length > 6) return false;
  const VERBISH = new Set([
    "is","are","was","were","be","been","being","has","have","had","do","does","did",
    "can","will","would","should","could","makes","make","made","goes","go","went",
    "learned","learn","help","helped","show","showed","gets","get","got","needs","need",
    "happens","happen","uses","use","used","reduces","reduce","prevents","prevent",
  ]);
  const hasVerb =
    toks.some((t) => VERBISH.has(t)) ||
    toks.some((t) => /(ed|ing|s)$/.test(t) && !STOPWORDS.has(t) && t.length > 3);
  return !hasVerb;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/** Deterministic offline coverage: content-word cosine, blended with how much
 *  of the reference's key terms the answer recalls (breadth proxy). */
function lexicalCoverage(answer: string, reference: string): number {
  const aTok = contentTokens(answer);
  const rTok = contentTokens(reference);
  if (!aTok.length || !rTok.length) return 0;
  const vocab = Array.from(new Set([...aTok, ...rTok]));
  const vec = (toks: string[]) => {
    const tf: Record<string, number> = {};
    toks.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
    return vocab.map((w) => tf[w] || 0);
  };
  const cos = cosine(vec(aTok), vec(rTok));
  const rSet = new Set(rTok);
  const recall = aTok.filter((t) => rSet.has(t)).length / rSet.size;
  return 0.5 * cos + 0.5 * Math.min(1, recall); // breadth: reward covering many key terms
}

/** Raw signals for one answer — embed/score ONCE, then classify under any
 *  thresholds (calibration sweeps reuse this without re-embedding). */
export interface SimilarityScores {
  coverage: number;
  copyScore: number;
  topicLabel: boolean;
  scorer: "embeddings" | "lexical";
}

export async function scoreSimilarity(
  input: { studentAnswer: string; sourceText: string; reference: string },
  embedder?: Embedder
): Promise<SimilarityScores> {
  const cs = copyScore(input.studentAnswer, input.sourceText);
  let coverage: number;
  let scorer: "embeddings" | "lexical";
  if (embedder) {
    const [a, r] = await embedder([input.studentAnswer, input.reference]);
    coverage = Math.max(0, cosine(a, r));
    scorer = "embeddings";
  } else {
    coverage = lexicalCoverage(input.studentAnswer, input.reference);
    scorer = "lexical";
  }
  return { coverage, copyScore: cs, topicLabel: isTopicLabel(input.studentAnswer), scorer };
}

/** Pure: apply bands + structural overrides to precomputed scores. */
export function classifyBand(
  s: SimilarityScores,
  cfg: { bands: { green: number; amber: number }; copyRejectAt: number; errorSignals: string[] }
): SimilarityBandResult {
  const { coverage, copyScore: cs, scorer } = s;
  const has = (e: string) => cfg.errorSignals.includes(e);

  // 1. Topic label — subject with no predicate. Structural; judged first.
  if (s.topicLabel && has("TOPIC_LABEL")) {
    return { band: "RED", pass: false, coverage, copyScore: cs,
      firedError: "TOPIC_LABEL", flagged: false, scorer };
  }
  // 2. Verbatim copy — rejected even if it looks similar to the reference.
  if (cs >= cfg.copyRejectAt && has("VERBATIM_COPY")) {
    return { band: "RED", pass: false, coverage, copyScore: cs,
      firedError: "VERBATIM_COPY", flagged: false, scorer };
  }
  // 3–5. Breadth bands.
  if (coverage >= cfg.bands.green) {
    return { band: "GREEN", pass: true, coverage, copyScore: cs,
      firedError: null, flagged: false, scorer };
  }
  if (coverage >= cfg.bands.amber) {
    return { band: "AMBER", pass: true, coverage, copyScore: cs,
      firedError: null, flagged: true, scorer };
  }
  return { band: "RED", pass: false, coverage, copyScore: cs,
    firedError: has("DETAIL_AS_MAIN") ? "DETAIL_AS_MAIN" : null,
    flagged: false, scorer };
}

export async function evaluateSimilarityBand(
  input: SimilarityBandInput,
  embedder?: Embedder
): Promise<SimilarityBandResult> {
  const s = await scoreSimilarity(input, embedder);
  return classifyBand(s, {
    bands: input.bands,
    copyRejectAt: input.copyRejectAt,
    errorSignals: input.errorSignals,
  });
}

/** Production embedder — OpenAI text-embedding-3-small. Cheap, deterministic,
 *  no per-answer LLM cost. Wire this in the submit-answer route. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openAIEmbedder(client: { embeddings: { create: (a: any) => Promise<{ data: { embedding: number[] }[] }> } }): Embedder {
  return async (texts: string[]) => {
    const res = await client.embeddings.create({ model: "text-embedding-3-small", input: texts });
    return res.data.map((d) => d.embedding);
  };
}

// ─── Sequence scorer (deterministic, no embeddings) ───────────────────────────
// Scores ordered-step answers (L6.B2 procedural, L6.A3 retell). Each learner
// step is matched to its best expected step by token overlap; then we score
// how many expected steps were both present AND in correct relative order.
// Fully deterministic — safe for placement probes (no uncalibrated grading).

export interface SequenceResult {
  score: number;          // correctly-placed steps ÷ expected steps (0–1)
  omissions: number;      // expected steps with no learner match
  pass: boolean;
  firedError: string | null;
}

function jaccard(a: string, b: string): number {
  const ta = new Set(contentTokens(a));
  const tb = new Set(contentTokens(b));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

export function evaluateSequence(
  studentSteps: string[],
  expectedOrder: string[],
  opts: { passThreshold?: number; requireZeroOmissions?: boolean; matchFloor?: number } = {}
): SequenceResult {
  const passThreshold = opts.passThreshold ?? 0.7;
  const requireZeroOmissions = opts.requireZeroOmissions ?? true; // L6.B2 spec
  const matchFloor = opts.matchFloor ?? 0.3;

  // Best learner-step index for each expected step (greedy by overlap).
  const matchedIdx: (number | null)[] = expectedOrder.map((exp) => {
    let best = -1, bestScore = matchFloor;
    studentSteps.forEach((st, i) => {
      const s = jaccard(exp, st);
      if (s >= bestScore) { bestScore = s; best = i; }
    });
    return best >= 0 ? best : null;
  });

  const omissions = matchedIdx.filter((m) => m === null).length;

  // Of matched steps, count those whose learner position is in increasing
  // order relative to the expected sequence (longest increasing run).
  const present = matchedIdx
    .map((m, expIdx) => (m === null ? null : { expIdx, stuIdx: m }))
    .filter((x): x is { expIdx: number; stuIdx: number } => x !== null);
  let correctlyPlaced = 0;
  let lastStu = -1;
  for (const p of present) {
    if (p.stuIdx > lastStu) { correctlyPlaced++; lastStu = p.stuIdx; }
  }

  const score = expectedOrder.length ? correctlyPlaced / expectedOrder.length : 0;
  const pass = score >= passThreshold && (!requireZeroOmissions || omissions === 0);
  const firedError = omissions > 0
    ? "STEP_OMISSION"
    : !pass
    ? "STEP_INVERSION"
    : null;

  return { score, omissions, pass, firedError };
}
