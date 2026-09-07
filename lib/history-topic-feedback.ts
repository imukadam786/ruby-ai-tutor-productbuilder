// ─── History — per-topic "think of it like this" anchors ───────────────────
//
// One vivid framing / analogy per topic (53, Grades 10–12), keyed by
// skill/topic id. Feeds the wrong-answer card's example slot via
// FeedbackExplanation's `exampleOverride`. Register: FET / matric band —
// concise, an anchoring image or mnemonic rather than a physical analogy;
// sensitive topics kept structural. "why" = the question's memo, "how" = the
// topic's recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "HIS.G10.T1.WIDER.A1":
    "'Civilisation' as 19th-century Europeans used it was a scorecard they wrote and marked themselves — like a referee who also plays for one team. Test the real claim with evidence: cities, writing, trade, central government.",
  "HIS.G10.T1.WIDER.A2":
    "Comparing Egypt, Greece, India, China and the Maya is like comparing top athletes in different sports — a sprinter, a swimmer, a gymnast. Each is world-class at its own thing; one ranking misses the point.",
  "HIS.G10.T1.WIDER.A3":
    "The 'dark continent' label wasn't ignorance — it was a cover story. If Africa 'had no history', seizing it could be dressed up as 'bringing civilisation'. The evidence against it — Aksum's stelae, Timbuktu's libraries — was already known and ignored.",
  "HIS.G10.T1.ETHIOPIA.A1":
    "Aksum sat on the Red Sea like a tollgate on a busy highway — trade between Rome, Arabia, India and inland Africa all passed through it. The Roman coins dug from its ruins are the toll receipts.",
  "HIS.G10.T1.ETHIOPIA.A2":
    "When the Portuguese arrived, Ethiopia had been Christian for over a thousand years. The 1627–1632 war wasn't Christian vs non-Christian — it was Catholics trying to convert Orthodox believers, and it ended with the Jesuits expelled.",
  "HIS.G10.T1.ETHIOPIA.A3":
    "After a civil war, a ruler rebuilds in stone to make a statement — 'we are strong again'. Fasilides founded Gondar and raised his castle as a visible new centre, and locked in Orthodox Christianity as the state faith.",
  "HIS.G10.T2.MALI.A1":
    "Sundiata founded Mali; Mansa Musa made it famous a century later — don't collapse the two. And the gold-salt trade was old business (Jenne-Jeno traded from ~300 BCE); Mali got rich controlling that traffic, not inventing it.",
  "HIS.G10.T2.MALI.A2":
    "Mansa Musa's 1324 gold spending in Cairo was so heavy it crashed the local gold price for years. Islam spread top-down and slowly — rulers first, ordinary people much later, many keeping indigenous religion alongside it.",
  "HIS.G10.T2.MALI.A3":
    "Timbuktu had real universities — Sankoré, Djinguereber — teaching maths, medicine and astronomy, not just religion. Scholars travelled there the way students travel to a famous university today; it wasn't a truck stop.",
  "HIS.G10.T2.MALI.A4":
    "Mali fell the way a business collapses — not one blow but several at once: fights over succession, Tuareg raids, Songhai rising next door, and Atlantic trade pulling wealth to the coast. Songhai, not Europe, took over its core.",
  "HIS.G10.T3.ZIMBABWE.A1":
    "Great Zimbabwe was one of a family of southern African stone-walled kingdoms — Mapungubwe before it, Thulamela after. Gold and ivory went out to the Indian Ocean coast; glass beads and Chinese porcelain came back. Cattle were elite currency.",
  "HIS.G10.T3.ZIMBABWE.A2":
    "The great walls have no battlements or arrow slits — they weren't a fort. They marked sacred and royal space, the way cathedral walls do. A town of 10,000–20,000 needed organised farming and government to run.",
  "HIS.G10.T3.ZIMBABWE.A3":
    "The 'Phoenicians built it' theories weren't honest guesses — they were a refusal to credit Africans with the stonework. Proper archaeology (Randall-MacIver 1905, Caton-Thompson 1929) proved African origin; the Rhodesian and apartheid states tried to bury that.",
  "HIS.G10.T3.TRIBES.A1":
    "Precolonial identity worked more like which club you support than a fixed passport — people moved, intermarried and joined whichever strong ruler (sometimes a queen) offered protection. Royal-vs-commoner often mattered more than 'tribe'.",
  "HIS.G10.T3.TRIBES.A2":
    "Missionaries froze living speech by printing one dialect as 'correct', making the rest 'wrong'. Colonial governments then needed neat 'tribes' for taxes, labour and indirect rule — so they drew hard lines where none had existed.",
  "HIS.G10.T3.TRIBES.A3":
    "Modern political tribalism is a hand-me-down tool — built from colonial borders, ID categories and Bantustans. A politician who mobilises by 'tribe' is using the coloniser's instrument; naming that origin is the first step to blunting it.",
  "HIS.G10.T4.ACHIEVE.A1":
    "Iron-smelting started in Africa and spread outward; Egyptian geometry was the foundation Greek mathematicians built on; the 20,000-year-old Ishango bone shows tally-marking long before similar tools elsewhere. Knowledge often flowed out of Africa, not in.",
  "HIS.G10.T4.ACHIEVE.A2":
    "African influence on Europe is often hidden in plain sight: Egyptian architecture shaped Greek temples, African masks shaped Picasso's cubism, and African rhythms through the diaspora became jazz, blues and hip-hop.",
  "HIS.G10.T4.ACHIEVE.A3":
    "Ubuntu — 'I am because you are' — is a serious claim about human nature, not a manners rule: we become fully human through other people. That challenges 'every person for themselves', which is why the 1996 Constitution names it a founding value.",
  "HIS.G11.T1.IBERIA.A1":
    "Europeans were pushed by hardship at home — poverty, land shortage, religious wars — as much as pulled by gold abroad, with monarchs and the Church funding the voyages. 'The Atlantic World' was one connected system bound by a triangular trade whose main cargo was enslaved people.",
  "HIS.G11.T1.IBERIA.A2":
    "Guns get the headlines, but smallpox and local allies did most of the work — disease killed huge numbers before battles, and peoples crushed by the Aztecs and Incas joined the Spanish. The result was invasion, mass death and genocide, not 'settlement'.",
  "HIS.G11.T1.IBERIA.A3":
    "The colonial order was a ladder fixed by birth and race: Europeans at the top, mixed-descent people in a squeezed middle, Indigenous people and enslaved Africans at the bottom. It was never simply accepted — resistance was constant.",
  "HIS.G11.T1.DUTCHENG.A1":
    "The Dutch and English didn't invent a new method — they copied Spanish and Portuguese ships and navigation, got ahead partly by piracy (robbing treasure ships), then overtook them. Track the takeovers: New Amsterdam became New York; the Cape passed from Dutch to British.",
  "HIS.G11.T1.DUTCHENG.A2":
    "Slavery was the engine of the economy, not a side business — at least 12 million Africans shipped across the Atlantic, the profits building Dutch and British capital. Indenture ends after a fixed term; slavery was for life, inherited by your children, and fixed by race.",
  "HIS.G11.T1.DUTCHENG.A3":
    "The collapse of the Khoisan and Native American populations was caused — war, land seizure, imported disease — not natural. Trace the enslaved journey in stages: capture in Africa → the Middle Passage → plantation or town. Sugar was the thread linking four continents.",
  "HIS.G11.T2.HAITI.A1":
    "Saint-Domingue was the richest slave colony in the Americas — the peak of the whole Atlantic system. Resistance didn't begin with the revolution: enslaved people resisted daily by escaping, burning crops, feigning illness and farming their own plots. Those small free spaces grew the idea of freedom.",
  "HIS.G11.T2.HAITI.A2":
    "France's 'liberty, equality, fraternity' left enslaved Africans out — so Haitians had to take freedom themselves. Anchor it: 1791–1804, led by Toussaint L'Ouverture, powered by African-born people (women included), ending with the first nation led by the formerly enslaved.",
  "HIS.G11.T2.HAITI.A3":
    "Haiti went further than France or America by insisting freedom must include everyone, including Black slaves — and was punished for it with a crushing French indemnity. The idea still spread, inspiring anti-slavery and anti-colonial struggles for generations.",
  "HIS.G11.T3.CENTRAL.A1":
    "Several pressures stacked up — population growth, drought, long-distance trade, settler expansion from the south — no single cause and no single great man. Centralising also had a cost: bigger kingdoms became more top-down, losing the consultative imbizo of the societies they replaced.",
  "HIS.G11.T3.CENTRAL.A2":
    "Two routes to the same goal. The Bapedi consolidated by marriage and diplomacy — principal wives from the Maroteng, ilobolo, local regiments called up only when needed. The Zulu consolidated by a permanent military system — regiments living for years in the king's barracks.",
  "HIS.G11.T3.CENTRAL.A3":
    "Power moved up to the king at the expense of the imbizo — but these kingdoms resisted hard. The Zulu crushed the British at Isandlwana in January 1879 before losing at Ulundi; the Pedi held out until Britain brought in Swazi allies. Migrant labour was later built on those same regiments.",
  "HIS.G11.T4.SCRAMBLE.A1":
    "At the Berlin Conference of 1884–85, Europeans drew Africa's borders around a table — with no Africans present. It's called a 'scramble' because European nations raced each other to grab territory after 1880, carving up a continent with startling speed.",
  "HIS.G11.T4.SCRAMBLE.A2":
    "Historians offer four competing explanations — economic, scientific racism, diplomatic rivalry, and the African dimension — not one settled answer; weighing them is the task. And 'scientific racism' wasn't science: it was a pseudo-scientific cover story built to justify conquest.",
  "HIS.G11.T4.SCRAMBLE.A3":
    "Colonial borders were drawn straight through peoples — splitting the Shangaan/Tsonga across Mozambique and South Africa. Africans resisted and sometimes won: Ethiopia beat Italy at Adwa in 1896. Conquest also brought genocide — the Belgian Congo, and the German killing of the Herero and Nama.",
  "HIS.G12.T1.POLECON.A1":
    "Follow the chain: diamonds and gold → mining capital → a surge of British imperialism → conquest of African polities → the South African War → the Union of 1910, which joined British and Afrikaner whites and deliberately locked out the African majority. Economics and politics were one story.",
  "HIS.G12.T1.POLECON.A2":
    "The economy was racial by design: the 'civilised labour' policy and colour bar reserved good jobs for whites, job reservation at ISCOR and ESKOM protected them, and migrant labour kept African workers cheap and controlled. The state lifted poor whites while keeping Africans poor.",
  "HIS.G12.T1.POLECON.A3":
    "The same mining economy bred three responses — African nationalism, Afrikaner nationalism, and a workers'/communist movement. Keep the revolts straight: white miners revolted in 1913 and 1922; African miners struck in 1920; the ICU organised African workers; the Broederbond drove Afrikaner nationalism.",
  "HIS.G12.T1.NATQ.A1":
    "The national question asks: where oppressor and oppressed share one country, who counts as a citizen and who holds power? At Union in 1910, over 80% of people were shut out of citizenship. Liberals, Marxists, Africanists and African nationalists each answered it very differently.",
  "HIS.G12.T1.NATQ.A2":
    "Match each body to its people and purpose: the SANNC/ANC (1912) for Africans excluded from the Union; the NP (1914) for aggrieved Afrikaners; the NIC and APO for Indian and Coloured people; the CPSA (1921) for workers. Same exclusion, very different futures wanted.",
  "HIS.G12.T1.NATQ.A3":
    "Apartheid from 1948 was segregation made harsher and more systematic. The Bantustans were the trick: assign Africans to ethnic 'homelands', strip them of South African citizenship, and claim the rest of the country for whites. Dispossession dressed as self-rule.",
  "HIS.G12.T1.NATQ.A4":
    "The struggle had more than one vision of a free South Africa. Keep them apart: Sobukwe led the PAC's Africanist alternative to the ANC; Biko's Black Consciousness Movement and AZAPO stressed psychological liberation and Black self-reliance.",
  "HIS.G12.T2.COLDWAR.A1":
    "'Cold' because the superpowers never fought each other directly — nuclear weapons made that suicidal. Instead: rival ideologies (US capitalist, USSR socialist), an arms race, and proxy wars in other countries. Anchors: NATO vs Warsaw Pact, the Berlin Wall, the Cuban Missile Crisis.",
  "HIS.G12.T2.COLDWAR.A2":
    "Angola became a Cold War battlefield fought by proxies. Match the backers: MPLA — Cuba and the USSR; UNITA — apartheid South Africa; FNLA — the USA and Zaire. South Africa invaded in 1975 and fought on to Cuito Cuanavale in 1987–88, selling itself as a Western ally.",
  "HIS.G12.T2.COLDWAR.A3":
    "Ordinary people abroad often opposed apartheid while their own governments shielded it — that gap is what the solidarity movements and sports boycotts targeted. In the 1973 UN vote apartheid was named a crime against humanity: the USSR and African and non-aligned states for, the USA and Britain against.",
  "HIS.G12.T2.LIBSTRUG.A1":
    "The OAU (1963, later the AU in 2001) was Africa's united front against the last white-minority regimes. The Frontline States sheltered exiled liberation movements at real cost to themselves — the struggle was continental, not just internal.",
  "HIS.G12.T2.LIBSTRUG.A2":
    "African support was split. Pro-liberation: Tanzania, Zambia, Nigeria. Anti-liberation (keeping ties with apartheid SA): Malawi, Côte d'Ivoire. The deciding factor was usually alignment with the West or economic dependence on South Africa.",
  "HIS.G12.T2.LIBSTRUG.A3":
    "Apartheid South Africa struck back across its borders with raids and economic pressure on neighbours sheltering the movements. Namibia's route to freedom ran through the League of Nations and the UN. The 1989 Harare Declaration set the conditions for negotiations — pointing to the end of apartheid.",
  "HIS.G12.T3.LEADERS.A1":
    "Leaders don't steer history at will, but they can be decisive. Botha the securocrat: as Defence Minister he drove the nuclear programme and the 1975 Angola invasion; as leader he turned the country into a 'military state' and imposed the 1985 State of Emergency. A securocrat rules through the security forces.",
  "HIS.G12.T3.LEADERS.A2":
    "Botha reformed to preserve white power, not to end apartheid. The 1983 Tricameral Parliament added Coloured and Indian chambers but still excluded the African majority — exactly why the UDF formed against it. He scrapped some petty-apartheid laws but never touched the core.",
  "HIS.G12.T3.LEADERS.A3":
    "After the 1960 bannings, Tambo rebuilt the ANC in exile and led it for about 30 years. Learn the Four Pillars: underground struggle, international solidarity, armed struggle (MK), and mass mobilisation. The 1976 Soweto uprising drove youth into exile and into MK.",
  "HIS.G12.T3.DEMOC.A1":
    "Apartheid became too expensive to keep up — the 1985 economic crash, sanctions and boycotts forced the issue. Talks built gradually: public meetings with the exiled ANC, the Eminent Persons Group, then secret NP–ANC talks — leading to the unbannings and Mandela's release in February 1990. Pressure, not goodwill.",
  "HIS.G12.T3.DEMOC.A2":
    "The transition was negotiated and violent at the same time. CODESA brought the parties to the table and compromises like the Sunset Clause kept it alive, while 'third force' violence, the ANC–Inkatha conflict, the murder of Chris Hani and AWB attacks nearly wrecked it. The 27 April 1994 election still delivered democracy.",
  "HIS.G12.T3.DEMOC.A3":
    "The TRC chose restorative justice — truth and amnesty instead of trials. It exposed atrocities, but its limits matter: many officials stayed silent, and white business and the legal profession escaped scrutiny. The 1996 Constitution secured political freedom, but economic inequality largely survived.",
};
