/**
 * Builds the seven subject plates for the subject-wise catalogue.
 *
 *   node scripts/build-subject-art.mjs                 # all seven
 *   node scripts/build-subject-art.mjs obstetrics      # one, or a few
 *
 * Output: `public/subjects/<subject-slug>.webp`, 1600×900, committed.
 *
 * **Why these are drawn rather than photographed.** The chapter backgrounds in
 * `build-chapter-art.mjs` are Creative Commons photographs, and each one costs a
 * credit line the About page has to carry. A subject plate is a smaller job —
 * it sits behind a heading and says "this is the gynaecology shelf" — and seven
 * more people's photographs is seven more licences to keep straight for a panel
 * nobody will look at twice. These are generated from an SVG instead: no
 * licence, no network, no credit, and the same file every time it is built.
 *
 * **They still have to look like the same set as the photographs.** So the
 * treatment is deliberately identical: the composition is drawn in greyscale,
 * blurred, and then mapped through the *same* navy-to-sky duotone ramp
 * (`SHADOW` → `HIGHLIGHT`) that the chapter art uses. A subject plate and a
 * chapter background sitting on the same page are two images from one palette,
 * which is the only reason a drawn panel can sit next to a photographed one
 * without looking like a placeholder.
 *
 * Each subject gets its own motif and its own seeded field of soft forms, so
 * the seven read as variations rather than as one gradient recoloured seven
 * times. The seed is the slug, so the art is deterministic: rebuilding does not
 * produce a diff.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "subjects");
mkdirSync(outDir, { recursive: true });

/**
 * The drawing space. Every coordinate in `motifs` below is in these units, so
 * this is a design grid rather than an output size — leave it alone.
 */
const WIDTH = 1600;
const HEIGHT = 900;

/**
 * The raster size, which is a different question.
 *
 * These plates are used full-bleed behind a subject heading, and the source is
 * an SVG: there is no original to run out of, so resolution here costs nothing
 * but a few kilobytes of WebP. Rendering above the drawing grid is why a drawn
 * plate can sit beside a photographed one on the same page without being the
 * soft one.
 */
const OUT_WIDTH = 2048;
const OUT_HEIGHT = 1152;

/**
 * The duotone ramp, copied deliberately from `build-chapter-art.mjs`.
 *
 * Not imported: that script is a one-off asset build that talks to Wikimedia,
 * and importing it would run its download. Two constants that must agree are
 * cheaper to keep in step than a shared module neither script wants.
 */
const SHADOW = { r: 0x12, g: 0x29, b: 0x4a };
const HIGHLIGHT = { r: 0xe2, g: 0xee, b: 0xfb };
const DUOTONE = {
  slope: ["r", "g", "b"].map((c) => (HIGHLIGHT[c] - SHADOW[c]) / 255),
  intercept: ["r", "g", "b"].map((c) => SHADOW[c]),
};

/**
 * Deterministic PRNG (mulberry32) seeded from the slug.
 *
 * `Math.random` here would mean every rebuild rewrites all seven WebPs with
 * visually identical but byte-different art, which turns "add a subject" into a
 * seven-file diff. Seeding from the slug makes the art a pure function of the
 * subject.
 */
