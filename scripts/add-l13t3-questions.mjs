// Authors questions for the two L13.T3 skills that previously had no dedicated
// question domain (they fell through to M011 "simplify", serving mismatched
// content). Adds two domains to data/question-bank.json:
//   M035 → L13.T3.A1  Expanding single brackets
//   M036 → L13.T3.A2  Factorising by common factor
// One skill per domain keeps every served question on-topic for the skill the
// learner is practising. Answer formatting matches the existing algebra domains
// (M011/M013): spaces around operators, ASCII "-", "²" for squares.
//
//   node scripts/add-l13t3-questions.mjs
import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "data/question-bank.json");
const bank = JSON.parse(fs.readFileSync(FILE, "utf8"));

const EXPAND_PROMPT =
  "Multiply the term outside the bracket by each term inside, then add the results.";
const FACTOR_PROMPT =
  "Find the highest common factor of the terms, place it outside the bracket, and write what is left inside.";

// [question, expected, difficulty]
const EXPAND = [
  ["Expand: 3(x + 2)", "3x + 6", 2],
  ["Expand: 2(x + 5)", "2x + 10", 2],
  ["Expand: 4(x + 1)", "4x + 4", 2],
  ["Expand: 5(x + 3)", "5x + 15", 2],
  ["Expand: 2(x + 7)", "2x + 14", 2],
  ["Expand: 6(x + 2)", "6x + 12", 2],
  ["Expand: 8(x + 2)", "8x + 16", 2],
  ["Expand: 3(x - 4)", "3x - 12", 3],
  ["Expand: 5(x - 2)", "5x - 10", 3],
  ["Expand: 7(x - 3)", "7x - 21", 3],
  ["Expand: 4(2x + 1)", "8x + 4", 3],
  ["Expand: 2(3x + 4)", "6x + 8", 3],
  ["Expand: 5(2x + 3)", "10x + 15", 3],
  ["Expand: 2(4x - 3)", "8x - 6", 3],
  ["Expand: 3(2x - 5)", "6x - 15", 3],
  ["Expand: -2(x + 3)", "-2x - 6", 4],
  ["Expand: -3(x + 4)", "-3x - 12", 4],
  ["Expand: -(x - 5)", "-x + 5", 4],
  ["Expand: -4(x - 2)", "-4x + 8", 4],
  ["Expand: x(x + 6)", "x² + 6x", 4],
  ["Expand: x(2x + 5)", "2x² + 5x", 4],
  ["Expand: 2x(x + 3)", "2x² + 6x", 4],
  ["Expand: 3x(x - 2)", "3x² - 6x", 4],
  ["Expand: 4x(x + 1)", "4x² + 4x", 4],
];

const FACTOR = [
  ["Factorise: 3x + 6", "3(x + 2)", 2],
  ["Factorise: 2x + 10", "2(x + 5)", 2],
  ["Factorise: 4x + 8", "4(x + 2)", 2],
  ["Factorise: 5x + 15", "5(x + 3)", 2],
  ["Factorise: 7x + 7", "7(x + 1)", 2],
  ["Factorise: 6x + 9", "3(2x + 3)", 3],
  ["Factorise: 8x + 12", "4(2x + 3)", 3],
  ["Factorise: 10x + 15", "5(2x + 3)", 3],
  ["Factorise: 14x + 21", "7(2x + 3)", 3],
  ["Factorise: 9x - 6", "3(3x - 2)", 3],
  ["Factorise: 6x - 15", "3(2x - 5)", 3],
  ["Factorise: 12x + 8", "4(3x + 2)", 4],
  ["Factorise: 20x + 30", "10(2x + 3)", 4],
  ["Factorise: 16x + 24", "8(2x + 3)", 4],
  ["Factorise: 18x + 12", "6(3x + 2)", 4],
  ["Factorise: 15x - 10", "5(3x - 2)", 4],
  ["Factorise: x² + 3x", "x(x + 3)", 4],
  ["Factorise: x² - 4x", "x(x - 4)", 4],
  ["Factorise: 2x² + 6x", "2x(x + 3)", 4],
  ["Factorise: 5x² - 10x", "5x(x - 2)", 4],
  ["Factorise: 4x² + 8x", "4x(x + 2)", 4],
  ["Factorise: 6x² + 9x", "3x(2x + 3)", 4],
  ["Factorise: 3x² + 12x", "3x(x + 4)", 4],
  ["Factorise: 10x² - 15x", "5x(2x - 3)", 4],
];

function buildQuestions(rows, refPrefix, errorSignals, rubyPrompt) {
  return rows.map(([question, expected, difficulty], i) => ({
    ref: `${refPrefix}.${i + 1}`,
    question,
    expected,
    input_type: "text",
    error_signals: errorSignals,
    ruby_prompt: rubyPrompt,
    difficulty,
  }));
}

const M035 = {
  title: "Expanding Single Brackets",
  gate: "C",
  skill_ids: ["L13.T3.A1"],
  pass_threshold: 0.8,
  questions_for_mastery: 3,
  authored_pool: EXPAND.length,
  questions: buildQuestions(
    EXPAND,
    "35",
    ["ERR_DISTRIBUTE_PARTIAL", "ERR_SIGN_DROP"],
    EXPAND_PROMPT
  ),
};

const M036 = {
  title: "Factorising by Common Factor",
  gate: "C",
  skill_ids: ["L13.T3.A2"],
  pass_threshold: 0.8,
  questions_for_mastery: 3,
  authored_pool: FACTOR.length,
  questions: buildQuestions(
    FACTOR,
    "36",
    ["ERR_FACTOR_NOT_HIGHEST", "ERR_SIGN_DROP"],
    FACTOR_PROMPT
  ),
};

let added = [];
if (!bank.domains.M035) { bank.domains.M035 = M035; added.push("M035"); }
if (!bank.domains.M036) { bank.domains.M036 = M036; added.push("M036"); }

if (added.length === 0) {
  console.log("M035/M036 already present — nothing to do.");
  process.exit(0);
}

// Preserve original formatting: 2-space indent, CRLF, NO trailing newline.
const out = JSON.stringify(bank, null, 2).replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, out);
console.log(
  `Added domains: ${added.join(", ")} (${M035.questions.length} expand + ${M036.questions.length} factorise questions).`
);
