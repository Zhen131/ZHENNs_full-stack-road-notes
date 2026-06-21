# Week 1 验收记录

日期：2026-06-18

对应计划：Week 1 Day 6（清单日期：2026-06-17）

结论：通过。Week 2 可以直接从数据模型代码和计算函数开始。

说明：实际日期 2026-06-18 已是清单里的 Day 7，本次只补做 Day 6 验收，不开新功能。

---

## 成果验收

| 项目 | 文件 / 位置 | 结果 |
| --- | --- | --- |
| 账本第一版说明书 | `01-账本第一版说明书.md` | 通过：MVP 边界清楚，明确第一版只做记录交易和基础持仓盈亏 |
| 5 条测试交易 | `01-5条假交易样例.md` | 通过：覆盖 BTC、ETH、ADA，同日多笔和 ADA 多次买入 |
| 核心数据结构 | `02-核心数据结构设计草稿.md` | 通过：`Trade`、`Asset`、`PriceSnapshot`、`LedgerData`、`schemaVersion` 已定义 |
| 页面草图和流程 | `03-首页草图和用户流程.md` | 通过：资产汇总、新增交易、交易列表、价格输入四块清楚 |
| 保存层规则 | `05A_W1` / `05B_W1` / `05C_W1` | 通过：页面 -> Service -> Repository -> StorageAdapter -> EncryptionService 链路明确 |
| 网页项目空壳 | `../../产出/LocalFirstTradingLedger` | 通过：Next.js 项目可 lint、可 build；当前页面数据仅为视觉占位，Week3 必须替换为真实状态和 Week2 计算结果 |

---

## 运行验收

在 `01一些进度/产出/LocalFirstTradingLedger` 运行：

```bash
npm run lint
npm run build
```

结果：

- `npm run lint`：通过，无 ESLint warnings 或 errors。
- `npm run build`：通过，`/` 页面成功静态构建。

---

## 5 条测试交易

Week 2 先用这 5 条作为第一组固定测试数据。

| id | 日期 | 类型 | 资产 | 数量 | 均价 | 总金额 | 货币 |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| trade-001 | 2026-04-02 | buy | BTC | 0.00016388 | 67121.7 | 11 | USD |
| trade-002 | 2026-04-02 | buy | ETH | 0.004854 | 2059.99 | 10 | USD |
| trade-003 | 2026-04-02 | buy | ADA | 41.58 | 0.2405 | 10 | USD |
| trade-004 | 2026-04-09 | buy | ADA | 126.6825 | 0.2526 | 32 | USD |
| trade-005 | 2026-04-14 | buy | ADA | 82.9381 | 0.2412 | 20 | USD |

---

## 手算基准

第一版以 `totalValue` 作为成本基准，`price * quantity` 只用于校验误差。

| 资产 | 持仓数量 | 成本基准 | 平均成本 |
| --- | ---: | ---: | ---: |
| BTC | 0.00016388 | 11 | 67122.28459848669 |
| ETH | 0.004854 | 10 | 2060.1565718994643 |
| ADA | 251.2006 | 62 | 0.24681469709865342 |

验收口径：

- 当前 5 条都是买入，所以已实现盈亏为 0。
- 还没有价格快照，所以当前市值和未实现盈亏先不算。
- `price * quantity` 和 `totalValue` 允许有四舍五入误差，Week 2 需要写误差校验。

---

## Week 2 计算函数清单

先写最小核心，不做 UI、不做存储、不做加密。

| 函数 | 作用 | 最小验收 |
| --- | --- | --- |
| `normalizeDecimalInput` | 统一清理数字字符串 | 空值、负数、非数字被拦住 |
| `validateTradeDraft` | 校验交易草稿 | 数量、价格、总金额、资产、买卖类型合法 |
| `validateTotalTolerance` | 校验 `quantity * price` 和 `totalValue` 误差 | 样例交易全部通过 |
| `sortTradesByOccurredAt` | 按交易日期排序 | 同日交易保持稳定顺序 |
| `calculatePositions` | 从交易列表算持仓 | 上面的手算基准全部对上 |
| `applyBuy` | 买入后更新持仓和平均成本 | ADA 三次买入后均价对上 |
| `applySell` | 卖出后更新持仓和已实现盈亏 | 卖出不能超过当前持仓 |
| `getLatestPriceByAsset` | 取每个资产最新价格 | 没有价格时返回空状态 |
| `calculateUnrealizedPnl` | 用最新价格算未实现盈亏 | 没有价格时不乱算 |

Week 2 第一条可执行任务：把 `Trade`、`Asset`、`PriceSnapshot`、`Position` 类型落到 `src/models`，再用这 5 条交易写一个最小测试。
