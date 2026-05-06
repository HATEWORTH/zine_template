// Page-count math. Multi-sheet bindings enforce that pageCount is a
// multiple of getPageStep() (4 for saddle/perfect, sigSize for signature,
// 8 for french-book). Depends on `state` from state.js.

function pagesPerSheet() {
  if (state.mode === 'single') {
    // single sheet = total pages by definition
    const map = { 'single': 4, 'mini8': 8, 'gate': 6, 'french': 8, 'double-gate': 8, 'accordion': state.pageCount * 2 };
    return map[state.fold];
  }
  if (state.binding === 'french-book') return 8;
  return 4; // saddle, perfect, signature: 4 pages per sheet
}

function getEffectivePageCount() {
  return state.pageCount;
}

function getSheetCount() {
  if (state.mode === 'single') return 1;
  return Math.ceil(state.pageCount / pagesPerSheet());
}

function getMinPageCount() {
  if (state.mode === 'single') return null;
  if (state.binding === 'signature') return state.sigSize;
  if (state.binding === 'french-book') return 8;
  return 4;
}

function getPageStep() {
  if (state.binding === 'signature') return state.sigSize;
  if (state.binding === 'french-book') return 8;
  return 4;
}
