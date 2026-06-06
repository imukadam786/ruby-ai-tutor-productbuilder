// ─── Technology — Senior Phase (Grades 7–9) generator ────────────────────────
//
// Emits two data files from the CAPS Technology SP curriculum map below:
//   • data/technology-sp-skill-tree.json     (the full tree, ~62 skills)
//   • data/technology-sp-question-bank.json   (one pool per skill; questions
//                                               authored in a later pass)
//
// CAPS Technology has four core content areas done EVERY grade — Structures,
// Mechanical Systems & Control, Electrical/Electronic Systems & Control, and
// Processing — plus two threads woven through them all: the Design Process &
// graphics, and Technology-Society-Environment (impact, bias, indigenous tech).
// The tree models those as five tiers per grade:
//   level (grade 7/8/9) → tier (a strand) → atomic_skill (= one 20-item pool).
// Tiers are ordered DG → ST → MS → ES → PR. The atomic skill id IS the bank
// topic key, e.g. "TECH.G7.MS.A1".
//
// This is a content subject — the practical/making CAPS work is reframed into
// tap-only KNOWLEDGE questions (identify the lever class, read the symbol, pick
// the gear ratio, order the build steps, judge a design). No free text.
//
// Content-subject rule (shared with Natural Sciences SP / Social Sciences SP /
// EMS SP): no timer, 0.6 pass mark per pool, 20-item target pool, mastery =
// 75% accuracy over 80%-of-pool coverage (capped 20) — see lib/content-mastery.ts.
//
// One authoring flag carried onto skills:
//   • image: true → a drawing-heavy skill whose fullest treatment needs a
//                   head-of-ed diagram (orthographic/isometric projection,
//                   reading trusses/circuits). Text-answerable items are still
//                   authored now; image-only questions are HELD (logged in
//                   TECHNOLOGY_SP_IMAGE_MANIFEST.md). Such pools may be < 20.
//
// Re-run any time: node scripts/build-technology-sp.mjs
// Rebuilds the skill tree in full and MERGES into any existing question bank,
// preserving already-authored questions (so re-running never wipes content).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "data");
const TREE_PATH = join(DATA, "technology-sp-skill-tree.json");
const BANK_PATH = join(DATA, "technology-sp-question-bank.json");

// Default tap mechanics per strand. Calculation-heavy strands add data-interpret.
const BASE = ["choice", "true-false", "cloze", "sequence", "sort-buckets"];
const CALC = ["choice", "true-false", "cloze", "sequence", "sort-buckets", "data-interpret"];

const STRAND_LABEL = {
  DG: "Design Process & Graphics",
  ST: "Structures",
  MS: "Mechanical Systems & Control",
  ES: "Electrical Systems & Control",
  PR: "Processing, Society & Environment",
};
// Fixed tier order within every grade.
const STRAND_ORDER = { DG: 0, ST: 1, MS: 2, ES: 3, PR: 4 };
const STRAND_TEMPLATES = { DG: BASE, ST: BASE, MS: CALC, ES: CALC, PR: BASE };

// ─── Curriculum map ───────────────────────────────────────────────────────────
// Each tier: { code, term, title, templates?, skills: [[title, desc, recovery, opts?], …] }
// opts (optional 4th element): { image: true }

