#!/usr/bin/env node
// One-shot inserter: append Grade 10 (Level 10) to data/afrikaans-skill-tree.json.
// Preserves existing file bytes (targeted splice before the closing `  ]\n}`),
// so Levels 1–6 are untouched. Re-runnable: aborts if Level 10 already present.
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

const P = "AF.G10";

const tiers = [
  {
    id: `${P}.LUI`,
    title: "Luister (Listening comprehension)",
    description:
      "Receptive listening only (Praat / speaking-aloud is deferred — needs voice capture). af-ZA audio plays a longer Afrikaans text (announcement, interview, speech, news item); the learner taps/chooses. FET level adds viewpoint, attitude and critical listening for bias.",
    atomic_skills: [
      s(`${P}.LUI.01`, "Luister vir spesifieke inligting (listen for specific information)",
        "Listen to a spoken Afrikaans text (announcement, interview, weather/news) and pick out specific facts: names, times, numbers, places.",
        [], ["audio", "choice"],
        [e("key_detail_missed", "A key time / number / name is missed", "Audio says 'om 14:30'; learner picks '16:30'."),
         e("distractor_confused", "Picks a plausible detail that was not stated", "Audio names Kaapstad; learner picks Pretoria.")],
        "Tell learners the question before the audio replays so they listen with a purpose; note the key word as they hear it."),
      s(`${P}.LUI.02`, "Luister vir hoofgedagte en som op (main idea & summary)",
        "Listen to a longer Afrikaans text and identify the main idea and the best one-line summary, separating it from supporting detail.",
        [`${P}.LUI.01`], ["audio", "choice"],
        [e("detail_as_main", "Picks a supporting detail as the main idea", "Talk on recycling; learner picks 'glass can be melted' as the main point."),
         e("topic_too_broad", "Picks a too-broad option missing the focus", "Text about water-saving at home; learner picks 'the environment'.")],
        "After listening, say the text in ONE sentence. If a detail would not fit that sentence, it is support, not the main idea."),
      s(`${P}.LUI.03`, "Luister vir houding en standpunt (attitude & viewpoint)",
        "Listen to an Afrikaans opinion, interview or panel discussion and identify the speaker's viewpoint, attitude and the reasons they give.",
        [`${P}.LUI.02`], ["audio", "choice"],
        [e("viewpoint_reversed", "Identifies the opposite of the speaker's actual position", "Speaker is FOR free transport; learner says AGAINST."),
         e("tone_misread", "Misreads tone (e.g. sarcasm read as praise)", "Sarcastic 'wonderlik' read as genuine approval.")],
        "Listen for the opinion words ('ek dink', 'ek voel', 'na my mening') and the reason words ('want', 'omdat'); mark them separately."),
      s(`${P}.LUI.04`, "Kritiese luister: vooroordeel en partydigheid (critical listening: bias)",
        "Listen critically to a persuasive or one-sided Afrikaans text and detect bias, prejudice, generalisation and emotive/manipulative language.",
        [`${P}.LUI.03`], ["audio", "choice", "true-false"],
        [e("bias_unnoticed", "Treats a one-sided text as neutral fact", "Accepts 'almal weet...' as proof."),
         e("emotive_missed", "Does not flag emotive / loaded wording", "Misses 'skokkende', 'gevaarlike' as persuasion.")],
        "Ask: who benefits from this message, and who is left out? Loaded words and 'almal/altyd/nooit' are bias signals."),
    ],
  },
  {
    id: `${P}.LEE`,
    title: "Lees en kyk (Reading & viewing comprehension)",
    description:
      "A written or visual Afrikaans text is shown on screen (passage, advert, cartoon, graph); the learner answers tappable comprehension questions. Covers reading strategies, fact vs opinion, the writer's viewpoint, inference, visual literacy and critical language awareness — the Vraestel 1 (Taal in konteks) skill set.",
    atomic_skills: [
      s(`${P}.LEE.01`, "Leesstrategieë: vluglees, soeklees, aandagtige lees (skim, scan, close reading)",
        "Use the right reading strategy to locate explicit information in an Afrikaans passage and answer literal questions.",
        [], ["choice", "true-false"],
        [e("info_not_located", "Cannot find the stated answer in the text", "Answer is in line 2; learner guesses."),
         e("wrong_section", "Answers from the wrong part of the text", "Pulls a detail from the wrong paragraph.")],
        "Scan for the key word from the question, then read the whole sentence around it before choosing."),
      s(`${P}.LEE.02`, "Feit teenoor mening (fact vs opinion)",
        "Distinguish statements of fact from statements of opinion in an Afrikaans text.",
        [`${P}.LEE.01`], ["choice", "true-false"],
        [e("opinion_as_fact", "Labels an opinion as a fact", "'Dit is die beste fliek' read as fact."),
         e("fact_as_opinion", "Labels a verifiable fact as opinion", "'Water kook by 100°C' read as opinion.")],
        "A fact can be checked or proved; an opinion shows what someone thinks or feels (dink, voel, beste, mooiste)."),
      s(`${P}.LEE.03`, "Skrywer se houding en standpunt (writer's attitude & viewpoint)",
        "Identify and justify the writer's attitude, tone and viewpoint in an article, letter or media text.",
        [`${P}.LEE.02`], ["choice"],
        [e("attitude_misread", "Misreads the writer's attitude", "Critical article read as supportive."),
         e("no_evidence", "Cannot point to wording that shows the attitude", "Chooses an attitude with no textual support.")],
        "Find the words that carry feeling (positive or negative) and let them point you to the writer's stance."),
      s(`${P}.LEE.04`, "Afleidings en gevolgtrekkings (inference & conclusion)",
        "Read between the lines of an Afrikaans text to infer meaning and draw conclusions not stated directly.",
        [`${P}.LEE.03`], ["choice"],
        [e("literal_only", "Stays literal and misses the implied meaning", "Misses that 'sy het haar tas gegryp' implies she left in a hurry."),
         e("overreach", "Draws a conclusion the text does not support", "Adds information not implied.")],
        "Combine a clue from the text with what you already know: clue + knowledge = inference."),
      s(`${P}.LEE.05`, "Visuele tekste: advertensies, spotprente, grafieke (visual texts)",
        "Read visual Afrikaans texts — adverts, cartoons (spotprente), graphs and photos — for message, persuasion and humour.",
        [`${P}.LEE.01`], ["choice", "true-false"],
        [e("visual_literal", "Reads a cartoon/advert literally, missing the message", "Misses the irony in a spotprent."),
         e("persuasion_missed", "Does not see the persuasive technique", "Misses slogan / exaggeration / appeal.")],
        "In a visual text ask: what does the picture WANT me to think or do, and which trick (humour, exaggeration, slogan) does it use?"),
      s(`${P}.LEE.06`, "Kritiese taalbewustheid (critical language awareness)",
        "Detect bias, stereotyping, assumptions, manipulation, and denotation vs connotation in Afrikaans media texts; ask who benefits.",
        [`${P}.LEE.03`, `${P}.LEE.05`], ["choice", "true-false"],
        [e("bias_unnoticed", "Treats a slanted text as neutral", "Accepts a one-sided report as balanced."),
         e("connotation_missed", "Misses the connotation of a loaded word", "Reads 'goedkoop' only as 'low price', not 'inferior'.")],
        "Separate what a word literally says (denotasie) from the feeling it carries (konnotasie); ask who gains and who is left out."),
    ],
  },
  {
    id: `${P}.LET`,
    title: "Letterkunde (Literature)",
    description:
      "Transferable literary skills taught on short original / public-domain Afrikaans passages and poems (no prescribed set-works, so it works for any school's text list). Theme, character, plot, figures of speech, style/rhetoric and poem structure — the Vraestel 2 (Letterkunde) skill set.",
    atomic_skills: [
      s(`${P}.LET.01`, "Tema en boodskap (theme & message)",
        "Identify the central theme / motif and the message of a short Afrikaans story or poem.",
        [], ["choice"],
        [e("plot_as_theme", "Gives the plot instead of the underlying theme", "'A boy loses his dog' instead of 'loss / growing up'."),
         e("theme_too_narrow", "Picks a surface detail as the theme", "Names a single event, not the bigger idea.")],
        "The theme is the big idea the text is really about (e.g. courage, loss); the plot is only what happens."),
      s(`${P}.LET.02`, "Karakter en karakterisering (character & characterisation)",
        "Analyse characters: their traits, motives and how the writer reveals them (direct description vs actions/words).",
        [`${P}.LET.01`], ["choice", "true-false"],
        [e("trait_unsupported", "Names a trait the text does not support", "Calls a character 'brave' with no evidence."),
         e("action_motive_confused", "Confuses what a character does with why", "States the action, not the motive.")],
        "Judge a character by what they say and do, and how others react to them — not only by what the narrator tells you."),
      s(`${P}.LET.03`, "Intrige / plot (plot)",
        "Identify plot structure — exposition, conflict, climax, resolution — and order events in an Afrikaans story or drama.",
        [`${P}.LET.01`], ["choice", "sequence"],
        [e("climax_misplaced", "Misidentifies the climax / turning point", "Picks a minor event as the climax."),
         e("sequence_inversion", "Orders events incorrectly", "Places the resolution before the climax.")],
        "Track the story arc: setup → the problem builds → the highest tension (climax) → how it ends (resolution)."),
      s(`${P}.LET.04`, "Beeldspraak: vergelyking, metafoor, personifikasie (figures of speech)",
        "Identify and interpret simile (vergelyking), metaphor (metafoor) and personification (personifikasie) and link them to meaning.",
        [`${P}.LET.01`], ["choice", "true-false"],
        [e("simile_metaphor_confused", "Confuses simile and metaphor", "Calls 'so vinnig soos die wind' a metaphor."),
         e("literal_reading", "Reads the image literally", "'Die see brul' read as a real animal.")],
        "Vergelyking uses 'soos/asof'; metafoor says one thing IS another; personifikasie gives human action to a non-human thing."),
      s(`${P}.LET.05`, "Stylfigure en retoriese middele (style figures & rhetorical devices)",
        "Recognise irony, contrast, repetition, hyperbole, climax and euphemism, and explain their effect.",
        [`${P}.LET.04`], ["choice"],
        [e("irony_missed", "Misses irony / takes the words at face value", "Reads sarcasm as sincerity."),
         e("device_mislabelled", "Names the wrong device", "Calls repetition 'contrast'.")],
        "Ask what effect the writer wanted (emphasis, surprise, humour) and match it to the device that creates it."),
      s(`${P}.LET.06`, "Gedigbou: rym, strofe, innerlike en uiterlike bou (poem structure)",
        "Analyse a poem's outer form (stanzas, lines, rhyme scheme) and inner build (mood, turn) in a short Afrikaans poem.",
        [`${P}.LET.04`], ["choice", "true-false"],
        [e("rhyme_misread", "Mislabels the rhyme scheme", "Calls aabb an abab pattern."),
         e("form_content_split", "Cannot link form to meaning", "Notes a stanza break but not its effect.")],
        "Count lines/stanzas and mark line-end sounds for the rhyme scheme; then ask how a break or rhyme supports the mood."),
    ],
  },
  {
    id: `${P}.SKR`,
    title: "Skryf en aanbied (Writing knowledge)",
    description:
      "Writing taught as tappable knowledge (essay/transactional PRODUCTION is deferred — same playbook as the deferred handwriting/speaking in Gr1-6). Learners identify the correct text-type structure, order paragraphs, choose register and tone, fix errors and select key summary points — the planning and editing half of Vraestel 3 (Skryf).",
    atomic_skills: [
      s(`${P}.SKR.01`, "Briewe: vriendskaplik teenoor formeel (friendly vs formal letters)",
        "Identify the correct structure and conventions of friendly vs formal letters (address, date, salutation, closing) and choose the right format.",
        [], ["choice", "true-false"],
        [e("format_mixed", "Mixes friendly and formal conventions", "Uses 'Liewe Jan' to open a complaint to a newspaper."),
         e("element_missing", "Omits a required element", "Formal letter without sender + receiver address.")],
        "A formal letter needs two addresses + a formal salutation/closing; a friendly letter is one address and a warm greeting."),
      s(`${P}.SKR.02`, "Transaksionele tekssoorte herken (identify transactional text-types)",
        "Match purpose and key features to the right transactional text: e-pos, uitnodiging, advertensie, dagboek, koerantberig, agenda/notule, CV.",
        [`${P}.SKR.01`], ["choice"],
        [e("texttype_confused", "Chooses the wrong text-type for the purpose", "Picks 'dagboek' to advertise an event."),
         e("feature_misplaced", "Assigns a feature to the wrong text", "Puts a byline on a diary entry.")],
        "Match the PURPOSE (inform, invite, persuade, record) to the text-type, then check its signature features."),
      s(`${P}.SKR.03`, "Paragraafbou: kernsin en ondersteunende besonderhede (paragraph building)",
        "Build a coherent Afrikaans paragraph: identify the topic sentence (kernsin), order supporting detail logically and use process-writing steps.",
        [`${P}.SKR.01`], ["choice", "sequence"],
        [e("no_topic_sentence", "Cannot identify / place the topic sentence", "Buries the main point mid-paragraph."),
         e("order_illogical", "Orders sentences illogically", "Conclusion placed before the supporting reasons.")],
        "Lead with the kernsin (main idea), then the supporting detail, then a closing sentence — one idea per paragraph."),
      s(`${P}.SKR.04`, "Register, styl en toon (register, style & tone)",
        "Choose the appropriate register, style and tone (formal/informal) for the audience and purpose of a text.",
        [`${P}.SKR.01`], ["choice", "true-false"],
        [e("register_mismatch", "Picks the wrong register for the audience", "Slang in a letter to the principal."),
         e("tone_inappropriate", "Tone does not fit the purpose", "Jokey tone in a complaint.")],
        "Ask who will read it and why: a boss/newspaper needs formal language; a friend allows informal, warmer wording."),
      s(`${P}.SKR.05`, "Redigeer: vind en verbeter die taalfout (editing: find & fix the error)",
        "Proofread an Afrikaans sentence and identify or correct the language, spelling or punctuation error.",
        [], ["choice", "cloze", "true-false"],
        [e("error_unseen", "Does not spot the error", "Passes a wrong tense / spelling."),
         e("wrong_fix", "Applies an incorrect correction", "‘Corrects’ a right word.")],
        "Check one thing at a time: agreement, tense, spelling, then punctuation. Read the sentence aloud in your head."),
      s(`${P}.SKR.06`, "Opsomming: kies die kernpunte (summary: select key points)",
        "Select the main points for a summary of an Afrikaans text, dropping examples and repetition, within a point limit.",
        [`${P}.SKR.03`], ["choice", "true-false"],
        [e("detail_included", "Keeps a minor detail / example as a key point", "Lists an example instead of the main idea."),
         e("point_merged", "Misses that two 'points' are the same idea", "Counts a repeated idea twice.")],
        "Keep only points that change the meaning; drop examples, repetition and anything you could leave out and still understand the text."),
    ],
  },
  {
    id: `${P}.TAA`,
    title: "Taalstrukture en -konvensies (Language structures & conventions)",
    description:
      "The grammar core, taught explicitly and tappable: nouns, pronouns, adjectives & comparison, verbs & tenses, conjunctions, sentence types & negation, direct/indirect speech, active/passive, punctuation, semantics, idioms and word-formation/spelling. Reinforced from earlier phases and extended for FET; assessed inside Vraestel 1 (Taal in konteks).",
    atomic_skills: [
      s(`${P}.TAA.01`, "Selfstandige naamwoorde: meervoud, verkleining, geslag (nouns)",
        "Form and recognise noun plurals (-e, -s, -ers, deelteken, kappie), diminutives (-tjie/-jie/-ie/-etjie/-pie/-kie) and gender forms.",
        [], ["choice", "cloze", "true-false"],
        [e("plural_rule_wrong", "Applies the wrong plural rule", "'boom' → 'booms' instead of 'bome'."),
         e("diminutive_form_wrong", "Forms the diminutive incorrectly", "'hond' → 'hondtjie' instead of 'hondjie'.")],
        "Plurals follow patterns (often -e or -s, with deelteken/kappie when needed); diminutive endings depend on the last sound of the word."),
      s(`${P}.TAA.02`, "Voornaamwoorde (pronouns)",
        "Use personal, possessive, demonstrative and relative pronouns (ek/jy/hy; my/sy/hare/s'n; hierdie/daardie; wat/wie se).",
        [], ["choice", "cloze"],
        [e("possessive_wrong", "Wrong possessive form", "'die boek is myne' written as 'my' where 'myne' is needed."),
         e("relative_wrong", "Wrong relative pronoun", "'die man wat se' instead of 'die man wie se'.")],
        "Match the pronoun to its job: who is doing (persoonlik), whose it is (besitlik), pointing (aanwysend), or joining (betreklik)."),
      s(`${P}.TAA.03`, "Byvoeglike naamwoorde en trappe van vergelyking (adjectives & comparison)",
        "Use attributive vs predicative adjectives, inflection (verbuiging), and degrees of comparison (stellend/vergrotend/oortreffend).",
        [], ["choice", "cloze", "true-false"],
        [e("inflection_wrong", "Wrong adjective inflection", "'die lang man' written 'die lange man' incorrectly, or vice versa."),
         e("comparison_irregular", "Wrong comparative/superlative, esp. irregulars", "'goed → gooder' instead of 'beter / beste'.")],
        "Vergrotende trap usually adds -er, oortreffende -ste; learn the irregulars (goed-beter-beste, baie-meer-meeste)."),
      s(`${P}.TAA.04`, "Werkwoorde en tye: teenwoordige, verlede en toekomende tyd (verbs & tenses)",
        "Form present, past (het ge-) and future (sal) tense correctly, including with separable verbs.",
        [], ["choice", "cloze", "true-false"],
        [e("past_form_wrong", "Wrong past-tense formation", "'het gekom' written 'het kom' / 'gekomt'."),
         e("tense_mismatch", "Tense does not match the time marker", "'Gister speel ek' instead of 'Gister het ek gespeel'.")],
        "Verlede tyd = het + ge-werkwoord; toekomende = sal + werkwoord; let the time word (gister/môre) cue the tense."),
      s(`${P}.TAA.05`, "Voegwoorde: groep 1, 2 en 3 en woordorde (conjunctions & word order)",
        "Join clauses with group 1 (en, maar, want), group 2 (dus, daarom — word order changes) and group 3 (omdat, terwyl, dat — verb to the end).",
        [`${P}.TAA.04`], ["choice", "cloze"],
        [e("word_order_wrong", "Wrong word order after the conjunction", "After 'omdat' the verb is not sent to the end."),
         e("conjunction_group_confused", "Uses a conjunction from the wrong group", "Treats 'daarom' like 'en'.")],
        "Groep 1 keeps normal order; groep 2 swaps subject/verb (dus kom hy); groep 3 pushes the verb to the end (...omdat hy kom)."),
      s(`${P}.TAA.06`, "Sinsoorte, sinsbou en ontkenning (sentence types, building & negation)",
        "Identify sentence types (stel-, vraag-, bevel-, uitroepsin), build simple sentences and apply the double negative (nie ... nie; geen ... nie).",
        [`${P}.TAA.04`], ["choice", "cloze", "true-false"],
        [e("double_negative_wrong", "Drops the second 'nie'", "'Ek het nie geld' instead of 'Ek het nie geld nie'."),
         e("sentence_type_confused", "Mislabels the sentence type", "Calls a vraagsin a bevelsin.")],
        "Afrikaans usually needs a closing 'nie' at the end of a negative sentence; match the punctuation to the sentence type (.?!)."),
      s(`${P}.TAA.07`, "Direkte en indirekte rede (direct & indirect speech)",
        "Convert between direct and indirect speech: change punctuation, pronouns and adverbs of time/place.",
        [`${P}.TAA.04`], ["choice", "cloze"],
        [e("pronoun_not_shifted", "Pronouns not adjusted", "'Ek' kept instead of 'hy/sy' in reported speech."),
         e("time_marker_kept", "Time/place word not shifted", "'vandag' not changed to 'daardie dag'.")],
        "Going to indirect speech: drop the quotation marks, shift the pronouns, and move time/place words (nou→toe, hier→daar)."),
      s(`${P}.TAA.08`, "Bedrywende en lydende vorm (active & passive voice)",
        "Convert between active (bedrywend) and passive (lydend) voice across tenses, using word/is/was/sal ... word.",
        [`${P}.TAA.04`], ["choice", "cloze", "true-false"],
        [e("agent_misplaced", "Loses or misplaces the 'deur' agent", "Passive without 'deur die ...'."),
         e("aux_wrong", "Wrong passive auxiliary for the tense", "Present passive built with 'is' instead of 'word'.")],
        "Passive: object becomes the subject + word/is/was + ...ge-werkwoord + (deur die agent). Match the helper to the tense."),
      s(`${P}.TAA.09`, "Leestekens en punktuasie (punctuation)",
        "Apply punctuation correctly: komma, punt, vraagteken, dubbelpunt, kommapunt, aanhalingstekens, koppelteken, afkappingsteken.",
        [], ["choice", "cloze", "true-false"],
        [e("quotation_wrong", "Quotation punctuation incorrect", "Misplaces the comma/quotes in direct speech."),
         e("apostrophe_wrong", "Wrong apostrophe / deelteken use", "'die kind se boek' vs incorrect 's' use.")],
        "Each mark has a job: ? ends a question, : introduces, ; links two close sentences, “ ” frame the exact words spoken."),
      s(`${P}.TAA.10`, "Betekenisleer: sinonieme, antonieme, homofone (semantics)",
        "Work with synonyms, antonyms, homophones (ly/lei), homonyms and paronyms (one word vs another that looks/sounds close).",
        [], ["choice", "cloze", "true-false"],
        [e("homophone_confused", "Confuses homophones in spelling/meaning", "'ly' (suffer) vs 'lei' (lead)."),
         e("antonym_synonym_swapped", "Gives a synonym when an antonym is asked (or vice versa)", "Asked for the opposite, gives a similar word.")],
        "Sinoniem = same meaning, antoniem = opposite; homofone sound the same but differ in spelling and meaning — use the sentence to choose."),
      s(`${P}.TAA.11`, "Idiome en spreekwoorde (idioms & proverbs)",
        "Interpret common Afrikaans idioms, idiomatic expressions and proverbs by their figurative meaning, not literally.",
        [`${P}.TAA.10`], ["choice", "cloze", "true-false"],
        [e("literal_interpretation", "Reads the idiom literally", "'die aap uit die mou laat' read about a real monkey."),
         e("idiom_mismatched", "Picks an idiom that does not fit the situation", "Uses a 'luck' idiom for a 'secret revealed' context.")],
        "Picture what the words say, then ask what people really mean by it; learn idioms as whole units, not word-by-word."),
      s(`${P}.TAA.12`, "Woordvorming en spelling: afleiding, samestelling, afkortings (word-formation & spelling)",
        "Build and spell words through prefixes/suffixes (afleiding), compounds (samestelling), and handle abbreviations, acronyms and spelling patterns.",
        [], ["choice", "cloze", "true-false"],
        [e("compound_split", "Writes a compound as two words", "'tafel doek' instead of 'tafeldoek'."),
         e("affix_wrong", "Wrong prefix/suffix changes meaning", "'on-' vs 'wan-' confused (onreg vs wanorde).")],
        "Afrikaans writes most compounds as ONE word; a prefix/suffix changes meaning (on- = not, -loos = without) — build from the stem."),
    ],
  },
];

