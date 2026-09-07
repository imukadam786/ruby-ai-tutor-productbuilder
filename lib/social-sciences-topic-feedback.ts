// ─── Social Sciences (GET, Grades 4–6) — per-topic analogies ────────────────
//
// One everyday analogy per topic (21: History + Geography, Grades 4–6), keyed
// by skill/topic id. Feeds the wrong-answer card's example slot via
// FeedbackExplanation's `exampleOverride`. Register: Grade 4–6 — short, concrete,
// everyday South African reference points. "why" = the question's memo,
// "how" = the topic's recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "SS.L4.HIS.T01":
    "Working out a local area's past is like being a detective: an old photo, a gravestone, a granny's story and a rusted tool each give you a different clue about what happened here.",
  "SS.L4.HIS.T02":
    "You judge a good leader by what they did, not how famous they are. Mandela and Gandhi listened to people, were brave, and were willing to suffer for what was right.",
  "SS.L4.HIS.T03":
    "Transport has gone from ox-wagon slow to aeroplane fast. Each new invention solved a problem — how to travel further, quicker, or carry more.",
  "SS.L4.HIS.T04":
    "Communication is just sharing a message. Long ago it was drums, songs and drawings; today it's a WhatsApp. The goal never changed — the tools just got faster.",
  "SS.L4.GEO.T01":
    "Settlements come in sizes: a farm is small and spread out, a village bigger, a town bigger still, a city biggest with the most kinds of work. A landmark like a big church helps you find your way.",
  "SS.L4.GEO.T03":
    "Food starts as a crop (from plants) or stock (from animals). Subsistence farming feeds the family; commercial farming grows extra to sell. Processed food, like polony, has been changed from its raw form.",
  "SS.L4.GEO.T04":
    "Water goes round in a cycle: the sun lifts it from the sea, it forms clouds, falls as rain, runs down rivers, and returns to the sea. Sea water is salty; the fresh water we drink is scarce in a dry country like ours.",
  "SS.L5.HIS.T01":
    "The San and the Khoikhoi were here first. Picture two ways of living side by side: the San hunting and gathering wild food, the Khoikhoi walking their cattle and sheep to fresh grass.",
  "SS.L5.HIS.T02":
    "The first farmers arrived with a toolkit the others didn't have — crops to plant, cattle to keep, and iron for hoes and spears — and they organised into chiefdoms.",
  "SS.L5.HIS.T03":
    "Ancient Egypt grew in a desert only because of the Nile — the river flooded each year and left rich soil for farming, the way a good rain fills a dry dam.",
  "SS.L5.HIS.T04":
    "Heritage is what the past hands down to us — a building, a language, a recipe, a story, a piece of knowledge. Every one of the nine provinces has examples that belong to all South Africans.",
  "SS.L5.GEO.T02":
    "South Africa is shaped like a shallow bowl turned over: high and flat in the middle (the plateau), dropping steeply (the escarpment) to a low strip along the coast. Rivers run from the high middle down to the sea.",
  "SS.L5.GEO.T03":
    "Weather is what's happening today — rain, wind, sun. Climate is the pattern over many years — 'the Highveld has dry winters'. Climate decides which plants grow on their own in a place.",
  "SS.L5.GEO.T04":
    "Minerals are non-renewable — dig up the gold and it's gone for good, unlike a crop you replant. Mining brings jobs and money, but leaves scars on the land and risks to miners' health.",
  "SS.L6.HIS.T01":
    "Mapungubwe, in the Limpopo Valley about 800 years ago, was the first kingdom in Southern Africa. It grew rich by trading gold and ivory across the Indian Ocean — the golden rhino was a royal treasure.",
  "SS.L6.HIS.T02":
    "Renaissance Europe had new tools — the compass, better ships — and wanted a sea route to Asia to trade. Dias and Da Gama sailed past Southern Africa on that hunt, but didn't settle yet.",
  "SS.L6.HIS.T03":
    "Democracy means the people choose the government by voting. South Africa reached it in 1994 after the struggle against apartheid, and the Constitution is the top law that protects everyone's rights.",
  "SS.L6.HIS.T04":
    "There are two ways of healing that now often work together: indigenous healing treats the whole person with plants and beliefs; Western medicine treats the body using science, like vaccines and penicillin.",
  "SS.L6.GEO.T02":
    "Trade is selling and buying between countries. Exports go out, imports come in. A raw material like cocoa beans is worth far more once it's manufactured into chocolate. Fair trade means the workers were paid properly.",
  "SS.L6.GEO.T03":
    "Climate builds whole worlds: a tropical rainforest is hot, wet and packed with trees; a hot desert is dry with almost nothing; a coniferous forest is cold with tall needle-leaved trees. The climate shapes the plants, the animals and how people live.",
  "SS.L6.GEO.T04":
    "People settle where life is easier — water, mild weather, work, safety. Cities pull people in from the countryside because there are more jobs. Rural means the countryside; urban means the city.",
};
