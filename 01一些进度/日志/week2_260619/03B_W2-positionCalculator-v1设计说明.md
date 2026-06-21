# Day 3 positionCalculator v1 设计说明

日期：2026-06-22

状态：Day3 / Day4 合并设计说明

目标：定义 `positionCalculator` 第一版要算什么、不算什么，以及买入 / 卖出的成本和盈亏口径。

---

## 结论

`positionCalculator v1` 的职责是：

```text
Trade[] -> Position[]
```

第一版同时支持：

- 买入：增加持仓数量、增加成本、重算平均成本。
- 卖出：减少持仓数量、按卖出前平均成本结转成本、计算已实现盈亏。

本版不处理自然语言解析、不保存数据、不读取 IndexedDB、不处理加密、不计算未实现盈亏。

---

## 动机

选择先做 `buy + sell` 的最小计算器，因为当前 5 条样例已经包含 4 条买入和 1 条卖出；只做买入会无法验证真实账本的成本结转和 `realizedPnl`。

---

## 输入与输出

输入：

```ts
Trade[]
```

输出：

```ts
Position[]
```

`Trade` 是原始交易事实，要保存。

`Position` 是计算结果，不保存，只在需要展示、测试或查询时从交易重新推导。

---

## v1 要计算什么

| 字段 | 含义 | v1 规则 |
| --- | --- | --- |
| `assetSymbol` | 资产代码 | 按资产分组，例如 BTC / ETH / ADA |
| `quantity` | 当前剩余持仓数量 | 买入增加，卖出减少 |
| `costBasis` | 当前剩余持仓成本 | 买入增加 `totalValue`，卖出减少结转成本 |
| `averageCost` | 当前平均成本 | `costBasis / quantity` |
| `realizedPnl` | 已实现盈亏 | 卖出金额减去卖出部分成本 |
| `currency` | 计价货币 | 第一版默认 USD |

---

## v1 不计算什么

- 不计算 `latestPrice`。
- 不计算 `marketValue`。
- 不计算 `unrealizedPnl`。
- 不处理 `PriceSnapshot[]`。
- 不处理手续费进成本。
- 不处理转仓、空投、奖励、仓位调整。
- 不处理多币种换算。
- 不做展示格式化。

这些都留给后续版本或 future work。

---

## 成本口径

核心规则：

```text
costBasis = Σ trade.totalValue
```

解释：

- 买入成本以 `Trade.totalValue` 为准。
- `quantity * price` 只用于误差校验。
- 真实成交金额可能四舍五入，所以不能用 `quantity * price` 反推成本。
- 手续费第一版只记录，不计入成本和盈亏。

---

## 买入规则

对于一条 `type: "buy"` 的交易：

```text
newQuantity = oldQuantity + trade.quantity
newCostBasis = oldCostBasis + trade.totalValue
newAverageCost = newCostBasis / newQuantity
realizedPnl 不变
```

示例：

```text
ADA 第 1 次买入：
quantity = 41.58
costBasis = 10

ADA 第 2 次买入：
quantity = 41.58 + 126.6825 = 168.2625
costBasis = 10 + 32 = 42
averageCost = 42 / 168.2625 = 0.24960998439937597504
```

---

## 卖出规则

对于一条 `type: "sell"` 的交易：

先取卖出前平均成本：

```text
averageCostBeforeSell = oldCostBasis / oldQuantity
```

再计算卖出部分应结转的成本：

```text
soldCostBasis = sellQuantity * averageCostBeforeSell
```

再更新剩余仓位：

```text
newQuantity = oldQuantity - sellQuantity
newCostBasis = oldCostBasis - soldCostBasis
newAverageCost = newCostBasis / newQuantity
```

最后计算已实现盈亏：

```text
realizedPnl += sellTotalValue - soldCostBasis
```

如果卖出数量大于当前持仓，计算器应防御性失败；正式拦截职责后续放在 `tradeValidator`。

---

## 5 条样例预期结果

固定输入来自 `03A_W2-5条样例Trade数据.md`。

| 资产 | 预期结果 |
| --- | --- |
| BTC | 持仓 `0.00016388`，成本 `11`，均价 `67122.28459848669`，已实现盈亏 `0` |
| ETH | 持仓 `0.004854`，成本 `10`，均价 `2060.1565718994643`，已实现盈亏 `0` |
| ADA 卖出前 | 数量 `168.2625`，成本 `42`，均价 `0.24960998439937597504` |
| ADA 卖出 | 卖出数量 `82.9381`，卖出金额 `20`，结转成本 `20.702177847113884555` |
| ADA 卖出后 | 剩余数量 `85.3244`，剩余成本 `21.297822152886115445`，均价 `0.24960998439937597504`，已实现盈亏 `-0.702177847113884555` |

---

## 建议函数形态

第一版可以先设计为纯函数：

```ts
function calculatePositions(trades: Trade[]): Position[]
```

规则：

- 内部按 `occurredAt` 排序。
- 同一天交易按输入顺序处理。
- 按 `assetSymbol` 分组。
- 所有小数计算只通过 `utils/decimalMath.ts`。
- 输出 `DecimalString`，不输出 `Decimal` 对象。

---

## 边界

`positionCalculator` 可以依赖：

- `models`
- `utils/decimalMath.ts`

`positionCalculator` 不能依赖：

- UI / components
- services
- repositories
- adapters
- IndexedDB
- EncryptionService

计算器只算结果，不保存结果。

---

## 自检表

| 问题 | 标准 |
| --- | --- |
| 是否从 `Trade[]` 推导 `Position[]` | 是 |
| 是否保存 `Position` | 否 |
| 买入成本是否使用 `totalValue` | 是 |
| 是否用 `quantity * price` 当成本 | 否 |
| 卖出是否按卖出前均价结转成本 | 是 |
| 是否计算 `realizedPnl` | 是 |
| 是否计算 `unrealizedPnl` | 否 |
| 是否处理 `PriceSnapshot` | 否 |
| 是否让页面 / Repository / IndexedDB 参与计算 | 否 |
| 是否所有金额和数量都保持 `DecimalString` | 是 |

---

## 下一步

如果本说明确认无误，下一步再进入源码：

```text
src/calculators/positionCalculator.ts
```

最小实现顺序：

1. 写 `calculatePositions(trades: Trade[]): Position[]`。
2. 先跑 5 条样例，确认 BTC / ETH / ADA 数字与本文件一致。
3. 再考虑是否补轻量测试文件。
