# Life Skills Grade 4–6 — image audit

Audit of all 920 Intermediate Phase (Grade 4–6) Personal & Social Well-being items in `data/life-skills-question-bank.json`. Identifies which items already need a picture, which items would become clearer if converted to image-match, and for each candidate says whether a Twemoji-style icon is enough or a real illustration is needed.

## Headline numbers

| Bucket | Items | Notes |
|---|---|---|
| **Already image-match in the bank** | 4 | One in Gr4 emotions, two in Gr4 religions, one in Gr5 religious festivals. All four are Twemoji-able with small additions to `KEY_TO_EMOJI`. |
| **Strong candidates to convert to image-match — Twemoji is enough** | 27 | Concrete single-object questions: foods, drinks, traffic signs, hygiene items, religious symbols, the SA flag. Two-thirds reuse Twemoji shapes that already exist. |
| **Strong candidates to convert — needs a real illustration** | 14 | SA-specific scenes (Voortrekker biltong heritage, Zulu reed dance, ulwaluko, etc.), specific symbols Twemoji doesn't carry (SA coat of arms, religious places like a mosque exterior), and scene compositions (someone in distress + a trusted adult). |
| **Honest text-only — adding a picture wouldn't help** | 875 | Abstract concepts: rights, responsibilities, mediation, dignity, U=U, gender equality, conflict-resolution skills, etc. PSW content is mostly relational and conceptual — pictures would clutter, not clarify. |

Of the 41 "strong candidates", **27 are Twemoji-coverable** (mostly with `KEY_TO_EMOJI` additions to the existing map) and **14 need a real illustration**. Add the 4 already-flagged image-match items and you get **45 items total that would benefit from a picture**, of which **31 can ship with Twemoji** and **14 need real artwork**.

For comparison, FP had 55 image-match items hard-required; IP has 4 hard-required plus 41 we'd recommend converting.

---

## Grade 4 — 24 candidates

### Already image-match (3 items)

| Topic | Ref | Question | What the image needs to show | Coverage |
|----|----|----|----|----|
| LS.L4.PSW.T04 Emotions | T04.02 | Which face shows happiness? | Smiling, frowning, crying, angry faces | ✅ **Twemoji** — 1f600 / 1f641 / 1f622 / 1f620 |
| LS.L4.PSW.T09 Religions | T09.15 | Match symbol to religion: crescent moon | Cross, Star of David, crescent moon + star, Om | ✅ **Twemoji** — 271d / 2721 / 262a / 1f549 |
| LS.L4.PSW.T09 Religions | T09.16 | Match symbol to religion: the cross | Cross, Star of David, crescent moon + star, Om | ✅ Same set as T09.15 |

### Strong candidates to convert — Twemoji enough (16)

| Topic | Ref | Current type | Question (short) | What a picture should show | Twemoji |
|----|----|----|----|----|----|
| LS.L4.PSW.T08 Cultures | T08.02 | choice | Which is a South African food? | Pap and stew / spaghetti / sushi / croissant | ✅ reuses `food_stew` (existing APPROX) + 1f35d / 1f363 / 1f950 |
| LS.L4.PSW.T10 Water dangers | T10.08 | choice | Which is a SAFETY ITEM at a pool? | Life ring / bread / textbook / teapot | ✅ 1f6df / `food_bread` / `obj_book` / 1fad6 |
| LS.L4.PSW.T11 Traffic rules | T11.02 | choice | Which colour traffic light means STOP? | Red / green / yellow / blue dot or light | ✅ 1f534 / 1f7e2 / 1f7e1 / 1f535 |
| LS.L4.PSW.T11 Traffic rules | T11.04 | choice | What should you wear in a car? | Seatbelt / hat / sunglasses / earrings | ✅ hat `obj_hat` + 1f576 / 1f4ff — seatbelt has no Twemoji (use car icon as APPROX) |
| LS.L4.PSW.T11 Traffic rules | T11.05 | choice | What should you wear on a bicycle? | Helmet / slippers / long dress / sunglasses | ✅ helmet 26d1 + `obj_shoes` / 1f457 / 1f576 |
| LS.L4.PSW.T11 Traffic rules | T11.09 | choice | A red triangle road sign usually means | Warning triangle / heart / smiley / star | ✅ 26a0 / 2764 / 1f600 / 2b50 |
| LS.L4.PSW.T12 Hygiene | T12.01 | choice | Which is a personal hygiene item that should NOT be shared? | Toothbrush / book / pen / football | ✅ 1faa5 / `obj_book` / 1f58a / 26bd |
| LS.L4.PSW.T13 Diet | T13.01 | choice | Which is bad for teeth if eaten very often? | Sweets and fizzy / apples / water / carrots | ✅ `food_sweet` + `food_fizzy` / `food_apple` / 1f4a7 / `food_carrot` |
| LS.L4.PSW.T13 Diet | T13.03 | choice | Which is BEST for your teeth to drink? | Water / fizzy / energy drink / sweet juice | ✅ 1f4a7 / `food_fizzy` / 1f95b / 1f9c3 |
| LS.L4.PSW.T13 Diet | T13.06 | choice | Which is a HEALTHY snack between meals? | Apple or carrot / chips / chocolate / sweets | ✅ `food_apple` + `food_carrot` / `food_chips` / `food_chocolate` / `food_sweet` |
| LS.L4.PSW.T13 Diet | T13.15 | choice | BEST as a lunch-pack drink? | Water / fizzy / sweetened juice / energy drink | ✅ 1f4a7 / `food_fizzy` / 1f9c3 / 1f95b |
| LS.L4.PSW.T13 Diet | T13.07 | choice | Which has LOTS of hidden sugar? | Sweetened cold drink / water / apple / pap | ✅ `food_fizzy` / 1f4a7 / `food_apple` / `food_pap` |
| LS.L4.PSW.T14 Environment | T14.02 | choice | Land pollution? | Plastic bottles on ground / grass / trees / clean road | ✅ 1f5d1 + 1f37c-shape / 1f33f / `obj_tree` / 1f6e3 |
| LS.L4.PSW.T14 Environment | T14.10 | choice | Arbor Day is for: | Planting trees / cutting trees / dumping / burning | ✅ `obj_tree` + 1f331 / 1fa93 / 1f5d1 / 1f525 |
| LS.L4.PSW.T15 HIV basics | T15.07 | choice | If you see a used needle on the ground… | Needle / sweets / toys / books | ✅ 1f489 / `food_sweet` / 1f9f8 / `obj_book` |
| LS.L4.PSW.T15 HIV basics | T15.20 | choice | HIV today: which sentence is true? (red ribbon) | Red ribbon as a Hope/HIV symbol — could decorate the topic | ✅ 1f397 |

