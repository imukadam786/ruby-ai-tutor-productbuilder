// ─── Error-code → plain-language feedback map ────────────────────────────────
//
// Every maths question in the bank carries one or more `error_signals` codes
// (e.g. "ERR_MULT_ADD") that name the misconception the question is designed to
// catch. Today those codes never reach the student. This map turns each code
// into the four reusable pieces of a clear wrong-answer explanation:
//
//   why     — one plain sentence naming the misconception
//   how     — the corrective step the student should take
//   example — an everyday-life example (the "layman's example")
//
// Because these attach to the ERROR CODE (not the question), a few dozen entries
// cover every question that shares that misconception — thousands of questions,
// zero AI calls at answer time. Margin is unaffected.
//
// PROOF SCOPE: Grade 6 maths. The `example` text below is a FIRST DRAFT for the
// head of ed to review and edit. Per-grade example variants are a later layer.

export interface ErrorExplanation {
  /** Plain-language name of the misconception (replaces the jargon error label) */
  label: string;
  /**
   * WHAT went wrong — a plain, behavioural sentence naming the slip the student
   * likely made ("You added the numbers instead of multiplying them"). Optional
   * on the sharp per-code entries: the resolver backfills it from the code's
   * misconception family so every resolved explanation carries all five parts.
   */
  what?: string;
  /**
   * WHY it happened — one sentence. Optional on the sharp per-code entries:
   * the resolver backfills it from the code's misconception family, so every
   * resolved explanation carries it.
   */
  why?: string;
  /**
   * HOW to fix it — the corrective step. Optional on the sharp per-code entries
   * (backfilled from the family); also skipped by the card when the question
   * ships its own worked steps.
   */
  how?: string;
  /** Layman's example — everyday analogy. DRAFT, pending head-of-ed review. */
  example: string;
  /**
   * WHERE you'll see this — where the idea shows up in exams or everyday life,
   * so the fix feels worth learning. Optional on sharp entries; backfilled from
   * the family by the resolver.
   */
  where?: string;
}

