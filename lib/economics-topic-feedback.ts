// ─── Economics — per-topic "think of it like this" illustrations ──────────
//
// One concrete illustration per topic (51, Grades 10–12), keyed by skill/topic
// id. Feeds the wrong-answer card's example slot via FeedbackExplanation's
// `exampleOverride`. Register: FET / matric band, South African contexts.
// "why" = the question's memo, "how" = the topic's recovery_strategy,
// "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "ECON.G10.T1.CONCEPTS.A1":
    "A positive statement can be checked against the facts — 'unemployment is 32%'. A normative statement is an opinion with a 'should' in it — 'the government should cut taxes'.",
  "ECON.G10.T1.SCARCITY.A1":
    "Opportunity cost isn't the price tag — it's the next-best thing you gave up. Work a Saturday shift and the opportunity cost is the match you missed, not the bus fare.",
  "ECON.G10.T1.CIRCFLOW.A1":
    "Think of the economy as a bath with the tap running. Leakages — saving, tax, spending on imports — drain water out. Injections — investment, government spending, exports — pour it back in.",
  "ECON.G10.T1.GDP.A1":
    "GDP counts everything produced inside the borders, whoever owns it — a foreign-owned mine in Rustenburg is in SA's GDP. GNI counts what South Africans earn wherever they are — someone working in Dubai is in GNI, not GDP.",
  "ECON.G10.T1.BUSCYCLE.A1":
    "The business cycle is like the tide: trough (low) → recovery (rising) → peak or boom (high) → recession (falling) → next trough. It always moves through in that order.",
  "ECON.G10.T2.DEMSUP.A1":
    "If only the price changes, you slide along the existing demand curve (a movement). If something else changes — incomes, tastes, a health scare — the whole curve shifts left or right.",
  "ECON.G10.T2.MKTTYPES.A1":
    "A perfect market has many buyers and sellers, an identical product, and free entry — like a maize market where no single farmer can move the price. One seller with no rivals is a monopoly.",
  "ECON.G10.T2.PPC.A1":
    "The PPC is a fence line for what the economy can make. A point on the fence uses every resource efficiently; a point inside means idle factories and unemployed workers; a point beyond it is impossible for now.",
  "ECON.G10.T2.PUBSEC.A1":
    "A maximum price set below the market price — rent control — creates a shortage: many want it, few supply it. A minimum price above the market price — a minimum wage — creates a surplus: here, unemployed workers.",
  "ECON.G10.T3.GLOBHIST.A1":
    "Economies climbed a staircase over centuries: self-sufficiency → barter and trade → money → markets and towns → industrial factories → today's globalised trade.",
  "ECON.G10.T3.SAHIST.A1":
    "South Africa's economy shifted its centre of gravity: farming first, then mining once diamonds and gold were found, then manufacturing, and now mostly services — banking, retail, tourism.",
  "ECON.G10.T3.MONEYHIST.A1":
    "Money changed form: swapping goods (barter) → useful things used as money like cattle or salt (commodity money) → metal coins → paper notes → numbers on a bank app (electronic money).",
  "ECON.G10.T3.POPLAB.A1":
    "The labour force isn't everyone — it's people of working age who are working OR actively looking for work. A pensioner, and a discouraged person who has stopped searching, are both outside it.",
  "ECON.G10.T4.UNEMP.A1":
    "Different unemployment, different cause: cyclical comes from a downturn; structural is a skills mismatch (a miner's skills don't fit the new economy); frictional is the gap between quitting one job and starting the next; seasonal follows the calendar (a fruit picker in winter).",
  "ECON.G10.T4.LABREL.A1":
    "Match each to its job: the LRA governs unions, bargaining and disputes; the BCEA sets basic conditions like leave and hours; the CCMA is where a dismissed worker and the employer go to conciliate or arbitrate.",
  "ECON.G10.T4.REDRESS.A1":
    "Redress measures — Black Economic Empowerment, employment equity, land reform — all aim at the same thing: widening access to ownership, jobs and skills for people shut out under apartheid.",
  "ECON.G11.T1.FOP.A1":
    "Each factor earns its own kind of income: land earns rent, labour earns wages, capital earns interest, and the entrepreneur who combines them earns whatever profit is left.",
  "ECON.G11.T1.GDPEXP.A1":
    "The expenditure way to measure GDP adds up everyone's spending: households (C) + businesses on capital (I) + government (G) + exports minus imports (X − M).",
  "ECON.G11.T1.SYSTEMS.A1":
    "Who answers 'what to produce'? In a market economy, prices do. In a command economy, the state does. In a mixed economy — like South Africa's — it's both: markets run most of it, government runs schools, grants and some industries.",
  "ECON.G11.T1.STRUCTURE.A1":
    "The three sectors along one chain: primary extracts (mining, farming), secondary manufactures (factories), tertiary serves (banks, shops, transport). South Africa's economy leans heavily on tertiary now.",
  "ECON.G11.T2.ELAST.A1":
    "Elastic demand (greater than 1) means buyers react a lot — put up the price of restaurant meals and people eat at home. Inelastic demand (less than 1) means they barely react — the price of insulin or bread rises and people still buy it.",
  "ECON.G11.T2.MKTREL.A1":
    "Substitutes stand in for each other — tea and coffee, so if coffee jumps people switch to tea. Complements go together — cars and petrol, so a fuel-price spike drags down car sales too.",
  "ECON.G11.T2.MKTSTRUCT.A1":
    "A line from most to least competition: perfect competition (many sellers, identical product) → monopolistic competition (many, slightly different, like takeaway shops) → oligopoly (a few big firms, like the banks) → monopoly (one seller).",
  "ECON.G11.T2.COSTREV.A1":
    "Average cost is the cost spread over every unit — total cost ÷ number of units. Marginal cost is different: it's the extra cost of making just one more unit.",
  "ECON.G11.T2.WEALTH.A1":
    "The Gini coefficient runs from 0 (everyone has the same) to 1 (one person has everything). The more the Lorenz curve sags away from the diagonal, the more unequal the country — South Africa's is among the world's highest.",
  "ECON.G11.T2.GROWTH.A1":
    "Growth is just more output — GDP going up. Development is growth plus a better life: longer life expectancy, more schooling, less poverty. A country can grow without developing.",
  "ECON.G11.T3.DEVELOP.A1":
    "Developing economies tend to share a profile: low incomes and productivity, fast-growing populations, and heavy reliance on the primary sector — exporting raw materials rather than finished goods.",
  "ECON.G11.T3.POVERTY.A1":
    "Absolute poverty means you can't afford the basics — enough food, shelter, clean water — anywhere. Relative poverty means living far below the normal standard of the society around you, even if your basic needs are met.",
  "ECON.G11.T3.MONEY.A1":
    "Money does four jobs: you pay with it (medium of exchange), you save it (store of value), you price things in it (unit of account), and you borrow and repay in it over time (standard of deferred payment).",
  "ECON.G11.T3.BANKING.A1":
    "Two layers of banking: the Reserve Bank sits at the top, setting the repo rate and overseeing the system; commercial banks (Standard Bank, Capitec) sit below it, taking deposits and lending to the public.",
  "ECON.G11.T3.AFRICA.A1":
    "Three bodies to keep apart: SADC is the Southern African regional bloc; the AU is the whole-continent political union; NEPAD is the AU's economic development plan for Africa.",
  "ECON.G11.T4.GLOBAL.A1":
    "Comparative advantage: even if South Africa could make both wine and cars more cheaply than another country, it should focus on whichever it gives up the least to make, and trade for the rest. Both countries end up better off.",
  "ECON.G11.T4.ENVIRO.A1":
    "Sustainable development is like fishing a dam so lightly that the fish breed back — meeting today's needs without leaving the next generation worse off.",
  "ECON.G12.T1.CIRCFLOW.A1":
    "The national-account aggregates are one figure adjusted step by step. Start with GDP, add the income South Africans earn abroad and subtract what foreigners earn here, and you have GNI.",
  "ECON.G12.T1.MULTIPLIER.A1":
    "The multiplier is a ripple: government spends R1 million on a road, the workers spend most of their wages in local shops, those shopkeepers spend again — so total spending rises by more than R1 million. The more people save, the smaller the ripple.",
  "ECON.G12.T1.BUSCYCLE.A1":
    "Three timing groups of indicators: leading indicators turn before the economy does (building plans passed), coincident indicators move with it (GDP itself), lagging indicators turn after it (the unemployment rate).",
  "ECON.G12.T1.PUBSEC.A1":
    "Two policy levers, two owners: fiscal policy is the government's — taxing and spending through the budget; monetary policy is the Reserve Bank's — moving interest rates.",
  "ECON.G12.T1.BOP.A1":
    "The balance of payments has two main accounts: the current account records trade in goods and services plus income; the financial account records money moving in and out as investment and loans.",
  "ECON.G12.T1.FOREX.A1":
    "When the rand weakens, a Toyota imported from Japan costs more rand, but a South African orange costs foreigners fewer dollars — so imports get dearer and exports get more competitive. A stronger rand does the reverse.",
  "ECON.G12.T2.TRADE.A1":
    "Three tools to shield local producers: a tariff taxes imports to make them dearer, a quota caps how many may come in, and a subsidy pays local producers so they can undercut imports.",
  "ECON.G12.T2.PERFECT.A1":
    "A farmer selling maize in a perfectly competitive market is a price-taker — the market sets the price and one farmer's output is too small to move it. The only decision left is how much to grow.",
  "ECON.G12.T2.MONOPOLY.A1":
    "A monopoly can set its price (a price-maker), but it still can't escape the demand curve — charge more and it sells fewer units. It picks the price-quantity mix that gives the most profit.",
  "ECON.G12.T2.IMPERFECTOTHER.A1":
    "Oligopoly is a few big firms watching each other closely — like the cellphone networks, where one price move triggers a response. Monopolistic competition is many firms selling slightly different versions of the same thing — like the barber shops on one street.",
  "ECON.G12.T2.MKTFAIL.A1":
    "A negative externality is a cost dumped on others — a factory's smoke the neighbours breathe. A positive externality is a benefit others get free — you getting vaccinated also protects the people around you.",
  "ECON.G12.T3.GROWTHPOL.A1":
    "Demand-side policy tries to boost total spending — more government spending, lower interest rates. Supply-side policy tries to lift the economy's capacity to produce — training workers, building infrastructure, cutting red tape.",
  "ECON.G12.T3.INDDEV.A1":
    "Industrial policies like IPAP and the Special Economic Zones aren't welfare — they're aimed at building factories, exports and jobs in particular regions.",
  "ECON.G12.T3.ECONIND.A1":
    "A healthy economy shows a pattern: output, employment and productivity rising, with inflation low and steady. Falling output and rising inflation together (stagflation) is the warning sign.",
  "ECON.G12.T3.SOCIND.A1":
    "Economic indicators measure the money side — GDP, inflation, interest rates. Social indicators measure how people are actually living — life expectancy, literacy, access to water and housing.",
  "ECON.G12.T3.INFLATION.A1":
    "Demand-pull inflation is too much money chasing too few goods — a spending boom pushing prices up. Cost-push inflation comes from the other side — a fuel or wage increase raising producers' costs, which they pass on.",
  "ECON.G12.T3.TOURISM.A1":
    "One tourist's spending spreads through the multiplier: the hotel pays staff and buys food, the taxi driver fills up, the craft seller restocks — so tourism supports far more jobs than just the ones in hotels.",
  "ECON.G12.T3.ENVIRO.A1":
    "The big environmental summits — Rio de Janeiro and Johannesburg — set goals for sustainable development and protecting the planet. They're about the environment, not trade rules.",
};
