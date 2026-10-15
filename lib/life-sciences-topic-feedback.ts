// ─── Life Sciences — per-topic "real-life example" pictures ────────────────
//
// One everyday picture per topic (70), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "LSC.G10.S1.CHEM.A1":
    "It's like checking a plate of food for what's in it: some things you need in large amounts, some only in tiny pinches, but you can't go without either.",
  "LSC.G10.S1.CHEM.A2":
    "Think of building with Lego: a few kinds of small bricks snap together to make everything else. Living things build their bodies the same way.",
  "LSC.G10.S1.CHEM.A3":
    "It's like a key that fits only one lock. Heat it and bend it out of shape, and it won't open anything anymore.",
  "LSC.G10.S1.CELL.A1":
    "Think of a school: the office runs things, the kitchen provides energy, the bins handle waste. Each room has its own job.",
  "LSC.G10.S1.CELL.A2":
    "Think of a crowded taxi: people spread out into empty seats on their own. Pushing someone into an already full taxi takes extra effort.",
  "LSC.G10.S1.CELL.A3":
    "It's like zooming in on a phone photo. You need to know how much you zoomed in before you can tell how big something really is.",
  "LSC.G10.S1.MITO.A1":
    "It's like photocopying a document, then splitting the pile into two identical sets. Each new set is an exact copy of the original.",
  "LSC.G10.S1.MITO.A2":
    "Think of a photocopier that won't stop printing. Most of the time copying is useful; when it runs out of control, it causes a mess.",
  "LSC.G10.S1.TISS.A1":
    "Think of a soccer team: defenders, midfielders and strikers are all players, but each is trained for a different job.",
  "LSC.G10.S1.TISS.A2":
    "Think of your gran's home remedy that a pharmacist later tests and turns into a proper medicine with a safe dose. Old knowledge, new checking.",
  "LSC.G10.S2.PTRN.A1":
    "Think of a tent: the poles keep it standing, and the air inside pressing outwards keeps the walls taut. Let the air out and it sags.",
  "LSC.G10.S2.PTRN.A2":
    "Think of drinking through a long straw: as you suck at the top, liquid is pulled up from the bottom.",
  "LSC.G10.S2.ASUP.A1":
    "Think of the frame of a house: it holds everything up, protects what's inside and gives the walls something to attach to.",
  "LSC.G10.S2.ASUP.A2":
    "Think of a door hinge: it can wear out from years of use, or rust from the inside. Two different problems, two different fixes.",
  "LSC.G10.S2.ASUP.A3":
    "Think of a tug-of-war rope tied to a gate. One team pulls it open, the other pulls it shut. They work in opposite directions.",
  "LSC.G10.S2.CIRC.A1":
    "Think of a double taxi route: one loop to fetch fresh supplies, another to deliver them across town. Keeping the loops separate makes deliveries faster.",
  "LSC.G10.S2.CIRC.A2":
    "Think of a city's road system: highways out from the centre, small streets reaching every house, and roads back in. Each type is built for its job.",
  "LSC.G10.S2.CIRC.A3":
    "Think of a kitchen pipe slowly clogged by years of grease. It works fine until one day it blocks completely.",
  "LSC.G10.S3.ECO.A1":
    "Think of your household, your street, your suburb and your city. Each is part of a bigger whole, and what happens in one affects the others.",
  "LSC.G10.S3.ECO.A2":
    "Think of passing a bucket of water down a line of people. A little spills at each handover, so there's less left at the end.",
  "LSC.G10.S3.ECO.A3":
    "Think of a stokvel: the same money goes round and round the members. Nothing is new; it's just passed along and reused.",
  "LSC.G10.S3.ECO.A4":
    "Think of weighing yourself at the same time every day. If you weigh at different times, you can't tell if you've really changed.",
  "LSC.G10.S4.BIO.A1":
    "Think of how a school sorts learners into grades, classes and houses, and gives each learner a full name. It makes it easy to find anyone.",
  "LSC.G10.S4.BIO.A2":
    "Think of a family heirloom that's one of a kind. Once it's lost or broken, it can't be replaced.",
  "LSC.G10.S4.HOL.A1":
    "Think of layers of old newspapers stacked in a garage. The deeper you dig, the older the news, and each layer tells you what was happening then.",
  "LSC.G11.S4.MICR.A1":
    "Think of all the different visitors who might come to a house: some helpful, some harmless, some troublemakers. They're not all the same kind of guest.",
  "LSC.G11.S4.MICR.A2":
    "Think of yeast in bread dough: tiny helpers that make the bread rise. Other tiny visitors make you sick, so it depends which one you meet.",
  "LSC.G11.S4.PLNT.A1":
    "Think of the first homes people built: simple, low to the ground and needing to be near water. Later designs could stand taller and further away.",
  "LSC.G11.S4.PLNT.A2":
    "Think of packing a lunchbox for a long trip. Some plants pack their babies' food with them, so they can start growing anywhere.",
  "LSC.G11.S4.PREP.A1":
    "Think of a courier delivering a parcel from one house to another. The parcel has to reach the right door before anything else can happen.",
  "LSC.G11.S4.PREP.A2":
    "Think of a parent packing a lunchbox and sending a child off to school. The food and the trip give the child the best chance.",
  "LSC.G11.S4.ANIM.A1":
    "Think of sorting all the tools in a garage into groups by how they're built, not by colour. Similar designs go together.",
  "LSC.G11.S4.ANIM.A2":
    "Think of a family tree: the oldest branch lived in water, later branches moved onto land, and each new branch added something new.",
  "LSC.G11.S2.PHOT.A1":
    "Think of a solar panel charging a battery. Light goes in, stored energy comes out, and that stored energy powers everything else.",
  "LSC.G11.S2.PHOT.A2":
    "Think of baking bread: you can add all the flour you like, but if you run out of yeast, the bread won't rise. The thing in shortest supply holds everything back.",
  "LSC.G11.S2.NUTR.A1":
    "Think of a factory line that breaks big boxes into smaller pieces at each station, until the parts are small enough to send out.",
  "LSC.G11.S2.NUTR.A2":
    "Think of a car that needs the right fuel, oil and water. Too little of one, or too much of another, and it starts breaking down.",
  "LSC.G11.S2.RESP.A1":
    "Think of a car engine: with plenty of air it runs smoothly; choke the air and it splutters, gives less power and leaves a mess behind.",
  "LSC.G11.S2.RESP.A2":
    "Think of two neighbours swapping: one gives the other its leftovers, and the other gives back exactly what the first one needs. Each relies on the other.",
  "LSC.G11.S2.GAS.A1":
    "Think of a sponge: the more holes and folds it has, the more water it can soak up quickly.",
  "LSC.G11.S2.GAS.A2":
    "Think of different ways to get fresh air in a house: windows, vents or a fan. Different homes use different systems, but the job is the same.",
  "LSC.G11.S2.EXCR.A1":
    "Think of sorting rubbish: everything is tipped onto a table, the useful things are picked back out, and only the real waste goes in the bin.",
  "LSC.G11.S2.EXCR.A2":
    "Think of a broken water filter at home. A machine can do the filtering for you, but it takes hours and needs regular visits.",
  "LSC.G11.S3.POP.A1":
    "Think of a school hall: it can only fit so many people. Once it's full, no matter how many more arrive, there's simply no more space.",
  "LSC.G11.S3.POP.A2":
    "Think of the different relationships in a neighbourhood: neighbours who help each other, one who borrows and never returns, and two shops competing for customers.",
  "LSC.G11.S3.IMP.A1":
    "Think of sleeping under a thick blanket. A light one keeps you comfortable; pile on too many and you overheat.",
  "LSC.G11.S3.IMP.A2":
    "It's like a weed in a vegetable garden that grows fast and drinks all the water, crowding out what you actually planted.",
  "LSC.G11.S3.IMP.A3":
    "Think of a spider web cut into pieces by a broom. Even if most of the threads remain, the web can't do its job anymore.",
  "LSC.G12.S1.DNA.A1":
    "Think of a zip: each tooth on one side fits only one matching tooth on the other side, so the two sides lock together perfectly.",
  "LSC.G12.S1.DNA.A2":
    "Think of unzipping a jacket and using each side as a template to build a new matching half. You end up with two complete zips.",
  "LSC.G12.S1.PROT.A1":
    "It's like copying a recipe from a precious recipe book onto a card, taking the card to the kitchen, and cooking the dish from it.",
  "LSC.G12.S1.PROT.A2":
    "Think of a typo in a recipe. Some make no difference, some spoil the dish, and some accidentally make it better.",
  "LSC.G12.S1.MEI.A1":
    "Think of shuffling a deck of cards and dealing out half to each player. Every hand is different from the others.",
  "LSC.G12.S1.MEI.A2":
    "Think of dealing cards where one player accidentally gets an extra card and another gets one fewer. The game doesn't go the way it should.",
  "LSC.G12.S2.VREP.A1":
    "Think of two families: one has many children and can give each little attention; the other has few and gives each a lot. Both are strategies.",
  "LSC.G12.S2.HREP.A1":
    "Think of a delivery system: one place makes the parcels, another sends them out, and a third is the safe home where they're received.",
  "LSC.G12.S2.HREP.A2":
    "Think of preparing a guest room every month: clean sheets, everything ready. If no guest arrives, it's cleared out and prepared again next month.",
  "LSC.G12.S2.HREP.A3":
    "Think of locking a door, a gate and a window. Each lock works differently, and none of them protects you in every situation.",
  "LSC.G12.S2.NRV.A1":
    "Think of a school office: different staff handle different jobs, like timetables, discipline and fees, and the main corridor carries messages to every classroom.",
  "LSC.G12.S2.NRV.A2":
    "Think of touching a hot pot: you pull your hand away before you've even thought about it. The message takes a shortcut.",
  "LSC.G12.S2.SENS.A1":
    "Think of a camera with a cloudy lens. Everything is still there, but the picture comes out blurry.",
  "LSC.G12.S2.SENS.A2":
    "Think of a microphone that picks up sound and a spirit level that tells you if a shelf is straight. Two jobs, both important.",
  "LSC.G12.S2.END.A1":
    "Think of a school's PA system: one announcement reaches every classroom, slower than a shout but lasting much longer.",
  "LSC.G12.S2.END.A2":
    "Think of a thermostat that's stopped working. Without it, the room gets far too hot or cold, and someone has to adjust it by hand.",
  "LSC.G12.S2.HOM.A1":
    "Think of a geyser with a thermostat: when the water gets too hot it switches off, and when it cools it switches on again.",
  "LSC.G12.S2.HOM.A2":
    "Think of a bank account managed to stay within a set range: deposit when it's low, withdraw when it's high, so it never runs dry or overflows.",
  "LSC.G12.S4.DAR.A1":
    "Think of a family resemblance across generations in old photos. Small changes add up over time, and the photos are the evidence.",
  "LSC.G12.S4.DAR.A2":
    "Think of two groups of friends who move to different towns and stop meeting. Over the years they develop their own slang until they barely understand each other.",
  "LSC.G12.S4.HUM.A1":
    "Think of a big family tree with many branches, some still alive and some ended long ago. We're one surviving branch.",
  "LSC.G12.S4.HUM.A2":
    "Think of finding your family's oldest letters in your grandparents' attic. The best clues to where your family began are kept right here at home.",
};
