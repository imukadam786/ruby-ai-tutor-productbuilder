// ─── Economic & Management Sciences — Senior Phase (Grades 7–9) generator ─────
//
// Emits two data files from the CAPS EMS SP curriculum map below:
//   • data/ems-sp-skill-tree.json    (the full 102-skill tree)
//   • data/ems-sp-question-bank.json  (one pool per skill; questions authored
//                                       in a later pass)
//
// EMS is one subject made of three CAPS strands — The Economy, Financial
// Literacy and Entrepreneurship — each taught every term. The tree models:
//   level (grade 7/8/9) → tier (one CAPS strand-topic) → atomic_skill (sub-topic).
// Tiers are grouped by strand (Economy → Financial Literacy → Entrepreneurship),
// then by term. Topic ids carry the strand (E1–/F1–/B1–); the atomic skill id IS
// the bank topic key, e.g. "EMS.G7.E1.A1".
//
// Content-subject rule (shared with Natural Sciences SP / Social Sciences SP):
// no timer, 0.6 pass mark per pool, 20-item target pool, mastery = 75% accuracy
// over 80%-of-pool coverage (capped 20) — see lib/content-mastery.ts.
//
// Two authoring flags carried onto skills:
//   • defer: true  → procedural accounting "recording/posting" skills, deferred
//                    to a later authoring pass (concepts ship first). The pool is
//                    still created (empty) so the tree stays CAPS-complete.
//   • image: true  → items that wait on a head-of-ed diagram (circular flow,
//                    demand/supply curves). Concept items are still authored now.
//
// Re-run any time: node scripts/build-ems-sp.mjs
// Rebuilds the skill tree in full and MERGES into any existing question bank,
// preserving already-authored questions (so re-running never wipes content).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "data");
const TREE_PATH = join(DATA, "ems-sp-skill-tree.json");
const BANK_PATH = join(DATA, "ems-sp-question-bank.json");

// Default tap mechanics per strand. Graph/diagram topics add data-interpret +
// diagram-label (those items wait on head-of-ed images).
const ECON_TEMPLATES = ["choice", "true-false", "cloze", "match", "sequence", "sort-buckets", "data-interpret"];
const FIN_TEMPLATES = ["choice", "true-false", "cloze", "match", "sort-buckets", "sequence"];
const ENT_TEMPLATES = ["choice", "true-false", "cloze", "match", "sequence", "sort-buckets"];
const GRAPH_TEMPLATES = ["choice", "true-false", "cloze", "match", "data-interpret", "diagram-label", "sort-buckets"];

const STRAND_LABEL = { E: "The Economy", F: "Financial Literacy", B: "Entrepreneurship" };
const STRAND_ORDER = { E: 0, F: 1, B: 2 };
const STRAND_TEMPLATES = { E: ECON_TEMPLATES, F: FIN_TEMPLATES, B: ENT_TEMPLATES };

// ─── Curriculum map ───────────────────────────────────────────────────────────
// Each topic: { code, title, term, templates?, image?, skills: [[title, desc, recovery, opts?], …] }
// opts (optional 4th element): { defer: true } | { image: true }

