# Day 5 TypeScript 类型别名与编译机制学习笔记

日期：2026-06-23

状态：Day5 / TypeScript 基础补充

目标：补齐阅读 `positionCalculator.ts` 前必须理解的两个概念：`type` 类型别名，以及 TypeScript 与 JavaScript 的运行关系。

---

## 结论

本次确认两个基础规则：

1. `type DecimalString = string` 不是声明变量，而是给 `string` 起一个有业务含义的类型别名。
2. TypeScript 主要服务开发阶段，最终通常会被编译 / 转译成 JavaScript 后，由浏览器或 Node.js 执行。

对 `positionCalculator.ts` 来说，这能解释：

```ts
import type { DecimalString, Position, Trade } from "../models";
```

这里导入的是类型规则，不是运行时数据。

---

## 动机

选择先补 `type` 和 TS 编译机制，因为如果分不清“类型规则”和“真实数据”，就很难读懂 `Trade[] -> Position[]` 的函数签名。

---

## 类型别名

核心语法：

```ts
type DecimalString = string;
type CoinSymbol = string;
type PhoneNumber = string;
```

含义：

```text
给已有类型起一个新名字，让它带上更明确的业务身份。
```

它不是变量声明。变量声明应该写成：

```ts
let amount: DecimalString = "0.03628180";
```

可以拆成：

```text
let 变量名: 类型 = 值
```

所以：

```ts
let amount: DecimalString = "0.03628180";
```

本质上仍然是：

```ts
let amount: string = "0.03628180";
```

但 `DecimalString` 比普通 `string` 更能表达业务含义：这是用于精确小数计算的字符串。

---

## 套马甲类比

可以把 `string` 理解成底层工种，把类型别名理解成业务马甲。

底层都是字符串：

```ts
type DecimalString = string;
type CoinSymbol = string;
type PhoneNumber = string;
```

但业务身份不同：

| 类型别名 | 底层类型 | 业务含义 |
| --- | --- | --- |
| `DecimalString` | `string` | 小数字符串，例如 `"0.004854"` |
| `CoinSymbol` | `string` | 币种符号，例如 `"BTC"` |
| `PhoneNumber` | `string` | 电话号码字符串 |

类比到“套马甲”：

```text
维修工是底层能力。
飞机维修工、汽车维修工、摩托维修工是不同业务场景里的身份。
```

`type` 的价值不是减少代码量，而是让数据在代码里拥有更清楚的身份。

---

## TypeScript 与 JavaScript

核心关系：

```text
TypeScript = JavaScript + 类型系统
```

常见流程：

```text
TypeScript 代码（.ts）
  -> TypeScript Compiler / tsc
  -> JavaScript 代码（.js）
  -> 浏览器 / Node.js 执行
```

示例：

```ts
type DecimalString = string;

let amount: DecimalString = "0.03628180";
let coin: string = "BTC";
```

编译后大致变成：

```js
let amount = "0.03628180";
let coin = "BTC";
```

被删除的是类型信息：

```text
type DecimalString = string
: DecimalString
: string
```

原因：类型信息是给开发者和 TypeScript Compiler 检查用的，JavaScript 运行时不需要这些标注。

---

## 带批注图纸类比

TypeScript 像“带批注的施工图纸”：

```text
开发阶段：图纸上标注哪里是承重墙、哪里是水管、哪里是电线。
运行阶段：真正施工时，机器只需要可执行图纸，不需要把每条批注都当成实体。
```

对应到代码：

```text
TypeScript 类型标注 = 开发阶段批注
JavaScript 代码 = 最终运行内容
```

所以类型被“擦掉”不是类型没用，而是它已经在开发和编译检查阶段完成了职责。

---

## 类型世界与运行时世界

读 TS 代码时要分清两层：

| 层级 | 例子 | 是否运行时存在 | 作用 |
| --- | --- | --- | --- |
| 类型世界 | `type Trade = { ... }` | 否 | 规定数据形状，帮助编译期检查 |
| 运行时世界 | `const trade = { ... }` | 是 | 程序真正执行时使用的数据 |

最小例子：

```ts
type Trade = {
  assetSymbol: string;
  quantity: DecimalString;
};

const trade: Trade = {
  assetSymbol: "BTC",
  quantity: "0.1",
};
```

这里：

```text
Trade 是规则。
trade 是数据。
```

---

## 回到 positionCalculator

`positionCalculator.ts` 里的类型导入：

```ts
import type { DecimalString, Position, Trade } from "../models";
```

意思是：

```text
从 models 模块导入三个类型规则。
```

它们最终来自：

```text
src/models/index.ts
  -> src/models/types.ts
```

对应关系：

| 类型 | 作用 |
| --- | --- |
| `DecimalString` | 规定金额、价格、数量使用小数字符串 |
| `Trade` | 规定原始交易记录的字段结构 |
| `Position` | 规定计算后仓位结果的字段结构 |

函数签名：

```ts
export function calculatePositions(trades: Trade[]): Position[]
```

可以翻译成：

```text
输入一组符合 Trade 规则的真实交易数据，输出一组符合 Position 规则的仓位结果。
```

其中：

```text
Trade / Position 是类型规则。
trades 是运行时传进来的真实数据。
```

---

## 边界

本笔记只确认基础理解：

- `type` 是类型别名，不是变量。
- `DecimalString` 本质仍然是 `string`。
- TypeScript 类型主要用于开发期检查。
- 编译后运行的是 JavaScript。
- `import type` 导入的是类型规则，不是运行时数据。

本笔记暂不展开：

- `interface` 和 `type` 的完整差异。
- 泛型高级用法。
- TypeScript 编译配置。
- 运行时数据校验库。
- branded type 等更严格的类型建模方式。

---

## 自检表

| 问题 | 通过标准 |
| --- | --- |
| `type DecimalString = string` 是变量声明吗 | 不是，它是类型别名 |
| `DecimalString` 运行时存在吗 | 不作为运行时对象存在 |
| 为什么不直接写 `string` | 为了表达更清楚的业务身份 |
| TypeScript 最后由谁执行 | 通常先转成 JavaScript，再由浏览器或 Node.js 执行 |
| 类型为什么会被擦掉 | 类型只服务开发期和编译期检查，运行时不需要 |
| `Trade` 和 `trade` 的区别 | `Trade` 是规则，`trade` 是真实数据 |
| `import type` 导入什么 | 导入类型规则，不导入运行时值 |
