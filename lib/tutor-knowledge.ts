// ─── lib/tutor-knowledge.ts ─────────────────────────────────────────────────
// SERVER ONLY — imported by app/api/chat/route.ts. Never import this from a
// client component: it pulls in every skill tree (~3 MB) and would ship them
// to every phone.
//
// Gives the chat tutor our own teaching notes for the subject and grade:
//
//   • gradeTopics  — the grade's CAPS topic list from the skill tree, so the
//                    tutor uses the same topic names the student sees in the app
//   • topicNote    — for the one topic the question is about: what it covers,
//                    the common mistakes, how to fix them, and the "think of it
//                    like this" example from the wrong-answer feedback cards
//
// The topic is found by matching the learner's words against skill titles and
// descriptions (current grade first, then the subject's other grades). No
// match → topic list only. Papers-only subjects get notes from their November
// study guide (data/tutor-notes/*.json); those without one yet get nothing.

import accountingTree from "@/data/accounting-skill-tree.json";
import afrikaansTree from "@/data/afrikaans-skill-tree.json";
import businessStudiesTree from "@/data/business-studies-skill-tree.json";
import creativeArtsSpTree from "@/data/creative-arts-sp-skill-tree.json";
import economicsTree from "@/data/economics-skill-tree.json";
import emsSpTree from "@/data/ems-sp-skill-tree.json";
import geographyTree from "@/data/geography-skill-tree.json";
import historyTree from "@/data/history-skill-tree.json";
import lifeOrientationSpTree from "@/data/life-orientation-sp-skill-tree.json";
import lifeSciencesTree from "@/data/life-sciences-skill-tree.json";
import lifeSkillsTree from "@/data/life-skills-skill-tree.json";
import mathsTree from "@/data/skill-tree.json";
import mathsLiteracyTree from "@/data/maths-literacy-skill-tree.json";
import naturalSciencesSpTree from "@/data/natural-sciences-sp-skill-tree.json";
import nstTree from "@/data/nst-skill-tree.json";
import readingTree from "@/data/reading-skill-tree.json";
import socialSciencesTree from "@/data/social-sciences-skill-tree.json";
import socialSciencesSpTree from "@/data/social-sciences-sp-skill-tree.json";
import technologySpTree from "@/data/technology-sp-skill-tree.json";
import tourismTree from "@/data/tourism-skill-tree.json";
import physSci10Tree from "@/data/grade-10-physical-sciences-skill-tree.json";
import physSci11Tree from "@/data/grade-11-physical-sciences-skill-tree.json";
import physSci12Tree from "@/data/matric-physical-sciences-skill-tree.json";
// Papers-only subjects: notes built from the November study guides, in the
// same shape as a skill tree (Grade 12 only), plus an exam overview.
import catNotes from "@/data/tutor-notes/cat.json";
import itNotes from "@/data/tutor-notes/information-technology.json";
import agricNotes from "@/data/tutor-notes/agricultural-sciences.json";
import hospitalityNotes from "@/data/tutor-notes/hospitality-studies.json";
import consumerNotes from "@/data/tutor-notes/consumer-studies.json";
import loFetNotes from "@/data/tutor-notes/life-orientation.json";

import { TOPIC_EXAMPLES as accountingExamples } from "@/lib/accounting-topic-feedback";
import { TOPIC_EXAMPLES as afrikaansExamples } from "@/lib/afrikaans-topic-feedback";
import { TOPIC_EXAMPLES as businessStudiesExamples } from "@/lib/business-studies-topic-feedback";
import { TOPIC_EXAMPLES as creativeArtsSpExamples } from "@/lib/creative-arts-sp-topic-feedback";
import { TOPIC_EXAMPLES as economicsExamples } from "@/lib/economics-topic-feedback";
import { TOPIC_EXAMPLES as emsSpExamples } from "@/lib/ems-sp-topic-feedback";
import { TOPIC_EXAMPLES as geographyExamples } from "@/lib/geography-topic-feedback";
import { TOPIC_EXAMPLES as historyExamples } from "@/lib/history-topic-feedback";
import { TOPIC_EXAMPLES as lifeOrientationSpExamples } from "@/lib/life-orientation-sp-topic-feedback";
import { TOPIC_EXAMPLES as lifeSciencesExamples } from "@/lib/life-sciences-topic-feedback";
import { TOPIC_EXAMPLES as naturalSciencesSpExamples } from "@/lib/natural-sciences-sp-topic-feedback";
import { TOPIC_EXAMPLES as socialSciencesExamples } from "@/lib/social-sciences-topic-feedback";
import { TOPIC_EXAMPLES as socialSciencesSpExamples } from "@/lib/social-sciences-sp-topic-feedback";
import { TOPIC_EXAMPLES as technologySpExamples } from "@/lib/technology-sp-topic-feedback";
import { TOPIC_EXAMPLES as tourismExamples } from "@/lib/tourism-topic-feedback";

