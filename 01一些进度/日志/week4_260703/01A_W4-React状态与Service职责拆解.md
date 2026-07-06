# Week 4 Day 1-3 今日需求拆解：React 状态、tradeService、positionService

日期：2026-07-05  
性质：需求拆解 / 执行清单  
目标：先把今天要做的三件事讲清楚，再一项一项执行。

---

## 2026-07-05 状态更新

这份 `01A` 是最早的需求拆解稿，用来解释“React 状态、tradeService、positionService”三件事的职责。

后续方案已经升级为 `01B_W4-useReducer状态地基执行与验收标准.md`：

- 凡是早先讨论的零散页面状态方案，都以 `01B` 的 `useReducer(ledgerReducer, initialLedgerData)` 为准。
- 本文保留用来理解业务拆解和大白话类比，不再作为最终代码执行标准。
- 真正执行代码时，看 `01B`、Week4 每日清单和 Week4 Checklist。

---

## 先结论

今天不是继续堆页面，也不是直接上 IndexedDB。

今天真正要打通的是这条线：

```text
页面表单
-> TradeDraft
-> validateTradeDraft
-> Trade
-> LedgerData.trades
-> calculatePositions
-> Position[]
-> 页面展示
```

用大白话说：

- `LedgerData` 是当前账本的“临时账本本子”，先放在 React 内存里。
- `tradeService` 是“新增一笔交易”的办事员：先检查，再入账。
- `positionService` 是“看账本算持仓”的会计：只读账本，只算结果。

刷新页面后数据丢失没关系。本周先验证“输入、校验、计算、展示”能跑通；真正存到 IndexedDB 是 Week 5 的事情。

---

## 今天从哪里来，到哪里去

### 做之前

当前页面主要还是展示壳：

- `DashboardShell.tsx` 里有写死的 `summaryRows`。
- `DashboardShell.tsx` 里有写死的 `trades`。
- “保存交易”按钮还没有真的把表单数据写进账本。
- “资产汇总”还没有真的从 `Trade[]` 和 `PriceSnapshot[]` 算出来。
- `src/services/` 目前只有 README，还没有真正的 `tradeService.ts` 和 `positionService.ts`。

### 做之后

页面不再靠写死数组装样子，而是变成：

- React 里有一个内存版 `LedgerData`。
- 新增交易时走 `tradeService`。
- 资产汇总时走 `positionService`。
- 页面只负责收集输入和展示结果，不直接写校验规则，不直接写持仓计算公式。

### 正在去哪里

今天的核心不是“写一个漂亮页面”，而是让页面第一次接上 Week 2 已经验证过的核心账本能力。

Week 2 已经证明：

- `validateTradeDraft(...)` 能判断交易是否合法。
- `calculatePositions(...)` 能根据交易和价格快照算出持仓。

Week 4 要做的是：

- 把这些能力接回 React 页面。
- 不再让页面自己假装有数据。

---

## 总执行顺序

建议按这个顺序做，不要跳：

1. 先做 React 内存状态：让页面有一个真正的 `LedgerData`。
2. 再做 `tradeService`：让“新增交易”这件事有固定流程。
3. 最后做 `positionService`：让资产汇总从账本数据实时计算。

原因很简单：

- 没有 `LedgerData`，service 不知道读写哪里。
- 没有 `tradeService`，表单提交会绕开校验。
- 没有 `positionService`，页面就会继续写死资产汇总。

---

## 任务一：React 页面状态怎么放

### 这一步要解决什么

页面以后不能再靠写死数组展示。

当前页面上看到的资产汇总和交易列表，应该来自同一份账本数据：

```ts
LedgerData = {
  assets,
  trades,
  priceSnapshots,
  feeRules,
}
```

这份数据先存在 React 状态里。

### 大白话类比

现在的页面像一张拍好的样板图，表格里写什么都是提前写死的。

改完之后，页面要像一个临时账本：

- 账本里有资产清单。
- 账本里有交易记录。
- 账本里有价格快照。
- 页面只是把账本里的东西读出来。

### 添加之前是什么样

```text
DashboardShell.tsx
├─ summaryRows = 写死的资产汇总
├─ trades = 写死的交易列表
└─ form button = 还没有真正保存交易
```

问题：

- 新增交易不会让列表变。
- 资产汇总不会跟交易变化。
- 页面里的假数据容易被误认为真实账本数据。

### 添加之后是什么样

