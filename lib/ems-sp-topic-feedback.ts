// ─── EMS SP — per-topic "think of it like this" analogies ──────────────────
//
// One everyday analogy per topic (102: Economics + Financial Literacy +
// Entrepreneurship, Grades 7–9), keyed by skill/topic id. Feeds the wrong-
// answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Register: Grade 7–9, concrete, everyday South African reference points
// (spaza shop, stokvel, taxi rank, pocket money). "why" = the question's memo,
// "how" = the topic's recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "EMS.G7.E1.A1":
    "Barter is swapping straight across — your two chickens for my bag of mealies. It only works if I happen to want chickens right now; money removes that lucky-match problem.",
  "EMS.G7.E1.A2":
    "Money is a middle step everyone accepts: sell your chickens for cash, then spend the cash on mealies whenever you like. No perfect swap needed.",
  "EMS.G7.E1.A3":
    "Money does three jobs at once, like a Swiss-army knife: it pays for things now, it stores value for later (savings), and it puts a price on everything so you can compare.",
  "EMS.G7.E2.A1":
    "A need scales up: one person needs water, a household needs a tap, a town needs a reservoir, a country needs dams and pipelines — same need, bigger version.",
  "EMS.G7.E2.A2":
    "Primary needs keep you alive — food, water, shelter. Secondary needs make life better — a bed instead of the floor, a phone, a uniform that fits.",
  "EMS.G7.E2.A3":
    "Your wish list is endless but your pocket money isn't — so you pick one thing and leave the rest. That choice is the whole of economics in miniature.",
  "EMS.G7.E3.A1":
    "A good is a thing you can hold — a loaf of bread. A service is a job someone does for you — the baker's time, a haircut, a taxi ride.",
  "EMS.G7.E3.A2":
    "A household wears both hats: it earns money by producing (going to work) and spends money by consuming (buying groceries). Everyone is on both sides of the counter.",
  "EMS.G7.E3.A3":
    "Using resources wisely is making one loaf stretch the week — no waste, reuse the crusts, and the limited flour goes further.",
  "EMS.G7.E4.A1":
    "Inequality has deep roots — like a race where some runners started decades behind. History, unequal schooling and unemployment all hold people back.",
  "EMS.G7.E4.A2":
    "Poverty looks different by place: in a city it's an informal settlement with no services; in a rural area it's a village far from clinics, jobs and the nearest shop.",
  "EMS.G7.E4.A3":
    "A once-off food parcel feeds someone today; a skill and a job feed them every month after. Education and work are the long-term tools against inequality.",
  "EMS.G7.E5.A1":
    "Production is a kitchen: inputs are the flour, water and the baker's effort; the output is the bread that comes out.",
  "EMS.G7.E5.A2":
    "Productivity is baking twelve loaves from the same flour and hours that used to make ten — more output, same inputs. Do that across a country and the economy grows.",
  "EMS.G7.E5.A3":
    "A new oven bakes more bread per hour (technology lifts output); using only as much wood as the forest can regrow (sustainability) means there's still fuel next year.",
  "EMS.G7.F1.A1":
    "Picture a tuck shop: the stock and the till are assets (what it owns), the supplier's unpaid bill is a liability (what it owes), and the owner's own money put in is capital.",
  "EMS.G7.F1.A2":
    "Profit is what's left after the shop pays its bills: R500 taken in, R350 spent, R150 profit. If expenses had been R600, that's a R100 loss.",
  "EMS.G7.F1.A3":
    "Records are the rear-view mirror — what money already came and went. A budget is the road map — where it's planned to go next month.",
  "EMS.G7.F2.A1":
    "Income is every stream of money flowing in — a wage, a salary, pocket money, interest on savings — like several taps filling one bucket.",
  "EMS.G7.F2.A2":
    "Net worth is a simple subtraction: everything you own (phone, savings) minus everything you owe (money borrowed). The leftover is where you actually stand.",
  "EMS.G7.F2.A3":
    "A business has the same money-in and money-out as a person, just bigger — a salary becomes 'sales', a grocery bill becomes 'stock and wages'.",
  "EMS.G7.F3.A1":
    "A budget is a referee for your spending: it checks that what goes out each month never beats what comes in.",
  "EMS.G7.F3.A2":
    "A business budget is the same plan on a firm's scale — expected sales down one side, expected costs down the other, checked so the firm doesn't overspend.",
  "EMS.G7.F4.A1":
    "Saving is spending less than you earn and keeping the gap — putting R20 of every R100 aside so there's something there when the geyser bursts.",
  "EMS.G7.F4.A2":
    "A bank does three things: it keeps your money safe, it lends money out to others, and it moves payments around so you don't carry cash.",
  "EMS.G7.F4.A3":
    "There are many ways to save: a bank savings account, a fixed deposit, or a stokvel where a group pools money and each member takes a turn with the pot.",
  "EMS.G7.B1.A1":
    "A registered supermarket that pays tax is a formal business; the person selling airtime and sweets from a table on the corner is an informal one.",
  "EMS.G7.B1.A2":
    "Three kinds by what they do: a spaza shop trades (buys and resells), a bakery manufactures (makes goods), a hair salon provides a service (does a job).",
  "EMS.G7.B1.A3":
    "A business sits on both sides of a shock: a flood or an epidemic can stop it selling AND stop its suppliers delivering.",
  "EMS.G7.B2.A1":
    "An entrepreneur spots a gap — no one sells cold drinks at the taxi rank — and takes the risk of buying stock to fill it, hoping to end up with more than they spent.",
  "EMS.G7.B2.A2":
    "The entrepreneur's cycle is buy, add value, then sell — aiming to bank more at the end than they laid out at the start.",
  "EMS.G7.B3.A1":
    "SWOT sorts four things into inside and outside: strengths and weaknesses are yours to control; opportunities and threats come from the world around you.",
  "EMS.G7.B3.A2":
    "Good advertising tells the right people, in the right place, one clear reason to buy — a poster at the school gate for matric-dance dress hire, not on a farm road.",
  "EMS.G7.B3.A3":
    "Fixed costs don't move with output — the table rent stays R100 whether you sell 1 cupcake or 100. Variable costs rise with each one — more cupcakes, more flour and eggs.",
  "EMS.G7.B4.A1":
    "Run the stall like a real business: decide the product, set a price that covers costs, list what you'll spend, and write it into a small budget before the day.",
  "EMS.G7.B4.A2":
    "At the end of the day, subtract what you spent from what you took in. A positive number is profit; a negative one means the stall cost more than it earned.",
  "EMS.G8.E1.A1":
    "Government works at three levels like a school: national sets the curriculum, provincial runs the district, local is the principal handling the daily building.",
  "EMS.G8.E1.A2":
    "Government serves households — schools, clinics, roads — and also acts like a big household itself, buying supplies and paying staff.",
  "EMS.G8.E1.A3":
    "Government touches business three ways: it buys from them (tenders), it sets rules they must follow (regulation), and it helps some grow (grants, training).",
  "EMS.G8.E2.A1":
    "Direct tax comes off your income before you see it (PAYE on a payslip). Indirect tax is added when you spend (the VAT line on a till slip).",
  "EMS.G8.E2.A2":
    "Tax money is pooled and spent on things everyone can use — public schools, hospitals, police, roads — that no single household could pay for alone.",
  "EMS.G8.E2.A3":
    "The national budget is a big steering wheel: spend more on schools and grants in poorer areas and you can nudge the economy to grow more evenly.",
  "EMS.G8.E3.A1":
    "Standard of living is how comfortably people can actually live — running water, electricity, enough food, a safe home — not just how much money passes through.",
  "EMS.G8.E3.A2":
    "More factories and roads raise living standards but can foul rivers and air. Development has to be weighed against that environmental bill.",
  "EMS.G8.E4.A1":
    "The goods market is the ordinary shop floor: households hand over money, businesses hand over bread, clothes and haircuts.",
  "EMS.G8.E4.A2":
    "The factor market is the other counter: here businesses are the buyers — they pay households for labour (wages) and for the use of money (interest).",
  "EMS.G8.F1.A1":
    "A sole trader is one person owning the whole business. Every entry in the books has two sides — a debit and a credit — like every payment having a payer and a receiver.",
  "EMS.G8.F1.A2":
    "The accounting equation always balances like a seesaw: what the business owns (assets) equals the owner's stake plus what it owes others.",
  "EMS.G8.F1.A3":
    "Every transaction pushes at least two parts of the equation at once, so the seesaw stays level — pay a supplier and both your cash and your debt go down together.",
  "EMS.G8.F2.A1":
    "A source document is the paper proof — the till slip, the deposit slip — that a transaction really happened. No document, no entry.",
  "EMS.G8.F2.A2":
    "The counterfoil is the stub you keep when you tear out a cheque — your own record of who you paid and how much.",
  "EMS.G8.F2.A3":
    "A bank statement is the bank's own diary of your account — every deposit, every withdrawal, in date order — which you check against your records.",
  "EMS.G8.F3.A1":
    "The accounting cycle is a fixed conveyor belt: a transaction happens, a source document proves it, it's written in a journal, posted to the ledger, checked on a trial balance, then summed into statements.",
  "EMS.G8.F3.A2":
    "Cash journals are the first notebooks: one lists every rand received, the other every rand paid out, before anything moves further down the belt.",
  "EMS.G8.F4.A1":
    "The Cash Receipts Journal is the 'money in' book — every payment the business receives gets written up here first.",
  "EMS.G8.F4.A2":
    "Each receipt becomes exactly one line in the CRJ — date, who paid, how much — like one row per SMS in your phone's inbox.",
  "EMS.G8.F4.A3":
    "Closing the CRJ means adding up the columns for the month; those totals then flow into the ledger and keep the accounting equation balanced.",
  "EMS.G8.F5.A1":
    "The Cash Payments Journal is the 'money out' book — every rand the business pays for stock, wages or rent is listed here.",
  "EMS.G8.F5.A2":
    "Same rule as the receipts book: one payment, one line; then total the columns at month-end to carry into the ledger.",
  "EMS.G8.F5.A3":
    "The receipts book and the payments book together account for every cent of cash — nothing in or out of the till is missed.",
  "EMS.G8.F6.A1":
    "Double entry means every transaction is recorded twice — once as a debit, once as a credit — like writing 'lent to Sipho' in your book and 'borrowed from you' in his.",
  "EMS.G8.F6.A2":
    "Posting is copying the monthly journal totals into their proper ledger accounts — moving the summary from the day-book into the filing cabinet.",
  "EMS.G8.F6.A3":
    "A Trial Balance is a quick health check: add every debit, add every credit, and if the two totals match, the books are arithmetically in order.",
  "EMS.G8.B1.A1":
    "Capital is what a business works with — the money put in plus the equipment it buys: the sewing machines, the delivery bakkie, the cash float.",
  "EMS.G8.B1.A2":
    "Labour is the human effort a business hires. A skilled welder and an unskilled packer are both labour, but their scarcity means they're paid differently.",
  "EMS.G8.B1.A3":
    "Four factors combine to produce: land (natural resources), labour (people), capital (money and tools), and entrepreneurship (bringing the other three together) — each earning rent, wages, interest and profit.",
  "EMS.G8.B2.A1":
    "A sole trader carries the whole business alone. A partnership is a few people sharing the load, the decisions and the profits — like siblings running the family shop together.",
  "EMS.G8.B2.A2":
    "A company is treated as its own legal 'person' — it can own things and owe money in its own name — owned by shareholders who each hold a slice.",
  "EMS.G8.B2.A3":
    "Bigger ownership forms can raise more money — many shareholders each chipping in — so a company can build a factory and hire hundreds where a sole trader could hire two.",
  "EMS.G8.B3.A1":
    "Management stacks like a school: top management (the principal) plans the year, middle management (heads of department) organises it, lower management (senior teachers) supervises the daily class.",
  "EMS.G8.B3.A2":
    "Whatever the level, a manager does four things: plan the goal, organise the people and tools, lead them day to day, and control by checking results against the plan.",
  "EMS.G8.B3.A3":
    "Styles sit on a line from 'I decide, you do' (autocratic) to 'let's decide together' (democratic) — a strict coach at one end, a captain who asks the team at the other.",
  "EMS.G9.E1.A1":
    "In a planned economy the government is the shop manager for the whole country — it decides what gets made, how much, and at what price.",
  "EMS.G9.E1.A2":
    "In a market economy no one is in charge — prices rise and fall on their own as buyers and sellers meet, like the price of tomatoes at the market changing through the day.",
  "EMS.G9.E1.A3":
    "A mixed economy is the middle road South Africa takes: mostly free markets, but government still runs schools, sets a minimum wage and provides grants.",
  "EMS.G9.E2.A1":
    "Households and businesses lean on each other like two people carrying a table: households supply workers and buy goods, businesses supply goods and pay wages. Remove one and it collapses.",
  "EMS.G9.E2.A2":
    "In the circular flow, money runs around the loop one way and goods and labour run the opposite way — like a chain passing buckets one direction and empty pails back.",
  "EMS.G9.E3.A1":
    "The law of demand is everyday shopping: when the price of meat jumps, people buy less and switch to chicken. Price up, quantity wanted down.",
  "EMS.G9.E3.A2":
    "The law of supply is the seller's side: if tomatoes fetch a high price, farmers plant more and bring more to market. Price up, quantity offered up.",
  "EMS.G9.E3.A3":
    "Equilibrium is the price where the amount shoppers want to buy exactly matches the amount sellers want to sell — the point where the demand and supply lines cross.",
  "EMS.G9.E4.A1":
    "A trade union is workers bargaining as one voice. One worker asking for a raise is easy to ignore; a thousand asking together is not — like one learner versus the whole class complaining.",
  "EMS.G9.E4.A2":
    "Unions push for their members on wages, hours and safety — and because they're large, a strike or a wage deal can ripple out and affect the whole economy.",
  "EMS.G9.F1.A1":
    "A trading business buys stock to resell — a clothing shop buying shirts wholesale and selling them on. Those cash buys and sells are recorded in the cash journals.",
  "EMS.G9.F1.A2":
    "Even for a shop that trades stock, every transaction keeps assets = owner's equity + liabilities balanced — sell stock for cash and one asset simply swaps for another.",
  "EMS.G9.F2.A1":
    "Posting moves the month's journal totals into the ledger accounts — like transferring your weekly spending notes into a proper monthly summary per category.",
  "EMS.G9.F2.A2":
    "The Trial Balance lists every ledger account with its balance in a debit or credit column, then checks the two columns add up to the same total.",
  "EMS.G9.F3.A1":
    "A debtor is a customer who took the goods now and will pay later — they owe you. The National Credit Act sets rules so people aren't given credit they can't afford.",
  "EMS.G9.F3.A2":
    "The Debtors Journal records goods sold on credit; the Debtors Allowance Journal records the ones customers brought back — sales in one book, returns in the other.",
  "EMS.G9.F3.A3":
    "Each credit customer gets their own account so you can see exactly who owes what; posting those entries keeps the accounting equation in balance.",
  "EMS.G9.F4.A1":
    "A creditor is the mirror image of a debtor — someone you owe because you bought on credit. A creditors allowance is stock you sent back to that supplier.",
  "EMS.G9.F4.A2":
    "The Creditors Journal records what you bought on credit; the Creditors Allowance Journal records what you returned to suppliers — purchases in one, returns in the other.",
  "EMS.G9.F4.A3":
    "Paying a creditor shrinks two things at once: your cash goes down, and the amount you owe goes down by the same rand value.",
  "EMS.G9.F5.A1":
    "By Grade 9 you juggle every journal at once — cash in, cash out, credit sales, credit purchases, returns — each transaction going into the one book that fits it.",
  "EMS.G9.F5.A2":
    "The final check of the whole system: post every journal's totals to the ledger, then draw up a Trial Balance and confirm total debits equal total credits.",
  "EMS.G9.B1.A1":
    "Follow a loaf: the primary sector grows the wheat, the secondary sector mills and bakes it, the tertiary sector delivers and sells it in the shop.",
  "EMS.G9.B1.A2":
    "The sectors form a relay: raw materials pass from primary to secondary to tertiary, each adding value, before the finished product reaches you.",
  "EMS.G9.B2.A1":
    "A business runs eight departments at once — like a soccer club needing coaching, medical, kit, tickets, marketing and finance all working, not just the players.",
  "EMS.G9.B2.A2":
    "Each business function has its own focus: purchasing hunts for good stock prices, marketing chases customers, human resources looks after staff — different jobs, one firm.",
  "EMS.G9.B2.A3":
    "The functions have to pull together like a band — if production makes plenty but marketing sells nothing, or finance runs dry, the whole business stalls.",
  "EMS.G9.B3.A1":
    "A business plan is a written map drawn before the journey — what you'll sell, to whom, how, and what it'll cost — so you're not just driving and hoping.",
  "EMS.G9.B3.A2":
    "A business plan runs in a set order, like a school project: cover page, contents, description of the product, goals, the marketing and operations plans, a SWOT, then the conclusion.",
  "EMS.G9.B3.A3":
    "Break-even is the point where the money coming in has finally covered every cost — below it the business runs at a loss, above it each sale is profit.",
};
