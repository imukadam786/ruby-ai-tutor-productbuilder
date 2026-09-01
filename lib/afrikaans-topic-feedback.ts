// ─── Afrikaans FAL — per-skill "think of it like this" worked examples ──────
//
// One short worked demonstration per skill (346, Grades 1–12), keyed by
// skill id. Feeds the wrong-answer card's example slot via
// FeedbackExplanation's `exampleOverride`. For a language the most useful
// "example" is the skill shown in action on one concrete Afrikaans item with
// an English gloss, not a real-world analogy. "why" = the question's memo,
// "how" = the skill's recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  // ── Grade 1 ──────────────────────────────────────────────────────────────
  "AF.G1.KLK.01":
    "Rhyming words end the same: kat / mat / rat all end in -at. 'Kat' and 'hond' don't rhyme — they only start the same way if at all.",
  "AF.G1.KLK.02":
    "The beginning sound is the very first one you hear: 'kat' starts with /k/, 'son' starts with /s/, 'boom' starts with /b/. Hold it long: k-k-kat.",
  "AF.G1.KLK.03":
    "Clap once for each word: 'Die (clap) kat (clap) slaap (clap)' — three claps, three words.",
  "AF.G1.KLK.04":
    "Clap the beats inside a word: 'ap-pel' is two claps, 'ba-na-na' is three. Try it on your own name first.",
  "AF.G1.KLK.05":
    "Onset + rime: the first sound plus the rest. /k/ + 'at' = 'kat'; /m/ + 'at' = 'mat'. Keep the rime the same and just swap the front.",
  "AF.G1.KLK.06":
    "One versus many: 'boek' is one book, 'boeke' is more than one. The added ending (-e) tells you it's plural.",
  "AF.G1.LEE.01":
    "A sight word is one you know by its shape without sounding it out: 'die', 'en', 'is', 'ek'. Look at the whole word, not letter by letter.",
  "AF.G1.LEE.02":
    "Match the label to the thing: the word 'deur' goes on the door, 'venster' on the window, 'stoel' on the chair.",
  "AF.G1.LEE.03":
    "Read the caption word by word and check the picture has every part: 'die rooi bal' needs a ball AND it must be red.",
  "AF.G1.LEE.04":
    "Find the answer in the sentence: 'Die seun het 'n bal.' — Who has a ball? The seun (the boy). The sentence says so directly.",
  "AF.G1.LUI.01":
    "Do exactly what you hear: 'Wys vir my die rooi bal' means point to the ball that is red — not just any ball.",
  "AF.G1.LUI.02":
    "Everyday phrases have set meanings: 'Goeie môre' = Good morning, 'Dankie' = Thank you, 'Totsiens' = Goodbye.",
  "AF.G1.LUI.03":
    "Listen for the detail the question asks: if the story says 'Die kat sit op die mat', then 'Where is the cat?' → on the mat.",
  "AF.G1.TAA.01":
    "Present tense = happening now: 'Sy hou van skool' = She likes school. 'Ek speel' = I play (right now).",
  "AF.G1.TAA.02":
    "Afrikaans wraps a negative in two 'nie': 'Sy lees' becomes 'Sy lees NIE' ... 'NIE' at the end = She does not read.",
  "AF.G1.TAA.03":
    "Each question word asks for one kind of answer: Wie? → a person, Wat? → a thing, Hoeveel? → a number, Hoe? → a way.",
  "AF.G1.TAA.04":
    "Pronouns replace names: ek = I, jy = you, hy = he, sy = she, ons = we, hulle = they.",
  "AF.G1.TAA.05":
    "'kan' = able to (Ek kan spring = I can jump); 'mag' = allowed to (Ek mag speel = I may play).",
  "AF.G1.TAA.06":
    "Plurals of familiar nouns: boek → boeke, kat → katte, appel → appels. Show one, then a whole pile.",
  "AF.G1.TAA.07":
    "Possessives show whose: my boek = my book, jou pen = your pen, haar tas = her bag.",
  "AF.G1.TAA.08":
    "Position words: op = on, in = in, onder = under, langs = next to, by = at, uit = out of. The cat is OP the box / ONDER the box.",
  "AF.G1.TAA.09":
    "Describing words tell what something is like: 'gelukkig' = happy, 'groot' = big, 'vinnig' = fast.",
  "AF.G1.WRD.01":
    "Colours: rooi = red, blou = blue, geel = yellow, groen = green, swart = black, wit = white.",
  "AF.G1.WRD.02":
    "Body parts: neus = nose, oog = eye, oor = ear, mond = mouth, hand = hand, voet = foot.",
  "AF.G1.WRD.03":
    "Clothes: hemp = shirt, broek = trousers, skoene = shoes, hoed = hat, kouse = socks.",
  "AF.G1.WRD.04":
    "Food: appel = apple, brood = bread, melk = milk, eier = egg, kaas = cheese.",
  "AF.G1.WRD.05":
    "Animals: hond = dog, kat = cat, koei = cow, perd = horse, voël = bird, vis = fish.",
  "AF.G1.WRD.06":
    "Weather: son = sun, reën = rain, wind = wind, wolk = cloud, koud = cold, warm = warm.",
  "AF.G1.WRD.07":
    "Size and shape: groot = big, klein = small, lank = long/tall, kort = short, rond = round.",

  // ── Grade 2 ──────────────────────────────────────────────────────────────
  "AF.G2.KLK.01":
    "Confusable words differ by one vowel: 'mier' (ant) vs 'meer' (more), 'pit' vs 'put'. Say them back to back and stretch the middle sound.",
  "AF.G2.KLK.02":
    "Each letter has a sound: m → /m/ (mat), s → /s/ (son), b → /b/ (bal). Say the letter's sound, not its name.",
  "AF.G2.KLK.03":
    "Blend three sounds into a word: k-a-t → 'kat'; s-o-n → 'son'; p-e-n → 'pen'.",
  "AF.G2.KLK.04":
    "A word family shares an ending: kos, los, pos, mos all end in -os. Fix the ending, swap the front letter.",
  "AF.G2.KLK.05":
    "End sounds change meaning: 'kat' + -jie = 'katjie' (little cat); 'boek' + -e = 'boeke' (books).",
  "AF.G2.KLK.06":
    "A consonant blend is two consonants said together: 'st' in 'stoel', 'dr' in 'drink', 'sp' in 'speel'.",
  "AF.G2.KLK.07":
    "Double vowels make a long sound: 'man' (short a) vs 'maan' (long aa); 'bot' vs 'boot'.",
  "AF.G2.LEE.01":
    "More sight words: met = with, van = of/from, hulle = they, want = because. Read them as one shape.",
  "AF.G2.LEE.02":
    "Read the sentence, then check each picture: 'Die seun eet 'n appel' needs a boy AND an apple AND eating.",
  "AF.G2.LEE.03":
    "Order by what must come first: she GETS the egg → she COOKS it → she EATS it. You can't eat it before cooking it.",
  "AF.G2.LEE.04":
    "Check every word of the caption against the picture: 'die groot bruin hond slaap' needs big + brown + dog + sleeping, all four.",
  "AF.G2.LEE.05":
    "A summary is what the WHOLE text is about: if every sentence is about a dog in the garden, the summary is 'A dog playing in the garden', not one detail.",
  "AF.G2.LUI.01":
    "Two steps in order: 'Draw a circle, THEN colour it red.' Do step one, confirm it, then step two.",
  "AF.G2.LUI.02":
    "Rule options out clue by clue: 'It is round, you kick it, it is on the grass' → a bal (ball), not a boek.",
  "AF.G2.LUI.03":
    "Track the order of events: if Tom got up, then brushed his teeth, then ate — the FIRST thing was getting up.",
  "AF.G2.TAA.01":
    "Past tense = het + ge-: 'Ek speel' (now) → 'Ek het gespeel' (done). The 'het' and the 'ge-' are the flags.",
  "AF.G2.TAA.02":
    "Sequence words: Eers ... (first) en toe ... (then) Daarna ... (after that). They mark the order of steps.",
  "AF.G2.TAA.03":
    "'Wanneer?' asks for a time (vanoggend, gister); 'Waar?' asks for a place (by die skool, in die tuin).",
  "AF.G2.TAA.04":
    "Object pronouns receive the action: 'Sy help my' = She helps me; 'Ek sien hom' = I see him; 'Ons ken haar' = We know her.",
  "AF.G2.TAA.05":
    "'is' links a subject to a describing word: 'Sy is gelukkig' = She is happy; 'Die bal is rooi' = The ball is red.",
  "AF.G2.TAA.06":
    "More describing words in opposite pairs: lank / kort, vinnig / stadig, mooi / lelik, skoon / vuil.",
  "AF.G2.TAA.07":
    "Extended plurals, incl. irregulars: blom → blomme, kind → kinders, man → mans, boom → bome.",
  "AF.G2.WRD.01":
    "Feelings: bly = happy, hartseer = sad, kwaad = angry, bang = scared, moeg = tired.",
  "AF.G2.WRD.02":
    "Seasons: somer = summer, herfs = autumn, winter = winter, lente = spring.",
  "AF.G2.WRD.03":
    "Time words: gister = yesterday, vandag = today, môre = tomorrow; Maandag, Dinsdag, Woensdag ...",
  "AF.G2.WRD.04":
    "Food and drink: vleis = meat, groente = vegetables, vrugte = fruit, water = water, sap = juice.",
  "AF.G2.WRD.05":
    "Action verbs: hardloop = run, spring = jump, sit = sit, staan = stand, eet = eat, drink = drink.",

  // ── Grade 3 ──────────────────────────────────────────────────────────────
  "AF.G3.KLK.01":
    "Longer blends: 'spr' in 'spring', 'str' in 'straat', 'skr' in 'skryf'. Say the cluster as one unit, then the rest.",
  "AF.G3.KLK.02":
    "Diphthongs glide two sounds together: 'oei' in 'koei', 'aai' in 'draai', 'ooi' in 'mooi', 'eeu' in 'leeu'.",
  "AF.G3.KLK.03":
    "Two-vowel sounds: 'ei' in 'trein', 'eu' in 'seun', 'ou' in 'koud'. Each is one sound, not two.",
  "AF.G3.KLK.04":
    "Spelling and sound can differ: the -er in 'water' sounds like a soft 'uh', not a clear 'e'.",
  "AF.G3.KLK.05":
    "Keep the cluster together while blending: dr-i-nk → 'drink'; sp-e-l → 'spel'; st-o-el → 'stoel'.",
  "AF.G3.KLK.06":
    "A suffix changes the word: 'kat' + -tjie = 'katjie' (makes it little); 'lees' + -er = 'leser' (the one who does it).",
  "AF.G3.KLK.07":
    "Rhyme with trickier words: kom / som / dom all end -om; loop / koop / doop all end -oop.",
  "AF.G3.LEE.01":
    "A poster gives one clear message: 'PASOP VIR DIE HOND' = Beware of the dog. Read it word by word.",
  "AF.G3.LEE.02":
    "'Waarom?' needs a reason: 'Thabo huil, WANT hy het sy bal verloor' — he is crying because he lost his ball. The 'want' points to the reason.",
  "AF.G3.LEE.03":
    "Order the events: she MIXES the dough → she BAKES the cake → she EATS it. You can't bake before mixing.",
  "AF.G3.LEE.04":
    "The best summary covers the whole text, not one fact: if it's all about spiders, the summary is 'Facts about spiders'.",
  "AF.G3.LEE.05":
    "Read a labelled diagram by pointing: on a plant, the 'blare' (leaves) are the green parts at the top, the 'wortels' (roots) at the bottom.",
  "AF.G3.LUI.01":
    "'Waarom?' points to the cause: 'Sipho het 'n sambreel gevat WANT dit reën' — because it was raining.",
  "AF.G3.LUI.02":
    "Predict from the clue: if she just made a sandwich and is hungry, the likely next event is 'She eats the sandwich'.",
  "AF.G3.LUI.03":
    "The topic is what all the facts share: if every fact is about elephants, the text is about elephants.",
  "AF.G3.TAA.01":
    "Future tense = sal: 'Ek speel' → 'Ek sal speel' (I will play). 'sal' + verb = not yet done.",
  "AF.G3.TAA.02":
    "Match the tense to the time word: nou → 'Ek eet' (present), gister → 'Ek het geëet' (past), môre → 'Ek sal eet' (future).",
  "AF.G3.TAA.03":
    "''n' = any one (''n appel' = an apple); 'die' = the specific one ('die appel' = the apple you mean).",
  "AF.G3.TAA.04":
    "Degrees of comparison: groot → groter → grootste (big → bigger → biggest). Add -er, then -ste.",
  "AF.G3.TAA.05":
    "Demonstratives point: 'hierdie' = this (near), 'daardie' = that (far), 'dit' = it.",
  "AF.G3.TAA.06":
    "'Watter?' asks you to choose between options; 'Waarom?' asks for a reason (answer with 'omdat ...').",
  "AF.G3.TAA.07":
    "Countable vs uncountable: you can count 'appels' (one, two, three) but not 'suiker' (sugar) or 'sand'.",
  "AF.G3.WRD.01":
    "Describing words: swaar = heavy, lig = light, hard = hard, sag = soft, warm = warm, koud = cold.",
  "AF.G3.WRD.02":
    "Opposites come in pairs: warm / koud, groot / klein, oop / toe, vinnig / stadig, bly / hartseer.",
  "AF.G3.WRD.03":
    "Animal-life words: woon = live (somewhere), eet = eat, jag = hunt, slaap = sleep, nes = nest.",
  "AF.G3.WRD.04":
    "Places in town: winkel = shop, skool = school, hospitaal = hospital, kerk = church, biblioteek = library.",
  "AF.G3.WRD.05":
    "Transport: motor = car, bus = bus, trein = train, vliegtuig = aeroplane, fiets = bicycle, boot = boat.",

  // ── Grade 4 ──────────────────────────────────────────────────────────────
  "AF.G4.LEE.01":
    "Predict from the title: 'Die Verlore Hondjie' (The Lost Puppy) is most likely about a lost puppy that someone finds.",
  "AF.G4.LEE.02":
    "Find the answer in one sentence: if the text says 'Sipho en Bessie gaan park toe', then 'Where do they go?' → the park.",
  "AF.G4.LEE.03":
    "Literal questions are answered straight from the text: 'Wie is Mev. Botha?' — the text names her as an Afrikaans and Maths teacher.",
  "AF.G4.LEE.04":
    "The main idea is what the whole text is about, not one fact: a text on what rhinos eat and the threat they face is 'about rhinos in Africa'.",
  "AF.G4.LEE.05":
    "A procedure has ordered steps: step 1 might be 'Boil water in a kettle', step 2 'Add the tea bag'. Match each question to its numbered step.",
  "AF.G4.LEE.06":
    "Rhyme sits at line ends: if line 1 ends 'bal' and line 2 ends 'val', those two rhyme.",
  "AF.G4.LEE.07":
    "A poster tells you what, when and where: 'a bazaar at the school on Saturday'. Look at the picture, then the big words, then the small print.",
  "AF.G4.LEE.08":
    "Work out an unknown word from around it: 'Die seun is BLY want hy het gewen' — he won, so BLY must mean happy.",
  "AF.G4.LUI.01":
    "Do every step: 'Draw a circle AND colour it red' — both, in order.",
  "AF.G4.LUI.02":
    "Listen for the detail: if the story says Aletta got a new umbrella, then 'What did Aletta receive?' → a new umbrella.",
  "AF.G4.LUI.03":
    "Predict from the hint: if the sky is dark and the wind is rising, it will probably start raining hard.",
  "AF.G4.LUI.04":
    "Put events on a line: wake → brush teeth → breakfast → school. Each one must be possible before the next.",
  "AF.G4.LUI.05":
    "Match each line to the speaker: if Sipho says 'ons span het gewen', then Sipho is happy because his team won.",
  "AF.G4.LUI.06":
    "Everyday expressions are learnt whole: 'Dit reën katte en honde' = it's raining hard, not literally cats and dogs.",
  "AF.G4.SKR.01":
    "Fill the gap so the sentence is true: 'Die hond ___ in die tuin' → 'speel' or 'slaap' — a doing word that fits a dog in a garden.",
  "AF.G4.SKR.02":
    "Group by category first: on a list titled 'Vrugte' (fruit), 'appel' belongs but 'stoel' (chair) does not.",
  "AF.G4.SKR.03":
    "Read the whole paragraph first, then fill the easy gap: 'Die son skyn helder. Mia speel in die tuin met haar ___' → 'bal' or 'hond'.",
  "AF.G4.SKR.04":
    "Look for time words to order sentences: 'Eerstens ...', 'Toe ...', 'Daarna ...', 'Laastens ...'. Find the beginning first.",
  "AF.G4.SKR.05":
    "Each instruction step starts with a doing word: 'Kook die water', 'Sny die brood', 'Smeer die botter'.",
  "AF.G4.TAL.01":
    "Most plurals add -e or -s: kat → katte, appel → appels, boom → bome. Say the plural aloud to check the ending.",
  "AF.G4.TAL.02":
    "The present-tense verb does not change with the subject: ek praat, jy praat, sy praat, ons praat — same 'praat' every time.",
  "AF.G4.TAL.03":
    "Replace a name with a pronoun: 'Mia speel buite' → 'Sy speel buite'. Mia is female, so 'sy'.",
  "AF.G4.TAL.04":
    "The adjective sits next to the noun: 'die GROOT olifant', 'die VINNIGE hond', 'die MOOI blom'.",
  "AF.G4.TAL.05":
    "First mention takes ''n' (a): 'Ek sien 'n hond.' Once it's known, use 'die': 'Die hond blaf.'",
  "AF.G4.TAL.06":
    "Punctuation names the sentence type: 'Die seun speel buite.' (statement) / 'Speel die seun buite?' (question) / 'Speel buite!' (command).",
  "AF.G4.TAL.07":
    "Capitals for sentence starts, names, places, days, months: 'Ons gaan Maandag Kaapstad toe.'",
  "AF.G4.TAL.08":
    "Test each option in the whole sentence: 'Die seun ___ vinnig om die bus te haal' → 'hardloop' fits; 'slaap' does not.",

  // ── Grade 5 ──────────────────────────────────────────────────────────────
  "AF.G5.LEE.01":
    "List three things you expect from the heading before reading. A heading like 'Hoe om 'n boom te plant' signals a how-to text.",
  "AF.G5.LEE.02":
    "Retell the story in one or two sentences before answering: if you can't, re-read the parts you skimmed.",
  "AF.G5.LEE.03":
    "'Hoekom?' needs a reason. Look for 'omdat', 'want', 'sodat': 'Mev. Khumalo stel haar wekker vir 5vm SODAT sy die trein kan haal.'",
  "AF.G5.LEE.04":
    "Main idea vs supporting detail: could the text survive without this sentence? If yes, it's a detail; if no, it's the main idea.",
  "AF.G5.LEE.05":
    "In a factual report, the answers hide in numbers, names and places: 'Die Krugerpark is in die noordooste van Suid-Afrika.'",
  "AF.G5.LEE.06":
    "Theme = the topic (e.g. friendship); message = the take-away (e.g. 'good friends help each other'). Ask both separately.",
  "AF.G5.LEE.07":
    "Read a comic panel by panel and match each speech bubble to the right character before answering about a feeling.",
  "AF.G5.LEE.08":
    "A dictionary entry lists several meanings. Read each one back into the sentence — only one will fit.",
  "AF.G5.LUI.01":
    "Say a 4–5 step instruction back in your own words before ordering it: '... eers die driehoek teken, toe 'n kolletjie binne-in.'",
  "AF.G5.LUI.02":
    "The main idea is the WHOLE text, not one part. Rule out options that are only a single detail.",
  "AF.G5.LUI.03":
    "An inference goes beyond the words: if Sipho's voice shakes and he won't look up, he is most likely nervous, even if he doesn't say so.",
  "AF.G5.LUI.04":
    "Tone is how the voice sounds: fast and loud = excited or angry; slow and quiet = sad. Copy the tone yourself to name the feeling.",
  "AF.G5.LUI.05":
    "Rhyme is at the line ends: stretch the last word of each line and compare in pairs.",
  "AF.G5.LUI.06":
    "An idiom means more than its words: 'Hy het 'n hart van goud' = he is very kind, not that his heart is metal.",
  "AF.G5.SKR.01":
    "Build a sentence: find the verb first (slaap), then the subject (die kat), then the rest (op die mat) → 'Die kat slaap op die mat.'",
  "AF.G5.SKR.02":
    "A message has a greeting, a body and a sign-off. Map those parts before filling any gap.",
  "AF.G5.SKR.03":
    "Read the whole paragraph for the gist first; fill nouns and verbs before connectors and prepositions.",
  "AF.G5.SKR.04":
    "Use the senses, one per sentence: 'Dit lyk ...', 'Dit klink ...', 'Dit voel ...', 'Dit ruik ...'.",
  "AF.G5.SKR.05":
    "Every step of a procedure starts with a doing word: 'Meng ...', 'Voeg by ...', 'Bak ...'.",
  "AF.G5.SKR.06":
    "A personal response gives an opinion plus a reason: 'My gunsteling-karakter is Karel OMDAT hy dapper is.'",
  "AF.G5.TAL.01":
    "Diminutives depend on the last sound: boek → boekie, kat → katjie, blom → blommetjie.",
  "AF.G5.TAL.02":
    "Past tense frame: subject + het + ge-verb. 'Ek speel' → 'Ek het gespeel'; 'Hy loop' → 'Hy het geloop'.",
  "AF.G5.TAL.03":
    "'sy' = his, 'haar' = her: 'Dit is SY boek' (a man's), 'Dit is HAAR boek' (a woman's). 'my' = mine.",
  "AF.G5.TAL.04":
    "Comparison: groot → groter → die grootste. Comparative adds -er; superlative is 'die ... -ste'.",
  "AF.G5.TAL.05":
    "Place prepositions: op = on top, in = inside, onder = under, langs = beside, agter = behind, voor = in front, tussen = between.",
  "AF.G5.TAL.06":
    "Negate with a second 'nie': 'Ek hou van melk' → 'Ek hou NIE van melk NIE.'",
  "AF.G5.TAL.07":
    "Read the sentence aloud: where you pause, a comma usually belongs. '?' ends a question, '!' a command or exclamation.",
  "AF.G5.TAL.08":
    "Synonyms mean the same (bly = gelukkig); antonyms are opposite (bly ↔ hartseer).",

  // ── Grade 6 ──────────────────────────────────────────────────────────────
  "AF.G6.LEE.01":
    "Audience and purpose from the clues: a formal, factual leaflet in a clinic is for patients, to inform them.",
  "AF.G6.LEE.02":
    "Summarise a 120–200 word story in two sentences. If you can't, re-read the middle you skimmed.",
  "AF.G6.LEE.03":
    "An inference must be defensible from the text. Reject options that go further than the text actually supports.",
  "AF.G6.LEE.04":
    "A good bullet summary: every bullet is supported by the text, and no big point is missing.",
  "AF.G6.LEE.05":
    "A news article puts who/what/where/when/why in the first paragraph. Use the headline to predict.",
  "AF.G6.LEE.06":
    "Notice figurative comparisons: 'Die wind huil soos 'n wolf' compares the wind to a howling wolf.",
  "AF.G6.LEE.07":
    "Persuasive technique: if the ad's words alone try to make you feel something ('Moenie uitmis nie!'), that's emotive language.",
  "AF.G6.LEE.08":
    "Literal or figurative? Ask: could this physically happen? 'Sy trek haar bene onder haar uit' meaning she rushed off = figurative.",
  "AF.G6.LUI.01":
    "Build a checklist as you listen to a 6-step procedure; tick each step before moving on so you know step 4.",
  "AF.G6.LUI.02":
    "Write a one-sentence summary after listening. Any sentence that wouldn't fit in it is a supporting detail.",
  "AF.G6.LUI.03":
    "Mark the opinion ('Ek dink ...') and each reason ('want ...', 'omdat ...') separately to state the speaker's viewpoint.",
  "AF.G6.LUI.04":
    "Two columns — speaker A / speaker B — compared row by row shows what they agree and disagree on.",
  "AF.G6.LUI.05":
    "A simile uses 'soos' or 'so ... soos': 'so vinnig soos 'n luiperd' compares speed to a leopard.",
  "AF.G6.LUI.06":
    "Figurative phrases describe a feeling, not a fact: 'My bene het pap geword' = I went weak with fear.",
  "AF.G6.SKR.01":
    "Pick the conjunction by the link: en = add, maar = contrast, want = reason, of = choice. 'Ek hou van melk EN ek hou van koffie.'",
  "AF.G6.SKR.02":
    "A friendly letter/email has greeting, body, sign-off, name. Map the parts, then fill each gap.",
  "AF.G6.SKR.03":
    "Two passes for a cloze: first pass for nouns/verbs (meaning), second pass for connectors and prepositions.",
  "AF.G6.SKR.04":
    "Paragraph frame: topic sentence, two supporting sentences, one example, closing sentence.",
  "AF.G6.SKR.05":
    "A retelling keeps the order: beginning (what started it), middle (what he did), end (how it turned out).",
  "AF.G6.SKR.06":
    "Opinion + reason: 'Ek dink lees is belangrik OMDAT dit jou woordeskat vergroot.'",
  "AF.G6.TAL.01":
    "Compound noun = two words joined into one: 'skool' + 'tas' = 'skooltas' (school bag). Meaning = the parts combined.",
  "AF.G6.TAL.02":
    "Future = sal or gaan + verb: 'Ek sal speel' / 'Ek gaan speel'. Both are correct.",
  "AF.G6.TAL.03":
    "'hierdie' = this (near); 'daardie' = that (far); 'wat' joins two ideas: 'die boek WAT ek lees'.",
  "AF.G6.TAL.04":
    "Adverbs answer how / when / where: 'vinnig' (how), 'gister' (when), 'daar' (where).",
  "AF.G6.TAL.05":
    "Advanced prepositions map to English: sonder = without, met = with, vir = for, tussen = between. 'Ek het my pen SONDER my boek vergeet.'",
  "AF.G6.TAL.06":
    "The conjunction sends the verb to the end of the subordinate clause: 'Ek bly tuis OMDAT dit REËN.'",
  "AF.G6.TAL.07":
    "Direct speech: 'Hy sê: \"Ek kom nou.\"' — colon introduces, quotes hold the exact words.",
  "AF.G6.TAL.08":
    "An idiom means something figurative: 'Hy is 'n boekwurm' = he loves reading, not that he is a worm.",

  // ── Grade 7 ──────────────────────────────────────────────────────────────
  "AF.G7.LEE.01":
    "Titel, opskrifte en prente wys die doel en gehoor: 'n plakkaat met groot woorde en 'n prys is 'n advertensie wat wil verkoop.",
  "AF.G7.LEE.02":
    "Soeklees: soek die sleutelwoord ('gestig') in die teks en lees dan die sin daar rondom vir die jaartal.",
  "AF.G7.LEE.03":
    "Afleiding = leidraad + kennis: as die teks van val blare en koel oggende praat, is dit waarskynlik herfs.",
  "AF.G7.LEE.04":
    "Feit kan nagegaan word ('Die skool het 800 leerders'); 'n mening dra 'n oordeel ('Dit is die beste skool').",
  "AF.G7.LEE.05":
    "'n Advertensie gebruik groot woorde, kleur en 'n belofte om jou te oortuig om te koop of te doen.",
  "AF.G7.LET.01":
    "Karakter = wie; ruimte = waar/wanneer; intrige = wat gebeur; konflik = die probleem. Die hoofkarakter is die een om wie die storie draai.",
  "AF.G7.LET.02":
    "Tema = die groot idee (bv. moed); intrige = net die gebeure. 'n Storie oor 'n bang seun wat 'n hond red se tema is moed.",
  "AF.G7.LET.03":
    "Rym = woorde wat aan die einde gelyk klink (kat/mat). 'n Strofe = 'n groep versreëls. Vergelyking gebruik 'soos'; metafoor sê iets ís iets.",
  "AF.G7.LET.04":
    "In 'n drama is dialoog wat 'n karakter sê (ná die naam); toneelaanwysings (tussen hakies) sê hoe of waar.",
  "AF.G7.LUI.01":
    "Die kerngedagte is waaroor die hele storie gaan; ondersteunende gedagtes gee net besonderhede daaroor.",
  "AF.G7.LUI.02":
    "Tydwoorde wys die volgorde: 'eers', 'toe', 'daarna', 'laaste'. Die eerste gebeurtenis kom ná 'eers'.",
  "AF.G7.LUI.03":
    "Luister vir gevoelswoorde en herhaling om die stemming te bepaal: 'n gedig vol 'lag' en 'sonskyn' het 'n blye stemming.",
  "AF.G7.LUI.04":
    "Feit kan bewys word; 'n mening wys 'n oordeel. 'n Advertensie wil jou oorreed — 'die lekkerste sap' is 'n mening.",
  "AF.G7.SKR.01":
    "Die onderwerpsin gee die hoofidee van die paragraaf; die ander sinne gee besonderhede wat dit steun.",
  "AF.G7.SKR.02":
    "Kies volgens die verband: en = byvoeg, maar = teenstelling, want/omdat = rede, daarom = gevolg, of = keuse. 'Ek is moeg WANT ek het hard gewerk.'",
  "AF.G7.SKR.03":
    "Begin met die sin wat die idee instel, plaas gebeure in volgorde (tydwoorde help), sluit af met die slotsin.",
  "AF.G7.SKR.04":
    "Elke tekstipe het 'n vaste vorm: 'n brief begin met 'n aanhef ('Liewe ...'); 'n uitnodiging gee wanneer en waar.",
  "AF.G7.SKR.05":
    "Proeflees: hoofletter aan die begin, leesteken aan die einde, korrekte spelling, regte woordvolgorde.",
  "AF.G7.TAA.01":
    "Meervoud volg patrone: boom → bome, kat → katte, foto → foto's. Eiename (Sipho) kry nie 'n meervoud nie.",
  "AF.G7.TAA.02":
    "Verlede tyd = het + ge-: 'Ek speel sokker' → 'Ek het sokker gespeel'. Onreëlmatiges: is → was, kan → kon.",
  "AF.G7.TAA.03":
    "Toekomende tyd = sal of gaan + werkwoord: 'Ek speel sokker' → 'Ek sal sokker speel' / 'Ek gaan sokker speel'.",
  "AF.G7.TAA.04":
    "Persoonlik (ek, hy, sy) vervang 'n naam; besitlik (my, sy, haar) wys besit; aanwysend (hierdie, daardie) wys aan. 'Thabo is laat. HY het die bus gemis.'",
  "AF.G7.TAA.05":
    "Stelsin gee inligting (.); vraagsin vra (?); bevelsin gee 'n opdrag; uitroepsin wys sterk gevoel (!). 'Die son skyn vandag.' = stelsin.",
  "AF.G7.TAA.06":
    "Stellende → vergrotende (-er) → oortreffende (-ste): groot → groter → grootste. Onreëlmatig: goed → beter → beste.",
  "AF.G7.TAA.07":
    "Elke sin begin met 'n hoofletter en eindig met 'n leesteken. 'Hoe gaan dit met jou?' kry 'n vraagteken.",
  "AF.G7.TAA.08":
    "Sinoniem = dieselfde betekenis (blý = gelukkig); antoniem = teenoorgesteld (warm ↔ koud); idioom = vaste figuurlike uitdrukking.",

  // ── Grade 8 ──────────────────────────────────────────────────────────────
  "AF.G8.LEE.01":
    "Lees die hele teks, soek dan die sleutelwoord uit die vraag en lees die sin daar rondom: 'Naledi kweek haar eie groente OMDAT dit goedkoper is.'",
  "AF.G8.LEE.02":
    "'n Opsomming hou net die hoofpunte; laat voorbeelde, herhaling en klein besonderhede uit. Dit is korter as die teks.",
  "AF.G8.LEE.03":
    "Die skrywer se standpunt is hoe hy oor die onderwerp voel. Soek oordeelwoorde ('te veel', 'gevaarlik') en kyk watter kant beklemtoon word.",
  "AF.G8.LEE.04":
    "By 'n grafiek: lees eers die titel en die asse. Die langste staaf of grootste sirkeldeel is die 'gewildste'.",
  "AF.G8.LEE.05":
    "Vooroordeel wys net een kant. Soek oordeelwoorde ('beste', 'verskriklik') en 'n gebrek aan die ander kant se stem.",
  "AF.G8.LET.01":
    "Karakterisering: lei die karakter af uit wat hy sê en doen. Konfliktipes: mens teen mens, mens teen homself, mens teen die natuur, mens teen die samelewing.",
  "AF.G8.LET.02":
    "Intrige-stadiums: inleiding → verwikkeling → hoogtepunt → ontknoping. Die tema is die groot idee; die boodskap is die les.",
  "AF.G8.LET.03":
    "Vergelyking gebruik 'soos'; metafoor sê iets ís iets anders; personifikasie gee menslike dade aan 'n ding; alliterasie herhaal die beginklank.",
  "AF.G8.LET.04":
    "'n Bedryf is 'n hoofafdeling van 'n toneelstuk. Spanning bou van bedryf tot bedryf op.",
  "AF.G8.LUI.01":
    "Luister vir wie praat en wat elkeen se hoofpunt is. Die kernpunt is die belangrikste inligting, nie 'n klein besonderheid nie.",
  "AF.G8.LUI.02":
    "'n Goeie opsomming hou net die belangrikste punte; skryf kort, in jou eie woorde, sonder voorbeelde.",
  "AF.G8.LUI.03":
    "Toon = die gevoel agter die woorde (ernstig, speels, kwaad). Bedoeling = wat die spreker wil hê jy moet doen of dink.",
  "AF.G8.LUI.04":
    "Vooroordeel gee net een kant. Vra: gee die spreker albei kante, of stuur hulle jou na een mening toe?",
  "AF.G8.SKR.01":
    "Skakelwoorde en voornaamwoorde verbind paragrawe: 'Dit het hard gereën. DAAROM kon ons nie buite speel nie.'",
  "AF.G8.SKR.02":
    "Formeel (vir 'n vreemde of belangrike persoon) vermy sleng en verkortings; informeel (vir vriende) is ontspanne. 'Geagte Mnr. Botha' = formeel.",
  "AF.G8.SKR.03":
    "Inleiding → middel-paragrawe in 'n logiese volgorde → gevolgtrekking. Skakelwoorde wys die orde.",
  "AF.G8.SKR.04":
    "'n Formele brief het twee adresse, 'n datum en 'n formele aanhef ('Geagte Meneer'). 'n Verslag het 'n titel en feitelike afdelings.",
  "AF.G8.SKR.05":
    "Redigeer: hoofletters, leestekens, spelling, regte tyd (teenwoordig/verlede), en of die werkwoord by die onderwerp pas.",
  "AF.G8.TAA.01":
    "'n Byvoeglike naamwoord beskryf 'n naamwoord ('die VINNIGE hond'). Versamelnaam = 'n groep as een ('n SWERM bye).",
  "AF.G8.TAA.02":
    "Hoofwerkwoord dra die betekenis (gelees); hulpwerkwoord help (het, sal, kan); koppelwerkwoord (is, was, word) koppel. In 'Ek het 'n boek GELEES' is 'gelees' die hoofwerkwoord.",
  "AF.G8.TAA.03":
    "'n Hoofsin kan alleen staan; 'n bysin (omdat, terwyl, wat) kan nie. In 'Ek bly binne OMDAT DIT REËN' is 'omdat dit reën' die bysin.",
  "AF.G8.TAA.04":
    "Bedrywend: die onderwerp doen ('Die seun skop die bal'). Lydend: die aksie val op die voorwerp ('Die bal WORD deur die seun geSKOP').",
  "AF.G8.TAA.05":
    "Direkte rede gee die presiese woorde tussen aanhalingstekens: 'Sy sê: \"Ek kom.\"'. Indirekte rede vertel dit oor: 'Sy sê dat sy kom.'",
  "AF.G8.TAA.06":
    "Groep 1 (en, maar, want) laat die woordorde. Groep 2 (daarom, dus) ruil onderwerp en werkwoord om. Groep 3 (dat, omdat) stoot die werkwoord na die einde.",
  "AF.G8.TAA.07":
    "Aanhalingstekens omvat presiese woorde; 'n dubbelpunt (:) lei 'n lys of aanhaling in; 'n kommapunt (;) verbind twee verwante sinne.",
  "AF.G8.TAA.08":
    "Homofone klink dieselfde, spel anders (sy/sei); homonieme spel dieselfde, beteken iets anders (bank = sitplek / geldplek).",

  // ── Grade 9 ──────────────────────────────────────────────────────────────
  "AF.G9.LEE.01":
    "Onderskei letterlik (staan reguit in die teks), afleiding (moet afgelei word) en die skrywer se doel (om in te lig, te oorreed, te vermaak).",
  "AF.G9.LEE.02":
    "'n Sintese trek verwante idees uit verskeie dele saam in jou eie woorde — nie net een deel oorgeskryf nie.",
  "AF.G9.LEE.03":
    "Soek oordeel- en gevoelswoorde vir die skrywer se houding: 'n teks vol 'skadelik', 'kommerwekkend' oor besoedeling wys 'n negatiewe houding.",
  "AF.G9.LEE.04":
    "'n Spotprent gebruik oordrywing en simbole vir 'n boodskap; kyk na beeld én woorde saam.",
  "AF.G9.LEE.05":
    "'n Sterk argument staaf sy stelling met bewyse en erken die ander kant. Soek onbewese bewerings en versteekte aannames.",
  "AF.G9.LET.01":
    "'n Roman/novelle is 'n langer verhaal met 'n hoofkarakter, 'n intrige oor tyd, 'n ruimte en 'n tema. Die hoofkarakter is die een wat verander.",
  "AF.G9.LET.02":
    "Karakterontwikkeling = hoe 'n karakter oor die verhaal verander (bv. van bang na dapper). Klassifiseer die konflik wat die verandering dryf.",
  "AF.G9.LET.03":
    "Ironie sê die teenoorgestelde van wat bedoel word; simboliek laat iets vir 'n groter idee staan; hiperbool is oordrywing ('duisend keer').",
  "AF.G9.LET.04":
    "Dramatiese ironie = die gehoor weet iets wat 'n karakter nie weet nie. 'n Monoloog = een karakter praat alleen 'n lang stuk.",
  "AF.G9.LUI.01":
    "Luister vir die hoofstelling, dan die redes wat dit steun, dan die gevolgtrekking. Skakelwoorde (eerstens, daarom, ten slotte) wys die struktuur.",
  "AF.G9.LUI.02":
    "Feit kan bewys word; mening wys 'n oordeel; vooroordeel wys net een kant; 'n aanname word as waar aanvaar sonder bewys.",
  "AF.G9.LUI.03":
    "Register = hoe formeel/informeel die taal is; toon = die gevoel daaragter; bedoeling = wat die spreker wil bereik.",
  "AF.G9.LUI.04":
    "'n Sterk argument gee redes en bewyse, erken die ander kant, en vermy oordrywing en beledigings.",
  "AF.G9.SKR.01":
    "'n Argument het 'n stelling, redes met bewyse, en 'n gevolgtrekking. Skakelwoorde (eerstens, boonop, daarom, ten slotte) hou dit saam.",
  "AF.G9.SKR.02":
    "'n Anglisisme is 'n direkte vertaling uit Engels: sê 'Ek NEEM 'n BESLUIT', nie 'Ek MAAK 'n besluit' nie.",
  "AF.G9.SKR.03":
    "'n Betoog: stelling → redes met bewyse → oorweeg die teenkant → gevolgtrekking wat daaruit volg.",
  "AF.G9.SKR.04":
    "'n CV lys persoonlike besonderhede, opleiding en ervaring. 'n Sakebrief is formeel met twee adresse. 'n Koerantberig het 'n opskrif en 'n loodparagraaf.",
  "AF.G9.SKR.05":
    "Redigeer: regte tyd, werkwoord pas by die onderwerp, woordorde, leestekens, spelling, én anglisismes.",
  "AF.G9.TAA.01":
    "Voorvoegsel voor die woord (ON-gelukkig = nie gelukkig); agtervoegsel na (dapper-HEID); samestelling voeg twee woorde saam (tafeldoek).",
  "AF.G9.TAA.02":
    "Enkelvoudig = een hoofsin. Saamgesteld = hoofsin + bysin. Veelvoudig = meer as een hoofsin met en/maar.",
  "AF.G9.TAA.03":
    "Lydend in die verlede tyd: 'Die seun het die bal geskop' → 'Die bal IS deur die seun geSKOP.'",
  "AF.G9.TAA.04":
    "Indirekte vraag: 'Hy vra: \"Kom jy saam?\"' → 'Hy vra OF ek saamkom.' Die aanhalingstekens val weg; 'of' lei die ja/nee-vraag in.",
  "AF.G9.TAA.05":
    "Anglisisme teenoor korrekte Afrikaans: nie 'Dit maak sin' nie, maar 'Dit is sinvol' / 'Dit hou steek'.",
  "AF.G9.TAA.06":
    "Dubbele ontkenning: 'Ek het geld' → 'Ek het NIE geld NIE.' Die tweede 'nie' sluit die sin af.",
  "AF.G9.TAA.07":
    "'n Aandagstreep (—) beklemtoon of voeg in; hakies gee ekstra inligting. Moeilike meervoude: foto → foto's, oog → oë.",
  "AF.G9.TAA.08":
    "Paronieme lyk/klink amper eenders maar verskil (loop/loer). Polisemie = een woord met verwante betekenisse (die VOET van 'n mens / die VOET van 'n berg).",

  // ── Grade 10 ─────────────────────────────────────────────────────────────
  "AF.G10.LEE.01":
    "Soek die sleutelwoord uit die vraag ('Thandi', 'ouderdom') in die teks en lees die hele sin daar rondom voor jy kies.",
  "AF.G10.LEE.02":
    "'n Feit kan nagegaan word ('Water kook by 100 °C'); 'n mening wys 'n siening ('dink', 'voel', 'beste').",
  "AF.G10.LEE.03":
    "Die skrywer se houding lê in die gevoelwoorde: 'n stuk vol 'onaanvaarbaar', 'skandelik' oor rommelstrooi wys 'n sterk afkeurende houding.",
  "AF.G10.LEE.04":
    "Afleiding = leidraad + kennis. As iemand 'n jas aantrek en 'n sambreel vat, kan jy aflei dat dit koud is en gaan reën.",
  "AF.G10.LEE.05":
    "Vra by 'n advertensie: wat wil dit hê moet ek dink of doen, en watter middel (humor, oordrywing, 'n leuse) gebruik dit?",
  "AF.G10.LEE.06":
    "Denotasie = die letterlike betekenis; konnotasie = die gevoel wat 'n woord dra. 'Goedkoop' en 'bekostigbaar' beteken dieselfde ding, maar voel anders.",
  "AF.G10.LET.01":
    "Die tema is die groot idee (moed, verlies); die intrige is net wat gebeur. Vra: waaroor gaan dit REGTIG?",
  "AF.G10.LET.02":
    "Beoordeel 'n karakter op wat hy sê en doen en hoe ander op hom reageer — nie net op wat die verteller jou vertel nie.",
  "AF.G10.LET.03":
    "Intrigestruktuur: blootstelling → konflik bou op → klimaks (die hoogste spanning) → ontknoping (hoe dit eindig).",
  "AF.G10.LET.04":
    "'So vinnig soos die wind' = vergelyking ('soos'). 'Sy is 'n leeu in die stryd' = metafoor (sy ís 'n leeu). 'Die bome fluister' = personifikasie.",
  "AF.G10.LET.05":
    "'Ek het al DUISEND KEER gesê' = hiperbool (oordrywing vir klem). Ironie sê die teenoorgestelde van wat bedoel word.",
  "AF.G10.LET.06":
    "Uiterlike bou: tel die versreëls en strofes en merk die eind-klanke vir die rympatroon (aabb, abab). Innerlike bou: die stemming en enige wending.",
  "AF.G10.LUI.01":
    "Hoor die vraag voor die klank speel, dan luister jy met 'n doel. Merk die sleutelwoord ('trein', 'tyd') soos jy dit hoor.",
  "AF.G10.LUI.02":
    "Sê die teks ná luister in EEN sin. As 'n besonderheid nie daar pas nie, is dit ondersteuning, nie die hoofgedagte nie.",
  "AF.G10.LUI.03":
    "Luister vir meningwoorde ('ek dink', 'na my mening') en redewoorde ('want', 'omdat'); merk hulle apart om die standpunt te stel.",
  "AF.G10.LUI.04":
    "Gelaaide woorde en 'almal/altyd/nooit' is tekens van vooroordeel. Vra: wie baat by die boodskap, en wie word weggelaat?",
  "AF.G10.SKR.01":
    "'n Formele brief het twee adresse + 'Geagte Meneer/Mevrou'; 'n vriendskaplike brief het een adres en 'Liewe ...'.",
  "AF.G10.SKR.02":
    "Pas die doel by die teks: om iemand te nooi → 'n uitnodiging; om aan te teken wat gebeur het → 'n verslag of dagboek.",
  "AF.G10.SKR.03":
    "Begin met die kernsin (hoofgedagte), dan die ondersteunende besonderhede, dan 'n slotsin — een gedagte per paragraaf.",
  "AF.G10.SKR.04":
    "Vra wie dit gaan lees: 'n brief aan die skoolhoof verg formele taal ('Geagte Meneer'), nie 'Haai' nie.",
  "AF.G10.SKR.05":
    "Kontroleer een ding op 'n slag: ooreenstemming (werkwoord pas by onderwerp), tyd, spelling, dan leestekens.",
  "AF.G10.SKR.06":
    "Hou net punte wat die betekenis verander; los voorbeelde, herhaling en enigiets wat jy kan weglaat en steeds die teks verstaan.",
  "AF.G10.TAA.01":
    "Meervoud: boom → bome, brief → briewe, foto → foto's. Verkleining hang van die laaste klank af: kat → katjie, boek → boekie.",
  "AF.G10.TAA.02":
    "Persoonlik (wie doen), besitlik (wie s'n), aanwysend (wys aan), betreklik (verbind 'n bysin: 'die man WAT ...').",
  "AF.G10.TAA.03":
    "Trappe: vinnig → vinniger → vinnigste. Onreëlmatig: goed → beter → beste; baie → meer → meeste.",
  "AF.G10.TAA.04":
    "Verlede tyd: 'Ek het gister GESPEEL' (het + ge-verb). Toekomende: 'Ek sal môre speel' (sal + verb).",
  "AF.G10.TAA.05":
    "Groep 1 (en, maar, want): normale woordorde. Groep 2 (dus, daarom): 'Dus KOM hy' (werkwoord tweede). Groep 3 (omdat, terwyl): '...omdat hy KOM' (werkwoord laaste).",
  "AF.G10.TAA.06":
    "'Maak die deur toe!' = bevelsin. 'n Ontkennende sin sluit met 'nie': 'Ek weet nie waar dit is NIE.'",
  "AF.G10.TAA.07":
    "Indirekte rede: 'Sy sê: \"Ek gaan huis toe.\"' → 'Sy sê dat sy huis toe GAAN.' Aanhalingstekens weg, voornaamwoord en woordorde verander.",
  "AF.G10.TAA.08":
    "Lydend: 'Die hond byt die man' → 'Die man WORD deur die hond geBYT.' Die voorwerp word die onderwerp.",
  "AF.G10.TAA.09":
    "'Wat is jou naam?' — die vraagteken hoort aan die einde. ':' lei 'n lys in; ';' verbind twee nou sinne.",
  "AF.G10.TAA.10":
    "Sinoniem vir 'bly' = 'gelukkig' / 'verheug'. Homofone: 'ly' (suffer) en 'lei' (lead) klink eenders — die sin wys watter een.",
  "AF.G10.TAA.11":
    "'Om die aap uit die mou te laat' = om 'n geheim te verklap. Leer die idioom as 'n geheel, nie woord vir woord nie.",
  "AF.G10.TAA.12":
    "Afrikaans skryf samestellings as EEN woord: 'tafel' + 'doek' = 'tafeldoek'. 'n Voorvoegsel verander die betekenis: on- = nie, -loos = sonder.",

  // ── Grade 11 ─────────────────────────────────────────────────────────────
  "AF.G11.LEE.01":
    "Ook in 'n langer teks: soek die sleutelwoord uit die vraag en lees die hele sin daar rondom voordat jy die letterlike antwoord kies.",
  "AF.G11.LEE.02":
    "'n Feit kan bewys word; 'n mening wys 'n siening. 'n Goeie parafrase hou DIESELFDE betekenis in nuwe woorde — niks bygevoeg of weggelaat nie.",
  "AF.G11.LEE.03":
    "Die houding lê in gevoelwoorde; die bedoeling is WAAROM die skrywer skryf — om in te lig, te oorreed, te waarsku of te vermaak.",
  "AF.G11.LEE.04":
    "Afleiding = leidraad + kennis. Evaluering = weeg of die skrywer die bewering werklik met bewyse staaf.",
  "AF.G11.LEE.05":
    "By 'n grafiek of sirkeldiagram: lees eers die titel en die byskrifte/asse; die grootste deel of langste staaf dra die hoofpunt.",
  "AF.G11.LEE.06":
    "Konnotasie is die gevoel wat 'n woord dra: 'n joernalis wat protesteerders 'n 'gepeupel' noem, kies 'n woord met 'n negatiewe konnotasie.",
  "AF.G11.LET.01":
    "Tema = die groot idee (opoffering, verraad); 'n motief is 'n beeld wat herhaal (bv. water, lig); die intrige is net wat gebeur.",
  "AF.G11.LET.02":
    "Beoordeel 'n karakter op wat hy sê en doen; vra dan WIE die storie vertel — 'n karakter ('ek'), 'n buitestander, of 'n alwetende verteller.",
  "AF.G11.LET.03":
    "Volg opstel → opbou → klimaks → ontknoping; vra dan hoe WANNEER en WAAR dit speel (tyd en ruimte) die stemming vorm.",
  "AF.G11.LET.04":
    "'Die wolke hang soos wol' = vergelyking ('soos'). Metonimia laat een ding vir 'n verbonde ding staan ('die kroon' = die koning).",
  "AF.G11.LET.05":
    "Satire gebruik humor of oordrywing om 'n misstand te kritiseer — 'n skrywer wat 'n korrupte amptenaar bespot om die korrupsie aan te val.",
  "AF.G11.LET.06":
    "Merk strofes, reëls en eind-klanke vir die vorm; vra dan hoe 'n klank, beeld, breuk of woordkeuse 'n bepaalde effek skep.",
  "AF.G11.LUI.01":
    "Hoor die vraag voor die klank speel; merk die presiese sleutelwoord ('jare', 'pikkewyne') soos jy dit hoor, ook in 'n langer teks.",
  "AF.G11.LUI.02":
    "Sê die teks ná luister in EEN sin — dít is jou opsomming. 'n Goeie opskrif is kort en vang daardie een sin.",
  "AF.G11.LUI.03":
    "Merk die meningwoorde en redewoorde; vra dan hoe die toon, spoed en pouses die boodskap kleur (ernstig, sarkasties, oorredend).",
  "AF.G11.LUI.04":
    "'n Onuitgesproke aanname word as vanselfsprekend aanvaar sonder bewys — bv. dat 'almal' saamstem, of dat een oplossing die enigste is.",
  "AF.G11.SKR.01":
    "'n Dekbrief 'verkoop' jou vir 'n spesifieke pos saam met jou CV; 'n formele brief het twee adresse + 'Geagte Meneer/Mevrou'.",
  "AF.G11.SKR.02":
    "'n Verslag gee 'n geordende, feitelike beskrywing met opskrifte; 'n agenda lys punte vooraf, 'n notule teken agterna aan wat besluit is.",
  "AF.G11.SKR.03":
    "Begin met die standpunt (kernsin), gee dan redes en bewyse in volgorde, sluit af met 'n gevolgtrekking wat daaruit volg.",
  "AF.G11.SKR.04":
    "'n Verslag aan die skoolbeheerliggaam verg formele, objektiewe taal — feite, nie 'ek voel' nie.",
  "AF.G11.SKR.05":
    "Kontroleer een ding op 'n slag: ooreenstemming, tyd, woordorde, spelling, dan leestekens. Lees die sin in jou kop hardop.",
  "AF.G11.SKR.06":
    "'n Geparafraseerde hoofpunt sê dieselfde in JOU woorde: 'Oefening versterk die hart' → 'Beweging maak die hart gesonder.'",
  "AF.G11.TAA.01":
    "Meervoud: blad → blaaie, kind → kinders, glas → glase. 'n Versamelnaam noem 'n groep as een ('n TROP skape); 'n abstrakte naamwoord noem 'n idee (vryheid).",
  "AF.G11.TAA.02":
    "Betreklike voornaamwoord verbind 'n bysin: 'Die vrou WIE SE kar gesteel is, is ontsteld.' ('wie se' vir besit).",
  "AF.G11.TAA.03":
    "Trappe: graag → liewer → liefste (onreëlmatig). Leer die onreëlmatiges: goed → beter → beste; min → minder → minste.",
  "AF.G11.TAA.04":
    "Verlede tyd = het + ge-verb: 'Ons het die hele dag GEWERK.' 'n Deelwoord kan beskryf ('die lagende kind'); die infinitief is 'om te + werkwoord'.",
  "AF.G11.TAA.05":
    "Groep 1 (en, maar, want): normale woordorde. Groep 2 (dus, daarom): werkwoord tweede. Groep 3 (omdat, terwyl, dat): werkwoord na die einde van die bysin.",
  "AF.G11.TAA.06":
    "In 'Die jong seun skop die bal': onderwerp = 'die jong seun' (wie doen), gesegde = 'skop', voorwerp = 'die bal' (wat ontvang).",
  "AF.G11.TAA.07":
    "Indirekte rede: 'Sy sê: \"Ek gaan môre huis toe.\"' → 'Sy sê dat sy DIE VOLGENDE DAG huis toe gaan.' ('môre' skuif na 'die volgende dag').",
  "AF.G11.TAA.08":
    "Lydend, teenwoordige tyd: 'Die hond jaag die kat' → 'Die kat WORD deur die hond geJAAG.' Verlede: 'IS ... gejaag'; toekoms: 'SAL ... gejaag word'.",
  "AF.G11.TAA.09":
    "'Sy het net een doel gehad: om te wen.' Die dubbelpunt (:) lei die verduideliking in. 'n Gedagtestreep (–) sonder inligting af.",
  "AF.G11.TAA.10":
    "Sinoniem vir 'dapper' = 'moedig' / 'onverskrokke'. Polisemie: 'sleutel' = die ding wat sluit / die belangrikste faktor.",
  "AF.G11.TAA.11":
    "'Om die kop in die nek te gooi' = om moed op te gee. Stel jou die letterlike beeld voor, vra dan wat mense regtig bedoel.",
  "AF.G11.TAA.12":
    "'n Samestellende afleiding voeg woorde saam ÉN 'n voor-/agtervoegsel by: 'drie' + 'hoek' + '-ig' = 'driehoekig'.",

  // ── Grade 12 ─────────────────────────────────────────────────────────────
  "AF.G12.LEE.01":
    "Soek die sleutelwoord uit die vraag ('aansoeke', 'getal') in die teks en lees die hele sin daar rondom voordat jy die feit kies.",
  "AF.G12.LEE.02":
    "'n Feit kan bewys word ('200 werkers'); 'n mening wys 'n siening; die bedoeling is WAAROM die skrywer dit sê.",
  "AF.G12.LEE.03":
    "Die houding lê in die gevoelwoorde; die doel is om in te lig, te oorreed, te waarsku of te vermaak. Albei saam gee die volle prentjie.",
  "AF.G12.LEE.04":
    "Afleiding = leidraad + kennis. Evaluering = weeg die bewyse: staaf die skrywer die bewering, of is dit net 'n bewering?",
  "AF.G12.LEE.05":
    "Lees byskrifte, asse en etikette mooi voordat jy 'n neiging beoordeel; 'n grafiek kan mislei deur die skaal.",
  "AF.G12.LEE.06":
    "Denotasie = die letterlike betekenis; konnotasie = die gevoel. 'Slank' en 'maer' beskryf dieselfde ding, maar dra verskillende gevoel.",
  "AF.G12.LET.01":
    "Die tema is die groot idee (moed, geregtigheid); die intrige is net wat gebeur. Vra: waaroor gaan dit REGTIG, en hoe ontwikkel dit?",
  "AF.G12.LET.02":
    "Beoordeel 'n karakter op wat hy sê/doen en hoe ander reageer; identifiseer WIE vertel en uit watter hoek (eerste- of derdepersoon).",
  "AF.G12.LET.03":
    "'n Karakter wat met sy eie gewete worstel = mens teen homself (innerlike konflik). Tyd en ruimte (die milieu) vorm die gebeure.",
  "AF.G12.LET.04":
    "'Sy stem was donderweer in die vergadering' = metafoor (die stem ís donderweer). Metonimia noem iets met 'n verwante begrip.",
  "AF.G12.LET.05":
    "'n Teks wat 'n misstand bespotlik maak om dit te kritiseer = satire. Paradoks stel twee waar-lykende teenstrydighede langs mekaar.",
  "AF.G12.LET.06":
    "Merk die eind-klanke vir die rympatroon (aabb, abab, abba) en let op die ritme; vra dan hoe 'n breuk of beeld die stemming ondersteun.",
  "AF.G12.LUI.01":
    "Hoor die vraag voor die klank speel; merk die presiese sleutelwoord ('salaris', 'pos') soos jy dit hoor.",
  "AF.G12.LUI.02":
    "Sê die teks in EEN sin ná luister; as 'n besonderheid nie daar pas nie, is dit ondersteuning, nie die hoofgedagte nie.",
  "AF.G12.LUI.03":
    "Merk die meningwoorde ('ek dink', 'na my mening') en redewoorde ('want', 'omdat'); let ook op die toon om die standpunt te stel.",
  "AF.G12.LUI.04":
    "Gelaaide woorde en 'almal/altyd/nooit' wys vooroordeel. Vra wie by die boodskap baat en wie weggelaat word.",
  "AF.G12.SKR.01":
    "'n Formele brief aan 'n koerantredakteur begin met 'Geagte Redakteur'; 'n begeleidingsbrief 'verkoop' jou vir 'n pos saam met jou CV.",
  "AF.G12.SKR.02":
    "'n CV lys jou opleiding, ervaring en vaardighede vir 'n werkaansoek; 'n begeleidingsbrief motiveer waarom jý die pos moet kry.",
  "AF.G12.SKR.03":
    "'n Verhalende opstel vertel 'n storie met 'n begin, middel en einde; 'n beskrywende skep 'n beeld; 'n bespiegelende ondersoek 'n idee.",
  "AF.G12.SKR.04":
    "'n Aansoekbrief aan 'n maatskappy verg formele taal ('Geagte Mevrou'), geen sleng of verkortings nie.",
  "AF.G12.SKR.05":
    "Kontroleer een ding op 'n slag: ooreenstemming, tyd, spelling, dan leestekens. Lees die sin in jou kop.",
  "AF.G12.SKR.06":
    "Hou net punte wat die betekenis verander; sê elkeen in jou eie woorde, en los voorbeelde en herhaling uit.",
  "AF.G12.TAA.01":
    "Meervoud: kalf → kalwers, blad → blaaie, oog → oë. 'n Versamelnaam noem 'n groep; 'n abstrakte naamwoord noem 'n idee of gevoel.",
  "AF.G12.TAA.02":
    "'Die prys is ONSE, nie joune nie' (behoort aan ons). Kies die voornaamwoord volgens sy werk: wie doen, wie s'n, wys aan, verbind, verwys terug.",
  "AF.G12.TAA.03":
    "Verbuig die byvoeglike naamwoord voor 'n naamwoord waar die reël dit vereis: 'n VINNIGE besluit; 'die KOUE water' (koud → koue).",
  "AF.G12.TAA.04":
    "Verlede tyd = het + ge-verb, MAAR ver-/be-/ont- kry nie 'ge' nie: 'Ek verstaan' → 'Ek het VERSTAAN' (nie 'geverstaan' nie).",
  "AF.G12.TAA.05":
    "Groep 1 (en, maar, want): normale woordorde. Groep 2 (dus, daarom, toe): werkwoord tweede. Groep 3 (omdat, sodat, dat): werkwoord na die einde.",
  "AF.G12.TAA.06":
    "In 'Die ywerige student skryf die eksamen': onderwerp = 'die ywerige student', gesegde = 'skryf', voorwerp = 'die eksamen'. Ontkennings eindig met 'nie'.",
  "AF.G12.TAA.07":
    "Indirekte rede: 'Sy sê: \"Ek het die toets geslaag.\"' → 'Sy sê dat sy die toets geSLAAG het.' Aanhalingstekens weg; voornaamwoord verander.",
  "AF.G12.TAA.08":
    "Lydend, teenwoordige tyd: 'Die rekenaar verwerk die data' → 'Die data WORD deur die rekenaar verWERK.' Pas die hulpwerkwoord by die tyd.",
  "AF.G12.TAA.09":
    "'n Kommapunt (;) verbind twee nou verwante hoofsinne sonder 'n voegwoord: 'Dit reën; ons bly binne.'",
  "AF.G12.TAA.10":
    "Sinoniem vir 'belangrik' = 'gewigtig' / 'van belang'. Homofone klink eenders, spel anders; die sin wys watter een pas.",
  "AF.G12.TAA.11":
    "'Om olie op die vuur te gooi' = om 'n rusie erger te maak. Stel jou die letterlike beeld voor, vra dan wat mense regtig bedoel.",
  "AF.G12.TAA.12":
    "Afrikaans skryf samestellings as EEN woord: 'rekenaar' + 'program' = 'rekenaarprogram'. Denotasie = letterlike betekenis; konnotasie = die gevoel.",
};
