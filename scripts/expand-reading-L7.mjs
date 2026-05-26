// Expands the Grade 5 (L7) reading bank so every skill has >=15 authored items.
// New items continue each skill's existing id prefix. Rubric "checks" and
// errorSignals reuse each skill's established grading shape (the writing/oral
// skills grade on generic NLP metrics, so only the prompt changes); the
// comprehension skills get genuine new passages with tailored references/checks.
//
//   node scripts/expand-reading-L7.mjs
import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "data/reading-question-banks/L7.json");
const bank = JSON.parse(fs.readFileSync(FILE, "utf8"));

// ── reusable check sets (identical across items within a writing/oral skill) ──
const C1_CHECKS = [
  { id: "CHECK_1", description: "Topic sentence present — first sentence has keyword overlap >=40% with paragraph body." },
  { id: "CHECK_2", description: ">=2 distinct supporting sentences each with detail novelty >=0.22." },
  { id: "CHECK_3", description: "No paragraph bleed (paragraph bleed score <0.50)." },
  { id: "CHECK_4", description: "Sentence cohesion >=0.40 across consecutive sentences." },
];
const C2_CHECKS = [
  { id: "CHECK_1", description: "Topic sentence breadth >=0.40." },
  { id: "CHECK_2", description: ">=2 distinct supporting details with novelty >=0.22 each." },
  { id: "CHECK_3", description: "Topic sentence appears first — not inverted structure." },
];
const C3_CHECKS = [
  { id: "CHECK_1", description: "Opinion signal phrase present." },
  { id: "CHECK_2", description: ">=2 reason clauses each with a connector." },
  { id: "CHECK_3", description: "Reason distinctness — cross-reason similarity <0.72." },
  { id: "CHECK_4", description: "No reason contradicts the stated opinion." },
];
const C4_CHECKS = [
  { id: "CHECK_1", description: "Transition word at start of >=60% of non-opening paragraphs." },
  { id: "CHECK_2", description: "Transition function matches paragraph relationship >=60%." },
  { id: "CHECK_3", description: "No transition word repeated in consecutive paragraphs." },
];
const D1_CHECKS = [
  { id: "CHECK_1", description: "Opinion signal phrase present." },
  { id: "CHECK_2", description: ">=2 reason clauses each with a connector." },
  { id: "CHECK_3", description: "Reason distinctness — cross-reason similarity <0.72." },
  { id: "CHECK_4", description: ">=3 clauses total." },
];
const D2_CHECKS = [
  { id: "CHECK_1", description: "Relevant to the question's context." },
  { id: "CHECK_2", description: "States a position with >=1 reason. May agree or disagree." },
  { id: "CHECK_3", description: ">=2 clauses." },
];
const band = () => ({ green: 0.6, amber: 0.4 });

