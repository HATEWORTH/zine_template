// PNG export: renders fresh 300-DPI canvases per sheet/side using the
// same drawSheet primitive as the on-screen preview, then triggers
// a blob download for each one.
//
// Filename pattern: zine_<fold-or-binding>_<size>_<orientation>[_sheetN]_<front|back>.png
//
// Depends on: state (state.js); getDimensions, getLayout (layouts.js);
//             drawSheet (draw.js).

function exportPNG() {
  const { w, h } = getDimensions();
  const layout = getLayout();
  const DPI = 300;
  const baseFold = state.mode === 'multi' ? state.binding : state.fold;

  layout.sheets.forEach((sheet, sheetIdx) => {
    const sheetSuffix = layout.sheets.length > 1 ? `_sheet${sheetIdx + 1}` : '';

    // front
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = Math.round(w * DPI);
    frontCanvas.height = Math.round(h * DPI);
    drawSheet(frontCanvas.getContext('2d'), frontCanvas.width, frontCanvas.height, w, h, sheet, 'front');
    frontCanvas.toBlob(blob => {
      downloadBlob(blob, `zine_${baseFold}_${state.size}_${state.orientation}${sheetSuffix}_front.png`);
    }, 'image/png');

    if (sheet.back) {
      const backCanvas = document.createElement('canvas');
      backCanvas.width = Math.round(w * DPI);
      backCanvas.height = Math.round(h * DPI);
      drawSheet(backCanvas.getContext('2d'), backCanvas.width, backCanvas.height, w, h, sheet, 'back');
      backCanvas.toBlob(blob => {
        downloadBlob(blob, `zine_${baseFold}_${state.size}_${state.orientation}${sheetSuffix}_back.png`);
      }, 'image/png');
    }
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
