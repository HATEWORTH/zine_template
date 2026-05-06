// PNG export: renders fresh 300-DPI canvases per sheet/side using the
// same drawSheet primitive as the on-screen preview.
//
// One file → direct PNG download.
// Two or more files → bundled into a single .zip via JSZip so the
// browser fires only one download prompt.
//
// Filename pattern: zine_<fold-or-binding>_<size>_<orientation>[.zip|_<sheet>_<side>.png]
//
// Depends on: state (state.js); getDimensions, getLayout (layouts.js);
//             drawSheet (draw.js); JSZip (CDN, loaded in index.html).

function exportPNG() {
  const { w, h } = getDimensions();
  const layout = getLayout();
  const DPI = 300;
  const baseFold = state.mode === 'multi' ? state.binding : state.fold;
  const baseName = `zine_${baseFold}_${state.size}_${state.orientation}`;
  const multiSheet = layout.sheets.length > 1;

  const tasks = [];
  layout.sheets.forEach((sheet, sheetIdx) => {
    const sheetTag = multiSheet ? `sheet${sheetIdx + 1}` : 'sheet';
    tasks.push(renderToBlob(w, h, DPI, sheet, 'front').then(blob => ({
      blob,
      flatName: multiSheet
        ? `${baseName}_sheet${sheetIdx + 1}_front.png`
        : `${baseName}_front.png`,
      zipName: `${sheetTag}_front.png`,
    })));
    if (sheet.back) {
      tasks.push(renderToBlob(w, h, DPI, sheet, 'back').then(blob => ({
        blob,
        flatName: multiSheet
          ? `${baseName}_sheet${sheetIdx + 1}_back.png`
          : `${baseName}_back.png`,
        zipName: `${sheetTag}_back.png`,
      })));
    }
  });

  Promise.all(tasks).then(files => {
    if (files.length === 1) {
      downloadBlob(files[0].blob, files[0].flatName);
      return;
    }
    const zip = new JSZip();
    const folder = zip.folder(baseName);
    files.forEach(f => folder.file(f.zipName, f.blob));
    zip.generateAsync({ type: 'blob' }).then(zipBlob => {
      downloadBlob(zipBlob, `${baseName}.zip`);
    });
  });
}

function renderToBlob(w, h, DPI, sheet, side) {
  return new Promise(resolve => {
    const cv = document.createElement('canvas');
    cv.width = Math.round(w * DPI);
    cv.height = Math.round(h * DPI);
    drawSheet(cv.getContext('2d'), cv.width, cv.height, w, h, sheet, side);
    cv.toBlob(blob => resolve(blob), 'image/png');
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
