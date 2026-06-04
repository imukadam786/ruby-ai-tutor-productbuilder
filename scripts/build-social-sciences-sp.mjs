// ─── Social Sciences — Senior Phase (Grades 7–9) curriculum generator ─────────
//
// Emits two data files from the CAPS Social Sciences SP curriculum map below:
//   • data/social-sciences-sp-skill-tree.json   (the full 78-skill tree)
//   • data/social-sciences-sp-question-bank.json (one pool per skill; questions
//                                                  authored in a later pass)
//
// Social Sciences SP is one subject made of two disciplines — History and
// Geography — each taught every term. The tree models:
//   level (grade 7/8/9) → tier (one CAPS term-topic) → atomic_skill (sub-topic).
// Eight tiers per grade: History T1–T4 then Geography T1–T4. Topic ids carry the
// discipline (H1–H4 / G1–G4); the atomic skill id IS the bank topic key, e.g.
// "SSSP.G7.H1.A1".
//
// Content-subject rule (shared with Natural Sciences SP / Geography / History):
// no timer, 0.6 pass mark per pool, 20-item target pool, mastery = 75% accuracy
// over 80%-of-pool coverage (capped 20) — see lib/content-mastery.ts.
//
// Re-run any time: node scripts/build-social-sciences-sp.mjs
// It rebuilds the skill tree in full and MERGES into any existing question bank,
// preserving already-authored questions (so re-running never wipes content).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "data");
const TREE_PATH = join(DATA, "social-sciences-sp-skill-tree.json");
const BANK_PATH = join(DATA, "social-sciences-sp-question-bank.json");

// Default tap mechanics per discipline. Map-skills topics add diagram-label.
const HIST_TEMPLATES = ["choice", "true-false", "cloze", "match", "sequence", "sort-buckets", "highlight-source"];
const GEO_TEMPLATES = ["choice", "true-false", "cloze", "match", "data-interpret", "sort-buckets", "sequence"];
const MAP_TEMPLATES = ["choice", "true-false", "cloze", "match", "diagram-label", "data-interpret", "sort-buckets"];

// ─── Curriculum map ───────────────────────────────────────────────────────────
// Each topic: { code, title, term, disc, image?, templates?, skills: [[title, desc, recovery], …] }
// `image: true` flags topics whose map/photo-reading items wait on head-of-ed
// images — the concept items are still authored now.

