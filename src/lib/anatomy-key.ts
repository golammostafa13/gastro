/**
 * The film with its background taken off.
 *
 * `public/video/gut-loop.mp4` is a studio render in the radiographic idiom:
 * a body drawn as translucent blue glass with the stomach, small bowel and
 * colon lit up inside it, working. Everything in it is light — it was rendered
 * as emission against black, the way a still from a scanner is — and that is
 * the fact this module is built on.
 *
 * The problem it solves is the rectangle. Dropped into the door as an ordinary
 * `<video>` the clip brings its own black field with it, and a black box with
 * four corners sitting inside a lit alcove is a television in a room, not an
 * object in one — which is the thing the split exists to stop being (see the
 * note in the auth layout). What is wanted is the body standing *in* the
 * alcove, over the stage's own ground and its own pool of light.
 *
 * ── The key ───────────────────────────────────────────────────────────
 *
 * For a film like this the key is not a colour at all. Black is not a
 * background here in the sense a blue screen is a background; black is the
 * absence of anything, because every pixel that belongs to the render is
 * something glowing. So the alpha is luma, hard against the floor:
 *
 *   • the corners measure (0,0,12) — luma 0.003 — and go to nothing;
 *   • the ambient wash behind the shoulders reaches (40,56,99), and stays: it
 *     is the render's own halo, not a backdrop, and cutting it would leave the
 *     figure with a sawn-off edge where the light around it used to be;
 *   • the body itself is faint — (15,23,54) across the torso, luma 0.09 — and
 *     the threshold has to clear it comfortably or the person disappears and
 *     leaves a floating gut behind.
 *
 * Hence a band that opens almost immediately and closes by a tenth: what it
 * removes is the dead field and nothing else. A wider band would have been
 * the instinct — most keys want a soft, generous ramp — and here it would key
 * out the subject, because on this asset the subject is dim by design.
 *
 * The band is a `smoothstep` rather than a cutoff all the same. A hard
 * threshold on an H.264 source speckles: chroma is stored at half resolution,
 * so pixels along every edge land either side of the line frame by frame and
 * the silhouette crawls.
 *
 * ── Why the alcove is dark ────────────────────────────────────────────
 *
 * Because the asset is emissive, and emissive art has no reading on paper. Over
 * the pale ground this half used to have, a body drawn at a tenth of full
 * brightness is a smudge and the glowing colon is a yellow stain. The stage's
 * ground goes deep in both themes for this film (see `.door__stage-ground` in
 * the stylesheet), which is not a compromise so much as the right room: a
 * radiograph has always been something you hold up to a light in a dark place.
 *
 * The panel beside it is untouched, and that is the whole design — a lit page
 * with the form on it, and a dark window next to it with a body in the window.
 *
 * ── Why WebGL and not CSS ─────────────────────────────────────────────
 *
 * `mix-blend-mode: screen` gets close in one declaration, and it cannot be
 * used here: `.door__anatomy` fades in on `opacity`, and an element with
 * opacity below 1 is its own group, so the blend would have nothing behind it
 * to blend with and the black field would come straight back. Keying in the
 * shader is independent of how the pane is composited, which is the property
 * that matters.
 *
 * ── Why there is no dissolve here any more ───────────────────────────
 *
 * There was one, and it is worth recording why it went. The source clip is a
 * slow dolly that does not loop: consecutive frames differ by about one count
 * and the last differs from the first by sixteen, so the camera snapped back
 * every time round. This module used to hide that by fading the alpha to
 * nothing through the cut — which removed the snap and put a pulse in its
 * place, and a pulse on a page somebody is reading a password onto is the same
 * problem wearing a different coat.
 *
 * The fix belongs in the asset, not in the shader. `gut-loop.mp4` is the clip
 * followed by itself in reverse, so it runs to the end, turns, and comes back
 * to where it started — and the two joins are now inside the ordinary range of
 * frame-to-frame movement (1.2 and 2.0 counts against a typical 1.1). Nothing
 * fades, nothing cuts, and this file is smaller for it: no second texture, no
 * loop detection, no clock. Built from `peristalsis.mp4` with
 *
 *   ffmpeg -i peristalsis.mp4 -filter_complex \
 *     "[0:v]scale=1920:1080:flags=lanczos,split=2[a][b]; \
 *      [a]setpts=N/24/TB[af]; \
 *      [b]reverse,trim=start_frame=1:end_frame=124,setpts=N/24/TB[r]; \
 *      [af][r]concat=n=2:v=1,setpts=N/24/TB[out]" \
 *     -map "[out]" -an -fps_mode passthrough \
 *     -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p \
 *     -movflags +faststart gut-loop.mp4
 *
 * The `trim` drops the first and last frame of the reversed half, which are
 * the two frames the forward half already ends and begins on — without it the
 * turn and the loop each hold for a doubled frame. 1920 rather than the
 * source's 2560 because the drawing buffer is capped at 1080 device pixels
 * wide and the cover fit spends about half the film's width across it, so
 * anything past 1920 is detail no display ever asks for.
 *
 * No three.js. This is one textured triangle; the library that draws the
 * sponsor's carton would be 600KB to do a job that fits in the shader below.
 */

