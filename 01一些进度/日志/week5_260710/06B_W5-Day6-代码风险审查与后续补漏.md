# Week 5 Day 6：代码风险审查与后续补漏

日期：2026-07-16

状态：Week 5 结束后的正式风险登记册

目标：固定 Gate 3 通过后仍未关闭的两项 P1 与两项 P2，供 Week 6 交互闭环、Week 7-8 存储与导入、后续性能阶段直接查询。

---

## 结论

Gate 3 已通过，不需要撤销 `c5383a9`。当前交易列表已经读取真实 `ledgerData.trades`，但四项后续风险不能因测试全绿而消失：

| 编号 | 等级 | 风险 | 当前结论 | 关闭阶段 |
| --- | --- | --- | --- | --- |
| P1-01 | P1 | 非空 Dashboard 接线缺少真实交互回归 | Gate 3 接受组合证据，不等于风险已关闭 | Week 6 Gate 4 |
| P1-02 | P1 | hydrate/import 运行时校验边界未实现 | 当前内存态可信，外部数据进入前必须阻断 | Week 7-8 |
| P2-01 | P2 | 交易显示顺序与格式规则未定义 | 当前按保存顺序原样展示 | Week 6 后续决策 |
| P2-02 | P2 | 长列表性能策略与通过线未定义 | 当前一次渲染全部交易 | 性能 pilot 与发布门 |

本文件只登记风险和通过线，不授权提前进入 IndexedDB、导入导出、排序、分页或 UI 美化。

---

## P1-01：非空 Dashboard 接线自动化回归盲区

### 当前事实

- `TradeTable` 隔离测试已覆盖空状态、六列字段、`buy / sell` 映射、顺序和不可变性。
- Reducer 契约测试证明 `trade/add` 输出的数组可以交给 `TradeTable` 渲染。
- Dashboard 初始静态测试只证明空账本稳定。
- `<TradeTable trades={ledgerData.trades} />` 当前由 TypeScript、精确 diff、静态扫描和逐行审查证明。

### 风险触发

后续重构若把调用错误改成 `<TradeTable trades={[]} />`、引入第二份交易 state，或只更新列表而没有更新持仓，现有 Gate 3 自动化可能仍然全绿。

### 影响

- 页面看似正常，真实新增交易却不显示。
- 列表与资产汇总可能读取不同状态来源。
- 测试报告可能把纯组件契约误写成真实页面闭环。

### 关闭规则

Week 6 Gate 4 必须建立真实交互回归：

1. 用户填写合法表单并提交。
2. `createValidatedTrade(...)` 成功返回正式 `Trade`。
3. 页面只在成功后 dispatch `trade/add`。
4. 同一次状态变化同时驱动交易列表和资产汇总更新。
5. 校验失败与 Service 失败不得污染 `LedgerData`。

禁止通过 `initialTrades`、`testMode`、隐藏按钮、mock `useReducer` 或测试专用路由制造绿灯。

### 通过线

- 真实用户操作触发至少一笔合法交易进入列表。
- 同一操作使对应持仓同步变化。
- 非法和超卖输入不新增行、不改变持仓。
- 测试名称明确是页面交互回归，不再用静态契约代替 dispatch 证据。

---

## P1-02：未来导入数据的运行时信任边界

### 当前事实

`TradeTable` 接收 TypeScript `Trade`，当前内存交易由 Validator、Service 和 reducer 链路产生。TypeScript 只约束编译期，不能证明 IndexedDB、旧版本数据或 JSON 导入在运行时合法。

### 风险触发

以下任一入口开始读取外部或历史数据时触发本风险：

- Week 7 IndexedDB hydration。
- Week 8 JSON import。
- schema 升级或旧数据迁移。

### 影响

- 非法 `type` 可能被二元展示映射误标为“卖出”。
- 重复 Trade ID 会造成 React key 冲突和删除语义不确定。
- 非法十进制、币种、资产引用或时间字段会污染计算链路。
- 异常长字符串或异常大数组会造成浏览器资源耗尽。
- 部分写入或逐条替换可能让原账本处于半成功状态。

### 关闭规则

任何 hydrate/import 数据进入 reducer 前，必须校验完整账本而不是只校验单笔 Trade：

1. 校验 `schemaVersion` 与顶层 `LedgerData` 结构。
2. 校验 Asset、Trade、PriceSnapshot、FeeRule 全字段和引用关系。
3. 校验 Trade ID 唯一性、类型、十进制、币种、时间和完整持仓时间线。
4. 定义字符串长度、数组规模和导入文件大小上限。
5. 全量成功后原子替换 state；任一错误保留原账本。

展示层不得复制 Validator，也不得把 `as LedgerData` 当成运行时校验。

### 通过线

