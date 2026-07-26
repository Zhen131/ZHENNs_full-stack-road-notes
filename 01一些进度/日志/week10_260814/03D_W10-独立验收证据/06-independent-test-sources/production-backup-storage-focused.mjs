import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const origin = process.env.LEDGER_ORIGIN;
const chromeExecutable = process.env.CHROME_EXECUTABLE;
const userDataDir = process.env.CHROME_USER_DATA_DIR;
const evidenceDir = process.env.EVIDENCE_DIR;
const debugPort = Number(process.env.CHROME_DEBUG_PORT);
if (!origin || !chromeExecutable || !userDataDir || !evidenceDir) {
  throw new Error("Missing isolated-browser environment");
}

const downloadDir = path.join(evidenceDir, "07-browser-downloads");
const screenshotDir = path.join(evidenceDir, "10-screenshots");
await mkdir(downloadDir, { recursive: true });
await mkdir(screenshotDir, { recursive: true });
const passphrase = randomBytes(24).toString("base64url");
const result = {
  identity: {
    origin,
    scope: "T1-05, T5-01, T5-02, T5-03 only; does not rejudge T1-02/T1-03/T1-04",
    passwordLogged: false,
  },
  preflight: {},
  data: {},
  binance: {},
  backup: {},
  storage: {},
  responsive: {},
  unlock: {},
  console: { warnings: [], errors: [], pageErrors: [] },
  network: [],
  screenshots: [],
};

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}
function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
function section(page, heading) {
  return page
    .getByRole("heading", { name: heading, exact: true })
    .locator("xpath=ancestor::section[1]");
}
async function waitSaved(page) {
  await page.getByText("已保存到本地", { exact: true }).waitFor({
    state: "visible",
    timeout: 30_000,
  });
}
async function screenshot(page, filename) {
  await page.screenshot({
    path: path.join(screenshotDir, filename),
    fullPage: true,
  });
  result.screenshots.push(filename);
}
async function countTrades(page) {
  return section(page, "交易列表").locator("tbody tr").count();
}
async function addTrade(page, trade) {
  const target = section(page, "新增交易");
  await target.locator("select").nth(0).selectOption(trade.type);
  await target.locator("select").nth(1).selectOption(trade.asset);
  const values = [trade.quantity, trade.price, trade.total, trade.date, "0"];
  for (let index = 0; index < values.length; index += 1) {
    await target.locator("input").nth(index).fill(values[index]);
  }
  await target.getByRole("button", { name: "保存交易", exact: true }).click();
  await target.getByText("交易已加入账本", { exact: true }).waitFor();
  await waitSaved(page);
}
async function addPrice(page, asset, priceValue, date) {
  const target = section(page, "价格输入");
  await target.locator("select").selectOption(asset);
  await target.locator("input").nth(0).fill(priceValue);
  await target.locator("input").nth(2).fill(date);
  await target.getByRole("button", { name: "保存价格", exact: true }).click();
  await target.getByText("价格已加入账本", { exact: true }).waitFor();
  await waitSaved(page);
}
async function rawEnvelope(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("local-first-trading-ledger");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const database = open.result;
          const get = database
            .transaction("ledger", "readonly")
            .objectStore("ledger")
            .get("ledger:v1");
          get.onerror = () => reject(get.error);
          get.onsuccess = () => {
            database.close();
            resolve(get.result);
          };
        };
      }),
  );
}
function envelopeSummary(envelope) {
  const serialized = JSON.stringify(envelope);
  return {
    topKeys: Object.keys(envelope ?? {}).sort(),
    kdfKeys: Object.keys(envelope?.kdf ?? {}).sort(),
    cipherKeys: Object.keys(envelope?.cipher ?? {}).sort(),
    formatVersion: envelope?.formatVersion,
    cryptoVersion: envelope?.cryptoVersion,
    ledgerSchemaVersion: envelope?.ledgerSchemaVersion,
    kdf: {
      name: envelope?.kdf?.name,
      hash: envelope?.kdf?.hash,
      iterations: envelope?.kdf?.iterations,
    },
    cipher: {
      name: envelope?.cipher?.name,
      keyLength: envelope?.cipher?.keyLength,
      tagLength: envelope?.cipher?.tagLength,
    },
    ivHash: sha256(Buffer.from(envelope?.cipher?.ivBase64Url ?? "")),
    ciphertextHash: sha256(
      Buffer.from(envelope?.ciphertextBase64Url ?? ""),
    ),
    plaintextAbsent: ![
      "BTC",
      "ETH",
      "70000",
      "BTCUSDT",
      "password",
      "passphrase",
    ].some((marker) => serialized.includes(marker)),
    rawSecretMaterialRecorded: false,
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
    "--password-store=basic",
    "--use-mock-keychain",
    "--remote-debugging-address=127.0.0.1",
    `--remote-debugging-port=${debugPort}`,
  ],
});