import { seedForGrade } from "@/lib/english-grade-map";
import { TutorContext } from "@/lib/tutor-context";
import { Message } from "@/types";

// ── Tree shape (only the fields we read) ────────────────────────────────────

interface TreeSkill {
  id: string;
  title: string;
  description?: string;
  caps_topic?: string;
  error_signatures?: { description?: string }[];
  recovery_strategy?: string;
}
interface TreeTier { id: string; title: string; atomic_skills?: TreeSkill[] }
interface TreeLevel { id: number | string; grade?: number; title: string; tiers?: TreeTier[] }
interface Tree { levels: TreeLevel[]; /** Papers-only subjects: how the exam is set and marked. */ overview?: string }

/** How a subject's tree maps onto grades. */
type GradeRule =
  | "level-grade"   // each level has a `grade` field
  | "whole-tree"    // the whole tree is one grade range (Maths Lit, a Physical Sciences grade file)
  | "reading"       // English: level chosen by lib/english-grade-map
  | "no-grade";     // Maths: placement-based, no grade → match only, no topic list

interface SubjectSource { trees: Tree[] | ((grade: number | null) => Tree[]); rule: GradeRule; examples?: Record<string, string> }

const t = (x: unknown) => x as Tree;

const SOURCES: Record<string, SubjectSource> = {
  accounting: { trees: [t(accountingTree)], rule: "level-grade", examples: accountingExamples },
  afrikaans: { trees: [t(afrikaansTree)], rule: "level-grade", examples: afrikaansExamples },
  "business-studies": { trees: [t(businessStudiesTree)], rule: "level-grade", examples: businessStudiesExamples },
  "creative-arts-sp": { trees: [t(creativeArtsSpTree)], rule: "level-grade", examples: creativeArtsSpExamples },
  economics: { trees: [t(economicsTree)], rule: "level-grade", examples: economicsExamples },
  "ems-sp": { trees: [t(emsSpTree)], rule: "level-grade", examples: emsSpExamples },
  geography: { trees: [t(geographyTree)], rule: "level-grade", examples: geographyExamples },
  history: { trees: [t(historyTree)], rule: "level-grade", examples: historyExamples },
  "life-orientation-sp": { trees: [t(lifeOrientationSpTree)], rule: "level-grade", examples: lifeOrientationSpExamples },
  "life-sciences": { trees: [t(lifeSciencesTree)], rule: "level-grade", examples: lifeSciencesExamples },
  "life-skills": { trees: [t(lifeSkillsTree)], rule: "level-grade" },
  "natural-sciences-sp": { trees: [t(naturalSciencesSpTree)], rule: "level-grade", examples: naturalSciencesSpExamples },
  nst: { trees: [t(nstTree)], rule: "level-grade" },
  "social-sciences": { trees: [t(socialSciencesTree)], rule: "level-grade", examples: socialSciencesExamples },
  "social-sciences-sp": { trees: [t(socialSciencesSpTree)], rule: "level-grade", examples: socialSciencesSpExamples },
  "technology-sp": { trees: [t(technologySpTree)], rule: "level-grade", examples: technologySpExamples },
  tourism: { trees: [t(tourismTree)], rule: "level-grade", examples: tourismExamples },
  cat: { trees: [t(catNotes)], rule: "level-grade" },
  "information-technology": { trees: [t(itNotes)], rule: "level-grade" },
  "agricultural-sciences": { trees: [t(agricNotes)], rule: "level-grade" },
  "hospitality-studies": { trees: [t(hospitalityNotes)], rule: "level-grade" },
  "consumer-studies": { trees: [t(consumerNotes)], rule: "level-grade" },
  "life-orientation": { trees: [t(loFetNotes)], rule: "level-grade" },
  "maths-literacy": { trees: [t(mathsLiteracyTree)], rule: "whole-tree" },
  english: { trees: [t(readingTree)], rule: "reading" },
  maths: { trees: [t(mathsTree)], rule: "no-grade" },
  "physical-sciences": {
    // One file per grade; the learner's own grade first, the others as fallback.
    trees: (grade) => {
      const byGrade: Record<number, Tree> = { 10: t(physSci10Tree), 11: t(physSci11Tree), 12: t(physSci12Tree) };
      const own = grade && byGrade[grade] ? [byGrade[grade]] : [];
      return [...own, ...Object.values(byGrade).filter((x) => !own.includes(x))];
    },
    rule: "whole-tree",
  },
};

