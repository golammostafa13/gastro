/** Screenshot the door with software WebGL. node shot.mjs <url> <out.png> [css] */
import puppeteer from "puppeteer-core";

const [, , url, out, extraCss = "", waitMs = "7000"] = process.argv;

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: [
    "--no-sandbox",
    "--hide-scrollbars",
    // Software WebGL: there is no GPU in here, and --disable-gpu would make
    // the canvas fail to acquire a context, which is exactly what we are
    // trying to look at.
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--ignore-gpu-blocklist",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 980, deviceScaleFactor: 1 });
page.on("console", (m) => console.log(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));

await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
if (extraCss) await page.addStyleTag({ content: extraCss });
await new Promise((r) => setTimeout(r, Number(waitMs)));

const state = await page.evaluate(() => {
  const stage = document.querySelector(".door__anatomy");
  const canvas = stage?.querySelector("canvas");
  let gl = null;
  if (canvas) {
    const ctx = canvas.getContext("webgl2") || canvas.getContext("webgl");
    gl = ctx ? ctx.getParameter(ctx.VERSION) : "no context";
  }
  return {
    live: stage?.getAttribute("data-live"),
    canvas: canvas ? { w: canvas.width, h: canvas.height } : null,
    gl,
    opacity: stage ? getComputedStyle(stage).opacity : null,
  };
});
console.log("[state]", JSON.stringify(state));

await page.screenshot({ path: out });
console.log(`[shot] ${out}`);
await browser.close();
