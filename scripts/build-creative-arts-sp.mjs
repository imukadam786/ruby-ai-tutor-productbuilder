// ─── Creative Arts — Senior Phase (Grades 7–9) generator ─────────────────────
//
// Emits two data files from the CAPS Creative Arts SP curriculum map below:
//   • data/creative-arts-sp-skill-tree.json     (the full tree, 43 skills)
//   • data/creative-arts-sp-question-bank.json   (one 20-item pool per skill;
//                                                 questions authored separately
//                                                 in scripts/content/ca-*.mjs)
//
// CAPS Creative Arts covers FOUR art forms (Dance, Drama, Music, Visual Arts).
// Learners do only TWO. This build ships the two with rich tap-native theory —
// MUSIC and VISUAL ARTS. Dance (~80% body skill) and Drama (performance) are
// excluded: tapping cannot assess a pirouette, a vocal warm-up or a brushstroke
// (head-of-ed scope decision, 2026-06-06). Music and Visual Arts cover the two
// art forms CAPS itself requires, so this is curriculum-valid, not a compromise.
//
// Structure: level (grade 7/8/9) → tier (a strand-topic) → atomic_skill
//   (= one 20-item pool). Two strands, each with three CAPS topics:
//     Music        → MUL (literacy) · MUE (listening & elements) · MUP (creating)
//     Visual Arts  → VAE (elements & design) · VAM (making knowledge) · VAL (visual literacy)
//   Tiers are ordered Music first, then Visual Arts. The atomic skill id IS the
//   bank topic key, e.g. "CA.G7.MUL.A1".
//
// This is a content subject. The making/performing work (drawing, painting,
// playing, singing) is reframed into tap-only KNOWLEDGE: name the note, read the
// rhythm, identify the element, pick the technique, judge the artwork, order the
// steps, sort into groups. No free text.
//
// Content-subject rule (shared with Natural Sciences SP / Social Sciences SP /
// EMS SP / Technology SP / Life Orientation SP): no timer, 0.6 pass mark per
// pool, 20-item target pool, mastery = 75% accuracy over 80%-of-pool coverage
// (capped 20) — see lib/content-mastery.ts.
//
// NOTE: Music reading items reference notation images and Visual Arts literacy
// items reference artworks; both ship text-first (image_refs resolve to a
// graceful placeholder until art is added — head-of-ed call).
//
// Re-run any time: node scripts/build-creative-arts-sp.mjs
// Rebuilds the skill tree in full and MERGES into any existing question bank,
// preserving already-authored questions (so re-running never wipes content).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "data");
const TREE_PATH = join(DATA, "creative-arts-sp-skill-tree.json");
const BANK_PATH = join(DATA, "creative-arts-sp-question-bank.json");

// Tap mechanics used across every topic.
const BASE = ["choice", "true-false", "cloze", "sequence", "sort-buckets"];

// Tier code → { strand, topic }. Strand drives the visible grouping so learners
// see Music and Visual Arts as distinct areas. Order array fixes tier order.
const TIER_META = {
  MUL: { strand: "Music", topic: "Music literacy" },
  MUE: { strand: "Music", topic: "Listening & elements" },
  MUP: { strand: "Music", topic: "Performing & creating" },
  VAE: { strand: "Visual Arts", topic: "Art elements & design" },
  VAM: { strand: "Visual Arts", topic: "Making in 2D & 3D" },
  VAL: { strand: "Visual Arts", topic: "Visual literacy" },
};
const TIER_ORDER = { MUL: 0, MUE: 1, MUP: 2, VAE: 3, VAM: 4, VAL: 5 };

// ─── Curriculum map ───────────────────────────────────────────────────────────
// Each tier: { code, skills: [[title, desc, recovery], …] }

