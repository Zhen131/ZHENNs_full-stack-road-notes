# W4 React useReducer 状态地基 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 React 页面状态从写死数组升级为 `useReducer + LedgerData` 的内存账本状态地基。

**Architecture:** 页面用 `useReducer` 管理当前 `LedgerData`；`ledgerReducer` 只负责账本状态变化；`positionService` 根据当前账本调用 `calculatePositions(...)` 得到 `Position[]`。页面只负责展示和 dispatch 动作，不保存派生持仓，不重写校验和计算。

**Tech Stack:** Next.js 14、React 18、TypeScript、Vitest、现有 `LedgerData / Trade / Position` 类型、现有 `calculatePositions(...)`。

---

## 先结论

我们采用方案 C：直接上 `useReducer`。

这不是为了显得高级，而是因为账本后面会有越来越多“动作”：

- 新增交易。
- 删除交易。
- 更新交易。
- 重置账本。
- 导入账本。
- 导出账本。
- 清空交易。
- 添加价格快照。

如果继续用零散的 `useState`，以后页面会变成很多 `setXxx(...)` 混在一起，不容易判断“这一次操作到底改了账本哪里”。

`useReducer` 的好处是：

```text
用户动作
-> dispatch(action)
-> ledgerReducer(state, action)
-> 新的 LedgerData
-> 页面重新展示
```

用大白话说：

> reducer 就像账本的“状态管家”。所有账本变更都要说清楚自己是什么动作，然后由管家按规则改账本。

---

## 这一步只解决什么

本文件只解决 Week 4 React 页面状态地基：

- 建立 `initialLedgerData`。
- 建立 `ledgerReducer`。
- 页面改用 `useReducer`。
- 交易列表读 `ledgerData.trades`。
- 资产汇总读 `positionService` 输出的 `Position[]`。
- 删除 `DashboardShell.tsx` 里的写死 `summaryRows` 和写死 `trades`。

这一轮可以先预留 `trade/add` 和 `trade/delete` action。

真正“表单数据 -> TradeDraft -> validateTradeDraft -> 正式 Trade”的新增交易流程，放到下一步 `tradeService` 里做。

---

## 这一步不解决什么

- 不做 IndexedDB。
- 不做 localStorage。
- 不做加密。
- 不做 JSON 导入导出。
- 不做 NLP 输入。
- 不做实时行情 API。
- 不在 reducer 里调用 `validateTradeDraft(...)`。
- 不在 reducer 里重写 `calculatePositions(...)`。
- 不把 `Position[]` 存进 `LedgerData`。

---

## 当前代码起点

当前源码仓库：

```text
01一些进度/产出/LocalFirstTradingLedger/
```

当前关键文件：

```text
src/components/dashboard/DashboardShell.tsx
src/models/types.ts
src/calculators/positionCalculator.ts
src/services/README.md
```

当前页面问题：

- `DashboardShell.tsx` 顶部有写死的 `summaryRows`。
- `DashboardShell.tsx` 顶部有写死的 `trades`。
- 资产汇总表渲染的是假 `summaryRows`。
- 交易列表渲染的是假 `trades`。
- 页面还没有真正的 `LedgerData` 状态。
- `src/services/` 目前没有 `positionService.ts`。
- `src/state/` 目前还不存在。

当前已经存在的类型：

```ts
export type LedgerData = {
  schemaVersion: 1;
  assets: Asset[];
  trades: Trade[];
  priceSnapshots: PriceSnapshot[];
  feeRules: FeeRule[];
};
```

---

## 目标文件结构

本次开发建议新增和修改这些文件：

```text
src/state/initialLedgerData.ts
src/state/ledgerReducer.ts
src/state/ledgerReducer.test.ts
src/services/positionService.ts
src/services/positionService.test.ts
src/components/dashboard/DashboardShell.tsx
```

职责边界：

| 文件 | 职责 |
| --- | --- |
| `initialLedgerData.ts` | 放内存账本初始值 |
| `ledgerReducer.ts` | 接收 action，返回新的 `LedgerData` |
| `ledgerReducer.test.ts` | 验证 add/delete/reset 等状态变更 |
| `positionService.ts` | 把 `LedgerData` 交给 calculator，返回 `Position[]` |
| `positionService.test.ts` | 验证 service 调用了现有计算链路 |
| `DashboardShell.tsx` | 使用 `useReducer`，渲染账本和派生结果 |

