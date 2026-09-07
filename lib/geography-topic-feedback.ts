// ─── Geography — per-topic "think of it like this" analogies ───────────────
//
// One concrete analogy or worked illustration per topic (64, Grades 10–12),
// keyed by skill/topic id. Feeds the wrong-answer card's example slot via
// FeedbackExplanation's `exampleOverride`. Register: FET / matric band, South
// African contexts. "why" = the question's memo, "how" = the topic's
// recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "GEO.G10.MAP.A1":
    "On a 1:50 000 map, 1 cm on paper = 500 m on the ground, so 4 cm along a road is 2 km. Convert both numbers to the same unit — metres with metres — before you divide for a gradient.",
  "GEO.G10.MAP.A2":
    "Three ways to picture one place: a topographic map is a drawing with symbols and contours; an aerial photo is a raw picture, stretched at the edges; an orthophoto is that photo corrected so you can measure on it. GIS is layered data you can query.",
  "GEO.G10.T1.ATM.A1":
    "The atmosphere stacks up from the ground: troposphere (weather) → stratosphere (the ozone layer) → mesosphere (coldest) → thermosphere (hot). Ozone depletion is up in the stratosphere; the greenhouse effect is down in the troposphere — different problems, different heights.",
  "GEO.G10.T1.ATM.A2":
    "The Sun heats the ground, and the ground heats the air — which is why it's warmer at your feet than up a mountain. Four controls on a place's temperature: distance from the equator, altitude, ocean currents, and distance from the sea.",
  "GEO.G10.T1.ATM.A3":
    "Warm air is a big sponge for water vapour; cool it to its dew point and the sponge overflows into cloud or dew. Three ways rain forms: air pushed up a mountain (relief), hot ground driving afternoon storms (convectional), warm air riding over cold at a front (frontal).",
  "GEO.G10.T1.ATM.A4":
    "Wind is named for where it blows FROM — a 'south-easter' comes from the south-east. Isobars packed close together mean strong wind. Low pressure lifts air so it clouds over and rains; high pressure sinks air so it stays clear and dry.",
  "GEO.G10.T2.GEO.A1":
    "The Earth is layered like a boiled sweet: a thin hard shell (crust), a thick soft-toffee middle (the flowing mantle), a liquid-iron outer core, and a solid inner core, hottest of all. Heat from the core stirs the mantle, which drags the plates around.",
  "GEO.G10.T2.GEO.A2":
    "Three ways plates meet: pulling apart makes ridges and rift valleys (divergent); crashing together builds mountains and volcanoes (convergent); grinding past each other sets off earthquakes (transform). Convection in the mantle is the engine underneath.",
  "GEO.G10.T2.GEO.A3":
    "Squeeze rock slowly and it bends — a fold, up into an anticline or down into a syncline. Push or stretch it too fast and it snaps along a crack — a fault. Folds bend; faults break. A raised block is a horst, a dropped one a graben.",
  "GEO.G10.T2.GEO.A4":
    "The focus is where the rock actually slips underground; the epicentre is the point on the surface directly above it. Magnitude is one number — the energy released. Intensity is the shaking felt at a particular place, so it varies from town to town.",
  "GEO.G10.T2.GEO.A5":
    "Molten rock is magma while it's underground and lava once it erupts. Volcanoes cluster along plate edges and hotspots. They're deadly — ash, lava, gas — but they also leave rich farming soil, geothermal energy and minerals behind.",
  "GEO.G10.T3.POP.A1":
    "Distribution is the pattern — where the dots are on the map. Density is a number — people ÷ area. Water, flat land, mild weather and jobs pull people in; deserts, mountains and thick forest push them away.",
  "GEO.G10.T3.POP.A2":
    "A population pyramid stacks age groups, youngest at the bottom, men on one side and women on the other. A wide base means lots of children and fast growth; a narrowing base means growth is slowing; straight sides mean a stable population.",
  "GEO.G10.T3.POP.A3":
    "Natural increase is births minus deaths (per 1 000 people) — it leaves out anyone moving in or out. As a country develops, death rates drop first while birth rates stay high, so growth is fastest in the middle of that gap.",
  "GEO.G10.T3.POP.A4":
    "Emigrate = Exit a country; immigrate = come In. Push factors drive people out (drought, war, no work); pull factors draw them in (jobs, safety, schools). Inside a developing country, most of that movement is from countryside to city.",
  "GEO.G10.T3.POP.A5":
    "HIV is the virus; AIDS is the advanced stage it reaches if untreated. A heavy HIV burden removes working-age adults, so life expectancy falls, orphans increase, and the middle of the population pyramid thins. ARVs and prevention blunt that.",
  "GEO.G10.T4.WAT.A1":
    "Of all the water on Earth, about 97% is salty sea water. Only 3% is fresh, and most of that is locked in ice or deep underground — so the water we can use is a sliver. It cycles: evaporation → condensation → precipitation → runoff → back to the sea.",
  "GEO.G10.T4.WAT.A2":
    "The current on South Africa's west coast, the Benguela, is cold — so the west coast is dry and arid. The current on the east coast, the Agulhas, is warm — so the east coast is wet and green. Warm current, wet coast; cold current, dry coast.",
  "GEO.G10.T4.WAT.A3":
    "South Africa gets about half the world's average rainfall, and it falls unevenly. That's why we lean on dams, boreholes and pipelines carrying water between river basins — and why saving water, fixing leaks and drip irrigation matter so much.",
  "GEO.G10.T4.WAT.A4":
    "Heavy or long rain causes a flood, but people make it worse — clearing vegetation, paving over soil, building on the floodplain, letting drains block. The result is lost lives, ruined crops, disease and erosion. Wetlands, good drainage, warnings and no-build zones reduce the risk.",
  "GEO.G11.MAP.A1":
    "Vertical exaggeration is the vertical scale divided by the horizontal scale — a cross-section looks steeper than real life. For intervisibility, draw the cross-section between two points: if the land bulges up into the sight line, they can't see each other.",
  "GEO.G11.MAP.A2":
    "A vertical photo looks straight down, so you mostly see rooftops. An oblique photo is taken at an angle, so you see the sides of buildings and it feels 3-D. To identify features, read the tone (light/dark), texture (smooth/rough) and shadow.",
  "GEO.G11.T1.ATM.A1":
    "At the equator the Sun's rays hit straight on and concentrate their heat — an energy surplus. At the poles the same rays arrive slanted and spread thin — a deficit. Winds and ocean currents carry heat from surplus to deficit. Seasons come from the 23,5° tilt, not distance to the Sun.",
  "GEO.G11.T1.ATM.A2":
    "Hot air rises and leaves low pressure behind (the equator); cool air sinks and piles up as high pressure (around 30° and the poles). Between equator and pole the air moves in three loops — Hadley, Ferrel, polar — and the Coriolis effect bends the winds sideways.",
  "GEO.G11.T1.ATM.A3":
    "Where air converges and rises, it rains — the wet equatorial belt. Where air sinks, around 30°, it makes deserts — the Sahara and the Kalahari. El Niño years tend to bring drought to southern Africa; La Niña years tend to bring more rain.",
  "GEO.G11.T1.ATM.A4":
    "A drought is a temporary dry spell — the rain comes back. Desertification is land turning permanently to desert, usually when human pressure (overgrazing, cutting trees) piles onto an already dry climate. It's fought with careful land use, replanting and water harvesting.",
  "GEO.G11.T2.GEO.A1":
    "A hard cap-rock shields the soft rock beneath it. As the edges wear back, a broad flat-topped mesa shrinks into a smaller flat-topped butte, and once the cap is gone you're left with a conical hill. Mesa, then butte, then hill.",
  "GEO.G11.T2.GEO.A2":
    "On tilted rock layers, the gentle slope that follows the tilt is the dip slope; the steep slope cut across the layers is the scarp slope. The steeper the tilt, the sharper the ridge: gentle gives a cuesta, moderate a homoclinal ridge, near-vertical a hogsback.",
  "GEO.G11.T2.GEO.A3":
    "Underground magma bodies by shape: a batholith is a huge deep mass, a laccolith a dome pushing the layers up, a lopolith sags like a saucer. A dyke cuts across the layers (usually steep); a sill runs along them (flat). Tors are the blocks left standing when jointed granite weathers away around them.",
  "GEO.G11.T2.GEO.A4":
    "Read a slope top to bottom: the rounded crest, the steep bare cliff or free face, the loose broken talus (scree) piled below it, then the gentle pediment at the base. As it erodes, the whole slope retreats backwards but keeps its shape.",
  "GEO.G11.T2.GEO.A5":
    "Mass movement is rock and soil sliding downhill under gravity. It ranges from creep (so slow you only see it in a leaning fence) to a sudden rockfall or landslide. Water usually sets it off. Drains, terraces, retaining walls and planting hold slopes in place.",
  "GEO.G11.T3.DEV.A1":
    "Development is more than money — it's health, education, fairness and sustainability too. The HDI rolls income, schooling and life expectancy into one score (higher = more developed). The Gini coefficient measures inequality (higher = more unequal). Infant mortality drops as a country develops.",
  "GEO.G11.T3.DEV.A2":
    "Development factors feed each other in a loop: poor schooling → few skills → weak economy → less money for schools. In the core-periphery model, a rich core (like Gauteng) pulls in resources, money and people from a poorer periphery, leaving it weaker.",
  "GEO.G11.T3.DEV.A3":
    "Many developing countries export cheap raw materials — cocoa beans, ore — and import expensive finished goods — chocolate, machines. Those poor 'terms of trade' keep them dependent. Free trade removes barriers; tariffs and quotas are barriers; fair trade guarantees producers a better price.",
  "GEO.G11.T3.DEV.A4":
    "Educating and employing women lowers birth rates and lifts a whole community — better child health, more household income. Development can damage the environment, so the two have to be balanced, often through government and business working together.",
  "GEO.G11.T3.DEV.A5":
    "Three kinds of aid: technical (sending skills and expertise), conditional (money with strings attached), humanitarian (emergency relief). Aid can build roads and save lives, but it can also create dependency, debt, or mainly serve the donor — weigh both sides.",
  "GEO.G11.T4.RES.A1":
    "Renewable resources replenish — sun, wind, water, and forests if you don't over-cut them. Non-renewable resources run out — coal, oil, minerals. Sustainable use means using them wisely enough that the next generation still has some, not locking them away untouched.",
  "GEO.G11.T4.RES.A2":
    "Soil takes centuries to form from weathered rock and rotting plants, so it's almost irreplaceable. Overgrazing, ploughing and bare ground speed erosion — from a thin sheet washing off, to small rills, to a deep donga. Contour ploughing, terracing and cover crops hold it.",
  "GEO.G11.T4.RES.A3":
    "South Africa runs mainly on coal-fired power — cheap and plentiful, but it pumps out CO₂, dirties the air and leaves ash and acid rain. Nuclear at Koeberg gives steady low-carbon power but raises waste and safety worries. All conventional sources are reliable but polluting and finite.",
  "GEO.G11.T4.RES.A4":
    "South Africa has superb solar in the sunny interior and strong wind on the coast. Renewables are clean and never run out, but they're intermittent — no sun at night, gusty wind — so they need storage and cost money up front. In return they cut emissions and build new industries.",
  "GEO.G11.T4.RES.A5":
    "Managing energy is a shared job: government sets policy and builds the grid, businesses switch to efficient and cleaner processes, and individuals save electricity and buy efficient appliances. Energy efficiency means getting the same result while using less power.",
  "GEO.G12.MAP.A1":
    "A compass points to magnetic north, which slowly drifts, so magnetic bearing = true bearing + the magnetic declination. Read a synoptic map in order: find the pressure cells, check the isobar spacing for wind strength, then read each station's data.",
  "GEO.G12.MAP.A2":
    "GIS keeps two kinds of information in layers: spatial data (where something is) and attribute data (what it is). Buffering draws a zone around a feature (say 100 m from a river); querying asks the data to pick out features that match a rule. An orthophoto is corrected to true scale, so you can measure on it like a map.",
  "GEO.G12.T1.CLI.A1":
    "Mid-latitude cyclones form where warm and cold air meet in the westerlies, roughly 30–60°. The cold front is steep — a sudden burst of heavy rain, then colder, clearer air. The warm front is gentle — long, lighter rain, then warmer air. These bring the Western Cape its winter rain.",
  "GEO.G12.T1.CLI.A2":
    "A tropical cyclone needs warm ocean water above about 26 °C, so it forms over tropical seas and fades once it hits land or cold water. The eye at the centre is calm and clear; the eye wall around it has the fiercest wind and rain. Cyclone Idai is a southern African example.",
  "GEO.G12.T1.CLI.A3":
    "Three high-pressure cells steer South Africa's weather — the South Atlantic High off the west, the South Indian High off the east, and the continental High over the interior (strong in winter). Sinking anticyclonic air is dry and stable. Berg winds blow from the interior to the coast, warming and drying as they drop, giving hot, dry coastal spells.",
  "GEO.G12.T1.CLI.A4":
    "By day, warm air slides up the valley sides — anabatic winds. By night, cold heavy air drains down and pools on the valley floor — katabatic winds — creating a temperature inversion, frost pockets and radiation fog. That's why farmers plant frost-sensitive crops on the warmer mid-slopes, not the cold floor.",
  "GEO.G12.T1.CLI.A5":
    "A city is warmer than the countryside around it — the urban heat island. Dark tar and concrete soak up heat, buildings block the cooling wind, and cars, factories and air-conditioners dump waste heat. A pollution dome traps dirty air over the city. Parks, trees and lighter, reflective roofs cool it down.",
  "GEO.G12.T1.GEO.A1":
    "A drainage basin (catchment) is all the land that drains into one river system; the watershed is the ridge of high ground dividing one basin from the next. The pattern follows the rock: tree-like dendritic on even rock, trellis on tilted hard-and-soft bands, radial off a dome, centripetal into a basin.",
  "GEO.G12.T1.GEO.A2":
    "A river's upper course is steep and fast and cuts down — V-shaped valleys, waterfalls, rapids. Its lower course is gentle and drops its load — meanders, oxbow lakes, floodplains, deltas. An oxbow lake is a meander loop that got pinched off. Rejuvenation restarts the cutting and leaves knickpoints and terraces.",
  "GEO.G12.T1.GEO.A3":
    "A catchment is one connected system — pollution, farming, alien trees or building upstream all reach everyone downstream. Good management protects both the quality and the quantity of the water: control pollution, clear alien plants, protect wetlands, and coordinate all the users across the whole basin.",
  "GEO.G12.T2.SET.A1":
    "Site is the actual ground a town stands on — flat, near water, easy to defend. Situation is where it sits relative to other places — on a trade route, near a mine, central to a farming district. Settlements are then sorted by size, pattern (shape) and function (main job).",
  "GEO.G12.T2.SET.A2":
    "Nucleated means the houses cluster together, often around a water source or crossroads; dispersed means scattered farmsteads. The shape follows the cause: linear along a road, river or valley; a cross or T at a junction; round and clustered around a central point like a borehole.",
  "GEO.G12.T2.SET.A3":
    "Rural depopulation is the countryside losing people — mostly young working-age adults leaving for city jobs and services. What's left behind is an ageing population, a labour shortage, and closed schools and shops. Land reform and rural development try to tackle the inequalities driving it.",
  "GEO.G12.T2.SET.A4":
    "A town's function is its main job. A port is a break-of-bulk point where goods change transport; a junction town sits where routes cross; a gateway controls a route through a barrier; a specialised town does one thing (mining, university, resort); a central place supplies services to the district around it.",
  "GEO.G12.T2.SET.A5":
    "Low-order goods are cheap and bought often, so they need only a small population nearby (a small threshold) and people won't travel far for them (short range) — bread from the spaza. High-order goods are expensive and rare — a specialist hospital, a university — so they need a big threshold and a long range. That's why there are many small centres and few big ones.",
  "GEO.G12.T2.SET.A6":
    "The central business district has the highest land values, the tallest buildings and the best access, and land value generally falls as you move out. The South African city is distinctive: apartheid planning pushed townships to the edges with 'buffer zones' between communities — a pattern still shaping cities today.",
  "GEO.G12.T2.SET.A7":
    "When people arrive faster than a city can build houses and services, informal settlements, overcrowding and strained water and sanitation follow. The cause is structural — too little affordable housing and deep inequality — not a personal choice. The responses are upgrading settlements, integrated housing, and better transport and services.",
  "GEO.G12.T3.ECO.A1":
    "Four sectors along one line: primary extracts (farming, mining, fishing), secondary manufactures (factories), tertiary serves (shops, banks, transport), quaternary is knowledge work (IT, research). In South Africa the tertiary sector is the biggest share of GDP — and a sector's share of jobs can differ from its share of value.",
  "GEO.G12.T3.ECO.A2":
    "Food security means everyone can reliably get enough safe, nutritious food — it depends on it being available, affordable AND reachable, not just grown. South African farming is held back by low, unreliable rainfall and limited arable land, and shaped by the history of who owns the land.",
  "GEO.G12.T3.ECO.A3":
    "Mining built South Africa's economy — gold, platinum, coal, diamonds bringing foreign currency and jobs. But minerals are finite and their prices swing wildly, mining scars the land and water (acid mine drainage) and risks miners' health, and leaning on one sector is risky. Diversifying spreads the risk.",
  "GEO.G12.T3.ECO.A4":
    "Where a factory locates follows its inputs and outputs. A steel mill uses heavy raw materials that lose weight in processing, so it sits near the ore. A bakery makes a bulky, perishable product, so it sits near its customers. Electronics and IT are 'footloose' — they can go almost anywhere. Gauteng is South Africa's biggest industrial region.",
  "GEO.G12.T3.ECO.A5":
    "Decentralisation spreads industry away from crowded cities to develop poorer regions and ease congestion; centralisation concentrates it so firms share infrastructure and markets. Industrial Development Zones offer incentives to attract export industry near ports; Spatial Development Initiatives, like the Maputo Corridor, build transport routes to unlock a whole region.",
  "GEO.G12.T3.ECO.A6":
    "The informal sector is unregistered, untaxed, small-scale work — street vendors, spaza shops, casual labour — with no contracts, benefits or security. It's large in South Africa because formal jobs are scarce. It provides vital income and cheap goods, but it means low pay and little legal protection.",
};
