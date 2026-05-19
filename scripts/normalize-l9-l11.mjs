// Normalise the L9/L10/L11 authored banks (Downloads) into the canonical
// reading-bank schema (validator + app/api/reading/generate-question/route.ts).
// Mirrors scripts/normalize-l7l8.mjs for items, and additionally fixes the
// senior-phase top-level differences:
//   - top.gate is a prose description -> must be "NONE" for L9+ (kept as
//     gateDescription so nothing is lost).
//   - texts[] entries use textId/passage -> engine wants id/body
//     (route.ts:40: bank.texts.find(t => t.id === item.textId).body).
//   - L11 has no texts[]; passages live in a nested `sharedTexts` object —
//     flatten every category into texts[] so they survive and validate.
// Faithful mapping; anything uncertain is flagged _needsReview, not dropped.
//
// Run: node scripts/normalize-l9-l11.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DL = "C:/Users/keega/Downloads";

const txt = (v) => (v == null ? "" : typeof v === "string" ? v : v.body || v.passage || v.text || JSON.stringify(v));

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

  if (m === "rubric") {
    const checks = normChecks(ak);
    if (!checks) flag("unknown rubric shape");
    return {
      mode: "rubric",
      checks: checks || [{ id: "CHECK_1", description: "Answer meets the skill requirements." }],
      passFraction: ak.passFraction ?? ak.passThreshold ?? 0.6,
      ...(ak.compulsoryCheck ? { compulsoryCheck: ak.compulsoryCheck } : {}),
    };
  }

  // similarity-band (default for L9-L11; only other mode present)
  let reference = ak.reference || ak.mainIdeaReference || "";
  if (!reference) flag("similarity-band has no reference");
  const bands = ak.bands || { green: 0.6, amber: 0.4 };
  return { mode: "similarity-band", reference, bands, copyRejectAt: ak.copyRejectAt ?? 0.6 };
}

