// ─── Creative Arts — per-topic "real-life example" pictures ────────────────
//
// One everyday picture per topic (43), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "CA.G7.MUL.A1":
    "It's like paying for a taxi with coins. Different coins are worth different amounts, but each trip must add up to exactly the same fare.",
  "CA.G7.MUL.A2":
    "It's like the label on a set of stairs saying 'upstairs' or 'downstairs'. The steps look the same, but the label tells you which floor you're on.",
  "CA.G7.MUL.A3":
    "It's like walking in step with a friend. Your feet keep a steady pattern, and one foot always lands a little harder than the others.",
  "CA.G7.MUL.A4":
    "It's like the floor buttons in a lift. Each step up has its own name, so you can say exactly where to go without guessing.",
  "CA.G7.MUE.A1":
    "It's like telling a friend about a taxi ride: how fast it went, how loud the radio was, and how the trip made you feel.",
  "CA.G7.MUE.A2":
    "It's like recognising each family member's voice from the next room. Once you know how each one sounds, you can pick them out even when everyone talks at once.",
  "CA.G7.MUP.A1":
    "It's like a crowd at a soccer match. One group keeps the same chant going while others add new shouts over the top.",
  "CA.G7.MUP.A2":
    "It's like a Mexican wave at a stadium. Each section does the same move, just starting a moment after the section before.",
  "CA.G7.VAE.A1":
    "It's like the ingredients in a pot of food. Every dish uses the same basic ingredients, just mixed in different amounts.",
  "CA.G7.VAE.A2":
    "It's like picking a school uniform. Some colours sit calmly together, while others clash and make each other stand out.",
  "CA.G7.VAE.A3":
    "It's like setting a table for guests. You spread things evenly, put the main dish where everyone sees it, and keep the place settings neat and matching.",
  "CA.G7.VAM.A1":
    "It's like writing with different pens. A soft pencil, a thin pen and a thick marker all leave very different marks, even for the same word.",
  "CA.G7.VAM.A2":
    "It's like building a wire car. You keep turning it to check every side, join each piece firmly, and don't waste or leave wire lying around.",
  "CA.G7.VAL.A1":
    "It's like giving a match report. First you say what actually happened on the field, then you say what you think it meant.",
  "CA.G7.VAL.A2":
    "It's like doing a school project on your favourite soccer club. You gather pictures and facts first, before you can say anything useful about them.",
  "CA.G8.MUL.A1":
    "It's like a minibus with a set number of seats. Every trip must fill exactly the same number of seats, whether people sit alone or in pairs.",
  "CA.G8.MUL.A2":
    "It's like a staircase where some steps are big and some are small, always in the same order. Start on any floor and the climb feels the same.",
  "CA.G8.MUL.A3":
    "It's like a notice on a classroom door that says 'no caps in this room'. It applies the whole lesson, without anyone repeating it.",
  "CA.G8.MUE.A1":
    "It's like road signs. Some tell you how fast to go, others tell you how to drive. Once you learn the signs, you can read any road.",
  "CA.G8.MUE.A2":
    "It's like different dishes from different homes. They all use salt, heat and time, just in their own amounts, so each tastes different.",
  "CA.G8.MUE.A3":
    "It's like sorting the noises in a kitchen by what makes them: a pot lid clanging, water boiling, a kettle whistling. You group sounds by how they're made.",
  "CA.G8.MUP.A1":
    "It's like writing a proper letter: a greeting, the main message, and a sign-off. Random sentences thrown together don't make a letter.",
  "CA.G8.VAE.A1":
    "It's like the leaves on one tree, from deep shade to bright sunlight. The shades are close relatives, so they sit together calmly.",
  "CA.G8.VAE.A2":
    "It's like arranging a shop window. The best item goes where the eye lands first, heavy and light things are spread out, and repeats keep it tidy.",
  "CA.G8.VAM.A1":
    "It's like cooking the same chicken three ways: braaied, stewed or fried. It's the same chicken, but each way gives a different result.",
  "CA.G8.VAM.A2":
    "It's like moving from building a wire car to a wire bicycle that actually works. There are more parts and more planning, but the same care.",
  "CA.G8.VAL.A1":
    "It's like choosing takkies. You ask whether they look good, and whether they grip and last. A good pair does both.",
  "CA.G8.VAL.A2":
    "It's like planning a trip. You check the route, look at pictures of where you're going, and pack before you set off.",
  "CA.G9.MUL.A1":
    "It's like the same phone number written by two different people. The digits are the same, they just sit differently on the page.",
  "CA.G9.MUL.A2":
    "It's like each school having its own uniform rules. Once you know which school you're at, you know the rules without being told each day.",
  "CA.G9.MUL.A3":
    "It's like adding extra rungs to a ladder so you can reach higher or lower than it normally goes.",
  "CA.G9.MUL.A4":
    "It's like counting the fence posts, not the gaps between them. You count the post you start at and the post you end at.",
  "CA.G9.MUL.A5":
    "It's like stacking tins on a shelf, skipping a space between each one. The same skipping pattern always builds the same neat stack.",
  "CA.G9.MUL.A6":
    "It's like saying the alphabet to a clapping rhythm. The letters stay in order, but each one has to fit the beat.",
  "CA.G9.MUE.A1":
    "It's like a hardware shop sorting its stock into aisles. Things are grouped by what they do, not by how big they are.",
  "CA.G9.MUE.A2":
    "It's like recognising a friend's walk from far away. Each style has its own way of moving that gives it away in seconds.",
  "CA.G9.MUE.A3":
    "It's like a story told around the fire, but sung instead of spoken, with everyone joining in different languages.",
  "CA.G9.MUP.A1":
    "It's like finishing a friend's sentence so it lands properly. Their half asks something, and your half answers it neatly.",
  "CA.G9.VAE.A1":
    "It's like family members sitting together at a table. They look related, so the group feels comfortable and calm.",
  "CA.G9.VAE.A2":
    "It's like being your own coach. You plan the game, play it, then watch the replay and judge it against your own plan.",
  "CA.G9.VAM.A1":
    "It's like cooking a family recipe your own way. You choose the ingredients that suit your taste, but you still cook it carefully and safely.",
  "CA.G9.VAL.A1":
    "It's like a slogan painted on the back of a taxi. The picture catches your eye, but the words are pushing a message.",
  "CA.G9.VAL.A2":
    "It's like a newspaper cartoonist. The drawing makes you smile, but it's really pointing at a problem in society.",
};
