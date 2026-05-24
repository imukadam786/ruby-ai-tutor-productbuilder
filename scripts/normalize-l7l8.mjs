// Normalise the L7/L8 conversions (Downloads) into the canonical
// reading-bank schema (types/reading-bank.ts). Item-level only — skill-level
// already conforms. Faithful mapping; anything uncertain is flagged
// _needsReview rather than silently broken.
//
// Run: node scripts/normalize-l7l8.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DL = "C:/Users/keega/Downloads";

const txt = (v) => (v == null ? "" : typeof v === "string" ? v : v.body || v.text || JSON.stringify(v));

function normChecks(ak) {
  if (Array.isArray(ak.checks) && ak.checks.length) {
    return ak.checks.map((c, i) => ({
      id: c.id || `CHECK_${i + 1}`,
      description: c.description || c.criterion || (typeof c === "string" ? c : JSON.stringify(c)),
    }));
  }
  if (Array.isArray(ak.perFeature)) {
    return ak.perFeature.map((f, i) => ({
      id: f.feature || `CHECK_${i + 1}`,
      description: `${f.feature}: ${f.expectedFunction}`,
    }));
  }
  if (ak.audience || ak.purpose) {
    return [
      { id: "AUDIENCE", description: `Correctly identifies the audience: ${ak.audience}` },
      { id: "AUDIENCE_EVIDENCE", description: `Gives text evidence for the audience (${ak.audienceFeature || ""})` },
      { id: "PURPOSE", description: `Correctly identifies the purpose: ${ak.purpose}` },
      { id: "PURPOSE_EVIDENCE", description: `Gives text evidence for the purpose (${ak.purposeFeature || ""})` },
    ];
  }
  if (Array.isArray(ak.expectedFeatures)) {
    return ak.expectedFeatures.map((f, i) => ({
      id: `FEATURE_${i + 1}`,
      description: typeof f === "string" ? f : `${f.feature || ""}: ${f.effect || f.expectedFunction || ""}`,
    }));
  }
  if (ak.expectedSimilarities || ak.expectedDifferences) {
    return [
      { id: "SIMILARITIES", description: `State at least ${ak.minSimilarities ?? 2} similarities grounded in both texts (e.g. ${(ak.expectedSimilarities || []).join("; ")})` },
      { id: "DIFFERENCES", description: `State at least ${ak.minDifferences ?? 2} differences grounded in both texts (e.g. ${(ak.expectedDifferences || []).join("; ")})` },
    ];
  }
  if (ak.requiredElements && typeof ak.requiredElements === "object") {
    const re = ak.requiredElements;
    if (Array.isArray(re))
      return re.map((e, i) => ({ id: `ELEMENT_${i + 1}`, description: typeof e === "string" ? e : JSON.stringify(e) }));
    return Object.entries(re).map(([k, v]) => ({ id: k, description: `${k}: ${v}` }));
  }
  return null; // unknown rubric shape
}

function canonAnswerKey(it, flag) {
  const ak = it.answerKey || {};
  const m = ak.mode;

  if (m === "sequence") {
    const order = ak.order || ak.expectedSteps || [];
    if (!order.length) flag("empty sequence");
    return { mode: "sequence", order };
  }

  if (m === "choice") {
    // Compound "pick + justify" (L7.A3) → rubric so both parts are marked.
    if (ak.purposeChoice !== undefined || ak.reasonReference !== undefined) {
      return {
        mode: "rubric",
        checks: [
          { id: "PURPOSE", description: `Correctly identifies the purpose as ${ak.purposeChoice} (choices: ${(ak.options || []).join(", ")}).` },
          { id: "REASON", description: `Gives a valid text-based reason. Model reason: ${ak.reasonReference || ""}` },
        ],
        passFraction: 0.6,
      };
    }
    const options = ak.options || [];
    let correct = ak.correct;
    if (typeof correct === "string") correct = options.indexOf(correct);
    if (typeof correct !== "number" || correct < 0) { flag("choice correct not resolvable"); correct = 0; }
    return { mode: "choice", options, correct };
  }

  if (m === "rubric") {
    const checks = normChecks(ak);
    if (!checks) { flag("unknown rubric shape"); }
    return {
      mode: "rubric",
      checks: checks || [{ id: "CHECK_1", description: "Answer meets the skill requirements." }],
      passFraction: ak.passFraction ?? ak.passThreshold ?? ak.cohesionPassThreshold ?? 0.6,
    };
  }

  // similarity-band (default)
  let reference = ak.reference || ak.mainIdeaReference || "";
  if (ak.cause || ak.effect) reference = `Cause: ${ak.cause || "?"}. Effect: ${ak.effect || "?"}.`;
  if (ak.mainIdeaReference && ak.expectedDetails)
    reference = `${ak.mainIdeaReference} Key details: ${[].concat(ak.expectedDetails).join("; ")}`;
  if (!reference) flag("similarity-band has no reference");
  const bands = ak.bands || ak.mainIdeaBands || { green: 0.6, amber: 0.4 };
  return { mode: "similarity-band", reference, bands, copyRejectAt: ak.copyRejectAt ?? 0.6 };
}

function canonItem(it) {
  const reviews = [];
  const flag = (why) => reviews.push(why);
  const out = {
    id: it.id,
    errorSignals: it.errorSignals || [],
    randomisable: it.randomisable ?? true,
  };
  if (it.context) out.context = it.context;
  if (it.title) out.title = it.title;

  // Consolidate learner-facing source text into `passage` (+ `dataText`).
  let passage =
    it.passage || it.skimText || it.scanText || it.formattedText ||
    it.sourceText || it.mainText || it.text || "";
  if (it.textA && it.textB) {
    passage =
      `Text A — ${it.textA.title || "A"}\n${txt(it.textA)}\n\n` +
      `Text B — ${it.textB.title || "B"}\n${txt(it.textB)}`;
  }
  if (passage) out.passage = txt(passage);
  if (it.dataText) out.dataText = txt(it.dataText);

  if (it.prompt) out.prompt = it.prompt;
  else if (it.turn1Prompt) out.prompt = it.turn1Prompt;
  if (it.question) out.question = it.question;
  if (it.statement) out.question = `Is this a FACT or an OPINION?\n\n"${it.statement}"`;

  out.answerKey = canonAnswerKey(it, flag);
  if (reviews.length) out._needsReview = reviews.join("; ");
  return out;
}

let totalReview = 0;
for (const L of [7, 8]) {
  const b = JSON.parse(readFileSync(join(DL, `L${L}.json`), "utf8"));
  for (const s of b.skills) s.items = s.items.map(canonItem);
  const reviews = b.skills.flatMap((s) => s.items.filter((i) => i._needsReview).map((i) => `${s.skillId}/${i.id}: ${i._needsReview}`));
  totalReview += reviews.length;
  const modes = {};
  for (const s of b.skills) for (const i of s.items) modes[i.answerKey.mode] = (modes[i.answerKey.mode] || 0) + 1;
  writeFileSync(join(root, `data/reading-question-banks/L${L}.json`), JSON.stringify(b, null, 2));
  console.log(`L${L}: ${b.skills.length} skills, ${b.skills.reduce((n, s) => n + s.items.length, 0)} items, modes=${JSON.stringify(modes)}`);
  if (reviews.length) console.log(`  _needsReview (${reviews.length}):\n   ` + reviews.join("\n   "));
  else console.log("  _needsReview: none");
}
console.log(totalReview ? `\n${totalReview} items flagged for review` : "\nclean — no items flagged");
