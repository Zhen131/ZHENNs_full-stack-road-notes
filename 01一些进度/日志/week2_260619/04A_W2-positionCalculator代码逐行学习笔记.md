# Day 4 positionCalculator 代码逐行学习笔记

日期：2026-06-22

状态：Day4 / 学习笔记

目标：把 `src/calculators/positionCalculator.ts` 拆成能读懂、能复述、能手算验证的代码说明。

---

## 结论

`positionCalculator.ts` 只做一件事：

```text
把一组 Trade[] 交易记录，计算成 Position[] 当前持仓结果。
```

它不保存数据，不读数据库，不处理页面，不解析自然语言。它只是一个纯计算器：输入交易，输出仓位。

---

## 动机

选择先吃透这份代码，因为 `Position` 不手动保存，而是由 `Trade[]` 每次重新计算；如果看不懂这个计算器，就看不懂账本项目的核心。

---

## 先建立整体图

```text
Trade[] 原始交易
  ↓
按 occurredAt 排序
  ↓
一条一条遍历
  ↓
按 assetSymbol 找到对应草稿仓位
  ↓
buy 走 applyBuy
sell 走 applySell
  ↓
把草稿仓位转成正式 Position[]
```

用一句人话说：

```text
这份代码像一个会计小算盘，它按时间顺序看交易流水，然后给每种资产分别算剩多少、成本多少、均价多少、已实现盈亏多少。
```

---

## TypeScript 预备知识

| 语法                     | 含义                 | 类比                                       |
| ---------------------- | ------------------ | ---------------------------------------- |
| `type`                 | 定义一个数据形状，不会变成运行时代码 | Java 的 class 字段约束 / C 的 struct 思维        |
| `import type`          | 只导入类型，运行时不会真的导入值   | 告诉 TypeScript 编译器“我只要类型检查”               |
| `export function`      | 导出函数，让别的文件可以调用     | Java 的 public method / Python 模块函数       |
| `Trade[]`              | Trade 数组           | Java 的 `List<Trade>`，C 里可以理解成一组 Trade    |
| `Position[]`           | Position 数组        | 一组 Position                              |
| `: Position[]`         | 函数返回值类型            | Java 方法声明里的返回类型                          |
| `const`                | 常量绑定，变量名不能重新指向别的东西 | Java 的 `final` 局部变量思维                    |
| `Map<K, V>`            | key-value 字典       | Java 的 `HashMap<K, V>`，Python 的 `dict`   |
| `void`                 | 函数不返回结果            | Java/C 的 `void`                          |
| `===`                  | 严格相等               | 比 JavaScript 的 `==` 更安全                  |
| `!==`                  | 严格不相等              | 严格版“不等于”                                 |
| `throw new Error(...)` | 主动报错并中断            | Java 的 `throw new RuntimeException(...)` |

---

## 第 1 行：导入类型

代码：

```ts
import type { DecimalString, Position, Trade } from "../models";
```

逐句解释：

| 片段                                   | 解释                                                         |
| ------------------------------------ | ---------------------------------------------------------- |
| `import`                             | 从别的文件拿东西进来用。                                               |
| `type`                               | 表示这里拿的只是 TypeScript 类型，不是运行时函数或对象。                         |
| `{ DecimalString, Position, Trade }` | 从 `../models` 里拿三个类型名字。                                    |
| `DecimalString`                      | 小数字符串类型，本质是 `string`，例如 `"0.004854"`。项目用字符串存小数，避免 JS 浮点误差。 |
| `Position`                           | 最终计算出来的仓位结果类型。                                             |
| `Trade`                              | 原始交易记录类型。                                                  |
| `"../models"`                        | 相对路径，表示从当前文件上一级的 `models` 模块导入。                            |

为什么用 `import type`：

```text
因为 DecimalString / Position / Trade 只用来做类型检查，不需要在浏览器或 Node 运行时真的存在。
```

这能让编译结果更干净，也能避免“只为了类型却产生运行时依赖”。

---

## 第 2-10 行：导入小数计算工具

代码：

```ts
import {
  add,
  divide,
  isGreaterThan,
  isZero,
  multiply,
  subtract,
  toDecimalString,
} from "../utils/decimalMath";
```

逐句解释：

