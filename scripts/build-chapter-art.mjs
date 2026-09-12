/**
 * Prepares the six chapter backgrounds for the collection scroll.
 *
 *   node scripts/build-chapter-art.mjs
 *
 * Writes `public/bg/<category-slug>.webp`, all committed, plus
 * `src/lib/data/chapter-art.ts` carrying the credits, because these are other
 * people's photographs under Creative Commons and the attribution is a licence
 * condition, not a courtesy. The generated file is what the About page reads, so
 * a photograph cannot end up on the site without its credit.
 *
 * They are downloaded rather than hotlinked because `next.config.ts` ships a CSP
 * with `img-src 'self' data: blob:` (a remote URL would simply not render), and
 * because a library should not make a request to a third party on every page
 * view.
 *
 * **The treatment matters more than the photographs.** Six stock images of
 * varying quality, dropped in at full colour, would read as six stock images.
 * Each one here is collapsed to luminance and then mapped through the site's own
 * navy-to-sky ramp as a two-colour duotone, so they arrive as one set in one
 * palette: the photograph supplies the composition and every tone comes from the
 * design. It is also why the licensing risk is low and the weight is ~50 KB each.
 *
 * Sources are cached under `.cache/chapter-art/`, ignored by git. The treatment
 * is the part that gets iterated on, and re-downloading six originals from a
 * rate-limited host to change a curve is a good way to get locked out.
 *
 * Commons rate-limits an unauthenticated client hard and answers with an HTML
 * scolding rather than an error status, so requests are spaced and retried; a
 * "unsupported image format" from sharp here almost always means the body was
 * that scolding.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "bg");
const creditsFile = join(root, "src", "lib", "data", "chapter-art.ts");
const cacheDir = join(root, ".cache", "chapter-art");
mkdirSync(outDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });

const UA = "gastroenterology-book-bank/1.0 (an educational library; one-off asset build)";
const API = "https://commons.wikimedia.org/w/api.php";

/**
 * One plate per chapter, chosen by hand.
 *
 * Chosen by hand for the same reason the library this was forked from chose
 * its photographs by hand: searching Commons for "stomach" and taking the top
 * result gives you a diagram from 1918, a photograph of a cow's abomasum and a
 * surgical specimen in a tray. The search finds candidates and is useless for
 * choosing between them.
 *
 * All seven are Scientific Animations renders, CC BY-SA 4.0, natively
 * 1920x1080 — a 1:1 match for the output with no resampling at all, which is
 * better than upstream managed, where 3840px photographs were thrown away in a
 * downsample.
 *
 * **The selection rule that did most of the work here: no burnt-in labels.**
 * Most medical renders on Commons are teaching illustrations and carry their
 * own type — "Esophagus", "Hepatic Hilum", "ASCENDING COLON" — with leader
 * lines reaching into the organ. Behind a chapter heading that is a second
 * typeface arguing with the site's own, and it does not blur away: it stays
 * legible and reads as a mistake. Blausen's library is larger and higher
 * resolution and was ruled out almost entirely for this reason. Where a plate
 * is otherwise right and its labels are confined to one edge, `box` crops past
 * them; where they are scattered, the plate was replaced rather than cropped
 * tighter and tighter, which is a game you lose.
 *
 * `invert` remains for a source on a white ground: mapped through the same ramp
 * such a plate comes out pale with a dark organ on it, the opposite of the set
 * it is meant to join, so the luminance is flipped before the duotone. Nothing
 * in the current seven needs it; it is kept because the next addition might.
 *
 * **Share-alike.** Most of these are CC BY-SA 4.0, so the duotoned derivative
 * inherits it: `public/bg/*.webp` built from those sources are themselves
 * CC BY-SA 4.0. The credits this script generates are a licence condition and
 * not a courtesy, which is why `src/lib/data/chapter-art.ts` is generated here
 * rather than written by hand — and why the About page now renders it.
 */
