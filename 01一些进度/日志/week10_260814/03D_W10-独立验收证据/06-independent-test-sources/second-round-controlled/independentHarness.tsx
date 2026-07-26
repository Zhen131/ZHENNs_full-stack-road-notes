import { useState } from "react";

import { usePersistentLedger } from "../hooks/usePersistentLedger";
import type { BinanceMarketDataClient } from "../marketData/binanceMarketDataClient";
import type { LedgerData, PriceSnapshot, Trade } from "../models";
import type { LedgerRepository } from "../repositories/ledgerRepository";
import { createInitialLedgerData } from "../state/initialLedgerData";
import { createPriceSnapshot, createSimpleTrade } from "../test/fixtures";
import type { LedgerClock } from "../utils/ledgerDate";
import { MarketDataControls } from "../components/market-data/MarketDataControls";

export const CONTROLLED_NOW = new Date("2026-07-25T12:00:00Z");
export const controlledClock: LedgerClock = {
  now: () => new Date(CONTROLLED_NOW),
};

export type RecordingRepository = LedgerRepository & {
  loadCalls: number;
  saveSnapshots: LedgerData[];
  clearCalls: number;
  stored: LedgerData | null;
  failNextSave: boolean;
};

export function createRecordingRepository(
  initial: LedgerData | null,
): RecordingRepository {
  return {
    loadCalls: 0,
    saveSnapshots: [],
    clearCalls: 0,
    stored: initial === null ? null : structuredClone(initial),
    failNextSave: false,
    async load() {
      this.loadCalls += 1;
      return this.stored === null ? null : structuredClone(this.stored);
    },
    async save(ledgerData) {
      this.saveSnapshots.push(structuredClone(ledgerData));
      if (this.failNextSave) {
        this.failNextSave = false;
        throw new Error("independent controlled save failure");
      }
      this.stored = structuredClone(ledgerData);
    },
    async clear() {
      this.clearCalls += 1;
      this.stored = null;
    },
  };
}

export function apiPrice(
  id: string,
  assetSymbol: string,
  price: string,
  recordedAt = "2026-07-24",
): PriceSnapshot {
  return {
    ...createPriceSnapshot(id, assetSymbol, price, recordedAt),
    source: "api",
    binanceProvenance: {
      provider: "binance",
      symbol: `${assetSymbol}USDT`,
      sourceQuoteCurrency: "USDT",
      fetchedAt: `${recordedAt}T12:00:00Z`,
    },
  };
}

export function pricedBuy(
  id: string,
  assetSymbol: string,
  quantity: string,
  price: string,
  occurredAt: string,
): Trade {
  return {
    ...createSimpleTrade(id, "buy", assetSymbol, quantity, occurredAt),
    price,
    totalValue: String(Number(quantity) * Number(price)),
  };
}

export function createFrozenBinanceLedger(): LedgerData {
  const ledger = createInitialLedgerData();
  ledger.trades = [
    pricedBuy("btc-held", "BTC", "1", "50000", "2026-07-20"),
    pricedBuy("eth-held", "ETH", "2", "1800", "2026-07-20"),
    pricedBuy("ada-held", "ADA", "1000", "0.4", "2026-07-20"),
  ];
  ledger.priceSnapshots = [
    apiPrice("btc-old-api", "BTC", "61000"),
    createPriceSnapshot("eth-old-manual", "ETH", "2100", "2026-07-24"),
    apiPrice("ada-old-api", "ADA", "0.45"),
  ];
  return ledger;
}

export function MarketHarness({
  repository,
  client,
  clock = controlledClock,
}: {
  repository: RecordingRepository;
  client: BinanceMarketDataClient;
  clock?: LedgerClock;
}) {
  const {
    ledgerData,
    applyLedgerAction,
    applyLedgerMutation,
    hydrationStatus,
    ledgerEpoch,
    todayKey,
  } = usePersistentLedger(repository, clock);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const writable = hydrationStatus === "ready";

  return (
    <div>
      <output aria-label="harness-trades">{ledgerData.trades.length}</output>
      <output aria-label="harness-prices">
        {ledgerData.priceSnapshots.length}
      </output>
      <button
        disabled={!writable}
        onClick={() =>
          applyLedgerAction({
            type: "trade/add",
            trade: {
              ...pricedBuy(
                "t2-local-btc",
                "BTC",
                "0.1",
                "50000",
                "2026-07-25",
              ),
            },
          })
        }
        type="button"
      >
        独立新增 BTC
      </button>
      <button
        disabled={!writable}
        onClick={() =>
          applyLedgerAction({
            type: "priceSnapshot/add",
            priceSnapshot: createPriceSnapshot(
              "t2-local-eth-price",
              "ETH",
              "2200",
              "2026-07-25",
            ),
          })
        }
        type="button"
      >
        独立新增 ETH 价格
      </button>
      <MarketDataControls
        applyLedgerMutation={applyLedgerMutation}
        client={client}
        clock={clock}
        generateId={() => `independent-api-${ledgerData.priceSnapshots.length}`}
        isWritable={writable}
        ledgerData={ledgerData}
        ledgerEpoch={ledgerEpoch}
        mode={mode}
        onModeChange={setMode}
        todayKey={todayKey}
      />
    </div>
  );
}

export function createFutureLedger(): LedgerData {
  const ledger = createInitialLedgerData();
  ledger.trades = [
    {
      ...pricedBuy("normal-btc-buy", "BTC", "1", "100", "2026-07-24"),
    },
    pricedBuy("future-eth-a", "ETH", "1", "1000", "2099-01-01"),
    pricedBuy("future-eth-b", "ETH", "2", "1200", "2099-01-01"),
  ];
  ledger.priceSnapshots = [
    createPriceSnapshot(
      "normal-btc-price",
      "BTC",
      "110",
      "2026-07-24",
    ),
    createPriceSnapshot(
      "future-price-btc-a",
      "BTC",
      "999999",
      "2099-01-01",
    ),
    createPriceSnapshot(
      "future-price-btc-b",
      "BTC",
      "888888",
      "2099-01-01",
    ),
  ];
  return ledger;
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