| 行 | 解释 |
| --- | --- |
| `import {` | 从工具文件里导入多个真实函数。这里不是 `import type`，因为这些函数运行时真的要执行。 |
| `add` | 加法工具，例如 `"1.1" + "2.2"` 安全算成 `"3.3"`。 |
| `divide` | 除法工具，用来算平均成本，例如 `costBasis / quantity`。 |
| `isGreaterThan` | 大于判断，用来检查“卖出数量是否超过当前持仓”。 |
| `isZero` | 判断一个小数是不是 0，用来防止除以 0 或处理清仓。 |
| `multiply` | 乘法工具，用来算卖出部分成本：`sellQuantity * averageCostBeforeSell`。 |
| `subtract` | 减法工具，用来减少数量、减少成本。 |
| `toDecimalString` | 把 Decimal 计算结果统一转回字符串。 |
| `from "../utils/decimalMath"` | 这些函数来自项目自己的小数计算工具。 |

关键点：

```text
仓位计算不直接用 + - * /，而是全部通过 decimalMath。
```

原因是 JavaScript 原生 number 会有浮点误差，账本项目不能让钱和币的数量被浮点误差污染。

---

## 第 12-24 行：定义内部草稿仓位 PositionAccumulator

代码：

```ts
/**
 * PositionAccumulator 是计算过程中的 internal state。
 *
 * 它不是最终要给 UI / service 使用的 Position，而是 calculator 在遍历 Trade[]
 * 时临时维护的“草稿仓位”。等所有交易都处理完，再统一转成正式 Position。
 */
type PositionAccumulator = {
  assetSymbol: string;
  quantity: DecimalString;
  costBasis: DecimalString;
  realizedPnl: DecimalString;
  currency: string;
};
```

逐句解释：

| 行                              | 解释                                                 |
| ------------------------------ | -------------------------------------------------- |
| `/** ... */`                   | TSDoc / JSDoc 注释，给人和编辑器看的说明。                       |
| `type PositionAccumulator = {` | 定义一个类型，名字叫 `PositionAccumulator`。它描述“草稿仓位”应该有哪些字段。 |
| `assetSymbol: string;`         | 资产代码，例如 `"BTC"`、`"ETH"`、`"ADA"`。                   |
| `quantity: DecimalString;`     | 当前持仓数量，用小数字符串保存。                                   |
| `costBasis: DecimalString;`    | 当前剩余持仓成本。买入增加，卖出按成本结转减少。                           |
| `realizedPnl: DecimalString;`  | 已实现盈亏。只有卖出时才会变化。                                   |
| `currency: string;`            | 计价货币，例如 `"USD"`。                                   |
| `};`                           | 类型定义结束。                                            |

为什么需要这个类型：

```text
Position 是最终输出；PositionAccumulator 是中间计算草稿。
```

它像草稿纸。代码一边读交易，一边在草稿纸上改数量、成本和盈亏。等所有交易处理完，才把草稿纸誊写成正式 `Position`。

---

## 第 37-52 行：主函数 calculatePositions

代码：

```ts
export function calculatePositions(trades: Trade[]): Position[] {
  const positionsByAsset = new Map<string, PositionAccumulator>();

  for (const trade of sortTradesByOccurredAt(trades)) {
    const current = getOrCreatePosition(positionsByAsset, trade);

    if (trade.type === "buy") {
      applyBuy(current, trade);
      continue;
    }

    applySell(current, trade);
  }

  return Array.from(positionsByAsset.values()).map(toPosition);
}
```

逐句解释：

