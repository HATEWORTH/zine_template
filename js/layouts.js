// Layout generation. Each layout function returns a normalized
// { sheets: [...], pageW, pageH, readingOrder, assembly } shape.
// Each sheet has { pageW, pageH, cells, back, folds, cuts, ... }
// in paper-inch coordinates.
//
// Depends on: state, SIZES (state.js); getEffectivePageCount (pagecount.js).

function getDimensions() {
  const s = SIZES[state.size];
  let w = s.w, h = s.h;
  if (state.orientation === 'landscape') { [w, h] = [h, w]; }
  return { w, h };
}

// ============================================================
// SINGLE-SHEET LAYOUTS (returns ONE sheet object)
// ============================================================
function getSingleLayout(fold, w, h) {
  if (fold === 'single') {
    const pageW = w / 2, pageH = h;
    return {
      pageW, pageH,
      cells: [
        { x: 0,     y: 0, w: pageW, h: pageH, num: 4 },
        { x: pageW, y: 0, w: pageW, h: pageH, num: 1 },
      ],
      back: [
        { x: 0,     y: 0, w: pageW, h: pageH, num: 2 },
        { x: pageW, y: 0, w: pageW, h: pageH, num: 3 },
      ],
      folds: [{ x1: pageW, y1: 0, x2: pageW, y2: h, kind: 'mountain' }],
      cuts: [],
      readingOrder: [1, 2, 3, 4],
    };
  }
  if (fold === 'mini8') {
    const pageW = w / 4, pageH = h / 2;
    const cells = [
      { col: 0, row: 0, num: 5, rotate: 180 },
      { col: 1, row: 0, num: 4, rotate: 180 },
      { col: 2, row: 0, num: 3, rotate: 180 },
      { col: 3, row: 0, num: 2, rotate: 180 },
      { col: 0, row: 1, num: 6, rotate: 0 },
      { col: 1, row: 1, num: 7, rotate: 0 },
      { col: 2, row: 1, num: 8, rotate: 0 },
      { col: 3, row: 1, num: 1, rotate: 0 },
    ].map(c => ({ x: c.col * pageW, y: c.row * pageH, w: pageW, h: pageH, num: c.num, rotate: c.rotate }));
    const folds = [
      { x1: 0,         y1: pageH, x2: pageW,   y2: pageH, kind: 'mountain' },
      { x1: 3*pageW,   y1: pageH, x2: w,       y2: pageH, kind: 'mountain' },
      { x1: pageW,     y1: 0,     x2: pageW,   y2: h,     kind: 'valley' },
      { x1: 2*pageW,   y1: 0,     x2: 2*pageW, y2: h,     kind: 'mountain' },
      { x1: 3*pageW,   y1: 0,     x2: 3*pageW, y2: h,     kind: 'valley' },
    ];
    const cuts = [{ x1: pageW, y1: pageH, x2: 3*pageW, y2: pageH, kind: 'cut' }];
    return { pageW, pageH, cells, back: null, folds, cuts, readingOrder: [1,2,3,4,5,6,7,8] };
  }
  if (fold === 'accordion') {
    const n = state.pageCount;
    const horiz = w >= h;
    const cols = horiz ? n : 1;
    const rows = horiz ? 1 : n;
    const pageW = w / cols, pageH = h / rows;
    const cells = [], folds = [], back = [];
    for (let i = 0; i < n; i++) {
      if (horiz) {
        cells.push({ x: i * pageW, y: 0, w: pageW, h: pageH, num: i + 1, rotate: 0 });
        back.push({ x: (n - 1 - i) * pageW, y: 0, w: pageW, h: pageH, num: n + i + 1, rotate: 0 });
        if (i > 0) folds.push({ x1: i*pageW, y1: 0, x2: i*pageW, y2: h, kind: i % 2 === 1 ? 'mountain' : 'valley' });
      } else {
        cells.push({ x: 0, y: i * pageH, w: pageW, h: pageH, num: i + 1, rotate: 0 });
        back.push({ x: 0, y: (n - 1 - i) * pageH, w: pageW, h: pageH, num: n + i + 1, rotate: 0 });
        if (i > 0) folds.push({ x1: 0, y1: i*pageH, x2: w, y2: i*pageH, kind: i % 2 === 1 ? 'mountain' : 'valley' });
      }
    }
    return { pageW, pageH, cells, back, folds, cuts: [], readingOrder: Array.from({length: n*2}, (_, i) => i + 1) };
  }
  if (fold === 'gate') {
    const pageW = w / 3, pageH = h;
    return {
      pageW, pageH,
      cells: [
        { x: 0,       y: 0, w: pageW, h: pageH, num: 6 },
        { x: pageW,   y: 0, w: pageW, h: pageH, num: 1 },
        { x: 2*pageW, y: 0, w: pageW, h: pageH, num: 2 },
      ],
      back: [
        { x: 0,       y: 0, w: pageW, h: pageH, num: 3 },
        { x: pageW,   y: 0, w: pageW, h: pageH, num: 4 },
        { x: 2*pageW, y: 0, w: pageW, h: pageH, num: 5 },
      ],
      folds: [
        { x1: pageW,   y1: 0, x2: pageW,   y2: h, kind: 'valley' },
        { x1: 2*pageW, y1: 0, x2: 2*pageW, y2: h, kind: 'valley' },
      ],
      cuts: [],
      readingOrder: [1, 2, 3, 4, 5, 6],
    };
  }
  if (fold === 'french') {
    const pageW = w / 2, pageH = h / 2;
    return {
      pageW, pageH,
      cells: [
        { x: 0,     y: 0,     w: pageW, h: pageH, num: 5, rotate: 180 },
        { x: pageW, y: 0,     w: pageW, h: pageH, num: 4, rotate: 180 },
        { x: 0,     y: pageH, w: pageW, h: pageH, num: 8, rotate: 0 },
        { x: pageW, y: pageH, w: pageW, h: pageH, num: 1, rotate: 0 },
      ],
      back: [
        { x: 0,     y: 0,     w: pageW, h: pageH, num: 3, rotate: 180 },
        { x: pageW, y: 0,     w: pageW, h: pageH, num: 6, rotate: 180 },
        { x: 0,     y: pageH, w: pageW, h: pageH, num: 2, rotate: 0 },
        { x: pageW, y: pageH, w: pageW, h: pageH, num: 7, rotate: 0 },
      ],
      folds: [
        { x1: pageW, y1: 0, x2: pageW, y2: h, kind: 'mountain' },
        { x1: 0, y1: pageH, x2: w, y2: pageH, kind: 'mountain' },
      ],
      cuts: [],
      readingOrder: [1,2,3,4,5,6,7,8],
    };
  }
  if (fold === 'double-gate') {
    const pageW = w / 4, pageH = h;
    return {
      pageW, pageH,
      cells: [
        { x: 0,       y: 0, w: pageW, h: pageH, num: 8 },
        { x: pageW,   y: 0, w: pageW, h: pageH, num: 1 },
        { x: 2*pageW, y: 0, w: pageW, h: pageH, num: 2 },
        { x: 3*pageW, y: 0, w: pageW, h: pageH, num: 3 },
      ],
      back: [
        { x: 0,       y: 0, w: pageW, h: pageH, num: 7 },
        { x: pageW,   y: 0, w: pageW, h: pageH, num: 6 },
        { x: 2*pageW, y: 0, w: pageW, h: pageH, num: 5 },
        { x: 3*pageW, y: 0, w: pageW, h: pageH, num: 4 },
      ],
      folds: [
        { x1: pageW,   y1: 0, x2: pageW,   y2: h, kind: 'valley' },
        { x1: 2*pageW, y1: 0, x2: 2*pageW, y2: h, kind: 'mountain' },
        { x1: 3*pageW, y1: 0, x2: 3*pageW, y2: h, kind: 'valley' },
      ],
      cuts: [],
      readingOrder: [1,2,3,4,5,6,7,8],
    };
  }
}

