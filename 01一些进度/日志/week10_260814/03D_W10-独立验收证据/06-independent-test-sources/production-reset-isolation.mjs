import { createHash, randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const mainOrigin = process.env.MAIN_ORIGIN;
const disposableOrigin = process.env.DISPOSABLE_ORIGIN;
const chromeExecutable = process.env.CHROME_EXECUTABLE;
const userDataDir = process.env.CHROME_USER_DATA_DIR;
const evidenceDir = process.env.EVIDENCE_DIR;
const debugPort = Number(process.env.CHROME_DEBUG_PORT);
if (
  !mainOrigin ||
  !disposableOrigin ||
  !chromeExecutable ||
  !userDataDir ||
  !evidenceDir
) {
  throw new Error("Missing reset-isolation environment");
}

const passphrase = randomBytes(24).toString("base64url");
const result = {
  identity: {
    mainOrigin,
    disposableOrigin,
    passwordLogged: false,
  },
  mainBefore: {},
  disposable: {},
  mainAfter: {},
};

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}
function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}
function section(page, title) {
  return page
    .getByRole("heading", { name: title, exact: true })
    .locator("xpath=ancestor::section[1]");
}
async function readRaw(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("local-first-trading-ledger");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const database = open.result;
          const request = database
            .transaction("ledger", "readonly")
            .objectStore("ledger")
            .get("ledger:v1");
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            database.close();
            resolve(request.result);
          };
        };
      }),
  );
}
function rawSummary(raw) {
  return raw
    ? {
        present: true,
        ciphertextHash: sha256(raw.ciphertextBase64Url),
        ivHash: sha256(raw.cipher?.ivBase64Url),
      }
    : { present: false };
}

const context = await chromium.launchPersistentContext(userDataDir, {
  executablePath: chromeExecutable,
  headless: false,
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
  const mainPage = context.pages()[0] ?? (await context.newPage());
  await mainPage.goto(mainOrigin, { waitUntil: "networkidle" });
  await mainPage.getByRole("heading", {
    name: "解锁本地账本",
    exact: true,
  }).waitFor();
  result.mainBefore = rawSummary(await readRaw(mainPage));
  ensure(result.mainBefore.present, "main origin V2 record is absent");

  const disposablePage = await context.newPage();
  const cdp = await context.newCDPSession(disposablePage);
  result.disposable.preNavigation = await cdp.send(
    "Storage.getUsageAndQuota",
    { origin: disposableOrigin },
  );
  ensure(
    result.disposable.preNavigation.usage === 0,
    "disposable origin was not fresh",
  );
  await disposablePage.goto(disposableOrigin, { waitUntil: "networkidle" });
  await disposablePage.getByLabel("设置密码", { exact: true }).fill(passphrase);
  await disposablePage
    .getByLabel("再次输入密码", { exact: true })
    .fill(passphrase);
  await disposablePage.getByRole("button", {
    name: "创建加密账本",
    exact: true,
  }).click();
  await disposablePage.getByRole("heading", {
    name: "Local-First Trading Ledger",
    exact: true,
  }).waitFor({ timeout: 30_000 });

  const trade = section(disposablePage, "新增交易");
  await trade.locator("select").nth(0).selectOption("buy");
  await trade.locator("select").nth(1).selectOption("BTC");
  for (const [index, value] of [
    [0, "0.1"],
    [1, "50000"],
    [2, "5000"],
    [3, "2026-07-26"],
    [4, "0"],
  ]) {
    await trade.locator("input").nth(index).fill(value);
  }
  await trade.getByRole("button", { name: "保存交易", exact: true }).click();
  await trade.getByText("交易已加入账本", { exact: true }).waitFor();
  await disposablePage.getByText("已保存到本地", { exact: true }).waitFor();
  result.disposable.recordBeforeReset = rawSummary(
    await readRaw(disposablePage),
  );
  ensure(
    result.disposable.recordBeforeReset.present,
    "disposable record not created",
  );

  await disposablePage.reload({ waitUntil: "networkidle" });
  await disposablePage.getByRole("heading", {
    name: "解锁本地账本",
    exact: true,
  }).waitFor();
  result.disposable.lockedAfterReload = true;
  await disposablePage.getByRole("button", {
    name: "忘记密码？清空本地加密账本并重新开始",
    exact: true,
  }).click();
  const resetInput = disposablePage.getByLabel("清空确认文本", {
    exact: true,
  });
  await resetInput.fill("清空本地加密账");
  await disposablePage.getByRole("button", {
    name: "确认清空",
    exact: true,
  }).click();
  result.disposable.incompleteError = await disposablePage
    .getByText("请输入完整确认文本“清空本地加密账本”", { exact: true })
    .textContent();
  result.disposable.recordAfterIncomplete = rawSummary(
    await readRaw(disposablePage),
  );
  ensure(
    result.disposable.recordAfterIncomplete.ciphertextHash ===
      result.disposable.recordBeforeReset.ciphertextHash,
    "incomplete text changed disposable record",
  );

  await resetInput.fill("清空本地加密账本");
  await disposablePage.getByRole("button", {
    name: "确认清空",
    exact: true,
  }).click();
  await disposablePage.getByRole("heading", {
    name: "创建本地加密账本",
    exact: true,
  }).waitFor({ timeout: 30_000 });
  result.disposable.recordAfterComplete = rawSummary(
    await readRaw(disposablePage),
  );
  ensure(
    result.disposable.recordAfterComplete.present === false,
    "complete reset retained disposable record",
  );
  await disposablePage.screenshot({
    path: path.join(
      evidenceDir,
      "10-screenshots",
      "09-production-reset-isolation.png",
    ),
    fullPage: true,
  });

  await mainPage.bringToFront();
  await mainPage.reload({ waitUntil: "networkidle" });
  result.mainAfter = rawSummary(await readRaw(mainPage));
  ensure(result.mainAfter.present, "main record disappeared");
  ensure(
    result.mainAfter.ciphertextHash === result.mainBefore.ciphertextHash &&
      result.mainAfter.ivHash === result.mainBefore.ivHash,
    "disposable reset modified main origin record",
  );
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
    path.join(evidenceDir, "23-production-reset-isolation.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  await context.close();
}