const level10 = {
  id: 10,
  grade: 10,
  title: "Graad 10 — Afrikaans Eerste Addisionele Taal",
  description:
    "CAPS FET Phase Grade 10 FAL. Older learners (15-16) working toward the four exam papers (Vraestel 1 Taal in konteks, 2 Letterkunde, 3 Skryf, 4 Mondeling). Both the questions AND the answer options are in Afrikaans (immersive FET delivery), unlike the English-scaffolded Foundation/Intermediate phases. Tap/choice/true-false/cloze/sequence delivery; deterministic grading; no free-text essay or spoken oral (Praat) in scope — Writing is delivered as tappable structure/planning/editing knowledge. Strands: Luister, Lees en kyk, Letterkunde, Skryf en aanbied, Taalstrukture en -konvensies.",
  tiers,
};

// ── splice into the file, preserving existing bytes ──────────────────────────
let text = readFileSync(TREE, "utf8");
if (text.includes('"id": 10,')) {
  console.error("Level 10 already present — aborting to avoid duplication.");
  process.exit(1);
}
// match the file's existing line endings (this repo uses CRLF).
const EOL = text.includes("\r\n") ? "\r\n" : "\n";
// indent the new level object to sit at array depth (4 spaces for `{`).
const body = JSON.stringify(level10, null, 2)
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
console.log(`Inserted Level 10 with ${tiers.reduce((n, t) => n + t.atomic_skills.length, 0)} skills across ${tiers.length} tiers.`);
