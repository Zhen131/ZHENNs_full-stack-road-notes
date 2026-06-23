# 05B_W2 positionCalculator 仓位计算 TS 自测题

日期：2026-06-23

目的：用“顶级架构师 + 大厂面试官”的方式，反向测试自己是否真正读懂 `positionCalculator.ts`、相关类型定义、精确小数工具和测试文件。

使用方式：

1. 先不要看代码，尝试口头回答每一题。
2. 回答时尽量说出“业务含义 + TypeScript 语法含义”。
3. 回答完再打开代码核对。
4. 如果一道题只能说业务结论，但说不清代码为什么这么写，说明还没完全通过。

相关文件：

- `src/calculators/positionCalculator.ts`
- `src/calculators/positionCalculator.test.ts`
- `src/models/types.ts`
- `src/utils/decimalMath.ts`
- `03B_W2-positionCalculator-v1设计说明.md`
- `04A_W2-positionCalculator代码逐行学习笔记.md`

---

## 评分标准

| 结果  | 标准                             |
| --- | ------------------------------ |
| 通过  | 能解释业务目的、代码流程、关键 TS 语法，并能手算核心样例 |
| 半通过 | 大概懂业务，但 TS 语法或边界条件说不清          |
| 未通过 | 只能背结论，不能从代码推导出为什么              |

建议目标：

```text
前 4 题必须能稳定答出。
第 5-8 题能答出，说明你已经读懂主流程。
第 9-10 题能答出，说明你开始具备架构视角。
```

---

## Q1. 入口函数识别：这段代码到底在干什么？

难度：1 / 10

请用一句话解释：

```ts
export function calculatePositions(trades: Trade[]): Position[]
```

要求回答：

- `calculatePositions` 的输入是什么？
- 输出是什么？
- `Trade[] -> Position[]` 在账本项目里是什么意思？
- `export function`、`Trade[]`、`: Position[]` 分别是什么 TS 语法？

考察点：

- 是否知道这是整个仓位计算器的主入口。
- 是否能把 TS 函数签名翻译成业务语言。

通过标准：

- 能说出“输入一组交易，输出一组当前仓位”。
- 能类比 `Trade[]` 类似 Java 的 `List<Trade>` 或 Python 的 `list[Trade]`。

面试官追问：

```text
如果这个函数没有 export，测试文件还能直接 import 它吗？为什么？
```

---

## Q2. 类型不是值：为什么这里用 import type？

难度：2 / 10

请解释这一行：

```ts
import type { DecimalString, Position, Trade } from "../models";
```

要求回答：

- `import type` 和普通 `import` 有什么区别？
- `DecimalString`、`Position`、`Trade` 在运行时真的存在吗？
- `../models` 最终导向的是哪个类型定义文件？
- 为什么仓位计算器需要这些类型？

考察点：

- 是否理解 TypeScript 的类型检查和 JavaScript 运行时代码是两层东西。
- 是否知道 `type` 定义主要服务编译期，不是运行时对象。

通过标准：

- 能说出“这里只导入类型，不导入运行时值”。
- 能解释 `DecimalString` 本质是 `string`，但业务上表示小数字符串。

面试官追问：

```text
如果把 import type 改成普通 import，代码通常还能跑吗？那为什么项目仍然倾向于写 import type？
```

---

## Q3. 数据模型边界：Trade 为什么保存，Position 为什么不保存？

难度：3 / 10

请解释：

```text
Trade 是原始交易事实，要保存。
Position 是计算结果，不保存。
```

要求回答：

- `Trade` 里哪些字段体现了“交易事实”？
- `Position` 里哪些字段体现了“计算结果”？
- 如果同时保存 `Trade` 和 `Position`，可能出现什么一致性问题？
- 为什么从架构上更推荐由 `Trade[]` 推导 `Position[]`？

考察点：

- 是否理解“事实数据”和“派生数据”的区别。
- 是否理解 local-first 账本里数据一致性的重要性。

通过标准：

- 能用“流水明细”和“汇总报表”的类比讲清楚。
- 能说明 Position 不保存是为了避免双写和不同步。

面试官追问：

```text
如果未来交易记录有 10 万条，每次重新计算 Position 很慢，你会立刻改成保存 Position 吗？还是有别的架构方案？
```

---

## Q4. 内部状态设计：PositionAccumulator 是什么？

难度：4 / 10

请解释：

```ts
type PositionAccumulator = {
  assetSymbol: string;
  quantity: DecimalString;
  costBasis: DecimalString;
  realizedPnl: DecimalString;
  currency: string;
};
```

要求回答：

- `type` 在 TS 里是什么意思？
- `PositionAccumulator` 和最终输出的 `Position` 有什么区别？
- 为什么它叫 accumulator？
- 为什么这里存 `costBasis` 和 `realizedPnl`，但不存 `averageCost`？

