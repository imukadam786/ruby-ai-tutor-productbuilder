#!/usr/bin/env node
// One-shot inserter: append Grade 11 (Level 11) to data/afrikaans-skill-tree.json.
// Preserves existing file bytes (targeted splice before the closing `  ]\n}`),
// so Levels 1–6 and 10 are untouched. Re-runnable: aborts if Level 11 already present.
// Each Grade 11 skill chains onto its Grade 10 counterpart (cross-grade prerequisite)
// plus the same intra-tier ordering chain Grade 10 used.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TREE = join(ROOT, "data", "afrikaans-skill-tree.json");

const PROG = {
  model: "practice-through",
  complete_when: "all_items_correct_once",
  reteach_on_error: true,
  requeue_missed: true,
  allow_scaffolding: true,
  blocks_progress: false,
};

// skill helper: id suffix, title, desc, prereqs, templates, error sigs, recovery
const s = (id, title, description, prerequisites, templates, error_signatures, recovery_strategy) => ({
  id,
  bank_skill_id: id,
  title,
  description,
  caps_term: "T1-T4",
  prerequisites,
  templates,
  error_signatures,
  recovery_strategy,
  progression: PROG,
});
const e = (type, description, example) => ({ type, description, example });

const P = "AF.G11";
const G10 = "AF.G10"; // Grade 10 counterparts (cross-grade prerequisites)

