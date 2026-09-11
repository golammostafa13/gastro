/**
 * Loads a page in headless Chrome and reports console output, page errors,
 * failed requests, and (optionally) a screenshot.
 *   node probe.mjs <url> [screenshot.png] [waitMs]
 *
 * Every page but the two door pages is behind a session cookie, so without one
 * this reports on a redirect to /signin rather than on the page you asked for
 * — which looks like a pass and tells you nothing. Set `PROBE_SESSION` to a
 * `gbb_session` value copied out of DevTools after signing in:
 *
 *   PROBE_SESSION=$(…) node probe.mjs http://localhost:3000/en/books shot.png
 *
 * It is read from the environment rather than minted here on purpose. A script
 * in the repository that can forge a session from `AUTH_SECRET` is a script
 * that will eventually be run somewhere it should not be; copying a cookie you
 * already earned by typing the password is the same convenience with none of
 * that.
 */
import puppeteer from "puppeteer-core";

const [, , url, shot, waitMs = "9000"] = process.argv;
const session = process.env.PROBE_SESSION;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

  if (session) {
    const { hostname } = new URL(url);
    await browser.setCookie({
      name: "gbb_session",
      value: session,
      domain: hostname,
      path: "/",
    });
  } else {
    console.log("[note] no PROBE_SESSION — expect a redirect to /signin");
  }

  page.on("console", (m) => console.log(`[console.${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`));
  page.on("requestfailed", (r) =>
    console.log(`[reqfail] ${r.url()}: ${r.failure()?.errorText}`),
  );
  page.on("response", (r) => {
    if (r.status() >= 400) console.log(`[http ${r.status()}] ${r.url()}`);
    if (/worker|\.pdf/i.test(r.url()))
      console.log(`[asset ${r.status()}] ${r.url()}`);
  });

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  } catch (e) {
    console.log(`[goto] ${e.message}`);
  }

  await new Promise((r) => setTimeout(r, Number(waitMs)));

  // Report what the reader actually ended up showing.
  const state = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    return {
      bodyText: document.body.innerText.slice(0, 300).replace(/\s+/g, " "),
      canvas: canvas
        ? { w: canvas.width, h: canvas.height, css: canvas.style.width }
        : null,
    };
  });
  console.log("[state]", JSON.stringify(state));

  if (shot) {
    await page.screenshot({ path: shot, fullPage: false });
    console.log(`[shot] ${shot}`);
  }
  await browser.close();
})();
