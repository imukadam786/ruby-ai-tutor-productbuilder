// ─── Life Orientation SP — per-topic "think of it like this" analogies ───────
//
// One everyday analogy per topic (43), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Grades 7–9 register: short, concrete, everyday South African reference points.
// The card's other parts come from elsewhere: "why" = the question's memo,
// "how" = the topic's recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "LO.G7.DS.A1":
    "Your self-image is a mirror you build yourself: every promise you keep to yourself or kindness you show adds a clearer piece. Put-downs — from others or from you — crack it.",
  "LO.G7.DS.A2":
    "Puberty is like a batch of bread rising — every loaf proves at its own speed. A friend growing faster or slower than you doesn't mean anything is wrong with either of you.",
  "LO.G7.DS.A3":
    "Peer pressure is like someone pushing your trolley in the shop. Being assertive is keeping both hands on the handle and calmly steering where you meant to go.",
  "LO.G7.DS.A4":
    "Balancing your diet is like packing a school bag: you need a bit of everything for the day, not five of one book and nothing else. Swapping a cooldrink for water is one lighter book.",
  "LO.G7.HE.A1":
    "Knowing the risks of drugs and alcohol is like reading the road signs before a long trip — you see the dangerous bends coming and can choose another route.",
  "LO.G7.HE.A2":
    "Environmental health is like sweeping your yard: a clean space around you keeps flies, rats and sickness away from the whole street, not just your house.",
  "LO.G7.HE.A3":
    "Managing a common illness like asthma or diabetes is like servicing a car — with the right care, diet and medicine it keeps running well for years.",
  "LO.G7.CR.A1":
    "Rights and responsibilities are two sides of one coin: your right to be heard in class only works if you also stay quiet while someone else speaks.",
  "LO.G7.CR.A2":
    "Fair play is like a match with a referee everyone trusts — you can lose the game and still walk off with respect.",
  "LO.G7.CR.A3":
    "Abuse is never the victim's fault, the same way a house being broken into is never the fault of the person who lives there. Knowing the warning signs and a number to call is like having a working lock and a neighbour to shout to.",
  "LO.G7.CR.A4":
    "Religions pass on their values like a grandparent telling family stories at night — through spoken traditions and sacred writings that each generation learns and retells.",
  "LO.G7.WW.A1":
    "A memory trick is like a hook on the wall: instead of dropping facts on the floor, you hang each one where you can find it again.",
  "LO.G7.WW.A2":
    "A career field is like a shelf in the shop: 'health' holds nurses, paramedics and pharmacists together, and each job on that shelf needs certain school subjects to reach it.",
  "LO.G7.WW.A3":
    "Every job has its own kit — a mechanic's overalls and spanners, a chef's whites and knives. Work isn't only about pay; it also gives your day a purpose.",
  "LO.G8.DS.A1":
    "Your self-concept is built from many voices — family, friends, teachers, social media. Positive self-talk is you being one more voice on your own side, like a coach on the sideline.",
  "LO.G8.DS.A2":
    "Sexuality is one part of who you are, shaped by your feelings, values and upbringing — like one instrument in a band, not the whole song.",
  "LO.G8.DS.A3":
    "A healthy friendship is like a rope pulled from both ends — respect, honesty and talking things through keep it tight. If only one person pulls, it goes slack.",
  "LO.G8.HE.A1":
    "Pressure to use substances usually comes from friends, community and adverts, not a stranger. Refusal skills are like knowing your lines before a play so you're not caught speechless.",
  "LO.G8.HE.A2":
    "Protecting the environment works at two levels: big laws, like fines for illegal dumping, and small daily habits, like not littering. Both matter, the way a dam wall needs the whole structure and every brick.",
  "LO.G8.HE.A3":
    "HIV today is managed like high blood pressure — daily medication lets someone live a long, full life. Treating people with the virus normally, not with fear, is part of that care.",
  "LO.G8.CR.A1":
    "Nation building is like a stokvel: people who are different all put something in, and everyone is stronger for the shared pot than they'd be alone.",
  "LO.G8.CR.A2":
    "A rights violation is like someone jumping the clinic queue and shoving others aside. We push back by speaking up and reporting it, not by staying quiet.",
  "LO.G8.CR.A3":
    "Gender equity is like giving every learner a chair that fits so they can reach the same desk. Gender-based violence is a crime, and there are places to report it and get help.",
  "LO.G8.CR.A4":
    "South Africa's cultures are like a plate of different dishes at a family gathering — each one adds flavour, and respecting all of them is what makes it a shared meal.",
  "LO.G8.CR.A5":
    "Faith-based groups often run the soup kitchen, the shelter or the crèche in a community — religion putting its values to work through charity and care.",
  "LO.G8.WW.A1":
    "Knowing your learning style is like knowing whether you find a place better from a map, from someone's directions, or by walking it once. Study the way that sticks for you.",
  "LO.G8.WW.A2":
    "The six career types are like six aisles in a hardware shop. Walking down the aisle that matches your interests narrows thousands of jobs to a handful worth a closer look.",
  "LO.G8.WW.A3":
    "Your strongest subjects are like footprints showing which way you naturally walk. A good subject choice weighs interest, ability and what you enjoy — not just what a friend picked.",
  "LO.G9.DS.A1":
    "A clear goal is like an address you type in before a trip: without it you drive around; with it, every turn is a choice for or against getting there.",
  "LO.G9.DS.A2":
    "Protecting your sexual health is like wearing a seatbelt — choices like abstinence lower the risk of STIs, HIV and early pregnancy before anything goes wrong.",
  "LO.G9.DS.A3":
    "Hard feelings are like a heavy bag — carrying it is normal, but healthy coping and asking for help share the load. Alcohol or drugs just add bricks.",
  "LO.G9.HE.A1":
    "Volunteering is like helping a neighbour push their stalled car: you're not paid, but the street moves again and next time it might be your car.",
  "LO.G9.HE.A2":
    "Solving conflict with words instead of fists is like using the handbrake before the car rolls — talking and problem-solving stop things before they crash.",
  "LO.G9.CR.A1":
    "A national day like Freedom Day is like a birthday for the country — it only means something if you remember what happened and why. Good citizens respect others' rights the rest of the year too.",
  "LO.G9.CR.A2":
    "Constitutional values like equality and dignity are the house rules of the country — they decide how everyone gets treated at the door, not just on paper.",
  "LO.G9.CR.A3":
    "Look past the different buildings and books and the major religions give the same core instruction: treat others with peace, compassion and respect.",
  "LO.G9.CR.A4":
    "Sport ethics is playing the game as if the referee could see everything — no diving, no doping, no rough stuff, whether or not you'd get caught.",
  "LO.G9.WW.A1":
    "Managing time is like packing a taxi: plan what goes where and everything fits; throw it in any order and half gets left on the pavement.",
  "LO.G9.WW.A2":
    "Writing a summary is like drawing someone a quick map instead of handing over the whole street directory — it forces you to keep only what matters.",
  "LO.G9.WW.A3":
    "After Grade 9, the NSC at school and the NCV at a college are like two different taxis to work — one isn't better, they just suit different destinations.",
  "LO.G9.WW.A4":
    "A job comes with rights and responsibilities the way a driver's licence does — you may drive, and you must follow the rules of the road.",
  "LO.G9.WW.A5":
    "Your Grade 10 subjects are like doors along a passage: taking Maths keeps the engineering and accounting doors open; dropping it quietly locks several.",
  "LO.G9.WW.A6":
    "A bursary or student loan is like a bridge over the fee — it gets you across to the qualification. Lifelong learning means you keep crossing new bridges long after school.",
};
