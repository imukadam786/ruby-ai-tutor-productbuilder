// Afrikaans FAL — Grade 9 (Senior Phase) authoring source. Immersive, tap-only.
// Bridges to FET: novel/novelle, multiple & complex sentences, the full set of
// figures of speech (irony, sarcasm, symbolism), advanced active/passive and
// reported speech, anglicisms and register. Lands cleanly into Grade 10.
import { LUI } from "./g9-lui.mjs";
import { LEE } from "./g9-lee.mjs";
import { LET } from "./g9-let.mjs";
import { SKR } from "./g9-skr.mjs";
import { TAA } from "./g9-taa.mjs";

export const GRADE = {
  id: 9,
  title: "Graad 9 — Afrikaans Eerste Addisionele Taal",
  description:
    "KABV Senior Fase Graad 9 EAT — die brug na die FET-fase. Komplekse en veelvoudige sinne, die volle stel stylfigure (ironie, sarkasme, simboliek), gevorderde bedrywende/lydende vorm en indirekte rede, anglisismes en register, en die roman/novelle as letterkunde. Beide die vrae EN die antwoordopsies is in Afrikaans (immersief). Tik/keuse/waar-onwaar/cloze/volgorde; geen vrye-teks opstel of gesproke mondeling nie. Strande: Luister, Lees en kyk, Letterkunde, Skryf en aanbied, Taalstrukture en -konvensies.",
  tiers: [LUI, LEE, LET, SKR, TAA],
};
