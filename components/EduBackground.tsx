/**
 * Subtle tiled education-symbol background pattern.
 * Used on Home, Progress, and Settings screens.
 */
export default function EduBackground() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.10 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="edu-bg" x="0" y="0" width="280" height="260" patternUnits="userSpaceOnUse">

          {/* ── Row 1 ── */}
          <text x="8"  y="28" fill="#71717A" fontSize="22" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-12,8,28)">2</text>
          <text x="52" y="16" fill="#71717A" fontSize="16" fontFamily="Nunito,sans-serif" transform="rotate(8,52,16)">+</text>
          <text x="98" y="36" fill="#71717A" fontSize="18" fontFamily="Nunito,sans-serif" fontStyle="italic" transform="rotate(-5,98,36)">x</text>
          <text x="148" y="22" fill="#71717A" fontSize="20" fontFamily="Nunito,sans-serif" fontWeight="700" transform="rotate(14,148,22)">3</text>
          {/* Pencil */}
          <g transform="translate(192,4) rotate(-28)">
            <rect x="0" y="0" width="6" height="18" rx="1.5" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <polygon points="0,18 3,24 6,18" fill="none" stroke="#71717A" strokeWidth="1.1" strokeLinejoin="round"/>
            <line x1="0" y1="5" x2="6" y2="5" stroke="#71717A" strokeWidth="1"/>
          </g>
          <text x="238" y="30" fill="#71717A" fontSize="19" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-8,238,30)">6</text>

          {/* ── Row 2 ── */}
          {/* Ruler */}
          <g transform="translate(4,52) rotate(12)">
            <rect x="0" y="0" width="30" height="8" rx="1.5" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <line x1="5"  y1="0" x2="5"  y2="3" stroke="#71717A" strokeWidth="1"/>
            <line x1="10" y1="0" x2="10" y2="5" stroke="#71717A" strokeWidth="1"/>
            <line x1="15" y1="0" x2="15" y2="3" stroke="#71717A" strokeWidth="1"/>
            <line x1="20" y1="0" x2="20" y2="5" stroke="#71717A" strokeWidth="1"/>
            <line x1="25" y1="0" x2="25" y2="3" stroke="#71717A" strokeWidth="1"/>
          </g>
          <text x="62"  y="74" fill="#71717A" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(20,62,74)">×</text>
          <text x="108" y="65" fill="#71717A" fontSize="17" fontFamily="Nunito,sans-serif" fontWeight="700" transform="rotate(-8,108,65)">A</text>
          <text x="152" y="80" fill="#71717A" fontSize="19" fontFamily="Nunito,sans-serif" transform="rotate(5,152,80)">√</text>
          <text x="200" y="62" fill="#71717A" fontSize="22" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-10,200,62)">7</text>
          {/* Lightbulb */}
          <g transform="translate(244,46) rotate(6)">
            <path d="M11,0 C6,0 2,4 2,9 C2,12 4,14 6,16 L6,19 L16,19 L16,16 C18,14 20,12 20,9 C20,4 16,0 11,0 Z" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <line x1="6"  y1="21" x2="16" y2="21" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="7"  y1="23" x2="15" y2="23" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="11" y1="0"  x2="11" y2="-3" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round"/>
          </g>

          {/* ── Row 3 ── */}
          <text x="6"   y="116" fill="#71717A" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(-15,6,116)">=</text>
          {/* Open Book */}
          <g transform="translate(38,96) rotate(-5)">
            <path d="M22,3 C22,3 13,1 4,4 L4,20 C13,17 22,19 22,19 Z" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <path d="M22,3 C22,3 31,1 40,4 L40,20 C31,17 22,19 22,19 Z" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <line x1="22" y1="3" x2="22" y2="19" stroke="#71717A" strokeWidth="1.2"/>
          </g>
          <text x="105" y="106" fill="#71717A" fontSize="18" fontFamily="Nunito,sans-serif" transform="rotate(12,105,106)">π</text>
          <text x="155" y="126" fill="#71717A" fontSize="21" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-3,155,126)">5</text>
          <text x="205" y="110" fill="#71717A" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(18,205,110)">÷</text>
          {/* Brain */}
          <g transform="translate(236,94) rotate(-5)">
            <path d="M18,5 C18,5 22,2 26,5 C30,8 29,14 26,16 C26,16 28,20 24,21 C22,22 20,21 19,20" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <path d="M18,5 C18,5 14,2 10,5 C6,8 7,14 10,16 C10,16 8,20 12,21 C14,22 16,21 17,20" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <line x1="18" y1="5" x2="18" y2="20" stroke="#71717A" strokeWidth="0.9" strokeDasharray="2,2"/>
          </g>

          {/* ── Row 4 ── */}
          {/* Backpack */}
          <g transform="translate(4,142) rotate(5)">
            <rect x="2" y="6" width="18" height="18" rx="3" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <path d="M7,6 L7,3 C7,1 13,1 13,3 L13,6" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <line x1="2" y1="14" x2="20" y2="14" stroke="#71717A" strokeWidth="1"/>
            <rect x="8" y="11" width="6" height="5" rx="1" fill="none" stroke="#71717A" strokeWidth="1"/>
          </g>
          <text x="48"  y="158" fill="#71717A" fontSize="16" fontFamily="Nunito,sans-serif" fontStyle="italic" transform="rotate(-8,48,158)">y</text>
          <text x="92"  y="172" fill="#71717A" fontSize="15" fontFamily="Nunito,sans-serif" fontWeight="700" transform="rotate(10,92,172)">B</text>
          {/* Magnet */}
          <g transform="translate(128,142) rotate(10)">
            <path d="M4,0 L4,12 C4,18 18,18 18,12 L18,0" fill="none" stroke="#71717A" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="0"  y1="0" x2="8"  y2="0" stroke="#71717A" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="14" y1="0" x2="22" y2="0" stroke="#71717A" strokeWidth="2.2" strokeLinecap="round"/>
          </g>
          <text x="182" y="155" fill="#71717A" fontSize="16" fontFamily="Nunito,sans-serif" transform="rotate(-12,182,155)">∑</text>
          <text x="232" y="165" fill="#71717A" fontSize="20" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(5,232,165)">4</text>

          {/* ── Row 5 ── */}
          <text x="8"   y="198" fill="#71717A" fontSize="14" fontFamily="Nunito,sans-serif" transform="rotate(15,8,198)">α</text>
          {/* Protractor */}
          <g transform="translate(34,185) rotate(-8)">
            <path d="M0,16 A16,16 0 0,1 32,16" fill="none" stroke="#71717A" strokeWidth="1.3"/>
            <line x1="0"  y1="16" x2="32" y2="16" stroke="#71717A" strokeWidth="1"/>
            <line x1="16" y1="16" x2="16" y2="0"  stroke="#71717A" strokeWidth="0.9"/>
            <line x1="16" y1="16" x2="8"  y2="2"  stroke="#71717A" strokeWidth="0.8"/>
            <line x1="16" y1="16" x2="24" y2="2"  stroke="#71717A" strokeWidth="0.8"/>
            <line x1="16" y1="16" x2="4"  y2="9"  stroke="#71717A" strokeWidth="0.7"/>
            <line x1="16" y1="16" x2="28" y2="9"  stroke="#71717A" strokeWidth="0.7"/>
          </g>
          <text x="100" y="208" fill="#71717A" fontSize="20" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-5,100,208)">9</text>
          <text x="148" y="198" fill="#71717A" fontSize="16" fontFamily="Nunito,sans-serif" transform="rotate(8,148,198)">−</text>
          <text x="192" y="194" fill="#71717A" fontSize="14" fontFamily="Nunito,sans-serif" transform="rotate(-10,192,194)">∞</text>
          <text x="240" y="205" fill="#71717A" fontSize="18" fontFamily="Nunito,sans-serif" fontWeight="700" transform="rotate(7,240,205)">f</text>

          {/* ── Row 6 ── */}
          <text x="14"  y="246" fill="#71717A" fontSize="18" fontFamily="Nunito,sans-serif" fontWeight="800" transform="rotate(-10,14,246)">8</text>
          <text x="58"  y="252" fill="#71717A" fontSize="14" fontFamily="Nunito,sans-serif" fontStyle="italic" transform="rotate(6,58,252)">Δ</text>
          <text x="100" y="242" fill="#71717A" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(-8,100,242)">%</text>
          <text x="148" y="255" fill="#71717A" fontSize="16" fontFamily="Nunito,sans-serif" fontStyle="italic" transform="rotate(12,148,255)">z</text>
          <text x="192" y="244" fill="#71717A" fontSize="13" fontFamily="Nunito,sans-serif" transform="rotate(-6,192,244)">²</text>
          <text x="235" y="252" fill="#71717A" fontSize="15" fontFamily="Nunito,sans-serif" transform="rotate(9,235,252)">≠</text>

        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#edu-bg)" />
    </svg>
  );
}
