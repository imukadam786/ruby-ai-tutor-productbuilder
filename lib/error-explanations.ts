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
  /** WHY it happened — one sentence */
  why: string;
  /** HOW to fix it — the corrective step */
  how: string;
  /** Layman's example — everyday analogy. DRAFT, pending head-of-ed review. */
  example: string;
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
};

/**
 * Resolve the most relevant explanation for a question's error codes.
 * Returns the first code that has an authored entry, or null if none match.
 *
 * The codes are listed on the question in priority order (primary misconception
 * first), so first-match is a reasonable default. A future layer could use the
 * student's actual answer to pick the precise code.
 */
export function resolveErrorExplanation(
  codes?: string[] | null
): ErrorExplanation | null {
  if (!codes || codes.length === 0) return null;
  for (const code of codes) {
    const hit = ERROR_EXPLANATIONS[code];
    if (hit) return hit;
  }
  return null;
}