const tiers = [
  {
    id: `${P}.LUI`,
    title: "Luister (Listening comprehension)",
    description:
      "Receptive listening only (Praat / speaking-aloud is deferred — needs voice capture). af-ZA audio plays a longer Afrikaans text (interview, speech, news item AND a drama excerpt); the learner taps/chooses. Grade 11 deepens Grade 10: longer texts, summary plus a fitting heading, tone/tempo/phrasing, and sharper critical listening for bias, assumption and manipulation.",
    atomic_skills: [
      s(`${P}.LUI.01`, "Luister vir spesifieke inligting (listen for specific information)",
        "Listen to a longer spoken Afrikaans text (interview, speech, news, drama excerpt) and pick out specific facts: names, times, numbers, places, relationships.",
        [`${G10}.LUI.01`], ["audio", "choice"],
        [e("key_detail_missed", "A key time / number / name is missed in a longer text", "Audio says 'om 14:30'; learner picks '16:30'."),
         e("distractor_confused", "Picks a plausible detail that was not stated", "Audio names Kaapstad; learner picks Pretoria.")],
        "Tell learners the question before the audio replays so they listen with a purpose; note the key word as they hear it, even in a longer text."),
      s(`${P}.LUI.02`, "Luister, som op en voorsien 'n opskrif (summary & heading)",
        "Listen to a longer Afrikaans text, identify the main idea, choose the best one-line summary AND supply a fitting heading, separating it from supporting detail.",
        [`${G10}.LUI.02`, `${P}.LUI.01`], ["audio", "choice"],
        [e("detail_as_main", "Picks a supporting detail as the main idea or heading", "Talk on recycling; learner picks 'glass can be melted' as the heading."),
         e("heading_too_broad", "Picks a too-broad heading missing the focus", "Text about water-saving at home; learner heads it 'The environment'.")],
        "After listening, say the text in ONE sentence — that is your summary. A good heading is short and captures that one sentence."),
      s(`${P}.LUI.03`, "Luister vir houding, toon, tempo en frasering (attitude, tone, tempo & phrasing)",
        "Listen to an Afrikaans opinion, interview or drama excerpt and identify the speaker's viewpoint, attitude and how tone, tempo and phrasing carry meaning.",
        [`${G10}.LUI.03`, `${P}.LUI.02`], ["audio", "choice"],
        [e("viewpoint_reversed", "Identifies the opposite of the speaker's actual position", "Speaker is FOR free transport; learner says AGAINST."),
         e("tone_misread", "Misreads tone, tempo or phrasing (e.g. sarcasm read as praise)", "Sarcastic 'wonderlik' read as genuine approval.")],
        "Listen for opinion words ('ek dink', 'na my mening') and the reason words ('want', 'omdat'); then ask how the tone, speed and pauses colour the message."),
      s(`${P}.LUI.04`, "Kritiese luister: vooroordeel, aanname en manipulasie (critical listening)",
        "Listen critically to a persuasive or one-sided Afrikaans text and detect bias, prejudice, unstated assumptions, generalisation and emotive/manipulative language.",
        [`${G10}.LUI.04`, `${P}.LUI.03`], ["audio", "choice", "true-false"],
        [e("bias_unnoticed", "Treats a one-sided text as neutral fact", "Accepts 'almal weet...' as proof."),
         e("assumption_missed", "Does not flag an unstated assumption or loaded wording", "Misses that 'natuurlik sal dit misluk' assumes failure without evidence.")],
        "Ask: who benefits from this message, who is left out, and what is taken for granted? Loaded words and 'almal/altyd/nooit' are bias signals."),
    ],
  },
  {
    id: `${P}.LEE`,
    title: "Lees en kyk (Reading & viewing comprehension)",
    description:
      "A written or visual Afrikaans text is shown on screen (passage, advert, cartoon, graph, diagram); the learner answers tappable comprehension questions. Grade 11 deepens Grade 10: deeper inference and evaluation, the writer's attitude AND intention, diagrams/sirkeldiagramme, and richer critical language awareness — the Vraestel 1 (Taal in konteks) skill set.",
    atomic_skills: [
      s(`${P}.LEE.01`, "Leesstrategieë: vluglees, soeklees, aandagtige lees (skim, scan, close reading)",
        "Use the right reading strategy to locate explicit information in a longer Afrikaans passage and answer literal questions efficiently.",
        [`${G10}.LEE.01`], ["choice", "true-false"],
        [e("info_not_located", "Cannot find the stated answer in the text", "Answer is in line 2; learner guesses."),
         e("wrong_section", "Answers from the wrong part of the text", "Pulls a detail from the wrong paragraph.")],
        "Scan for the key word from the question, then read the whole sentence around it before choosing."),
      s(`${P}.LEE.02`, "Feit, mening en parafrase (fact, opinion & paraphrase)",
        "Distinguish fact from opinion in an Afrikaans text and recognise the best paraphrase (same idea in different words) of a key statement.",
        [`${G10}.LEE.02`, `${P}.LEE.01`], ["choice", "true-false"],
        [e("opinion_as_fact", "Labels an opinion as a fact (or vice versa)", "'Dit is die beste fliek' read as fact."),
         e("paraphrase_changes_meaning", "Picks a paraphrase that changes the meaning", "Chooses a reworded option that adds or drops a key idea.")],
        "A fact can be checked; an opinion shows what someone thinks. A good paraphrase keeps the SAME meaning in new words — nothing added, nothing lost."),
      s(`${P}.LEE.03`, "Skrywer se houding, standpunt en bedoeling (attitude, viewpoint & intention)",
        "Identify and justify the writer's attitude and viewpoint AND infer the writer's intention (to inform, persuade, warn, entertain) in an article, letter or media text.",
        [`${G10}.LEE.03`, `${P}.LEE.02`], ["choice"],
        [e("attitude_misread", "Misreads the writer's attitude", "Critical article read as supportive."),
         e("intention_missed", "Confuses what is said with WHY the writer wrote it", "Reads a persuasive piece as neutral information.")],
        "Find the feeling-words for the attitude, then ask WHY the writer wrote this — to inform, persuade, warn or entertain? That is the intention."),
      s(`${P}.LEE.04`, "Afleiding, evaluering en gevolgtrekking (inference, evaluation & conclusion)",
        "Read between the lines of an Afrikaans text to infer meaning, draw conclusions AND evaluate how well the writer supports a claim.",
        [`${G10}.LEE.04`, `${P}.LEE.03`], ["choice"],
        [e("literal_only", "Stays literal and misses the implied meaning", "Misses that 'sy het haar tas gegryp' implies she left in a hurry."),
         e("evaluation_unsupported", "Evaluates without weighing the evidence", "Calls a claim 'proven' though the text gives no support.")],
        "Combine a clue with what you know (clue + knowledge = inference); then weigh whether the writer actually backs the claim up — that is evaluation."),
      s(`${P}.LEE.05`, "Visuele tekste: advertensies, spotprente, grafieke, diagramme (visual texts)",
        "Read visual Afrikaans texts — adverts, cartoons (spotprente), graphs, sirkeldiagramme and diagrams — for message, persuasion, humour and data.",
        [`${G10}.LEE.05`, `${P}.LEE.01`], ["choice", "true-false"],
        [e("visual_literal", "Reads a cartoon/advert literally, missing the message", "Misses the irony in a spotprent."),
         e("data_misread", "Misreads a graph, sirkeldiagram or diagram", "Reads the largest slice as the smallest.")],
        "In a visual text ask: what does it WANT me to think or do, which trick (humour, exaggeration, slogan) does it use, and what do the numbers/labels actually show?"),
      s(`${P}.LEE.06`, "Kritiese taalbewustheid (critical language awareness)",
        "Detect bias, stereotyping, assumptions, manipulation, and denotation vs connotation in Afrikaans media texts; weigh whose interests the text serves.",
        [`${G10}.LEE.06`, `${P}.LEE.03`, `${P}.LEE.05`], ["choice", "true-false"],
        [e("bias_unnoticed", "Treats a slanted text as neutral", "Accepts a one-sided report as balanced."),
         e("connotation_missed", "Misses the connotation of a loaded word", "Reads 'goedkoop' only as 'low price', not 'inferior'.")],
        "Separate what a word literally says (denotasie) from the feeling it carries (konnotasie); ask who gains, who is left out, and what is assumed."),
    ],
  },
  {
    id: `${P}.LET`,
    title: "Letterkunde (Literature)",
    description:
      "Transferable literary skills taught on short original / public-domain Afrikaans passages and poems (no prescribed set-works). Grade 11 deepens Grade 10: narrator/perspective (verteller), plot with time & space (tyd en ruimte), beeldspraak extended to metonimia and simboliek, stylfigure extended to satire, and a poem's language/style effect — the Vraestel 2 (Letterkunde) skill set.",
    atomic_skills: [
      s(`${P}.LET.01`, "Tema, motief en boodskap (theme, motif & message)",
        "Identify the central theme, recurring motif and the message of a short Afrikaans story or poem, and distinguish it from the plot.",
        [`${G10}.LET.01`], ["choice"],
        [e("plot_as_theme", "Gives the plot instead of the underlying theme", "'A boy loses his dog' instead of 'loss / growing up'."),
         e("theme_too_narrow", "Picks a surface detail as the theme", "Names a single event, not the bigger idea.")],
        "The theme is the big idea the text is really about (e.g. courage, loss); a motif is an image that recurs; the plot is only what happens."),
      s(`${P}.LET.02`, "Karakter, karakterisering en verteller (character & narrator/perspective)",
        "Analyse characters and how the writer reveals them (direct vs indirect), AND identify the narrator/point of view (first-person, third-person, all-knowing).",
        [`${G10}.LET.02`, `${P}.LET.01`], ["choice", "true-false"],
        [e("trait_unsupported", "Names a trait the text does not support", "Calls a character 'brave' with no evidence."),
         e("narrator_confused", "Confuses the narrator/point of view with a character", "Calls a first-person narrator an 'all-knowing' narrator.")],
        "Judge a character by what they say and do; then ask WHO tells the story — a character ('ek'), an outside voice, or an all-knowing narrator — and how that shapes what we see."),
      s(`${P}.LET.03`, "Intrige, tyd en ruimte (plot, time & space)",
        "Identify plot structure (exposition, conflict, climax, resolution), order events, AND read how time (tyd) and place/setting (ruimte) shape the story.",
        [`${G10}.LET.03`, `${P}.LET.01`], ["choice", "sequence"],
        [e("climax_misplaced", "Misidentifies the climax / turning point", "Picks a minor event as the climax."),
         e("setting_effect_missed", "Notes time/place but not its effect on mood or meaning", "Misses that a dark, stormy setting builds tension.")],
        "Track the arc (setup → build → climax → resolution); then ask how WHEN and WHERE it happens (tyd en ruimte) shapes the mood and the events."),
      s(`${P}.LET.04`, "Beeldspraak: vergelyking, metafoor, personifikasie, metonimia, simboliek (figures of speech)",
        "Identify and interpret simile, metaphor and personification AND extend to metonimia (a part/linked thing standing for the whole) and simboliek (an image standing for an idea).",
        [`${G10}.LET.04`, `${P}.LET.01`], ["choice", "true-false"],
        [e("simile_metaphor_confused", "Confuses simile and metaphor", "Calls 'so vinnig soos die wind' a metaphor."),
         e("symbol_literal", "Reads a symbol or metonym literally", "Reads 'die kroon' only as a hat, not as the king/royalty.")],
        "Vergelyking uses 'soos/asof'; metafoor says one thing IS another; personifikasie gives human action to a thing; metonimia lets one thing stand for a linked thing; simboliek lets an image stand for an idea."),
      s(`${P}.LET.05`, "Stylfigure en retoriese middele, insluitend satire (style figures incl. satire)",
        "Recognise irony, contrast, repetition, hyperbole, climax, euphemism AND satire (mockery that criticises), and explain their effect.",
        [`${G10}.LET.05`, `${P}.LET.04`], ["choice"],
        [e("irony_missed", "Misses irony or satire / takes the words at face value", "Reads a satirical jab as sincere praise."),
         e("device_mislabelled", "Names the wrong device", "Calls repetition 'contrast'.")],
        "Ask what effect the writer wanted (emphasis, surprise, humour, criticism) and match it to the device; satire uses humour/exaggeration to criticise something."),
      s(`${P}.LET.06`, "Gedigbou en die effek van taal en styl (poem structure & language/style effect)",
        "Analyse a poem's outer form (stanzas, lines, rhyme) and inner build (mood, turn) AND explain how its language and style choices create their effect.",
        [`${G10}.LET.06`, `${P}.LET.04`], ["choice", "true-false"],
        [e("rhyme_misread", "Mislabels the rhyme scheme", "Calls aabb an abab pattern."),
         e("form_effect_split", "Cannot link a language/style choice to its effect", "Notes alliteration but not what it does for the mood.")],
        "Mark stanzas, lines and line-end sounds for the form; then ask how a sound, image, break or word-choice creates a specific effect or mood."),
    ],
  },
  {
    id: `${P}.SKR`,
    title: "Skryf en aanbied (Writing knowledge)",
    description:
      "Writing taught as tappable knowledge (essay/transactional PRODUCTION is deferred). Grade 11 deepens Grade 10: argumentative/discursive (betogende) paragraph structure, a wider transactional set (CV + dekbrief, verslag, agenda/notule, written onderhoud/dialoog, rigtingaanwysings), and summary by paraphrase — the planning and editing half of Vraestel 3 (Skryf).",
    atomic_skills: [
      s(`${P}.SKR.01`, "Briewe en CV: formeel, dekbrief en curriculum vitae (letters, covering letter & CV)",
        "Identify the structure and conventions of friendly vs formal letters AND of a covering letter (dekbrief) and CV for a job application.",
        [`${G10}.SKR.01`], ["choice", "true-false"],
        [e("format_mixed", "Mixes friendly and formal conventions", "Uses 'Liewe Jan' to open a job application."),
         e("element_missing", "Omits a required element of a CV / dekbrief", "CV without contact details or work experience.")],
        "A formal letter / dekbrief needs two addresses + a formal salutation/closing; a CV lists contact details, education and work experience under clear headings."),
      s(`${P}.SKR.02`, "Transaksionele tekssoorte: verslag, agenda/notule, onderhoud, rigtingaanwysings (transactional text-types)",
        "Match purpose and key features to the right transactional text: verslag (report), agenda + notule, written onderhoud/dialoog, rigtingaanwysings, e-pos, koerantberig, advertensie.",
        [`${G10}.SKR.02`, `${P}.SKR.01`], ["choice"],
        [e("texttype_confused", "Chooses the wrong text-type for the purpose", "Picks 'dagboek' to record what a meeting decided."),
         e("feature_misplaced", "Assigns a feature to the wrong text", "Puts an RSVP on a report.")],
        "Match the PURPOSE (inform, record, give directions, persuade) to the text-type, then check its signature features (headings, numbered steps, who/what/where)."),
      s(`${P}.SKR.03`, "Paragraafbou: betogende en beredeneerde struktuur (paragraph & argumentative structure)",
        "Build a coherent Afrikaans paragraph (topic sentence + support) AND structure an argumentative/discursive (betogende) paragraph: claim, reasons, evidence, conclusion.",
        [`${G10}.SKR.03`, `${P}.SKR.01`], ["choice", "sequence"],
        [e("no_topic_sentence", "Cannot identify / place the topic sentence or claim", "Buries the main argument mid-paragraph."),
         e("order_illogical", "Orders an argument illogically", "States the conclusion before any reasons.")],
        "Lead with the kernsin / claim, then reasons and evidence in order, then a conclusion that follows from them — one main idea per paragraph."),
      s(`${P}.SKR.04`, "Register, styl en toon (register, style & tone)",
        "Choose the appropriate register, style and tone (formal/informal, persuasive/objective) for the audience and purpose of a text.",
        [`${G10}.SKR.04`, `${P}.SKR.01`], ["choice", "true-false"],
        [e("register_mismatch", "Picks the wrong register for the audience", "Slang in a report to the principal."),
         e("tone_inappropriate", "Tone does not fit the purpose", "Jokey tone in a formal complaint.")],
        "Ask who will read it and why: a boss/newspaper/report needs formal, objective language; a friend allows informal, warmer wording."),
      s(`${P}.SKR.05`, "Redigeer: vind en verbeter die taalfout (editing: find & fix the error)",
        "Proofread a longer Afrikaans sentence and identify or correct the language, spelling, agreement or punctuation error.",
        [`${G10}.SKR.05`], ["choice", "cloze", "true-false"],
        [e("error_unseen", "Does not spot the error", "Passes a wrong tense / spelling / agreement."),
         e("wrong_fix", "Applies an incorrect correction", "‘Corrects’ a right word.")],
        "Check one thing at a time: agreement, tense, word order, spelling, then punctuation. Read the sentence aloud in your head."),
      s(`${P}.SKR.06`, "Opsomming deur parafrase (summary by paraphrase)",
        "Select the main points for a summary of an Afrikaans text and restate them in your OWN words (paraphrase), dropping examples and repetition within a point limit.",
        [`${G10}.SKR.06`, `${P}.SKR.03`], ["choice", "true-false"],
        [e("detail_included", "Keeps a minor detail / example as a key point", "Lists an example instead of the main idea."),
         e("copied_not_paraphrased", "Copies wording instead of paraphrasing", "Repeats the text word-for-word rather than restating it.")],
        "Keep only points that change the meaning, drop examples and repetition, and restate each point in your OWN words rather than copying the text."),
    ],
  },
  {
    id: `${P}.TAA`,
    title: "Taalstrukture en -konvensies (Language structures & conventions)",
    description:
      "The grammar core, taught explicitly and tappable, revised-plus-extended for Grade 11: nouns (incl. versamelname, abstrakte, dubbele meervoude), pronouns (incl. betreklik, onbepaald, wederkerend/wederkerig), adjectives & comparison, verbs across all tenses + deelwoorde + infinitief, conjunctions & word order, sentence analysis (sinsdele) + types + negation, direct/indirect speech incl. questions & commands, active/passive across all tenses, punctuation, semantics (+ polisemie), idioms & proverbs, and word-formation/spelling (+ samestellende afleiding, akronieme). Assessed inside Vraestel 1 (Taal in konteks).",
    atomic_skills: [
      s(`${P}.TAA.01`, "Selfstandige naamwoorde: meervoud, verkleining, geslag, versamelname (nouns extended)",
        "Form and recognise noun plurals (incl. double plurals), diminutives and gender forms, and identify collective nouns (versamelname) and abstract nouns (abstrakte naamwoorde).",
        [`${G10}.TAA.01`], ["choice", "cloze", "true-false"],
        [e("plural_rule_wrong", "Applies the wrong plural rule", "'blad' → 'blads' instead of 'blaaie'."),
         e("noun_type_confused", "Confuses a collective or abstract noun with a common noun", "Calls 'liefde' a concrete noun.")],
        "Plurals follow patterns (often -e/-s, sometimes -ers or a double plural); a versamelnaam names a group as one (swerm, trop); an abstrakte naamwoord names something you cannot touch (liefde, vryheid)."),
      s(`${P}.TAA.02`, "Voornaamwoorde: betreklik, onbepaald, wederkerend (pronouns extended)",
        "Use personal, possessive, demonstrative, relative (betreklik), indefinite (onbepaald) and reflexive/reciprocal (wederkerend/wederkerig) pronouns.",
        [`${G10}.TAA.02`], ["choice", "cloze"],
        [e("relative_wrong", "Wrong relative pronoun", "'die man wat se' instead of 'die man wie se'."),
         e("reflexive_wrong", "Confuses reflexive (homself) with reciprocal (mekaar)", "'hulle help homself' instead of 'mekaar'.")],
        "Match the pronoun to its job: who does (persoonlik), whose (besitlik), pointing (aanwysend), joining (betreklik), unspecified (onbepaald: iemand/niemand), or back to the subject (wederkerend: homself / wederkerig: mekaar)."),
      s(`${P}.TAA.03`, "Byvoeglike naamwoorde en trappe van vergelyking (adjectives & comparison)",
        "Use attributive vs predicative adjectives, inflection (verbuiging), and degrees of comparison (stellend/vergrotend/oortreffend) including irregulars.",
        [`${G10}.TAA.03`], ["choice", "cloze", "true-false"],
        [e("inflection_wrong", "Wrong adjective inflection", "'die oude man' instead of 'die ou man'."),
         e("comparison_irregular", "Wrong comparative/superlative, esp. irregulars", "'goed → gooder' instead of 'beter / beste'.")],
        "Vergrotende trap usually adds -er, oortreffende -ste; learn the irregulars (goed-beter-beste, baie-meer-meeste, min-minder-minste)."),
      s(`${P}.TAA.04`, "Werkwoorde, tye, deelwoorde en infinitief (verbs, tenses, participles & infinitive)",
        "Form present, past (het ge-) and future (sal) tense incl. separable verbs, AND use participles (deelwoorde) and the infinitive (om te + werkwoord).",
        [`${G10}.TAA.04`], ["choice", "cloze", "true-false"],
        [e("past_form_wrong", "Wrong past-tense or participle formation", "'het gekom' written 'het kom' / 'gekomt'."),
         e("infinitive_wrong", "Wrong infinitive construction", "'Ek hou van swem' written 'Ek hou van te swem' incorrectly.")],
        "Verlede tyd = het + ge-werkwoord; toekomende = sal + werkwoord; a deelwoord can describe ('die lagende kind'); the infinitief is 'om te + werkwoord'."),
      s(`${P}.TAA.05`, "Voegwoorde: groep 1, 2 en 3 en woordorde (conjunctions & word order)",
        "Join clauses with group 1 (en, maar, want), group 2 (dus, daarom — word order changes) and group 3 (omdat, terwyl, dat — verb to the end), with correct word order.",
        [`${G10}.TAA.05`, `${P}.TAA.04`], ["choice", "cloze"],
        [e("word_order_wrong", "Wrong word order after the conjunction", "After 'omdat' the verb is not sent to the end."),
         e("conjunction_group_confused", "Uses a conjunction from the wrong group", "Treats 'daarom' like 'en'.")],
        "Groep 1 keeps normal order; groep 2 swaps subject/verb (dus kom hy); groep 3 pushes the verb to the end (...omdat hy kom)."),
      s(`${P}.TAA.06`, "Sinsontleding: sinsdele, sinsoorte en ontkenning (sentence analysis, types & negation)",
        "Identify sentence parts (sinsdele: onderwerp, gesegde, voorwerp), classify sentence types (stel-, vraag-, bevel-, uitroepsin) and apply the double negative (nie ... nie; geen ... nie).",
        [`${G10}.TAA.06`, `${P}.TAA.04`], ["choice", "cloze", "true-false"],
        [e("sinsdeel_confused", "Mislabels a sentence part (subject/predicate/object)", "Calls the object the subject."),
         e("double_negative_wrong", "Drops the second 'nie'", "'Ek het nie geld' instead of 'Ek het nie geld nie'.")],
        "Find WHO/WHAT does the action (onderwerp), the verb part (gesegde) and WHAT receives it (voorwerp); and remember Afrikaans usually closes a negative sentence with 'nie'."),
      s(`${P}.TAA.07`, "Direkte en indirekte rede, ook vrae en bevele (direct & indirect speech incl. questions & commands)",
        "Convert between direct and indirect speech for statements, questions AND commands: change punctuation, pronouns, word order and adverbs of time/place.",
        [`${G10}.TAA.07`, `${P}.TAA.04`], ["choice", "cloze"],
        [e("pronoun_not_shifted", "Pronouns not adjusted", "'Ek' kept instead of 'hy/sy' in reported speech."),
         e("question_command_wrong", "Wrong structure for a reported question or command", "Keeps question word order, or drops 'moet' in a reported command.")],
        "Going to indirect speech: drop the quotation marks, shift the pronouns and time/place words; a question keeps its question word ('hoekom/waar') with the verb at the end; a command uses 'moet'."),
      s(`${P}.TAA.08`, "Bedrywende en lydende vorm oor alle tye (active & passive across all tenses)",
        "Convert between active (bedrywend) and passive (lydend) voice across present, past and future, using word/is/was/sal ... word and the 'deur' agent.",
        [`${G10}.TAA.08`, `${P}.TAA.04`], ["choice", "cloze", "true-false"],
        [e("agent_misplaced", "Loses or misplaces the 'deur' agent", "Passive without 'deur die ...'."),
         e("aux_wrong", "Wrong passive auxiliary for the tense", "Present passive built with 'is' instead of 'word'.")],
        "Passive: object becomes the subject + word (teenwoordig) / is (verlede) / sal ... word (toekomend) + ...ge-werkwoord + (deur die agent). Match the helper to the tense."),
      s(`${P}.TAA.09`, "Leestekens en punktuasie (punctuation)",
        "Apply punctuation correctly: komma, punt, vraagteken, dubbelpunt, kommapunt, aanhalingstekens, koppelteken, afkappingsteken, deelteken and gedagtestreep.",
        [`${G10}.TAA.09`], ["choice", "cloze", "true-false"],
        [e("quotation_wrong", "Quotation punctuation incorrect", "Misplaces the comma/quotes in direct speech."),
         e("apostrophe_wrong", "Wrong apostrophe / deelteken use", "'die kind se boek' vs incorrect 's' use.")],
        "Each mark has a job: ? ends a question, : introduces, ; links two close sentences, “ ” frame the exact words spoken, – sets off a thought."),
      s(`${P}.TAA.10`, "Betekenisleer: sinonieme, antonieme, homofone, polisemie (semantics extended)",
        "Work with synonyms, antonyms, homophones (ly/lei), homonyms, paronyms AND polysemy (one word with several related meanings).",
        [`${G10}.TAA.10`], ["choice", "cloze", "true-false"],
        [e("homophone_confused", "Confuses homophones in spelling/meaning", "'ly' (suffer) vs 'lei' (lead)."),
         e("polysemy_missed", "Misses that one word has several related senses", "Reads 'kop' only as 'head', not also 'mountain top / mug'.")],
        "Sinoniem = same meaning, antoniem = opposite; homofone sound the same but differ in spelling; polisemie is ONE word with several related senses (kop = head, hilltop, mug) — use the sentence."),
      s(`${P}.TAA.11`, "Idiome en spreekwoorde (idioms & proverbs)",
        "Interpret a wider set of Afrikaans idioms, idiomatic expressions and proverbs by their figurative meaning, not literally.",
        [`${G10}.TAA.11`, `${P}.TAA.10`], ["choice", "cloze", "true-false"],
        [e("literal_interpretation", "Reads the idiom literally", "'die aap uit die mou laat' read about a real monkey."),
         e("idiom_mismatched", "Picks an idiom that does not fit the situation", "Uses a 'luck' idiom for a 'secret revealed' context.")],
        "Picture what the words say, then ask what people really mean by it; learn idioms as whole units, not word-by-word."),
      s(`${P}.TAA.12`, "Woordvorming en spelling: afleiding, samestelling, samestellende afleiding, akronieme (word-formation & spelling)",
        "Build and spell words through prefixes/suffixes (afleiding), compounds (samestelling), compound-derivations (samestellende afleiding) and handle abbreviations, acronyms (akronieme) and spelling patterns.",
        [`${G10}.TAA.12`], ["choice", "cloze", "true-false"],
        [e("compound_split", "Writes a compound as two words", "'tafel doek' instead of 'tafeldoek'."),
         e("derivation_wrong", "Wrong word-formation type or affix", "Confuses a samestelling with a samestellende afleiding (driewieler).")],
        "Afrikaans writes most compounds as ONE word; an afleiding adds an affix (on-, -loos); a samestellende afleiding combines and derives at once (driewieler); an akroniem is read as a word (SARS)."),
    ],
  },
];

