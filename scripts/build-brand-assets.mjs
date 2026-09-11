/**
 * Renders the sponsor artwork.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * Writes, both committed:
 *   public/lanso-d-30.png   the flat pack, three-quarter
 *   public/courtesy-by.png  Square's mark, for the "Courtesy by" slot
 *
 * ## Why this no longer starts from a photograph
 *
 * It used to. The library this was forked from was given a studio pack shot on
 * white and cut the ground away with a scanline flood fill inward from the four
 * corners — the careful way, because the product is a white carton and
 * thresholding near-white pixels punches holes straight through the box.
 *
 * That cannot be done here. The only Lanso D image available carries a stock
 * library's watermark printed **across the face of the carton**. A flood fill
 * removes a ground; it cannot remove a mark sitting on the product, and no
 * threshold can either without taking the printed panel with it. Cutting that
 * image would have put a competitor's watermark in the footer of every page on
 * a pharmaceutical sponsor's library.
 *
 * So the dependency is reversed: the flat pack is rendered from
 * `src/lib/lansod-canvas.ts` — the same code that paints the six faces of the
 * 3D carton — rather than sampled from a picture of one. That is strictly
 * better than what it replaced, for three reasons beyond the watermark:
 *
 *   • The flat still and the WebGL pack can never drift apart, because there is
 *     only one drawing. Before, they were a photograph and a reproduction of a
 *     photograph, and nothing kept them in step.
 *   • It regenerates at any size. A cut-out is stuck at the resolution of the
 *     JPEG it came from.
 *   • It needs no supplied asset at all, so a fresh checkout can build every
 *     committed file in `public/` without anyone hunting for the originals.
 *
 * ## How it runs browser code
 *
 * `lansod-canvas.ts` touches `document` and the 2D canvas API, so it cannot run
 * in Node. It is type-stripped with `module.stripTypeScriptTypes` and injected
 * into a headless Chrome page, which draws the faces and hands back a PNG. The
 * module is read, not duplicated: if the carton changes, this output changes
 * with it, which is the whole point.
 *
 * Requires the same Chrome `probe.mjs` uses.
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public");
mkdirSync(out, { recursive: true });

/** The drawing module, as browser-executable JavaScript. */
const source = stripTypeScriptTypes(
  readFileSync(join(root, "src/lib/lansod-canvas.ts"), "utf8"),
  { mode: "strip" },
)
  // `export` is meaningless in a classic script tag; the functions are wanted
  // as globals so the page can call them.
  .replace(/^export /gm, "");

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 1 });
await page.setContent("<!doctype html><body></body>");
await page.addScriptTag({ content: source });

/**
 * The composition: the front face, sheared and scaled into a three-quarter
 * view, with the end panel on its right and the blister lying in front.
 *
 * Drawn with 2D transforms rather than by screenshotting the WebGL scene. A
 * headless GL context is a different renderer from the one a reader gets, and
 * this still has to match the page it sits behind rather than a second
 * rendering of it. The geometry is a fake, and an honest one: two parallelograms
 * that agree about a vanishing direction.
 */
const dataUrl = await page.evaluate(() => {
  const W = 1400;
  const H = 1000;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");

  const front = drawPackFront(1400);
  const end = drawPackEnd(620);
  const blister = drawBlister(1100);

  // Front face: turned away from the viewer to the left.
  const fw = 760;
  const fh = fw * (PACK_SIZE.height / PACK_SIZE.width);
  const fx = 250;
  const fy = 210;

  g.save();
  g.transform(1, 0.1, 0, 1, fx, fy);
  g.drawImage(front, 0, 0, fw, fh);
  g.restore();

  // End panel: the right-hand face, leaning the other way.
  const ew = fw * (PACK_SIZE.depth / PACK_SIZE.width) * 1.08;
  g.save();
  g.transform(1, -0.1, 0, 1, fx + fw, fy + fw * 0.1);
  g.drawImage(end, 0, 0, ew, fh);
  g.restore();

  // Top flap, closing the box.
  const flap = drawPackFlap(760);
  g.save();
  g.transform(1, 0.1, -0.72, 1, fx, fy);
  g.translate(0, 0);
  g.drawImage(flap, 0, -ew * 0.62, fw, ew * 0.62);
  g.restore();

  // The strip, lying in front and overlapping the carton's foot.
  g.save();
  g.transform(1, 0.09, -0.2, 1, 120, 660);
  g.drawImage(blister, 0, 0, 900, 900 * 0.22);
  g.restore();

  // Trim to the drawn content so the PNG has no dead margin.
  const px = g.getImageData(0, 0, W, H).data;
  let x0 = W;
  let y0 = H;
  let x1 = 0;
  let y1 = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (px[(y * W + x) * 4 + 3] > 4) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const pad = 8;
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(W - 1, x1 + pad);
  y1 = Math.min(H - 1, y1 + pad);

  const t = document.createElement("canvas");
  t.width = x1 - x0 + 1;
  t.height = y1 - y0 + 1;
  t.getContext("2d").drawImage(c, -x0, -y0);
  return t.toDataURL("image/png");
});

writeFileSync(
  join(out, "lanso-d-30.png"),
  Buffer.from(dataUrl.split(",")[1], "base64"),
);
console.log("  ✓ lanso-d-30.png");

/** Square's mark on its own, for the "Courtesy by" slot in the footer. */
const markUrl = await page.evaluate(() => {
  const c = document.createElement("canvas");
  c.width = 760;
  c.height = 200;
  const g = c.getContext("2d");
  // `squareMark` is module-private, so the lockup is composed here from the
  // same two ingredients: the four squares and the wordmark beside them.
  g.translate(0, 0);
  const size = 120;
  const cx = 640;
  const cy = 100;
  g.save();
  g.translate(cx, cy);
  g.rotate(Math.PI / 4);
  g.fillStyle = "#37a13c";
  const cell = size * 0.43;
  const gut = size * 0.14;
  for (const [gx, gy] of [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]) {
    g.fillRect(
      -(cell + gut / 2) + gx * (cell + gut),
      -(cell + gut / 2) + gy * (cell + gut),
      cell,
      cell,
    );
  }
  g.restore();
  g.fillStyle = "#1b1b1b";
  g.textAlign = "right";
  g.textBaseline = "middle";
  g.font = `700 ${size * 0.46}px system-ui, sans-serif`;
  g.letterSpacing = `${size * 0.03}px`;
  g.fillText("SQUARE", cx - size * 0.95, cy - size * 0.11);
  g.fillStyle = "#8a8f96";
  g.font = `500 ${size * 0.2}px system-ui, sans-serif`;
  g.letterSpacing = `${size * 0.05}px`;
  g.fillText("PHARMACEUTICALS", cx - size * 0.95, cy + size * 0.24);
  return c.toDataURL("image/png");
});

writeFileSync(
  join(out, "courtesy-by.png"),
  Buffer.from(markUrl.split(",")[1], "base64"),
);
console.log("  ✓ courtesy-by.png");

await browser.close();
console.log("\nSponsor artwork rendered from src/lib/lansod-canvas.ts.");
