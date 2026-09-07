// ─── Business Studies — per-topic "think of it like this" illustrations ─────
//
// One concrete illustration per topic (55, Grades 10–12), keyed by skill/topic
// id. Feeds the wrong-answer card's example slot via FeedbackExplanation's
// `exampleOverride`. Register: FET / matric band. "why" = the question's memo,
// "how" = the topic's recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "BUS.G10.T1.MICRO.A1":
    "The micro environment is what management can change with a memo: the vision, the goals, the staff structure, the culture. If a decision by the boss can fix it, it's micro.",
  "BUS.G10.T1.FUNCTIONS.A1":
    "Picture a spaza shop growing into a supermarket: someone must buy stock (purchasing), make and price the product (production), draw customers (marketing), run the books (finance), hire and pay staff (HR), protect the name (PR), and tie it together (general management).",
  "BUS.G10.T1.MGMT.A1":
    "Levels are WHO (top, middle, lower); tasks are WHAT every manager does (plan, organise, lead, control). The owner plans next year's expansion; the shift supervisor just makes sure today's shelves get packed.",
  "BUS.G10.T1.QUALITY.A1":
    "Quality is a chain: production must make defect-free goods, finance must keep accurate books, HR must supply skilled staff. A weak link anywhere — sloppy records, say — drags the whole business down.",
  "BUS.G10.T1.MARKET.A1":
    "The market environment is your street: your suppliers, your customers, the shop across the road. You can't order them around, but you can negotiate, advertise and compete — you influence, you don't control.",
  "BUS.G10.T1.MACRO.A1":
    "The macro environment is the weather — the economy, new laws, technology, social change. A business can't switch it off; it can only carry an umbrella and adapt. A market factor is a specific rival; a macro factor is a fuel-price hike.",
  "BUS.G10.T1.INTERREL.A1":
    "Control fades as you move outward: full control inside (micro), influence nearby (market), none over the wide world (macro). A new macro law — a minimum wage — forces the business to rethink its own micro staffing plans.",
  "BUS.G10.T1.SECTORS.A1":
    "Follow a loaf of bread: a farm grows wheat (primary), a mill and bakery turn it into bread (secondary), a shop sells it and a truck delivers it (tertiary). Registered and taxed = formal; a street vendor = informal.",
  "BUS.G10.T2.SOCIOECON.A1":
    "Every socio-economic issue reaches a business through cost or output: crime pushes up the security bill, strikes stop production, counterfeiting steals sales, HIV/Aids thins the workforce.",
  "BUS.G10.T2.SOCRESP.A1":
    "Social responsibility is what a business does beyond the law's minimum — sponsoring a school, cleaning a river. CSR is the organised programme that runs those projects, not a one-off donation.",
  "BUS.G10.T2.ENTRE.A1":
    "Entrepreneurial qualities describe how the person thinks and acts — willing to risk, quick to adapt, hard to discourage — not what they own. A bank loan is a resource; perseverance is a quality.",
  "BUS.G10.T2.OWNERSHIP.A1":
    "In a sole trader or partnership the business and the owner are legally the same, so a business debt can take the owner's house — unlimited liability. A partnership just spreads that risk (and the capital and skills) across a few people.",
  "BUS.G10.T2.OWNERSHIP.A2":
    "A company is a separate legal 'person' — it owes its own debts, so shareholders can lose only what they put in (limited liability). A private (Pty) Ltd can't sell shares to the public; a public (Ltd) can. No new close corporations may be registered.",
  "BUS.G10.T3.CREATIVE.A1":
    "Problem-solving is the whole repair job — spot it, find options, choose, act, check. Decision-making is just the 'choose' step. Brainstorming and mind-maps are the tools that fill the option list.",
  "BUS.G10.T3.OPPORTUNITY.A1":
    "SWOT splits into inside and outside: strengths and weaknesses are yours (a skilled team, weak cash flow); opportunities and threats come from outside (a new market gap, a bigger competitor).",
  "BUS.G10.T3.LOCATION.A1":
    "Match the location to the business: a sawmill sits near the forest (raw materials), a hair salon sits near foot traffic (customers), a factory weighs transport and labour costs.",
  "BUS.G10.T3.CONTRACTS.A1":
    "Every contract has two named sides: employment = employer and employee; a lease = lessor and lessee; hire-purchase = seller and buyer; a rental = landlord and tenant. Learn them in pairs.",
  "BUS.G10.T3.PRESENT.A1":
    "Verbal is words — the talk you give, the paragraphs in a report. Non-verbal is the visuals — the graph, the table, the diagram. A good presentation leads with the key point and keeps the visuals clean.",
  "BUS.G10.T3.BUSPLAN.A1":
    "A business plan is the case that the venture will work. Each part has a job: the executive summary is the elevator pitch, the marketing plan shows how customers will be reached, the financial analysis shows it makes money.",
  "BUS.G10.T4.SELFMAN.A1":
    "Self-management is running yourself without a supervisor — your time, your goals, your image, your stress. It's the practice run before you're asked to manage other people.",
  "BUS.G10.T4.TEAM.A1":
    "A strong team shares clear goals, openness, trust and respect. The barriers are the mirror image — prejudice, poor communication, distrust. Handled well, a mix of different people is a strength.",
  "BUS.G11.T1.INFLUENCE.A1":
    "The rule holds at every grade: full control of the micro, influence over the market, none over the macro — you adapt. But a business can still lobby government (get involved in the macro) when a policy affects it.",
  "BUS.G11.T1.CHALLENGES.A1":
    "Sort a challenge by where it starts: a difficult employee or a weak vision is inside (micro); a price war with a rival is close outside (market); a new tax or a global recession is the wide world (macro).",
  "BUS.G11.T1.ADAPT.A1":
    "You can't control the macro world, so you prepare for it: lobbying nudges decision-makers, networking builds useful contacts, mergers and alliances add strength, and good information management means change doesn't catch you flat-footed.",
  "BUS.G11.T1.SOCIOECON.A1":
    "Socio-economic issues cost money, output or sales. Know the protections: copyright covers creative work, a patent covers an invention, a trademark covers a brand. A go-slow is deliberate slow work; a lockout is the employer shutting workers out.",
  "BUS.G11.T1.SECTORS.A1":
    "Each sector depends on the one before it: the mine or farm (primary) feeds the factory (secondary), which feeds the shop, bank and transport firm (tertiary). Break one link and the chain stalls.",
  "BUS.G11.T1.COMPANY.A1":
    "A company gives limited liability and lives on after the owners leave, but comes with more paperwork and tax. A sole trader is simple to run but risks everything. Weigh capital, liability, tax and continuity for the venture in front of you.",
  "BUS.G11.T1.ACQUIRE.A1":
    "Three ways in without building from scratch: franchising buys the right to trade under a proven brand for a royalty; outsourcing pays another firm to do a task; leasing rents an asset instead of buying it.",
  "BUS.G11.T2.CREATIVE.A1":
    "Routine thinking follows the known steps; creative thinking deliberately breaks the pattern for a new idea. Mental blocks — fear of failure, assuming one right answer — shut it down. Brainstorming, mind-mapping, Delphi and force-field analysis reopen it.",
  "BUS.G11.T2.STRESS.A1":
    "Keep three apart: stress is pressure on a person (manage with time, exercise, support); a crisis is a sudden serious threat to the business; change management is leading people through change so they adapt instead of digging in.",
  "BUS.G11.T2.ACTIONPLAN.A1":
    "A business plan says what and why; an action plan says who does which task by when. A Gantt chart lays tasks against a calendar; a Work Breakdown Structure chops a big job into small, assignable pieces.",
  "BUS.G11.T2.SETUP.A1":
    "Two kinds of money start a business: equity is the owner's or investors' cash — no repayment, but you share ownership; debt is a loan — you keep full ownership but repay it with interest.",
  "BUS.G11.T2.PROFETHICS.A1":
    "Ethics is doing what's morally right — honest, fair. Professionalism is the standard of your conduct at work — reliable, respectful, competent. You can be perfectly professional and still face a hard ethical call; the two support each other.",
  "BUS.G11.T2.PRESENT.A1":
    "Verbal is words, non-verbal is visuals. When you're questioned afterwards: answer everything, take notes, don't argue, and apologise for any mistake. Lead with the key point.",
  "BUS.G11.T3.ENTRE.A1":
    "Qualities are about the person (risk-taking, perseverance, vision); success factors are about the business (a loyal customer base, profitability, sustainability). Judge the venture against the success factors, then name what to improve.",
  "BUS.G11.T3.CITIZEN.A1":
    "An NGO is an independent, often national body; a CBO is local, run by and for a community. Business people are citizens too — they can give time, money and skills to develop the place they operate in.",
  "BUS.G11.T3.MARKETING.A1":
    "The marketing mix pairs each activity with its policy: product is the design, packaging and brand; pricing is the number on the tag; distribution is getting it to the shelf; communication is telling people it exists.",
  "BUS.G11.T3.PRODUCTION.A1":
    "Three production systems: job makes one custom item (a wedding cake), batch makes a run of identical items (a tray of the same cake), mass makes a continuous stream (a factory line). Total cost = fixed + variable; break-even is where income exactly covers cost.",
  "BUS.G11.T4.TEAM.A1":
    "Teams grow through stages in order: forming (polite introductions) → storming (friction) → norming (settling in) → performing (working well). Conflict handled properly can actually strengthen a team.",
  "BUS.G11.T4.HR.A1":
    "The hiring pipeline: recruitment attracts applicants, selection picks the best, induction settles the new person in. Know the Acts: the BCEA sets basic conditions, the EEA drives equity, the LRA governs labour relations, COIDA covers on-the-job injuries.",
  "BUS.G12.T1.LEGISLATION.A1":
    "Tie each Act to its one purpose: the EEA — fair, equal workplaces; the BCEA — minimum working conditions; the LRA — fair labour relations and unions; the SDA — skills and SETAs; the CPA — consumer rights; the NCA — fair credit; BBBEE — economic redress.",
  "BUS.G12.T1.HR.A1":
    "HR runs the full staff cycle: recruit, select, induct, then develop. Salary administration includes deducting PAYE tax before the worker is paid. SETAs and learnerships grow skills under the Skills Development Act.",
  "BUS.G12.T1.ETHICS.A1":
    "Ethical practice is honest and fair — pay a fair wage, pay your tax, advertise truthfully. Unethical practice harms others for gain — bribes, misleading ads, stealing work time. Professional conduct holds ethics steady under pressure.",
  "BUS.G12.T1.CREATIVE.A1":
    "For a complex case study, don't reach for one fixed answer: generate several options, weigh each against the actual business situation, then pick the best. Advanced problem-solving blends techniques rather than relying on one.",
  "BUS.G12.T1.STRATEGY.A1":
    "Match the strategy to the move. Integration = take over another level (a supplier is backward, a distributor forward, a rival horizontal). Intensive = push current and new products into current and new markets. Diversification = enter a new field. Defensive = cut back (retrench, divest, liquidate).",
  "BUS.G12.T2.CSR.A1":
    "CSR is the whole responsible way a business runs — its ethics, its impact on the environment, its health and safety. CSI is the specific community spending inside that — the bursaries, the built clinic. CSI sits within CSR.",
  "BUS.G12.T2.HUMANRIGHTS.A1":
    "Three yardsticks for a venture: human rights (does it treat people with equality and dignity?), inclusivity (does it welcome diversity of gender, race, disability, age, language?), and the environment (does it protect nature and health?).",
  "BUS.G12.T2.TEAM.A1":
    "Successful teams run on clear goals, trust, communication and commitment. Handle a grievance by the correct steps — raise it, discuss it, escalate only if it's unresolved — and deal with difficult people calmly, not personally.",
  "BUS.G12.T2.SECTORENV.A1":
    "It doesn't matter whether the business is primary, secondary or tertiary — the environments rule still applies: full control of the micro, influence over the market, no control over the macro.",
  "BUS.G12.T2.MGMTLEAD.A1":
    "Management is running the work — planning, organising, controlling. Leadership is moving people toward a vision. Autocratic leaders decide alone, democratic leaders involve the team, laissez-faire leaders stand back.",
  "BUS.G12.T2.QUALITY.A1":
    "Total Quality Management means every person in every function keeps improving — total customer satisfaction, ongoing training, constant tuning of processes. Poor quality in even one function can sink the business.",
  "BUS.G12.T3.SECURITIES.A1":
    "Simple interest is paid on the original amount only; compound interest is paid on the amount plus all past interest, so it snowballs. Shares pay dividends (a slice of profit); bonds and savings pay interest; a unit trust spreads your money across many investments.",
  "BUS.G12.T3.INSURANCE.A1":
    "Assurance covers something that WILL happen eventually (death) — life cover. Insurance covers something that MIGHT happen (fire, theft). UIF and the Road Accident Fund are compulsory. Under the principle of average, under-insuring means a smaller payout, in proportion.",
  "BUS.G12.T3.OWNERSHIP.A1":
    "Judge a form of ownership by how it helps or hurts success: limited liability and continuity let a company raise capital and outlast its owners; unlimited liability and thin capital can hold a sole trader back.",
  "BUS.G12.T3.PRESENT.A1":
    "An effective presentation knows who it's for, leads with the most important point, and uses clear visuals. After feedback, actually amend the documents and carry those fixes into the next one.",
};
