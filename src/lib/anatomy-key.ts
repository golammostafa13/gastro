/**
 * The film with its background taken off.
 *
 * `public/video/peristalsis.mp4` is a studio render of an abdomen — ribs,
 * liver, stomach, the small bowel working — shot against a deep blue vignette.
 * The vignette is the problem. Dropped into the door as an ordinary `<video>`
 * it is a navy rectangle sitting in a pale alcove: a screen showing a film,
 * with a visible edge all the way round it, which is the one thing the split
 * exists to stop being (see the note in the auth layout). What is wanted is the
 * organs standing *in* the alcove, lit by it, on whichever ground the theme
 * happens to be painting.
 *
 * So the background is keyed out, per pixel, on the GPU.
 *
 * ── Why this can be keyed at all ──────────────────────────────────────
 *
 * Because the studio lit it for us. Sampling the frames gives two populations
 * that do not overlap anywhere that matters:
 *
 *   • the ground is **cool and dark** — (10,15,26) at the corners rising to
 *     (47,64,97) in the glow at the foot. Blue always leads red, by 16 to 50
 *     counts, and the luma never reaches a quarter;
 *   • the body is **warm** — bone at (200,195,190), serosa at (182,159,156),
 *     liver at (72,42,40). Red leads blue, or the pixel is bright enough to be
 *     a specular highlight and nothing else.
 *
 * That gives the key below: `r - b` decides it, and a luma term rescues the
 * cool white highlights on wet bone, which are the one warm-object pixels that
 * come back blue. No spill suppression is needed — a blue screen sprays blue
 * onto the edges of what stands in front of it, and this ground is not a
 * screen, it is a gradient behind a render that was composited over it.
 *
 * Both thresholds are soft (`smoothstep`, not a cutoff). A hard threshold on a
 * 4:2:0 H.264 source speckles: chroma is stored at half resolution, so pixels
 * along every rib edge land either side of the line frame by frame and the
 * silhouette crawls. The soft band turns that into partial alpha, which is
 * what an antialiased edge should have anyway.
 *
 * What stays dark is the shadow *inside* the body — the gap behind the stomach,
 * the space between coils. Those keep most of their opacity and read as depth,
 * which is correct: they are not background, they are the inside of a person.
 *
 * ── Why WebGL and not CSS ─────────────────────────────────────────────
 *
 * `mix-blend-mode: screen` does this in one declaration and only over a dark
 * ground; the door is pale in its light theme, where `screen` blows the whole
 * pane to white. A canvas keyed per pixel is the only version that is correct
 * in both themes, and it is the version that matches the promise made here —
 * the background is *gone*, not hidden under a blend that happens to agree with
 * the wallpaper.
 *
 * No three.js. This is one textured triangle; the library that draws the
 * sponsor's carton would be 600KB to do a job that fits in the shader below.
 */

/** Natural size of the film, in pixels. Used for the cover fit. */
const FILM_W = 720;
const FILM_H = 1280;

/**
 * Seconds of dissolve at each end of the loop. The camera dollies in across
 * the ten seconds, so the cut back to the wide frame is a jump; fading the
 * alpha down and up through it turns that into a dissolve *to the alcove*,
 * which is the one place a film with no background can dissolve to.
 */
const EDGE = 0.55;

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
uniform float uFade;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(uFilm, vUv).rgb;
  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  /* Warm, or bright enough to be a highlight. Either one is the body. */
  float a = max(smoothstep(-0.06, 0.02, c.r - c.b), smoothstep(0.30, 0.46, luma));
  a *= uFade;
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
  const uFade = gl.getUniformLocation(program, "uFade");
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
   * pane is a window onto. `cover` rather than `contain` because the pane is
   * a tall alcove and the film is taller still, so fitting it whole would
   * leave the body small in the middle of a lot of nothing — and because with
   * the ground keyed out, cropping costs nothing a reader can see. There are
   * no bars to letterbox; there is only more or less of a person.
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

  const smoothstep = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  let frame = 0;
  let ready = false;
  let shown = -1;

  function draw() {
    frame = requestAnimationFrame(draw);
    if (gl.isContextLost()) return;

    // HAVE_CURRENT_DATA. Below this there is no frame to upload and the last
    // one is still on screen, which is the right thing to be looking at.
    if (video.readyState < 2) return;

    // Nothing new decoded since the last upload. Skipping the whole frame
    // leaves the canvas showing what it already shows and spares a 3.7MB
    // texture upload, which on a 120Hz display is most of them.
    if (video.currentTime === shown) return;
    shown = video.currentTime;

    resize();
    if (!width) return;

    const span = video.duration;
    const fade =
      span > EDGE * 2
        ? Math.min(
            smoothstep(0, EDGE, shown),
            smoothstep(0, EDGE, span - shown),
          )
        : 1;
    gl.uniform1f(uFade, fade);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      video,
    );
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!ready) {
      ready = true;
      onReady?.();
    }
  }

  const observer = new ResizeObserver(() => {
    // Force the next frame through the `currentTime` guard: the pane changed
    // shape, so what is on the canvas is the right frame at the wrong size.
    shown = -1;
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
