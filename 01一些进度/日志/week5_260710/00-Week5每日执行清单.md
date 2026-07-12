# Week 5 每日执行清单

时间：2026-07-10 至 2026-07-16

主题：补完 React 内存态 I（Gate 2、Gate 3 与 Gate 4 service 地基）

> 2026-07-10 重排说明：原 Week 5 IndexedDB 计划因 Week 4 Gate 2-5 未通过而停止执行。Week 5 不做持久化，先让真实 `LedgerData`、service 和 Dashboard 跑起来。

本周结论：

```text
Day 1 只盘点和重排，不写源码
Day 2-5 每天一个主任务
Day 6 做真实交易列表和本周 Gate
Day 7 休息
```

---

## 本周起点

源码已经实现：

- `positionCalculator`。
- `tradeValidator`。
- `initialLedgerData`。
- `ledgerReducer`。
- `trade/add`、`trade/delete`、`ledger/reset`。

源码尚未实现：

- `positionService`。
- `tradeService`。
- Dashboard `useReducer` 接线。
- 生产资产来源。
- 真实资产汇总和交易列表。

当前 `DashboardShell.tsx` 仍有写死的 `summaryRows` 和 `trades`。这些是占位数据，不是账本事实。

---

## Day 1：7月10日，事实盘点与路线重排

今天只做一件事：重新确认项目事实，并锁定 Week 5-13 的 Gate 顺序。

要做：

- 阅读当前状态、总路线、Week 4/5、Week 6-13 checklist 和指定源码。
- 区分已实现、类型/fixture 支撑、占位和未来计划。
- 确认 Week 4 Gate 1 已完成，Gate 2-5 未完成。
- 明确 Week 5-6 先补内存态，Week 7 才进入 IndexedDB。
- 明确 P0、压缩顺序和 Gate 失败分支。
- 同步当前状态、总路线和周计划。

产出：

- 2026-07-10 事实基线。
- 新版 Week 5-13 路线。
- 每周两份 `00-` 入口规范。

完成标准：

- 当天不写源码。
- 不把 Dashboard 占位数据当成已实现功能。
- 不把 `PriceSnapshot` 类型或 fixture 当成价格功能。
- 不把 `services/README.md` 当成 service 已实现。
- 下一项源码任务明确为 `positionService`。

---

## Day 2：7月11日，实现 positionService

今天只做一件事：建立持仓派生 service，不重写 Calculator。

要做：

- 新建 `src/services/positionService.ts`。
- 只读取 `LedgerData.trades` 和 `LedgerData.priceSnapshots`。
- 调用既有 `calculatePositions(...)`。
- 新建 `src/services/positionService.test.ts`。
- 覆盖空账本、无价格快照和有价格快照场景。

产出：

- `positionService`。
- service 单元测试。

完成标准：

- service 不保存 `Position[]`。
- service 不复制成本、盈亏或价格选择公式。
- service 不读写浏览器存储。
- 相关测试、全量测试、lint 和 build 通过后才结束。

---

## Day 3：7月12日，Dashboard 接入真实持仓

今天只做一件事：让资产汇总由 `LedgerData` 派生，而不是读取 `summaryRows`。

要做：

- 将 Dashboard 变为 client component。
- 使用 `useReducer(ledgerReducer, initialLedgerData)` 管理 `LedgerData`。
- 调用 `positionService` 得到临时 `Position[]`。
- 删除写死的 `summaryRows`。
- 渲染真实持仓；没有交易时显示空状态。

产出：

- Dashboard 持仓垂直切片。

完成标准：

- reducer state 只保存 `LedgerData`。
- 不新增 `Position[]` state/action。
- 页面不直接调用 `calculatePositions(...)`。
- 无价格时不制造 0 市值或 0 未实现盈亏。
- 测试、lint、build 通过。

---

## Day 4：7月13日，确定生产资产来源

今天只做一件事：解决 `assets: []` 导致所有交易被 Validator 拒绝的问题。

第一版决定：

- 使用独立的生产内建资产目录，不从 `src/test/fixtures.ts` 导入。
- 第一版只覆盖 golden 验收需要的 BTC、ETH、ADA。
- 资产元数据进入 `LedgerData.assets`，供 `tradeValidator` 使用。
- `ledger/reset` 后恢复内建资产目录，清空用户交易、价格和手续费规则。
- hydrate/import 以已保存账本资产为准；未知或非法资产在导入校验阶段拒绝。
- 本周不做资产管理 UI。

