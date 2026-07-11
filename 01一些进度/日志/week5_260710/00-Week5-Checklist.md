# Week 5 Checklist

时间：2026-07-10 至 2026-07-16

主题：补完 React 内存态 I

详细执行：[[00-Week5每日执行清单]]

> 原 IndexedDB 计划已于 2026-07-10 停止；原因是 Week 4 Gate 2-5 未通过。Week 5 只补内存态。

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 7月10日 | Day 1：事实盘点与路线重排，不写源码 | 已完成 |
| 7月11日 | Day 2：实现 `positionService` | 已完成 |
| 7月12日 | Day 3：Dashboard 接入真实持仓 | 未开始 |
| 7月13日 | Day 4：确定生产资产来源 | 未开始 |
| 7月14日 | Day 5：实现 `tradeService` | 未开始 |
| 7月15日 | Day 6：交易列表改读 `LedgerData.trades` | 未开始 |
| 7月16日 | Day 7：休息 | 未开始 |

---

## Day 1：事实盘点与路线重排

- [x] 读取指定状态、路线、Week 4/5、Week 6-13 和源码关键文件
- [x] 确认 Gate 1 已完成、Gate 2-5 未完成
- [x] 确认 Dashboard 仍为硬编码页面
- [x] 确认 Calculator / Validator 必须复用
- [x] 重排 Week 5-13
- [x] 当天不写源码

## Day 2：positionService

- [x] 新建 `positionService.ts`
- [x] 只调用 `calculatePositions(...)`
- [x] 新建 service 测试
- [x] 不保存 `Position[]`

> Day 2 已完成 service 地基；完整 Gate 2 仍等待 Day 3 Dashboard 真实持仓接线。

## Day 3：Dashboard 真实持仓

- [ ] 接入 `useReducer + LedgerData`
- [ ] 删除 `summaryRows`
- [ ] 渲染 `positionService` 派生结果
- [ ] 空账本显示空状态

## Day 4：生产资产来源

- [ ] 建立独立生产资产目录
- [ ] BTC、ETH、ADA 进入初始 `LedgerData.assets`
- [ ] reset 恢复内建资产目录
- [ ] 生产代码不导入 test fixtures

## Day 5：tradeService

- [ ] 调用 `validateTradeDraft(...)`
- [ ] 传入当前 assets 和 priorTrades
- [ ] 生成字段完整的正式 Trade
- [ ] 合法、非法、超卖测试通过

## Day 6：真实交易列表

- [ ] 删除写死 `trades`
- [ ] 渲染 `ledgerData.trades`
- [ ] 增加空状态
- [ ] 记录 Week 5 Gate

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

---

## Week 5 通过线

- [ ] Gate 2 通过
- [ ] Gate 3 通过
- [ ] 生产资产来源通过
- [ ] `tradeService` 通过
- [ ] Dashboard 不再读取硬编码资产和交易
- [ ] 测试、lint、build 通过

## Week 5 不做

- [ ] 不做 IndexedDB / localStorage
- [ ] 不做导入导出
- [ ] 不做加密
- [ ] 不接价格输入
- [ ] 不做 UI 美化
