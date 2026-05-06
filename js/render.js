// Top-level render dispatcher and the multi-sheet viewer.
// Reads state.tab and either draws the current sheet to the main canvas
// or builds the multi-sheet viewer DOM, then refreshes meta + labels.
//
// Depends on: state, SIZES, FOLD_LABELS, BINDING_LABELS (state.js);
//             getDimensions, getLayout (layouts.js);
//             pagesPerSheet, getSheetCount (pagecount.js);
//             drawSheet, sizeCanvasToFit (draw.js).

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function render() {
  const { w, h } = getDimensions();
  const layout = getLayout();
  state.templateSheet = Math.min(state.templateSheet, layout.sheets.length - 1);

  if (state.tab === 'template') {
    sizeCanvasToFit(canvas, w, h, 720, 600);
    drawSheet(ctx, canvas.width, canvas.height, w, h, layout.sheets[state.templateSheet], 'front');

    const tplNav = document.getElementById('template-nav');
    if (layout.sheets.length > 1) {
      tplNav.classList.remove('hidden');
      document.getElementById('tpl-sheet-num').textContent = state.templateSheet + 1;
      document.getElementById('tpl-sheet-total').textContent = layout.sheets.length;
      document.getElementById('tpl-prev').disabled = state.templateSheet === 0;
      document.getElementById('tpl-next').disabled = state.templateSheet === layout.sheets.length - 1;
    } else {
      tplNav.classList.add('hidden');
    }
  } else {
    renderViewer(layout, w, h);
  }
  updateMeta(layout);
  updateLabels();
}

function updateLabels() {
  // count label text
  const ct = document.getElementById('count-label-text');
  if (state.mode === 'single' && state.fold !== 'accordion') {
    ct.textContent = 'Page Count (fixed)';
  } else if (state.mode === 'multi' && state.countMode === 'sheets') {
    ct.textContent = 'Sheet Count';
  } else {
    ct.textContent = 'Page Count';
  }
  document.getElementById('count-value').textContent =
    state.mode === 'multi' && state.countMode === 'sheets' ? getSheetCount() : state.pageCount;

  // helper text
  const helper = document.getElementById('count-helper');
  if (state.mode === 'multi') {
    const pages = state.pageCount;
    const sheets = getSheetCount();
    helper.textContent = `${pages} pages on ${sheets} sheet${sheets > 1 ? 's' : ''} · ${pagesPerSheet()} pages/sheet`;
  } else if (state.fold === 'accordion') {
    helper.textContent = `${state.pageCount} panels per side · ${state.pageCount * 2} pages total double-sided`;
  } else {
    helper.textContent = '';
  }

  // sig value
  document.getElementById('sig-value').textContent = state.sigSize;

  // export note
  const layout = getLayout();
  const totalFiles = layout.sheets.reduce((sum, s) => sum + (s.back ? 2 : 1), 0);
  document.getElementById('export-note').textContent =
    `Exports ${totalFiles} file${totalFiles > 1 ? 's' : ''} · 300 DPI`;
}

function updateMeta(layout) {
  const s = SIZES[state.size];
  const { w, h } = getDimensions();
  const labelText = state.mode === 'multi' ? BINDING_LABELS[state.binding] : FOLD_LABELS[state.fold];
  document.getElementById('meta-fold').textContent = labelText;
  document.getElementById('info-dim').textContent =
    state.orientation === 'landscape' ? s.short.split('×').reverse().join('×') : s.short;
  document.getElementById('info-pages').textContent =
    state.mode === 'single' && state.fold === 'accordion'
      ? state.pageCount * 2
      : state.mode === 'single'
        ? layout.sheets[0].cells.length + (layout.sheets[0].back ? layout.sheets[0].back.length : 0)
        : state.pageCount;
  document.getElementById('info-sheets').textContent = getSheetCount();
  document.getElementById('info-page').textContent =
    `${layout.pageW.toFixed(2)} × ${layout.pageH.toFixed(2)} in`;
}

// ============================================================
// VIEWER (multi-sheet aware)
// ============================================================
function renderViewer(layout, w, h) {
  const stack = document.getElementById('sheet-stack');
  stack.innerHTML = '';

  // group by signature if applicable
  const groups = [];
  let currentGroup = null;
  layout.sheets.forEach((sheet, idx) => {
    const groupKey = sheet.signatureGroup || 0;
    if (!currentGroup || currentGroup.key !== groupKey) {
      currentGroup = { key: groupKey, sheets: [], idx };
      groups.push(currentGroup);
    }
    currentGroup.sheets.push({ sheet, idx });
  });

  groups.forEach(group => {
    if (state.binding === 'signature' && layout.sigCount > 1) {
      const lab = document.createElement('div');
      lab.className = 'sheet-group-label';
      lab.innerHTML = `Signature ${group.key} <span class="small">${group.sheets.length} sheet${group.sheets.length > 1 ? 's' : ''}</span>`;
      stack.appendChild(lab);
    }
    group.sheets.forEach(({ sheet, idx }) => {
      const row = document.createElement('div');
      row.className = 'sheet-row';

      const front = makeSheetCard(`Sheet ${idx + 1} — Front`, false, idx, 'front', sheet, w, h);
      row.appendChild(front);

      if (sheet.back) {
        const back = makeSheetCard(`Sheet ${idx + 1} — Back`, true, idx, 'back', sheet, w, h);
        row.appendChild(back);
      }

      stack.appendChild(row);
    });
  });

  // booklet preview
  renderBookletPreview(layout);
}

function makeSheetCard(label, isBack, idx, side, sheet, w, h) {
  const card = document.createElement('div');
  card.className = 'sheet-card';
  const lab = document.createElement('div');
  lab.className = 'sheet-label';
  lab.innerHTML = `<span class="dot ${isBack ? 'back' : ''}"></span> <strong>${label}</strong>`;
  card.appendChild(lab);
  const cv = document.createElement('canvas');
  card.appendChild(cv);
  const ictx = cv.getContext('2d');
  sizeCanvasToFit(cv, w, h, 460, 380);
  drawSheet(ictx, cv.width, cv.height, w, h, sheet, side);
  return card;
}

function renderBookletPreview(layout) {
  const container = document.getElementById('booklet-pages');
  container.innerHTML = '';
  if (!layout.readingOrder) return;
  layout.readingOrder.forEach(p => {
    const el = document.createElement('div');
    el.className = 'mini-page';
    el.textContent = p;
    container.appendChild(el);
  });
}
