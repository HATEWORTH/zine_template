// Shared rendering primitive. Used by both the on-screen preview
// and the PNG export — anything changed here affects both.
//
// `cell` coordinates are in paper inches; sx/sy scale them to canvas pixels.

// Safe-area margin guides drawn inside each non-blank page cell.
// The actual inset distances are user-configurable via state
// (state.sheetBorderPx for outer cell edges that lie on the sheet
// boundary, state.innerMarginPx for inner cell-to-cell edges).
// Values are stored in pixels at 300 DPI so the export and preview
// stay consistent regardless of canvas size.

function sizeCanvasToFit(cv, paperW, paperH, maxW, maxH) {
  // Also clamp to viewport: never wider than viewport minus some margin.
  // This keeps canvases visible on phones without depending on container width.
  const vw = window.innerWidth;
  const viewportCap = Math.max(180, vw - 60); // leave space for app padding
  const effectiveMaxW = Math.min(maxW, viewportCap);

  const ratio = paperW / paperH;
  let dispW, dispH;
  if (ratio > effectiveMaxW / maxH) {
    dispW = effectiveMaxW; dispH = effectiveMaxW / ratio;
  } else {
    dispH = maxH; dispW = maxH * ratio;
  }
  const dpr = window.devicePixelRatio || 1;
  const scale = 2 * dpr;
  cv.width = dispW * scale;
  cv.height = dispH * scale;
  cv.style.width = dispW + 'px';
  cv.style.height = dispH + 'px';
}