const level11 = {
  id: 11,
  grade: 11,
  title: "Graad 11 — Afrikaans Eerste Addisionele Taal",
  description:
    "CAPS FET Phase Grade 11 FAL — revision-plus-extension of Grade 10, chained onto it (every Grade 11 skill builds on its Grade 10 counterpart). Learners (16-17) deepen the four exam papers (Vraestel 1 Taal in konteks, 2 Letterkunde, 3 Skryf, 4 Mondeling) with longer texts, sharper inference and evaluation, narrator/perspective, time & space, satire, argumentative structure, a wider transactional set, and grammar extended across all tenses. Both the questions AND the answer options are in Afrikaans (immersive FET delivery). Tap/choice/true-false/cloze/sequence delivery; deterministic grading; no free-text essay or spoken oral (Praat) in scope — Writing is delivered as tappable structure/planning/editing knowledge. Strands: Luister, Lees en kyk, Letterkunde, Skryf en aanbied, Taalstrukture en -konvensies.",
  tiers,
};

// ── splice into the file, preserving existing bytes ──────────────────────────
let text = readFileSync(TREE, "utf8");
if (text.includes('"id": 11,')) {
  console.error("Level 11 already present — aborting to avoid duplication.");
  process.exit(1);
}
// match the file's existing line endings (this repo uses CRLF).
const EOL = text.includes("\r\n") ? "\r\n" : "\n";
// indent the new level object to sit at array depth (4 spaces for `{`).
const body = JSON.stringify(level11, null, 2)
  .split("\n")
  .map((line) => "    " + line)
  .join(EOL);
// insert before the final `  ]<EOL>}` (close of levels array + root object).
const marker = `${EOL}  ]${EOL}}`;
const idx = text.lastIndexOf(marker);
if (idx === -1) throw new Error("could not find closing of levels array");
const before = text.slice(0, idx);
const after = text.slice(idx);
const out = before + "," + EOL + body + after;
writeFileSync(TREE, out);
console.log(`Inserted Level 11 with ${tiers.reduce((n, t) => n + t.atomic_skills.length, 0)} skills across ${tiers.length} tiers.`);