// ── new items per skill (without ids — assigned below) ──
const NEW = {
  // ───────────────────────── A1 Skim (similarity-band) ─────────────────────────
  "L7.A1": [
    ["The Busy World of Honeybees", "[HEADING] The Busy World of Honeybees [First sentence] Honeybees live together in large colonies and work as a team to collect food and care for their young. [SUBHEADING] Life Inside the Hive [First sentence] Each hive has one queen, thousands of female worker bees, and male bees called drones, and every bee has its own job. [SUBHEADING] Why Bees Matter to Us [First sentence] As bees move from flower to flower they spread pollen, which helps plants make the fruits and seeds that people and animals eat.", "Honeybees live and work together in colonies, and they matter to us because they pollinate the plants we rely on for food."],
    ["Climbing the World's Highest Mountain", "[HEADING] Climbing the World's Highest Mountain [First sentence] Mount Everest, on the border of Nepal and China, is the highest mountain on Earth at about 8 849 metres above sea level. [SUBHEADING] Dangers on the Mountain [First sentence] Climbers face freezing temperatures, thin air with little oxygen, and sudden storms near the summit. [SUBHEADING] The People Who Help [First sentence] Local Sherpa guides carry equipment and lead climbers, using their deep knowledge of the mountain to keep expeditions safe.", "Mount Everest is the world's highest and most dangerous mountain to climb, and Sherpa guides help climbers reach the top safely."],
    ["The Amazon Rainforest", "[HEADING] The Amazon Rainforest [First sentence] The Amazon is the largest tropical rainforest on Earth, stretching across nine countries in South America. [SUBHEADING] A Home for Wildlife [First sentence] Millions of species of insects, plants, birds, and mammals live in the Amazon, many found nowhere else in the world. [SUBHEADING] The Forest Under Threat [First sentence] Large areas of the rainforest are cut down each year for farming and timber, which harms wildlife and adds to climate change.", "The Amazon is the world's largest rainforest and home to a huge variety of wildlife, but it is under threat from deforestation."],
    ["Why We Recycle", "[HEADING] Why We Recycle [First sentence] Recycling means turning used materials like paper, glass, and plastic into new products instead of throwing them away. [SUBHEADING] How Recycling Works [First sentence] Used materials are collected, sorted, cleaned, and then broken down so they can be made into something new. [SUBHEADING] The Benefits for the Planet [First sentence] Recycling saves natural resources, uses less energy, and reduces the rubbish sent to landfill sites.", "Recycling turns used materials into new products, which saves resources and energy and reduces waste."],
    ["The Human Heart", "[HEADING] The Human Heart [First sentence] The heart is a muscular organ about the size of your fist that pumps blood around your body every second of your life. [SUBHEADING] How the Heart Works [First sentence] The heart has four chambers that squeeze in a steady rhythm to push blood through a network of blood vessels. [SUBHEADING] Keeping Your Heart Healthy [First sentence] Regular exercise, a balanced diet, and avoiding smoking all help keep the heart strong and working well.", "The heart is a muscle that pumps blood around the body, and healthy habits like exercise and good food keep it strong."],
    ["Volcanoes", "[HEADING] Volcanoes [First sentence] A volcano is an opening in the Earth's surface through which melted rock, ash, and gases can escape from deep underground. [SUBHEADING] What Causes an Eruption [First sentence] Pressure builds up beneath the surface until molten rock called magma is forced upwards and bursts out as lava. [SUBHEADING] Living Near Volcanoes [First sentence] Although eruptions can be dangerous, many people live near volcanoes because the soil around them is very fertile for farming.", "Volcanoes let molten rock and gas escape from inside the Earth, and although they can be dangerous, people live near them for the fertile soil."],
    ["The History of the Bicycle", "[HEADING] The History of the Bicycle [First sentence] The bicycle has changed a great deal since the first wooden version was invented in the early 1800s. [SUBHEADING] Early Designs [First sentence] The earliest bicycles had no pedals and were pushed along the ground with the rider's feet. [SUBHEADING] The Modern Bicycle [First sentence] Today's bicycles have chains, gears, and air-filled tyres that make them faster, safer, and more comfortable to ride.", "The bicycle has developed from a simple pedal-less wooden machine in the 1800s into the fast, comfortable bicycle we use today."],
  ].map(([title, passage, reference]) => ({
    errorSignals: ["TOPIC_TOO_NARROW", "VERBATIM_COPY", "OVER_READING"],
    randomisable: true, context: "B", title, passage,
    answerKey: { mode: "similarity-band", reference, bands: band(), copyRejectAt: 0.6 },
  })),

  // ───────────────────────── A2 Scan (similarity-band) ─────────────────────────
  "L7.A2": [
    ["The Great Wall of China is one of the most famous structures in the world. It was built over many centuries by different Chinese dynasties to protect the country from invaders. The full length of all its sections is about 21 000 kilometres. Construction began more than 2 000 years ago, and millions of workers were involved over time.", "How long is the Great Wall of China in total?", "About 21 000 kilometres"],
    ["Nelson Mandela was one of South Africa's most respected leaders. He spent 27 years in prison for opposing the unjust system of apartheid. After his release in 1990, he worked to bring peace to the country. In 1994, he became South Africa's first democratically elected president.", "In which year did Nelson Mandela become president of South Africa?", "1994"],
    ["The Sun is the star at the centre of our solar system. It is about 150 million kilometres away from Earth. Light from the Sun takes around eight minutes to reach us. The Sun is so large that more than one million Earths could fit inside it.", "How long does light from the Sun take to reach Earth?", "About eight minutes"],
    ["The cheetah is the fastest land animal on Earth. It can reach speeds of up to 110 kilometres per hour in short bursts while chasing prey. However, it can keep up this speed for only about 30 seconds before it needs to rest. Cheetahs live mainly in the grasslands of Africa.", "What is the cheetah's top speed?", "Up to 110 kilometres per hour"],
    ["The modern Olympic Games were first held in Athens, Greece, in 1896. The Games take place every four years and bring together athletes from around the world. The five rings on the Olympic flag represent the five continents that take part.", "In which city were the first modern Olympic Games held?", "Athens"],
  ].map(([passage, question, reference]) => ({
    errorSignals: ["WRONG_DETAIL", "SLOW_SCAN", "MULTIPLE_ANSWERS"],
    randomisable: true, context: "B", passage, question,
    answerKey: { mode: "similarity-band", reference, bands: band(), copyRejectAt: 0.6 },
  })),

  // ───────────────────────── A3 Purpose (rubric) ─────────────────────────
  "L7.A3": [
    ["A", "Our school produces bags and bags of waste every single day, and most of it could be recycled. By placing recycling bins in every classroom, we could cut our waste in half and teach everyone good habits at the same time. It is a simple change that costs almost nothing. If we truly care about our planet, we cannot keep ignoring this problem. Let's make our school a recycling school — starting today.", "PERSUADE", "Uses strong opinion language ('we cannot keep ignoring'), a direct call to action ('Let's make our school...'), and an emotional appeal to caring about the planet."],
    ["B", "Rain forms through a process that begins when the sun heats water in oceans, rivers, and lakes. The warm water turns into an invisible gas called water vapour and rises into the sky. As the vapour cools high in the air, it turns back into tiny droplets that join to form clouds. When the droplets grow heavy enough, they fall to the ground as rain. This continuous movement of water is called the water cycle.", "INFORM", "Explains a process step by step using factual language and scientific terms (water vapour, water cycle) without giving an opinion."],
    ["A", "Biscuit the dog had one rule in life: every shoe in the house belonged to him. It did not matter whose foot it fitted. The moment a shoe was left unguarded, Biscuit would carry it proudly to his secret pile behind the sofa. One morning, Dad hopped around the kitchen wearing one shoe and one slipper, muttering about 'that thieving hound', while Biscuit watched calmly from the doorway, looking deeply innocent and just a little pleased with himself.", "ENTERTAIN", "Tells an amusing story with a mischievous animal character, funny details (one shoe and one slipper), and a humorous ending."],
    ["B", "Penguins are flightless birds that live mostly in the southern half of the world. Although they cannot fly, they are excellent swimmers and use their wings like flippers to move quickly through the water. Penguins have a thick layer of fat and tightly packed feathers that keep them warm in freezing conditions. They feed on fish, squid, and small sea creatures called krill.", "INFORM", "Gives factual information about penguins' features and behaviour using a neutral, explaining tone."],
    ["A", "Reading is one of the best things you can do for yourself, yet too many of us spend hours scrolling on screens instead. A good book can take you to another world, teach you something new, and improve your writing without you even noticing. Just twenty minutes a day can make a real difference. Put down your phone, pick up a book, and discover what you have been missing.", "PERSUADE", "Uses persuasive techniques: a strong opinion, direct address to the reader, and a clear call to action ('Put down your phone, pick up a book')."],
  ].map(([context, passage, purpose, reason]) => ({
    errorSignals: ["WRONG_PURPOSE", "PURPOSE_WITHOUT_REASON", "GENERIC_REASON"],
    randomisable: true, context, passage,
    answerKey: { mode: "rubric", checks: [
      { id: "PURPOSE", description: `Correctly identifies the purpose as ${purpose} (choices: INFORM, PERSUADE, ENTERTAIN).` },
      { id: "REASON", description: `Gives a valid text-based reason. Model reason: ${reason}` },
    ], passFraction: 0.6 },
  })),

  // ───────────────────────── B1 Text features (rubric) ─────────────────────────
  "L7.B1": [
    ["Renewable Energy", "[HEADING] Power from Nature [PARA] Renewable energy comes from sources that never run out, such as sunlight, wind, and moving water, and countries are turning to it to reduce pollution. [SUBHEADING] Solar Power [PARA] Solar panels capture energy from the sun and turn it into [BOLD]electricity[/BOLD] that can power homes and schools. [SIDEBAR] In 2022, renewable sources produced almost 30% of the world's electricity. [SUBHEADING] Wind Power [PARA] Tall wind turbines use the force of the wind to spin blades that generate power, even in remote areas.", "renewable energy", "the two types of renewable energy", "a key technical term the reader should notice", "a real-world fact that supports the main text from outside the main flow"],
    ["Sharks", "[HEADING] Sharks: Rulers of the Ocean [PARA] Sharks have lived in the world's oceans for more than 400 million years, long before the dinosaurs. [SUBHEADING] Built to Hunt [PARA] A shark's body is streamlined for speed, and its rows of sharp [BOLD]teeth[/BOLD] are replaced throughout its life. [SIDEBAR] Most of the 500 shark species are harmless to humans, and attacks are extremely rare. [SUBHEADING] Sharks in Danger [PARA] Millions of sharks are caught each year, and several species are now at risk of disappearing.", "the topic of the whole text", "different aspects of sharks", "an important feature word the reader should notice", "a surprising fact set apart from the main text"],
    ["The Ancient Egyptians", "[HEADING] Life in Ancient Egypt [PARA] The ancient Egyptians built one of the longest-lasting civilisations in history along the River Nile. [SUBHEADING] The Importance of the Nile [PARA] Each year the Nile flooded and left behind rich [BOLD]silt[/BOLD] that made the soil perfect for farming. [SUBHEADING] Pyramids and Pharaohs [PARA] Kings called pharaohs ruled Egypt, and huge stone pyramids were built as their tombs. [SIDEBAR] The Great Pyramid of Giza took around 20 years to build.", "the main topic of the text", "two separate aspects of Egyptian life", "a special term the reader should notice", "an extra fact placed outside the main text"],
    ["Healthy Eating", "[HEADING] Eating for a Healthy Body [PARA] The food we eat gives our bodies the energy and nutrients they need to grow and stay healthy. [SUBHEADING] A Balanced Diet [PARA] A balanced diet includes fruit, vegetables, grains, and protein, with only small amounts of [BOLD]sugar[/BOLD]. [SIDEBAR] Health experts recommend at least five portions of fruit and vegetables every day. [SUBHEADING] Drinking Water [PARA] Water keeps the body working properly, and children should drink it regularly throughout the day.", "the subject of the whole text", "different parts of healthy eating", "a word the reader should pay attention to", "a recommendation that supports the main text from the side"],
    ["The Internet", "[HEADING] How the Internet Connects Us [PARA] The internet is a giant network that links billions of computers and devices around the world. [SUBHEADING] How It Works [PARA] Information travels as tiny pieces of [BOLD]data[/BOLD] that move between devices in fractions of a second. [SUBHEADING] Staying Safe Online [PARA] Users should protect their passwords and be careful about what they share. [SIDEBAR] More than five billion people now use the internet worldwide.", "the topic of the text", "two different aspects of the internet", "a key term the reader should notice", "a statistic placed outside the main text"],
    ["Earthquakes", "[HEADING] When the Ground Shakes [PARA] An earthquake is a sudden shaking of the ground caused by movement deep inside the Earth. [SUBHEADING] What Causes Earthquakes [PARA] The Earth's outer layer is cracked into huge pieces called [BOLD]tectonic plates[/BOLD] that slowly move and sometimes slip. [SIDEBAR] Scientists use a tool called a seismometer to measure how strong an earthquake is. [SUBHEADING] Staying Safe [PARA] During an earthquake, people are advised to take cover under sturdy furniture and stay away from windows.", "the main idea of the text", "different aspects of earthquakes", "a scientific term the reader should notice", "an extra piece of information from outside the main flow"],
    ["Migratory Birds", "[HEADING] The Great Journeys of Birds [PARA] Many birds travel thousands of kilometres each year in a journey called migration. [SUBHEADING] Why Birds Migrate [PARA] Birds migrate to find food and warmer weather when the [BOLD]seasons[/BOLD] change. [SUBHEADING] Finding the Way [PARA] Birds use the sun, the stars, and the Earth's magnetic field to navigate. [SIDEBAR] The Arctic tern makes the longest migration of any animal, flying from pole to pole each year.", "the topic of the whole text", "two different aspects of bird migration", "an important word the reader should notice", "a record-breaking example placed beside the main text"],
    ["Deserts of the World", "[HEADING] Life in the Desert [PARA] Deserts are some of the driest places on Earth, receiving very little rain each year. [SUBHEADING] A Harsh Climate [PARA] Deserts can be scorching by day and freezing by night because there are few clouds to trap [BOLD]heat[/BOLD]. [SIDEBAR] The Sahara in Africa is the largest hot desert in the world. [SUBHEADING] Surviving the Desert [PARA] Desert plants and animals have special features, such as storing water, that help them survive with very little moisture.", "the subject of the text", "different aspects of deserts", "a key idea the reader should notice", "a fact about a specific desert placed outside the main text"],
    ["Space Exploration", "[HEADING] Exploring Outer Space [PARA] For thousands of years people have looked at the night sky and wondered what lies beyond our planet. [SUBHEADING] The First Steps [PARA] In 1969, astronauts landed on the [BOLD]Moon[/BOLD] for the first time. [SUBHEADING] Robots in Space [PARA] Today, robotic rovers explore distant planets and send pictures back to Earth. [SIDEBAR] The Voyager 1 spacecraft, launched in 1977, is now billions of kilometres from Earth.", "the main topic of the text", "two stages of space exploration", "an important term the reader should notice", "an example that supports the main text from the side"],
  ].map(([title, passage, headingFn, subFn, boldFn, sideFn]) => ({
    errorSignals: ["FEATURE_MISLABEL", "FUNCTION_VAGUE", "FEATURE_MISSED"],
    randomisable: true, context: "B", title, passage,
    answerKey: { mode: "rubric", checks: [
      { id: "HEADING", description: `HEADING: States ${headingFn}.` },
      { id: "SUBHEADING", description: `SUBHEADING: Divides the text into ${subFn}.` },
      { id: "BOLD", description: `BOLD: Highlights ${boldFn}.` },
      { id: "SIDEBAR", description: `SIDEBAR: Gives ${sideFn}.` },
    ], passFraction: 0.6 },
  })),

  // ───────────────────────── B2 Data comparison (similarity-band) ─────────────────────────
  "L7.B2": [
    ["DATA: Average rainfall per year (millimetres): Cape Town: 515 mm Durban: 1 009 mm Johannesburg: 713 mm Upington: 197 mm Source: South African Weather Service.", "Which city receives the most rain, and how does it compare to the driest city listed?", "Durban receives the most rain (1 009 mm). Upington receives the least (197 mm). Durban gets more than five times as much rain as Upington."],
    ["DATA: Favourite sport among 400 learners: Soccer: 180 Netball: 90 Cricket: 70 Athletics: 60 Source: school survey, 2023.", "Which sport is the most popular, and how does it compare to athletics?", "Soccer is the most popular (180 learners). Athletics is the least popular listed (60 learners). Three times as many learners chose soccer as chose athletics."],
    ["DATA: Percentage of waste recycled by material: Glass: 78% Paper: 65% Metal: 52% Plastic: 31% Source: national recycling report.", "Which material is recycled the most, and how does plastic compare?", "Glass is recycled the most (78%). Plastic is recycled the least (31%). Glass is recycled at more than twice the rate of plastic."],
    ["DATA: Average screen time per day (hours): Ages 8–10: 2.5 Ages 11–13: 4.0 Ages 14–16: 6.5 Source: media use study.", "How does screen time change as children get older?", "Screen time increases with age. The youngest group (ages 8–10) averages 2.5 hours, while the oldest group (ages 14–16) averages 6.5 hours — more than double."],
    ["DATA: Number of public libraries per province: Western Cape: 360 Gauteng: 110 KwaZulu-Natal: 215 Free State: 175 Source: provincial library services.", "Which province has the most public libraries, and how does Gauteng compare?", "The Western Cape has the most public libraries (360). Gauteng has the fewest listed (110). The Western Cape has more than three times as many libraries as Gauteng."],
    ["DATA: Litres of water used per activity at home: Bath: 80 Shower (5 min): 45 Washing dishes by hand: 20 Brushing teeth (tap running): 6 Source: water-saving guide.", "Which activity uses the most water, and how does a shower compare to a bath?", "A bath uses the most water (80 litres). A five-minute shower uses 45 litres, which is almost half as much as a bath, so showering saves water."],
    ["DATA: Books borrowed by genre in one month: Adventure: 240 Mystery: 190 Science: 120 Poetry: 50 Source: school library records.", "Which genre is borrowed the most, and how does poetry compare?", "Adventure books are borrowed the most (240). Poetry is borrowed the least (50). Almost five times as many adventure books are borrowed as poetry books."],
  ].map(([dataText, question, reference]) => ({
    errorSignals: ["SINGLE_DATA_POINT", "NO_COMPARISON_LANGUAGE", "DIRECTIONAL_ERROR"],
    randomisable: true, context: "B", dataText, question,
    answerKey: { mode: "similarity-band", reference, bands: band(), copyRejectAt: 0.6 },
  })),

  // ───────────────────────── C1 Multi-paragraph writing (rubric) ─────────────────────────
  "L7.C1": [
    "Write 2–3 paragraphs about why exercise is important. In each paragraph, start with a topic sentence that names one benefit, then give at least two details to support it.",
    "Write 2–3 paragraphs about what makes a good friend. Begin each paragraph with a topic sentence naming one quality, then support it with at least two examples.",
    "Write 2–3 paragraphs about why looking after the environment matters. Start each paragraph with a topic sentence, then add at least two supporting details.",
    "Write 2–3 paragraphs about the benefits of reading books. Each paragraph should begin with a topic sentence and include at least two supporting details.",
    "Write 2–3 paragraphs about how technology has changed the way we learn. Begin each paragraph with a topic sentence and support it with at least two details.",
    "Write 2–3 paragraphs about why teamwork is useful. Each paragraph must start with a topic sentence naming one reason, followed by at least two supporting details.",
    "Write 2–3 paragraphs about your favourite season and why you enjoy it. Begin each paragraph with a topic sentence and add at least two details.",
    "Write 2–3 paragraphs about why animals make good pets. Start each paragraph with a topic sentence and support it with at least two examples.",
    "Write 2–3 paragraphs about how learning a new skill can help you. Each paragraph should begin with a topic sentence and include at least two supporting details.",
  ].map((prompt) => ({
    errorSignals: ["NO_TOPIC_SENTENCE", "NARROW_TOPIC_SENTENCE", "DETAIL_MISSING", "PARAGRAPH_BLEED"],
    randomisable: true, context: "A", prompt,
    answerKey: { mode: "rubric", checks: C1_CHECKS, passFraction: 0.6 },
  })),

  // ───────────────────────── C2 Topic sentence (rubric) ─────────────────────────
  "L7.C2": [
    "Write a paragraph about a place you would love to visit. Your topic sentence should name the place. Then give at least two specific reasons you want to go there.",
    "Write a paragraph about a hobby you enjoy. Begin with a topic sentence naming the hobby, then describe at least two things you like about it.",
    "Write a paragraph about a person you admire. Your topic sentence should name the person, then give at least two specific reasons you admire them.",
    "Write a paragraph about an important lesson you have learned. Start with a topic sentence stating the lesson, then explain at least two ways you learned it.",
    "Write a paragraph about your favourite book or film. Begin with a topic sentence naming it, then give at least two reasons it is your favourite.",
    "Write a paragraph about something you are good at. Your topic sentence should name the skill, then describe at least two examples of using it.",
    "Write a paragraph about a memorable day. Begin with a topic sentence about the day, then describe at least two things that made it memorable.",
    "Write a paragraph about a goal you have. Start with a topic sentence stating the goal, then explain at least two steps you will take to reach it.",
    "Write a paragraph about your favourite animal. Your topic sentence should name the animal, then give at least two interesting facts or reasons you like it.",
  ].map((prompt) => ({
    errorSignals: ["NARROW_TOPIC_SENTENCE", "REDUNDANT_DETAIL", "INVERTED_STRUCTURE"],
    randomisable: true, context: "A", prompt,
    answerKey: { mode: "rubric", checks: C2_CHECKS, passFraction: 0.6 },
  })),

  // ───────────────────────── C3 Opinion paragraph (rubric) ─────────────────────────
  "L7.C3": [
    "Write an opinion paragraph about whether schools should have longer breaks. State your opinion and give at least two distinct reasons that each add new information.",
    "Write an opinion paragraph about whether homework is helpful. State your opinion clearly and support it with at least two different reasons.",
    "Write an opinion paragraph about whether children should have their own mobile phones. State your opinion and give at least two distinct reasons.",
    "Write an opinion paragraph about whether school uniforms are a good idea. State your opinion and support it with at least two different reasons.",
    "Write an opinion paragraph about whether pets should be allowed in classrooms. State your opinion and give at least two distinct reasons.",
    "Write an opinion paragraph about whether sport should be compulsory at school. State your opinion clearly and support it with at least two reasons.",
    "Write an opinion paragraph about whether it is better to live in a city or in the countryside. State your opinion and give at least two distinct reasons.",
    "Write an opinion paragraph about whether everyone should learn to cook. State your opinion and support it with at least two different reasons.",
    "Write an opinion paragraph about whether zoos are good or bad for animals. State your opinion clearly and give at least two distinct reasons.",
  ].map((prompt) => ({
    errorSignals: ["OPINION_ABSENT", "SINGLE_REASON", "REASON_RESTATES_OPINION", "CONTRADICTING_REASON"],
    randomisable: true, context: "A", prompt,
    answerKey: { mode: "rubric", checks: C3_CHECKS, passFraction: 0.6 },
  })),

  // ───────────────────────── C4 Transitions (rubric) ─────────────────────────
  "L7.C4": [
    "Write 2–3 paragraphs about how to plan a class event. In each paragraph after the first, use a different transition word to link to the previous paragraph. Do not repeat any transition word.",
    "Write 2–3 paragraphs about a place you know well. After the first paragraph, begin each new paragraph with a different transition word, without repeating any.",
    "Write 2–3 paragraphs about the seasons of the year. Use a different transition word at the start of each paragraph after the first, with no repeats.",
    "Write 2–3 paragraphs explaining how to look after a pet. In each paragraph after the first, use a different transition word, without repeating any.",
    "Write 2–3 paragraphs about a memorable holiday. After the first paragraph, link each new paragraph with a different transition word, with no repeats.",
    "Write 2–3 paragraphs about why recycling is important. Use a different transition word to begin each paragraph after the first, without repeating any.",
    "Write 2–3 paragraphs describing your daily routine. In each paragraph after the first, use a different transition word to link to the one before it.",
    "Write 2–3 paragraphs about a skill you would like to learn. After the first paragraph, begin each new paragraph with a different transition word, with no repeats.",
    "Write 2–3 paragraphs about how a plant grows. Use a different transition word to link each paragraph after the first, without repeating any.",
  ].map((prompt) => ({
    errorSignals: ["TRANSITION_ABSENT", "WRONG_FUNCTION", "REPETITION"],
    randomisable: true, context: "A", prompt,
    answerKey: { mode: "rubric", checks: C4_CHECKS, passFraction: 0.6 },
  })),

  // ───────────────────────── D1 Oral opinion (rubric) ─────────────────────────
  "L7.D1": [
    "Should every learner be taught how to swim? State your opinion with at least two supporting reasons.",
    "Should schools grow their own vegetable gardens? State your opinion with at least two supporting reasons.",
    "Should children spend less time on screens? State your opinion with at least two supporting reasons.",
    "Should everyone help with chores at home? State your opinion with at least two supporting reasons.",
    "Should schools have a longer summer holiday? State your opinion with at least two supporting reasons.",
    "Should plastic bags be banned in shops? State your opinion with at least two supporting reasons.",
    "Should learning a second language be compulsory? State your opinion with at least two supporting reasons.",
  ].map((prompt) => ({
    errorSignals: ["OPINION_ABSENT", "OPINION_ABSENT_ORAL", "SINGLE_REASON", "SINGLE_REASON_ORAL", "SHORT_RESPONSE"],
    randomisable: true, context: "B", prompt,
    answerKey: { mode: "rubric", checks: D1_CHECKS, passFraction: 0.6 },
  })),

  // ───────────────────────── D2 Oral exchange (rubric) ─────────────────────────
  "L7.D2": [
    "What do you think is the best way for people to stay healthy?",
    "What do you think is the most useful subject to learn at school?",
    "What do you think is the best way to make new friends?",
    "What do you think people can do to help protect wild animals?",
    "What do you think is the most enjoyable way to spend a weekend?",
    "What do you think is the best way to save water at home?",
    "What do you think makes a place a good community to live in?",
  ].map((prompt) => ({
    errorSignals: ["OFF_TOPIC_TURN2", "REPETITION_TURN2", "SHORT_TURN2"],
    randomisable: true, context: "B", prompt,
    answerKey: { mode: "rubric", checks: D2_CHECKS, passFraction: 0.6 },
  })),

  // ───────────────────────── D3 Oral summary (similarity-band) ─────────────────────────
  "L7.D3": [
    ["Plastic Pollution", "Plastic pollution is one of the biggest problems facing our oceans today. Every year, millions of tonnes of plastic waste end up in the sea, where it can take hundreds of years to break down. Sea animals such as turtles and seabirds often mistake plastic for food, which can make them very ill or even kill them. Tiny pieces of plastic, called microplastics, have now been found in fish and even in drinking water. Scientists say the best way to solve the problem is to use less plastic, reuse what we can, and recycle the rest.", "Plastic pollution is harming our oceans and the animals in them, and the best way to fix it is to use less plastic, reuse, and recycle. Key details: Millions of tonnes of plastic enter the sea each year.; Animals mistake plastic for food and become ill.; Tiny microplastics have been found in fish and drinking water."],
    ["The Moon Landing", "On 20 July 1969, two American astronauts became the first humans to walk on the Moon. Their spacecraft, Apollo 11, had travelled about 384 000 kilometres from Earth. Neil Armstrong was the first to step onto the surface, followed by Buzz Aldrin, while a third astronaut stayed in orbit. They collected rock samples and planted a flag before returning safely to Earth. The Moon landing is remembered as one of the greatest achievements in human history.", "The first Moon landing in 1969 was a historic achievement in which astronauts walked on the Moon and returned safely. Key details: Apollo 11 travelled about 384 000 kilometres.; Neil Armstrong was the first to step onto the surface.; The astronauts collected rock samples before returning to Earth."],
    ["Antibiotics", "Antibiotics are powerful medicines that fight infections caused by bacteria. Before they were discovered, even small infections could be deadly. The first antibiotic, penicillin, was discovered by Alexander Fleming in 1928, and it has saved millions of lives since. However, doctors warn that using antibiotics too often can make bacteria resistant, which means the medicines stop working. For this reason, antibiotics should only be taken when a doctor says they are needed.", "Antibiotics are medicines that fight bacterial infections and have saved millions of lives, but overusing them can make them stop working. Key details: Penicillin was discovered by Alexander Fleming in 1928.; Before antibiotics, small infections could be deadly.; Overuse makes bacteria resistant to the medicine."],
    ["Migration of the Wildebeest", "Each year in East Africa, more than a million wildebeest take part in one of nature's greatest journeys. They travel in huge herds across the plains of Tanzania and Kenya in search of fresh grass and water. Along the way they must cross rivers full of crocodiles and avoid predators such as lions. Many animals do not survive the journey, but the migration is essential for the herds to find enough food. The great wildebeest migration draws visitors from all over the world.", "Over a million wildebeest migrate across East Africa each year to find food and water, facing many dangers along the way. Key details: They travel across Tanzania and Kenya.; They must cross rivers full of crocodiles.; The migration helps the herds find enough grass and water."],
    ["The Importance of Sleep", "Sleep is just as important for your health as eating well and exercising. While you sleep, your body repairs itself and your brain sorts and stores everything you have learned during the day. Children and teenagers need more sleep than adults because their bodies and brains are still growing. People who do not get enough sleep often find it harder to concentrate, remember things, and control their mood. Experts recommend that young people aim for nine to eleven hours of sleep each night.", "Sleep is essential for health because it lets the body repair itself and the brain store what you have learned. Key details: Children and teenagers need more sleep than adults.; Too little sleep makes it harder to concentrate and remember.; Experts recommend nine to eleven hours a night for young people."],
    ["The Rainforest Layers", "A tropical rainforest is made up of several layers, each home to different plants and animals. The top layer is the emergent layer, where the tallest trees rise above the rest. Below it is the canopy, a thick roof of leaves where most rainforest animals live. Further down is the understorey, which is dark and humid, and finally the forest floor, where very little sunlight reaches. Each layer plays an important part in keeping the rainforest alive and balanced.", "A rainforest has several layers, from the tall emergent layer down to the dark forest floor, and each is home to different living things. Key details: The canopy is where most rainforest animals live.; The understorey is dark and humid.; Very little sunlight reaches the forest floor."],
    ["The Invention of the Telephone", "The telephone changed the way people communicate forever. Before it was invented, messages had to be sent by letter or telegraph, which could take days. In 1876, Alexander Graham Bell made the first successful telephone call, allowing people to speak to each other over long distances instantly. Over time, telephones became smaller and more common, and today most people carry a mobile phone wherever they go. The telephone is one of the most important inventions in history.", "The telephone transformed communication by letting people speak instantly over long distances, starting with Bell's first call in 1876. Key details: Before it, messages were sent by letter or telegraph and took days.; Alexander Graham Bell made the first call in 1876.; Telephones became smaller and led to today's mobile phones."],
  ].map(([title, passage, reference]) => ({
    errorSignals: ["NO_MAIN_IDEA_ORAL", "DETAIL_BEFORE_MAIN", "VERBATIM_ORAL"],
    randomisable: true, context: "B", title, passage,
    answerKey: { mode: "similarity-band", reference, bands: band(), copyRejectAt: 0.6 },
  })),
};

// ── assign continuing ids per skill, then append ──
function prefixOf(skill) {
  const first = skill.items[0];
  return first ? first.id.replace(/[._-]?\d+$/, "") : null;
}
function maxNum(skill) {
  return skill.items.reduce((m, it) => {
    const mt = it.id.match(/(\d+)$/);
    return mt ? Math.max(m, parseInt(mt[1], 10)) : m;
  }, 0);
}

let total = 0;
for (const skill of bank.skills) {
  const add = NEW[skill.skillId];
  if (!add || add.length === 0) continue;
  const prefix = prefixOf(skill);
  let n = maxNum(skill);
  for (const item of add) {
    n += 1;
    const id = `${prefix}.${String(n).padStart(3, "0")}`;
    skill.items.push({ id, ...item });
    total += 1;
  }
}

const out = JSON.stringify(bank, null, 2).replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, out);
console.log(`L7: appended ${total} items. Per-skill totals:`);
bank.skills.forEach((s) => console.log(`  ${s.skillId}: ${s.items.length}`));
