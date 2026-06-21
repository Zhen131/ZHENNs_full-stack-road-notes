# Day 1 Decimal 库选型说明

日期：2026-06-19

状态：Day1 决策记录

目标：确定 Week2 账本计算的高精度数字方案。

---

## 选型结论

第一版选用：

```text
decimal.js
```

数字策略：

```text
保存：DecimalString
计算：decimal.js Decimal
展示：格式化字符串
```

核心约束：

```text
账本核心计算禁止使用 JavaScript number 裸算。
```

---

## 为什么需要 Decimal

交易账本的底线是“可以功能少，但不能算错”。

JavaScript `number` 是二进制浮点数，不适合直接处理金融小数：

```ts
0.1 + 0.2 // 0.30000000000000004
```

本项目会长期计算：

- 加密资产数量，例如 `0.00016388` BTC。
- 成本基准，例如 `62` USD。
- 平均成本，例如 `0.24681469709865342`。
- 已实现盈亏和未实现盈亏。
- `quantity * price` 与 `totalValue` 的误差校验。

这些计算必须走十进制高精度方案。

---

## DecimalString 策略

第一版定义：

```ts
type DecimalString = string;
```

示例：

```ts
quantity: "0.00016388"
price: "67121.7"
totalValue: "11"
fee: "0"
```

保存层只保存字符串，不保存 `Decimal` 对象，也不保存 `number`。

理由：

- JSON 导入导出稳定。
- IndexedDB 未来可直接保存。
- 加密前后的明文结构清楚。
- 不丢十进制精度。
- 计算时再统一转成 Decimal。

---

## 三段式边界

| 阶段 | 格式 | 职责 |
| --- | --- | --- |
| 保存 | `DecimalString` | 长期数据、导入导出、加密前明文 |
| 计算 | `decimal.js Decimal` | 加减乘除、比较、误差判断 |
| 展示 | formatted string | 页面显示、金额/数量/均价格式化 |

重要规则：

- 展示可以四舍五入，保存值不能跟着变。
- `totalValue` 是第一版成本基准。
- `quantity * price` 只用于误差校验。
- 手续费第一版只记录，不计入成本和盈亏。

---

## 为什么选 decimal.js

候选：

```text
decimal.js
big.js
```

选择 `decimal.js` 的理由：

- 自带 TypeScript 类型，适合当前 Next.js + TypeScript 项目。
- API 覆盖加减乘除、比较、舍入、格式化等常用场景。
- 支持从字符串创建 Decimal，贴合 `DecimalString`。
- Week2 不只做简单加法，还要做均价、盈亏、误差校验。
- 项目后续有 IndexedDB、加密、导入导出、benchmark，需要长期稳定的计算核心。

取舍：

```text
big.js 更轻；decimal.js 更完整，更适合本项目长期使用。
```

---

## 使用边界

不要在全项目到处直接 `new Decimal()`。

推荐依赖方向：

```text
calculators / validators
  -> utils/decimalMath.ts
    -> decimal.js
```

各层规则：

- `utils/decimalMath.ts`：唯一集中封装 Decimal 操作。
- `calculators`：可以通过 `decimalMath` 做计算。
- `validators`：可以通过 `decimalMath` 做比较和误差判断。
- `services`：尽量只编排流程，不直接写 Decimal 细节。
- `components`：不直接接触 Decimal。
- `repositories / adapters`：只保存和读取 `DecimalString`。

---

## Week2 落地顺序

Day1：确定 `decimal.js` 和三段式策略。

Day2：安装 `decimal.js`，落地 `DecimalString` 和 `utils/decimalMath.ts`。

Day3-4：`positionCalculator`、`tradeValidator` 统一调用 `decimalMath`。

Day5：用 Vitest golden tests 固定计算结果。

---

## 自检表

| 问题 | 决策 |
| --- | --- |
| 保存小数用什么 | `DecimalString` |
| 计算小数用什么 | `decimal.js` |
| 展示小数用什么 | 格式化字符串 |
| 成本基准用什么 | `totalValue` |
| 能否裸用 `number` 算账 | 不能 |
| Decimal 操作集中在哪里 | `utils/decimalMath.ts` |
| 页面能不能直接用 Decimal | 不能 |
