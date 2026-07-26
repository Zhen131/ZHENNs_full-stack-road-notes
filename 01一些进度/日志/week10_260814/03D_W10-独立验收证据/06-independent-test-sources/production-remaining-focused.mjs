import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const origin = process.env.LEDGER_ORIGIN;
const chromeExecutable = process.env.CHROME_EXECUTABLE;
const userDataDir = process.env.CHROME_USER_DATA_DIR;
const evidenceDir = process.env.EVIDENCE_DIR;
const debugPort = Number(process.env.CHROME_DEBUG_PORT);

if (
  !origin ||
  !chromeExecutable ||
  !userDataDir ||
  !evidenceDir ||
  !Number.isInteger(debugPort)
) {
  throw new Error("Required isolated-browser environment variables are missing");
}

const downloadDir = path.join(evidenceDir, "07-browser-downloads");
const screenshotDir = path.join(evidenceDir, "10-screenshots");
await mkdir(downloadDir, { recursive: true });
await mkdir(screenshotDir, { recursive: true });

const runToday = "2026-07-26";
const dates = {
  runToday,
  d2: "2026-07-24",
  d10: "2026-07-16",
  d45: "2026-06-11",
  d370: "2025-07-21",
};
const passphrase = randomBytes(24).toString("base64url");
const result = {
  identity: {
    origin,
    runToday,
    dates,
    dateCalculation: "RUN_TODAY 按本地日历分别减 2、10、45、370 天",
    passwordLogged: false,
    verdictScope:
      "聚焦执行 T1-03、T1-05 与 T5；不得用本场景覆盖已按重跑规则记为 BLOCKED 的 T1-02 和 T1-04 pointerleave",
  },
  preflight: {},
  passwordSetup: {},
  fixture: {},
  ranges: {},
  chartRendering: {},
  heatmap: {},
  binance: {},
  deletion: {},
  backup: {},
  responsive: {},
  encryptedStorage: {},
  unlock: {},
  console: { warnings: [], errors: [], pageErrors: [] },
  network: [],
  screenshots: [],
  cleanup: {},
};

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForSaved(page) {
  await page
    .getByText("已保存到本地", { exact: true })
    .waitFor({ state: "visible", timeout: 30_000 });
}

function section(page, heading) {
  return page
    .getByRole("heading", { name: heading, exact: true })
    .locator("xpath=ancestor::section[1]");
}

async function screenshot(page, filename, fullPage = true) {
  const target = path.join(screenshotDir, filename);
  await page.screenshot({ path: target, fullPage });
  result.screenshots.push(filename);
}

async function readRawEnvelope(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("local-first-trading-ledger");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction("ledger", "readonly");
          const getRequest = transaction.objectStore("ledger").get("ledger:v1");
          getRequest.onerror = () => reject(getRequest.error);
          getRequest.onsuccess = () => {
            const value = getRequest.result;
            database.close();
            resolve(value);
          };
        };
      }),
  );
}

async function addTrade(page, trade) {
  const target = section(page, "新增交易");
  await target.locator("select").nth(0).selectOption(trade.type);
  await target.locator("select").nth(1).selectOption(trade.asset);
  for (const [inputIndex, value] of [
    [0, trade.quantity],
    [1, trade.price],
    [2, trade.total],
    [3, trade.date],
    [4, "0"],
  ]) {
    const field = target.locator("input").nth(inputIndex);
    await field.fill(value);
  }
  await target.getByRole("button", { name: "保存交易", exact: true }).click();
  await target
    .getByText("交易已加入账本", { exact: true })
    .waitFor({ state: "visible" });
  await waitForSaved(page);
}

async function addManualPrice(page, asset, priceValue, date) {
  const target = section(page, "价格输入");
  await target.locator("select").selectOption(asset);
  await target.locator("input").nth(0).fill(priceValue);
  await target.locator("input").nth(2).fill(date);
  await target.getByRole("button", { name: "保存价格", exact: true }).click();
  await target
    .getByText("价格已加入账本", { exact: true })
    .waitFor({ state: "visible" });
  await waitForSaved(page);
}

async function positionRows(page) {
  const target = section(page, "资产汇总");
  return target.locator("tbody tr").evaluateAll((rows) =>
    rows.map((row) =>
      Array.from(row.querySelectorAll("td")).map((cell) =>
        (cell.textContent ?? "").replace(/\s+/g, " ").trim(),
      ),
    ),
  );
}

async function tradeRowCount(page) {
  return section(page, /^交易列表/).locator("tbody tr").count();
}

