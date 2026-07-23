# Week 8 每日执行清单

时间：2026-07-31 至 2026-08-06

主题：备份导得出、导得回（完整账本原子恢复）

> Week 8 只做明文 JSON 全量备份。导入不是“逐条交易写进去”，而是先验证完整版本化账本，再一次性替换；任何失败都保留原账本。

> 入口更新（2026-07-23）：Week 8 源码、自动化与 production 实际文件 Gate 已通过。用户确认验收期间曾删除仅有的两条交易；受控复验确认恢复数据存在且刷新后仍完整，先前空页面观察已排除。Week 8 为 Go。

本周结论：

```text
backup envelope
-> 导出
-> 纯解析与完整校验
-> 原子替换
-> 导入 UI
-> round-trip / rollback Gate
```

---

## 进入 Week 8 前必须通过

- [x] Week 7 hydration 防覆盖通过。
- [x] whole-blob adapter / repository round-trip 通过。
- [x] 快速连续写顺序正确。
- [x] 写失败保留上一次成功数据，并可安全重试最新账本。
- [x] dirty 账本离开与 Repository 切换边界通过。
- [x] 新增、删除、价格和 clear 刷新验收通过。
- [x] test / lint / build / diff-check 通过。
- [x] S-07 文件、数组和字符串资源阈值已确认并落地 ResourcePolicy。
- [x] G-01：production DevTools 直接读取 `ledger:v1`，核对 `formatVersion = 1`、完整明文 `LedgerData`、无 `Position[]`。
- [x] G-02：production clear 后直接确认 `ledger:v1` 不存在，刷新不重建，首次新写入后才重现。

任一失败：Day 1 自动改为补 Week 7 欠账，不开始备份功能。

---

## Day 1：7月31日，定义 backup envelope 与完整校验规则

今天只做一件事：锁定可导出、可验证、可升级的备份格式。

要做：

- 定义 envelope 版本、导出时间、应用/schema 版本和 `LedgerData` payload。
- 使用稳定字段顺序或规范化序列化规则。
- 定义完整运行时校验：
  - `schemaVersion`。
  - `assets`。
  - `trades`。
  - `priceSnapshots`。
  - `feeRules`。
  - 必填字段、DecimalString、ID 唯一性和引用关系。
- 明确 `tradeValidator` 只能辅助业务校验，不能单独证明完整账本合法。
- 明确未知 envelope/schema 版本直接拒绝。
- 明确导入是全量覆盖，不做合并。

产出：

- 版本化 backup envelope 契约。
- 完整校验清单。

完成标准：

- 可以判断一个 unknown JSON 是否是可安全导入的完整账本。
- 校验函数是纯函数，不读写 repository。
- 未知版本和结构错误有稳定错误码。

---

## Day 2：8月1日，完成导出垂直切片

今天只做一件事：把点击瞬间的当前页面完整账本导出为明文 JSON 文件。

要做：

- 点击时立即对页面当前 `ledgerData` 运行 `validateLedgerData(...)`。
- 只使用验证成功结果中重建的 `value` 作为 immutable export snapshot；不从 Repository 二次读取覆盖。
- hydration 未 ready 或 clearing 时禁止导出。
- persistence pending / error 时允许救援导出，但 UI 必须明确提示“该备份可能新于最后成功保存版本”。
- 包装成 Day 1 envelope。
- 使用规范化序列化生成 JSON。
- 用 Blob 触发下载。
- 文件名包含可读日期和 envelope 版本。
- 导出前显示“备份文件为明文”的明确警告。
- 新建纯序列化测试和最小 UI 测试。

产出：

- 导出逻辑和“导出备份”按钮。

完成标准：

- 导出包含 assets、trades、priceSnapshots、feeRules 和 schemaVersion。
- 导出不修改当前账本。
- JSON 可再次被 Day 1 validator 读取。
- 点击后页面继续变化不得改变已冻结的导出 snapshot。
- Repository 比页面 state 旧时，导出仍以点击瞬间页面快照为准。

---

## Day 3：8月2日，实现纯解析与完整校验

今天只做一件事：把 unknown 文件解析为“可导入候选”，但不写数据。

要做：