### Strong candidates to convert — needs real illustration (5)

| Topic | Ref | Why no Twemoji | What the picture must show |
|----|----|----|----|
| LS.L4.PSW.T08 Cultures | T08.03 | Cape Malay bobotie origin — no honest emoji for cuisine heritage | A plate of bobotie next to a Cape Malay-style background; alternative dishes from Italy, USA, China for the wrong options |
| LS.L4.PSW.T08 Cultures | T08.10 | Voortrekker/biltong heritage — biltong has no Twemoji; the question is about origin | A wagon/ox or biltong-drying scene for the right answer; flags or scenes from other heritages for wrong options |
| LS.L4.PSW.T08 Cultures | T08.14 | Zulu reed dance has no Twemoji | A real photo or illustration of the Zulu reed dance (Umkhosi woMhlanga) vs Spanish flamenco, Aboriginal Australian dance, US line dancing |
| LS.L4.PSW.T09 Religions | T09.02–T09.05 | Places of worship — Twemoji has church (26ea) and mosque (1f54c) and synagogue (1f54d) and Hindu temple (1f6d5) BUT the question is "which place do Christians/Muslims/Jews/Hindus go to worship?" — could go either way. If you want a SOUTH AFRICAN place (e.g. Houghton Mosque, Pretoria Synagogue, Cathedral) you need a real photo | SA-specific exterior photos of one of each |
| LS.L4.PSW.T11 Traffic rules | T11.03 | Zebra crossing — no clean Twemoji of the stripes | An overhead view of zebra stripes on a road vs parking lot, taxi rank, drain |

### Topic-level icons (decorative, optional)

Topic tiles already use the `TOPIC_EMOJI` map in `LifeSkillsSkillTreeView.tsx`. Current emoji choices are sensible. No changes recommended unless you want to swap a few:
- T07 Children's rights — currently 📜; could use ⚖️ (2696) for stronger constitutional feel.
- T15 HIV basic facts — currently 🎗️; perfect, no change.

---

## Grade 5 — 10 candidates

### Already image-match (1 item)

| Topic | Ref | Question | What the image needs to show | Coverage |
|----|----|----|----|----|
| LS.L5.PSW.T09 Festivals | T09.16 | Match festival to religion: Diwali | Lit-up oil lamp (diya), Christmas tree, crescent moon + star, Star of David | ✅ **Twemoji** — 1fa94 / 1f384 / 262a / 2721 |

### Strong candidates to convert — Twemoji enough (6)

