/**
 * Builds the raster app icons from the same mark `components/brand.tsx` draws.
 *
 * Run this after editing `BrandArt`: the paths are duplicated here on purpose
 * (a build script cannot import a TSX component) and they will drift silently
 * if only one side is changed.
 *
 *   node scripts/build-icons.mjs
 *
 * Writes `src/app/favicon.ico` (16/32/48) and `src/app/apple-icon.png` (180).
 * `src/app/icon.svg` is authored by hand and is what modern browsers actually
 * use; these two exist for the slots that cannot take an SVG: the legacy
 * favicon request and the iOS home screen.
 *
 * A one-off tool, not part of the build: it leans on the `sharp` that Next
 * already installs rather than adding a dependency for three files that change
 * about as often as the company name. Run it after editing the mark.
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const appDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app");

/** The tile, as in globals.css `.brand-mark`: light-mode brand tokens. */
const tile = (inner, rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <defs><linearGradient id="t" x1="4" y1="0" x2="44" y2="48" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#059669"/><stop offset="0.55" stop-color="#0d9488"/><stop offset="1" stop-color="#1d4ed8"/>
  </linearGradient></defs>
  <rect width="48" height="48" rx="${rx}" fill="url(#t)"/>${inner}</svg>`;

/** The drawing, as in `icon.svg`. */
const mark = (scale, cy) => `<g transform="translate(24 ${cy}) scale(${scale}) translate(-24 -24)">
  <path d="M22.6 24.6c-1.9-2.7-5-4.3-8.5-4.3H9.2A2.2 2.2 0 0 0 7 22.5v12.2c0 1.2 1 2.2 2.2 2.2h5c3.4 0 6.5 1.6 8.4 4.3z" fill="#fff" fill-opacity="0.96"/>
  <path d="M25.4 24.6c1.9-2.7 5-4.3 8.5-4.3h4.9a2.2 2.2 0 0 1 2.2 2.2v12.2c0 1.2-1 2.2-2.2 2.2h-5c-3.4 0-6.5 1.6-8.4 4.3z" fill="#fff" fill-opacity="0.96"/>
  <path d="M27.8 14.6A5.7 5.7 0 0 0 29.4 9.5A6.4 6.4 0 0 0 25.3 5.1A7.2 7.2 0 0 0 18.8 6.5A7.9 7.9 0 0 0 16.4 13.6A8.6 8.6 0 0 0 21.8 19.7" stroke="#fff" stroke-width="2.9" stroke-linecap="round" fill="none"/>
  <circle cx="24" cy="11.4" r="2.5" fill="#fff"/>
</g>`;

/**
 * The same idea redrawn for the tab: heavier boards, a wider gutter, and the
 * coil replaced by a filled form.
 *
 * The coil in the full mark is a 2.9-unit stroke in a 48-unit box. At 16px
 * those units are three to the pixel, so the stroke is under a pixel and the
 * turn it makes is finer still: the curve fuses into itself, the counter fills
 * in, and what is left is a pale blob. Downscaling is not the problem and no
 * amount of anti-aliasing fixes it; the shape is simply finer than the medium.
 *
 * A **filled** shape survives where a stroked one cannot, so the favicon keeps
 * the same reading in a form that has area: a comma — a disc with a tail
 * turning off it — which is the coil said in one gesture instead of one turn.
 * Having to make a separate cut is a property of favicons rather than a fault
 * in the mark; the file this was forked from needed one for the same reason.
 */
const markSmall = `<g>
  <path d="M22.2 27c-2.1-2.9-5.4-4.6-9.1-4.6H7.8A1.8 1.8 0 0 0 6 24.2v13c0 1 .8 1.8 1.8 1.8h5.3c3.7 0 7 1.7 9.1 4.6z" fill="#fff"/>
  <path d="M25.8 27c2.1-2.9 5.4-4.6 9.1-4.6h5.3c1 0 1.8.8 1.8 1.8v13c0 1-.8 1.8-1.8 1.8h-5.3c-3.7 0-7 1.7-9.1 4.6z" fill="#fff"/>
  <path d="M30.2 12.6A6.2 6.2 0 1 0 21.6 18.3C24.6 19.8 28.6 17.9 30.2 12.6Z" fill="#fff"/>
</g>`;

const png = (svg, size) =>
  // A high render density first, then a downscale: rasterising a 48-unit box
  // straight to 16px hands the curves to the SVG renderer's own aliasing,
  // which is worse than sharp's.
  sharp(Buffer.from(svg), { density: 1200 }).resize(size, size).png().toBuffer();

/**
 * A PNG-framed .ico. Every browser and every Windows since Vista reads this;
 * the alternative is a BMP frame with a hand-built AND mask, for the sake of
 * IE 6.
 */
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);

  let offset = 6 + frames.length * 16;
  const dir = frames.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...dir, ...frames.map((f) => f.data)]);
}

const sizes = [16, 32, 48];
const frames = await Promise.all(
  sizes.map(async (size) => ({
    size,
    // The tile's corner radius is a proportion of the tile, so it scales with it.
    data: await png(tile(markSmall, 9), size),
  })),
);
writeFileSync(join(appDir, "favicon.ico"), ico(frames));

// Full bleed and a wider margin: iOS masks its own corners off the artwork,
// and anything near the edge is what it cuts.
writeFileSync(
  join(appDir, "apple-icon.png"),
  await png(tile(mark(0.84, 24.6), 0), 180),
);

console.log(`favicon.ico (${sizes.join(", ")}) + apple-icon.png (180) written`);
