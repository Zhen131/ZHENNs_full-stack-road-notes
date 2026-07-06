# Week 4 Checklist

时间：2026-07-03 至 2026-07-09

主题：让页面真正活起来（useReducer 内存态）

---

## 总览

| 阶段 | 任务 | 状态 |
| --- | --- | --- |
| Gate 0 | 方案与入口同步 | 进行中 |
| Gate 1 | 建立 `initialLedgerData` 和 `ledgerReducer` | 未开始 |
| Gate 2 | 接通 `positionService` 和资产汇总 | 未开始 |
| Gate 3 | 交易列表改读 `LedgerData.trades` | 未开始 |
| Gate 4 | 接通 `tradeService` 和新增交易 | 未开始 |
| Gate 5 | 价格输入、资产汇总和手动验收 | 未开始 |

---

## Gate 0：方案与入口同步

- [ ] 阅读 `01A_W4-React状态与Service职责拆解.md`
- [ ] 阅读 `01B_W4-useReducer状态地基执行与验收标准.md`
- [ ] 同步当前开发状态、总路线图、Week 4 / Week 5 清单、README 和主架构图

## Gate 1：建立 useReducer 状态地基

- [ ] 新建 `src/state/initialLedgerData.ts`
- [ ] 新建 `src/state/ledgerReducer.ts`
- [ ] 支持 `trade/add`
- [ ] 支持 `trade/delete`
- [ ] 支持 `ledger/reset`
- [ ] 新建 `src/state/ledgerReducer.test.ts`
- [ ] reducer 不校验交易、不计算持仓、不碰存储

## Gate 2：接通 positionService 和资产汇总

- [ ] 新建 `src/services/positionService.ts`
- [ ] `positionService` 调用 `calculatePositions`
- [ ] 新建 `src/services/positionService.test.ts`
- [ ] `DashboardShell.tsx` 使用 `useReducer`
- [ ] 资产汇总渲染 `Position[]`
- [ ] 删除写死 `summaryRows`

## Gate 3：交易列表改读 LedgerData

- [ ] 删除写死 `trades`
- [ ] 交易列表渲染 `ledgerData.trades`
- [ ] 空列表显示空状态
- [ ] 不生成假交易演示

## Gate 4：接通 tradeService 和新增交易

- [ ] 新建 `src/services/tradeService.ts`
- [ ] 表单数据整理为 `TradeDraft`
- [ ] 调用 `validateTradeDraft`
- [ ] 校验成功生成正式 `Trade`
- [ ] 成功后 dispatch `trade/add`
- [ ] 校验失败不 dispatch、不污染账本

## Gate 5：价格输入、资产汇总和手动验收

- [ ] 价格输入写入 `LedgerData.priceSnapshots`
- [ ] 资产汇总随交易和价格更新
- [ ] 输入 Week 2 的 5 条样例交易核对数字
- [ ] 手动输入 BTC 价格核对未实现盈亏
- [ ] 试超卖确认被拦

## 本周不做

- [ ] 不做 IndexedDB
- [ ] 不做 localStorage
- [ ] 不做加密
- [ ] 不做导入导出
- [ ] 不做 NLP / Agent