- 读取并解析 JSON。
- 校验 envelope 版本和 payload。
- 校验每组数组、字段、ID 和引用关系。
- 校验 DecimalString 和时间字段。
- 复用既有 Validator 可以证明的交易业务规则。
- 收集结构化错误，不 throw 普通校验失败。
- 新建合法、坏 JSON、缺字段、重复 ID、未知资产、未知版本测试。

产出：

- 纯 import parser / validator。

完成标准：

- 解析函数没有 repository、IndexedDB 或 React 依赖。
- 任一错误时不产生“部分合法”写入对象。
- 错误可供 UI 展示。

---

## Day 4：8月3日，实现原子替换

今天只做一件事：把完整合法候选一次性替换为当前账本。

要做：

- repository 增加整账 replace/import 能力。
- 写入新账本成功后，React state 才整账替换。
- 写入失败时保留旧 IndexedDB 数据和旧页面 state。
- replace 期间暂停普通自动保存，避免竞态。
- 记录导入前确认与导入后结果。
- 新建成功、写失败和状态同步测试。

产出：

- 原子导入业务动作。

完成标准：

- 不出现先清空再逐条写。
- 不出现只写了一部分的新账本。
- 失败时原账本逐字段不变。

---

## Day 5：8月4日，接通导入 UI

今天只做一件事：完成文件选择、确认、校验、替换和错误展示。

要做：

- 接文件选择入口。
- 导入前明确提示“将覆盖当前账本”。
- 展示 parser / validator 的结构化错误。
- 用户确认后才执行原子替换。
- 成功后重新显示真实交易、价格和持仓。
- 取消、校验失败或写失败时不改变页面。

产出：

- 导入备份 UI 闭环。

完成标准：

- 页面不自己解析或逐条保存。
- 用户能区分取消、文件错误和存储错误。
- 成功后刷新仍是导入账本。

---

## Day 6：8月5日，round-trip 与 rollback 验收

今天只做一件事：证明备份可以完整恢复且失败不会破坏数据。

要做：

- 准备含资产、5 条交易、价格快照和手续费规则的完整账本。
- 导出 -> 清空 -> 导入 -> 刷新。
- 核对所有字段深度一致。
- 再次导出，按规范化序列化规则核对字节一致。
- 手改 JSON、schemaVersion、ID 和引用，确认被拒绝。
- 模拟 repository write 失败，确认原账本不变。
- 运行 test / lint / build。
- 记录 Week 8 Gate 和 Week 9 Go / No-Go。

产出：

- 往返一致与失败回滚证据。

完成标准：

- 合法备份恢复完整。
- 非法备份零写入。
- 写失败不破坏原账本。
- 红灯时 Week 9 不切换加密。

---

## Day 7：8月6日，休息

今天不做开发、不补欠账。

不做：

- 不开始真加密。
- 不挪用休息日。

---

## 本周产出物

- 版本化 backup envelope。
- 完整账本 parser / validator。
- 明文 JSON 导出。
- 原子替换业务动作。
- 导入 UI。
- round-trip / rollback Gate 记录。

## 本周验收标准

- 完整 `LedgerData` 被验证，不只验证 trades。
- 导入成功后逐字段一致。
- 规范化后二次导出字节一致。
- 坏文件、未知版本和写失败均零写入。
- 导入后刷新数据仍在。
- test / lint / build 通过。

## Week 9 进入条件

- [x] backup envelope 与版本规则通过
- [x] 完整 parser / validator 通过
- [x] 原子替换通过
- [x] round-trip 与 rollback 自动化通过
- [x] test / lint / build 通过
- [x] P1-01 production 主链、刷新持久化与自动化 recovery / rejection 证据闭环；空页面观察已排除

任一未通过：Week 9 禁止切换真加密。

## 本周不可做

- 不做 CSV。
- 不做增量/合并导入。
- 不做加密备份格式。
- 不做云备份。
- 不把解析和存储细节写进页面。
- 不做 UI 美化。

## 论文素材点

- 数据所有权与可携带备份。
- 明文备份的安全取舍。
- 版本化 schema 与完整运行时校验。
- 原子替换和失败回滚。

## 落后时处理

- 死守完整校验、原子替换和失败回滚。
- UI 只保留最小文件选择、确认和错误展示。
- 不做合并导入。
- Week 8 Gate 已关闭；Week 9 从包含本周成果的源码基线启动。
- Day 7 保持休息。
