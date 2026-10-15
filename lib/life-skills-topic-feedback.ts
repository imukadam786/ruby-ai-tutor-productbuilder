// ─── Life Skills — per-topic "real-life example" pictures ──────────────────
//
// One everyday picture per topic (82), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "LS.L1.BKH.T01":
    "It's like looking after a new bicycle. You keep it clean and check it often, so it keeps working well.",
  "LS.L1.BKH.T02":
    "It's like a soccer team. Everyone knows where to stand and what to do, so the game runs smoothly.",
  "LS.L1.BKH.T03":
    "It's like the roof, walls and floor of a house. Each part has its own job, and together they keep everyone safe inside.",
  "LS.L1.BKH.T04":
    "It's like a game of tag with rules. Everyone knows the rules, so nobody gets hurt.",
  "LS.L1.BKH.T05":
    "It's like filling a car with the right fuel. Put in the right thing, and it runs well all day.",
  "LS.L1.BKH.T06":
    "It's like a baby who can't feed itself. Someone has to give it food, water and love every day.",
  "LS.L1.BKH.T07":
    "It's like the friend who stops to help when you fall, even when everyone else keeps running.",
  "LS.L1.BKH.T08":
    "It's like a team where every player has a different job. Together they look after everyone.",
  "LS.L1.BKH.T09":
    "It's like knowing your way around your own house in the dark. You know where everything is.",
  "LS.L1.BKH.T10":
    "It's like an old photo album. Turning the pages shows how things used to be.",
  "LS.L1.BKH.T11":
    "It's like sharing an umbrella in the rain. A good friend makes sure you both stay dry.",
  "LS.L1.BKH.T12":
    "It's like a big pot of soup with many ingredients. Each one adds its own taste, and together it is delicious.",
  "LS.L2.BKH.T01":
    "It's like choosing a jacket for the weather. A thick one for cold days, a light one for hot days.",
  "LS.L2.BKH.T02":
    "It's like a kettle on the stove. You need it every day, but you have to be careful around it.",
  "LS.L2.BKH.T03":
    "It's like your cupboard changing through the year. Jerseys come out, then T-shirts come back.",
  "LS.L2.BKH.T04":
    "It's like a car engine. Lots of parts inside each do a job, and you look after them so it keeps going.",
  "LS.L2.BKH.T05":
    "It's like a lunch table where every child brings food from home. Every lunchbox looks different.",
  "LS.L2.BKH.T06":
    "It's like different batteries for different toys. Each one gives power, but you must use them safely.",
  "LS.L2.BKH.T07":
    "It's like the different children in a class. Some like apples, some like sandwiches, and some like both.",
  "LS.L2.BKH.T08":
    "It's like a pot on the stove that starts to bubble over. You turn the heat down before it spills.",
  "LS.L2.BKH.T09":
    "It's like a classroom after a party. If nobody cleans up, it soon gets messy and smelly.",
  "LS.L2.BKH.T10":
    "It's like a school badge. Everyone who wears it knows they belong to the same school.",
  "LS.L2.BKH.T11":
    "It's like a team kit. Each player wears what they need to play their position safely.",
  "LS.L2.BKH.T12":
    "It's like children dancing in a circle around a fire, each one going round at their own distance.",
  "LS.L3.BKH.T01":
    "It's like dressing for the day. A raincoat for rain, a uniform for school, your best clothes for a wedding.",
  "LS.L3.BKH.T02":
    "It's like a family garden. You plant, water and wait, and then the garden feeds you.",
  "LS.L3.BKH.T03":
    "It's like the last few sweets in a jar. Once they're gone, there aren't any more.",
  "LS.L3.BKH.T04":
    "It's like the difference between shouting across the street and sending a voice note. Both share a message, in different ways.",
  "LS.L3.BKH.T05":
    "It's like a rumour in the playground. It passes from one person to the next unless someone stops it.",
  "LS.L3.BKH.T06":
    "It's like the special spots in your town that everyone knows by name.",
  "LS.L3.BKH.T07":
    "It's like a family story told at the dinner table. It helps you understand where you come from.",
  "LS.L3.BKH.T08":
    "It's like a messy bedroom. Rubbish left lying around makes it unpleasant for everyone.",
  "LS.L3.BKH.T09":
    "It's like a sudden storm at a picnic. You can't stop it, but you can be ready for it.",
  "LS.L3.BKH.T10":
    "It's like an older cousin you look up to. You notice how they behave and want to be like them.",
  "LS.L3.BKH.T11":
    "It's like a box of crayons. Every colour is different, and every one is useful.",
  "LS.L3.BKH.T12":
    "It's like a birthday party. People come together, share food and make a day feel special.",
  "LS.L4.PSW.T01":
    "It's like a toolbox. Every person has some tools they are really good at using.",
  "LS.L4.PSW.T02":
    "It's like your own bedroom. Nobody comes in without asking, and you knock before you go into theirs.",
  "LS.L4.PSW.T03":
    "It's like two children pulling the same rope from opposite ends. Somebody has to stop and talk.",
  "LS.L4.PSW.T04":
    "It's like weather inside you. Sunny, stormy or cloudy, every kind is normal, and it changes.",
  "LS.L4.PSW.T05":
    "It's like a group carrying a heavy table. It only works if everyone lifts at the same time.",
  "LS.L4.PSW.T06":
    "It's like a referee blowing the whistle on a foul. Someone has to speak up to stop it.",
  "LS.L4.PSW.T07":
    "It's like a library card. It lets you borrow books, and you have to look after them and bring them back.",
  "LS.L4.PSW.T08":
    "It's like different families' recipes for the same dish. Each one is special to that family.",
  "LS.L4.PSW.T09":
    "It's like different paths up the same mountain. Each group walks its own way.",
  "LS.L4.PSW.T10":
    "It's like a sleeping dog. It looks calm, but you still treat it with care.",
  "LS.L4.PSW.T11":
    "It's like the rules in a busy school corridor. Keep left, don't push, and everyone gets where they're going.",
  "LS.L4.PSW.T12":
    "It's like your toothbrush. Some things are just for you.",
  "LS.L4.PSW.T13":
    "It's like leaving jam on a plate overnight. If you don't clean it off, ants come.",
  "LS.L4.PSW.T14":
    "It's like a fish tank. If the water gets dirty, the fish get sick.",
  "LS.L4.PSW.T15":
    "It's like a phone with a weak battery. With the right charger every day, it keeps working well.",
  "LS.L5.PSW.T01":
    "It's like a mirror that other people hold up to you. Kind people help you see what's good in you.",
  "LS.L5.PSW.T02":
    "It's like a coach after a match. They tell you what went well and what to practise next.",
  "LS.L5.PSW.T03":
    "It's like a kettle building up steam. You let it out slowly and safely, before it boils over.",
  "LS.L5.PSW.T04":
    "It's like a garden gate. You open it for people you trust, and keep it closed for those you don't.",
  "LS.L5.PSW.T05":
    "It's like judging a book by its cover before you've read a single page.",
  "LS.L5.PSW.T06":
    "It's like a house where the roof should keep everyone dry, but it lets the rain in. You need someone to fix it.",
  "LS.L5.PSW.T07":
    "It's like seeing dark clouds before a storm. You notice the warning signs and get to safety early.",
  "LS.L5.PSW.T08":
    "It's like an older tree giving shade to young plants, while the young plants keep the garden growing.",
  "LS.L5.PSW.T09":
    "It's like the different birthdays in your family. Each one has its own way of being celebrated.",
  "LS.L5.PSW.T10":
    "It's like a kitchen drawer with sharp knives. Useful, but kept out of reach and handled with care.",
  "LS.L5.PSW.T11":
    "It's like a shared jug of juice at a party. If one person takes too much, others go without.",
  "LS.L5.PSW.T12":
    "It's like building with blocks. You need different shapes to make something strong.",
  "LS.L5.PSW.T13":
    "It's like a leaking roof in a classroom. One problem in the building affects everyone inside.",
  "LS.L5.PSW.T14":
    "It's like a learner who is left out of a game because of a rumour that isn't even true.",
  "LS.L5.PSW.T15":
    "It's like a hook on a fishing line. It looks like a treat, but once you bite, it's hard to get free.",
  "LS.L6.PSW.T01":
    "It's like a filtered photo. What you see online is not what people look like in real life.",
  "LS.L6.PSW.T02":
    "It's like a seed in a pot. What it grows into depends on the water and sunshine it gets.",
  "LS.L6.PSW.T03":
    "It's like a current in a river. It pulls you along unless you swim firmly your own way.",
  "LS.L6.PSW.T04":
    "It's like two people trying to get through one door at once. One of you has to step back and talk.",
  "LS.L6.PSW.T05":
    "It's like packing a school bag the night before. Plan ahead, and the morning goes smoothly.",
  "LS.L6.PSW.T06":
    "It's like a bad habit, like biting your nails. It's hard to stop, but with help you can.",
  "LS.L6.PSW.T07":
    "It's like the steps on a staircase. Each step marks moving up to a new level.",
  "LS.L6.PSW.T08":
    "It's like every child in a class having their own name tag. Each one matters.",
  "LS.L6.PSW.T09":
    "It's like a younger brother or sister who depends on you to look after them.",
  "LS.L6.PSW.T10":
    "It's like holding the door for someone carrying heavy bags. You notice what they need.",
  "LS.L6.PSW.T11":
    "It's like a quilt made from many different patches. Each patch is different, but together they make one blanket.",
  "LS.L6.PSW.T12":
    "It's like a sign that says only some people may use the playground. It's unfair, and it isn't true that others can't play.",
  "LS.L6.PSW.T13":
    "It's like a spare wheel in the car boot. You hope you won't need it, but you're glad to know how to use it.",
  "LS.L6.PSW.T14":
    "It's like keeping your schoolbooks away from a leaking bottle. Some things must be kept apart to stay clean.",
  "LS.L6.PSW.T15":
    "It's like glitter at a craft table. Once it's out, it spreads to everyone nearby.",
  "LS.L6.PSW.T16":
    "It's like a story that keeps changing as it's passed around. You check the facts before you believe it.",
};
