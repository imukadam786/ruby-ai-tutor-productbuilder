// ─── Life Orientation — per-topic "real-life example" pictures ─────────────
//
// One everyday picture per topic (43), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "LO.G7.DS.A1":
    "It's like a garden you look after yourself. Every kind word and kept promise waters it, and every put-down, even your own, pulls up a plant.",
  "LO.G7.DS.A2":
    "It's like bread rising in different ovens. Every loaf rises at its own speed, and a slower loaf isn't a worse one.",
  "LO.G7.DS.A3":
    "It's like someone grabbing your trolley in the shop. You keep both hands on the handle and calmly steer where you meant to go.",
  "LO.G7.DS.A4":
    "It's like packing a school bag. You need a bit of everything for the day, not five of the same book and nothing else.",
  "LO.G7.HE.A1":
    "It's like reading the road signs before a long trip. You see the dangerous bends coming and can choose a safer route.",
  "LO.G7.HE.A2":
    "It's like sweeping your yard. A clean space around your home keeps pests and sickness away from the whole street, not just your house.",
  "LO.G7.HE.A3":
    "It's like looking after a car. With regular care and the right parts, it keeps running well for years.",
  "LO.G7.CR.A1":
    "It's like taking turns to speak in class. You get to be heard, and that only works if you also listen when it's someone else's turn.",
  "LO.G7.CR.A2":
    "It's like a match with a referee everyone trusts. You can lose the game and still walk off the field with respect.",
  "LO.G7.CR.A3":
    "It's like a house being broken into. It's never the fault of the person who lives there, and knowing who to call is like having a neighbour you can shout to.",
  "LO.G7.CR.A4":
    "It's like a grandparent telling family stories at night. What matters gets passed on by being spoken and written down, so each generation learns it again.",
  "LO.G7.WW.A1":
    "It's like hooks on a wall. Instead of dropping things on the floor, you hang each one where you can find it again.",
  "LO.G7.WW.A2":
    "It's like shelves in a shop. Similar items sit together, so once you find the right shelf you can compare everything on it.",
  "LO.G7.WW.A3":
    "It's like the tools in a toolbox. Each tool has its own job, and using it well gives you a reason to be proud of your day's work.",
  "LO.G8.DS.A1":
    "It's like a soccer match with a crowd shouting from all sides. You can be your own coach on the sideline, cheering yourself on.",
  "LO.G8.DS.A2":
    "It's like one instrument in a band. It's an important part of the sound, but it isn't the whole song.",
  "LO.G8.DS.A3":
    "It's like a rope pulled tight from both ends. When both people pull, it holds. When only one pulls, it goes slack.",
  "LO.G8.HE.A1":
    "It's like knowing your lines before a school play. When the moment comes, you aren't caught with nothing to say.",
  "LO.G8.HE.A2":
    "It's like keeping a shared house clean. House rules matter, but so does everyone washing their own cup every day.",
  "LO.G8.HE.A3":
    "It's like someone who takes a pill every morning for a long-term condition. With steady care they live a full life, and their friends treat them normally.",
  "LO.G8.CR.A1":
    "It's like a stokvel. Different people each put something in, and everyone is stronger with the shared pot than they'd be alone.",
  "LO.G8.CR.A2":
    "It's like someone shoving to the front of a queue. Everyone suffers if nobody speaks up, so you say something or tell someone in charge.",
  "LO.G8.CR.A3":
    "It's like making sure every learner gets a chair that fits, so they can all reach the same desk.",
  "LO.G8.CR.A4":
    "It's like a table at a family gathering, full of different dishes. Each one adds flavour, and together they make one shared meal.",
  "LO.G8.CR.A5":
    "It's like a group of neighbours who meet every week and then run a soup kitchen together. Their shared beliefs turn into real help.",
  "LO.G8.WW.A1":
    "It's like finding your way to a new place. Some people need a map, some need directions read out, and some need to walk it once.",
  "LO.G8.WW.A2":
    "It's like the aisles in a big shop. Walking down the aisle that matches what you like narrows thousands of items to a few worth a look.",
  "LO.G8.WW.A3":
    "It's like footprints in the sand showing which way you naturally walk. A good choice follows your own footprints, not someone else's.",
  "LO.G9.DS.A1":
    "It's like typing an address in before a trip. Without it you drive around in circles, and with it every turn takes you closer.",
  "LO.G9.DS.A2":
    "It's like putting on a seatbelt before you drive. The choice you make before anything happens is what keeps you safe.",
  "LO.G9.DS.A3":
    "It's like carrying a heavy bag. It's normal to struggle, and sharing the load with someone makes it lighter. Grabbing quick fixes just adds more bricks.",
  "LO.G9.HE.A1":
    "It's like helping a neighbour push their stalled car. Nobody pays you, but the street moves again, and next time it might be your car.",
  "LO.G9.HE.A2":
    "It's like pulling up the handbrake before a car rolls downhill. Stopping early, calmly, prevents the crash.",
  "LO.G9.CR.A1":
    "It's like a family birthday. It only means something if you remember why you're celebrating, and you treat each other well the rest of the year too.",
  "LO.G9.CR.A2":
    "It's like the house rules in a home. They decide how everyone gets treated, not just what's written on the fridge.",
  "LO.G9.CR.A3":
    "It's like different families with different recipes all teaching their children the same thing: be kind to the people around you.",
  "LO.G9.CR.A4":
    "It's like playing as if the referee could see everything. You play fair whether or not anyone would catch you.",
  "LO.G9.WW.A1":
    "It's like loading a taxi's roof rack. Plan what goes where and everything fits. Throw it on in any order and half gets left on the pavement.",
  "LO.G9.WW.A2":
    "It's like choosing your clothes for the day. You dress differently for a funeral, a soccer match and a visit to granny.",
  "LO.G9.WW.A3":
    "It's like two different taxis heading out of the rank. Neither is better, they just go to different destinations.",
  "LO.G9.WW.A4":
    "It's like getting a driver's licence. You're allowed to drive, and you have to follow the rules of the road.",
  "LO.G9.WW.A5":
    "It's like a passage with doors along it. The choices you make now keep some doors open and quietly lock others.",
  "LO.G9.WW.A6":
    "It's like a bridge over a river. It gets you across to the other side, and you keep finding new bridges to cross long after school.",
};