const G7 = [
  // ── The Economy ──
  { code: "E1", term: 1, title: "History of money", skills: [
    ["Barter and early money", "How traditional societies traded by barter, and early forms of money like promissory notes.", "Barter = swapping goods directly, with no money in between."],
    ["Coins and paper money", "The move from barter to coins and paper money, and why money made trade easier.", "Money solved barter's problem: you no longer need a perfect match to trade."],
    ["Electronic banking and the role of money", "Electronic banking today, and the roles money plays (medium of exchange, store of value, measure of value).", "Money does three jobs: it pays, it stores wealth, and it prices things."],
  ]},
  { code: "E2", term: 1, title: "Needs and wants", skills: [
    ["Needs of individuals to countries", "The basic needs of individuals, families, communities and whole countries.", "A need is something you must have to live; bigger groups have bigger needs."],
    ["Primary and secondary needs", "Telling primary needs (food, water, shelter) from secondary needs that make life better.", "Primary = survival; secondary = comfort and quality of life."],
    ["Unlimited wants, limited resources", "Why wants are unlimited but the resources to satisfy them are limited, and what that means for choices.", "We can't have everything — limited resources force us to choose."],
  ]},
  { code: "E3", term: 1, title: "Goods and services", skills: [
    ["Goods versus services", "The difference between goods and services, with everyday examples of each.", "A good is a thing you can touch; a service is a job done for you."],
    ["Producers and consumers", "Producers and consumers, and how households act as both.", "Households earn by producing and spend by consuming."],
    ["Using goods and services wisely", "Using goods and services efficiently and effectively, and recycling and reusing to satisfy needs and wants.", "Efficient use and recycling make limited resources go further."],
  ]},
  { code: "E4", term: 3, title: "Inequality and poverty", skills: [
    ["Causes of socio-economic imbalances", "The causes of socio-economic imbalances and inequality in South Africa.", "Inequality has roots in history, unequal access and unemployment."],
    ["Urban and rural challenges", "The different challenges faced in urban and in rural areas.", "Cities and rural areas face different versions of poverty and inequality."],
    ["Fighting inequality with education and jobs", "How education, skills and sustainable job creation help fight inequality and injustice.", "Skills and jobs are the long-term tools against inequality."],
  ]},
  { code: "E5", term: 4, title: "The production process", skills: [
    ["Inputs and outputs", "The meaning of production, and the inputs that are turned into outputs.", "Production turns inputs (materials, labour) into outputs (goods/services)."],
    ["Economic growth and productivity", "The meaning of economic growth and productivity, and how productivity affects growth.", "Productivity = getting more output from the same inputs; it drives growth."],
    ["Technology and sustainable resources", "How technology improves productivity, and the sustainable use of resources in production.", "Technology lifts output; sustainability keeps resources for the future."],
  ]},
  // ── Financial Literacy ──
  { code: "F1", term: 2, title: "Accounting concepts", skills: [
    ["Capital, assets and liabilities", "The meaning of capital, assets and liabilities in everyday financial terms.", "Assets = what you own; liabilities = what you owe; capital = the owner's stake."],
    ["Income, expenses, profit and loss", "Income and expenses, and how they produce a profit or a loss.", "Profit = income minus expenses; a loss is when expenses win."],
    ["Budgets, savings, banking and records", "Budgets, savings, banking, transactions and keeping financial records.", "Records track money in and out; a budget plans it ahead."],
  ]},
  { code: "F2", term: 2, title: "Income and expenses", skills: [
    ["Personal income", "Personal income and the different types of income a person can earn.", "Income is money coming in — wages, salary, pocket money, interest."],
    ["Personal expenses and net worth", "Personal expenses and drawing up a personal statement of net worth.", "Net worth = what you own minus what you owe."],
    ["Business income and expenses", "Types of income businesses receive and expenses they have, and savings and investment in a business.", "Businesses have their own income and expenses, just on a bigger scale."],
  ]},
  { code: "F3", term: 2, title: "Budgets", skills: [
    ["Personal budget", "What a budget is, and drawing up a simple personal budget of income and expenditure.", "A budget makes sure spending does not beat income."],
    ["Business budget", "The purpose of a business budget and how it differs from a personal one.", "A business budget plans the firm's income and spending."],
  ]},
  { code: "F4", term: 4, title: "Savings", skills: [
    ["Personal savings and its purpose", "Personal savings and why saving matters for the future.", "Saving = spending less than you earn and keeping the rest."],
    ["Banks and their services", "The history and role of banks and the services they offer.", "Banks keep money safe, lend it out, and help with payments."],
    ["Opening accounts and savings schemes", "Opening a savings account, community savings schemes (e.g. stokvels) and financial institutions.", "From bank accounts to stokvels — many ways to save together."],
  ]},
  // ── Entrepreneurship ──
  { code: "B1", term: 1, title: "Businesses", skills: [
    ["Formal and informal businesses", "The difference between formal and informal businesses, with their advantages and disadvantages.", "Formal = registered and taxed; informal = small and unregistered."],
    ["Types of businesses", "Trading, manufacturing and service businesses, both formal and informal.", "Trading sells goods, manufacturing makes them, service does jobs."],
    ["Businesses, disasters and epidemics", "The role of businesses as producers and consumers, and how natural disasters and health epidemics affect them.", "Businesses both make and buy — and shocks hit both sides."],
  ]},
  { code: "B2", term: 3, title: "The entrepreneur", skills: [
    ["Who is an entrepreneur?", "The definition and characteristics of an entrepreneur.", "An entrepreneur spots a need and takes a risk to meet it for profit."],
    ["Entrepreneurial skills and actions", "The skills of an entrepreneur and the actions of buying, selling, producing and making a profit.", "Entrepreneurs buy, make and sell — aiming to end with more than they started."],
  ]},
  { code: "B3", term: 3, title: "Starting a business", skills: [
    ["SWOT and setting goals", "Analysing strengths, weaknesses, opportunities and threats (SWOT), and setting and achieving goals.", "SWOT: two inside (strengths/weaknesses), two outside (opportunities/threats)."],
    ["Advertising", "The concept of advertising, the media used, and the principles of good advertising.", "Advertising tells the right people, in the right place, why to buy."],
    ["Simple cost calculation", "Working out variable cost, fixed cost and a selling price for a simple product.", "Fixed cost stays the same; variable cost grows with how much you make."],
  ]},
  { code: "B4", term: 3, title: "Entrepreneur's Day", skills: [
    ["Hosting Entrepreneur's Day", "Planning and hosting an Entrepreneur's Day, including budgeting and using recycled materials.", "Plan it like a real stall: product, price, costs and a budget."],
    ["Income and expenditure statement", "Drawing up a simple income and expenditure statement for the event.", "Income minus expenses on the day shows if you made a profit."],
  ]},
];