const G7 = [
  { code: "MUL", skills: [
    ["Note values and rests", "Reading and naming note values and their rests — semibreve, minim, crotchet, quaver and the dotted minim — and how long each lasts.", "A note's value tells you how many beats it lasts; a semibreve is longest, a quaver short."],
    ["Treble and bass clef", "Naming notes on the lines and spaces of the treble and bass clefs.", "The clef at the start of a staff tells you which note each line and space stands for."],
    ["Beat and metre", "Hearing and counting the beat in duple (2), triple (3) and quadruple (4) time.", "The metre is how the beats group — in 2s, 3s or 4s — and the first beat of each group is the strongest."],
    ["Tonic sol-fa", "Using tonic sol-fa names (doh, re, mi…) to sight-sing simple melodic phrases.", "Tonic sol-fa gives each note of the scale a name (doh re mi fa soh la ti doh) to help you sing it."],
  ]},
  { code: "MUE", skills: [
    ["Describing music", "Listening and describing a piece by its tempo (fast/slow), dynamics (soft/loud), metre and the mood or story it tells.", "When you describe music, listen for how fast (tempo), how loud (dynamics), the beat grouping and the mood."],
    ["Instruments in a performance", "Recognising and naming common instruments heard in a performance.", "Each instrument has its own sound; with practice you can pick out a drum, guitar or flute by ear."],
  ]},
  { code: "MUP", skills: [
    ["Creating music", "The building blocks of creating music — ostinato, riff, question-and-answer, melodic and rhythmic repetition, and graphic scores.", "An ostinato or riff is a short pattern repeated; question-and-answer is one phrase 'answered' by another."],
    ["Singing and song types", "Knowing the song types learners sing — the National Anthem, folk songs, rounds and part-songs — and accompanying with body percussion.", "A round is a song where groups start at different times; body percussion is clapping, clicking or stamping a beat."],
  ]},
  { code: "VAE", skills: [
    ["Art elements", "The art elements — line, shape, tone, texture and colour — and recognising them in artworks.", "The art elements are the basic 'ingredients' of any artwork: line, shape, tone, texture and colour."],
    ["Colour theory", "Mixing colour and using complementary colours (opposites) and monochromatic colour (shades of one colour).", "Complementary colours sit opposite on the colour wheel; monochromatic means tints and shades of one colour."],
    ["Design principles", "The design principles — balance, contrast, pattern, proportion and emphasis — used to arrange an artwork.", "Design principles are the 'rules' for arranging elements: balance, contrast, pattern, proportion and emphasis."],
  ]},
  { code: "VAM", skills: [
    ["Drawing and 2D media", "Knowledge behind 2D making — drawing (line, tone, texture, mark-making), painting (colour-mixing, brushwork), simple etching, lettering and pattern-making.", "Different media make different marks; mark-making, brushwork and etching are ways to create texture and tone."],
    ["Making in 3D", "Knowledge behind 3D making — construction and modelling, plane/depth/perspective, materials and tools, good craftsmanship, safety and using recyclable materials.", "3D work uses depth and space; good craftsmanship means working neatly, safely and caring for the environment."],
  ]},
  { code: "VAL", skills: [
    ["Looking and analysing", "Looking at and talking about artworks — buildings, still life, masks and groups of figures — and reading their symbolic language.", "Analysing art means describing what you see using the art elements, and asking what its symbols might mean."],
    ["The artist and research", "The role of the artist in their own society as contributor and observer, and beginning to research art.", "Artists contribute to and observe society; researching means gathering information and images about art."],
  ]},
];

