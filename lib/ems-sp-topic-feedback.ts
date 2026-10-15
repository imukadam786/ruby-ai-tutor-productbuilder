// ─── EMS — per-topic "real-life example" pictures ──────────────────────────
//
// One everyday picture per topic (102), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "EMS.G7.E1.A1":
    "It's like swapping lunch at school. It only works if the friend with the sandwich you want happens to want your apple right now.",
  "EMS.G7.E1.A2":
    "It's like collecting tokens at a fair. You win tokens at one stall and spend them at any other stall you like.",
  "EMS.G7.E1.A3":
    "It's like a multi-tool penknife. One small thing does several different jobs, depending on what you need.",
  "EMS.G7.E2.A1":
    "It's like thirst. One person needs a cup, a family needs a tap, and a whole town needs a dam. The same need, just bigger.",
  "EMS.G7.E2.A2":
    "It's like packing for a camping trip. Some things you can't survive without, and others just make the trip more comfortable.",
  "EMS.G7.E2.A3":
    "It's like standing at the tuck shop with a little money and a long list of things you'd love. You have to choose.",
  "EMS.G7.E3.A1":
    "It's like the difference between buying a loaf of bread and paying someone to cut your hair. One you carry home, the other is something done for you.",
  "EMS.G7.E3.A2":
    "It's like a parent who goes to work during the day and then does the shopping on the way home. They're on both sides of the counter.",
  "EMS.G7.E3.A3":
    "It's like making one loaf of bread last the whole week. No waste, you use every slice, and it goes further.",
  "EMS.G7.E4.A1":
    "It's like a race where some runners start much further back than others. It's hard to catch up, however fast you run.",
  "EMS.G7.E4.A2":
    "It's like the same problem looking different in two places. In one, the shop is too crowded. In the other, the nearest shop is a long walk away.",
  "EMS.G7.E4.A3":
    "It's like the difference between giving someone a meal and teaching them to cook. The meal helps today, the skill helps every day after.",
  "EMS.G7.E5.A1":
    "It's like a kitchen. What goes in is the ingredients and the cook's effort, and what comes out is the meal.",
  "EMS.G7.E5.A2":
    "It's like a baker who finds a smarter way to work and bakes more loaves in the same hours with the same flour.",
  "EMS.G7.E5.A3":
    "It's like using a better stove that cooks faster, while only cutting as much firewood as the trees can grow back.",
  "EMS.G7.F1.A1":
    "It's like a tuck shop. There's what it owns, what it still owes the supplier, and what the owner put in to start it.",
  "EMS.G7.F1.A2":
    "It's like counting what's left in your pocket after a day out. Money came in, money went out, and what's left tells you how you did.",
  "EMS.G7.F1.A3":
    "It's like a car's rear-view mirror compared to the map for where you're going. One shows where you've been, the other plans where you're heading.",
  "EMS.G7.F2.A1":
    "It's like several taps all filling one bucket. Each tap is a different way money flows in.",
  "EMS.G7.F2.A2":
    "It's like adding up everything in your cupboard, then taking away what you borrowed from friends. What's left is really yours.",
  "EMS.G7.F2.A3":
    "It's like a family's money but on a bigger scale. The same idea of money in and money out, just with bigger amounts and different names.",
  "EMS.G7.F3.A1":
    "It's like a referee for your spending. It blows the whistle if what goes out is more than what comes in.",
  "EMS.G7.F3.A2":
    "It's like a family's spending plan, but for a shop. Expected money in on one side, expected costs on the other, checked before the month starts.",
  "EMS.G7.F4.A1":
    "It's like putting a few coins in a jar every week. When something breaks, there's money waiting.",
  "EMS.G7.F4.A2":
    "It's like a safe, a lending library and a post office rolled into one place.",
  "EMS.G7.F4.A3":
    "It's like keeping savings in different jars. One is locked at home, one stays closed for a whole year, and one is shared by a group of friends.",
  "EMS.G7.B1.A1":
    "It's like the difference between a big supermarket with a sign and a till, and someone selling sweets from a table on the corner.",
  "EMS.G7.B1.A2":
    "It's like the shops on one street. One resells things, one makes things, and one does a job for you.",
  "EMS.G7.B1.A3":
    "It's like a road closure during a storm. The shop can't get its deliveries, and customers can't get to the shop.",
  "EMS.G7.B2.A1":
    "It's like noticing nobody sells cold drinks at the soccer field on a hot day, and taking a chance by bringing a cooler box to sell from.",
  "EMS.G7.B2.A2":
    "It's like buying plain T-shirts, printing a cool design on them, and selling them for more than you paid.",
  "EMS.G7.B3.A1":
    "It's like a soccer team preparing for a match. You look at your own players' strengths and weaknesses, and at what the weather and other team might do.",
  "EMS.G7.B3.A2":
    "It's like putting up a poster where the right people will see it, with one clear reason to come and buy.",
  "EMS.G7.B3.A3":
    "It's like running a stall. The rent for the table stays the same however much you sell, but you need more ingredients for every extra item.",
  "EMS.G7.B4.A1":
    "It's like planning a school fun-day stall. You decide what to sell, set a fair price, list what you'll spend, and plan it all before the day.",
  "EMS.G7.B4.A2":
    "It's like counting the cash box after a market day. You take away what you spent from what you took in, and see if you came out ahead.",
  "EMS.G8.E1.A1":
    "It's like how a school system is run. Some decisions are made for the whole country, some for the area, and some by your own school.",
  "EMS.G8.E1.A2":
    "It's like a big landlord who looks after the building for the tenants, and also has to buy supplies and pay staff to do it.",
  "EMS.G8.E1.A3":
    "It's like a school and its suppliers. The school buys from them, sets rules they must follow, and helps some of them get started.",
  "EMS.G8.E2.A1":
    "It's like two ways of paying club fees. Some are taken off your pocket money before you get it, others are added when you buy something.",
  "EMS.G8.E2.A2":
    "It's like a street collecting money to fix the road and put up streetlights. Things everyone uses, that no single house could pay for alone.",
  "EMS.G8.E2.A3":
    "It's like a family deciding where to spend this year. Giving more help to the child who's struggling helps the whole family move forward together.",
  "EMS.G8.E3.A1":
    "It's like judging a home by how comfortable life is inside it, not just by how much money passes through the door.",
  "EMS.G8.E3.A2":
    "It's like building a new road through a park. Travel gets easier, but you lose the trees and the clean air.",
  "EMS.G8.E4.A1":
    "It's like the counter at a shop. You hand over money, and the shop hands over what you're buying.",
  "EMS.G8.E4.A2":
    "It's like the counter at a job interview. This time the business is the one paying, and you're the one offering your time and skills.",
  "EMS.G8.F1.A1":
    "It's like every payment having a payer and a receiver. Each one is written down from both sides.",
  "EMS.G8.F1.A2":
    "It's like a seesaw that always stays level. Whatever is on one side is matched exactly by what's on the other.",
  "EMS.G8.F1.A3":
    "It's like a seesaw with people climbing on and off. Every move changes at least two places, so it stays level.",
  "EMS.G8.F2.A1":
    "It's like keeping the slip when you buy something. Without the slip, there's no proof it happened.",
  "EMS.G8.F2.A2":
    "It's like the stub you keep when you hand in a raffle ticket. It's your own record of what you gave away.",
  "EMS.G8.F2.A3":
    "It's like a friend keeping a diary of everything you've borrowed and paid back. You check their list against your own.",
  "EMS.G8.F3.A1":
    "It's like a conveyor belt in a factory. Each item passes through every station in the same order before it's finished.",
  "EMS.G8.F3.A2":
    "It's like two notebooks at a till. One lists every coin coming in, and the other lists every coin going out.",
  "EMS.G8.F4.A1":
    "It's like a notebook just for money people give you. Every amount coming in gets written there first.",
  "EMS.G8.F4.A2":
    "It's like the inbox on your phone. Every message gets its own line, with who sent it and when.",
  "EMS.G8.F4.A3":
    "It's like adding up the score at the end of a match. You total each column, then carry the totals over to the main scoreboard.",
  "EMS.G8.F5.A1":
    "It's like a notebook just for money you hand out. Every amount going out gets written down there.",
  "EMS.G8.F5.A2":
    "It's like a shopping list you tick off. One item per line, then you add it all up at the end of the month.",
  "EMS.G8.F5.A3":
    "It's like two security guards at a gate, one counting people in and one counting people out. Together, nobody is missed.",
  "EMS.G8.F6.A1":
    "It's like lending a friend money. You write 'lent' in your book, and they write 'borrowed' in theirs. The same thing, recorded twice.",
  "EMS.G8.F6.A2":
    "It's like moving your rough notes into a neat file. The totals get copied into the right folders.",
  "EMS.G8.F6.A3":
    "It's like checking that a scale balances. If both sides come out exactly the same, the sums are in order.",
  "EMS.G8.B1.A1":
    "It's like the tools and starting cash for a car wash: the buckets, the hosepipe and the money in the float.",
  "EMS.G8.B1.A2":
    "It's like the people on a building site. Some have rare skills and some don't, so they get paid differently.",
  "EMS.G8.B1.A3":
    "It's like making a pot of stew. You need the ingredients, someone to cook, the pots and stove, and someone to plan the meal. Each gets something back.",
  "EMS.G8.B2.A1":
    "It's like the difference between running a spaza shop on your own and running it with your brother, sharing the work, the decisions and the money.",
  "EMS.G8.B2.A2":
    "It's like a club that exists on its own, apart from its members. It can own things and owe money, and each member holds a share of it.",
  "EMS.G8.B2.A3":
    "It's like many people each putting a little into a big pot. Together they can afford something no single person could, and it can employ far more people.",
  "EMS.G8.B3.A1":
    "It's like the staff at a school. Some people plan the whole year, some organise their department, and some run the class every day.",
  "EMS.G8.B3.A2":
    "It's like a coach preparing a team. Make a game plan, organise the players, lead them on the day, then check the result against the plan.",
  "EMS.G8.B3.A3":
    "It's like two kinds of captain. One makes every call alone, and the other asks the team before deciding.",
  "EMS.G9.E1.A1":
    "It's like a house where the parents decide every meal, how much each person gets and when they eat.",
  "EMS.G9.E1.A2":
    "It's like a fruit market where nobody sets the prices. They change through the day as buyers and sellers bargain.",
  "EMS.G9.E1.A3":
    "It's like a school where learners choose most things for themselves, but the school still provides some basics for everyone.",
  "EMS.G9.E2.A1":
    "It's like two people carrying a heavy table. Each relies on the other, and if one lets go, the table falls.",
  "EMS.G9.E2.A2":
    "It's like a chain of people passing full buckets one way and empty buckets back the other way.",
  "EMS.G9.E3.A1":
    "It's like what happens when your favourite snack suddenly costs much more. You buy less of it, or switch to something cheaper.",
  "EMS.G9.E3.A2":
    "It's like a learner who sells sweets at break. If they start fetching a good price, they bring more to sell.",
  "EMS.G9.E3.A3":
    "It's like haggling at a market until the buyer and the seller agree. That's the point where both are happy.",
  "EMS.G9.E4.A1":
    "It's like one learner asking for a change compared to the whole class asking together. Together, it's much harder to ignore.",
  "EMS.G9.E4.A2":
    "It's like a class representative speaking up for everyone. Because so many stand behind them, what they agree can affect the whole school.",
  "EMS.G9.F1.A1":
    "It's like buying sweets in bulk and selling them one by one at break. Every buy and every sale gets written down.",
  "EMS.G9.F1.A2":
    "It's like swapping one thing for another of the same value. You still have the same total, just in a different form.",
  "EMS.G9.F2.A1":
    "It's like moving a week of rough notes into a neat monthly summary, sorted by category.",
  "EMS.G9.F2.A2":
    "It's like a final score sheet with two columns. You list everything, then check both columns add up to the same total.",
  "EMS.G9.F3.A1":
    "It's like letting a friend take something now and pay you later. There are rules so nobody takes more than they can pay back.",
  "EMS.G9.F3.A2":
    "It's like a shop keeping one book for things sold to customers who'll pay later, and another for things those customers brought back.",
  "EMS.G9.F3.A3":
    "It's like a separate page for each friend who owes you money, so you can see exactly who owes what.",
  "EMS.G9.F4.A1":
    "It's like the shop that let you take something now and pay later. You owe them, and if you send something back, you owe them less.",
  "EMS.G9.F4.A2":
    "It's like keeping one book for things you bought to pay later, and another for things you sent back.",
  "EMS.G9.F4.A3":
    "It's like paying back a friend. The money in your pocket goes down, and so does what you owe them, by the same amount.",
  "EMS.G9.F5.A1":
    "It's like sorting post into the right pigeonholes. Each letter goes into the one box that fits it.",
  "EMS.G9.F5.A2":
    "It's like the final check before handing in a test. You make sure everything adds up before you're done.",
  "EMS.G9.B1.A1":
    "It's like following a loaf of bread. Someone grows the wheat, someone bakes the bread, and someone sells it to you.",
  "EMS.G9.B1.A2":
    "It's like a relay race. The baton passes from one runner to the next, and each runner moves it further along.",
  "EMS.G9.B2.A1":
    "It's like a soccer club. It needs coaches, medics, kit staff, ticket sellers and accountants, not just the players.",
  "EMS.G9.B2.A2":
    "It's like the different jobs in a household: one person shops, another cooks, another pays the bills. Different jobs, one home.",
  "EMS.G9.B2.A3":
    "It's like a band. If the drummer plays well but the singer stays silent, the whole song falls apart.",
  "EMS.G9.B3.A1":
    "It's like planning a road trip on paper before you leave, instead of just driving and hoping.",
  "EMS.G9.B3.A2":
    "It's like a school project with a set layout. Each section has its place, and the order makes it easy for anyone to follow.",
  "EMS.G9.B3.A3":
    "It's like a fundraising car wash. At first you're just paying back what you spent on soap and buckets, and only after that do you start making money.",
};