const CHAPTERS = [
  {
    /* The whole small bowel with its mesentery: the one plate in the set that
       reads as "the tract" rather than as a single organ, which is what a
       general reference shelf wants behind it. */
    slug: "bedside-reference",
    file:
      "File:Mesentery extending from the duodenojejunal flexure to the " +
      "ileocecal junction..jpg", // the doubled period is in the real title
    focus: { x: 0.5, y: 0.48 },
    zoom: 1,
  },
  {
    /* Digestion begins at the mouth, and a revision shelf is not organ-specific
       anyway. Chosen for being the most abstract plate available once the
       labelled ones were ruled out. */
    slug: "exam-revision",
    file: "File:Salivary Gland.jpg",
    focus: { x: 0.42, y: 0.48 },
    zoom: 1.05,
  },
  {
    slug: "reflux-upper-gut",
    file: "File:3D Medical Animation Stomach Structure.jpg",
    focus: { x: 0.4, y: 0.5 },
    zoom: 1,
    // The leader lines and their labels run down the right third.
    box: { left: 0.0, top: 0.04, width: 0.58, height: 0.92 },
  },
  {
    slug: "liver-bile-pancreas",
    file: "File:Gallbladder stones.jpg",
    focus: { x: 0.46, y: 0.5 },
    zoom: 1.02,
  },
  {
    slug: "endoscopy-imaging",
    file: "File:Irritable bowel syndrome.jpg",
    focus: { x: 0.5, y: 0.46 },
    zoom: 1.08,
  },
  {
    slug: "gut-cancer",
    file: "File:3D Medical Animation Acute Pancreatitis.jpg",
    focus: { x: 0.44, y: 0.5 },
    zoom: 1.04,
  },
  {
    /* Coeliac disease, and the villus surface it flattens — the paediatric
       malabsorption diagnosis, behind the paediatric shelf. */
    slug: "children-digestive-health",
    file:
      "File:Inflammed mucous layer of the intestinal villi depicting " +
      "Celiac disease.jpg", // "Inflammed" is the uploader's spelling
    focus: { x: 0.46, y: 0.52 },
    zoom: 1.16,
  },
];

/** 16:9 at a size that survives a 2× display on a full-bleed panel. */
const WIDTH = 1920;
const HEIGHT = 1080;

/**
 * The duotone ramp: the site's own ink and sky, as a per-channel straight
 * line. Black in the photograph becomes `SHADOW`, white becomes `HIGHLIGHT`,
 * and everything between interpolates, which is what makes six unrelated
 * photographs read as one set rather than six.
 *
 * `SHADOW` is `--ink` (#12294a) and `HIGHLIGHT` sits just above the page's
 * palest blue, so a background never goes darker than the body text or
 * lighter than the page.
 *
 * Neither end is pure black or pure white: a duotone that bottoms out at #000
 * reads as a hole punched in the page rather than as a photograph behind it.
 *
 * Both ends are blue on purpose. Green is the palette's acting colour and these
 * plates are the furthest thing on the page from a control — they are the room
 * the chapters stand in — so the duotone is drawn entirely from the grounding
 * hue and never touches the accent.
 */
const SHADOW = { r: 0x12, g: 0x29, b: 0x4a };
const HIGHLIGHT = { r: 0xe2, g: 0xee, b: 0xfb };
const DUOTONE = {
  slope: ["r", "g", "b"].map((c) => (HIGHLIGHT[c] - SHADOW[c]) / 255),
  intercept: ["r", "g", "b"].map((c) => SHADOW[c]),
};

async function commons(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    await new Promise((r) => setTimeout(r, attempt === 0 ? 900 : 2500 * attempt));
    try {
      const response = await fetch(url, { headers: { "User-Agent": UA } });
      const body = await response.text();
      if (body.startsWith("{")) return JSON.parse(body);
    } catch {
      // Commons occasionally answers on an unreachable IPv6 address. Retried.
    }
  }
  throw new Error("Commons would not answer (rate limit?)");
}

/**
 * Downloads an original, or returns the copy already on disk.
 *
 * **Keyed on the Commons file name, not on the chapter slug.** Keying it on the
 * slug — which is what this did originally — means that reassigning a chapter
 * to a different photograph silently re-treats the old one: the script reports
 * seven successes, the credits file updates to name the new source, and the
 * seven images on disk are the previous set. That failure is invisible unless
 * you happen to look at the pictures, and it cost an iteration to find.
 */
async function fetchImage(url, cacheKey) {
  const cached = join(cacheDir, `${cacheKey.replace(/[^a-z0-9]+/gi, "-").slice(0, 120)}.bin`);
  if (existsSync(cached)) return readFileSync(cached);

  for (let attempt = 0; attempt < 5; attempt++) {
    await new Promise((r) => setTimeout(r, attempt === 0 ? 900 : 2500 * attempt));
    try {
      const response = await fetch(url, { headers: { "User-Agent": UA } });
      const buffer = Buffer.from(await response.arrayBuffer());
      // A rate-limit page is HTML and starts "<"; a JPEG starts 0xFFD8.
      const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      const png = buffer[0] === 0x89 && buffer[1] === 0x50;
      if (jpeg || png) {
        writeFileSync(cached, buffer);
        return buffer;
      }
    } catch {
      // Retried.
    }
  }
  throw new Error("could not download the image");
}

const credits = [];