| 行                                                                  | 解释                                                       |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| `export function`                                                  | 定义并导出一个函数。别的文件可以 import 它。                               |
| `calculatePositions`                                               | 函数名，意思是“计算仓位”。                                           |
| `(trades: Trade[])`                                                | 参数叫 `trades`，类型是 `Trade[]`，也就是一组交易。                      |
| `: Position[]`                                                     | 返回值类型是 `Position[]`，也就是一组仓位结果。                           |
| `{`                                                                | 函数体开始。                                                   |
| `const positionsByAsset = new Map<string, PositionAccumulator>();` | 创建一个 Map，用资产代码作为 key，用草稿仓位作为 value。                      |
| `Map<string, PositionAccumulator>`                                 | key 是 `string`，例如 `"ADA"`；value 是 `PositionAccumulator`。 |
| `for (const trade of sortTradesByOccurredAt(trades))`              | 先把交易按时间排序，然后一条一条遍历。                                      |
| `const current = getOrCreatePosition(...)`                         | 找到这条交易对应资产的草稿仓位；如果没有，就创建一个空草稿仓位。                         |
| `if (trade.type === "buy")`                                        | 判断这条交易是不是买入。                                             |
| `applyBuy(current, trade);`                                        | 如果是买入，就用买入规则更新草稿仓位。                                      |
| `continue;`                                                        | 本轮循环结束，直接处理下一条交易。这样买入不会继续走到卖出逻辑。                         |
| `applySell(current, trade);`                                       | 如果不是买入，就按当前 v1 设计当成卖出处理。                                 |
| `return Array.from(...).map(toPosition);`                          | 把 Map 里的草稿仓位取出来，逐个转换成正式 Position，然后返回。                   |

这一段的核心业务意思：

```text
每一条交易只会走一条路：
buy -> applyBuy
sell -> applySell
```

为什么 `sell` 没有写 `else if (trade.type === "sell")`：

```text
因为 TradeType 当前只有 "buy" | "sell" 两种。不是 buy，就只能是 sell。
```

以后如果 `TradeType` 增加 `transfer`、`airdrop`、`adjustment`，这里就必须改成更严格的分支。

---

## 第 61-69 行：按交易时间排序

代码：

```ts
function sortTradesByOccurredAt(trades: Trade[]): Trade[] {
  return trades
    .map((trade, index) => ({ trade, index }))
    .sort((left, right) => {
      const dateOrder = left.trade.occurredAt.localeCompare(right.trade.occurredAt);
      return dateOrder === 0 ? left.index - right.index : dateOrder;
    })
    .map(({ trade }) => trade);
}
```

逐句解释：

| 行 | 解释 |
| --- | --- |
| `function sortTradesByOccurredAt` | 定义一个内部函数，名字是“按 occurredAt 排序交易”。没有 `export`，所以只在本文件内部使用。 |
| `(trades: Trade[])` | 输入一组交易。 |
| `: Trade[]` | 输出仍然是一组交易，只是顺序变了。 |
| `return trades` | 返回处理后的结果。 |
| `.map((trade, index) => ({ trade, index }))` | 把每条交易包装成 `{ trade, index }`。`index` 是原始顺序。 |
| `(trade, index) => ...` | 箭头函数，类似 Java/Python 里的匿名函数。 |
| `({ trade, index })` | 返回一个对象。外层小括号表示“这是对象字面量，不是函数体”。 |
| `.sort((left, right) => { ... })` | 对包装后的数组排序。`left` 和 `right` 是任意两条要比较的记录。 |
| `localeCompare` | 比较两个字符串的顺序。这里比较日期字符串。 |
| `dateOrder === 0` | 如果两个日期完全一样。 |
| `? left.index - right.index : dateOrder` | 三元表达式。日期相同就按原始输入顺序排；日期不同就按日期排。 |
| `.map(({ trade }) => trade)` | 排完序后，把包装拆掉，只留下原来的 `trade`。 |

为什么要保留 `index`：

```text
如果两条交易发生在同一天，代码让它们保持用户输入时的原顺序。
```

这对手动记账很重要。因为同一天先买后卖，和先卖后买，计算结果可能完全不同。

---

## 第 77-101 行：取出或创建草稿仓位

代码：

```ts
function getOrCreatePosition(
  positionsByAsset: Map<string, PositionAccumulator>,
  trade: Trade,
): PositionAccumulator {
  const existing = positionsByAsset.get(trade.assetSymbol);

  if (existing) {
    if (existing.currency !== trade.currency) {
      throw new Error(`Mixed currencies are not supported for ${trade.assetSymbol}`);
    }

    return existing;
  }

  const created: PositionAccumulator = {
    assetSymbol: trade.assetSymbol,
    quantity: "0",
    costBasis: "0",
    realizedPnl: "0",
    currency: trade.currency,
  };

  positionsByAsset.set(trade.assetSymbol, created);
  return created;
}
```

逐句解释：