---

## 状态层设计

### LedgerData 是唯一页面事实

页面里的事实数据只有一份：

```text
ledgerData
├─ assets
├─ trades
├─ priceSnapshots
└─ feeRules
```

这些是账本事实。

`Position[]` 不是事实数据，它是派生结果：

```text
ledgerData.trades + ledgerData.priceSnapshots
-> calculatePositions(...)
-> Position[]
```

所以 `Position[]` 不进入 reducer state。

### reducer 的最小 action

第一版先支持三个动作：

```ts
export type LedgerAction =
  | { type: "trade/add"; trade: Trade }
  | { type: "trade/delete"; tradeId: string }
  | { type: "ledger/reset" };
```

后续可以自然扩展：

```ts
| { type: "trade/update"; trade: Trade }
| { type: "price/add"; priceSnapshot: PriceSnapshot }
| { type: "ledger/import"; ledgerData: LedgerData }
| { type: "ledger/clear" }
```

但本次不要先写这些未来 action。只在文档里知道它们会来。

---

## Task 1：建立 initialLedgerData

**Files:**

- Create: `01一些进度/产出/LocalFirstTradingLedger/src/state/initialLedgerData.ts`

### 目的

给 `useReducer` 一个干净、明确、可复用的初始账本。

### 执行步骤

- [ ] 新建 `src/state/` 目录。

- [ ] 新建 `src/state/initialLedgerData.ts`。

- [ ] 写入基础资产和空账本。

建议代码：

```ts
import type { LedgerData } from "../models";

const INITIAL_TIMESTAMP = "2026-07-05T00:00:00Z";

export const initialLedgerData: LedgerData = {
  schemaVersion: 1,
  assets: [
    {
      id: "asset-btc",
      symbol: "BTC",
      name: "Bitcoin",
      quoteCurrency: "USD",
      createdAt: INITIAL_TIMESTAMP,
      updatedAt: INITIAL_TIMESTAMP,
    },
    {
      id: "asset-eth",
      symbol: "ETH",
      name: "Ethereum",
      quoteCurrency: "USD",
      createdAt: INITIAL_TIMESTAMP,
      updatedAt: INITIAL_TIMESTAMP,
    },
    {
      id: "asset-ada",
      symbol: "ADA",
      name: "Cardano",
      quoteCurrency: "USD",
      createdAt: INITIAL_TIMESTAMP,
      updatedAt: INITIAL_TIMESTAMP,
    },
  ],
  trades: [],
  priceSnapshots: [],
  feeRules: [],
};
```

### 验收标准

- [ ] `initialLedgerData.schemaVersion` 是 `1`。
- [ ] `assets` 至少包含 BTC / ETH / ADA。
- [ ] `trades` 是空数组。
- [ ] `priceSnapshots` 是空数组。
- [ ] `feeRules` 是空数组。
- [ ] 这里不导入测试 fixtures。

---

## Task 2：建立 ledgerReducer

**Files:**

- Create: `01一些进度/产出/LocalFirstTradingLedger/src/state/ledgerReducer.ts`

### 目的

建立统一状态入口。以后所有账本状态变化都通过 `dispatch(action)` 进入 reducer。

### 执行步骤

- [ ] 新建 `src/state/ledgerReducer.ts`。

- [ ] 定义 `LedgerAction` 类型。

- [ ] 实现 `ledgerReducer(...)`。

建议代码：

```ts
import type { LedgerData, Trade } from "../models";
import { initialLedgerData } from "./initialLedgerData";

export type LedgerAction =
  | { type: "trade/add"; trade: Trade }
  | { type: "trade/delete"; tradeId: string }
  | { type: "ledger/reset" };

export function ledgerReducer(
  state: LedgerData,
  action: LedgerAction,
): LedgerData {
  switch (action.type) {
    case "trade/add":
      return {
        ...state,
        trades: [...state.trades, action.trade],
      };

    case "trade/delete":
      return {
        ...state,
        trades: state.trades.filter((trade) => trade.id !== action.tradeId),
      };

    case "ledger/reset":
      return initialLedgerData;

    default:
      return assertNever(action);
  }
}

function assertNever(action: never): never {
  throw new Error(`Unsupported ledger action: ${JSON.stringify(action)}`);
}
```

### 为什么 reducer 不校验交易

