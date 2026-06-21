# Day 3 5 条样例 Trade 数据

日期：2026-06-22

状态：Day3 数据准备

目标：把 Week1 的 5 条原始交易样例人工整理成完整 `Trade[]`，供后续 `positionCalculator` 和 golden tests 使用。

---

## 结论

今天不做 NLP 自动解析。

本文件只是把自然语言样例手动结构化为 `Trade` 对象：

```text
原始交易文本 -> 人工整理 -> Trade[]
```

`rawText` 保留原句，给未来 NLP 输入模块使用。

这里不使用 `class`。当前项目在 `src/models/types.ts` 里定义的是 TypeScript `type`，所以这 5 条数据是符合 `Trade` 类型的对象数组：

```ts
const sampleTrades: Trade[] = [...]
```

这份文档是文本产出，不直接写入源码；后续如果决定进入代码，再把这里的对象数组搬到 fixture / test data 文件。

---

## 结构化规则

- `Trade.type` 只使用 `buy` / `sell`。
- 数量、价格、总金额、手续费都保存为 `DecimalString`。
- `totalValue` 是成本和卖出金额的第一版基准。
- `quantity * price` 只用于误差校验，不改写 `totalValue`。
- 手续费第一版记录为 `"0"`，不计入成本和盈亏。
- `quantitySortKey`、`totalValueSortKey` 暂不生成，留给 IndexedDB 查询优化阶段。
- `feeRuleId` 暂不填写，因为当前样例没有手续费规则。

---

## Trade[] 样例

```ts
import type { Trade } from "@/models";

export const sampleTrades: Trade[] = [
  {
    id: "trade-001",
    occurredAt: "2026-04-02",
    timePrecision: "day",
    type: "buy",
    assetSymbol: "BTC",
    quantity: "0.00016388",
    price: "67121.7",
    totalValue: "11",
    currency: "USD",
    fee: "0",
    feeCurrency: "USD",
    rawText: "以均价 67121.7 买入 BTC 0.00016388 个，价值 11 USD，26/04/02",
    createdAt: "2026-06-22T00:00:00Z",
    updatedAt: "2026-06-22T00:00:00Z",
  },
  {
    id: "trade-002",
    occurredAt: "2026-04-02",
    timePrecision: "day",
    type: "buy",
    assetSymbol: "ETH",
    quantity: "0.004854",
    price: "2059.99",
    totalValue: "10",
    currency: "USD",
    fee: "0",
    feeCurrency: "USD",
    rawText: "以均价 2059.99 买入 ETH 0.004854 个，价值 10 USD，26/04/02",
    createdAt: "2026-06-22T00:00:00Z",
    updatedAt: "2026-06-22T00:00:00Z",
  },
  {
    id: "trade-003",
    occurredAt: "2026-04-02",
    timePrecision: "day",
    type: "buy",
    assetSymbol: "ADA",
    quantity: "41.58",
    price: "0.2405",
    totalValue: "10",
    currency: "USD",
    fee: "0",
    feeCurrency: "USD",
    rawText: "以均价 0.2405 买入 ADA 41.58 个，价值 10 USD，26/04/02",
    createdAt: "2026-06-22T00:00:00Z",
    updatedAt: "2026-06-22T00:00:00Z",
  },
  {
    id: "trade-004",
    occurredAt: "2026-04-09",
    timePrecision: "day",
    type: "buy",
    assetSymbol: "ADA",
    quantity: "126.6825",
    price: "0.2526",
    totalValue: "32",
    currency: "USD",
    fee: "0",
    feeCurrency: "USD",
    rawText: "以均价 0.2526 买入 ADA 126.6825 个，价值 32 USD，26/04/09",
    createdAt: "2026-06-22T00:00:00Z",
    updatedAt: "2026-06-22T00:00:00Z",
  },
  {
    id: "trade-005",
    occurredAt: "2026-04-14",
    timePrecision: "day",
    type: "sell",
    assetSymbol: "ADA",
    quantity: "82.9381",
    price: "0.2412",
    totalValue: "20",
    currency: "USD",
    fee: "0",
    feeCurrency: "USD",
    rawText: "以均价 0.2412 卖出 ADA 82.9381 个，价值 20 USD，26/04/14",
    createdAt: "2026-06-22T00:00:00Z",
    updatedAt: "2026-06-22T00:00:00Z",
  },
];
```

---

## 配套 LedgerData 草稿

```ts
import type { Asset, LedgerData } from "@/models";

export const sampleAssets: Asset[] = [
  {
    id: "asset-btc",
    symbol: "BTC",
    name: "Bitcoin",
    quoteCurrency: "USD",
    createdAt: "2026-06-22T00:00:00Z",
    updatedAt: "2026-06-22T00:00:00Z",
  },
  {
    id: "asset-eth",
    symbol: "ETH",
    name: "Ethereum",
    quoteCurrency: "USD",
    createdAt: "2026-06-22T00:00:00Z",
    updatedAt: "2026-06-22T00:00:00Z",
  },
  {
    id: "asset-ada",
    symbol: "ADA",
    name: "Cardano",
    quoteCurrency: "USD",
    createdAt: "2026-06-22T00:00:00Z",
    updatedAt: "2026-06-22T00:00:00Z",
  },
];

export const sampleLedgerData: LedgerData = {
  schemaVersion: 1,
  assets: sampleAssets,
  trades: sampleTrades,
  priceSnapshots: [],
  feeRules: [],
};
```

---

## 手算基准

| 资产 | 结果 |
| --- | --- |
| BTC | 持仓 `0.00016388`，成本 `11`，均价 `67122.28459848669` |
| ETH | 持仓 `0.004854`，成本 `10`，均价 `2060.1565718994643` |
| ADA 买入前两笔 | 数量 `168.2625`，成本 `42`，卖出前均价 `0.24960998439937597504` |
| ADA 第 5 条卖出 | 卖出数量 `82.9381`，卖出金额 `20`，结转成本 `20.702177847113884555`，已实现盈亏 `-0.702177847113884555` |
| ADA 剩余仓位 | 剩余数量 `85.3244`，剩余成本 `21.297822152886115445`，均价 `0.24960998439937597504` |

---

## 后续用途

- Day3：用于 `positionCalculator` 的输入样例。
- Day4：用于卖出结转和 `realizedPnl` 验证。
- Day5：用于 Vitest golden tests。

不用于：

- NLP 自动解析。
- IndexedDB 存储。
- 加密流程。
- 页面真实状态接入。
