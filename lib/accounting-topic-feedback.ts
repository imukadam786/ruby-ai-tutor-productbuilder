// ─── Accounting — per-topic "think of it like this" illustrations ──────────
//
// One concrete illustration or worked micro-example per topic (51, Grades
// 10–12), keyed by skill/topic id. Feeds the wrong-answer card's example slot
// via FeedbackExplanation's `exampleOverride`. Register: FET / matric band.
// "why" = the question's memo, "how" = the topic's recovery_strategy,
// "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "ACC.G10.T1.INFORMAL.A1":
    "A spaza owner who buys a case of cooldrinks for R120 and sells it for R180 made R60 — profit = selling price − cost price. A formal business tracks the same thing, just in ruled books.",
  "ACC.G10.T1.ETHICS.A1":
    "Test each principle with a plain question: transparency — is anything being hidden? accountability — will someone answer for this? fairness — do the same rules apply to everyone?",
  "ACC.G10.T1.GAAP.A1":
    "Business entity rule: the owner's personal cellphone bill is not a business expense — they are separate 'people' in the books. Going concern assumes the shop trades next year too. Matching records this month's sales with the cost of those sales.",
  "ACC.G10.T1.CONTROL.A1":
    "Spotting that one person handling both the cash and the records could steal is risk assessment. Splitting those two jobs between two people is a control activity.",
  "ACC.G10.T1.CONCEPTS.A1":
    "Assets are what the business owns (the till, the stock, the van); liabilities are what it owes (the bank loan). Income lifts the owner's equity; expenses shrink it.",
  "ACC.G10.T1.SOURCEDOCS.A1":
    "Every transaction has two equal sides: sell stock for cash and the cash goes up AND the stock goes down by the same R500. Two debits or two credits can never balance.",
  "ACC.G10.T1.CASHJOURNALS.A1":
    "Sort by direction: money coming in goes in the Cash Receipts Journal, money going out in the Cash Payments Journal, and tiny cash payments (postage, milk) in the Petty Cash Journal.",
  "ACC.G10.T1.CREDITJOURNALS.A1":
    "Sold goods on credit → Debtors' Journal. Bought goods on credit → Creditors' Journal. When either party returns goods, it reverses into the matching Allowances journal.",
  "ACC.G10.T1.LEDGERS.A1":
    "Two checks must pass: the Trial Balance's debit total equals its credit total, and the list of individual debtors adds up to the debtors' control account. If either doesn't, there's an error to find.",
  "ACC.G10.T1.EQUATION.A1":
    "Assets = Owner's equity + Liabilities, always in balance. Buy a R10 000 van with a bank loan: assets go up R10 000 and liabilities go up R10 000 — the equation still balances.",
  "ACC.G10.T2.VAT.A1":
    "Zero-rated means taxed at 0% — brown bread and maize meal, so basics stay cheap. Exempt means outside VAT entirely, like some financial services. Everything else is standard-rated at the current VAT rate.",
  "ACC.G10.T2.SALARIES.A1":
    "A deduction like PAYE comes OUT of the worker's gross pay — they take home less. A contribution like the employer's UIF share is an EXTRA cost the business pays on top of the gross pay.",
  "ACC.G10.T2.ADJUSTMENTS.A1":
    "Accrued expense = owing but not yet paid (December's rent, still unpaid at year-end). Prepaid = paid but not yet used (three months' insurance paid in advance). Each must land in the period it belongs to.",
  "ACC.G10.T2.FINALACCOUNTS.A1":
    "Only nominal accounts — income and expenses — close off into Trading or Profit and Loss at year-end. Balance-sheet accounts (assets, liabilities, capital) carry their balance forward.",
  "ACC.G10.T3.INCOMESTATEMENT.A1":
    "The Income Statement is the year's takings and spending only — sales, rent, wages, profit. Anything the business owns or owes at year-end belongs on the Balance Sheet, not here.",
  "ACC.G10.T3.BALANCESHEET.A1":
    "The Balance Sheet must obey Assets = Owner's equity + Liabilities. Build each big total from its note — fixed assets from the fixed-asset note, receivables from the trade-and-other-receivables note.",
  "ACC.G10.T3.INTERPRET.A1":
    "A current ratio of 2:1 means R2 of short-term assets for every R1 owed short-term — comfortable. Then check whether the profitability percentages held up against last year and a benchmark.",
  "ACC.G10.T4.COSTCONCEPTS.A1":
    "A direct cost traces straight into the product — the wood in a table, the wage of the person who built it. An indirect cost supports the factory but isn't in the table — the factory rent, the cleaner's wage.",
  "ACC.G10.T4.BUDGETCONCEPTS.A1":
    "A cash budget tracks only real money moving in and out. Depreciation is a bookkeeping estimate with no cash attached, so it never appears in a cash budget.",
  "ACC.G11.T1.ETHICS.A1":
    "Hold an action against three tests — accountability, transparency, sustainability. If it hides information, harms stakeholders, or can't be kept up long-term, it's unethical.",
  "ACC.G11.T1.AUDIT.A1":
    "Internal control is the day-to-day system that stops errors and theft — locked safes, split duties. An internal audit is the separate check, once in a while, that those controls are actually working.",
  "ACC.G11.T1.BANKREC.A1":
    "Start from the bank statement balance: add deposits you've recorded that the bank hasn't yet, subtract cheques you've written that haven't been cashed. Then update your own cash book for bank charges and interest.",
  "ACC.G11.T1.CREDITORSREC.A1":
    "Compare the supplier's statement to your Creditors' Ledger account for them, find the difference, decide which record is wrong, and fix that one. When they agree, it's reconciled.",
  "ACC.G11.T1.FIXEDASSETS.A1":
    "When you sell an asset, don't skip a step: first record depreciation right up to the sale date, then move the original cost and the accumulated depreciation to the Asset Disposal account to work out the profit or loss.",
  "ACC.G11.T1.PARTCONCEPTS.A1":
    "Each partner has two accounts. The capital account holds their fixed stake — money put in and left in. The current account is the moving one — yearly profit share, salary, interest on capital, minus drawings.",
  "ACC.G11.T1.PARTLEDGER.A1":
    "The Profit and Loss Account gives one net profit figure. The Appropriation Account then divides it up: pay the partners' salaries first, then interest on their capital, then split what's left in the agreed ratio.",
  "ACC.G11.T1.PARTSTATEMENTS.A1":
    "A partnership's equity is the capital accounts plus the current accounts. The current-accounts note lays out, per partner, their salary, interest on capital, profit share and drawings for the year.",
  "ACC.G11.T2.PARTINTERPRET.A1":
    "Gearing shows how much the business runs on borrowed money. High gearing magnifies profit when times are good and losses when they're bad — compare it to last year and to what the borrowing actually costs.",
  "ACC.G11.T2.CLUBCONCEPTS.A1":
    "A sports club isn't trying to make a profit. Its 'capital' is the accumulated fund, and its year-end result is a surplus (took in more than it spent) or a deficit — never a profit or a loss.",
  "ACC.G11.T2.CLUBLEDGER.A1":
    "Receipts and payments are just cash movements; income and expenses belong to a period. A loan the club receives is a receipt of cash, but it isn't income — it has to be paid back.",
  "ACC.G11.T3.COSTCALC.A1":
    "Contribution per unit = selling price − variable cost per unit — what each item chips in toward the fixed costs. Break-even in units = total fixed costs ÷ contribution per unit.",
  "ACC.G11.T3.MANUFLEDGER.A1":
    "Sort every cost by where it happens: on the factory floor = factory overheads; in the office = administration; getting finished goods to the customer = selling and distribution.",
  "ACC.G11.T3.BUDGETING11.A1":
    "A cash budget records money only when it actually moves. A credit sale in March becomes a receipt only when the debtor pays — in April or May, per the expected collection pattern.",
  "ACC.G11.T3.INVENTORY11.A1":
    "Perpetual = the Trading Stock account is updated with every sale and purchase, so the balance is always current. Periodic = purchases go to a Purchases account and stock is physically counted only at period-end.",
  "ACC.G11.T4.VAT11.A1":
    "To add VAT to a price: amount × 15%. To pull VAT out of a VAT-inclusive amount: amount × 15/115 — because the inclusive figure is already 115%, not 100%.",
  "ACC.G12.T1.COCONCEPTS.A1":
    "Authorised shares are the maximum the company is allowed to issue — the ceiling. Issued shares are the ones actually sold to shareholders so far — usually well below the ceiling.",
  "ACC.G12.T1.COBOOKKEEPING.A1":
    "Dividends are a share of profit handed to shareholders — not a business expense. They're appropriated after the profit is worked out, so they never appear in the Income Statement.",
  "ACC.G12.T1.COADJUSTMENTS.A1":
    "Unlike a sole trader, a company pays income tax. Work down: profit before tax → subtract income tax → profit after tax → then appropriate dividends, and what's left is retained income.",
  "ACC.G12.T1.COSTATEMENTS.A1":
    "The Cash Flow Statement has three drawers: operating (cash from trading), investing (buying and selling assets), financing (issuing shares, taking or repaying loans). Every cash flow drops into exactly one drawer.",
  "ACC.G12.T1.COINTERPRET.A1":
    "Earnings per share = total earnings ÷ number of shares — how much profit each share earned. Dividends per share = dividends declared ÷ shares — how much cash each share actually received. A company can earn more than it pays out.",
  "ACC.G12.T1.COPUBLISHED.A1":
    "A clean (unqualified) audit report only says the figures fairly present the company's position — not that the company is thriving. For how it's actually performing, read the Directors' Report and the ratios.",
  "ACC.G12.T2.ETHICS12.A1":
    "King III stands on four legs — responsibility, accountability, fairness, transparency. Directors must act in the company's best interest and be prepared to answer for every decision.",
  "ACC.G12.T2.FIXEDASSETS12.A1":
    "Compare how fast assets are being replaced with how fast they're wearing out and ageing. If old machines aren't being replaced, expect breakdowns and lost production down the line.",
  "ACC.G12.T2.CC.A1":
    "A close corporation has members and members' contributions — not shareholders and share capital. Profit paid out goes to members as a distribution, not to shareholders as a dividend.",
  "ACC.G12.T2.CONTROL12.A1":
    "Internal auditors work for the company, checking the controls all year round. External auditors are independent outsiders who give a once-a-year opinion on whether the annual statements are fair.",
  "ACC.G12.T2.INVENTORY12.A1":
    "FIFO — first in, first out — means the oldest stock is sold first, so whatever is left in the storeroom is valued at the newest, most recent prices. Weighted average instead blends every purchase into one average cost per unit.",
  "ACC.G12.T2.RECONCILE12.A1":
    "An age analysis sorts what debtors owe by how overdue it is. A lot of money stuck in the 60- and 90-day-plus columns means collections are slow and some of it may never be paid.",
  "ACC.G12.T2.VAT12.A1":
    "Output VAT is the VAT you charged on sales — you owe it to SARS. Input VAT is the VAT you paid on purchases — you claim it back. What you pay over = output VAT − input VAT.",
  "ACC.G12.T3.PRODCOST.A1":
    "Cost of production of finished goods = direct materials + direct labour + factory overheads, then adjusted for work-in-progress: add what was half-made at the start, subtract what's half-made at the end.",
  "ACC.G12.T3.COSTANALYSIS.A1":
    "Compare units made and sold against the break-even number: above it, every extra unit is profit; below it, the business isn't covering its costs and is running at a loss.",
  "ACC.G12.T3.BUDGETING12.A1":
    "Don't just note that actual spending was under budget — ask why. Spending far less than budgeted on maintenance or wages can mean the business is being neglected, not run tightly.",
};