// ============================================================
// MULTI-SHEET LAYOUTS (returns ARRAY of sheet objects)
// Each sheet has the same shape as a single-sheet layout.
// ============================================================

// Saddle-stitch imposition: pages get placed so when sheets are stacked
// and folded in half together, page numbers run in sequence.
// For an N-page booklet (N divisible by 4) on N/4 sheets:
// Sheet i (0-indexed) front-left = N - 2i, front-right = 2i + 1
//                    back-left  = 2i + 2,  back-right  = N - 2i - 1
function getSaddleLayout(w, h, totalPages) {
  const sheets = [];
  const sheetCount = totalPages / 4;
  const pageW = w / 2, pageH = h;
  for (let i = 0; i < sheetCount; i++) {
    const flNum = totalPages - 2 * i;       // front-left (outer)
    const frNum = 2 * i + 1;                 // front-right
    const blNum = 2 * i + 2;                 // back-left
    const brNum = totalPages - 2 * i - 1;    // back-right
    sheets.push({
      pageW, pageH,
      cells: [
        { x: 0,     y: 0, w: pageW, h: pageH, num: flNum },
        { x: pageW, y: 0, w: pageW, h: pageH, num: frNum },
      ],
      back: [
        { x: 0,     y: 0, w: pageW, h: pageH, num: blNum },
        { x: pageW, y: 0, w: pageW, h: pageH, num: brNum },
      ],
      folds: [{ x1: pageW, y1: 0, x2: pageW, y2: h, kind: 'mountain' }],
      cuts: [],
      sheetNote: `Sheet ${i + 1} (innermost = sheet ${sheetCount})`,
    });
  }
  return {
    sheets,
    pageW, pageH,
    readingOrder: Array.from({length: totalPages}, (_, i) => i + 1),
    assembly: 'Stack sheets in order (sheet 1 on outside), fold all together in half, staple along spine.',
  };
}

