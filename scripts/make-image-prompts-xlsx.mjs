// Builds Image_Prompts.xlsx — a real Excel file (no deps) listing all 131
// images still to make (21 Afrikaans + 110 Life Skills), each with a complete,
// paste-ready AI prompt that embeds the filename. Flat Twemoji style,
// character-neutral, to match the icons already in the app.
//
//   node scripts/make-image-prompts-xlsx.mjs

import fs from "node:fs";
import zlib from "node:zlib";
import { LABEL_TO_KEY } from "./life-skills-image-map.mjs";

const ROOT = process.cwd();
const STYLE =
  "Bright solid colour fills, no outlines, no shadows, no text or letters, one subject centred on a plain white background, square 1:1, simple and friendly, matching a flat Twemoji-style icon set for a young children's learning app.";
const promptFor = (subject, filename) =>
  `Flat Twemoji-style vector icon: ${subject}. ${STYLE} Save the downloaded image as the file: ${filename}`;

// ── Afrikaans: the 21 remaining (key, shows, type, subject phrase) ─────────────
const AFR = [
  ["scene_seun_appel", "boy eating an apple", "Scene", "a young boy biting into a red apple he is holding, clearly eating it"],
  ["scene_meisie_appel", "girl eating an apple", "Scene", "a young girl biting into a red apple she is holding, clearly eating it"],
  ["scene_seun_bal", "boy with a ball", "Scene", "a young boy holding and playing with a round ball, not eating"],
  ["scene_hond_water", "dog drinking water", "Scene", "a dog with its head lowered, drinking water from a bowl"],
  ["scene_hond_kos", "dog eating food", "Scene", "a dog eating food from a pet food bowl, chewing, not drinking"],
  ["scene_kat_melk", "cat drinking milk", "Scene", "a cat lapping milk from a saucer on the floor"],
  ["scene_hond_slaap", "big brown dog sleeping", "Scene", "a big brown dog lying down fast asleep with eyes closed"],
  ["scene_hond_hardloop", "dog running", "Scene", "a dog running fast, legs stretched in mid-stride"],
  ["scene_kat_slaap", "cat sleeping", "Scene", "a cat curled up asleep with its eyes closed"],
  ["scene_meisie_fiets", "girl riding a bike", "Scene", "a young girl riding a bicycle"],
  ["scene_seun_fiets", "boy riding a bike", "Scene", "a young boy riding a bicycle"],
  ["scene_meisie_loop", "girl walking", "Scene", "a young girl walking on foot, taking a step, no bicycle"],
  ["hoed_rooi", "red hat", "Object", "a single bright red sun hat"],
  ["trui_blou", "blue jersey", "Object", "a blue knitted pullover jersey (sweater)"],
  ["trui_rooi", "red jersey", "Object", "a red knitted pullover jersey (sweater)"],
  ["clothes_trui", "jersey (neutral)", "Object", "a green knitted pullover jersey (sweater)"],
  ["obj_tafel", "table", "Object", "a simple wooden table with a flat top and four legs"],
  ["obj_kas", "cupboard", "Object", "a tall wooden cupboard / cabinet with closed doors"],
  ["body_kop", "head", "Object", "a single child's head and shoulders, front view, friendly face"],
  ["act_sit", "sitting", "Scene", "a child sitting down cross-legged on the floor"],
  ["act_spring", "jumping", "Scene", "a child jumping with both feet off the ground, arms up, mid-air"],
];

