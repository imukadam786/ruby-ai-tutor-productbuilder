// ─── Economics — per-topic "real-life example" pictures ────────────────────
//
// One everyday picture per topic (51), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "ECON.G10.T1.CONCEPTS.A1":
    "Think of your household budget versus the whole country's money. Looking at one family is close-up; looking at the whole nation is the big picture.",
  "ECON.G10.T1.SCARCITY.A1":
    "You have one free afternoon: soccer practice or a friend's party. Choosing one means giving up the other.",
  "ECON.G10.T1.CIRCFLOW.A1":
    "Think of money at a school fete: parents pay stall-holders, stall-holders buy supplies, and the money keeps going round. Some leaks out, and some new money comes in.",
  "ECON.G10.T1.GDP.A1":
    "Think of counting everything made in your street this year, versus everything earned by people from your street, wherever they work. Same people, two different totals.",
  "ECON.G10.T1.BUSCYCLE.A1":
    "It's like a tuck shop's year: busy months, quiet months, then busy again. The ups and downs repeat, sometimes from inside the school, sometimes from outside events.",
  "ECON.G10.T2.DEMSUP.A1":
    "Think of the price of tickets to a sold-out concert. When everyone wants them and there are few, the price climbs; when there are too many left, it drops.",
  "ECON.G10.T2.MKTTYPES.A1":
    "Think of a market with dozens of identical tomato stalls versus a town with just one water supplier. More sellers means less power for any one of them.",
  "ECON.G10.T2.PPC.A1":
    "Think of a learner with a set number of hours: more time for sport means less for homework. More energy or better study habits let them do more of both.",
  "ECON.G10.T2.PUBSEC.A1":
    "It's like a school capping tuck-shop prices to keep food affordable. Set the price too low, and the shop runs out because it can't afford to stock enough.",
  "ECON.G10.T3.GLOBHIST.A1":
    "Think of a family that once grew its own food, then swapped with neighbours, then used money, then started shopping online from around the world.",
  "ECON.G10.T3.SAHIST.A1":
    "Think of a town that first farmed, then grew rich from a mine, then built factories and shops. But when only some families get to share in it, the wealth stays uneven.",
  "ECON.G10.T3.MONEYHIST.A1":
    "Think of how people have paid for things over time: swapping goods, then coins, then notes, then cards and phones. Each step made trading easier.",
  "ECON.G10.T3.POPLAB.A1":
    "Think of a household: not everyone living there is working or looking for work. The kids, the students and gran are part of the family, but not part of its workforce.",
  "ECON.G10.T4.UNEMP.A1":
    "Think of three people without work: one lost their job when the shop closed in a slump, one has skills nobody needs anymore, and one is just between jobs.",
  "ECON.G10.T4.LABREL.A1":
    "It's like a class negotiating with the principal as a group through the class rep. Together, learners have a stronger voice than one learner alone.",
  "ECON.G10.T4.REDRESS.A1":
    "It's like a sports team that kept some players on the bench for years. Fixing it means giving those players real chances to play and lead.",
  "ECON.G11.T1.FOP.A1":
    "Think of making a braai: you need the yard, the people cooking, the grill and someone to organise it. Each one gets something back for what they bring.",
  "ECON.G11.T1.GDPEXP.A1":
    "Think of all the money spent in one town in a year: by families, by businesses on equipment, by the municipality, and by visitors, minus what was bought from outside.",
  "ECON.G11.T1.SYSTEMS.A1":
    "Think of a school where the principal decides everything, versus one where learners choose freely, versus one that mixes both. Most schools land in the middle.",
  "ECON.G11.T1.STRUCTURE.A1":
    "Think of a town's jobs: some dig and farm, some make things, some serve customers. As the town grows richer, more people end up in service jobs.",
  "ECON.G11.T2.ELAST.A1":
    "If the price of one brand of cooldrink goes up, people switch brands. If the price of medicine goes up, people still have to buy it.",
  "ECON.G11.T2.MKTREL.A1":
    "When the price of bread rises, people buy less margarine too. Things that go together, or replace each other, move together.",
  "ECON.G11.T2.MKTSTRUCT.A1":
    "Think of a town with one bus company, a few cellphone networks, or many hair salons each with their own style. The number of sellers changes how they compete.",
  "ECON.G11.T2.COSTREV.A1":
    "Think of selling one more plate at a fundraiser: does it bring in more than it costs to make? That's the question at every extra sale.",
  "ECON.G11.T2.WEALTH.A1":
    "Think of a class where a few learners own most of the books and the rest have hardly any. Even if there are plenty of books, most learners can't study well.",
  "ECON.G11.T2.GROWTH.A1":
    "It's like a bakery buying a faster oven. With the same staff, it can bake more bread every day.",
  "ECON.G11.T3.DEVELOP.A1":
    "Think of two towns: one with good roads, clinics and many kinds of work, the other relying on a single farm with poor roads. The second struggles to move forward.",
  "ECON.G11.T3.POVERTY.A1":
    "Not having enough for food and shelter is one kind of poverty. Having far less than your neighbours, even if you get by, is another.",
  "ECON.G11.T3.MONEY.A1":
    "Imagine saving coins in a jar while prices jump every week. By the time you spend them, they buy much less than you planned.",
  "ECON.G11.T3.BANKING.A1":
    "It's like a school with a principal setting the rules and class teachers working with learners each day. Different roles, same system.",
  "ECON.G11.T3.AFRICA.A1":
    "Think of neighbouring schools forming a league, sharing fields and buses. The smaller schools gain the most from the bigger shared setup.",
  "ECON.G11.T4.GLOBAL.A1":
    "Think of a learner who buys sneakers made overseas, streams music from another continent and chats to friends abroad, all in one day. The world is connected.",
  "ECON.G11.T4.ENVIRO.A1":
    "It's like a family using all the firewood now and leaving none for next winter. Using things wisely today keeps them there for later.",
  "ECON.G12.T1.CIRCFLOW.A1":
    "Think of a bath with the tap running and the plug half open. The water level stays steady only when what flows in matches what drains out.",
  "ECON.G12.T1.MULTIPLIER.A1":
    "Spend money at a spaza and the owner pays a supplier, who pays a driver, who buys lunch. Your one purchase keeps going round and grows the total.",
  "ECON.G12.T1.BUSCYCLE.A1":
    "It's like dark clouds warning of rain before it starts, versus puddles that show it rained yesterday. Some signs come early, others only confirm what happened.",
  "ECON.G12.T1.PUBSEC.A1":
    "It's like a parent who spends more on the family when times are slow, and cuts back when everyone's spending too much, to keep the household steady.",
  "ECON.G12.T1.BOP.A1":
    "Think of a household's record of money coming in and going out to the rest of the street. If more goes out than comes in, it has to borrow to cover the gap.",
  "ECON.G12.T1.FOREX.A1":
    "It's like swapping stickers with a friend. When your stickers are in demand, you get more for them; when nobody wants them, you get fewer.",
  "ECON.G12.T2.TRADE.A1":
    "Think of a school tuck shop that's protected from outside vendors at the gate. It helps the tuck shop, but learners may pay more and get less choice.",
  "ECON.G12.T2.PERFECT.A1":
    "Think of one tomato seller among dozens at a market. If they charge more than everyone else, nobody buys, so they have to accept the going price.",
  "ECON.G12.T2.MONOPOLY.A1":
    "Think of the only shop for kilometres. With no competition, it can charge what it likes, which is why someone needs to keep an eye on it.",
  "ECON.G12.T2.IMPERFECTOTHER.A1":
    "Think of a few big taxi associations on the same route. Each watches the others closely, and there's a temptation to quietly agree on fares.",
  "ECON.G12.T2.MKTFAIL.A1":
    "Think of a neighbour playing loud music all night. They enjoy it, but everyone else pays the price, and they don't pay for the trouble they cause.",
  "ECON.G12.T3.GROWTHPOL.A1":
    "It's like helping a tuck shop: either give learners more pocket money to spend, or help the shop work faster and stock more. One boosts buying; the other boosts selling.",
  "ECON.G12.T3.INDDEV.A1":
    "It's like a school offering a bursary to attract a great coach to start a new sports team. Support now builds a stronger school later.",
  "ECON.G12.T3.ECONIND.A1":
    "Think of a car's dashboard: speed, fuel, temperature. Each gauge tells you something different about how well the car is running.",
  "ECON.G12.T3.SOCIND.A1":
    "Think of judging a family's wellbeing not only by income, but by how healthy the children are and how well they're doing at school.",
  "ECON.G12.T3.INFLATION.A1":
    "It's like your taxi fare creeping up every few months. A small, steady rise is manageable; prices doubling every week would make planning impossible.",
  "ECON.G12.T3.TOURISM.A1":
    "Think of a seaside town that's packed in December and empty in winter. The visitors bring money and jobs, but not evenly through the year.",
  "ECON.G12.T3.ENVIRO.A1":
    "It's like neighbours agreeing to keep a shared stream clean. If only one household cares, it doesn't work; everyone has to play their part.",
};