/** Natural size of the film, in pixels. Used for the cover fit. */
const FILM_W = 1920;
const FILM_H = 1080;

/**
 * Largest drawing buffer we will allocate, in device pixels of width. The film
 * is 720 wide and the cover fit always spends it across the full width of the
 * pane, so past about 1.5x we are paying to interpolate pixels that were never
 * photographed.
 */
const MAX_W = 1080;

const VERT = `
attribute vec2 aPos;
uniform vec4 uWindow;
varying vec2 vUv;
void main() {
  vec2 unit = aPos * 0.5 + 0.5;
  /* Flipped in y: a video uploads top-down, so v = 0 is the reader's top. */
  vUv = vec2(unit.x, 1.0 - unit.y) * uWindow.xy + uWindow.zw;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform sampler2D uFilm;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(uFilm, vUv).rgb;
  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  /* Anything that glows at all is the render; the floor is the dead field.
     The band is narrow on purpose — see the note at the top of this file. */
  float a = smoothstep(0.006, 0.09, luma);
  /* Premultiplied, which is what the compositor wants and what stops a dark
     halo appearing along every edge the key made partly transparent. */
  gl_FragColor = vec4(c * a, a);
}
`;

export interface AnatomyKeyOptions {
  canvas: HTMLCanvasElement;
  /** The box the canvas fills; watched for resizes and for leaving the view. */
  container: HTMLElement;
  /** The film. Already in the DOM, muted, looping; this never starts it. */
  video: HTMLVideoElement;
  /** Called once, when the first keyed frame is on screen. */
  onReady?: () => void;
}