function canonItem(it, textsById) {
  const reviews = [];
  const flag = (why) => reviews.push(why);
  const out = {
    id: it.id,
    errorSignals: it.errorSignals || [],
    randomisable: it.randomisable ?? true,
  };
  if (it.context) out.context = it.context;
  if (it.title) out.title = it.title;

  // ── Source linkage ──
  // The runtime only resolves a single textId, so every pooled source is
  // inlined into one labelled passage. Items reference sources four ways:
  //   textIds[]  (L11)        sourceIds[]  (L10 synthesis)
  //   textId + pairTextId  (L9.B3 / L10.B1 paired texts)
  // Collect them all, in order, deduped — before this they were dropped and
  // the learner saw a question citing sources that were never shown.
  const srcIds = [
    ...(Array.isArray(it.textIds) ? it.textIds : []),
    ...(Array.isArray(it.sourceIds) ? it.sourceIds : []),
    ...(it.textId ? [it.textId] : []),
    ...(it.pairTextId ? [it.pairTextId] : []),
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  // Inline source carried directly on the item (most L9/L10 skills, plus
  // L10.C2 sourcePassage/sourceLabel and L11 C2 draftText).
  let passage = txt(
    it.passage || it.sourceText || it.mainText || it.text ||
      it.sourcePassage || it.draftText || ""
  );
  if (passage && it.sourceLabel) passage = `${it.sourceLabel}\n${passage}`;

  if (!passage && srcIds.length) {
    // Label each source the way the question names it: "…S1/-S1" → "Source 1"
    // (triplets), "….A/-B" → "Text A/Text B" (paired), else "Source N".
    const labelFor = (id, i) => {
      const s = id.match(/[-.]S(\d+)$/i);
      if (s) return `Source ${s[1]}`;
      const a = id.match(/[-.]([A-Z])$/);
      if (a) return `Text ${a[1]}`;
      return `Source ${i + 1}`;
    };
    const parts = srcIds.map((tid, i) => {
      const t = textsById.get(tid);
      if (!t) { flag(`source ${tid} not in texts[]`); return ""; }
      const lbl = srcIds.length > 1 ? labelFor(tid, i) : "";
      return lbl ? `${lbl}\n${t.body}` : t.body;
    });
    passage = parts.filter(Boolean).join("\n\n");
  }

  // Research/brief context the task asks the learner to act on but that is
  // not a standalone passage (L11.B3 sourceContext, D1/D2 sourceMaterials).
  const brief = it.sourceContext || it.sourceMaterials;
  if (brief) {
    const b = txt(Array.isArray(brief) ? brief.join("\n") : brief);
    passage = [passage, b].filter(Boolean).join("\n\n");
  }
  if (passage) out.passage = passage;

  // task instruction → prompt (validator's hasSource accepts prompt, not question)
  out.prompt = it.prompt || it.stimulus || it.focusPrompt || it.question || "";
  if (!out.prompt) delete out.prompt;
  if (it.question) out.question = it.question;

  out.answerKey = canonAnswerKey(it, flag);
  if (reviews.length) out._needsReview = reviews.join("; ");
  return out;
}

// Build a canonical texts[] (id + body) from whatever shape the file uses.
function canonTexts(b, flag) {
  const out = [];
  // Some L11 "texts" are structured teaching artefacts, not prose passages.
  // Compose a faithful readable body so nothing is lost and texts[] validates.
  const deriveBody = (t) => {
    if (t.body || t.passage || t.text) return t.body || t.passage || t.text;
    if (Array.isArray(t.paragraphs)) // sampleEssays
      return t.paragraphs.map((p) => p.text || "").filter(Boolean).join("\n\n");
    if (t.draft) return t.draft; // draftEssays
    if (t.sourceMaterials || t.audienceQuestions) // presentationTopics
      return [
        t.topic,
        t.sourceMaterials ? `Source materials: ${t.sourceMaterials}` : "",
        Array.isArray(t.evidenceKeywords) ? `Evidence keywords: ${t.evidenceKeywords.join(", ")}` : "",
        Array.isArray(t.audienceQuestions) ? `Likely audience questions:\n- ${t.audienceQuestions.join("\n- ")}` : "",
      ].filter(Boolean).join("\n\n");
    return "";
  };
  const push = (t, idHint) => {
    const id = t.id || t.textId || idHint;
    const body = deriveBody(t);
    if (!id) return flag(`text with no id (${(body || "").slice(0, 30)}…)`);
    if (!body) return flag(`text ${id} has no body`);
    out.push({ ...t, id, body });
  };
  if (Array.isArray(b.texts)) b.texts.forEach((t) => push(t));
  if (b.sharedTexts && typeof b.sharedTexts === "object") {
    for (const [cat, arr] of Object.entries(b.sharedTexts)) {
      if (!Array.isArray(arr)) continue;
      arr.forEach((t, i) =>
        push({ category: cat, ...t }, `${cat.toUpperCase()}.${i + 1}`)
      );
    }
  }
  return out;
}

let totalReview = 0;
for (const L of [9, 10, 11]) {
  const b = JSON.parse(readFileSync(join(DL, `L${L}.json`), "utf8"));
  const flags = [];

  if (b.gate && b.gate !== "NONE") {
    b.gateDescription = b.gate; // preserve the authored progression note
    b.gate = "NONE";
  }
  b.grades = [L - 2]; // engine expects [grade]; some files give "Grade 9"
  b.texts = canonTexts(b, (m) => flags.push(`texts: ${m}`));
  delete b.sharedTexts;

  const textsById = new Map(b.texts.map((t) => [t.id, t]));
  const textIds = new Set(textsById.keys());
  for (const s of b.skills) {
    // L11 skills carry skillName but no name/defaultPrompt; the runtime needs
    // a non-empty defaultPrompt fallback for items that lack their own prompt.
    if (!s.name && s.skillName) s.name = s.skillName;
    if (!s.defaultPrompt || /^AUTHOR:/.test(s.defaultPrompt))
      s.defaultPrompt = `Complete the "${s.name || s.skillId}" task: read the source material provided and write the response described.`;
    if (!Array.isArray(s.tolerance)) s.tolerance = [];
    if (!Array.isArray(s.recovery)) s.recovery = [];
    s.items = s.items.map((it) => canonItem(it, textsById));
    for (const it of s.items)
      if (it.textId && !textIds.has(it.textId))
        flags.push(`${s.skillId}/${it.id}: textId ${it.textId} not in texts[]`);
  }

  const reviews = b.skills.flatMap((s) =>
    s.items.filter((i) => i._needsReview).map((i) => `${s.skillId}/${i.id}: ${i._needsReview}`)
  );
  totalReview += reviews.length + flags.length;
  const modes = {};
  for (const s of b.skills) for (const i of s.items) modes[i.answerKey.mode] = (modes[i.answerKey.mode] || 0) + 1;

  writeFileSync(join(root, `data/reading-question-banks/L${L}.json`), JSON.stringify(b, null, 2));
  console.log(
    `L${L}: ${b.skills.length} skills, ${b.skills.reduce((n, s) => n + s.items.length, 0)} items, ${b.texts.length} texts, modes=${JSON.stringify(modes)}`
  );
  if (flags.length) console.log(`  structural flags (${flags.length}):\n   ` + flags.join("\n   "));
  if (reviews.length) console.log(`  _needsReview (${reviews.length}):\n   ` + reviews.slice(0, 20).join("\n   ") + (reviews.length > 20 ? `\n   …and ${reviews.length - 20} more` : ""));
  if (!flags.length && !reviews.length) console.log("  clean — nothing flagged");
}
console.log(totalReview ? `\n${totalReview} item(s)/text(s) flagged for review` : "\nclean — nothing flagged");
