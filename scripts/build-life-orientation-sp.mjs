// ─── Life Orientation — Senior Phase (Grades 7–9) generator ──────────────────
//
// Emits two data files from the CAPS Life Orientation SP curriculum map below:
//   • data/life-orientation-sp-skill-tree.json     (the full tree, 43 skills)
//   • data/life-orientation-sp-question-bank.json   (one pool per skill;
//                                                    questions authored in a
//                                                    later pass)
//
// CAPS Life Orientation has FIVE topics every grade. The fifth, Physical
// Education, is movement-based and cannot be assessed by tapping, so it is
// dropped from this build (head-of-ed decision, 2026-06-06). The four desk
// topics are modelled as four tiers per grade:
//   level (grade 7/8/9) → tier (a topic) → atomic_skill (= one 20-item pool).
// Tiers are ordered DS → HE → CR → WW. The atomic skill id IS the bank topic
// key, e.g. "LO.G7.DS.A1".
//
// This is a content subject — LO normally leans on essays, projects and class
// discussion. That work is reframed into tap-only KNOWLEDGE and SCENARIO
// questions (pick the best response, judge the situation, order the steps,
// sort right/wrong). No free text.
//
// Content-subject rule (shared with Natural Sciences SP / Social Sciences SP /
// EMS SP / Technology SP): no timer, 0.6 pass mark per pool, 20-item target
// pool, mastery = 75% accuracy over 80%-of-pool coverage (capped 20) — see
// lib/content-mastery.ts.
//
// Re-run any time: node scripts/build-life-orientation-sp.mjs
// Rebuilds the skill tree in full and MERGES into any existing question bank,
// preserving already-authored questions (so re-running never wipes content).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "data");
const TREE_PATH = join(DATA, "life-orientation-sp-skill-tree.json");
const BANK_PATH = join(DATA, "life-orientation-sp-question-bank.json");

// Tap mechanics used across every topic. LO is decision-based, so scenario-
// style stems are authored as `choice` questions (situation in the question,
// best response in the options) to guarantee engine support.
const BASE = ["choice", "true-false", "cloze", "sequence", "sort-buckets"];

const STRAND_LABEL = {
  DS: "Development of the self in society",
  HE: "Health, social & environmental responsibility",
  CR: "Constitutional rights & responsibilities",
  WW: "World of work",
};
// Fixed tier order within every grade.
const STRAND_ORDER = { DS: 0, HE: 1, CR: 2, WW: 3 };

// ─── Curriculum map ───────────────────────────────────────────────────────────
// Each tier: { code, term, title, skills: [[title, desc, recovery], …] }

const G7 = [
  { code: "DS", term: 1, title: "Development of the self in society", skills: [
    ["Self-image", "Recognising your positive qualities and using respect for yourself and others to build a healthy self-image.", "Your self-image is how you see yourself; positive actions and respect build it up."],
    ["Puberty and gender constructs", "The physical and emotional changes of puberty in boys and girls, and respecting your own and others' changing bodies and feelings.", "Puberty brings physical and emotional changes; everyone changes at their own pace, and that is normal."],
    ["Peer pressure", "How peer pressure works, and using assertiveness, negotiation and help-seeking to respond to it.", "Peer pressure is when others push you to act a certain way; being assertive lets you say no calmly."],
    ["Personal diet and nutrition", "What influences the food you choose and how to plan healthier eating habits.", "A balanced diet gives your body the right nutrients; small healthy swaps improve your eating."],
  ]},
  { code: "HE", term: 3, title: "Health, social and environmental responsibility", skills: [
    ["Substance abuse", "What substance abuse is, its symptoms, the personal factors behind it, and how to prevent it.", "Substance abuse is harmful use of drugs or alcohol; knowing the risks helps you avoid it."],
    ["Environmental health", "Local environmental health problems and making an action plan to prevent and solve them.", "Environmental health means keeping our surroundings clean and safe so people stay healthy."],
    ["Common diseases", "The causes, treatment and management of common diseases — TB, diabetes, epilepsy, obesity, anorexia, and HIV and AIDS.", "Many common diseases can be treated or managed with the right care, diet and medicine."],
  ]},
  { code: "CR", term: 2, title: "Constitutional rights and responsibilities", skills: [
    ["Human rights in the Constitution", "The human rights in the South African Constitution and the responsibilities that come with them.", "Every right in the Constitution comes with a responsibility to respect the same right in others."],
    ["Fair play in sport", "The role of values, trust and respect for difference in playing sport fairly.", "Fair play means respecting the rules, your opponents and the referee, win or lose."],
    ["Dealing with abuse", "Recognising threatening and risky situations, the effects of abuse, and where to find help and safety.", "Abuse is never the victim's fault; knowing the warning signs and where to get help keeps you safe."],
    ["Oral traditions and scriptures of religions", "The role of oral traditions and scriptures in South Africa's major religions: Judaism, Christianity, Islam, Hinduism, Buddhism and African religion.", "Each major religion passes on its values through stories, oral traditions and sacred writings."],
  ]},
  { code: "WW", term: 2, title: "World of work", skills: [
    ["Reading, studying and memory skills", "Reading for enjoyment and understanding, and skills to improve memory and recall.", "Reading with understanding and using memory tricks helps you study and remember more."],
    ["Career fields", "The qualities, school subjects, opportunities and requirements that go with different career fields.", "A career field groups related jobs; each needs certain subjects, interests and training."],
    ["Career simulation and the value of work", "Exploring a real career's dress code, tools and requirements, and why work helps fulfil personal needs.", "Work meets our needs and gives purpose; every career has its own tools, dress and requirements."],
  ]},
];