const G7 = [
  { code: "H1", disc: "History", term: 1, title: "The kingdom of Mali & Timbuktu", skills: [
    ["Trade across the Sahara", "Camel caravans, the goods traded (gold, salt, ivory, enslaved people) and the spread of Islam into West Africa.", "Picture the caravan route: salt comes south, gold goes north."],
    ["The kingdom of Mali", "Mali at its height under Mansa Musa, his pilgrimage to Mecca and the building of the Great Mosque.", "Mansa Musa = Mali's richest king, famous for his hajj to Mecca."],
    ["The city of Timbuktu", "Timbuktu as a trade centre and a centre of learning, the manuscripts, and why it is a World Heritage Site.", "Timbuktu was famous for two things: trade AND books/learning."],
  ]},
  { code: "H2", disc: "History", term: 2, title: "The Transatlantic slave trade", skills: [
    ["West Africa & slavery before Europeans", "What West African societies were like, and the nature of slavery there before the European trade.", "Slavery existed before Europeans, but the Atlantic trade was far larger and harsher."],
    ["Slavery in the American South", "Plantations (cotton, sugar, tobacco, rice), why enslaved labour was used, capture, sale and the Middle Passage.", "Follow the chain: captured in West Africa → Middle Passage → sold → plantation."],
    ["Impact on enslaved people", "Plantation life, slave culture, resistance and rebellion — Nat Turner, the Amistad, the Underground Railroad, Harriet Tubman.", "Resistance ranged from quiet (go-slow) to open revolt and escape."],
    ["Impact on economies", "Gains for America and Britain versus the lasting damage done to West Africa.", "One side grew rich; the other lost people and wealth."],
  ]},
  { code: "H3", disc: "History", term: 3, title: "Colonisation of the Cape (17th–18th C)", skills: [
    ["Indigenous peoples of the Cape", "The Khoikhoi, San and African farmers living at and beyond the Cape before Dutch settlement.", "Khoikhoi = herders, San = hunter-gatherers, African farmers = further east."],
    ["Dutch settlement and the VOC", "Why the VOC set up a refreshment station in 1652, free burghers and French Huguenot immigration.", "The VOC came for a supply stop on the way to the East, not to farm."],
    ["Slavery at the Cape", "Where the enslaved came from, conditions, resistance and the legacy (Islam, the Afrikaans language).", "Cape slaves came mostly from the East and Africa — not the Atlantic trade."],
    ["Expanding frontiers and dispossession", "Trekboers moving inland, land dispossession, and the Genadendal mission station.", "As settlers moved inland, indigenous people lost land and independence."],
  ]},
  { code: "H4", disc: "History", term: 4, title: "Conflict on the Cape frontiers (early 19th C)", skills: [
    ["British arrival and expanding settlement", "The British takeover of the Cape and the growth of European settlement in the early 1800s.", "Power shifted from the Dutch VOC to Britain."],
    ["The eastern frontier", "Frontier wars and Xhosa resistance — Chief Maqoma, Andries Stockenström, 1820 settlers and the Great Trek.", "The eastern frontier = repeated wars between settlers and the Xhosa."],
    ["The northern frontier", "Trade on the northern frontier — the Kora and Griqua, the Tswana towns, and missionaries like Robert Moffat.", "Northern frontier = trade and mission contact, not just war."],
  ]},
  { code: "G1", disc: "Geography", term: 1, title: "Map skills (local maps)", image: true, templates: MAP_TEMPLATES, skills: [
    ["Local and street maps", "Finding places on a local map, and using an index and grid to locate places in a street guide.", "Grid reference: read along the bottom first, then up the side."],
    ["Sketch maps and routes", "Drawing a simple sketch map, showing compass directions and describing a route.", "A good sketch map needs a key, a scale and a north arrow."],
    ["Distance and scale", "Line and word scales, and measuring straight and winding distances on a map.", "Use string for a winding road, a ruler for a straight line, then read the scale."],
    ["Places in the news", "Locating places in the news on a world map using latitude and longitude.", "Latitude = how far north/south; longitude = how far east/west."],
  ]},
  { code: "G2", disc: "Geography", term: 2, title: "Volcanoes, earthquakes & floods", skills: [
    ["Structure of the earth", "The core, mantle and crust, and how the crust moves on tectonic plates.", "Three layers: crust (thin skin), mantle (thick middle), core (hot centre)."],
    ["Volcanoes", "Where volcanoes occur in the world and why they form along plate boundaries.", "Volcanoes line up along the edges of tectonic plates."],
    ["Earthquakes", "Causes and effects of earthquakes, why some communities are at higher risk, and how to reduce the impact.", "Earthquakes happen where plates grind past each other."],
    ["Floods", "Causes of floods (heavy rain, land use), their effects, and how communities prepare and respond.", "Floods worsen when land can't soak up or carry away the water."],
  ]},
  { code: "G3", disc: "Geography", term: 3, title: "Population growth & change", skills: [
    ["Population concepts", "Birth rate, death rate, growth rate, infant mortality and life expectancy.", "Growth rate = births minus deaths (ignoring migration)."],
    ["Factors affecting birth and death rates", "How disease, economic status, beliefs, conflict and government policy change birth and death rates.", "Ask of each factor: does it push births/deaths up or down?"],
    ["World population growth", "Reading the world population graph from 1 AD to today, and what drove the rapid rise.", "Population stayed flat for ages, then shot up with food, medicine and sanitation."],
  ]},
  { code: "G4", disc: "Geography", term: 4, title: "Natural resources & conservation (SA)", skills: [
    ["Natural resources", "Earth's natural resources (water, air, soil, forests, animal and marine life) and their use and abuse.", "A natural resource is something useful we take from nature."],
    ["Management and conservation", "Conservation, conservation areas and marine reserves, community projects and eco-tourism.", "Conservation = using and protecting resources so they last."],
    ["Water in South Africa", "Who uses South Africa's water, its availability, catchment care and wetlands.", "South Africa is a dry country — water is a scarce, shared resource."],
  ]},
];

