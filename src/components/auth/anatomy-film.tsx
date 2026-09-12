"use client";

import { useEffect, useRef, useState } from "react";
// Type-only. The keyer is imported inside the effect below, so the shader and
// the WebGL setup stay off the bundle of the first page anybody loads.
import type { AnatomyKey } from "@/lib/anatomy-key";

/**
 * Self-hosted; `next.config.ts` ships `media-src 'self'` and nothing else.
 *
 * The *built* loop, not the source clip beside it: this is `peristalsis.mp4`
 * followed by itself in reverse, so it plays to the end, turns, and comes back
 * without a cut. `lib/anatomy-key` carries the command that makes it and the
 * argument for making it that way.
 */
const FILM = "/video/gut-loop.mp4";

/**
 * Slower than it was shot.
 *
 * This started as a way of making a bad loop come round less often, and it
 * stayed after the loop was fixed in the file itself, on its own merits. The
 * film turns at each end rather than cutting, and a turn is a change of
 * direction — the slower it happens the less it announces itself. Fifteen
 * seconds out and back, against ten. Nothing in this footage needs to be seen
 * at speed, and a body breathing slowly beside a login form is calmer than a
 * body breathing quickly beside one.
 */
const SPEED = 0.7;

/**
 * The library's half of the door, playing.
 *
 * What stood here was a tract built out of maths — about forty numbers and a
 * tube generator, turning on its own. It has been replaced, at the brief's
 * request, by a studio film: a body drawn as translucent blue glass with the
 * stomach, the small bowel and the colon lit up and working inside it. The
 * argument for the procedural version was that it cost no bytes and matched
 * the palette; the argument against it is the one that wins here, which is
 * that a reader arriving at a gastroenterology library should see a gut, and a
 * render of an actual one is a gut in a way that a tapered tube is not.
 *
 * `lib/anatomy-key` is how the background comes off — a per-pixel key on the
 * GPU, so the body stands in the alcove rather than in a black rectangle laid
 * over it. The reasoning is there, along with why the alcove is dark. What is here is the loading contract, and
 * it is the one `AmbientVideo` and `LansodAd` already follow:
 *
 *   • the page renders complete without it. The stage is a lit alcove with or
 *     without anything standing in it, and the form beside it works whether or
 *     not a single byte of this arrives;
 *   • nothing is fetched until the effect has agreed it should be. A 1.5MB
 *     film is exactly what `saveData` and `prefers-reduced-motion` exist to
 *     refuse, and `<video src>` in the markup would have been fetched before
 *     either question could be asked;
 *   • the keyer is imported inside the effect, so the door's first paint never
 *     waits on it;
 *   • the pane fades in when the first keyed frame is on screen, so a slow
 *     network is a late arrival rather than a flash of an empty box.
 *
 * ── No controls, no sound, no cursor ──────────────────────────────────
 *
 * The brief asked for it to look like an animation rather than a video, and
 * that is a list of absences. There are no `controls`. The file carries no
 * audio track at all, and it is still `muted` in the markup *and* silenced
 * again in the effect: the markup because React sets `muted` as a property and
 * there have been enough browser versions that read the attribute first, and
 * the effect because the next file dropped in at this path may not be silent
 * and the page should not depend on it being so. It takes no pointer —
 * `pointer-events: none` on the pane, and the `<video>` is a 1px element the
 * cursor could not reach even if it did. It is not in the tab order and not in
 * the accessibility tree: it says nothing the wordmark and the eyebrow on the
 * other half do not already say in words.
 */
export function AnatomyFilm() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [wanted, setWanted] = useState(false);
  const [live, setLive] = useState(false);

  // Whether this reader should be sent a film at all. Asked before anything is
  // rendered, so a reader who wants less motion, or who is paying by the
  // megabyte, never sees the request — the stylesheet asks the motion question
  // a second time, which covers the reader who changes the setting with the
  // page already open.
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Chromium-only, and the shape is stable enough to read defensively
    // rather than to type.
    const link = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const metered =
      link?.saveData === true ||
      link?.effectiveType === "slow-2g" ||
      link?.effectiveType === "2g";

    const decide = () => setWanted(!calm.matches && !metered);
    decide();
    calm.addEventListener("change", decide);
    return () => calm.removeEventListener("change", decide);
  }, []);

  useEffect(() => {
    if (!wanted) return;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!stage || !canvas || !video) return;

    // Silence, set from script as well as from the markup. Volume too: a
    // muted element that is later unmuted by anything at all should still
    // have nothing to play.
    video.muted = true;
    video.volume = 0;
    // `defaultPlaybackRate` rather than only `playbackRate`: loading a source
    // runs the media load algorithm, and the first thing that does is copy the
    // default over the live rate. Set the live one too, for the case where this
    // effect re-runs against an element that already has the file.
    video.defaultPlaybackRate = SPEED;
    video.playbackRate = SPEED;
    video.src = FILM;
    // A rejected promise here is an autoplay policy saying no, and what is
    // left is a lit alcove. Nothing to report and nothing to retry.
    void video.play().catch(() => {});

    let cancelled = false;
    let key: AnatomyKey | null = null;

    (async () => {
      try {
        const { createAnatomyKey } = await import("@/lib/anatomy-key");
        if (cancelled) return;
        key = createAnatomyKey({
          canvas,
          container: stage,
          video,
          onReady: () => !cancelled && setLive(true),
        });
      } catch {
        // A blocked chunk, or a driver that will not give up a context. The
        // alcove keeps its ground and its pool of light, which is a composed
        // pane rather than a hole.
      }
    })();

    return () => {
      cancelled = true;
      key?.dispose();
      video.pause();
      // Let go of the file as well as the decoder: an element left holding a
      // src keeps its buffer alive for as long as the element does.
      video.removeAttribute("src");
      video.load();
    };
  }, [wanted]);

  if (!wanted) return null;

  return (
    <div
      ref={stageRef}
      className="door__anatomy"
      data-live={live ? "true" : "false"}
      aria-hidden="true"
    >
      {/* The source, not the picture. It is decoded into a texture and drawn
          by the canvas beside it; it stays in the DOM at 1px because a browser
          is entitled to stop decoding an element it has been detached from,
          and `display: none` on it would be exactly that. */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
      />
      <canvas ref={canvasRef} />
    </div>
  );
}
