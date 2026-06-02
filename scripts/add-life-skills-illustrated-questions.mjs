// Adds questions built around the head-of-ed illustrations that had no home in
// an image-match set: traditional dances + SA foods (image-match), and single
// scenes shown via the new `stem_image` field (choice / true-false). Also
// attaches the mumps illustration to the existing mumps item.
//
//   node scripts/add-life-skills-illustrated-questions.mjs        (write)
//   node scripts/add-life-skills-illustrated-questions.mjs --dry  (report only)
//
// DRAFT content for head-of-ed review. Idempotent: skips refs already present.
// After running, run inject-life-skills-image-refs.mjs (image-match tiles) and
// validate-life-skills-bank.mjs.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-skills-question-bank.json");
const DRY = process.argv.includes("--dry");

const raw = fs.readFileSync(BANK_PATH, "utf8");
const usesCRLF = raw.includes("\r\n");
const bank = JSON.parse(raw);

// ── New questions, grouped by topic ──────────────────────────────────────────
const ADDITIONS = {
  "LS.L6.PSW.T11": [
    {
      ref: "T11.21",
      question: "Which picture shows the Zulu reed dance (umkhosi womhlanga)?",
      ruby_prompt: "South Africa has its own special dances. Which picture shows the Zulu reed dance?",
      context: "Pictures: a Zulu reed dance, flamenco dancing, American line dancing, an Aboriginal outback dance.",
      input_type: "image-match",
      options: ["Zulu reed dance", "Flamenco dancing", "American line dancing", "Aboriginal outback dance"],
      image_refs: ["scene_zulu_reed_dance", "scene_flamenco", "scene_line_dance", "scene_outback_dance"],
      expected: "Zulu reed dance",
      memo: "The Zulu reed dance (umkhosi womhlanga) is a South African tradition where young women carry tall reeds. The others are dances from Spain, America and Australia.",
      error_signals: ["ERR_LS_FACT"],
      difficulty: 2,
    },
    {
      ref: "T11.22",
      question: "This picture shows the 1956 Women's March to the Union Buildings. What were the women marching against?",
      ruby_prompt: "Look at the picture. In 1956 thousands of women marched to the Union Buildings. What were they marching against?",
      context: "Picture: a row of South African women marching together with raised fists.",
      input_type: "choice",
      options: ["Unfair pass laws", "Paying for school", "A new national flag", "A change to a sports rule"],
      stem_image: "scene_womens_march_1956",
      expected: "Unfair pass laws",
      memo: "On 9 August 1956 about 20 000 women marched against the unfair pass laws. We remember them every year on Women's Day.",
      error_signals: ["ERR_LS_FACT"],
      difficulty: 3,
    },
  ],
  "LS.L2.BKH.T05": [
    {
      ref: "T05.16",
      question: "Which picture shows bobotie, a traditional South African food?",
      ruby_prompt: "Different families enjoy different foods. Which picture shows bobotie?",
      context: "Pictures: bobotie, biltong, umngqusho, pizza.",
      input_type: "image-match",
      options: ["Bobotie", "Biltong", "Umngqusho", "Pizza"],
      image_refs: ["scene_bobotie", "food_biltong", "food_umngqusho", "food_pizza"],
      expected: "Bobotie",
      memo: "Bobotie is minced meat with a soft egg topping. Biltong and umngqusho are also South African foods; pizza comes from Italy.",
      error_signals: ["ERR_LS_FACT"],
      difficulty: 2,
    },
  ],
  "LS.L2.BKH.T10": [
    {
      ref: "T10.16",
      question: "The Y-shape on the South African flag shows two paths joining into one. What does this stand for?",
      ruby_prompt: "Look at our flag. The Y-shape joins together into one path. What does that show?",
      context: "Picture: the South African flag with its central Y-shape.",
      input_type: "choice",
      options: ["Many different people coming together as one nation", "Six different countries", "Six roads to the sea", "Just a letter of the alphabet"],
      stem_image: "obj_sa_flag_y",
      expected: "Many different people coming together as one nation",
      memo: "The Y-shape shows different people and histories coming together as one united nation.",
      error_signals: ["ERR_LS_FACT"],
      difficulty: 2,
    },
  ],
  "LS.L5.PSW.T10": [
    {
      ref: "T10.21",
      question: "You should always wear a seatbelt when you travel in a car.",
      ruby_prompt: "Look at the picture. True or false: you should always wear a seatbelt in a car?",
      context: "Picture: a car seatbelt with its buckle.",
      input_type: "true-false",
      stem_image: "obj_seatbelt",
      expected: "True",
      memo: "True. A seatbelt holds you safely in your seat and protects you if the car stops suddenly or crashes.",
      error_signals: ["ERR_LS_SAFETY"],
      difficulty: 1,
    },
    {
      ref: "T10.22",
      question: "What is the safest place to cross a busy road?",
      ruby_prompt: "Look at the picture. Where is the safest place to cross a busy road?",
      context: "Picture: a painted zebra crossing across a road.",
      input_type: "choice",
      options: ["At a zebra crossing", "Between parked cars", "In the middle of the road", "Anywhere, as long as you run"],
      stem_image: "scene_zebra_crossing",
      expected: "At a zebra crossing",
      memo: "A zebra crossing is marked for people to cross, and drivers must stop for you. Crossing between cars or running across is dangerous.",
      error_signals: ["ERR_LS_SAFETY"],
      difficulty: 2,
    },
  ],
  "LS.L5.PSW.T13": [
    {
      ref: "T13.21",
      question: "Why should we never throw litter into a stormwater drain?",
      ruby_prompt: "Look at the picture of the drain. Why should we never throw litter into it?",
      context: "Picture: a street stormwater drain.",
      input_type: "choice",
      options: ["It blocks the drain and causes flooding and water pollution", "It helps the water flow faster", "It feeds the fish in the river", "It makes the street look better"],
      stem_image: "obj_drain",
      expected: "It blocks the drain and causes flooding and water pollution",
      memo: "Litter blocks stormwater drains, which causes flooding when it rains and pollutes the rivers the drains flow into.",
      error_signals: ["ERR_LS_SAFETY"],
      difficulty: 2,
    },
  ],
  "LS.L5.PSW.T12": [
    {
      ref: "T12.21",
      question: "Energy drinks are a healthy choice for children to drink every day.",
      ruby_prompt: "Look at the picture. True or false: energy drinks are a healthy daily drink for children?",
      context: "Picture: a can of energy drink.",
      input_type: "true-false",
      stem_image: "obj_energy_drink",
      expected: "False",
      memo: "False. Energy drinks have a lot of sugar and caffeine, which are not healthy for children. Water is the best everyday drink.",
      error_signals: ["ERR_LS_FACT"],
      difficulty: 2,
    },
  ],
};

