# Week 6 全周开发与 Gate 验收记录

日期：2026-07-17

结论：**Week 6 React Gate: Go**。Gate 2-5 已全部关闭；Week 7 可以进入已实现持久化地基的真实浏览器验收，但不得把 Week 6 Go 写成 Week 7 存储 Gate 已通过。

## 本次完成

- 资产汇总由六列扩为八列，新增：
  - `Position.costBasis + currency`：剩余成本基础（暂不计手续费）。
  - `Position.realizedPnl + currency`：已实现盈亏（暂不计手续费）。
- 空持仓 `colSpan` 改为 8，宽表保留容器内横向滚动。
- 新增 `DashboardShell.golden.test.tsx`，逐笔填写真实交易与价格表单，不直接 dispatch、不预写 `Trade[]`、不向 Repository 灌 golden。
- 修复宽窄屏页面级横向溢出：Section 与主内容允许收缩，桌面侧栏不再被宽表压缩。

源码提交：

```text
c139bb1 功能：补齐持仓成本与已实现盈亏展示
0f272de 测试：新增第六周黄金场景界面回归
c92fc98 修复：收口宽窄屏页面横向溢出
a517aed 文档：同步第六周React Gate结果
```

## golden 与价格结果

生产验收使用 `next build` 后的独立端口 `3106 / 3107`；默认 `http://localhost:3000` 与用户现有浏览器数据未被清理。布局修复后在全新 `3107` origin 从空库重跑完整场景。

| 资产 | 页面数量 | 页面剩余成本 | 页面已实现盈亏 | 结论 |
| --- | --- | --- | --- | --- |
| BTC | `0.00016388` | `11 USD` | `0 USD` | 通过 |
| ETH | `0.004854` | `10 USD` | `0 USD` | 通过 |
| ADA | `85.3244` | `21.29782215288611544461778471138845553823 USD` | `-0.70217784711388455538221528861154446177 USD` | 与固定答案在 `0.0000000001` 容差内一致 |

BTC 价格录入：

```text
价格：70000 USD
日期：2026-04-15
页面市值：11.4716 USD
页面未实现盈亏：0.4716 USD
结论：通过
```

手续费均为 `0 USD`；本次没有改变“手续费只记录、暂不计入成本和盈亏”的口径。

## 失败与删除场景

| 场景 | 实际结果 | 账本结果 |
| --- | --- | --- |
| ADA `85.3245 @ 1` 超卖 | 显示“卖出数量超过该时间点的可用持仓” | 仍为 5 条交易，ADA 数量与盈亏不变 |
| 删除 2026-04-09 ADA 买入 | 显示时间线失效错误 | 仍为 5 条交易 |
| 删除 2026-04-02 BTC 买入 | 删除成功 | 变为 4 条交易，BTC 持仓消失，ETH / ADA 不变 |

## 宽窄屏缺陷闭环

首次人工验收发现页面整体横向溢出：

```text
1280px viewport -> document scrollWidth 1568
390px viewport  -> document scrollWidth 1153
```

先新增失败回归，再进行最小修复。修复后：

```text
1280px -> document 1280 / 1280，侧栏 240，主内容 1040
390px  -> document 390 / 390，主布局为 column
390px 资产表 -> clientWidth 308 / scrollWidth 1092
390px 交易表 -> clientWidth 308 / scrollWidth 680
```

结论：页面级横向溢出已关闭，宽表仍能在自己的容器内滚动；生产浏览器控制台无 warning / error。

## 自动化与边界复审

```text
npm test       -> 19 files passed, 154 tests passed
npm run lint   -> No ESLint warnings or errors
npm run build  -> Compiled successfully
git diff --check -> 通过
```

边界确认：

- 生产组件没有导入 `src/test/fixtures.ts`。
- UI 没有新增 Decimal 计算、浮点转换或持仓公式。
- `Position[]` 仍由 `positionService -> positionCalculator` 临时派生，不进入 state 或存储。
- 未修改 schema、Repository、hydration、依赖、排序、分页或 Week 8+ 能力。
- IndexedDB API 仍只位于 StorageAdapter；本次未使用 localStorage。

## Gate 结论

| 通过线 | 结果 |
| --- | --- |
| 两个新字段与手续费口径 | 通过 |
| golden UI 自动化与生产人工验收 | 通过 |
| BTC 价格、ADA 超卖、两类删除 | 通过 |
| 390 / 1280 宽窄屏 | 通过 |
| test / lint / build / diff-check | 通过 |
| 无越界改动 | 通过 |

**Week 6 React Gate: Go。**

## Week 7 唯一剩余入口

Week 7 不重写 IndexedDB、Repository 或 hydration。只验收：新增/删除/价格刷新恢复、clear 后刷新、DevTools whole-blob 明文 envelope，以及 load/save 失败场景。任一红灯则 Week 8 No-Go。
