// ─── Creative Arts SP — top-up supplement ────────────────────────────────────
//
// One extra authored item per pool that came in at 19, bringing every pool to
// the 20-item target. The generator (build-creative-arts-sp.mjs) CONCATENATES
// pools by skill id across modules and loads this file last, so each item here
// is appended to its pool. Same tap-only mechanics; no free text.

const TF = (question, expected, memo, err, difficulty = 1) => ({
  question, input_type: "true-false", options: ["True", "False"], expected, memo, error_signals: [err], difficulty,
});
const MC = (question, options, expected, memo, err, difficulty = 1) => ({
  question, input_type: "choice", options, expected, memo, error_signals: [err], difficulty,
});

const SUPP = {
  // ── Grade 7 ──────────────────────────────────────────────────────────────
  "CA.G7.MUE.A1": [
    MC("'Texture' contrast in music is heard when the music changes from…",
      ["one voice to many voices", "the same single note", "loud to louder only", "no change at all"], "one voice to many voices",
      "A change from a thin to a thick texture (one voice to many) is a texture contrast.", "ERR_CA_G7MUEA1_SUP", 2),
  ],
  "CA.G7.MUE.A2": [
    MC("A brass instrument you might hear in a band is the…",
      ["trumpet", "violin", "drum", "guitar"], "trumpet",
      "The trumpet is a brass wind instrument common in bands.", "ERR_CA_G7MUEA2_SUP", 1),
  ],
  "CA.G7.VAE.A2": [
    TF("Orange is a secondary colour made from red and yellow.", "True",
      "Red mixed with yellow makes the secondary colour orange.", "ERR_CA_G7VAEA2_SUP", 1),
  ],
  "CA.G7.VAE.A3": [
    MC("Repeating the same motif in regular rows is an example of which principle?",
      ["Pattern", "Emphasis", "Proportion", "Tone"], "Pattern",
      "Regular repetition of a motif creates pattern.", "ERR_CA_G7VAEA3_SUP", 1),
  ],
  "CA.G7.VAM.A1": [
    MC("Layering crossing lines to darken an area in a drawing is called…",
      ["cross-hatching", "colour-mixing", "modelling", "framing"], "cross-hatching",
      "Cross-hatching builds tone and texture with crossing lines.", "ERR_CA_G7VAMA1_SUP", 2),
  ],
  "CA.G7.VAM.A2": [
    TF("A clay sculpture you can view from every side is a 3D artwork.", "True",
      "A solid form with depth, viewable from all sides, is 3D.", "ERR_CA_G7VAMA2_SUP", 1),
  ],
  "CA.G7.VAL.A1": [
    MC("An arrangement of fruit, a jug and a cloth is which kind of subject?",
      ["A still life", "A portrait", "A landscape", "A pattern"], "A still life",
      "Arranged inanimate objects make a still life.", "ERR_CA_G7VALA1_SUP", 1),
  ],

  // ── Grade 8 ──────────────────────────────────────────────────────────────
  "CA.G8.MUL.A1": [
    MC("In 4/4 time, two minims fill…",
      ["one bar", "two bars", "half a bar", "four bars"], "one bar",
      "Two minims = four beats = one full bar of 4/4.", "ERR_CA_G8MULA1_SUP", 2),
  ],
  "CA.G8.MUL.A2": [
    TF("Every major scale uses the pattern tone-tone-semitone-tone-tone-tone-semitone.", "True",
      "All major scales share the same tone/semitone pattern from their starting note.", "ERR_CA_G8MULA2_SUP", 2),
  ],
  "CA.G8.MUL.A3": [
    MC("If a piece is in F major, the note B is played as…",
      ["B flat", "B natural", "B sharp", "B double-flat"], "B flat",
      "F major flattens every B to B flat.", "ERR_CA_G8MULA3_SUP", 2),
  ],
  "CA.G8.MUE.A1": [
    MC("Which term tells a player to gradually slow down?",
      ["Ritardando", "Presto", "Legato", "Forte"], "Ritardando",
      "Ritardando means gradually getting slower.", "ERR_CA_G8MUEA1_SUP", 1),
  ],
  "CA.G8.MUE.A2": [
    TF("A repeated chorus in a pop song is an example of repetition.", "True",
      "A returning chorus is a clear use of repetition.", "ERR_CA_G8MUEA2_SUP", 1),
  ],
  "CA.G8.MUE.A3": [
    MC("A flute, which is blown, belongs to which sound family?",
      ["Aerophone", "Chordophone", "Membranophone", "Idiophone"], "Aerophone",
      "Blown instruments that vibrate air are aerophones.", "ERR_CA_G8MUEA3_SUP", 2),
  ],
  "CA.G8.MUP.A1": [
    MC("A short musical idea that a composer develops is called a…",
      ["motif", "frame", "price", "title"], "motif",
      "A motif is a short, developable musical idea.", "ERR_CA_G8MUPA1_SUP", 2),
  ],
  "CA.G8.VAE.A1": [
    MC("Blue, blue-green and green together make which colour scheme?",
      ["Analogous", "Complementary", "Primary", "Monochrome"], "Analogous",
      "Neighbouring colours on the wheel form an analogous scheme.", "ERR_CA_G8VAEA1_SUP", 2),
  ],
  "CA.G8.VAE.A2": [
    MC("Repeating shapes to lead the viewer's eye across a work creates…",
      ["rhythm and movement", "silence", "a price", "a frame"], "rhythm and movement",
      "Repetition that guides the eye creates visual rhythm and movement.", "ERR_CA_G8VAEA2_SUP", 2),
  ],
  "CA.G8.VAM.A1": [
    MC("Sticking down cut or torn paper and materials makes a…",
      ["collage", "sculpture", "melody", "frame"], "collage",
      "Assembling stuck-down pieces is a collage.", "ERR_CA_G8VAMA1_SUP", 1),
  ],
  "CA.G8.VAM.A2": [
    TF("Using recyclable materials in a sculpture shows concern for the environment.", "True",
      "Reusing recyclables reduces waste and shows environmental care.", "ERR_CA_G8VAMA2_SUP", 1),
  ],
  "CA.G8.VAL.A1": [
    MC("A jug that is both useful and well-designed is a…",
      ["functional container", "still life", "portrait", "melody"], "functional container",
      "A useful, well-designed object like a jug is a functional container.", "ERR_CA_G8VALA1_SUP", 1),
  ],
  "CA.G8.VAL.A2": [
    MC("Rough drawings made to plan a final artwork are called…",
      ["preliminary sketches", "the final piece", "a price list", "a frame"], "preliminary sketches",
      "Preliminary sketches are rough planning drawings made before the final work.", "ERR_CA_G8VALA2_SUP", 1),
  ],

  // ── Grade 9 ──────────────────────────────────────────────────────────────
  "CA.G9.MUL.A1": [
    MC("The treble and bass clefs written together form the…",
      ["grand staff", "single line", "drum kit", "rest"], "grand staff",
      "The two clefs joined make the grand staff, used for piano.", "ERR_CA_G9MULA1_SUP", 2),
  ],
  "CA.G9.MUL.A2": [
    MC("A key signature with one sharp (F#) usually means the key is…",
      ["G major", "C major", "F major", "D major"], "G major",
      "One sharp, F#, points to G major.", "ERR_CA_G9MULA2_SUP", 2),
  ],
  "CA.G9.MUL.A3": [
    TF("Ledger lines let you write notes that are too high or too low for the staff.", "True",
      "Ledger lines extend the staff for notes beyond its five lines.", "ERR_CA_G9MULA3_SUP", 1),
  ],
  "CA.G9.MUL.A4": [
    MC("Counting C-D-E, the interval from C up to E is a…",
      ["3rd", "2nd", "4th", "5th"], "3rd",
      "Three note names (C, D, E) make a 3rd.", "ERR_CA_G9MULA4_SUP", 2),
  ],
  "CA.G9.MUL.A5": [
    MC("The three notes of a C major triad are…",
      ["C, E, G", "C, D, E", "C, F, A", "C, G, C"], "C, E, G",
      "A C major triad is the root C, the 3rd E and the 5th G.", "ERR_CA_G9MULA5_SUP", 2),
  ],
  "CA.G9.MUL.A6": [
    TF("Writing a scale rhythmically means giving its notes chosen note values.", "True",
      "A rhythmic scale combines the scale's pitches with note values.", "ERR_CA_G9MULA6_SUP", 2),
  ],
  "CA.G9.MUE.A1": [
    MC("The cello belongs to which orchestral family?",
      ["Strings", "Woodwind", "Brass", "Percussion"], "Strings",
      "The cello is a bowed string instrument.", "ERR_CA_G9MUEA1_SUP", 1),
  ],
  "CA.G9.MUE.A2": [
    MC("Kwaito is a music style that began in…",
      ["South Africa", "Jamaica", "America", "India"], "South Africa",
      "Kwaito grew in South Africa in the 1990s.", "ERR_CA_G9MUEA2_SUP", 1),
  ],
  "CA.G9.MUE.A3": [
    MC("A stage work whose story is told mostly through singing is an…",
      ["opera", "essay", "advert", "anthem"], "opera",
      "Opera carries its story mainly through singing.", "ERR_CA_G9MUEA3_SUP", 1),
  ],
  "CA.G9.MUP.A1": [
    MC("A short, catchy tune written to advertise a product is a…",
      ["jingle", "scale", "interval", "anthem"], "jingle",
      "An advertising tune is a jingle — short and memorable.", "ERR_CA_G9MUPA1_SUP", 1),
  ],
  "CA.G9.VAE.A1": [
    MC("For the STRONGEST contrast in a poster, an artist would choose…",
      ["complementary colours", "analogous colours", "one pale tint", "no colour"], "complementary colours",
      "Opposite (complementary) colours give the strongest contrast.", "ERR_CA_G9VAEA1_SUP", 2),
  ],
  "CA.G9.VAE.A2": [
    MC("The design principle that creates a focal point is…",
      ["emphasis", "pattern", "texture", "proportion"], "emphasis",
      "Emphasis draws the eye to a focal point.", "ERR_CA_G9VAEA2_SUP", 1),
  ],
  "CA.G9.VAM.A1": [
    TF("Etching is a 2D technique, while clay modelling is a 3D technique.", "True",
      "Etching works on a flat surface (2D); modelling makes a solid form (3D).", "ERR_CA_G9VAMA1_SUP", 1),
  ],
  "CA.G9.VAL.A1": [
    MC("A mural protesting pollution is an example of…",
      ["social commentary", "a still life", "a portrait", "a colour wheel"], "social commentary",
      "A protest mural comments on a social or environmental issue.", "ERR_CA_G9VALA1_SUP", 2),
  ],
  "CA.G9.VAL.A2": [
    MC("An artist who uses their work to raise issues about society is acting as a…",
      ["social commentator", "referee", "framer", "seller"], "social commentator",
      "Raising societal issues through art is the role of a social commentator.", "ERR_CA_G9VALA2_SUP", 2),
  ],
};

export default SUPP;
