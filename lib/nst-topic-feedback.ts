// ─── Natural Sciences and Technology — per-topic "real-life example" pictures ───
//
// One everyday picture per topic (55), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "NST.L4.LL.T01":
    "It's like the difference between a real puppy and a toy puppy. Only one eats, grows and needs looking after.",
  "NST.L4.LL.T02":
    "It's like the parts of a house. The walls, roof and door each have their own job.",
  "NST.L4.LL.T03":
    "It's like a baby. It needs the right things every day to grow strong.",
  "NST.L4.LL.T04":
    "It's like your home. It's where you eat, sleep and feel safe.",
  "NST.L4.LL.T05":
    "It's like building a dog kennel. It must be strong and keep the rain out.",
  "NST.L4.MM.T01":
    "It's like an ice lolly on a hot day. It starts hard, then drips, then the drips dry up.",
  "NST.L4.MM.T02":
    "It's like a cook's pantry. Each ingredient is good for making different things.",
  "NST.L4.MM.T03":
    "It's like a flat sheet of cardboard that flops, until you fold it into a box that can hold things.",
  "NST.L4.MM.T04":
    "It's like a tent's poles. Joined the right way, they hold everything up.",
  "NST.L4.EC.T01":
    "It's like passing a ball down a line of children. It starts at one end and moves along.",
  "NST.L4.EC.T02":
    "It's like a lunchbox packed in the morning. It holds what you need to keep going later.",
  "NST.L4.EC.T03":
    "It's like a doorbell. You press it, and a sound comes out.",
  "NST.L4.EC.T04":
    "It's like a ripple when you drop a stone in a pond. It spreads out from where it started.",
  "NST.L4.PEB.T01":
    "It's like a ball with a thin skin of land and water, wrapped in a blanket of air.",
  "NST.L4.PEB.T02":
    "It's like a big fire far away. It warms you and lights the way, but you must never look straight at it.",
  "NST.L4.PEB.T03":
    "It's like children walking in circles around a teacher in the playground. The teacher stays in the middle.",
  "NST.L4.PEB.T04":
    "It's like a ball held in front of a torch. Turn it, and you see different amounts of the lit side.",
  "NST.L4.PEB.T05":
    "It's like letting go of a blown-up balloon. The air rushes out one way, and the balloon zooms the other.",
  "NST.L5.LL.T01":
    "It's like a busy market. Lots of different people, and they all need each other to get by.",
  "NST.L5.LL.T02":
    "It's like the poles inside a tent. They hold it up and keep its shape.",
  "NST.L5.LL.T03":
    "It's like the difference between a jungle gym and a tortoise shell. One is a frame of bars, the other a hard cover.",
  "NST.L5.LL.T04":
    "It's like a line of people passing a plate of food along. Each one takes some and passes it on.",
  "NST.L5.LL.T05":
    "It's like moving up through school. You start small, grow up through the grades, and new learners keep coming in behind you.",
  "NST.L5.MM.T01":
    "It's like comparing a spoon with a biscuit. One bends, the other snaps.",
  "NST.L5.MM.T02":
    "It's like a toolbox where each tool is used for what it's good at.",
  "NST.L5.MM.T03":
    "It's like baking a cake. Mix flour, eggs and milk, and you get something new.",
  "NST.L5.MM.T04":
    "It's like picking the right container for your lunch. Each one is good at a different job.",
  "NST.L5.EC.T01":
    "It's like a packed lunch. The energy is stored inside, waiting to be used.",
  "NST.L5.EC.T02":
    "It's like a water pipe from a tank to a tap. If the pipe breaks anywhere, nothing comes out.",
  "NST.L5.EC.T03":
    "It's like pulling back a slingshot. The harder you pull, the further it flies.",
  "NST.L5.EC.T04":
    "It's like pushing a trolley. The wheels make a heavy load easy to move.",
  "NST.L5.PEB.T01":
    "It's like a spinning top moving slowly around the room. It spins and travels at the same time.",
  "NST.L5.PEB.T02":
    "It's like a crumbled biscuit. Big pieces break down into small crumbs over time.",
  "NST.L5.PEB.T03":
    "It's like a stack of pancakes. Each new one goes on top, and the bottom ones get squashed.",
  "NST.L5.PEB.T04":
    "It's like footprints left in wet cement. Long after you've gone, they show you were there.",
  "NST.L6.LL.T01":
    "It's like a kitchen that makes its own food using only light, air and water.",
  "NST.L6.LL.T02":
    "It's like the parts of a car. Fuel, spare parts and oil each do a different job.",
  "NST.L6.LL.T03":
    "It's like packing a balanced school bag. A bit of everything you need, not too much of one thing.",
  "NST.L6.LL.T04":
    "It's like turning fresh milk into maas. It lasts longer and tastes different.",
  "NST.L6.LL.T05":
    "It's like a spider's web. Pull one thread, and the whole web moves.",
  "NST.L6.MM.T01":
    "It's like children at break. Lined up in rows, shuffling in a group, or running all over the field.",
  "NST.L6.MM.T02":
    "It's like a bowl of mixed sweets. You can pick each kind out again.",
  "NST.L6.MM.T03":
    "It's like stirring sugar into tea. It seems to vanish, but the tea tastes sweet.",
  "NST.L6.MM.T04":
    "It's like washing a sticky plate. Hot water and scrubbing get it clean faster.",
  "NST.L6.MM.T05":
    "It's like a sponge in dirty water. It soaks up the dirt and needs to be looked after.",
  "NST.L6.MM.T06":
    "It's like using a tea strainer. The leaves stay behind and the tea comes through.",
  "NST.L6.EC.T01":
    "It's like a train track that goes in a full loop. If one piece is missing, the train stops.",
  "NST.L6.EC.T02":
    "It's like a gate. Some materials let things through, others keep them out.",
  "NST.L6.EC.T03":
    "It's like building a gadget to solve a problem at home, like an alarm for the gate.",
  "NST.L6.EC.T04":
    "It's like water coming from a big dam far away. It takes a lot of work and pipes to get it to your tap.",
  "NST.L6.PEB.T01":
    "It's like a family seated around a table, each one at their own distance from the head of the table.",
  "NST.L6.PEB.T02":
    "It's like a merry-go-round turning while it also moves slowly around a big field.",
  "NST.L6.PEB.T03":
    "It's like a dog on a lead walking around its owner, always keeping the same side towards them.",
  "NST.L6.PEB.T04":
    "It's like cupping your hands around your ears to hear a faraway sound better.",
  "NST.L6.PEB.T05":
    "It's like a remote-control car exploring a room you can't go into yourself.",
};
