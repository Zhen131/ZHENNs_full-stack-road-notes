# Week 5 Checklist

时间：2026-07-10 至 2026-07-16

主题：补完 React 内存态 I

详细执行：[[00-Week5每日执行清单]]

> 原 IndexedDB 计划已于 2026-07-10 停止；原因是 Week 4 Gate 2-5 未通过。Week 5 只补内存态。

---

## 总览

| 日期    | 唯一主任务                            | 状态  |
| ----- | -------------------------------- | --- |
| 7月10日 | Day 1：事实盘点与路线重排，不写源码             | 已完成 |
| 7月11日 | Day 2：实现 `positionService`       | 已完成 |
| 7月12日 | Day 3：Dashboard 接入真实持仓           | 已完成 |
| 7月13日 | Day 4：确定生产资产来源                   | 已完成 |
| 7月14日 | Day 5：实现 `tradeService`          | 已完成 |
| 7月15日 | Day 6：交易列表改读 `LedgerData.trades` | 已完成 |
| 7月16日 | Day 7：复盘、07A 补漏复审与文档同步          | 已完成 |

---

## Day 1：事实盘点与路线重排

- [x] 读取指定状态、路线、Week 4/5、Week 6-13 和源码关键文件
- [x] 确认 Gate 1 已完成、Gate 2-5 未完成
- [x] 确认 Dashboard 仍为硬编码页面
- [x] 确认 Calculator / Validator 必须复用
- [x] 重排 Week 5-13
- [x] 当天不写源码

## Day 2：positionService

- [x] 新建 `positionService.ts`
- [x] 只调用 `calculatePositions(...)`
- [x] 新建 service 测试
- [x] 不保存 `Position[]`

> Day 2 完成 service 地基；Day 3 已接通 Dashboard 真实持仓，Gate 2 现已通过。

## Day 3：Dashboard 真实持仓

- [x] 接入 `useReducer + LedgerData`
- [x] 删除 `summaryRows`
- [x] 渲染 `positionService` 派生结果
- [x] 空账本显示空状态

## Day 4：生产资产来源

- [x] 建立独立生产资产目录
- [x] BTC、ETH、ADA 进入初始 `LedgerData.assets`
- [x] reset 恢复内建资产目录
- [x] 生产代码不导入 test fixtures

> Day 4 已于 2026-07-13 完成复审：7 个测试文件、57 项测试通过，lint 和 build 通过；源码已合入并推送 `main`，功能分支已删除，本地与远端同步。

## Day 5：tradeService

- [x] 调用 `validateTradeDraft(...)`
- [x] 传入当前 assets 和 priorTrades
- [x] 生成字段完整的正式 Trade
- [x] 完整时间线超卖与同资产混合币种被 Validator 拒绝
- [x] 校验失败与 Service 运行失败分层返回
- [x] ID 最多尝试 3 次，唯一 ID 生成后只读取一次时间
- [x] 合法、非法、超卖、依赖失败和不可变性测试通过

> Day 5 已于 2026-07-14 完成实现与独立复审：8 个测试文件、85 项测试通过，lint 和生产 build 通过；源码通过合并提交 `7ed6ca5` 进入并推送 `main`，功能分支已删除，本地与远端同步。`tradeService` 只返回正式 `Trade`，尚未接入 UI dispatch。

## Day 6：真实交易列表

- [x] 删除写死 `trades`
- [x] 渲染 `ledgerData.trades`
- [x] 增加六列交易空状态
- [x] 隔离验证正式 Trade 六列字段、类型映射、顺序和不可变性
- [x] 记录自动化、显式接线审查与浏览器证据边界
- [x] 记录 Week 5 Gate 与后续补漏项

> Day 6 已于 2026-07-15 完成实现，并于 2026-07-16 复审：Dashboard 定向测试 7 项、全量 90 项测试、lint、生产 build、diff-check、静态边界扫描和浏览器初始空状态冒烟通过。Gate 3 已关闭；真实表单 dispatch 仍属于 Gate 4。

## Day 7：复盘与补漏

> 原计划为休息日；用户于 2026-07-16 明确调整为前五周复盘、07A 风险补漏和代码复审。

- [x] 复核 07A 六项风险的真实性与关闭证据
- [x] 补强严格日期校验、资产表单同步和 hydration 时序
- [x] 增加安全删除与 IndexedDB 重挂载交互测试
- [x] 生成 07B 解决报告并同步日志、状态、路线和 README

---

## Week 5 通过线

- [x] Gate 2 通过
- [x] Gate 3 通过
- [x] 生产资产来源通过
- [x] `tradeService` 通过
- [x] Dashboard 不再读取硬编码资产和交易
- [x] 当前源码测试、lint、build 通过

> Week 5 原通过线已满足。Gate 4 和 Gate 5 的功能部分已在 07A 分支提前实现；
> 5 条 golden 人工验收、交易显示顺序和大列表性能仍进入后续补漏。

## 原计划边界的调整结果

- IndexedDB、价格输入和 Week 6/7 部分任务因 07A 补漏被明确提前到功能分支实施。
- 未做 JSON 导入导出、真加密、图表和 UI 美化。
- 提前实施不等于源码 `main` 已发布；合并与推送仍需单独决定。