`ledgerReducer` 只负责“状态怎么变”，不负责判断交易是否合法。

合法性判断属于 `tradeService + validateTradeDraft`。

也就是说，后面正确流程应该是：

```text
表单
-> TradeDraft
-> tradeService
-> validateTradeDraft
-> Trade
-> dispatch({ type: "trade/add", trade })
```

而不是：

```text
表单
-> dispatch(...)
-> reducer 里面偷偷校验
```

### 验收标准

- [ ] `trade/add` 返回新的 `LedgerData` 对象。
- [ ] `trade/add` 不修改原 `state.trades` 数组。
- [ ] `trade/delete` 只删除匹配 `id` 的交易。
- [ ] `ledger/reset` 返回 `initialLedgerData`。
- [ ] reducer 不调用 `validateTradeDraft(...)`。
- [ ] reducer 不调用 `calculatePositions(...)`。

---

## Task 3：给 ledgerReducer 写测试

**Files:**

- Create: `01一些进度/产出/LocalFirstTradingLedger/src/state/ledgerReducer.test.ts`

### 目的

先证明 reducer 的地基是可靠的。

### 执行步骤

- [ ] 新建 `src/state/ledgerReducer.test.ts`。

- [ ] 写 `trade/add` 测试。

- [ ] 写 `trade/delete` 测试。

- [ ] 写不可变更新测试。

建议测试结构：

```ts
import { describe, expect, it } from "vitest";
import type { Trade } from "../models";
import { initialLedgerData } from "./initialLedgerData";
import { ledgerReducer } from "./ledgerReducer";

const sampleTrade: Trade = {
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
  createdAt: "2026-07-05T00:00:00Z",
  updatedAt: "2026-07-05T00:00:00Z",
};

describe("ledgerReducer", () => {
  it("adds a trade without mutating the previous state", () => {
    const previousState = initialLedgerData;

    const nextState = ledgerReducer(previousState, {
      type: "trade/add",
      trade: sampleTrade,
    });

    expect(nextState).not.toBe(previousState);
    expect(nextState.trades).toHaveLength(1);
    expect(nextState.trades[0]).toEqual(sampleTrade);
    expect(previousState.trades).toHaveLength(0);
  });

  it("deletes a trade by id", () => {
    const stateWithTrade = ledgerReducer(initialLedgerData, {
      type: "trade/add",
      trade: sampleTrade,
    });

    const nextState = ledgerReducer(stateWithTrade, {
      type: "trade/delete",
      tradeId: "trade-001",
    });

    expect(nextState.trades).toHaveLength(0);
  });

  it("keeps trades when delete id does not match", () => {
    const stateWithTrade = ledgerReducer(initialLedgerData, {
      type: "trade/add",
      trade: sampleTrade,
    });

    const nextState = ledgerReducer(stateWithTrade, {
      type: "trade/delete",
      tradeId: "missing-trade",
    });

    expect(nextState.trades).toHaveLength(1);
    expect(nextState.trades[0]).toEqual(sampleTrade);
  });
});
```

### 验收标准

- [ ] `npm test -- ledgerReducer` 能通过。
- [ ] 测试能证明 add 不污染旧 state。
- [ ] 测试能证明 delete 按 `id` 删除。
- [ ] 测试不依赖页面组件。

---

## Task 4：建立 positionService

**Files:**

- Create: `01一些进度/产出/LocalFirstTradingLedger/src/services/positionService.ts`

### 目的

把“当前账本怎么变成当前持仓”这件事从页面里拿出去。

### 执行步骤

- [ ] 新建 `src/services/positionService.ts`。

- [ ] 引入 `LedgerData` 和 `Position` 类型。

- [ ] 引入 `calculatePositions(...)`。

建议代码：

```ts
import { calculatePositions } from "../calculators/positionCalculator";
import type { LedgerData, Position } from "../models";

export function getPositionsFromLedger(ledgerData: LedgerData): Position[] {
  return calculatePositions(
    ledgerData.trades,
    ledgerData.priceSnapshots,
  );
}
```

### 验收标准

- [ ] `positionService` 不碰 React。
- [ ] `positionService` 不保存数据。
- [ ] `positionService` 不新增交易。
- [ ] `positionService` 不自己写平均成本和盈亏公式。
- [ ] `positionService` 只调用现有 `calculatePositions(...)`。

