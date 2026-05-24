// Lists every Life Skills bank item that needs a real image, so a designer
// or illustrator can produce assets without trawling 600 items by hand.
//
//   node scripts/audit-life-skills-images.mjs                       (markdown)
//   node scripts/audit-life-skills-images.mjs --json                (JSON)
//   node scripts/audit-life-skills-images.mjs > image-todo.md       (file)
//
// An item is flagged when its input_type is "image-match" (the only Life
// Skills type that hard-requires a picture). The script outputs the topic,
// item ref, the question text, the context line (which describes what the
// image should depict), and the expected answer — enough for a designer to
// draft the image directly from the row.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-skills-question-bank.json");

if (!fs.existsSync(BANK_PATH)) {
  console.error(`ERROR: bank not found at ${BANK_PATH}`);
  process.exit(1);
}

const bank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
const flagged = [];

for (const [topicId, topic] of Object.entries(bank.topics ?? {})) {
  for (const q of topic.questions ?? []) {
    if (q.input_type !== "image-match") continue;
    flagged.push({
      topic_id: topicId,
      topic_title: topic.title,
      grade: topic.grade,
      ref: q.ref,
      question: q.question,
      context: q.context ?? "",
      options: q.options ?? [],
      expected: q.expected,
    });
  }
}

const wantJson = process.argv.includes("--json");

if (wantJson) {
  process.stdout.write(JSON.stringify({ count: flagged.length, items: flagged }, null, 2));
  process.stdout.write("\n");
  process.exit(0);
}

// Markdown report
const byGrade = flagged.reduce((acc, row) => {
  (acc[row.grade] = acc[row.grade] ?? []).push(row);
  return acc;
}, {});

const lines = [];
lines.push(`# Life Skills — image-match audit`);
lines.push(``);
lines.push(`${flagged.length} item(s) need real images. Grouped by grade and topic.`);
lines.push(``);

for (const grade of Object.keys(byGrade).sort()) {
  const rows = byGrade[grade];
  lines.push(`## Grade ${grade} — ${rows.length} item(s)`);
  lines.push(``);

  const byTopic = rows.reduce((acc, r) => {
    (acc[r.topic_id] = acc[r.topic_id] ?? []).push(r);
    return acc;
  }, {});

  for (const topicId of Object.keys(byTopic).sort()) {
    const items = byTopic[topicId];
    lines.push(`### ${topicId} · ${items[0].topic_title}`);
    lines.push(``);
    lines.push(`| Ref | Question | Image should show (context) | Options | Correct |`);
    lines.push(`|-----|----------|------------------------------|---------|---------|`);
    for (const r of items) {
      const safe = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
      lines.push(
        `| ${r.ref} | ${safe(r.question)} | ${safe(r.context)} | ${safe(r.options.join(" / "))} | ${safe(r.expected)} |`,
      );
    }
    lines.push(``);
  }
}

lines.push(`---`);
lines.push(`Total: **${flagged.length}** image-match items across **${Object.keys(byGrade).length}** grade(s).`);

process.stdout.write(lines.join("\n") + "\n");
