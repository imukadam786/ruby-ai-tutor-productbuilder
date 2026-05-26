// Adds the 5 FET levels (L18–L22) to data/skill-tree.json so the senior-phase
// question domains (M013 quadratics, M014 functions, M015 exp/log, M016 trig,
// M017 differentiation) become reachable through the tree. Each new level's
// single atomic skill id matches the skill_ids already declared by its domain
// in question-bank.json, and the level number matches LEVEL_TO_DOMAIN in
// lib/question-selector.ts (18→M013 … 22→M017). No code change needed.
//
//   node scripts/add-fet-maths-levels.mjs
import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "data/skill-tree.json");
const raw = fs.readFileSync(FILE, "utf8");
const tree = JSON.parse(raw);

const NEW_LEVELS = [
  {
    id: 18,
    title: "Quadratic expressions and factorising",
    description:
      "Factorise quadratic expressions of the form x² + bx + c — the gateway skill for senior-phase algebra",
    tiers: [
      {
        id: "L18.T1",
        title: "Factorising quadratics",
        atomic_skills: [
          {
            id: "L18.T1.A1",
            title: "Factorising quadratic expressions (e.g. x² + 5x + 6)",
            description:
              "Write a quadratic of the form x² + bx + c as a product of two brackets by finding two numbers that multiply to give c and add to give b",
            prerequisites: ["L13.T3.A2", "L13.T2.A2"],
            templates: ["symbolic"],
            error_signatures: [
              {
                type: "strategy_gap",
                description:
                  "Finds a factor pair that multiplies to c but does not add to b",
                example: "x² + 5x + 6 → (x+1)(x+6) because 1×6=6, ignoring that 1+6≠5",
              },
              {
                type: "execution_slip",
                description: "Gets the signs of the bracket terms wrong",
                example: "x² − 5x + 6 → (x+2)(x+3) instead of (x−2)(x−3)",
              },
            ],
            recovery_strategy:
              "List factor pairs of c, then test which pair adds to b. Check signs: if c is positive both brackets share b's sign; if c is negative the signs differ. Verify by expanding.",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false,
            },
          },
        ],
      },
    ],
  },
  {
    id: 19,
    title: "Functions and graphs",
    description:
      "Read the key features of a straight-line function: the y-intercept, x-intercept and gradient",
    tiers: [
      {
        id: "L19.T1",
        title: "Key features of functions",
        atomic_skills: [
          {
            id: "L19.T1.A1",
            title: "Finding the intercepts and gradient of a linear function",
            description:
              "For a function like y = mx + c, state the y-intercept, the x-intercept and the gradient",
            prerequisites: ["L14.T1.A1", "L13.T3.A1"],
            templates: ["symbolic", "story"],
            error_signatures: [
              {
                type: "conceptual_gap",
                description: "Confuses the y-intercept with the gradient",
                example: "For y = 2x − 4 says the y-intercept is 2 (the gradient) instead of −4",
              },
              {
                type: "execution_slip",
                description: "Sign error when solving for the x-intercept",
                example: "y = x + 3 → x-intercept given as 3 instead of −3",
              },
            ],
            recovery_strategy:
              "y-intercept: set x = 0. x-intercept: set y = 0 and solve. Gradient: the number multiplying x. Sketch the line to confirm the intercepts make sense.",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false,
            },
          },
        ],
      },
    ],
  },
  {
    id: 20,
    title: "Exponents and logarithms",
    description:
      "Convert between exponential and logarithmic form and evaluate simple powers and logs",
    tiers: [
      {
        id: "L20.T1",
        title: "Exponential and logarithmic form",
        atomic_skills: [
          {
            id: "L20.T1.A1",
            title: "Converting between exponential and logarithmic form",
            description:
              "Use the fact that bˣ = n is the same statement as log_b(n) = x to evaluate powers and logarithms",
            prerequisites: ["L13.T2.A1", "L18.T1.A1"],
            templates: ["symbolic"],
            error_signatures: [
              {
                type: "conceptual_gap",
                description: "Swaps the base and the exponent when converting",
                example: "log₂(8) read as 'how many 8s make 2' instead of 'what power of 2 gives 8'",
              },
              {
                type: "execution_slip",
                description: "Arithmetic slip evaluating the power",
                example: "2³ given as 6 (2×3) instead of 8 (2×2×2)",
              },
            ],
            recovery_strategy:
              "Read log_b(n) as 'what power of b gives n?'. Build the matching power: b¹, b², b³ … until you reach n. Connect each log to its exponential twin.",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false,
            },
          },
        ],
      },
    ],
  },
  {
    id: 21,
    title: "Trigonometry",
    description:
      "Use the trigonometric ratios sin, cos and tan in right-angled triangles",
    tiers: [
      {
        id: "L21.T1",
        title: "Trigonometric ratios",
        atomic_skills: [
          {
            id: "L21.T1.A1",
            title: "Finding sin, cos and tan in a right-angled triangle",
            description:
              "Identify the opposite, adjacent and hypotenuse for a chosen angle and write sin = opp/hyp, cos = adj/hyp, tan = opp/adj",
            prerequisites: ["L15.T1.A1", "L11.T1.A1"],
            templates: ["symbolic", "story"],
            error_signatures: [
              {
                type: "conceptual_gap",
                description: "Mixes up opposite and adjacent relative to the chosen angle",
                example: "Uses the side next to the angle as the 'opposite' when finding sin",
              },
              {
                type: "execution_slip",
                description: "Writes the ratio upside down",
                example: "tan given as adj/opp instead of opp/adj",
              },
            ],
            recovery_strategy:
              "Label the triangle from the chosen angle first: hypotenuse is opposite the right angle, opposite faces the angle, adjacent is the remaining side. Use SOH-CAH-TOA to pick the ratio.",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false,
            },
          },
        ],
      },
    ],
  },
  {
    id: 22,
    title: "Introduction to calculus",
    description:
      "Differentiate polynomials with the power rule and read the derivative as a rate of change",
    tiers: [
      {
        id: "L22.T1",
        title: "Differentiation — the power rule",
        atomic_skills: [
          {
            id: "L22.T1.A1",
            title: "Differentiating polynomials using the power rule",
            description:
              "Apply the power rule: the derivative of xⁿ is n·xⁿ⁻¹; differentiate sums of power terms",
            prerequisites: ["L19.T1.A1", "L18.T1.A1"],
            templates: ["symbolic"],
            error_signatures: [
              {
                type: "strategy_gap",
                description: "Subtracts 1 from the power but forgets to multiply by the old power",
                example: "d/dx(x³) given as x² instead of 3x²",
              },
              {
                type: "execution_slip",
                description: "Mishandles the derivative of a constant or a linear term",
                example: "d/dx(5) given as 5 instead of 0; d/dx(4x) given as 4x instead of 4",
              },
            ],
            recovery_strategy:
              "Bring the power down to the front as a multiplier, then reduce the power by 1. Remember: the derivative of a constant is 0, and the derivative of ax is a.",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false,
            },
          },
        ],
      },
    ],
  },
];

// Guard against double-runs / pre-existing levels.
const existing = new Set(tree.levels.map((l) => l.id));
const toAdd = NEW_LEVELS.filter((l) => !existing.has(l.id));
if (toAdd.length === 0) {
  console.log("All FET levels already present — nothing to do.");
  process.exit(0);
}
tree.levels.push(...toAdd);

// Preserve original formatting: 2-space indent, CRLF, trailing newline.
let out = JSON.stringify(tree, null, 2).replace(/\n/g, "\r\n") + "\r\n";
fs.writeFileSync(FILE, out);
console.log(
  `Added levels: ${toAdd.map((l) => "L" + l.id).join(", ")}. Tree now has ${tree.levels.length} levels.`
);