```text
DashboardShell.tsx
└─ useReducer(ledgerReducer, initialLedgerData)
   ├─ assets
   ├─ trades
   ├─ priceSnapshots
   └─ feeRules
```

页面展示时：

- 交易列表读 `ledgerData.trades`。
- 资产汇总读 `positionService` 算出来的 `positions`。
- 表单提交成功后 dispatch `trade/add`，由 `ledgerReducer` 更新 `ledgerData.trades`。

### 待执行清单

- [ ] 找到 `DashboardShell.tsx` 里写死的 `summaryRows`。
- [ ] 找到 `DashboardShell.tsx` 里写死的 `trades`。
- [ ] 建立一个 `initialLedgerData`。
- [ ] `initialLedgerData.assets` 先放 BTC / ETH / ADA 这些基础资产。
- [ ] `initialLedgerData.trades` 可以先为空数组，后续靠表单新增。
- [ ] `initialLedgerData.priceSnapshots` 先为空数组，价格输入后续再写入。
- [ ] `initialLedgerData.feeRules` 先为空数组，手续费规则后续再扩展。
- [ ] 建立 `ledgerReducer`，让页面用 `useReducer(ledgerReducer, initialLedgerData)` 保存当前账本。
- [ ] 页面更新账本时 dispatch action，不在组件里直接拼状态修改逻辑。
- [ ] 删除或停止使用页面级写死的 `summaryRows`。
- [ ] 删除或停止使用页面级写死的 `trades`。
- [ ] 确认本周不写 `localStorage`。
- [ ] 确认本周不写 IndexedDB。

### 这一步完成后，你应该能说清

- 页面为什么需要一个总账本状态，而不是到处放小数组。
- `LedgerData.trades` 是事实数据。
- `Position[]` 不是保存出来的事实，而是根据 `trades` 算出来的结果。
- 刷新丢失不是 bug，是 Week 4 有意接受的限制。

### 通过线

- 页面上交易列表的数据来源已经能指向 `ledgerData.trades`。
- 页面上资产汇总不再依赖写死的 `summaryRows`。
- 代码里没有开始做 IndexedDB。

---

## 任务二：tradeService 负责什么

### 这一步要解决什么

`tradeService` 只负责一件事：新增交易。

它不是表单组件。
它不是数据库。
它不是计算器。

它的职责是把“用户想新增一笔交易”这件事按正确顺序办完。

### 大白话类比

`tradeService` 像一个入账办事员：

1. 用户拿来一张交易草稿。
2. 办事员先检查这张单子能不能入账。
3. 检查通过，盖章变成正式交易。
4. 放进账本的交易记录里。
5. 检查失败，就把错误退回去，账本不动。

### 添加之前是什么样

```text
页面表单
└─ 点击保存交易
   └─ 目前还没有真正动作
```

风险：

- 表单可能直接把脏数据写进去。
- 页面可能绕开 `validateTradeDraft`。
- 失败时可能已经污染了 `LedgerData.trades`。
- “生成 Trade” 的逻辑可能散落在组件里。

### 添加之后是什么样

```text
页面表单数据
-> 整理成 TradeDraft
-> tradeService.addTrade(...)
   -> validateTradeDraft(...)
   -> 失败：返回 errors，不改 LedgerData
   -> 成功：生成 Trade，追加到 LedgerData.trades
-> 页面拿结果决定展示错误或更新状态
```

### tradeService 应该做的事

- [ ] 接收当前 `LedgerData`。
- [ ] 接收表单整理出来的 `TradeDraft`。
- [ ] 调用 `validateTradeDraft(draft, context)`。
- [ ] 校验时把 `ledgerData.assets` 传给 validator。
- [ ] 校验时把 `ledgerData.trades` 作为 `priorTrades` 传给 validator。
- [ ] 如果校验失败，返回结构化错误。
- [ ] 如果校验失败，不修改 `ledgerData.trades`。
- [ ] 如果校验成功，生成正式 `Trade`。
- [ ] 正式 `Trade` 需要有 `id`、`createdAt`、`updatedAt`。
- [ ] 把新 `Trade` 追加到新的 `trades` 数组里。
- [ ] 返回新的 `LedgerData`，让 React `setLedgerData(...)` 使用。

### tradeService 不应该做的事