| Topic | Ref | Current type | Question (short) | What a picture should show | Twemoji |
|----|----|----|----|----|----|
| LS.L5.PSW.T10 Safety at home | T10.05 | choice | What should you do FIRST if a fire starts in the kitchen? | Get out + call (phone + door) vs water-on-oil fire, watching, more wood | ✅ 1f6aa / 1f4de / 1f4a6 / 1fab5 |
| LS.L5.PSW.T11 Water | T11.10 | choice | Which uses the MOST water at home? | Shower / brushing / drinking glass / hand-wash | ✅ 1f6bf / 1faa5 / 1f964 / 1faf2 |
| LS.L5.PSW.T12 Healthy eating | T12.01 | choice | Biggest food group children should eat? | Pap/rice/bread/samp/potato vs sweets / fizzy / chips | ✅ `food_pap` `food_bread` `food_potato` / `food_sweet` / `food_fizzy` / `food_chips` |
| LS.L5.PSW.T12 Healthy eating | T12.02 | choice | Which grows and repairs the body? | Meat/eggs/beans/lentils/milk vs sweets / chips / fizzy | ✅ 1f95a (egg) 1f969 (meat) 1f95c (peanuts) 1f95b (milk) / `food_sweet` |
| LS.L5.PSW.T12 Healthy eating | T12.05 | choice | Best drink for everyday thirst? | Water / cola / energy / sweet juice | ✅ 1f4a7 / `food_fizzy` / 1f95b / 1f9c3 |
| LS.L5.PSW.T13 Local health | T13.06 | choice | What spreads malaria? | Mosquito / fruit / water / handshake | ✅ 1f99f / `food_apple` / 1f4a7 / 1f91d |

### Strong candidates to convert — needs real illustration (3)

| Topic | Ref | Why no Twemoji | What the picture must show |
|----|----|----|----|
| LS.L5.PSW.T08 Age and gender | T08.07 | Charlotte Maxeke / Albertina Sisulu / Winnie Madikizela-Mandela portraits — Twemoji can't depict real historical figures | Three side-by-side portraits of named SA women leaders |
| LS.L5.PSW.T10 Safety at home | T10.07 | Paraffin container near a fire — SA-specific shack-fire context, no Twemoji captures it | An illustration of a paraffin container with a flame near it; alternatives (water bottle, school bag, fruit bowl) |
| LS.L5.PSW.T15 Substance abuse | T15.06 | Distinguishing legal-but-harmful (cigarettes, alcohol) from illegal street drugs in a child-safe way | Bottle/box icons for tobacco and alcohol vs unidentifiable "illegal" packet vs OTC pills — needs careful illustration to not glamorise |

### Topic-level icons (decorative)

- T14 HIV stigma — currently 🎗️; consider keeping (matches T15 in Gr4 + T16 in Gr6 for HIV thematic consistency).
- T15 Substance abuse — currently 🚫; perfect.

---

## Grade 6 — 11 candidates

### Already image-match (0 items)

None of Gr 6 PSW is currently `image-match`. The most visual content is in nation-building.

### Strong candidates to convert — Twemoji enough (5)

| Topic | Ref | Current type | Question (short) | What a picture should show | Twemoji |
|----|----|----|----|----|----|
| LS.L6.PSW.T09 Caring for animals | T09.10 | choice | Which is illegal in SA? | Dog fighting (skull on dog) / walking dog / brushing cat / feeding birds | ✅ 1f415 + 1f480 / 1f415 + 1f6b6 / 1f408 + 1faa1 / 1f426 + 1f33e |
| LS.L6.PSW.T11 Nation-building | T11.04 | choice | The SA flag has how many colours? | The SA flag itself (correct) vs flags of other countries | ✅ 1f1ff-1f1e6 (SA) plus other country flag codepoints |
| LS.L6.PSW.T13 First aid | T13.02 | choice | SA ambulance number? | Ambulance / police car / phone / siren | ✅ 1f691 / 1f693 / 1f4de / 1f6a8 |
| LS.L6.PSW.T13 First aid | T13.15 | choice | First aid kit contents? | Plasters, bandages, gauze, gloves vs single plaster vs bread vs magazines | ✅ 1f3e5 (kit/hospital icon) vs `food_bread` vs 1f4f0 |
| LS.L6.PSW.T14 Food hygiene | T14.13 | choice | Milk past use-by date — what to do? | Crossed-out milk carton / drink it / give to dog / add sugar | ✅ 1f95b + ❌ / 1f95b / 1f415 / 1f36c |

### Strong candidates to convert — needs real illustration (6)

