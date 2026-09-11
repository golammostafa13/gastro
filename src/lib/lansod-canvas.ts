/**
 * The Lanso D 30 carton's artwork, drawn onto 2D canvases.
 *
 * Six faces of a medicine box, painted rather than photographed, for the same
 * reason `lib/cover-canvas.ts` paints book covers rather than loading images:
 * a texture has to be a flat, square-on view of the surface it wraps, and the
 * supplied photograph is a three-quarter studio shot. Its perspective is baked
 * into every pixel, so mapping it onto a `BoxGeometry` face applies the
 * perspective twice and the box reads as a photograph of a box rather than as a
 * box. `public/lanso-d-30.png` is the flat, static composition shown behind the
 * canvas and in the small footer slot, where a WebGL context would be waste —
 * and it is rendered from `drawPackFront` below rather than cut out of a
 * photograph, so the two can never drift apart. See
 * `scripts/build-brand-assets.mjs`.
 *
 * Everything here is measured off the pack: the white board, the blue "Lanso"
 * with its green swoosh, the green "D", the grey strength, the green edge band
 * and Square's four-square mark. Colours are the product's, not the site's:
 * this is a reproduction of someone's packaging and the one thing it must not
 * do is drift toward our palette.
 *
 * The rule about the photograph turns out to matter more here than it did for
 * the pack this file was written for. The only Lanso D image available carries
 * a stock library's watermark **across the face of the carton** — not on the
 * ground around it, where a flood fill could reach it. Because the artwork is
 * drawn rather than sampled, that watermark cannot reach the render at all,
 * and the photograph stays where it belongs: open beside the code, as the
 * thing the drawing is checked against.
 *
 * Browser-only: it touches `document` and the canvas API, so it is imported
 * from the scene module, which is itself only ever loaded inside an effect.
 */

/**
 * The pack's own colours, read off the supplied photograph.
 *
 * Colours are the product's, not the site's, and the note at the top of this
 * file is the reason: this is a reproduction of somebody's packaging and the
 * one thing it must not do is drift toward our palette. `blue` in particular is
 * **not** `--accent`. They are two different blues and making them the same
 * would be the exact mistake this comment exists to prevent — the pack would
 * stop looking like a photograph of a real box and start looking like a UI
 * element that happens to be box-shaped.
 */
const PACK = {
  /** Carton stock. A true white board, where the pack this replaced was cream. */
  stock: "#ffffff",
  /** The same stock in shadow, for the faces turned away from the light. */
  stockShade: "#e3e9ef",
  ink: "#1b1b1b",
  /** The "Lanso" blue: saturated, very slightly violet-leaning. */
  blue: "#0b5cc4",
  blueDeep: "#07429a",
  /** The swoosh over the "o", the "D", the edge band, and Square's mark. */
  green: "#37a13c",
  greenDeep: "#2b8330",
  greenPale: "#a9dcab",
  /** The "30": silver-grey, and larger than the generic name. */
  grey: "#8a8f96",
  greySoft: "#b6bbc2",
  /** Foil, for the blister. Cooler than the one this replaced. */
  foil: "#c6cbd2",
  foilLit: "#f1f4f7",
  foilShade: "#8b9099",
} as const;

/**
 * Carton proportions: 78 wide × 46 high × 30 deep, in pack units.
 *
 * Squarer and deeper than the 100 × 42 × 26 slab this file was written for,
 * and not as a matter of taste: thirty capsules is six strips of five, and a
 * five-capsule strip is about two thirds the length of a ten-tablet one while
 * six of them stacked is deeper than two. The box has to read as a box rather
 * than as a plank, which also means the scene shows three faces at a shallower
 * yaw than it used to.
 *
 * `drawPackEnd` and `drawPackFlap` derive their aspect from these, so they
 * follow without further arithmetic.
 */
export const PACK_SIZE = { width: 78, height: 46, depth: 30 } as const;

function ctxOf(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(2, Math.round(width));
  canvas.height = Math.max(2, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { canvas, ctx };
}

/** `letterSpacing` is recent; setting it where it is missing is a no-op. */
function setTracking(ctx: CanvasRenderingContext2D, value: string) {
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      value;
  }
}

/**
 * The carton stock itself: a flat fill, a soft vertical gradient for the way
 * board catches light along its length, and the fine tooth that stops a flat
 * fill reading as a polygon under a specular highlight.
 */