// ── Grade slicing ───────────────────────────────────────────────────────────

/** The levels taught at this grade, or [] when the grade can't be placed. */
function levelsForGrade(source: SubjectSource, grade: number | null): TreeLevel[] {
  const trees = typeof source.trees === "function" ? source.trees(grade) : source.trees;
  switch (source.rule) {
    case "level-grade":
      return grade ? trees.flatMap((tr) => tr.levels.filter((l) => l.grade === grade)) : [];
    case "whole-tree":
      return trees[0]?.levels ?? [];
    case "reading": {
      if (!grade) return [];
      const level = seedForGrade(grade).level;
      return trees[0].levels.filter((l) => Number(l.id) === level);
    }
    case "no-grade":
      return [];
  }
}

function allLevels(source: SubjectSource, grade: number | null): TreeLevel[] {
  const trees = typeof source.trees === "function" ? source.trees(grade) : source.trees;
  return trees.flatMap((tr) => tr.levels);
}

const skillsOf = (levels: TreeLevel[]) =>
  levels.flatMap((l) => (l.tiers ?? []).flatMap((tier) => tier.atomic_skills ?? []));

// ── Topic matching ──────────────────────────────────────────────────────────

const STOPWORDS = new Set(
  ("the and for with what how why when who which that this these those does did doing done are was were " +
    "can could would should will you your yours me my mine our its it's i'm im dont don't not but from into " +
    "about explain help understand tell teach show give know learn learning question questions answer homework " +
    "grade test exam paper please thanks thank really still just more some any all also like need want get " +
    "have has had one two three work working study studying topic topics subject section chapter page " +
    "difference differences between make making use using mean means meaning example examples why " +
    // Afrikaans question words (the Afrikaans tree's titles are in Afrikaans)
    "wat die hoe waarom van het nie vir met kan wil asseblief verduidelik")
    .split(" "),
);

// Crude suffix stripping, applied to both sides, so "factorise" meets
// "factorising", "hands" meets "hand" and "naamwoord" meets "naamwoorde".
const SUFFIXES = ["isations", "isation", "ising", "ised", "ises", "ise", "izing", "ized", "izes", "ize", "ings", "ing", "ed", "es", "s", "e"];
function stem(w: string): string {
  if (w.endsWith("ies") && w.length >= 6) w = `${w.slice(0, -3)}y`; // anomalies → anomaly
  for (const suf of SUFFIXES) {
    if (w.endsWith(suf) && w.length - suf.length >= 4) return w.slice(0, -suf.length);
  }
  return w;
}

function words(text: string, extraStop: Set<string>): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zà-ÿ0-9']+/)
    .map((w) => w.replace(/'s$/, ""))
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !extraStop.has(w))
    .map(stem);
}

/** Best-matching skill for the learner's words, or null. A word in the skill
    title scores 3, in its CAPS topic 2, in its description 1. A match needs
    3 points (2 when the question has only two topic words, e.g. "food web").
    The current grade's skills outrank other grades' at equal strength. */
function matchSkill(
  query: string,
  gradeSkills: TreeSkill[],
  otherSkills: TreeSkill[],
  extraStop: Set<string>,
): TreeSkill | null {
  const qList = words(query, extraStop);
  const q = new Set(qList);
  if (!q.size) return null;
  const required = q.size === 2 ? 2 : 3;
  // Two-word terms ("cloud computing", "food web", "mail merge") count as a
  // phrase: +3 when the skill's text has the same two words side by side.
  const pairs = qList.slice(1).map((w, i) => `${qList[i]} ${w}`);
  // A question word found in only ONE skill's text ("blockchain", "rumen",
  // "halal") is as strong a clue as a title word, wherever it appears.
  // Titles of papers-only notes end in their weighting ("(40 marks)", "(17.7%)"): not topic words.
  const bare = (title: string) => title.replace(/\([^)]*\)/g, " ");
  const allWords = (sk: TreeSkill) => new Set(words(`${bare(sk.title)} ${sk.caps_topic ?? ""} ${sk.description ?? ""}`, extraStop));
  const pool = [...gradeSkills, ...otherSkills].map(allWords);
  const rare = new Set([...q].filter((w) => pool.filter((ws) => ws.has(w)).length === 1));
  let best: { skill: TreeSkill; score: number } | null = null;
  const score = (skill: TreeSkill, weight: number) => {
    const title = new Set(words(bare(skill.title), extraStop));
    const topic = new Set(words(skill.caps_topic ?? "", extraStop));
    const body = new Set(words(skill.description ?? "", extraStop));
    let raw = 0;
    for (const w of q) raw += title.has(w) || (rare.has(w) && body.has(w)) ? 3 : topic.has(w) ? 2 : body.has(w) ? 1 : 0;
    if (pairs.length) {
      // Split at punctuation first so "foods, healthy" isn't read as a phrase.
      const seq = ` ${`${bare(skill.title)}. ${skill.caps_topic ?? ""}. ${skill.description ?? ""}`
        .split(/[,.;:()!?]+/)
        .map((part) => words(part, extraStop).join(" "))
        .join(" | ")} `;
      for (const p of pairs) if (seq.includes(` ${p} `)) raw += 3;
    }
    if (raw < required) return;
    const s = raw * weight;
    if (!best || s > best.score) best = { skill, score: s };
  };
  gradeSkills.forEach((sk) => score(sk, 1));
  otherSkills.forEach((sk) => score(sk, 0.8));
  return best ? (best as { skill: TreeSkill }).skill : null;
}