const G7 = [
  { code: "DG", term: 1, title: "Design process & graphics", skills: [
    ["What is Technology?", "What Technology means, its scope, and the careers in the world of work that use it.", "Technology means using knowledge, skills and resources to solve people's real problems."],
    ["The design process (IDMEC)", "The five stages of the design process: Investigate, Design, Make, Evaluate and Communicate.", "The design process: Investigate, Design, Make, Evaluate, Communicate."],
    ["Design considerations & fitness-for-purpose", "Judging a design by who it is for, whether it works, cost, safety, ergonomics and looks.", "Fit-for-purpose asks: who is it for, will it do the job, is it safe, does it look good?"],
    ["Graphical communication & line types", "The purpose of drawings and the line conventions: outlines, construction lines, hidden detail, scale and dimensioning.", "Drawings use different lines: dark outlines, feint construction lines and dashed hidden detail."],
    ["Drawing techniques: sketch, oblique, perspective", "Free-hand sketching, 2D working drawings of one face, 3D oblique at 45°, and single-vanishing-point perspective.", "Sketches, flat working drawings and 3D drawings each show an object a different way.", { image: true }],
  ]},
  { code: "ST", term: 2, title: "Structures", skills: [
    ["Purpose & classification of structures", "What structures do (contain, support, protect, span) and natural versus man-made structures.", "A structure contains, supports, protects or spans; it can be natural or man-made."],
    ["Types of structures: shell, frame, solid", "The three types of structures — shell, frame and solid — with everyday examples.", "Three structure types: shell (hollow), frame (bars joined) and solid (one mass)."],
    ["Stiffening & reinforcing", "Making materials and structures stiffer by tubing, folding and triangulation.", "You can stiffen materials by folding, rolling into tubes, or triangulating a frame."],
    ["Frame structures & stability", "Frame structures (towers, pylons) and what makes a structure stable — base size and centre of gravity.", "A wide base and a low centre of gravity make a structure stable and hard to topple."],
  ]},
  { code: "MS", term: 1, title: "Mechanical systems & control", skills: [
    ["Levers & mechanical advantage", "First-, second- and third-class levers, and how the pivot position gives a mechanical advantage.", "A lever's class depends on where the fulcrum, load and effort are placed."],
    ["Linkages in tools", "Linked levers in everyday tools — scissors, pliers, punches, staplers, tweezers.", "Linked levers join two levers so they work together, like the blades of scissors."],
    ["Pneumatics & hydraulics", "Transferring force through air (pneumatic) and liquid (hydraulic) systems using syringes.", "Pneumatics use air; hydraulics use liquid; both push force along a tube."],
    ["Cranks & pulleys", "The crank as an adapted second-class lever, and the pulley as a wheel and axle.", "A crank turns round motion into back-and-forth; a pulley is a wheel turning on an axle."],
  ]},
  { code: "ES", term: 3, title: "Electrical systems & control", skills: [
    ["Magnetism & magnetic materials", "Permanent magnets (bar, horseshoe) and which materials a magnet attracts.", "Magnets attract some metals (iron, steel, nickel) but not non-metals or copper and aluminium."],
    ["Simple electric circuits & symbols", "A simple circuit with a cell, switch, conductor and an output, drawn with correct symbols.", "A circuit needs a power source, a conductor, a switch and an output like a bulb or buzzer."],
    ["Electromagnets", "Making an electromagnet by coiling insulated wire around an iron core, and switching it on and off.", "An electromagnet is wire coiled around an iron core; it is magnetic only while current flows."],
  ]},
  { code: "PR", term: 4, title: "Processing, society & environment", skills: [
    ["Processing food", "Processing food into useful, nutritious meals and the sequence of preparing a food item.", "Processing changes raw ingredients into a useful product, like turning flour into bread."],
    ["Materials & textiles", "Properties of materials and textiles, including waterproofing and burning characteristics.", "Different materials and textiles suit different jobs because of their properties."],
    ["Indigenous technology", "Materials and building techniques used by indigenous people — local, appropriate, environmentally friendly.", "Indigenous builders use local materials that are appropriate and kind to the environment."],
    ["Impact & bias in technology", "How technology affects society and the environment, recycling, and bias for or against groups.", "Technology can help or harm people and the environment, and can favour some groups over others."],
  ]},
];