要做：

- 建立生产资产定义和初始化策略。
- 调整初始账本与 reset 测试。
- 验证每次初始化返回独立数组引用。

产出：

- 可供生产 Validator 使用的资产来源。

完成标准：

- 运行时代码不导入测试 fixtures。
- BTC、ETH、ADA 可以通过资产存在校验。
- 未知资产仍被拒绝。
- reset、初始化和现有 reducer 测试通过。

执行结果（2026-07-13）：

- 已新增独立生产资产目录，固定提供 BTC、ETH、ADA。
- 初始账本与 reset 已接入生产资产；每次创建均返回独立数组和独立 Asset 对象。
- Validator 的 golden 草稿已使用生产初始化资产，DOGE 仍返回 `ASSET_NOT_FOUND`。
- 生产代码未导入测试 fixture，也未引入网络、随机 ID、动态时间、新依赖或 schema 变化。
- 7 个测试文件、57 项测试、lint 和 build 全部通过。
- 源码保留在 `zhennn/week5-day4-built-in-assets`，尚未合入 `main`、尚未推送远端。

---

## Day 5：7月14日，实现 tradeService

今天只做一件事：把不可信表单草稿转换为可 dispatch 的正式 `Trade`。

要做：

- 新建 `src/services/tradeService.ts`。
- 输入为 `unknown / TradeDraft` 和当前 `LedgerData`。
- 调用既有 `validateTradeDraft(...)`。
- 传入 `ledgerData.assets` 和 `ledgerData.trades`。
- 校验成功后补齐正式 Trade 的 id、feeCurrency、createdAt、updatedAt。
- 返回结构化成功或错误结果，不直接 dispatch。
- 新建 service 测试。

产出：

- `tradeService`。
- 正式 Trade 生成规则与测试。

完成标准：

- 不重写 Validator。
- 合法买入成功。
- 未知资产、非法十进制和超卖返回错误。
- 失败不修改 `LedgerData`。
- 生成的 Trade 字段完整、ID 不碰撞。

---

## Day 6：7月15日，交易列表改读 LedgerData

今天只做一件事：完成 Gate 3，让交易列表不再显示写死数组。

要做：

- 删除 Dashboard 中写死的 `trades`。
- 交易列表渲染 `ledgerData.trades`。
- 初始为空时显示“暂无交易”。
- 确认 dispatch 一笔测试 Trade 后列表自然更新。
- 记录 Week 5 Gate 结果、验证证据、风险和 Week 6 唯一入口。

产出：

- 真实交易列表。
- Week 5 Gate 记录。

完成标准：

- 页面不存在写死交易数组。
- 交易列表和资产汇总来自同一个 `LedgerData`。
- Gate 2、Gate 3、生产资产来源和 `tradeService` 均通过。
- 未通过项明确顺延，不挪用 Day 7。

---

## Day 7：7月16日，休息

今天不做开发、不补欠账。

允许做：

- 记录突然想到的问题。

不做：

- 不开 IndexedDB。
- 不补 Day 6 未完成代码。
- 不改 Week 6 范围。

---

## 本周产出物

- `positionService` 与测试。
- Dashboard `useReducer + LedgerData` 持仓切片。
- 生产资产来源。
- `tradeService` 与测试。
- 真实交易列表与空状态。
- Week 5 Gate 记录。

## 本周验收标准

- `summaryRows` 和写死 `trades` 已删除。
- `Position[]` 只派生，不保存。
- `positionService` 复用 `calculatePositions(...)`。
- `tradeService` 复用 `validateTradeDraft(...)`。
- 生产代码不导入测试 fixtures。
- 测试、lint、build 通过。

## 本周不可做

- 不做 IndexedDB / localStorage。
- 不做导入导出和加密。
- 不接价格输入。
- 不做资产管理 UI。
- 不做 UI 美化。

## 论文素材点

- React 单一事实源。
- state / service / calculator / validator 的职责边界。
- 为什么先内存态、后持久化。
- 生产 seed 与测试 fixture 的边界。

## 落后时处理

- 未完成项顺延到 Week 6。
- Week 7 IndexedDB 随 Gate 顺延。
- 不合并多个大功能到同一天。
- Day 7 保持休息。