const G8 = [
  // ── The Economy ──
  { code: "E1", term: 1, title: "Government", skills: [
    ["Levels of government", "The meaning of government and the national, provincial and local levels.", "Three levels: national, provincial and local — each with its own jobs."],
    ["Government and households", "The roles of the different levels of government towards households, as both consumer and producer.", "Government serves households — and also buys and provides."],
    ["Government and businesses", "The roles of the different levels of government towards businesses, as both consumer and producer.", "Government buys from, regulates and supports businesses."],
  ]},
  { code: "E2", term: 1, title: "The National Budget", skills: [
    ["Government revenue: tax", "Government revenue through direct tax and indirect tax.", "Direct tax is on income; indirect tax is on what you buy (like VAT)."],
    ["Government expenditure", "Government spending on services such as education, health, housing, grants, transport and security.", "Tax money is spent on public services everyone uses."],
    ["The budget, growth and inequality", "How the National Budget influences economic growth and redresses economic inequality.", "The budget is a tool to grow the economy and reduce unfairness."],
  ]},
  { code: "E3", term: 1, title: "Standard of living", skills: [
    ["Lifestyles and types of society", "Lifestyles, and self-sufficient, modern and rural societies.", "Standard of living = how comfortably people are able to live."],
    ["Development, environment and unemployment", "The impact of development on the environment, unemployment, and the productive use of resources.", "Higher living standards must be weighed against the environmental cost."],
  ]},
  { code: "E4", term: 2, title: "Markets", skills: [
    ["The goods and services market", "The market for goods and services and how it works.", "In the goods market, households buy what businesses sell."],
    ["The factor market", "The factor market — the labour market and the financial market.", "In the factor market, businesses buy labour and finance."],
  ]},
  // ── Financial Literacy ──
  { code: "F1", term: 1, title: "Accounting concepts", skills: [
    ["Sole trader, debit and credit", "The sole trader as a business, and the meaning of debit and credit.", "A sole trader is one owner; debit and credit are the two sides of every entry."],
    ["The accounting equation", "The accounting equation: assets = owner's equity + liabilities (A = OE + L).", "The equation always balances: what you own = your stake + what you owe."],
    ["Effect of transactions on the equation", "How everyday cash transactions change assets, owner's equity and liabilities.", "Every transaction touches at least two parts, keeping the equation balanced."],
  ]},
  { code: "F2", term: 1, title: "Source documents", skills: [
    ["Receipts and deposit slips", "Receipts, deposit slips and till slips, and what each records.", "A source document is the paper proof that a transaction happened."],
    ["Cheques and counterfoils", "Cheques and cheque counterfoils, and how they are used.", "The counterfoil is the stub you keep as your record of the cheque."],
    ["Bank statements and invoices", "Bank statements and cash invoices, and the information they show.", "A bank statement is the bank's list of all your account activity."],
  ]},
  { code: "F3", term: 2, title: "The accounting cycle", skills: [
    ["Steps of the accounting cycle", "The order of the accounting cycle, from a transaction through to financial statements.", "Transaction → source doc → journal → ledger → trial balance → statements."],
    ["Purpose of the cash journals", "The purpose and importance of the Cash Journals of a service business.", "Cash journals are the first books where cash in and out are listed."],
  ]},
  { code: "F4", term: 2, title: "Cash Receipts Journal (service)", skills: [
    ["Concept and columns of the CRJ", "What the Cash Receipts Journal is, and the format and use of its columns.", "The CRJ lists all the money the business receives."],
    ["Entering receipts in the CRJ", "Entering cash transactions into the CRJ from source documents.", "Each receipt becomes one line in the CRJ.", { defer: true }],
    ["Closing off the CRJ", "Closing off the CRJ and the effect of these transactions on the accounting equation.", "Totalling the CRJ feeds the ledger and keeps the equation balanced.", { defer: true }],
  ]},
  { code: "F5", term: 3, title: "Cash Payments Journal (service)", skills: [
    ["Concept and columns of the CPJ", "What the Cash Payments Journal is, and the format and use of its columns.", "The CPJ lists all the money the business pays out."],
    ["Entering and closing the CPJ", "Entering cash payments and closing off the CPJ.", "Each payment becomes one line in the CPJ.", { defer: true }],
    ["Combined CRJ and CPJ", "Entering combined transactions in the CRJ and CPJ and their effect on the accounting equation.", "Together the two journals capture all the business's cash.", { defer: true }],
  ]},
  { code: "F6", term: 4, title: "General Ledger and Trial Balance (service)", skills: [
    ["Double-entry and T-accounts", "The double-entry principle and the layout of T-accounts in the General Ledger.", "Every entry has a debit side and a credit side — that's double entry."],
    ["Posting to the General Ledger", "Posting transactions from the CRJ and CPJ to the General Ledger.", "Posting copies the journal totals into the ledger accounts.", { defer: true }],
    ["Balancing and the Trial Balance", "Balancing the General Ledger and preparing a Trial Balance of a service business.", "A Trial Balance checks that total debits equal total credits.", { defer: true }],
  ]},
  // ── Entrepreneurship ──
  { code: "B1", term: 2, title: "Factors of production", skills: [
    ["Capital", "Capital as a factor of production — own capital and borrowed capital.", "Capital is the money and equipment a business uses to operate."],
    ["Labour", "Labour — unskilled, semi-skilled and skilled — and fair employment practices.", "Labour is the human effort; skill levels differ and so does pay."],
    ["Natural resources and entrepreneurship", "Natural resources and entrepreneurship as factors, and how each factor is rewarded (remuneration).", "Four factors: land, labour, capital, entrepreneurship — each earns a reward."],
  ]},
  { code: "B2", term: 3, title: "Forms of ownership", skills: [
    ["Sole trader and partnership", "The sole trader and the partnership — their characteristics, advantages and disadvantages.", "Sole trader = one owner; partnership = a few owners sharing."],
    ["Companies and close corporations", "Close corporations and private and public companies, and their characteristics.", "A company is a separate legal 'person' owned by shareholders."],
    ["Ownership and job creation", "Comparing the forms of ownership and their role in sustainable job creation and resource use.", "Bigger ownership forms can raise more money and create more jobs."],
  ]},
  { code: "B3", term: 4, title: "Levels and functions of management", skills: [
    ["Levels of management", "The different levels of management in a business.", "Top plans, middle organises, lower supervises day to day."],
    ["Management tasks", "The management tasks of planning, organising, leading and controlling.", "Four tasks: plan, organise, lead, control."],
    ["Management styles", "Characteristics of good management and the autocratic, laissez-faire and democratic styles.", "Styles range from 'I decide' (autocratic) to 'we decide' (democratic)."],
  ]},
];

