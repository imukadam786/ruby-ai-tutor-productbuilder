// Single source of truth for Life Skills image-match pictures.
//
//   LABEL_TO_KEY   exact bank option text  ->  image key
//   KEY_TO_EMOJI   image key               ->  Twemoji codepoint (svg filename)
//
// Files are generated to public/life-skills/<key>.svg by
// scripts/fetch-life-skills-images.mjs, and the keys are written into the bank
// (as image_refs, parallel to options) by scripts/inject-life-skills-image-refs.mjs.
//
// Only options that are a single, clearly drawable object get a key. Behaviour /
// scene / abstract options (e.g. "A child laughing at someone", "A dot in the
// north-east") are left out on purpose — a single icon can't show them, and the
// session falls back to clean text buttons for any question we don't fully cover.
//
// A few keys are honest approximations of SA-specific things with no emoji of
// their own; they are marked APPROX below so the picture can be swapped for a
// real illustration later without touching the bank.

// ── key -> Twemoji codepoint (https://github.com/jdecked/twemoji, CC-BY 4.0) ──
export const KEY_TO_EMOJI = {
  // body parts
  body_nose: "1f443", body_ear: "1f442", body_eye: "1f441",
  body_mouth: "1f444", body_hand: "270b", body_foot: "1f9b6",

  // food
  food_carrot: "1f955", food_sweet: "1f36c", food_biscuit: "1f36a",
  food_cake: "1f370", food_banana: "1f34c", food_potato: "1f954",
  food_bread: "1f35e", food_pizza: "1f355", food_burger: "1f354",
  food_doughnut: "1f369", food_spinach: "1f96c", food_pineapple: "1f34d",
  food_icecream: "1f366", food_chocolate: "1f36b", food_chips: "1f35f",
  food_fizzy: "1f964",
  food_pap: "1f35a",    // APPROX: rice bowl stands in for a bowl of pap
  food_stew: "1f372",   // APPROX: pot of food stands in for pap & stew
  food_plate: "1f35b",  // APPROX: curry-rice plate stands in for a balanced meal

  // animals
  animal_cow: "1f404", animal_tiger: "1f405", animal_gecko: "1f98e",
  animal_whale: "1f40b", animal_pig: "1f416", animal_fish: "1f41f",
  animal_monkey: "1f412", animal_snake: "1f40d", animal_chicken: "1f414",
  animal_cat: "1f408", animal_ant: "1f41c", animal_dolphin: "1f42c",
  animal_sheep: "1f411", animal_leopard: "1f406", animal_zebra: "1f993",
  animal_rabbit: "1f407",
  animal_springbok: "1f98c", // APPROX: deer stands in for a springbok
  animal_antelope: "1f98c",  // APPROX: deer stands in for an antelope

  // objects
  obj_claypot: "1f3fa", obj_smartphone: "1f4f1", obj_laptop: "1f4bb",
  obj_tv: "1f4fa", obj_chair: "1fa91", obj_hat: "1f9e2", obj_bicycle: "1f6b2",

  // places
  place_house: "1f3e0", place_hospital: "1f3e5", place_shop: "1f3ea",
  place_office: "1f3e2", place_library: "1f4da", place_restaurant: "1f37d",
  place_postoffice: "1f3e4", place_petrol: "26fd", place_school: "1f3eb",

  // space
  space_jupiter: "1fa90", space_moon: "1f315", space_star: "2b50",
  space_comet: "2604",

  // free-coverage additions — honest single objects with a real emoji
  obj_car: "1f697", obj_flag: "1f6a9", obj_tree: "1f333",
  obj_trafficlight: "1f6a6", obj_spoon: "1f944", obj_bowl: "1f963",
  obj_candle: "1f56f", obj_book: "1f4d6", obj_smartwatch: "231a",
  obj_shoes: "1f45f", obj_painting: "1f5bc",
  obj_gameconsole: "1f3ae", // APPROX: game controller for a games console
  obj_phone: "260e",        // APPROX: telephone stands in for a phone booth
  obj_swimsuit: "1fa71",
  food_apple: "1f34e",
  place_beach: "1f3d6",
  sky_fireworks: "1f386", sky_sunset: "1f305", sky_fog: "1f32b",
};