const G8 = [
  { code: "DS", term: 1, title: "Development of the self in society", skills: [
    ["Self-concept and self-motivation", "What shapes your self-concept and self-motivation, and using positive self-talk to reach your potential.", "Your self-concept is built by many influences; positive self-talk keeps you motivated."],
    ["Sexuality", "Understanding your own sexuality and the family, peer, cultural and media influences on it.", "Sexuality is a natural part of who you are, shaped by your feelings, values and surroundings."],
    ["Relationships and friendships", "Starting, keeping and ending relationships in healthy ways, and communicating and disagreeing respectfully.", "Healthy relationships are built on respect, good communication and honesty."],
  ]},
  { code: "HE", term: 2, title: "Health, social and environmental responsibility", skills: [
    ["Social factors in substance abuse", "Community and media factors behind substance abuse, refusal skills, and where to find rehabilitation help.", "Friends, community and media can push substance use; refusal skills help you resist."],
    ["Environmental health issues", "Using laws and policies to protect environmental health and running an environmental health programme.", "Laws and small everyday actions both help protect the environment and our health."],
    ["Decisions about HIV and AIDS", "Responsible decision-making about HIV and AIDS: management, prevention, safety and caring for others.", "HIV can be managed with medication and healthy living; prevention and care reduce its spread and stigma."],
  ]},
  { code: "CR", term: 4, title: "Constitutional rights and responsibilities", skills: [
    ["Nation building", "What nation building means and how individuals and groups, women and men, promote it.", "Nation building means working together across our differences to build one united country."],
    ["Human rights violations", "The types of human rights violations and the strategies used to counter them.", "A human rights violation is when someone's rights are denied; we counter it by speaking up and acting."],
    ["Gender equity", "Gender equity, gender-based violence, its impact, prevention and where victims find help.", "Gender equity means fair treatment of all genders; gender-based violence is a crime with help available."],
    ["Cultural diversity in South Africa", "Respecting diverse cultural norms and values and celebrating unity in diversity.", "South Africa's many cultures enrich us; respecting difference builds unity in diversity."],
    ["Religions and social development", "How organisations from various religions contribute to social development.", "Faith-based organisations help society through charity, care and community upliftment."],
  ]},
  { code: "WW", term: 2, title: "World of work", skills: [
    ["Learning styles", "The different learning styles — visual, aural, kinesthetic, reading and writing — and applying your own.", "Knowing your learning style (seeing, hearing, doing, reading) helps you study more effectively."],
    ["Six career categories", "The six career categories — investigative, enterprising, realistic, artistic, conventional and social — and how work meets South Africa's needs.", "Careers group into six types; matching your interests to a type helps you choose a direction."],
    ["School subjects and decision-making", "Linking performance in school subjects to interests and abilities, and the steps for choosing a career direction.", "Your strengths in subjects hint at careers; good decisions weigh interest, ability and passion."],
  ]},
];

