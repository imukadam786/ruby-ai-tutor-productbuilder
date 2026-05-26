// One-shot: convert 21 IP (Grade 4–6 PSW) bank items from `choice` to
// `image-match` and add a `context` line describing the pictures. After this,
// fetch-life-skills-images.mjs downloads the new Twemoji SVGs and
// inject-life-skills-image-refs.mjs writes the matching `image_refs` array.
//
// Picks: only items where every option maps cleanly to a single drawable
// thing in scripts/life-skills-image-map.mjs. Items where one option had no
// honest emoji (e.g. seatbelt, energy drink) or where the image would give
// the answer away (e.g. ⚠️ next to "warning sign") are left as text choice.
//
// Idempotent: re-running just re-stamps the same input_type and context.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-skills-question-bank.json");

const CONVERSIONS = [
  // Grade 4 — personal strengths
  ["LS.L4.PSW.T01", "T01.04", "Pictures: a person running, an open book, a microphone, an artist palette."],
  ["LS.L4.PSW.T01", "T01.11", "Pictures: an artist palette, a cooking pot, a football, an open book."],

  // Grade 4 — emotions
  ["LS.L4.PSW.T04", "T04.01", "Pictures: a smiling face, a pencil, a shoe, a tree."],
  ["LS.L4.PSW.T04", "T04.03", "Pictures: a crying face, a smiling face, an unamused face, a bored face."],
  ["LS.L4.PSW.T04", "T04.11", "Pictures: a crying face, an angry face, a smiling face, a celebrating face."],
  ["LS.L4.PSW.T04", "T04.19", "Pictures: a smiling face, a crying face, a fearful face, an unamused face."],

  // Grade 4 — cultures and foods
  ["LS.L4.PSW.T08", "T08.02", "Pictures: pap and stew, a plate of spaghetti, sushi, a croissant."],

  // Grade 4 — religions: places of worship
  ["LS.L4.PSW.T09", "T09.02", "Pictures: a church, a mosque, a synagogue, a Hindu temple."],
  ["LS.L4.PSW.T09", "T09.03", "Pictures: a mosque, a church, a synagogue, a Hindu temple."],
  ["LS.L4.PSW.T09", "T09.04", "Pictures: a synagogue, a mosque, a church, a Hindu temple."],
  ["LS.L4.PSW.T09", "T09.05", "Pictures: a Hindu temple, a synagogue, a mosque, a church."],

  // Grade 4 — religions: symbols
  ["LS.L4.PSW.T09", "T09.09", "Pictures: the Om symbol, a Christian cross, the Star of David, the crescent moon and star."],

  // Grade 4 — religion places vs other public places
  ["LS.L4.PSW.T09", "T09.20", "Pictures: a place of worship, a football stadium, a shopping mall, a restaurant."],

  // Grade 4 — pool safety
  ["LS.L4.PSW.T10", "T10.08", "Pictures: a life ring, a loaf of bread, a textbook, a teapot."],

  // Grade 4 — traffic light colours
  ["LS.L4.PSW.T11", "T11.02", "Pictures: a red circle, a green circle, a yellow circle, a blue circle."],

  // Grade 4 — bicycle gear
  ["LS.L4.PSW.T11", "T11.05", "Pictures: a helmet, slippers, a long dress, sunglasses."],

  // Grade 4 — hygiene items
  ["LS.L4.PSW.T12", "T12.01", "Pictures: a toothbrush, a book, a pen, a football."],

  // Grade 4 — diet
  ["LS.L4.PSW.T13", "T13.01", "Pictures: a sweet, an apple, a drop of water, a carrot."],
  ["LS.L4.PSW.T13", "T13.07", "Pictures: a fizzy drink, a drop of water, an apple, a bowl of pap."],

  // Grade 5 — emotions
  ["LS.L5.PSW.T03", "T03.03", "Pictures: a crying face, a hungry face, a bored face, a celebrating face."],

  // Grade 5 — malaria spread
  ["LS.L5.PSW.T13", "T13.06", "Pictures: a mosquito, an apple, a drop of water, a handshake."],
];

const raw = fs.readFileSync(BANK_PATH, "utf8");
const usesCRLF = raw.includes("\r\n");
const bank = JSON.parse(raw);

let updated = 0;
const skipped = [];
for (const [topicId, ref, context] of CONVERSIONS) {
  const topic = bank.topics?.[topicId];
  if (!topic) { skipped.push(`${topicId} (topic not found)`); continue; }
  const q = topic.questions.find((qq) => qq.ref === ref);
  if (!q) { skipped.push(`${topicId}.${ref} (item not found)`); continue; }
  // Rebuild the object so context sits right after question/ruby_prompt and
  // input_type stays consistent. Idempotent: works whether already image-match
  // or still choice.
  const rebuilt = {};
  for (const [k, v] of Object.entries(q)) {
    if (k === "input_type") rebuilt[k] = "image-match";
    else if (k === "context") continue; // re-add in place below
    else rebuilt[k] = v;
    if (k === "ruby_prompt") rebuilt.context = context;
  }
  // If the original item had no ruby_prompt for some reason, fall back to
  // appending context near the start.
  if (!("context" in rebuilt)) rebuilt.context = context;
  const idx = topic.questions.indexOf(q);
  topic.questions[idx] = rebuilt;
  updated += 1;
}

let out = JSON.stringify(bank, null, 2) + "\n";
if (usesCRLF) out = out.replace(/\n/g, "\r\n");
fs.writeFileSync(BANK_PATH, out);

console.log(`✓ Converted ${updated} item(s) from choice to image-match with picture context.`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`);
  for (const s of skipped) console.log(`  - ${s}`);
}
