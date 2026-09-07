// ─── Creative Arts SP — per-topic "think of it like this" analogies ─────────
//
// One everyday analogy per topic (43: Music + Visual Arts, Grades 7–9), keyed
// by skill/topic id. Feeds the wrong-answer card's example slot via
// FeedbackExplanation's `exampleOverride`. Register: Grade 7–9, concrete,
// everyday South African reference points. "why" = the question's memo,
// "how" = the topic's recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "CA.G7.MUL.A1":
    "Note values are like coins adding up: a semibreve is worth four beats, a crotchet one, a quaver a half. Every bar has to total the same amount.",
  "CA.G7.MUL.A2":
    "A clef is like the label on a tap: the same pipe (the staff) carries different notes depending on the label. Treble marks the higher notes, bass the lower ones.",
  "CA.G7.MUL.A3":
    "Metre is like walking: in 4/4 you count 'ONE two three four', stepping hardest on ONE — the way your left foot lands first each time.",
  "CA.G7.MUL.A4":
    "Tonic sol-fa is like naming the rungs of a ladder — doh, re, mi — so you can call out where to put your foot instead of guessing the height.",
  "CA.G7.MUE.A1":
    "Describing music is like describing a taxi ride: how fast it went (tempo), how loud the hooter was (dynamics), and how it made you feel (mood).",
  "CA.G7.MUE.A2":
    "Picking instruments out of a song by ear is like knowing your family's voices from the next room — each drum, guitar or flute has a sound you learn to recognise.",
  "CA.G7.MUP.A1":
    "A riff or ostinato is like the repeated line in a struggle song — one short pattern everyone keeps while other parts change over the top. Question-and-answer is one phrase calling, another replying.",
  "CA.G7.MUP.A2":
    "A round is like people joining a queue one after another and all doing the same steps — the same tune sung by groups starting at different times. Body percussion is your hands and feet as the drum.",
  "CA.G7.VAE.A1":
    "The art elements — line, shape, tone, texture, colour — are like the ingredients in a pot of food. Every artwork is made from them, just mixed in different amounts.",
  "CA.G7.VAE.A2":
    "Complementary colours sit opposite on the colour wheel and make each other pop, like a yellow shirt against a green field. Monochromatic stays with one colour, light to dark.",
  "CA.G7.VAE.A3":
    "Design principles are the rules for arranging the elements, like setting a table: balance so it's not all on one side, emphasis so the main dish stands out, pattern so it looks tidy.",
  "CA.G7.VAM.A1":
    "Different drawing media make different marks, like different pens on a form — a soft pencil smudges soft shadow, a hard one scratches thin lines, charcoal blocks in dark fast.",
  "CA.G7.VAM.A2":
    "Working in 3D is like building a wire car: you think about it from every side, join it neatly so it holds its shape, and don't waste or litter your materials.",
  "CA.G7.VAL.A1":
    "Analysing an artwork is like giving a match report: first describe what's actually there using the art elements, then say what the symbols might mean.",
  "CA.G7.VAL.A2":
    "Researching an artist is like doing a school project on a soccer club — you gather pictures, facts and history before you can say anything useful about them.",
  "CA.G8.MUL.A1":
    "The top number of a time signature is like how many people must fit on one bench: 4/4 fits four crotchet beats a bar; 6/8 packs six quavers, felt in two groups of three.",
  "CA.G8.MUL.A2":
    "A major scale is a fixed staircase of steps — tone, tone, semitone, tone, tone, tone, semitone. Start on any note, follow that exact pattern, and it always sounds 'major'.",
  "CA.G8.MUL.A3":
    "A key signature is like a sign at the classroom door: 'in this room, every F is sharp'. You apply it to every F in the piece without it being marked again.",
  "CA.G8.MUE.A1":
    "Music terms are like road signs in another language: 'presto' means go fast (tempo), 'staccato' means short sharp taps (how you play the notes). Learn the signs and you can read any score.",
  "CA.G8.MUE.A2":
    "Gospel, kwaito and rock all use the same elements — beat, dynamics, repetition, contrast — the way different dishes all use salt, heat and time, just in their own measures.",
  "CA.G8.MUE.A3":
    "Instruments group by how they make sound: strings are plucked or bowed (chordophones), drums are struck skins (membranophones), a shaker is its own body vibrating (idiophone), a whistle needs blown air (aerophone).",
  "CA.G8.MUP.A1":
    "Composing with structure is like writing a proper letter — greeting, body, sign-off — not just random words. Your piece needs a beginning, middle and end too.",
  "CA.G8.VAE.A1":
    "Analogous colours are neighbours on the colour wheel — blue, blue-green, green — like the shades of one tree from shadow to sunlight. They blend calmly.",
  "CA.G8.VAE.A2":
    "The design principles are like arranging a shop window: the eye-catching item goes centre (emphasis), heavy and light are spread evenly (balance), repeats keep it neat (pattern).",
  "CA.G8.VAM.A1":
    "Trying different media and sizes is like cooking the same meat three ways — braai, stew, fry. The idea is the same; the treatment changes what it says.",
  "CA.G8.VAM.A2":
    "More complex 3D work is like moving from a wire car to a working wire bicycle — more parts and planning, but the same care with craftsmanship, safety and reusing materials.",
  "CA.G8.VAL.A1":
    "Reading design means asking two things about an object: how does it look, and how does it work? A takkie's stripes are style; its grip is function. Fashion design blends both.",
  "CA.G8.VAL.A2":
    "Planning an art project is like planning a trip: you gather references, make rough sketches and pack your materials before you set off on the final piece.",
  "CA.G9.MUL.A1":
    "The same scale in treble and bass clef is like the same phone number written by two people — the digits are identical, they just sit differently on the page.",
  "CA.G9.MUL.A2":
    "Key signatures are like uniform rules per grade: C major wears no sharps or flats, G major always sharpens F, D major sharpens F and C. Learn the list and you know the key at a glance.",
  "CA.G9.MUL.A3":
    "Ledger lines are like extra bricks added under or over a wall so it reaches higher or lower — short lines that extend the staff for notes that don't fit on it.",
  "CA.G9.MUL.A4":
    "Counting an interval is like counting fence posts, not the gaps: from C up to G you count C-D-E-F-G, so it's a 5th. Always include both the note you start on and the one you land on.",
  "CA.G9.MUL.A5":
    "A triad is like stacking three tyres with one letter skipped between each — root, skip a letter, next note, skip a letter, top note. C-E-G is a triad.",
  "CA.G9.MUL.A6":
    "Writing a scale rhythmically is like reciting the alphabet to a clap pattern — the right letters (pitches) in the right order, fitted to note values that fill the bar.",
  "CA.G9.MUE.A1":
    "The orchestra sorts instruments the way a hardware shop sorts stock — strings, woodwind, brass, percussion — each shelf grouped by how the sound is made, not by size.",
  "CA.G9.MUE.A2":
    "Every style has a fingerprint: kwaito is slowed-down house with a South African groove; reggae leans on the off-beat 'chop'. Learn the fingerprint and you name the style in a few bars.",
  "CA.G9.MUE.A3":
    "A musical or opera tells its story through singing instead of speaking. Our national anthem stitches five languages and two older melodies into one song.",
  "CA.G9.MUP.A1":
    "Completing a musical phrase is like finishing someone's sentence so it lands — the 'answer' balances the 'question'. A jingle is that in miniature: a short, sticky advert tune.",
  "CA.G9.VAE.A1":
    "Analogous colours sit side by side on the wheel and agree with each other, like family members at a table. The art elements stay the bricks; colour harmony is how you lay them.",
  "CA.G9.VAE.A2":
    "By Grade 9, using the design principles is like being your own coach — you plan a piece with balance, contrast and emphasis, then step back and critique your own work against them.",
  "CA.G9.VAM.A1":
    "Personalised making is like cooking a family recipe your own way — you pick the materials and techniques that carry your idea, and you still make it neatly and safely.",
  "CA.G9.VAL.A1":
    "A poster or mural can carry a message as well as a picture, like a slogan painted on a taxi — the image says one thing, the words and symbols push another.",
  "CA.G9.VAL.A2":
    "A social-commentator artist is like a newspaper cartoonist — the drawing entertains, but it's really pointing at something in society. By Grade 9 you plan such projects yourself.",
};
