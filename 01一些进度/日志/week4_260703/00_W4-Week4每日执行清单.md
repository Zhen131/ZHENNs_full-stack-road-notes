# Week 4 每日执行清单

时间：2026-07-03 至 2026-07-09  
主题：让页面真正活起来（useReducer 内存账本状态地基）

> 本周数据先放内存，刷新会丢。存盘是 Week 5 之后的事情。
> 当前方案已从零散 `useState` 调整为 `useReducer + LedgerData`。先让页面状态、service 和 calculator 的边界稳定，再接新增交易和价格输入。
> 起点：`DashboardShell.tsx` 仍有写死的 `summaryRows` 和 `trades`；`src/state/` 还不存在；`src/services/positionService.ts` 和 `tradeService.ts` 还不存在。

> 2026-07-10 实际终态：本周只完成 Gate 0 主方案和 Gate 1 reducer 状态地基；Gate 2-5 未完成，分别顺延到 Week 5-6。本文保留原始执行顺序作为历史标准，不把顺延工作倒填为 Week 4 成果。

---

## Gate 0：方案与入口同步

今天只做一件事：先把路线讲清楚，避免继续按旧计划推进。

要做：

- 阅读 `01A_W4-React状态与Service职责拆解.md`
- 阅读 `01B_W4-useReducer状态地基执行与验收标准.md`
- 更新当前开发状态、总路线图、Week 4 / Week 5 清单、README 和主架构图

产出：

- 统一后的 Week 4 执行标准

完成标准：

- 能说清：Week 4 先做 reducer 内存态，不做 IndexedDB
- 能说清：`Position[]` 不保存进 reducer state，而是由 service/calculator 推导

---

## Gate 1：建立 useReducer 状态地基

今天只做一件事：让页面拥有一个真正的内存版 `LedgerData`。

要做：

- 新建 `src/state/initialLedgerData.ts`
- 新建 `src/state/ledgerReducer.ts`
- 支持最小 action：
  - `trade/add`
  - `trade/delete`
  - `ledger/reset`
- 新建 `src/state/ledgerReducer.test.ts`
- 确认 reducer 不校验交易、不计算持仓、不碰存储

产出：

- `initialLedgerData`
- `ledgerReducer`
- reducer 测试

完成标准：

- `trade/add` 返回新 state，旧 state 不被修改
- `trade/delete` 按 `trade.id` 删除
- `ledger/reset` 回到初始账本
- reducer 测试通过

---

## Gate 2：接通 positionService 和资产汇总

今天只做一件事：让资产汇总来自当前账本计算结果，而不是写死数组。

要做：

- 新建 `src/services/positionService.ts`
- `positionService` 调用 `calculatePositions(ledgerData.trades, ledgerData.priceSnapshots)`
- 新建 `src/services/positionService.test.ts`
- 修改 `DashboardShell.tsx`：
  - 加 `"use client"`
  - 使用 `useReducer(ledgerReducer, initialLedgerData)`
  - 删除写死的 `summaryRows`
  - 资产汇总渲染 `positions`

产出：

- `positionService`
- 真实计算驱动的资产汇总

完成标准：

- 页面组件不直接调用 `calculatePositions`
- 页面组件不保存 `Position[]` state
- 没有价格快照时，不乱显示 0 市值或 0 盈亏

---

## Gate 3：交易列表改读 LedgerData

今天只做一件事：让交易列表显示 `ledgerData.trades`。

要做：

- 删除 `DashboardShell.tsx` 里写死的 `trades`
- 交易列表改为渲染 `ledgerData.trades`
- 空列表显示清晰空状态
- 暂时不让保存交易按钮生成假交易

产出：

- 来源真实的交易列表

完成标准：

- 初始交易列表显示“暂无交易”
- 未来 dispatch `trade/add` 后，列表能自然更新
- 页面里没有假交易数组

---

## Gate 4：接通 tradeService 和新增交易

今天只做一件事：让表单新增交易按正确流程入账。

要做：

- 新建 `src/services/tradeService.ts`
- 表单数据整理成 `TradeDraft`
- 调用 `validateTradeDraft`
- 校验成功后生成正式 `Trade`
- 页面收到成功结果后 dispatch：

```ts
dispatch({ type: "trade/add", trade });
```

- 校验失败只展示错误，不 dispatch，不污染 `LedgerData.trades`

产出：

- 可用的新增交易流程

完成标准：

- 合法交易提交后，交易列表增加一行
- 非法交易提交后，交易列表不变
- 超卖提交后，交易列表不变

---

## Gate 5：价格输入、资产汇总和手动验收

今天只做一件事：确认交易、价格和持仓汇总能形成完整内存态闭环。

要做：

- 接价格输入到 `LedgerData.priceSnapshots`
- 资产汇总通过 `positionService` 实时更新
- 逐条输入 Week 2 的 5 条样例交易
- 输入 BTC 价格核对市值和未实现盈亏
- 试一笔超卖确认被拦

产出：

- 手动验收记录
- 可演示的内存态页面

完成标准：

- 页面数字与 Week 2 测试 / 手算一致
- 刷新丢失数据是可接受限制
- 页面组件没有计算逻辑、没有 localStorage、没有 IndexedDB

---

## 本周产出物

- `initialLedgerData`
- `ledgerReducer`
- `positionService`
- `tradeService`
- 接入 `useReducer` 的 `DashboardShell`
- 交易列表和资产汇总不再依赖写死数组
- Week 4 手动验收记录

## 本周验收标准

- 页面状态由 `useReducer` 管理。
- `LedgerData` 是页面唯一事实来源。
- `Position[]` 由 `positionService` / `calculatePositions` 推导，不保存进 state。
- 合法交易能进入内存账本。
- 非法交易不会污染内存账本。
- 页面组件不写 IndexedDB、不写 localStorage、不重写计算公式。

## 论文素材点

- React 状态地基与业务分层：`UI / reducer state / service / calculator`
- 为什么先内存态再持久化
- 为什么 `Position[]` 是派生结果而不是保存对象

## 落后时可砍

- 价格输入和未实现盈亏可挪到 Week 5 前置补课。
- 死守：`useReducer + LedgerData`、交易列表真实状态、`positionService` 资产汇总。

## Week 4 最终结果（2026-07-10 回填）

| Gate | 最终状态 | 后续位置 |
| --- | --- | --- |
| Gate 0 | 主方案完成；入口同步未在 Week 4 收口 | Week 5 Day 1 |
| Gate 1 | 已完成并验证 | 保留 `02A_W4-Gate1-reducer状态地基实现记录.md` |
| Gate 2 | 未完成 | Week 5 |
| Gate 3 | 未完成 | Week 5 |
| Gate 4 | 未完成 | Week 5-6 |
| Gate 5 | 未完成 | Week 6 |
