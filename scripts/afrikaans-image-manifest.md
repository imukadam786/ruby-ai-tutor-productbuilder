# Afrikaans FAL — Woordeskat image manifest (Grade 1)

Several Woordeskat, Luister and Lees items use **image-match**: the child hears or
reads the Afrikaans word and taps the matching picture. Each item references images
by a stable **key** (the `image_refs` field in `data/afrikaans-question-bank.json`).
Drop the image set in `public/afrikaans/<key>.<ext>` (png/svg/jpg) and the items
light up; until then those items fall back to audio + English-meaning text choices.

Guidelines: one clear subject per image, plain background, child-friendly (emoji /
flat-icon / photo all fine, but keep one consistent style per theme), roughly square.
Colour swatches = a solid block of the colour. Position images = the **same object**
(e.g. a ball + a box) shown in the named position so only the relationship changes.

> Status: **complete for Grades 1, 2 and 3** — every key below is referenced by an
> authored item. Foundation Phase content is now complete. Per-grade additions are in
> the sections at the bottom.

## Colours — solid colour blocks
`colour_rooi` (red) · `colour_blou` (blue) · `colour_geel` (yellow) · `colour_groen` (green) · `colour_swart` (black)

## Body parts (liggaamsdele)
`body_kop` (head) · `body_oe` (eyes) · `body_mond` (mouth) · `body_neus` (nose) · `body_hande` (hands) · `body_voete` (feet)

## Clothes (klere)
`clothes_hemp` (shirt) · `clothes_broek` (trousers) · `clothes_rok` (dress) · `clothes_trui` (jersey) · `clothes_skoene` (shoes) · `clothes_hoed` (hat)

## Food (voedsel)
`food_appel` (apple) · `food_piesang` (banana) · `food_lemoen` (orange) · `food_brood` (bread) · `food_eier` (egg)

## Animals (diere)
`animal_hond` (dog) · `animal_kat` (cat) · `animal_voel` (bird) · `animal_vis` (fish) · `animal_hoender` (chicken)

## Weather (die weer)
`weather_son` (sun) · `weather_reen` (rain) · `weather_wolk` (cloud) · `weather_sneeu` (snow)

## Position — same object shown in each position
`pos_op` (ball ON the box) · `pos_onder` (ball UNDER the box) · `pos_in` (ball IN the box)
`cat_in_box` (cat in box) · `cat_on_box` (cat on box) · `cat_under_box` (cat under box)

## Classroom objects (Lees — environmental labels)
`obj_deur` (door) · `obj_venster` (window) · `obj_kas` (cupboard) · `obj_stoel` (chair) · `obj_tafel` (table)

## Caption-match scenes (Lees — colour + object combinations)
`bal_rooi` (red ball) · `bal_blou` (blue ball) · `bal_geel` (yellow ball) · `hoed_rooi` (red hat) ·
`hond_groot` (big dog) · `hond_klein` (small dog) · `kat_groot` (big cat) · `son_geel` (yellow sun) · `wolk_wit` (white cloud)

## Listening objects (Luister — follow instructions)
`bal` (ball) · `hond` (dog) · `appel` (apple) · `kat` (cat) · `voel` (bird) · `trui_rooi` (red jersey) · `trui_blou` (blue jersey)

---

# Grade 2 additions

## Feelings (gevoelens) — clear faces
`feel_bly` (happy) · `feel_hartseer` (sad) · `feel_kwaad` (angry) · `feel_moeg` (tired)

## Food & drink — extended
`food_kaas` (cheese) · `food_koek` (cake) · `food_vleis` (meat)

## Action verbs (aksiewoorde) — show the action
`act_spring` (jumping) · `act_sit` (sitting) · `act_slaap` (sleeping)

## Reading scenes (Lees — text+picture, captions). Each is one small illustrated scene.
`scene_seun_appel` (boy eating an apple) · `scene_seun_bal` (boy with a ball) · `scene_meisie_appel` (girl eating an apple) ·
`scene_hond_water` (dog drinking water) · `scene_kat_melk` (cat drinking milk) · `scene_hond_kos` (dog eating food) ·
`scene_hond_slaap` (big brown dog sleeping) · `scene_hond_hardloop` (dog running) · `scene_kat_slaap` (cat sleeping) ·
`scene_meisie_fiets` (girl riding a bike) · `scene_seun_fiets` (boy riding a bike) · `scene_meisie_loop` (girl walking)

---

# Grade 3 additions

## Places in town (plekke) — clear building pictures
`place_skool` (school) · `place_winkel` (shop) · `place_hospitaal` (hospital)

## Transport (vervoer) — clear vehicle pictures
`trans_trein` (train) · `trans_bus` (bus) · `trans_motor` (car)

## Labelled diagrams (Lees — use diagrams). Each is a labelled illustration; the named part is highlighted.
`diagram_plant_blare` (plant — leaves highlighted) · `diagram_plant_wortel` (plant — root highlighted) · `diagram_plant_stam` (plant — stem highlighted) ·
`diagram_body_kop` (body — head highlighted) · `diagram_body_arm` (body — arm highlighted) · `diagram_body_been` (body — leg highlighted)
