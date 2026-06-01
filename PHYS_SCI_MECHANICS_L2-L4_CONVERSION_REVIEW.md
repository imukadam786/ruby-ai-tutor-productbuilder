# Physical Sciences — Mechanics L2–L4 — Tap Conversion Review (batch 2)

Completes the Mechanics strand (L1 already merged). **35 free-text items → 3-option MCQ.**
All are recall / reasoning / identify with definite answers — **none are derivations, none need to stay typed.** Distractors are tagged with the `errorSignal` they target (✅ = correct). Drafts for head-of-ed review — not auto-merged.

Source: per-skill files `data/matric-physical-sciences-question-banks/L2*.json`, `L3*.json`, `L4*.json`; rebuild via `node scripts/build-matric-phys-sci-bank.mjs` after sign-off.

---

## L2 — Vertical projectile motion (5)

**q01 · Define FREE FALL** · FREE_FALL_DEF_INCOMPLETE
- ✅ Motion of an object under the influence of gravity only (no air resistance or other forces).
- ✗ Any downward motion of an object toward the Earth.
- ✗ Motion of an object that simply speeds up as it falls. *(omits "gravity only")*

**q02 · Define PROJECTILE** · FREE_FALL_DEF_INCOMPLETE
- ✅ An object moving under the influence of gravity only (no other forces).
- ✗ Any object that has been thrown forward through the air.
- ✗ An object that moves in a curved path because a force keeps pushing it along. *(implies an ongoing force)*

**q10 · Ball up at 25 m·s⁻¹; when is speed = 15 m·s⁻¹?** · SPEED_VS_VELOCITY, VPM_SYMMETRY
- ✅ t = 1.0 s (going up) and t = 4.0 s (coming down).
- ✗ t = 1.0 s only. *(forgets the downward pass → VPM_SYMMETRY)*
- ✗ t = 2.5 s, at maximum height. *(confuses speed 15 with v = 0 at the top → SPEED_VS_VELOCITY)*

**q18 · "At max height gravity is zero because v = 0" — correct?** · ACCEL_AT_TOP_ZERO, VELOCITY_FORCE_CONFLATION
- ✅ Incorrect — at the peak v = 0 but gravity still acts (weight mg down, a = g down).
- ✗ Correct — with zero velocity there is no force on the projectile. *(VELOCITY_FORCE_CONFLATION)*
- ✗ Incorrect — gravity isn't zero, but the acceleration is zero at the top. *(ACCEL_AT_TOP_ZERO)*

**q14 (A2) · "During the bounce the only force is gravity" — correct?** · BOUNCE_FORCES, FREE_FALL_DURING_BOUNCE
- ✅ Incorrect — during contact the ground exerts a large upward normal force as well as gravity.
- ✗ Correct — the ball is in free fall the whole time, so only gravity acts. *(FREE_FALL_DURING_BOUNCE)*
- ✗ Incorrect — only friction with the ground acts during the bounce. *(BOUNCE_FORCES)*

---

## L3 — Work, energy & power (18)

**q01 · Define POWER** · POWER_DEF
- ✅ The rate at which work is done (or energy is transferred).
- ✗ The total amount of work done by a force. *(POWER_DEF — confuses with work)*
- ✗ The force needed to move an object a certain distance.

