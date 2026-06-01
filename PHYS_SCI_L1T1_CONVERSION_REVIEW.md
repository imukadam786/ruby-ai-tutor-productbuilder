# Physical Sciences — L1.T1 (Newton's Laws & Friction) — Tap Conversion Review

**Proof batch.** Source of truth: `data/matric-physical-sciences-question-bank.json`
(mirror dir `data/matric-physical-sciences-question-banks/` + merge step).
**No code changes** — `choice` / `numeric` / `sequence` are already supported end-to-end.
All multiple-choice drafts use **3 options** (one correct + two distractors), per spec.

## What's in L1.T1 (67 items, deduped)

| Current type | Count | Action in this batch |
|---|---|---|
| `text` (free typing) | 17 | Convert / re-tag — drafted below |
| `numeric` | 34 | **No change** — number entry stays (you don't tap a calculation) |
| `choice` | 15 | **No change** — already tap (note: these use 4 options) |
| `multiField` | 1 | **No change** — structured number entry |

### How the 17 `text` items convert

| Tier | Items | Converts to |
|---|---|---|
| 2 — state the law in words | q01, q02, q03 | 3-option **select-the-complete-statement** MCQ |
| 1 — reasoning / identify / misconception | q10, q12, q17, q27 (A1); q06, q18 (A2); q17, q19 (A3) | 3-option **MCQ** |
| FBD "draw" items ⚠️ | q21, q22, q23, q24, q25 (A1) | 3-option **"select the forces" MCQ** — *see flag* |
| Derivation ⚠️ | q03 (A3) "show that μs = tanθ" | **decision needed** — keep typed, or `sequence` |

**⚠️ Two flags for your call:**
1. **FBD items (5):** the originals say *"draw a free-body diagram."* Drawing is a production skill; a "which option lists all the forces and directions" MCQ tests the same knowledge by recognition but loses the drawing act. Acceptable for practice; flag if you'd rather keep these as exam-mode typed/draw.
2. **Derivation q03 (A3):** "Show that μs = tanθ" is a proof. Draft below offers a `sequence` (put the 4 steps in order) — a tap interaction that keeps the logic — or keep it typed for exam fidelity.

Distractors are tagged with the `errorSignals` they target, so each wrong option drills a real mark-losing mistake. **Correct option marked ✅.** Distractors are *drafts for your review — not auto-merged.*

---

## TIER 2 — State the law (select the complete statement)

### q01 · Newton's First Law · 2 marks · errs: OMITS_NET_FORCE_CLAUSE, DROPS_CONSTANT_VELOCITY
**Q:** Which statement is Newton's First Law of Motion, stated **completely and correctly**?
- ✅ A body remains at rest, or continues moving at constant velocity in a straight line, **unless acted on by a non-zero net (resultant) force**.
- ✗ A body remains at rest unless acted on by a non-zero net force. *(drops constant-velocity case → DROPS_CONSTANT_VELOCITY)*
- ✗ A body remains at rest, or continues moving at constant velocity in a straight line. *(drops the net-force qualifier → OMITS_NET_FORCE_CLAUSE)*

### q02 · Newton's Second Law · 2 marks · errs: OMITS_DIRECTION, OMITS_NET
**Q:** Which statement is Newton's Second Law of Motion, stated **completely and correctly**?
- ✅ The **net (resultant)** force on an object equals the rate of change of its momentum, **in the direction of the net force**.
- ✗ The force on an object equals the rate of change of its momentum, in the direction of the force. *(says "force" not "net force" → OMITS_NET)*
- ✗ The net force on an object equals the rate of change of its momentum. *(drops direction → OMITS_DIRECTION)*

### q03 · Newton's Third Law · 2 marks · errs: OMITS_DIFFERENT_OBJECTS, EQUAL_OPPOSITE_ONLY
**Q:** Which statement is Newton's Third Law of Motion, stated **completely and correctly**?
- ✅ When one object exerts a force on a second, the second exerts a force equal in magnitude and opposite in direction on the first — **and the two forces act on different objects**.
- ✗ When one object exerts a force on a second, the second exerts a force equal in magnitude and opposite in direction on the first. *(omits "different objects" → EQUAL_OPPOSITE_ONLY)*
- ✗ Two forces that are equal in magnitude and opposite in direction always act on the same object. *(conflates with balanced forces → OMITS_DIFFERENT_OBJECTS)*

---

## TIER 1 — Reasoning / identify / misconception (MCQ)

### q10 · Identify the N3 pair (rifle) · 3 marks · errs: PAIR_IDENTIFICATION, WRONG_OBJECTS
**Q:** A rifle fires a bullet. Which pair of forces is the Newton's Third Law action–reaction pair?
- ✅ The rifle pushes the bullet forward; the bullet pushes the rifle backward (equal, opposite, on different objects).
- ✗ The rifle pushes the bullet forward; the bullet pushes the air forward. *(WRONG_OBJECTS)*
- ✗ The rifle's forward push on the bullet and the rifle's backward kick on the shoulder. *(both involve the rifle — not a single pair → PAIR_IDENTIFICATION)*

### q12 · "Box still ⇒ no force" misconception · 3 marks · err: NO_FORCE_VS_NO_NET_FORCE
**Q:** A learner says a heavy box stays still "because no force acts on it." Which response is correct?
- ✅ Incorrect — weight (down) and the normal force (up) both act; they balance, so the **net** force is zero.
- ✗ Correct — a stationary object has no forces acting on it. *(the misconception)*
- ✗ Incorrect — only the normal force acts, and it holds the box still. *(ignores weight → NO_FORCE_VS_NO_NET_FORCE)*

### q17 (A1) · Lift / bathroom scale · 4 marks · errs: APPARENT_WEIGHT_CONFUSION, NEWTON_2_NET_FORCE_SETUP
**Q:** In a lift accelerating upward, a bathroom scale reads more than at rest. Why? (N = normal force on the person.)
- ✅ A net upward force is needed, so N − mg = ma ⇒ N = m(g + a) > mg; the scale reads the larger normal force.
- ✗ The person's weight (mg) increases when the lift accelerates upward. *(APPARENT_WEIGHT_CONFUSION — weight is unchanged)*
- ✗ The net force is zero, so the scale still reads mg. *(NEWTON_2_NET_FORCE_SETUP — there is upward acceleration)*

### q27 · "Force of motion" wrong FBD · 3 marks · errs: INCLUDES_VELOCITY, INVENTS_FORCE_OF_MOTION
**Q:** A learner's free-body diagram includes an arrow labelled "force of motion" pointing the way the block moves. What is wrong?
- ✅ Motion is not a force — there is no "force of motion." Only forces from other objects (weight, normal, friction, any applied push) belong on an FBD.
- ✗ Nothing — a moving object needs a forward "force of motion" to keep going. *(INVENTS_FORCE_OF_MOTION)*
- ✗ The arrow should point backward (opposite the motion), not forward. *(still treats velocity as a force → INCLUDES_VELOCITY)*

### q06 (A2) · Tension when accelerating up · 2 marks · err: N2_ACCELERATION_EFFECT_ON_TENSION
**Q:** A helicopter lifts a man-and-tube load at constant speed, then accelerates upward. Compared with constant speed, the rope tension…
- ✅ Increases — an upward net force is now needed (Fnet = ma), so the tension must rise.
- ✗ Stays the same — the load's weight has not changed. *(the misconception)*
- ✗ Decreases — moving upward faster needs less tension.

### q18 (A2) · "Harder push ⇒ faster" · 3 marks · err: N2_FORCE_VS_VELOCITY_CONFUSION
**Q:** A learner says, "The harder you push a block, the faster it goes." Judged strictly by Newton's Second Law, this is…
- ✅ Not quite — a bigger net force gives a bigger **acceleration**, not directly a bigger speed (Fnet = ma).
- ✗ Correct — force and speed are directly proportional. *(the misconception)*
- ✗ Correct — Fnet = ma means force equals speed × mass. *(misreads the law → N2_FORCE_VS_VELOCITY_CONFUSION)*

### q17 (A3) · Block down incline at constant v · 3 marks · errs: INCLINE_COMPONENT_TRIG, FRICTION_INCLINE_NORMAL
**Q:** A block slides down a 25° rough incline at constant velocity. What can you conclude about the coefficient of kinetic friction μk?
- ✅ μk = tan 25° ≈ 0.47, and it does **not** depend on the block's mass (mass cancels).
- ✗ μk = sin 25° ≈ 0.42. *(wrong trig component → INCLINE_COMPONENT_TRIG)*
- ✗ μk depends on the block's mass as well as the angle. *(mass cancels → FRICTION_INCLINE_NORMAL)*

*(Alt: this could instead be re-tagged `numeric` — "Calculate μk" — if you'd rather keep it as a calculation.)*

### q19 (A3) · Tension same on a single string · 3 marks · err: TENSION_SAME_STRING
**Q:** For an ideal light, inextensible string over a frictionless pulley connecting two unequal masses, the tension…
- ✅ Is the same throughout the string; the unequal masses give different **net forces**, not different tensions.
- ✗ Is greater on the heavier mass's side. *(the misconception → TENSION_SAME_STRING)*
- ✗ Is zero on the lighter side and large on the heavier side.

---

## FBD "draw" items ⚠️ — drafted as "select the forces" MCQ

### q21 · Block pulled up rough incline, constant v · 4 marks · errs: FORCE_COUNT, DIRECTION_INCLINE, EXTRA_FORCE
**Q:** A block is pulled up a rough incline at constant velocity by a force F parallel to the slope. Which option lists **all** the forces on the block, with correct directions?
- ✅ Weight (vertically down), normal (perpendicular to slope), applied force F (up the slope), kinetic friction (down the slope).
- ✗ Weight, normal, applied force F, friction, **and a "force of motion" up the slope**. *(EXTRA_FORCE)*
- ✗ Weight (down the slope), normal (vertically up), applied force, friction. *(wrong directions → DIRECTION_INCLINE)*

### q22 · Block A on table, angled pull · 5 marks · errs: FORCE_COUNT, FRICTION_DIRECTION, DIRECTION_ANGLE
**Q:** Block A on a rough table moves right, pulled by an angled applied force and connected by a string over a pulley to a hanging block. Which option lists **all** forces on A correctly?
- ✅ Weight (down), normal (up), applied force (at its angle), tension (toward the pulley, right), kinetic friction (left, opposing motion).
- ✗ Weight, normal, applied force, tension — four forces, no friction. *(FORCE_COUNT)*
- ✗ Weight, normal, applied force, tension, friction acting to the **right** (with the motion). *(FRICTION_DIRECTION)*

### q23 · Hanging block B, accelerating down · 2 marks · errs: FORCE_COUNT, ADDS_NORMAL_TO_HANGING, TENSION_DIRECTION
**Q:** Block B hangs from a string over a pulley and accelerates downward. Which option lists **all** forces on B correctly?
- ✅ Weight (down) and tension (up); since it accelerates down, weight > tension. No normal force.
- ✗ Weight (down), tension (up), and a normal force. *(ADDS_NORMAL_TO_HANGING)*
- ✗ Weight (down) and tension (also down). *(TENSION_DIRECTION)*

### q24 · Man-tube lifted at constant speed · 4 marks · errs: FORCE_COUNT, TENSION_DIRECTION, OMITS_FRICTION
**Q:** A man-and-tube load is lifted at constant speed by a rope at 50° to the vertical, with 300 N friction acting upward on the tube. Which option lists **all** forces on the man-tube system correctly?
- ✅ Weight (down), tension (along the rope, 50° to vertical, upward), friction 300 N (up).
- ✗ Weight (down) and tension (along the rope) only. *(OMITS_FRICTION)*
- ✗ Weight (down), tension (vertically up), friction (up). *(tension is along the rope, not vertical → TENSION_DIRECTION)*

### q25 · 8 kg block on table, constant speed · 5 marks · errs: FORCE_COUNT, TENSION_DIRECTION, FRICTION_DIRECTION
**Q:** An 8 kg block on a table is pulled horizontally at constant speed, connected by a string over a pulley, with 10 N kinetic friction. Which option lists **all** forces on the 8 kg block correctly?
- ✅ Weight (down), normal (up), applied force F (horizontal, with motion), tension (horizontal, toward the pulley, opposing motion), friction 10 N (opposing motion).
- ✗ Weight, normal, applied force, friction — four forces, no tension. *(FORCE_COUNT)*
- ✗ Weight, normal, applied force, tension and friction both acting **with** the motion. *(TENSION_DIRECTION / FRICTION_DIRECTION)*

---

## Derivation ⚠️ — q03 (A3) "Show that μs = tanθ" · 3 marks

**Recommended: keep as typed (exam mode)** — producing a derivation is the skill being tested.
**Alternative tap version (`sequence` — put the steps in order):**
1. On the verge of sliding the block is still at rest, so Fnet = 0.
2. Along the slope: mg sinθ − μs·N = 0.
3. Perpendicular to the slope: N = mg cosθ.
4. Substitute N: mg sinθ = μs·mg cosθ ⇒ μs = sinθ / cosθ = tanθ.

*Your call: keep typed, or convert to the sequence above.*

---

## After your review
On sign-off I will: set `answerMode` → `choice` (or `numeric`/`sequence`), add the approved `options`, set `expectedAnswer` to the correct option, keep `marks`/`explanation`/`errorSignals`/`source`, sync the mirror dir, bump the bank version, and validate (expectedAnswer ∈ options, 3 options each, counts reconcile). Then we batch the next topic.
