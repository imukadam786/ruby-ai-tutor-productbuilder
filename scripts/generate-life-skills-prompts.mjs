// Generate 36 pre-filled Claude authoring prompts (one per Life Skills topic).
//
//   node scripts/generate-life-skills-prompts.mjs
//   node scripts/generate-life-skills-prompts.mjs <path-to-caps-text>
//
// Reads:
//   - data/life-skills-skill-tree.json           (the 36 atomic skills)
//   - data/life-skills-question-banks/LIFE_SKILLS_AUTHORING_PROMPT.md (the template)
//   - C:/Users/keega/Downloads/Life_Skills_flow.txt (CAPS bullets, default path)
//
// Writes:
//   - data/life-skills-question-banks/_prompts/<TOPIC_ID>.prompt.txt
//
// Each output file is the full authoring prompt with all 6 variables filled in,
// including the topic's BK&H bullets extracted verbatim from the CAPS doc.
// The head of education opens one, copies the whole thing, pastes into Claude,
// and gets JSON back. No PDF attachment needed — content is inline.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TREE_PATH = path.join(ROOT, "data/life-skills-skill-tree.json");
const PROMPT_TEMPLATE_PATH = path.join(
  ROOT,
  "data/life-skills-question-banks/LIFE_SKILLS_AUTHORING_PROMPT.md"
);
const CAPS_TEXT_PATH = process.argv[2] || "C:/Users/keega/Downloads/Life_Skills_flow.txt";
const OUT_DIR = path.join(ROOT, "data/life-skills-question-banks/_prompts");

const ITEM_DENSITY = { 1: 15, 2: 15, 3: 20, 4: 15 };

// ── Helpers ──────────────────────────────────────────────────────────────────
const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function extractPromptBody() {
  const doc = fs.readFileSync(PROMPT_TEMPLATE_PATH, "utf8");
  const startMarker = "You are authoring assessment items";
  const endMarker = "\n\n---\n\n## After Claude returns the JSON";
  const start = doc.indexOf(startMarker);
  const end = doc.indexOf(endMarker);
  if (start < 0 || end < 0) {
    throw new Error(
      `Could not find prompt body markers in ${PROMPT_TEMPLATE_PATH}. ` +
      `Looked for start "${startMarker}" and end "${endMarker}".`
    );
  }
  return doc.slice(start, end).trim();
}

// Walk the CAPS text and build a map of (grade, normalized-title) → bullets[].
// Some topics have their BK&H section wrapping across multiple lines in the
// extracted text, so collapse newlines (but NOT all whitespace — we need the
// double-space bullet delimiters) before splitting into topic blocks.
function indexCapsContent(capsText) {
  const flat = capsText.replace(/\n/g, " ");

  // Each block starts with "Life Skills:" (positive lookahead keeps the marker).
  const blocks = flat.split(/(?=Life Skills:\s*Grade)/);

  const index = new Map();

  for (const block of blocks) {
    const gh = block.match(/Life Skills:\s*Grade:?\s*([R\d]):?\s*Foundation Phase/i);
    if (!gh) continue;
    const g = gh[1].toUpperCase();
    const grade = g === "R" ? 0 : parseInt(g, 10);

    const tm = block.match(/Topic\s*:\s*([\s\S]+?)\s+(?:Suggested|contact\s*time)/i);
    if (!tm) continue;
    const title = tm[1].trim();

    const csIdx = block.indexOf("Content/concepts/skills");
    if (csIdx < 0) continue;

    // End the BK&H section at the next "Art and Crafts" SECTION HEADER — not
    // the parenthetical mention "(...for the Art and Crafts activities)".
    // Section headers look like "Art and Crafts : 2 hours per week" or similar.
    const tail = block.slice(csIdx);
    const acMatch = tail.match(/Art and Crafts\s*:?\s*\d+\s*hours?\s*per\s*week/i);
    if (!acMatch) continue;
    const acIdx = csIdx + acMatch.index;

    let bk = block.slice(csIdx + "Content/concepts/skills".length, acIdx);
    // Strip the standard parenthetical preamble.
    bk = bk.replace(/^\s*\(Use the content[^)]*\)\s*/i, "");
    // Some entries have a duplicate "X hours per week" header inside the slice.
    bk = bk.replace(/\bBeginning Knowledge and Health Education\s*:?\s*\d+\s*hours?\s*per\s*week\s*(?:Content\/concepts\/skills\s*)?/gi, "");
    bk = bk.trim();

    const bullets = bk
      .split(/\s{2,}/)
      .map((b) => b.trim())
      .filter((b) => b.length > 1);

    if (bullets.length === 0) continue;

    const key = `L${grade}|${normalize(title)}`;
    if (!index.has(key)) index.set(key, bullets);
  }

  return index;
}

function renderPrompt(promptBody, vars) {
  let out = promptBody;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll("{{" + k + "}}", v);
  }
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(CAPS_TEXT_PATH)) {
    console.error(`ERROR: CAPS text file not found at ${CAPS_TEXT_PATH}`);
    console.error(`Pass an alternative path as the first arg.`);
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const tree = JSON.parse(fs.readFileSync(TREE_PATH, "utf8"));
  const promptBody = extractPromptBody();
  const capsText = fs.readFileSync(CAPS_TEXT_PATH, "utf8");
  const capsIndex = indexCapsContent(capsText);

  let wrote = 0;
  let missing = [];

  for (const level of tree.levels) {
    if (!level.tiers || level.tiers.length === 0) continue;
    for (const tier of level.tiers) {
      for (const skill of tier.atomic_skills ?? []) {
        // Match by normalized title; fall back to partial match if needed.
        const exactKey = `L${level.grade}|${normalize(skill.title)}`;
        let bullets = capsIndex.get(exactKey);

        if (!bullets) {
          // Try partial match — the parenthetical in some titles ("Familiar places
          // (my village...)") may not exactly match what's in the doc.
          const stem = normalize(skill.title.split("(")[0]);
          for (const [k, v] of capsIndex.entries()) {
            if (k.startsWith(`L${level.grade}|`) && k.includes(stem) && stem.length > 6) {
              bullets = v;
              break;
            }
          }
        }

        const capsContent = bullets
          ? bullets.map((b) => `- ${b}`).join("\n")
          : `(CAPS content for "${skill.title}" not auto-extracted from ${path.basename(CAPS_TEXT_PATH)}. Open the original PDF and paste the bullets here.)`;

        if (!bullets) missing.push(skill.bank_skill_id);

        const filled = renderPrompt(promptBody, {
          TOPIC_ID: skill.bank_skill_id,
          GRADE: String(level.grade),
          TOPIC_TITLE: skill.title,
          TARGET_COUNT: String(ITEM_DENSITY[level.grade] ?? 15),
          IS_SENSITIVE: String(skill.sensitive === true),
          CAPS_CONTENT: capsContent,
        });

        const outFile = path.join(OUT_DIR, `${skill.bank_skill_id}.prompt.txt`);
        fs.writeFileSync(outFile, filled + "\n");
        wrote++;
      }
    }
  }

  console.log(`\nGenerated ${wrote} prompt file(s) in ${OUT_DIR}`);
  if (missing.length) {
    console.log(`\n⚠ ${missing.length} topic(s) had no auto-extracted CAPS content — fill manually:`);
    for (const m of missing) console.log(`   - ${m}.prompt.txt`);
  }
  console.log(`\nNext: open any .prompt.txt, copy whole file, paste into claude.ai.`);
}

main();
