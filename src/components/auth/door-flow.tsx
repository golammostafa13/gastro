/**
 * The light behind the door.
 *
 * `/` lands on sign-in and there is no way past it, so this is the first thing
 * anyone sees of the library — and until now it was a form on blush paper. The
 * rest of the site opens on a cinema band; the door should read as the same
 * production, and the way to do that without a photograph is light.
 *
 * This is the light and nothing else: six soft ribbons of the brand jade at
 * four depths, which are the room the type stands in. It covers the **whole
 * window**, both halves, and that is the answer to the only thing that was
 * wrong with the split.
 *
 * It covered the panel alone for a while, and the stage beside it was lit by a
 * ground of its own. Two grounds, however carefully matched, are two grounds:
 * the light stopped at the middle of the window, the alcove's floor was an
 * opaque rectangle ending at the same place, and what a reader saw down the
 * centre of the page was a division. Neither half was improved by it. One
 * field, laid under everything, and the halves are what the light does rather
 * than where it ends — see `.door__stage-ground`, which is now a halo behind
 * the figure and nothing else, and the note in the auth layout.
 *
 * There used to be objects in this field: first a drifting villus drawn as SVG,
 * then the gastrointestinal tract in WebGL at a third of its opacity. Both were
 * here for the same reason — a wash cannot be watched, and the middle of this
 * page was blank space with nothing in it to look at — and both are gone from
 * this file because the answer turned out to be a bigger one than a background.
 * The tract has half the window now (`DoorStage`), which is what let it stop
 * being a watermark and start being the subject. What is left here is what was
 * always doing the work: the light.
 *
 * Three things make the plumes read as a lit room rather than as coloured blobs:
 *
 *   • **The silhouette.** Each plume is an asymmetric leaf (mismatched corner
 *     radii on both axes), not a circle. Blurred hard, a circle stays a bokeh
 *     dot and the leaf's long edge tapers off into nothing — which is what a
 *     feather of light looks like.
 *   • **The depth.** `--z` is a real translation under the container's own
 *     `perspective`, so the far plumes are smaller *because they are further
 *     away*, and they lose contrast and focus to match. Hand-picking a smaller
 *     width instead just gives you a small plume at the same distance.
 *   • **The drift.** Slow, out of phase, and never repeating the same pose at
 *     the same time, so the field never reads as a loop.
 *
 * Server Component, no canvas, no image: the whole field is six spans and a
 * gradient, and it ships nothing to the client but markup. Same argument as
 * `hero-cinematic` — a WebGL aurora would cost a bundle and a main-thread
 * budget to say something the compositor can say for free. The one canvas at
 * this door is next door, and it earns its place by drawing the thing CSS
 * cannot: an object with a recognisable silhouette, seen from a moving angle.
 *
 * `aria-hidden`, and `pointer-events: none` in the stylesheet: there is exactly
 * one thing to do on this half of the door and a plume must never be able to
 * swallow the click meant for the password field. (That bug already exists once
 * on this page in the shape of the intro curtain, which is a fixed overlay by
 * design; it does not need a second cause.)
 */

interface Plume {
  /** Stable key; also a note to the reader of what each plume is doing. */
  id: string;
  /** Position and size of the resting box. */
  x: string;
  y: string;
  w: string;
  h: string;
  /** Depth, under the field's shared camera. Negative is further away. */
  z: string;
  /** Resting rotation; the drift rides on top of it. */
  tilt: string;
  /** Blur radius. Further plumes are softer — aerial perspective, in one value. */
  soft: string;
  /** Resting opacity, before the per-theme glow scalar. */
  dim: number;
  /** Which green. Three tokens rather than one, so the field has range in it. */
  tint: string;
  /** Travel and spin at the far end of the drift. */
  dx: string;
  dy: string;
  spin: string;
  /** Timing. Coprime-ish durations, so the six never re-align. */
  dur: string;
  delay: string;
}

/**
 * Read this as a lighting plot, not a list of decorations.
 *
 * The key light is the big plume top-left, because that is where the key light
 * is in every other 3D block on the site (the books, the catalogue tiles, the
 * card bevel below). `fill` warms the foot of the page so the card is not
 * standing on nothing, and the two `far` plumes exist to be out of focus — a
 * field where everything is equally sharp has no depth in it.
 *
 * Every `x` and `w` below was re-read when the field went full-bleed: they are
 * fractions of the window now and they used to be fractions of one half of it,
 * so a plume that sat behind the card is at the middle of the screen if it is
 * left where it was. The plot was re-laid rather than rescaled, to one rule —
 * **no plume may come to rest with an edge near the centre line**. They start
 * off the sides, they travel across the middle, and the two that live near it
 * (`sweep`, `far-1`) are the softest and dimmest in the set, which is what
 * makes them atmosphere over the join rather than objects beside it.
 */