function rng(slug) {
  let h = 1779033703 ^ slug.length;
  for (let i = 0; i < slug.length; i++) {
    h = Math.imul(h ^ slug.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The motifs.
 *
 * Each is a greyscale SVG fragment: light means highlight once the duotone is
 * applied, dark means ink. They are abstractions of the subject rather than
 * pictures of it — a lumen receding, hepatic lobules, a peristaltic wave —
 * because a literal illustration at this size becomes clip-art, and clip-art
 * is worse than a gradient.
 *
 * `next` is the seeded RNG, so a motif can vary without becoming random.
 */
const motifs = {
  /**
   * The lumen, seen down a scope: concentric rings receding to a point, each
   * one smaller and fainter than the last. The centre is left dark because
   * that is what you are looking at when you look down a bowel — not a wall,
   * a hole.
   */
  "luminal-gastroenterology"(next) {
    let d = "";
    const cx = 1140;
    const cy = 460;
    for (let i = 0; i < 11; i++) {
      const r = 44 + i * i * 5.4 + next() * 10;
      // Each ring drifts a little off the last, so the tube bends away rather
      // than pointing straight at the reader.
      const ox = cx + i * 9 * (next() - 0.3);
      const oy = cy + i * 6 * (next() - 0.5);
      d += `<ellipse cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.86).toFixed(1)}" fill="none" stroke="#fff" stroke-opacity="${(0.5 - i * 0.038).toFixed(3)}" stroke-width="${(3.6 - i * 0.22).toFixed(2)}"/>`;
    }
    return d;
  },

  /** Hepatic lobules: tessellated hexagons at three scales, as in a section. */
  hepatology(next) {
    let d = "";
    const hex = (cx, cy, r, o, w) => {
      const pts = [];
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k - Math.PI / 6;
        pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
      }
      return `<polygon points="${pts.join(" ")}" fill="none" stroke="#fff" stroke-opacity="${o}" stroke-width="${w}"/>`;
    };
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        const r = 66 + next() * 10;
        const cx = 880 + col * r * 1.72 + (row % 2 ? r * 0.86 : 0);
        const cy = 200 + row * r * 1.5;
        if (cx > 1560) continue;
        d += hex(cx, cy, r, (0.42 - row * 0.045).toFixed(3), 2.4);
        // The central vein each lobule drains into.
        d += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.17).toFixed(1)}" fill="#fff" fill-opacity="${(0.3 - row * 0.04).toFixed(3)}"/>`;
      }
    }
    return d;
  },

  /**
   * A peristaltic wave train: a sine under a travelling envelope, so the
   * contraction reads as moving down the tube rather than as a graph. The same
   * construction the obstetric version of this file used for a CTG trace, for
   * the same reason — one line that is obviously a recording.
   */
  "neurogastroenterology-motility"(next) {
    const baseline = 470;
    let d = "";
    for (let pass = 0; pass < 3; pass++) {
      let path = `M 240 ${baseline}`;
      for (let x = 240; x <= 1500; x += 16) {
        const t = (x - 240) / 1260;
        const envelope = Math.exp(-(((t - (0.3 + pass * 0.2)) / 0.26) ** 2));
        const y =
          baseline +
          Math.sin((x + pass * 110) / 54) * (26 + 78 * envelope) +
          Math.sin(x / 19) * 6 * next();
        path += ` L ${x} ${y.toFixed(1)}`;
      }
      d += `<path d="${path}" fill="none" stroke="#fff" stroke-opacity="${(0.5 - pass * 0.13).toFixed(3)}" stroke-width="${(3.2 - pass * 0.7).toFixed(2)}" stroke-linecap="round"/>`;
    }
    return d;
  },

  /** Haustral folds: the sacculations that make a colon look like a colon. */
  "gastrointestinal-endoscopy"(next) {
    let d = "";
    // One spine, drawn as a bezier, with folds stepped off its normal.
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = 300 + t * 1180;
      const y = 460 + Math.sin(t * Math.PI * 1.6) * 190 + Math.sin(t * 9) * 12;
      pts.push([x, y]);
    }
    d += `<path d="M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")}" fill="none" stroke="#fff" stroke-opacity="0.34" stroke-width="3"/>`;
    for (let i = 2; i < pts.length - 2; i += 2) {
      const [x, y] = pts[i];
      const [px, py] = pts[i - 1];
      const [nx, ny] = pts[i + 1];
      const dx = nx - px;
      const dy = ny - py;
      const len = Math.hypot(dx, dy) || 1;
      const h = 62 + next() * 28;
      const ux = (-dy / len) * h;
      const uy = (dx / len) * h;
      d += `<path d="M ${(x - ux).toFixed(1)} ${(y - uy).toFixed(1)} Q ${x.toFixed(1)} ${y.toFixed(1)} ${(x + ux).toFixed(1)} ${(y + uy).toFixed(1)}" fill="none" stroke="#fff" stroke-opacity="${(0.44 - i * 0.006).toFixed(3)}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    return d;
  },

  /** A film grid: the light box a reporting list used to arrive on. */
  "gastrointestinal-radiology"(next) {
    let d = "";
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const x = 820 + col * 190;
        const y = 175 + row * 208;
        const w = 168;
        const h = 186;
        d += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#fff" stroke-opacity="${(0.4 - row * 0.06).toFixed(3)}" stroke-width="2.2"/>`;
        // A soft form inside each frame: something is on every film.
        const r = 28 + next() * 34;
        d += `<circle cx="${(x + w / 2 + (next() - 0.5) * 40).toFixed(1)}" cy="${(y + h / 2 + (next() - 0.5) * 46).toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" fill-opacity="${(0.16 + next() * 0.12).toFixed(3)}"/>`;
      }
    }
    return d;
  },

  /**
   * A polyp as a contour map: stacked irregular closed forms, each inside the
   * last. Staging is depth, and a topographic section is the one abstraction
   * that says depth without drawing a tumour.
   */
  "gastrointestinal-oncology"(next) {
    let d = "";
    const cx = 1150;
    const cy = 470;
    for (let i = 0; i < 8; i++) {
      const base = 300 - i * 34;
      const pts = [];
      for (let k = 0; k < 26; k++) {
        const a = (Math.PI * 2 * k) / 26;
        const r = base * (0.82 + 0.3 * Math.sin(a * 3 + i * 0.7) + next() * 0.06);
        pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a) * 0.86).toFixed(1)}`);
      }
      d += `<polygon points="${pts.join(" ")}" fill="none" stroke="#fff" stroke-opacity="${(0.46 - i * 0.045).toFixed(3)}" stroke-width="${(2.8 - i * 0.16).toFixed(2)}"/>`;
    }
    return d;
  },

  /**
   * A villus field: rows of soft finger-forms at varying phase. It is the
   * surface absorption actually happens across, which is the thing paediatric
   * gastroenterology spends most of its time worrying about.
   */
  "paediatric-gastroenterology"(next) {
    let d = "";
    for (let row = 0; row < 3; row++) {
      const baseY = 700 - row * 120;
      const o = (0.44 - row * 0.1).toFixed(3);
      for (let i = 0; i < 16; i++) {
        const x = 790 + i * 52 + next() * 14;
        const h = 150 + next() * 110 - row * 18;
        const w = 17 + next() * 8;
        d +=
          `<path d="M ${(x - w).toFixed(1)} ${baseY} ` +
          `C ${(x - w).toFixed(1)} ${(baseY - h).toFixed(1)} ` +
          `${(x + w).toFixed(1)} ${(baseY - h).toFixed(1)} ` +
          `${(x + w).toFixed(1)} ${baseY} Z" ` +
          `fill="none" stroke="#fff" stroke-opacity="${o}" stroke-width="2.3"/>`;
      }
    }
    return d;
  },
};

