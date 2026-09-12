/**
 * Cover colour system.
 *
 * The identity is a three-colour world: porcelain ground, midnight-navy ink,
 * one deep jade. A cover generator that reads `coverHue` straight out of the
 * data produces full-spectrum candy covers (mint, violet, lime), which is the
 * fastest way to break that world.
 *
 * So `coverHue` stops being a hue and becomes a *seed*: it selects one of a
 * small set of hand-mixed schemes, every one of them sampled from the
 * identity's own palette. The data layer is untouched, the catalogue still
 * looks varied, and no cover can ever land outside the design.
 *
 * Schemes are picked deterministically: no Math.random anywhere, so server
 * and client renders always agree.
 */

export interface CoverTheme {
  /** Shown in the admin's cover picker. */
  name: string;
  /** Cover stock. The dominant area of the face. */
  paper: string;
  /** Type colour on `paper`. Always ≥ 7:1 against it. */
  ink: string;
  /** Mid tone for bands, discs and rules. */
  mid: string;
  /** Deepest tone: panels, borders, the darker half of a split cover. */
  deep: string;
  /** Spine stock. Reads as the same bound object as the face. */
  spine: string;
  /** Type colour on `spine` / on `deep` fields. */
  spineInk: string;
  /** True when the scheme is dark-on-light; drives type inversion. */
  light: boolean;
}

/**
 * Eight schemes, spanning the identity's two hues. Two are the identity
 * itself (porcelain + navy, and its inverse); three more sit on the blue side
 * (sky, sapphire, steel); two on the green (jade, verdigris); and one
 * desaturated sand gives a shelf some warm relief so it does not read as a
 * single cool block.
 *
 * The split is deliberate and it is not even: blue outnumbers green four to
 * two, because on a spine green is the rarer, more emphatic stock and a shelf
 * that is half green stops reading as a library. Green earns its place here
 * the way it does everywhere else in the system — by being the thing you
 * notice — and that only works while it stays outnumbered.
 *
 * Sand is the one scheme off both axes, and it is the reason a full shelf
 * reads as a library rather than as a colour swatch. Verdigris is the bridge:
 * the exact blue-green hinge the wordmark's middle stop sits on, desaturated
 * far enough that it never competes with the jade beside it.
 *
 * Note what changed when the accent went green. `mid` on the identity scheme
 * is the accent itself, so scheme 0 now carries a jade rule on navy-on-
 * porcelain — the palette's whole argument on one cover. And indigo is gone:
 * it was a neighbour of the old violet brand stop, and with that stop retired
 * to blue it had nothing left to be a neighbour of.
 *
 * Note what changed about this file's job. In the library this is forked from,
 * most books had no jacket and this palette *was* the face of the card. Here
 * every one of the thirteen renders its real publisher jacket, and those
 * jackets are already blue — Springer's, Wiley-Blackwell's, Thieme's. So these
 * eight are mostly spine stock, the admin picker and the avatar marks, and
 * they are tuned lower in chroma and wider in value than the warm set was,
 * because their job is to sit *beside* photographs rather than replace them.
 */
