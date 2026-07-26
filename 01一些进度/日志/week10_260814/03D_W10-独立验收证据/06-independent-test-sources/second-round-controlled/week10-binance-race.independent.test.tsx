// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MarketDataControls } from "../components/market-data/MarketDataControls";
import {
  createBinanceMarketDataClient,
  type BinanceMarketDataClient,
} from "../marketData/binanceMarketDataClient";
import type { BinanceTickerBatchResult } from "../marketData/binanceMarketDataTypes";
import type { LedgerData } from "../models";
import { createSimpleTrade } from "../test/fixtures";
import {
  MarketHarness,
  controlledClock,
  createFrozenBinanceLedger,
  createRecordingRepository,
  deferred,
} from "./independentHarness";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

type TickerMode =
  | { kind: "network" }
  | { kind: "http"; status: 429 | 418 | 500 }
  | { kind: "partial" }
  | { kind: "pending" };

function exchangeInfo(symbol: string) {
  const baseAsset = symbol.replace(/USDT$/, "");
  return {
    symbols: [
      {
        symbol,
        status: "TRADING",
        baseAsset,
        quoteAsset: "USDT",
        isSpotTradingAllowed: true,
      },
    ],
  };
}

function createControlledClient(mode: TickerMode) {
  let observedTicker: BinanceTickerBatchResult | undefined;
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = String(input);
      if (url.includes("exchangeInfo")) {
        const symbol = new URL(url).searchParams.get("symbol") ?? "";
        return new Response(JSON.stringify(exchangeInfo(symbol)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (mode.kind === "network") {
        throw new TypeError("offline");
      }
      if (mode.kind === "http") {
        return new Response("{}", { status: mode.status });
      }
      if (mode.kind === "partial") {
        return new Response(
          JSON.stringify([
            { symbol: "BTCUSDT", price: "62000" },
            { symbol: "ETHUSDT", price: "2200" },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    },
  );
  const formal = createBinanceMarketDataClient({
    fetch: fetchMock as typeof fetch,
  });
  const client: BinanceMarketDataClient = {
    validateSpotSymbol: (...args) => formal.validateSpotSymbol(...args),
    fetchLatestPrices: vi.fn(async (...args) => {
      observedTicker = await formal.fetchLatestPrices(...args);
      return observedTicker;
    }),
  };
  return {
    client,
    fetchMock,
    getObservedTicker: () => observedTicker,
  };
}

describe("T2 controlled Binance failures through formal client, hook and component", () => {
  it("T2-01 advances controlled time to 8001ms, reports timeout once, and preserves the frozen ledger", async () => {
    vi.useFakeTimers();
    const repository = createRecordingRepository(createFrozenBinanceLedger());
    const controlled = createControlledClient({ kind: "pending" });
    render(
      <MarketHarness
        client={controlled.client}
        repository={repository}
      />,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(controlled.fetchMock).toHaveBeenCalledTimes(4);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8001);
    });
    const observed = controlled.getObservedTicker();
    expect(observed?.failures).toHaveLength(3);
    expect(observed?.failures.every((failure) => failure.code === "BINANCE_TIMEOUT")).toBe(true);
    expect(controlled.fetchMock).toHaveBeenCalledTimes(4);
    expect(repository.saveSnapshots).toHaveLength(0);
    expect(repository.stored?.priceSnapshots.map((item) => item.id)).toEqual([
      "btc-old-api",
      "eth-old-manual",
      "ada-old-api",
    ]);
  });

  it("T2-02 reports network failure, then persists a BTC trade and ETH manual price", async () => {
    const repository = createRecordingRepository(createFrozenBinanceLedger());
    const controlled = createControlledClient({ kind: "network" });
    render(
      <MarketHarness
        client={controlled.client}
        repository={repository}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("已更新 0 项，失败 3 项。")).toBeTruthy();
    });
    expect(
      controlled
        .getObservedTicker()
        ?.failures.every((failure) => failure.code === "BINANCE_NETWORK_ERROR"),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "独立新增 BTC" }));
    await waitFor(() => {
      expect(repository.stored?.trades.some((trade) => trade.id === "t2-local-btc")).toBe(true);
    });
    fireEvent.click(screen.getByRole("button", { name: "独立新增 ETH 价格" }));
    await waitFor(() => {
      expect(
        repository.stored?.priceSnapshots.some(
          (snapshot) =>
            snapshot.id === "t2-local-eth-price" &&
            snapshot.price === "2200",
        ),
      ).toBe(true);
    });
    expect(controlled.fetchMock).toHaveBeenCalledTimes(4);
    expect(repository.saveSnapshots).toHaveLength(2);
  });

  it.each([
    [429, "BINANCE_RATE_LIMITED"],
    [418, "BINANCE_RATE_LIMITED"],
    [500, "BINANCE_HTTP_ERROR"],
  ] as const)(
    "T2-03/T2-04/T2-05 maps HTTP %s without retry, zero substitution, or old-price loss",
    async (status, code) => {
      const repository = createRecordingRepository(createFrozenBinanceLedger());
      const controlled = createControlledClient({ kind: "http", status });
      render(
        <MarketHarness
          client={controlled.client}
          repository={repository}
        />,
      );
      await waitFor(() => {
        expect(screen.getByText("已更新 0 项，失败 3 项。")).toBeTruthy();
      });
      const failures = controlled.getObservedTicker()?.failures ?? [];
      expect(failures).toHaveLength(3);
      expect(
        failures.every(
          (failure) =>
            failure.code === code && failure.httpStatus === status,
        ),
      ).toBe(true);
      expect(controlled.fetchMock).toHaveBeenCalledTimes(4);
      expect(repository.saveSnapshots).toHaveLength(0);
      expect(repository.stored?.priceSnapshots.map((item) => item.price)).toEqual([
        "61000",
        "2100",
        "0.45",
      ]);
      expect(repository.stored?.priceSnapshots.some((item) => item.price === "0")).toBe(false);
    },
  );

  it("T2-06 writes one BTC/ETH batch mutation and retains the missing ADA old price", async () => {
    const repository = createRecordingRepository(createFrozenBinanceLedger());
    const controlled = createControlledClient({ kind: "partial" });
    render(
      <MarketHarness
        client={controlled.client}
        repository={repository}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("已更新 2 项，失败 1 项。")).toBeTruthy();
    });
    expect(controlled.fetchMock).toHaveBeenCalledTimes(4);
    expect(repository.saveSnapshots).toHaveLength(1);
    const stored = repository.stored!;
    expect(
      stored.priceSnapshots.some(
        (snapshot) =>
          snapshot.assetSymbol === "BTC" &&
          snapshot.source === "api" &&
          snapshot.price === "62000",
      ),
    ).toBe(true);
    expect(
      stored.priceSnapshots.some(
        (snapshot) =>
          snapshot.assetSymbol === "ETH" &&
          snapshot.source === "api" &&
          snapshot.price === "2200",
      ),
    ).toBe(true);
    expect(
      stored.priceSnapshots.some(
        (snapshot) =>
          snapshot.id === "ada-old-api" && snapshot.price === "0.45",
      ),
    ).toBe(true);
    expect(
      controlled.getObservedTicker()?.failures,
    ).toEqual([
      expect.objectContaining({
        code: "BINANCE_SYMBOL_MISSING",
        symbol: "ADAUSDT",
      }),
    ]);
  });
});

