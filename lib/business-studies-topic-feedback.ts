// ─── Business Studies — per-topic "real-life example" pictures ─────────────
//
// One everyday picture per topic (55), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "BUS.G10.T1.MICRO.A1":
    "Think of your own household: you decide the rules, the budget and who does which chores. Inside your home, you're in charge.",
  "BUS.G10.T1.FUNCTIONS.A1":
    "Think of a school concert: someone buys supplies, someone builds the stage, someone sells tickets, someone handles the parents. Each job is different, and all are needed.",
  "BUS.G10.T1.MGMT.A1":
    "Think of a school: the principal plans the year, the heads of department run their subjects, and class teachers manage each lesson. Different levels, different jobs.",
  "BUS.G10.T1.QUALITY.A1":
    "Think of a restaurant meal: great food means little if the plate is dirty or the bill is wrong. Every part of the visit has to be good.",
  "BUS.G10.T1.MARKET.A1":
    "Think of the people around your spaza: customers, the supplier's truck and the rival shop across the road. You deal with them daily, but you can't control them.",
  "BUS.G10.T1.MACRO.A1":
    "It's like the weather on a school sports day. Nobody at school controls it; all you can do is plan for rain or sun.",
  "BUS.G10.T1.INTERREL.A1":
    "Think of a family: you control your house rules, you can persuade the neighbours, but you can only adapt to the price of bread.",
  "BUS.G10.T1.SECTORS.A1":
    "Follow a loaf of bread: the farmer grows the wheat, the bakery bakes it, and the shop sells it. Three different kinds of work.",
  "BUS.G10.T2.SOCIOECON.A1":
    "Think of a tuck shop in a neighbourhood where many parents have lost their jobs. Even good food sells less when people have little money.",
  "BUS.G10.T2.SOCRESP.A1":
    "It's like a learner who isn't forced to, but chooses to help younger kids with reading. Doing good beyond what's required builds goodwill.",
  "BUS.G10.T2.ENTRE.A1":
    "Think of a learner who starts selling sweets, loses money, then tries again with a better plan. Courage and refusing to give up count more than having money.",
  "BUS.G10.T2.OWNERSHIP.A1":
    "Think of running a car wash alone versus with a friend. Alone, you keep everything and carry every risk; with a friend, you share both.",
  "BUS.G10.T2.OWNERSHIP.A2":
    "It's like a stokvel that keeps going even when members change. The group carries on, and no single member is personally on the hook for everything.",
  "BUS.G10.T3.CREATIVE.A1":
    "Think of a class trying to raise money for a trip. Everyone throws out ideas first, then the class picks the best one and tests it.",
  "BUS.G10.T3.OPPORTUNITY.A1":
    "It's like checking whether classmates actually want a homework club before starting one: asking around, and weighing what's good and bad about the idea.",
  "BUS.G10.T3.LOCATION.A1":
    "Think of where to put a vetkoek stall: next to the taxi rank with hungry commuters, or on an empty side road. The spot can make or break it.",
  "BUS.G10.T3.CONTRACTS.A1":
    "It's like agreeing with a friend to share a rented room. Who pays what, who's responsible for what, and what happens if something breaks.",
  "BUS.G10.T3.PRESENT.A1":
    "Think of explaining your idea to the class: a clear poster and confident talk beat a page of messy notes read aloud.",
  "BUS.G10.T3.BUSPLAN.A1":
    "It's like planning a matric dance: a quick summary for parents, then details on the venue, how you'll invite people and what it'll cost.",
  "BUS.G10.T4.SELFMAN.A1":
    "Think of a learner who plans study time, stays calm before exams and arrives on time. Managing yourself well makes everything else easier.",
  "BUS.G10.T4.TEAM.A1":
    "It's like a group project where people talk openly and respect each other. The same group fails if one person is judged unfairly or ignored.",
  "BUS.G11.T1.INFLUENCE.A1":
    "Think of a soccer coach: they control training, can talk to the referee, but can only adapt to the weather on match day.",
  "BUS.G11.T1.CHALLENGES.A1":
    "Think of a family's problems: a broken fridge at home, a rude landlord next door, and rising petrol prices across the country. Each comes from a different place.",
  "BUS.G11.T1.ADAPT.A1":
    "It's like a school that can't stop a taxi strike but can start classes later, organise lifts and team up with nearby schools. You respond even when you can't control it.",
  "BUS.G11.T1.SOCIOECON.A1":
    "Think of a shop selling a brand-name jersey while fake copies are sold cheaply outside. The fakes steal sales from the real thing.",
  "BUS.G11.T1.SECTORS.A1":
    "Follow a pair of school shoes: hide from the farm, leather from the tannery, shoes from the factory, sold at the store. If one link breaks, the rest suffer.",
  "BUS.G11.T1.COMPANY.A1":
    "It's like a stokvel registered properly: more paperwork, but the group carries on when members change, and no one loses their own house if things go wrong.",
  "BUS.G11.T1.ACQUIRE.A1":
    "Think of starting a hair salon: build your own from scratch, buy an existing one, or open a well-known brand's branch. Each road has its own costs and risks.",
  "BUS.G11.T2.CREATIVE.A1":
    "Think of a bakery with leftover bread. Throwing it away is the usual answer; turning it into cheap sandwiches for a shelter is the creative one.",
  "BUS.G11.T2.STRESS.A1":
    "Think of three different days at school: a learner overwhelmed by deadlines, a burst pipe flooding the hall, and a new timetable everyone must learn.",
  "BUS.G11.T2.ACTIONPLAN.A1":
    "It's like turning 'we'll have a great matric dance' into a list: who books the venue, by which date, and who checks it's done.",
  "BUS.G11.T2.SETUP.A1":
    "Think of starting a car wash with borrowed money versus with partners who chip in. A loan must be repaid every month, even in a slow month.",
  "BUS.G11.T2.PROFETHICS.A1":
    "Think of a referee: being on time and fit is professionalism; refusing a bribe to favour one team is ethics. A good referee needs both.",
  "BUS.G11.T2.PRESENT.A1":
    "Think of a learner presenting to the class when someone asks a tough question. Staying calm and answering politely earns respect.",
  "BUS.G11.T3.ENTRE.A1":
    "Think of a learner running a tuck shop who keeps loyal customers coming back but has only one helper about to quit. Spotting the weak point is the first step to fixing it.",
  "BUS.G11.T3.CITIZEN.A1":
    "Think of a local shop owner who coaches the neighbourhood soccer team on weekends. Running a business and being a good neighbour go together.",
  "BUS.G11.T3.MARKETING.A1":
    "Think of selling homemade biscuits: what they look like, what you charge, where you sell them and how you tell people about them.",
  "BUS.G11.T3.PRODUCTION.A1":
    "Think of a kitchen preparing food for a big family event: following the recipe, keeping it clean and making sure nobody gets burnt.",
  "BUS.G11.T4.TEAM.A1":
    "It's like a group project where some love to lead, some love details and some keep everyone happy. When they clash, talking it through gets the project back on track.",
  "BUS.G11.T4.HR.A1":
    "Think of choosing a new class rep: advertise the role, shortlist, hold a quick interview, then show the winner what the job involves.",
  "BUS.G12.T1.LEGISLATION.A1":
    "It's like new school rules about uniforms and fair treatment. They take effort and cost to follow, but they make the school fairer and safer.",
  "BUS.G12.T1.HR.A1":
    "Think of running a sports club's people side: finding new players, paying coaches correctly and sending everyone on training courses.",
  "BUS.G12.T1.ETHICS.A1":
    "Think of a shop owner who always gives correct change and pays suppliers on time. Doing what's right, even when no one's watching, builds trust.",
  "BUS.G12.T1.CREATIVE.A1":
    "Think of a family hit by a car breakdown, a job loss and a rent increase in one month. One quick fix won't work; they need several ideas working together.",
  "BUS.G12.T1.STRATEGY.A1":
    "Think of a spaza owner deciding whether to buy the shop next door, add a new product, or close a section that's losing money. Each choice is a different strategy.",
  "BUS.G12.T2.CSR.A1":
    "Think of a local business that sponsors school soccer kits. The school gains, and the business earns goodwill from every family watching.",
  "BUS.G12.T2.HUMANRIGHTS.A1":
    "Think of a school that treats every learner fairly, builds ramps for wheelchair users and keeps its grounds clean. Fairness, inclusion and care all at once.",
  "BUS.G12.T2.TEAM.A1":
    "Think of two friends arguing over a group project. Sitting down, finding the real problem and agreeing on a fair plan fixes it better than taking sides.",
  "BUS.G12.T2.SECTORENV.A1":
    "Whether you run a farm, a factory or a shop, the same rule holds: you control your own yard, influence your neighbours and adapt to the weather.",
  "BUS.G12.T2.MGMTLEAD.A1":
    "Think of a soccer team: the manager arranges the fixtures and kit; the captain fires up the players on the field. Both matter, but they're different jobs.",
  "BUS.G12.T2.QUALITY.A1":
    "Think of a school where every teacher, cleaner and office worker keeps trying to do things a little better. Quality comes from everyone, all the time.",
  "BUS.G12.T3.SECURITIES.A1":
    "Think of saving in a stokvel versus betting all your money on one friend's new business. One is steady and safe; the other could win big or lose everything.",
  "BUS.G12.T3.INSURANCE.A1":
    "It's like a group of friends each putting a little into a pot, so whoever has an accident gets helped. Some pots are required; others you choose to join.",
  "BUS.G12.T3.OWNERSHIP.A1":
    "Think of choosing how to run a car wash: alone, with friends, or as a registered group. The choice affects how much you can raise and how much you risk.",
  "BUS.G12.T3.PRESENT.A1":
    "Think of explaining your class's test results to parents: a clear chart, the main point first, and calm answers to their questions.",
};
