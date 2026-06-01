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

  // ── Head-of-ed illustrated set (WebP in public/life-skills, 2026-06) ──
  // Full-colour illustrations (not Twemoji) for object/place/scene options the
  // emoji set could not show. Keys are the source-of-truth filenames; a few are
  // truncated exactly as the image generator saved them (…_po, …_chi, …_trad).
  // No KEY_TO_EMOJI entry — the files already exist, so fetch must not regenerate.
  "A banker in an office": "place_banker_in_an_office",
  "A black-and-white photo": "obj_black_and_white_photo",
  "A business suit": "obj_business_suit",
  "A busy shopping centre": "place_busy_shopping_centre",
  "A child dropping a packet on the floor": "scene_child_dropping_a_packet_on_the_floor",
  "A child eating lunch alone but relaxed": "scene_child_eating_lunch_alone_but_relaxed",
  "A child helping someone who fell": "scene_child_helping_someone_who_fell",
  "A child hiding": "scene_child_hiding",
  "A child kicking over a bin": "scene_child_kicking_over_a_bin",
  "A child laughing at someone": "scene_child_laughing_at_someone",
  "A child picking up litter": "scene_child_picking_up_litter",
  "A child playing happily": "scene_child_playing_happily",
  "A child reading a book": "scene_child_reading_a_book",
  "A child sitting alone refusing to help": "scene_child_sitting_alone_refusing_to_help",
  "A child surrounded by laughing children pointing at them": "scene_child_surrounded_by_laughing_children_po",
  "A child throwing rubbish from a car": "scene_child_throwing_rubbish_from_a_car",
  "A child walking past": "scene_child_walking_past",
  "A clean blue sky": "obj_clean_blue_sky",
  "A clean kitchen with food covered": "place_clean_kitchen_with_food_covered",
  "A clean stream": "obj_clean_stream",
  "A closed shop": "place_closed_shop",
  "A colour video on a phone": "obj_colour_video_on_a_phone",
  "A cracked toilet with smelly water": "obj_cracked_toilet_with_smelly_water",
  "A dinosaur footprint in rock": "obj_dinosaur_footprint_in_rock",
  "A dot in the middle of the country": "obj_dot_in_the_middle_of_the_country",
  "A dot in the north-east": "obj_dot_in_the_north_east",
  "A dot in the south-west corner of South Africa": "obj_dot_in_the_south_west_corner_of_south_af",
  "A dot outside Africa": "obj_dot_outside_africa",
  "A drawing": "obj_drawing",
  "A Euro": "obj_euro",
  "A farmer in a field": "place_farmer_in_a_field",
  "A fridge": "obj_fridge",
  "A fruit bowl": "obj_fruit_bowl",
  "A glass bottle": "obj_glass_bottle",
  "A glass of clean water": "obj_glass_of_clean_water",
  "A green garden full of flowers": "obj_green_garden_full_of_flowers",
  "A hot stove": "place_hot_stove",
  "A hot summer braai": "obj_hot_summer_braai",
  "A kitchen": "place_kitchen",
  "A paper drawing": "obj_paper_drawing",
  "A parent helping a child read": "scene_parent_helping_a_child_read",
  "A person stealing": "scene_person_stealing",
  "A phone shop": "place_phone_shop",
  "A pilot in a plane": "obj_pilot_in_a_plane",
  "A Rand banknote": "obj_rand_banknote",
  "A river with oil and plastic floating on top": "obj_river_with_oil_and_plastic_floating_on_t",
  "A small farm house with fields around": "place_small_farm_house_with_fields_around",
  "A stick": "obj_stick",
  "A swimming pool": "place_swimming_pool",
  "A tablet computer": "obj_tablet_computer",
  "A tall city block of flats": "place_tall_city_block_of_flats",
  "A tea towel": "obj_tea_towel",
  "A tracksuit": "obj_tracksuit",
  "A treadle sewing machine": "obj_treadle_sewing_machine",
  "A US Dollar": "obj_us_dollar",
  "A wet road": "place_wet_road",
  "A Zulu woman in a beaded isidwaba and traditional headpiece": "body_zulu_woman_in_a_beaded_isidwaba_and_trad",
  "A Zulu woman in beaded traditional dress": "obj_zulu_woman_in_beaded_traditional_dress",
  "An actor on stage": "obj_actor_on_stage",
  "An empty house": "place_empty_house",
  "An Indian Rupee": "obj_indian_rupee",
  "An office tower": "place_office_tower",
  "An open bin with flies": "obj_open_bin_with_flies",
  "Bare trees with frost": "obj_bare_trees_with_frost",
  "Children listening to each other and sharing": "scene_children_listening_to_each_other_and_sha",
  "Classroom desks": "obj_classroom_desks",
  "Desks facing a board": "obj_desks_facing_a_board",
  "Dirty dishes left for days": "obj_dirty_dishes_left_for_days",
  "Drawing with grandparents at top and children below": "scene_drawing_with_grandparents_at_top_and_chi",
  "Drinking from a friend's cup": "scene_drinking_from_a_friend_s_cup",
  "Eating without washing": "scene_eating_without_washing",
  "Elbow": "body_elbow",
  "Fresh air over a field": "obj_fresh_air_over_a_field",
  "Hot stove": "place_hot_stove",
  "Ignoring a sad child": "scene_ignoring_a_sad_child",
  "Kitchen": "place_kitchen",
  "Knee": "body_knee",
  "Library shelves": "place_library_shelves",
  "Market": "place_market",
  "One child grabbing all the materials": "obj_one_child_grabbing_all_the_materials",
  "One child laughing at another": "scene_one_child_laughing_at_another",
  "One child pushing another": "scene_one_child_pushing_another",
  "One child taking another's toy": "scene_one_child_taking_another_s_toy",
  "Open grassy area with swings": "obj_open_grassy_area_with_swings",
  "Open green space with swings and trees": "place_open_green_space_with_swings_and_trees",
  "People in colourful clothes dancing together": "scene_people_in_colourful_clothes_dancing_toge",
  "Playing in dirt then eating": "scene_playing_in_dirt_then_eating",
  "Principal's office": "place_principal_s_office",
  "Sharing food with another child": "scene_sharing_food_with_another_child",
  "Shouting at someone": "scene_shouting_at_someone",
  "Smoke from a factory chimney": "obj_smoke_from_a_factory_chimney",
  "Someone breaking things": "scene_someone_breaking_things",
  "Someone laughing at a younger child": "scene_someone_laughing_at_a_younger_child",
  "Swimming pool": "place_swimming_pool",
  "Taking a toy from a friend": "scene_taking_a_toy_from_a_friend",
  "The chef": "scene_chef",
  "The chef with a pan": "scene_chef_with_a_pan",
  "The dancer": "scene_dancer",
  "The doctor": "scene_doctor",
  "The footballer with a ball": "scene_footballer_with_a_ball",
  "The person in scrubs with a stethoscope": "scene_person_in_scrubs_with_a_stethoscope",
  "The person reading a book": "scene_person_reading_a_book",
  "The postal worker with a bag of letters": "scene_postal_worker_with_a_bag_of_letters",
  "The scholar patrol with a flag": "scene_scholar_patrol_with_a_flag",
  "The vet": "scene_vet",
  "Thick smoke rising over hills": "obj_thick_smoke_rising_over_hills",
  "Toe": "body_toe",
  "Two children fighting": "scene_two_children_fighting",
  "Two children sharing a sandwich": "scene_two_children_sharing_a_sandwich",
  "Washing hands with soap": "scene_washing_hands_with_soap",

  // ── Image-match options for the new illustrated questions (2026-06) ──
  // Traditional SA dances (LS.L6.PSW.T11) and foods (LS.L2.BKH.T05).
  "Zulu reed dance": "scene_zulu_reed_dance",
  "Flamenco dancing": "scene_flamenco",
  "American line dancing": "scene_line_dance",
  "Aboriginal outback dance": "scene_outback_dance",
  "Bobotie": "scene_bobotie",
  "Biltong": "food_biltong",
  "Umngqusho": "food_umngqusho",
  "Pizza": "food_pizza",
};