---

## Task 5：给 positionService 写测试

**Files:**

- Create: `01一些进度/产出/LocalFirstTradingLedger/src/services/positionService.test.ts`

### 目的

证明 service 接线正确：输入账本，输出 `Position[]`。

### 执行步骤

- [ ] 新建 `src/services/positionService.test.ts`。

- [ ] 使用已有 `sampleTrades` 验证持仓输出。

- [ ] 使用价格快照验证 `latestPrice / marketValue / unrealizedPnl` 能传出来。

建议测试结构：

```ts
import { describe, expect, it } from "vitest";
import type { LedgerData } from "../models";
import {
  createPriceSnapshot,
  sampleAssets,
  sampleTrades,
} from "../test/fixtures";
import { getPositionsFromLedger } from "./positionService";

function createLedgerData(overrides: Partial<LedgerData> = {}): LedgerData {
  return {
    schemaVersion: 1,
    assets: sampleAssets,
    trades: sampleTrades,
    priceSnapshots: [],
    feeRules: [],
    ...overrides,
  };
}

describe("getPositionsFromLedger", () => {
  it("calculates positions from ledger trades", () => {
    const positions = getPositionsFromLedger(createLedgerData());

    expect(positions.map((position) => position.assetSymbol)).toEqual([
      "BTC",
      "ETH",
      "ADA",
    ]);
  });

  it("includes latest price fields when price snapshots exist", () => {
    const positions = getPositionsFromLedger(
      createLedgerData({
        priceSnapshots: [
          createPriceSnapshot("price-btc", "BTC", "70000", "2026-07-05"),
        ],
      }),
    );

    const btc = positions.find((position) => position.assetSymbol === "BTC");

    expect(btc?.latestPrice).toBe("70000");
    expect(btc?.marketValue).toBeDefined();
    expect(btc?.unrealizedPnl).toBeDefined();
  });
});
```

### 验收标准

- [ ] `npm test -- positionService` 能通过。
- [ ] 无价格快照时不制造假的价格字段。
- [ ] 有价格快照时能得到 `latestPrice` 等派生字段。
- [ ] 测试不依赖 React 页面。

---

## Task 6：DashboardShell 接入 useReducer

**Files:**

- Modify: `01一些进度/产出/LocalFirstTradingLedger/src/components/dashboard/DashboardShell.tsx`

### 目的

把页面从“写死数组展示”改成“内存账本状态驱动展示”。

### 执行步骤

- [ ] 在文件第一行加：

```ts
"use client";
```

原因：`useReducer` 是客户端 React Hook，Next.js App Router 里使用 hook 的组件必须是 client component。

- [ ] 修改 React import：

```ts
import { useReducer, type ReactNode } from "react";
```

- [ ] 删除文件顶部写死的 `summaryRows`。

- [ ] 删除文件顶部写死的 `trades`。

- [ ] 引入状态和 service：

```ts
import { getPositionsFromLedger } from "@/services/positionService";
import { initialLedgerData } from "@/state/initialLedgerData";
import { ledgerReducer } from "@/state/ledgerReducer";
```

- [ ] 在 `DashboardShell()` 里建立 reducer：

```ts
const [ledgerData, dispatch] = useReducer(
  ledgerReducer,
  initialLedgerData,
);

const positions = getPositionsFromLedger(ledgerData);
```

- [ ] 资产汇总表从 `summaryRows.map(...)` 改成 `positions.map(...)`。

渲染时字段对应：

```text
row.asset              -> position.assetSymbol
row.quantity           -> position.quantity
row.averageCost        -> position.averageCost
row.currentPrice       -> position.latestPrice ?? "未输入价格"
row.marketValue        -> position.marketValue ?? "--"
row.unrealizedPnl      -> position.unrealizedPnl ?? "--"
```

- [ ] 交易列表从 `trades.map(...)` 改成 `ledgerData.trades.map(...)`。

渲染时字段对应：

```text
trade.date             -> trade.occurredAt
trade.type             -> trade.type === "buy" ? "买入" : "卖出"
trade.asset            -> trade.assetSymbol
trade.quantity         -> trade.quantity
trade.price            -> trade.price
trade.total            -> `${trade.totalValue} ${trade.currency}`
```

- [ ] 交易列表为空时显示一行空状态：

```text
暂无交易。下一步接入 tradeService 后，新增交易会出现在这里。
```

