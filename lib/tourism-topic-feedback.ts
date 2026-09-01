// ─── Tourism — per-topic "think of it like this" illustrations ─────────────
//
// One concrete illustration per topic (80, Grades 10–12), keyed by skill/topic
// id. Feeds the wrong-answer card's example slot via FeedbackExplanation's
// `exampleOverride`. Register: FET / matric band, South African contexts.
// "why" = the question's memo, "how" = the topic's recovery_strategy,
// "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "TOUR.G10.T1.INTRO.A1":
    "Think from the traveller's front door: a German flying to Cape Town is inbound to South Africa; a South African flying to Mauritius is outbound; a Joburg family driving to Durban is domestic.",
  "TOUR.G10.T1.TYPES.A1":
    "Name the trip by its main reason. Staying with your cousin in Durban = VFR (visiting friends and relatives); a low-impact game walk = eco-tourism; a sales award trip your company paid for = incentive tourism.",
  "TOUR.G10.T1.TRANSPORT.A1":
    "Sort by the surface the vehicle uses: road (car, bus, minibus taxi), rail (train, Gautrain), air (plane, helicopter), water (cruise ship, ferry), extraordinary (a hot-air balloon over the Magaliesberg, a camel).",
  "TOUR.G10.T1.ACCOM.A1":
    "A facility is a thing the guest uses — a pool, a gym, a gift shop. A service is something staff do for the guest — laundry, a guided walk, an airport shuttle.",
  "TOUR.G10.T1.GRADING.A1":
    "Star grading in South Africa is voluntary and handed out by an independent body, the TGCSA — a guesthouse can't award itself five stars. More stars means better facilities and service, checked against a set standard.",
  "TOUR.G10.T1.ACCOMTERMS.A1":
    "Break the abbreviation into parts: pp = per person, pps = per person sharing (the rate when two people share a room), pppn = per person per night.",
  "TOUR.G10.T1.FANDB.A1":
    "Match the place to its service and speed: fine-dining = full table service and a set menu, slow; quick-service = order at a counter, fast; a coffee shop = light meals and drinks in between.",
  "TOUR.G10.T1.ATTRSECTOR.A1":
    "The primary attraction is the reason someone booked the trip — Kruger for a safari. Secondary attractions are the extras they fit in while there — a craft market, a nearby waterfall. Man-made is built; natural occurs in nature.",
  "TOUR.G10.T1.INDUSTRY.A1":
    "Three partners run tourism together: the public sector (government and agencies like SA Tourism, funded by the state), the private sector (businesses making a profit — hotels, tour operators), and the communities where tourism happens.",
  "TOUR.G10.T1.PAYMENT.A1":
    "A debit card spends money you already have in your account. A credit card borrows the bank's money now, to be paid back later with interest if you don't settle it.",
  "TOUR.G10.T2.MAPTERMS.A1":
    "Latitude lines run across, like the rungs of a ladder, telling you how far north or south you are. Longitude lines run top to bottom between the poles, telling you how far east or west.",
  "TOUR.G10.T2.MAPTYPES.A1":
    "Match the map to the question: borders and capital cities → a political map; mountains and rivers → a physical map; getting from A to B → a road map or GPS; what to see in an area → a tourist information map.",
  "TOUR.G10.T2.SAMAP.A1":
    "Build the map from the coast inward: the coastal provinces — Western Cape, Eastern Cape, KwaZulu-Natal — wrap the south and east; the interior holds Free State, Gauteng, North West, Mpumalanga, Limpopo and Northern Cape.",
  "TOUR.G10.T2.WORLDMAP.A1":
    "There are seven continents and three oceans — those are fixed. Tourism regions (Far East, Middle East, the Americas) are groupings the travel industry uses; they can cross continents.",
  "TOUR.G10.T2.DISTANCE.A1":
    "Find one city along the top row and the other down the side column; the block where they meet is the distance between them. Divide the kilometres by 100 for a rough drive time in hours.",
  "TOUR.G10.T2.DOMESTIC.A1":
    "Domestic tourism is residents holidaying inside their own country. 'Sho't Left' is South Africa's campaign nudging locals to take short, affordable trips at home instead of only travelling abroad.",
  "TOUR.G10.T2.DOMSTATS.A1":
    "Intra- means inside one province (a Durban family holidaying in the Drakensberg); inter- means between provinces (Gauteng to the Western Cape). Read the graph's title and axis labels before you draw a conclusion.",
  "TOUR.G10.T3.PROVATTR.A1":
    "Anchor each attraction to its nearest big city, then to that city's province: Table Mountain → Cape Town → Western Cape; the Union Buildings → Pretoria → Gauteng.",
  "TOUR.G10.T3.SANPARKS.A1":
    "A national park sits inside one country. A transfrontier park straddles an international border and is run jointly by two or more countries — like the Kgalagadi, shared by South Africa and Botswana.",
  "TOUR.G10.T3.FAUNAFLORA.A1":
    "Indigenous means it naturally occurs here — the protea, the springbok. Alien means it was brought in from elsewhere — black wattle. Endangered means at risk of dying out; extinct means already gone.",
  "TOUR.G10.T3.SUSTAIN.A1":
    "The three Ps: Planet (the environment), People (the local community), Profit (the business staying viable). For any example, ask which of the three it mostly affects.",
  "TOUR.G10.T3.RESPONSIBLE.A1":
    "Sustainable tourism is the goal — a lasting balance of planet, people and profit. Responsible tourism is the behaviour that gets you there — a tourist sticking to the path, a lodge hiring locally.",
  "TOUR.G10.T3.GLOBALWARM.A1":
    "A carbon footprint measures the greenhouse gases an activity releases. In tourism the biggest contributors are transport — especially long flights — and the energy hotels use for lighting, heating and air-con.",
  "TOUR.G10.T3.MARKETING.A1":
    "The target market is the group a product is aimed at — say, young backpackers. Market share is the slice of total sales a business holds. The marketing mix is the five Ps: product, promotion, price, place, people.",
  "TOUR.G10.T4.CULTURE.A1":
    "Culture is a group's shared way of life right now — the food, music and dress people actually use. Heritage is what's been handed down from the past and is worth conserving — a monument, a language, a craft.",
  "TOUR.G10.T4.HERITSITES.A1":
    "Cultural heritage is made or shaped by people — the Voortrekker Monument, the District Six Museum. Natural heritage is formed by nature — the Cango Caves, the Tugela Falls.",
  "TOUR.G10.T4.COMMS.A1":
    "Verbal communication is spoken — a phone call, a face-to-face chat. Written communication is recorded in text — an email, an SMS, a memo. Netiquette is simply good manners when you communicate online.",
  "TOUR.G10.T4.SERVICE.A1":
    "Great service pays for itself: the guest comes back, tells friends, leaves a good review — all of which lift profit. Poor service does the reverse — the guest leaves, complains online, and the reputation takes the hit.",
  "TOUR.G11.T1.AIRPORTS.A1":
    "Read a departure board like a sorting exercise: a Cape Town–Durban flight is domestic; Johannesburg–Windhoek is regional; Johannesburg–London is long-haul intercontinental. OR Tambo is the main international gateway.",
  "TOUR.G11.T1.AIRTERMS.A1":
    "Follow a passenger from the kerb inward: landside (check-in, shops anyone can reach) → through security → airside (the boarding gates) → onto the aircraft, past the galley to the seat.",
  "TOUR.G11.T1.AIRTECH.A1":
    "Match each device to the problem it solves: an X-ray scanner and metal detector = security; a biometric or thermal scanner = identifying people and screening for illness; the flight information display board = information.",
  "TOUR.G11.T1.BUS.A1":
    "Match the bus to the trip: a minibus for a small day tour, a large coach for a cross-country group, a sleeper coach for an overnight route, an open-top double-decker for a city sightseeing loop.",
  "TOUR.G11.T1.RAIL.A1":
    "Metrorail is an everyday commuter train — get on, stand, get off. Shosholoza Meyl and the luxury tourist trains are a journey in themselves — a coupé or compartment, a dining car, bedding for the night.",
  "TOUR.G11.T1.CRUISE.A1":
    "Walk a cruise ship from the outside in: the ship docks at a port, passengers pass through the cruise terminal, then find their state room, cabin or suite on one of the decks, with restaurants and shows in between.",
  "TOUR.G11.T1.CARRENTAL.A1":
    "Sort a rental quote into three piles: compulsory (the daily rate, basic insurance), optional (extra cover like a super waiver, an additional driver), and incidental (fuel, tolls, a late-return fee).",
  "TOUR.G11.T2.DTGS.A1":
    "Split it into 'why' and 'how'. The why (objectives): grow local travel sustainably, transform the sector, create jobs. The how (methods): campaigns like Sho't Left, affordable packages, marketing to under-served groups.",
  "TOUR.G11.T2.SEGMENTS.A1":
    "Picture each segment as a real person: 'golden active couples' are retired, comfortable and time-rich, so a slow scenic rail trip fits; 'striving families' need a budget, kid-friendly, school-holiday option.",
  "TOUR.G11.T2.CULTURE.A1":
    "Link each feature to what the tourist actually does: Ndebele wall art → a village visit to see and photograph the painted homes; gumboot dancing → a live performance; a sangoma → a guided cultural explanation.",
  "TOUR.G11.T2.HERITAGE.A1":
    "SAHRA (and its provincial partners) is the watchdog for heritage — it protects things over 60 years old, graves, rock art and shipwrecks, and you need its permit to alter or move them.",
  "TOUR.G11.T2.FOREX.A1":
    "Follow one tourist's euros: they're changed to rand, spent at the hotel, which pays its staff and buys local food, which pays the farmer — the foreign money ripples through the whole economy.",
  "TOUR.G11.T2.CURRENCY.A1":
    "Fix one rule: rand to a foreign currency, divide by the rate; foreign currency to rand, multiply by the rate. If 1 USD = R18, then R900 ÷ 18 = 50 dollars, and 50 dollars × 18 = R900 back.",
  "TOUR.G11.T3.SADC.A1":
    "Learn each SADC country as a small set: country → capital → main gateway. Namibia → Windhoek → Hosea Kutako International Airport; Botswana → Gaborone → Sir Seretse Khama Airport.",
  "TOUR.G11.T3.SADCATTR.A1":
    "Pair each attraction with its country and its draw: the Okavango Delta → Botswana → a water-wilderness safari; Victoria Falls → Zambia and Zimbabwe → one of the world's largest waterfalls.",
  "TOUR.G11.T3.ITINERARY.A1":
    "Plot the stops on a map first. A logical itinerary joins nearby places in a sensible line with no doubling back — Cape Town → Hermanus → Mossel Bay → Knysna along the coast, not zig-zagging inland and back.",
  "TOUR.G11.T3.PROMO.A1":
    "Above-the-line is mass media aimed at everyone — a TV advert, a billboard, a radio spot. Below-the-line is direct and targeted — a personal sales call, an email to past guests, a stand at a travel show.",
  "TOUR.G11.T3.BUDGET.A1":
    "Group the costs so nothing is missed: research (surveys), communication (printing brochures, phone, internet, a website), travel (attending trade shows), and personnel (the marketing staff's time).",
  "TOUR.G11.T3.GDS.A1":
    "A Global Distribution System like Amadeus or Galileo is a worldwide switchboard linking many airlines, hotels and car firms so a travel agent books them all in one place. A Central Reservation System is one company's own booking system for its own properties.",
  "TOUR.G11.T4.CUSTCARE.A1":
    "Assume nothing about a foreign visitor's customs — gestures, food, personal space and greetings differ. The respectful choice is to ask, speak clearly and simply, use pictures or maps, and be patient.",
  "TOUR.G11.T4.COMPLAINTS.A1":
    "A complaint is a free tip on what to fix. Handle a verbal one in order: listen fully, ask questions, apologise, solve it, offer something extra, thank them for raising it.",
  "TOUR.G11.T4.QUALITY.A1":
    "Match the tool to the gap: staff who don't know the standard → training; standards slipping unnoticed → quality-control checks; not knowing what guests think → customer surveys. One weak link — a rude shuttle driver — sours the whole trip.",
  "TOUR.G11.T4.CAREERS.A1":
    "Sort each job into its sector: a game ranger → conservation; a flight attendant → transport; a chef → hospitality; a museum guide → attractions; a conference organiser → events.",
  "TOUR.G11.T4.REQUIREMENTS.A1":
    "Match the job to what it demands: a tour guide needs strong communication, patience and stamina; a reservations clerk needs accuracy and computer skills; a chef needs creativity and to work under pressure.",
  "TOUR.G11.T4.ENTREPRENEUR.A1":
    "Spot a gap and match a skill to it: no one runs township food tours in your area → you need marketing and people skills to start one; tourists struggle to find airport transfers → a shuttle service needs planning and reliability.",
  "TOUR.G12.T1.PROIMAGE.A1":
    "Split the image in two. The business's image is its logo, slogan, website, stationery and policies. The staff's image is the person in front of you — uniform, grooming, hygiene and how they speak. Both together are the professional image.",
  "TOUR.G12.T1.CONDEMP.A1":
    "There's a legal floor set by the Basic Conditions of Employment Act — maximum hours, minimum leave, notice periods. An employer may offer better than the minimum, but never worse.",
  "TOUR.G12.T1.CONTRACT.A1":
    "Sort each item by whether the worker gains or loses money: a fringe benefit is something extra they get — travel perks, a uniform allowance. A deduction is money taken off their pay — PAYE tax, UIF, pension.",
  "TOUR.G12.T1.CODECON.A1":
    "A contract sets the deal — pay, hours, leave. A code of conduct guides behaviour — how staff should act and what to do when facing an ethical choice, like being offered a bribe by a supplier.",
  "TOUR.G12.T1.TIMEZONES.A1":
    "Travelling east, put your clock forward (add hours); travelling west, put it back (subtract hours). UTC is the world's reference time at Greenwich — add a country's offset to get its local time.",
  "TOUR.G12.T2.ICONS.A1":
    "An attraction is somewhere worth visiting; an icon is instantly recognised and stands for its whole country. Learn each as a pair: Eiffel Tower → Paris, France; Big Ben → London, England; Statue of Liberty → New York, USA.",
  "TOUR.G12.T2.ATTRSUCCESS.A1":
    "Separate what management does from the result it gets. Factors: market it well, keep it safe and clean, train the staff. Characteristics: visitor numbers and income beat target, and visitors come back.",
  "TOUR.G12.T2.TOURPLAN.A1":
    "Start with the tourist, not the trip. A retired couple with plenty of money and three weeks wants comfort and a slow pace; a student with two weeks and a tight budget wants backpackers and buses. Build the plan around who they are.",
  "TOUR.G12.T2.ITINERARY.A1":
    "An itinerary should flow like a good drive: group places that are close together, never double back, keep each day's travel time sensible, and mix busy activities with rest.",
  "TOUR.G12.T2.BUDGET.A1":
    "List every cost type — travel, accommodation, meals, entrance fees, shopping, tips — total them carefully, then compare with the money available. Over budget? Cut or downgrade one item, like a cheaper guesthouse.",
  "TOUR.G12.T2.HEALTHSAFE.A1":
    "Health precautions guard against illness — vaccinations, malaria tablets, bottled water. Safety precautions guard against crime and accidents — lock your door, don't flash valuables, be careful after dark. Ask: getting sick, or getting hurt or robbed?",
  "TOUR.G12.T2.TRAVELDOC.A1":
    "A passport says who you are; a visa is a specific country's permission to enter. At customs, the green channel means nothing to declare; the red channel means you have goods to declare or are over your allowance.",
  "TOUR.G12.T3.WHSUNESCO.A1":
    "UNESCO, a United Nations body, declares and helps protect World Heritage Sites — the site owner doesn't award the status. Natural sites are made by nature (wetlands, fossils); cultural sites are made by people (buildings, rock art).",
  "TOUR.G12.T3.WHSSA.A1":
    "Learn each SA site by type and province: Robben Island and Mapungubwe are cultural (human history); iSimangaliso and the Cape Floral Region are natural (ecosystems); the Cradle of Humankind (fossils) is in Gauteng.",
  "TOUR.G12.T3.RAND.A1":
    "A strong rand buys more foreign currency — great for South Africans travelling out, but it makes South Africa expensive for inbound tourists. A weak rand is the opposite. Always ask who's travelling which way.",
  "TOUR.G12.T3.FOREX.A1":
    "Use the rate exactly as the question writes it. If 1 USD = R18, then dollars to rand means multiply by 18, and rand to dollars means divide by 18. Then sanity-check the size of the answer.",
  "TOUR.G12.T3.BSRBBR.A1":
    "Read the rate from the bank's side. The bank SELLING rate applies when the bank sells you foreign currency before your trip. The bank BUYING rate applies when it buys back your leftover currency after. The selling rate is the worse deal for you.",
  "TOUR.G12.T3.EXRATE.A1":
    "Follow the money to the tourist's wallet. A weaker rand makes South Africa cheaper for inbound visitors (more arrivals) and makes overseas trips dearer for South Africans (fewer going out). A stronger rand flips both.",
  "TOUR.G12.T3.PAYMENT.A1":
    "Weigh each on safety, convenience and cost. Cash is easy but gone if it's stolen; a card or preloaded travel card is safer and can be cancelled; traveller's cheques can be replaced but few places still take them.",
  "TOUR.G12.T3.GLOBALEVENTS.A1":
    "A global event is planned and hosted on purpose — the FIFA World Cup, the Olympics — and usually lifts tourism. An unforeseen occurrence is sudden and unwanted — a pandemic, a tsunami, unrest — and usually hurts it. Ask: planned, or unexpected?",
  "TOUR.G12.T3.MARKETSHARE.A1":
    "Read the table heading and units first. Market share is a country's slice of total arrivals — a percentage. Raw arrivals is just a count of people. Make sure you're answering from the right column.",
  "TOUR.G12.T4.PILLARS.A1":
    "Sort each action to its pillar: switching a lodge to solar → Planet; hiring and training locals → People; keeping the business profitable so it survives → Profit. Ask which one the action mainly protects.",
  "TOUR.G12.T4.TOURISTCODE.A1":
    "Sort responsible behaviour by pillar: dress respectfully at a sacred site → social; buy from local crafters at a fair price → economic; take your litter out of the park → environmental. Fair Trade Tourism (FTTSA) certifies businesses that meet these standards.",
  "TOUR.G12.T4.ROLEPLAYERS.A1":
    "Match the job to the player: government makes the policy and laws; businesses run sustainably and create jobs; communities protect heritage and share the benefits; tourists behave responsibly; FTTSA certifies fair-trade operators.",
  "TOUR.G12.T4.FEEDBACK.A1":
    "Feedback is a loop: collect it (surveys, cards, follow-up calls) → analyse it (spot the repeated complaint) → act on it (make a plan) → improve. Collecting feedback and then ignoring it changes nothing.",
  "TOUR.G12.T4.SERVICE.A1":
    "Trace the chain: good service → happy customers → repeat visits, recommendations and good reviews → more income. Poor service → lost customers and a bad name → falling profit. The two are linked.",
  "TOUR.G12.T4.MARKETSA.A1":
    "Keep the names straight: SA Tourism does the international marketing; TOMSA is the small levy on tourism bills that funds that marketing; INDABA, ITB Berlin and the World Travel Market are trade shows where South Africa is promoted to the industry.",
};