// Perfect bound: each sheet is just folded in half independently,
// sheets are stacked sequentially and glued/bound at the spine.
// Sheet i contains pages 4i+1, 4i+2, 4i+3, 4i+4.
function getPerfectLayout(w, h, totalPages) {
  const sheets = [];
  const sheetCount = totalPages / 4;
  const pageW = w / 2, pageH = h;
  for (let i = 0; i < sheetCount; i++) {
    const p1 = 4*i + 1; // front-right (cover-side)
    const p2 = 4*i + 2; // back-left
    const p3 = 4*i + 3; // back-right
    const p4 = 4*i + 4; // front-left
    sheets.push({
      pageW, pageH,
      cells: [
        { x: 0,     y: 0, w: pageW, h: pageH, num: p4 },
        { x: pageW, y: 0, w: pageW, h: pageH, num: p1 },
      ],
      back: [
        { x: 0,     y: 0, w: pageW, h: pageH, num: p2 },
        { x: pageW, y: 0, w: pageW, h: pageH, num: p3 },
      ],
      folds: [{ x1: pageW, y1: 0, x2: pageW, y2: h, kind: 'mountain' }],
      cuts: [],
      sheetNote: `Sheet ${i + 1} · pages ${p1}–${p4}`,
    });
  }
  return {
    sheets,
    pageW, pageH,
    readingOrder: Array.from({length: totalPages}, (_, i) => i + 1),
    assembly: 'Fold each sheet individually in half. Stack folded sheets in order. Glue along spine.',
  };
}

// Signature booklet: groups of saddle-stitched signatures.
// sigPages = pages per signature (4, 8, 16, 32...).
// Total pages should be a multiple of sigPages.
function getSignatureLayout(w, h, totalPages, sigPages) {
  const sheets = [];
  const pageW = w / 2, pageH = h;
  const sigCount = Math.ceil(totalPages / sigPages);
  const sheetsPerSig = sigPages / 4;
  let sheetIndex = 0;
  for (let s = 0; s < sigCount; s++) {
    const sigStart = s * sigPages;       // first page in this signature
    const pagesInThisSig = Math.min(sigPages, totalPages - sigStart);
    // For final partial signature, we still impose for full sigPages but mark extras as blank
    const N = sigPages;
    const sheetsThisSig = sheetsPerSig;
    for (let i = 0; i < sheetsThisSig; i++) {
      // saddle imposition WITHIN this signature
      const fl = sigStart + (N - 2 * i);
      const fr = sigStart + (2 * i + 1);
      const bl = sigStart + (2 * i + 2);
      const br = sigStart + (N - 2 * i - 1);
      const mark = (n) => (n - sigStart > pagesInThisSig) ? null : n;
      const flN = mark(fl), frN = mark(fr), blN = mark(bl), brN = mark(br);
      sheets.push({
        pageW, pageH,
        cells: [
          flN ? { x: 0, y: 0, w: pageW, h: pageH, num: flN } : { x: 0, y: 0, w: pageW, h: pageH, blank: true },
          frN ? { x: pageW, y: 0, w: pageW, h: pageH, num: frN } : { x: pageW, y: 0, w: pageW, h: pageH, blank: true },
        ],
        back: [
          blN ? { x: 0, y: 0, w: pageW, h: pageH, num: blN } : { x: 0, y: 0, w: pageW, h: pageH, blank: true },
          brN ? { x: pageW, y: 0, w: pageW, h: pageH, num: brN } : { x: pageW, y: 0, w: pageW, h: pageH, blank: true },
        ],
        folds: [{ x1: pageW, y1: 0, x2: pageW, y2: h, kind: 'mountain' }],
        cuts: [],
        sheetNote: `Signature ${s + 1} · sheet ${i + 1} of ${sheetsThisSig}`,
        signatureGroup: s + 1,
      });
      sheetIndex++;
    }
  }
  return {
    sheets,
    pageW, pageH,
    sigCount,
    sheetsPerSig,
    readingOrder: Array.from({length: totalPages}, (_, i) => i + 1),
    assembly: `Build ${sigCount} saddle-stitched signature${sigCount > 1 ? 's' : ''} (${sigPages} pages each). Stack signatures in order, sew or glue along spine.`,
  };
}

