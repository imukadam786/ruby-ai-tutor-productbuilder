# Life Sciences (IEB) — November papers: diagram crop list

The 10 November **IEB** Life Sciences papers (P1+P2, 2021–2025) are shipped
**text-first**: every figure, graph, karyotype, pedigree, phylogenetic tree,
table and source extract referred to by a question is described inside the
question text, so each paper is fully answerable as-is. This file lists the
figures a diagram crop would improve.

These are the **IEB** exams (assessment body: Independent Examinations Board),
a separate subject `life-sciences-ieb` / "Life Sciences (IEB)" from the DBE
`life-sciences`. Source PDFs came from the zip
`Downloads\Life SCience-20260906T180600Z-1-001.zip`.

**How these are wired:** these papers do **not** set a `diagramUrl`, so there
are **no broken-image boxes** — the questions just read as text. To attach a
cropped image later: upload the PNG to the Supabase `matric-diagrams` bucket
using the suggested filename, then add
`"diagramUrl": "<public url>/<filename>"` to that sub-question object in
`data/papers/lifesci-ieb-pX-nov-YYYY.json`.

Suggested filename convention: `lifesci-ieb-pX-nov-YYYY_qN-M.png`.

**Total: ~120 figures across 10 papers.** None block usage — all optional
visual upgrades. P1 is diagram-heavy (karyotypes, pedigrees, skulls, cladograms,
labelled anatomy); P2 case studies lean on Source Material Booklet figures.

| Paper | Essential (answer needs the figure) | Enhance (described in text) |
|---|---:|---:|
| P1 Nov 2021 | 4 | 8 |
| P1 Nov 2022 | 5 | 8 |
| P1 Nov 2023 | 7 | 12 |
| P1 Nov 2024 | 6 | 12 |
| P1 Nov 2025 | 8 | 14 |
| P2 Nov 2021 | 3 | 3 |
| P2 Nov 2022 | 3 | 2 |
| P2 Nov 2023 | 3 | 2 |
| P2 Nov 2024 | 4 | 3 |
| P2 Nov 2025 | 3 | 5 |

"Essential" = a label/letter/reading is asked that a student cannot get from the
prose alone; worth cropping first. "Enhance" = the figure is fully described in
`questionText` (or is a graph whose data values are quoted), so the crop is a
nice-to-have.

---

## P1 Nov 2021 (Answer Booklet Q1 + Q2–4)
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 1.5.2 | lifesci-ieb-p1-nov-2021_q1-5-2.png | nucleotide diagram to be labelled (phosphate / sugar / nitrogenous base) |
| 1.8.1 | lifesci-ieb-p1-nov-2021_q1-8-1.png | Figure 1.5 — female reproductive system, numbered parts 1–6 |
| 2.1.3 | lifesci-ieb-p1-nov-2021_q2-1-3.png | Figure 2.1 — karyotype of Turner syndrome (45,X) |
| 4.2.1 | lifesci-ieb-p1-nov-2021_q4-2-1.png | Figure 4.3 — longitudinal section of a pea flower, parts A–D |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 1.2.2 | lifesci-ieb-p1-nov-2021_q1-2-2.png | Figure 1.1 — foetus in the uterus, numbered areas 1–4 |
| 1.2.7 | lifesci-ieb-p1-nov-2021_q1-2-7.png | Figure 1.2 — four meiosis phases (1–4) out of order |
| 1.4.5 | lifesci-ieb-p1-nov-2021_q1-4-5.png | blank pie chart to complete for worldwide contraceptive use |
| 1.6.1 | lifesci-ieb-p1-nov-2021_q1-6-1.png | Figure 1.3 — leopard-frog (Rana spp.) monthly mating-observation graph |
| 1.7.1 | lifesci-ieb-p1-nov-2021_q1-7-1.png | Figure 1.4 — % of white vs brown mouse models attacked, inland vs dunes |
| 2.2.3 | lifesci-ieb-p1-nov-2021_q2-2-3.png | Figure 2.2 — recombinant DNA / growth-hormone production, steps 1–5 |
| 3.1.3 | lifesci-ieb-p1-nov-2021_q3-1-3.png | Figure 3.2 — phylogenetic tree of the tuatara (with python, Dasypus, Loxodonta) |
| 3.3.1 | lifesci-ieb-p1-nov-2021_q3-3-1.png | Figure 3.3 — skull of "Little Foot" with labelled structures |
| 3.4.1 | lifesci-ieb-p1-nov-2021_q3-4-1.png | Figure 3.4 — biological vs cultural evolution over millions of years |
| 4.1.5 | lifesci-ieb-p1-nov-2021_q4-1-5.png | Figure 4.2 — three survivorship curves A, B, C |