export interface AnatomyKey {
  dispose(): void;
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createAnatomyKey(options: AnatomyKeyOptions): AnatomyKey {
  const { canvas, container, video, onReady } = options;

  const context = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    // Nothing here is an edge we drew: the only geometry is a triangle that
    // covers the canvas, and every edge in the picture comes from the key.
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  }) as WebGLRenderingContext | null;
  if (!context) throw new Error("no webgl");
  // Bound to its own name once it is known to exist, so the closures below —
  // the draw loop, the resize — are written against a context, not a maybe.
  const gl: WebGLRenderingContext = context;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) throw new Error("no program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("link failed");
  }
  gl.useProgram(program);

  // One triangle larger than the viewport rather than two making a quad: the
  // clip is free and it spares the shared edge down the middle, where the two
  // halves of a quad meet and can disagree by a pixel.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uWindow = gl.getUniformLocation(program, "uWindow");
  const uFilm = gl.getUniformLocation(program, "uFilm");

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // 720x1280 is not a power of two, so mipmaps and repeat are both off the
  // table in WebGL 1. Clamped and linear is what an NPOT texture may have.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(uFilm, 0);

  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  /**
   * The cover fit, in the film's own coordinates: which rectangle of it the
   * pane is a window onto.
   *
   * `cover` rather than `contain`, and here that is a large crop: the film is
   * 16:9 and the alcove at `lg` is taller than it is wide, so about four
   * tenths of the width survives. That is the right four tenths. The figure
   * stands in the middle of the frame and occupies almost exactly the band the
   * crop keeps; `contain` would fit the whole 16:9 into a tall box and leave a
   * person four hundred pixels high in the middle of a lot of nothing.
   *
   * There is nothing to letterbox against, either, which is what makes the
   * crop free: the key has already taken the field away, so what is outside
   * the window is not a black bar, it is the alcove.
   */
  function fit(w: number, h: number) {
    const pane = w / h;
    const film = FILM_W / FILM_H;
    const sx = pane > film ? 1 : pane / film;
    const sy = pane > film ? film / pane : 1;
    gl.uniform4f(uWindow, sx, sy, (1 - sx) / 2, (1 - sy) / 2);
  }

  let width = 0;
  let height = 0;

  function resize() {
    const rect = container.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.min(Math.round(rect.width * dpr), MAX_W);
    const h = Math.max(1, Math.round((w * rect.height) / rect.width));
    if (w === width && h === height) return;
    width = w;
    height = h;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    fit(w, h);
  }

  let frame = 0;
  let ready = false;
  let shown = -1;
  let hasFrame = false;
  let remeasure = true;

  /**
   * Every animation frame, whether or not the film has moved.
   *
   * This is the one rule of a WebGL canvas that is easy to get backwards, and
   * getting it backwards is what a reader sees. The drawing buffer is *cleared
   * the moment it has been composited* unless `preserveDrawingBuffer` is on,
   * which it is not and should not be — it costs a full copy of the buffer
   * every frame. So a canvas does not hold its last picture the way an `<img>`
   * does. Skip a draw and the pane is not stale; the pane is empty.
   *
   * The film runs at 24fps and is played slower still, which puts a new frame
   * on screen about seventeen times a second against a display asking sixty
   * times a second. An earlier version of this loop returned early whenever
   * `currentTime` had not moved, on the reasoning that there was nothing new to
   * show — and so painted nothing on two frames out of three. What that looks
   * like is not a still image. It looks like the anatomy blinking out and
   * coming back, which reads as the film stopping and starting.
   *
   * What is actually worth skipping is the *upload*: pushing a 1920x1080 frame
   * into a texture is the expensive half, and there is no reason to do it twice
   * for the same frame. So the guard moved down one line. Drawing is a single
   * triangle and costs nothing worth measuring.
   */
  function draw() {
    frame = requestAnimationFrame(draw);
    if (gl.isContextLost()) return;

    // Deferred to here rather than read in the observer: `getBoundingClientRect`
    // can force layout, and this way it happens when the pane actually changed
    // shape instead of sixty times a second forever.
    if (remeasure) {
      remeasure = false;
      resize();
    }
    if (!width) return;

    // HAVE_CURRENT_DATA or better, and the frame is one we have not uploaded.
    // Below that there is nothing new to put in the texture — but the texture
    // still holds the last frame, and it still has to be drawn.
    if (video.readyState >= 2 && video.currentTime !== shown) {
      shown = video.currentTime;
      hasFrame = true;
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        video,
      );
    }

    // Nothing has ever been uploaded: the texture is undefined, and drawing it
    // would paint whatever the driver happens to have there. The pane is still
    // at zero opacity at this point, so there is nothing to see either way.
    if (!hasFrame) return;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!ready) {
      ready = true;
      onReady?.();
    }
  }

  const observer = new ResizeObserver(() => {
    // The pane changed shape. The next draw re-reads it and re-fits; it does
    // not need a new video frame to do that, and asking for one would stall
    // the resize until the film next advanced.
    remeasure = true;
  });
  observer.observe(container);

  /**
   * Off screen, stop. On a phone the stage is a band under the form and a
   * reader who is typing has scrolled it away; there is no reason to be
   * decoding video and uploading textures for a pane nobody is looking at.
   */
  const watcher = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        void video.play().catch(() => {});
        if (!frame) frame = requestAnimationFrame(draw);
      } else {
        video.pause();
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { rootMargin: "10%" },
  );
  watcher.observe(container);

  resize();
  frame = requestAnimationFrame(draw);

  return {
    dispose() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      observer.disconnect();
      watcher.disconnect();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // Hand the context back rather than waiting to be collected: a browser
      // allows a small number of them and this page has the sponsor's carton
      // running on another one.
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