const G8 = [
  { code: "MUL", skills: [
    ["Duration and metre", "Reading rhythm in 2/4, 3/4, 4/4 and compound duple 6/8 time.", "The top number of a time signature counts beats in a bar; 6/8 groups six quavers into two main beats."],
    ["Major scales", "Building the major scales of C, G, D and F major using tones and semitones.", "A major scale follows the pattern tone-tone-semitone-tone-tone-tone-semitone from its starting note."],
    ["Reading in keys", "Reading (singing or playing) music in the keys of C, G, D and F major.", "The key tells you which sharps or flats to use throughout the piece."],
  ]},
  { code: "MUE", skills: [
    ["Music terminology", "Musical terms for tempo (moderato, presto, ritardando, a tempo) and articulation (legato, staccato).", "Tempo terms tell you the speed (presto = fast); articulation tells you how to play notes (staccato = short, detached)."],
    ["Elements across styles", "Identifying the elements and principles of music — metre, dynamics, repetition, contrast — across Western classical, African, Indian and popular styles.", "Every style uses the same elements — metre, dynamics, repetition, contrast — but in its own way."],
    ["Instrument families", "Grouping instruments by how they make sound — chordophones (strings), idiophones, membranophones (drums) and aerophones (wind).", "Instruments group by how sound is made: chordophones (strings), membranophones (skins), idiophones (the body itself), aerophones (air)."],
  ]},
  { code: "MUP", skills: [
    ["Creating and composing", "Knowledge behind composing — building a piece with structure and combining music with another art form.", "Composing means making your own music with a clear structure; it can be combined with dance, drama or art."],
  ]},
  { code: "VAE", skills: [
    ["Art elements and analogous colour", "The art elements again, now adding analogous (related, neighbouring) colour.", "Analogous colours sit next to each other on the colour wheel, like blue, blue-green and green."],
    ["Design principles", "Using the design principles with greater control to plan and arrange artworks.", "Design principles — balance, contrast, pattern, proportion, emphasis — guide how you arrange an artwork."],
  ]},
  { code: "VAM", skills: [
    ["Drawing, painting and media", "Knowledge behind extended 2D making — drawing and painting with a wider range of media and techniques, lettering, pattern and paper size/format.", "Trying different media, scales and formats widens what your drawing and painting can express."],
    ["Making in 3D", "Knowledge behind more complex 3D making — construction and modelling, manipulating materials and tools with good craftsmanship and safety, recyclable materials, and themes from the social world.", "More complex 3D work deepens spatial awareness; good craftsmanship, safety and recycling still matter."],
  ]},
  { code: "VAL", skills: [
    ["Looking and analysing", "Analysing artworks and design — creative lettering and functional containers — and exploring careers in fashion design.", "Reading design means asking how something looks AND how it works; many careers, like fashion, blend both."],
    ["The artist, research and planning", "The role of the artist in the wider society and arts careers, developing research skills, and planning and preparing for a project.", "Planning a project means collecting resources, references and rough sketches before the final work."],
  ]},
];

const G9 = [
  { code: "MUL", skills: [
    ["Scales in treble and bass clef", "Writing the scales of C, G, D and F major in both the treble and bass clefs.", "The same scale can be written in either clef — the note names are the same, the staff position differs."],
    ["Key signatures", "The key signatures of C, G, D and F major and the sharps they use.", "A key signature lists the sharps or flats for a key: C has none, G has F#, D has F# and C#, F has B flat."],
    ["Ledger lines", "Reading notes on ledger lines — the short lines above and below the staff.", "Ledger lines extend the staff so you can write notes that are too high or too low to fit on it."],
    ["Intervals", "Naming the distance between two notes — the interval — by counting note names.", "An interval is counted by including both notes: C up to G is a 5th (C-D-E-F-G)."],
    ["Triads", "Building a triad — a three-note chord of a root, third and fifth.", "A triad stacks three notes a third apart: the root, the note two letters up, and the note four letters up."],
    ["Writing scales rhythmically", "Writing the C, G, D and F major scales using the note values learnt.", "Writing a scale rhythmically combines the right pitches with chosen note values in a bar."],
  ]},
  { code: "MUE", skills: [
    ["Orchestral families", "The four families of the orchestra — strings, woodwind, brass and percussion — and how each produces sound.", "The orchestra groups instruments into strings, woodwind, brass and percussion by how they make their sound."],
    ["Music styles", "The features of popular styles — reggae, kwaito, R&B and African jazz — including rhythm, tempo, instruments and voices.", "Each style has signature features; kwaito is slow South African house, reggae has its off-beat rhythm."],
    ["Musicals, opera and the anthem", "Listening to a musical or opera (such as West Side Story or The Magic Flute), following its storyline, and discussing the National Anthem.", "A musical or opera tells a story through song; the South African anthem joins five languages and two melodies."],
  ]},
  { code: "MUP", skills: [
    ["Composing", "Knowledge behind Grade 9 composing — completing a four-bar phrase, adding music to words, and creating an advertisement jingle.", "Completing a phrase means writing an 'answer' that balances the opening; a jingle is a short, catchy advert tune."],
  ]},
  { code: "VAE", skills: [
    ["Art elements and analogous colour", "The art elements with a global focus, using analogous and related colour with control.", "Analogous colours (neighbours on the wheel) create harmony; the elements stay the building blocks of art."],
    ["Design principles", "Applying the design principles independently to plan and judge artworks.", "By Grade 9 you use balance, contrast, pattern, proportion and emphasis to plan and critique work yourself."],
  ]},
  { code: "VAM", skills: [
    ["Making in 2D and 3D", "Knowledge behind global-themed making — drawing, painting and etching, and personalised 3D construction and modelling with complex materials, craftsmanship and safety.", "Personalised making lets you choose materials and techniques to express your own idea, made well and safely."],
  ]},
  { code: "VAL", skills: [
    ["Looking and analysing", "Analysing portraits, social commentary, popular culture and design in public spaces.", "Art can comment on society; a portrait, poster or mural can carry a message as well as a likeness."],
    ["The artist as social commentator", "The role of the artist as contributor, observer and social commentator in global society, working independently to research and plan.", "A social commentator uses art to raise issues; by Grade 9 you research and plan your projects on your own."],
  ]},
];