export const ERROR_EXPLANATIONS: Record<string, ErrorExplanation> = {
  // ── Multiplication & groups ───────────────────────────────────────────────
  ERR_MULT_ADD: {
    label: "Added instead of multiplied",
    why: "You added the two numbers together, but \"groups of\" means you need to multiply.",
    how: "When you see equal groups, multiply the number of groups by how many are in each group.",
    example: "3 bags with 4 apples in each isn't 3 + 4 = 7 apples. It's 4 apples counted three times: 4 + 4 + 4 = 12. \"Of\" almost always means multiply.",
  },
  ERR_ADD_NOT_MULT: {
    label: "Added instead of multiplied",
    why: "You added when the situation was really about repeated equal groups, which is multiplication.",
    how: "Spot the equal groups, then multiply rather than add them one by one.",
    example: "5 rows of 6 chairs is 5 × 6 = 30 chairs, not 5 + 6 = 11. Adding only works if the groups are different sizes.",
  },
  ERR_FIELD_SWAP: {
    label: "Mixed up which number goes where",
    why: "The right numbers were used, but in the wrong boxes — the groups and the amount-in-each got swapped.",
    how: "Read slowly: which number is how many groups, and which is how many in each group? Put each in its own box.",
    example: "\"3 bags of 4 apples\" — there are 3 groups, 4 in each. If you write 4 groups of 3 you've flipped the story, even though the total works out the same.",
  },
  ERR_TIMES_TABLE: {
    label: "Times-table slip",
    why: "The method was right — the multiplication fact itself came out wrong.",
    how: "Double-check the times-table fact on its own, or build it up by adding one more group.",
    example: "If 7 × 8 felt shaky, build it: 7 × 8 is one more 7 than 7 × 7 (49), so 49 + 7 = 56.",
  },
  ERR_MULT_OFF: {
    label: "Multiplication came out slightly off",
    why: "The right operation was used, but the product is a little too high or too low.",
    how: "Re-do the multiplication carefully, or estimate first to see roughly how big the answer should be.",
    example: "18 × 5 should be near 20 × 5 = 100, so an answer of 45 is clearly too small — closer to 90.",
  },

  // ── Division & sharing ────────────────────────────────────────────────────
  ERR_DIV_SHARE: {
    label: "Sharing went wrong",
    why: "Division shares a total into equal parts, and the parts here came out unequal.",
    how: "Split the total evenly — every group must get the same amount.",
    example: "12 sweets shared between 4 friends is 12 ÷ 4 = 3 each. If one friend has 4 and another has 2, it wasn't shared fairly yet.",
  },
  ERR_DIV_OFF: {
    label: "Division came out slightly off",
    why: "The right operation was used, but the answer is a bit too big or too small.",
    how: "Check by multiplying back: your answer times the divisor should give the original total.",
    example: "20 ÷ 4 = 5. Check it: 5 × 4 = 20. If multiplying back doesn't return the total, the answer needs adjusting.",
  },
  ERR_DIV_MULT: {
    label: "Divided when you should multiply (or the reverse)",
    why: "The opposite operation was used — division and multiplication got swapped.",
    how: "Ask whether the total is being shared out (divide) or built up from equal groups (multiply).",
    example: "Splitting 24 pencils into 6 pots is sharing, so divide: 24 ÷ 6 = 4. Building 6 pots of 4 is the reverse: 6 × 4 = 24.",
  },
  ERR_DIV_INVERSE: {
    label: "Divided the wrong way round",
    why: "The two numbers were divided in the wrong order.",
    how: "The total being shared goes first; the number of groups goes second.",
    example: "20 marbles into 4 bags is 20 ÷ 4 = 5, not 4 ÷ 20. The big number (the total) is the one being split up.",
  },
  ERR_REMAINDER: {
    label: "Forgot the leftover",
    why: "The sharing didn't come out exactly even, and the leftover part was dropped.",
    how: "After sharing as evenly as you can, note how many are left over — that's the remainder.",
    example: "13 sweets between 4 friends: each gets 3 (that's 12), and 1 sweet is left over. The leftover 1 still counts.",
  },

  // ── Place value ───────────────────────────────────────────────────────────
  ERR_PLACE_VALUE: {
    label: "Place value mixed up",
    why: "A digit's value depends on its column, and the tens and ones got read the wrong way.",
    how: "Name each column: the left digit is tens, the right digit is ones.",
    example: "In 73, the 7 isn't just \"seven\" — it means 7 tens, which is 70. So 73 is 70 + 3.",
  },
  ERR_FACE_VALUE: {
    label: "Used the digit, not its value",
    why: "You read the digit by itself instead of what it's worth in its column.",
    how: "Multiply the digit by its column: tens column means ×10, hundreds means ×100.",
    example: "The 4 in 47 looks like \"four\", but in the tens column it's worth 40. Its face is 4; its value is 40.",
  },
  ERR_DIGIT_SWAP: {
    label: "Digits swapped around",
    why: "The right digits were used but written in the wrong order.",
    how: "Read the number aloud and check each digit sits in the correct column before writing it.",
    example: "Writing 36 when you meant 63 swaps the tens and ones — same digits, but a number that's almost double.",
  },
  ERR_REGROUP: {
    label: "Carrying or borrowing slipped",
    why: "When a column went over 9 (or needed to borrow), the regrouping wasn't carried across.",
    how: "When a column reaches ten, carry one into the next column; when it's too small, borrow ten from the next column.",
    example: "27 + 5: the ones make 12, so write 2 and carry the ten over — the answer is 32, not 22.",
  },

  // ── Addition & subtraction ────────────────────────────────────────────────
  ERR_SUB_ADD: {
    label: "Subtracted when you should add (or the reverse)",
    why: "The opposite operation was used — a take-away was treated as a join, or vice versa.",
    how: "Decide whether the total is growing (add) or shrinking (subtract) before you calculate.",
    example: "If you had 10 and spent 4, you have less, so subtract: 10 − 4 = 6. If you earned 4 more, you'd add.",
  },
  ERR_WRONG_OP: {
    label: "Wrong operation chosen",
    why: "The numbers were right, but the wrong operation (+ − × ÷) was used.",
    how: "Re-read the question and match the action to the operation before calculating.",
    example: "\"How many altogether?\" usually means add; \"how many left?\" usually means subtract. The words tell you the operation.",
  },
  ERR_WRONG_SUM: {
    label: "Addition came out wrong",
    why: "The right operation was used, but the total is off.",
    how: "Add again, lining up the columns, or add the easy parts first.",
    example: "28 + 7: jump to the next ten first — 28 + 2 = 30, then add the other 5 = 35. Easier than rushing it.",
  },
  ERR_ADD_NEAR_MISS: {
    label: "Addition off by a little",
    why: "Your total is very close but slightly out — usually a small slip in one column.",
    how: "Check the ones column first, then the tens; a near-miss is almost always one column.",
    example: "47 + 26: if you got 73 instead of 73… check the ones: 7 + 6 = 13, so 3 down and carry 1. Small slips hide in the carry.",
  },
  ERR_MAKE_TEN: {
    label: "Missed an easier ten",
    why: "The adding was harder than it needed to be because you didn't bridge through a ten.",
    how: "Top one number up to the nearest ten first, then add what's left.",
    example: "9 + 5 is easier as 10 + 4: take 1 from the 5 to make the 9 into 10, then add the leftover 4 = 14.",
  },
  ERR_OP_ERROR: {
    label: "Calculation slip",
    why: "The method was right — a step in the arithmetic just came out wrong.",
    how: "Re-do the working one line at a time and check each step before moving on.",
    example: "Like re-counting your change at the shop: the method's fine, you just want to make sure each step adds up.",
  },

  // ── Sequences & patterns ──────────────────────────────────────────────────
  ERR_SEQ_RULE: {
    label: "Pattern rule misread",
    why: "The rule that turns one number into the next was read wrong.",
    how: "Find the jump between two numbers you can see, then apply that same jump.",
    example: "2, 4, 6, … each step adds 2, so the next is 8. Work out the gap first, then keep repeating it.",
  },
  ERR_SEQ_DIR: {
    label: "Counted the wrong direction",
    why: "The sequence was going down (or up) and it was continued the other way.",
    how: "Check whether the numbers are getting bigger or smaller, then keep going that way.",
    example: "10, 9, 8, … is counting back, so the next is 7, not 9. Notice the direction before you add the step.",
  },
  ERR_OFF_BY_ONE: {
    label: "Off by one",
    why: "The answer is just one out — usually from counting the start or end point twice (or missing it).",
    how: "Count carefully, and decide whether the first item should be counted as one or as zero.",
    example: "Fence posts and gaps: 5 posts in a row have only 4 gaps between them. It's easy to be one out.",
  },
  ERR_COUNT_OFF_BY_ONE: {
    label: "Counted one too many or too few",
    why: "The count landed one out, often by double-counting the first or last object.",
    how: "Point to each object once as you count, and don't start counting at the object you already counted.",
    example: "Counting stairs as you climb: if you count the floor you're standing on as \"one\", you'll end up one too high.",
  },
  ERR_COUNT_SKIP: {
    label: "Skipped or double-counted",
    why: "An object was counted twice or missed, so the total drifted.",
    how: "Touch or cross off each object as you count it so none is repeated or skipped.",
    example: "Counting a bowl of grapes: it's easy to miss one or count one twice — moving each to a new pile keeps you honest.",
  },
  ERR_SKIP_COUNT: {
    label: "Skip-counting slipped",
    why: "When counting in steps (2s, 5s, 10s), one of the jumps was the wrong size.",
    how: "Keep every jump the same size, and say the numbers aloud to hear a wrong one.",
    example: "Counting in 5s: 5, 10, 15, 20 — every jump is 5. If you suddenly say 18, that jump was only 3.",
  },
  ERR_PATTERN: {
    label: "Pattern misread",
    why: "The repeating part of the pattern wasn't spotted correctly.",
    how: "Find the chunk that repeats, then continue it exactly.",
    example: "Red, blue, red, blue… the repeating chunk is \"red, blue\", so after blue comes red again.",
  },

  // ── Fractions ─────────────────────────────────────────────────────────────
  ERR_PART_WHOLE: {
    label: "Part and whole mixed up",
    why: "The top and bottom of the fraction got swapped — which is the part and which is the whole.",
    how: "The bottom number is how many equal pieces the whole is cut into; the top is how many you have.",
    example: "A pizza cut into 4 slices where you eat 1 is 1/4 — 1 piece out of 4. Writing 4/1 would mean four whole pizzas.",
  },
  ERR_EQUIV_MULT: {
    label: "Equivalent fraction slip",
    why: "To rename a fraction you must do the same to the top and the bottom — only one was changed.",
    how: "Whatever you multiply the bottom by, multiply the top by the same number.",
    example: "1/2 = 2/4: you doubled the bottom (2→4), so you must double the top (1→2). Changing only one breaks the value.",
  },
  ERR_DENOM_ADD: {
    label: "Added the bottoms",
    why: "When adding fractions, the bottom numbers were added — but the bottom tells you the size of the pieces, which doesn't change.",
    how: "With the same-size pieces, add only the tops and keep the bottom the same.",
    example: "1/5 + 2/5 = 3/5, not 3/10. The pieces are still fifths — you just have three of them now.",
  },
  ERR_COMMON_DENOM: {
    label: "Pieces weren't the same size",
    why: "The fractions were added before making the pieces the same size.",
    how: "Rename both fractions so they share the same bottom number, then add the tops.",
    example: "1/2 + 1/4: halves and quarters are different sizes. Turn 1/2 into 2/4 first, then 2/4 + 1/4 = 3/4.",
  },
  ERR_FRAC_WHOLE_MULT: {
    label: "Whole number and fraction muddled",
    why: "A fraction of an amount was handled as if the whole number and fraction were separate.",
    how: "To find a fraction of an amount, divide by the bottom, then multiply by the top.",
    example: "3/4 of 12: divide 12 by 4 (= 3), then multiply by 3 (= 9). So 3/4 of 12 is 9.",
  },
  ERR_INVERT: {
    label: "Flipped the wrong number",
    why: "A fraction was turned upside down when it shouldn't have been (or the wrong one was).",
    how: "Only flip the fraction you're dividing by — leave the first one as it is.",
    example: "Sharing 1/2 a cake among friends: keep the half as a half; only the \"how many friends\" part flips.",
  },

  // ── Percentages & ratio ───────────────────────────────────────────────────
  ERR_PERCENT_OF: {
    label: "Percentage of an amount slipped",
    why: "Finding a percentage of an amount didn't use the right fraction of 100.",
    how: "Per cent means \"out of 100\": turn the percentage into hundredths, then take that much of the amount.",
    example: "10% of 50: 10% is 10 out of 100, the same as a tenth. A tenth of 50 is 5.",
  },
  ERR_PCT_OF_AMOUNT: {
    label: "Percentage of an amount slipped",
    why: "The percentage wasn't applied to the amount correctly.",
    how: "Find 10% first (divide by 10) and build up from there — it's an easy stepping stone.",
    example: "30% of 40: 10% of 40 is 4, so 30% is three lots of that, 4 + 4 + 4 = 12.",
  },
  ERR_PCT_DECIMAL: {
    label: "Percent and decimal muddled",
    why: "The percentage wasn't converted to its decimal (or fraction) before being used.",
    how: "Divide the percentage by 100 to get its decimal: 25% becomes 0.25.",
    example: "50% is the same as 0.5 and the same as a half — three ways of saying \"half of it\".",
  },
  ERR_RATIO_ADD: {
    label: "Treated a ratio as a total",
    why: "The parts of the ratio were added instead of kept as a comparison.",
    how: "A ratio compares parts; add the parts only to find how many shares the whole splits into.",
    example: "Mixing squash 1:3 (1 cup syrup to 3 water) doesn't mean 4 cups of syrup — it's 1 part out of every 4 being syrup.",
  },
  ERR_RATIO_PARTIAL: {
    label: "Only part of the ratio scaled",
    why: "When scaling the ratio up, one side was multiplied but the other wasn't.",
    how: "Multiply both sides of the ratio by the same number to keep it fair.",
    example: "A 2:3 recipe doubled is 4:6 — both sides doubled. Doubling only one side changes the taste.",
  },
  ERR_RATIO_INVERT: {
    label: "Ratio the wrong way round",
    why: "The two parts of the ratio were written in the wrong order.",
    how: "Keep the parts in the order the question gives them.",
    example: "\"2 teachers to 30 children\" is 2:30, not 30:2 — order matters, like saying it the right way round.",
  },

  // ── Order of operations ───────────────────────────────────────────────────
  ERR_BODMAS_ORDER: {
    label: "Worked it out in the wrong order",
    why: "The operations were done left to right instead of in the proper order.",
    how: "Do brackets first, then multiply and divide, and only then add and subtract.",
    example: "2 + 3 × 4 is 2 + 12 = 14, not 5 × 4 = 20. The times comes before the plus.",
  },
  ERR_BRACKET_IGNORE: {
    label: "Skipped the brackets",
    why: "The part inside the brackets wasn't done first.",
    how: "Always work out what's inside the brackets before anything else.",
    example: "(2 + 3) × 4 is 5 × 4 = 20. The brackets are a \"do me first\" sign.",
  },
  ERR_STEP_SKIP: {
    label: "A step got skipped",
    why: "The answer jumped ahead and missed a step of the working.",
    how: "Write each step on its own line so none gets left out.",
    example: "Like a recipe — skip \"let it rise\" and the bread won't work. Every step earns its place.",
  },

  // ── General arithmetic slips ──────────────────────────────────────────────
  ERR_ARITH: {
    label: "Arithmetic slip",
    why: "The plan was right — a number came out wrong along the way.",
    how: "Re-do the sum slowly and check each step against the one before.",
    example: "Like re-counting money at the till: the method's fine, you're just making sure every step is right.",
  },
  ERR_ARITHMETIC: {
    label: "Arithmetic slip",
    why: "The approach was correct, but a calculation along the way slipped.",
    how: "Go back through the working line by line and recompute each step.",
    example: "Like re-adding a shopping list: nothing wrong with how you did it, just check the running total.",
  },
  ERR_SUBST_ARITH: {
    label: "Slip when putting numbers in",
    why: "The right method was used, but a number was substituted or calculated incorrectly.",
    how: "Re-check each number you put in, then re-do the arithmetic carefully.",
    example: "Like reading a recipe quantity wrong — the steps are right, but double-check the amounts you put in.",
  },
  ERR_RIGID: {
    label: "Stuck on one method",
    why: "One approach was repeated even though it wasn't working for this question.",
    how: "Try picturing the problem a different way — draw it, or use easier numbers first.",
    example: "If pushing a door won't open it, try pulling. Same with a sum — a fresh angle often unlocks it.",
  },
  ERR_REVERSAL: {
    label: "Did it back to front",
    why: "The steps were carried out in reverse, so the answer undid itself.",
    how: "Check the order: start from what you're given and work towards what's asked.",
    example: "Getting dressed: socks before shoes. Do the steps in the right order or it won't come out right.",
  },

  // ── Life Skills (Grades 1–6) ──────────────────────────────────────────────
  // Seven broad codes that name the KIND of thinking a question checks, not a
  // fine-grained slip. The question-specific "why" is the item's own memo
  // (passed as whyOverride), so these entries carry the what/how/example/where.
  // Pitched to the younger end of the grade range: short, concrete, everyday.
  ERR_LS_FACT: {
    label: "Mixed up a fact",
    what: "You picked an answer that doesn't match what this topic teaches — the choice you made is really about something else.",
    why: "The facts in a Life Skills topic sit close together, so one that sounds right can belong to a different question.",
    how: "Think back to what you learned about this topic, then check each choice against it. Say the fact out loud in your own words before you tap.",
    example: "If you're asked which body part you smell with, the answer is your nose — your mouth is for tasting. Match the job to the right part.",
    where: "You use these facts in Life Skills lessons and every day: knowing how your body works, keeping clean, and staying safe at home and school.",
  },
  ERR_LS_VOCAB: {
    label: "Mixed up a word",
    what: "You chose an answer that doesn't fit the word in the question — that word means something different.",
    why: "Some Life Skills words look or sound alike, so the wrong one can feel right.",
    how: "Learn each new word with a picture or an example you know. When you see the word again, picture that example before you answer.",
    example: "\"Cousin\" means the child of your aunt or uncle. Picture your own cousin at a family gathering and you won't swap it for \"friend\" or \"neighbour\".",
    where: "New words come up in every topic — family, feelings, health, rights — and knowing them helps you follow your teacher and your books.",
  },
  ERR_LS_SAFETY: {
    label: "Safer choice missed",
    what: "You picked an answer that isn't the safe or healthy thing to do in this situation.",
    why: "The unsafe choice can look quicker or easier, so it's tempting to pick it.",
    how: "Ask yourself: does this choice keep me and other people safe and well? If not, look for the option that does.",
    example: "If you feel sick at school, the safe choice is to tell a teacher — not to hide it and keep playing. Telling a grown-up gets you help.",
    where: "You'll use this thinking whenever something goes wrong: a fire drill, a hurt knee, a stranger, or feeling unwell.",
  },
  ERR_LS_SEQ: {
    label: "Steps in the wrong order",
    what: "You had the right steps but put them in the wrong order.",
    why: "When you know all the steps, it's easy to forget which one has to come first.",
    how: "Picture yourself actually doing it. Ask what must happen before the next step can work.",
    example: "Washing hands: wet first, then soap, then rinse, then dry. You can't rinse off soap you haven't put on yet.",
    where: "Order matters in daily routines — washing, getting ready for school, crossing the road, following a recipe.",
  },
  ERR_LS_CLASS: {
    label: "Sorted into the wrong group",
    what: "You put something in a group it doesn't belong to.",
    why: "Things can share a feature or two, which makes it easy to group them together even when they belong apart.",
    how: "Name the rule for the group first — what do all its members have in common? Then check whether the thing really fits that rule.",
    example: "Your face parts are eyes, nose, ears and mouth. A knee is a body part too, but it's not on your face — so it goes in a different group.",
    where: "Sorting into groups helps you understand family types, healthy and unhealthy habits, feelings, and the jobs people do.",
  },
  ERR_LS_EMPATHY: {
    label: "Kinder choice missed",
    what: "You picked an answer that doesn't show care for how someone else feels.",
    why: "It's easy to think about what's easiest for you and forget to picture the other person.",
    how: "Stop and imagine you are the other person. How would this choice make them feel? Pick the option that treats them the way you'd want to be treated.",
    example: "If a friend is sad because their pet died, the kind thing is to listen and sit with them — not to tell them to stop crying.",
    where: "You use empathy every day — with friends, family, and classmates, especially anyone who is upset, left out, or different from you.",
  },
  ERR_LS_CONTEXT: {
    label: "Didn't match it to the situation",
    what: "Your answer could be right on its own, but it doesn't fit the situation the question describes.",
    why: "When you answer from memory instead of reading the whole situation, you can miss the detail that changes the answer.",
    how: "Read the whole story in the question. Note who it's about and what they need, then pick the answer that fits that.",
    example: "If someone loves acting out stories, the club that fits is drama — not chess. Match the choice to what that person actually enjoys.",
    where: "Matching your answer to the situation matters in group work, choosing activities, and sorting out disagreements.",
  },

  // ── Natural Sciences & Technology (Grades 4–6) ────────────────────────────
  // Same shape as Life Skills: seven broad codes naming the KIND of thinking.
  // The per-question memo is the "why"; these carry what/how/example/where.
  // Grade 4–6 register — plain, with science terms restated in everyday words.
  ERR_NST_FACT: {
    label: "Mixed up a fact",
    what: "You chose an answer that doesn't match what this topic teaches — it's a fact about something else.",
    why: "Science facts in the same topic sit close together, so a wrong one can sound reasonable.",
    how: "Recall what the topic taught, then test each option against it. If you can't explain why an option is true, it probably isn't the answer.",
    example: "All living things share seven life processes — feeding, growing, reproducing, breathing, excreting, sensing and moving. A rock does none of these, so it is non-living.",
    where: "These facts run through every Natural Sciences topic — living things, materials, energy, the Earth — and through your test questions.",
  },
  ERR_NST_VOCAB: {
    label: "Mixed up a science word",
    what: "You picked an answer that doesn't fit the science word in the question.",
    why: "Science words are often new and look similar, so the wrong one can feel right.",
    how: "Tie each term to a clear example when you learn it. When the word comes up, bring that example to mind before you answer.",
    example: "\"Sense organs\" are body parts like eyes, ears and the nose that pick up what's around you. They are not \"limbs\" — limbs are arms and legs.",
    where: "Every strand has its own words — organism, material, conductor, evaporation, orbit — and you need them to follow lessons and answer questions.",
  },
  ERR_NST_CLASS: {
    label: "Sorted into the wrong group",
    what: "You put something in a group it doesn't belong to.",
    why: "Two things can share a feature and still belong in different groups, which makes sorting tricky.",
    how: "State the rule for the group first — what must every member have? Then check the item against that exact rule.",
    example: "A dry leaf on the ground was once alive but has stopped all its life processes, so it's \"once living, now dead\" — not the same group as a pebble, which was never alive.",
    where: "Sorting is a core science skill — living vs non-living, natural vs manufactured materials, solids vs liquids, conductors vs insulators.",
  },
  ERR_NST_DESIGN: {
    label: "Design step missed",
    what: "Your answer skips the design thinking the question asks for — it picks a detail instead of the reason.",
    why: "It's easy to jump to what a thing looks like and skip what it needs to do and why.",
    how: "Start with the purpose: what must this thing do? Then judge each choice by whether it helps the thing do that job.",
    example: "When designing a chicken coop, the first thing to decide is its purpose — keeping chickens safe and dry. The colour comes much later, if at all.",
    where: "You use this in every design question — shelters, containers, tools, structures — and in explaining why a design works.",
  },
  ERR_NST_SAFETY: {
    label: "Safety point missed",
    what: "You picked an answer that isn't the safe choice for this situation.",
    why: "The unsafe option can seem simpler or more interesting, so it's tempting.",
    how: "Ask what could cause harm here — to a person, an animal, or the environment — and choose the option that prevents it.",
    example: "In a noisy place like a workshop or a concert, wearing earplugs protects your hearing. Shouting louder does not — your ears can't repair loud-noise damage.",
    where: "Safety comes up with electricity, heat, chemicals, loud noise, and caring for animals — in class experiments and in real life.",
  },
  ERR_NST_SEQ: {
    label: "Steps or flow in the wrong order",
    what: "You had the right parts but put them in the wrong order or direction.",
    why: "When you know all the parts of a process, it's easy to lose track of what comes first.",
    how: "Find the starting point, then follow the process one step at a time, checking each step makes the next one possible.",
    example: "An energy chain always starts with the Sun: Sun → plant → animal. The plant has to trap the Sun's energy before an animal can get it by eating the plant.",
    where: "Order and direction matter in energy chains, food chains, the water cycle, life cycles, and the steps of an experiment.",
  },
  ERR_NST_PROCESS: {
    label: "Process or recipe mixed up",
    what: "You chose the wrong materials or the wrong step for how this thing is made or how it works.",
    why: "Different processes use everyday-sounding ingredients, so the wrong combination can look familiar.",
    how: "Picture the process from start to finish: which materials go in, what is done to them, and what comes out.",
    example: "Concrete is made by mixing sand, gravel, cement and water, which then sets hard. Flour, sugar and butter make something you bake — a completely different process.",
    where: "You'll meet this with mixtures and materials — making concrete, bread, jelly, bricks — and with separating mixtures later on.",
  },
};

