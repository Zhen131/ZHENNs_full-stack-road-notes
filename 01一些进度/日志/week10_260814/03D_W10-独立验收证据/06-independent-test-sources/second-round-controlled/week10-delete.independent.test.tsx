// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createBackupEnvelope,
  parseBackupJson,
  serializeBackupEnvelope,
} from "../backup/backupEnvelope";
import { DashboardShell } from "../components/dashboard/DashboardShell";
import type { LedgerData } from "../models";
import { createInitialLedgerData } from "../state/initialLedgerData";
import { createPriceSnapshot, createSimpleTrade } from "../test/fixtures";
import {
  controlledClock,
  createFutureLedger,
  createRecordingRepository,
} from "./independentHarness";

vi.mock("../components/charts/EChart", () => ({
  EChart: ({ ariaLabel }: { ariaLabel: string }) => (
    <div aria-label={ariaLabel} role="img" />
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function getSection(title: string) {
  const heading = screen.getByRole("heading", { name: title });
  const target = heading.closest("section");
  if (!target) throw new Error(`Missing section ${title}`);
  return target;
}

async function renderDashboard(repository: ReturnType<typeof createRecordingRepository>) {
  const view = render(
    <DashboardShell clock={controlledClock} repository={repository} />,
  );
  await waitFor(() => {
    expect(
      screen.queryByText("正在读取本地账本，完成前不会写入任何数据。"),
    ).toBeNull();
  });
  return view;
}

function backupFile(ledger: LedgerData, name: string) {
  const envelope = createBackupEnvelope(ledger, {
    appVersion: "0.1.0",
    exportedAt: "2026-07-25T12:00:00Z",
  });
  if (!envelope.ok) throw new Error("Backup fixture invalid");
  const serialized = serializeBackupEnvelope(envelope.value);
  const file = new File([serialized], name, { type: "application/json" });
  Object.defineProperty(file, "text", {
    configurable: true,
    value: vi.fn(async () => serialized),
  });
  return file;
}

describe("T3 future-fact correction through DashboardShell and recording repository", () => {
  it("T3-01/T3-02 isolates duplicate future facts, exposes unique IDs, and deletes only the twice-confirmed targets", async () => {
    const repository = createRecordingRepository(createFutureLedger());
    await renderDashboard(repository);
    const user = userEvent.setup();

    expect(screen.getByText("未来事实纠正模式")).toBeTruthy();
    const positionSection = getSection("资产汇总");
    expect(within(positionSection).queryByText("ETH")).toBeNull();
    const btcRow = within(positionSection).getByText("BTC").closest("tr");
    expect(btcRow?.textContent).toContain("1");
    expect(btcRow?.textContent).toContain("110 USD");
    expect(
      screen.getByRole("button", {
        name: "删除未来交易 ETH 2099-01-01 future-eth-a",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "删除未来交易 ETH 2099-01-01 future-eth-b",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "删除未来价格 BTC 2099-01-01 future-price-btc-a",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "删除未来价格 BTC 2099-01-01 future-price-btc-b",
      }),
    ).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "刷新 Binance 价格" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    const tradeDelete = screen.getByRole("button", {
      name: "删除未来交易 ETH 2099-01-01 future-eth-a",
    });
    await user.click(tradeDelete);
    expect(repository.saveSnapshots).toHaveLength(0);
    await user.click(document.body);
    expect(repository.saveSnapshots).toHaveLength(0);
    await user.click(tradeDelete);
    await user.click(tradeDelete);
    await waitFor(() => expect(repository.saveSnapshots).toHaveLength(1));
    expect(repository.stored?.trades.map((trade) => trade.id)).toEqual([
      "normal-btc-buy",
      "future-eth-b",
    ]);

    const priceDelete = screen.getByRole("button", {
      name: "删除未来价格 BTC 2099-01-01 future-price-btc-a",
    });
    await user.click(priceDelete);
    await user.click(priceDelete);
    await waitFor(() => expect(repository.saveSnapshots).toHaveLength(2));
    expect(repository.stored?.priceSnapshots.map((snapshot) => snapshot.id)).toEqual([
      "normal-btc-price",
      "future-price-btc-b",
    ]);
    expect(screen.getByText("未来事实纠正模式")).toBeTruthy();
  });

  it("T3-03 rejects a supporting future buy, then persists sell and buy deletion in order", async () => {
    const ledger = createInitialLedgerData();
    ledger.assets = ledger.assets.map((asset) => ({
      ...asset,
      binanceMapping: null,
    }));
    ledger.trades = [
      createSimpleTrade("future-buy", "buy", "ADA", "1", "2099-01-01"),
      createSimpleTrade("future-sell", "sell", "ADA", "1", "2099-01-02"),
    ];
    const repository = createRecordingRepository(ledger);
    await renderDashboard(repository);
    const user = userEvent.setup();
    const buy = screen.getByRole("button", {
      name: "删除未来交易 ADA 2099-01-01 future-buy",
    });
    await user.click(buy);
    await user.click(buy);
    expect(screen.getByText(/这笔交易支撑了后续卖出/)).toBeTruthy();
    expect(repository.saveSnapshots).toHaveLength(0);
    const sell = screen.getByRole("button", {
      name: "删除未来交易 ADA 2099-01-02 future-sell",
    });
    await user.click(sell);
    await user.click(sell);
    await waitFor(() => expect(repository.saveSnapshots).toHaveLength(1));
    const remainingBuy = screen.getByRole("button", {
      name: "删除未来交易 ADA 2099-01-01 future-buy",
    });
    await user.click(remainingBuy);
    await user.click(remainingBuy);
    await waitFor(() => expect(repository.saveSnapshots).toHaveLength(2));
    expect(screen.queryByText("未来事实纠正模式")).toBeNull();
  });

  it("T3-04 keeps a failed final deletion dirty, restores old storage on remount, and persists only after retry", async () => {
    const ledger = createInitialLedgerData();
    ledger.priceSnapshots = [
      createPriceSnapshot(
        "future-final-price",
        "BTC",
        "999999",
        "2099-01-01",
      ),
    ];
    const repository = createRecordingRepository(ledger);
    repository.failNextSave = true;
    const view = await renderDashboard(repository);
    const user = userEvent.setup();
    const remove = screen.getByRole("button", {
      name: "删除未来价格 BTC 2099-01-01 future-final-price",
    });
    await user.click(remove);
    await user.click(remove);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "重试保存" })).toBeTruthy();
    });
    expect(screen.queryByText("已保存到本地")).toBeNull();
    expect(repository.stored?.priceSnapshots).toHaveLength(1);
    view.unmount();
    await renderDashboard(repository);
    expect(screen.getByText("未来事实纠正模式")).toBeTruthy();
    cleanup();
    const retryView = await renderDashboard(repository);
    const retryUser = userEvent.setup();
    const retryDelete = screen.getByRole("button", {
      name: "删除未来价格 BTC 2099-01-01 future-final-price",
    });
    await retryUser.click(retryDelete);
    await retryUser.click(retryDelete);
    await waitFor(() => expect(repository.stored?.priceSnapshots).toHaveLength(0));
    retryView.unmount();
    await renderDashboard(repository);
    expect(screen.queryByText("未来事实纠正模式")).toBeNull();
  });

  it("T3-05 removes all future facts only on the second activation and restores ordinary writes", async () => {
    const repository = createRecordingRepository(createFutureLedger());
    await renderDashboard(repository);
    const user = userEvent.setup();
    const removeAll = screen.getByRole("button", {
      name: "删除全部无效未来事实",
    });
    await user.click(removeAll);
    expect(repository.saveSnapshots).toHaveLength(0);
    await user.click(removeAll);
    await waitFor(() => expect(repository.saveSnapshots).toHaveLength(1));
    expect(repository.stored?.trades.map((trade) => trade.id)).toEqual([
      "normal-btc-buy",
    ]);
    expect(repository.stored?.priceSnapshots.map((snapshot) => snapshot.id)).toEqual([
      "normal-btc-price",
    ]);
    expect(screen.queryByText("未来事实纠正模式")).toBeNull();
    expect(
      (screen.getByRole("button", { name: "刷新 Binance 价格" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("T3-06 strict import rejects a future ledger atomically", async () => {
    const repository = createRecordingRepository(createFutureLedger());
    const initial = structuredClone(repository.stored);
    await renderDashboard(repository);
    const user = userEvent.setup();
    await user.upload(
      screen.getByLabelText("选择账本备份文件"),
      backupFile(createFutureLedger(), "future.json"),
    );
    await waitFor(() =>
      expect(screen.getByText(/LEDGER_IMPORT_FUTURE_FACT/)).toBeTruthy(),
    );
    expect(repository.saveSnapshots).toHaveLength(0);
    expect(repository.stored).toEqual(initial);
  });

  it("T3-07 rescue export retains future facts while derived views exclude them", async () => {
    const repository = createRecordingRepository(createFutureLedger());
    let serialized = "";
    const OriginalBlob = Blob;
    class CaptureBlob extends OriginalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        if (typeof parts?.[0] === "string") serialized = parts[0];
        super(parts, options);
      }
    }
    vi.stubGlobal("Blob", CaptureBlob);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:independent"),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await renderDashboard(repository);
    await userEvent.setup().click(
      screen.getByRole("button", { name: "导出完整账本备份" }),
    );
    const parsed = parseBackupJson(serialized);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.ledgerData.trades.map((trade) => trade.id)).toContain(
      "future-eth-a",
    );
    expect(parsed.value.ledgerData.priceSnapshots.map((item) => item.id)).toContain(
      "future-price-btc-a",
    );
    expect(within(getSection("资产汇总")).queryByText("ETH")).toBeNull();
  });

  it("T3-08 legal whole-ledger replacement saves once and restores ordinary writes", async () => {
    const repository = createRecordingRepository(createFutureLedger());
    await renderDashboard(repository);
    const candidate = createInitialLedgerData();
    candidate.trades = [
      createSimpleTrade("replacement-ada", "buy", "ADA", "5", "2026-07-24"),
    ];
    const user = userEvent.setup();
    await user.upload(
      screen.getByLabelText("选择账本备份文件"),
      backupFile(candidate, "replacement.json"),
    );
    await user.click(screen.getByRole("button", { name: "确认恢复备份" }));
    await waitFor(() => expect(repository.saveSnapshots).toHaveLength(1));
    expect(repository.stored?.trades.map((trade) => trade.id)).toEqual([
      "replacement-ada",
    ]);
    expect(screen.queryByText("未来事实纠正模式")).toBeNull();
    expect((screen.getByLabelText("数量").closest("fieldset") as HTMLFieldSetElement).disabled).toBe(false);
  });

  it("T3-09 clear removes the future ledger and leaves the dashboard writable", async () => {
    const repository = createRecordingRepository(createFutureLedger());
    await renderDashboard(repository);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "清空本地账本" }));
    await user.type(
      screen.getByLabelText("输入清空确认文本"),
      "清空本地账本",
    );
    await user.click(screen.getByRole("button", { name: "确认永久清空" }));
    await waitFor(() => expect(repository.clearCalls).toBe(1));
    expect(screen.queryByText("未来事实纠正模式")).toBeNull();
    expect(
      (screen.getByRole("button", { name: "刷新 Binance 价格" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });
});