for (const chapter of CHAPTERS) {
  const data = await commons({
    action: "query",
    titles: chapter.file,
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: String(WIDTH * 1.4),
  });
  const page = Object.values(data?.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) {
    console.error(`  ✗ ${chapter.slug}: not found on Commons`);
    continue;
  }

  const meta = info.extmetadata ?? {};
  const strip = (value) =>
    (value ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

  const source = await fetchImage(info.thumburl ?? info.url, chapter.file);

  /* --- The treatment ---------------------------------------------------- *
   * 1. Cover-crop to 16:9 around the focus point.
   * 2. Collapse to luminance, so the photograph's own colour cast cannot fight
   *    the palette. A gentle blur here too: these sit behind large display type
   *    and any detail sharper than the text competes with it.
   * 3. Map that luminance through the duotone ramp: see `duotone` below.
   *
   * Note what is *not* used: `.greyscale().tint(…)`. `greyscale` sets the output
   * colourspace to single-channel `b-w`, and sharp applies that at the end of
   * the pipeline regardless of the order the calls were made in, so the tint is
   * computed and then thrown away, and you get six grey photographs with no
   * error to tell you why. Hence the two passes, with an explicit
   * `toColourspace("srgb")` between them.
   * -------------------------------------------------------------------- */
  // sharp's `position` takes gravity keywords, not percentages, so the focus
  // crop is computed here: take the largest 16:9 window that fits, then slide
  // it so the focus point sits at its centre, clamped to the frame.
  const meta0 = await sharp(source).metadata();

  // `box` short-circuits the focus arithmetic below. It exists because several
  // of these renders carry burnt-in labels and leader lines in a band that a
  // 16:9 window centred on a focus point will happily include: the crop has to
  // be stated, not inferred. Fractions of the source, so it survives a
  // different thumbnail width.
  const window = chapter.box
    ? {
        left: Math.round(chapter.box.left * meta0.width),
        top: Math.round(chapter.box.top * meta0.height),
        width: Math.round(chapter.box.width * meta0.width),
        height: Math.round(chapter.box.height * meta0.height),
      }
    : null;

  const targetRatio = WIDTH / HEIGHT;
  const sourceRatio = meta0.width / meta0.height;
  const zoom = Math.max(1, chapter.zoom ?? 1);
  const cropWidth = Math.round(
    (sourceRatio > targetRatio ? meta0.height * targetRatio : meta0.width) / zoom,
  );
  const cropHeight = Math.round(
    (sourceRatio > targetRatio ? meta0.height : meta0.width / targetRatio) / zoom,
  );
  const left = Math.max(
    0,
    Math.min(meta0.width - cropWidth, Math.round(chapter.focus.x * meta0.width - cropWidth / 2)),
  );
  const top = Math.max(
    0,
    Math.min(meta0.height - cropHeight, Math.round(chapter.focus.y * meta0.height - cropHeight / 2)),
  );

  let pipeline = sharp(source)
    .extract(window ?? { left, top, width: cropWidth, height: cropHeight })
    .resize(WIDTH, HEIGHT, { kernel: "lanczos3" })
    .greyscale();

  // A render on a white ground and a render on a black one are the same
  // drawing with the ramp applied at opposite ends. Flipping the luminance
  // here, rather than giving the source its own ramp, is what keeps them one
  // set: the ramp stays a property of the site and the ground stays a property
  // of the file.
  if (chapter.invert) pipeline = pipeline.negate({ alpha: false });

  const luminance = await pipeline
    .blur(1.6)
    .png({ compressionLevel: 0 })
    .toBuffer();

  const written = await sharp(luminance)
    .toColourspace("srgb")
    .linear(DUOTONE.slope, DUOTONE.intercept)
    .webp({ quality: 76, effort: 6 })
    .toFile(join(outDir, `${chapter.slug}.webp`));

  credits.push({
    slug: chapter.slug,
    title: strip(page.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, "")),
    artist: strip(meta.Artist?.value) || "Unknown",
    license: strip(meta.LicenseShortName?.value) || "see source",
    sourceUrl: info.descriptionurl,
  });

  console.log(
    `  ✓ ${chapter.slug}.webp  ${(written.size / 1024).toFixed(0)} KB  ` +
      `(${credits.at(-1).license}, ${credits.at(-1).artist.slice(0, 32)})`,
  );
}

const ts = `/**
 * Credits for the chapter backgrounds.
 *
 * Generated by \`scripts/build-chapter-art.mjs\`; do not hand-edit. These are
 * other people's photographs under Creative Commons, and attribution is a
 * condition of those licences rather than a courtesy, so the credits are a
 * module the About page imports, which means a photograph cannot reach the site
 * without one.
 */

export interface ChapterArt {
  /** Category slug: the join to \`public/bg/<slug>.webp\`. */
  slug: string;
  title: string;
  artist: string;
  license: string;
  sourceUrl: string;
}

export const chapterArt: readonly ChapterArt[] = ${JSON.stringify(credits, null, 2)
  .replace(/"([a-zA-Z]+)":/g, "$1:")
  .replace(/"/g, '"')};

export function artFor(slug: string): ChapterArt | undefined {
  return chapterArt.find((art) => art.slug === slug);
}
`;
writeFileSync(creditsFile, ts, "utf8");
console.log(`\n${credits.length} chapter backgrounds written, credits in src/lib/data/chapter-art.ts`);