const PLUMES: readonly Plume[] = [
  {
    id: "key",
    x: "-18%",
    y: "-24%",
    w: "58vmax",
    h: "19vmax",
    z: "0px",
    tilt: "-14deg",
    soft: "34px",
    dim: 0.9,
    tint: "var(--accent-lit)",
    dx: "7%",
    dy: "6%",
    spin: "6deg",
    dur: "53s",
    delay: "0s",
  },
  {
    /* The one that crosses the middle, and the reason it is allowed to: it is
       wide, soft, well back, and it is never still. A reader cannot take a
       moving blur as an edge. */
    id: "sweep",
    x: "22%",
    y: "-32%",
    w: "70vmax",
    h: "16vmax",
    z: "-180px",
    tilt: "20deg",
    soft: "46px",
    dim: 0.6,
    tint: "var(--brand-2)",
    dx: "-6%",
    dy: "10%",
    spin: "-8deg",
    dur: "67s",
    delay: "-11s",
  },
  {
    id: "fill",
    x: "-10%",
    y: "64%",
    w: "66vmax",
    h: "21vmax",
    z: "-60px",
    tilt: "8deg",
    soft: "40px",
    dim: 0.72,
    tint: "var(--brand-1)",
    dx: "8%",
    dy: "-5%",
    spin: "5deg",
    dur: "59s",
    delay: "-23s",
  },
  {
    /* Behind the card, on the outer side of it, so the pane has something to
       be lit *by* from the direction its own specular says it is. */
    id: "rim",
    x: "66%",
    y: "40%",
    w: "50vmax",
    h: "15vmax",
    z: "60px",
    tilt: "-30deg",
    soft: "30px",
    dim: 0.6,
    tint: "var(--accent-lit)",
    dx: "-5%",
    dy: "-8%",
    spin: "7deg",
    dur: "47s",
    delay: "-7s",
  },
  {
    id: "far-1",
    x: "30%",
    y: "26%",
    w: "52vmax",
    h: "12vmax",
    z: "-340px",
    tilt: "38deg",
    soft: "58px",
    dim: 0.44,
    /* `--brand-3` — the violet at the deep end of the wordmark gradient — was
       the tint here, and it is the one plume that had to change with the
       palette rather than follow it. Violet reads as depth across the 200px of
       a wordmark; spread over half a window of blue it reads as a magenta
       stain, which is the single thing on this screen that would say the room
       is not blue. The accent gives the same recession without leaving the
       axis: it is the darkest, most saturated blue in the set, so it still
       sits behind the two sky plumes in front of it. */
    tint: "var(--accent)",
    dx: "9%",
    dy: "-7%",
    spin: "-11deg",
    dur: "73s",
    delay: "-31s",
  },
  {
    id: "far-2",
    x: "78%",
    y: "-10%",
    w: "48vmax",
    h: "13vmax",
    z: "-260px",
    tilt: "-48deg",
    soft: "50px",
    dim: 0.5,
    tint: "var(--accent-lit)",
    dx: "-8%",
    dy: "10%",
    spin: "9deg",
    dur: "61s",
    delay: "-17s",
  },
];

export function DoorFlow() {
  return (
    <div className="door__flow" aria-hidden="true">
      {/* The room, before anything is moving in it. Even with the drift
          stopped — reduced motion, a print — the page is still lit. */}
      <div className="door__wash" />

      {PLUMES.map((f) => (
        <span
          key={f.id}
          className="door__plume"
          style={
            {
              "--x": f.x,
              "--y": f.y,
              "--w": f.w,
              "--h": f.h,
              "--z": f.z,
              "--tilt": f.tilt,
              "--soft": f.soft,
              "--dim": f.dim,
              "--tint": f.tint,
              "--dx": f.dx,
              "--dy": f.dy,
              "--spin": f.spin,
              "--dur": f.dur,
              "--delay": f.delay,
            } as React.CSSProperties
          }
        />
      ))}

      {/* A dither over the top, and it matters more at this size than it did
          at half of it. Six overlapping gradients this large band visibly on
          an 8-bit display, and a band that crosses the middle of the window is
          exactly the artefact this arrangement cannot have. A barely-visible
          noise is the cheapest fix there is; same trick as the hero's second
          scrim. */}
      <div className="door__dither" />
    </div>
  );
}