function stock(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shaded = false,
) {
  ctx.fillStyle = shaded ? PACK.stockShade : PACK.stock;
  ctx.fillRect(0, 0, w, h);

  const sheen = ctx.createLinearGradient(0, 0, 0, h);
  // Gentler than it was. A 0.5 white stop on cream board reads as light
  // catching the sheet; on a true white one it simply clips.
  sheen.addColorStop(0, "rgba(255,255,255,0.34)");
  sheen.addColorStop(0.45, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  const step = Math.max(3, Math.round(w / 220));
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

/**
 * The green edge: a band across the top and down the right, mitred at the
 * corner where they meet.
 *
 * Two filled paths rather than one L-shaped one, because a path that turns a
 * corner gets a rounded or bevelled join depending on `lineJoin` and this
 * corner is a printed mitre — a straight 45° seam. Filling two trapezoids that
 * share that diagonal is the only way to get it exactly.
 *
 * This replaces the wedge that swept out of the lower right on the pack this
 * file was written for. Not a recolour: a different shape in a different
 * corner, which is most of what makes one carton not look like another.
 */
function edgeBand(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const top = h * 0.085;
  const side = w * 0.062;

  const grad = ctx.createLinearGradient(0, 0, w, h * 0.4);
  grad.addColorStop(0, PACK.green);
  grad.addColorStop(1, PACK.greenDeep);
  ctx.fillStyle = grad;

  // Top bar, mitred away at its right end.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w - side, top);
  ctx.lineTo(0, top);
  ctx.closePath();
  ctx.fill();

  // Right bar, mitred away at its top end, meeting the seam above.
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w, h);
  ctx.lineTo(w - side, h);
  ctx.lineTo(w - side, top);
  ctx.closePath();
  ctx.fill();
}

/**
 * The swoosh over the "o": a short arc that rises left to right, thick where it
 * starts and tapering to a point.
 *
 * Drawn as one closed path between two quadratics whose control points differ,
 * rather than as a stroked arc, because `lineWidth` cannot vary along a path on
 * a 2D canvas and an even-weight arc reads as a hyphen. It is the mark that
 * identifies this pack across a room, so it is worth two curves.
 */
function swoosh(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  rise: number,
) {
  const thick = rise * 0.42;
  ctx.save();
  ctx.fillStyle = PACK.green;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + len * 0.45, y - rise * 1.25, x + len, y - rise);
  ctx.quadraticCurveTo(x + len * 0.5, y - rise * 0.72, x, y + thick);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Square Pharmaceuticals' mark: four squares in a 2×2 with a wide gutter, the
 * group turned 45° so it reads as a diamond of squares rather than a window
 * pane, with the wordmark set to its left.
 *
 * Drawn from a unit grid rather than traced from the photograph, and that is
 * deliberate twice over: the only Lanso D image available carries a stock
 * library's watermark straight across the carton, and a mark reproduced as
 * geometry scales to any canvas size where a cut-out of a 1000px JPEG does not.
 */
function squareMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  const cell = size * 0.43;
  const gut = size * 0.14;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = PACK.green;
  for (const [gx, gy] of [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]) {
    ctx.fillRect(
      -(cell + gut / 2) + gx * (cell + gut),
      -(cell + gut / 2) + gy * (cell + gut),
      cell,
      cell,
    );
  }
  ctx.restore();

  ctx.fillStyle = PACK.grey;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${size * 0.3}px system-ui, sans-serif`;
  setTracking(ctx, `${size * 0.02}px`);
  ctx.fillText("SQUARE", cx - size * 0.95, cy);
  setTracking(ctx, "0px");
}


/**
 * The wordmark: "Lanso" in heavy blue, the green swoosh riding over its "o",
 * then a green "D" set hard against it and the strength in light grey.
 *
 * Set by hand rather than wrapped, because it is a logo: it has one
 * arrangement and it never reflows. The swoosh is positioned from the measured
 * width of "Lans" so it sits over the "o" at any canvas size rather than at one
 * that happened to look right.
 *
 * Returns the baseline it used so the strapline can sit under it.
 */
function wordmark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const size = h * 0.2;
  const baseline = h * 0.5;
  let x = w * 0.075;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = PACK.blue;
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  setTracking(ctx, `${-size * 0.025}px`);
  const lans = ctx.measureText("Lans").width;
  const lanso = ctx.measureText("Lanso").width;
  ctx.fillText("Lanso", x, baseline);
  setTracking(ctx, "0px");

  // Over the "o": from its left edge to its right, rising as it goes.
  swoosh(ctx, x + lans, baseline - size * 0.74, lanso - lans, size * 0.2);

  x += lanso + size * 0.06;

  ctx.fillStyle = PACK.green;
  ctx.font = `800 ${size * 1.05}px system-ui, sans-serif`;
  ctx.fillText("D", x, baseline);
  x += ctx.measureText("D").width;

  ctx.font = `600 ${size * 0.34}px system-ui, sans-serif`;
  ctx.fillStyle = PACK.grey;
  ctx.fillText("\u2122", x + size * 0.02, baseline - size * 0.62);

  ctx.fillStyle = PACK.greySoft;
  ctx.font = `300 ${size * 1.15}px system-ui, sans-serif`;
  ctx.fillText(" 30", x + size * 0.16, baseline);

  return baseline;
}


/**
 * The front face: the one the pack is recognised by, and the only face that
 * gets drawn at full resolution.
 */
export function drawPackFront(width = 1024): HTMLCanvasElement {
  const h = Math.round(width * (PACK_SIZE.height / PACK_SIZE.width));
  const { canvas, ctx } = ctxOf(width, h);
  const w = width;

  stock(ctx, w, h);
  edgeBand(ctx, w, h);
  const baseline = wordmark(ctx, w, h);

  // The generic name, two lines, in the grey the pack uses for small print.
  ctx.fillStyle = PACK.grey;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 ${h * 0.058}px system-ui, sans-serif`;
  ctx.fillText("Dexlansoprazole 30 mg", w * 0.076, baseline + h * 0.13);
  ctx.fillText("Delayed Release Capsules USP", w * 0.076, baseline + h * 0.215);

  // The count. On the pack this replaced it was reversed out of the swash;
  // here the band is a twelfth of the width and reversing type out of it would
  // clip, so it sits on the stock in the pack's own ink.
  ctx.fillStyle = PACK.ink;
  ctx.font = `600 ${h * 0.075}px system-ui, sans-serif`;
  ctx.fillText("30 Capsules", w * 0.076, h * 0.88);

  // Square's mark, bottom right, clear of the green edge.
  squareMark(ctx, w * 0.86, h * 0.84, h * 0.1);

  // The board's own edge. A carton is a folded sheet, and the crease along the
  // top and bottom is the difference between a box and a rendered cuboid.
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = Math.max(1, h * 0.006);
  ctx.beginPath();
  ctx.moveTo(0, ctx.lineWidth / 2);
  ctx.lineTo(w, ctx.lineWidth / 2);
  ctx.moveTo(0, h - ctx.lineWidth / 2);
  ctx.lineTo(w, h - ctx.lineWidth / 2);
  ctx.stroke();

  return canvas;
}