---

## P1 Nov 2022 (Answer Booklet Q1 + Q2–4)
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 1.3.1 | lifesci-ieb-p1-nov-2022_q1-3-1.png | Figure 1.4 — termite caste representatives A queen / B soldier / C worker |
| 1.6.1 | lifesci-ieb-p1-nov-2022_q1-6-1.png | carpel of a sugarcane flower to draw stamens onto and label |
| 1.7 | lifesci-ieb-p1-nov-2022_q1-7.png | Figure 1.8 — endocrine glands in the body, numbered 1–6 (+ pancreas) |
| 2.1.3 | lifesci-ieb-p1-nov-2022_q2-1-3.png | Figure 2.1 — micrograph of a sperm cell entering an ovum, parts 1–3 |
| 3.5.3 | lifesci-ieb-p1-nov-2022_q3-5-3.png | Figure 3.4 — Proteaceae phylogenetic tree (powderpuffs, spiderheads, vexators, silkypuffs, white trees) |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 1.2.3 | lifesci-ieb-p1-nov-2022_q1-2-3.png | Figure 1.1 — population size vs time, regions 1–4 |
| 1.2.4 | lifesci-ieb-p1-nov-2022_q1-2-4.png | four candidate carrying-capacity lines A–D on the growth curve |
| 1.4.2 | lifesci-ieb-p1-nov-2022_q1-4-2.png | Figure 1.5 — oxytocin, prolactin, oestrogen, progesterone during pregnancy and birth |
| 1.5.1 | lifesci-ieb-p1-nov-2022_q1-5-1.png | population pyramids for country A and country B |
| 1.8.1 | lifesci-ieb-p1-nov-2022_q1-8-1.png | table of hominid brain volumes (bar graph to be plotted) |
| 1.9 | lifesci-ieb-p1-nov-2022_q1-9.png | Figure 1.10 — skeletal features associated with bipedalism (skull, hip, leg, feet) |
| 3.1.3 | lifesci-ieb-p1-nov-2022_q3-1-3.png | Figure 3.1 — Galápagos finches and their food sources |
| 4.1.2 | lifesci-ieb-p1-nov-2022_q4-1-2.png | Figure 4.1(a) — African elephant population 1800–present |

---

## P1 Nov 2023
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 1.2.2 | lifesci-ieb-p1-nov-2023_q1-2-2.png | Figure 1 — female reproductive system, numbered parts 1–4 (HPV) |
| 1.3.1 | lifesci-ieb-p1-nov-2023_q1-3-1.png | Figure 3 — endocrine glands, lettered |
| 1.9.1 | lifesci-ieb-p1-nov-2023_q1-9-1.png | Figure 5 — insulin production by recombinant DNA technology |
| 2.2.1 | lifesci-ieb-p1-nov-2023_q2-2-1.png | Figure 8 — a stage in protein synthesis, parts W, X and positions 3–5 |
| 2.4.4 | lifesci-ieb-p1-nov-2023_q2-4-4.png | pedigree chart for autosomal-recessive Leigh syndrome (individual 3 = P) |
| 3.2.3 | lifesci-ieb-p1-nov-2023_q3-2-3.png | abalone DNA profiles: unknown vs species A, B, C |
| 4.4.2 | lifesci-ieb-p1-nov-2023_q4-4-2.png | Figure 14 — ecological succession A→B→C over time in a nature reserve |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 1.2.4 | lifesci-ieb-p1-nov-2023_q1-2-4.png | Figure 2 — structures in an ovary over a 28-day cycle, process A, structure 2 |
| 1.4.1 | lifesci-ieb-p1-nov-2023_q1-4-1.png | SA population pyramids 1980 vs 2022 |
| 1.6.1 | lifesci-ieb-p1-nov-2023_q1-6-1.png | Figure 4 — midpiece + tail of a sperm cell, head to be drawn |
| 1.7.3 | lifesci-ieb-p1-nov-2023_q1-7-3.png | Table 1 midpiece length vs swimming speed (line graph to plot) |
| 1.8.1 | lifesci-ieb-p1-nov-2023_q1-8-1.png | diabetes infographic |
| 1.10.1 | lifesci-ieb-p1-nov-2023_q1-10-1.png | Figure 6 — four cells at the end of telophase II of meiosis |
| 2.1.3 | lifesci-ieb-p1-nov-2023_q2-1-3.png | Figure 7 — Watson & Crick's incorrect DNA model |
| 3.1.3 | lifesci-ieb-p1-nov-2023_q3-1-3.png | survivorship curve to sketch for abalone |
| 3.4.1 | lifesci-ieb-p1-nov-2023_q3-4-1.png | Figure 10 — abalone shell growth & seaweed consumed vs population density |
| 4.1.2 | lifesci-ieb-p1-nov-2023_q4-1-2.png | Figure 12 — marine food web (killer whale, great white, seals, fish, plankton, algae) |
| 4.3.1 | lifesci-ieb-p1-nov-2023_q4-3-1.png | Figure 13 — great white shark sightings in False Bay since 2004 (killer whales marked) |
| 4.4.2b | lifesci-ieb-p1-nov-2023_q4-4-2b.png | Figures 11 & 12 — Knysna forest vs SA grassland |