| 行 | 解释 |
| --- | --- |
| `function getOrCreatePosition` | 定义内部函数：根据交易找到对应资产的草稿仓位。 |
| `positionsByAsset: Map<string, PositionAccumulator>` | 第一个参数是 Map，里面存着各资产的草稿仓位。 |
| `trade: Trade` | 第二个参数是当前正在处理的交易。 |
| `): PositionAccumulator` | 返回一个草稿仓位。 |
| `const existing = positionsByAsset.get(trade.assetSymbol);` | 用交易里的资产代码去 Map 里找已有草稿仓位。 |
| `if (existing)` | 如果找到了已有仓位。 |
| `if (existing.currency !== trade.currency)` | 如果同一个资产前后使用了不同计价货币。 |
| `throw new Error(...)` | 直接报错。v1 不支持同一资产混用 USD、CNY 等不同币种。 |
| `` `...${trade.assetSymbol}` `` | 模板字符串，类似 Java/Python 里的字符串插值。 |
| `return existing;` | 如果已有仓位合法，就返回它。 |
| `const created: PositionAccumulator = { ... }` | 如果没有已有仓位，就创建一个新的草稿仓位。 |
| `quantity: "0"` | 初始持仓数量为 0。注意是字符串 `"0"`，不是数字 `0`。 |
| `costBasis: "0"` | 初始成本为 0。 |
| `realizedPnl: "0"` | 初始已实现盈亏为 0。 |
| `currency: trade.currency` | 计价货币沿用当前交易的货币。 |
| `positionsByAsset.set(trade.assetSymbol, created);` | 把新草稿仓位放进 Map，key 是资产代码。 |
| `return created;` | 返回新创建的草稿仓位。 |

这一段的核心业务意思：

```text
第一次遇到 ADA，就开一张 ADA 草稿纸；以后再遇到 ADA，就继续在这张草稿纸上修改。
```

---

## 第 111-114 行：买入逻辑 applyBuy

代码：

```ts
function applyBuy(position: PositionAccumulator, trade: Trade): void {
  position.quantity = add(position.quantity, trade.quantity);
  position.costBasis = add(position.costBasis, trade.totalValue);
}
```

逐句解释：

| 行 | 解释 |
| --- | --- |
| `function applyBuy` | 定义内部函数：处理一条买入交易。 |
| `position: PositionAccumulator` | 当前资产的草稿仓位。 |
| `trade: Trade` | 当前买入交易。 |
| `: void` | 这个函数不返回新对象，而是直接修改传进来的 `position`。 |
| `position.quantity = ...` | 更新持仓数量。 |
| `add(position.quantity, trade.quantity)` | 旧数量 + 本次买入数量。 |
| `position.costBasis = ...` | 更新成本基准。 |
| `add(position.costBasis, trade.totalValue)` | 旧成本 + 本次买入总额。 |

买入公式：

```text
newQuantity = oldQuantity + trade.quantity
newCostBasis = oldCostBasis + trade.totalValue
```

注意：

```text
这里没有用 trade.quantity * trade.price 计算成本。
```

原因是项目已经锁定口径：真实成交会有四舍五入，所以买入成本以 `trade.totalValue` 为准。

---

## 第 126-151 行：卖出逻辑 applySell

代码：

```ts
function applySell(position: PositionAccumulator, trade: Trade): void {
  // 正式的超卖拦截以后会放在 tradeValidator；calculator 这里保留防御性检查。
  if (isGreaterThan(trade.quantity, position.quantity)) {
    throw new Error(`Cannot sell more ${trade.assetSymbol} than current position`);
  }

  if (isZero(position.quantity)) {
    throw new Error(`Cannot sell ${trade.assetSymbol} with zero current position`);
  }

  const averageCostBeforeSell = divide(position.costBasis, position.quantity);
  const soldCostBasis = multiply(trade.quantity, averageCostBeforeSell);

  // 卖出不会改变剩余仓位的平均成本口径，只是按原平均成本结转掉一部分成本。
  position.quantity = subtract(position.quantity, trade.quantity);
  position.costBasis = subtract(position.costBasis, soldCostBasis);
  position.realizedPnl = add(
    position.realizedPnl,
    subtract(trade.totalValue, soldCostBasis),
  );

  // 清仓后把极小残留成本归零，避免 Decimal 除法留下没有业务意义的 dust。
  if (isZero(position.quantity)) {
    position.costBasis = "0";
  }
}
```

