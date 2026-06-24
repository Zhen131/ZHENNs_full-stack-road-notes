# Week 2 Checklist

时间：2026-06-19 至 2026-06-25

主题：先让账本算得对（计算引擎 + 测试）

---

## 总览

| 日期 | 任务 | 状态 |
| --- | --- | --- |
| 6月19日 | Day 1：搭目录骨架、选定 decimal 库 | 已完成 |
| 6月20日 | Day 2：落地类型 + DecimalMath | 已完成 |
| 6月21日 | Day 3：写持仓与均价计算（买入） | 未开始 |
| 6月22日 | Day 4：写卖出、盈亏与校验 | 未开始 |
| 6月23日 | Day 5：写 Vitest golden 测试 | 未开始 |
| 6月24日 | Day 6：写开发日志、整理下周 | 未开始 |
| 6月25日 | Day 7：休息与轻复盘 | 未开始 |

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

- [ ] 写 positionCalculator 买入逻辑
- [ ] 锁定 costBasis = Σ totalValue
- [ ] 手续费不计入成本

## Day 4：写卖出、盈亏与校验

- [ ] 卖出按均价结转 realizedPnl
- [ ] 未实现盈亏 = 市值 − 成本
- [ ] 写 tradeValidator（含卖出不超持仓）

## Day 5：写 Vitest golden 测试

- [ ] 装 Vitest
- [ ] 5 条样例断言 ADA 剩余数量 85.3244 / 均价≈0.2496 / 剩余成本 21.297822152886115445 / realizedPnl -0.702177847113884555
- [ ] 加超卖报错用例
- [ ] 加卖出后 realizedPnl 用例

## Day 6：写开发日志、整理下周

- [ ] 写计算口径决策日志（进论文 Implementation）
- [ ] 整理 Week 3 任务

## Day 7：休息与轻复盘

- [ ] 看一遍本周代码和测试
- [ ] 记录新问题