---

## P1 Nov 2024
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 1.4.1 | lifesci-ieb-p1-nov-2024_q1-4-1.png | Figure 3 — three hominid skulls + data (A. africanus, H. neanderthalensis, H. sapiens) |
| 1.7.1 | lifesci-ieb-p1-nov-2024_q1-7-1.png | Figure 5 — homologous chromosome pair (chromosomes A and B, crossing-over arrows) |
| 1.9.3 | lifesci-ieb-p1-nov-2024_q1-9-3.png | Figure 6 — X-linked recessive ichthyosis pedigree (individuals A–L) |
| 3.1.3 | lifesci-ieb-p1-nov-2024_q3-1-3.png | Figure 9 — sea anemone quadrat grid (species X and Y counts per quadrat) |
| 4.1.1 | lifesci-ieb-p1-nov-2024_q4-1-1.png | Figure 13 — three antibiotics acting on bacterial protein synthesis, parts A, C, D |
| 4.2.4 | lifesci-ieb-p1-nov-2024_q4-2-4.png | three candidate cladograms A/B/C for normal, MDR-TB, XDR-TB |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 1.2.2 | lifesci-ieb-p1-nov-2024_q1-2-2.png | Figure 1 — original / isolated / new population (migration) |
| 1.2.3–1.2.5 | lifesci-ieb-p1-nov-2024_q1-2-3.png | phylogenetic tree, species 1–10, branch points W/X/Y/Z |
| 1.2.6 | lifesci-ieb-p1-nov-2024_q1-2-6.png | Figure 2 — running-speed distribution of a rat population |
| 1.3.2 | lifesci-ieb-p1-nov-2024_q1-3-2.png | DNA monomer to draw from the key |
| 1.6.2 | lifesci-ieb-p1-nov-2024_q1-6-2.png | Figure 4 — three population-pyramid types A/B/C |
| 1.8.1 | lifesci-ieb-p1-nov-2024_q1-8-1.png | table of hominid brain volumes (bar graph to plot) |
| 2.2.1 | lifesci-ieb-p1-nov-2024_q2-2-1.png | Table 2 — spotted hyena & impala numbers 2010–2019 (line graph to plot) |
| 2.3.3 | lifesci-ieb-p1-nov-2024_q2-3-3.png | Figure 7 — Africa map: black-faced vs common impala distribution + fossil sites |
| 3.2.2 | lifesci-ieb-p1-nov-2024_q3-2-2.png | Figure 10 — % vegetation cover of a forest ecosystem over time (logging) |
| 3.2.5 | lifesci-ieb-p1-nov-2024_q3-2-5.png | Figures 11 & 12 — forest vs grassland |
| 4.1.2 | lifesci-ieb-p1-nov-2024_q4-1-2.png | Figure 13 detail — translation stage for naming/describing |
| 4.2.1 | lifesci-ieb-p1-nov-2024_q4-2-1.png | Figure 14 — normal vs mutated TB DNA sequence (substitution) |

---