const G8 = [
  { code: "H1", disc: "History", term: 1, title: "The Industrial Revolution (Britain & southern Africa)", skills: [
    ["Changes during the Industrial Revolution in Britain", "From a farming and cottage-industry economy to factories — urbanisation, working-class life, child labour and trade unions.", "Industrial Revolution = work moves from home/farm to factories and cities."],
    ["Southern Africa by 1860", "Indentured labour brought from India to the sugar plantations of Natal, and why.", "Indenture = a fixed-term work contract, not slavery but very harsh."],
    ["Diamond mining in Kimberley", "The 1867 diamond discovery, the move to deep mining, monopoly and the formation of De Beers.", "Diamonds pulled Britain deeper into controlling South Africa."],
  ]},
  { code: "H2", disc: "History", term: 2, title: "The Mineral Revolution in South Africa", skills: [
    ["Labour control and land expansion", "Closed compounds, migrant labour, and the defeat of African kingdoms (Xhosa, Pedi, Zulu).", "Mines needed cheap, controllable labour — so independence was crushed."],
    ["Deep-level gold mining on the Witwatersrand", "The 1886 gold discovery, mining conditions, the Randlords, migrant labour and the rise of Johannesburg.", "Gold was deep and expensive — it needed big companies and many workers."],
    ["The Mineral Revolution as a turning point", "How mining shifted power: Union 1910, the SANNC (later the ANC) 1912 and the 1913 Land Act.", "Minerals reshaped power, land and labour for the whole 20th century."],
  ]},
  { code: "H3", disc: "History", term: 3, title: "The Scramble for Africa", skills: [
    ["European colonisation of Africa", "The Berlin Conference 1884, the causes of colonisation, and why Europe could colonise Africa so fast.", "Europe carved up Africa on a map — Africans were not consulted."],
    ["Case study: the Ashanti kingdom", "The Ashanti, their contact with Europeans, and the British colonisation of the Gold Coast (Ghana).", "Use the Ashanti as one detailed example of the wider Scramble."],
  ]},
  { code: "H4", disc: "History", term: 4, title: "World War I (1914–1918)", skills: [
    ["Why World War I broke out", "Long-term causes (nationalism, empires, alliances, arms) and the spark at Sarajevo; Allies vs Central Powers.", "Long-term tension + one assassination = war."],
    ["Experiences of World War I", "Trench warfare, conscription and propaganda, and South Africa's part — Delville Wood and the sinking of the Mendi.", "The war was fought in trenches and felt at home through conscription."],
    ["Women in Britain during World War I", "Changing roles of women in the workplace and the campaign for the vote.", "With men at the front, women filled the factories — and demanded the vote."],
    ["The defeat of Germany and the Treaty of Versailles", "Germany's defeat and the punishing terms of the 1919 treaty (picked up again in Grade 9).", "Versailles punished Germany harshly — which mattered later."],
  ]},
  { code: "G1", disc: "Geography", term: 1, title: "Maps & globes", image: true, templates: MAP_TEMPLATES, skills: [
    ["Maps and atlases", "Latitude and longitude in degrees and minutes, the atlas index, and line, word and ratio scales.", "Ratio scale 1:50 000 means 1 cm on the map = 50 000 cm on the ground."],
    ["The globe", "Time zones and the date line, the earth's tilt, and how the earth's revolution makes the seasons.", "Day/night = spin; seasons = tilt + orbit around the sun."],
    ["Satellite images", "What satellite images show — water, vegetation, land use and cloud — and how they are used.", "Satellite images are photos from space, read by colour and pattern."],
  ]},
  { code: "G2", disc: "Geography", term: 2, title: "Climate regions", skills: [
    ["Factors influencing temperature and rainfall", "Latitude, distance from the sea, altitude, ocean currents and mountains.", "Five controls: latitude, sea, height, currents, mountains."],
    ["South Africa's climate", "How those factors shape temperature and rainfall across South African centres.", "Compare coastal vs inland, high vs low, east vs west."],
    ["Climate around the world", "Weather vs climate, the elements of weather, the main climate types and a world climate map.", "Weather = today; climate = the long-run average."],
  ]},
  { code: "G3", disc: "Geography", term: 3, title: "Settlement & urbanisation", image: true, templates: MAP_TEMPLATES, skills: [
    ["Settlement and land use", "Urban land-use zones (CBD, industry, residential) and types of rural settlement.", "A city has zones: business centre, industry, and where people live."],
    ["Land use on aerial photographs", "Reading oblique and vertical aerial photos to identify natural and built features and land use.", "Vertical photo = straight down (like a map); oblique = at an angle."],
    ["Urbanisation", "Why cities grow — push and pull migration — and the social issues of rapid growth in South Africa.", "Push = reasons to leave the country; pull = reasons cities attract people."],
  ]},
  { code: "G4", disc: "Geography", term: 4, title: "Transport & trade", skills: [
    ["Trade and transport around the world", "Why people trade, the link between trade and transport, and the modes (sea, air, road, rail, pipeline).", "Trade needs transport — match the goods to the best mode."],
    ["Trade and transport in South Africa", "South Africa's roads, railways, airports and harbours, with a harbour case study.", "Harbours connect South African exports to the world."],
    ["People and transport in urban areas", "Public and private commuter transport, transport problems and public-transit solutions.", "Think of the daily commute: cost, congestion and pollution."],
  ]},
];

