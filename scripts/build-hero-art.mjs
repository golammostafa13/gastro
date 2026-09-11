/**
 * Prepares the cinematic hero plates.
 *
 *   node scripts/build-hero-art.mjs
 *
 * Writes `public/hero/<n>-<slug>.webp`: four wide plates that cross-dissolve
 * behind the wordmark on the home page, with a slow push on each. Together they
 * are the "footage": there is no video file, and there should not be. A hero
 * video that reads as premium is several megabytes before it says anything, has
 * to be licensed for the purpose, and cannot be served from a CSP that only
 * allows `self` without shipping it in the repository. Four still plates with a
 * Ken Burns push and a long dissolve is what these sites actually look like
 * frame to frame, at ~120 KB each.
 *
 * The treatment is deliberately *not* the one in `build-chapter-art.mjs`. Those
 * plates sit behind body copy at low contrast and are blurred so they cannot
 * compete with it. These are the subject: darker, richer, no blur, and mapped
 * to a much deeper end of the navy ramp so light type sits over them the way it
 * does over a cinema frame. Same photographs, opposite job.
 *
 * Sources come from the cache `build-chapter-art.mjs` fills, so this does not
 * touch the network. Run that first on a clean checkout.
 *
 * The upscale here is 1920 → 2400, where upstream downsampled from 3840, and
 * that is acceptable for these sources specifically: they are synthetic
 * renders with no film grain, no sensor noise and no detail above their own
 * antialiasing, so Lanczos has nothing to invent. The plate is also scaled past
 * 1:1 by the Ken Burns push for its whole visible life. Do not read this as a
 * general licence to upscale a photograph.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = join(root, ".cache", "chapter-art");
const outDir = join(root, "public", "hero");
mkdirSync(outDir, { recursive: true });

/**
 * The four, in the order they play.
 *
 * An arc rather than four pictures: the whole tract, the organ the sponsor's
 * drug acts on, the surface absorption happens across, and the gland behind it
 * all. It moves inward, which is the one thing a sequence of anatomy can do
 * that a single plate cannot.
 *
 * `file` names the Commons source directly. Upstream this list carried only a
 * slug and read `<slug>.bin` out of the cache, which tied a hero plate to a
 * chapter background for no reason other than that they happened to share a
 * photograph — and broke silently the moment a chapter was reassigned. Naming
 * the file is what the cache is keyed on now, so the two lists are independent
 * and a hero plate can be changed without touching a chapter.
 *
 * The colonoscopy and the coeliac macro are deliberately not here. One is a
 * procedure and the other a diagnosis, and a library should not open on either.
 */
const PLATES = [
  {
    slug: "gi-tract",
    file:
      "File:Mesentery extending from the duodenojejunal flexure to the " +
      "ileocecal junction..jpg",
    focus: { x: 0.5, y: 0.48 },
  },
  {
    slug: "stomach",
    file: "File:3D Medical Animation Stomach Structure.jpg",
    focus: { x: 0.36, y: 0.5 },
    zoom: 1.25,
  },
  {
    slug: "abdomen",
    file: "File:Irritable bowel syndrome.jpg",
    focus: { x: 0.5, y: 0.46 },
    zoom: 1.1,
  },
  {
    slug: "liver",
    file: "File:Gallbladder stones.jpg",
    focus: { x: 0.46, y: 0.5 },
    zoom: 1.06,
  },
];

/** 16:9, and large enough that a 1.12 push on a 2560px display still resolves. */
const WIDTH = 2400;
const HEIGHT = 1350;

/**
 * The cinema ramp. Far deeper than the chapter one: black goes to a near-black
 * navy rather than to the body-text colour, and white stops well short of the
 * page so the plate never has a blown-out area for type to disappear into.
 */
const SHADOW = { r: 0x06, g: 0x14, b: 0x26 };
const HIGHLIGHT = { r: 0xb9, g: 0xde, b: 0xf5 };
const DUOTONE = {
  slope: ["r", "g", "b"].map((c) => (HIGHLIGHT[c] - SHADOW[c]) / 255),
  intercept: ["r", "g", "b"].map((c) => SHADOW[c]),
};

/** Must match the cache key `build-chapter-art.mjs` writes. */
const cacheName = (file) => `${file.replace(/[^a-z0-9]+/gi, "-").slice(0, 120)}.bin`;

for (const [i, plate] of PLATES.entries()) {
  const source = join(cacheDir, cacheName(plate.file));
  if (!existsSync(source)) {
    console.error(
      `  ✗ ${plate.slug}: ${plate.file} is not cached; ` +
        `add it to build-chapter-art.mjs and run that first`,
    );
    process.exitCode = 1;
    continue;
  }
  const buffer = readFileSync(source);
  const meta = await sharp(buffer).metadata();

  const target = WIDTH / HEIGHT;
  const ratio = meta.width / meta.height;
  const zoom = Math.max(1, plate.zoom ?? 1);
  const cw = Math.round((ratio > target ? meta.height * target : meta.width) / zoom);
  const ch = Math.round((ratio > target ? meta.height : meta.width / target) / zoom);
  const left = Math.max(0, Math.min(meta.width - cw, Math.round(plate.focus.x * meta.width - cw / 2)));
  const top = Math.max(0, Math.min(meta.height - ch, Math.round(plate.focus.y * meta.height - ch / 2)));

  // Two passes for the same reason as the chapter plates: `greyscale` forces a
  // single-channel output colourspace at the end of the pipeline, which would
  // discard the duotone silently. See the note in build-chapter-art.mjs.
  const luminance = await sharp(buffer)
    .extract({ left, top, width: cw, height: ch })
    .resize(WIDTH, HEIGHT, { kernel: "lanczos3" })
    .greyscale()
    // A little more contrast before the map, so the plate has somewhere to be
    // dark. A flat photograph mapped onto a wide ramp comes out as a wash.
    //
    // Gentler than the 1.12/-16 this was set to for photographs. A 3D render
    // arrives with a hard black background and blown speculars already, so the
    // stronger curve had nothing left to recover and simply crushed the
    // organ's midtones.
    .linear(1.06, -10)
    .png({ compressionLevel: 0 })
    .toBuffer();

  const name = `${i + 1}-${plate.slug}.webp`;
  const written = await sharp(luminance)
    .toColourspace("srgb")
    .linear(DUOTONE.slope, DUOTONE.intercept)
    .webp({ quality: 80, effort: 6 })
    .toFile(join(outDir, name));

  console.log(`  ✓ ${name}  ${(written.size / 1024).toFixed(0)} KB  ${WIDTH}×${HEIGHT}`);
}

console.log(`\nCredits are already carried by src/lib/data/chapter-art.ts (same photographs).`);