## P1 Nov 2025
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 1.2.1–1.2.3 | lifesci-ieb-p1-nov-2025_q1-2.png | Figure 1 — male reproductive system, numbered parts 1–10 |
| 1.4.1 | lifesci-ieb-p1-nov-2025_q1-4-1.png | Figure 3 — female reproductive system (endometrium + contraceptive symbols to draw) |
| 1.7.1 | lifesci-ieb-p1-nov-2025_q1-7-1.png | two hominid skulls A (3–4 mya) and B (0–0,5 mya): underneath + side views, labelled features |
| 1.8.1 | lifesci-ieb-p1-nov-2025_q1-8-1.png | Figure 4 — hominid brain volume vs time (species 1–4) |
| 2.2.2 | lifesci-ieb-p1-nov-2025_q2-2-2.png | Figure 6 — rBST production via transgenic E. coli, steps 1–6 |
| 3.1.1 | lifesci-ieb-p1-nov-2025_q3-1-1.png | Learner A vs Learner B crossing-over diagrams (homologous pair before crossing over) |
| 3.3.1 | lifesci-ieb-p1-nov-2025_q3-3-1.png | Figure 8 — amniocentesis procedure, numbered parts 1–4 + liquid X |
| 3.3.5 | lifesci-ieb-p1-nov-2025_q3-3-5.png | karyotype of a normal foetus (to be altered to trisomy 18) |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 1.2.5 | lifesci-ieb-p1-nov-2025_q1-2-5.png | Figure 2 — electron micrograph of a seminiferous tubule, width X–Y |
| 1.5.1 | lifesci-ieb-p1-nov-2025_q1-5-1.png | Table 2 — Chargaff's base-composition data (human, wheat, rat) |
| 1.6 | lifesci-ieb-p1-nov-2025_q1-6.png | evolutionary tree, species A–M over 10 million years (M and H reach present) |
| 1.8.2 | lifesci-ieb-p1-nov-2025_q1-8-2.png | Figure 4 again — X to be placed for Homo naledi |
| 2.3.1 | lifesci-ieb-p1-nov-2025_q2-3-1.png | Figure 7 — mRNA sequence for a section of bovine somatotropin (codon 1 = CGA) |
| 3.2.2 | lifesci-ieb-p1-nov-2025_q3-2-2.png | trisomy 18 incidence per 1 000 pregnancies by maternal age group (histogram to plot) |
| 4.1.4 | lifesci-ieb-p1-nov-2025_q4-1-4.png | axes for the Parus major survivorship curve |
| 4.2.1 | lifesci-ieb-p1-nov-2025_q4-2-1.png | Figure 10 — Parus major populations A (England), B & C (Netherlands) + range map |
| 4.4.1 | lifesci-ieb-p1-nov-2025_q4-4-1.png | Figure 12 — sunflower compound head: ray flower + disc flower (stigma, style, anther, ovary) |

---

## P2 Nov 2021 (Source Material Booklet: butterflies, dung beetles, hunting essay)
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 1.3 | lifesci-ieb-p2-nov-2021_q1-3.png | Figure 1.1 — four SA butterfly species A–D, each with its own scale bar |
| 1.7 | lifesci-ieb-p2-nov-2021_q1-7.png | Figure 1.9 — three sites A/B/C: Shepherd Bush distribution and sampled quadrats |
| 2.4 | lifesci-ieb-p2-nov-2021_q2-4.png | Figure 2.5 — tracks of 7 dung beetles at a cow-dung pile |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 1.8 | lifesci-ieb-p2-nov-2021_q1-8.png | Figure 1.5 — Northern Cape rainfall 2017–2020 vs robber fly & butterfly numbers |
| 1.10 | lifesci-ieb-p2-nov-2021_q1-10.png | Figure 1.10 — social-media "windscreen study" advert |
| 2.3 | lifesci-ieb-p2-nov-2021_q2-3.png | Figures 2.2 & 2.3 — dung-usage methods; Aphodius vs Kheper (life size) |

---

