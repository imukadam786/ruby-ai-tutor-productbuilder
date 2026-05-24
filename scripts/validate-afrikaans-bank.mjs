#!/usr/bin/env node
// Validate the Afrikaans FAL skill tree + question bank.
// Usage: node scripts/validate-afrikaans-bank.mjs
// Exit 0 = clean (errors == 0). Warnings do not fail the build.
//
// Checks:
//  - both files parse as JSON
//  - tree: unique skill ids, prerequisites resolve to real skill ids,
//    a prerequisite never points forward to a later grade
//  - bank: every bank skill_id exists in the tree
//  - bank: required question fields present and well-formed
//  - bank: `expected` is one of `options` (for option-based input types)
//  - bank: refs unique within a skill; difficulty in 1..3; input_type allowed
//  - image-match items carry image_refs
//  - audio-template skills: items use an `audio` field (warn if missing)
//  - coverage: tree skills with no bank entry are reported as INFO (not error)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TREE_PATH = join(ROOT, "data", "afrikaans-skill-tree.json");
const BANK_PATH = join(ROOT, "data", "afrikaans-question-bank.json");

const INPUT_TYPES = new Set(["choice", "true-false", "image-match", "sequence", "text", "cloze"]);
const OPTION_BASED = new Set(["choice", "true-false", "image-match", "cloze"]);

// Tutoring-first depth floor: every skill should hold at least this many items so
// learners can work through plenty of practice rather than be tested on a few.
const TARGET_ITEMS = 20;

const errors = [];
const warnings = [];
const info = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function loadJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    err(`${label}: could not parse JSON — ${e.message}`);
    return null;
  }
}

const tree = loadJson(TREE_PATH, "skill-tree");
const bank = loadJson(BANK_PATH, "question-bank");

// ── Tree: collect skills, grades, prerequisites ──────────────────────────────
const treeSkillGrade = new Map(); // skillId -> grade
if (tree) {
  for (const level of tree.levels ?? []) {
    for (const tier of level.tiers ?? []) {
      for (const skill of tier.atomic_skills ?? []) {
        if (treeSkillGrade.has(skill.id)) err(`tree: duplicate skill id ${skill.id}`);
        treeSkillGrade.set(skill.id, level.grade);
      }
    }
  }
  // prerequisites resolve, and never point to a later grade
  for (const level of tree.levels ?? []) {
    for (const tier of level.tiers ?? []) {
      for (const skill of tier.atomic_skills ?? []) {
        for (const pre of skill.prerequisites ?? []) {
          if (!treeSkillGrade.has(pre)) {
            err(`tree: ${skill.id} has prerequisite ${pre} that does not exist`);
          } else if (treeSkillGrade.get(pre) > level.grade) {
            err(`tree: ${skill.id} (grade ${level.grade}) depends on ${pre} from a later grade`);
          }
        }
      }
    }
  }
}

// ── Bank: per-skill and per-question checks ──────────────────────────────────
if (bank) {
  const skills = bank.skills ?? {};
  for (const [skillId, entry] of Object.entries(skills)) {
    if (!treeSkillGrade.has(skillId)) {
      err(`bank: skill ${skillId} is not in the skill tree`);
    }
    const audioSkill = (entry.templates ?? []).includes("audio");
    const refs = new Set();
    const questions = entry.questions ?? [];
    if (questions.length === 0) warn(`bank: ${skillId} has no questions`);

    for (const q of questions) {
      const id = `${skillId}/${q.ref ?? "?"}`;
      for (const field of ["ref", "question", "input_type", "expected", "memo"]) {
        if (q[field] == null || q[field] === "") err(`bank: ${id} missing ${field}`);
      }
      if (q.ref) {
        if (refs.has(q.ref)) err(`bank: ${skillId} has duplicate ref ${q.ref}`);
        refs.add(q.ref);
      }
      if (!INPUT_TYPES.has(q.input_type)) err(`bank: ${id} bad input_type "${q.input_type}"`);
      if (typeof q.difficulty !== "number" || q.difficulty < 1 || q.difficulty > 3) {
        err(`bank: ${id} difficulty must be 1..3`);
      }
      if (!Array.isArray(q.error_signals) || q.error_signals.length === 0) {
        warn(`bank: ${id} has no error_signals`);
      }
      if (OPTION_BASED.has(q.input_type)) {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          err(`bank: ${id} needs at least 2 options for ${q.input_type}`);
        } else if (!q.options.includes(q.expected)) {
          err(`bank: ${id} expected "${q.expected}" is not one of options`);
        }
      }
      if (q.input_type === "image-match" && (!Array.isArray(q.image_refs) || q.image_refs.length === 0)) {
        warn(`bank: ${id} is image-match but has no image_refs (manifest keys)`);
      }
      if (audioSkill && (q.audio == null || q.audio === "") && q.input_type !== "text") {
        // most listening/phonics items should carry the Afrikaans audio string
        if (entry.strand === "Klanke" || entry.strand === "Luister") {
          warn(`bank: ${id} on an audio skill has no "audio" field`);
        }
      }
    }
  }
}

// ── Coverage: tree skills with no bank entry (INFO, expected during proof) ────
if (tree && bank) {
  const banked = new Set(Object.keys(bank.skills ?? {}));
  const unbanked = [...treeSkillGrade.keys()].filter((id) => !banked.has(id));
  if (unbanked.length) {
    info.push(`coverage: ${banked.size}/${treeSkillGrade.size} tree skills authored. Not yet authored: ${unbanked.join(", ")}`);
  } else {
    info.push(`coverage: all ${treeSkillGrade.size} tree skills authored.`);
  }

  // Depth: how many skills meet the tutoring-first item floor (20+).
  const counts = Object.entries(bank.skills ?? {}).map(([id, e]) => [id, (e.questions ?? []).length]);
  const atFloor = counts.filter(([, n]) => n >= TARGET_ITEMS).length;
  const below = counts.filter(([, n]) => n < TARGET_ITEMS);
  info.push(`depth: ${atFloor}/${counts.length} skills at >=${TARGET_ITEMS} items (tutoring floor).`);
  if (below.length) {
    const preview = below.slice(0, 8).map(([id, n]) => `${id}=${n}`).join(", ");
    info.push(`depth: ${below.length} skill(s) below floor (e.g. ${preview}${below.length > 8 ? ", ..." : ""}).`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
for (const m of info) console.log(`INFO  ${m}`);
for (const m of warnings) console.log(`WARN  ${m}`);
for (const m of errors) console.log(`ERROR ${m}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
