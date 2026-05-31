# Life Sciences — image manifest (Grade 10)

This is the list of biological diagrams the question bank references via
`image_refs`. For each key below, drop a file at
`public/life-sciences/<key>.<ext>` (PNG or SVG, ideally 800–1200px wide).
Until the file exists the front-end shows the stem text only and the
`diagram-label` items fall back to "answer from description" mode.

Same pattern as `scripts/afrikaans-image-manifest.md` and
`scripts/life-skills-image-map.mjs` — single source of truth keys, files
land in `public/life-sciences/`, no bank edit needed when an image arrives.

## Status legend
- **Authored** = a question already in the bank references this key.
- **Planned** = will be referenced when the listed atomic skills are authored.

## Authored references (Grade 10 — 4 topics so far)

| Image key | Used by | What it shows | Status |
|---|---|---|---|
| `plant_cell_labelled` | `G10.CELL.A1.05` | Plant cell with labels A=cell wall, B=cell membrane, C=large central vacuole, D=chloroplast (oval green), E=nucleus | Authored |
| `animal_cell_labelled` | `G10.CELL.A1.06` | Animal cell with labels W=nucleus, X=mitochondrion (sausage with cristae), Y=Golgi body, Z=ribosomes | Authored |
| `mitosis_telophase` | `G10.MITO.A1.09` | Cell in telophase: two clusters of chromosomes at opposite poles, nuclear membranes reforming | Authored |

## Planned references (Grade 10 — to be authored in next bank push)

Each row below is an atomic skill where the format proof shows a `diagram-label`
or `data-interpret` item is in the planned 20-item pool. The image key is
proposed; the final ref number will be assigned when the item is authored.

| Image key | Skill | What it should show | Strand |
|---|---|---|---|
| `mitosis_phases_sequence` | LSC.G10.S1.MITO.A1 | All four phases (prophase, metaphase, anaphase, telophase) side by side for ordering items | S1 |
| `xylem_phloem_cross_section` | LSC.G10.S2.PTRN.A2 | Stem cross-section labelling xylem vessels, phloem sieve tubes, companion cells | S2 |
| `transpiration_pull_diagram` | LSC.G10.S2.PTRN.A2 / A3 | Water column moving from root → stem → leaf, with stomata losing water vapour | S2 |
| `human_skeleton_axial_appendicular` | LSC.G10.S2.ASUP.A1 | Whole skeleton with axial parts (skull, ribs, vertebrae) coloured differently from appendicular (limbs, girdles) | S2 |
| `long_bone_structure` | LSC.G10.S2.ASUP.A1 | Long bone cross-section: compact bone, spongy bone, marrow cavity, epiphysis, diaphysis | S2 |
| `joint_types_hinge_balljoint` | LSC.G10.S2.ASUP.A1 / A3 | Side-by-side: hinge joint (elbow) and ball-and-socket (shoulder/hip) | S2 |
| `biceps_triceps_antagonistic` | LSC.G10.S2.ASUP.A3 | Arm bent and straight, biceps + triceps labelled with contraction state | S2 |
| `heart_chambers_vessels` | LSC.G10.S2.CIRC.A1 | Frontal section: 4 chambers, AV valves, semilunar valves, aorta, pulmonary artery/vein, vena cavae | S2 |
| `double_circulation_pathway` | LSC.G10.S2.CIRC.A1 | Heart + lungs + body schematic showing pulmonary and systemic loops with deoxy/oxy blood colour-coded | S2 |
| `artery_vein_capillary_xs` | LSC.G10.S2.CIRC.A2 | Three vessel cross-sections side by side with wall thickness and lumen labelled | S2 |
| `blood_composition_pie` | LSC.G10.S2.CIRC.A2 | Pie chart: red cells, white cells, platelets, plasma percentages | S2 |
| `cardiac_cycle_phases` | LSC.G10.S2.CIRC.A4 | Three-panel sequence: atrial systole, ventricular systole, diastole with arrows | S2 |
| `food_web_savanna` | LSC.G10.S3.ECO.A2 | Savanna food web (grass, zebra, lion, vulture, microbes) with energy-flow arrows | S3 |
| `energy_pyramid` | LSC.G10.S3.ECO.A2 | Pyramid of energy, four trophic levels labelled in kJ | S3 |
| `carbon_cycle` | LSC.G10.S3.ECO.A3 | Photosynthesis ↔ respiration + combustion + decomposition arrows | S3 |
| `nitrogen_cycle` | LSC.G10.S3.ECO.A3 | N2 fixation → nitrification → uptake → denitrification | S3 |
| `water_cycle` | LSC.G10.S3.ECO.A3 | Evaporation, condensation, precipitation, run-off | S3 |
| `sa_biomes_map` | LSC.G10.S3.ECO.A1 / S4.BIO.A3 | SA outline with Fynbos, Grassland, Savanna, Karoo, Forest, Thicket coloured regions | S3, S4 |
| `dichotomous_key_example` | LSC.G10.S4.BIO.A2 | Simple key with branching steps to identify four organisms | S4 |
| `taxonomic_hierarchy_pyramid` | LSC.G10.S4.BIO.A1 | KPCOFGS levels stacked, with a worked example for *Panthera leo* | S4 |
| `geological_timescale` | LSC.G10.S4.HOL.A1 / A2 | Bar with eras (Paleozoic / Mesozoic / Cenozoic) and key events marked | S4 |
| `sa_cradle_of_humankind_map` | LSC.G10.S4.HOL.A2 | Map of SA showing Sterkfontein, Malapa, Karoo basin fossil sites | S4 |

## Notes
- All images must be CAPS-appropriate and clearly labelled. Photos are fine where they help (real SA biome photos, fossil photos) but diagrams beat photos for label items.
- **Fallback behaviour**: if a key is missing at runtime, the question still renders — the stem already includes a text description (e.g. "Diagram: plant cell with labels A=cell wall …") so the learner can answer from the description.
- **Licensing**: prefer Creative Commons / open-license biology resources (Wikimedia Commons, OpenStax Biology) or original commissioned art.
- Suggested filenames: `<key>.png` at 1000–1500px wide, transparent background where possible.