const G9 = [
  { code: "H1", disc: "History", term: 1, title: "World War II (1919–1945)", skills: [
    ["The rise of Nazi Germany", "The Weimar Republic's failure, Hitler and the Nazis, the Depression, the Nuremberg Laws and the fascist state.", "Weak democracy + economic crisis = the opening Hitler used."],
    ["World War II in Europe", "The outbreak of war, the Holocaust and the 'Final Solution', resistance, and the war's end in Europe.", "Two threads: the fighting, and the genocide of the Holocaust."],
    ["World War II in the Pacific", "Pearl Harbour and America's entry, Japanese expansion, and the internment of Japanese Americans.", "Pearl Harbour (1941) pulled the USA into the war against Japan."],
  ]},
  { code: "H2", disc: "History", term: 2, title: "The Nuclear Age & the Cold War", skills: [
    ["Tension after World War II", "Growing distrust between the USSR (communism) and the USA and the West (capitalism).", "Allies in war became rivals in peace: communism vs capitalism."],
    ["Atomic bombs and the Nuclear Age", "How the war ended in the Pacific, why the USA dropped the bombs, and whether it was justified.", "Hiroshima and Nagasaki ended the war and opened the nuclear age."],
    ["The Cold War: areas of conflict", "The arms race, the space race, and the division of Germany and the Berlin Wall.", "'Cold' War = rivalry and proxy contests, not direct superpower fighting."],
    ["The end of the Cold War", "The fall of the Berlin Wall in 1989 and the collapse of the Soviet Union in 1991.", "1989 the Wall falls; 1991 the USSR breaks up."],
  ]},
  { code: "H3", disc: "History", term: 3, title: "Turning points: 1948 & the 1950s", skills: [
    ["Human rights and the myth of race", "The Universal Declaration of Human Rights, human evolution and common ancestry, and why 'race' is not biological.", "Science says 'race' is a social idea, not a biological fact."],
    ["1948: the National Party and apartheid laws", "Segregation before 1948 and the main apartheid laws — Group Areas (Sophiatown) and the Bantustans.", "1948 didn't invent segregation — it made it total law."],
    ["1950s: non-violent resistance", "The Defiance Campaign, the Freedom Charter, the Treason Trial and the Women's March.", "1950s resistance was organised and mostly non-violent."],
  ]},
  { code: "H4", disc: "History", term: 4, title: "Turning points: 1960, 1976 & 1994", skills: [
    ["1960: Sharpeville and Langa", "The formation of the PAC, the Sharpeville massacre and Langa march, and their consequences.", "Sharpeville (1960) turned resistance and repression sharply."],
    ["1976: the Soweto uprising", "Causes, the events of 16 June, the spread of protest and the longer-term consequences.", "16 June 1976: students protest Afrikaans-medium schooling."],
    ["1990–1994: Mandela's release and democracy", "Internal and external pressure, the unbanning of movements, Mandela's release, negotiations and the 1994 election.", "1990 unbanning and release → negotiations → 1994 vote."],
  ]},
  { code: "G1", disc: "Geography", term: 1, title: "Map skills (topographic & orthophoto)", image: true, templates: MAP_TEMPLATES, skills: [
    ["Contour lines", "What contour lines show, reading steep and gentle slopes, and spotting river valleys and spurs.", "Contours close together = steep; far apart = gentle."],
    ["Orthophoto maps", "Vertical aerial photos turned into orthophoto maps and how height is shown on them.", "An orthophoto is a photo corrected to map scale, with contours added."],
    ["Topographic maps", "Reading 1:50 000 map symbols, height clues, contour patterns, scale, distance and coordinates.", "Learn the symbol key first — then everything else reads off it."],
    ["Interpreting maps and photographs", "Cross-referencing maps and photos to describe landscape, land use and settlement patterns.", "Combine sources: the map gives height, the photo gives detail."],
  ]},
  { code: "G2", disc: "Geography", term: 2, title: "Development issues", skills: [
    ["Meaning and measuring development", "Economic, social and environmental development, and measuring it with the Human Development Index.", "HDI blends income, education and life expectancy into one score."],
    ["Factors affecting development", "Why countries differ — history (colonialism), trade, technology, health, education and stability.", "No single cause — development comes from many factors together."],
    ["Opportunities for development", "Fairer trade, alternatives to industrialisation and sustainable development.", "Development should also be fair and sustainable, not just bigger."],
  ]},
  { code: "G3", disc: "Geography", term: 3, title: "Surface forces that shape the earth", skills: [
    ["Weathering", "Physical, chemical and biological weathering, and how people speed it up.", "Weathering breaks rock in place; it doesn't move it (that's erosion)."],
    ["Erosion and deposition", "How rivers, the sea, ice and wind wear away and build up landforms.", "Erosion carries material away; deposition drops it somewhere else."],
    ["People and soil erosion", "How farming, construction and mining cause soil erosion — with a case study.", "Bare, overworked soil washes or blows away fastest."],
  ]},
  { code: "G4", disc: "Geography", term: 4, title: "Resource use & sustainability", skills: [
    ["Resource use", "Renewable and non-renewable resources and the effects of unwise use (over-fishing, over-grazing).", "Renewable can refill if used carefully; non-renewable runs out."],
    ["Sustainable use of resources", "What sustainable use means and the role of consumers, business and government in achieving it.", "Sustainable = meeting today's needs without robbing the future."],
    ["Food resources and food security", "Food security, the role of science and technology in food, and sustainable farming.", "Food security = everyone has enough safe food, reliably."],
  ]},
];