// ── Attach a stem image to an existing item ──────────────────────────────────
const ATTACH = [{ topicId: "LS.L6.PSW.T15", ref: "T15.04", stem_image: "body_mumps" }];

let added = 0, skipped = 0, attached = 0, missingTopic = 0;
for (const [topicId, items] of Object.entries(ADDITIONS)) {
  const topic = bank.topics[topicId];
  if (!topic) { console.warn(`  MISSING topic ${topicId}`); missingTopic++; continue; }
  topic.questions ??= [];
  for (const item of items) {
    if (topic.questions.some((q) => q.ref === item.ref)) { skipped++; continue; }
    topic.questions.push(item);
    added++;
    console.log(`  + ${topicId} ${item.ref} (${item.input_type})  ${item.stem_image ? "stem:" + item.stem_image : "image-match"}`);
  }
}
for (const { topicId, ref, stem_image } of ATTACH) {
  const q = bank.topics[topicId]?.questions?.find((x) => x.ref === ref);
  if (!q) { console.warn(`  ATTACH target ${topicId} ${ref} not found`); continue; }
  if (q.stem_image === stem_image) { skipped++; continue; }
  q.stem_image = stem_image;
  attached++;
  console.log(`  ~ ${topicId} ${ref}  stem_image=${stem_image}`);
}

console.log(`\nadded: ${added}  attached: ${attached}  skipped(existing): ${skipped}  missing topics: ${missingTopic}`);
if (DRY) {
  console.log("(dry run — bank not written)");
} else {
  let out = JSON.stringify(bank, null, 2) + "\n";
  if (usesCRLF) out = out.replace(/\n/g, "\r\n");
  fs.writeFileSync(BANK_PATH, out);
  console.log(`Wrote ${BANK_PATH}`);
}
