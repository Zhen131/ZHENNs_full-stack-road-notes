# Week 5 Checklist

时间：2026-07-10 至 2026-07-16

主题：数据存得住（IndexedDB 持久化）

---

## 总览

进入本周前先看一句话：

> Week5 不是重新设计页面状态，而是把 Week4 已经跑通的 `useReducer + LedgerData` 内存账本接到 IndexedDB。Week4 没过，就先补 Week4。

| 日期 | 任务 | 状态 |
| --- | --- | --- |
| 7月10日 | Day 1：学 IndexedDB、定方案 | 未开始 |
| 7月11日 | Day 2：写 IndexedDB 存取工 | 未开始 |
| 7月12日 | Day 3：写账本总管 + 组装点 | 未开始 |
| 7月13日 | Day 4：把页面切换到走保存层 | 未开始 |
| 7月14日 | Day 5：验收持久化 | 未开始 |
| 7月15日 | Day 6：写日志、整理下周 | 未开始 |
| 7月16日 | Day 7：休息与轻复盘 | 未开始 |

---

## Week 5 前置检查

- [ ] `DashboardShell` 已使用 `useReducer(ledgerReducer, initialLedgerData)`
- [ ] `LedgerData` 已包含 `assets / trades / priceSnapshots / feeRules`
- [ ] `ledgerReducer` 已支持 `trade/add`、`trade/delete`、`ledger/reset`
- [ ] 新增交易已经通过 `tradeService -> validateTradeDraft -> Trade -> dispatch` 跑通
- [ ] 持仓展示已经通过 `positionService -> calculatePositions(...)` 跑通
- [ ] 页面交易列表和资产汇总不再读取硬编码假数组
- [ ] 刷新丢失数据是可接受的 Week4 状态，尚未引入 `localStorage`

如果以上任一项没完成，Day 1 先补 Week4，不进入 IndexedDB。

---

## Day 1：学 IndexedDB、定方案

- [ ] 复核 Week4 前置检查全部通过
- [ ] 学 IndexedDB（db/objectStore/事务/异步）
- [ ] 用 idb 库降低异步复杂度
- [ ] 定第一版 whole-blob 整坨读写
- [ ] 明确 Week5 只持久化 `LedgerData`，不保存 `Position[]`

## Day 2：写 IndexedDB 存取工

- [ ] 实现 indexedDbStorageAdapter 的 read/write
- [ ] 空库返回默认空结构不崩

## Day 3：写账本总管 + 组装点

- [ ] 实现 ledgerRepository（保存/读取/清空）
- [ ] 建组装点工厂：Noop 加密 + IndexedDB adapter

## Day 4：把页面切换到走保存层

- [ ] 启动时从 repository 读、变更后写
- [ ] 页面/service 不直接碰 IndexedDB
- [ ] `ledgerReducer` 不直接碰 IndexedDB
- [ ] `positionService` 不保存数据，只从账本数据派生持仓

## Day 5：验收持久化

- [ ] 加交易→刷新→数据还在
- [ ] clearAll 后变空
- [ ] DevTools Application 面板看到数据
- [ ] 交易 / 统计结果与 Week4 内存态一致

## Day 6：写日志、整理下周

- [ ] 写存储架构日志（进论文 Implementation）
- [ ] 整理 Week 6 任务

## Day 7：休息与轻复盘

- [ ] 看一遍保存层代码
- [ ] 记录新问题
