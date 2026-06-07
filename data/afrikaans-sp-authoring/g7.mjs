// Afrikaans FAL — Grade 7 (Senior Phase) authoring source.
// Immersive: questions, options and memos in Afrikaans. Tap-only delivery.
// Tiers assembled from per-strand modules to keep each file reviewable.
import { LUI } from "./g7-lui.mjs";
import { LEE } from "./g7-lee.mjs";
import { LET } from "./g7-let.mjs";
import { SKR } from "./g7-skr.mjs";
import { TAA } from "./g7-taa.mjs";

export const GRADE = {
  id: 7,
  title: "Graad 7 — Afrikaans Eerste Addisionele Taal",
  description:
    "KABV Senior Fase Graad 7 EAT. Eerste jaar van die Senior Fase: minder klem op luister/praat, meer op lees en skryf. Beide die vrae EN die antwoordopsies is in Afrikaans (immersiewe aanbieding, soos die FET-grade), met enkele moeilike woorde tussen hakies verklaar. Tik/keuse/waar-onwaar/cloze/volgorde-aanbieding; geen vrye-teks opstel of gesproke mondeling nie — Skryf word as tikbare struktuur-, beplannings- en redigeerkennis aangebied. Vaardighede (strande): Luister, Lees en kyk, Letterkunde, Skryf en aanbied, Taalstrukture en -konvensies.",
  tiers: [LUI, LEE, LET, SKR, TAA],
};