try {
  const page = context.pages()[0] ?? (await context.newPage());
  const cdp = await context.newCDPSession(page);
  result.preflight.storageBeforeNavigation = await cdp.send(
    "Storage.getUsageAndQuota",
    { origin },
  );
  page.on("console", (message) => {
    if (message.type() === "warning") result.console.warnings.push(message.text());
    if (message.type() === "error") result.console.errors.push(message.text());
  });
  page.on("pageerror", (error) => result.console.pageErrors.push(String(error)));
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
        kind: "failed",
        method: request.method(),
        url: request.url(),
        error: request.failure()?.errorText,
      });
    }
  });

  await page.goto(origin, { waitUntil: "networkidle" });
  await page.getByRole("heading", {
    name: "创建本地加密账本",
    exact: true,
  }).waitFor();
  result.preflight.afterNavigation = await page.evaluate(async () => ({
    caches: await caches.keys(),
    serviceWorkers: (await navigator.serviceWorker.getRegistrations()).length,
  }));
  result.preflight.ledgerRecordPresent = Boolean(await rawEnvelope(page));
  ensure(
    result.preflight.storageBeforeNavigation.usage === 0,
    "fresh origin has pre-navigation storage",
  );
  ensure(result.preflight.afterNavigation.caches.length === 0, "cache exists");
  ensure(
    result.preflight.afterNavigation.serviceWorkers === 0,
    "service worker exists",
  );
  ensure(!result.preflight.ledgerRecordPresent, "ledger record exists");

  await page.getByLabel("设置密码", { exact: true }).fill(passphrase);
  await page.getByLabel("再次输入密码", { exact: true }).fill(passphrase);
  await page.getByRole("button", {
    name: "创建加密账本",
    exact: true,
  }).click();
  await page.getByRole("heading", {
    name: "Local-First Trading Ledger",
    exact: true,
  }).waitFor({ timeout: 30_000 });

  await addTrade(page, {
    type: "buy",
    asset: "BTC",
    quantity: "1",
    price: "50000",
    total: "50000",
    date: "2026-07-24",
  });
  await addTrade(page, {
    type: "buy",
    asset: "ETH",
    quantity: "2",
    price: "1800",
    total: "3600",
    date: "2026-07-16",
  });
  await addPrice(page, "BTC", "70000", "2026-07-26");
  result.data.beforeBackupTradeCount = await countTrades(page);

  const market = section(page, "图表总览与 Binance 行情");
  await market.getByText("配置 Binance Spot 交易对", { exact: true }).click();
  const btcInput = market.getByLabel("BTC", { exact: true });
  const btcRow = btcInput.locator("xpath=..");
  await btcInput.fill("BTCUSDT");
  await btcRow.getByRole("button", {
    name: "验证并保存",
    exact: true,
  }).click();
  await page.waitForFunction(() => {
    const label = Array.from(document.querySelectorAll("label")).find(
      (candidate) => candidate.textContent?.trim() === "BTC",
    );
    const row = label?.parentElement;
    const text = row?.textContent ?? "";
    return !text.includes("正在向 Binance 验证交易对");
  }, { timeout: 15_000 }).catch(() => {});
  result.binance.mappingText = (await btcRow.textContent())
    ?.replace(/\s+/g, " ")
    .trim();
  result.binance.mappingSucceeded =
    result.binance.mappingText?.includes("交易对已验证并加入保存队列") === true;
  result.binance.mappingAvailable =
    result.binance.mappingSucceeded ||
    result.binance.mappingText?.includes("交易对未发生变化") === true;
  if (result.binance.mappingAvailable) {
    if (result.binance.mappingSucceeded) {
      await waitSaved(page);
    }
    await market.getByRole("button", {
      name: "刷新 Binance 价格",
      exact: true,
    }).click();
    await page.waitForFunction(() => {
      const text = document.body.textContent ?? "";
      return /已更新 \d+ 项，失败 \d+ 项。/.test(text);
    }, { timeout: 15_000 }).catch(() => {});
    result.binance.refreshText = (await market.textContent())
      ?.replace(/\s+/g, " ")
      .trim();
    result.binance.priceLines = await market.locator("li").allTextContents();
  }
  result.binance.network = result.network;

  const dataManagement = section(page, "数据管理");
  const warningText = (
    await dataManagement.getByText(/账本备份是未加密明文/).textContent()
  )?.replace(/\s+/g, " ").trim();
  result.backup.warning = {
    text: warningText,
    fullLedger: warningText?.includes("完整资产、交易和价格") === true,
    plaintext: warningText?.includes("未加密明文") === true,
    appDoesNotUpload:
      warningText?.includes("本应用不主动上传") === true ||
      warningText?.includes("不会主动上传") === true,
    syncRisk:
      warningText?.includes("同步目录") === true &&
      warningText?.includes("同步") === true,
  };

  const firstDownloadEvent = page.waitForEvent("download");
  await dataManagement.getByRole("button", {
    name: "导出完整账本备份",
    exact: true,
  }).click();
  const firstDownload = await firstDownloadEvent;
  const firstName = firstDownload.suggestedFilename();
  const firstPath = path.join(downloadDir, firstName);
  await firstDownload.saveAs(firstPath);
  const firstFailure = await firstDownload.failure();
  const firstBytes = await readFile(firstPath);
  const firstJson = JSON.parse(firstBytes.toString("utf8"));
  const firstSerialized = JSON.stringify(firstJson);
  const exportMessage = (
    await dataManagement.getByText(/已发起.*备份下载/).textContent()
  )?.replace(/\s+/g, " ").trim();
  result.backup.firstDownload = {
    suggestedFilename: firstName,
    savedPath: firstPath,
    size: (await stat(firstPath)).size,
    sha256: sha256(firstBytes),
    failure: firstFailure,
    backupFormatVersion: firstJson.backupFormatVersion,
    ledgerSchemaVersion: firstJson.ledgerSchemaVersion,
    topKeys: Object.keys(firstJson).sort(),
    ledgerDataKeys: Object.keys(firstJson.ledgerData ?? {}).sort(),
    tradeCount: firstJson.ledgerData?.trades?.length,
    priceCount: firstJson.ledgerData?.priceSnapshots?.length,
    mappings: (firstJson.ledgerData?.assets ?? []).map((asset) => ({
      symbol: asset.symbol,
      mapping: asset.binanceMapping?.symbol ?? null,
    })),
    forbidden: {
      positions: /"positions?"\s*:/.test(firstSerialized),
      charts: /"chart/i.test(firstSerialized),
      password: /password|passphrase|CryptoKey/i.test(firstSerialized),
      armed: /"armed"/i.test(firstSerialized),
      revealed: /isRevealed|passwordDisplay/i.test(firstSerialized),
    },
    exportMessage,
    claimsSaveSuccess:
      exportMessage?.includes("成功保存") === true ||
      exportMessage?.includes("已保存到") === true,
  };
  ensure(firstFailure === null, "first backup download failed");
  ensure(firstJson.backupFormatVersion === 1, "first backup is not V1");
  ensure(firstJson.ledgerSchemaVersion === 1, "backup schema mismatch");
  ensure(firstJson.ledgerData?.trades?.length === 2, "backup trade count mismatch");
  ensure(
    Object.values(result.backup.firstDownload.forbidden).every(
      (value) => value === false,
    ),
    "backup contains forbidden UI/derived/security state",
  );
  ensure(!result.backup.firstDownload.claimsSaveSuccess, "export claims saved");
  await screenshot(page, "04-production-backup-focused.png");

  await dataManagement.getByRole("button", {
    name: "清空本地账本",
    exact: true,
  }).click();
  const clearInput = dataManagement.getByLabel("输入清空确认文本", {
    exact: true,
  });
  await clearInput.fill("清空本地账");
  await dataManagement.getByRole("button", {
    name: "确认永久清空",
    exact: true,
  }).click();
  result.backup.incompleteClearError = await dataManagement
    .getByText("请输入完整确认文本“清空本地账本”", { exact: true })
    .textContent();
  await clearInput.fill("清空本地账本");
  await dataManagement.getByRole("button", {
    name: "确认永久清空",
    exact: true,
  }).click();
  await dataManagement.getByText("账本已清空", { exact: true }).waitFor({
    timeout: 30_000,
  });
  result.backup.tradeCountAfterClear = await countTrades(page);

  await dataManagement.getByLabel("选择账本备份文件", {
    exact: true,
  }).setInputFiles(firstPath);
  result.backup.importOverwriteWarning = (
    await dataManagement.getByText(/导入将完整覆盖当前账本，不合并数据/).textContent()
  )?.replace(/\s+/g, " ").trim();
  result.backup.originalFileWarning = (
    await dataManagement.getByText(/你选择的原备份文件仍是未加密明文/).textContent()
  )?.replace(/\s+/g, " ").trim();
  await dataManagement.getByRole("button", {
    name: "确认恢复备份",
    exact: true,
  }).click();
  await dataManagement.getByText("备份已恢复并保存到本地。", {
    exact: true,
  }).waitFor({ timeout: 30_000 });
  result.backup.tradeCountAfterImport = await countTrades(page);
  ensure(result.backup.tradeCountAfterImport === 2, "import did not restore trades");

  const beforeMutation = envelopeSummary(await rawEnvelope(page));
  const expectedTop = [
    "cipher",
    "ciphertextBase64Url",
    "cryptoVersion",
    "formatVersion",
    "kdf",
    "ledgerSchemaVersion",
  ].sort();
  const expectedKdf = ["hash", "iterations", "name", "saltBase64Url"].sort();
  const expectedCipher = ["ivBase64Url", "keyLength", "name", "tagLength"].sort();
  result.storage.beforeMutation = beforeMutation;
  ensure(
    JSON.stringify(beforeMutation.topKeys) === JSON.stringify(expectedTop),
    "V2 top keys mismatch",
  );
  ensure(
    JSON.stringify(beforeMutation.kdfKeys) === JSON.stringify(expectedKdf),
    "V2 KDF keys mismatch",
  );
  ensure(
    JSON.stringify(beforeMutation.cipherKeys) === JSON.stringify(expectedCipher),
    "V2 cipher keys mismatch",
  );
  ensure(beforeMutation.formatVersion === 2, "V2 formatVersion mismatch");
  ensure(beforeMutation.cryptoVersion === 1, "V2 cryptoVersion mismatch");
  ensure(beforeMutation.ledgerSchemaVersion === 1, "V2 schema mismatch");
  ensure(
    beforeMutation.kdf.name === "PBKDF2" &&
      beforeMutation.kdf.hash === "SHA-256" &&
      beforeMutation.kdf.iterations === 600000,
    "V2 KDF parameters mismatch",
  );
  ensure(
    beforeMutation.cipher.name === "AES-GCM" &&
      beforeMutation.cipher.keyLength === 256 &&
      beforeMutation.cipher.tagLength === 128,
    "V2 cipher parameters mismatch",
  );
  ensure(beforeMutation.plaintextAbsent, "V2 contains plaintext markers");

  await addTrade(page, {
    type: "buy",
    asset: "BTC",
    quantity: "0.01",
    price: "61000",
    total: "610",
    date: "2026-07-26",
  });
  const afterMutation = envelopeSummary(await rawEnvelope(page));
  result.storage.afterMutation = afterMutation;
  result.storage.changed = {
    iv: beforeMutation.ivHash !== afterMutation.ivHash,
    ciphertext: beforeMutation.ciphertextHash !== afterMutation.ciphertextHash,
  };
  ensure(result.storage.changed.iv, "IV did not change");
  ensure(result.storage.changed.ciphertext, "ciphertext did not change");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const mobile = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));
  const tableMetrics = await section(page, "资产汇总")
    .locator(".overflow-x-auto")
    .evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      overflowX: getComputedStyle(element).overflowX,
    }));
  const deleteButton = section(page, "交易列表").getByRole("button", {
    name: "删除 买入 BTC 2026-07-26",
    exact: true,
  });
  const rowsBeforeDelete = await countTrades(page);
  await deleteButton.click();
  const armedStyle = await deleteButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      pressed: element.getAttribute("aria-pressed"),
      transitionProperty: style.transitionProperty,
      transitionDuration: style.transitionDuration,
      transform: style.transform,
    };
  });
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () =>
      document.querySelector(
        'button[aria-label="删除 买入 BTC 2026-07-26"]',
      )?.getAttribute("aria-pressed") === "false",
  );
  const afterCancelRows = await countTrades(page);
  await deleteButton.click();
  await page.waitForFunction(
    () =>
      document.querySelector(
        'button[aria-label="删除 买入 BTC 2026-07-26"]',
      )?.getAttribute("aria-pressed") === "true",
  );
  await deleteButton.click();
  await waitSaved(page);
  const rowsAfterDelete = await countTrades(page);
  result.responsive.mobile = {
    ...mobile,
    table: tableMetrics,
    armedStyle,
    rowsBeforeDelete,
    afterCancelRows,
    rowsAfterDelete,
  };
  ensure(mobile.scrollWidth <= mobile.clientWidth, "mobile page overflows");
  ensure(mobile.reducedMotion, "reduced motion is false");
  ensure(
    armedStyle.transitionDuration === "0s" && armedStyle.transform === "none",
    "reduced motion button still animates",
  );
  ensure(afterCancelRows === rowsBeforeDelete, "Escape deleted trade");
  ensure(rowsAfterDelete === rowsBeforeDelete - 1, "two-click delete failed");
  await screenshot(page, "05-production-backup-mobile-reduced.png");

  await page.setViewportSize({ width: 1280, height: 720 });
  result.responsive.desktop = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  ensure(
    result.responsive.desktop.scrollWidth <=
      result.responsive.desktop.clientWidth,
    "desktop page overflows",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });

  const ordinaryEvent = page.waitForEvent("download");
  await dataManagement.getByRole("button", {
    name: "导出完整账本备份",
    exact: true,
  }).click();
  const ordinary = await ordinaryEvent;
  const ordinaryName = `t5-03-${ordinary.suggestedFilename()}`;
  const ordinaryPath = path.join(downloadDir, ordinaryName);
  await ordinary.saveAs(ordinaryPath);
  const ordinaryFailure = await ordinary.failure();
  const ordinaryBytes = await readFile(ordinaryPath);
  const ordinaryJson = JSON.parse(ordinaryBytes.toString("utf8"));
  result.backup.t5Ordinary = {
    suggestedFilename: ordinary.suggestedFilename(),
    savedFilename: ordinaryName,
    size: ordinaryBytes.length,
    sha256: sha256(ordinaryBytes),
    failure: ordinaryFailure,
    backupFormatVersion: ordinaryJson.backupFormatVersion,
    ledgerSchemaVersion: ordinaryJson.ledgerSchemaVersion,
    distinctFromV2:
      ordinaryJson.backupFormatVersion === 1 &&
      beforeMutation.formatVersion === 2,
  };
  ensure(ordinaryFailure === null, "T5-03 download failed");
  ensure(ordinaryJson.backupFormatVersion === 1, "T5-03 is not V1");
  await screenshot(page, "06-production-backup-desktop.png");

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", {
    name: "解锁本地账本",
    exact: true,
  }).waitFor();
  const unlockInput = page.getByLabel("账本密码", { exact: true });
  const unlockEye = page.getByRole("button", {
    name: "按住查看账本密码",
    exact: true,
  });
  await unlockInput.fill(passphrase);
  const defaultType = await unlockInput.getAttribute("type");
  await unlockEye.dispatchEvent("pointerdown", { pointerId: 1 });
  const downType = await unlockInput.getAttribute("type");
  await unlockEye.dispatchEvent("pointerup", { pointerId: 1 });
  const upType = await unlockInput.getAttribute("type");
  result.unlock.eye = {
    defaultType,
    downType,
    upType,
    passwordValueRecorded: false,
  };
  await page.getByRole("button", { name: "解锁账本", exact: true }).click();
  await page.getByRole("heading", {
    name: "Local-First Trading Ledger",
    exact: true,
  }).waitFor({ timeout: 30_000 });
  result.unlock.tradeCount = await countTrades(page);
  result.unlock.mappingValues = await section(
    page,
    "图表总览与 Binance 行情",
  ).locator("details input").evaluateAll((inputs) =>
    inputs.map((input) => input.value),
  );
  ensure(result.unlock.tradeCount === 2, "reload/unlock did not restore ledger");
  await screenshot(page, "07-production-backup-post-unlock.png");

  result.console.unexplained =
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
    path.join(evidenceDir, "17-production-backup-storage-focused.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  await context.close();
}
