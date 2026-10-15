// ─── Natural Sciences — per-topic "real-life example" pictures ─────────────
//
// One everyday picture per topic (54), keyed by skill/topic id. Feeds the
// wrong-answer card's example slot via FeedbackExplanation's `exampleOverride`.
// Rules in docs/feedback-writing-guide.md: an everyday South African picture,
// no facts, terms or numbers from the topic, and no instructions. "why" = the
// question's memo, "where" = buildTopicWhere().

export const TOPIC_EXAMPLES: Record<string, string> = {
  "NSSP.G7.LL.A1":
    "It's like the muddy edge of a dam, where land, water and air all meet. That thin strip is where you find the most life.",
  "NSSP.G7.LL.A2":
    "It's like sorting laundry by what each item is, not by which room you found it in. A sock in the kitchen is still a sock.",
  "NSSP.G7.LL.A3":
    "It's like posting a letter. First it has to reach the postbox, and only then can it be opened. No delivery, no opening.",
  "NSSP.G7.LL.A4":
    "It's like a class photo. Everyone is a learner in the same grade, but some are tall, some short, some left-handed.",
  "NSSP.G7.MM.A1":
    "It's like choosing a pot. You want the base to get hot quickly but the handle to stay cool, so each part is made from something that suits its job.",
  "NSSP.G7.MM.A2":
    "It's like sorting a jar of loose bits from a drawer. You pick the trick that suits what's different about each piece: size, weight, or whether it sticks to something.",
  "NSSP.G7.MM.A3":
    "It's like a traffic light. One colour says one thing, another colour says the opposite, and the one in the middle says neither.",
  "NSSP.G7.MM.A4":
    "It's like the shelves in a spaza shop. Similar things are stored side by side, so you know roughly what to expect from where something sits.",
  "NSSP.G7.EC.A1":
    "It's like the difference between a fruit tree and a tin of fruit. The tree keeps giving every season, but once the tin is empty, it's gone.",
  "NSSP.G7.EC.A2":
    "It's like a stretched catapult. While you hold it, the push is stored and waiting. Let go, and it turns into movement.",
  "NSSP.G7.EC.A3":
    "It's like news spreading at school. It can pass hand to hand, travel with people moving around, or be heard across the field without anyone carrying it.",
  "NSSP.G7.EC.A4":
    "It's like a cooler box on a hot day. It doesn't make anything cold, it just slows down the heat getting in.",
  "NSSP.G7.EC.A5":
    "It's like spilling a little water every time you pour from one jug to another. The water isn't destroyed, it's just on the floor instead of in the jug.",
  "NSSP.G7.EC.A6":
    "It's like water from a dam reaching your tap. It's sent out with lots of pressure for the long trip, then the pressure is lowered before it reaches your house.",
  "NSSP.G7.PEB.A1":
    "It's like standing by a fire and leaning towards it or away. Leaning in, you feel more heat on your face, even though you haven't moved your feet.",
  "NSSP.G7.PEB.A2":
    "It's like a magnet held over a tray of iron filings. Even without touching, it pulls the filings into a bulge towards it.",
  "NSSP.G7.PEB.A3":
    "It's like a farmer who knows it's time to plant by watching the same signs year after year. Careful watching, repeated over time, becomes real knowledge.",
  "NSSP.G8.LL.A1":
    "It's like charging a phone and then using it. One process stores up energy, and the other spends it.",
  "NSSP.G8.LL.A2":
    "It's like a chain of people passing buckets of water. If one person drops out, everyone further down the line runs short.",
  "NSSP.G8.LL.A3":
    "It's like fire. The same thing that cooks your supper can burn your house down. What matters is what it's doing.",
  "NSSP.G8.MM.A1":
    "It's like Lego. A single kind of brick, bricks clicked firmly together into a new shape, or a loose pile of bricks you can easily pull apart again.",
  "NSSP.G8.MM.A2":
    "It's like people at a taxi rank. Packed tight in a queue, shuffling around in a crowd, or spread out running for different taxis. More energy, more space.",
  "NSSP.G8.MM.A3":
    "It's like the difference between folding a piece of paper and burning it. Folded, it's still paper. Burnt, it's become something else and you can't undo it.",
  "NSSP.G8.EC.A1":
    "It's like two learners with the same stubborn opinion who won't sit together, while two with opposite views can't stop talking.",
  "NSSP.G8.EC.A2":
    "It's like a bicycle chain. If every link is joined, the wheel turns. Break one link anywhere, and nothing moves.",
  "NSSP.G8.EC.A3":
    "It's like one long queue versus several separate queues. In one queue, one person stopping holds everyone up. With separate queues, the others keep moving.",
  "NSSP.G8.EC.A4":
    "It's like a ball. It can bounce straight back off a wall, or change direction when it rolls from tar onto grass.",
  "NSSP.G8.PEB.A1":
    "It's like children dancing in circles around a fire at night. Only the fire makes light. You see the children because the fire shines on them.",
  "NSSP.G8.PEB.A2":
    "It's like measuring a trip by how long a taxi takes instead of in metres. When distances get huge, it's easier to measure them by travel.",
  "NSSP.G8.PEB.A3":
    "It's like cupping your hands around your ears to hear someone far away. Collecting more of the faint sound makes it clearer.",
  "NSSP.G9.LL.A1":
    "It's like bricks building a house. Bricks make walls, walls make rooms, and rooms make the whole home.",
  "NSSP.G9.LL.A2":
    "It's like the staff of a school. The cleaners, cooks, teachers and office staff each have one main job, and the school only runs when they all do theirs.",
  "NSSP.G9.LL.A3":
    "It's like baking a cake. The steps happen in a fixed order, and you can't skip ahead to icing before it's baked.",
  "NSSP.G9.LL.A4":
    "It's like a delivery business. One team loads the goods onto the trucks, and another team drives them to every house and brings the empties back.",
  "NSSP.G9.LL.A5":
    "It's like a factory line. Each station breaks things down a bit more, until the pieces are small enough to be used.",
  "NSSP.G9.MM.A1":
    "It's like a surname that tells you which families joined through marriage. The name gives away who's in it.",
  "NSSP.G9.MM.A2":
    "It's like rebuilding a Lego car into a Lego house. You end up with something new, but you use exactly the same bricks, none more and none less.",
  "NSSP.G9.MM.A3":
    "It's like leaving a bicycle out in the rain. Slowly the air and the weather eat away at it, unless you keep it dry or covered.",
  "NSSP.G9.MM.A4":
    "It's like burning rubbish in a backyard. The smoke goes up, mixes with the clouds, and can come back down in the rain.",
  "NSSP.G9.MM.A5":
    "It's like a thermometer for sourness and soapiness. The middle is neither, and the further you go to either end, the stronger it gets.",
  "NSSP.G9.MM.A6":
    "It's like two friends with opposite moods calming each other down. When they meet, both settle into something in between.",
  "NSSP.G9.MM.A7":
    "It's like dropping a tablet into a glass of water. The fizzing bubbles show a gas is being made right there.",
  "NSSP.G9.EC.A1":
    "It's like getting someone's attention. You can tap them on the shoulder, or you can call their name from across the room.",
  "NSSP.G9.EC.A2":
    "It's like a lunchbox. It doesn't make food, it just carries what was packed. When it's empty, you have to refill it.",
  "NSSP.G9.EC.A3":
    "It's like water flowing through a hosepipe. A long, thin pipe slows the water down, and a short, wide one lets it rush through.",
  "NSSP.G9.EC.A4":
    "It's like sharing one plate of food versus everyone having their own plate. Share one, and everyone gets less. Separate plates, and everyone gets a full meal.",
  "NSSP.G9.EC.A5":
    "It's like a dog behind a fence. You can't always see it, but you never stick your hand through the gate.",
  "NSSP.G9.EC.A6":
    "It's like boiling a kettle to drive a pinwheel with the steam. Heat makes steam, the steam spins something, and the spinning gives you power.",
  "NSSP.G9.EC.A7":
    "It's like a taxi meter. The longer the trip and the bigger the vehicle, the faster the fare climbs.",
  "NSSP.G9.PEB.A1":
    "It's like a household where everyone shares. Things pass from one person to another all day, and a change for one affects the rest.",
  "NSSP.G9.PEB.A2":
    "It's like candle wax. It can melt and set hard, be scraped into crumbs and pressed together again, or be softened and squashed into a new shape.",
  "NSSP.G9.PEB.A3":
    "It's like finding gold flakes in river sand. You have to dig up the sand, sift the gold out, and then clean it before it's worth anything.",
  "NSSP.G9.PEB.A4":
    "It's like a blanket on a cold night. One blanket keeps you comfortable, but pile on too many and you wake up sweating.",
  "NSSP.G9.PEB.A5":
    "It's like a candle's life. It's lit, it burns steadily for a long time while there's wax, and then it goes out when the wax runs out.",
};