const G9 = [
  { code: "DS", term: 1, title: "Development of the self in society", skills: [
    ["Goal-setting and lifestyle choices", "Making informed, assertive goals and personal lifestyle choices despite outside influences.", "Clear goals and assertiveness help you make lifestyle choices that are right for you."],
    ["Sexual behaviour and sexual health", "Risk factors and consequences of unhealthy sexual behaviour, and strategies like abstinence and where to get help.", "Healthy choices like abstinence protect you from STIs, HIV and teenage pregnancy."],
    ["Challenging situations", "Causes of depression, grief, loss, trauma and crisis, and healthy strategies to cope with strong emotions.", "Tough emotions are normal; healthy coping and asking for help work better than alcohol or drugs."],
  ]},
  { code: "HE", term: 3, title: "Health, social and environmental responsibility", skills: [
    ["Volunteerism", "What volunteerism is and how community and non-profit organisations contribute to social and environmental health.", "Volunteering is giving your time to help others and your community without being paid."],
    ["Violence and safety", "The causes and impact of violence and alternatives like problem-solving, conflict management and where to find help.", "Violence harms everyone; conflict can be solved with communication and problem-solving instead."],
  ]},
  { code: "CR", term: 2, title: "Constitutional rights and responsibilities", skills: [
    ["Citizens' rights and national days", "Respecting the rights of all people and the meaning of South Africa's national and international days.", "Good citizens respect others' rights and remember the meaning behind our national days."],
    ["Constitutional values", "The values in the South African Constitution, positive role models, and applying these values daily.", "Constitutional values like equality and dignity guide how we should treat one another every day."],
    ["Religions and peace", "How various religions contribute to promoting peace.", "All major religions teach peace, compassion and respect for others."],
    ["Sport ethics", "Ethical behaviour in all physical activities and sport.", "Sport ethics means honesty, fair play and respect — no cheating, doping or violence."],
  ]},
  { code: "WW", term: 3, title: "World of work", skills: [
    ["Time-management skills", "Being accountable, organising your work and using time effectively and efficiently.", "Good time management means planning your work and using each part of your day well."],
    ["Reading and writing for purpose", "Reading and writing for different purposes — journals, summaries — and improving these skills.", "Writing journals and summaries sharpens your reading and writing for study and life."],
    ["Options after Grade 9", "The options after Grade 9 — the NSC and the NCV — and the implications of choosing between them.", "After Grade 9 you can take the NSC at school or the NCV at a college; each suits different goals."],
    ["Knowledge of the world of work", "Rights, responsibilities and opportunities in the workplace.", "Workers have rights and responsibilities; knowing them prepares you for the world of work."],
    ["Career and subject choices", "Choosing Grade 10–12 subjects linked to careers, interests and abilities using decision-making skills.", "Your Grade 10 subject choices open or close career doors, so choose by interest and ability."],
    ["Funding and lifelong learning", "Study and career funding providers and planning for your own lifelong learning.", "Bursaries and loans can fund study; lifelong learning means you keep growing after school."],
  ]},
];

const GRADES = [
  { grade: 7, tiers: G7 },
  { grade: 8, tiers: G8 },
  { grade: 9, tiers: G9 },
];

// ─── Build the skill tree ─────────────────────────────────────────────────────

function orderTiers(tiers) {
  return [...tiers].sort((a, b) => STRAND_ORDER[a.code] - STRAND_ORDER[b.code]);
}

function buildTree() {
  const levels = GRADES.map(({ grade, tiers }) => {
    const builtTiers = orderTiers(tiers).map((tier) => {
      const strandLabel = STRAND_LABEL[tier.code];
      const capsTerm = `G${grade} T${tier.term}`;
      const atomic_skills = tier.skills.map(([title, description, recovery], i) => {
        const id = `LO.G${grade}.${tier.code}.A${i + 1}`;
        return {
          id,
          bank_skill_id: id,
          title,
          description,
          caps_term: capsTerm,
          caps_strand: strandLabel,
          caps_topic: tier.title,
          prerequisites: [],
          templates: BASE,
          error_signatures: [
            {
              type: "misconception",
              description: `A common misunderstanding when learning "${title}".`,
              example: "Authoring note: replace with the specific misconception once items are written.",
            },
          ],
          recovery_strategy: recovery,
          mastery_criteria: { correct_required: 15, formats_required: 2, allow_scaffolding: false },
        };
      });
      return {
        id: `L${grade}.${tier.code}`,
        title: `${strandLabel} · Term ${tier.term}`,
        description: `CAPS ${capsTerm} — ${strandLabel}. ${tier.title}.`,
        atomic_skills,
      };
    });
    return {
      id: grade,
      grade,
      title: `Grade ${grade} — Life Orientation`,
      description: `Grade ${grade} Life Orientation (CAPS Senior Phase). Four desk topics — Development of the self in society, Health & environmental responsibility, Constitutional rights & responsibilities, and World of work — taught across the year. Physical Education is excluded (movement-based).`,
      tiers: builtTiers,
    };
  });

  return {
    version: "1.0",
    subject: "life-orientation-sp",
    description:
      "Life Orientation Senior Phase (Grades 7–9). CAPS-aligned. Four desk topics done every grade (Development of the self in society; Health, social & environmental responsibility; Constitutional rights & responsibilities; World of work). Physical Education is excluded as it is movement-based. All skills open once the grade is selected (gate NONE). Essay/project/discussion work is reframed into tap-only knowledge and scenario questions. No free text.",
    grades_covered: [7, 8, 9],
    levels,
  };
}

