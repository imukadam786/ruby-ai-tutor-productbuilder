// Audit helper: prints a markdown table of the FET diagram images still missing
// (Life Sciences + Geography reference them via image_refs but no files exist in
// public/life-sciences/ or public/geography/). Diagram-label style, not Twemoji.
//   node scripts/gen-fet-diagram-prompts.mjs

const STYLE =
  "Clean, brightly coloured flat educational diagram in a friendly CAPS-textbook style on a plain white background, square 1:1; label each named part with a clear capital letter and a thin leader line exactly as listed, with no other text, captions or paragraphs.";
const P = (desc, fn) =>
  `Educational diagram: ${desc}. ${STYLE} Save the downloaded image as the file: ${fn}`;

const LS = [
  ["plant_cell_labelled", "a rectangular plant cell with rounded corners; label A=cell wall (outer), B=cell membrane (just inside the wall), C=large central vacuole, D=oval green chloroplast, E=nucleus"],
  ["animal_cell_labelled", "a round animal cell; label W=nucleus, X=mitochondrion (sausage shape with folded inner membrane), Y=Golgi body, Z=ribosomes (small dots)"],
  ["mitosis_telophase", "a cell in telophase of mitosis with two separate clusters of chromosomes at opposite poles and two new nuclear membranes reforming around them; label the chromosome clusters and the forming nuclear membranes"],
  ["xylem_phloem_cross_section", "a stem vascular-bundle cross-section; label the xylem vessels (inner) and the phloem sieve tubes (outer)"],
  ["long_bone_structure", "a long bone cut lengthwise; label A=compact bone (hard outer layer), B=spongy bone, C=marrow cavity, D=epiphysis (rounded end)"],
  ["biceps_triceps_antagonistic", "a bent human arm showing the two upper-arm muscles; label the biceps (bulging on top, contracted) and the triceps (underneath, relaxed)"],
  ["heart_chambers_vessels", "a front section of the human heart with four chambers and main vessels; label W=right atrium, X=left ventricle (thick muscular wall), Y=right ventricle, Z=left atrium, plus aorta and pulmonary artery/vein"],
  ["artery_vein_capillary_xs", "three blood-vessel cross-sections side by side; label the artery (thick muscular wall, small lumen), the vein (thin wall, large lumen, valve) and the capillary (single-cell wall)"],
  ["food_web_savanna", "a savanna food web with energy-flow arrows: grass to zebra to lion, plus a vulture and decomposer microbes; label each organism"],
  ["carbon_cycle", "the carbon cycle with arrows for photosynthesis, respiration, combustion of fossil fuels and decomposition; label each arrow and highlight combustion as the largest human disturbance"],
  ["taxonomic_hierarchy_pyramid", "a taxonomic-hierarchy pyramid with levels Kingdom, Phylum, Class, Order, Family, Genus, Species stacked and worked through for the lion Panthera leo; label each level"],
  ["microbe_groups_compared", "four microbes side by side, each labelled: a virus (tiny protein coat with DNA/RNA), a bacterium (oval, no nucleus), a protist (larger cell with a nucleus) and a fungus (chain of cells with nuclei)"],
  ["moss_structure", "a moss plant; label the leafy gametophyte, the stalk (seta) and the spore capsule on top"],
  ["monocot_vs_dicot", "two angiosperm leaves side by side; label one with parallel veins (monocot) and one with a branching net-like vein pattern (dicot)"],
  ["flower_structure", "a flower cut in half lengthwise; label A=petal, B=stamen (anther on filament), C=stigma, D=ovary at the base"],
  ["seed_structure", "a bean seed cut open; label the cotyledon (food store), the embryo (becomes the new plant) and the testa (seed coat)"],
  ["invertebrate_phyla_chart", "a chart of eight invertebrate phyla with one simple representative animal each, labelled: Porifera, Cnidaria, Platyhelminthes, Annelida, Mollusca, Arthropoda, Echinodermata and Nematoda"],
  ["chloroplast_structure", "a chloroplast cut in half; label the outer membrane, the stroma and the grana (stacks of thylakoids)"],
  ["digestive_system", "the human digestive system in a body outline; label A=stomach, B=small intestine, C=large intestine, D=liver"],
  ["lung_ventilation", "the human lungs inside the chest cavity; label the trachea, bronchi, lungs, ribs and the diaphragm at the bottom"],
  ["leaf_stomata", "a leaf cross-section; label the waxy cuticle, upper and lower epidermis, the mesophyll and a stoma (pore with two guard cells) on the lower surface"],
  ["nephron_structure", "a single kidney nephron; label the glomerulus, Bowman capsule, proximal tubule, loop of Henle, distal tubule and collecting duct"],
  ["j_vs_s_curve", "a population-growth line graph of number against time showing a J-shaped exponential rise levelling into an S-shaped curve; label the carrying capacity as the plateau line"],
  ["dna_structure", "a DNA double helix; label A=sugar-phosphate backbone, B=nitrogen base, C=hydrogen bond between bases, D=a complete nucleotide"],
  ["translation_diagram", "protein synthesis (translation) at a ribosome; label the mRNA strand, the ribosome and the tRNA molecules carrying amino acids"],
  ["meiosis_stages", "the stages of meiosis in sequence, from prophase I with homologous pairs lined up and crossing over through to four haploid cells; label each stage"],
  ["female_reproductive", "the human female reproductive system, front view; label the ovary, fallopian tube (oviduct), uterus, cervix and vagina"],
  ["brain_anatomy", "the human brain, side view; label the cerebrum, cerebellum, brain stem and hypothalamus"],
  ["reflex_arc", "a reflex arc with arrows showing the path; label the receptor, sensory neuron, relay neuron in the spinal cord, motor neuron and effector (muscle)"],
  ["eye_anatomy", "a cross-section of the human eye; label the cornea, lens, iris, pupil, retina and optic nerve"],
  ["ear_anatomy", "a cross-section of the human ear; label the ear canal, eardrum, ossicles, cochlea and auditory nerve"],
  ["endocrine_glands", "a human body outline showing the endocrine glands; label the pituitary, thyroid, adrenal glands and pancreas"],
  ["glucose_homeostasis", "a glucose-regulation (homeostasis) diagram with the pancreas, liver and blood-sugar level, with arrows for the response to HIGH blood sugar (insulin) and LOW blood sugar (glucagon); label each arrow"],
  ["blood_composition_pie", "a pie chart of the composition of blood with labelled slices: plasma (~55%), red blood cells (~45%) and a thin slice for white blood cells and platelets"],
];