async function checkPasswordEye(page, label) {
  const input = page.getByLabel(label, { exact: true });
  const button = page.getByRole("button", {
    name: `按住查看${label}`,
    exact: true,
  });
  const before = await input.evaluate((element) => {
    if (!element.dataset.acceptanceNode) {
      element.dataset.acceptanceNode = crypto.randomUUID();
    }
    return {
      type: element.type,
      autocomplete: element.autocomplete,
      node: element.dataset.acceptanceNode,
      valueLength: element.value.length,
    };
  });

  await button.dispatchEvent("pointerdown", { pointerId: 1 });
  const pointerDownType = await input.getAttribute("type");
  await button.dispatchEvent("pointerup", { pointerId: 1 });
  const pointerUpType = await input.getAttribute("type");

  await button.dispatchEvent("pointerdown", { pointerId: 2 });
  await button.dispatchEvent("pointerleave", { pointerId: 2 });
  const pointerLeaveType = await input.getAttribute("type");
  if (pointerLeaveType !== "password") {
    await button.dispatchEvent("pointerup", { pointerId: 2 });
  }

  await button.dispatchEvent("pointerdown", { pointerId: 3 });
  await button.dispatchEvent("pointercancel", { pointerId: 3 });
  const pointerCancelType = await input.getAttribute("type");

  await button.dispatchEvent("keydown", { key: "Enter", code: "Enter" });
  const enterDownType = await input.getAttribute("type");
  await button.dispatchEvent("keyup", { key: "Enter", code: "Enter" });
  const enterUpType = await input.getAttribute("type");

  await button.dispatchEvent("keydown", { key: " ", code: "Space" });
  const spaceDownType = await input.getAttribute("type");
  await button.dispatchEvent("keyup", { key: " ", code: "Space" });
  const spaceUpType = await input.getAttribute("type");

  await button.click();
  const clickType = await input.getAttribute("type");

  await button.dispatchEvent("pointerdown", { pointerId: 4 });
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  const windowBlurType = await input.getAttribute("type");

  await button.dispatchEvent("pointerdown", { pointerId: 5 });
  await button.focus();
  await button.blur();
  const buttonBlurType = await input.getAttribute("type");

  const after = await input.evaluate((element) => ({
    type: element.type,
    autocomplete: element.autocomplete,
    node: element.dataset.acceptanceNode,
    valueLength: element.value.length,
  }));

  const observation = {
    beforeType: before.type,
    pointerDownType,
    pointerUpType,
    pointerLeaveType,
    pointerLeaveStatus:
      "BLOCKED: prior two-attempt harness used non-bubbling pointerleave; this continuation does not classify the product behavior",
    pointerCancelType,
    enterDownType,
    enterUpType,
    spaceDownType,
    spaceUpType,
    clickType,
    windowBlurType,
    buttonBlurType,
    nodeIdentityPreserved: before.node === after.node,
    valueLengthPreserved: before.valueLength === after.valueLength,
    autocompletePreserved: before.autocomplete === after.autocomplete,
    passwordValueRecorded: false,
  };
  ensure(before.type === "password", `${label}: default type is not password`);
  ensure(pointerDownType === "text", `${label}: pointerdown did not reveal`);
  ensure(pointerUpType === "password", `${label}: pointerup did not hide`);
  ensure(pointerCancelType === "password", `${label}: pointercancel did not hide`);
  ensure(enterDownType === "text", `${label}: Enter keydown did not reveal`);
  ensure(enterUpType === "password", `${label}: Enter keyup did not hide`);
  ensure(spaceDownType === "text", `${label}: Space keydown did not reveal`);
  ensure(spaceUpType === "password", `${label}: Space keyup did not hide`);
  ensure(clickType === "password", `${label}: click locked plaintext`);
  ensure(windowBlurType === "password", `${label}: window blur did not hide`);
  ensure(buttonBlurType === "password", `${label}: button blur did not hide`);
  ensure(observation.nodeIdentityPreserved, `${label}: input node changed`);
  ensure(observation.valueLengthPreserved, `${label}: input value changed`);
  ensure(observation.autocompletePreserved, `${label}: autocomplete changed`);
  return observation;
}

async function inspectEnvelope(envelope) {
  ensure(envelope && typeof envelope === "object", "raw envelope missing");
  const keys = Object.keys(envelope).sort();
  const kdfKeys = Object.keys(envelope.kdf ?? {}).sort();
  const cipherKeys = Object.keys(envelope.cipher ?? {}).sort();
  const serialized = JSON.stringify(envelope);
  return {
    topLevelKeys: keys,
    kdfKeys,
    cipherKeys,
    formatVersion: envelope.formatVersion,
    cryptoVersion: envelope.cryptoVersion,
    ledgerSchemaVersion: envelope.ledgerSchemaVersion,
    kdf: {
      name: envelope.kdf?.name,
      hash: envelope.kdf?.hash,
      iterations: envelope.kdf?.iterations,
    },
    cipher: {
      name: envelope.cipher?.name,
      keyLength: envelope.cipher?.keyLength,
      tagLength: envelope.cipher?.tagLength,
    },
    ivSha256: sha256(Buffer.from(envelope.cipher?.ivBase64Url ?? "")),
    ciphertextSha256: sha256(
      Buffer.from(envelope.ciphertextBase64Url ?? ""),
    ),
    plaintextMarkersAbsent: ![
      "BTC",
      "ETH",
      "ADA",
      "70000",
      "BTCUSDT",
      "passphrase",
      "password",
    ].some((marker) => serialized.includes(marker)),
    rawValueRecorded: false,
  };
}