- [ ] 先不要让“保存交易”按钮生成假交易。

原因：新增交易必须先通过 `tradeService + validateTradeDraft`，不能为了演示直接 dispatch 假数据。

### 验收标准

- [ ] `DashboardShell.tsx` 顶部没有写死的 `summaryRows`。
- [ ] `DashboardShell.tsx` 顶部没有写死的 `trades`。
- [ ] 页面使用 `useReducer(ledgerReducer, initialLedgerData)`。
- [ ] 资产汇总来源是 `positions`。
- [ ] `positions` 来源是 `getPositionsFromLedger(ledgerData)`。
- [ ] 交易列表来源是 `ledgerData.trades`。
- [ ] 页面组件不调用 `calculatePositions(...)`。
- [ ] 页面组件不直接保存 `Position[]` state。
- [ ] 页面组件不写 IndexedDB/localStorage。

---

## Task 7：运行验证

**Files:**

- Verify: source repo under `01一些进度/产出/LocalFirstTradingLedger/`

### 执行步骤

- [ ] 运行 reducer 测试：

```bash
npm test -- ledgerReducer
```

期望：

```text
PASS
```

- [ ] 运行 position service 测试：

```bash
npm test -- positionService
```

期望：

```text
PASS
```

- [ ] 运行全部测试：

```bash
npm test
```

期望：

```text
Test Files passed
Tests passed
```

- [ ] 运行 lint：

```bash
npm run lint
```

期望：

```text
No ESLint warnings or errors
```

- [ ] 运行 build：

```bash
npm run build
```

期望：

```text
Compiled successfully
```

### 验收标准

- [ ] reducer 测试通过。
- [ ] position service 测试通过。
- [ ] 全部测试通过。
- [ ] lint 通过。
- [ ] build 通过。

---

## 最终验收标准

### 架构验收

- [ ] 页面状态由 `useReducer` 管理。
- [ ] 账本事实数据集中在 `LedgerData`。
- [ ] reducer 只负责状态变化。
- [ ] service 只负责业务流程或计算接线。
- [ ] calculator 继续只负责纯计算。
- [ ] 页面只负责展示和触发动作。

### 数据验收

- [ ] `assets / trades / priceSnapshots / feeRules` 都存在于 `LedgerData`。
- [ ] `trades` 初始为空。
- [ ] 交易列表读取 `ledgerData.trades`。
- [ ] 资产汇总读取 `Position[]`。
- [ ] `Position[]` 不保存进 `LedgerData`。

### 行为验收

- [ ] 页面初始交易列表显示空状态。
- [ ] 页面初始资产汇总不再展示写死的假 BTC / ETH / ADA 持仓。
- [ ] 未来 dispatch `trade/add` 后，交易列表能自然从 `ledgerData.trades` 更新。
- [ ] 未来 dispatch `trade/delete` 后，交易列表能自然删除对应交易。

### 边界验收

- [ ] 没有 IndexedDB。
- [ ] 没有 localStorage。
- [ ] 没有加密。
- [ ] 没有导入导出。
- [ ] 没有行情 API。
- [ ] 没有 NLP。
- [ ] 没有把测试 fixture 的 `createTradeFromDraft` 当正式业务函数使用。

---

## 给初级程序员的理解口径

你可以把方案 C 理解成：

```text
LedgerData 是账本本子。
Action 是你要对账本做的事情。
Reducer 是账本管理员。
Dispatch 是你把命令交给管理员。
PositionService 是会计。
Calculator 是会计手里的公式。
DashboardShell 是柜台窗口。
```

以前页面是这样：

```text
页面自己写假交易
页面自己写假汇总
```

现在页面要变成：

```text
页面拿到账本
页面展示账本
页面发出动作
reducer 修改账本
service 读取账本算结果
页面展示结果
```

最重要的一句话：

> useReducer 不是为了多写代码，而是为了让每一次账本变化都有名字、有入口、有边界。

---

## 下一步衔接

本文件通过后，下一步再做 `tradeService`：

```text
表单数据
-> TradeDraft
-> validateTradeDraft
-> Trade
-> dispatch({ type: "trade/add", trade })
```

也就是说：

- `tradeService` 负责“交易能不能入账”。
- `ledgerReducer` 负责“交易入账后状态怎么变”。
- 两者不要混在一起。

