// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { parseBackupJson } from "../backup/backupEnvelope";
import { BackupControls } from "../components/backup/BackupControls";
import { MarketDataControls } from "../components/market-data/MarketDataControls";
import { PriceForm } from "../components/prices/PriceForm";
import { TradeForm } from "../components/trades/TradeForm";
import { usePersistentLedger } from "../hooks/usePersistentLedger";
import type { BinanceMarketDataClient } from "../marketData/binanceMarketDataClient";
import type { LedgerData } from "../models";
import { createInitialLedgerData } from "../state/initialLedgerData";
import { createSimpleTrade } from "../test/fixtures";
import { createRecordingRepository } from "./independentHarness";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function captureDownload() {
  const OriginalBlob = Blob;
  let serialized = "";
  class CaptureBlob extends OriginalBlob {
    constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
      if (typeof parts?.[0] === "string") serialized = parts[0];
      super(parts, options);
    }
  }
  vi.stubGlobal("Blob", CaptureBlob);
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:clock"),
    revokeObjectURL: vi.fn(),
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  return () => serialized;
}

describe("T4-05 one Clock snapshot per business action", () => {
  it("captures a trade and manual price with one clock.now call each", async () => {
    const ledger = createInitialLedgerData();
    const tradeClock = {
      now: vi.fn(() => new Date("2026-07-25T23:59:59.900Z")),
    };
    const tradeCreated = vi.fn(() => "applied" as const);
    const tradeView = render(
      <TradeForm
        clock={tradeClock}
        ledgerData={ledger}
        onTradeCreated={tradeCreated}
      />,
    );
    const tradeForm = tradeView.container.querySelector("form")!;
    const selects = tradeForm.querySelectorAll("select");
    fireEvent.change(selects[0], { target: { value: "buy" } });
    fireEvent.change(selects[1], { target: { value: "BTC" } });
    const inputs = tradeForm.querySelectorAll("input");
    for (const [index, value] of [
      [0, "1"],
      [1, "50000"],
      [2, "50000"],
      [3, "2026-07-25"],
      [4, "0"],
    ] as const) {
      fireEvent.change(inputs[index], { target: { value } });
    }
    tradeClock.now.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "保存交易" }));
    expect(tradeClock.now).toHaveBeenCalledOnce();
    expect(tradeCreated).toHaveBeenCalledWith(
      expect.objectContaining({ occurredAt: "2026-07-25" }),
      expect.objectContaining({
        todayKey: "2026-07-25",
        now: new Date("2026-07-25T23:59:59.900Z"),
      }),
    );

    cleanup();
    const priceClock = {
      now: vi.fn(() => new Date("2026-07-26T00:00:00.100Z")),
    };
    const priceCreated = vi.fn(() => "applied" as const);
    const priceView = render(
      <PriceForm
        clock={priceClock}
        ledgerData={ledger}
        onPriceSnapshotCreated={priceCreated}
      />,
    );
    const priceForm = priceView.container.querySelector("form")!;
    fireEvent.change(priceForm.querySelector("select")!, {
      target: { value: "BTC" },
    });
    const priceInputs = priceForm.querySelectorAll("input");
    fireEvent.change(priceInputs[0], { target: { value: "70000" } });
    fireEvent.change(priceInputs[2], { target: { value: "2026-07-26" } });
    priceClock.now.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "保存价格" }));
    expect(priceClock.now).toHaveBeenCalledOnce();
    expect(priceCreated).toHaveBeenCalledWith(
      expect.objectContaining({ recordedAt: "2026-07-26" }),
      expect.objectContaining({
        todayKey: "2026-07-26",
        now: new Date("2026-07-26T00:00:00.100Z"),
      }),
    );
  });

  it("captures mapping acceptance and Binance response with one clock snapshot each", async () => {
    const client: BinanceMarketDataClient = {
      validateSpotSymbol: vi.fn(async (assetSymbol, symbol) => ({
        ok: true as const,
        value: {
          symbol,
          status: "TRADING" as const,
          baseAsset: assetSymbol,
          quoteAsset: "USDT" as const,
          isSpotTradingAllowed: true,
        },
      })),
      fetchLatestPrices: vi.fn(async () => ({
        prices: [{ symbol: "BTCUSDT", price: "62000" }],
        failures: [],
      })),
    };
    let ledger = createInitialLedgerData();
    ledger.assets = ledger.assets.map((asset) => ({
      ...asset,
      binanceMapping: asset.symbol === "BTC" ? null : asset.binanceMapping,
    }));
    const clock = {
      now: vi.fn(() => new Date("2026-07-25T12:00:00Z")),
    };
    const apply = vi.fn((mutation: (current: LedgerData) => LedgerData) => {
      ledger = mutation(ledger);
      return "applied" as const;
    });
    render(
      <MarketDataControls
        applyLedgerMutation={apply}
        client={client}
        clock={clock}
        isWritable
        ledgerData={ledger}
        ledgerEpoch={1}
        mode="auto"
        onModeChange={vi.fn()}
        todayKey="2026-07-25"
      />,
    );
    await waitFor(() =>
      expect(screen.getByText("当前没有需要刷新的非零持仓映射。")).toBeTruthy(),
    );
    fireEvent.click(screen.getByText("配置 Binance Spot 交易对"));
    fireEvent.change(screen.getByLabelText("BTC"), {
      target: { value: "BTCUSDT" },
    });
    clock.now.mockClear();
    fireEvent.click(screen.getAllByRole("button", { name: "验证并保存" })[0]);
    await waitFor(() =>
      expect(screen.getByText("交易对已验证并加入保存队列。")).toBeTruthy(),
    );
    expect(clock.now).toHaveBeenCalledOnce();

    cleanup();
    ledger = createInitialLedgerData();
    ledger.trades = [
      createSimpleTrade("clock-btc", "buy", "BTC", "1", "2026-07-25"),
    ];
    const refreshClock = {
      now: vi.fn(() => new Date("2026-07-25T12:34:56Z")),
    };
    render(
      <MarketDataControls
        applyLedgerMutation={apply}
        client={client}
        clock={refreshClock}
        isWritable
        ledgerData={ledger}
        ledgerEpoch={1}
        mode="auto"
        onModeChange={vi.fn()}
        todayKey="2026-07-25"
      />,
    );
    await waitFor(() =>
      expect(screen.getByText("已更新 1 项，失败 0 项。")).toBeTruthy(),
    );
    expect(refreshClock.now).toHaveBeenCalledOnce();
    expect(ledger.priceSnapshots.at(-1)?.recordedAt).toBe("2026-07-25");
    expect(
      ledger.priceSnapshots.at(-1)?.binanceProvenance?.fetchedAt,
    ).toBe("2026-07-25T12:34:56.000Z");
  });

  it("captures backup exportedAt once and does not invent todayKey", async () => {
    const getSerialized = captureDownload();
    const clock = {
      now: vi.fn(() => new Date("2026-07-25T23:59:59.999Z")),
    };
    render(
      <BackupControls
        clock={clock}
        hydrationStatus="ready"
        isDirty={false}
        isReadOnly={false}
        ledgerData={createInitialLedgerData()}
        onImport={vi.fn(async () => ({ ok: true }))}
        persistenceOperation="idle"
        persistenceStatus="idle"
      />,
    );
    clock.now.mockClear();
    await userEvent.setup().click(
      screen.getByRole("button", { name: "导出完整账本备份" }),
    );
    expect(clock.now).toHaveBeenCalledOnce();
    const parsed = parseBackupJson(getSerialized());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.exportedAt).toBe("2026-07-25T23:59:59.999Z");
    expect("todayKey" in parsed.value).toBe(false);
  });

  it("recalibrates at focus/visible and midnight, and removes timer/listeners on unmount", async () => {
    vi.useFakeTimers();
    let current = new Date("2026-07-25T23:59:59.900");
    const clock = { now: vi.fn(() => new Date(current)) };
    const repository = createRecordingRepository(null);
    const focusSpy = vi.spyOn(window, "addEventListener");
    const removeFocusSpy = vi.spyOn(window, "removeEventListener");
    const clearTimerSpy = vi.spyOn(window, "clearTimeout");
    const { result, unmount } = renderHook(() =>
      usePersistentLedger(repository, clock),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.todayKey).toBe("2026-07-25");
    current = new Date("2026-07-26T00:00:00.050");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(101);
    });
    expect(result.current.todayKey).toBe("2026-07-26");
    current = new Date("2026-07-27T12:00:00");
    fireEvent(window, new Event("focus"));
    expect(result.current.todayKey).toBe("2026-07-27");
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    current = new Date("2026-07-28T12:00:00");
    fireEvent(document, new Event("visibilitychange"));
    expect(result.current.todayKey).toBe("2026-07-28");
    unmount();
    expect(focusSpy).toHaveBeenCalled();
    expect(removeFocusSpy).toHaveBeenCalledWith("focus", expect.any(Function));
    expect(clearTimerSpy).toHaveBeenCalled();
  });
});