// ─── Family fallback layer ───────────────────────────────────────────────────
//
// The maths bank uses ~290 distinct error codes — far too many (and too finely
// split) for a bespoke entry each. Most are variants of the same misconception
// (every ERR_*_CARRY / ERR_*_REGROUP is "watch your carrying"; every ERR_DIV_*
// is a division mistake). So beyond the sharp entries above, every code is
// classified into a misconception FAMILY that gives accurate plain-language
// why/how. This guarantees 100% coverage — including any future codes — while
// the specific entries add extra precision and a tailored example for the common
// ones. All zero AI cost.

type FamilyKey =
  | "fraction" | "percent" | "ratio" | "decimals"
  | "addition" | "subtraction" | "multiplication" | "division"
  | "regroup" | "placevalue" | "signs" | "order"
  | "algebra" | "graphs" | "powers" | "logexp" | "trig"
  | "sequence" | "counting" | "geometry" | "units" | "stats"
  | "strategy" | "slip" | "wrongop" | "generic";

const ERROR_FAMILIES: Record<FamilyKey, ErrorExplanation> = {
  fraction: {
    label: "Fraction mix-up",
    what: "You handled the parts of the fraction the wrong way — most likely the top and bottom got swapped, or the pieces weren't the same size before adding.",
    why: "Something about the parts went wrong — which number is on top, which is on the bottom, or the size of the pieces.",
    how: "The bottom number is how many equal pieces the whole is cut into; the top is how many you have. Keep the pieces the same size before adding or subtracting.",
    example: "A pizza cut into 4 slices where you eat 1 is 1/4 — one piece out of four. The bottom counts the slices, the top counts what you took.",
    where: "Fractions turn up everywhere — sharing food or money, reading measurements, and later in ratios, percentages and probability.",
  },
  percent: {
    label: "Percentage mix-up",
    what: "You didn't take the percentage as a part-of-100 of the amount — the percent and the amount weren't put together correctly.",
    why: "Per cent means \"out of 100\", and that wasn't applied to the amount correctly.",
    how: "Find 10% first by dividing by 10, then build up from there.",
    example: "30% of 40: 10% of 40 is 4, so 30% is three lots of that — 4 + 4 + 4 = 12.",
    where: "Percentages are all over daily life — shop discounts, VAT, interest on savings and loans, and test scores.",
  },
  ratio: {
    label: "Ratio or rate mix-up",
    what: "You treated the ratio the wrong way — adding the parts, scaling only one side, or writing them in the wrong order.",
    why: "A ratio compares parts; the parts were added, scaled unevenly, or written the wrong way round.",
    how: "Keep the order the question gives, and multiply both sides by the same number to scale it.",
    example: "Squash mixed 1:3 means 1 part syrup to 3 parts water — 1 out of every 4 cups is syrup, not 1 cup in total.",
    where: "Ratios show up in recipes, mixing drinks or paint, maps and scale drawings, and sharing money.",
  },
  decimals: {
    label: "Decimal slip",
    what: "The digits were right, but the decimal point landed in the wrong place.",
    why: "The digits were right but the decimal point or place wasn't.",
    how: "Line up the decimal points, and check how many decimal places the answer should have.",
    example: "0.5 is the same as a half. 0.05 is a tenth of that — the point's position changes the whole value.",
    where: "Decimals come up with money, measurements, and any time you read a price or use a calculator.",
  },
  addition: {
    label: "Addition slip",
    what: "The adding slipped — usually a column didn't add up or a step got rushed.",
    why: "The adding didn't come out right — usually a column or a small step.",
    how: "Add the ones first, then the tens; bridging through the nearest ten makes it easier.",
    example: "28 + 7 is easier as 28 + 2 = 30, then add the other 5 = 35.",
    where: "Adding is the everyday maths of totals — money, scores, distances and quantities.",
  },
  subtraction: {
    label: "Subtraction slip",
    what: "The take-away slipped — often the numbers were the wrong way round or a borrow was missed.",
    why: "The take-away didn't come out right — often the order or a borrow.",
    how: "Start from the bigger number, and borrow from the next column when the top digit is too small.",
    example: "62 − 7: you can't take 7 from 2, so borrow a ten — 12 − 7 = 5, giving 55.",
    where: "Subtraction is how you work out change, differences, and how much is left.",
  },
  multiplication: {
    label: "Multiplication mix-up",
    what: "You didn't multiply the equal groups — most likely you added them, or a times-table fact slipped.",
    why: "Either the wrong operation was used for equal groups, or a times-table fact slipped.",
    how: "For equal groups, multiply the number of groups by how many are in each; double-check the table fact on its own.",
    example: "3 bags of 4 apples is 4 + 4 + 4 = 12, not 3 + 4 = 7. \"Of\" usually means multiply.",
    where: "Multiplying finds totals of equal groups — rows and columns, area, and money like '5 items at R20 each'.",
  },
  division: {
    label: "Division mix-up",
    what: "The sharing went wrong — the numbers were the wrong way round, the parts weren't equal, or a remainder was dropped.",
    why: "The sharing went wrong — the wrong way round, unequal parts, or a forgotten remainder.",
    how: "Share the total into equal groups, biggest number first, and check by multiplying back.",
    example: "12 sweets shared among 4 is 12 ÷ 4 = 3 each. Check: 3 × 4 = 12.",
    where: "Division is how you share fairly, work out rates, and split a bill or a total.",
  },
  regroup: {
    label: "Carrying or borrowing slipped",
    what: "A carry or a borrow didn't move across to the next column.",
    why: "When a column went over ten (or needed to borrow), the regrouping wasn't carried across.",
    how: "When a column reaches ten, carry one into the next column; when it's too small, borrow ten from the next.",
    example: "27 + 5: the ones make 12, so write 2 and carry the ten — the answer is 32, not 22.",
    where: "Carrying and borrowing come up in almost every written sum with larger numbers or money.",
  },
  placevalue: {
    label: "Place value mix-up",
    what: "A digit was read for its face value instead of what it's worth in its column.",
    why: "A digit's value depends on its column, and the columns got read or lined up wrongly.",
    how: "Name each column — ones, tens, hundreds — and keep the digits lined up underneath each other.",
    example: "In 73 the 7 isn't \"seven\", it's 7 tens — 70. So 73 is 70 + 3.",
    where: "Place value underpins reading big numbers, money, and lining up written sums.",
  },
  signs: {
    label: "Sign slip",
    what: "A positive or negative sign got dropped or flipped.",
    why: "A positive/negative sign was dropped or flipped.",
    how: "Track each sign carefully: two negatives multiply to a positive, and subtracting a negative adds.",
    example: "On a number line, −3 is three steps below zero. Taking away a debt of 3 (−(−3)) actually adds 3.",
    where: "Signs matter with temperatures, bank balances (owing vs having), and all of algebra.",
  },
  order: {
    label: "Worked it out in the wrong order",
    what: "The operations were done left to right instead of in the proper order.",
    why: "The operations were done left to right instead of in the proper order.",
    how: "Do brackets first, then multiply and divide, and only then add and subtract.",
    example: "2 + 3 × 4 is 2 + 12 = 14, not 5 × 4 = 20 — the times comes before the plus.",
    where: "Order of operations matters whenever a sum mixes + − × ÷ or brackets — including on a calculator.",
  },
  algebra: {
    label: "Algebra mix-up",
    what: "Handling the letters slipped — combining unlike terms, or not multiplying a bracket by everything outside it.",
    why: "Something in handling the letters went wrong — combining unlike terms, expanding a bracket, or factorising.",
    how: "Only add terms that match (the x's with the x's), and multiply the bracket by everything outside it.",
    example: "3(x + 2) means 3 times each part: 3x + 6, not 3x + 2. The 3 reaches both terms.",
    where: "Algebra is the language of formulas — you'll use it in science, finance, and every later maths topic.",
  },
  graphs: {
    label: "Graph or line mix-up",
    what: "A feature of the graph — a coordinate, the slope, or the intercept — was read or used the wrong way.",
    why: "A feature of the line or graph — its slope, intercept, or a coordinate — was read or used wrongly.",
    how: "Read coordinates as (across, up), and remember the slope is how steep the line is, the intercept where it crosses.",
    example: "The point (3, 0) sits on the bottom axis, 3 across and 0 up — easy to swap the two numbers.",
    where: "Graphs show up in science experiments, reading data, and any question about a straight line or curve.",
  },
  powers: {
    label: "Powers or roots mix-up",
    what: "A power or root was treated like an ordinary multiplication, or the base and the index got muddled.",
    why: "A power or root was treated like a multiplication, or the base and index got muddled.",
    how: "A power means repeated multiplying; a square root asks \"what number times itself gives this?\".",
    example: "5² is 5 × 5 = 25, not 5 × 2 = 10. And √25 = 5, because 5 × 5 = 25.",
    where: "Powers appear in area and volume, very big or very small numbers, and scientific notation.",
  },
  logexp: {
    label: "Log / exponent mix-up",
    what: "The link between a power and its log got swapped.",
    why: "The link between a power and its log was swapped.",
    how: "A log asks \"what power do I raise the base to?\". Write the matching power form to check.",
    example: "log₂8 = 3 because 2³ = 8 — the log just asks for the exponent.",
    where: "Logs and exponents come up in growth and decay — money, populations, and pH in science.",
  },
  trig: {
    label: "Trig ratio mix-up",
    what: "The wrong ratio was used, or a side was paired with the wrong angle.",
    why: "The wrong ratio was used, or sides were paired with the wrong angle.",
    how: "Match the ratio to the sides you have: SOH-CAH-TOA — sine uses opposite/hypotenuse, and so on.",
    example: "For sine, pair the side opposite the angle with the longest side (the hypotenuse).",
    where: "Trigonometry finds heights and distances you can't measure directly — in surveying, building and navigation.",
  },
  sequence: {
    label: "Pattern mix-up",
    what: "The rule that gets you from one term to the next was misread, or applied the wrong way.",
    why: "The rule that turns one term into the next was misread, or applied the wrong way.",
    how: "Work out the gap between two terms you can see, then keep applying that same gap.",
    example: "2, 4, 6, … each step adds 2, so the next is 8 — find the gap first, then repeat it.",
    where: "Patterns appear in savings that grow by a fixed amount, tiling, and number puzzles.",
  },
  counting: {
    label: "Counting slip",
    what: "The count drifted by one — usually from counting the start or end twice.",
    why: "The count drifted by one — usually double-counting or skipping the start or end.",
    how: "Touch each item once as you count, and decide whether the first one is \"one\" or \"zero\".",
    example: "Fence posts and gaps: 5 posts in a row have only 4 gaps between them.",
    where: "Careful counting matters with money, tallies, and any 'how many' question.",
  },
  geometry: {
    label: "Shape or measure mix-up",
    what: "The wrong formula was used, or a measurement got mixed up — like area with perimeter.",
    why: "The wrong formula was used, or a measurement (sides, angles, area vs perimeter) got mixed up.",
    how: "Name what's asked — perimeter is the distance around, area is the space inside — then pick the matching formula.",
    example: "A 3×4 rectangle has area 3 × 4 = 12 (squares inside) but perimeter 3 + 4 + 3 + 4 = 14 (the fence around).",
    where: "Geometry measures the real world — floor space, fencing, paint, and packaging.",
  },
  units: {
    label: "Units mix-up",
    what: "A measurement wasn't converted, so different units got mixed together.",
    why: "A measurement wasn't converted, or the wrong unit was used.",
    how: "Convert to the same unit before calculating, and check the answer's unit makes sense.",
    example: "1 metre is 100 cm, so 2 m + 50 cm is 250 cm — you can't add 2 and 50 directly.",
    where: "Units matter with cooking, distances, medicine doses, and any measurement question.",
  },
  stats: {
    label: "Data or chance mix-up",
    what: "An average, a chart reading, or a probability was worked out the wrong way.",
    why: "An average, a chart reading, or a probability was worked out wrongly.",
    how: "For the mean, add all the values then divide by how many there are; for chance, count the wanted outcomes out of the total.",
    example: "The mean of 2, 4, 6 is (2 + 4 + 6) ÷ 3 = 4 — add them up, then share by how many.",
    where: "Data and chance are everywhere — sports stats, weather forecasts, surveys and games.",
  },
  strategy: {
    label: "Let's plan the steps",
    what: "A step in the plan was missed, or the problem wasn't set up before calculating.",
    why: "The question needed a plan or an equation set up first, and a step was missed or set up wrongly.",
    how: "Re-read the question, note what it's really asking, then write the steps before calculating.",
    example: "Word problems are like a recipe — list what you have and what you need before you start cooking.",
    where: "Setting up a plan is the heart of every word problem and real-life maths task.",
  },
  slip: {
    label: "Just a small slip",
    what: "The method was right — a single number just came out wrong along the way.",
    why: "The method was right — a number came out wrong along the way.",
    how: "Re-do the working one line at a time and check each step against the one before.",
    example: "Like re-counting your change at the shop — the method's fine, just check each step.",
    where: "Small slips can happen in any calculation, which is why checking your work pays off.",
  },
  wrongop: {
    label: "Wrong operation",
    what: "The numbers were right, but the wrong operation (+ − × ÷) was chosen.",
    why: "The numbers were right, but the wrong operation (+ − × ÷) was chosen.",
    how: "Match the words to the operation: \"altogether\" tends to add, \"left\" to subtract, \"each\" to multiply or divide.",
    example: "\"How many altogether?\" means add; \"how many left?\" means subtract — the words point to the operation.",
    where: "Choosing the right operation is the key skill in every word problem.",
  },
  generic: {
    label: "Let's check this together",
    what: "This answer didn't match what the question was looking for.",
    why: "This one didn't come out right.",
    how: "Re-read the question, work through it one step at a time, and check each step against what's being asked.",
    example: "",
    where: "Take it step by step — re-reading the question is the fastest way to get back on track.",
  },
};