const G9 = [
  // ── The Economy ──
  { code: "E1", term: 1, title: "Economic systems", skills: [
    ["The planned economy", "The planned (command) economy — its origin, characteristics, advantages and disadvantages.", "In a planned economy the government decides what is produced."],
    ["The market economy", "The market economy — its origin, characteristics, advantages and disadvantages.", "In a market economy, supply and demand decide, not the state."],
    ["The mixed economy and global economy", "The mixed economy, and South Africa within the global economy.", "A mixed economy blends market freedom with government's role."],
  ]},
  { code: "E2", term: 1, title: "The circular flow", image: true, templates: GRAPH_TEMPLATES, skills: [
    ["Participants in the circular flow", "The participants in the circular flow of a closed economy (households and businesses).", "Households and businesses depend on each other in a loop."],
    ["Flows of money, goods and factors", "The flow of goods and services, money and factors of production, shown on a flow diagram.", "Money flows one way, goods and factors the other — a closed loop.", { image: true }],
  ]},
  { code: "E3", term: 2, title: "Price theory", image: true, templates: GRAPH_TEMPLATES, skills: [
    ["The law of demand", "The law of demand, a demand schedule and the demand curve.", "Demand: when price goes up, quantity wanted goes down.", { image: true }],
    ["The law of supply", "The law of supply, a supply schedule and the supply curve.", "Supply: when price goes up, quantity offered goes up.", { image: true }],
    ["Equilibrium and shifts", "Equilibrium price and quantity, and changes/shifts in demand and supply.", "Equilibrium is where the demand and supply curves cross.", { image: true }],
  ]},
  { code: "E4", term: 3, title: "Trade unions", skills: [
    ["What trade unions are", "The concept of trade unions and a brief history of their development.", "A trade union is workers joining together to bargain as one."],
    ["The role of trade unions", "The roles and responsibilities of trade unions in South Africa, their effect on business, and their contribution to growth.", "Unions push for workers — affecting wages, conditions and the economy."],
  ]},
  // ── Financial Literacy ──
  { code: "F1", term: 1, title: "Cash journals (sole trader)", skills: [
    ["Cash transactions of a trading business", "Recording cash transactions of a trading (sole trader) business in the CRJ and CPJ.", "A trading business buys and sells stock — recorded in the cash journals.", { defer: true }],
    ["Effect on the accounting equation", "The effect of a trading business's cash transactions on the accounting equation.", "Even for a trader, every transaction keeps A = OE + L balanced."],
  ]},
  { code: "F2", term: 1, title: "General Ledger and Trial Balance (sole trader)", skills: [
    ["Posting to the General Ledger", "Posting the cash transactions of a trading business from the CRJ and CPJ to the General Ledger.", "Posting moves the journal totals into ledger accounts.", { defer: true }],
    ["Preparing the Trial Balance", "Preparing a Trial Balance of a trading business.", "The Trial Balance lists every account to check debits = credits.", { defer: true }],
  ]},
  { code: "F3", term: 2, title: "Credit transactions — debtors", skills: [
    ["Credit sales, debtors and the NCA", "Credit sales, debtors, and the National Credit Act.", "A debtor owes you money; the NCA protects people who buy on credit."],
    ["Debtors Journal and Allowance Journal", "Recording transactions in the Debtors Journal (DJ) and Debtors Allowance Journal (DAJ).", "The DJ records credit sales; the DAJ records goods returned.", { defer: true }],
    ["Posting to the Debtors and General Ledger", "Posting to the Debtors Ledger and General Ledger and the effect on the accounting equation.", "Each debtor has an account; postings keep the equation balanced.", { defer: true }],
  ]},
  { code: "F4", term: 3, title: "Credit transactions — creditors", skills: [
    ["Creditors and creditors allowance", "Creditors and creditors allowance, and where they fit in the accounting cycle.", "A creditor is someone you owe; an allowance is goods you returned to them."],
    ["Creditors Journal and Allowance Journal", "Recording transactions in the Creditors Journal (CJ) and Creditors Allowance Journal (CAJ).", "The CJ records credit purchases; the CAJ records returns to suppliers.", { defer: true }],
    ["Payments and posting to creditors", "Recording payments to creditors in the CPJ, posting to the Creditors and General Ledger, and the effect on the equation.", "Paying a creditor reduces both cash and what you owe.", { defer: true }],
  ]},
  { code: "F5", term: 4, title: "Cash and credit transactions combined", skills: [
    ["Recording in all subsidiary journals", "Recording cash and credit transactions of a sole trader across all the subsidiary journals.", "Pull it together: every journal plays its part for one business.", { defer: true }],
    ["Posting and the Trial Balance", "Posting to the ledgers and preparing a Trial Balance.", "The final check: a balanced Trial Balance from all the journals.", { defer: true }],
  ]},
  // ── Entrepreneurship ──
  { code: "B1", term: 2, title: "Sectors of the economy", skills: [
    ["Primary, secondary and tertiary sectors", "The primary, secondary and tertiary sectors and the businesses found in each.", "Primary takes from nature, secondary makes, tertiary serves."],
    ["How the sectors connect", "The interrelationship of the three sectors, the skills each needs, and sustainable use of resources.", "Goods pass from primary to secondary to tertiary on the way to you."],
  ]},
  { code: "B2", term: 3, title: "Functions of a business", skills: [
    ["The eight business functions", "The business functions: administration, purchasing, marketing, finance, public relations, human resources, production, and general/risk management.", "A business does many jobs at once — these are its functions."],
    ["Characteristics of each function", "The characteristics of each business function.", "Each function has its own focus, from buying to selling to people."],
    ["Role and importance of the functions", "The role and importance of the business functions and how they work together.", "The functions must work as a team for the business to succeed."],
  ]},
  { code: "B3", term: 4, title: "Business plan", skills: [
    ["What a business plan is", "The concept of a business plan and the components it contains.", "A business plan is a written map of what the business will do."],
    ["Format of a business plan", "The format of a business plan, from the front cover and contents to the SWOT analysis and conclusion.", "It runs in order: cover, contents, product, goals, plans, SWOT, conclusion."],
    ["The financial plan", "The financial plan — fixed and variable costs, break-even point, mark-up on sales and profit percentage.", "Break-even is where income finally covers all the costs."],
  ]},
];