const G8 = [
  { code: "DG", term: 1, title: "Graphics & drawing", skills: [
    ["Graphics conventions", "Drawing conventions — centre lines (chain dash-dot), scaling up and down, dimensioning in mm.", "Conventions like centre lines, scaling and dimensions in mm keep drawings clear and standard.", { image: true }],
    ["Isometric & two-point perspective", "Isometric drawing on a 30° grid and double-vanishing-point perspective with colour and shading.", "Isometric uses a slanted grid; two-point perspective uses two vanishing points for realism.", { image: true }],
    ["Developments (nets)", "Drawing the development (net) of an opened container that folds up into a 3D shape.", "A development (net) is the flat shape that folds up into a box or container."],
  ]},
  { code: "ST", term: 1, title: "Structures", skills: [
    ["Frame members & roof trusses", "Structural members of wood and steel roof trusses — king/queen post, strut, tie, rafter, tie beam.", "A roof truss is built from struts, ties, rafters and posts, each doing a job.", { image: true }],
    ["Forces acting on members", "The forces that act on structural members — tension, compression, shear, torsion and bending.", "Five forces act on materials: tension (pull), compression (push), shear, torsion (twist) and bending."],
    ["Structures that span space", "Ways of spanning a gap — beams and girders, suspension and cable-stayed bridges, arches and cantilevers.", "Beams, arches, cantilevers and bridges each span a gap in a different way."],
    ["Structural failure", "The three main ways structures fail — fracture (strength), bending (stiffness) and toppling (stability).", "Structures fail by fracturing (too weak), bending (not stiff) or toppling (not stable)."],
  ]},
  { code: "MS", term: 3, title: "Mechanical systems & control", skills: [
    ["Simple mechanisms: wedge, wheel & axle", "Simple machines — the wedge (inclined plane, blade) and the wheel and axle.", "A wedge and a wheel-and-axle are simple machines that make work easier."],
    ["Gears: counter-rotation & idlers", "How two meshed spur gears counter-rotate, and how an idler gear synchronises rotation.", "Meshed gears turn opposite ways; an idler gear between them makes them turn the same way."],
    ["Gear ratios: velocity & force", "Gear ratios — how different gear sizes trade speed for force (velocity ratio and force ratio).", "A small gear driving a big one cuts speed but increases force; the opposite raises speed."],
    ["Cams & cranks", "Mechanisms that change the direction of movement — the cam and the crank turn rotary into reciprocating motion.", "A cam and a crank both change round motion into up-and-down (reciprocating) motion."],
    ["Mechanical advantage calculations", "Calculating mechanical advantage for levers and gears using ratios (load/effort, tooth ratios) — no moments.", "Mechanical advantage = load ÷ effort, worked out with simple ratios."],
    ["Systems diagrams", "Analysing a mechanical system as input → process → output, e.g. a bicycle gear system.", "Every system has an input, a process and an output."],
  ]},
  { code: "ES", term: 4, title: "Electrical systems & control", skills: [
    ["Circuit components & symbols", "Circuit components grouped as input, output and control devices, with their correct symbols.", "Devices are input (cell), output (lamp, buzzer, motor) or control (switch)."],
    ["Cells & energy sources", "Electrochemical cells, series versus parallel batteries, and solar (photovoltaic) cells.", "Cells store energy; series batteries give more voltage, parallel ones last longer."],
    ["Generating electricity for the nation", "Generating electricity — thermal, hydroelectric and wind — and the national grid with transformers.", "Power stations (coal, water, wind) feed the national grid through step-up and step-down transformers."],
    ["Ohm's law (qualitative) & logic gates", "Ohm's law qualitatively (more cells, more current) and AND/OR logic gates with truth tables.", "More cells means more current; AND and OR logic gates decide when a circuit switches on."],
  ]},
  { code: "PR", term: 2, title: "Processing, society & environment", skills: [
    ["Materials & the environment", "How new and improved materials replace natural ones, and biodegradable materials.", "New materials can replace natural ones; biodegradable materials break down safely."],
    ["Recycling & packaging design", "Recycling paper and cardboard, and designing packaging suited to a product.", "Packaging protects a product; paper and plastic can be recycled into new products."],
    ["Impact of technology", "The positive and negative impacts of technology and ways to counteract the negative effects.", "Technology has good and bad impacts; we can design to reduce the harm."],
    ["Mining impact, indigenous mining & bias", "The environmental impact of mining, indigenous iron-age mining, and bias such as gender bias.", "Mining brings wealth but harms the environment, and technology can carry bias against groups."],
  ]},
];