// ── Life Skills: gap labels → keys (identical logic to make-image-sourcing-table) ─
const bank = JSON.parse(fs.readFileSync(`${ROOT}/data/life-skills-question-bank.json`, "utf8"));
const SCENE = /\b(washing|eating|playing|helping|walking|sharing|taking|pushing|laughing|shouting|ignoring|hiding|drinking|crossing|dancing|riding|running|sleeping|surrounded|reading|holds?|carries|delivers)\b|\b(a child|children|someone|a person|people|a boy|a girl|the person|the chef|the dancer|the doctor|the vet|the footballer|the scholar|the postal)\b/i;
const seen = new Map();
for (const t of Object.values(bank.topics ?? {})) {
  if (t.grade > 3) continue;
  for (const q of t.questions ?? []) {
    if (q.input_type !== "image-match") continue;
    for (const opt of q.options ?? []) {
      const label = String(opt).trim();
      if (LABEL_TO_KEY[label]) continue;
      seen.set(label, (seen.get(label) ?? 0) + 1);
    }
  }
}
const slug = (s) => s.toLowerCase().replace(/^(a|an|the)\s+/, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
const keyFor = (label) => {
  const isScene = SCENE.test(label);
  const prefix = isScene ? "scene_" : /knee|elbow|toe|head/i.test(label) ? "body_"
    : /house|office|shop|school|kitchen|market|pool|station|building|tower|centre|road|park|library|stove|space|farm|flat/i.test(label) ? "place_"
    : "obj_";
  return { key: prefix + slug(label), type: isScene ? "Scene" : "Object" };
};
// Map-dot labels make a weak icon prompt — rephrase to a real map instruction.
const subjectForLabel = (label) =>
  /^A dot in /i.test(label)
    ? `a simple outline map of South Africa with a single bright red marker dot ${label.replace(/^A dot /i, "")}`
    : label;

const used = new Set();
const LS = [...seen.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([label, n]) => {
    let { key, type } = keyFor(label);
    let k = key, i = 2;
    while (used.has(k)) k = `${key}_${i++}`;
    used.add(k);
    return { key: k, label, type, subject: subjectForLabel(label), n };
  });

// ── Assemble rows ─────────────────────────────────────────────────────────────
const header = ["#", "Subject", "Type", "Filename", "Save to folder", "Prompt (paste into an image AI, then download)"];
const rows = [header];
let i = 1;
for (const [key, shows, type, subject] of AFR) {
  const fn = `${key}.png`;
  rows.push([i++, "Afrikaans", type, fn, "public/afrikaans/", promptFor(subject, fn)]);
}
for (const r of LS) {
  const fn = `${r.key}.png`;
  rows.push([i++, "Life Skills", r.type, fn, "public/life-skills/", promptFor(r.subject, fn)]);
}

// ── Minimal XLSX writer (inline strings, no deps) ─────────────────────────────
const crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xFFFFFFFF; for (let j = 0; j < buf.length; j++) c = crcTable[(c ^ buf[j]) & 0xff] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zip(files) {
  const local = [], central = []; let offset = 0;
  for (const f of files) {
    const data = Buffer.from(f.data, "utf8");
    const comp = zlib.deflateRawSync(data);
    const crc = crc32(data);
    const name = Buffer.from(f.name, "utf8");
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0x21, 12);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    local.push(lh, name, comp);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8); cd.writeUInt16LE(8, 10); cd.writeUInt16LE(0, 12); cd.writeUInt16LE(0x21, 14);
    cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(comp.length, 20); cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(name.length, 28); cd.writeUInt16LE(0, 30); cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34); cd.writeUInt16LE(0, 36); cd.writeUInt32LE(0, 38); cd.writeUInt32LE(offset, 42);
    central.push(cd, name);
    offset += lh.length + name.length + comp.length;
  }
  const centralBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(files.length, 8); eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, centralBuf, eocd]);
}

const xesc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const colLetter = (n) => String.fromCharCode(65 + n);
const sheetRows = rows.map((cells, r) => {
  const cs = cells.map((v, c) => {
    if (typeof v === "number") return `<c r="${colLetter(c)}${r + 1}"><v>${v}</v></c>`;
    return `<c r="${colLetter(c)}${r + 1}" t="inlineStr"><is><t xml:space="preserve">${xesc(v)}</t></is></c>`;
  }).join("");
  return `<row r="${r + 1}">${cs}</row>`;
}).join("");

const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="5"/><col min="2" max="2" width="12"/><col min="3" max="3" width="9"/><col min="4" max="4" width="26"/><col min="5" max="5" width="18"/><col min="6" max="6" width="120"/></cols><sheetData>${sheetRows}</sheetData></worksheet>`;

const files = [
  { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
  { name: "xl/workbook.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Image prompts" sheetId="1" r:id="rId1"/></sheets></workbook>` },
  { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>` },
  { name: "xl/worksheets/sheet1.xml", data: sheetXml },
];

fs.writeFileSync(`${ROOT}/Image_Prompts.xlsx`, zip(files));
console.log(`Wrote Image_Prompts.xlsx — ${rows.length - 1} prompt rows (${AFR.length} Afrikaans + ${LS.length} Life Skills)`);
