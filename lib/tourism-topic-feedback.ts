// ─── Tourism — per-topic "real-life example" pictures ──────────────────────
//
// One everyday picture per topic (80), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "TOUR.G10.T1.INTRO.A1":
    "Think of visiting your gran in another town versus flying overseas for a soccer final. Both are trips, but who goes where, and why, changes what kind of trip it is.",
  "TOUR.G10.T1.TYPES.A1":
    "It's like planning a birthday party: a quiet dinner suits one friend, a loud club suits another. You first find out who the guest is, then plan around them.",
  "TOUR.G10.T1.TRANSPORT.A1":
    "Getting to school can mean walking, a taxi, a bus or a lift. Each suits a different distance, budget and hurry.",
  "TOUR.G10.T1.ACCOM.A1":
    "Think of staying with relatives, sleeping over at a friend's, or booking a room with breakfast made for you. Each gives a different level of service and cost.",
  "TOUR.G10.T1.GRADING.A1":
    "It's like a report card from an outside examiner. The grade means more because someone independent checked the work, not the learner marking themselves.",
  "TOUR.G10.T1.ACCOMTERMS.A1":
    "Think of the features of a good cellphone: some keep it secure, some entertain you, some just make life easier. Each extra has its own purpose.",
  "TOUR.G10.T1.FANDB.A1":
    "Think of buying lunch: a vetkoek from a stall, a burger from a counter, or a sit-down meal where someone brings it to your table. Same hunger, different service.",
  "TOUR.G10.T1.ATTRSECTOR.A1":
    "You go to a cousin's wedding, and while you're in town you pop into the mall. The wedding is why you went; the mall is the extra.",
  "TOUR.G10.T1.INDUSTRY.A1":
    "It's like a school fundraiser run by the principal, local businesses and parents together. Each group has its own job, and it only works if they all pitch in.",
  "TOUR.G10.T1.PAYMENT.A1":
    "Paying for things can mean coins at a spaza, tapping a card at a till, or a payment app on your phone. The right one depends on where you are and how much it costs.",
  "TOUR.G10.T2.MAPTERMS.A1":
    "It's like the icons on your phone screen: a small picture stands for something bigger, and once you know the key, you can read it at a glance.",
  "TOUR.G10.T2.MAPTYPES.A1":
    "Think of the different apps on your phone: one for the weather, one for taxi routes, one for nearby food. Each shows the same area for a different purpose.",
  "TOUR.G10.T2.SAMAP.A1":
    "It's like knowing your own neighbourhood: which street the school is on, which corner the clinic is on. Once you know the landmarks, everything else falls into place.",
  "TOUR.G10.T2.WORLDMAP.A1":
    "Think of a school with grades, classes and sports houses. The same learner belongs to several groups at once, depending on how you're sorting them.",
  "TOUR.G10.T2.DISTANCE.A1":
    "It's like a taxi fare chart on the rank wall: find where you're starting and where you're going, and read across to where they meet.",
  "TOUR.G10.T2.DOMESTIC.A1":
    "Think of buying from the spaza down the road instead of ordering from overseas. Your money stays in the neighbourhood and helps the people around you.",
  "TOUR.G10.T2.DOMSTATS.A1":
    "Think of your school's tuck shop records: which months are busiest, and how much each learner spends. The numbers tell the story of the year.",
  "TOUR.G10.T3.PROVATTR.A1":
    "Think of each family member's favourite room at home. Every room has its own special thing that draws people in.",
  "TOUR.G10.T3.SANPARKS.A1":
    "Think of a public library versus a private reading club. Both have books, but one is open to all and run for everyone; the other is exclusive and costs more.",
  "TOUR.G10.T3.FAUNAFLORA.A1":
    "Think of plants that grew in your gran's garden for generations versus a weed that arrived on someone's shoe. One belongs; the other can take over.",
  "TOUR.G10.T3.SUSTAIN.A1":
    "It's like a three-legged potjie. It needs all three legs to stand: take one away and the whole pot tips over.",
  "TOUR.G10.T3.RESPONSIBLE.A1":
    "It's like being a good guest at someone's house: you clean up after yourself, don't break anything and respect how they do things.",
  "TOUR.G10.T3.GLOBALWARM.A1":
    "Think of a soccer team whose home ground keeps flooding. If the field gets ruined, nobody comes to watch, so looking after it protects the club.",
  "TOUR.G10.T3.MARKETING.A1":
    "Think of a learner running for class rep. They figure out what classmates want, what makes them different, and how to get the message out.",
  "TOUR.G10.T4.CULTURE.A1":
    "Think of your family's recipes, songs and stories. They're passed down, they make you who you are, and once they're lost, they're hard to get back.",
  "TOUR.G10.T4.HERITSITES.A1":
    "Think of a family photo album and a national museum. Both keep memories, but one matters to your family and the other matters to the whole country.",
  "TOUR.G10.T4.COMMS.A1":
    "Think of reaching a friend: you can phone, send a voice note, text or chat face-to-face. The tool you pick changes how the message comes across.",
  "TOUR.G10.T4.SERVICE.A1":
    "Think of the hairdresser you keep going back to. It's not just the cut; it's how they treat you, and you tell all your friends about them.",
  "TOUR.G11.T1.AIRPORTS.A1":
    "Think of the main taxi rank in town. Taxis from everywhere meet there, and it's where most people start or end their trip.",
  "TOUR.G11.T1.AIRTERMS.A1":
    "It's like the rules on a school bus: where to sit, what to do in an emergency, and why some seats come with extra responsibility.",
  "TOUR.G11.T1.AIRTECH.A1":
    "Think of the turnstiles, cameras and info screens at a stadium. Some keep people safe, some tell them where to go, some just speed things up.",
  "TOUR.G11.T1.BUS.A1":
    "Think of a regular school bus versus a party bus hired for a matric dance. Both are buses, but one is built for a special purpose.",
  "TOUR.G11.T1.RAIL.A1":
    "It's like the difference between a daily school lift and a luxury limo for prom. Both get you there, but one is about the trip itself.",
  "TOUR.G11.T1.CRUISE.A1":
    "It's like a school camp where meals, a bed and activities are all included in one price. You pay once and everything is sorted.",
  "TOUR.G11.T1.CARRENTAL.A1":
    "It's like borrowing a friend's bike: you need to show you can ride, agree on rules, and pay extra if you break something.",
  "TOUR.G11.T2.DTGS.A1":
    "It's like a school trying to get more learners to use its own library, not just in exam season but all year, and in every grade.",
  "TOUR.G11.T2.SEGMENTS.A1":
    "Think of a teacher who sorts a class into groups by what each group enjoys, so every group gets work that suits it.",
  "TOUR.G11.T2.CULTURE.A1":
    "Think of a school talent show with dancers, singers and artists from different backgrounds. The variety is exactly what makes people want to watch.",
  "TOUR.G11.T2.HERITAGE.A1":
    "It's like a school having a principal for the whole school and a head of each grade. One looks after everything; the others look after their own part.",
  "TOUR.G11.T2.FOREX.A1":
    "Think of money a visitor spends at a spaza. The owner pays the supplier, the supplier pays a driver, and the same money keeps helping people down the line.",
  "TOUR.G11.T2.CURRENCY.A1":
    "It's like swapping stickers with a friend at an agreed rate. You need to know which way you're swapping before you work out how many you get.",
  "TOUR.G11.T3.SADC.A1":
    "Think of neighbouring schools forming a sports league together. They share fields, advertise the league as one, and everyone gets more games.",
  "TOUR.G11.T3.SADCATTR.A1":
    "Think of each friend's house having its own special thing: one has the pool, one has the best food. Visiting the neighbourhood means getting all of them.",
  "TOUR.G11.T3.ITINERARY.A1":
    "It's like planning a sleepover: who's coming, what you'll do, when you'll eat and when everyone rests. Too much packed in and everyone gets tired.",
  "TOUR.G11.T3.PROMO.A1":
    "Think of a school event advertised on a big banner at the gate versus a teacher personally inviting each learner. One reaches many; the other reaches the right few.",
  "TOUR.G11.T3.BUDGET.A1":
    "It's like planning money for a class fundraiser: some for printing posters, some for transport, some for finding out what people want to buy.",
  "TOUR.G11.T3.GDS.A1":
    "Think of a booking app that shows every taxi company's seats at once, versus one company's own booking book. One covers everyone; the other covers just itself.",
  "TOUR.G11.T4.CUSTCARE.A1":
    "It's like hosting a friend from another culture: you learn how they greet, what they eat, and you make them feel welcome without judging.",
  "TOUR.G11.T4.COMPLAINTS.A1":
    "Think of a friend who's upset with you. Listening, saying sorry without blaming them, and fixing it keeps the friendship.",
  "TOUR.G11.T4.QUALITY.A1":
    "It's like a sports coach who sets standards, checks every practice and asks the players how it's going. Doing all of these keeps the team sharp.",
  "TOUR.G11.T4.CAREERS.A1":
    "Think of everyone who makes a school concert happen: the people on stage, in the kitchen, at the door and driving the bus. Many different jobs, one event.",
  "TOUR.G11.T4.REQUIREMENTS.A1":
    "It's like being a good class rep: being friendly, patient and a good listener matters as much as knowing the rules.",
  "TOUR.G11.T4.ENTREPRENEUR.A1":
    "Think of a learner who sees classmates need snacks after sport and starts selling them. Spotting a need and taking a chance is how a business starts.",
  "TOUR.G12.T1.PROIMAGE.A1":
    "Think of how a school is judged by its uniforms, its gate and how learners behave on the taxi. The image comes from everyone, not just the principal.",
  "TOUR.G12.T1.CONDEMP.A1":
    "It's like school rules that every school must follow, plus extra rules each school adds for its own needs.",
  "TOUR.G12.T1.CONTRACT.A1":
    "It's like a written agreement before you start a part-time job: what you'll do, what you'll be paid and how you're expected to behave.",
  "TOUR.G12.T1.CODECON.A1":
    "It's like a class's agreed rules for group work: everyone knows what's expected, so they work well together and trust each other.",
  "TOUR.G12.T1.TIMEZONES.A1":
    "Think of phoning a cousin overseas: when you're eating supper, they might still be asleep. The same moment shows a different time on each clock.",
  "TOUR.G12.T2.ICONS.A1":
    "Think of a school famous for its choir. Even people who've never been there know the name, and the choir makes them curious to visit.",
  "TOUR.G12.T2.ATTRSUCCESS.A1":
    "Think of a tuck shop that's clean, friendly and easy for everyone to reach. The things it does well show up in long queues and full takings.",
  "TOUR.G12.T2.TOURPLAN.A1":
    "It's like planning a taxi route through town to drop off several friends: you pick the order and roads that waste the least time.",
  "TOUR.G12.T2.ITINERARY.A1":
    "It's like a matric dance-day schedule: hair, photos, transport, the venue. Each part is listed so nothing gets forgotten.",
  "TOUR.G12.T2.BUDGET.A1":
    "It's like planning money for a class outing: transport, food, entry tickets and a little extra for surprises, all added up before you go.",
  "TOUR.G12.T2.HEALTHSAFE.A1":
    "It's like packing for a camp: medicine in case you get sick, and a lock for your bag in case things go missing. Two different kinds of protection.",
  "TOUR.G12.T2.TRAVELDOC.A1":
    "It's like what you need to write an exam: your ID, your exam number and your permission slip. Without the right papers, you can't get in.",
  "TOUR.G12.T3.WHSUNESCO.A1":
    "It's like an award from a respected outside body. The badge puts the school on the map and comes with a promise to keep standards up.",
  "TOUR.G12.T3.WHSSA.A1":
    "Think of a school with trophies for both sport and music. Some honours are for what people achieved; others are for natural talent.",
  "TOUR.G12.T3.RAND.A1":
    "It's like your pocket money being worth more or less depending on the day. On a good day it buys a lot; on a bad day the same coins buy less.",
  "TOUR.G12.T3.FOREX.A1":
    "Think of swapping your lunch for a friend's at an agreed trade. You need to know the swap rate and which way you're trading.",
  "TOUR.G12.T3.BSRBBR.A1":
    "Think of a second-hand textbook shop. It pays you less to buy your old book than it charges to sell you one. The gap is how the shop earns.",
  "TOUR.G12.T3.EXRATE.A1":
    "It's like prices at the mall going up just as your pocket money shrinks. You go to the cheaper shop nearby instead.",
  "TOUR.G12.T3.PAYMENT.A1":
    "It's like going on a school trip with some cash, a bank card and money on your phone. Different places accept different things, so you take a mix.",
  "TOUR.G12.T3.GLOBALEVENTS.A1":
    "Think of a school sports day ruined by a sudden storm, versus one boosted by a big visiting team. Some events are planned; others come out of nowhere.",
  "TOUR.G12.T3.MARKETSHARE.A1":
    "Think of a school counting how many visitors came to its open day and from which areas. The numbers show where interest is coming from.",
  "TOUR.G12.T4.PILLARS.A1":
    "It's like a three-legged potjie: it needs all three legs to stand. A good guest helps keep every leg strong.",
  "TOUR.G12.T4.TOURISTCODE.A1":
    "It's like the rules for visiting someone's home: respect the people, pay your share and leave the place as you found it.",
  "TOUR.G12.T4.ROLEPLAYERS.A1":
    "It's like keeping a school clean: the principal sets rules, the cleaners do their part, and learners don't litter. It fails if any one group stops.",
  "TOUR.G12.T4.FEEDBACK.A1":
    "Think of a teacher handing out a quick survey at the end of the term. What learners say shows what's working and what to fix.",
  "TOUR.G12.T4.SERVICE.A1":
    "Think of two hair salons with the same prices. The one with friendlier, better-trained staff is the one with the full appointment book.",
  "TOUR.G12.T4.MARKETSA.A1":
    "It's like a school advertising itself at other schools' open days, so more families hear about it and want to come.",
};
