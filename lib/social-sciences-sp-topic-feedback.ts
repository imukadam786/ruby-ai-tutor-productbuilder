// ─── Social Sciences SP — per-topic "think of it like this" analogies ───────
//
// One everyday analogy per topic (78: History + Geography, Grades 7–9), keyed
// by skill/topic id. Feeds the wrong-answer card's example slot via
// FeedbackExplanation's `exampleOverride`. Register: Grade 7–9, concrete,
// everyday South African reference points; sensitive history topics kept
// structural, not flippant. "why" = the question's memo, "how" = the topic's
// recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "SSSP.G7.H1.A1":
    "Picture the Sahara caravan trade as a two-way delivery run: heavy salt, needed in the hot south, travelled south, and gold travelled north. Each side had what the other couldn't get.",
  "SSSP.G7.H1.A2":
    "Mansa Musa's wealth is remembered like a legend: his 1324 pilgrimage to Mecca handed out so much gold along the way that it unsettled the economies he passed through.",
  "SSSP.G7.H1.A3":
    "Think of Timbuktu as a market and a university in one town — famous for gold and salt changing hands AND for its libraries and scholars.",
  "SSSP.G7.H2.A1":
    "Slavery existed in West Africa before Europeans, but the Atlantic trade was a different scale — like a local shop versus a factory export line — and far harsher.",
  "SSSP.G7.H2.A2":
    "Follow one chain of events in order: a person captured in West Africa, the Middle Passage across the ocean, sale at a market, then forced labour on a plantation.",
  "SSSP.G7.H2.A3":
    "Resistance ran along a scale from quiet to open: working slowly on purpose at one end, running away or armed revolt at the other.",
  "SSSP.G7.H2.A4":
    "The slave trade moved wealth one way, like a pump: European and American ports grew rich while West African societies lost people and the wealth they would have made.",
  "SSSP.G7.H3.A1":
    "Match each group to how it lived: the Khoikhoi herded cattle and sheep, the San hunted and gathered, and African farming communities lived further east.",
  "SSSP.G7.H3.A2":
    "The VOC set up at the Cape in 1652 the way a trucking company builds a fuel and rest stop halfway along a route — a refreshment station for ships to the East, not a farming colony.",
  "SSSP.G7.H3.A3":
    "Cape slavery drew from a different map than the Atlantic trade — enslaved people were brought mostly from East Africa, Madagascar and the Dutch East, not West Africa.",
  "SSSP.G7.H3.A4":
    "As settlers pushed inland the frontier moved like a slow tide, and each time it advanced, indigenous communities lost grazing land, water and their independence.",
  "SSSP.G7.H4.A1":
    "Control of the Cape changed hands like a business takeover — the Dutch VOC out, Britain in from 1806, with new laws and a new language of power.",
  "SSSP.G7.H4.A2":
    "The eastern frontier was a fault line that kept slipping: a long series of wars between Cape settlers and the Xhosa over land and cattle, not a single event.",
  "SSSP.G7.H4.A3":
    "The northern frontier wasn't only conflict — think of it as a contact zone where trade, hunting parties and mission stations met, alongside the fighting.",
  "SSSP.G7.G1.A1":
    "A grid reference works like a seat number: say the row along the bottom first, then how far up the side — along the corridor, then up the stairs.",
  "SSSP.G7.G1.A2":
    "A sketch map with no key, scale or north arrow is like directions with no landmarks — the reader can't tell how far, which way, or what the symbols mean.",
  "SSSP.G7.G1.A3":
    "Measure a winding road by laying string along it, then straightening the string against the ruler and reading the scale — a straight ruler alone cuts every corner.",
  "SSSP.G7.G1.A4":
    "Latitude and longitude are a street address for the planet: latitude says how far north or south of the equator, longitude how far east or west of the Greenwich line.",
  "SSSP.G7.G2.A1":
    "The earth is layered like a peach: a thin skin (the crust), a thick fleshy middle (the mantle), and a hard hot pip at the centre (the core).",
  "SSSP.G7.G2.A2":
    "Volcanoes aren't scattered randomly — they line up along the seams where tectonic plates meet, like stitching along the edge of a cushion.",
  "SSSP.G7.G2.A3":
    "An earthquake is the jolt when two plates that have been grinding past each other suddenly slip, like two heavy tables scraping and then jumping.",
  "SSSP.G7.G2.A4":
    "A flood is worse where the ground is a full sponge or a tarred parking lot — the rain has nowhere to soak in or drain away, so it rises.",
  "SSSP.G7.G3.A1":
    "The natural growth rate is a simple sum: births minus deaths. More born than die in a year and the population grows, before you count anyone moving in or out.",
  "SSSP.G7.G3.A2":
    "For each factor, ask one question: does this push the number up or down? Better healthcare pushes the death rate down; more schooling for girls pushes the birth rate down.",
  "SSSP.G7.G3.A3":
    "World population is a line that lay almost flat for thousands of years, then shot up steeply once food supply, medicine and clean water improved.",
  "SSSP.G7.G4.A1":
    "A natural resource is anything useful we take straight from nature — water, soil, coal, fish, timber — before any factory touches it.",
  "SSSP.G7.G4.A2":
    "Conservation is using a resource like a bag of mealie meal that has to last the month — take what you need and protect the rest so it doesn't run out.",
  "SSSP.G7.G4.A3":
    "South Africa is a dry country, so water is a shared resource like one tank for a whole street — what one household wastes, another goes without.",
  "SSSP.G8.H1.A1":
    "The Industrial Revolution moved work off the farm and out of the home into factories and cities — like a whole country changing address at once.",
  "SSSP.G8.H1.A2":
    "Indenture is a fixed-term work contract — you sign up for, say, five years' labour far from home. It isn't slavery, but the conditions were often brutal.",
  "SSSP.G8.H1.A3":
    "The 1867 diamond find at Kimberley acted like a magnet — it pulled Britain deeper into taking control of southern Africa to secure the wealth.",
  "SSSP.G8.H2.A1":
    "The mines needed a large, cheap, controllable workforce, so African independence and landholding were deliberately broken down to force people into wage labour.",
  "SSSP.G8.H2.A2":
    "Witwatersrand gold sat deep and was expensive to reach — that needed big companies with lots of money and thousands of workers, not a lone digger with a pan.",
  "SSSP.G8.H2.A3":
    "The Mineral Revolution was a hinge: diamonds and gold reshaped who held power, who owned land and who did the labour for the whole century that followed.",
  "SSSP.G8.H3.A1":
    "The Scramble for Africa was Europe drawing borders on a map of a continent it barely knew — carving up land and people who were never asked.",
  "SSSP.G8.H3.A2":
    "Use the Ashanti kingdom the way you'd use one worked example in maths — one detailed case that shows how the wider Scramble for Africa actually played out.",
  "SSSP.G8.H4.A1":
    "World War I was a dry forest plus a spark: years of rivalry, alliances and an arms race were the dry wood; the 1914 assassination of Archduke Franz Ferdinand was the match.",
  "SSSP.G8.H4.A2":
    "The war was lived in two places at once: soldiers in the mud of the trenches, and families at home under conscription, rationing and news of casualties.",
  "SSSP.G8.H4.A3":
    "With men at the front, women stepped into factory jobs and public roles — and used that proof of their contribution to press harder for the vote.",
  "SSSP.G8.H4.A4":
    "The 1919 Treaty of Versailles punished Germany harshly — huge reparations and lost land — and that resentment became fuel for the next war.",
  "SSSP.G8.G1.A1":
    "A ratio scale of 1:50 000 means 1 cm on the map stands for 50 000 cm on the ground — a shrink ratio, like a photo scaled down to fit a page.",
  "SSSP.G8.G1.A2":
    "Two movements do two jobs: the earth's daily spin gives day and night; its tilt as it orbits the sun over a year gives the seasons.",
  "SSSP.G8.G1.A3":
    "A satellite image is a photo from space — you read it by colour and pattern, like spotting a soccer field by its green rectangle and white lines.",
  "SSSP.G8.G2.A1":
    "Five controls set a place's climate: how far from the equator, how near the sea, how high up, which ocean current passes, and whether mountains block the rain.",
  "SSSP.G8.G2.A2":
    "Compare South Africa's climate along three sliders: coast versus inland, high altitude versus low, wetter east versus drier west.",
  "SSSP.G8.G2.A3":
    "Weather is what you check before leaving today; climate is the long-run pattern — 'Cape Town has wet winters' is climate, 'it's raining now' is weather.",
  "SSSP.G8.G3.A1":
    "A city is zoned like a house: a busy centre where the main work happens (the business district), noisy work areas (industry), and quieter rooms where people live.",
  "SSSP.G8.G3.A2":
    "A vertical air photo looks straight down like a map; an oblique photo is taken at an angle, so you see the sides of buildings, like a photo from a hill.",
  "SSSP.G8.G3.A3":
    "People move to cities because of push and pull, like a magnet from both ends: the countryside pushes (few jobs, drought), the city pulls (work, schools, hospitals).",
  "SSSP.G8.G4.A1":
    "Trade rides on transport — match the cargo to the mode: bulky coal by ship or rail, fresh flowers by plane, parcels by road.",
  "SSSP.G8.G4.A2":
    "South Africa's harbours — Durban, Cape Town, Gqeberha — are the gates its exports pass through to reach the rest of the world.",
  "SSSP.G8.G4.A3":
    "Think about the daily commute and its three costs: the fare out of your pocket, the time lost in congestion, and the pollution left in the air.",
  "SSSP.G9.H1.A1":
    "A weak new democracy plus an economic collapse left a gap, and Hitler used it — like a cracked wall giving way under pressure.",
  "SSSP.G9.H1.A2":
    "Keep two threads separate: the military war between armies, and the Holocaust — the deliberate genocide of six million Jews and other targeted groups.",
  "SSSP.G9.H1.A3":
    "The Pacific war had its own trigger: Japan's 1941 attack on Pearl Harbour pulled the United States straight into the fighting.",
  "SSSP.G9.H2.A1":
    "The USA and USSR were allies against Hitler, then rivals in peace — like people who team up in a fight and fall out the moment it's over, one backing communism, one capitalism.",
  "SSSP.G9.H2.A2":
    "The 1945 bombs on Hiroshima and Nagasaki did two things at once: ended the war with Japan, and opened an age where whole cities could be destroyed in seconds.",
  "SSSP.G9.H2.A3":
    "It's a 'Cold' War because the superpowers never fought each other directly — they backed opposite sides in other countries' wars, like two coaches whose teams play, not them.",
  "SSSP.G9.H2.A4":
    "Two dates mark the ending: 1989, when the Berlin Wall falls, and 1991, when the Soviet Union breaks apart into separate countries.",
  "SSSP.G9.H3.A1":
    "Biologists find no clear line dividing humans into 'races' — race is a social label people invented, not a fact written in our bodies.",
  "SSSP.G9.H3.A2":
    "Segregation already existed in 1948 — the National Party didn't invent it; it turned scattered practices into a complete, enforced system of law.",
  "SSSP.G9.H3.A3":
    "1950s resistance was organised and disciplined, mostly non-violent — the Defiance Campaign and the 1955 Freedom Charter, not armed struggle yet.",
  "SSSP.G9.H4.A1":
    "The 1960 Sharpeville shooting was a sharp turn in the road: it pushed the state to ban the ANC and PAC, and pushed resistance towards armed struggle.",
  "SSSP.G9.H4.A2":
    "On 16 June 1976, Soweto students marched against being taught in Afrikaans — a protest that spread nationwide and drew a violent crackdown.",
  "SSSP.G9.H4.A3":
    "The path to 1994 runs in order: 1990 the ANC is unbanned and Mandela is freed, then years of negotiation, then the first vote everyone could cast in April 1994.",
  "SSSP.G9.G1.A1":
    "Contour lines are height markers: bunched close together means a steep slope; spread far apart means gentle, easy ground.",
  "SSSP.G9.G1.A2":
    "An orthophoto is an aerial photo corrected so every part is at true map scale, with contour lines drawn over the top — a photo and a map combined.",
  "SSSP.G9.G1.A3":
    "On a topographic map, learn the symbol key first, like the icons on a new phone — after that, the whole map reads easily.",
  "SSSP.G9.G1.A4":
    "Use a map and a photo together like two witnesses: the map tells you height and layout, the photo shows the real detail on the ground.",
  "SSSP.G9.G2.A1":
    "The Human Development Index blends three things into one score — income, education and how long people live — so a country isn't judged on money alone.",
  "SSSP.G9.G2.A2":
    "A country's development has no single cause — like a car that won't start for several reasons at once: history, climate, trade, governance, health.",
  "SSSP.G9.G2.A3":
    "Real development isn't just 'bigger' — it should also be fair (reaching everyone) and sustainable (not using up the future's resources to get there).",
  "SSSP.G9.G3.A1":
    "Weathering breaks rock where it stands — like a pothole forming as water freezes and thaws in a crack. Nothing is carried away yet; that part is erosion.",
  "SSSP.G9.G3.A2":
    "Erosion is the removal van carrying material off; deposition is unloading it elsewhere — a river scours soil from a hillside and drops it as mud on the floodplain.",
  "SSSP.G9.G3.A3":
    "Bare, overworked soil washes or blows away fastest — a field stripped of grass and ploughed too hard has nothing holding it down when the rain or wind comes.",
  "SSSP.G9.G4.A1":
    "Renewable resources refill if you don't take too fast — like fish in a dam that breed back. Non-renewable ones, like coal, are a fixed tank that only empties.",
  "SSSP.G9.G4.A2":
    "Sustainable use is a household living off its salary, not its savings — meeting today's needs without robbing what the next generation will need.",
  "SSSP.G9.G4.A3":
    "Food security means everyone has enough safe food, reliably — not just that food exists somewhere, but that each household can actually get it every day.",
};
