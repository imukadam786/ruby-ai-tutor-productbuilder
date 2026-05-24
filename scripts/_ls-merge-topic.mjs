// Internal authoring helper. Merges authored content into the consolidated
// Life Skills bank.
//
// Single-topic mode:
//   node scripts/_ls-merge-topic.mjs <TOPIC_ID> <PATH_TO_PAYLOAD_JSON>
//   Payload shape: { "recovery_strategy"?: "...", "questions"?: [ ...items ] }
//
// Batch mode:
//   node scripts/_ls-merge-topic.mjs --batch <PATH_TO_BATCH_JSON>
//   Batch shape: { "<TOPIC_ID>": { "recovery_strategy"?, "questions"? }, ... }
//
// Existing fields are replaced atomically. Not user-facing.
import fs from "node:fs";

const BANK_PATH = "data/life-skills-question-bank.json";
const args = process.argv.slice(2);

function applyOne(bank, topicId, payload) {
  if (!bank.topics?.[topicId]) {
    throw new Error(`No such topic in bank: ${topicId}`);
  }
  if (typeof payload.recovery_strategy === "string") {
    bank.topics[topicId].recovery_strategy = payload.recovery_strategy;
  }
  if (Array.isArray(payload.questions)) {
    bank.topics[topicId].questions = payload.questions;
  }
}

const bank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));

if (args[0] === "--batch") {
  const batch = JSON.parse(fs.readFileSync(args[1], "utf8"));
  for (const [topicId, payload] of Object.entries(batch)) {
    applyOne(bank, topicId, payload);
    console.log(
      `Updated ${topicId} — ${bank.topics[topicId].questions.length}/${bank.topics[topicId].target_item_count} items`
    );
  }
} else {
  const [topicId, payloadPath] = args;
  if (!topicId || !payloadPath) {
    console.error("Usage: node scripts/_ls-merge-topic.mjs <TOPIC_ID> <PAYLOAD> | --batch <BATCH>");
    process.exit(1);
  }
  const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
  applyOne(bank, topicId, payload);
  console.log(
    `Updated ${topicId} — ${bank.topics[topicId].questions.length}/${bank.topics[topicId].target_item_count} items`
  );
}

fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2) + "\n");