逐句解释：

| 行 | 解释 |
| --- | --- |
| `function applySell` | 定义内部函数：处理一条卖出交易。 |
| `position: PositionAccumulator` | 当前资产卖出前的草稿仓位。 |
| `trade: Trade` | 当前卖出交易。 |
| `: void` | 不返回值，直接修改 `position`。 |
| `if (isGreaterThan(trade.quantity, position.quantity))` | 如果卖出数量大于当前持仓数量。 |
| `throw new Error(...)` | 报错：不能卖出超过当前持仓的数量。 |
| `if (isZero(position.quantity))` | 如果当前持仓是 0。 |
| `throw new Error(...)` | 报错：0 仓位不能卖。 |
| `const averageCostBeforeSell = divide(position.costBasis, position.quantity);` | 计算卖出前平均成本。 |
| `const soldCostBasis = multiply(trade.quantity, averageCostBeforeSell);` | 计算这次卖出的那部分资产对应的历史成本。 |
| `position.quantity = subtract(...)` | 剩余数量 = 原数量 - 卖出数量。 |
| `position.costBasis = subtract(...)` | 剩余成本 = 原成本 - 卖出部分结转成本。 |
| `position.realizedPnl = add(...)` | 累加已实现盈亏。 |
| `subtract(trade.totalValue, soldCostBasis)` | 本次盈亏 = 卖出收到的钱 - 卖出部分历史成本。 |
| `if (isZero(position.quantity))` | 如果卖完之后数量为 0。 |
| `position.costBasis = "0"` | 把成本也归零，避免残留极小小数。 |

卖出公式：

```text
averageCostBeforeSell = oldCostBasis / oldQuantity
soldCostBasis = sellQuantity * averageCostBeforeSell
newQuantity = oldQuantity - sellQuantity
newCostBasis = oldCostBasis - soldCostBasis
realizedPnl += sellTotalValue - soldCostBasis
```

重要理解：

```text
卖出不会重新发明一个新均价。
它是按“卖出前平均成本”切掉一部分成本。
```

所以，如果 ADA 卖出前均价是 `0.24960998439937597504`，卖出后剩下的 ADA 均价仍然保持同一个成本口径。

---

## 第 158-167 行：把草稿仓位转成正式 Position

代码：

```ts
function toPosition(position: PositionAccumulator): Position {
  return {
    assetSymbol: position.assetSymbol,
    quantity: position.quantity,
    averageCost: calculateAverageCost(position),
    costBasis: position.costBasis,
    realizedPnl: position.realizedPnl,
    currency: position.currency,
  };
}
```

逐句解释：

| 行 | 解释 |
| --- | --- |
| `function toPosition` | 定义内部函数：把草稿仓位转换成正式仓位。 |
| `position: PositionAccumulator` | 输入一个草稿仓位。 |
| `: Position` | 返回一个正式 `Position`。 |
| `return { ... }` | 返回一个对象。 |
| `assetSymbol: position.assetSymbol` | 正式仓位的资产代码来自草稿仓位。 |
| `quantity: position.quantity` | 正式仓位数量来自草稿仓位。 |
| `averageCost: calculateAverageCost(position)` | 平均成本不是草稿里直接存的，而是在输出时计算。 |
| `costBasis: position.costBasis` | 正式仓位成本来自草稿仓位。 |
| `realizedPnl: position.realizedPnl` | 已实现盈亏来自草稿仓位。 |
| `currency: position.currency` | 计价货币来自草稿仓位。 |

为什么不输出 `latestPrice / marketValue / unrealizedPnl`：

```text
这些字段需要 PriceSnapshot 当前价格。
positionCalculator v1 只根据 Trade[] 计算，不读取价格快照。
```

所以这些字段先不填。

---

## 第 174-180 行：计算平均成本

代码：

```ts
function calculateAverageCost(position: PositionAccumulator): DecimalString {
  if (isZero(position.quantity)) {
    return "0";
  }

  return toDecimalString(divide(position.costBasis, position.quantity));
}
```

逐句解释：

