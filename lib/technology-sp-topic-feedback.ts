// ─── Technology — per-topic "real-life example" pictures ───────────────────
//
// One everyday picture per topic (62), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "TECH.G7.DG.A1":
    "It's like bending a wire hanger to unblock a drain. You use what you know and what you have to sort out a real problem.",
  "TECH.G7.DG.A2":
    "It's like planning a family braai. You find out who's coming, plan the menu, cook, see what people enjoyed, then tell everyone how it went.",
  "TECH.G7.DG.A3":
    "It's like choosing shoes. School shoes for school, takkies for sport. A beautiful shoe that hurts your feet has failed its job.",
  "TECH.G7.DG.A4":
    "It's like the lines on a road. A solid line, a broken line and a faint painted guide each tell drivers something different.",
  "TECH.G7.DG.A5":
    "It's like a voice note, a written list and a photo of the same thing. Each shows it differently, for a different reason.",
  "TECH.G7.ST.A1":
    "It's like the things in a kitchen. A cup holds tea, a table holds plates up, a pot lid keeps things covered. Each thing has its own job.",
  "TECH.G7.ST.A2":
    "It's like comparing an egg, a jungle gym and a brick. One is a hollow skin, one is bars joined together, and one is a single solid lump.",
  "TECH.G7.ST.A3":
    "It's like a flat sheet of paper that flops over. Fold it into a fan or roll it into a tube, and suddenly it can hold weight.",
  "TECH.G7.ST.A4":
    "It's like standing on a moving bus. With your feet apart and knees bent, you're much harder to knock over.",
  "TECH.G7.MS.A1":
    "It's like a seesaw. Sit closer to the middle or further out, and the same push lifts your friend more easily or with more effort.",
  "TECH.G7.MS.A2":
    "It's like a pair of scissors. Two pieces joined at one point, so moving one part makes the other move with it.",
  "TECH.G7.MS.A3":
    "It's like squeezing a full water bottle. Push on one end and the other end bulges straight away.",
  "TECH.G7.MS.A4":
    "It's like pedalling a bicycle or pulling a washing line. Your legs go up and down to turn something round, and a rope over a wheel lifts a load.",
  "TECH.G7.ES.A1":
    "It's like a fridge magnet. It grabs the fridge door but slides right off the plastic handle and a coin.",
  "TECH.G7.ES.A2":
    "It's like a running track. Runners have to get all the way round the loop. Block the track anywhere and the race stops.",
  "TECH.G7.ES.A3":
    "It's like a scrapyard crane that grabs scrap metal and then drops it. It only holds on while the power is switched on.",
  "TECH.G7.PR.A1":
    "It's like making maas from milk or bread from flour. The ingredients go in one form and come out as something more useful.",
  "TECH.G7.PR.A2":
    "It's like choosing what to wear in the rain. You wouldn't wear a cotton T-shirt as a raincoat. What the fabric does decides its job.",
  "TECH.G7.PR.A3":
    "It's like a traditional rondavel built from clay and thatch found nearby. It's cheap, it suits the weather, and it's gentle on the land.",
  "TECH.G7.PR.A4":
    "It's like a new road through a village. It helps people with cars but can split the village in two for those who walk.",
  "TECH.G8.DG.A1":
    "It's like filling in a form. Everyone uses the same boxes and the same format, so anyone can read it the same way.",
  "TECH.G8.DG.A2":
    "It's like the difference between a video-game map seen from a slanted angle and a photo of a building corner. Both look solid, drawn in different ways.",
  "TECH.G8.DG.A3":
    "It's like a cereal box flattened out. That flat shape folds right back up into the box. Cut it wrong and it won't close.",
  "TECH.G8.ST.A1":
    "It's like a team holding up a tent. Each person holds a different pole, and if one lets go, part of the tent sags.",
  "TECH.G8.ST.A2":
    "It's like a tug-of-war rope being pulled, a table leg being squashed, and a wet cloth being wrung. Each is being forced in a different way.",
  "TECH.G8.ST.A3":
    "It's like crossing a stream on a plank, over a curved stone bridge, or by reaching out over the water from a branch. Three ways to get across a gap.",
  "TECH.G8.ST.A4":
    "It's like a shelf that can fail in three ways: it snaps, it sags in the middle, or it tips off the wall. Each problem needs a different fix.",
  "TECH.G8.MS.A1":
    "It's like an axe splitting wood, or turning a big doorknob. A simple shape turns your push into a bigger or more useful push.",
  "TECH.G8.MS.A2":
    "It's like two people facing each other turning a skipping rope. Their hands go round in opposite directions.",
  "TECH.G8.MS.A3":
    "It's like the gears on a bicycle. A low gear climbs a hill slowly but easily, and a high gear flies on the flat but is hard to start.",
  "TECH.G8.MS.A4":
    "It's like the bumps inside a music box. As it turns, each bump lifts something and lets it drop again.",
  "TECH.G8.MS.A5":
    "It's like using a long spanner on a stuck nut. The tool lets a small push from you do the work of a much bigger one.",
  "TECH.G8.MS.A6":
    "It's like a kettle. Water and power go in, heating happens inside, and hot water comes out.",
  "TECH.G8.ES.A1":
    "It's like a school bell system. Something gives the power, someone decides when to ring, and the bell does the job.",
  "TECH.G8.ES.A2":
    "It's like carrying a heavy load. Two people stacking their strength lift it higher, and two people taking turns can carry it for longer.",
  "TECH.G8.ES.A3":
    "It's like water from a big dam. It's sent out under high pressure for the long trip, and the pressure is lowered before it reaches your tap.",
  "TECH.G8.ES.A4":
    "It's like a gate that only opens if two friends both press their buttons, compared to a gate that opens if either one does.",
  "TECH.G8.PR.A1":
    "It's like an apple core and a plastic bottle tossed in the bush. The apple core is gone in weeks, but the bottle is still there years later.",
  "TECH.G8.PR.A2":
    "It's like a lunchbox. Just enough to protect what's inside, and you can wash it and use it again tomorrow.",
  "TECH.G8.PR.A3":
    "It's like cellphones. They connect families across the country, but old batteries pile up in the dump. Good design keeps the benefit and cuts the harm.",
  "TECH.G8.PR.A4":
    "It's like a big factory opening near a small town. It brings jobs and money, but the people living closest often get the most noise and dirt.",
  "TECH.G9.DG.A1":
    "It's like taking photos of a car from the front, the top and the side, then laying them flat on a table so you can measure everything.",
  "TECH.G9.DG.A2":
    "It's like a homework answer. Neat handwriting doesn't help if the answer is wrong. It has to actually solve the problem.",
  "TECH.G9.DG.A3":
    "It's like the instruction sheet for flat-pack furniture. The parts are drawn floating apart so you can see exactly how they slot together.",
  "TECH.G9.ST.A1":
    "It's like standing still on a trampoline compared to jumping on it. The moving weight hits much harder than the still one.",
  "TECH.G9.ST.A2":
    "It's like the shape of a ruler. Flat, it bends easily. Turn it on its edge, and the same ruler hardly bends at all.",
  "TECH.G9.ST.A3":
    "It's like choosing a phone. You weigh up how heavy it is, how tough it is and how long it lasts. No single phone wins on everything.",
  "TECH.G9.ST.A4":
    "It's like a builder's quote to fix your roof. It has to cover the materials and the hours of work, not just the materials.",
  "TECH.G9.MS.A1":
    "It's like pressing on a sealed bottle full of water. The push reaches every part of the bottle at once.",
  "TECH.G9.MS.A2":
    "It's like a hand winch on a boat trailer. You turn it many times with little effort, and a click stops the boat rolling back.",
  "TECH.G9.MS.A3":
    "It's like the inside of a hand drill or a car's steering. Spinning gets turned around a corner, or turned into a straight slide.",
  "TECH.G9.MS.A4":
    "It's like an electric car window. A switch, a motor and moving parts all work together as one.",
  "TECH.G9.ES.A1":
    "It's like a recipe where you know two of the three amounts. If you know two, you can always work out the third.",
  "TECH.G9.ES.A2":
    "It's like the coloured stripes on a team kit. Each colour stands for something, so you can read the stripes like a code.",
  "TECH.G9.ES.A3":
    "It's like the gadgets in a kitchen drawer. A one-way valve, a light switch and a small water tank each do one special trick.",
  "TECH.G9.ES.A4":
    "It's like a security light that switches on by itself when it gets dark. It notices a change and responds without anyone touching it.",
  "TECH.G9.ES.A5":
    "It's like a gate that needs both a key and a code, compared to a house with two doorbells where either one rings the chime.",
  "TECH.G9.ES.A6":
    "It's like a small relay team. One notices the change, one passes on the message, and one does the job at the end.",
  "TECH.G9.PR.A1":
    "It's like a cut apple going brown in the air. Covering the cut side keeps the air off and stops it going brown.",
  "TECH.G9.PR.A2":
    "It's like making biltong. Taking away what germs need to grow is how you stop food going off.",
  "TECH.G9.PR.A3":
    "It's like candle wax compared to a boiled egg. Wax softens every time you heat it, but an egg stays hard once it's cooked.",
  "TECH.G9.PR.A4":
    "It's like a cooldrink bottle. Best not to buy one you don't need, next best to refill it, and last, send it off to be made into something new.",
};
