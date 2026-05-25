# Life Skills picture assets

Image files live here as `public/life-skills/<key>.<ext>` (png / svg / jpg, tried
in that order — the shipped set is `.svg`). One clear subject per image, plain
white background, child-friendly, roughly square — same guidelines as the
Afrikaans set.

## Current status — 20 of 55 image-match questions pictured

The pipeline is built and **live**: 20 image-match questions now show real
picture tiles; the other 35 stay as clean text buttons because they each have at
least one option that's a behaviour, scene or abstract idea (e.g. "a child
laughing at someone", "a dot in the north-east") that a single icon can't
honestly show. The free icon library also covers extra single objects (car, tree,
flag, etc.) that are pre-done and will complete their question for free once its
remaining scene options get real illustrations.

Three scripts do the work, all driven by one map
(`scripts/life-skills-image-map.mjs`):

```
node scripts/fetch-life-skills-images.mjs          # download the icons -> here
node scripts/inject-life-skills-image-refs.mjs      # wire keys into the bank
node scripts/make-life-skills-contact-sheet.mjs     # build _contact-sheet.html
```

Open **`_contact-sheet.html`** in a browser to eyeball every icon next to the
option label it stands for.

## How a question gets pictures

`scripts/inject-life-skills-image-refs.mjs` adds an `image_refs` array (parallel
to `options`, same order) to a bank item — but **only when every option maps to
an icon that exists here**, so a question is never half-pictures / half-text.
Any individual file that goes missing still falls back to its text label.

To picture more questions: add the option text → key in `LABEL_TO_KEY` and the
key → Twemoji codepoint in `KEY_TO_EMOJI` (both in
`scripts/life-skills-image-map.mjs`), then re-run the three scripts above.

## Icons & attribution

Icons are [Twemoji](https://github.com/jdecked/twemoji) (Twitter/X), licensed
**CC-BY 4.0** — keep this credit if the app ships these assets. A few keys are
honest approximations of SA-specific things with no emoji of their own (marked
`APPROX` in the map): `food_pap`, `food_stew`, `food_plate`, `animal_springbok`,
`animal_antelope`. Swap these for real illustrations later by dropping a file
with the same key name here — no bank change needed.

## What still needs pictures

Run `node scripts/audit-life-skills-images.mjs` for the full list of all 55
image-match items with their questions and options. The 36 still on text are
listed by `node scripts/inject-life-skills-image-refs.mjs --dry` under "Unmapped
option labels".