const themes: readonly CoverTheme[] = [
  // Porcelain stock, navy type, the accent as a rule. The identity, verbatim:
  // blue grounds the cover, green is the one mark that acts on it.
  {
    name: "Porcelain & navy",
    paper: "#e4edf7",
    ink: "#0e2440",
    mid: "#08674b",
    deep: "#12294a",
    spine: "#12294a",
    spineInk: "#e7f0fb",
    light: true,
  },
  // Midnight cover, sky type. The inverse: anchors a grid visually.
  {
    name: "Midnight",
    paper: "#0e1c2e",
    ink: "#dce9f7",
    mid: "#38bdf8",
    deep: "#07111d",
    spine: "#07111d",
    spineInk: "#dce9f7",
    light: false,
  },
  // Sky: the second brand blue used as a field rather than as a detail.
  {
    name: "Sky",
    paper: "#d8e9f7",
    ink: "#10293f",
    mid: "#2b8ccc",
    deep: "#175076",
    spine: "#175076",
    spineInk: "#e6f2fb",
    light: true,
  },
  // Sapphire: the accent itself, as stock.
  {
    name: "Sapphire",
    paper: "#dbe6f6",
    ink: "#101f3a",
    mid: "#2f5fc0",
    deep: "#1c3a7a",
    spine: "#1c3a7a",
    spineInk: "#e8eefb",
    light: true,
  },
  // Steel. Near-neutral; the bound-cloth look.
  {
    name: "Steel",
    paper: "#dfe4ea",
    ink: "#1d242c",
    mid: "#6b7d92",
    deep: "#37424f",
    spine: "#37424f",
    spineInk: "#eef1f5",
    light: true,
  },
  // Jade: the accent as stock. The green counterpart to Sapphire, and the
  // only scheme whose spine is the colour of the site's own buttons.
  {
    name: "Jade",
    paper: "#d8ece1",
    ink: "#0c2a1f",
    mid: "#0b7a56",
    deep: "#0c4733",
    spine: "#0c4733",
    spineInk: "#e6f5ee",
    light: true,
  },
  // Verdigris: the bridge between the two hues. Low chroma so that beside the
  // Jade scheme it reads as the quieter sibling rather than a second green.
  {
    name: "Verdigris",
    paper: "#d9e8e6",
    ink: "#102a28",
    mid: "#3f8c86",
    deep: "#1e4b47",
    spine: "#1e4b47",
    spineInk: "#e8f3f1",
    light: true,
  },
  // Sand: the one warm scheme, and the reason a shelf is not a swatch.
  {
    name: "Sand",
    paper: "#ebe4d8",
    ink: "#2c2418",
    mid: "#a08a63",
    deep: "#4d4130",
    spine: "#4d4130",
    spineInk: "#f3ede2",
    light: true,
  },
];

/** Stable 32-bit hash. Same string in, same layout out, forever. */
function hashOf(seed: string): number {
  let h = 2166136261;
  for (const char of seed) {
    h ^= char.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** All eight schemes, in picker order. */
export const coverSchemes = themes;

const BUCKET = 360 / themes.length;

/**
 * Hue → scheme, in even buckets around the wheel.
 *
 * Deriving the scheme from the hue alone (rather than mixing in the book id)
 * is what makes it *choosable*: the admin's cover picker writes back a hue and
 * gets exactly the scheme it showed. Seed data spread across the wheel still
 * lands on a varied set of schemes.
 */
export function schemeIndexOf(coverHue: number): number {
  const hue = ((coverHue % 360) + 360) % 360;
  return Math.min(themes.length - 1, Math.floor(hue / BUCKET));
}

/** The hue to store for a chosen scheme: the centre of its bucket. */
export function hueForScheme(index: number): number {
  const i = ((index % themes.length) + themes.length) % themes.length;
  return Math.round(i * BUCKET + BUCKET / 2);
}

export function coverTheme(book: { coverHue: number }): CoverTheme {
  return themes[schemeIndexOf(book.coverHue)];
}

/** Cover layout variant, 0-4. Kept separate so art and colour vary apart. */
export function coverVariant(book: { id: string }): number {
  return (hashOf(`${book.id}:layout`) >>> 3) % 5;
}

/**
 * Two-tone pair for non-book chrome: author avatars, category glyphs,
 * admin table markers. Same restricted world as the covers, so an avatar
 * grid can never turn into a rainbow.
 */
const marks: readonly { bg: string; fg: string }[] = [
  { bg: "#dbe7f5", fg: "#12294a" },
  { bg: "#d7e9f6", fg: "#14496b" },
  { bg: "#dde6f6", fg: "#1c3a7a" },
  { bg: "#e3e7ec", fg: "#37424f" },
  { bg: "#d6ecdf", fg: "#0c3b2b" },
  { bg: "#dbe8e6", fg: "#1e4b47" },
  { bg: "#ece5d9", fg: "#4d4130" },
];

export function markTheme(seed: string): { bg: string; fg: string } {
  return marks[hashOf(seed) % marks.length];
}
