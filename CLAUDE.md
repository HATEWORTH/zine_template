# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

A **zero-build static web app** — plain HTML, CSS, and JavaScript split across files but loaded via simple `<script src=...>` tags (no modules, no bundler). External dependencies are limited to two Google Fonts (Fraunces, JetBrains Mono) and JSZip (CDN, used by `js/export.js` to bundle multi-PNG exports into a single `.zip` download).

To run: open `index.html` directly in a browser. There is no dev server, no lint command, no test runner.

The original monolithic version is preserved as `Zine (3).html` (legacy reference; not loaded). It can be deleted once the split is verified working.

## File layout

```
index.html              page markup + ordered <script> tags
css/styles.css          all styles
js/state.js             state object, SIZES, FOLD_LABELS, BINDING_LABELS
js/pagecount.js         pagesPerSheet, getSheetCount, getMinPageCount, getPageStep
js/layouts.js           getDimensions, getSingleLayout, get{Saddle,Perfect,Signature,FrenchBook}Layout, getLayout
js/draw.js              drawSheet (the shared render primitive), drawCornerMarks, sizeCanvasToFit
js/wiki.js              step/stripBuilder, all svg<Foldname>(), WIKI array, renderWiki
js/render.js            render dispatcher, updateMeta, updateLabels, viewer tab DOM
js/export.js            exportPNG + downloadBlob
js/events.js            DOM lookups, event wiring, initial render() call (loaded last)
```

Top-level `const`/`let` in non-module scripts share a single global lexical environment, so identifiers declared at the top of one file are visible to scripts loaded after it. **Load order in `index.html` matters** — declarations must precede references.

## What it does

A browser tool that generates printable zine/booklet imposition templates. The user picks a paper size, orientation, and either a **single-sheet fold** (single, mini8, accordion, gate, french, double-gate) or a **multi-sheet binding** (saddle, perfect, signature, french-book), and a page count. The tool renders the imposed sheet(s) to canvas and exports 300-DPI PNGs (front + back per sheet).

## Architecture

The flow is **state → layout → draw**, plus a separate wiki tab.

- **`state`** (`js/state.js`) — single source of truth: `mode`, `size`, `orientation`, `fold`, `binding`, `pageCount`, `countMode`, `sigSize`, `tab`, `templateSheet`. UI events mutate `state` then call `render()`.

- **Layout functions** (`js/layouts.js`) return a normalized shape `{ sheets: [...], pageW, pageH, readingOrder, assembly }`. Each sheet has `{ pageW, pageH, cells, back, folds, cuts, readingOrder, signatureGroup? }` where `cells`/`back` are page rectangles with `{x, y, w, h, num, rotate?}` in paper-inch coordinates.
  - `getSingleLayout(fold, w, h)` — handles all single-sheet folds; returns ONE sheet.
  - `getSaddleLayout` / `getPerfectLayout` / `getSignatureLayout` / `getFrenchBookLayout` — multi-sheet bindings; return many sheets.
  - `getLayout()` is the unified entry point and wraps single-sheet results in a one-element `sheets` array so the rest of the code is sheet-count-agnostic.

- **`drawSheet(ctx, cw, ch, paperW, paperH, sheet, side)`** (`js/draw.js`) is the single rendering primitive. It is reused for both the on-screen preview and the 300-DPI PNG export — anything you change here affects both. `side` is `'front'` or `'back'`; cells are scaled from paper inches to canvas pixels via `sx = cw/paperW`, `sy = ch/paperH`. Each non-blank cell gets a dashed safe-area inset; tunable via `SAFE_MARGIN_TRIM_IN` (cell edges that lie on the sheet boundary) and `SAFE_MARGIN_FOLD_IN` (cell-to-cell inner edges) at the top of the file.

- **`exportPNG()`** (`js/export.js`) iterates `layout.sheets`, creates an offscreen canvas at `w*300 × h*300` per side, calls `drawSheet`, and produces a blob per file. If only one PNG would be produced it downloads that PNG directly; otherwise it bundles them into `<baseName>.zip` (via JSZip) so the browser fires only one download prompt. Inside the zip the files live in a `<baseName>/` folder as `sheet<N>_front.png` / `sheet<N>_back.png`.

- **`render()`** (`js/render.js`) — single dispatcher. Reads `state.tab`, either draws the current sheet to the main canvas (template tab) or builds the multi-sheet viewer DOM (viewer tab). Always calls `updateMeta()` and `updateLabels()` afterward. The main `canvas`/`ctx` references are looked up at the top of this file.

- **Page-count math** (`js/pagecount.js`): `pagesPerSheet()`, `getSheetCount()`, `getMinPageCount()`, `getPageStep()`. Multi-sheet bindings enforce that `pageCount` is a multiple of the step (4 for saddle/perfect, `sigSize` for signature, 8 for french-book). The count input is auto-rounded up to the next valid step on change.

- **Wiki tab** (`js/wiki.js`) is data-driven from the `WIKI` array. Each entry has `{ id, name, pages, difficulty, uses, howTo, notes, svg }` where `svg` is a function returning markup built via the `step()` and `stripBuilder()` helpers. `renderWiki()` is called only on first wiki tab open (via `events.js`).

## Adding a new fold or binding

The two halves are independent:

1. **Make it work in the tool**: add a button in `index.html`, add a branch in the relevant layout function in `js/layouts.js` (or write a new one), update `pagesPerSheet`/`getMinPageCount`/`getPageStep` in `js/pagecount.js` if the math differs, add a label in `FOLD_LABELS` or `BINDING_LABELS` in `js/state.js`.
2. **Document it in the wiki**: add an `svg<Name>()` builder and a `WIKI` entry, both in `js/wiki.js`.

Page numbering inside `cells`/`back` is the imposition — not reading order. The visual reading order is reported separately via `readingOrder` for the booklet preview strip.

## Coordinate conventions

- Layout coordinates are in **paper inches** (`SIZES` table in `js/state.js`).
- Orientation swap is done once in `getDimensions()` — every layout function receives already-oriented `w, h`.
- Canvas rendering scales inches → pixels at draw time; PNG export uses the same `drawSheet` at 300 DPI so on-screen and exported geometry stay consistent.
