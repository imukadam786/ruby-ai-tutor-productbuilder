// ─── Accounting — per-topic "real-life example" pictures ───────────────────
//
// One everyday picture per topic (51), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "ACC.G10.T1.INFORMAL.A1":
    "Think of jotting your pocket money spending on scraps of paper versus keeping a proper notebook with dates and totals. Only one lets you check where the money went.",
  "ACC.G10.T1.ETHICS.A1":
    "Think of a class treasurer collecting money for a trip. Being honest, open and able to explain every cent is what makes people trust them.",
  "ACC.G10.T1.GAAP.A1":
    "Think of the rules of soccer: every team plays by the same rules, so a score means the same thing at every ground.",
  "ACC.G10.T1.CONTROL.A1":
    "Think of how a school protects its tuck shop money: a locked box, two people counting together and a manager checking the totals.",
  "ACC.G10.T1.CONCEPTS.A1":
    "Think of a family's year: income comes in, bills go out, and at the end you check what's left. The same steps repeat every year.",
  "ACC.G10.T1.SOURCEDOCS.A1":
    "It's like a till slip proving you bought something. Every exchange has two sides: something you got and something you gave.",
  "ACC.G10.T1.CASHJOURNALS.A1":
    "Think of a household keeping one list of all money in, another of all money out, and a small tin for the odd bits of change.",
  "ACC.G10.T1.CREDITJOURNALS.A1":
    "Think of a spaza's book of customers who'll pay at month-end, and another book of what the spaza owes its suppliers.",
  "ACC.G10.T1.LEDGERS.A1":
    "Think of sorting a pile of receipts into labelled envelopes, then checking that the envelope totals add up to the whole pile.",
  "ACC.G10.T1.EQUATION.A1":
    "Think of a seesaw that must always balance. Whatever you add to one side, something has to change on the other.",
  "ACC.G10.T2.VAT.A1":
    "Think of a stokvel collecting a small extra on every purchase for the group's fund. Some items are let off; others pay in full.",
  "ACC.G10.T2.SALARIES.A1":
    "Think of a payslip: what you earn, what's taken off before you see it, and what the boss pays on top that you never see.",
  "ACC.G10.T2.ADJUSTMENTS.A1":
    "Think of the last day of the school term: you check which homework belongs to this term and which to next, before you write your report.",
  "ACC.G10.T2.FINALACCOUNTS.A1":
    "Think of the end of a sports season: the scores are wiped for the new season, but the trophies and kit carry over.",
  "ACC.G10.T3.INCOMESTATEMENT.A1":
    "Think of a school fundraiser's report: what you earned, what you spent and what was left over as profit.",
  "ACC.G10.T3.BALANCESHEET.A1":
    "Think of a photo of everything a household owns and owes on one particular day. It's a snapshot, not a story of the year.",
  "ACC.G10.T3.INTERPRET.A1":
    "Think of reading a report card: the marks only become useful when you compare them and ask what they mean.",
  "ACC.G10.T4.COSTCONCEPTS.A1":
    "Think of baking a cake to sell: the flour and the baker's time go straight into the cake; the oven's electricity is shared across every cake.",
  "ACC.G10.T4.BUDGETCONCEPTS.A1":
    "Think of planning a month's spending before it starts, then checking afterwards where you went over or under.",
  "ACC.G11.T1.ETHICS.A1":
    "Think of a sports captain who owns up to their mistakes and keeps the team's kit money open for everyone to see. That's how trust is earned.",
  "ACC.G11.T1.AUDIT.A1":
    "Think of a teacher checking the class register, the lost-property box and the tuck shop money, just to make sure the systems are working.",
  "ACC.G11.T1.BANKREC.A1":
    "Think of comparing your own notes of what you spent with your bank app. Some payments haven't shown up yet, so you match them up.",
  "ACC.G11.T1.CREDITORSREC.A1":
    "Think of comparing your tab at the spaza with the owner's book. If the totals differ, you go line by line to find out why.",
  "ACC.G11.T1.FIXEDASSETS.A1":
    "Think of a new bicycle: it's worth less each year you ride it, even though it still works.",
  "ACC.G11.T1.PARTCONCEPTS.A1":
    "Think of two friends running a car wash together, agreeing upfront how much each puts in and how they'll share what they earn.",
  "ACC.G11.T1.PARTLEDGER.A1":
    "Think of friends splitting what's left of a joint fundraiser: first a fair share for the effort and money each put in, then the rest divided as agreed.",
  "ACC.G11.T1.PARTSTATEMENTS.A1":
    "Think of two friends keeping one record of what each originally put into their business, and another of what each has earned and taken out since.",
  "ACC.G11.T2.PARTINTERPRET.A1":
    "Think of friends looking back over a year of running their car wash: was it worth it, did they have enough cash, and what were the risks?",
  "ACC.G11.T2.CLUBCONCEPTS.A1":
    "Think of a church choir: it collects money and spends it, but the aim is to serve members, not to make a profit.",
  "ACC.G11.T2.CLUBLEDGER.A1":
    "Think of the soccer club treasurer's notebook listing every rand that came in and went out this season.",
  "ACC.G11.T3.COSTCALC.A1":
    "Think of working out what one plate of food at a fundraiser really cost: ingredients, the cook's time, and a share of the gas.",
  "ACC.G11.T3.MANUFLEDGER.A1":
    "Think of a home bakery keeping separate jars for ingredient money, baker's pay, kitchen running costs and the cost of advertising.",
  "ACC.G11.T3.BUDGETING11.A1":
    "Think of a household planning the cash for next month, separately from working out if the year was profitable. Some costs never involve cash changing hands.",
  "ACC.G11.T3.INVENTORY11.A1":
    "Think of a school library that logs every book in and out, versus one that just counts the shelves once a year.",
  "ACC.G11.T4.VAT11.A1":
    "Think of a small extra collected on every sale for the government. You collect it from customers, pay some on your own purchases, and settle the difference.",
  "ACC.G12.T1.COCONCEPTS.A1":
    "Think of a big stokvel with many members: each owns a share, and what's not paid out stays in the pot for everyone.",
  "ACC.G12.T1.COBOOKKEEPING.A1":
    "Think of a club deciding how much of its profit to hand out to members and how much to keep for next year.",
  "ACC.G12.T1.COADJUSTMENTS.A1":
    "Think of a promise to pay members at the year-end party. Once it's promised, it's owed, even though no money has changed hands yet.",
  "ACC.G12.T1.COSTATEMENTS.A1":
    "Think of sorting a family's money movements: everyday spending, buying a car, and taking out a loan. Each type tells a different story.",
  "ACC.G12.T1.COINTERPRET.A1":
    "Think of judging a soccer team on more than the score: possession, injuries and how much the club owes. The full picture tells you if it's healthy.",
  "ACC.G12.T1.COPUBLISHED.A1":
    "Think of a referee's match report: if the referee is satisfied, the result stands; if they have concerns, everyone wants to know why.",
  "ACC.G12.T2.ETHICS12.A1":
    "Think of a player who bets on a match they know is fixed. Using secret knowledge for personal gain is cheating, even if no one finds out.",
  "ACC.G12.T2.FIXEDASSETS12.A1":
    "Think of a family car: a list of what it cost and how much it has worn shows whether it's still new or nearly ready for replacing.",
  "ACC.G12.T2.CC.A1":
    "Think of a small club with its own rules and names for things. It works much like a big one, but uses different words for the same ideas.",
  "ACC.G12.T2.CONTROL12.A1":
    "Think of a school's own staff checking its systems all year, while an outside inspector visits once to give an independent opinion.",
  "ACC.G12.T2.INVENTORY12.A1":
    "Think of a car dealer, where every vehicle is tracked one by one, versus a sweet shop, where you work out the cost of sweets in bulk.",
  "ACC.G12.T2.RECONCILE12.A1":
    "Think of comparing your notes with your bank app, your tab with the shop's book and your friends' IOUs. Matching them catches mistakes early.",
  "ACC.G12.T2.VAT12.A1":
    "Think of a running tally of extra money you've collected for someone and what you've paid on their behalf. At the end, you settle the difference.",
  "ACC.G12.T3.PRODCOST.A1":
    "Think of adding up everything that went into making school jerseys: the wool, the knitters' pay and a share of the factory's running costs.",
  "ACC.G12.T3.COSTANALYSIS.A1":
    "Think of a tuck shop that must sell enough to cover its stall fee before it makes any profit. Every sale chips away at that fixed cost.",
  "ACC.G12.T3.BUDGETING12.A1":
    "Think of comparing what you planned to spend on a party with what you actually spent, then asking why some things went over.",
};