## P2 Nov 2022 (Source Material Booklet: porphyria/CEP, mtDNA & ancestry, women in genetics essay)
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 1.4 | lifesci-ieb-p2-nov-2022_q1-4.png | Figure 1.5 — pedigree of a family with CEP (A/a alleles) |
| 1.8 | lifesci-ieb-p2-nov-2022_q1-8.png | Figures 1.7 & 1.8 — CRISPR editing of the mutant U1 gene + mRNA codon table |
| 2.4.3 | lifesci-ieb-p2-nov-2022_q2-4-3.png | Figure 2.6 — six DNA-fingerprint gels: two sets of parents + two babies |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 2.3.1 | lifesci-ieb-p2-nov-2022_q2-3-1.png | Tables 2.1 & 2.2 — mtDNA (L0d/L1/U) and Y-chromosome (A/E/I) haplogroup percentages |
| 2.4.1 | lifesci-ieb-p2-nov-2022_q2-4-1.png | Figure 2.5 — human X and Y chromosomes |

---

## P2 Nov 2023 (Source Material Booklet: Little Foot/hominids, stick-insect evolution, selection & climate essay)
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 1.5 | lifesci-ieb-p2-nov-2023_q1-5.png | Figure 1.6 — skeleton of "Little Foot" (bipedal + quadrupedal features) |
| 1.7 | lifesci-ieb-p2-nov-2023_q1-7.png | Figure 1.8 — hominid cladogram, points A/B/C |
| 2.4 | lifesci-ieb-p2-nov-2023_q2-4.png | three candidate cladograms A/B/C + results table for four stick-insect species |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 2.1 | lifesci-ieb-p2-nov-2023_q2-1.png | Figure 2.4 — different stick-insect species with scale line AB |
| 2.4.2 | lifesci-ieb-p2-nov-2023_q2-4-2.png | Figure 2.5 — stick-insect fossil sequence + New Caledonia environmental change |

---

## P2 Nov 2024 (Source Material Booklet: Succulent Karoo daisies, elephant population control, advanced maternal age essay)
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 1.3.2 | lifesci-ieb-p2-nov-2024_q1-3-2.png | Figure 1.3 — angiosperm flower, parts A–G |
| 1.3.3 | lifesci-ieb-p2-nov-2024_q1-3-3.png | Figure 1.4 — daisy flower in longitudinal section (for magnification calc) |
| 1.3.4 | lifesci-ieb-p2-nov-2024_q1-3-4.png | Figure 1.5 — male and female parts of a daisy floret |
| 2.4.2 | lifesci-ieb-p2-nov-2024_q2-4-2.png | Figure 2.4 — negative-feedback control of the menstrual cycle + immunocontraception |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 1.3.1 | lifesci-ieb-p2-nov-2024_q1-3-1.png | Figure 1.4 context — daisy longitudinal section |
| 2.4.1 | lifesci-ieb-p2-nov-2024_q2-4-1.png | Figure 2.4 detail — hormones FSH & oestrogen for matching |
| 2.5.2 | lifesci-ieb-p2-nov-2024_q2-5-2.png | Table 2.1 — calving % and sterilisation % over the vaccine programme years |

---

## P2 Nov 2025 (Source Material Booklet: nature-based farming & succession, West African lions, lion-census-accuracy essay)
### Essential
| Question | Suggested file | Caption |
|---|---|---|
| 2.2.4(a) | lifesci-ieb-p2-nov-2025_q2-2-4a.png | Source 5 / Figures 2.6–2.9 — WAP complex trophic data (lion, buffalo, kob, grass) |
| 2.2.4(d) | lifesci-ieb-p2-nov-2025_q2-2-4d.png | Figure 2.8 — lion temporal activity vs pastoralist / livestock encroachment |
| 2.3.1 | lifesci-ieb-p2-nov-2025_q2-3-1.png | Figure 2.2 — population pyramids for Benin, Burkina Faso, Niger |

### Enhance
| Question | Suggested file | Caption |
|---|---|---|
| 1.2.2 | lifesci-ieb-p2-nov-2025_q1-2-2.png | Table 1.1 — SA land-cover categories |
| 1.3.1–1.3.2 | lifesci-ieb-p2-nov-2025_q1-3.png | Figure 1.2 — succession on abandoned farmland (successional states + plant groups) |
| 1.6.1 | lifesci-ieb-p2-nov-2025_q1-6-1.png | Figure 1.5 A — rodent response to barn-owl reintroduction in Kenya |
| 1.6.3 | lifesci-ieb-p2-nov-2025_q1-6-3.png | Figure 1.5 B — large-herbivore effects on grassland resources |
| 2.3.3 | lifesci-ieb-p2-nov-2025_q2-3-3.png | Figure 2.9 — West African lion numbers 2012–2025 in the WAP complex |