// ── exact bank option text -> key ────────────────────────────────────────────
// Matching is exact (after trimming) so a key is only applied to the object it
// truly depicts. The same object reused across questions maps to the same key.
export const LABEL_TO_KEY = {
  // body parts
  "Nose": "body_nose", "Ear": "body_ear", "Eye": "body_eye",
  "Mouth": "body_mouth", "Hand": "body_hand", "Foot": "body_foot",

  // food
  "A carrot": "food_carrot", "A sweet": "food_sweet", "Just sweets": "food_sweet",
  "A biscuit": "food_biscuit", "A piece of cake": "food_cake",
  "A banana": "food_banana", "A potato": "food_potato",
  "A slice of bread": "food_bread", "A pizza": "food_pizza",
  "A hamburger": "food_burger", "A doughnut": "food_doughnut",
  "Spinach (morogo)": "food_spinach", "A pineapple": "food_pineapple",
  "An ice cream": "food_icecream", "A chocolate bar": "food_chocolate",
  "Just chips": "food_chips", "Just a fizzy drink": "food_fizzy",
  "A bowl of pap": "food_pap",
  "Pap and stew with morogo": "food_stew",
  "Pap with vegetables and chicken": "food_plate",

  // animals
  "A cow": "animal_cow", "A tiger": "animal_tiger", "A gecko": "animal_gecko",
  "A whale": "animal_whale", "A pig": "animal_pig", "A fish": "animal_fish",
  "A monkey": "animal_monkey", "A snake": "animal_snake",
  "A chicken": "animal_chicken", "A cat": "animal_cat", "An ant": "animal_ant",
  "A dolphin": "animal_dolphin", "A sheep": "animal_sheep",
  "A leopard": "animal_leopard", "A zebra": "animal_zebra",
  "A rabbit": "animal_rabbit", "A springbok": "animal_springbok",
  "An antelope": "animal_antelope",

  // objects
  "A clay pot": "obj_claypot", "A smartphone": "obj_smartphone",
  "A laptop": "obj_laptop", "A flat-screen TV": "obj_tv", "A chair": "obj_chair",
  "A hat": "obj_hat", "Bicycle with two wheels": "obj_bicycle",

  // places
  "A house": "place_house", "A hospital": "place_hospital",
  "Building with a red cross sign": "place_hospital", "A shop": "place_shop",
  "An office": "place_office", "Library": "place_library",
  "A library": "place_library", "Restaurant": "place_restaurant",
  "Post office": "place_postoffice", "A post office": "place_postoffice",
  "A school": "place_school",
  "A place where cars fill up with fuel": "place_petrol",

  // space
  "Jupiter": "space_jupiter", "The Moon": "space_moon", "A star": "space_star",
  "A comet": "space_comet",

  // free-coverage additions — honest single objects with a real emoji
  "A wooden chair": "obj_chair",
  "Car": "obj_car",
  "A flag": "obj_flag",
  "A tree": "obj_tree",
  "A tree in a forest": "obj_tree",
  "A tree in spring": "obj_tree",
  "Tall pole with red, yellow and green lights": "obj_trafficlight",
  "A phone booth": "obj_phone",
  "A wooden spoon": "obj_spoon",
  "A bowl": "obj_bowl",
  "A candle": "obj_candle",
  "A paper book": "obj_book",
  "A smart watch": "obj_smartwatch",
  "A smartphone with messages": "obj_smartphone",
  "A pair of shoes": "obj_shoes",
  "An apple": "food_apple",
  "A swimsuit": "obj_swimsuit",
  "A swimming costume": "obj_swimsuit",
  "A painting": "obj_painting",
  "School building": "place_school",
  "A video game console": "obj_gameconsole",
  "A sunny beach": "place_beach",
  "Fireworks at night": "sky_fireworks",
  "A clear sunset": "sky_sunset",
  "A foggy morning": "sky_fog",
};