// French-fold book: each sheet is French-folded (4 pages per side),
// with the open edge becoming the bound edge (or trimmed).
// For simplicity, treat as multiple French folds bound sequentially.
// Each sheet = 4 pages on one side (front/back if printed double-sided makes 8/sheet).
// We treat each "sheet" as 8 pages.
function getFrenchBookLayout(w, h, totalPages) {
  const sheets = [];
  const pageW = w / 2, pageH = h / 2;
  const sheetCount = Math.ceil(totalPages / 8);
  for (let i = 0; i < sheetCount; i++) {
    const base = i * 8;
    // pages on this sheet are base+1 ... base+8
    // saddle-style imposition for a folded-in-quarters sheet
    const p = (n) => (n <= totalPages) ? n : null;

    // front: top row rotated, like the single french fold
    // pages on this sheet (adapt the single french layout):
    //   front: top-left=base+5 (rot), top-right=base+4 (rot), bot-left=base+8, bot-right=base+1
    //   back:  top-left=base+3 (rot), top-right=base+6 (rot), bot-left=base+2, bot-right=base+7
    const f_tl = p(base + 5), f_tr = p(base + 4);
    const f_bl = p(base + 8), f_br = p(base + 1);
    const b_tl = p(base + 3), b_tr = p(base + 6);
    const b_bl = p(base + 2), b_br = p(base + 7);

    const buildCell = (x, y, num, rotate) => {
      if (num) return { x, y, w: pageW, h: pageH, num, rotate };
      return { x, y, w: pageW, h: pageH, blank: true };
    };

    sheets.push({
      pageW, pageH,
      cells: [
        buildCell(0,     0,     f_tl, 180),
        buildCell(pageW, 0,     f_tr, 180),
        buildCell(0,     pageH, f_bl, 0),
        buildCell(pageW, pageH, f_br, 0),
      ],
      back: [
        buildCell(0,     0,     b_tl, 180),
        buildCell(pageW, 0,     b_tr, 180),
        buildCell(0,     pageH, b_bl, 0),
        buildCell(pageW, pageH, b_br, 0),
      ],
      folds: [
        { x1: pageW, y1: 0, x2: pageW, y2: h, kind: 'mountain' },
        { x1: 0, y1: pageH, x2: w, y2: pageH, kind: 'mountain' },
      ],
      cuts: [],
      sheetNote: `Sheet ${i + 1} · pages ${base + 1}–${Math.min(base + 8, totalPages)}`,
    });
  }
  return {
    sheets,
    pageW, pageH,
    readingOrder: Array.from({length: totalPages}, (_, i) => i + 1),
    assembly: 'Fold each sheet in half twice (French fold). Stack with folded edges to spine, bind along spine. Trim top/outer edges if desired.',
  };
}

// ============================================================
// GET LAYOUT (unified — returns { sheets: [...], ... })
// ============================================================
function getLayout() {
  const { w, h } = getDimensions();

  if (state.mode === 'single') {
    const single = getSingleLayout(state.fold, w, h);
    return {
      sheets: [single],  // wrap single layout in array for uniform handling
      pageW: single.pageW,
      pageH: single.pageH,
      readingOrder: single.readingOrder,
      assembly: null,
    };
  }

  // multi-sheet
  const totalPages = getEffectivePageCount();
  if (state.binding === 'saddle') return getSaddleLayout(w, h, totalPages);
  if (state.binding === 'perfect') return getPerfectLayout(w, h, totalPages);
  if (state.binding === 'signature') return getSignatureLayout(w, h, totalPages, state.sigSize);
  if (state.binding === 'french-book') return getFrenchBookLayout(w, h, totalPages);
}