const GRADES = [
  { grade: 7, topics: G7 },
  { grade: 8, topics: G8 },
  { grade: 9, topics: G9 },
];

// strand letter from a topic code ("E1" → "E")
const strandOf = (code) => code[0];

// ─── Build the skill tree ─────────────────────────────────────────────────────

function orderTopics(topics) {
  // Stable sort by strand (Economy → Financial → Entrepreneurship); declaration
  // order is preserved within a strand (already in CAPS teaching order).
  return [...topics].sort((a, b) => STRAND_ORDER[strandOf(a.code)] - STRAND_ORDER[strandOf(b.code)]);
}

function buildTree() {
  const levels = GRADES.map(({ grade, topics }) => {
    const tiers = orderTopics(topics).map((topic) => {
      const strand = strandOf(topic.code);
      const strandLabel = STRAND_LABEL[strand];
      const templates = topic.templates ?? STRAND_TEMPLATES[strand];
      const capsTerm = `G${grade} T${topic.term}`;
      const atomic_skills = topic.skills.map(([title, description, recovery, opts], i) => {
        const id = `EMS.G${grade}.${topic.code}.A${i + 1}`;
        return {
          id,
          bank_skill_id: id,
          title,
          description,
          caps_term: capsTerm,
          caps_strand: strandLabel,
          caps_topic: topic.title,
          prerequisites: [],
          templates,
          error_signatures: [
            {
              type: "misconception",
              description: `A common misunderstanding when learning "${title}".`,
              example: "Authoring note: replace with the specific misconception once items are written.",
            },
          ],
          recovery_strategy: recovery,
          mastery_criteria: { correct_required: 15, formats_required: 2, allow_scaffolding: false },
          ...(opts?.image || topic.image ? { image_dependent: true } : {}),
          ...(opts?.defer ? { deferred_recording: true } : {}),
        };
      });
      return {
        id: `L${grade}.${topic.code}`,
        title: `${strandLabel} · Term ${topic.term}: ${topic.title}`,
        description: `CAPS ${capsTerm} — ${strandLabel}. ${topic.title}.`,
        atomic_skills,
      };
    });
    return {
      id: grade,
      grade,
      title: `Grade ${grade} — Economic & Management Sciences`,
      description: `Grade ${grade} EMS (CAPS Senior Phase). Three strands — The Economy, Financial Literacy and Entrepreneurship — taught across the year.`,
      tiers,
    };
  });

  return {
    version: "1.0",
    subject: "ems-sp",
    description:
      "Economic & Management Sciences Senior Phase (Grades 7–9). CAPS-aligned. One subject, three strands (The Economy, Financial Literacy, Entrepreneurship). All skills open once the grade is selected (gate NONE). Procedural accounting 'recording' skills are flagged deferred_recording until a later authoring pass.",
    grades_covered: [7, 8, 9],
    levels,
  };
}

