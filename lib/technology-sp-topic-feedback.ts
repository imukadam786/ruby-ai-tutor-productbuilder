// ─── Technology SP — per-topic "think of it like this" analogies ────────────
//
// One everyday analogy per topic (62, Grades 7–9), keyed by skill/topic id.
// Feeds the wrong-answer card's example slot via FeedbackExplanation's
// `exampleOverride`. Register: Grade 7–9, concrete, everyday South African
// reference points. "why" = the question's memo, "how" = the topic's
// recovery_strategy, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "TECH.G7.DG.A1":
    "Technology isn't just gadgets — it's using what you know and have to fix a real problem, like bending a wire hanger to unblock a drain.",
  "TECH.G7.DG.A2":
    "The design process is a fixed order: Investigate the problem, Design a solution, Make it, Evaluate how it worked, Communicate it. Skip 'investigate' and you solve the wrong problem.",
  "TECH.G7.DG.A3":
    "Fit-for-purpose is like choosing shoes: school shoes for school, takkies for sport. A beautiful shoe that hurts your feet fails the test.",
  "TECH.G7.DG.A4":
    "Drawing lines are a code: a bold line is the real edge you can see, a faint line is scaffolding you rub out, a dashed line is an edge hidden behind the object.",
  "TECH.G7.DG.A5":
    "A quick sketch, a flat working drawing and a 3D drawing are like a voice note, a written list and a photo of the same thing — each shows it a different way for a different reason.",
  "TECH.G7.ST.A1":
    "Every structure does one of four jobs: a cup contains, a table supports, a helmet protects, a bridge spans. A tree is a natural structure; a house is man-made.",
  "TECH.G7.ST.A2":
    "An egg is a shell structure (hollow, strong skin), a jungle gym is a frame (bars joined), a brick is solid (one mass). Same idea, different build.",
  "TECH.G7.ST.A3":
    "A flat sheet of paper flops; fold it into a fan or roll it into a tube and it holds weight. A triangle in a frame does the same — it can't be pushed out of shape.",
  "TECH.G7.ST.A4":
    "A person stands steadier with feet apart than together. A wide base and low weight make a bookshelf, a crane or a table hard to tip over.",
  "TECH.G7.MS.A1":
    "A lever's class is about where the pivot sits: a seesaw has it in the middle, a wheelbarrow has it at the end, tweezers have the effort in the middle. Move the pivot, change the machine.",
  "TECH.G7.MS.A2":
    "Scissors are two levers joined at one bolt: press the handles together and the blades close together. A linkage makes two parts move as one.",
  "TECH.G7.MS.A3":
    "Squeeze one end of a full water bottle and the other end bulges — hydraulics pushing force through liquid. A bicycle pump does the same with air; that's pneumatics.",
  "TECH.G7.MS.A4":
    "A bicycle pedal is a crank: your legs go round, but the crank arm swings back and forth. A pulley is just a wheel on an axle with a rope over it, like a washing line.",
  "TECH.G7.ES.A1":
    "A fridge magnet grabs the steel door but slides off the plastic handle and won't touch a copper coin. Magnets only pull on iron, steel and nickel.",
  "TECH.G7.ES.A2":
    "A circuit is a loop like a running track: the cell is the start, the wire is the lane, the switch is a gate, the bulb is the runner. Break the loop anywhere and everything stops.",
  "TECH.G7.ES.A3":
    "Coil wire around a nail, connect a battery, and the nail picks up paper clips — but only while the current flows. Switch off and they drop. That's an electromagnet, like a scrapyard crane.",
  "TECH.G7.PR.A1":
    "Processing turns a raw thing into a useful one: flour, water and yeast become bread; milk becomes maas. The ingredients go in one form and come out another.",
  "TECH.G7.PR.A2":
    "You wouldn't make a raincoat from cotton or a vest from plastic. Each material's properties — waterproof, stretchy, warm — decide the job it suits.",
  "TECH.G7.PR.A3":
    "A traditional rondavel uses clay, thatch and stone from nearby — materials that are cheap, suited to the climate, and gentle on the land.",
  "TECH.G7.PR.A4":
    "A new road helps drivers but can cut a village in two and push out the people with no car. Technology almost always helps some people more than others.",
  "TECH.G8.DG.A1":
    "Drawing conventions are like the rules of a form: measurements in millimetres, a centre line down the middle, the scale noted in the corner — so everyone reads it the same way.",
  "TECH.G8.DG.A2":
    "Isometric drawing keeps edges on a fixed slanted grid, like a video-game world. Two-point perspective sends edges to two far-off points, like a photo of a building corner.",
  "TECH.G8.DG.A3":
    "A cereal box flattened out is a net: the exact shape that folds back up into the box. Cut the net wrong and the box won't close.",
  "TECH.G8.ST.A1":
    "A roof truss is a team: rafters take the slope, ties across the bottom stop the walls spreading, struts prop up the middle. Remove one and the roof sags.",
  "TECH.G8.ST.A2":
    "Tug-of-war rope is in tension (pulled), a table leg is in compression (squashed), scissors put paper in shear, wringing a wet cloth is torsion (twist), a diving board bends.",
  "TECH.G8.ST.A3":
    "A plank across a stream is a beam, a stone bridge is an arch, a balcony with no post under its end is a cantilever — three ways to cross a gap.",
  "TECH.G8.ST.A4":
    "A structure can fail three ways: it snaps because it's too weak, it sags because it's not stiff enough, or it tips because it's not stable. Each needs a different fix.",
  "TECH.G8.MS.A1":
    "An axe head is a wedge that turns one big push into two sideways pushes. A doorknob is a wheel-and-axle — a small turn of the big knob turns the thin shaft with more force.",
  "TECH.G8.MS.A2":
    "Two touching gears spin opposite ways, like two people facing each other turning a rope. Drop a small 'idler' gear between them and now they turn the same way.",
  "TECH.G8.MS.A3":
    "On a bicycle, a low gear climbs a hill slowly but with lots of force; a high gear flies on the flat but is hard to start. You trade speed for force.",
  "TECH.G8.MS.A4":
    "A cam is an egg-shaped disc on a spinning shaft; as it turns it lifts and drops a follower, like the bumps in a music box flicking the teeth.",
  "TECH.G8.MS.A5":
    "Mechanical advantage is load ÷ effort. If a pulley lifts a 100 N load with 25 N of pull, the advantage is 4 — the machine multiplies your effort four times.",
  "TECH.G8.MS.A6":
    "Every system is input → process → output, like a kettle: input is water and electricity, the process is heating, the output is steam and hot water.",
  "TECH.G8.ES.A1":
    "Circuit parts have three jobs: input (the cell gives energy), control (the switch decides), output (the lamp or buzzer does the work). Sorting a part is asking which job it does.",
  "TECH.G8.ES.A2":
    "Cells in series stack their push, like two people lifting one end each — more voltage. Cells in parallel share the load and last longer, like taking turns carrying.",
  "TECH.G8.ES.A3":
    "A power station is like a big tap; transformers step the voltage up for the long journey along the pylons, then step it down again before it reaches your plug.",
  "TECH.G8.ES.A4":
    "Add more cells and more current flows, like opening a tap wider. A logic gate is a rule for the switch: AND needs both conditions true, OR needs just one.",
  "TECH.G8.PR.A1":
    "A plastic bag can outlast you by centuries; a paper bag rots in weeks. 'Biodegradable' means nature can break it down safely.",
  "TECH.G8.PR.A2":
    "Good packaging is like a lunchbox — just enough to protect what's inside, no more. Paper and many plastics can then be pulped or melted into something new.",
  "TECH.G8.PR.A3":
    "Cellphones connect families across the country but also fill landfills with dead batteries. Good design keeps the benefit and cuts the harm.",
  "TECH.G8.PR.A4":
    "A mine brings jobs and money to a town but leaves holes, dust and polluted water behind — and the people nearest the mine often carry more of the harm than the profit.",
  "TECH.G9.DG.A1":
    "Orthographic projection is three photos of one object — front, top and side — laid out flat so a builder can read every measurement without a 3D model.",
  "TECH.G9.DG.A2":
    "A working drawing is judged like a homework answer: neat handwriting doesn't matter if the answer is wrong. It has to actually solve the design problem.",
  "TECH.G9.DG.A3":
    "An exploded view is a flat-pack furniture diagram — the parts floated apart along dotted lines so you can see exactly how they slot together.",
  "TECH.G9.ST.A1":
    "A parked car is a static load on a bridge; the same car driving across and bouncing over a bump is a dynamic load — moving forces hit harder than still ones.",
  "TECH.G9.ST.A2":
    "An I-beam is shaped like a capital I because most of the metal sits top and bottom where bending pulls hardest — same strength as a solid bar, far less weight.",
  "TECH.G9.ST.A3":
    "Choosing a building material is like choosing a phone: you weigh up weight, toughness, how much it bends and how fast it wears — no single one wins every time.",
  "TECH.G9.ST.A4":
    "A tender is a written quote to do a job. Costing it is a shopping list plus wages: materials AND the hours of labour, not just the bricks.",
  "TECH.G9.MS.A1":
    "Press a full sealed bottle and the pressure reaches every wall equally. Car brakes use this: a small push on the pedal presses fluid that clamps all four wheels.",
  "TECH.G9.MS.A2":
    "A block-and-tackle with several pulleys lets one person hoist an engine — you pull more rope but with far less force. A ratchet lets a winch hold without slipping back.",
  "TECH.G9.MS.A3":
    "Bevel gears turn a corner, like the drive in a hand drill. A rack-and-pinion turns spin into a straight slide, like a steering rack. A worm gear crawls — huge speed reduction, huge force.",
  "TECH.G9.MS.A4":
    "An electric car window mixes systems: an electrical switch, a motor, and mechanical gears and linkages all working as one. Real machines are usually mixes.",
  "TECH.G9.ES.A1":
    "Ohm's law, V = I × R, is a triangle of three friends — cover the one you want and the other two tell you how to find it. Know two, get the third.",
  "TECH.G9.ES.A2":
    "A resistor's coloured bands are a number code — the stripes tell you the value in ohms, and the last band says how accurate it is.",
  "TECH.G9.ES.A3":
    "Each component has one trick: a diode is a one-way gate for current, a transistor is a switch or a volume knob, a capacitor is a tiny rechargeable bucket of charge.",
  "TECH.G9.ES.A4":
    "A sensor changes its resistance when the world changes: an LDR when a light comes on, a thermistor when it gets hot, a moisture sensor when soil gets wet.",
  "TECH.G9.ES.A5":
    "Two switches in a row (series) is AND — both must be on for the light. Two switches side by side (parallel) is OR — either one turns it on, like two doorbells to one chime.",
  "TECH.G9.ES.A6":
    "An automatic night light wires a few parts to do one job: the LDR senses dark, that switches a transistor, which powers the LED. Parts combine like a small team.",
  "TECH.G9.PR.A1":
    "Bare steel rusts like a cut apple browns. Paint, a zinc coat (galvanising) or a thin plated layer all seal the surface so air and water can't reach the metal.",
  "TECH.G9.PR.A2":
    "Stopping food going off means starving the germs: keep it bone-dry (biltong), soak it in vinegar (pickles), or dry and salt it. All remove what mould and bacteria need.",
  "TECH.G9.PR.A3":
    "A thermoplastic is like candle wax — heat it and it softens and can be reshaped again and again. A thermoset is like a boiled egg — once set by heat, it stays hard for good.",
  "TECH.G9.PR.A4":
    "Reduce, reuse, recycle in that order: best not to make the waste, next best to use it again, and last, shred it into pellets to melt into new bottles or benches.",
};