- [ ] 不直接读写 IndexedDB。
- [ ] 不直接操作 React 表单输入框。
- [ ] 不在里面写 UI 文案排版。
- [ ] 不自己重新写一套交易校验规则。
- [ ] 不自己计算持仓。
- [ ] 不从 `src/test/fixtures.ts` 引入测试用的 `createTradeFromDraft` 到正式代码。

### 建议的函数形状

后面写代码时，可以接近这个意思：

```ts
type AddTradeResult =
  | { ok: true; ledgerData: LedgerData; trade: Trade }
  | { ok: false; ledgerData: LedgerData; errors: TradeValidationError[] };

function addTradeToLedger(
  ledgerData: LedgerData,
  draft: TradeDraft,
): AddTradeResult
```

重点不是函数名必须一模一样。

重点是结果必须表达清楚：

- 成功：给我新的账本数据。
- 失败：告诉我错误，并且原账本不变。

### 待执行清单

- [ ] 新建 `src/services/tradeService.ts`。
- [ ] 定义新增交易的返回结果类型。
- [ ] 引入 `LedgerData`、`Trade`、`TradeDraft` 等核心类型。
- [ ] 引入 `validateTradeDraft`。
- [ ] 写 `addTradeToLedger(...)`。
- [ ] 校验失败时返回原 `ledgerData` 和 `errors`。
- [ ] 校验成功时创建正式 `Trade`。
- [ ] 校验成功时使用不可变方式追加交易。
- [ ] 给 service 写最小测试：成功新增会多一笔交易。
- [ ] 给 service 写最小测试：校验失败不会改变交易数量。
- [ ] 页面表单提交时改为调用 `tradeService`。
- [ ] 页面收到失败结果时展示错误，不更新账本。
- [ ] 页面收到成功结果时 `setLedgerData(result.ledgerData)`。

### 这一步完成后，你应该能说清

- 表单数据为什么不能直接塞进 `trades`。
- `TradeDraft` 和 `Trade` 的区别。
- 为什么必须先过 `validateTradeDraft`。
- 为什么失败时不能先写入再删除。
- 为什么 `tradeService` 是“流程编排”，不是“计算公式”。

### 通过线

- 非法交易提交后，`LedgerData.trades.length` 不变。
- 合法交易提交后，`LedgerData.trades.length` 增加 1。
- 新增交易流程没有绕开 `validateTradeDraft`。

---

## 任务三：positionService 负责什么

### 这一步要解决什么

`positionService` 只负责一件事：根据当前账本数据算持仓。

它读取：

- `LedgerData.trades`
- `LedgerData.priceSnapshots`

它调用：

- `calculatePositions(...)`

它输出：

- `Position[]`

### 大白话类比

`positionService` 像一个会计。

会计不负责让用户填表，也不负责把交易保存进账本。

会计只做这件事：

> 你把账本给我，我根据里面的交易和价格，算出现在每个资产还剩多少、平均成本是多少、盈亏是多少。

### 添加之前是什么样

```text
DashboardShell.tsx
└─ summaryRows = 写死的资产汇总
```

风险：

- 页面显示的数量和成本不一定来自真实交易。
- 页面可能未来自己写一套计算逻辑。
- Week 2 已经验证过的 `calculatePositions` 没有被复用。

### 添加之后是什么样

```text
ledgerData.trades + ledgerData.priceSnapshots
-> positionService.getPositions(...)
-> calculatePositions(...)
-> Position[]
-> 页面资产汇总表
```

### positionService 应该做的事

- [ ] 接收当前 `LedgerData` 或接收 `trades + priceSnapshots`。
- [ ] 调用 `calculatePositions(trades, priceSnapshots)`。
- [ ] 返回 `Position[]`。
- [ ] 给页面提供稳定的展示数据来源。

### positionService 不应该做的事

- [ ] 不碰表单。
- [ ] 不新增交易。
- [ ] 不保存数据。
- [ ] 不写 IndexedDB。
- [ ] 不自己重新写平均成本、成本基准、盈亏公式。
- [ ] 不把 `Position[]` 当成需要长期保存的数据。

### 建议的函数形状

后面写代码时，可以接近这个意思：

```ts
function getPositionsFromLedger(ledgerData: LedgerData): Position[] {
  return calculatePositions(
    ledgerData.trades,
    ledgerData.priceSnapshots,
  );
}
```

重点：

- service 只是把当前账本数据交给 calculator。
- 真正计算仍然在 `positionCalculator.ts`。

### 待执行清单

