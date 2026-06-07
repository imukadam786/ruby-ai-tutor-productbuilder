# Technology SP — Image Manifest

Technology is a visual subject (drawings, trusses, circuits, gears). Per the
build decision **"wait for art"**, every question currently in the bank is
**answerable from text alone**. The diagrams below are needed to (a) enrich the
drawing-heavy skills and (b) unlock the *held* image-only questions that cannot
exist without a picture. Until the art exists, the seven drawing-heavy pools ship
**below the 20-item target** (16 or 14 items each) — this is intentional, not a
gap to pad with filler.

The head of ed creates these via the image pipeline
(`scripts/convert-question-images.mjs`, diagram = 1024px). Files are served from
`public/technology-sp/<key>.webp` with a text fallback.

## Subject thumbnail
- `public/thumbnails/technology-sp.webp` — subject card tile (512×512). Source
  supplied by head of ed (`technology thumbnail.jpeg`). **Required** or the card
  shows a broken tile.

## Drawing-heavy pools (currently text-only, < 20 items)

| Skill | Pool | Items now | Diagrams needed to reach 20 / unlock held questions |
|---|---|---|---|
| G7.DG.A5 | Drawing techniques | 14 | `g7-oblique-example`, `g7-1pt-perspective-example`, `g7-working-drawing-example` — "identify the technique / read this drawing" questions |
| G8.DG.A1 | Graphics conventions | 16 | `g8-line-types-key`, `g8-dimensioned-drawing` — "name this line type / read this dimension" |
| G8.DG.A2 | Isometric & 2-point perspective | 16 | `g8-isometric-cube`, `g8-2pt-perspective-box` — "which drawing is isometric / find the vanishing points" |
| G8.ST.A1 | Frame members & roof trusses | 16 | `g8-roof-truss-labelled` (king/queen post, strut, tie, rafter, tie beam), `g8-truss-forces` — "name member X / which force is in member Y" |
| G9.DG.A1 | First-angle orthographic projection | 16 | `g9-ortho-3views`, `g9-ortho-match-object` — "match front/top/side view to the 3D object" |
| G9.DG.A2 | Working drawings & design problems | 16 | `g9-stair-ramp-drawing` — "read the riser height / gradient from this plan" |
| G9.DG.A3 | Artistic & exploded assembly drawing | 16 | `g9-exploded-view`, `g9-1pt-perspective-realism` — "what is the assembly order from this exploded view" |

## Optional enrichment diagrams (existing text questions work; art would help)
These pools are already at 20 text-only items, but diagrams would strengthen them:
- G7.MS.A1 lever classes diagram (`g7-lever-classes`)
- G7.ES.A2 simple circuit with symbols (`g7-simple-circuit`)
- G8.MS.A2 spur gears + idler (`g8-gears-idler`)
- G8.MS.A4 cam + follower / snail cam (`g8-cam-follower`)
- G9.ES.A2 resistor colour-band chart (`g9-resistor-colour-code`)
- G9.ES.A3 electronic component symbols (`g9-electronic-symbols`)
- G9.MS.A3 bevel / rack-and-pinion / worm gears (`g9-advanced-gears`)

## Status
- All 62 pools authored; 55 at the full 20-item target, 7 drawing-heavy pools at
  14–16 (held image questions pending art).
- Total: **1,210 questions**, all tap-only, all validated (unique refs, valid
  payloads, memos + error signals + difficulty present).