// Classify any error code into its misconception family. Order matters — more
// specific topics are checked before broader operation names (e.g. a fraction
// addition is "fraction", not "addition"; division before multiplication).
function familyOf(code: string): FamilyKey {
  const c = code.toUpperCase();
  const has = (...ks: string[]) => ks.some((k) => c.includes(k));
  if (has("FRAC", "DENOM", "NUMER", "EQUIV", "RECIPROCAL", "UNLIKE", "MIXED_NUM", "SIMPLIFY")) return "fraction";
  if (has("PERCENT", "PCT", "DISCOUNT", "INTEREST", "PROFIT")) return "percent";
  if (has("RATIO", "PROPORT", "UNITARY", "SPEED_DIST", "SCALE_FACTOR")) return "ratio";
  if (has("DECIMAL", "ROUND")) return "decimals";
  if (has("TRIG", "SINE", "COSINE", "HYPOT", "SOH", "CAH", "TOA")) return "trig";
  if (has("LOG", "EXPON", "_LN", "BASE")) return "logexp";
  if (has("POWER", "INDEX", "SQRT", "ROOT", "SQUARE", "CUBE")) return "powers";
  if (has("SLOPE", "GRADIENT", "INTERCEPT", "GRAPH", "COORD", "FUNCTION", "STRAIGHT_LINE", "DOMAIN", "VERTEX", "PARABOLA")) return "graphs";
  if (has("FACTOR", "DISTRIBUT", "DIST_FORGET", "BRACKET", "EXPAND", "LIKE", "COEFF", "SUBST", "TERM", "QUAD", "HCF", "BOTH_SIDES", "ALGEBRA", "FORM_EQUATION", "WORD_EQ", "EQUAL")) return "algebra";
  if (has("BODMAS", "ORDER")) return "order";
  if (has("AREA", "PERI", "VOLUME", "ANGLE", "FACES", "GEOMETR", "SURFACE", "CIRCUMFERENCE", "DIAMETER", "RADIUS", "PI", "POLYGON", "PERPENDICULAR", "PARALLEL", "SUPPLEMENTARY", "THREE_DIMS", "FORMULA", "PYTHAG")) return "geometry";
  if (has("UNIT")) return "units";
  if (has("MEAN", "MEDIAN", "MODE", "RANGE", "AVERAGE", "CHART", "STAT", "DATA", "PROB", "PIE")) return "stats";
  if (has("SIGN", "NEG", "INTEGER", "INT_CONF", "NUM_LINE", "NUMBER_LINE")) return "signs";
  if (has("CARRY", "BORROW", "REGROUP", "RENAME", "ALIGN")) return "regroup";
  if (has("PLACE", "DIGIT", "FACE", "COMPARE")) return "placevalue";
  if (has("SEQ", "PATTERN", "CONST_DIFF", "NTH", "DIRECTION")) return "sequence";
  if (has("COUNT", "SKIP", "OFF_BY_ONE", "CARDINAL")) return "counting";
  if (has("DIV", "SHARE", "REMAINDER", "QUOTIENT")) return "division";
  if (has("TIMES", "MULT", "COMMUTATIVE")) return "multiplication";
  if (has("SUB")) return "subtraction";
  if (has("ADD", "SUM", "DOUBLE", "MAKE_TEN", "COMPENSATION", "SPLIT", "HALF")) return "addition";
  if (has("WORD_PROBLEM", "PLAN", "FORM", "INCOMPLETE", "FORGET", "STEP", "MULTI_")) return "strategy";
  if (has("OFF", "NEAR", "ARITH", "CALC", "SLIP", "FLUENCY", "RIGID", "REVERSAL")) return "slip";
  if (has("WRONG", "OP")) return "wrongop";
  return "generic";
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATHS LITERACY LAYER
// ─────────────────────────────────────────────────────────────────────────────
//
// Maths Literacy's question banks use their OWN 248-code vocabulary (finance,
// tariffs, rates, measurement, data-handling, graphs) — not the maths codes
// above. Each question also ships a one-line `_error_signal_vocabulary` string
// as its "why" (passed to the card as whyOverride) and, usually, `workingSteps`
// that fill the "How to fix it" slot. So this layer supplies the parts the card
// would otherwise miss: the misconception LABEL and the what / example / where.
//
// Same two-layer shape as the maths map: a family classifier that covers every
// code, plus sharp entries for the highest-frequency ones. `how` is a light
// fallback here (working steps normally cover it). Grade 10–12 register, South
// African contexts (municipal tariffs, VAT, bank statements, rand/dollar, maps).

type MLFamilyKey =
  | "interest" | "statement" | "percent" | "tax" | "rates" | "currency"
  | "ratio" | "conversion" | "area" | "volume" | "scale" | "timecalc"
  | "tariff" | "rounding" | "probability" | "data" | "graphs" | "breakeven"
  | "health" | "numbers";

const ML_FAMILIES: Record<MLFamilyKey, ErrorExplanation> = {
  interest: {
    label: "Simple vs compound growth",
    what: "The money was grown the wrong way — most likely as a flat amount each year (simple) when it should compound, or the growth was applied to the wrong balance.",
    why: "Simple interest adds the same amount every year; compound interest adds a percentage of the new, larger balance each time, so it grows faster.",
    how: "For compound growth, multiply by (1 + rate) once for every year — each year works on the previous year's total, not the starting amount.",
    example: "R1 000 at 5% compound: after year 1 it's 1 000 × 1,05 = R1 050; after year 2 it's 1 050 × 1,05 = R1 102,50 — not R1 100, because the second year's interest is earned on R1 050.",
    where: "Savings accounts, fixed deposits, home loans and hire-purchase agreements all use compound interest — it's the core of the finance section.",
  },
  statement: {
    label: "Reading a running balance",
    what: "A line on the statement was added, subtracted or read in the wrong direction, so the running balance came out wrong.",
    why: "Money in and money out move the balance opposite ways, and it's easy to lose track down a long column or to net a repayment before the interest is added.",
    how: "Work one row at a time: start from the opening balance, add every credit (money in), subtract every debit (money out), in date order.",
    example: "Opening R2 000, credits R14 000, debits R850 + R700: closing = 2 000 + 14 000 − 1 550 = R14 450. Do the credits and debits as separate totals first.",
    where: "Bank and account statements, loan schedules and municipal accounts — reading them correctly is a standard exam task and a real-life skill.",
  },
  percent: {
    label: "Working with percentages",
    what: "The percentage was converted or applied wrongly — a wrong decimal, the wrong base amount, or a markup added on instead of multiplied.",
    why: "\"Per cent\" means \"out of 100\", and the base (the amount the percentage is OF) has to be the right one — the original price, not the new one.",
    how: "Turn the percentage into a decimal by dividing by 100, then multiply it by the correct base. For a % increase, multiply the base by (1 + the decimal).",
    example: "25% = 25 ÷ 100 = 0,25. A R80 item marked up 25% costs 80 × 1,25 = R100 — you multiply, you don't just tack \"25\" onto the price.",
    where: "VAT, discounts, markups, tips, inflation, interest and test scores — percentages run through the whole subject.",
  },
  tax: {
    label: "Income tax and payslips",
    what: "A step in the tax or payslip calculation was misread — the wrong bracket, the rebate handled wrongly, or a deduction like UIF left out or mis-rated.",
    why: "Income tax is worked out in bands with a rebate subtracted afterwards, and a payslip has several separate deductions, so it's easy to miss or misplace one.",
    how: "Find the correct bracket for the annual taxable income, apply that row's formula, subtract the rebate, then take off UIF (1%) and any other deductions.",
    example: "UIF is 1% of gross salary, so on R12 000 it's R120 — not R1 200. Small rate, easy to slip a decimal place.",
    where: "Payslips, SARS tax tables and take-home-pay calculations — a guaranteed part of the finance section and something you'll do for real.",
  },
  rates: {
    label: "Rates and proportion",
    what: "The rate was applied with the wrong operation, or the two quantities were divided the wrong way round.",
    why: "A rate links two units (rand per litre, km per hour, price per kg). To use it you multiply or divide depending on which unit you're given and which you want.",
    how: "Write the rate with its units (e.g. R23,50 / litre). To get the total cost, multiply by the number of litres; to get a unit price, divide the total by the quantity.",
    example: "60 litres at R23,50 per litre: 60 × 23,50 = R1 410. If instead you're told 60 litres cost R1 410, the unit price is 1 410 ÷ 60 = R23,50.",
    where: "Fuel, groceries, wages, phone data, recipes and fees — comparing \"per unit\" prices is everyday maths.",
  },
  currency: {
    label: "Currency exchange",
    what: "The conversion went the wrong way — multiplied when it should have divided, or vice versa — or two prices were compared without putting them in the same currency.",
    why: "An exchange rate is a rate like any other: which way you use it depends on whether you're going from rand to the foreign currency or back.",
    how: "Write the rate as \"1 unit = R…\". To turn that currency into rand, multiply by the rate; to turn rand into that currency, divide by the rate.",
    example: "At $1 = R18,50, then 100 US dollars = 100 × 18,50 = R1 850. Going the other way, R1 850 ÷ 18,50 = $100.",
    where: "Travel budgets, online shopping, import prices and news about the rand — all need currency conversion.",
  },
  ratio: {
    label: "Sharing in a ratio",
    what: "The ratio was handled wrongly — one part treated as a fraction of the whole, the parts not added to find the total shares, or the order reversed.",
    why: "A ratio like 2 : 3 means 5 equal shares in total, not 2 out of 3. You need the total number of parts before you can split anything.",
    how: "Add the parts to get the total shares, divide the amount by that total to get one share, then multiply by each side's number of parts.",
    example: "Split R500 in the ratio 2 : 3. Total parts = 5, so one share = 500 ÷ 5 = R100. The two people get R200 and R300.",
    where: "Sharing money or profit, mixing fuel, concrete, paint or cordial, and scaling recipes up or down.",
  },
  conversion: {
    label: "Converting units",
    what: "The measurement was converted the wrong way, or by the wrong factor — moving the decimal in the wrong direction, or forgetting that area and volume units scale differently.",
    why: "Going to a smaller unit gives a bigger number, and going to a bigger unit gives a smaller number. For area it's ×100 per step, for volume ×1 000.",
    how: "Decide first whether the answer should be bigger or smaller, then apply the factor: 1 m = 100 cm, 1 m² = 10 000 cm², 1 m³ = 1 000 ℓ.",
    example: "1,5 km to metres: metres are smaller, so the number gets bigger — 1,5 × 1 000 = 1 500 m, not 150 m.",
    where: "Recipes, building plans, distances on maps, fuel and water volumes, and medicine doses.",
  },
  area: {
    label: "Perimeter and area",
    what: "The wrong formula was used, or a formula was applied without the brackets — perimeter and area got mixed up, or a composite shape wasn't split correctly.",
    why: "Perimeter is the distance around the edge; area is the space inside, in squares. They use different formulas, and P = 2(l + b) only works if you add before you double.",
    how: "Name what's asked, pick the matching formula, and do brackets first. For an odd shape, cut it into rectangles, find each area, then add.",
    example: "A field 12 m by 8 m: perimeter = 2 × (12 + 8) = 2 × 20 = 40 m. The area would be 12 × 8 = 96 m² — a different question with a different unit.",
    where: "Flooring, paint, fencing, paving, fabric and land — anything you measure out or buy by the square metre.",
  },
  volume: {
    label: "Volume and surface area",
    what: "The wrong solid's formula was used, the radius and diameter were swapped, or volume and surface area got mixed up.",
    why: "Volume is the space inside (cubic units); surface area is the skin around it (square units). Each solid — box, cylinder, prism — has its own formula.",
    how: "Identify the solid, write its formula, and check you're using the radius (half the diameter). Volume answers end in m³ or ℓ; surface area in m².",
    example: "A cylinder's volume is π × r² × height. If the diameter is 10 cm, the radius is 5 cm — using 10 makes the answer four times too big.",
    where: "Tanks, pipes, packaging, tins of paint, swimming pools and shipping — working out capacity and how much material wraps a shape.",
  },
  scale: {
    label: "Scale, maps and plans",
    what: "The scale was used the wrong way round, a scale was chosen that doesn't fit the page or material, or a feature on the plan was misread.",
    why: "A scale like 1 : 100 means every 1 unit on the drawing is 100 real units. Going from drawing to real life you multiply; from real life to drawing you divide.",
    how: "Write the scale as \"drawing : real\". Multiply a drawing measurement by the scale number to get the real size; divide a real size to get the drawing size.",
    example: "On a 1 : 100 plan, a wall drawn 5 cm long is really 5 × 100 = 500 cm = 5 m.",
    where: "House plans, maps, seating layouts, packing diagrams and model-building.",
  },
  timecalc: {
    label: "Working with time",
    what: "A time calculation slipped — treating an hour as 100 minutes, mishandling a span that crosses midnight, or reading the wrong row of a timetable.",
    why: "Time isn't decimal: an hour is 60 minutes, so 1,5 hours is 1 h 30 min, not 1 h 5 min. Spans over midnight need to be split at 24:00.",
    how: "Split the journey at midnight if needed, work each part in hours and minutes, then add. Convert to minutes only by multiplying whole hours by 60.",
    example: "22:15 to 00:45: from 22:15 to midnight is 1 h 45 min (105 min), then 45 min more, so 150 minutes total.",
    where: "Bus and train timetables, flight times, work shifts, cooking times and event planning.",
  },
  tariff: {
    label: "Tariffs and stepped bills",
    what: "A stepped (block) tariff was treated as one flat rate, a free allowance was ignored, the fixed monthly charge was left off, or the wrong band was read.",
    why: "Utility bills charge different rates for different blocks of use, often after a free allowance and on top of a fixed monthly fee — so it's not just rate × amount.",
    how: "Charge each block at its own rate up to its limit, add the fixed monthly charge, then add VAT if the tariff is quoted excluding it. Subtract any free allowance first.",
    example: "First 350 units at R2,80 = R980; the next 50 units at R3,40 = R170; subtotal = R1 150 — before the fixed charge and VAT.",
    where: "Electricity, water, phone and data bills, and bank fee structures — comparing options is a classic exam question.",
  },
  rounding: {
    label: "Rounding to fit the situation",
    what: "The answer was rounded the wrong way for the context — down when the job needs at least that much, or left as a fraction of a thing that only comes whole.",
    why: "The maths rounding rule isn't always right in real life: if you need enough paint or enough taxis, you must round UP even when the rule says down.",
    how: "Ask what the number counts. Tins, taxis, seats and people can't be fractions — round up if you need to cover the amount, down if it's a limit you can't exceed.",
    example: "A job needs 4,2 tins of paint. You can't buy 0,2 of a tin, and 4 isn't enough — so you buy 5.",
    where: "Buying materials, hiring transport, seating people, and packaging — anywhere the answer has to be a whole, usable amount.",
  },
  probability: {
    label: "Probability and expected value",
    what: "The probability was set up or scaled wrongly — the wrong count of outcomes, a very small chance misread, or expected value not weighted by its probabilities.",
    why: "Probability is (wanted outcomes) ÷ (all possible outcomes), a number between 0 and 1. Expected value multiplies each payoff by its probability, then adds.",
    how: "Count the total possible outcomes and the ones you want, then divide. For expected value, do probability × payoff for every outcome and sum them.",
    example: "One red ball among 20 gives P = 1 ÷ 20 = 0,05 — a small chance, but not zero. Over 200 draws you'd expect about 0,05 × 200 = 10 reds.",
    where: "Games of chance, insurance premiums, weather forecasts, quality control and medical testing.",
  },
  data: {
    label: "Data handling and statistics",
    what: "A summary value or reading was taken wrongly — an average worked out the wrong way, a value read off the wrong part of a chart or table, or a sampling problem missed.",
    why: "Mean, median and mode each measure the \"middle\" differently, and a chart or table only gives the right value if you read the correct row, column and axis.",
    how: "For the mean, add all values and divide by how many. For the median, sort first then take the middle. Check the axis labels and units before reading a graph.",
    example: "The mean of 4, 6, 8, 10 is (4 + 6 + 8 + 10) ÷ 4 = 7. The median is the middle of the sorted list — here halfway between 6 and 8, so also 7.",
    where: "Reports, surveys, sports statistics, price comparisons and news graphics — plus spotting when a graph is designed to mislead.",
  },
  graphs: {
    label: "Reading graphs and relationships",
    what: "A feature of the graph was misread — the wrong axis or intercept, the wrong crossover point, or the type of relationship (straight-line, inverse, compound) misjudged.",
    why: "Every graph has a story: where it starts (the y-intercept, often a fixed cost), how steep it is (the rate), and where two lines cross (where the options are equal).",
    how: "Read coordinates as (across, up). The y-intercept is the value when x = 0; the point where two graphs meet is the break-even or crossover point.",
    example: "If a cost line starts at R500 when x = 0 and an income line starts at R0, the point where they cross is where income finally covers the R500 of costs.",
    where: "Cost and income graphs, phone-contract comparisons, distance-time travel graphs and growth curves.",
  },
  breakeven: {
    label: "Cost, income and break-even",
    what: "The cost, income or profit relationship was set up wrongly — fixed and variable costs mixed up, profit not taken as income minus costs, or break-even misread.",
    why: "Profit = income − total costs. Total costs = fixed costs (paid no matter what) + variable costs (per item). Break-even is where income exactly equals total costs, so profit is zero.",
    how: "Write total cost = fixed + (variable per unit × number), write income = price × number, then set them equal to find the break-even number.",
    example: "Fixed cost R500, each item costs R10 to make and sells for R15. Each item earns R5 towards the fixed cost, so break-even is 500 ÷ 5 = 100 items.",
    where: "Small businesses, fundraising, event budgets and any \"how many must we sell\" question.",
  },
  health: {
    label: "Health formulas",
    what: "A health formula was misapplied — dividing by height instead of height squared for BMI, or getting the per-kilogram medicine dose the wrong way round.",
    why: "These formulas have a fixed structure. BMI = mass ÷ height², and a dose is millilitres per kilogram × the person's mass — the order and the squaring matter.",
    how: "Substitute carefully, one value at a time, and square the height before dividing. For a dose, multiply the per-kg amount by the body mass.",
    example: "A person 1,7 m tall weighing 72 kg: BMI = 72 ÷ (1,7 × 1,7) = 72 ÷ 2,89 ≈ 24,9 — divide by the square, not by 1,7.",
    where: "BMI and health-risk categories, medicine dosages, growth charts and fitness targets.",
  },
  numbers: {
    label: "Number sense and calculation",
    what: "A number was read, written or calculated wrongly — a place-value or decimal slip, a carry or borrow dropped, or the order of operations not followed.",
    why: "Large numbers, decimal commas and mixed operations leave a lot of room for a small slip that throws the whole answer out.",
    how: "Work one step at a time, keep the decimal commas lined up, do brackets and × ÷ before + −, and estimate first so a wildly wrong answer stands out.",
    example: "2 + 3 × 4 is 2 + 12 = 14, not 5 × 4 = 20 — the multiplication happens before the addition.",
    where: "Every calculation in the subject, and every till slip, bill and measurement in daily life.",
  },
};

// Sharp, code-specific entries for the highest-frequency Maths-Lit codes. Each
// is layered over its family (family fills any part left out here).
const ML_ERROR_EXPLANATIONS: Record<string, ErrorExplanation> = {
  ERR_COMPOUND_AS_SIMPLE: {
    label: "Grew the money as simple, not compound",
    what: "You added the same amount of interest each year instead of letting it build on the growing balance.",
    example: "R1 000 at 5% compound for 2 years: 1 000 × 1,05 = R1 050, then 1 050 × 1,05 = R1 102,50 — the second year earns 5% of R1 050, not of R1 000.",
    where: "Fixed deposits, savings, home loans and inflation over several years.",
  },
  ERR_BALANCE_RUNNING: {
    label: "Running balance doesn't add up",
    what: "A credit or debit was added the wrong way, or one line was missed, so the closing balance is out.",
    example: "Opening R2 000, credits R14 000, debits R850 + R700: closing = 2 000 + 14 000 − 1 550 = R14 450. Total the credits and debits separately first.",
    where: "Bank statements, loan schedules and municipal accounts.",
  },
  ERR_RATE_USE_OPERATION: {
    label: "Wrong operation for the rate",
    what: "You divided when the rate needed multiplying, or the reverse.",
    example: "60 litres at R23,50 per litre is a total, so multiply: 60 × 23,50 = R1 410. You'd only divide if you had the total and wanted the price per litre.",
    where: "Fuel, groceries, wages, data bundles and any \"per unit\" price.",
  },
  ERR_PERCENT_TO_DECIMAL: {
    label: "Percentage-to-decimal slip",
    what: "The percentage wasn't turned into the right decimal before being used.",
    example: "25% = 25 ÷ 100 = 0,25. 5% = 0,05, not 0,5 — watch the leading zero.",
    where: "VAT, discounts, interest rates and inflation figures.",
  },
  ERR_BRACKET_MISSING_FORMULA: {
    label: "Skipped the brackets in the formula",
    what: "You applied P = 2(l + b) without adding the length and breadth first.",
    example: "A 12 m by 8 m field: P = 2 × (12 + 8) = 2 × 20 = 40 m. Doing 2 × 12 + 8 = 32 misses the brackets.",
    where: "Perimeter of rooms and plots, and any formula with brackets.",
  },
  ERR_PROBABILITY_FORMULA: {
    label: "Probability set up wrongly",
    what: "The wanted outcomes and the total outcomes weren't put into (wanted ÷ total) correctly.",
    example: "Drawing 1 red from 20 balls: P = 1 ÷ 20 = 0,05. Count every possible outcome for the bottom of the fraction.",
    where: "Games of chance, insurance, weather forecasts and quality checks.",
  },
  ERR_SCALE_DIRECTION: {
    label: "Used the scale the wrong way",
    what: "You divided by the scale when going from the drawing to real life (or multiplied when going the other way).",
    example: "On a 1 : 100 map, 5 cm on paper is 5 × 100 = 500 cm in real life. Drawing to real: multiply.",
    where: "Maps, house plans, seating layouts and models.",
  },
  ERR_UNIT_CONVERSION_DIRECTION: {
    label: "Converted area units the wrong way",
    what: "You used ×100 instead of ×10 000 (or the wrong direction) between cm² and m².",
    example: "1 m² = 100 cm × 100 cm = 10 000 cm². So 2,5 m² = 25 000 cm².",
    where: "Tiling, flooring, paint coverage and plan measurements.",
  },
  ERR_ROUND_DIRECTION_CONTEXT: {
    label: "Rounded the wrong way for the job",
    what: "You rounded down when the task needs at least the calculated amount.",
    example: "4,2 tins of paint means you buy 5 — 4 tins won't finish the job, and you can't buy 0,2 of a tin.",
    where: "Buying paint, tiles, bricks, and hiring taxis or tables.",
  },
  ERR_BALANCE_GROWTH_BASE: {
    label: "Interest on the wrong balance",
    what: "The interest was worked out on the opening balance instead of the balance after that period's change.",
    example: "If R1 000 grows to R1 050 in year 1, year 2's interest is 5% of R1 050 = R52,50, not 5% of R1 000.",
    where: "Compound savings, loan balances and instalment agreements.",
  },
  ERR_24H_TIME_CALC: {
    label: "Time-span calculation slip",
    what: "The total time was worked out wrongly, often across midnight or by treating an hour as 100 minutes.",
    example: "22:15 to 00:45: 1 h 45 min to midnight, then 45 min more — 150 minutes in total.",
    where: "Timetables, shifts, flight times and cooking times.",
  },
  ERR_UNIT_PRICE_INVERSION: {
    label: "Unit price the wrong way round",
    what: "You divided quantity by price instead of price by quantity (or the reverse).",
    example: "If 60 litres cost R1 410, the unit price is 1 410 ÷ 60 = R23,50 per litre — total ÷ quantity.",
    where: "Comparing pack sizes and \"which is the better buy\" questions.",
  },
  ERR_CURRENCY_DIRECTION: {
    label: "Currency converted the wrong way",
    what: "You multiplied when you should have divided by the exchange rate, or the reverse.",
    example: "At $1 = R18,50: 100 dollars = 100 × 18,50 = R1 850. To go from rand to dollars you'd divide by 18,50.",
    where: "Travel money, online shopping and import prices.",
  },
  ERR_SCALE_FIT: {
    label: "Chose a scale that doesn't fit",
    what: "The scale picked makes the drawing too big or too small for the page or material.",
    example: "A 6 m wall on an A4 page needs about 1 : 50 (12 cm) — 1 : 10 would be 60 cm and run off the page.",
    where: "Drawing plans to size and planning packing or cutting layouts.",
  },
  ERR_PERCENT_BASE_INVERTED: {
    label: "Percentage of the wrong amount",
    what: "The percentage was taken of the new or wrong amount instead of the original base.",
    example: "An item is R120 after a 20% increase. The original is 120 ÷ 1,2 = R100 — you don't just subtract 20% of R120.",
    where: "Reversing VAT or markup, and working back to an original price.",
  },
  ERR_TARIFF_BAND_BOUNDARY: {
    label: "Stepped tariff band handled wrongly",
    what: "The free allowance or the boundary between blocks wasn't applied correctly.",
    example: "First 350 units at R2,80 = R980; the next 50 at R3,40 = R170; subtotal R1 150. Only the units above 350 get the higher rate.",
    where: "Electricity, water and data bills with rising block rates.",
  },
  ERR_AREA_FORMULA: {
    label: "Wrong area formula",
    what: "The area was found with the wrong formula for the shape or layout.",
    example: "A rectangle's area is length × breadth. A triangle's is ½ × base × height — forgetting the ½ doubles the answer.",
    where: "Flooring, paint, paving, fabric and land area.",
  },
  ERR_TARIFF_BLOCK_FLAT: {
    label: "Treated a stepped tariff as flat",
    what: "One rate was applied to the whole amount instead of charging each block at its own rate.",
    example: "400 units isn't 400 × the top rate. It's 350 at the lower rate plus 50 at the higher rate, then the fixed charge.",
    where: "Electricity and water bills, and phone plans with a daily cap.",
  },
  ERR_VOLUME_FORMULA: {
    label: "Wrong volume formula",
    what: "The volume was found with the wrong solid's formula.",
    example: "A rectangular tank is length × breadth × height. A cylinder is π × r² × height — different shape, different formula.",
    where: "Tanks, pipes, pools, packaging and containers.",
  },
  ERR_SA_FORMULA: {
    label: "Wrong surface-area formula",
    what: "Surface area was worked out with the wrong formula, or mixed up with volume.",
    example: "A closed box's surface area is 2(lb + bh + lh) — six faces in three pairs. The answer is in m², not m³.",
    where: "Paint or wrapping needed for a box, tank or tin.",
  },
  ERR_SPEED_TIME_DISTANCE: {
    label: "Speed, time and distance mixed up",
    what: "The speed × time = distance relationship was rearranged the wrong way.",
    example: "A 240 km trip at 80 km/h takes 240 ÷ 80 = 3 hours. Distance ÷ speed = time.",
    where: "Travel planning, fuel estimates and average-speed questions.",
  },
  ERR_BREAKEVEN_EQUATION: {
    label: "Break-even equation set up wrongly",
    what: "Income and total cost weren't written correctly before setting them equal.",
    example: "Fixed R500, R10 to make, sells for R15: set 15n = 500 + 10n, so 5n = 500, n = 100 items.",
    where: "Small-business, fundraising and event-budget questions.",
  },
};

/**
 * Classify any Maths-Lit error code into its family. Order matters — the more
 * distinctive contexts (interest, tariffs, tax, currency) are checked before
 * broader ones so a shared word like "RATE" or "SCALE" lands in the right place.
 */
function mlFamilyOf(code: string): MLFamilyKey {
  const c = code.toUpperCase();
  const has = (...ks: string[]) => ks.some((k) => c.includes(k));
  if (has("TARIFF")) return "tariff";
  if (has("COMPOUND", "INTEREST", "LOAN", "REPAY", "ANNUALIS", "POWER_OF_FACTOR", "REAL_VS_NOMINAL", "NOMINAL", "BALANCE_GROWTH", "SIMPLE_VS_COMPOUND", "RATE_PERIODIC", "RATE_DIRECTION")) return "interest";
  if (has("BALANCE_RUNNING", "DEBIT_CREDIT", "TOTAL_VS_INTEREST", "STATEMENT")) return "statement";
  if (has("TAX", "REBATE", "UIF", "NET_PAY", "GROSS", "COMMISSION", "MARGINAL_RATE", "BRACKET_PICK", "BRACKET_EXCESS", "BRACKET_BAND")) return "tax";
  if (has("CURRENCY", "_FX", "FX_", "RATE_COMPARE")) return "currency";
  if (has("BMI", "DOSE", "GROWTH_CHART")) return "health";
  if (has("PROBABILITY", "EXPECTED_VALUE", "EXPECTED_OUTCOMES", "SAMPLE_SPACE", "FAIR_GAME", "CONVERGENCE", "GAMBLER", "CONDITIONAL_PROB", "REPLACEMENT", "RISK_BAND", "TREE_DIAGRAM", "PROBABILITY_AND", "PROBABILITY_OR")) return "probability";
  if (has("BREAKEVEN", "PROFIT", "INCOME_FORMULA", "INCOME_VS", "CONTRIBUTION", "BUDGET", "COST_PRICE", "EXPENSE_CLASSIFY", "FIXED_VS_VARIABLE", "FIXED_COST_SPLIT", "VARIANCE", "MARGIN_VS_MARKUP")) return "breakeven";
  if (has("SCALE", "MAP", "PLAN", "ELEVATION", "LAYOUT", "DOCUMENT_FIELD", "MEASURE_ZERO", "INSTRUMENT_PICK", "COMPASS", "DIRECTIONS_FOLLOW", "SIGNED_VALUE", "DIRECTIONS")) return "scale";
  if (has("CONVERSION", "M3_TO_L", "POWER_OF_10", "HM_TO", "_TO_MIN", "_TO_TIME", "24H_12H", "PIE_DEGREES")) return "conversion";
  if (has("TIME", "TIMETABLE", "MIDNIGHT", "TIMEZONE", "OVERS")) return "timecalc";
  if (has("ROUND", "PAINT_ROUND", "CAPACITY_ROUND")) return "rounding";
  if (has("PERCENT", "MARKUP", "MARGIN", "_VAT", "VAT_")) return "percent";
  if (has("RATIO")) return "ratio";
  if (has("SLOPE", "INTERCEPT", "INTERSECTION", "AXIS", "GRAPH", "CROSSOVER", "EQUATION_SOLVE", "INDEP_DEP", "RELATIONSHIP_TYPE", "TYPE_OF_PROPORTION", "INVERSE_PRODUCT", "INVERSE_AS_DIRECT", "TABLE_PATTERN", "TABLE_LOOKUP", "INTERPOLAT", "TREND", "SCATTER", "PREDICTION", "CONVERGENCE")) return "graphs";
  if (has("AREA", "PERIM", "CIRCLE", "TRIANGLE", "TRAPEZIUM", "SQUARE_VS_DOUBLE", "RADIUS_VS_DIAMETER", "BRACKET_MISSING", "BRACKET_FORMULA", "COMPOSITE")) return "area";
  if (has("VOLUME", "SA_FORMULA", "SA_CYLINDER", "CYLINDER", "M3_TO", "RADIUS_VS")) return "volume";
  if (has("RATE", "PROPORTION", "UNIT_PRICE", "SPEED", "RECIPE_SCALE", "AVG_SPEED", "DIRECT_PROPORTION", "INVERSE_OPERATION", "INVERSE_PRODUCT_CONSTANT")) return "rates";
  if (has("MEAN", "MEDIAN", "MODE", "RANGE", "IQR", "QUARTILE", "BOX_PLOT", "WEIGHTED_MEAN", "AVERAGE", "CHART", "TALLY", "INTERVAL", "DATA_TYPE", "SAMPLE", "REL_FREQ", "TWOWAY_TABLE", "FREQ_READ", "QUESTION", "QUESTIONNAIRE", "BIAS", "MISLEADING", "FREQUENCY")) return "data";
  return "numbers";
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHYSICAL SCIENCES LAYER
// ─────────────────────────────────────────────────────────────────────────────
//
// The matric Physical Sciences banks label each item with 1–3 finely-split
// ERR_* codes (~1000 distinct across mechanics, waves, electricity & magnetism,
// matter & materials, and every chemistry topic). Each item also ships an
// authored per-question `explanation`, which the card uses as the "why". So this
// layer only needs to classify a code into its topic FAMILY and supply the
// label / what / how / example / where. Grade 10–12 register.

type PhysSciFamilyKey =
  | "kinematics" | "newton" | "gravitation" | "momentum" | "energy"
  | "waves" | "optics" | "electrostatics" | "circuits" | "electrodynamics"
  | "atomic" | "bonding" | "stoichiometry" | "rate_equilibrium"
  | "acids_bases" | "redox" | "organic" | "energy_changes" | "skills";

const PHYSSCI_FAMILIES: Record<PhysSciFamilyKey, ErrorExplanation> = {
  kinematics: {
    label: "Motion (kinematics) slip",
    what: "Something in the motion set-up went wrong — a wrong equation for the unknown, a sign on displacement/velocity, or distance and displacement treated as the same thing.",
    why: "Kinematics needs the right equation for what you're solving for, and a chosen positive direction that every vector sticks to.",
    how: "List what you're given and what you want, then pick the equation of motion that contains only those. Choose one positive direction and give every quantity going the other way a minus sign.",
    example: "Falling from rest, taking down as positive: v = u + at with u = 0 gives v = at. Distance is how far travelled; displacement is straight-line from start to finish, with a direction.",
    where: "Every motion problem — free fall, projectiles, motion graphs — and the vertical projectile-motion question in Paper 1.",
  },
  newton: {
    label: "Forces / Newton's laws slip",
    what: "A force was handled wrongly — the wrong one of the three laws chosen, a force left off or given the wrong sign in Fnet, friction pointing the wrong way, or sin/cos swapped on an incline.",
    why: "Newton's second law is Fnet = ma along one chosen direction, so every force must be resolved along that line with the correct sign, and friction always opposes the motion.",
    how: "Draw a free-body diagram, resolve forces along the direction of motion, add them with signs to get Fnet, then apply Fnet = ma. On an incline, the weight component along the slope is mg sin θ and into the slope is mg cos θ.",
    example: "A 2 kg block pulled by 10 N against 4 N of friction: Fnet = 10 − 4 = 6 N, so a = 6 ÷ 2 = 3 m·s⁻². For a system of connected bodies, find the system acceleration first, then look at one body.",
    where: "Newton's laws questions, connected bodies, inclines and lifts — a large part of Paper 1 mechanics.",
  },
  gravitation: {
    label: "Newton's law of universal gravitation slip",
    what: "The gravitation formula was misused — wrong inverse-square scaling, or the wrong formula for g on a planet.",
    why: "The force is F = Gm₁m₂/r², so doubling the separation divides the force by four, not two; the surface gravity of a planet is g = GM/r².",
    how: "Substitute into F = Gm₁m₂/r² carefully. For a scaling question, write the ratio and see what power of r changes. For g on a planet, use g = GM/r² with that planet's mass and radius.",
    example: "If the distance between two masses triples, the gravitational force becomes 1/3² = 1/9 of what it was.",
    where: "The gravitation question in Paper 1 — force between masses, and comparing gravity on different planets.",
  },
  momentum: {
    label: "Momentum & impulse slip",
    what: "Momentum was worked out wrongly — change in momentum taken as m(v + u) instead of m(v − u), or conservation of momentum applied without keeping directions consistent.",
    why: "Momentum is a vector: p = mv. Change in momentum is the final vector minus the initial vector, Δp = m(v − u), and in a collision the total momentum before equals the total after.",
    how: "Pick a positive direction. Write each object's momentum with its sign. For impulse, Δp = m(v − u) — subtract, don't add. For a collision, set total momentum before = total momentum after, signs included.",
    example: "A 0,5 kg ball hits a wall at 4 m·s⁻¹ and bounces back at 3 m·s⁻¹. Taking 'towards the wall' as positive: Δp = 0,5(−3 − 4) = −3,5 kg·m·s⁻¹.",
    where: "The momentum and impulse question in Paper 1 — collisions, explosions, and force from rate of change of momentum.",
  },
  energy: {
    label: "Work, energy & power slip",
    what: "A work-energy quantity was mishandled — a wrong substitution into ½mv² or mgh, or P = W/t multiplied instead of divided.",
    why: "Work done by a force is W = F·d·cos θ; mechanical energy (KE + PE) is conserved when only gravity does work; power is the rate of doing work, P = W/t.",
    how: "For energy conservation, set total mechanical energy at one point equal to that at another: ½mv₁² + mgh₁ = ½mv₂² + mgh₂. For power, divide the work (or energy) by the time.",
    example: "A 2 kg object falls 5 m from rest. Energy conservation: mgh = ½mv², so v = √(2gh) = √(2 × 9,8 × 5) ≈ 9,9 m·s⁻¹.",
    where: "The work-energy-power question in Paper 1, and the work-energy theorem applied to inclines and friction.",
  },
  waves: {
    label: "Waves & sound slip",
    what: "A wave relationship was misused — v = fλ rearranged wrongly, or the Doppler formula with numerator and denominator swapped, or the red/blue shift direction reversed.",
    why: "For any wave, v = fλ. In the Doppler effect the observed frequency rises when source and observer move together and falls when they move apart; light from a receding object is red-shifted, from an approaching object blue-shifted.",
    how: "For v = fλ, rearrange to the quantity you want. For Doppler, write fL = fs(v ± vL)/(v ∓ vs) and choose the signs by asking whether the motion raises or lowers the pitch. Red shift = moving away; blue shift = moving closer.",
    example: "A siren of 400 Hz on an approaching car: the observer hears a higher frequency, so the top sign (add vL, subtract vs where they close the gap) applies.",
    where: "The Doppler effect question (sound and light) in Paper 1, and echo/wave-speed calculations.",
  },
  optics: {
    label: "Refraction & optics slip",
    what: "A light-bending relationship was misused — Snell's law rearranged wrongly, or the condition for total internal reflection misapplied.",
    why: "Snell's law is n₁ sin θ₁ = n₂ sin θ₂. Total internal reflection only happens when light travels from a denser to a less dense medium AND the angle of incidence exceeds the critical angle.",
    how: "For refraction, substitute into n₁ sin θ₁ = n₂ sin θ₂ and solve for the unknown angle or index. For TIR, first check the light is going into a less dense medium, then compare the angle to the critical angle where sin θc = n₂/n₁.",
    example: "Light going from glass (n = 1,5) into air (n = 1) with a critical angle near 42°: at 50° it totally internally reflects; at 30° it refracts out.",
    where: "The refraction question in Paper 1, and optical-fibre / prism scenarios.",
  },
  electrostatics: {
    label: "Electrostatics slip",
    what: "A charge or field quantity was mishandled — F = qE misapplied, field-line arrows drawn the wrong way, or charge not shared equally between identical touching spheres.",
    why: "Coulomb's law gives the force between point charges, F = kQ₁Q₂/r². Field lines point away from positive and towards negative charge. Two identical conducting spheres in contact share their total charge equally.",
    how: "For force, substitute into F = kQ₁Q₂/r². For the force on a charge in a field, F = qE. When two identical spheres touch, add their charges and split the total in half before separating them.",
    example: "A +6 nC sphere touches an identical −2 nC sphere: total = +4 nC, so each carries +2 nC after they separate.",
    where: "The electrostatics question in Paper 1 — Coulomb's law, electric fields, and charged-sphere problems.",
  },
  circuits: {
    label: "Electric circuits slip",
    what: "A circuit relationship was misused — V = IR rearranged wrongly, the internal resistance left out of the total, or series/parallel combined incorrectly.",
    why: "Ohm's law is V = IR. The emf of a cell equals the total 'lost volts' plus terminal voltage: ε = I(R + r), so the internal resistance r must be included in the total resistance.",
    how: "Add series resistors directly; for parallel, use 1/Rp = 1/R₁ + 1/R₂. Include the internal resistance r in the total. Then apply ε = I(R + r) or V_terminal = ε − Ir.",
    example: "A 6 V cell with r = 0,5 Ω drives a 2,5 Ω resistor: I = ε ÷ (R + r) = 6 ÷ 3 = 2 A, and the terminal voltage is 6 − (2 × 0,5) = 5 V.",
    where: "The electric circuits question in Paper 1 — internal resistance, series/parallel networks, and power in circuits.",
  },
  electrodynamics: {
    label: "Electrodynamics slip",
    what: "An AC or machine relationship was misused — V_rms = V_max/√2 rearranged wrongly, or a generator/motor's energy conversion stated backwards.",
    why: "A generator turns mechanical energy into electrical (AC via slip rings, DC via a commutator); a motor does the reverse. RMS values relate to the peak by a factor of √2: V_rms = V_max/√2.",
    how: "For RMS, divide the maximum by √2 (or multiply an RMS value by √2 to get the peak). For a machine question, state the input and output energy the right way round and name the part that makes it AC or DC.",
    example: "A supply with V_max = 340 V has V_rms = 340 ÷ √2 ≈ 240 V — the value quoted for household mains.",
    where: "The electrodynamics question in Paper 1 — generators, motors, and AC (RMS voltage, current and power).",
  },
  atomic: {
    label: "Atomic structure / matter slip",
    what: "An atomic-scale idea was mixed up — electron configuration, an ion's charge, or how line emission spectra arise.",
    why: "Electrons fill energy levels from the lowest up; an atom becomes an ion by losing or gaining electrons; a line spectrum is produced when electrons drop between fixed energy levels, each drop giving one wavelength.",
    how: "Write the electron configuration level by level. For an ion, adjust the electron count by the charge. For a spectrum, link each line to one specific energy-level transition.",
    example: "A sodium atom (11 electrons) is 1s² 2s² 2p⁶ 3s¹; losing the lone 3s electron gives the Na⁺ ion.",
    where: "Paper 2 — atomic combinations and the historical models / emission-spectrum material.",
  },
  bonding: {
    label: "Bonding & intermolecular forces slip",
    what: "A structure or intermolecular-force idea went wrong — a molecular shape, bond polarity, the wrong overall force between molecules, or hydrogen bonding claimed without H bonded to N, O or F.",
    why: "Molecular shape follows the number of bonding and lone pairs (VSEPR). The intermolecular forces present depend on polarity: London forces in all molecules, dipole–dipole in polar ones, and hydrogen bonding only when H is bonded directly to N, O or F.",
    how: "Draw the Lewis structure, count bonding pairs and lone pairs to get the shape, decide if the molecule is polar, then list its intermolecular forces. Only tick hydrogen bonding if you can point to an H–N, H–O or H–F bond.",
    example: "Water has H bonded to O, so it hydrogen-bonds — which is why its boiling point is much higher than H₂S, where H is bonded only to S.",
    where: "Paper 2 — molecular structure, shapes, and the intermolecular-forces / physical-properties questions.",
  },
  stoichiometry: {
    label: "Stoichiometry / the mole slip",
    what: "A mole calculation went wrong — molar mass, n = m/M, molar volume at STP, a unit not converted, or an unbalanced equation used for the ratio.",
    why: "Amount in moles is n = m/M; at STP one mole of any gas occupies 22,4 dm³; concentration is c = n/V. The mole ratio comes from the balanced equation, so it must be balanced first.",
    how: "Balance the equation. Convert every mass to moles with n = m/M and every gas volume with the molar volume. Use the balanced coefficients as the ratio, then convert the answer back to the units asked for (watch cm³ vs dm³).",
    example: "How many moles in 18 g of water? M(H₂O) = 18 g·mol⁻¹, so n = 18 ÷ 18 = 1 mol, which is 22,4 dm³ if it were a gas at STP.",
    where: "Paper 2 — quantitative aspects of chemical change, and any calculation built on a balanced equation.",
  },
  rate_equilibrium: {
    label: "Reaction rate / equilibrium slip",
    what: "A rate or equilibrium idea went wrong — an ICE table laid out incorrectly, a stoichiometric coefficient left out of the change row, the wrong rate ratio between species, or Le Chatelier applied the wrong way.",
    why: "Rate depends on how often particles collide successfully (collision theory). At equilibrium the forward and reverse rates are equal; Kc is fixed at a given temperature; a stress (concentration, pressure, temperature) shifts the position to partly oppose the change.",
    how: "For an ICE table, put initial amounts in row 1, the change (× the coefficient) in row 2, and the equilibrium amounts in row 3, then substitute into the Kc expression. For a shift, ask which direction reduces the imposed stress.",
    example: "For N₂ + 3H₂ ⇌ 2NH₃, if x mol of N₂ reacts then 3x mol of H₂ reacts and 2x mol of NH₃ forms — the coefficients scale the change row.",
    where: "Paper 2 — rate of reaction and chemical equilibrium (Kc calculations and Le Chatelier predictions).",
  },
  acids_bases: {
    label: "Acids & bases slip",
    what: "An acid-base idea went wrong — a conjugate acid-base pair misidentified, pH/pOH mixed up, or a strong/weak or titration relationship misused.",
    why: "A conjugate pair differs by exactly one H⁺. pH = −log[H₃O⁺] and pH + pOH = 14 at 25 °C. In a titration, moles of acid H⁺ equal moles of base OH⁻ at the equivalence point.",
    how: "For a conjugate pair, add or remove one H⁺. For pH, take −log of the hydronium concentration; get pOH from 14 − pH. For a titration, use n = cV on both sides and the balanced ratio.",
    example: "NH₃ + H₂O ⇌ NH₄⁺ + OH⁻: NH₃ and NH₄⁺ are a conjugate pair (differ by one H⁺); so are H₂O and OH⁻.",
    where: "Paper 2 — acids and bases (conjugate pairs, pH calculations, titrations and hydrolysis of salts).",
  },
  redox: {
    label: "Redox & electrochemistry slip",
    what: "A redox or cell idea went wrong — a half-reaction not balanced for atoms or charge, oxidation and reduction mixed up, or E°_cell = E°_cathode − E°_anode rearranged incorrectly.",
    why: "Oxidation is loss of electrons (at the anode); reduction is gain (at the cathode). Half-reactions must balance for both atoms and charge. The cell emf is E°_cell = E°_cathode − E°_anode.",
    how: "Balance each half-reaction (atoms first, then charge with electrons). Identify which species is oxidised (anode) and which is reduced (cathode). Subtract: E°_cell = E°(cathode) − E°(anode).",
    example: "A Zn/Cu cell: Zn is oxidised (anode, E° = −0,76 V), Cu²⁺ is reduced (cathode, E° = +0,34 V), so E°_cell = 0,34 − (−0,76) = 1,10 V.",
    where: "Paper 2 — electrochemical reactions (galvanic and electrolytic cells, standard electrode potentials).",
  },
  organic: {
    label: "Organic chemistry slip",
    what: "An organic idea went wrong — an IUPAC name (wrong suffix for the functional group, or the chain numbered from the wrong end), an isomer, or the wrong reaction type.",
    why: "The functional group fixes the suffix (-ane, -ene, -ol, -oic acid, …). The parent chain is the longest containing the functional group, numbered so the group (then substituents) gets the lowest possible number. Reaction type depends on the functional groups: addition, elimination, substitution, esterification, combustion, cracking.",
    how: "Find the longest chain through the functional group, number from the end that gives it the lowest locant, name substituents alphabetically with their numbers, and add the suffix for the group. For a reaction, match reactant and product groups to a named reaction type.",
    example: "CH₃CH₂CH₂OH: three-carbon chain with an –OH on carbon 1, so it's propan-1-ol. An alkene + water → alcohol is an addition (hydration) reaction.",
    where: "Paper 2 — organic molecules (naming, structural isomers) and organic reactions.",
  },
  energy_changes: {
    label: "Energy changes in reactions slip",
    what: "An enthalpy idea went wrong — a reaction labelled exothermic instead of endothermic (or the reverse), or activation energy and heat of reaction confused.",
    why: "An exothermic reaction releases energy (ΔH negative, products lower than reactants on the energy profile); endothermic absorbs it (ΔH positive). Activation energy is the barrier to get the reaction started, separate from the overall ΔH.",
    how: "Compare the energy of the products to the reactants: lower products = exothermic (ΔH < 0), higher = endothermic (ΔH > 0). On a profile, read the peak height above the reactants as the activation energy and the reactant-to-product step as ΔH.",
    example: "Combustion of methane releases heat, so it's exothermic and ΔH is negative — the products sit lower on the energy diagram than the reactants.",
    where: "Paper 2 — energy and chemical change (exothermic/endothermic reactions and energy profile diagrams).",
  },
  skills: {
    label: "Calculation or data-handling slip",
    what: "The physics or chemistry was right, but a step in the working slipped — a unit not converted, a formula rearranged wrongly, a vector added as if it were a scalar, or a graph feature misread.",
    why: "Science calculations need consistent SI units, correct rearrangement, and vectors combined by direction — not just by adding sizes.",
    how: "Convert all quantities to SI units first. Rearrange the formula before substituting. For perpendicular vectors, combine with Pythagoras; for a graph, read the axis labels and use the gradient or area as the question requires.",
    example: "Two perpendicular forces of 3 N and 4 N give a resultant of √(3² + 4²) = 5 N, not 7 N.",
    where: "Any calculation in either paper — the marks for method and units are separate from the marks for the final number.",
  },
};

// A few sharp entries for the highest-frequency Physical Sciences codes.
const PHYSSCI_ERROR_EXPLANATIONS: Record<string, ErrorExplanation> = {
  ERR_KINEMATIC_EQUATION_SELECT: {
    label: "Wrong equation of motion chosen",
    what: "You picked an equation of motion that doesn't contain the right mix of known and unknown quantities.",
    example: "To find final velocity from u, a and displacement (no time), use v² = u² + 2as — not v = u + at, which needs the time.",
  },
  ERR_INCLINE_COMPONENT_TRIG: {
    label: "sin and cos swapped on the incline",
    what: "The weight components on the slope were resolved with sine and cosine the wrong way round.",
    example: "On an incline of angle θ, the weight component ALONG the slope is mg sin θ and the component INTO the slope (the normal direction) is mg cos θ.",
  },
  ERR_DOPPLER_NUMER_DENOM: {
    label: "Doppler formula flipped",
    what: "The numerator and denominator of the Doppler equation were swapped.",
    example: "fL = fs (v ± vL) / (v ∓ vs): the listener's speed goes on top, the source's speed on the bottom. Choose signs by asking whether the motion raises or lowers the pitch.",
  },
  ERR_IMPULSE_M_DELTA_V: {
    label: "Change in momentum added instead of subtracted",
    what: "Δp was worked out as m(v + u) instead of m(v − u).",
    example: "A ball hitting a wall at +4 m·s⁻¹ and rebounding at 3 m·s⁻¹ has final velocity −3 m·s⁻¹, so Δp = m(−3 − 4), not m(−3 + 4).",
  },
  ERR_HBONDING_REQUIREMENTS: {
    label: "Hydrogen bonding claimed without H–N/O/F",
    what: "Hydrogen bonding was applied to a molecule where hydrogen isn't bonded directly to nitrogen, oxygen or fluorine.",
    example: "H₂S has H bonded to sulfur, so it CANNOT hydrogen-bond; H₂O has H bonded to oxygen, so it can — which is why water boils far higher.",
  },
  ERR_ICE_CHANGE_COEFFICIENT: {
    label: "Stoichiometric coefficient left out of the ICE table",
    what: "The 'change' row of the ICE table wasn't multiplied by each species' balancing coefficient.",
    example: "For N₂ + 3H₂ ⇌ 2NH₃, if the change in N₂ is −x, then H₂ changes by −3x and NH₃ by +2x.",
  },
  ERR_EMF_FORMULA: {
    label: "E°_cell formula rearranged wrongly",
    what: "E°_cell = E°_cathode − E°_anode was set up the wrong way round.",
    example: "Cathode +0,34 V, anode −0,76 V: E°_cell = 0,34 − (−0,76) = 1,10 V — cathode minus anode, keeping the signs.",
  },
  ERR_INTERNAL_R_FORGOT_IN_TOTAL: {
    label: "Internal resistance left out of the total",
    what: "The cell's internal resistance r wasn't included when finding the total circuit resistance.",
    example: "A 6 V cell (r = 0,5 Ω) with a 2,5 Ω external resistor: I = 6 ÷ (2,5 + 0,5) = 2 A. Leaving out r gives the wrong current.",
  },
  ERR_IUPAC_NUMBERING: {
    label: "Carbon chain numbered from the wrong end",
    what: "The parent chain was numbered so a substituent or the functional group got a higher number than it needed to.",
    example: "In CH₃–CH(CH₃)–CH₂–CH₃, number from the right so the methyl branch is on carbon 2, not carbon 3 — giving 2-methylbutane.",
  },
  ERR_N2_DIVISION_ORDER: {
    label: "F = ma rearranged upside down",
    what: "Acceleration was found by dividing mass by force instead of force by mass.",
    example: "Fnet = 6 N on a 2 kg object: a = Fnet ÷ m = 6 ÷ 2 = 3 m·s⁻², not 2 ÷ 6.",
  },
};

/**
 * Classify any Physical Sciences error code into its topic family. Order
 * matters — the more specific chemistry topics are checked before the broad
 * 'skills' fallback, and electrochemistry (cathode/anode) before circuits.
 */
function physSciFamilyOf(code: string): PhysSciFamilyKey {
  const c = code.toUpperCase();
  const has = (...ks: string[]) => ks.some((k) => c.includes(k));
  // Electrochemistry before circuits (both use "EMF"), and before the generic
  // "ELECTRO" catch.
  if (has("CATHODE", "ANODE", "OXIDATION", "REDUCTION", "HALF_REACTION", "REDOX", "GALVANIC", "ELECTROLYTIC", "ELECTROLYSIS", "ELECTROLYTE", "E_CELL", "EMF_FORMULA", "EMF_SPONTAN", "OXIDISING", "REDUCING", "OXIDATION_NUMBER", "ELECTRODE_POTENTIAL", "STANDARD_POTENTIAL", "CELL_NOTATION", "ELECTRON_CANCEL", "EXTRACTION_", "SPONTANE", "SACRIFICIAL", "CORROSION", "REDUCTION_TABLE", "SPECTATOR", "DISPROPORTION")) return "redox";
  if (has("KINEMATIC", "DISPLACEMENT", "DISTANCE", "PROJECTILE", "FREEFALL", "FREE_FALL", "MOTION_GRAPH", "GRAPH_MOTION", "ACCEL", "DECELERAT", "VELOCITY_TIME", "POSITION_TIME", "XT_GRAPH", "VT_GRAPH", "AT_GRAPH", "BOUNCE_", "AT_TOP", "FLIGHT_SYMMETRY", "TIME_OF_FLIGHT", "GRAPH_AREA", "GRAPH_GRADIENT", "GRADIENT_MEANING", "AREA_MEANING", "TERMINAL_VELOCITY", "RETARD", "SPEED_VELOCITY", "UNIFORM_ACCEL")) return "kinematics";
  if (has("NEWTON", "N1_", "N2_", "N3_", "LAW_IDENTIFICATION", "LAW_IDENT", "NET_FORCE", "FNET", "FRICTION", "INCLINE", "COMPONENT_TRIG", "COMPONENT_SIZE", "SYSTEM_VS_INDIVIDUAL", "FREE_BODY", "FBD", "NORMAL_FORCE", "TENSION", "APPLIED_FORCE", "ATWOOD", "APPARENT_WEIGHT", "FORCE_PAIR", "FORCE_COMPARISON", "ACTION_REACTION", "LIFT_FORCE", "RESOLVE_FORCE")) return "newton";
  if (has("GRAV", "INVERSE_SQUARE", "G_PLANET", "WEIGHT_MASS", "UNIVERSAL_GRAV", "FIELD_G", "BIG_G")) return "gravitation";
  if (has("MOMENTUM", "IMPULSE", "DELTA_V", "COLLISION", "DELTA_P", "P_CONSERV", "RECOIL", "EXPLOSION", "COM_", "CONSERVATION_OF_MOMENT", "STICKY", "FT_AREA", "F_DELTA_T")) return "momentum";
  if (has("WORK", "ENERGY_CONSERV", "CME", "MECHANICAL_ENERGY", "CONSERVATIVE", "KE_", "EK_", "PE_", "EP_", "MGH", "HALF_MV", "POWER_FORMULA", "WORK_ENERGY", "EFFICIENCY", "P_EQUALS_W", "ENERGY_FORMULA", "ENERGY_CONVERSION", "ENERGY_DESTROYED", "ENERGY_TRANSFER", "ENERGY_SOLVE", "NON_CONSERVATIVE")) return "energy";
  if (has("DOPPLER", "RED_BLUE", "RED_SHIFT", "BLUE_SHIFT", "RED_DEFINITION", "BLUE_DEFINITION", "WAVE_SPEED", "WAVELENGTH", "FREQUENCY", "PERIOD", "AMPLITUDE", "CREST", "TROUGH", "COMPRESSION_RAREFACTION", "RAREFACTION", "F_LAMBDA", "SOUND", "PITCH", "ECHO", "V_EQUALS_F", "HARMONIC", "STANDING_WAVE", "DIFFRACTION", "ANGULAR_FREQ", "TRANSVERSE", "LONGITUDINAL", "EXPANDING_UNIVERSE", "HUBBLE", "EM_SPEED", "EM_NATURE", "EM_ORDER", "EM_USES", "EM_DANGER", "EM_DUAL", "EM_SPECTRUM", "PHOTON", "PHOTOELECTRIC", "THRESHOLD", "WORK_FUNCTION", "ABSORPTION_D", "EMISSION_D", "ABSORPTION_DIR", "EMISSION_DIR")) return "waves";
  if (has("REFRACT", "SNELL", "TIR", "CRITICAL_ANGLE", "REFRACTIVE_INDEX", "TOTAL_INTERNAL", "LENS", "PRISM", "ANGLE_FROM_NORMAL", "BEND_DIRECTION", "ARCSIN", "OPTICAL_FIBRE")) return "optics";
  if (has("COULOMB", "E_FIELD", "E_VS_Q", "E_VS_INVERSE", "FIELD_LINE", "F_EQUALS_EQ", "CHARGE_SHARING", "POINT_CHARGE", "ELECTRON_TRANSFER", "CHARGE_SIGN", "ELECTROSTATIC", "CHARGE_QUANT", "CHARGE_KINDS", "CHARGE_UNIT", "CHARGE_FORCE", "CHARGE_CONSERV", "ELECTRON_CHARGE", "CONDUCTOR_INSULATOR", "FIELD_DEF", "FIELD_DIRECTION", "FIELD_PATTERN", "FIELD_STRENGTH", "FIELD_VECTOR", "FIELD_FORMULA", "FIELD_FORCE", "FIELD_PROPORTION", "FIELD_VISUALISE", "FIELD_EVIDENCE", "FIELD_SOURCE")) return "electrostatics";
  if (has("OHM", "RESISTANCE", "RESISTOR", "INTERNAL_R", "EMF_EQN", "EMF_DEF", "EMF_FACTORS", "EMF_TERMINAL", "EMF_REARRANGE", "EMF_PRACTICAL", "SERIES", "PARALLEL", "TERMINAL_VOLT", "CIRCUIT", "CURRENT_DIVID", "V_EQUALS_IR", "POWER_DISSIP", "CELL_EMF", "AMMETER", "VOLTMETER", "CURRENT_DEF", "CURRENT_UNIT", "CURRENT_USED_UP", "CONVENTIONAL_CURRENT", "ELECTRON_FLOW", "CHARGE_CURRENT_TIME", "LOST_VOLTS", "POTENTIAL_DIFFERENCE")) return "circuits";
  if (has("RMS", "GENERATOR", "MOTOR", "ALTERNATING", "SLIP_RING", "COMMUTATOR", "BRUSH", "AC_DC", "AC_WAVEFORM", "AC_AVG", "V_MAX", "I_MAX", "ELECTRODYNAMIC", "FARADAY", "FLUX", "BACK_EMF", "ELECTROMAGNET", "INDUCTION", "INDUCED_EMF", "MAGNETIC_FIELD", "EARTH_FIELD", "EARTH_POLES", "COMPASS", "FIELD_REVERSAL", "CURRENT_FIELD", "SOLENOID", "RIGHT_HAND")) return "electrodynamics";
  if (has("ELECTRON_CONFIG", "AUFBAU", "ISOTOPE", "ION_CHARGE", "IONISATION", "IONIZATION", "EMISSION_SPECTRUM", "EMISSION_COLOUR", "ATOMIC_MODEL", "ATOMIC_NUMBER", "MASS_NUMBER", "PERIODIC_TREND", "PERIODIC_TABLE", "QUANTUM", "ENERGY_LEVEL", "ENERGY_QUANTIZ", "ORBITAL", "CONFIG_", "ELECTRON_COUNT", "VALENCE_ELECTRON", "NEUTRON", "PROTON_NUMBER", "SUBATOMIC", "GROUND_STATE", "EXCITED_STATE")) return "atomic";
  if (has("HBONDING", "H_BOND", "IMF", "DIPOLE", "LONDON", "VAN_DER_WAAL", "VSEPR", "MOLECULAR_SHAPE", "MOLECULAR_STRUCTURE", "LEWIS", "LONE_PAIR", "BONDING_PAIR", "BONDING_ELECTRON", "BOND_ELECTRON", "BOND_PAIR", "BOND_TYPE", "BOND_PREDICT", "BOND_STRENGTH", "DATIVE_BOND", "DOUBLE_BOND", "TRIPLE_BOND", "DIATOMIC", "POLARITY", "POLAR_MOLECULE", "ELECTRONEGATIV", "COVALENT", "IONIC_BOND", "IONIC_LATTICE", "METALLIC_BOND", "VS_BP", "VAPOUR_PRESSURE", "BOILING_POINT", "MELTING_POINT", "CHAIN_LENGTH", "BRANCHING_BP", "VISCOSITY", "SURFACE_TENSION", "COOLING_CURVE", "HEATING_CURVE", "STATE_CHANGE", "EVAPORATION", "SUBLIMATION", "CONDUCTIVITY_IONS")) return "bonding";
  if (has("MOLE", "MOLAR", "BALANC", "LIMITING", "YIELD", "EMPIRICAL", "MOLECULAR_FORMULA", "CONCENTRATION", "CONC_FROM", "VOLUME_UNIT", "STOICH", "PERCENT_COMPOSITION", "PERCENT_YIELD", "PERCENT_PURITY", "AVOGADRO", "N_EQUALS_M", "GAS_VOLUME", "MOLAR_VOLUME", "ATOM_CONSERV", "ATOM_COUNT", "ATOM_ECONOMY", "CHANGE_SUBSCRIPT", "FORMULA_CONVERSION", "FORMULA_RECALL", "ELEMENT_DEF", "COMPOUND_DEF", "FREE_ELEMENT", "CHEMICAL_CHANGE", "BOYLE", "CHARLES", "GAS_LAW", "COMBINED_GAS", "ABSOLUTE_ZERO", "IDEAL_GAS", "KELVIN_CONVER", "CONTACT_PROCESS", "HABER", "REDUCTION_ROAST", "TITRATION_CALC")) return "stoichiometry";
  if (has("RATE", "COLLISION_THEORY", "CATALYST", "ICE_", "ICE_SETUP", "KC_", "EQUILIBRIUM", "LE_CHATELIER", "REACTION_QUOTIENT", "EQ_CONSTANT", "ACTIVATED_COMPLEX", "DYNAMIC_NATURE", "EQUAL_VS_CONSTANT", "REVERSIBLE", "FORWARD_REVERSE", "YIELD_SHIFT", "CONC_TIME_GRAPH")) return "rate_equilibrium";
  if (has("ACID", "BASE", "PH_", "POH", "CONJUGATE", "AMPHOL", "AMPHIPROT", "AMPHOTER", "ARRHENIUS", "BRONSTED", "NEUTRALIS", "TITRAT", "ENDPOINT", "EQUIV_POINT", "EQUIVALENCE", "INDICATOR", "KA_", "KB_", "KW_", "HYDROLYSIS", "STRONG_WEAK", "DIPROTIC", "MONOPROTIC", "PROTON_DONOR", "PROTON_ACCEPT", "DILUTION_PH", "BURETTE", "FLASK_WATER", "SALT_HYDROLYSIS", "OXIDE_ACIDIC")) return "acids_bases";
  if (has("IUPAC", "ISOMER", "FUNCTIONAL_GROUP", "ALKANE", "ALKENE", "ALKYNE", "ALCOHOL", "ALDEHYDE", "KETONE", "ESTER", "ETHER", "AMINE", "HALOALKANE", "HALOGENOALKANE", "CARBOXYLIC", "ADDITION_RXN", "ADDITION_PRODUCT", "HYDRATION", "HYDROHALOGEN", "HALOGENATION", "HYDROGENATION", "ELIMINATION", "DEHYDRATION", "DEHYDROHALOGEN", "SUBSTITUTION", "ESTERIFICATION", "REACTION_TYPE", "SUFFIX", "PREFIX", "HOMOLOGOUS", "SATURATED", "UNSATURATED", "CRACKING", "COMBUSTION_PRODUCT", "ORGANIC", "MACRO_PROPERT", "MARKOVNIKOV", "STRUCTURAL_FORMULA", "CONDENSED_FORMULA", "BIFUNCTIONAL", "POLYMER", "MONOMER", "PLASTIC")) return "organic";
  if (has("EXO", "ENDO", "ENTHALPY", "DELTA_H", "ACTIVATION_ENERGY", "BOND_ENERGY", "HEAT_OF_REACTION", "ENERGY_PROFILE", "ENERGY_DIAGRAM", "ENERGY_CHANGE_SIGN", "POTENTIAL_ENERGY_DIAGRAM")) return "energy_changes";
  return "skills";
}

/**
 * Resolve the best plain-language explanation for a question's error codes.
 * Two layers: a sharp authored entry for the code if one exists, otherwise the
 * misconception family the code belongs to. Always returns something when codes
 * are present, so every wrong answer gets clear feedback. Codes are listed in
 * priority order (primary misconception first), so the first usable one wins.
 */
export function resolveErrorExplanation(
  codes?: string[] | null,
  namespace: "maths" | "maths-literacy" | "physical-sciences" = "maths"
): ErrorExplanation | null {
  if (!codes || codes.length === 0) return null;

  // Maths Literacy carries its own 248-code vocabulary (finance, tariffs, rates,
  // measurement, data). Those codes are meaningless to the maths family map, so
  // resolve them against the Maths-Lit map + family classifier instead.
  if (namespace === "maths-literacy") {
    for (const code of codes) {
      const hit = ML_ERROR_EXPLANATIONS[code];
      if (hit) return { ...ML_FAMILIES[mlFamilyOf(code)], ...hit };
    }
    return ML_FAMILIES[mlFamilyOf(codes[0])];
  }

  // Physical Sciences has ~1000 finely-split codes across mechanics, waves,
  // electricity, matter and all of chemistry — far too many for bespoke entries.
  // Its per-question `explanation` already covers the "why", so this map only
  // needs the misconception family for label / what / how / example / where.
  if (namespace === "physical-sciences") {
    for (const code of codes) {
      const hit = PHYSSCI_ERROR_EXPLANATIONS[code];
      if (hit) return { ...PHYSSCI_FAMILIES[physSciFamilyOf(code)], ...hit };
    }
    return PHYSSCI_FAMILIES[physSciFamilyOf(codes[0])];
  }

  // Prefer a sharp, code-specific entry from any of the listed codes. Layer it
  // over its misconception family so the sharp label/why/how/example win, but
  // any part the sharp entry omits (typically `what` / `where`) is backfilled
  // from the family — guaranteeing all five parts are always present.
  for (const code of codes) {
    const hit = ERROR_EXPLANATIONS[code];
    if (hit) return { ...ERROR_FAMILIES[familyOf(code)], ...hit };
  }
  // Otherwise fall back to the first code's misconception family.
  return ERROR_FAMILIES[familyOf(codes[0])];
}
