// Wiki tab: data array + per-fold SVG step diagrams + render function.
// Add a new fold here by writing svg<Name>() and pushing a WIKI entry.
//
// Depends on: nothing (pure DOM/string output).
// renderWiki() is called once on first wiki tab open.

// ============================================================
// SVG STEP DIAGRAMS
// Each fold function returns a series of step panels showing
// how to assemble the zine. Builds an HTML "step strip".
// ============================================================

// tiny svg wrapper for a single step (square viewBox 60x60)
function step(svgContent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
    <style>
      .p { fill: #fbf8f3; stroke: #1a1614; stroke-width: 1; }
      .p2 { fill: #f0e9dc; stroke: #1a1614; stroke-width: 1; }
      .p3 { fill: #e6dcc6; stroke: #1a1614; stroke-width: 1; }
      .fold { stroke: #1a1614; fill: none; stroke-dasharray: 2 1.5; stroke-width: 0.6; }
      .valley { stroke: #2d5d3f; fill: none; stroke-dasharray: 1 1.5; stroke-width: 0.6; }
      .cut { stroke: #d63f2a; stroke-width: 1.2; fill: none; }
      .gd { stroke: #1a1614; stroke-width: 0.6; fill: none; }
      .ar { stroke: #d63f2a; stroke-width: 1; fill: #d63f2a; }
      .spine { fill: #1a1614; }
      .stitch { fill: #1a1614; }
      .glue { fill: #d63f2a; opacity: 0.4; }
    </style>
    ${svgContent}
  </svg>`;
}

// Build a horizontal strip from an array of {svg, label, num}
function stripBuilder(steps) {
  const items = steps.map((s, i) => {
    const arrow = i < steps.length - 1 ? `<div class="step-arrow">→</div>` : '';
    return `
      <div class="step">
        <div class="step-svg">${s.svg}</div>
        <div class="step-label"><span class="num">${i + 1}</span>${s.label}</div>
      </div>${arrow}
    `;
  }).join('');
  return `<div class="step-strip">${items}</div>`;
}

// ===== Single-Sheet Folds =====

function svgSingle() {
  return stripBuilder([
    {
      label: 'Print<br/>both sides',
      svg: step(`
        <rect class="p" x="10" y="8" width="40" height="44"/>
        <line class="fold" x1="30" y1="8" x2="30" y2="52"/>
        <text x="30" y="32" font-family="Fraunces" font-style="italic" font-size="9" text-anchor="middle" fill="#1a1614">flat</text>
      `),
    },
    {
      label: 'Fold in<br/>half',
      svg: step(`
        <path class="p" d="M 10 8 L 30 8 L 30 52 L 10 52 Z"/>
        <path class="p2" d="M 30 8 L 50 12 L 50 48 L 30 52 Z"/>
        <line class="gd" x1="30" y1="8" x2="30" y2="52"/>
        <path class="ar" d="M 38 6 Q 35 14 32 18" fill="none"/>
        <polygon class="ar" points="32,18 30,15 35,15"/>
      `),
    },
    {
      label: 'Booklet<br/>complete',
      svg: step(`
        <rect class="p" x="18" y="10" width="24" height="40"/>
        <rect x="18" y="10" width="2" height="40" class="spine"/>
      `),
    },
  ]);
}

function svgMini8() {
  return stripBuilder([
    {
      label: 'Print<br/>one side',
      svg: step(`
        <rect class="p" x="6" y="14" width="48" height="32"/>
        <line class="fold" x1="18" y1="14" x2="18" y2="46"/>
        <line class="fold" x1="30" y1="14" x2="30" y2="46"/>
        <line class="fold" x1="42" y1="14" x2="42" y2="46"/>
        <line class="fold" x1="6" y1="30" x2="54" y2="30"/>
      `),
    },
    {
      label: 'Cut center<br/>slit',
      svg: step(`
        <rect class="p" x="6" y="14" width="48" height="32"/>
        <line class="fold" x1="18" y1="14" x2="18" y2="46"/>
        <line class="fold" x1="30" y1="14" x2="30" y2="46"/>
        <line class="fold" x1="42" y1="14" x2="42" y2="46"/>
        <line class="cut" x1="18" y1="30" x2="42" y2="30"/>
        <text x="30" y="55" font-family="JetBrains Mono" font-size="5" text-anchor="middle" fill="#d63f2a">cut</text>
      `),
    },
    {
      label: 'Fold long<br/>edge',
      svg: step(`
        <rect class="p" x="6" y="22" width="48" height="16"/>
        <line class="fold" x1="18" y1="22" x2="18" y2="38"/>
        <line class="fold" x1="30" y1="22" x2="30" y2="38"/>
        <line class="fold" x1="42" y1="22" x2="42" y2="38"/>
        <line class="cut" x1="18" y1="22" x2="42" y2="22"/>
      `),
    },
    {
      label: 'Push ends<br/>together',
      svg: step(`
        <path class="p" d="M 8 30 L 22 18 L 38 18 L 52 30 L 38 42 L 22 42 Z"/>
        <line class="gd" x1="22" y1="18" x2="22" y2="42"/>
        <line class="gd" x1="38" y1="18" x2="38" y2="42"/>
        <line class="gd" x1="30" y1="14" x2="30" y2="46"/>
        <path class="ar" d="M 4 30 L 12 30" fill="none"/>
        <polygon class="ar" points="12,30 9,28 9,32"/>
        <path class="ar" d="M 56 30 L 48 30" fill="none"/>
        <polygon class="ar" points="48,30 51,28 51,32"/>
      `),
    },
    {
      label: 'Flatten<br/>booklet',
      svg: step(`
        <rect class="p" x="20" y="10" width="20" height="40"/>
        <rect x="20" y="10" width="1.5" height="40" class="spine"/>
      `),
    },
  ]);
}

function svgAccordion() {
  return stripBuilder([
    {
      label: 'Long flat<br/>sheet',
      svg: step(`
        <rect class="p" x="4" y="22" width="52" height="16"/>
        <line class="fold" x1="14" y1="22" x2="14" y2="38"/>
        <line class="fold" x1="22" y1="22" x2="22" y2="38"/>
        <line class="fold" x1="30" y1="22" x2="30" y2="38"/>
        <line class="fold" x1="38" y1="22" x2="38" y2="38"/>
        <line class="fold" x1="46" y1="22" x2="46" y2="38"/>
      `),
    },
    {
      label: 'Fold first<br/>panel',
      svg: step(`
        <path class="p" d="M 14 22 L 56 22 L 56 38 L 14 38 Z"/>
        <path class="p2" d="M 14 22 L 4 26 L 4 34 L 14 38 Z"/>
        <line class="gd" x1="14" y1="22" x2="14" y2="38"/>
        <line class="fold" x1="22" y1="22" x2="22" y2="38"/>
        <line class="fold" x1="30" y1="22" x2="30" y2="38"/>
      `),
    },
    {
      label: 'Alternate<br/>directions',
      svg: step(`
        <path class="p" d="M 12 18 L 16 18 L 16 42 L 12 42 Z"/>
        <path class="p2" d="M 16 18 L 20 18 L 20 42 L 16 42 Z"/>
        <path class="p" d="M 20 18 L 24 18 L 24 42 L 20 42 Z"/>
        <path class="p2" d="M 24 18 L 28 18 L 28 42 L 24 42 Z"/>
        <path class="p" d="M 28 18 L 32 18 L 32 42 L 28 42 Z"/>
        <path class="p2" d="M 32 18 L 36 18 L 36 42 L 32 42 Z"/>
        <path class="p" d="M 36 18 L 40 18 L 40 42 L 36 42 Z"/>
        <path class="p2" d="M 40 18 L 44 18 L 44 42 L 40 42 Z"/>
      `),
    },
    {
      label: 'Fan it<br/>out',
      svg: step(`
        <path class="p" d="M 8 14 L 22 14 L 22 46 L 8 46 Z"/>
        <path class="p2" d="M 22 14 L 32 18 L 32 42 L 22 46 Z"/>
        <path class="p" d="M 32 18 L 42 14 L 42 46 L 32 42 Z"/>
        <path class="p2" d="M 42 14 L 52 22 L 52 38 L 42 46 Z"/>
      `),
    },
  ]);
}

function svgGate() {
  return stripBuilder([
    {
      label: 'Three<br/>panels',
      svg: step(`
        <rect class="p" x="6" y="14" width="48" height="32"/>
        <line class="valley" x1="22" y1="14" x2="22" y2="46"/>
        <line class="valley" x1="38" y1="14" x2="38" y2="46"/>
      `),
    },
    {
      label: 'Right flap<br/>folds in',
      svg: step(`
        <rect class="p" x="6" y="14" width="32" height="32"/>
        <path class="p2" d="M 38 14 L 38 46 L 22 42 L 22 18 Z"/>
        <line class="valley" x1="22" y1="14" x2="22" y2="46"/>
        <path class="ar" d="M 50 18 Q 42 18 30 22" fill="none"/>
        <polygon class="ar" points="30,22 35,20 33,24"/>
      `),
    },
    {
      label: 'Left flap<br/>folds in',
      svg: step(`
        <rect class="p" x="22" y="14" width="16" height="32"/>
        <path class="p2" d="M 6 14 L 6 46 L 22 42 L 22 18 Z" transform="translate(16 0) scale(-1 1)" transform-origin="22 30"/>
        <path class="p2" d="M 38 14 L 38 46 L 22 42 L 22 18 Z" transform="scale(-1 1) translate(-44 0)"/>
      `),
    },
    {
      label: 'Both flaps<br/>meet',
      svg: step(`
        <rect class="p" x="14" y="14" width="32" height="32"/>
        <line class="gd" x1="30" y1="14" x2="30" y2="46"/>
      `),
    },
  ]);
}

function svgFrench() {
  return stripBuilder([
    {
      label: 'Print<br/>both sides',
      svg: step(`
        <rect class="p" x="8" y="10" width="44" height="40"/>
        <line class="fold" x1="30" y1="10" x2="30" y2="50"/>
        <line class="fold" x1="8" y1="30" x2="52" y2="30"/>
      `),
    },
    {
      label: 'Fold in half<br/>lengthwise',
      svg: step(`
        <rect class="p" x="8" y="20" width="44" height="20"/>
        <line class="fold" x1="30" y1="20" x2="30" y2="40"/>
        <path class="ar" d="M 22 8 Q 24 14 26 18" fill="none"/>
        <polygon class="ar" points="26,18 24,15 28,15"/>
      `),
    },
    {
      label: 'Fold across<br/>short axis',
      svg: step(`
        <rect class="p" x="18" y="20" width="22" height="20"/>
        <path class="ar" d="M 50 24 Q 44 26 42 28" fill="none"/>
        <polygon class="ar" points="42,28 44,25 47,28"/>
      `),
    },
    {
      label: '8-page<br/>booklet',
      svg: step(`
        <rect class="p" x="20" y="14" width="20" height="32"/>
        <rect x="20" y="14" width="1.5" height="32" class="spine"/>
      `),
    },
  ]);
}

function svgDoubleGate() {
  return stripBuilder([
    {
      label: 'Four<br/>panels',
      svg: step(`
        <rect class="p" x="4" y="16" width="52" height="28"/>
        <line class="valley" x1="17" y1="16" x2="17" y2="44"/>
        <line class="fold" x1="30" y1="16" x2="30" y2="44"/>
        <line class="valley" x1="43" y1="16" x2="43" y2="44"/>
      `),
    },
    {
      label: 'Outer flaps<br/>fold in',
      svg: step(`
        <rect class="p" x="17" y="16" width="26" height="28"/>
        <path class="p2" d="M 17 16 L 30 18 L 30 42 L 17 44 Z"/>
        <path class="p2" d="M 43 16 L 30 18 L 30 42 L 43 44 Z"/>
        <line class="fold" x1="30" y1="16" x2="30" y2="44"/>
      `),
    },
    {
      label: 'Fold result<br/>in half',
      svg: step(`
        <rect class="p" x="22" y="16" width="16" height="28"/>
        <line class="gd" x1="30" y1="16" x2="30" y2="44"/>
        <path class="ar" d="M 14 14 Q 18 18 22 20" fill="none"/>
        <polygon class="ar" points="22,20 18,18 21,16"/>
      `),
    },
    {
      label: 'Final<br/>booklet',
      svg: step(`
        <rect class="p" x="22" y="14" width="16" height="32"/>
        <rect x="22" y="14" width="1.5" height="32" class="spine"/>
      `),
    },
  ]);
}

// ===== Multi-Sheet Bindings =====

function svgSaddle() {
  return stripBuilder([
    {
      label: 'Print<br/>imposed',
      svg: step(`
        <rect class="p" x="8" y="14" width="44" height="32"/>
        <line class="fold" x1="30" y1="14" x2="30" y2="46"/>
        <text x="20" y="32" font-family="Fraunces" font-style="italic" font-size="6" text-anchor="middle" fill="#1a1614">8</text>
        <text x="40" y="32" font-family="Fraunces" font-style="italic" font-size="6" text-anchor="middle" fill="#1a1614">1</text>
      `),
    },
    {
      label: 'Stack all<br/>sheets',
      svg: step(`
        <rect class="p3" x="6" y="12" width="44" height="32"/>
        <rect class="p2" x="9" y="15" width="44" height="32"/>
        <rect class="p" x="12" y="18" width="44" height="32"/>
        <line class="fold" x1="34" y1="18" x2="34" y2="50"/>
      `),
    },
    {
      label: 'Fold all<br/>together',
      svg: step(`
        <path class="p" d="M 12 14 L 32 14 L 32 46 L 12 46 Z"/>
        <path class="p2" d="M 32 14 L 50 18 L 50 42 L 32 46 Z"/>
        <line class="gd" x1="32" y1="14" x2="32" y2="46"/>
      `),
    },
    {
      label: 'Staple<br/>spine',
      svg: step(`
        <rect class="p" x="14" y="10" width="32" height="40"/>
        <rect x="14" y="10" width="2" height="40" class="spine"/>
        <circle class="stitch" cx="15" cy="20" r="1.2"/>
        <circle class="stitch" cx="15" cy="30" r="1.2"/>
        <circle class="stitch" cx="15" cy="40" r="1.2"/>
      `),
    },
  ]);
}

function svgPerfect() {
  return stripBuilder([
    {
      label: 'Sheets in<br/>order',
      svg: step(`
        <rect class="p" x="6" y="12" width="14" height="36"/>
        <rect class="p2" x="22" y="12" width="14" height="36"/>
        <rect class="p" x="38" y="12" width="14" height="36"/>
        <text x="13" y="32" font-family="Fraunces" font-style="italic" font-size="6" text-anchor="middle" fill="#1a1614">1-4</text>
        <text x="29" y="32" font-family="Fraunces" font-style="italic" font-size="6" text-anchor="middle" fill="#1a1614">5-8</text>
        <text x="45" y="32" font-family="Fraunces" font-style="italic" font-size="6" text-anchor="middle" fill="#1a1614">9-12</text>
      `),
    },
    {
      label: 'Fold each<br/>in half',
      svg: step(`
        <path class="p" d="M 10 12 L 18 12 L 18 48 L 10 48 Z"/>
        <path class="p2" d="M 18 12 L 26 14 L 26 46 L 18 48 Z"/>
        <path class="p" d="M 28 12 L 36 12 L 36 48 L 28 48 Z"/>
        <path class="p2" d="M 36 12 L 44 14 L 44 46 L 36 48 Z"/>
      `),
    },
    {
      label: 'Stack<br/>sheets',
      svg: step(`
        <rect class="p3" x="14" y="10" width="34" height="40"/>
        <rect class="p2" x="14" y="10" width="34" height="40" opacity="0.5"/>
        <rect class="p" x="14" y="10" width="34" height="40" fill="none" stroke="#1a1614"/>
        <line class="gd" x1="14" y1="10" x2="14" y2="50"/>
        <line class="gd" x1="14" y1="20" x2="48" y2="20"/>
        <line class="gd" x1="14" y1="30" x2="48" y2="30"/>
        <line class="gd" x1="14" y1="40" x2="48" y2="40"/>
      `),
    },
    {
      label: 'Glue<br/>spine',
      svg: step(`
        <rect class="p" x="14" y="10" width="34" height="40"/>
        <rect class="glue" x="14" y="10" width="3" height="40"/>
        <rect x="14" y="10" width="2" height="40" class="spine"/>
      `),
    },
  ]);
}

function svgSignature() {
  return stripBuilder([
    {
      label: 'Group into<br/>signatures',
      svg: step(`
        <rect class="p" x="6" y="14" width="14" height="32"/>
        <rect class="p" x="9" y="17" width="14" height="32"/>
        <rect class="p" x="26" y="14" width="14" height="32"/>
        <rect class="p" x="29" y="17" width="14" height="32"/>
        <rect class="p" x="46" y="14" width="14" height="32" transform="translate(-4 0)"/>
        <text x="13" y="55" font-family="JetBrains Mono" font-size="5" text-anchor="middle" fill="#6b6359">sig 1</text>
        <text x="33" y="55" font-family="JetBrains Mono" font-size="5" text-anchor="middle" fill="#6b6359">sig 2</text>
        <text x="49" y="55" font-family="JetBrains Mono" font-size="5" text-anchor="middle" fill="#6b6359">sig 3</text>
      `),
    },
    {
      label: 'Stitch each<br/>signature',
      svg: step(`
        <path class="p" d="M 10 14 L 22 14 L 22 46 L 10 46 Z"/>
        <line class="gd" x1="22" y1="14" x2="22" y2="46"/>
        <circle class="stitch" cx="22" cy="22" r="1"/>
        <circle class="stitch" cx="22" cy="30" r="1"/>
        <circle class="stitch" cx="22" cy="38" r="1"/>
        <path class="p" d="M 30 14 L 42 14 L 42 46 L 30 46 Z"/>
        <line class="gd" x1="42" y1="14" x2="42" y2="46"/>
        <circle class="stitch" cx="42" cy="22" r="1"/>
        <circle class="stitch" cx="42" cy="30" r="1"/>
        <circle class="stitch" cx="42" cy="38" r="1"/>
      `),
    },
    {
      label: 'Stack<br/>signatures',
      svg: step(`
        <rect class="p3" x="10" y="10" width="36" height="40"/>
        <line class="gd" x1="10" y1="20" x2="46" y2="20"/>
        <line class="gd" x1="10" y1="30" x2="46" y2="30"/>
        <line class="gd" x1="10" y1="40" x2="46" y2="40"/>
        <circle class="stitch" cx="10" cy="15" r="1"/>
        <circle class="stitch" cx="10" cy="25" r="1"/>
        <circle class="stitch" cx="10" cy="35" r="1"/>
        <circle class="stitch" cx="10" cy="45" r="1"/>
      `),
    },
    {
      label: 'Bind all<br/>spines',
      svg: step(`
        <rect class="p" x="14" y="10" width="34" height="40"/>
        <rect x="14" y="10" width="2" height="40" class="spine"/>
        <line class="gd" x1="16" y1="14" x2="48" y2="14" stroke="#d63f2a" stroke-width="0.6"/>
        <line class="gd" x1="16" y1="46" x2="48" y2="46" stroke="#d63f2a" stroke-width="0.6"/>
      `),
    },
  ]);
}

function svgFrenchBook() {
  return stripBuilder([
    {
      label: 'Sheets<br/>printed',
      svg: step(`
        <rect class="p" x="8" y="12" width="20" height="36"/>
        <line class="fold" x1="18" y1="12" x2="18" y2="48"/>
        <line class="fold" x1="8" y1="30" x2="28" y2="30"/>
        <rect class="p" x="34" y="12" width="20" height="36"/>
        <line class="fold" x1="44" y1="12" x2="44" y2="48"/>
        <line class="fold" x1="34" y1="30" x2="54" y2="30"/>
      `),
    },
    {
      label: 'French-fold<br/>each',
      svg: step(`
        <rect class="p" x="14" y="18" width="10" height="24"/>
        <line class="gd" x1="14" y1="18" x2="14" y2="42"/>
        <line class="gd" x1="14" y1="30" x2="24" y2="30"/>
        <rect class="p" x="34" y="18" width="10" height="24"/>
        <line class="gd" x1="34" y1="18" x2="34" y2="42"/>
        <line class="gd" x1="34" y1="30" x2="44" y2="30"/>
      `),
    },
    {
      label: 'Stack with<br/>folds at spine',
      svg: step(`
        <rect class="p" x="20" y="12" width="20" height="36"/>
        <line class="gd" x1="22" y1="14" x2="22" y2="46"/>
        <line class="gd" x1="24" y1="14" x2="24" y2="46"/>
        <line class="gd" x1="26" y1="14" x2="26" y2="46"/>
        <text x="34" y="55" font-family="JetBrains Mono" font-size="4.5" text-anchor="middle" fill="#6b6359">folds in</text>
      `),
    },
    {
      label: 'Bind &amp; trim<br/>outer edge',
      svg: step(`
        <rect class="p" x="18" y="10" width="24" height="40"/>
        <rect x="18" y="10" width="2" height="40" class="spine"/>
        <line class="cut" x1="42" y1="10" x2="42" y2="50" stroke-dasharray="2 1.5"/>
      `),
    },
  ]);
}

// ============================================================
// WIKI DATA
// ============================================================
const WIKI = [
  { section: 'Single-Sheet Folds' },
  {
    id: 'single', name: 'Single Fold', pages: '4 pages · 1 sheet',
    difficulty: 'easy',
    uses: ['Greeting card', 'Simple booklet', 'Menu'],
    howTo: [
      'Print double-sided.',
      'Fold in half along the center.',
      'Done. Cover is page 1, back is page 4.',
    ],
    notes: 'The simplest fold. A single sheet of paper folded once.',
    svg: svgSingle,
  },
  {
    id: 'mini8', name: '8-Page Mini Zine', pages: '8 pages · 1 sheet',
    difficulty: 'medium',
    uses: ['DIY zines', 'Pocket comics', 'Show flyers'],
    howTo: [
      'Print single-sided.',
      'Fold sheet in half along the long edge, then unfold.',
      'Fold in half the other way and cut the slit (red line) only between the inner panels.',
      'Push the two ends toward each other so the sheet collapses into a star.',
      'Flatten into a booklet — pages now read in order.',
    ],
    notes: 'The classic punk-zine fold. One sheet, no glue, no staples.',
    svg: svgMini8,
  },
  {
    id: 'accordion', name: 'Accordion Fold', pages: 'Variable · 1 sheet',
    difficulty: 'easy',
    uses: ['Photo strips', 'Standing displays', 'Long visual sequences'],
    howTo: [
      'Print on a long sheet (legal or tabloid recommended).',
      'Fold back and forth in alternating directions, like a fan.',
      'Optional: glue end panels to make a hardcover.',
    ],
    notes: 'Mountain and valley folds alternate. Works in any direction; long thin sheets are best.',
    svg: svgAccordion,
  },
  {
    id: 'gate', name: 'Gate Fold', pages: '6 pages · 1 sheet',
    difficulty: 'easy',
    uses: ['Wedding invitations', 'Reveals', 'Brochures'],
    howTo: [
      'Print double-sided on a single sheet.',
      'Fold left and right outer panels inward to meet at the center.',
      'Inner spread is revealed when both flaps open.',
    ],
    notes: 'Two outer panels open like gates to reveal the inner spread.',
    svg: svgGate,
  },
  {
    id: 'french', name: 'French Fold', pages: '8 pages · 1 sheet',
    difficulty: 'medium',
    uses: ['Art books', 'Maps', 'Wedding programs'],
    howTo: [
      'Print double-sided.',
      'Fold sheet in half lengthwise.',
      'Fold in half again across the short axis.',
      'No cuts needed — pages are already in reading order.',
    ],
    notes: 'A sheet folded in quarters. The folded edges become the bound edge if you bind multiple together.',
    svg: svgFrench,
  },
  {
    id: 'double-gate', name: 'Double Gate Fold', pages: '8 pages · 1 sheet',
    difficulty: 'hard',
    uses: ['Premium brochures', 'Art prints', 'Dramatic reveals'],
    howTo: [
      'Print double-sided on a wide sheet.',
      'Fold the two outer panels inward to meet at the center.',
      'Fold the resulting closed sheet in half again down the center.',
    ],
    notes: 'A gate fold folded once more. Creates two layers of reveal.',
    svg: svgDoubleGate,
  },
  { section: 'Multi-Sheet Bindings' },
  {
    id: 'saddle', name: 'Saddle-Stitched', pages: 'Multiple of 4 pages',
    difficulty: 'medium',
    uses: ['Comic books', 'Magazines', 'Standard zines'],
    howTo: [
      'Print sheets double-sided with imposition (pages reordered for folding).',
      'Stack all sheets in order — sheet 1 on the outside.',
      'Fold the entire stack in half together.',
      'Staple along the spine (the fold).',
    ],
    notes: 'The most common multi-sheet binding. Page imposition is critical: the app handles it for you.',
    svg: svgSaddle,
  },
  {
    id: 'perfect', name: 'Perfect Bound', pages: 'Multiple of 4 pages',
    difficulty: 'medium',
    uses: ['Thicker zines', 'Lookbooks', 'Photo books'],
    howTo: [
      'Print each sheet double-sided with sequential pages.',
      'Fold each sheet individually in half.',
      'Stack folded sheets in page order.',
      'Glue the spine edge with bookbinding adhesive (PVA works well).',
      'Optional: wrap with a cover sheet glued to the spine.',
    ],
    notes: 'Like a paperback book. Each sheet is its own folded signature, glued at the spine.',
    svg: svgPerfect,
  },
  {
    id: 'signature', name: 'Signature Booklet', pages: 'Multiple of signature size',
    difficulty: 'hard',
    uses: ['Hardcover books', 'Art journals', 'High page counts'],
    howTo: [
      'Group sheets into "signatures" (mini saddle-stitched booklets, usually 8 or 16 pages each).',
      'Fold and stitch each signature on its own.',
      'Stack signatures in reading order.',
      'Sew or glue the spines of all signatures together to bind.',
    ],
    notes: 'Used for thicker books where one giant saddle stitch would be impractical. Allows hand-bound book construction.',
    svg: svgSignature,
  },
  {
    id: 'french-book', name: 'French-Fold Book', pages: 'Multiple of 8 pages',
    difficulty: 'hard',
    uses: ['Art books', 'Translucent paper', 'Special editions'],
    howTo: [
      'Print each sheet double-sided.',
      'French-fold each sheet (in half, then in half again).',
      'Stack folded sheets with the folded edges all on the spine side.',
      'Bind along the spine — the open edges form the outer book edge.',
      'Optional: trim the outer edges flush.',
    ],
    notes: 'Each French-folded sheet becomes a 4-page section. Show-through is hidden because each "page" is actually two sheets thick.',
    svg: svgFrenchBook,
  },
];

// ============================================================
// RENDER WIKI (only renders once on first tab open)
// ============================================================
function renderWiki() {
  const grid = document.getElementById('wiki-grid');
  if (grid.dataset.rendered) return;
  grid.dataset.rendered = 'true';

  grid.innerHTML = WIKI.map(entry => {
    if (entry.section) {
      return `<div class="wiki-section-title">${entry.section}</div>`;
    }
    const diffClass = `diff-${entry.difficulty === 'easy' ? 'easy' : entry.difficulty === 'medium' ? 'med' : 'hard'}`;
    const diffLabel = entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1);
    const useTags = entry.uses.map(u => `<span class="wiki-tag use">${u}</span>`).join('');
    const stepList = entry.howTo.map(s => `<li>${s}</li>`).join('');
    return `
      <article class="wiki-card">
        <div class="wiki-card-header">
          <span class="name">${entry.name}</span>
          <span class="meta">${entry.pages}</span>
        </div>
        <div class="wiki-diagram">${entry.svg()}</div>
        <div class="wiki-body">
          <div class="wiki-section">
            <h4>About</h4>
            ${entry.notes}
          </div>
          <div class="wiki-section">
            <h4>How to Fold</h4>
            <ol>${stepList}</ol>
          </div>
          <div class="wiki-tags">
            <span class="wiki-tag ${diffClass}">${diffLabel}</span>
            ${useTags}
          </div>
        </div>
      </article>
    `;
  }).join('');
}