/**
 * The end panel: the narrow face, with the wordmark turned to read up the
 * pack. Drawn in the panel's own orientation and rotated by the scene's UVs
 * rather than here, so the text is never resampled twice.
 */
export function drawPackEnd(width = 512): HTMLCanvasElement {
  const h = Math.round(width * (PACK_SIZE.height / PACK_SIZE.depth));
  const { canvas, ctx } = ctxOf(width, h);
  const w = width;

  stock(ctx, w, h, true);

  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);
  ctx.rotate(-Math.PI / 2);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = w * 0.22;

  ctx.fillStyle = PACK.blue;
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  const lanso = ctx.measureText("Lanso").width;
  ctx.font = `800 ${size * 1.05}px system-ui, sans-serif`;
  const dee = ctx.measureText("D 30").width;
  const total = lanso + dee + size * 0.16;

  ctx.textAlign = "left";
  let x = -total / 2;
  ctx.fillStyle = PACK.blue;
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  ctx.fillText("Lanso", x, 0);
  x += lanso + size * 0.16;
  ctx.fillStyle = PACK.green;
  ctx.font = `800 ${size * 1.05}px system-ui, sans-serif`;
  ctx.fillText("D 30", x, 0);

  ctx.restore();

  ctx.fillStyle = PACK.green;
  ctx.fillRect(0, h * 0.9, w, h * 0.1);
  return canvas;
}