// ─── Build / merge the question bank ──────────────────────────────────────────
// Authored pools live in scripts/content/ as ES modules, each default-exporting
// an object keyed by skill id → question array. Loaded in order and CONCATENATED
// per skill id, so a grade can be split across files without overwriting.
async function loadAuthoredPools() {
  const merged = {};
  const modules = [
    "lo-g7.mjs", "lo-g7-b.mjs",
    "lo-g8.mjs", "lo-g8-b.mjs",
    "lo-g9.mjs", "lo-g9-b.mjs",
  ];
  for (const mod of modules) {
    try {
      const imported = await import(`./content/${mod}`);
      const pools = imported.default ?? {};
      for (const [skillId, questions] of Object.entries(pools)) {
        merged[skillId] = (merged[skillId] ?? []).concat(questions);
      }
    } catch (err) {
      if (err?.code !== "ERR_MODULE_NOT_FOUND") throw err;
      // content module not written yet — fine, skip.
    }
  }
  return merged;
}

const SEED = await loadAuthoredPools();

function topicMeta(grade, tier, skill, skillId, title) {
  const strandLabel = STRAND_LABEL[tier.code];
  return {
    title,
    description: `${strandLabel} (CAPS G${grade} T${tier.term}) — ${tier.title}: ${title}.`,
    grade,
    strand: `${strandLabel} · Term ${tier.term}`,
    skill_ids: [skillId],
    gate: "NONE",
    pass_threshold: 0.6,
    questions_for_mastery: 20,
    target_item_count: 20,
    caps_term: `G${grade} T${tier.term}`,
    caps_topic: tier.title,
    templates: BASE,
    recovery_strategy: skill[2] ?? "",
    questions: [],
  };
}

async function buildBank() {
  let existing = {};
  try {
    const raw = await readFile(BANK_PATH, "utf8");
    existing = JSON.parse(raw).topics ?? {};
  } catch {
    /* first run — no bank yet */
  }

  const topics = {};
  for (const { grade, tiers } of GRADES) {
    for (const tier of tiers) {
      tier.skills.forEach((skill, i) => {
        const [title] = skill;
        const skillId = `LO.G${grade}.${tier.code}.A${i + 1}`;
        const meta = topicMeta(grade, tier, skill, skillId, title);
        const authored = SEED[skillId];
        if (authored?.length) {
          const stem = skillId.replace(/^LO\./, "");
          meta.questions = authored.map((q, qi) => ({
            ref: q.ref ?? `${stem}.${String(qi + 1).padStart(2, "0")}`,
            ...q,
          }));
        } else if (existing[skillId]?.questions?.length) {
          meta.questions = existing[skillId].questions;
        }
        topics[skillId] = meta;
      });
    }
  }

  return {
    version: "1.0",
    subject: "life-orientation-sp",
    description:
      "Life Orientation Senior Phase (Grades 7–9) question bank. One 20-item pool per atomic skill (the topic key IS the skill id). Content subject: 0.6 pass mark, mastery via lib/content-mastery.ts. Tap-only; no free text. Physical Education excluded.",
    topics,
  };
}

// ─── Emit ─────────────────────────────────────────────────────────────────────

const tree = buildTree();
const bank = await buildBank();

await writeFile(TREE_PATH, JSON.stringify(tree, null, 2) + "\n");
await writeFile(BANK_PATH, JSON.stringify(bank, null, 2) + "\n");

const skillCount = tree.levels.reduce(
  (n, l) => n + l.tiers.reduce((m, t) => m + t.atomic_skills.length, 0),
  0,
);
const authored = Object.values(bank.topics).filter((t) => t.questions.length > 0).length;
console.log(`skill-tree: ${tree.levels.length} grades, ${skillCount} skills`);
console.log(`bank: ${Object.keys(bank.topics).length} pools, ${authored} with questions`);