- [ ] 新建 `src/services/positionService.ts`。
- [ ] 引入 `LedgerData` 和 `Position` 类型。
- [ ] 引入 `calculatePositions`。
- [ ] 写 `getPositionsFromLedger(...)`。
- [ ] 给 service 写最小测试：传入交易后能返回对应持仓。
- [ ] 给 service 写最小测试：传入价格快照后能带出市值和未实现盈亏。
- [ ] 页面资产汇总改为渲染 `Position[]`。
- [ ] 页面不再使用写死的 `summaryRows`。
- [ ] 如果没有价格快照，页面显示“未输入价格”或空值。
- [ ] 如果有价格快照，页面显示 `latestPrice / marketValue / unrealizedPnl`。

### 这一步完成后，你应该能说清

- 为什么持仓不应该手动保存。
- 为什么 `Position[]` 是算出来的，不是录进去的。
- `positionService` 和 `positionCalculator` 的区别：
  - service 负责“拿什么数据去算”。
  - calculator 负责“怎么算”。
- 为什么页面不应该自己写计算公式。

### 通过线

- 资产汇总表的数据来自 `Position[]`。
- `Position[]` 来自 `calculatePositions(...)`。
- 页面组件里没有平均成本、成本基准、盈亏计算公式。

---

## 三个任务之间的关系

```text
React 状态
  保存当前 LedgerData

tradeService
  往 LedgerData.trades 里安全追加交易

positionService
  从 LedgerData.trades 和 LedgerData.priceSnapshots 算 Position[]
```

如果把它们混在一起，代码会变乱：

- 页面既收表单又校验又计算，后面很难测试。
- service 里如果自己写计算公式，Week 2 的 calculator 就失去意义。
- 如果把 `Position[]` 也存起来，未来会出现“交易是一套结果，持仓又是另一套结果”的冲突。

所以今天的边界要守住：

```text
页面：收输入，展示结果
tradeService：新增交易流程
positionService：读取账本并调用计算
validator：判断交易是否合法
calculator：计算持仓和盈亏
```

---

## 今日完整待执行总清单

### A. React 内存账本

- [ ] 建立 `initialLedgerData`。
- [ ] 建立 `ledgerReducer`。
- [ ] 使用 `useReducer(ledgerReducer, initialLedgerData)`。
- [ ] 交易列表改读 `ledgerData.trades`。
- [ ] 资产汇总改读 `Position[]`。
- [ ] 停止使用 `summaryRows` 写死数据。
- [ ] 停止使用 `trades` 写死数据。

### B. tradeService

- [ ] 新建 `tradeService.ts`。
- [ ] 实现“新增交易”函数。
- [ ] 调用 `validateTradeDraft`。
- [ ] 成功才生成正式 `Trade`。
- [ ] 失败不改 `LedgerData`。
- [ ] 页面提交表单时接入 service。

### C. positionService

- [ ] 新建 `positionService.ts`。
- [ ] 调用 `calculatePositions`。
- [ ] 返回 `Position[]`。
- [ ] 资产汇总表接入 service 输出。

### D. 验证

- [ ] 合法买入 BTC 后，交易列表增加一行。
- [ ] 合法买入后，资产汇总出现对应资产持仓。
- [ ] 非法资产代码提交失败，交易列表不增加。
- [ ] 超卖提交失败，交易列表不增加。
- [ ] 没有价格快照时，不乱显示 0 市值或 0 盈亏。
- [ ] 有价格快照时，市值和未实现盈亏来自 calculator。
- [ ] 自动化测试至少覆盖 service 成功和失败两类路径。

---

## 今天不要做的事

- [ ] 不做 IndexedDB。
- [ ] 不做加密。
- [ ] 不做 JSON 导入导出。
- [ ] 不做实时行情 API。
- [ ] 不做 NLP 输入。
- [ ] 不把测试 fixtures 当正式生产工具直接引入页面。
- [ ] 不在 React 组件里重写持仓计算公式。

---

## 给初级程序员的理解口径

你可以这样理解今天的三件事：

1. React 状态是“账本暂时放在哪儿”。
2. tradeService 是“新增一笔交易时应该按什么流程办”。
3. positionService 是“拿已有账本怎么算出当前持仓”。

三者的顺序是：

```text
先有账本
再能入账
最后能查账并算结果
```

如果只记一句话：

> 今天的目标是把页面从“假数据展示”改成“内存账本驱动展示”，并用 service 把新增交易和持仓计算分开。
