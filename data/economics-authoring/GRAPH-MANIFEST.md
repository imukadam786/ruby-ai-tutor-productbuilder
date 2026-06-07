# Economics graph image manifest

The graph-reading (`diagram-label`) questions reference these image keys. Each
file must be saved as **`public/economics/<key>.webp`** (the session also falls
back to `.png` / `.svg`). Until a file exists, the question still works — the
session shows the caption as a text fallback and the labels are tappable.

Style: clean, flat, mobile-legible (axes labelled, key points/curves marked with
the letters the question asks about). Match the indigo subject accent where a
colour is needed. Target ~1024px wide.

| # | Image key (`public/economics/…`) | Grade · Skill | What the diagram shows | Must be labelled / markable |
|---|---|---|---|---|
| 1 | `g10-circular-flow.webp` | G10 · Circular flow | Four-sector circular flow (households, firms, government, foreign sector) with product & factor markets | Real flow vs money flow arrows; the four participants; the two markets |
| 2 | `g10-business-cycle.webp` | G10 · Business cycles | One business-cycle wave on a trend line | Trough, recovery/upswing, peak/boom, recession/downswing, trend line |
| 3 | `g10-demand-supply.webp` | G10 · Demand & supply | Demand and supply curves crossing at equilibrium | D curve, S curve, equilibrium price (Pe), equilibrium quantity (Qe) |
| 4 | `g10-ppc.webp` | G10 · PPC | Production possibility curve, two goods | Point ON the curve (efficient), INSIDE (inefficient), BEYOND (unattainable) |
| 5 | `g10-price-ceiling.webp` | G10 · Public sector | Maximum price (ceiling) set below equilibrium | Ceiling line, the resulting shortage (Qd > Qs) |
| 6 | `g10-price-floor.webp` | G10 · Public sector | Minimum price (floor) set above equilibrium | Floor line, the resulting surplus (Qs > Qd) |
| 7 | `g11-elasticity.webp` | G11 · Price elasticity | An elastic (flat) vs an inelastic (steep) demand curve, side by side | Elastic curve, inelastic curve |
| 8 | `g11-indirect-tax.webp` | G11 · Cost & revenue | Supply shift from an indirect tax, with the tax wedge | Old S, new S+tax, price rise, tax wedge |
| 9 | `g11-cost-curves.webp` | G11 · Cost & revenue | Short-run cost curves | MC, AC, AVC, the MC-through-AC-minimum point |
| 10 | `g11-lorenz-curve.webp` | G11 · Wealth & distribution | Lorenz curve with the line of perfect equality | Line of equality (45°), Lorenz curve, the gap = inequality (Gini) |
| 11 | `g11-market-structures.webp` | G11 · Market structures | A 2×2 comparison panel of the four market structures | Perfect competition, monopolistic competition, oligopoly, monopoly |
| 12 | `g12-circular-flow-multiplier.webp` | G12 · Circular flow & multiplier | Open-economy circular flow showing leakages (S, T, M) and injections (I, G, X) | The three leakages, the three injections |
| 13 | `g12-business-cycle-indicators.webp` | G12 · Business cycles & forecasting | Cycle wave with leading / coincident / lagging indicators offset | Leading (ahead), coincident (with), lagging (behind) |
| 14 | `g12-laffer-curve.webp` | G12 · Public sector & fiscal policy | The Laffer curve | Tax rate axis, tax revenue axis, the revenue-maximising rate |
| 15 | `g12-forex-market.webp` | G12 · Foreign exchange | Demand & supply for the rand setting the exchange rate | Demand for rand, supply of rand, equilibrium exchange rate |
| 16 | `g12-perfect-competition.webp` | G12 · Perfect markets | A perfectly competitive firm in equilibrium | D = AR = MR (horizontal), MC, AC, profit-max output (MC = MR) |
| 17 | `g12-monopoly.webp` | G12 · Monopoly | A monopoly's price & output | Downward D, MR below D, MC, AC, profit-max (MC = MR), supernormal profit block |
| 18 | `g12-oligopoly-kinked.webp` | G12 · Oligopoly & monopolistic comp. | The kinked demand curve of an oligopoly | The kink, elastic upper section, inelastic lower section |
| 19 | `g12-negative-externality.webp` | G12 · Market failures | A negative externality (e.g. pollution) | Marginal private cost, marginal social cost, the welfare loss / over-production |
| 20 | `g12-positive-externality.webp` | G12 · Market failures | A positive externality (e.g. education) | Marginal private benefit, marginal social benefit, the under-production gap |
| 21 | `g10-demand-shift.webp` | G10 · Demand & supply | A shift of the demand curve vs a movement along it | Original D, shifted D (right/left), the new equilibrium |
| 22 | `g11-revenue-curves.webp` | G11 · Cost & revenue | Total / average / marginal revenue | TR, AR, MR |
| 23 | `g12-subsidy.webp` | G12 · Public sector / trade | A subsidy shifting supply outward | Old S, new S with subsidy, lower price, larger quantity |
| 24 | `g12-protection-tariff.webp` | G12 · Protectionism & free trade | A tariff on imports in a domestic market | World price, world price + tariff, fall in imports |
| 25 | `g11-economic-growth.webp` | G11 · Economic growth | A PPC outward shift representing economic growth | Original PPC, shifted-out PPC, the growth arrow |
| 26 | `g12-inflation-trend.webp` | G12 · Inflation | A simple CPI / inflation-rate line over time with the SARB 3–6% target band | The 3–6% target band, the inflation line |

**Total: 26 diagrams.** Numbers 1–20 are the core set tied to the heaviest
graph skills; 21–26 round out the remaining graph-able topics. The questions are
authored to work in text first, so you can ship before the art lands and drop
the `.webp` files in as they're produced.
