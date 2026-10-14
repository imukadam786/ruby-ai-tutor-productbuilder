// ─── History — per-topic "real-life example" pictures ──────────────────────
//
// One everyday picture per topic (53, Grades 10–12), keyed by skill/topic id.
// Feeds the wrong-answer card's example slot via FeedbackExplanation's
// `exampleOverride`. Rules in docs/feedback-writing-guide.md: an everyday South
// African picture, no facts or names from the topic, no instructions, and on
// sensitive topics compare the structure, never the suffering. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "HIS.G10.T1.WIDER.A1":
    "It's like a referee who also plays for one of the teams. Whatever score they hand out tells you more about whose side they're on than about how well anyone played.",
  "HIS.G10.T1.WIDER.A2":
    "It's like asking whether a sprinter, a swimmer or a goalkeeper is the 'best athlete'. Each is world-class at something different, so one ranking misses the point.",
  "HIS.G10.T1.WIDER.A3":
    "It's like someone telling the neighbourhood your house is empty so they can move in. The story isn't an honest mistake. It's an excuse, and it only works if nobody looks inside.",
  "HIS.G10.T1.ETHIOPIA.A1":
    "Think of a busy taxi rank where routes from all over the city meet. Whoever runs the rank grows rich, not from making anything, but because everyone has to pass through.",
  "HIS.G10.T1.ETHIOPIA.A2":
    "It's like two groups of fans of the same soccer club fighting over which coach is right. The fight isn't believers against non-believers. Both sides already follow the same club.",
  "HIS.G10.T1.ETHIOPIA.A3":
    "After a family business nearly falls apart, the new owner moves into a smart new office and puts their name on the door. The building is a message: we're back, and I'm in charge.",
  "HIS.G10.T2.MALI.A1":
    "It's like a family that didn't invent a taxi route but took control of the busiest one. The money came from controlling a road everyone already used.",
  "HIS.G10.T2.MALI.A2":
    "It's like a new trend that starts with the head prefect. The leaders pick it up first, most learners follow much later, and some mix it with what they already did.",
  "HIS.G10.T2.MALI.A3":
    "Think of how students today travel to a university because a famous lecturer teaches there. Scholars travelled to these cities the same way, for the best teachers and books.",
  "HIS.G10.T2.MALI.A4":
    "It's like a shop that closes because of several problems at once: the family fights over who runs it, a rival opens next door, and customers start shopping elsewhere. No single blow did it.",
  "HIS.G10.T3.ZIMBABWE.A1":
    "Think of a town that grows rich because it sits on a busy trade route. Goods go out, imports come back, and whoever controls the route gets wealthy.",
  "HIS.G10.T3.ZIMBABWE.A2":
    "Think of the wall around a chief's homestead or a church. It isn't there to stop an army. It marks who may enter and shows who is important.",
  "HIS.G10.T3.ZIMBABWE.A3":
    "It's like a teacher who refuses to believe a learner wrote a brilliant essay and insists someone else must have. The doubt says more about the teacher than about the essay.",
  "HIS.G10.T3.TRIBES.A1":
    "It's like supporting a soccer club. People switch clubs when they move, marry into a family that supports another, or join a winning side. It shifts over time; you aren't born locked into it.",
  "HIS.G10.T3.TRIBES.A2":
    "It's like a school sorting every learner into houses to make admin easier, until everyone starts treating the houses as ancient families. The lines were drawn to suit the people in charge.",
  "HIS.G10.T3.TRIBES.A3":
    "It's like old fence lines on a farm that was split up long ago. The farm has new owners, but the fences still decide where people walk, and some people use them to keep others out.",
  "HIS.G10.T4.ACHIEVE.A1":
    "It's like a recipe your gran invented that a famous restaurant now serves under its own name. The dish travelled out of her kitchen, but the credit didn't travel with it.",
  "HIS.G10.T4.ACHIEVE.A2":
    "Think of how amapiano spread around the world. People overseas dance to it without knowing it started in South African townships. Art and music travel, and their roots get forgotten.",
  "HIS.G10.T4.ACHIEVE.A3":
    "Think of a soccer team. A striker only scores because of the passes, the defence and the coach behind them. Nobody becomes who they are on their own.",
  "HIS.G11.T1.IBERIA.A1":
    "Think of someone who leaves home for the city because there are no jobs where they live and they've heard there's money there. People move because of a push and a pull together.",
  "HIS.G11.T1.IBERIA.A2":
    "Think of a building that collapses in a storm. People blame the storm, but the walls had already been weakened from inside. Several causes together brought it down.",
  "HIS.G11.T1.IBERIA.A3":
    "It's like a school where your seat is decided by your family name, not your marks, and you can never move. A ladder fixed at birth is one people keep pushing against.",
  "HIS.G11.T1.DUTCHENG.A1":
    "It's like a new taxi company that copies an older one's routes and vehicles, steals its passengers, then takes over the busiest ranks. Nothing new was invented; the newcomer just pushed harder.",
  "HIS.G11.T1.DUTCHENG.A2":
    "Think of the foundation of a house. It isn't a side room you could close off; everything above stands on it. Take it away and the whole building shakes.",
  "HIS.G11.T1.DUTCHENG.A3":
    "When a river dries up, it's tempting to blame nature. But if someone upstream built a dam, the cause was a person's choice. Some disasters that look natural were caused by people.",
  "HIS.G11.T2.HAITI.A1":
    "Think of workers who aren't allowed to strike, so they work slowly, lose tools or call in sick. Small acts like these are resistance too, and they keep the idea of standing up alive.",
  "HIS.G11.T2.HAITI.A2":
    "It's like a school that announces 'equal rights for every learner' but quietly leaves one group out. That group has to claim those rights for themselves.",
  "HIS.G11.T2.HAITI.A3":
    "It's like a learner who stands up for everyone in the class and is punished by the school for it. The punishment hurt, but others remembered the stand and followed it.",
  "HIS.G11.T3.CENTRAL.A1":
    "Think of several small spaza shops joining into one big supermarket because of rising costs and competition. It's bigger and stronger, but the owners no longer chat to customers the way the corner shop did.",
  "HIS.G11.T3.CENTRAL.A2":
    "Two schools can both win the league: one by building friendships with other schools and borrowing players when needed, the other by keeping a full-time squad training together all year. Same goal, different routes.",
  "HIS.G11.T3.CENTRAL.A3":
    "It's like a club where the captain makes every decision. The team becomes quick and strong in a fight, but the players lose their say in how the club is run.",
  "HIS.G11.T4.SCRAMBLE.A1":
    "It's like neighbours sitting around a table dividing up your family's land among themselves, while nobody from your family is invited.",
  "HIS.G11.T4.SCRAMBLE.A2":
    "Ask why a learner failed a test and you'll hear several answers: they didn't study, the test was hard, they were sick. Each has some truth, so you weigh them rather than pick just one.",
  "HIS.G11.T4.SCRAMBLE.A3":
    "It's like building a fence straight through a family's yard. The line suits whoever drew it, but the family on both sides still has to live with it.",
  "HIS.G12.T1.POLECON.A1":
    "Think of what happens when gold is found under a quiet town. Big companies arrive, the rules change to suit them, and the people already living there lose out. Money and power move together.",
  "HIS.G12.T1.POLECON.A2":
    "It's like a company rule that only some workers can ever be promoted, however good the others are. The rule isn't an accident. It keeps one group's pay high and the other's low.",
  "HIS.G12.T1.POLECON.A3":
    "Think of one tough workplace where different groups of workers each form their own union with different demands. The same hard conditions push people to organise in different directions.",
  "HIS.G12.T1.NATQ.A1":
    "It's like a house shared by a big family where only a few relatives get keys and a say in the house rules. The question is: who really belongs, and who gets to decide?",
  "HIS.G12.T1.NATQ.A2":
    "Think of the different learner groups that form when a school treats people unfairly. Each group speaks for its own members, and they don't all want the same changes.",
  "HIS.G12.T1.NATQ.A3":
    "It's like a landlord who gives some tenants a tiny back room, calls it 'your own flat', then says they no longer count as tenants of the main house. It looks like independence but it shuts people out.",
  "HIS.G12.T1.NATQ.A4":
    "Think of a class that agrees the school rules are unfair but splits on what to do. Some want to work with the teachers; others want learners to lead on their own terms.",
  "HIS.G12.T2.COLDWAR.A1":
    "It's like two rival schools that never fight each other directly because it would cost both too much. Instead they back opposite sides whenever smaller schools clash.",
  "HIS.G12.T2.COLDWAR.A2":
    "Think of a local derby where each team is secretly paid for by a different rich sponsor. The players are local, but the money and the stakes come from outside.",
  "HIS.G12.T2.COLDWAR.A3":
    "It's like customers boycotting a company over how it treats its workers, while their own bosses keep doing business with it. Ordinary people and those in charge can take opposite sides.",
  "HIS.G12.T2.LIBSTRUG.A1":
    "It's like neighbours who let a family shelter in their homes while they're in danger, even though it brings trouble to their own doors.",
  "HIS.G12.T2.LIBSTRUG.A2":
    "Think of a street where some neighbours back a protest and others stay quiet because they rent from the landlord being protested against. Who depends on whom often decides which side people take.",
  "HIS.G12.T2.LIBSTRUG.A3":
    "It's like a bully who punishes anyone who helps the learners he picks on. Pressure builds on every side until everyone agrees the terms for a sit-down to end it.",
  "HIS.G12.T3.LEADERS.A1":
    "Think of a principal who runs the school through security guards and detention rather than teachers and lessons. A leader who governs through force shapes everything around them.",
  "HIS.G12.T3.LEADERS.A2":
    "It's like a landlord who repaints the building and fixes the lift but never lets tenants have a say. The changes are real, but they're designed to keep him in control.",
  "HIS.G12.T3.LEADERS.A3":
    "Think of a coach who keeps a team together after it's banned from its home ground: training elsewhere, finding support abroad and keeping players ready to come home.",
  "HIS.G12.T3.DEMOC.A1":
    "It's like a business owner who only sits down with striking workers once the losses are too big to ignore. Talks start because of pressure, not because someone suddenly changed their mind.",
  "HIS.G12.T3.DEMOC.A2":
    "Think of a wage negotiation that keeps going even while protests outside turn violent. Both things happen at the same time, and the deal still gets signed.",
  "HIS.G12.T3.DEMOC.A3":
    "It's like a family meeting after a deep hurt, where people tell the truth instead of going to court. It helps everyone move on, but it doesn't pay back what was lost.",
};
