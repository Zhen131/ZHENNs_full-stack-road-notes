import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
    scope: "T1-05 reload/unlock closure and T5-01 desktop only",
    passwordLogged: false,
  },
  backup: {},
  desktop: {},
  unlock: {},
  console: { warnings: [], errors: [], pageErrors: [] },
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
async function countDataRows(page) {
  const rows = await section(page, "交易列表")
    .locator("tbody tr")
    .allTextContents();
  return rows.filter((text) => !text.includes("暂无交易")).length;
}
async function addTrade(page) {
  const target = section(page, "新增交易");
  await target.locator("select").nth(0).selectOption("buy");
  await target.locator("select").nth(1).selectOption("BTC");
  for (const [index, value] of [
    [0, "0.25"],
    [1, "50000"],
    [2, "12500"],
    [3, "2026-07-26"],
    [4, "0"],
  ]) {
    await target.locator("input").nth(index).fill(value);
  }
  await target.getByRole("button", { name: "保存交易", exact: true }).click();
  await target.getByText("交易已加入账本", { exact: true }).waitFor();
  await waitSaved(page);
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
  page.on("console", (message) => {
    if (message.type() === "warning") result.console.warnings.push(message.text());
    if (message.type() === "error") result.console.errors.push(message.text());
  });
  page.on("pageerror", (error) => result.console.pageErrors.push(String(error)));
  await page.goto(origin, { waitUntil: "networkidle" });
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
  await addTrade(page);

  result.desktop = await page.evaluate(() => ({
    viewport: [innerWidth, innerHeight],
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  result.desktop.controls = {
    backup: await page.getByRole("button", {
      name: "导出完整账本备份",
      exact: true,
    }).isVisible(),
    tradeDelete: await page.getByRole("button", {
      name: "删除 买入 BTC 2026-07-26",
      exact: true,
    }).isVisible(),
    passwordRiskText: await section(page, "数据管理")
      .getByText(/账本备份是未加密明文/)
      .isVisible(),
  };
  ensure(
    result.desktop.scrollWidth <= result.desktop.clientWidth,
    "desktop page overflows",
  );
  ensure(Object.values(result.desktop.controls).every(Boolean), "desktop controls missing");

  const dataManagement = section(page, "数据管理");
  const downloadEvent = page.waitForEvent("download");
  await dataManagement.getByRole("button", {
    name: "导出完整账本备份",
    exact: true,
  }).click();
  const download = await downloadEvent;
  const filename = `reload-${download.suggestedFilename()}`;
  const savedPath = path.join(downloadDir, filename);
  await download.saveAs(savedPath);
  const failure = await download.failure();
  const bytes = await readFile(savedPath);
  const backup = JSON.parse(bytes.toString("utf8"));
  result.backup.download = {
    suggestedFilename: download.suggestedFilename(),
    savedFilename: filename,
    size: bytes.length,
    sha256: sha256(bytes),
    failure,
    backupFormatVersion: backup.backupFormatVersion,
    tradeCount: backup.ledgerData?.trades?.length,
  };
  ensure(failure === null, "reload closure download failed");
  ensure(backup.backupFormatVersion === 1, "reload closure backup is not V1");

  await dataManagement.getByRole("button", {
    name: "清空本地账本",
    exact: true,
  }).click();
  await dataManagement.getByLabel("输入清空确认文本", {
    exact: true,
  }).fill("清空本地账本");
  await dataManagement.getByRole("button", {
    name: "确认永久清空",
    exact: true,
  }).click();
  await dataManagement.getByText("账本已清空", { exact: true }).waitFor({
    timeout: 30_000,
  });
  result.backup.dataRowsAfterClear = await countDataRows(page);
  ensure(result.backup.dataRowsAfterClear === 0, "clear did not empty trades");

  await dataManagement.getByLabel("选择账本备份文件", {
    exact: true,
  }).setInputFiles(savedPath);
  await dataManagement.getByRole("button", {
    name: "确认恢复备份",
    exact: true,
  }).click();
  await dataManagement.getByText("备份已恢复并保存到本地。", {
    exact: true,
  }).waitFor({ timeout: 30_000 });
  result.backup.dataRowsAfterImport = await countDataRows(page);
  ensure(result.backup.dataRowsAfterImport === 1, "import did not restore trade");

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", {
    name: "解锁本地账本",
    exact: true,
  }).waitFor();
  result.unlock.lockedAfterReload = true;
  const passwordInput = page.getByLabel("账本密码", { exact: true });
  const eye = page.getByRole("button", {
    name: "按住查看账本密码",
    exact: true,
  });
  await passwordInput.fill(passphrase);
  result.unlock.defaultType = await passwordInput.getAttribute("type");
  await eye.dispatchEvent("pointerdown", { pointerId: 1 });
  result.unlock.pointerDownType = await passwordInput.getAttribute("type");
  await eye.dispatchEvent("pointerup", { pointerId: 1 });
  result.unlock.pointerUpType = await passwordInput.getAttribute("type");
  result.unlock.passwordValueRecorded = false;
  await page.getByRole("button", { name: "解锁账本", exact: true }).click();
  await page.getByRole("heading", {
    name: "Local-First Trading Ledger",
    exact: true,
  }).waitFor({ timeout: 30_000 });
  result.unlock.dataRowsAfterUnlock = await countDataRows(page);
  ensure(result.unlock.defaultType === "password", "unlock default type mismatch");
  ensure(result.unlock.pointerDownType === "text", "unlock eye did not reveal");
  ensure(result.unlock.pointerUpType === "password", "unlock eye did not hide");
  ensure(result.unlock.dataRowsAfterUnlock === 1, "unlock did not restore trade");

  await page.screenshot({
    path: path.join(screenshotDir, "08-production-reload-unlock.png"),
    fullPage: true,
  });
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
    path.join(evidenceDir, "19-production-reload-unlock-focused.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  await context.close();
}