const GRADES = [
  { grade: 7, topics: G7 },
  { grade: 8, topics: G8 },
  { grade: 9, topics: G9 },
];

const DISC_ORDER = { History: 0, Geography: 1 };

// ─── Build the skill tree ─────────────────────────────────────────────────────

function buildTree() {
  const levels = GRADES.map(({ grade, topics }) => {
    const ordered = [...topics].sort(
      (a, b) => DISC_ORDER[a.disc] - DISC_ORDER[b.disc] || a.term - b.term,
    );
    const tiers = ordered.map((topic) => {
      const templates = topic.templates ?? (topic.disc === "History" ? HIST_TEMPLATES : GEO_TEMPLATES);
      const capsTerm = `G${grade} T${topic.term}`;
      const atomic_skills = topic.skills.map(([title, description, recovery], i) => {
        const id = `SSSP.G${grade}.${topic.code}.A${i + 1}`;
        return {
          id,
          bank_skill_id: id,
          title,
          description,
          caps_term: capsTerm,
          caps_topic: topic.title,
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
          ...(topic.image ? { image_dependent: true } : {}),
        };
      });
      return {
        id: `L${grade}.${topic.code}`,
        title: `${topic.disc} · Term ${topic.term}: ${topic.title}`,
        description: `CAPS ${capsTerm} — ${topic.disc}. ${topic.title}.`,
        atomic_skills,
      };
    });
    return {
      id: grade,
      grade,
      title: `Grade ${grade} — Social Sciences`,
      description: `Grade ${grade} History and Geography (CAPS Senior Phase). Four History topics and four Geography topics, one per term.`,
      tiers,
    };
  });

  return {
    version: "1.0",
    subject: "social-sciences-sp",
    description:
      "Social Sciences Senior Phase (Grades 7–9). CAPS-aligned. One subject, two disciplines (History + Geography), each taught every term. All skills open once the grade is selected (gate NONE).",
    grades_covered: [7, 8, 9],
    levels,
  };
}