/**
 * The ground the motif sits on: a soft field of blurred blobs, seeded.
 *
 * Without it a motif floats on a flat wash and reads as a diagram. The blobs
 * give the plate the tonal variation a photograph would have supplied, which is
 * what the duotone needs to have something to interpolate between.
 */
function ground(next) {
  let d = "";
  for (let i = 0; i < 9; i++) {
    const cx = next() * WIDTH;
    const cy = next() * HEIGHT;
    const r = 190 + next() * 330;
    const light = next() > 0.45;
    d += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${light ? "#fff" : "#000"}" fill-opacity="${(0.05 + next() * 0.1).toFixed(3)}"/>`;
  }
  return d;
}

/**
 * The plate, in greyscale.
 *
 * Mid-grey base rather than black or white: the duotone maps 0→ink and
 * 255→sky, so a plate drawn around the middle of the range lands in the
 * middle of the palette, where a heading can sit on it in either theme.
 */
function svg(slug, next) {
  const motif = motifs[slug];
  if (!motif) throw new Error(`No motif for subject: ${slug}`);
  const tilt = (next() * 24 - 12).toFixed(1);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OUT_WIDTH}" height="${OUT_HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6f6f6f"/>
      <stop offset="0.55" stop-color="#9a9a9a"/>
      <stop offset="1" stop-color="#d2d2d2"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
  <g transform="rotate(${tilt} ${WIDTH / 2} ${HEIGHT / 2})">${ground(next)}</g>
  <g>${motif(next)}</g>
</svg>`;
}

const slugs = Object.keys(motifs);
const only = process.argv.slice(2);
const targets = only.length ? only : slugs;

for (const slug of targets) {
  if (!motifs[slug]) {
    console.error(`  ✗ ${slug} — no motif; known: ${slugs.join(", ")}`);
    process.exitCode = 1;
    continue;
  }
  const next = rng(slug);

  // Two passes, and the order matters, exactly as in `build-chapter-art.mjs`:
  // `greyscale()` sets the output colourspace for the whole pipeline whenever it
  // appears, so the duotone has to happen to an already-rendered buffer.
  const grey = await sharp(Buffer.from(svg(slug, next)))
    .greyscale()
    .blur((2.2 * OUT_WIDTH) / WIDTH)
    .png({ compressionLevel: 0 })
    .toBuffer();

  const written = await sharp(grey)
    .toColourspace("srgb")
    .linear(DUOTONE.slope, DUOTONE.intercept)
    .webp({ quality: 80, effort: 6 })
    .toFile(join(outDir, `${slug}.webp`));

  console.log(`  ✓ ${slug}.webp  ${(written.size / 1024).toFixed(0)} KB`);
}

console.log(`\n${targets.length} subject plates written to public/subjects/.`);