function drawSheet(ctx, cw, ch, paperW, paperH, sheet, side) {
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cw, ch);

  if (!sheet) return;
  const cells = side === 'back' ? sheet.back : sheet.cells;
  if (!cells) return;

  const sx = cw / paperW;
  const sy = ch / paperH;

  cells.forEach(cell => {
    const x = cell.x * sx, y = cell.y * sy;
    const w = cell.w * sx, h = cell.h * sy;

    if (cell.blank) {
      ctx.save();
      ctx.fillStyle = '#fbf8f3';
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
      ctx.strokeStyle = 'rgba(26,22,20,0.18)';
      ctx.lineWidth = 1;
      for (let i = -h; i < w; i += 8) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + h);
        ctx.lineTo(x + i + h, y);
        ctx.stroke();
      }
      ctx.fillStyle = '#6b6359';
      ctx.font = `500 ${Math.max(10, Math.min(w,h)*0.06)}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BLANK', x + w/2, y + h/2);
      ctx.restore();
    } else {
      ctx.fillStyle = '#fbf8f3';
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

      // Safe-area margin guide. Each cell has 4 edges; an edge is
      // "outer" if it sits on the sheet boundary, otherwise "inner".
      // Outer edges are gated by state.showSheetBorder, inner edges by
      // state.showInnerMargins. Outer edges use the larger trim inset,
      // inner edges use the smaller fold inset. When a perpendicular
      // edge is hidden, the line extends to the cell boundary so it
      // joins cleanly with the adjacent cell's matching line.
      {
        const eps = 1e-3;
        const isLeftOuter   = cell.x < eps;
        const isTopOuter    = cell.y < eps;
        const isRightOuter  = Math.abs(cell.x + cell.w - paperW) < eps;
        const isBottomOuter = Math.abs(cell.y + cell.h - paperH) < eps;

        const visL = isLeftOuter   ? state.showSheetBorder : state.showInnerMargins;
        const visT = isTopOuter    ? state.showSheetBorder : state.showInnerMargins;
        const visR = isRightOuter  ? state.showSheetBorder : state.showInnerMargins;
        const visB = isBottomOuter ? state.showSheetBorder : state.showInnerMargins;

        if (visL || visT || visR || visB) {
          const trimIn = state.sheetBorderPx / EXPORT_DPI;
          const foldIn = state.innerMarginPx / EXPORT_DPI;
          const mL = isLeftOuter   ? trimIn : foldIn;
          const mT = isTopOuter    ? trimIn : foldIn;
          const mR = isRightOuter  ? trimIn : foldIn;
          const mB = isBottomOuter ? trimIn : foldIn;

          const xL = x + mL * sx;
          const xR = x + w - mR * sx;
          const yT = y + mT * sy;
          const yB = y + h - mB * sy;

          const yTopEnd   = visT ? yT : y;
          const yBotEnd   = visB ? yB : y + h;
          const xLeftEnd  = visL ? xL : x;
          const xRightEnd = visR ? xR : x + w;

          ctx.save();
          ctx.strokeStyle = 'rgba(45, 93, 63, 0.55)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          if (visL) { ctx.moveTo(xL, yTopEnd);  ctx.lineTo(xL, yBotEnd); }
          if (visR) { ctx.moveTo(xR, yTopEnd);  ctx.lineTo(xR, yBotEnd); }
          if (visT) { ctx.moveTo(xLeftEnd, yT); ctx.lineTo(xRightEnd, yT); }
          if (visB) { ctx.moveTo(xLeftEnd, yB); ctx.lineTo(xRightEnd, yB); }
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.save();
      ctx.translate(x + w/2, y + h/2);
      if (cell.rotate) ctx.rotate(cell.rotate * Math.PI / 180);

      const fontSize = Math.min(w, h) * 0.32;

      ctx.fillStyle = '#1a1614';
      ctx.font = `italic 800 ${fontSize}px Fraunces, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(cell.num), 0, fontSize * 0.05);

      ctx.fillStyle = '#6b6359';
      ctx.font = `500 ${Math.max(9, fontSize * 0.14)}px JetBrains Mono, monospace`;
      ctx.fillText('PAGE', 0, -fontSize * 0.45);

      const arrowY = -h/2 + Math.min(w,h) * 0.13;
      ctx.fillStyle = '#d63f2a';
      ctx.font = `bold ${Math.max(12, fontSize * 0.24)}px JetBrains Mono, monospace`;
      ctx.fillText('↑', 0, arrowY);
      ctx.font = `500 ${Math.max(7, fontSize * 0.10)}px JetBrains Mono, monospace`;
      ctx.fillText('TOP', 0, arrowY + fontSize * 0.20);

      ctx.restore();
    }
  });

  ctx.strokeStyle = '#1a1614';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.strokeRect(1, 1, cw - 2, ch - 2);

  if (sheet.folds) {
    sheet.folds.forEach(f => {
      ctx.beginPath();
      ctx.moveTo(f.x1 * sx, f.y1 * sy);
      ctx.lineTo(f.x2 * sx, f.y2 * sy);
      if (f.kind === 'valley') {
        ctx.strokeStyle = '#2d5d3f';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 4]);
      } else {
        ctx.strokeStyle = '#1a1614';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  if (sheet.cuts && sheet.cuts.length) {
    ctx.strokeStyle = '#d63f2a';
    ctx.lineWidth = 2.5;
    sheet.cuts.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(c.x1 * sx, c.y1 * sy);
      ctx.lineTo(c.x2 * sx, c.y2 * sy);
      ctx.stroke();
    });
    ctx.fillStyle = '#d63f2a';
    ctx.font = `${Math.max(14, cw * 0.02)}px serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const c0 = sheet.cuts[0];
    ctx.fillText('✂', c0.x1 * sx - 18, c0.y1 * sy);
  }

  drawCornerMarks(ctx, cw, ch);
}

function drawCornerMarks(ctx, cw, ch) {
  const len = Math.min(cw, ch) * 0.025;
  const off = 6;
  ctx.strokeStyle = '#1a1614';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  const corners = [
    [0, 0, 1, 1], [cw, 0, -1, 1],
    [0, ch, 1, -1], [cw, ch, -1, -1],
  ];
  corners.forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * off, y);
    ctx.lineTo(x + dx * (off + len), y);
    ctx.moveTo(x, y + dy * off);
    ctx.lineTo(x, y + dy * (off + len));
    ctx.stroke();
  });
}