// ─── Build / merge the question bank ──────────────────────────────────────────

// Authored question pools live in scripts/content/ as ES modules, each default-
// exporting an object keyed by skill id → question array. They are merged in
// here; an empty pool (skill not yet authored) just ships empty until written.
// This keeps the curriculum scaffold (above) and the content (below) separable.
async function loadAuthoredPools() {
  // Modules are loaded in order and CONCATENATED per skill id, so a grade's
  // questions can be split across several files (e.g. sssp-g7.mjs + sssp-g7-b.mjs)
  // without overwriting each other.
  const merged = {};
  const modules = [
    "sssp-g7.mjs", "sssp-g7-b.mjs",
    "sssp-g8.mjs", "sssp-g8-b.mjs",
    "sssp-g9.mjs", "sssp-g9-b.mjs",
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

function topicMeta(grade, topic, skillId, title) {
  const templates = topic.templates ?? (topic.disc === "History" ? HIST_TEMPLATES : GEO_TEMPLATES);
  return {
    title,
    description: `${topic.disc} (CAPS G${grade} T${topic.term}) — ${topic.title}: ${title}.`,
    grade,
    strand: `${topic.disc} · Term ${topic.term}`,
    skill_ids: [skillId],
    gate: "NONE",
    pass_threshold: 0.6,
    questions_for_mastery: 20,
    target_item_count: 20,
    caps_term: `G${grade} T${topic.term}`,
    caps_topic: topic.title,
    templates,
    recovery_strategy: "",
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
  for (const { grade, topics: list } of GRADES) {
    for (const topic of list) {
      topic.skills.forEach(([title, , recovery], i) => {
        const skillId = `SSSP.G${grade}.${topic.code}.A${i + 1}`;
        const meta = topicMeta(grade, topic, skillId, title);
        meta.recovery_strategy = recovery;
        // Authored pool wins; refs are auto-assigned from the skill id so
        // content modules don't have to track them by hand.
        const authored = SEED[skillId];
        if (authored?.length) {
          const stem = skillId.replace(/^SSSP\./, "");
          meta.questions = authored.map((q, qi) => ({
            ref: q.ref ?? `${stem}.${String(qi + 1).padStart(2, "0")}`,
            ...q,
          }));
        } else if (existing[skillId]?.questions?.length) {
          // Preserve a hand-edited pool when no module supersedes it.
          meta.questions = existing[skillId].questions;
        }
        topics[skillId] = meta;
      });
    }
  }

  return {
    version: "1.0",
    subject: "social-sciences-sp",
    description:
      "Social Sciences Senior Phase (Grades 7–9) question bank. One 20-item pool per atomic skill (the topic key IS the skill id). Content subject: 0.6 pass mark, mastery via lib/content-mastery.ts.",
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
