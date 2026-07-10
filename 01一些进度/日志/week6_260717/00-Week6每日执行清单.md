# Week 6 每日执行清单

时间：2026-07-17 至 2026-07-23

主题：补完 React 内存态 II（Gate 4、Gate 5 与最终验收）

> Week 6 仍不做 IndexedDB。只有新增、删除、价格、持仓联动、golden 和超卖全部在内存态通过，Week 7 才能开始持久化。

本周结论：

```text
表单能新增
-> 列表能删除
-> 价格能写入
-> 持仓能联动
-> golden 与超卖通过
-> Gate 2-5 全绿
```

---

## 进入 Week 6 前必须通过

- Week 5 Gate 2、Gate 3、生产资产来源和 `tradeService` 已完成。
- Dashboard 使用 `useReducer` 管 `LedgerData`。
- 资产汇总和交易列表不再读取硬编码数组。
- `positionService` 和 `tradeService` 测试通过。

任一前置条件未通过，Day 1 自动改为补 Week 5 欠账，不强行执行本周任务。

---

## Day 1：7月17日，接通新增交易表单

今天只做一件事：完成 `表单 -> tradeService -> dispatch -> 列表/持仓更新`。

要做：

- 将输入字段整理为 `TradeDraft`。
- 调用 `tradeService`。
- 成功后 dispatch `trade/add`。
- 失败只显示结构化错误，不 dispatch。
- 成功后清理表单状态。
- 覆盖买入、卖出、非法字段和超卖 UI 路径。

产出：

- 可用的新增交易垂直切片。

完成标准：

- 合法交易增加一行，持仓同步变化。
- 非法或超卖交易不改变 `LedgerData`。
- 页面不直接调用 `validateTradeDraft(...)`。
- 页面不生成绕过 service 的假 Trade。

---

## Day 2：7月18日，接通删除交易

今天只做一件事：让页面使用已存在的 `trade/delete` action。

要做：

- 在真实交易列表增加最小删除入口。
- dispatch 已有 `trade/delete`。
- 删除后列表和派生持仓同步更新。
- 删除最后一笔后显示空状态。
- 不新增重复的删除 reducer 逻辑。

产出：

- 删除交易垂直切片。

完成标准：

- 删除按 `trade.id` 生效。
- 原 reducer 行为保持不变。
- 删除后不会留下旧持仓或旧汇总。

---

## Day 3：7月19日，建立价格录入 service

今天只做一件事：把不可信价格输入转换为完整 `PriceSnapshot`。

要做：

- 新建最小价格录入 service 或等价纯业务函数。
- 校验资产存在。
- 校验价格为合法正 DecimalString。
- 校验币种与资产计价币种一致。
- 补齐 id、recordedAt、source、createdAt、updatedAt。
- 返回结构化成功或错误结果。
- 新建测试。

产出：

- 生产 `PriceSnapshot` 构造与校验入口。

完成标准：

- 不从 test fixtures 生成生产快照。
- 非法价格、未知资产、币种不匹配不进入状态。
- 同一 recordedAt 的后录入快照可作为更正。

---

## Day 4：7月20日，接通价格输入与 reducer

今天只做一件事：完成 `价格表单 -> price service -> dispatch -> 持仓联动`。

要做：

- 为 reducer 增加追加完整 `PriceSnapshot` 的 action。
- 增加 reducer 测试。
- 价格表单调用 Day 3 的生产入口。
- 成功后 dispatch，失败只展示错误。
- 资产汇总重新派生 latestPrice、marketValue、unrealizedPnl。

产出：

- 价格输入垂直切片。

完成标准：

- `priceSnapshots` 是事实数据，`Position[]` 仍不保存。
- 页面不复制最新价格选择和盈亏公式。
- 无匹配价格时可选字段保持空值，不显示伪造的 0。

---

## Day 5：7月21日，执行核心场景验收

今天只做一件事：用生产 UI 验收 Week 2 标准答案。

要做：

- 清空用户交易和价格，保留生产资产目录。
- 逐笔输入 5 条 golden 交易：BTC buy、ETH buy、ADA buy、ADA buy、ADA sell。
- 核对：
  - BTC：quantity `0.00016388`、costBasis `11`、realizedPnl `0`。
  - ETH：quantity `0.004854`、costBasis `10`、realizedPnl `0`。
  - ADA：quantity `85.3244`、costBasis `21.297822152886115445`、realizedPnl `-0.702177847113884555`。
- 输入 BTC 价格 `70000 USD`，核对 marketValue `11.4716`、unrealizedPnl `0.4716`。
- 尝试超卖，确认交易列表和持仓不变。
- 删除一笔交易，确认列表和持仓重新派生。

产出：

- 核心场景手动验收记录。

完成标准：

- 页面结果与 Week 2 测试/手算一致。
- 非法输入不会污染状态。
- 删除、价格和持仓之间没有陈旧数据。

---

## Day 6：7月22日，修复阻断并关闭 React Gate

今天只做一件事：让 Gate 2-5 全绿，不开发新功能。

要做：

- 运行全部测试、lint、build。
- 修复本周验收发现的 P0 阻断。
- 复跑 Day 5 核心场景。
- 扫描 Dashboard 是否仍有写死 `summaryRows` 或 `trades`。
- 记录通过项、未通过项、验证命令和结果。

产出：

- Week 6 Gate 记录。
- Week 7 Go / No-Go 结论。

完成标准：

- Gate 2-5 全部通过时，Week 7 才是 Go。
- 任一项失败时，Week 7 Day 1 继续当前欠账。
- 不为赶日期降低验收线。

---

## Day 7：7月23日，休息

今天不做开发、不补欠账。

允许做：

- 记录问题。

不做：

- 不开 IndexedDB。
- 不挪用休息日修 bug。

---

## 本周产出物

- 新增交易 UI 闭环。
- 删除交易 UI 闭环。
- 价格录入 service 与测试。
- 价格 reducer action 与 UI 闭环。
- golden / 价格 / 超卖 / 删除验收记录。
- React 内存态最终 Gate。

## 本周验收标准

- `LedgerData` 是页面唯一事实来源。
- 合法新增、删除、价格更新都能驱动列表和持仓。
- `positionService` 复用 Calculator，`tradeService` 复用 Validator。
- 页面组件没有计算公式和持久化代码。
- 5 条 golden 与 BTC 价格结果正确。
- 超卖被拒，失败不污染账本。
- test / lint / build 通过。

## Week 7 进入条件

- [ ] Gate 2 通过
- [ ] Gate 3 通过
- [ ] Gate 4 通过
- [ ] Gate 5 通过
- [ ] 核心场景手动验收通过
- [ ] test / lint / build 通过

任一未勾选：Week 7 禁止进入 IndexedDB。

## 本周不可做

- 不做 IndexedDB / localStorage。
- 不做导入导出、加密和图表。
- 不做资产管理 UI。
- 不做 UI 美化。

## 论文素材点

- 输入、service、reducer 和派生计算的数据流。
- 失败不污染事实数据。
- 真实页面与 golden test 的一致性。
- 为什么持久化必须排在内存态之后。

## 落后时处理

- Day 6 只修阻断，不加功能。
- 红灯项自动顺延。
- Week 7 及后续整体顺延。
- Day 7 保持休息。