- 合法完整账本可恢复且重新计算结果一致。
- schema 不匹配、重复 ID、非法类型、坏十进制和超大输入均被拒绝。
- 失败时旧账本字节级或结构级保持不变。
- hydration 完成前禁止持久化回写，避免空初始账本覆盖旧数据。

---

## P2-01：交易显示顺序与格式语义未定义

### 当前事实

`TradeTable` 直接按 `LedgerData.trades` 保存顺序渲染，日期、数量、价格和金额均原样展示。回填的历史交易会追加到数组末尾，即使其 `occurredAt` 更早。

### 风险

- 用户可能把“保存顺序”误解为“发生时间顺序”。
- 同一时间的交易若排序规则不稳定，会改变阅读结果和未来删除定位。
- 过早使用字符串排序或原地 `sort` 可能破坏 state 与 Validator 的稳定顺序语义。
- 把 DecimalString 转成 Number 格式化可能引入精度损失。

### 后续决策

在实现排序前必须先回答：

- 默认按保存顺序还是发生时间顺序展示。
- 升序还是降序。
- 同一 `occurredAt` 使用保存顺序、`createdAt` 还是其他稳定 tie-breaker。
- 日期精度和币种 / DecimalString 的展示格式由哪个纯展示函数负责。

### 通过线

- 决策文档明确默认顺序和同时间规则。
- 排序使用复制后的派生数组，不修改 `LedgerData.trades`。
- 回填交易、同时间交易和连续渲染有固定测试。
- 数量和金额格式化不经过 JavaScript 浮点重算。

---

## P2-02：长列表性能策略与通过线未定义

### 当前事实

当前 `TradeTable` 一次渲染全部交易，没有分页、虚拟列表、筛选或性能阈值。Week 5 数据量很小，因此这不阻塞 Gate 3。

### 风险

- 交易增长后初次渲染和每次 dispatch 都可能产生明显卡顿。
- 大量 DOM 行会增加内存占用和浏览器布局成本。
- 没有固定数据生成器和生产 build 测量时，主观“感觉流畅”不能作为通过线。
- 过早引入虚拟列表又会扩大依赖和交互复杂度。

### 后续决策

先定义真实使用规模和测量协议，再选择分页或虚拟化：

1. 使用固定 seed 生成 1k / 10k 等可复现账本。
2. 在生产 build 下分别测量初始列表渲染和新增交易后的更新成本。
3. 记录浏览器、设备、数据量和测量方法。
4. 根据数据决定普通分页、分段加载或虚拟列表，不凭预感加依赖。

### 通过线

- 固定命令或 harness 可复现同一数据集和指标。
- 性能预算、支持的数据上限和超限行为有明确数字。
- 采用优化后，字段映射、顺序、键和可访问性回归仍通过。
- release candidate 修改行为代码后必须重新跑最终 benchmark。

---

## 后续开发映射

| 后续阶段 | 必须读取本文件的内容 | 不得跳过的结果 |
| --- | --- | --- |
| Week 6 Gate 4 | P1-01 | 真实表单、Service、dispatch、列表与持仓共同更新 |
| Week 6 交易体验决策 | P2-01 | 顺序、同时间规则和格式策略 |
| Week 7 IndexedDB | P1-02 | hydration 校验、写入保护和失败保留旧数据 |
| Week 8 导入导出 | P1-02 | 完整账本校验、大小限制和原子替换 |
| benchmark / release gate | P2-02 | 固定数据、生产测量、预算和重跑规则 |

---

## 查询入口

相关源码：

```text
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/DashboardShell.test.ts
src/state/ledgerReducer.ts
src/services/tradeService.ts
src/validators/tradeValidator.ts
src/models/types.ts
```

相关文档：

```text
01一些进度/日志/week5_260710/06A_W5-Day6-真实交易列表前置审查与开发计划.md
01一些进度/日志/week5_260710/99_Week5日志_260710.md
01一些进度/日志/00-当前开发状态.md
01一些进度/日志/00-W2-W12总路线图与执行说明.md
```

检索关键词：`Gate 3`、`TradeTable`、`非空 Dashboard`、`hydrate/import`、`Trade ID 唯一性`、`保存顺序`、`长列表性能`。

---

## 自检表

| 问题 | 通过标准 |
| --- | --- |
| 是否把 Gate 3 写成完整页面闭环 | 否；明确 Gate 4-5 未完成 |
| 是否给每项风险指定关闭阶段 | 是 |
| 是否有可测试通过线 | 每项均有命令、状态或行为结果 |
| 是否允许展示层复制校验 | 否 |
| 是否允许原地排序交易 state | 否 |
| 是否提前决定分页或虚拟化 | 否；先测量再选型 |
| 是否能被后续 AI 快速查询 | 有文件、阶段和关键词入口 |
