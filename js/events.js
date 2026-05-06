// DOM event wiring + initial render. Loaded last so all referenced
// functions (render, renderWiki, exportPNG, getLayout, getSheetCount,
// getPageStep, pagesPerSheet) are already defined.

const sizeSel = document.getElementById('size');
const modeBtns = document.querySelectorAll('#mode button');
const orientBtns = document.querySelectorAll('#orientation button');
const foldBtns = document.querySelectorAll('#fold button');
const bindingBtns = document.querySelectorAll('#binding button');
const countInput = document.getElementById('count');
const countToggleBtns = document.querySelectorAll('#count-toggle button');
const sigSel = document.getElementById('sig-size');
const marginBtns = document.querySelectorAll('#margins button');
const tabBtns = document.querySelectorAll('.tabs button');

modeBtns.forEach(b => b.addEventListener('click', () => {
  modeBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.mode = b.dataset.val;

  const isMulti = state.mode === 'multi';
  document.getElementById('fold-group').classList.toggle('hidden', isMulti);
  document.getElementById('binding-group').classList.toggle('hidden', !isMulti);
  document.getElementById('count-toggle').classList.toggle('hidden', !isMulti);
  document.getElementById('sig-group').classList.toggle('hidden', !(isMulti && state.binding === 'signature'));

  // reset sheet indices
  state.templateSheet = 0;

  // sensible default page count
  if (isMulti) {
    state.pageCount = 16;
    countInput.value = 16;
  } else {
    // single sheet: revert to fold default
    const activeFold = document.querySelector('#fold button.active');
    state.fold = activeFold.dataset.val;
    state.pageCount = parseInt(activeFold.dataset.pages, 10);
    countInput.value = state.pageCount;
  }
  render();
}));

sizeSel.addEventListener('change', e => {
  state.size = e.target.value;
  document.getElementById('size-value').textContent = SIZES[state.size].label;
  render();
});

orientBtns.forEach(b => b.addEventListener('click', () => {
  orientBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.orientation = b.dataset.val;
  render();
}));

foldBtns.forEach(b => b.addEventListener('click', () => {
  foldBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.fold = b.dataset.val;
  if (state.fold === 'accordion') {
    state.pageCount = 4;
    countInput.value = 4;
    countInput.min = 4;
    countInput.disabled = false;
  } else {
    state.pageCount = parseInt(b.dataset.pages, 10);
    countInput.value = state.pageCount;
    countInput.disabled = true;
  }
  render();
}));

bindingBtns.forEach(b => b.addEventListener('click', () => {
  bindingBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.binding = b.dataset.val;
  document.getElementById('sig-group').classList.toggle('hidden', state.binding !== 'signature');
  // ensure pageCount is valid for new binding
  const step = getPageStep();
  if (state.pageCount % step !== 0) {
    state.pageCount = Math.ceil(state.pageCount / step) * step;
    countInput.value = state.pageCount;
  }
  state.templateSheet = 0;
  render();
}));

countInput.addEventListener('input', e => {
  let v = parseInt(e.target.value, 10);
  if (isNaN(v) || v < 1) v = 4;
  // Multi-sheet: count toggle determines if input is pages or sheets
  if (state.mode === 'multi') {
    if (state.countMode === 'sheets') {
      const pps = pagesPerSheet();
      v = Math.max(1, v);
      state.pageCount = v * pps;
    } else {
      const step = getPageStep();
      if (v % step !== 0) v = Math.ceil(v / step) * step;
      if (v < step) v = step;
      if (v > 256) v = 256;
      state.pageCount = v;
    }
  } else {
    // single, accordion only
    if (state.fold === 'accordion') {
      if (v < 2) v = 2;
      if (v > 16) v = 16;
      state.pageCount = v;
    }
  }
  state.templateSheet = 0;
  render();
});

countToggleBtns.forEach(b => b.addEventListener('click', () => {
  countToggleBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.countMode = b.dataset.val;
  // update the input value to reflect the new mode
  if (state.countMode === 'sheets') {
    countInput.value = getSheetCount();
  } else {
    countInput.value = state.pageCount;
  }
  render();
}));

sigSel.addEventListener('change', e => {
  state.sigSize = parseInt(e.target.value, 10);
  document.getElementById('sig-value').textContent = state.sigSize;
  // make sure pageCount is multiple of sigSize
  if (state.pageCount % state.sigSize !== 0) {
    state.pageCount = Math.ceil(state.pageCount / state.sigSize) * state.sigSize;
    if (state.countMode === 'pages') countInput.value = state.pageCount;
  }
  state.templateSheet = 0;
  render();
});

marginBtns.forEach(b => b.addEventListener('click', () => {
  marginBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.showMargins = b.dataset.val === 'on';
  render();
}));

tabBtns.forEach(b => b.addEventListener('click', () => {
  tabBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.tab = b.dataset.tab;
  document.getElementById('tab-template').classList.toggle('hidden', state.tab !== 'template');
  document.getElementById('tab-viewer').classList.toggle('hidden', state.tab !== 'viewer');
  document.getElementById('tab-wiki').classList.toggle('hidden', state.tab !== 'wiki');
  if (state.tab === 'wiki') renderWiki();
  render();
}));

document.getElementById('tpl-prev').addEventListener('click', () => {
  if (state.templateSheet > 0) {
    state.templateSheet--;
    render();
  }
});
document.getElementById('tpl-next').addEventListener('click', () => {
  const layout = getLayout();
  if (state.templateSheet < layout.sheets.length - 1) {
    state.templateSheet++;
    render();
  }
});

document.getElementById('export').addEventListener('click', exportPNG);

// initialize: single mode, single fold, count is locked
countInput.disabled = true;

render();
window.addEventListener('resize', render);
