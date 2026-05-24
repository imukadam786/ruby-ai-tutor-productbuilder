#!/usr/bin/env node
// One-shot: rewrite every atomic skill `title` in data/reading-skill-tree.json
// from teacher-jargon to parent-friendly phrasing. Run once and inspect the diff.
//
// What changes: only the `title` field on each atomic skill (189 of them).
// What is preserved: id, description, prerequisites, templates, error_signatures,
//   mastery_criteria, recovery_strategy, plus level/tier metadata.
//
// Safety: writes a fresh backup at data/reading-skill-tree.json.titles-bak
// before overwriting. Aborts if any atomic skill ID has no mapping below
// (so we never silently leave a teacher-jargon title in the tree).

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TREE_PATH = resolve(__dirname, "..", "data", "reading-skill-tree.json");
const BACKUP_PATH = TREE_PATH + ".titles-bak";

// ─── 189 parent-friendly titles ───────────────────────────────────────────────
// Style rules I followed:
//   • Verb-first ("Reading…", "Spotting…", "Writing…")
//   • Plain English — no phoneme, grapheme, morpheme, CEE, TICC, NSC, AWL, CAPS-P1
//   • Concrete and observable from a parent's perspective
//   • Title length 3–9 words; lean shorter at the lower grades
//   • L9+ may use academic terms parents do recognise ("thesis", "argument")
//     but never engine jargon
const NEW_TITLES = {
  // L1 — Oral Language & Phonological Foundation (Grade R)
  "R1.T1.A1": "Following 2–3 step spoken instructions",
  "R1.T1.A2": "Retelling a story in order",
  "R1.T1.A3": "Speaking in full sentences",
  "R1.T2.A1": "Spotting and making rhymes",
  "R1.T2.A2": "Clapping out the parts of a word",
  "R1.T3.A1": "Hearing the first and last sound in a word",
  "R1.T3.A2": "Breaking words into separate sounds and back",
  "R1.T3.A3": "Swapping or removing sounds to make new words",

  // L2 — Alphabetic Code Construction (Grade 1)
  "R2.T1.A1": "Saying the sound for each letter",
  "R2.T1.A2": "Matching letters and sounds both ways",
  "R2.T1.A3": "Telling apart look-alike letters (b/d, p/q)",
  "R2.T2.A1": "Reading two-letter sounds like 'sh' and 'ch'",
  "R2.T2.A2": "Reading letter-pair sounds like 'st' and 'bl'",
  "R2.T3.A1": "Reading vowel pairs like 'ai' and 'ee'",
  "R2.T3.A2": "Saying any letter sound quickly without thinking",
  "R2.T3.A3": "Blending sounds together to make a word",

  // L3 — Encoding Consolidation (Grade 1–2)
  "R3.T1.A1": "Spelling short words by sound",
  "R3.T1.A2": "Spelling longer words with letter-pairs",
  "R3.T1.A3": "Spelling new words by sounding them out",
  "R3.T1.A4": "Spelling made-up words by sound",
  "R3.T2.A1": "Writing every sound in the right order",
  "R3.T2.A2": "Catching and fixing spelling mistakes",

  // L4 — Decoding & Fluency Construction (Grade 2–3)
  "R4.T1.A1": "Reading new words by sounding them out",
  "R4.T1.A2": "Sounding out made-up words to prove the code",
  "R4.T2.A1": "Reading lines in the correct order",
  "R4.T2.A2": "Reading words as one whole, not letter by letter",
  "R4.T3.A1": "Reading aloud in natural phrases",
  "R4.T3.A2": "Noticing when reading doesn't make sense",

  // L5 — Comprehension & Language Expansion (Grade 3)
  "R5.T1.A1": "Finding answers in the text",
  "R5.T1.A2": "Working out what the text suggests",
  "R5.T1.A3": "Retelling what a passage is about",
  "R5.T2.A1": "Using 'because' and 'therefore' to explain ideas",
  "R5.T2.A2": "Using new words correctly in sentences",
  "R5.T3.A1": "Writing a clear, organised answer",

  // L6 — Transition to Academic Reading (Grade 4)
  "R6.T1.A1": "Finding the main idea of a text",
  "R6.T1.A2": "Picking out important details from a text",
  "R6.T1.A3": "Retelling a text in order",
  "R6.T1.A4": "Filling in missing words from context",
  "R6.T2.A1": "Finding facts in tables and charts",
  "R6.T2.A2": "Following written instructions step by step",
  "R6.T2.A3": "Working out a new word from the sentence around it",
  "R6.T3.A1": "Writing a paragraph with a beginning, middle and end",
  "R6.T3.A2": "Linking sentences with 'because', 'so', 'however'",
  "R6.T3.A3": "Keeping the same tense throughout writing",

  // L7 — Organised Meaning & Structured Writing (Grade 5)
  "R7.T1.A1": "Skimming a text for the general idea",
  "R7.T1.A2": "Scanning a text for a specific detail",
  "R7.T1.A3": "Working out the writer's purpose",
  "R7.T2.A1": "Using headings, captions and bold to find information",
  "R7.T2.A2": "Comparing facts in a table or chart",
  "R7.T2.A3": "Telling fact from opinion",
  "R7.T3.A1": "Writing across more than one paragraph",
  "R7.T3.A2": "Starting each paragraph with a clear topic sentence",
  "R7.T3.A3": "Writing an opinion with reasons",
  "R7.T3.A4": "Linking paragraphs with transition words",
  "R7.T4.A1": "Giving an opinion out loud with reasons",
  "R7.T4.A2": "Having a back-and-forth conversation",
  "R7.T4.A3": "Summarising a text out loud",

  // L8 — Early Academic Reasoning (Grade 6)
  "R8.T1.A1": "Spotting causes and effects in a text",
  "R8.T1.A2": "Working out who the text is for and why",
  "R8.T1.A3": "Spotting how a writer tries to persuade you",
  "R8.T2.A1": "Summarising a longer text in fewer words",
  "R8.T2.A2": "Comparing two texts on the same topic",
  "R8.T2.A3": "Using two sources together in one answer",
  "R8.T3.A1": "Writing a clear explanation of a process",
  "R8.T3.A2": "Writing a short factual report",
  "R8.T3.A3": "Using formal linking words like 'however' and 'therefore'",
  "R8.T3.A4": "Writing paragraphs that stay on topic",
  "R8.T4.A1": "Explaining a process out loud",
  "R8.T4.A2": "Defending an opinion out loud with evidence",
  "R8.T4.A3": "Describing the steps of a process out loud",

  // L9 — Analytical Reading Foundations (Grade 7)
  "R9.T1.A1": "Spotting the writer's main argument",
  "R9.T1.A2": "Telling a claim apart from the evidence behind it",
  "R9.T1.A3": "Spotting what a writer is taking for granted",
  "R9.T2.A1": "Judging whether evidence is strong or weak",
  "R9.T2.A2": "Spotting a writer's perspective or bias",
  "R9.T2.A3": "Combining two texts into one answer",
  "R9.T3.A1": "Writing a clear claim, evidence and explanation",
  "R9.T3.A2": "Using cautious language like 'may' and 'often'",
  "R9.T3.A3": "Giving a claim–evidence–explanation answer out loud",
  "R9.T3.A4": "Judging an argument out loud",

  // L10 — Evaluative & Argumentative Control (Grade 8)
  "R10.T1.A1": "Spotting a flaw in an argument",
  "R10.T1.A2": "Checking whether an argument is logically sound",
  "R10.T1.A3": "Telling apart fact, inference, and guesswork",
  "R10.T2.A1": "Comparing how two writers persuade their reader",
  "R10.T2.A2": "Spotting and judging a counter-argument",
  "R10.T2.A3": "Combining three sources with proper attribution",
  "R10.T3.A1": "Writing a multi-paragraph argument essay",
  "R10.T3.A2": "Quoting and crediting evidence in writing",
  "R10.T3.A3": "Acknowledging and refuting an opposing view",
  "R10.T3.A4": "Keeping writing formal throughout an essay",
  "R10.T3.A5": "Giving a structured argument out loud",
  "R10.T3.A6": "Challenging an argument out loud",
  "R10.T3.A7": "Answering follow-up questions clearly and consistently",

  // L11 — Academic Independence & Synthesis (Grade 9)
  "R11.T1.A1": "Combining three or more sources into one answer",
  "R11.T1.A2": "Making sense of sources that disagree",
  "R11.T1.A3": "Explaining why a writer made certain choices",
  "R11.T2.A1": "Writing a research summary that credits each source",
  "R11.T2.A2": "Writing a longer analytical essay",
  "R11.T2.A3": "Using formal citation language throughout an essay",
  "R11.T3.A1": "Self-checking an essay against clear criteria",
  "R11.T3.A2": "Revising an essay to strengthen its argument",
  "R11.T3.A3": "Giving a formal 3–5 minute presentation",
  "R11.T3.A4": "Answering questions about a presentation",
  "R11.T3.A5": "Evaluating a long text out loud",

  // L12 — Academic Transition (Grade 10)
  "R12.T1.A1": "Telling an argument apart from an explanation",
  "R12.T1.A2": "Analysing tone and bias in non-fiction",
  "R12.T1.A3": "Spotting persuasive techniques and their effects",
  "R12.T1.A4": "Pulling out the hidden assumptions in an argument",
  "R12.T1.A5": "Building a five-paragraph argument essay",
  "R12.T1.A6": "Writing a clear thesis and topic sentences",
  "R12.T1.A7": "Building evidence and explanation into your own sentences",
  "R12.T1.A8": "Keeping a fully formal voice in academic writing",
  "R12.T1.A9": "Using a range of complex sentence structures",
  "R12.T1.A10": "Choosing between active and passive voice on purpose",
  "R12.T1.A11": "Controlling commas, semicolons and colons accurately",
  "R12.T2.A1": "Judging the strength of an argument with criteria",
  "R12.T2.A2": "Naming and explaining logical fallacies",
  "R12.T2.A3": "Reading imagery and symbolism in literature",
  "R12.T2.A4": "Comparing two texts on shared themes",
  "R12.T2.A5": "Writing a balanced discursive essay",
  "R12.T2.A6": "Linking paragraphs with the right transitions",
  "R12.T2.A7": "Embedding quotations smoothly in writing",
  "R12.T3.A1": "Writing a literary essay with a clear thesis",
  "R12.T3.A2": "Synthesising multiple sources in one argument",
  "R12.T3.A3": "Reading literature in its social and political context",
  "R12.T3.A4": "Writing a 600–800 word essay on an unseen topic",
  "R12.T3.A5": "Showing stylistic range across an essay",
  "R12.T4.A1": "Finding the main idea and author's purpose",
  "R12.T4.A2": "Making inferences from an unseen text",
  "R12.T4.A3": "Writing a structured summary of a non-fiction text",
  "R12.T5.A1": "Writing a formal letter",
  "R12.T5.A2": "Writing a persuasive speech",
  "R12.T5.A3": "Writing a newspaper article",
  "R12.T6.A1": "Fixing subject–verb and tense errors",
  "R12.T6.A2": "Switching between formal and informal writing",
  "R12.T6.A3": "Editing punctuation in a paragraph",
  "R12.T7.A1": "Giving a structured short speech",
  "R12.T7.A2": "Answering comprehension questions in full sentences",
  "R12.T7.A3": "Summarising what was said in a spoken extract",

  // L13 — Pre-Exam Maturity (Grade 11)
  "R13.T1.A1": "Reading themes beyond the literal level",
  "R13.T1.A2": "Analysing what drives a character",
  "R13.T1.A3": "Reading narrative perspective and its effect",
  "R13.T1.A4": "Analysing the effect of figurative language",
  "R13.T1.A5": "Weaving context into a literary essay",
  "R13.T2.A1": "Comparing poems by their structure",
  "R13.T2.A2": "Comparing drama and novels on shared themes",
  "R13.T2.A3": "Writing a strong counter-argument paragraph",
  "R13.T2.A4": "Using precise academic vocabulary",
  "R13.T2.A5": "Sustaining an 800-word essay in one session",
  "R13.T3.A1": "Spotting whose viewpoint is being centred",
  "R13.T3.A2": "Spotting manipulation techniques in media",
  "R13.T3.A3": "Writing a balanced, evaluated argument",
  "R13.T4.A1": "Comparing two unseen texts",
  "R13.T4.A2": "Identifying an author's bias and perspective",
  "R13.T4.A3": "Synthesising two unseen texts to support a position",
  "R13.T5.A1": "Writing a formal report",
  "R13.T5.A2": "Writing a review with clear criteria",
  "R13.T5.A3": "Writing a dialogue between two positions",
  "R13.T6.A1": "Rewriting sentences for clarity",
  "R13.T6.A2": "Replacing vague vocabulary with precise words",
  "R13.T6.A3": "Editing a paragraph for register, grammar and flow",
  "R13.T7.A1": "Giving an extended oral argument",
  "R13.T7.A2": "Answering panel-interview questions",
  "R13.T7.A3": "Evaluating a speech transcript",

  // L14 — NSC Exit Standard (Grade 12)
  "R14.T1.A1": "Analysing unseen poetry",
  "R14.T1.A2": "Reading exam command words precisely",
  "R14.T1.A3": "Writing a layered literary essay (theme, intent, context, craft)",
  "R14.T1.A4": "Writing a full 700–900 word essay in one session",
  "R14.T2.A1": "Bringing theme, intent, context and craft into one essay",
  "R14.T2.A2": "Evaluating what the author was trying to do",
  "R14.T2.A3": "Showing more than one valid reading of a text",
  "R14.T2.A4": "Writing an original thesis (not a paraphrase)",
  "R14.T3.A1": "Reading ambiguity as a feature, not a flaw",
  "R14.T3.A2": "Holding two positions in tension in one essay",
  "R14.T3.A3": "Writing a stylistically sophisticated essay",
  "R14.T3.A4": "Comparing multiple critical readings of one text",
  "R14.T3.A5": "Producing exam-ready writing consistently",
  "R14.T4.A1": "Reading subtext and irony",
  "R14.T4.A2": "Evaluating an author's structural and language choices",
  "R14.T4.A3": "Synthesising three or more sources into one position",
  "R14.T5.A1": "Writing a formal article at NSC exit standard",
  "R14.T5.A2": "Writing a structured set of interview answers",
  "R14.T5.A3": "Writing a distinction-level persuasive speech",
  "R14.T6.A1": "Doing a full language audit of your own essay",
  "R14.T6.A2": "Improving sentence complexity in a draft",
  "R14.T6.A3": "Replacing imprecise words with academic vocabulary",
  "R14.T7.A1": "Giving a formal NSC-standard speech on an unseen topic",
  "R14.T7.A2": "Answering an unseen NSC oral exam set",
  "R14.T7.A3": "Evaluating your own spoken argument transcript",
};