const G9 = [
  { code: "DG", term: 1, title: "Graphics & drawing", skills: [
    ["First-angle orthographic projection", "Showing a 3D object as three flat views — front, top and side — in first-angle orthographic projection.", "Orthographic projection shows an object as three flat views: front, top and side.", { image: true }],
    ["Working drawings & design problems", "Drawing a working plan that actually solves a problem (e.g. a stair and ramp), to scale with dimensions.", "A working drawing must really solve the problem — neat is not enough if it won't work.", { image: true }],
    ["Artistic & exploded assembly drawing", "Artistic single-VP perspective for realism and exploded assembly views showing how parts fit.", "An exploded view shows the parts pulled apart to reveal how they fit together.", { image: true }],
  ]},
  { code: "ST", term: 1, title: "Structures", skills: [
    ["Forces: static, dynamic & loads", "Static and dynamic forces, even and uneven loads, and how members resist tension, compression and torsion.", "Forces can be static (still) or dynamic (moving); loads can be even or uneven."],
    ["Strength of materials & cross-sections", "How a material's cross-section (I-beam, angle iron, tube) helps it resist forces and save material.", "A material's cross-section, like an I-beam, helps it resist bending without extra weight."],
    ["Properties of construction materials", "Properties of construction materials — density, hardness, stiffness, flexibility and corrosion resistance.", "Materials differ in density, hardness, stiffness, flexibility and how much they corrode."],
    ["Costing & the tender process", "Costing a real solution (materials and labour) and the tender process, including ethics.", "A tender is a priced offer to do a job; costing includes both materials and labour."],
  ]},
  { code: "MS", term: 2, title: "Mechanical systems & control", skills: [
    ["Hydraulics & Pascal's principle", "Pascal's principle, compressible versus incompressible fluids, and the hydraulic press and jack.", "Pascal's principle: pressure spreads equally through a liquid; cylinder sizes change the force."],
    ["Pulleys & mechanical control devices", "Fixed and moveable pulleys, block and tackle, and control devices — ratchet and pawl, brakes, cleat.", "Moveable pulleys and block-and-tackle multiply force; ratchets and brakes control motion."],
    ["Advanced gears", "Bevel gears, rack-and-pinion and worm gear systems and what each is used for.", "Bevel gears turn a corner; rack-and-pinion gives straight motion; a worm gear slows speed a lot."],
    ["Integrated systems", "Machines that combine at least two of mechanical, electrical and hydraulic/pneumatic sub-systems.", "Real machines often combine mechanical, electrical and hydraulic or pneumatic systems."],
  ]},
  { code: "ES", term: 3, title: "Electrical & electronic systems", skills: [
    ["Ohm's law (quantitative)", "Ohm's law as V = I × R, and calculating resistance, voltage or current from the other two.", "Ohm's law: V = I × R, so any one value can be found from the other two."],
    ["Resistor colour codes", "Reading the value of a resistor from its coloured bands and the tolerance band.", "Coloured bands on a resistor give its value in ohms, with the last band a tolerance."],
    ["Electronic components", "Diodes, LEDs, NPN transistors (switch and amplifier) and capacitors and what each does.", "A diode lets current flow one way; a transistor switches or amplifies; a capacitor stores charge."],
    ["Sensors", "Sensors as input devices — LDR (light), thermistor (heat) and touch/moisture detectors.", "Sensors change their resistance with light (LDR), heat (thermistor) or moisture."],
    ["Switches & circuit logic", "Manual switches (push, SPST, SPDT, DPDT) and series (AND) versus parallel (OR) circuit logic.", "Switches in series make AND logic; switches in parallel make OR logic."],
    ["Simple electronic circuits", "Recognising simple electronic circuits that combine an LED, resistor, sensor, transistor or capacitor.", "Electronic circuits combine components like an LED, resistor and sensor to do a job."],
  ]},
  { code: "PR", term: 4, title: "Processing", skills: [
    ["Preserving metals", "Protecting metals from corrosion by painting, galvanising and electroplating.", "Metals are protected from rusting by painting, galvanising (zinc) or electroplating."],
    ["Preserving food", "Preserving food by storing grain, pickling, and drying and/or salting.", "Food is preserved by storing it dry, pickling it, or drying and salting it."],
    ["Plastics: types & properties", "Types of plastics, their identification codes and properties, and thermoplastics versus thermosets.", "Thermoplastics soften when heated and can be remoulded; thermosets stay hard."],
    ["Recycling plastics", "Reduce-reuse-recycle, remanufacturing waste plastic into pellets, and a plastics recycling system.", "Reduce, reuse, recycle: waste plastic can be remade into pellets and then new products."],
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
      const templates = tier.templates ?? STRAND_TEMPLATES[tier.code];
      const capsTerm = `G${grade} T${tier.term}`;
      const atomic_skills = tier.skills.map(([title, description, recovery, opts], i) => {
        const id = `TECH.G${grade}.${tier.code}.A${i + 1}`;
        return {
          id,
          bank_skill_id: id,
          title,
          description,
          caps_term: capsTerm,
          caps_strand: strandLabel,
          caps_topic: tier.title,
          prerequisites: [],
          templates,
          error_signatures: [
            {
              type: "misconception",
              description: `A common misunderstanding when learning "${title}".`,
              example: "Authoring note: replace with the specific misconception once items are written.",
            },
          ],
          recovery_strategy: recovery,
          mastery_criteria: { correct_required: 15, formats_required: 2, allow_scaffolding: false },
          ...(opts?.image ? { image_dependent: true } : {}),
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
      title: `Grade ${grade} — Technology`,
      description: `Grade ${grade} Technology (CAPS Senior Phase). Four content strands — Structures, Mechanical Systems, Electrical Systems and Processing — plus the Design Process and graphics, taught across the year.`,
      tiers: builtTiers,
    };
  });

  return {
    version: "1.0",
    subject: "technology-sp",
    description:
      "Technology Senior Phase (Grades 7–9). CAPS-aligned. Four content strands done every grade (Structures, Mechanical Systems & Control, Electrical Systems & Control, Processing) plus the Design Process & graphics. All skills open once the grade is selected (gate NONE). Practical/making work is reframed into tap-only knowledge questions. Drawing-heavy skills flagged image_dependent carry held image-only questions until art exists.",
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
    "tech-g7.mjs", "tech-g7-b.mjs",
    "tech-g8.mjs", "tech-g8-b.mjs",
    "tech-g9.mjs", "tech-g9-b.mjs",
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
  const templates = tier.templates ?? STRAND_TEMPLATES[tier.code];
  const opts = skill[3];
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
    templates,
    recovery_strategy: skill[2] ?? "",
    ...(opts?.image ? { image_dependent: true } : {}),
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
        const skillId = `TECH.G${grade}.${tier.code}.A${i + 1}`;
        const meta = topicMeta(grade, tier, skill, skillId, title);
        const authored = SEED[skillId];
        if (authored?.length) {
          const stem = skillId.replace(/^TECH\./, "");
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
    subject: "technology-sp",
    description:
      "Technology Senior Phase (Grades 7–9) question bank. One 20-item pool per atomic skill (the topic key IS the skill id). Content subject: 0.6 pass mark, mastery via lib/content-mastery.ts. Tap-only; no free text.",
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
const imageDep = Object.values(bank.topics).filter((t) => t.image_dependent).length;
const authored = Object.values(bank.topics).filter((t) => t.questions.length > 0).length;
console.log(`skill-tree: ${tree.levels.length} grades, ${skillCount} skills`);
console.log(`bank: ${Object.keys(bank.topics).length} pools (${imageDep} image-dependent), ${authored} with questions`);
