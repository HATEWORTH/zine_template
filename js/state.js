// State, paper sizes, and label tables.
// Top-level const at non-module script scope is shared across <script> tags.

const state = {
  mode: 'single',          // 'single' | 'multi'
  size: 'letter',
  orientation: 'portrait',
  fold: 'single',          // single-sheet fold type
  binding: 'saddle',       // multi-sheet binding type
  pageCount: 8,
  countMode: 'pages',      // 'pages' | 'sheets' (for multi-sheet input)
  sigSize: 8,              // pages per signature
  tab: 'template',
  templateSheet: 0,        // index of currently-shown sheet in template tab
};

const SIZES = {
  letter:  { w: 8.5, h: 11,  label: 'US Letter', short: '8.5 × 11 in' },
  legal:   { w: 8.5, h: 14,  label: 'US Legal',  short: '8.5 × 14 in' },
  tabloid: { w: 11,  h: 17,  label: 'Tabloid',   short: '11 × 17 in' },
  a3:      { w: 11.69, h: 16.54, label: 'A3', short: '297 × 420 mm' },
  a4:      { w: 8.27, h: 11.69, label: 'A4',  short: '210 × 297 mm' },
  a5:      { w: 5.83, h: 8.27,  label: 'A5',  short: '148 × 210 mm' },
};

const FOLD_LABELS = {
  'single': 'Single Fold',
  'mini8': '8-Page Mini',
  'accordion': 'Accordion',
  'gate': 'Gate Fold',
  'french': 'French Fold',
  'double-gate': 'Double Gate',
};

const BINDING_LABELS = {
  'saddle': 'Saddle-Stitched',
  'perfect': 'Perfect Bound',
  'signature': 'Signature Booklet',
  'french-book': 'French-Fold Book',
};