describe("T4 stale-response and first-click protection", () => {
  function delayedClient(waiter: ReturnType<typeof deferred<BinanceTickerBatchResult>>) {
    return {
      validateSpotSymbol: vi.fn(async (assetSymbol: string, symbol: string) => ({
        ok: true as const,
        value: {
          symbol,
          status: "TRADING" as const,
          baseAsset: assetSymbol,
          quoteAsset: "USDT" as const,
          isSpotTradingAllowed: true,
        },
      })),
      fetchLatestPrices: vi.fn((_symbols: readonly string[], _signal?: AbortSignal) => waiter.promise),
    } satisfies BinanceMarketDataClient;
  }

  it("T4-01 first mapping delete click has no side effect; confirmed delete wins over an old resolved response", async () => {
    const waiter = deferred<BinanceTickerBatchResult>();
    const client = delayedClient(waiter);
    let ledger = createFrozenBinanceLedger();
    const saves: LedgerData[] = [];
    const apply = vi.fn((mutation: (current: LedgerData) => LedgerData) => {
      const next = mutation(ledger);
      if (next === ledger) return "noop" as const;
      ledger = next;
      saves.push(structuredClone(next));
      return "applied" as const;
    });
    render(
      <MarketDataControls
        applyLedgerMutation={apply}
        client={client}
        clock={controlledClock}
        isWritable
        ledgerData={ledger}
        ledgerEpoch={1}
        mode="auto"
        onModeChange={vi.fn()}
      />,
    );
    await waitFor(() => expect(client.fetchLatestPrices).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByText("配置 Binance Spot 交易对"));
    const input = screen.getByLabelText("BTC") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "CUSTOM" } });
    const remove = screen.getByRole("button", {
      name: "删除 BTC Binance 映射",
    });
    fireEvent.click(remove);
    expect(input.value).toBe("CUSTOM");
    expect(apply).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(input.value).toBe("CUSTOM");
    fireEvent.click(remove);
    fireEvent.click(remove);
    expect(ledger.assets.find((asset) => asset.symbol === "BTC")?.binanceMapping).toBeNull();
    expect(input.value).toBe("");
    await act(async () => {
      waiter.resolve({
        prices: [{ symbol: "BTCUSDT", price: "70000" }],
        failures: [],
      });
      await waiter.promise;
    });
    expect(
      ledger.assets.find((asset) => asset.symbol === "BTC")?.binanceMapping,
    ).toBeNull();
    expect(
      ledger.priceSnapshots.some(
        (snapshot) => snapshot.price === "70000",
      ),
    ).toBe(false);
    expect(saves).toHaveLength(1);
  });

  it("T4-02/T4-03 drop old response after mapping signature or whole-ledger epoch changes", async () => {
    for (const change of ["mapping", "epoch"] as const) {
      cleanup();
      const waiter = deferred<BinanceTickerBatchResult>();
      const client = delayedClient(waiter);
      const initial = createFrozenBinanceLedger();
      const apply = vi.fn(() => "applied" as const);
      const view = render(
        <MarketDataControls
          applyLedgerMutation={apply}
          client={client}
          clock={controlledClock}
          isWritable
          ledgerData={initial}
          ledgerEpoch={1}
          mode="auto"
          onModeChange={vi.fn()}
        />,
      );
      await waitFor(() => expect(client.fetchLatestPrices).toHaveBeenCalledOnce());
      const replacement = structuredClone(initial);
      if (change === "mapping") {
        replacement.assets[0].binanceMapping = null;
      } else {
        replacement.trades = [
          createSimpleTrade("replacement-only", "buy", "ETH", "1", "2026-07-25"),
        ];
      }
      view.rerender(
        <MarketDataControls
          applyLedgerMutation={apply}
          client={client}
          clock={controlledClock}
          isWritable
          ledgerData={replacement}
          ledgerEpoch={change === "epoch" ? 2 : 1}
          mode="auto"
          onModeChange={vi.fn()}
        />,
      );
      await act(async () => {
        waiter.resolve({
          prices: [{ symbol: "BTCUSDT", price: "70000" }],
          failures: [],
        });
        await waiter.promise;
      });
      expect(apply).not.toHaveBeenCalled();
      view.unmount();
    }
  });

  it("T4-04 merges a late response into the latest ledger without losing a concurrent trade", async () => {
    const waiter = deferred<BinanceTickerBatchResult>();
    const client = delayedClient(waiter);
    let ledger = createFrozenBinanceLedger();
    const apply = vi.fn((mutation: (current: LedgerData) => LedgerData) => {
      ledger = mutation(ledger);
      return "applied" as const;
    });
    render(
      <MarketDataControls
        applyLedgerMutation={apply}
        client={client}
        clock={controlledClock}
        isWritable
        ledgerData={ledger}
        ledgerEpoch={1}
        mode="auto"
        onModeChange={vi.fn()}
      />,
    );
    await waitFor(() => expect(client.fetchLatestPrices).toHaveBeenCalledOnce());
    ledger = {
      ...ledger,
      trades: [
        ...ledger.trades,
        createSimpleTrade("concurrent-eth", "buy", "ETH", "1", "2026-07-25"),
      ],
    };
    await act(async () => {
      waiter.resolve({
        prices: [{ symbol: "BTCUSDT", price: "70000" }],
        failures: [],
      });
      await waiter.promise;
    });
    expect(ledger.trades.some((trade) => trade.id === "concurrent-eth")).toBe(true);
    expect(
      ledger.priceSnapshots.some(
        (snapshot) => snapshot.source === "api" && snapshot.price === "70000",
      ),
    ).toBe(true);
    expect(apply).toHaveBeenCalledOnce();
  });
});
