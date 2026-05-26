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

  // ── Intermediate Phase (Grades 4–6 PSW) additions ──
  // emotions / faces
  emotion_happy: "1f600", emotion_sad: "1f622",
  emotion_angry: "1f620", emotion_grief: "1f622",  // grief shows as a crying face
  emotion_fear: "1f628", emotion_jealous: "1f612",
  emotion_bored: "1f611", emotion_excited: "1f603",
  emotion_hungry: "1f60b",

  // activities — proxies for personal strengths
  activity_run: "1f3c3", activity_read: "1f4d6",
  activity_sing: "1f3a4", activity_draw: "1f3a8",
  activity_cook: "1f373",

  // colours (traffic-light option set)
  colour_red: "1f534", colour_green: "1f7e2",
  colour_yellow: "1f7e1", colour_blue: "1f535",

  // religious symbols
  symbol_cross: "271d", symbol_star_of_david: "2721",
  symbol_crescent: "262a", symbol_om: "1f549",

  // religious / community places
  place_church: "26ea", place_mosque: "1f54c",
  place_synagogue: "1f54d", place_temple: "1f6d5",
  place_stadium: "1f3df", place_mall: "1f3ec",

  // foods / drinks (IP additions)
  food_spaghetti: "1f35d", food_sushi: "1f363",
  food_croissant: "1f950", food_water: "1f4a7",

  // objects
  obj_pencil: "270f", obj_pen: "1f58a",
  obj_helmet: "26d1",
  obj_slippers: "1f97f",   // APPROX: thong sandal stands in for slippers
  obj_dress: "1f457", obj_sunglasses: "1f576",
  obj_toothbrush: "1faa5", obj_football: "26bd",
  obj_teapot: "1fad6",

  // safety
  safety_lifering: "1f6df",

  // animals (IP additions)
  animal_mosquito: "1f99f",

  // gestures
  gesture_handshake: "1f91d",

  // festival symbols (Gr5 T09.16)
  symbol_diya: "1fa94", symbol_christmas_tree: "1f384",
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

  // ── Intermediate Phase (Grades 4–6) additions ──
  // emotions (option text used in Gr4 T04.*, Gr5 T03.*)
  "Happiness": "emotion_happy",
  "Sadness": "emotion_sad",
  "Anger": "emotion_angry",
  "Grief": "emotion_grief",
  "Fear": "emotion_fear",
  "Jealousy": "emotion_jealous",
  "Boredom": "emotion_bored",
  "Excitement": "emotion_excited",
  "Hunger": "emotion_hungry",

  // activities (Gr4 T01 personal strengths)
  "Running": "activity_run",
  "Reading": "activity_read",
  "Singing": "activity_sing",
  "Drawing": "activity_draw",
  "Drawing and painting": "activity_draw",
  "Cooking": "activity_cook",
  "Reading aloud": "activity_read",

  // traffic light colours (Gr4 T11.02)
  "Red": "colour_red",
  "Green": "colour_green",
  "Yellow": "colour_yellow",
  "Blue": "colour_blue",

  // foods (Gr4 cultures + diet)
  "Pap and stew": "food_stew",
  "Spaghetti from Italy": "food_spaghetti",
  "Sushi from Japan": "food_sushi",
  "Croissant from France": "food_croissant",
  "Sweets and sugary fizzy drinks": "food_sweet",  // APPROX: one icon for the combo
  "Apples": "food_apple",
  "Carrots": "food_carrot",
  "Plain water": "food_water",
  "Sweetened cold drink (cola, fanta)": "food_fizzy",
  "Plain pap": "food_pap",
  "Drinking water": "food_water",
  "Eating fruit": "food_apple",

  // religious places (Gr4 T09.02–T09.05, T09.20)
  "Church": "place_church",
  "Mosque": "place_mosque",
  "Synagogue": "place_synagogue",
  "Temple": "place_temple",
  "Hindu temple": "place_temple",
  "Hindu temple (mandir)": "place_temple",
  "Places of worship": "place_church",
  "Football stadiums": "place_stadium",
  "Shopping malls": "place_mall",
  "Restaurants": "place_restaurant",

  // religious symbols (Gr4 T09.09)
  "Om (ॐ)": "symbol_om",
  "The cross": "symbol_cross",
  "The Star of David": "symbol_star_of_david",
  "The crescent moon": "symbol_crescent",

  // bicycle gear (Gr4 T11.05)
  "A helmet": "obj_helmet",
  "Slippers": "obj_slippers",
  "A long dress": "obj_dress",
  "Sunglasses only": "obj_sunglasses",

  // emotion-vs-object set (Gr4 T04.01)
  "Pencil": "obj_pencil",
  "Shoe": "obj_shoes",
  "Tree": "obj_tree",

  // hygiene items (Gr4 T12.01)
  "A toothbrush": "obj_toothbrush",
  "A book": "obj_book",
  "A pen": "obj_pen",
  "A football": "obj_football",
  "Football": "obj_football",

  // pool safety (Gr4 T10.08)
  "A life ring (red and white round float)": "safety_lifering",
  "A loaf of bread": "food_bread",
  "A textbook": "obj_book",
  "A teapot": "obj_teapot",

  // malaria mosquito (Gr5 T13.06)
  "The bite of a specific kind of mosquito": "animal_mosquito",
  "Holding hands": "gesture_handshake",

  // emotion-face image-match (Gr4 T04.02)
  "Smiling face": "emotion_happy",
  "Frowning face": "emotion_sad",
  "Crying face": "emotion_grief",
  "Angry face": "emotion_angry",

  // religion symbol → religion-name image-match (Gr4 T09.15, T09.16)
  "Christianity": "symbol_cross",
  "Judaism": "symbol_star_of_david",
  "Islam": "symbol_crescent",
  "Hinduism": "symbol_om",

  // Gr5 T09.16 festival images
  "Lit-up oil lamp (diya)": "symbol_diya",
  "Christmas tree": "symbol_christmas_tree",
  "Crescent moon and star": "symbol_crescent",
  "Star of David": "symbol_star_of_david",
};