const GRADES = [
  { grade: 7, tiers: G7 },
  { grade: 8, tiers: G8 },
  { grade: 9, tiers: G9 },
];

// ─── Build the skill tree ─────────────────────────────────────────────────────

function orderTiers(tiers) {
  return [...tiers].sort((a, b) => TIER_ORDER[a.code] - TIER_ORDER[b.code]);
}

function buildTree() {
  const levels = GRADES.map(({ grade, tiers }) => {
    const builtTiers = orderTiers(tiers).map((tier) => {
      const { strand, topic } = TIER_META[tier.code];
      const atomic_skills = tier.skills.map(([title, description, recovery], i) => {
        const id = `CA.G${grade}.${tier.code}.A${i + 1}`;
        return {
          id,
          bank_skill_id: id,
          title,
          description,
          caps_term: `G${grade}`,
          caps_strand: strand,
          caps_topic: topic,
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
        title: `${strand} · ${topic}`,
        description: `CAPS G${grade} ${strand} — ${topic}.`,
        atomic_skills,
      };
    });
    return {
      id: grade,
      grade,
      title: `Grade ${grade} — Creative Arts`,
      description: `Grade ${grade} Creative Arts (CAPS Senior Phase). Two art forms — Music and Visual Arts — taught across the year. Dance and Drama are excluded (movement/performance-based, cannot be tapped).`,
      tiers: builtTiers,
    };
  });

  return {
    version: "1.0",
    subject: "creative-arts-sp",
    description:
      "Creative Arts Senior Phase (Grades 7–9). CAPS-aligned. Two of the four art forms are built — Music and Visual Arts (the two with rich tap-native theory). Dance and Drama are excluded as movement/performance-based. Each art form has three CAPS topics. All skills open once the grade is selected (gate NONE). Making/performing work is reframed into tap-only knowledge. No free text.",
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
    "ca-g7-music.mjs", "ca-g7-visual.mjs",
    "ca-g8-music.mjs", "ca-g8-visual.mjs",
    "ca-g9-music.mjs", "ca-g9-visual.mjs",
    "ca-supplement.mjs", // top-up: one extra item for pools that came in at 19
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
  const { strand, topic } = TIER_META[tier.code];
  return {
    title,
    description: `${strand} (CAPS G${grade}) — ${topic}: ${title}.`,
    grade,
    strand: `${strand} · ${topic}`,
    skill_ids: [skillId],
    gate: "NONE",
    pass_threshold: 0.6,
    questions_for_mastery: 20,
    target_item_count: 20,
    caps_term: `G${grade}`,
    caps_topic: topic,
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
        const skillId = `CA.G${grade}.${tier.code}.A${i + 1}`;
        const meta = topicMeta(grade, tier, skill, skillId, title);
        const authored = SEED[skillId];
        if (authored?.length) {
          const stem = skillId.replace(/^CA\./, "");
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
    subject: "creative-arts-sp",
    description:
      "Creative Arts Senior Phase (Grades 7–9) question bank. One 20-item pool per atomic skill (the topic key IS the skill id). Content subject: 0.6 pass mark, mastery via lib/content-mastery.ts. Tap-only; no free text. Music + Visual Arts only.",
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