考察点：

- 是否理解中间状态和最终输出的区别。
- 是否理解平均成本可以由 `costBasis / quantity` 推导。

通过标准：

- 能说出 accumulator 是遍历交易时不断更新的“草稿仓位”。
- 能说出 `averageCost` 不需要一直存，最后统一算即可。

面试官追问：

```text
如果 PositionAccumulator 里也存 averageCost，会带来什么维护风险？
```

---

## Q5. Map 分组：positionsByAsset 为什么用 Map<string, PositionAccumulator>？

难度：5 / 10

请解释：

```ts
const positionsByAsset = new Map<string, PositionAccumulator>();
```

要求回答：

- `Map<string, PositionAccumulator>` 是什么结构？
- key 是什么？value 是什么？
- 为什么不能简单用一个数组存所有中间仓位？
- `getOrCreatePosition` 和这个 Map 是什么关系？

考察点：

- 是否理解按资产代码聚合仓位。
- 是否理解 `Map<K, V>` 的泛型含义。

通过标准：

- 能说出这是一个按 `assetSymbol` 分组的字典。
- 能类比 Java `HashMap<String, PositionAccumulator>` 或 Python `dict`。

面试官追问：

```text
如果先后有两条 ADA 交易，第二条交易如何找到第一条交易留下的 ADA 草稿仓位？
```

---

## Q6. 主循环：一条交易如何流过 calculatePositions？

难度：6 / 10

请根据代码解释完整流程：

```ts
for (const trade of sortTradesByOccurredAt(trades)) {
  const current = getOrCreatePosition(positionsByAsset, trade);

  if (trade.type === "buy") {
    applyBuy(current, trade);
    continue;
  }

  applySell(current, trade);
}
```

要求回答：

- 为什么要先 `sortTradesByOccurredAt(trades)`？
- `for...of` 是什么意思？
- `const current = ...` 拿到的是什么？
- `trade.type === "buy"` 为什么用 `===`？
- `continue` 在这里防止了什么？
- 为什么不是 buy 就会进入 sell？

考察点：

- 是否能按执行顺序读代码。
- 是否理解排序、分组、分支、更新状态的关系。

通过标准：

- 能画出这条链路：

```text
Trade[] -> sort -> for each trade -> get/create accumulator -> buy or sell -> update accumulator
```

面试官追问：

```text
如果未来 TradeType 增加了 "transfer" 或 "airdrop"，这段 if/else 逻辑还安全吗？你会怎么改？
```

---

## Q7. 买入逻辑：请手算 quantity、costBasis、averageCost

难度：7 / 10

请解释并手算：

```ts
function applyBuy(position: PositionAccumulator, trade: Trade): void {
  position.quantity = add(position.quantity, trade.quantity);
  position.costBasis = add(position.costBasis, trade.totalValue);
}
```

样例：

```text
ADA 第 1 次买入：
quantity = 41.58
totalValue = 10

ADA 第 2 次买入：
quantity = 126.6825
totalValue = 32
```

要求回答：

- 第一次买入后 `quantity` 是多少？
- 第一次买入后 `costBasis` 是多少？
- 第二次买入后 `quantity` 是多少？
- 第二次买入后 `costBasis` 是多少？
- 第二次买入后 `averageCost` 怎么算？
- 为什么不用 `quantity * price` 反推成本？
- `: void` 说明这个函数如何产生效果？

考察点：

- 是否真的会手算买入后的仓位变化。
- 是否理解这个函数是直接修改传入的 `position`。

通过标准：

能算出：

```text
quantity = 41.58 + 126.6825 = 168.2625
costBasis = 10 + 32 = 42
averageCost = 42 / 168.2625 = 0.24960998439937597504
```

面试官追问：

```text
为什么买入会改变 averageCost，但不会改变 realizedPnl？
```

---

## Q8. 卖出逻辑：averageCostBeforeSell、soldCostBasis、realizedPnl 分别是什么？

难度：8 / 10

请解释并手算：

```ts
const averageCostBeforeSell = divide(position.costBasis, position.quantity);
const soldCostBasis = multiply(trade.quantity, averageCostBeforeSell);

position.quantity = subtract(position.quantity, trade.quantity);
position.costBasis = subtract(position.costBasis, soldCostBasis);
position.realizedPnl = add(
  position.realizedPnl,
  subtract(trade.totalValue, soldCostBasis),
);
```

样例：

```text
卖出前：
quantity = 168.2625
costBasis = 42

本次卖出：
sellQuantity = 82.9381
sellTotalValue = 20
```

要求回答：

