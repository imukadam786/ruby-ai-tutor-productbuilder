# Natural Sciences (Senior Phase, Gr 7–9) — Image Requirements

Running manifest of every image the subject needs. Head of ed creates the
artwork; engineering drops the files into `public/natural-sciences-sp/<key>.webp`
(the session tries png → svg → jpg → webp, then falls back to the text in the
question, so a missing file never breaks a question).

## How a question requests an image
A bank question uses `input_type: "diagram-label"` (or carries `image_refs`) and
names the file by key, e.g. `"image_refs": ["g7-circuit-series"]` → the app loads
`/natural-sciences-sp/g7-circuit-series.webp`.

## Asset types
- **thumbnail** — subject tile on the Subjects hub
- **diagram** — labelled science diagram used inside a question (1024px)
- **photo** — real-world photo for a scenario/identification question

---

## Phase 1 — shell assets (needed now)

| Key / path | Type | What it shows | Status |
|---|---|---|---|
| `/thumbnails/natural-sciences-sp.webp` | thumbnail | Subject tile for the Subjects hub & Progress tab (science / microscope / planet motif, rose accent) | ⏳ needed |

> Until the thumbnail exists the subject card shows a broken image. Low priority
> for dev; required before the subject is shown to learners.

## Phase 3 — Grade 7 per-question diagrams (REQUIRED)

Grade 7 question pools are authored (340 questions). **Four questions** reference
a diagram. Each is still answerable from the question text alone (the app shows a
text fallback until the image exists), but the image makes them clearer. Files go
in `public/natural-sciences-sp/<key>.webp`.

| Image key | Type | What it must show | Topic | Question ref |
|---|---|---|---|---|
| `g7-flower-parts` | diagram | A labelled cross-section of a flower: stigma, anther, filament, petal, sepal, ovary/ovule | Sexual reproduction (NSSP.G7.LL.A3) | G7.LL.A3.05 |
| `g7-periodic-table` | diagram | A simplified Periodic Table with the metal region (left/middle) and non-metal region (right) clearly shaded | Intro to the Periodic Table (NSSP.G7.MM.A4) | G7.MM.A4.14 |
| `g7-earth-tilt-seasons` | diagram | The tilted Earth orbiting the Sun, one hemisphere leaning toward the Sun (summer) and the other away (winter) | Sun–Earth relationship (NSSP.G7.PEB.A1) | G7.PEB.A1.06 |
| `g7-tides-moon` | diagram | The Earth, its oceans and the Moon, with the water bulging toward and away from the Moon (the two high tides) | Moon–Earth relationship (NSSP.G7.PEB.A2) | G7.PEB.A2.06 |

## Phase 3 — Grade 8 per-question diagrams (REQUIRED)

Grade 8 question pools are authored (260 questions). **Four questions** reference
a diagram (same text-fallback behaviour as Grade 7).

| Image key | Type | What it must show | Topic | Question ref |
|---|---|---|---|---|
| `g8-atom-structure` | diagram | A simple labelled atom: a central nucleus (protons + neutrons) with electrons around the outside | Atoms (NSSP.G8.MM.A1) | G8.MM.A1.06 |
| `g8-simple-circuit` | diagram | A simple closed circuit: cell, switch, bulb and connecting wires forming a complete loop | Energy transfer in electrical systems (NSSP.G8.EC.A2) | G8.EC.A2.05 |
| `g8-series-parallel` | diagram | Two circuits side by side — one series (single loop, two bulbs) and one parallel (two bulbs on separate branches) | Series & parallel circuits (NSSP.G8.EC.A3) | G8.EC.A3.06 |
| `g8-solar-system` | diagram | The Sun at the centre with the planets orbiting it (Mercury → outward), clearly showing the Sun as the central star | The Solar System (NSSP.G8.PEB.A1) | G8.PEB.A1.06 |

## Phase 3 — Grade 9 per-question diagrams (REQUIRED)

Grade 9 question pools are authored (480 questions). **Six questions** reference a
diagram (same text-fallback behaviour as Grades 7–8).

| Image key | Type | What it must show | Topic | Question ref |
|---|---|---|---|---|
| `g9-cell-structure` | diagram | A labelled cell showing the cell membrane, cytoplasm and nucleus (ideally a plant cell with cell wall + chloroplasts for contrast) | Cells as the basic units of life (NSSP.G9.LL.A1) | G9.LL.A1.06 |
| `g9-heart-lungs` | diagram | A simple labelled diagram of the heart and lungs, showing the lungs as where air is taken in | Circulatory & respiratory systems (NSSP.G9.LL.A4) | G9.LL.A4.06 |
| `g9-digestive-system` | diagram | The digestive tract labelled: mouth, oesophagus, stomach, small intestine, large intestine | Digestive system (NSSP.G9.LL.A5) | G9.LL.A5.06 |
| `g9-series-parallel-bulbs` | diagram | Two circuits side by side — one series (single loop), one parallel (bulbs on separate branches) | Series & parallel circuits (NSSP.G9.EC.A4) | G9.EC.A4.06 |
| `g9-rock-cycle` | diagram | The rock cycle, showing igneous (cooling), sedimentary (pressed layers) and metamorphic (heat & pressure) and the arrows between them | Lithosphere & the rock cycle (NSSP.G9.PEB.A2) | G9.PEB.A2.06 |
| `g9-atmosphere-layers` | diagram | The layers of the atmosphere from the ground up: troposphere, stratosphere, mesosphere, thermosphere | Atmosphere (NSSP.G9.PEB.A4) | G9.PEB.A4.06 |

---

## Summary of all image needs

- **Subject thumbnail:** 1 (`/thumbnails/natural-sciences-sp.webp`)
- **Grade 7 diagrams:** 4 · **Grade 8 diagrams:** 4 · **Grade 9 diagrams:** 6
- **Total: 14 diagrams + 1 thumbnail**

All diagram questions are answerable from the question text until the artwork exists.
