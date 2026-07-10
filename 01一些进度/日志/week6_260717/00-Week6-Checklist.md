# Week 6 Checklist

时间：2026-07-17 至 2026-07-23

主题：补完 React 内存态 II

详细执行：[[00-Week6每日执行清单]]

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 7月17日 | Day 1：接通新增交易表单 | 未开始 |
| 7月18日 | Day 2：接通删除交易 | 未开始 |
| 7月19日 | Day 3：建立价格录入 service | 未开始 |
| 7月20日 | Day 4：接通价格输入与 reducer | 未开始 |
| 7月21日 | Day 5：执行核心场景验收 | 未开始 |
| 7月22日 | Day 6：修复阻断并关闭 React Gate | 未开始 |
| 7月23日 | Day 7：休息 | 未开始 |

---

## 前置 Gate

- [ ] Week 5 Gate 2 通过
- [ ] Week 5 Gate 3 通过
- [ ] 生产资产来源通过
- [ ] `tradeService` 通过

## Day 1：新增交易

- [ ] 表单整理为 `TradeDraft`
- [ ] 调用 `tradeService`
- [ ] 成功 dispatch `trade/add`
- [ ] 失败不 dispatch

## Day 2：删除交易

- [ ] 页面接入已有 `trade/delete`
- [ ] 删除后列表和持仓同步
- [ ] 空列表显示空状态

## Day 3：价格 service

- [ ] 校验资产、价格、币种和时间
- [ ] 生成完整 `PriceSnapshot`
- [ ] 新建测试

## Day 4：价格 UI

- [ ] 增加价格 snapshot action
- [ ] 新增 reducer 测试
- [ ] 表单成功后 dispatch
- [ ] 市值与未实现盈亏联动

## Day 5：核心验收

- [ ] 通过生产 UI 输入 5 条 golden
- [ ] 核对 BTC / ETH / ADA 结果
- [ ] BTC 70000 USD 价格结果正确
- [ ] 超卖被拒
- [ ] 删除后重新派生正确

## Day 6：React Gate

- [ ] test 通过
- [ ] lint 通过
- [ ] build 通过
- [ ] Dashboard 无写死 `summaryRows` / `trades`
- [ ] 记录 Go / No-Go

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

---

## Week 6 通过线

- [ ] Gate 2-5 全绿
- [ ] `LedgerData` 是唯一事实来源
- [ ] 合法新增、删除和价格输入联动正确
- [ ] golden 与超卖验收通过
- [ ] test / lint / build 通过

## Week 6 不做

- [ ] 不做 IndexedDB / localStorage
- [ ] 不做导入导出
- [ ] 不做加密
- [ ] 不做图表
- [ ] 不做 UI 美化

## Week 7 Go / No-Go

- [ ] 全部通过：Week 7 可以开始 IndexedDB
- [ ] 任一失败：Week 7 Day 1 继续补当前欠账
