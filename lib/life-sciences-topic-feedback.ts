// ─── Life Sciences — per-topic "think of it like this" analogies ────────────
//
// One everyday analogy per topic (70, Grades 10–12), keyed by skill/topic id.
// Feeds the wrong-answer card's example slot via FeedbackExplanation's
// `exampleOverride`. Register: FET / matric band (ages ~15–18) — a concrete
// analogy, but textbook-precise where it matters. "why" = the question's memo,
// "how" = the topic's recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "LSC.G10.S1.CHEM.A1":
    "Each food test is a colour alarm: iodine turns blue-black for starch, warm Benedict's turns brick-orange for simple sugars, Biuret turns purple for protein. No colour change means the nutrient isn't there.",
  "LSC.G10.S1.CHEM.A2":
    "Carbohydrates are sugar units clipped together: a single unit is glucose, two clipped is sucrose, a long chain is starch — one brick, a pair, then a wall.",
  "LSC.G10.S1.CHEM.A3":
    "An enzyme is a lock and the substrate its one matching key. Heat it too far and the lock warps out of shape (denatures) — the key no longer fits, and it won't spring back.",
  "LSC.G10.S1.CELL.A1":
    "A cell is a small factory: mitochondria are the generators, the nucleus is the office with the plans, ribosomes are the assembly benches. A plant cell adds a brick wall and solar panels (chloroplasts).",
  "LSC.G10.S1.CELL.A2":
    "Diffusion is a crowd spreading from a packed doorway into an empty hall — no effort. Active transport is pushing people back through the door into the crowded room: it needs energy (ATP).",
  "LSC.G10.S1.CELL.A3":
    "Magnification makes the image bigger; resolution keeps it sharp. Zoom a phone photo too far and you get a huge but blurry picture — big magnification, poor resolution.",
  "LSC.G10.S1.MITO.A1":
    "Mitosis is a photocopier: one cell in, two identical cells out. The stages PMAT are just the steps of lining chromosomes up and pulling exact copies to each end.",
  "LSC.G10.S1.MITO.A2":
    "A normal cell obeys a 'stop dividing' signal like a car obeying a red light. A cancer cell ignores the light and keeps going, so a pile-up of cells (a tumour) builds.",
  "LSC.G10.S1.TISS.A1":
    "Tissues are teams with one job: xylem is the plumbing carrying water up, phloem is the delivery van moving sugar both ways, muscle is the team that pulls, nerve is the team that signals.",
  "LSC.G10.S1.TISS.A2":
    "A vaccine is a wanted poster shown to your immune system before the criminal arrives, so it recognises the real virus fast. An antibiotic is a weapon that works on bacteria only, not viruses.",
  "LSC.G10.S2.PTRN.A1":
    "A soft herb stands up like a balloon full of air — water pressure (turgor) inflates its cells. Lose the water and it flops. A tree stands on woody scaffolding instead.",
  "LSC.G10.S2.PTRN.A2":
    "Water rises up the xylem because it's pulled from the top — leaves lose vapour and drag the whole thread up, like sipping juice through a straw. Sun, heat and wind speed the sipping; humid air slows it.",
  "LSC.G10.S2.ASUP.A1":
    "The skeleton splits in two: the axial part is the central pole (skull, spine, ribs); the appendicular part is the limbs and the girdles that hang them on, like arms bolted onto a frame.",
  "LSC.G10.S2.ASUP.A2":
    "Think of bone as reinforced concrete: rickets in children is concrete that never set hard (missing vitamin D and calcium); osteoporosis in adults is old concrete crumbling thin.",
  "LSC.G10.S2.ASUP.A3":
    "Muscles only pull, never push — so they work in opposing pairs like two people on a rope: the biceps pulls the forearm up, the triceps pulls it back down. A tendon ties muscle to bone; a ligament ties bone to bone.",
  "LSC.G10.S2.CIRC.A1":
    "The heart is a two-sided pump: the right side sends 'used' blood the short trip to the lungs, the left side pumps fresh blood the long way round the whole body — which is why its wall is thicker.",
  "LSC.G10.S2.CIRC.A2":
    "Arteries are thick high-pressure hoses leaving the heart; veins are thin return pipes with one-way valves so blood can't slide back; capillaries are the fine mesh where delivery and pickup actually happen.",
  "LSC.G10.S2.CIRC.A3":
    "A heart attack is a blocked pipe feeding the heart muscle itself; a stroke is the same kind of blockage or burst in the brain. LDL cholesterol furs up the pipes; HDL helps clear it.",
  "LSC.G10.S3.ECO.A1":
    "Zoom out in steps: an ecosystem is a dam and everything living in and around it; a biome is every grassland on Earth grouped by climate; the biosphere is the whole thin film of life wrapping the planet.",
  "LSC.G10.S3.ECO.A2":
    "A food-chain arrow points the way energy travels — from the eaten to the eater. Only about a tenth passes up each step, so a huge field of grass feeds a few buck to feed one lion.",
  "LSC.G10.S3.ECO.A3":
    "Carbon, nitrogen and water aren't used up — they cycle, like one set of dishes washed and reused. Photosynthesis and respiration pass carbon back and forth; burning fuel adds a big extra dose.",
  "LSC.G10.S3.ECO.A4":
    "A field study is a fair-test recipe outdoors: measure the same abiotic and biotic things, the same way, at the same spots, then repeat each season. Succession is the slow hand-over from weeds to forest.",
  "LSC.G10.S4.BIO.A1":
    "Classification is nested boxes from big to small — Kingdom down to Species. A species name is like surname-then-first-name: Genus capitalised, species small, both italic — Homo sapiens.",
  "LSC.G10.S4.BIO.A2":
    "Endemic means found only here and nowhere else, like Cape fynbos. Endangered means close to gone for good. South Africa's Cape Floral Kingdom is tiny but packed with more plant species per hectare than almost anywhere.",
  "LSC.G10.S4.HOL.A1":
    "Read Earth's history like a very long book: simple cells for most of it, then a burst of animal life (Cambrian), then dinosaurs, then mammals. The end-Permian was the near-total wipeout (volcanoes); an asteroid ended the dinosaurs.",
  "LSC.G11.S4.MICR.A1":
    "Sort microbes by one question — is it even a cell? A virus is not. A bacterium is a cell with no nucleus. A protist is a single cell with a nucleus. A fungus has a chitin wall and feeds by soaking up nutrients.",
  "LSC.G11.S4.MICR.A2":
    "Match the disease to the culprit: TB and cholera are bacteria, HIV is a virus, malaria is a protist. That matters — antibiotics work on bacteria only, so taking them for a viral flu does nothing.",
  "LSC.G11.S4.PLNT.A1":
    "Mosses and ferns are still tied to water for reproduction — the sperm has to swim to the egg — so they hug damp places. Mosses have no plumbing and stay small; ferns have plumbing so they grow taller, but still no seeds.",
  "LSC.G11.S4.PLNT.A2":
    "A gymnosperm carries naked seeds on a cone (a pine); an angiosperm wraps its seeds in a fruit (an apple). Among flowering plants, a monocot has one seed leaf, parallel veins and stringy roots (maize); a dicot has two, net veins and a taproot (a bean).",
  "LSC.G11.S4.PREP.A1":
    "A flower is an advertising billboard for pollinators: bright petals, scent and nectar say 'land here' to insects and birds. Wind-pollinated flowers skip the advertising — dull, no nectar — because the wind can't be tempted.",
  "LSC.G11.S4.PREP.A2":
    "After fertilisation the ovary swells into the fruit and each ovule inside becomes a seed — the fruit is the lunchbox, the seeds are the meal. A seed then needs water, warmth and oxygen to germinate.",
  "LSC.G11.S4.ANIM.A1":
    "Name most invertebrate groups by body plan: arthropods wear their skeleton outside and have jointed legs (crabs, spiders, insects); molluscs are soft-bodied, often shelled; annelids are built from repeated segments, like a stack of rings.",
  "LSC.G11.S4.ANIM.A2":
    "The five backboned classes each have a signature: fish breathe with gills, amphibians have moist skin and water-bound young, reptiles have dry scales and land eggs, birds have feathers, mammals have fur and feed milk.",
  "LSC.G11.S2.PHOT.A1":
    "Photosynthesis runs in two rooms of the chloroplast: the light reactions in the thylakoids split water for energy carriers and release oxygen; the Calvin cycle in the stroma builds glucose from CO2. The oxygen came from water, not carbon dioxide.",
  "LSC.G11.S2.PHOT.A2":
    "The limiting factor is whatever is in shortest supply — like a production line held up by the one slow machine. On a rate graph the line climbs then flattens; the flat part shows that factor is no longer the bottleneck.",
  "LSC.G11.S2.NUTR.A1":
    "Digestion is an assembly line with a different tool at each station: amylase in the mouth on starch, pepsin in the stomach on protein, lipase from the pancreas on fat. The small molecules are absorbed through the villi — millions of tiny fingers widening the gut's surface.",
  "LSC.G11.S2.NUTR.A2":
    "Kwashiorkor and marasmus are two shortfalls: kwashiorkor is enough kilojoules but too little protein (the swollen belly); marasmus is too little of everything. At the other extreme, too much energy and poor diet drive obesity and Type 2 diabetes.",
  "LSC.G11.S2.RESP.A1":
    "With oxygen, a glucose molecule is fully 'burned' for about 36 ATP. Without it — a sprinter's muscles mid-race — the same glucose yields only 2 ATP and leaves lactic acid. Yeast does the oxygen-free version, making ethanol and CO2.",
  "LSC.G11.S2.RESP.A2":
    "Plants do both jobs: they photosynthesise in daylight but respire around the clock — like a shop that manufactures by day but keeps its own lights on 24/7. Oxygen debt is the extra breathing after a sprint, repaying the oxygen you skipped.",
  "LSC.G11.S2.GAS.A1":
    "Breathing in is making the chest bigger so air is sucked in: the diaphragm flattens, the ribs lift, the space grows, the pressure drops, air rushes in — the same reason a syringe pulls in liquid when you draw the plunger back.",
  "LSC.G11.S2.GAS.A2":
    "Every gas-exchange surface follows one rule — large area, thin and moist. Leaves use pores (stomata), fish use gills with water flowing opposite to the blood, and insects pipe air straight to their cells through tubes (tracheae), skipping blood.",
  "LSC.G11.S2.EXCR.A1":
    "A nephron cleans blood in three moves: force everything small out under pressure (ultrafiltration), claw back the useful stuff — glucose, salts, water (reabsorption), then dump a little extra waste in (secretion). What's left is urine.",
  "LSC.G11.S2.EXCR.A2":
    "When the kidneys fail, dialysis is a machine standing in — blood is run past a filter and cleaned outside the body. A transplant is a replacement kidney. In South Africa the biggest causes are uncontrolled diabetes and high blood pressure.",
  "LSC.G11.S3.POP.A1":
    "A J-curve is a population growing unchecked — straight up, like money at compound interest. An S-curve is that growth flattening as it hits carrying capacity, the ceiling the environment can feed. Crowding-linked limits are density-dependent; a drought hits regardless of numbers.",
  "LSC.G11.S3.POP.A2":
    "Sort interactions by who wins: mutualism, both gain (bees and flowers); commensalism, one gains and the other is unbothered; parasitism, one gains at the other's cost (ticks on a dog); predation, one eats the other; competition, both after the same limited thing.",
  "LSC.G11.S3.IMP.A1":
    "Keep two problems apart: the enhanced greenhouse effect is extra CO2 and methane trapping heat near the ground; ozone depletion is CFCs thinning a protective layer high above. Different gases, different heights, different fixes.",
  "LSC.G11.S3.IMP.A2":
    "An alien invasive is a species brought in from elsewhere that spreads with no natural checks — like black wattle or water hyacinth guzzling water and choking rivers. Working for Water clears them to free up water and let indigenous plants return.",
  "LSC.G11.S3.IMP.A3":
    "Conservation in South Africa is a layered defence: government parks (SANParks, CapeNature), NGOs like WWF-SA, community and private reserves, and the CITES treaty controlling trade across borders.",
  "LSC.G12.S1.DNA.A1":
    "DNA is a twisted ladder: the sides are alternating sugar and phosphate, the rungs are base pairs. A always pairs with T, G always with C — like a zip whose teeth only mesh one specific way.",
  "LSC.G12.S1.DNA.A2":
    "Replication is semi-conservative: the ladder unzips down the middle and each old half is a template for a new matching half. Every new DNA molecule keeps one original strand and one fresh one.",
  "LSC.G12.S1.PROT.A1":
    "Making a protein is copy-then-build: transcription copies a gene from DNA into a portable mRNA message (in the nucleus), and translation reads it three letters (a codon) at a time at the ribosome, adding one amino acid per codon.",
  "LSC.G12.S1.PROT.A2":
    "A point mutation swaps one letter — often harmless, sometimes serious like sickle cell. A frameshift adds or drops a letter, shifting every codon after it, like deleting one letter from a sentence and re-spacing it into gibberish.",
  "LSC.G12.S1.MEI.A1":
    "Meiosis is two divisions, not one. The first separates the chromosome pairs, halving the number. The second splits the sister copies, like mitosis. Four cells come out, each haploid and each genetically different.",
  "LSC.G12.S1.MEI.A2":
    "Meiosis shuffles the genetic deck, so no two gametes are alike — the raw material for evolution. If a pair fails to separate (non-disjunction), a gamete ends up with an extra or missing chromosome, as in Down syndrome.",
  "LSC.G12.S2.VREP.A1":
    "There's a trade-off between number and care. r-strategists (fish, frogs) release thousands of eggs and walk away — wasteful, but some survive. K-strategists (elephants, humans) have few young and invest heavily in each.",
  "LSC.G12.S2.HREP.A1":
    "Trace the route: sperm are made in the testes, an egg is released from an ovary, they meet in the fallopian tube where fertilisation happens, and the embryo then settles into the wall of the uterus.",
  "LSC.G12.S2.HREP.A2":
    "The 28-day cycle is a monthly build-and-clear: FSH grows a follicle in the first half, a surge of LH triggers ovulation around day 14, and if no pregnancy follows, the lining is shed as menstruation to start again.",
  "LSC.G12.S2.HREP.A3":
    "A condom is the only method that blocks both pregnancy and infection; the pill stops pregnancy only. HIV is a virus managed for life with ARVs ('undetectable = untransmittable'), while many other STIs are bacterial and curable.",
  "LSC.G12.S2.NRV.A1":
    "The brain divides the work: the cerebrum thinks and decides, the cerebellum keeps you balanced and coordinated, and the medulla quietly runs the automatic jobs — heartbeat and breathing — without you noticing.",
  "LSC.G12.S2.NRV.A2":
    "A reflex takes a shortcut. Touch something hot and the signal runs sensory neuron → spinal cord → motor neuron → muscle, and your hand pulls back before the message even reaches the brain to feel pain.",
  "LSC.G12.S2.SENS.A1":
    "Rods see in dim light but only in grey; cones need brighter light and give you colour. In short sight (myopia) the eyeball is too long, so the image lands short of the retina — a concave lens spreads the light to fix it.",
  "LSC.G12.S2.SENS.A2":
    "Sound is passed on and amplified like a bucket line: the eardrum vibrates, three tiny bones (hammer, anvil, stirrup) magnify the movement, and the coiled cochlea turns it into nerve signals. The separate loops (semicircular canals) handle balance, not sound.",
  "LSC.G12.S2.END.A1":
    "Hormones are chemical messages posted into the blood, reaching every cell but only affecting the ones with the matching receptor — like a group text only certain phones are set up to open. The pituitary is the 'master gland' directing several others.",
  "LSC.G12.S2.END.A2":
    "Type 1 diabetes is a factory that stopped making insulin (an immune attack on the pancreas); Type 2 is a factory still making it, but the cells no longer respond well. One needs insulin injections, the other is managed largely with diet, weight and activity.",
  "LSC.G12.S2.HOM.A1":
    "Homeostasis is a thermostat with air-con. Too hot: sweat and widen skin blood vessels to shed heat. Too cold: shiver and narrow them to keep heat in. Too little water: ADH tells the kidney to hold water back, so the urine is small and concentrated.",
  "LSC.G12.S2.HOM.A2":
    "Blood sugar is kept level by two opposing hormones, like a hot and a cold tap. Insulin turns the level down (storing glucose as glycogen after a meal); glucagon turns it up (releasing it again between meals).",
  "LSC.G12.S4.DAR.A1":
    "Natural selection is a filter running every generation: individuals vary, more are born than can survive, the ones whose traits fit the environment survive and breed, and those traits are inherited. Fossils, shared anatomy, embryos and DNA all point the same way.",
  "LSC.G12.S4.DAR.A2":
    "Allopatric speciation is a population split by a barrier — a river, a mountain — drifting apart until they can't interbreed. You can watch selection in fast-forward when bacteria evolve antibiotic resistance or insects shrug off pesticides.",
  "LSC.G12.S4.HUM.A1":
    "Human evolution is a branching bush, not a ladder. We didn't come from chimps — we share a common ancestor and split from it. Our line went through australopithecines, Homo habilis and Homo erectus to us, gaining upright walking, then bigger brains and tools.",
  "LSC.G12.S4.HUM.A2":
    "South Africa's Cradle of Humankind is a key address for these fossils — Mrs Ples (Australopithecus africanus), Karabo (A. sediba) and the Homo naledi finds. The Out-of-Africa model says Homo sapiens arose in Africa around 300 000 years ago and spread from there.",
};