/**
 * The top and bottom flaps: stock, a crease, and the small print nobody reads
 * but whose absence makes a pack look like a prop.
 */
export function drawPackFlap(width = 512): HTMLCanvasElement {
  const h = Math.round(width * (PACK_SIZE.depth / PACK_SIZE.width));
  const { canvas, ctx } = ctxOf(width, h);
  const w = width;

  stock(ctx, w, h, true);

  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = Math.max(1, h * 0.02);
  ctx.beginPath();
  ctx.moveTo(w * 0.06, h * 0.5);
  ctx.lineTo(w * 0.94, h * 0.5);
  ctx.stroke();

  ctx.fillStyle = PACK.grey;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  // Sized to the longer of the two lines rather than to a number that
  // happened to fit the shorter generic name this replaced.
  ctx.font = `400 ${h * 0.1}px system-ui, sans-serif`;
  ctx.fillText("Dexlansoprazole Delayed Release Capsules USP", w * 0.06, h * 0.26);
  ctx.fillText("Keep out of reach of children", w * 0.06, h * 0.74);
  return canvas;
}

/**
 * The blister strip: foil with five capsules pressed into it, in one row.
 *
 * A capsule is not a tablet and the difference is not the outline. A tablet is
 * a dome, and a dome is a radial gradient with its highlight offset toward the
 * key light. A capsule is a **cylinder**, so its shading runs across the short
 * axis as a linear roll-off with a specular line along it — put a radial
 * gradient on a stadium shape and you get a squashed sphere, which is the tell.
 * The cap join, one hairline at about a third of the length, is the cheapest
 * detail that stops it reading as a lozenge.
 *
 * Six of these strips make up the thirty the carton says, which is also why the
 * strip is long and thin where the ten-tablet one it replaced was nearly
 * square.
 */
export function drawBlister(width = 1024): HTMLCanvasElement {
  const h = Math.round(width * 0.22);
  const { canvas, ctx } = ctxOf(width, h);
  const w = width;

  const foil = ctx.createLinearGradient(0, 0, w * 0.2, h);
  foil.addColorStop(0, PACK.foilLit);
  foil.addColorStop(0.4, PACK.foil);
  foil.addColorStop(0.75, PACK.foilShade);
  foil.addColorStop(1, PACK.foil);
  ctx.fillStyle = foil;
  ctx.fillRect(0, 0, w, h);

  // Rolled-foil grain: fine vertical streaks, not noise. Aluminium is milled.
  ctx.save();
  ctx.globalAlpha = 0.12;
  for (let x = 0; x < w; x += 3) {
    ctx.fillStyle = x % 6 === 0 ? "#ffffff" : "#7c828b";
    ctx.fillRect(x, 0, 1, h);
  }
  ctx.restore();

  const cols = 5;
  const cellW = w / cols;
  // A capsule is about 2.4 times as long as it is wide. Get this ratio wrong
  // and the stadium's end caps meet in the middle: the straight sides vanish
  // and five tablets appear on the strip instead.
  const rx = cellW * 0.4;
  const ry = rx / 2.4;

  for (let col = 0; col < cols; col++) {
    const cx = cellW * (col + 0.5);
    const cy = h * 0.5;

    // The pressed pocket: a stadium a shade larger than the capsule.
    ctx.beginPath();
    ctx.roundRect(cx - rx * 1.07, cy - ry * 1.28, rx * 2.14, ry * 2.56, ry * 1.28);
    ctx.fillStyle = "rgba(80,86,95,0.5)";
    ctx.fill();

    // The body. Linear across the short axis: see the note above.
    const body = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
    body.addColorStop(0, "#c9ced6");
    body.addColorStop(0.26, "#ffffff");
    body.addColorStop(0.55, "#e4e8ee");
    body.addColorStop(1, "#9aa0a9");
    ctx.beginPath();
    ctx.roundRect(cx - rx, cy - ry, rx * 2, ry * 2, ry);
    ctx.fillStyle = body;
    ctx.fill();

    // The cap join.
    ctx.strokeStyle = "rgba(120,127,137,0.45)";
    ctx.lineWidth = Math.max(1, ry * 0.07);
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.3, cy - ry * 0.88);
    ctx.lineTo(cx - rx * 0.3, cy + ry * 0.88);
    ctx.stroke();
  }

  return canvas;
}