| Topic | Ref | Why no Twemoji | What the picture must show |
|----|----|----|----|
| LS.L6.PSW.T07 Cultural rites of passage | T07.06 | Ulwaluko (Xhosa boys' initiation) — no honest emoji; real photo or illustration needed | Symbolic representation (not graphic), distinct from other African traditions |
| LS.L6.PSW.T11 Nation-building | T11.05 | The Y-shape of the SA flag — has to show the actual flag geometry | The SA flag with the Y-shape highlighted as a "convergence" diagram |
| LS.L6.PSW.T11 Nation-building | T11.07 | Heritage Day (24 Sep) — no Twemoji distinguishes it from a regular braai | Iconic SA Heritage Day scene (braai + traditional clothing diversity) |
| LS.L6.PSW.T11 Nation-building | T11.10 | The 1956 Women's March to Union Buildings — historical photo needed | An illustration or photo of the 1956 march at Union Buildings |
| LS.L6.PSW.T11 Nation-building | T11.17 | SA coat of arms / motto !ke e꞉/xarra //ke — Twemoji doesn't have the SA coat of arms | The actual SA coat of arms with motto highlighted |
| LS.L6.PSW.T15 Communicable diseases | T15.04 | Mumps (swollen glands) — Twemoji has no honest depiction; medical illustration needed | A medical-style head illustration showing swollen jaw glands |

### Topic-level icons (decorative)

- T11 Nation-building — currently 🇿🇦; perfect.
- T16 HIV myths — currently 🎗️; perfect.

---

## What's NOT worth pictureing (the majority)

For transparency, here are the IP topic groupings where adding pictures would clutter rather than clarify, and why:

- **Gr4 T01/T03/T05 + Gr5 T01–T04 + Gr6 T02–T08, T10** — Self-development, relationships, emotions-coping, mediation, dignity, peer pressure, self-management. These are *internal/relational* topics where a picture risks reducing nuance ("kindness" doesn't have one face). Audio-narrated text + ruby_prompt warmth carries it.
- **Gr4 T02, T06, T07 + Gr5 T05–T07, T14, T15 + Gr6 T01, T06, T12, T16** — Sensitive topics (bodily integrity, bullying, child abuse, violence, HIV stigma, substance abuse, body image, gender abuse). These deliberately *avoid* graphic imagery. Their authoring prompt explicitly says "avoid graphic detail." Sticking to text + voice is the right call.
- **Gr4 T15 + Gr5 T14 + Gr6 T16 HIV content** — Mostly fact + empathy work; a topic-tile red ribbon is enough; item-level images don't add.
- **Most rights, religion-comparison, nation-values items** — Abstract concepts ("dignity", "rights", "Ubuntu", "U=U") can't be pictured honestly. A flag here, a symbol there, yes — but not 80% of items.

---

## Proposed additions to `scripts/life-skills-image-map.mjs`

If you want the 27 Twemoji-coverable candidates pictured, add these keys (most reuse existing keys; the new ones are listed):

```js
// NEW KEY_TO_EMOJI additions
emotion_smile: "1f600", emotion_sad: "1f641", emotion_cry: "1f622", emotion_angry: "1f620",
symbol_cross: "271d", symbol_star_of_david: "2721", symbol_crescent_star: "262a", symbol_om: "1f549",
symbol_diya: "1fa94", symbol_christmas_tree: "1f384",
safety_lifering: "1f6df", safety_helmet: "26d1", safety_warning: "26a0",
safety_seatbelt: "1f697",  // APPROX: car icon stands in for seatbelt scene
safety_ambulance: "1f691", safety_phone: "1f4de", safety_door: "1f6aa",
traffic_red: "1f534", traffic_yellow: "1f7e1", traffic_green: "1f7e2", traffic_blue: "1f535",
obj_toothbrush: "1faa5", obj_needle: "1f489", obj_helmet: "26d1",
food_egg: "1f95a", food_meat: "1f969", food_milk: "1f95b", food_peanut: "1f95c",
food_water: "1f4a7", food_juice: "1f9c3", food_spaghetti: "1f35d", food_sushi: "1f363",
food_croissant: "1f950",
animal_mosquito: "1f99f", animal_dog: "1f415", animal_bird: "1f426",
sky_fire: "1f525",
nature_grass: "1f33f", nature_sapling: "1f331",
hiv_redribbon: "1f397",
flag_sa: "1f1ff-1f1e6",  // composite — SA flag emoji
```

Run `scripts/fetch-life-skills-images.mjs` after adding them to download SVGs to `public/life-skills/`.

For the **14 needs-real-illustration items**, hand them to an illustrator (or commission Twemoji-style SA-context SVGs):
- 4× cultural heritage scenes (bobotie/Cape Malay, biltong/Voortrekker, Zulu reed dance, traditional dress)
- 4× SA-specific places of worship (or accept Twemoji for these — your call)
- 3× SA historical/national (Women's March, coat of arms, Y-flag explainer)
- 1× zebra crossing diagram
- 1× ulwaluko (handle with care)
- 1× mumps medical illustration

---

## Suggested next step

Run a smaller pass first: convert the 27 Twemoji-coverable items to `image-match` and ship those pictures. That alone covers most of the visually-helpful items and uses the existing pipeline. Defer the 14 "needs-real-illustration" items until you have a designer's hours — they're nice-to-have, not blocking.