// ─── Build / merge the question bank ──────────────────────────────────────────
// Authored pools live in scripts/content/ as ES modules, each default-exporting
// an object keyed by skill id → question array. Loaded in order and CONCATENATED
// per skill id, so a grade can be split across files without overwriting.
async function loadAuthoredPools() {
  const merged = {};
  const modules = [
    "ems-g7.mjs", "ems-g7-b.mjs", "ems-g7-c.mjs",
    "ems-g8.mjs", "ems-g8-b.mjs", "ems-g8-c.mjs",
    "ems-g9.mjs", "ems-g9-b.mjs", "ems-g9-c.mjs",
  ];
  for (const mod of modules) {
    try {
      const imported = await import(`./content/${mod}`);
      const pools = imported.default ?? {};
      for (const [skillId, questions] of Object.entries(pools)) {
        merged[skillId] = (merged[skillId] ?? []).concat(questions);
      }
    } catch (err) {
      if (err?.code !== "ERR_MODULE_NOT_FOUND") throw err;
      // content module not written yet — fine, skip.
    }
  }
  return merged;
}

const SEED = await loadAuthoredPools();

function topicMeta(grade, topic, skill, skillId, title) {
  const strand = strandOf(topic.code);
  const strandLabel = STRAND_LABEL[strand];
  const templates = topic.templates ?? STRAND_TEMPLATES[strand];
  const opts = skill[3];
  return {
    title,
    description: `${strandLabel} (CAPS G${grade} T${topic.term}) — ${topic.title}: ${title}.`,
    grade,
    strand: `${strandLabel} · Term ${topic.term}`,
    skill_ids: [skillId],
    gate: "NONE",
    pass_threshold: 0.6,
    questions_for_mastery: 20,
    target_item_count: 20,
    caps_term: `G${grade} T${topic.term}`,
    caps_strand: strandLabel,
    caps_topic: topic.title,
    templates,
    recovery_strategy: skill[2] ?? "",
    ...(opts?.image || topic.image ? { image_dependent: true } : {}),
    ...(opts?.defer ? { deferred_recording: true } : {}),
    questions: [],
  };
}