// ─── Run ──────────────────────────────────────────────────────────────────────
const raw = await readFile(TREE_PATH, "utf8");
const tree = JSON.parse(raw);

const seen = new Set();
const missing = [];
let changed = 0;
let unchanged = 0;

for (const level of tree.levels) {
  for (const tier of level.tiers) {
    for (const skill of tier.atomic_skills) {
      seen.add(skill.id);
      const next = NEW_TITLES[skill.id];
      if (!next) {
        missing.push(skill.id);
        continue;
      }
      if (skill.title === next) {
        unchanged++;
      } else {
        skill.title = next;
        changed++;
      }
    }
  }
}

const extra = Object.keys(NEW_TITLES).filter((id) => !seen.has(id));

if (missing.length) {
  console.error("✗ Atomic skills present in tree but missing from NEW_TITLES:");
  for (const id of missing) console.error("  " + id);
  process.exit(1);
}
if (extra.length) {
  console.error("✗ NEW_TITLES has IDs not present in the tree (typos?):");
  for (const id of extra) console.error("  " + id);
  process.exit(1);
}

await copyFile(TREE_PATH, BACKUP_PATH);
await writeFile(TREE_PATH, JSON.stringify(tree, null, 2) + "\n", "utf8");

console.log("✓ Backup written: " + BACKUP_PATH);
console.log("✓ Rewrote " + changed + " atomic skill titles (" + unchanged + " unchanged, " + (changed + unchanged) + " covered).");
