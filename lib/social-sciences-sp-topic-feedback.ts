// ─── Social Sciences — per-topic "real-life example" pictures ──────────────
//
// One everyday picture per topic (78), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "SSSP.G7.H1.A1":
    "It's like two neighbours swapping what they have spare. One has extra vegetables, the other has extra eggs, and both end up better off.",
  "SSSP.G7.H1.A2":
    "It's like the family that owns the only borehole in a dry area. Controlling something everyone needs makes them rich and powerful.",
  "SSSP.G7.H1.A3":
    "It's like a taxi rank that also has a library next door. People come for business and end up sharing ideas too.",
  "SSSP.G7.H2.A1":
    "It's like the difference between a small home bakery and a huge factory. Both make bread, but the size and the way they run are completely different.",
  "SSSP.G7.H2.A2":
    "It's like following a parcel's tracking steps, from where it was collected to where it ended up. Each stage leads to the next.",
  "SSSP.G7.H2.A3":
    "It's like the ways learners push back against an unfair rule. Some quietly drag their feet, others openly walk out.",
  "SSSP.G7.H2.A4":
    "It's like a pipe running from one dam to another. One fills up while the other runs dry.",
  "SSSP.G7.H3.A1":
    "It's like neighbours in one area who earn a living in different ways: one keeps animals, one lives off what the land provides, one grows crops.",
  "SSSP.G7.H3.A2":
    "It's like a fuel stop built halfway along a long highway. It starts as a place for travellers to refuel, not as a town.",
  "SSSP.G7.H3.A3":
    "It's like two different supply routes into two different shops. The same kind of business, but the goods come from completely different places.",
  "SSSP.G7.H3.A4":
    "It's like a neighbour who keeps moving their fence a little further into your yard each year. Slowly, you lose more and more of your land.",
  "SSSP.G7.H4.A1":
    "It's like a shop changing owners. The building is the same, but there's a new boss with new rules.",
  "SSSP.G7.H4.A2":
    "It's like a long-running fight between neighbours over a boundary. It flares up again and again, rather than being one single argument.",
  "SSSP.G7.H4.A3":
    "It's like a busy border crossing. People trade, travel and meet there, and arguments happen too.",
  "SSSP.G7.G1.A1":
    "It's like finding your seat at a stadium. First you find the right block along the side, then the row going up.",
  "SSSP.G7.G1.A2":
    "It's like giving directions with no landmarks. The person can't tell how far to go, which way to turn, or what they're looking for.",
  "SSSP.G7.G1.A3":
    "It's like measuring a winding path with a piece of string. You lay it along every bend, then straighten it out to see the real length.",
  "SSSP.G7.G1.A4":
    "It's like a street address with a house number and a street name. Together they lead you to one exact spot.",
  "SSSP.G7.G2.A1":
    "It's like a peach. There's a thin skin, a thick soft middle and a hard pip in the centre.",
  "SSSP.G7.G2.A2":
    "It's like cracks in a pavement. Weeds don't grow just anywhere, they push up along the cracks.",
  "SSSP.G7.G2.A3":
    "It's like two heavy tables pushed against each other. They stick and strain, then suddenly jump.",
  "SSSP.G7.G2.A4":
    "It's like pouring water onto a full sponge or a tarred parking lot. With nowhere to soak in, the water spreads and rises.",
  "SSSP.G7.G3.A1":
    "It's like the number of learners in a school. New learners join, others leave, and the total changes depending on which is bigger.",
  "SSSP.G7.G3.A2":
    "It's like the things that change how full a classroom is. For each one, you ask whether it pushes the number up or down.",
  "SSSP.G7.G3.A3":
    "It's like a quiet road that barely had cars for years, until it suddenly turned into a busy highway almost overnight.",
  "SSSP.G7.G4.A1":
    "It's like what you collect from your garden: water from the tank, vegetables from the soil. Useful things straight from nature, before any shop touches them.",
  "SSSP.G7.G4.A2":
    "It's like a bag of mealie meal that has to last the month. You take what you need and save the rest so it doesn't run out.",
  "SSSP.G7.G4.A3":
    "It's like one water tank shared by a whole street. What one house wastes, another has to go without.",
  "SSSP.G8.H1.A1":
    "It's like a whole family moving from a farm to the city. Where they live, how they work and what their days look like all change at once.",
  "SSSP.G8.H1.A2":
    "It's like signing a contract to work far from home for a set number of years. You can't just leave, even if the conditions turn out to be very hard.",
  "SSSP.G8.H1.A3":
    "It's like finding money buried in your garden. Suddenly everyone, including the powerful, wants control of your yard.",
  "SSSP.G8.H2.A1":
    "It's like a business that needs lots of cheap workers and makes it hard for people to earn a living any other way.",
  "SSSP.G8.H2.A2":
    "It's like the difference between picking fruit off a low branch and drilling a deep borehole. The deep job needs big money, big machines and many workers.",
  "SSSP.G8.H2.A3":
    "It's like a door hinge. Everything swings on that one point, and nothing looks the same afterwards.",
  "SSSP.G8.H3.A1":
    "It's like strangers dividing up a neighbourhood among themselves without asking the families who live there.",
  "SSSP.G8.H3.A2":
    "It's like a worked example in maths. One case, done in detail, shows how the bigger idea works.",
  "SSSP.G8.H4.A1":
    "It's like a dry forest and a single spark. Years of dry wood build up, and one match sets it all alight.",
  "SSSP.G8.H4.A2":
    "It's like a big storm. It's felt by the people out in it and by the families waiting at home, in very different ways.",
  "SSSP.G8.H4.A3":
    "It's like a team's reserves getting a run because the regulars are away. They prove themselves, and then they demand a fair place in the team.",
  "SSSP.G8.H4.A4":
    "It's like a referee who punishes one team so harshly that its supporters stay angry for years and want revenge.",
  "SSSP.G8.G1.A1":
    "It's like a photo shrunk to fit your phone screen. Everything gets smaller by the same amount, so you can still work out real sizes.",
  "SSSP.G8.G1.A2":
    "It's like a spinning top that's leaning slightly. It spins quickly, and at the same time slowly circles around the room.",
  "SSSP.G8.G1.A3":
    "It's like recognising a soccer field from an aeroplane window. You spot it by its colour and shape, not by reading a sign.",
  "SSSP.G8.G2.A1":
    "It's like what decides how warm a room is: how close it is to the heater, whether a window's open, which floor it's on and whether the curtains are drawn.",
  "SSSP.G8.G2.A2":
    "It's like comparing rooms in a big house. Upstairs or downstairs, near the windows or deep inside, each room has its own feel.",
  "SSSP.G8.G2.A3":
    "It's like the difference between what you ate today and what you usually eat. One is today, the other is your normal pattern.",
  "SSSP.G8.G3.A1":
    "It's like the rooms in a house. A busy kitchen, a noisy garage and quiet bedrooms, each used for its own purpose.",
  "SSSP.G8.G3.A2":
    "It's like the difference between a photo taken from directly above a table and one taken from the side at an angle.",
  "SSSP.G8.G3.A3":
    "It's like a learner choosing a new school. Problems at the old one push them away, and good things at the new one pull them in.",
  "SSSP.G8.G4.A1":
    "It's like choosing how to send something. A heavy couch goes in a truck, a letter goes by post, and something urgent goes by courier.",
  "SSSP.G8.G4.A2":
    "It's like the gates of a stadium. Everything going in or out has to pass through them.",
  "SSSP.G8.G4.A3":
    "It's like your trip to school each day. It costs money, it costs time in traffic, and it leaves fumes behind.",
  "SSSP.G9.H1.A1":
    "It's like a cracked wall in a storm. When the wall is already weak, one strong push brings it down.",
  "SSSP.G9.H1.A2":
    "It's like a court case with two separate charges. You keep the two crimes apart, because each needs its own judgement.",
  "SSSP.G9.H1.A3":
    "It's like a quiet neighbour who only joins a fight after someone breaks into their own house.",
  "SSSP.G9.H2.A1":
    "It's like two people who team up against a bully, then fall out the moment the bully is gone because they never really agreed.",
  "SSSP.G9.H2.A2":
    "It's like the first time someone builds a weapon so big that everyone suddenly has to rethink how fights could end.",
  "SSSP.G9.H2.A3":
    "It's like two coaches who never fight each other directly. Instead, the teams they back play against each other all over the place.",
  "SSSP.G9.H2.A4":
    "It's like a long-running feud that ends when the fence between two families comes down, and one family moves away.",
  "SSSP.G9.H3.A1":
    "It's like sorting people by the colour of their shoes. The groups are real only because people agreed to make them, not because of anything natural.",
  "SSSP.G9.H3.A2":
    "It's like unwritten bad habits in a club becoming written rules, strictly enforced on everyone.",
  "SSSP.G9.H3.A3":
    "It's like a learner body protesting an unfair school rule by organising, signing petitions and staying calm, instead of fighting.",
  "SSSP.G9.H4.A1":
    "It's like a sharp bend in a road. After it, the journey heads in a completely different direction.",
  "SSSP.G9.H4.A2":
    "It's like a protest at one school that spreads to every school in the country.",
  "SSSP.G9.H4.A3":
    "It's like ending a long dispute. First the doors are opened, then everyone talks it through, then everyone gets an equal say.",
  "SSSP.G9.G1.A1":
    "It's like the steps in a staircase. Steps close together mean a steep climb, and steps far apart mean a gentle one.",
  "SSSP.G9.G1.A2":
    "It's like a photo of your street with the house numbers and street names printed on top. A picture and a map in one.",
  "SSSP.G9.G1.A3":
    "It's like learning the icons on a new phone. Once you know what each one means, everything else is easy to read.",
  "SSSP.G9.G1.A4":
    "It's like two witnesses to the same event. One gives the layout, the other gives the details, and together you get the full story.",
  "SSSP.G9.G2.A1":
    "It's like judging a school on more than its fees. You also ask how well learners do and how happy and healthy they are.",
  "SSSP.G9.G2.A2":
    "It's like a car that won't start. There's usually more than one reason, and several problems add up.",
  "SSSP.G9.G2.A3":
    "It's like growing a family business. Bigger is good, but only if everyone in the family benefits and it doesn't use up what the children will need.",
  "SSSP.G9.G3.A1":
    "It's like a pothole forming in a road. The tar cracks and breaks up right where it is, before anything is carried away.",
  "SSSP.G9.G3.A2":
    "It's like a removal truck. It picks things up in one place, carries them, and unloads them somewhere else.",
  "SSSP.G9.G3.A3":
    "It's like a bare patch on a soccer field. With no grass holding it down, the soil washes away in the first heavy rain.",
  "SSSP.G9.G4.A1":
    "It's like a fruit tree compared to a tin of fruit. The tree keeps giving if you don't strip it bare, but the tin is gone once it's empty.",
  "SSSP.G9.G4.A2":
    "It's like a household living off its salary, not its savings, so there's still something left for the children later.",
  "SSSP.G9.G4.A3":
    "It's like a full shop that people can't afford to shop in. Having food around isn't enough, every household must be able to get it every day.",
};
