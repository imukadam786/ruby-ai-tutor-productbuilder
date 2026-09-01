// ─── Natural Sciences SP — per-topic "think of it like this" analogies ──────
//
// One everyday analogy per topic (54, Grades 7–9), keyed by skill/topic id.
// Feeds the wrong-answer card's example slot via FeedbackExplanation's
// `exampleOverride`. Register: Grade 7–9, concrete, everyday South African
// reference points. "why" = the question's memo, "how" = the topic's
// recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "NSSP.G7.LL.A1":
    "Picture three layers — rock (lithosphere), water (hydrosphere) and air (atmosphere). The biosphere is the thin zone where all three meet and life survives, like the moist edge of a dam where plants, fish and birds all live.",
  "NSSP.G7.LL.A2":
    "Sort a creature by its features, not where you find it. A whale lives in the sea but breathes air and feeds its young milk, so it's a mammal — not a fish.",
  "NSSP.G7.LL.A3":
    "Two steps, in order: pollination is pollen landing on the stigma (a letter reaching the postbox); fertilisation is the male cell joining the egg inside (the letter being opened). No delivery, no opening.",
  "NSSP.G7.LL.A4":
    "Variation is the differences inside one species — some people tall, some short, some left-handed. A dog and a cat aren't variation; they're different species altogether.",
  "NSSP.G7.MM.A1":
    "Match the job to the property: a pot handle must NOT carry heat, so it's plastic or wood; electrical wire MUST carry current, so it's copper. Name the property the job needs first.",
  "NSSP.G7.MM.A2":
    "Pick the method by the difference between the parts: different sizes go through a sieve; sand in water is caught by a filter; dissolved salt is left behind when the water evaporates; iron filings jump to a magnet.",
  "NSSP.G7.MM.A3":
    "Litmus is a colour code: acid turns it red, a base turns it blue — 'A before B, red before blue'. Lemon juice reds it; bathroom cleaner blues it; water stays in between.",
  "NSSP.G7.MM.A4":
    "The Periodic Table is a sorted shelf: metals on the left (shiny, bend, carry current — a copper pipe), non-metals on the right (dull, brittle, poor conductors — sulfur), semi-metals along the dividing line.",
  "NSSP.G7.EC.A1":
    "Ask one question: does it refill in a lifetime? Sun, wind and water do — renewable. Coal, oil and gas took millions of years and won't come back — non-renewable, a tank that only empties.",
  "NSSP.G7.EC.A2":
    "A ball held above your head has stored (potential) energy. Drop it and that becomes movement (kinetic) energy. It hits the ground and the energy scatters as sound and heat — nothing is lost, only changed.",
  "NSSP.G7.EC.A3":
    "Three ways heat moves: conduction needs solids touching (a metal spoon in hot tea); convection needs a moving liquid or gas (warm air rising off a heater); radiation crosses empty space (the Sun on your face).",
  "NSSP.G7.EC.A4":
    "An insulator traps heat by being a poor conductor and holding still air — a woolly jersey, or the polystyrene around hot food. To keep warmth in you want an insulator, not metal.",
  "NSSP.G7.EC.A5":
    "'Wasted' energy hasn't vanished — it's spread into the room, usually as heat. A globe's useful output is light; the warmth it gives off is the wasted share, which is why an old bulb gets hot.",
  "NSSP.G7.EC.A6":
    "Follow the path from power station to plug: the station generates it, a transformer steps the voltage way up for the long trip along the pylons, another steps it down near town, then it reaches your house. Saving at home means the station burns less.",
  "NSSP.G7.PEB.A1":
    "Seasons come from the tilt, not the distance. The half of Earth leaning toward the Sun gets more direct rays and has summer; the half leaning away has winter — which is why December is summer here and winter in Europe.",
  "NSSP.G7.PEB.A2":
    "Tides are mostly the Moon's gravity tugging the oceans. The water bulges toward the Moon and, oddly, away on the far side too — so most coasts get two high tides a day.",
  "NSSP.G7.PEB.A3":
    "Long before telescopes, people read the sky like a calendar — which stars rose told them when to plant and how to find their way. That careful watching is the root of modern astronomy.",
  "NSSP.G8.LL.A1":
    "The two are mirror images. Photosynthesis takes in carbon dioxide and water and makes glucose and oxygen (a plant charging up in sunlight). Respiration runs it backwards — using glucose and oxygen to release energy, giving off carbon dioxide and water.",
  "NSSP.G8.LL.A2":
    "In a food web the arrow always points to the eater — grass → buck → lion. Producers (plants) make the food, consumers eat it, decomposers break down what dies. Energy travels one way along the arrows.",
  "NSSP.G8.LL.A3":
    "Judge a microbe by what it does. The same kinds of tiny life that spoil milk or cause a sore throat also make bread rise, turn milk into maas, and give us antibiotics. Not all germs are bad.",
  "NSSP.G8.MM.A1":
    "An element is one kind of atom only (a bar of pure gold). A compound is different atoms chemically locked together (water = hydrogen joined to oxygen). A mixture is just stirred, not joined, so you can separate it again (sand in water).",
  "NSSP.G8.MM.A2":
    "All matter is tiny moving particles. In a solid they're packed and locked (a brick); in a liquid they touch but slide (water taking the glass's shape); in a gas they're far apart and zooming (air filling a room). Heat gives them energy and spreads them out.",
  "NSSP.G8.MM.A3":
    "Ask: is a NEW substance made? Burning wood to ash and rusting a nail are chemical changes — new stuff, hard to undo. Melting ice or dissolving sugar are physical changes — same substance, easily reversed.",
  "NSSP.G8.EC.A1":
    "Like charges push apart, unlike charges pull together. Rub a balloon on your hair and they take opposite charges, so it sticks — but two rubbed balloons swing away from each other.",
  "NSSP.G8.EC.A2":
    "Current only flows around a complete loop — cell, wires, switch, bulb, back to the cell. Any break, like an open switch or a loose wire, and the whole thing stops, like a broken chain.",
  "NSSP.G8.EC.A3":
    "Series is one loop of fairy lights — pull one bulb and the whole string goes dark. Parallel is like the rooms of a house, each on its own path — switch off one and the rest stay lit.",
  "NSSP.G8.EC.A4":
    "Reflection is light bouncing off a surface — a mirror sends your face back at you. Refraction is light bending as it crosses into a new material — which is why a straw looks broken where it enters the water.",
  "NSSP.G8.PEB.A1":
    "The Sun is a star at the centre and the planets circle it. Planets make no light of their own — you see them because they reflect the Sun, like the Moon does. Order out from the Sun: Mercury, Venus, Earth, Mars…",
  "NSSP.G8.PEB.A2":
    "A light-year is a distance, not a time — how far light travels in a year. Our nearest star is the Sun; the Milky Way is the galaxy holding it along with billions of others.",
  "NSSP.G8.PEB.A3":
    "A telescope gathers faint light from far away to make distant objects look closer and clearer — the opposite job to a microscope, which magnifies tiny things right in front of you. Bigger telescopes see fainter, more distant things.",
  "NSSP.G9.LL.A1":
    "Plant and animal cells both have a membrane, cytoplasm and a nucleus. Only plant cells add a stiff cell wall, a big water-filled vacuole and green chloroplasts. Life builds up: cells → tissues → organs → systems.",
  "NSSP.G9.LL.A2":
    "Give each body system one job: circulatory = the delivery trucks (blood), respiratory = takes in oxygen, digestive = breaks down food, skeletal = the frame, muscular = moves it, nervous = the messaging network.",
  "NSSP.G9.LL.A3":
    "The order is fixed: fertilisation (sperm meets egg) → the fertilised egg develops in the uterus → the baby grows → birth. Puberty is the earlier stage where the body matures enough for this to be possible.",
  "NSSP.G9.LL.A4":
    "The two work as a team: the lungs take in oxygen and release carbon dioxide; the heart pumps blood to carry that oxygen to every cell and bring the carbon dioxide back to the lungs to breathe out.",
  "NSSP.G9.LL.A5":
    "Food takes one route: mouth → oesophagus → stomach → small intestine → large intestine. Along the way it's broken into pieces small enough to pass into the blood. A balanced diet just means the right mix of food groups going in.",
  "NSSP.G9.MM.A1":
    "The name tells you what joined. Two elements alone usually end in -ide: sodium + chlorine → sodium chloride (table salt). When oxygen is bundled in with another element, the ending is often -ate: carbonate, sulfate.",
  "NSSP.G9.MM.A2":
    "In a reaction atoms are only rearranged, never created or destroyed — like moving the same Lego bricks into a new shape. So a balanced equation must have the same count of each atom on both sides.",
  "NSSP.G9.MM.A3":
    "metal + oxygen → metal oxide. Rust is just iron slowly doing this with oxygen AND water, so you stop rust by keeping iron dry or sealing it with paint, oil or a zinc coat.",
  "NSSP.G9.MM.A4":
    "non-metal + oxygen → non-metal oxide. Those oxides — carbon dioxide, sulfur dioxide — mostly dissolve in water to make ACIDS (this is how acid rain forms), whereas metal oxides tend to be basic.",
  "NSSP.G9.MM.A5":
    "The pH scale is a strength meter: below 7 is acidic, exactly 7 is neutral (pure water), above 7 is basic. The further from 7, the stronger — lemon juice around 2, bleach around 13.",
  "NSSP.G9.MM.A6":
    "Neutralisation cancels an acid and a base out: acid + base → salt + water — like an antacid tablet calming stomach acid. With a carbonate you also get fizzing carbon dioxide gas.",
  "NSSP.G9.MM.A7":
    "acid + metal → salt + hydrogen gas. The bubbles rising off the metal are hydrogen — hold a lit splint near and it goes off with a squeaky 'pop'.",
  "NSSP.G9.EC.A1":
    "A contact force needs touching — friction, or a shove. A field force reaches across a gap with no contact — gravity pulling a dropped phone, or a magnet grabbing a paperclip from a distance. Ask: do they have to touch?",
  "NSSP.G9.EC.A2":
    "A cell turns stored chemical energy into electrical energy to push a current. It doesn't make energy from nothing — when the chemicals inside are used up, the battery goes flat.",
  "NSSP.G9.EC.A3":
    "Resistance is anything that fights the current, like a narrow pipe fights water flow. A longer wire resists more; a thicker wire resists less. More resistance, less current.",
  "NSSP.G9.EC.A4":
    "In series, the bulbs share one loop and one supply of energy, so adding bulbs dims them all and one break kills them all. In parallel, each bulb has its own path, so each stays bright and independent.",
  "NSSP.G9.EC.A5":
    "Treat electricity like a river you can't see: keep it away from water, never touch sockets with wet hands, don't overload a plug with adaptors, and use properly insulated wires.",
  "NSSP.G9.EC.A6":
    "Most of South Africa's electricity comes from burning coal to boil water into steam that spins turbines; some comes from the Koeberg nuclear station and from wind and solar. The grid then carries it nationwide.",
  "NSSP.G9.EC.A7":
    "Your bill grows with power × time. A phone charger sips; a geyser or a heater gulps — leave those on and the meter races. Switching high-power appliances off when you don't need them is where the saving is.",
  "NSSP.G9.PEB.A1":
    "Think of Earth as four connected parts — rock (lithosphere), water (hydrosphere), air (atmosphere) and living things (biosphere) — constantly swapping matter and energy: rain falls from air to land, plants pull gas from air, rivers carry rock to sea.",
  "NSSP.G9.PEB.A2":
    "Three ways a rock forms: igneous when molten rock cools and sets (candle wax hardening), sedimentary when layers of grit are pressed together over ages, metamorphic when heat and pressure change a rock that already existed.",
  "NSSP.G9.PEB.A3":
    "An ore is rock with enough useful metal packed in it to be worth digging up. The metal still has to be extracted from the rock and then refined — purified — before it's any use.",
  "NSSP.G9.PEB.A4":
    "Greenhouse gases work like a blanket — they trap some of the Sun's heat and keep Earth warm enough to live on. Add too much from burning fuel and the blanket gets too thick, and the planet overheats. Weather all happens in the lowest layer, the troposphere.",
  "NSSP.G9.PEB.A5":
    "A star's life runs in order: a cloud of gas and dust collapses and heats until it ignites, it shines steadily for billions of years while it has fuel, then when the fuel runs out it dies. Gas cloud → shining star → fuel gone → death.",
};