const context = await chromium.launchPersistentContext(userDataDir, {
  executablePath: chromeExecutable,
  headless: false,
  acceptDownloads: true,
  downloadsPath: downloadDir,
  viewport: { width: 1280, height: 720 },
  args: [
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync",
    "--metrics-recording-only",
    "--password-store=basic",
    "--use-mock-keychain",
    "--remote-debugging-address=127.0.0.1",
    `--remote-debugging-port=${debugPort}`,
  ],
});

try {
  const pages = context.pages();
  const page = pages[0] ?? (await context.newPage());
  const cdp = await context.newCDPSession(page);
  const preNavigationUsage = await cdp.send("Storage.getUsageAndQuota", {
    origin,
  });
  page.on("console", (message) => {
    if (message.type() === "warning") {
      result.console.warnings.push(message.text());
    }
    if (message.type() === "error") {
      result.console.errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    result.console.pageErrors.push(String(error));
  });
  page.on("response", (response) => {
    if (response.url().includes("binance")) {
      result.network.push({
        kind: "response",
        method: response.request().method(),
        url: response.url(),
        status: response.status(),
      });
    }
  });
  page.on("requestfailed", (request) => {
    if (request.url().includes("binance")) {
      result.network.push({
        kind: "requestfailed",
        method: request.method(),
        url: request.url(),
        error: request.failure()?.errorText,
      });
    }
  });

  await page.goto(origin, { waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "创建本地加密账本", exact: true })
    .waitFor();
  result.preflight = await page.evaluate(async () => ({
    cacheNames: await caches.keys(),
    serviceWorkers: (await navigator.serviceWorker.getRegistrations()).length,
    indexedDatabases:
      typeof indexedDB.databases === "function"
        ? (await indexedDB.databases()).map((database) => database.name)
        : [],
  }));
  result.preflight.preNavigationUsage = preNavigationUsage;
  result.preflight.ledgerRecordPresent = Boolean(await readRawEnvelope(page));
  ensure(
    preNavigationUsage.usage === 0,
    "origin had storage usage before first navigation",
  );
  ensure(result.preflight.cacheNames.length === 0, "origin cache is not empty");
  ensure(result.preflight.serviceWorkers === 0, "origin has service worker");
  ensure(
    result.preflight.ledgerRecordPresent === false,
    "origin ledger record is not empty",
  );

  await page.getByLabel("设置密码", { exact: true }).fill(passphrase);
  await page.getByLabel("再次输入密码", { exact: true }).fill(passphrase);
  result.passwordSetup.setup = await checkPasswordEye(page, "设置密码");
  result.passwordSetup.confirmation = await checkPasswordEye(
    page,
    "再次输入密码",
  );

  const setupInput = page.getByLabel("设置密码", { exact: true });
  const setupEye = page.getByRole("button", {
    name: "按住查看设置密码",
    exact: true,
  });
  await setupEye.dispatchEvent("pointerdown", { pointerId: 9 });
  await setupInput.evaluate((element) => {
    element.closest("form")?.requestSubmit();
  });
  await page.waitForFunction(
    () => document.querySelector('input[autocomplete="new-password"]')?.type === "password",
  );
  result.passwordSetup.submitHidImmediately = true;
  await page
    .getByRole("heading", {
      name: "Local-First Trading Ledger",
      exact: true,
    })
    .waitFor({ timeout: 30_000 });

  await addTrade(page, {
    type: "buy",
    asset: "BTC",
    quantity: "0.2",
    price: "30000",
    total: "6000",
    date: dates.d370,
  });
  await addTrade(page, {
    type: "buy",
    asset: "ETH",
    quantity: "1",
    price: "1800",
    total: "1800",
    date: dates.d45,
  });
  await addTrade(page, {
    type: "buy",
    asset: "ADA",
    quantity: "1000",
    price: "0.5",
    total: "500",
    date: dates.d10,
  });
  await addTrade(page, {
    type: "sell",
    asset: "ADA",
    quantity: "100",
    price: "0.55",
    total: "55",
    date: dates.d2,
  });
  await addTrade(page, {
    type: "buy",
    asset: "BTC",
    quantity: "0.8",
    price: "60000",
    total: "48000",
    date: dates.runToday,
  });
  await addTrade(page, {
    type: "buy",
    asset: "ETH",
    quantity: "1",
    price: "2000",
    total: "2000",
    date: dates.runToday,
  });
  await addManualPrice(page, "BTC", "70000", dates.runToday);

  result.fixture.positionRows = await positionRows(page);
  result.fixture.tradeRowCount = await tradeRowCount(page);
  result.fixture.expected = {
    BTC: { quantity: "1", costBasis: "54000" },
    ETH: { quantity: "2", costBasis: "3800" },
    ADA: { quantity: "900", costBasis: "450", realizedPnl: "5" },
  };
  ensure(result.fixture.tradeRowCount === 6, "fixture trade count mismatch");
  const rowsByAsset = Object.fromEntries(
    result.fixture.positionRows.map((row) => [row[0], row]),
  );
  ensure(rowsByAsset.BTC?.[1] === "1", "BTC quantity mismatch");
  ensure(rowsByAsset.BTC?.[3] === "54000 USD", "BTC cost basis mismatch");
  ensure(rowsByAsset.ETH?.[1] === "2", "ETH quantity mismatch");
  ensure(rowsByAsset.ETH?.[3] === "3800 USD", "ETH cost basis mismatch");
  ensure(rowsByAsset.ADA?.[1] === "900", "ADA quantity mismatch");
  ensure(rowsByAsset.ADA?.[3] === "450 USD", "ADA cost basis mismatch");
  ensure(rowsByAsset.ADA?.[4] === "5 USD", "ADA realized PnL mismatch");

  const chartSection = section(page, "账本图表");
  result.chartRendering = {
    pie: await page
      .getByRole("img", { name: "当前 USD 等值持仓分配饼图" })
      .count(),
    history: await page
      .getByRole("img", { name: "持仓总市值与持仓成本阶梯线图" })
      .count(),
    heatmap: await page
      .getByRole("img", { name: "最近 365 天交易活跃热力图" })
      .count(),
    canvasCount: await chartSection.locator("canvas").count(),
    pieSummary: await chartSection
      .getByText(/已估值 1 项，总市值 70000 USD 等值/)
      .textContent(),
    missingPriceSummary: await chartSection
      .getByText("未估值资产：ADA、ETH。", { exact: true })
      .textContent(),
  };
  ensure(result.chartRendering.pie === 1, "pie chart not rendered");
  ensure(result.chartRendering.history === 1, "history chart not rendered");
  ensure(result.chartRendering.heatmap === 1, "heatmap not rendered");
  ensure(result.chartRendering.canvasCount === 3, "chart canvases not rendered");

  for (const label of ["1日", "7日", "30日", "365日", "全部"]) {
    await chartSection.getByRole("button", { name: label, exact: true }).click();
    const historySummary = await chartSection
      .getByText(/个显示点；/)
      .textContent();
    result.ranges[label] = {
      summary: historySummary?.replace(/\s+/g, " ").trim(),
      pressed: await chartSection
        .getByRole("button", { name: label, exact: true })
        .getAttribute("aria-pressed"),
    };
    if (label === "1日") {
      result.ranges[label].boundaryNotice = await chartSection
        .getByText("无可靠日内变化，边界点仅用于显示。", { exact: true })
        .textContent();
    }
  }
  await screenshot(page, "03-production-main-wide.png");

  const heatmapCanvas = page
    .getByRole("img", { name: "最近 365 天交易活跃热力图" })
    .locator("canvas");
  const heatmapBox = await heatmapCanvas.boundingBox();
  ensure(heatmapBox, "heatmap canvas has no box");
  const heatmapStart = new Date(`${dates.runToday}T12:00:00`);
  heatmapStart.setDate(heatmapStart.getDate() - 364);
  const startMondayOffset = (heatmapStart.getDay() + 6) % 7;
  const target = new Date(`${dates.d10}T12:00:00`);
  const dayIndex = Math.round((target - heatmapStart) / 86_400_000);
  const calendarIndex = startMondayOffset + dayIndex;
  const weekIndex = Math.floor(calendarIndex / 7);
  const weekdayIndex = calendarIndex % 7;
  const left = 42;
  const right = 16;
  const top = 36;
  const cellWidth = (heatmapBox.width - left - right) / 53;
  const x = left + cellWidth * (weekIndex + 0.5);
  const y = top + 16 * (weekdayIndex + 0.5);
  await heatmapCanvas.click({ position: { x, y } });
  const filteredHeading = page.getByRole("heading", {
    name: `交易列表 · ${dates.d10}`,
    exact: true,
  });
  const heatmapClickWorked = await filteredHeading
    .isVisible()
    .catch(() => false);
  result.heatmap = {
    targetDate: dates.d10,
    clickCoordinates: { x, y },
    filteredHeadingVisible: heatmapClickWorked,
  };
  if (heatmapClickWorked) {
    const filtered = section(page, `交易列表 · ${dates.d10}`);
    result.heatmap.filteredRows = await filtered
      .locator("tbody tr")
      .evaluateAll((rows) =>
        rows.map((row) =>
          (row.textContent ?? "").replace(/\s+/g, " ").trim(),
        ),
      );
    await heatmapCanvas.click({ position: { x, y } });
    result.heatmap.cancelledBySecondClick = await page
      .getByRole("heading", { name: "交易列表", exact: true })
      .isVisible();
  }

  const market = section(page, "图表总览与 Binance 行情");
  await market.getByText("配置 Binance Spot 交易对", { exact: true }).click();
  const mappingOutcomes = {};
  for (const [asset, symbol] of [
    ["BTC", "BTCUSDT"],
    ["ETH", "ETHUSDT"],
    ["ADA", "ADAUSDT"],
  ]) {
    const input = market.getByLabel(asset, { exact: true });
    const row = input.locator("xpath=..");
    await input.fill(symbol);
    await row.getByRole("button", { name: "验证并保存", exact: true }).click();
    await row
      .getByText(/交易对已验证并加入保存队列|Binance|请求|网络|超时|失败|限流/)
      .waitFor({ timeout: 15_000 })
      .catch(() => {});
    mappingOutcomes[asset] = (await row.textContent())
      ?.replace(/\s+/g, " ")
      .trim();
    if (mappingOutcomes[asset]?.includes("交易对已验证并加入保存队列")) {
      await waitForSaved(page);
    }
  }
  result.binance.mappingOutcomes = mappingOutcomes;
  const anyMappingSucceeded = Object.values(mappingOutcomes).some((value) =>
    value?.includes("交易对已验证并加入保存队列"),
  );
  if (anyMappingSucceeded) {
    await market
      .getByRole("button", { name: "刷新 Binance 价格", exact: true })
      .click();
    await market
      .getByText(/已更新 \d+ 项，失败 \d+ 项。|本次刷新失败/)
      .waitFor({ timeout: 15_000 })
      .catch(() => {});
    result.binance.refreshText = (await market.textContent())
      ?.replace(/\s+/g, " ")
      .trim();
    result.binance.priceLines = await market.locator("li").allTextContents();
    result.binance.autoPositionRows = await positionRows(page);
    await market
      .getByRole("button", { name: "手动价格", exact: true })
      .click();
    result.binance.manualPositionRows = await positionRows(page);
    await market
      .getByRole("button", { name: "自动行情", exact: true })
      .click();
  }
  result.binance.networkEvidence = result.network;

  const tradeList = section(page, "交易列表");
  const safeDelete = tradeList.getByRole("button", {
    name: `删除 买入 ETH ${dates.runToday}`,
    exact: true,
  });
  const beforeDeleteRows = await tradeRowCount(page);
  await safeDelete.click();
  const afterFirstRows = await tradeRowCount(page);
  const firstArmed = await safeDelete.getAttribute("aria-pressed");
  const firstBusy = await safeDelete.getAttribute("aria-busy");
  await page.locator("header").click();
  const afterOutsideRows = await tradeRowCount(page);
  const outsideCancelled = await safeDelete.getAttribute("aria-pressed");
  await safeDelete.click();
  await page.keyboard.press("Escape");
  const escapeCancelled = await safeDelete.getAttribute("aria-pressed");
  await safeDelete.focus();
  await page.keyboard.down("Enter");
  await safeDelete.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    repeat: true,
  });
  await page.keyboard.up("Enter");
  const afterRepeatRows = await tradeRowCount(page);
  const afterRepeatArmed = await safeDelete.getAttribute("aria-pressed");
  if (afterRepeatArmed === "true") {
    await page.keyboard.press("Escape");
  }
  await safeDelete.click();
  await safeDelete.click();
  await waitForSaved(page);
  const afterSafeDeleteRows = await tradeRowCount(page);
  ensure(afterSafeDeleteRows === beforeDeleteRows - 1, "safe delete did not occur");

  const dependentDelete = tradeList.getByRole("button", {
    name: `删除 买入 ADA ${dates.d10}`,
    exact: true,
  });
  await dependentDelete.click();
  await dependentDelete.click();
  const dependentError = await tradeList
    .getByText(
      "无法删除：这笔交易支撑了后续卖出，请先删除依赖它的后续卖出",
      { exact: true },
    )
    .textContent();
  const afterRejectedRows = await tradeRowCount(page);
  const clearButtonExists =
    (await page
      .getByRole("button", { name: "清空本地账本", exact: true })
      .count()) === 1;
  result.deletion = {
    beforeDeleteRows,
    afterFirstRows,
    firstArmed,
    firstBusy,
    afterOutsideRows,
    outsideCancelled,
    escapeCancelled,
    afterRepeatRows,
    afterRepeatArmed,
    afterSafeDeleteRows,
    dependentError,
    afterRejectedRows,
    clearButtonExists,
  };
  ensure(afterFirstRows === beforeDeleteRows, "first click deleted a trade");
  ensure(afterOutsideRows === beforeDeleteRows, "outside click deleted a trade");
  ensure(afterRepeatRows === beforeDeleteRows, "key repeat deleted a trade");
  ensure(afterRejectedRows === afterSafeDeleteRows, "dependent delete occurred");
  ensure(clearButtonExists, "fixed-text clear control missing");

  await addTrade(page, {
    type: "buy",
    asset: "ETH",
    quantity: "1",
    price: "2000",
    total: "2000",
    date: dates.runToday,
  });

  const dataManagement = section(page, "数据管理");
  const warningText = (
    await dataManagement.locator("p").first().locator("xpath=following-sibling::div[1]/p[1]").textContent()
  )
    ?.replace(/\s+/g, " ")
    .trim();
  result.backup.permanentWarningText = warningText;
  result.backup.warningChecks = {
    fullLedger:
      warningText?.includes("完整资产、交易和价格") === true ||
      warningText?.includes("完整账本") === true,
    plaintext:
      warningText?.includes("未加密明文") === true ||
      warningText?.includes("明文、未加密") === true,
    appDoesNotUpload:
      warningText?.includes("本应用不主动上传") === true ||
      warningText?.includes("不会主动上传") === true,
    syncDirectoryRisk:
      warningText?.includes("同步目录") === true &&
      warningText?.includes("同步") === true,
  };

  const exportButton = dataManagement.getByRole("button", {
    name: "导出完整账本备份",
    exact: true,
  });
  const downloadPromise = page.waitForEvent("download");
  await exportButton.click();
  const download = await downloadPromise;
  const suggestedFilename = download.suggestedFilename();
  const savedBackupPath = path.join(downloadDir, suggestedFilename);
  await download.saveAs(savedBackupPath);
  const downloadFailure = await download.failure();
  ensure(downloadFailure === null, `backup download failed: ${downloadFailure}`);
  const backupBytes = await readFile(savedBackupPath);
  const backupJson = JSON.parse(backupBytes.toString("utf8"));
  const exportMessage = (
    await dataManagement
      .getByText(/已发起.*备份下载/)
      .textContent()
  )
    ?.replace(/\s+/g, " ")
    .trim();
  const serializedBackup = JSON.stringify(backupJson);
  const forbiddenBackupMarkers = {
    position: /"positions?"\s*:/.test(serializedBackup),
    chart: /"chart/i.test(serializedBackup),
    password: /"password"|"passphrase"|CryptoKey/i.test(serializedBackup),
    armed: /"armed"/i.test(serializedBackup),
    reveal: /isRevealed|passwordDisplay/i.test(serializedBackup),
  };
  result.backup.download = {
    suggestedFilename,
    savedPath: savedBackupPath,
    size: (await stat(savedBackupPath)).size,
    sha256: sha256(backupBytes),
    failure: downloadFailure,
    topLevelKeys: Object.keys(backupJson).sort(),
    ledgerDataKeys: Object.keys(backupJson.ledgerData ?? {}).sort(),
    tradeCount: backupJson.ledgerData?.trades?.length,
    priceSnapshotCount: backupJson.ledgerData?.priceSnapshots?.length,
    mappings: (backupJson.ledgerData?.assets ?? []).map((asset) => ({
      symbol: asset.symbol,
      mapping: asset.binanceMapping?.symbol ?? null,
    })),
    forbiddenBackupMarkers,
    exportMessage,
    messageClaimsSaved:
      exportMessage?.includes("成功保存") === true ||
      exportMessage?.includes("已保存到") === true,
  };
  ensure(suggestedFilename.endsWith(".json"), "backup filename is not JSON");
  ensure(backupJson.formatVersion === 1, "backup is not V1");
  ensure(backupJson.ledgerSchemaVersion === 1, "backup schema version mismatch");
  ensure(backupJson.ledgerData?.trades?.length === 6, "backup trade count mismatch");
  ensure(
    Object.values(forbiddenBackupMarkers).every((value) => value === false),
    "backup contains a forbidden derived or UI field",
  );
  ensure(!result.backup.download.messageClaimsSaved, "export message claims save success");
  await screenshot(page, "04-production-backup-downloaded.png");

  await dataManagement
    .getByRole("button", { name: "清空本地账本", exact: true })
    .click();
  const clearInput = dataManagement.getByLabel("输入清空确认文本", {
    exact: true,
  });
  await clearInput.fill("清空本地账");
  await dataManagement
    .getByRole("button", { name: "确认永久清空", exact: true })
    .click();
  const incompleteClearError = await dataManagement
    .getByText("请输入完整确认文本“清空本地账本”", { exact: true })
    .textContent();
  await clearInput.fill("清空本地账本");
  await dataManagement
    .getByRole("button", { name: "确认永久清空", exact: true })
    .click();
  await dataManagement
    .getByText("账本已清空", { exact: true })
    .waitFor({ timeout: 30_000 });
  result.backup.clear = {
    incompleteClearError,
    rowsAfterClear: await tradeRowCount(page),
  };

  const fileInput = dataManagement.getByLabel("选择账本备份文件", {
    exact: true,
  });
  await fileInput.setInputFiles(savedBackupPath);
  const importWarning = (
    await dataManagement
      .getByText(/导入将完整覆盖当前账本，不合并数据/)
      .textContent()
  )
    ?.replace(/\s+/g, " ")
    .trim();
  const selectedFileWarning = (
    await dataManagement
      .getByText(/你选择的原备份文件仍是未加密明文/)
      .textContent()
  )
    ?.replace(/\s+/g, " ")
    .trim();
  await dataManagement
    .getByRole("button", { name: "确认恢复备份", exact: true })
    .click();
  await dataManagement
    .getByText("备份已恢复并保存到本地。", { exact: true })
    .waitFor({ timeout: 30_000 });
  result.backup.import = {
    importWarning,
    selectedFileWarning,
    rowsAfterImport: await tradeRowCount(page),
    positionRowsAfterImport: await positionRows(page),
  };
  ensure(result.backup.import.rowsAfterImport === 6, "import did not restore trades");

  const envelopeBefore = await readRawEnvelope(page);
  result.encryptedStorage.before = await inspectEnvelope(envelopeBefore);
  ensure(
    JSON.stringify(result.encryptedStorage.before.topLevelKeys) ===
      JSON.stringify(
        [
          "cipher",
          "ciphertextBase64Url",
          "cryptoVersion",
          "formatVersion",
          "kdf",
          "ledgerSchemaVersion",
        ].sort(),
      ),
    "V2 top-level field set mismatch",
  );
  ensure(
    JSON.stringify(result.encryptedStorage.before.kdfKeys) ===
      JSON.stringify(
        ["hash", "iterations", "name", "saltBase64Url"].sort(),
      ),
    "V2 kdf field set mismatch",
  );
  ensure(
    JSON.stringify(result.encryptedStorage.before.cipherKeys) ===
      JSON.stringify(
        ["ivBase64Url", "keyLength", "name", "tagLength"].sort(),
      ),
    "V2 cipher field set mismatch",
  );
  ensure(result.encryptedStorage.before.formatVersion === 2, "formatVersion mismatch");
  ensure(result.encryptedStorage.before.cryptoVersion === 1, "cryptoVersion mismatch");
  ensure(
    result.encryptedStorage.before.ledgerSchemaVersion === 1,
    "ledgerSchemaVersion mismatch",
  );
  ensure(result.encryptedStorage.before.kdf.name === "PBKDF2", "KDF mismatch");
  ensure(result.encryptedStorage.before.kdf.hash === "SHA-256", "KDF hash mismatch");
  ensure(
    result.encryptedStorage.before.kdf.iterations === 600000,
    "KDF iterations mismatch",
  );
  ensure(result.encryptedStorage.before.cipher.name === "AES-GCM", "cipher mismatch");
  ensure(result.encryptedStorage.before.cipher.keyLength === 256, "key length mismatch");
  ensure(result.encryptedStorage.before.cipher.tagLength === 128, "tag length mismatch");
  ensure(
    result.encryptedStorage.before.plaintextMarkersAbsent,
    "V2 contains plaintext markers",
  );

  await addTrade(page, {
    type: "buy",
    asset: "BTC",
    quantity: "0.01",
    price: "61000",
    total: "610",
    date: dates.runToday,
  });
  const envelopeAfter = await readRawEnvelope(page);
  result.encryptedStorage.afterMutation = await inspectEnvelope(envelopeAfter);
  result.encryptedStorage.changed = {
    iv:
      result.encryptedStorage.before.ivSha256 !==
      result.encryptedStorage.afterMutation.ivSha256,
    ciphertext:
      result.encryptedStorage.before.ciphertextSha256 !==
      result.encryptedStorage.afterMutation.ciphertextSha256,
  };
  ensure(result.encryptedStorage.changed.iv, "IV did not change after mutation");
  ensure(
    result.encryptedStorage.changed.ciphertext,
    "ciphertext did not change after mutation",
  );
  const temporaryTrade = section(page, "交易列表").getByRole("button", {
    name: `删除 买入 BTC ${dates.runToday}`,
    exact: true,
  });
  const temporaryTradeCount = await temporaryTrade.count();
  const temporaryDeleteButton = temporaryTrade.nth(temporaryTradeCount - 1);
  await temporaryDeleteButton.click();
  await temporaryDeleteButton.click();
  await waitForSaved(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const mobileMetrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));
  const mobileTable = section(page, "资产汇总").locator(".overflow-x-auto");
  const mobileTableMetrics = await mobileTable.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    overflowX: getComputedStyle(element).overflowX,
  }));
  const reducedButton = section(page, "交易列表").getByRole("button", {
    name: `删除 买入 ETH ${dates.runToday}`,
    exact: true,
  });
  const reducedBefore = await reducedButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      transitionProperty: style.transitionProperty,
      transitionDuration: style.transitionDuration,
      transform: style.transform,
    };
  });
  await reducedButton.click();
  const reducedArmed = await reducedButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      pressed: element.getAttribute("aria-pressed"),
      transitionProperty: style.transitionProperty,
      transitionDuration: style.transitionDuration,
      transform: style.transform,
    };
  });
  await page.keyboard.press("Escape");
  const reducedCancelled = await reducedButton.getAttribute("aria-pressed");
  await reducedButton.click();
  await reducedButton.click();
  await waitForSaved(page);
  const reducedAfterDeleteRows = await tradeRowCount(page);
  result.responsive.mobile = {
    viewport: { width: 390, height: 844 },
    ...mobileMetrics,
    table: mobileTableMetrics,
    deleteBefore: reducedBefore,
    deleteArmed: reducedArmed,
    deleteCancelled: reducedCancelled,
    rowsAfterDelete: reducedAfterDeleteRows,
  };
  ensure(mobileMetrics.scrollWidth <= mobileMetrics.clientWidth, "mobile page overflows");
  ensure(mobileMetrics.reducedMotion, "reduced motion is not active");
  ensure(
    reducedArmed.transitionDuration === "0s" &&
      reducedArmed.transform === "none",
    "reduced-motion armed button still animates",
  );
  await screenshot(page, "05-production-mobile-reduced-motion.png");
  await addTrade(page, {
    type: "buy",
    asset: "ETH",
    quantity: "1",
    price: "2000",
    total: "2000",
    date: dates.runToday,
  });

  await page.setViewportSize({ width: 1280, height: 720 });
  const desktopMetrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));
  result.responsive.desktop = {
    viewport: { width: 1280, height: 720 },
    ...desktopMetrics,
  };
  ensure(
    desktopMetrics.scrollWidth <= desktopMetrics.clientWidth,
    "desktop page overflows",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });

  const ordinaryDownloadPromise = page.waitForEvent("download");
  await dataManagement
    .getByRole("button", { name: "导出完整账本备份", exact: true })
    .click();
  const ordinaryDownload = await ordinaryDownloadPromise;
  const ordinaryFilename = `t5-03-${ordinaryDownload.suggestedFilename()}`;
  const ordinaryPath = path.join(downloadDir, ordinaryFilename);
  await ordinaryDownload.saveAs(ordinaryPath);
  const ordinaryFailure = await ordinaryDownload.failure();
  const ordinaryBytes = await readFile(ordinaryPath);
  const ordinaryJson = JSON.parse(ordinaryBytes.toString("utf8"));
  result.backup.t5Ordinary = {
    suggestedFilename: ordinaryDownload.suggestedFilename(),
    savedFilename: ordinaryFilename,
    size: ordinaryBytes.length,
    sha256: sha256(ordinaryBytes),
    failure: ordinaryFailure,
    formatVersion: ordinaryJson.formatVersion,
    ledgerSchemaVersion: ordinaryJson.ledgerSchemaVersion,
    tradeCount: ordinaryJson.ledgerData?.trades?.length,
    distinctFromV2:
      ordinaryJson.formatVersion === 1 &&
      result.encryptedStorage.before.formatVersion === 2,
  };
  ensure(ordinaryFailure === null, "T5-03 download failed");
  ensure(ordinaryJson.formatVersion === 1, "T5-03 backup is not V1");
  await screenshot(page, "06-production-desktop-final.png");

  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "解锁本地账本", exact: true })
    .waitFor();
  const unlockInput = page.getByLabel("账本密码", { exact: true });
  await unlockInput.fill(passphrase);
  result.unlock.passwordEye = await checkPasswordEye(page, "账本密码");
  await page.getByRole("button", { name: "解锁账本", exact: true }).click();
  await page
    .getByRole("heading", {
      name: "Local-First Trading Ledger",
      exact: true,
    })
    .waitFor({ timeout: 30_000 });
  result.unlock = {
    ...result.unlock,
    lockedAfterReload: true,
    tradeRowsAfterUnlock: await tradeRowCount(page),
    positionRowsAfterUnlock: await positionRows(page),
    mappingInputsAfterUnlock: await section(
      page,
      "图表总览与 Binance 行情",
    )
      .locator("details input")
      .inputValues(),
  };
  ensure(result.unlock.tradeRowsAfterUnlock === 6, "unlock did not restore trades");
  await screenshot(page, "07-production-post-unlock.png");

  result.console.unexplainedWarningOrError =
    result.console.warnings.length +
      result.console.errors.length +
      result.console.pageErrors.length >
    0;
  result.completed = true;
} catch (error) {
  result.completed = false;
  result.failure = {
    name: error?.name ?? "Error",
    message: error?.message ?? String(error),
    stack: error?.stack ?? "",
  };
  throw error;
} finally {
  await writeFile(
    path.join(evidenceDir, "13-production-remaining-focused.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  await context.close();
}
