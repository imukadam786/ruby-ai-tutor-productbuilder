// ─── Geography — per-topic "real-life example" pictures ────────────────────
//
// One everyday picture per topic (64), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "GEO.G10.MAP.A1":
    "It's like a family photo shrunk to fit your phone screen. Everything is smaller by the same amount, so if you know how much it was shrunk, you can work out real sizes.",
  "GEO.G10.MAP.A2":
    "Think of a selfie, the same selfie with the wobbly angle straightened out, and a sketch your friend drew of you. All three show you, but only some are accurate enough to measure.",
  "GEO.G10.T1.ATM.A1":
    "It's like a double-storey house: what happens downstairs isn't what happens upstairs. Each floor has its own job, so a problem on one floor isn't the same as a problem on another.",
  "GEO.G10.T1.ATM.A2":
    "Think of a braai: the coals heat the grid, and the grid heats the meat. The heat comes from below, so it's hottest closest to the coals.",
  "GEO.G10.T1.ATM.A3":
    "It's like a wet dishcloth. A warm cloth can hold lots of water, but squeeze it and the water drips out. Cool air squeezes the water out of the sky the same way.",
  "GEO.G10.T1.ATM.A4":
    "It's like a weather forecast drawn as a map of contours, the way a hiking map shows hills. Where the lines bunch together, things change fast.",
  "GEO.G10.T2.GEO.A1":
    "Think of a peach: a thin skin, a thick soft middle, and a hard pit in the centre. Each layer is different, and the inside affects what happens on the surface.",
  "GEO.G10.T2.GEO.A2":
    "Think of cracked tiles floating on a slow-moving pot of thick soup. As the soup churns, the tiles drift apart, bump into each other or scrape past.",
  "GEO.G10.T2.GEO.A3":
    "Push a carpet slowly from both ends and it wrinkles. Snap a dry stick and it breaks. Rock does the same: slow pressure bends it, sudden pressure cracks it.",
  "GEO.G10.T2.GEO.A4":
    "Drop a stone in a pond. The ripples are strongest where it landed and weaker further away, even though it was the same stone.",
  "GEO.G10.T2.GEO.A5":
    "It's like a pot of thick porridge with the lid on. Pressure builds underneath until it bursts out, and it can make a mess, but what spills can feed a garden.",
  "GEO.G10.T3.POP.A1":
    "Think of a school hall at break. Everyone crowds around the tuck shop and the shade, and nobody stands in the hot, empty corner.",
  "GEO.G10.T3.POP.A2":
    "It's like a school photo arranged by grade. If the front rows of little ones are huge, the school is growing; if they're thin, fewer children are joining.",
  "GEO.G10.T3.POP.A3":
    "Think of a taxi rank. People arrive and people leave. Whether the rank fills up or empties depends on the difference between the two.",
  "GEO.G10.T3.POP.A4":
    "Think of a family deciding whether to move: what's pushing them away from home, and what's pulling them towards the new place. Usually it's both.",
  "GEO.G10.T3.POP.A5":
    "It's like a soccer team losing its midfield players. The young reserves and the old coaches are still there, but the ones doing most of the work are gone.",
  "GEO.G10.T4.WAT.A1":
    "Imagine a full bucket of water where only a teaspoon is safe to drink. That teaspoon gets used, cleaned and reused, over and over.",
  "GEO.G10.T4.WAT.A2":
    "Think of the warm and cold taps at a basin. The warm one fogs up the mirror; the cold one leaves it clear. The tap beside the coast changes what happens on land.",
  "GEO.G10.T4.WAT.A3":
    "It's like a household on a tight budget: little money coming in, and not every month. So you save, store what you can and fix every leak.",
  "GEO.G10.T4.WAT.A4":
    "Think of a sink. Heavy rain is the tap, but a blocked drain is what makes it overflow onto the floor.",
  "GEO.G11.MAP.A1":
    "Think of a hill seen from the side, like looking at a loaf of bread sliced down the middle. The slice shows how steep it is, and whether a bump would hide what's behind it.",
  "GEO.G11.MAP.A2":
    "It's like a photo taken out of a taxi window: the edges stretch and lean. Straighten it out and you can measure it like a map.",
  "GEO.G11.T1.ATM.A1":
    "It's like a bank account: money in and money out. If the two match, the balance stays steady; if more comes in than goes out, it keeps climbing.",
  "GEO.G11.T1.ATM.A2":
    "Think of a classroom heater in one corner. The warm air drifts across the room and cooler air moves back to replace it, so the whole room keeps circulating.",
  "GEO.G11.T1.ATM.A3":
    "It's like two halves of a soccer field painted the same: whatever pattern is on one side of the halfway line is mirrored on the other.",
  "GEO.G11.T1.ATM.A4":
    "Think of a patch of lawn where everyone keeps walking. The grass dies, the soil goes bare, and even after rain it struggles to grow back.",
  "GEO.G11.T2.GEO.A1":
    "Think of a layered cake with a hard icing on top. The soft cake underneath crumbles away at the sides, but the hard top keeps it flat.",
  "GEO.G11.T2.GEO.A2":
    "Think of a stack of books tilted on a shelf, some hardcover and some soft. Leave them out in the weather and the soft ones crumble, leaving the hard ones sticking up.",
  "GEO.G11.T2.GEO.A3":
    "Think of a chocolate slab already scored into blocks. Where the cracks are far apart, big chunks stay whole; where they're close, it crumbles away.",
  "GEO.G11.T2.GEO.A4":
    "Think of how a sandcastle changes over a day: some sides wear back evenly, some slump and collapse. The shape depends on what it's made of and the weather.",
  "GEO.G11.T2.GEO.A5":
    "It's like a soggy cardboard box on a slope. Once it's soaked, it gets heavy, loses its grip and slides.",
  "GEO.G11.T3.DEV.A1":
    "Think of a family's wellbeing. A bigger salary helps, but so do healthy kids, a good school and a safe home. Money alone doesn't tell the whole story.",
  "GEO.G11.T3.DEV.A2":
    "Think of different coaches' plans for improving a team. One says follow fixed steps, another says the strong club takes the best players. Each plan sees the problem differently.",
  "GEO.G11.T3.DEV.A3":
    "It's like selling your mielies for very little and buying back mielie meal at a high price. You work hard but the money keeps leaving.",
  "GEO.G11.T3.DEV.A4":
    "Think of a household where the mother gets a job and learns new skills. The whole family eats better, the children stay in school, and things improve for everyone.",
  "GEO.G11.T3.DEV.A5":
    "It's like a relative who sends money every month. It helps, but if it becomes the only income, the household can't stand on its own.",
  "GEO.G11.T4.RES.A1":
    "Think of a fruit tree versus a jar of sweets. Pick the tree sensibly and it keeps giving every season; the sweet jar runs out once it's empty.",
  "GEO.G11.T4.RES.A2":
    "It's like the top layer of a cake washing away in the rain. The best part is gone, and what's left underneath doesn't taste the same.",
  "GEO.G11.T4.RES.A3":
    "Think of a car that runs reliably every day but guzzles fuel and pollutes the street. It gets you there, but at a cost.",
  "GEO.G11.T4.RES.A4":
    "Think of a solar light in the garden. It's free to run once you buy it, but on cloudy days it needs a battery to keep going.",
  "GEO.G11.T4.RES.A5":
    "It's like a household budget for electricity: the family switches off what they don't use, and that saves more than earning extra money would.",
  "GEO.G12.MAP.A1":
    "Think of a weather app's map and a hiking map side by side. One shows what the sky is doing, the other shows what the ground looks like.",
  "GEO.G12.MAP.A2":
    "Think of a phone map app where you can switch layers on and off: roads, taxi routes, shops. Stacking layers answers questions one layer can't.",
  "GEO.G12.T1.CLI.A1":
    "It's like a crowd at a stadium exit: two groups meet, push against each other and swirl. Where they meet, things get stormy.",
  "GEO.G12.T1.CLI.A2":
    "Think of a spinning top. It needs energy to keep spinning, and once it leaves the warm floor and hits rough carpet, it wobbles and dies.",
  "GEO.G12.T1.CLI.A3":
    "Think of a heavy lid sitting on a pot, keeping things calm and dry underneath. Only when something pushes past the lid does the weather change.",
  "GEO.G12.T1.CLI.A4":
    "Think of a stairwell at night: the cold air slides down and pools at the bottom, while warmer air sits on the landings above.",
  "GEO.G12.T1.CLI.A5":
    "Think of a taxi parked in the sun all day. The dark metal soaks up heat and stays hot long after sunset, while the grass nearby cools down.",
  "GEO.G12.T1.GEO.A1":
    "Think of the way water runs off a roof into gutters and down pipes. The shape of the roof decides where all the water ends up.",
  "GEO.G12.T1.GEO.A2":
    "Think of a taxi on a steep road versus a flat one. On the steep part it rushes and wears down the road; on the flat it slows and drops what it's carrying.",
  "GEO.G12.T1.GEO.A3":
    "It's like a shared bathroom in a big house. What the person upstairs does affects everyone downstairs, so there have to be shared rules.",
  "GEO.G12.T2.SET.A1":
    "Think of choosing where to put a spaza shop: the exact spot matters, but so does what's around it, like a taxi stop or a school.",
  "GEO.G12.T2.SET.A2":
    "Think of homes on a farm road: some huddled together near the dam, others spread out along the fence. The land decides the pattern.",
  "GEO.G12.T2.SET.A3":
    "It's like a village where the young ones leave for the city. The clinic closes, the school shrinks, and the place slowly empties.",
  "GEO.G12.T2.SET.A4":
    "Think of a mall: some shops only sell food, others sell everything. The bigger the mall, the more it does.",
  "GEO.G12.T2.SET.A5":
    "Think of shops: there's a spaza on every corner, but only one big hospital in the region. You'll travel far for something special.",
  "GEO.G12.T2.SET.A6":
    "Think of a school's layout: offices in the middle, classrooms around them, and sports fields on the edge. Each zone has its own use.",
  "GEO.G12.T2.SET.A7":
    "It's like a classroom built for thirty that now has sixty learners. The desks, books and teacher can't keep up.",
  "GEO.G12.T3.ECO.A1":
    "Think of a loaf of bread: the farmer grows the wheat, the bakery bakes it, the shop sells it, and someone else designs the bakery's ordering app.",
  "GEO.G12.T3.ECO.A2":
    "It's like a full fridge in a home where some people still go hungry. Having food isn't the same as everyone being able to get it.",
  "GEO.G12.T3.ECO.A3":
    "It's like a family that lives off one big bonus each year. It's great while it lasts, but it won't last forever.",
  "GEO.G12.T3.ECO.A4":
    "Think of a fruit stall that starts making jam. Turning the fruit into something more valuable earns more than selling it raw.",
  "GEO.G12.T3.ECO.A5":
    "It's like a mall that offers cheap rent to bring shops to a quiet area. The deal attracts businesses that would never have come otherwise.",
  "GEO.G12.T3.ECO.A6":
    "Think of a car guard or a vetkoek seller at the taxi rank. No contract or payslip, but they're earning a living and serving people every day.",
};
