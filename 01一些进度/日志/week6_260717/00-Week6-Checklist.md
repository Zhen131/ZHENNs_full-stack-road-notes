# Week 6 Checklist

时间：2026-07-17 至 2026-07-23

主题：补完 React 内存态 II

详细执行：[[00-Week6每日执行清单]]

> 提前实施说明（2026-07-16）：为关闭 07A 风险，Day 1-4 和部分 Day 5-6
> 已在功能分支提前完成。未勾选项仍需按原日期补人工验收。

> 收口结果（2026-07-17）：按 `01A` v3 一次性完成剩余开发与验收。完整证据见
> [[01B_W6-全周开发与Gate验收记录]]；原每日日期只保留为历史计划。

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 7月17日 | Day 1：接通新增交易表单 | 已提前完成 |
| 7月18日 | Day 2：接通删除交易 | 已提前完成 |
| 7月19日 | Day 3：建立价格录入 service | 已提前完成 |
| 7月20日 | Day 4：接通价格输入与 reducer | 已提前完成 |
| 7月21日 | Day 5：执行核心场景验收 | 已按 01A 一次性完成 |
| 7月22日 | Day 6：修复阻断并关闭 React Gate | 已完成，Gate Go |
| 7月23日 | Day 7：休息 | 历史日程，不适用本次一次性执行 |

---

## 前置 Gate

- [x] Week 5 Gate 2 通过
- [x] Week 5 Gate 3 通过
- [x] 生产资产来源通过
- [x] `tradeService` 通过

## Day 1：新增交易

- [x] 表单整理为 `TradeDraft`
- [x] 调用 `tradeService`
- [x] 成功 dispatch `trade/add`
- [x] 失败不 dispatch

## Day 2：删除交易

- [x] 页面通过安全删除 Service 接入 `trade/delete`
- [x] 删除后列表和持仓同步
- [x] 空列表显示空状态

## Day 3：价格 service

- [x] 校验资产、价格、币种和时间
- [x] 生成完整 `PriceSnapshot`
- [x] 新建测试

## Day 4：价格 UI

- [x] 增加价格 snapshot action
- [x] 新增 reducer 测试
- [x] 表单成功后 dispatch
- [x] 市值与未实现盈亏联动

## Day 5：核心验收

- [x] 通过生产 UI 输入 5 条 golden
- [x] 核对 BTC / ETH / ADA 结果
- [x] BTC 70000 USD 价格结果正确
- [x] 超卖被拒
- [x] 删除后重新派生正确

## Day 6：React Gate

- [x] test 通过
- [x] lint 通过
- [x] build 通过
- [x] Dashboard 无写死 `summaryRows` / `trades`
- [x] 记录 Go / No-Go

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

---

## Week 6 通过线

- [x] Gate 2-5 全绿
- [x] `LedgerData` 是唯一事实来源
- [x] 合法新增、删除和价格输入联动正确
- [x] golden 与超卖验收通过
- [x] test / lint / build 通过

## Week 6 范围调整

- IndexedDB 因 07A 补漏已在独立功能分支提前实施；没有使用 localStorage。
- 未做导入导出、真加密、图表和 UI 美化。

## Week 7 Go / No-Go

- [x] 全部通过：正式关闭 React Gate
- [x] 07A 提前实现属于独立分支例外，不替代 5 条 golden 人工验收