**q02 · Define CONSERVATIVE force** · CONSERVATIVE_DEF
- ✅ A force whose work between two points is independent of the path taken.
- ✗ A force whose work depends on the path taken. *(that's non-conservative → CONSERVATIVE_DEF)*
- ✗ A force that does no work on a moving object.

**q03 · Define NON-CONSERVATIVE force** · CONSERVATIVE_DEF
- ✅ A force whose work between two points depends on the path taken (energy not recoverable as mechanical energy).
- ✗ A force whose work is independent of the path taken. *(that's conservative → CONSERVATIVE_DEF)*
- ✗ A force that always acts opposite to motion and never does work.

**q04 · Wall's force on demolition ball: conservative?** · CONSERVATIVE_IDENTIFY
- ✅ Non-conservative — energy is dissipated (heat, sound, broken brick), not recoverable.
- ✗ Conservative — the force depends only on start and end positions. *(CONSERVATIVE_IDENTIFY)*
- ✗ Conservative — all contact forces are conservative.

**q06 · Energy conversion, ball swinging down** · ENERGY_CONVERSION_DIRECTION
- ✅ Gravitational potential energy converts to kinetic energy.
- ✗ Kinetic energy converts to gravitational potential energy. *(reversed → ENERGY_CONVERSION_DIRECTION)*
- ✗ Chemical potential energy converts to kinetic energy.

**q11 · Define WORK by a constant force** · WORK_DEF_OMITS_COSINE
- ✅ W = F·d·cosθ, where θ is the angle between the force and the displacement.
- ✗ W = F·d (force times displacement). *(WORK_DEF_OMITS_COSINE)*
- ✗ W = F·d·sinθ. *(wrong trig)*

**q20 · Define MECHANICAL ENERGY** · MECH_ENERGY_DEF
- ✅ The sum of an object's kinetic and gravitational potential energy (KE + PE).
- ✗ The total kinetic energy of an object. *(omits PE → MECH_ENERGY_DEF)*
- ✗ The energy an object has due to its temperature.

**q01 (A2) · State the WORK-ENERGY THEOREM** · WET_STATEMENT
- ✅ The net work done on an object equals its change in kinetic energy (W_net = ΔKE).
- ✗ The work done by gravity equals the change in potential energy. *(wrong theorem → WET_STATEMENT)*
- ✗ The net work done on an object equals its change in momentum.

**q02 (A2) · WORK-ENERGY THEOREM in symbols** · WET_STATEMENT
- ✅ W_net = ½mv² − ½mu²
- ✗ W_net = mgh_f − mgh_i *(that's PE change → WET_STATEMENT)*
- ✗ W_net = m(v − u)

**q03 (A2) · Why is the truck's NET WORK negative?** · WET_SIGN_OF_NET_WORK
- ✅ Its KE decreases (slows to rest), and W_net = ΔKE, so W_net is negative.
- ✗ It moves uphill, and uphill motion always means negative work. *(WET_SIGN_OF_NET_WORK)*
- ✗ Its momentum decreases, so the work is negative.

**q05 (A2) · Same speed but downhill: shorter or longer stop?** · WET_FORCES_INCLINE, GRAVITY_INCLINE_SIGN
- ✅ Longer — gravity's component now does positive work (adds KE), so friction must remove more, over more distance.
- ✗ Shorter — going downhill the truck stops faster. *(WET_FORCES_INCLINE)*
- ✗ The same — slope direction doesn't affect stopping distance. *(GRAVITY_INCLINE_SIGN)*

**q08 (A2) · Lower start height: B-to-C distance?** · WET_KE_PROPORTIONALITY
- ✅ Shorter — less height ⇒ less KE at B ⇒ less for friction to dissipate.
- ✗ Longer — a lower start means the crate travels further. *(reversed → WET_KE_PROPORTIONALITY)*
- ✗ The same — friction dissipates energy at the same rate regardless of start height.

**q18 (A2) · What's wrong with "W_net = ½mv − ½mu"?** · WET_KE_FORMULA
- ✅ KE is ½mv² (v squared), not ½mv — the velocities must be squared.
- ✗ Nothing — ½mv − ½mu is the correct theorem. *(the misconception)*
- ✗ It should be ½m(v − u)² with the bracket squared. *(still wrong → WET_KE_FORMULA)*

**q01 (A3) · State CONSERVATION OF MECHANICAL ENERGY** · CME_STATEMENT, CME_CONDITIONS
- ✅ Total mechanical energy stays constant when only conservative forces do work on the system.
- ✗ Total mechanical energy stays constant in all situations. *(drops the condition → CME_CONDITIONS)*
- ✗ Energy is always created and destroyed in equal amounts. *(CME_STATEMENT)*

**q07 (A3) · Conditions for mechanical energy to be conserved** · CME_CONDITIONS
- ✅ When only conservative forces do work (no net work by non-conservative forces like friction).
- ✗ Whenever the object is moving. *(CME_CONDITIONS)*
- ✗ Only when the object moves in a straight line.

**q11 (A3) · "ME conserved as a block slides down a rough incline" — correct?** · CME_FRICTION_ABSENT, CME_CONDITIONS
- ✅ Incorrect — friction is non-conservative and dissipates energy, so ME is not conserved.
- ✗ Correct — mechanical energy is always conserved on an incline. *(CME_FRICTION_ABSENT)*
- ✗ Correct — friction only changes direction, not total energy. *(CME_CONDITIONS)*

**q18 (A3) · Why does pendulum-string tension do no work?** · TENSION_WORK, WORK_NO_DISPLACEMENT
- ✅ Tension is along the string, perpendicular to the motion (θ = 90°), so W = Fd cos90° = 0.
- ✗ Because the string doesn't stretch. *(TENSION_WORK)*
- ✗ Because the bob has no displacement. *(WORK_NO_DISPLACEMENT)*

**q20 (A3) · Speeds: straight drop vs frictionless ramp, same height** · CONSERVATIVE_IDENTIFY, PATH_INDEPENDENCE
- ✅ Equal — same drop height, only gravity does work, so v = √(2gh) regardless of path.
- ✗ The straight-down ball is faster because its path is shorter. *(PATH_INDEPENDENCE)*
- ✗ The ramp ball is faster because it gains speed along the slope. *(CONSERVATIVE_IDENTIFY)*

---

## L4 — Momentum & impulse (12)

**q01 (A1) · State CONSERVATION OF LINEAR MOMENTUM** · COM_DEF_NO_ISOLATED, COM_OMITS_EXTERNAL_FORCE
- ✅ The total linear momentum of an isolated system (no net external force) stays constant.
- ✗ The total linear momentum of any system always stays constant. *(COM_DEF_NO_ISOLATED)*
- ✗ Momentum is conserved as long as the objects keep moving. *(COM_OMITS_EXTERNAL_FORCE)*

**q02 (A1) · Define ISOLATED SYSTEM** · ISOLATED_SYSTEM_DEF
- ✅ A system on which the net external force is zero.
- ✗ A system that contains only one object. *(ISOLATED_SYSTEM_DEF)*
- ✗ A system where no objects touch each other.

**q08 (A1) · Was the trolley collision elastic? (KE 0.49 J → 0.25 J)** · ELASTIC_DEF, KE_CHECK
- ✅ Inelastic — KE drops from 0.49 J to 0.25 J, so kinetic energy is not conserved.
- ✗ Elastic — momentum is conserved, so KE must be too. *(ELASTIC_DEF)*
- ✗ Elastic — KE before (0.49 J) equals KE after. *(KE_CHECK)*

**q10 (A1) · Trolley C has larger mass: velocity vs B?** · COM_EXPLOSION_MASS_VELOCITY
- ✅ Smaller — by conservation of momentum, the larger mass leaves with the smaller velocity.
- ✗ Larger — a heavier trolley carries more velocity. *(COM_EXPLOSION_MASS_VELOCITY)*
- ✗ The same — the spring gives every trolley the same velocity.

**q15 (A1) · Define LINEAR MOMENTUM** · MOMENTUM_DEF_SCALAR
- ✅ The product of mass and velocity (p = mv); a vector, in the direction of the velocity.
- ✗ The product of mass and velocity; a scalar quantity. *(MOMENTUM_DEF_SCALAR)*
- ✗ The product of mass and acceleration.

**q18 (A1) · "Momentum is conserved in EVERY collision, even with external forces" — correct?** · COM_OMITS_EXTERNAL_FORCE, ISOLATED_SYSTEM_DEF
- ✅ Not strictly — only for an isolated system; external forces change total momentum.
- ✗ Correct — momentum is always conserved in any collision. *(COM_OMITS_EXTERNAL_FORCE)*
- ✗ Correct — collisions are always isolated systems. *(ISOLATED_SYSTEM_DEF)*

**q02 (A2) · What does the area under a force–time graph represent?** · FT_AREA_MEANING
- ✅ Impulse — the change in momentum (Δp).
- ✗ The work done by the force. *(confuses with force–displacement area → FT_AREA_MEANING)*
- ✗ The average force on the object.

**q10 (A2) · Direction of the bat's average force on the ball** · IMPULSE_DIRECTION
- ✅ Opposite to the ball's initial velocity (the direction it moves after being hit).
- ✗ The same direction as the ball's initial velocity (toward the bat). *(IMPULSE_DIRECTION)*
- ✗ Perpendicular to the ball's motion.

**q11 (A2) · Define IMPULSE** · IMPULSE_DEF
- ✅ The product of the average force and the time it acts (J = FΔt); equals the change in momentum.
- ✗ The product of force and displacement. *(that's work → IMPULSE_DEF)*
- ✗ The rate of change of momentum. *(that's force)*

**q14 (A2) · Why do airbags help, in terms of impulse?** · IMPULSE_CONTACT_TIME
- ✅ Δp is fixed; airbags increase the contact time Δt, so the average force F = Δp/Δt is smaller.
- ✗ Airbags reduce the driver's change in momentum to nearly zero. *(Δp is fixed → IMPULSE_CONTACT_TIME)*
- ✗ Airbags increase the force over a shorter time to stop the driver faster.

**q18 (A2) · Force B exerts on A after an internal explosion (Newton's 3rd Law)** · FT_NEWTON_3_PAIR
- ✅ A pulse of equal magnitude but opposite direction (negative), over the same time interval.
- ✗ A pulse of equal magnitude in the same direction, over the same interval. *(FT_NEWTON_3_PAIR)*
- ✗ A larger pulse, because B is pushed harder than A.

**q19 (A2) · Graph feature showing Δp = p₂ − p₁ is positive (rightward)** · IMPULSE_SIGN_REBOUND, IMPULSE_DIRECTION
- ✅ The momentum–time curve rises from p₁ to p₂ (a positive, upward change).
- ✗ The curve falls from p₁ to p₂. *(IMPULSE_SIGN_REBOUND)*
- ✗ A horizontal line, since momentum is conserved. *(IMPULSE_DIRECTION)*

---

## After sign-off
Same merge pipeline as L1.T1: set `answerMode` → `choice`, add the 3 `options`, `expectedAnswer` = correct option, keep marks/explanation/errorSignals/source; edit the per-skill dir files, rebuild the canonical bank, validate (expectedAnswer ∈ options · 3 options · no dupes · correct-option position rotated), push to dev. Then on to L5–L10 (Waves/Electricity/Magnetism/Quantum/Gravitation, ~100 items).
