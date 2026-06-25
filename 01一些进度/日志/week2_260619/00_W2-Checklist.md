# Week 2 Checklist

时间：2026-06-19 至 2026-06-25

主题：先让账本算得对（计算引擎 + 测试）

---

## 总览

| 日期 | 任务 | 状态 |
| --- | --- | --- |
| 6月19日 | Day 1：搭目录骨架、选定 decimal 库 | 已完成 |
| 6月20日 | Day 2：落地类型 + DecimalMath | 已完成 |
| 6月21日 | Day 3：写持仓与均价计算（买入） | 已完成 |
| 6月22日 | Day 4：写卖出、盈亏与校验 | 已完成 |
| 6月23日 | Day 5：写 Vitest golden 测试 | 已完成 |
| 6月24日 | Day 6：写开发日志、整理下周 | 已完成 |
| 6月25日 | Day 7：休息与轻复盘 | 已完成 |

---

## Day 1：搭目录骨架、选定 decimal 库

- [x] 建 src 目录骨架（models/services/repositories/adapters/calculators/validators/utils）
- [x] 选定 decimal 库（decimal.js 或 big.js）
- [x] 定下 DecimalString 三段式（存/算/展示）
- [x] 写本周验收标准

## Day 2：落地类型 + DecimalMath

- [x] 把 Trade/Asset/PriceSnapshot/FeeRule/Position 等类型写进 models
- [x] 写 decimalMath（加减乘除/比较/格式化）
- [x] 业务代码里不再裸算 quantity*price

## Day 3：写持仓与均价计算（买入）

- [x] 写 positionCalculator 买入逻辑
- [x] 锁定 costBasis = Σ totalValue
- [x] 手续费不计入成本

## Day 4：写卖出、盈亏与校验

- [x] 卖出按均价结转 realizedPnl
- [x] 未实现盈亏 = 市值 − 成本
- [x] 写 tradeValidator（含卖出不超持仓）

## Day 5：写 Vitest golden 测试

- [x] 装 Vitest
- [x] 5 条样例断言 ADA 剩余数量 85.3244 / 均价≈0.2496 / 剩余成本 21.297822152886115445 / realizedPnl -0.702177847113884555
- [x] 加超卖报错用例
- [x] 加卖出后 realizedPnl 用例
- [x] 加无快照、最新快照、同时间快照、币种边界和未实现盈亏用例

## Day 6：写开发日志、整理下周

- [x] 写计算口径决策日志（进论文 Implementation）
- [x] 整理 Week 3 任务

## Day 7：休息与轻复盘

- [x] 看一遍本周代码和测试
- [x] 记录 Week 3 需要补价格输入、价格校验和页面内存状态
