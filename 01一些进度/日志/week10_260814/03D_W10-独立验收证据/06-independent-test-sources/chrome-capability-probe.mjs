import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const [
  playwrightRoot,
  userDataDir,
  downloadsDir,
  screenshotsDir,
  debugPortText,
] = process.argv.slice(2);

if (
  !playwrightRoot ||
  !userDataDir ||
  !downloadsDir ||
  !screenshotsDir ||
  !debugPortText
) {
  throw new Error(
    "usage: node chrome-capability-probe.mjs <playwrightRoot> <userDataDir> <downloadsDir> <screenshotsDir> <debugPort>",
  );
}

const debugPort = Number(debugPortText);
if (!Number.isInteger(debugPort) || debugPort <= 0) {
  throw new Error(`invalid debug port: ${debugPortText}`);
}

const { chromium } = await import(
  path.join(playwrightRoot, "node_modules/playwright-core/index.mjs")
);

await fs.mkdir(userDataDir, { recursive: true });
await fs.mkdir(downloadsDir, { recursive: true });
await fs.mkdir(screenshotsDir, { recursive: true });

const result = {
  browser: {},
  p02: {},
  p03: {},
  p04: {},
  p05: {},
  cleanup: {},
};

async function readProbeOutput(page, expectedAction) {
  await page.waitForFunction(
    (action) => {
      const text = document.querySelector("#output")?.textContent ?? "";
      if (!text.startsWith("{")) {
        return false;
      }
      try {
        return JSON.parse(text).action === action;
      } catch {
        return false;
      }
    },
    expectedAction,
  );
  return JSON.parse(await page.locator("#output").innerText());
}

const context = await chromium.launchPersistentContext(userDataDir, {
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  acceptDownloads: true,
  downloadsPath: downloadsDir,
  viewport: { width: 1280, height: 720 },
  args: [
    `--remote-debugging-address=127.0.0.1`,
    `--remote-debugging-port=${debugPort}`,
    "--no-first-run",
    "--no-default-browser-check",
  ],
});

try {
  const versionResponse = await fetch(
    `http://127.0.0.1:${debugPort}/json/version`,
  );
  const versionJson = await versionResponse.json();
  result.browser = {
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    userDataDir,
    acceptDownloads: true,
    downloadsPath: downloadsDir,
    remoteDebuggingAddress: "127.0.0.1",
    remoteDebuggingPort: debugPort,
    debugHttpStatus: versionResponse.status,
    browserProduct: versionJson.Browser,
    protocolVersion: versionJson["Protocol-Version"],
    webSocketHost: new URL(versionJson.webSocketDebuggerUrl).hostname,
  };

  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => {
    if (requests.length < 30) {
      requests.push({
        method: request.method(),
        resourceType: request.resourceType(),
        url: request.url(),
      });
    }
  });

  await page.goto("http://127.0.0.1:34191/__codex_probe", {
    waitUntil: "domcontentloaded",
  });

  await page.getByRole("button", { name: "Inspect origin" }).click();
  const initialInspect = await readProbeOutput(page, "inspect");
  result.p02 = {
    initialInspect,
    capturedRequests: requests,
    pageUrl: page.url(),
    browserName: "Google Chrome",
    control: "playwright-core launchPersistentContext",
  };

  await page
    .getByRole("button", { name: "Create and read probe DB" })
    .click();
  const createdProbe = await readProbeOutput(page, "create-read");
  await page.getByRole("button", { name: "Delete probe DB" }).click();
  const deletedProbe = await readProbeOutput(page, "delete");
  result.p03 = { createdProbe, deletedProbe };

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download probe JSON" }).click();
  const download = await downloadPromise;
  const suggestedFilename = download.suggestedFilename();
  const savedPath = path.join(downloadsDir, suggestedFilename);
  await download.saveAs(savedPath);
  const downloadedBytes = await fs.readFile(savedPath);
  const downloadedJson = JSON.parse(downloadedBytes.toString("utf8"));
  const sha256 = crypto
    .createHash("sha256")
    .update(downloadedBytes)
    .digest("hex");
  result.p04 = {
    suggestedFilename,
    savedPath,
    byteLength: downloadedBytes.byteLength,
    downloadedJson,
    sha256,
    failure: await download.failure(),
  };
  await fs.unlink(savedPath);
  result.p04.deletedAfterProbe = true;
  result.p04.existsAfterDelete = await fs
    .access(savedPath)
    .then(() => true)
    .catch(() => false);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reduced390 = await page.evaluate(() => {
    const element = document.querySelector("#motion-probe");
    const style = getComputedStyle(element);
    return {
      viewport: { width: innerWidth, height: innerHeight },
      reducedMotion: matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches,
      transitionProperty: style.transitionProperty,
      transitionDuration: style.transitionDuration,
      transform: style.transform,
    };
  });
  const screenshot390 = path.join(
    screenshotsDir,
    "01-p05-probe-390x844-reduced-motion.png",
  );
  await page.screenshot({ path: screenshot390, fullPage: true });

  await page.setViewportSize({ width: 1280, height: 720 });
  const reduced1280 = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));
  const screenshot1280 = path.join(
    screenshotsDir,
    "02-p05-probe-1280-reduced-motion.png",
  );
  await page.screenshot({ path: screenshot1280, fullPage: true });

  await page.emulateMedia({ reducedMotion: null });
  const resetMedia = await page.evaluate(() => ({
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));
  await page.setViewportSize({ width: 1280, height: 720 });
  result.p05 = {
    reduced390,
    reduced1280,
    resetMedia,
    screenshots: [screenshot390, screenshot1280],
  };

  await page.close();
} finally {
  await context.close();
  result.cleanup.contextClosed = true;
}

result.cleanup.debugEndpointReleased = await fetch(
  `http://127.0.0.1:${debugPort}/json/version`,
)
  .then(() => false)
  .catch(() => true);

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