async function buildBank() {
  let existing = {};
  try {
    const raw = await readFile(BANK_PATH, "utf8");
    existing = JSON.parse(raw).topics ?? {};
  } catch {
    /* first run — no bank yet */
  }

  const topics = {};
  for (const { grade, topics: list } of GRADES) {
    for (const topic of list) {
      topic.skills.forEach((skill, i) => {
        const [title] = skill;
        const skillId = `EMS.G${grade}.${topic.code}.A${i + 1}`;
        const meta = topicMeta(grade, topic, skill, skillId, title);
        const authored = SEED[skillId];
        if (authored?.length) {
          const stem = skillId.replace(/^EMS\./, "");
          meta.questions = authored.map((q, qi) => ({
            ref: q.ref ?? `${stem}.${String(qi + 1).padStart(2, "0")}`,
            ...q,
          }));
        } else if (existing[skillId]?.questions?.length) {
          meta.questions = existing[skillId].questions;
        }
        topics[skillId] = meta;
      });
    }
  }

  return {
    version: "1.0",
    subject: "ems-sp",
    description:
      "Economic & Management Sciences Senior Phase (Grades 7–9) question bank. One 20-item pool per atomic skill (the topic key IS the skill id). Content subject: 0.6 pass mark, mastery via lib/content-mastery.ts.",
    topics,
  };
}

// ─── Emit ─────────────────────────────────────────────────────────────────────

const tree = buildTree();
const bank = await buildBank();

await writeFile(TREE_PATH, JSON.stringify(tree, null, 2) + "\n");
await writeFile(BANK_PATH, JSON.stringify(bank, null, 2) + "\n");

const skillCount = tree.levels.reduce(
  (n, l) => n + l.tiers.reduce((m, t) => m + t.atomic_skills.length, 0),
  0,
);
const deferred = Object.values(bank.topics).filter((t) => t.deferred_recording).length;
const authored = Object.values(bank.topics).filter((t) => t.questions.length > 0).length;
console.log(`skill-tree: ${tree.levels.length} grades, ${skillCount} skills`);
console.log(`bank: ${Object.keys(bank.topics).length} pools (${deferred} deferred), ${authored} with questions`);
