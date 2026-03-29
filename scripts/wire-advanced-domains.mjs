/**
 * wire-advanced-domains.mjs
 *
 * 1. Adds L18–L22 to skill-tree.json (Grade 10-12 topics)
 * 2. Sets skill_ids on M013–M017 in question-bank.json
 * 3. Updates LEVEL_TO_DOMAIN in question-selector.ts (lines 13→18, 14→19, 15→20, 16→21, 17→22 are wrong — actually we add 18-22)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── 1. Extend skill-tree.json ────────────────────────────────────────────────

const treePath = join(__dirname, '../data/skill-tree.json');
const tree = JSON.parse(readFileSync(treePath, 'utf8'));

const newLevels = [
  {
    id: 18,
    title: "Quadratic Algebra",
    description: "Factorise and work with quadratic expressions of the form x² + bx + c",
    tiers: [
      {
        id: "L18.T1",
        title: "Quadratic Factorisation",
        atomic_skills: [
          {
            id: "L18.T1.A1",
            title: "Factorise quadratic expressions of the form x² + bx + c",
            description: "Find two binomial factors by identifying a pair of numbers that multiply to c and add to b",
            prerequisites: ["L13.T3.A2"],
            templates: ["symbolic"],
            error_signatures: [
              {
                type: "sign_error",
                description: "Chooses factors with wrong signs",
                example: "x² - 5x + 6 → (x + 2)(x + 3) instead of (x - 2)(x - 3)"
              },
              {
                type: "factor_error",
                description: "Correct sign but wrong pair of numbers",
                example: "x² + 5x + 6 → (x + 1)(x + 6) instead of (x + 2)(x + 3)"
              }
            ],
            recovery_strategy: "List factor pairs of c. Check which pair adds to b. Then assign signs to satisfy the sum.",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false
            }
          }
        ]
      }
    ]
  },
  {
    id: 19,
    title: "Functions and Straight Lines",
    description: "Interpret and work with linear functions in the form y = mx + c",
    tiers: [
      {
        id: "L19.T1",
        title: "Key Features of Linear Functions",
        atomic_skills: [
          {
            id: "L19.T1.A1",
            title: "Identify gradient, x-intercept and y-intercept of a linear function",
            description: "For y = mx + c: identify gradient m, y-intercept by setting x=0, x-intercept by setting y=0",
            prerequisites: ["L14.T2.A1"],
            templates: ["symbolic"],
            error_signatures: [
              {
                type: "intercept_confusion",
                description: "Swaps x-intercept and y-intercept",
                example: "For y = 2x - 4 gives y-int: 2 instead of -4"
              },
              {
                type: "gradient_sign_error",
                description: "Drops the sign of the gradient",
                example: "For y = -3x + 1 gives gradient: 3 instead of -3"
              }
            ],
            recovery_strategy: "y-intercept: substitute x=0 and solve. x-intercept: substitute y=0 and solve. Gradient is the coefficient of x including its sign.",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false
            }
          }
        ]
      }
    ]
  },
  {
    id: 20,
    title: "Exponentials and Logarithms",
    description: "Convert between exponential and logarithmic notation and evaluate expressions",
    tiers: [
      {
        id: "L20.T1",
        title: "Exponential and Log Conversion",
        atomic_skills: [
          {
            id: "L20.T1.A1",
            title: "Convert between exponential and logarithmic form",
            description: "Apply the definition log_b(x) = n ↔ b^n = x to evaluate and convert expressions",
            prerequisites: ["L18.T1.A1"],
            templates: ["symbolic"],
            error_signatures: [
              {
                type: "base_confusion",
                description: "Confuses base and argument in the log",
                example: "log₂(8) = 2 instead of 3 (confuses base with answer)"
              },
              {
                type: "log_exp_swap",
                description: "Applies log rules to exponential or vice versa",
                example: "2³ = 6 instead of 8 (adds instead of multiplies)"
              }
            ],
            recovery_strategy: "Write log_b(x) = n as b^n = x. Ask: what power do I raise b to, to get x?",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false
            }
          }
        ]
      }
    ]
  },
  {
    id: 21,
    title: "Trigonometric Ratios",
    description: "Apply SOH CAH TOA to find sine, cosine and tangent in right-angled triangles",
    tiers: [
      {
        id: "L21.T1",
        title: "Trigonometry in Right-Angled Triangles",
        atomic_skills: [
          {
            id: "L21.T1.A1",
            title: "Find sine, cosine and tangent using SOH CAH TOA",
            description: "Identify opposite, adjacent and hypotenuse relative to a given angle; compute the three trig ratios",
            prerequisites: ["L15.T2.A1"],
            templates: ["symbolic"],
            error_signatures: [
              {
                type: "side_swap",
                description: "Swaps opposite and adjacent",
                example: "Uses adjacent/hypotenuse for sine instead of opposite/hypotenuse"
              },
              {
                type: "ratio_inversion",
                description: "Inverts the ratio (flips numerator and denominator)",
                example: "sin θ = hypotenuse/opposite instead of opposite/hypotenuse"
              }
            ],
            recovery_strategy: "Label the triangle first: H=hypotenuse (longest), O=opposite the angle, A=adjacent. Then SOH: sin=O/H, CAH: cos=A/H, TOA: tan=O/A.",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false
            }
          }
        ]
      }
    ]
  },
  {
    id: 22,
    title: "Calculus — Differentiation",
    description: "Differentiate polynomial functions using the power rule",
    tiers: [
      {
        id: "L22.T1",
        title: "Differential Calculus",
        atomic_skills: [
          {
            id: "L22.T1.A1",
            title: "Differentiate polynomial functions using the power rule",
            description: "Apply d/dx(axⁿ) = naxⁿ⁻¹ to each term; differentiate sums and differences of power functions",
            prerequisites: ["L20.T1.A1"],
            templates: ["symbolic"],
            error_signatures: [
              {
                type: "power_not_decremented",
                description: "Multiplies by the power but forgets to reduce it by 1",
                example: "d/dx(x³) = 3x³ instead of 3x²"
              },
              {
                type: "coefficient_error",
                description: "Drops or miscalculates the new coefficient after multiplying",
                example: "d/dx(4x²) = 2x instead of 8x"
              }
            ],
            recovery_strategy: "For each term axⁿ: new coefficient = n×a, new power = n-1. Constants differentiate to 0.",
            mastery_criteria: {
              correct_required: 3,
              formats_required: 1,
              allow_scaffolding: false
            }
          }
        ]
      }
    ]
  }
];

const existingIds = new Set(tree.levels.map(l => l.id));
let added = 0;
for (const level of newLevels) {
  if (existingIds.has(level.id)) {
    console.log(`Level ${level.id} already exists — skipping`);
  } else {
    tree.levels.push(level);
    added++;
  }
}
writeFileSync(treePath, JSON.stringify(tree, null, 2), 'utf8');
console.log(`✓ skill-tree.json: added ${added} levels (L18–L22)`);

// ─── 2. Wire skill_ids on M013–M017 ──────────────────────────────────────────

const bankPath = join(__dirname, '../data/question-bank.json');
const bank = JSON.parse(readFileSync(bankPath, 'utf8'));

const skillIdMap = {
  M013: ["L18.T1.A1"],
  M014: ["L19.T1.A1"],
  M015: ["L20.T1.A1"],
  M016: ["L21.T1.A1"],
  M017: ["L22.T1.A1"],
};

for (const [domainId, skillIds] of Object.entries(skillIdMap)) {
  const domain = bank.domains[domainId];
  if (!domain) { console.error(`Domain ${domainId} not found`); continue; }
  if (domain.skill_ids.length > 0) {
    console.log(`${domainId}: skill_ids already set (${domain.skill_ids.join(', ')}) — skipping`);
    continue;
  }
  domain.skill_ids = skillIds;
  console.log(`✓ ${domainId} (${domain.title}): skill_ids → [${skillIds.join(', ')}]`);
}

writeFileSync(bankPath, JSON.stringify(bank, null, 2), 'utf8');
console.log(`✓ question-bank.json updated`);

// ─── 3. Update LEVEL_TO_DOMAIN in question-selector.ts ────────────────────────

const selectorPath = join(__dirname, '../lib/question-selector.ts');
let src = readFileSync(selectorPath, 'utf8');

// Insert entries for levels 18-22 after the existing level 17 entry
const oldEntry = `  17: "M018",  // Advanced Problem Solving`;
const newEntry = `  17: "M018",  // Advanced Problem Solving
  18: "M013",  // Quadratic Algebra
  19: "M014",  // Functions and Straight Lines
  20: "M015",  // Exponentials and Logarithms
  21: "M016",  // Trigonometric Ratios
  22: "M017",  // Calculus — Differentiation`;

if (src.includes(oldEntry) && !src.includes('18: "M013"')) {
  src = src.replace(oldEntry, newEntry);
  writeFileSync(selectorPath, src, 'utf8');
  console.log(`✓ question-selector.ts: LEVEL_TO_DOMAIN extended to level 22`);
} else if (src.includes('18: "M013"')) {
  console.log(`question-selector.ts: levels 18-22 already present — skipping`);
} else {
  console.error(`Could not locate level 17 entry in LEVEL_TO_DOMAIN — manual edit required`);
}

console.log('\nDone. M013-M017 now connected to L18-L22 skills.');