- `averageCostBeforeSell` 为什么一定要在减少 quantity 之前算？
- `soldCostBasis` 是卖出收入吗？如果不是，它是什么？
- `realizedPnl` 为什么是 `sellTotalValue - soldCostBasis`？
- 卖出后剩余 `quantity` 是多少？
- 卖出后剩余 `costBasis` 是多少？
- 为什么卖出后剩余仓位的平均成本不会乱改？

考察点：

- 是否理解“卖出按卖出前平均成本结转成本”。
- 是否能区分卖出收入、历史成本、已实现盈亏。

通过标准：

能算出：

```text
averageCostBeforeSell = 42 / 168.2625
                      = 0.24960998439937597504

soldCostBasis = 82.9381 * 0.24960998439937597504
              = 20.702177847113884555

newQuantity = 168.2625 - 82.9381
            = 85.3244

newCostBasis = 42 - 20.702177847113884555
             = 21.297822152886115445

realizedPnl = 20 - 20.702177847113884555
            = -0.702177847113884555
```

面试官追问：

```text
如果你把 averageCostBeforeSell 放在 position.quantity 减少之后再算，会发生什么错误？
```

---

## Q9. 测试证明：positionCalculator.test.ts 到底证明了什么？

难度：9 / 10

请解释测试文件中的核心结构：

```ts
test("calculates positions, average cost, and realized PnL from buy and sell trades", () => {
  const positions = calculatePositions(sampleTrades);
  ...
});
```

以及：

```ts
test("rejects selling more than the current position", () => {
  assert.throws(...)
});
```

要求回答：

- `sampleTrades` 覆盖了哪些场景？
- 为什么 BTC / ETH 主要证明纯买入逻辑？
- 为什么 ADA 同时证明买入和卖出逻辑？
- `positionFor` 这个 helper 函数解决了什么问题？
- 为什么平均成本、成本基准、盈亏要用 `assertDecimalClose`，而不是全部用 `assert.equal`？
- 超卖测试证明了 calculator 的哪条防御性规则？

考察点：

- 是否理解测试不是“跑一下”，而是在证明具体业务规则。
- 是否能从测试反推出设计目标。

通过标准：

- 能说明第一组测试验证正常路径，第二组测试验证错误路径。
- 能说明 tolerance 是为了处理除法产生的长小数。

面试官追问：

```text
这个测试文件还缺哪些边界测试？例如清仓、同一天排序、多币种混用、空数组等。
```

---

## Q10. 架构演进：如果你是负责人，下一版你会怎么设计？

难度：10 / 10

请站在架构师角度回答：

当前 `positionCalculator v1` 的边界是：

```text
只处理 buy / sell
只从 Trade[] 计算 Position[]
不读写 storage
不调用 repository
不处理 UI
不计算 latestPrice / marketValue / unrealizedPnl
不处理手续费进成本
不处理多币种换算
```

要求回答：

- 为什么 calculator 应该保持 pure function？
- 如果要加入 `PriceSnapshot[]`，你会让哪个函数签名变化？
- `unrealizedPnl` 应该怎么计算？
- 手续费是否应该进入成本？你会如何设计兼容策略？
- 多币种交易能不能直接混在当前 `costBasis` 里？
- 如果交易数量很多，性能优化应该放在哪里？是保存 Position，还是引入 cache / checkpoint？
- 如果未来 `TradeType` 增加更多类型，当前代码哪些地方需要改？

考察点：

- 是否能从当前代码读出边界。
- 是否能提出演进方案，而不是直接把所有功能塞进一个函数。

通过标准：

能说出类似判断：

```text
positionCalculator 应该继续只做计算。
存储、UI、价格读取、格式化都不应该混进来。
如果性能需要优化，可以考虑 PositionCache / checkpoint，
但原始事实仍然应该是 Trade[]。
```

面试官追问：

```text
如果你把读取 IndexedDB 的逻辑直接写进 calculatePositions，会破坏哪些架构边界？
```

---

## 最终自检

如果你能不看代码回答下面这 5 句话，说明你已经初步通过：

1. `Trade[] -> Position[]` 是从原始交易事实推导当前仓位结果。
2. `PositionAccumulator` 是遍历交易时临时维护的草稿仓位。
3. 买入只增加 `quantity` 和 `costBasis`，不改变 `realizedPnl`。
4. 卖出用卖出前平均成本计算 `soldCostBasis`，再更新剩余成本和已实现盈亏。
5. `Position` 不保存，因为它是可由 `Trade[]` 重算出来的派生结果。

---

## 建议答题顺序

第一轮：只答 Q1-Q4，目标是把 TS 语法和数据模型讲清楚。

第二轮：答 Q5-Q8，目标是把完整计算流程和手算跑通。

第三轮：答 Q9-Q10，目标是进入测试思维和架构思维。

如果有题答不出来，不要急着看答案，先回到对应代码段，把“业务动作”和“TS 语法”分别标出来。