const GEO = [
  ["atmosphere_structure", "the layers of the atmosphere stacked from the ground up (troposphere, stratosphere, mesosphere, thermosphere); label each layer and mark the ozone layer inside the stratosphere"],
  ["rainfall_types", "the three rainfall types side by side - relief (orographic), convectional and frontal/cyclonic; label each type"],
  ["earth_structure", "a cut-away cross-section of the Earth; label the crust, mantle, outer core and inner core"],
  ["plate_boundaries", "a divergent plate-boundary cross-section; label the two plates moving apart and the rising magma that forms new crust"],
  ["fold_types", "a cross-section of folded rock layers; label the anticline (up-fold) and the syncline (down-fold)"],
  ["volcano_cross_section", "a cross-section of a volcano; label the magma chamber, the vent/pipe, the crater and the layers of lava and ash"],
  ["population_pyramids", "three population pyramids side by side; label the expansive (wide-based, fast-growing), the stationary and the constrictive shapes"],
  ["water_cycle", "the water cycle with arrows; label evaporation, condensation, precipitation and run-off"],
  ["global_insolation", "sun rays striking a curved Earth; label where rays hit directly at the Equator (most concentrated) and where they are spread out at the poles (lowest concentration)"],
  ["global_circulation", "the global atmospheric circulation cells on a half-globe; label the Hadley, Ferrel and Polar cells"],
  ["horizontal_strata", "landforms of flat-lying horizontal rock strata; label the mesa, the butte and the conical hill"],
  ["cuesta_landforms", "a cuesta cross-section of gently dipping rock; label the steep scarp slope and the gentle dip slope"],
  ["igneous_intrusions", "a cross-section of igneous intrusions; label the batholith, the dyke (vertical) and the sill (horizontal)"],
  ["slope_elements", "a hillslope cross-section; label the crest, the free face (cliff), the talus/scree slope and the pediment"],
  ["soil_erosion_types", "the types of soil erosion side by side; label sheet erosion, rill erosion and gully (donga) erosion"],
  ["midlatitude_cyclone", "a plan view of a mature mid-latitude cyclone; label the warm front, the cold front, the warm sector and the occlusion"],
  ["tropical_cyclone", "a cross-section of a tropical cyclone; label the eye, the eye wall, the spiralling rain bands and the rising air"],
  ["sa_pressure_cells", "synoptic weather-map symbols over southern Africa; label a high-pressure cell (H) and a low-pressure cell (L)"],
  ["valley_winds", "a valley cross-section at night; label the katabatic (mountain) wind draining downslope and the frost pocket at the valley floor"],
  ["drainage_patterns", "the main river drainage patterns side by side; label the dendritic, radial, trellis and rectangular patterns"],
  ["fluvial_landforms", "the lower course of a river; label the floodplain, a meander, a natural levee and an oxbow lake"],
  ["rural_settlement_shapes", "rural settlement shapes side by side; label the nucleated, dispersed, linear and cross-road patterns"],
  ["urban_models", "a concentric-zone urban land-use model; label the CBD, the transition zone, the residential zones and the rural-urban fringe"],
];

let i = 1;
const rows = [];
for (const [k, d] of LS) rows.push(["Life Sciences", `${k}.png`, "public/life-sciences/", P(d, `${k}.png`)]);
for (const [k, d] of GEO) rows.push(["Geography", `${k}.png`, "public/geography/", P(d, `${k}.png`)]);

console.log("| # | Subject | Filename | Save to folder | Prompt (paste into an image AI, then download) |");
console.log("|---|---------|----------|----------------|------------------------------------------------|");
for (const r of rows) console.log(`| ${i++} | ${r[0]} | \`${r[1]}\` | \`${r[2]}\` | ${r[3]} |`);