| 行 | 解释 |
| --- | --- |
| `function calculateAverageCost` | 定义内部函数：计算当前平均成本。 |
| `position: PositionAccumulator` | 输入一个草稿仓位。 |
| `: DecimalString` | 返回小数字符串。 |
| `if (isZero(position.quantity))` | 如果当前数量是 0。 |
| `return "0";` | 空仓位均价返回 `"0"`，避免除以 0。 |
| `return toDecimalString(...)` | 非空仓位返回计算结果，并确保格式是 DecimalString。 |
| `divide(position.costBasis, position.quantity)` | 平均成本 = 当前成本 / 当前数量。 |

公式：

```text
averageCost = costBasis / quantity
```

为什么要先判断 0：

```text
因为任何数除以 0 都没有业务意义，decimalMath.divide 也会主动报错。
```

---

## 用 5 条样例串起来

固定输入来自 `03A_W2-5条样例Trade数据.md`。

| 顺序 | 交易 | calculator 做什么 |
| --- | --- | --- |
| 1 | 买入 BTC | 创建 BTC 草稿仓位，数量加 BTC 数量，成本加 `11` |
| 2 | 买入 ETH | 创建 ETH 草稿仓位，数量加 ETH 数量，成本加 `10` |
| 3 | 买入 ADA | 创建 ADA 草稿仓位，数量加 `41.58`，成本加 `10` |
| 4 | 买入 ADA | 找到已有 ADA 草稿仓位，数量再加 `126.6825`，成本再加 `32` |
| 5 | 卖出 ADA | 用 ADA 卖出前均价结转成本，减少数量和成本，计算已实现亏损 |

ADA 的关键手算：

```text
卖出前：
quantity = 41.58 + 126.6825 = 168.2625
costBasis = 10 + 32 = 42
averageCost = 42 / 168.2625 = 0.24960998439937597504

卖出：
sellQuantity = 82.9381
sellTotalValue = 20
soldCostBasis = 82.9381 * 0.24960998439937597504
              = 20.702177847113884555

卖出后：
quantity = 168.2625 - 82.9381 = 85.3244
costBasis = 42 - 20.702177847113884555
          = 21.297822152886115445
realizedPnl = 20 - 20.702177847113884555
            = -0.702177847113884555
```

---

## 本文件里最重要的 5 个概念

| 概念 | 必须记住的意思 |
| --- | --- |
| `Trade` | 原始交易事实，必须保存。 |
| `Position` | 计算结果，不保存，需要时由 Trade 推导。 |
| `PositionAccumulator` | 计算过程中的草稿仓位。 |
| `costBasis` | 当前剩余持仓成本，不是总买入金额，也不是市值。 |
| `realizedPnl` | 已经卖出后确认的盈亏，没卖出的浮盈浮亏不在这里。 |

---

## 边界

这份代码现在做：

- 买入计算。
- 卖出计算。
- 按资产分组。
- 按交易发生时间排序。
- 用 Decimal 工具做小数计算。
- 输出当前持仓。

这份代码现在不做：

- 自然语言转 Trade。
- Trade 字段校验。
- IndexedDB 保存。
- 加密盘读写。
- PriceSnapshot 当前价格读取。
- 未实现盈亏计算。
- 手续费进成本。
- 多币种换算。

---

## 自检表

| 问题 | 答案 |
| --- | --- |
| `calculatePositions` 的输入是什么 | `Trade[]` |
| `calculatePositions` 的输出是什么 | `Position[]` |
| 为什么用 `import type` | 只导入类型，不产生运行时依赖 |
| 为什么不用普通 `+ - * /` | 避免 JavaScript 浮点误差 |
| 为什么需要 `Map` | 按 `assetSymbol` 分组维护草稿仓位 |
| 买入改哪些字段 | `quantity`、`costBasis` |
| 卖出改哪些字段 | `quantity`、`costBasis`、`realizedPnl` |
| 平均成本怎么算 | `costBasis / quantity` |
| 空仓位均价为什么是 `"0"` | 避免除以 0 |
| `Position` 是否保存 | 不保存，随用随算 |

---

## 下一步建议

下一步不要急着 merge。

建议先做一轮“人肉运行代码”：

```text
拿 5 条样例 Trade，
从第 1 条开始，
手动模拟 Map 里面的 BTC / ETH / ADA 草稿仓位怎么变化。
```

如果这一步能复述出来，再进入代码层的下一步：读 `positionCalculator.test.ts`，看测试如何证明这个计算器是对的。