// ── Public API ──────────────────────────────────────────────────────────────

export interface SubjectNotes {
  /** Stable for a subject + grade — goes before the chat history. */
  gradeTopics: string | null;
  /** Varies per message — goes right before the newest student message. */
  topicNote: string | null;
  /** For logging/tests: the matched skill id. */
  matchedSkillId: string | null;
}

export function getSubjectNotes(ctx: TutorContext, messages: Message[]): SubjectNotes {
  const none = { gradeTopics: null, topicNote: null, matchedSkillId: null };
  if (!ctx.subject || !ctx.subjectId) return none;
  const source = SOURCES[ctx.subjectId];
  if (!source) return none;

  const gradeLevels = levelsForGrade(source, ctx.grade);
  const gradeSkills = skillsOf(gradeLevels);
  const gradeSkillIds = new Set(gradeSkills.map((s) => s.id));
  const otherSkills = skillsOf(allLevels(source, ctx.grade)).filter((s) => !gradeSkillIds.has(s.id));

  const overview = (typeof source.trees === "function" ? source.trees(ctx.grade) : source.trees)[0]?.overview;
  const where = `${ctx.subject.label}${ctx.grade ? `, Grade ${ctx.grade}` : ""}`;
  let gradeTopics: string | null = null;
  if (gradeLevels.length) {
    const tiers = gradeLevels.flatMap((l) => l.tiers ?? []);
    let lines = tiers.map((tier) => `- ${tier.title}: ${(tier.atomic_skills ?? []).map((s) => s.title).join("; ")}`);
    // Keep the list short (~500 tokens): long trees list their sections only.
    if (lines.join("\n").length > 2000) {
      lines = gradeLevels.length > 1 ? gradeLevels.map((l) => `- ${l.title}`) : tiers.map((tier) => `- ${tier.title}`);
    }
    gradeTopics =
      `## Our notes: ${where}\n\n` +
      `These are the CAPS topics this student's app teaches at their grade. Use these topic names, keep explanations ` +
      `at this level, and if a question is outside this list, say which grade or topic it belongs to.\n\n${lines.join("\n")}` +
      (overview ? `\n\nHow the exam is set and marked: ${overview}` : "");
  }

  // Subject-name words ("accounting", "history") say nothing about the topic.
  const extraStop = new Set(words(ctx.subject.label, new Set()));
  const userTexts = messages.filter((m) => m.role === "user").map((m) => m.content).reverse();
  let skill: TreeSkill | null = null;
  for (const text of userTexts.slice(0, 3)) {
    skill = matchSkill(text, gradeSkills, otherSkills, extraStop);
    if (skill) break;
  }

  let topicNote: string | null = null;
  if (skill) {
    const mistakes = (skill.error_signatures ?? []).map((e) => e.description).filter(Boolean);
    const example = source.examples?.[skill.id];
    const fromOtherGrade = !gradeSkillIds.has(skill.id) && gradeLevels.length > 0;
    topicNote = [
      `## Our notes on the topic this question is about: ${skill.title}`,
      fromOtherGrade ? `(This topic is from a different grade's work in ${ctx.subject.label}.)` : "",
      skill.description ? `What it covers: ${skill.description}` : "",
      mistakes.length ? `Common mistakes students make: ${mistakes.join("; ")}.` : "",
      skill.recovery_strategy ? `How we teach the fix: ${skill.recovery_strategy}` : "",
      example ? `The example the app uses: ${example}` : "",
      `Base your explanation on these notes so it matches what the app teaches. If they don't cover what the student asked, use your own knowledge, staying within CAPS.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return { gradeTopics, topicNote, matchedSkillId: skill?.id ?? null };
}
