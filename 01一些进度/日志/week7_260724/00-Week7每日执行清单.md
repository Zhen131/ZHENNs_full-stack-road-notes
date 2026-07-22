# Week 7 每日执行清单

时间：2026-07-24 至 2026-07-30

主题：数据存得住（IndexedDB whole-blob 持久化）

> Week 7 只解决保存与恢复。先防止 hydration 覆盖旧数据，再谈刷新后仍在；本周真加密仍使用 Noop 实现。

> 状态校正（2026-07-16）：07A 补漏已在独立功能分支提前完成 Adapter、
> Repository、Noop、组装点、安全 hydration 和串行保存。自动化重挂载已证明
> 交易与价格可恢复；真实浏览器刷新、clear 和 DevTools envelope 检查仍保留。

> 前置 Gate 更新（2026-07-17）：Week 6 已完成 golden、价格、超卖、删除和
> 宽窄屏生产验收，React Gate 为 Go。Week 7 从浏览器持久化人工验收开始。

> 执行结果（2026-07-18）：源码、故障注入和固定 production 主链已完成；
> production DevTools envelope / clear record 没有取得直接读取证据，
> Week 7 Storage Gate 为 No-Go，禁止进入 Week 8。

> 补漏更新（2026-07-21）：S-01 / S-02 / S-03 已合入源码 `main`，S-07 ResourcePolicy
> 已在候选分支完成；当前为 20 个测试文件、195 项测试。D-08 / D-09 文档入口已同步，
> G-01 / G-02 直接证据仍未关闭。

> 最终验收（2026-07-22）：真实 Chrome production origin 已直接读取写入后的 `ledger:v1`，并在
> 页面 clear 后直接确认 record 不存在。Storage Gate 为 **Go**；详细证据见
> [[09A_W7-Storage-Gate最终验收报告_260722]]。前述 No-Go 仅保留为当日历史状态。

本周结论：

```text
先定 load / replace / write 契约
-> IndexedDB adapter
-> repository
-> Noop + 组装点
-> hydrate
-> guarded write 与刷新验收
```

---

## 进入 Week 7 前必须通过

- Week 6 Gate 2-5 全绿。
- 新增、删除、价格和持仓联动正确。
- 5 条 golden、BTC 价格和超卖验收通过。
- test / lint / build 通过。

任一前置条件失败：Day 1 自动改为补 React 内存态欠账，禁止创建 IndexedDB 实现。

---

## Day 1：7月24日，锁定持久化与 hydration 契约

今天只做一件事：先定义怎样安全地把整份账本读入和写出。

要做：

- 定义 StorageAdapter 最小接口：read / write / clear。
- 定义 EncryptionService 最小接口，Week 7 使用 Noop，Week 9 替换为 WebCrypto。
- 定义 repository 的整账读取、保存和清空职责。
- 定义整账 load/replace 能力；具体 action 名以实现为准，不把计划名当成既有源码。
- 定义 hydration 状态：loading / ready / error。
- 锁定规则：hydration 完成前禁止写入。
- 锁定规则：连续写必须串行或明确最后写入顺序。
- 锁定规则：写失败保留旧数据，并把错误暴露给应用。
- 定义 `schemaVersion` 检查和空库行为。

产出：

- 持久化接口契约与数据安全通过线。

完成标准：

- 页面、service、reducer 都不知道 IndexedDB API。
- `Position[]` 不进入存储。
- 初始空 state 不可能抢先覆盖已有数据。
- Week 9 替换加密实现时无需修改上层接口。

---

## Day 2：7月25日，实现 IndexedDB StorageAdapter

今天只做一件事：实现 whole-blob 的 read / write / clear。

要做：

- 选择并记录数据库名、object store、固定 key 和版本。
- 使用轻量 `idb` 封装或原生 API 的单一实现，不混用。
- read：空库返回明确的“无数据”，不伪装成已保存空账本。
- write：一次事务写入完整、可序列化的账本 envelope。
- clear：清除当前账本记录。
- 使用适合 IndexedDB 的测试环境覆盖 round-trip、空库、升级和失败。

产出：

- `indexedDbStorageAdapter`。
- adapter 测试。

完成标准：

- 写入后读取深度一致。
- 失败不会删除原记录。
- adapter 不包含账本业务规则。
- 测试通过。

---

## Day 3：7月26日，实现 ledgerRepository

今天只做一件事：建立账本读写的业务入口。

要做：

- repository 依赖 StorageAdapter 和 EncryptionService 接口。
- 实现 load、save、clear 的最小整账能力。
- 保存前检查 `schemaVersion`。
- 加密层在 repository 与 adapter 之间的单一位置调用。
- 统一存储错误，不泄露 IndexedDB 细节到 UI。
- 新建 repository 测试。

产出：

- `ledgerRepository`。
- repository 测试。

完成标准：

- 上层只依赖 repository。
- repository 不计算持仓、不校验表单。
- StorageAdapter 只处理外部存储细节。
- Noop 下 round-trip 一致。

---

## Day 4：7月27日，实现 Noop 加密与组装点

今天只做一件事：在唯一组装点拼好 Noop + IndexedDB + repository。

要做：

- 实现符合 EncryptionService 契约的 Noop。
- 建立应用组装点，集中创建 adapter、encryption、repository。
- 上层不得自行 new IndexedDB adapter。
- 增加组装边界测试或最小集成测试。

产出：

- `noopEncryptionService`。
- 唯一应用组装点。

完成标准：

- Week 9 只替换加密实现和解锁依赖，不修改页面/service/calculator。
- 全项目只有组装点知道具体存储和加密实现。

---

## Day 5：7月28日，页面启动时安全 hydrate

今天只做一件事：让页面先读 repository，再进入 ready 状态。

要做：

- 页面 mount 后执行一次 load。
- 加载期间显示明确 loading 状态。
- 有保存数据时整账 replace/hydrate。
- 空库时使用当前初始账本。
- load 失败时显示错误，不清空旧存储。
- ready 之前关闭自动保存。
- 覆盖“已有数据、空库、读取失败”三种测试。

产出：

- 只读 hydration 闭环。

完成标准：

- 已有数据不会被初始空 state 覆盖。
- 读取失败不会触发 write。
- UI 只有 ready 后才允许编辑账本。

---

## Day 6：7月29日，guarded write 与持久化验收

今天只做一件事：让 ready 后的账本变化可靠写回并通过刷新验收。

要做：

- 只在 hydration ready 后监听和保存变化。
- 保证快速连续新增、删除、价格更新的写入顺序。
- 覆盖 write 失败和恢复。
- 验收新增 -> 刷新、删除 -> 刷新、价格 -> 刷新、clear -> 刷新。
- 用 DevTools 确认 IndexedDB 中存在一份 whole-blob 明文 envelope。
- 运行 test / lint / build。
- 记录 Gate 结果和 Week 8 Go / No-Go。

产出：

- 持久化闭环。
- Week 7 Gate 记录。

完成标准：

- 刷新恢复完整 `LedgerData`。
- 快速连续写后读取的是最终状态。
- 失败不覆盖上一次成功数据。
- 页面、service、reducer 没有 IndexedDB 调用。
- 红灯时 Week 8 不开始导入导出。

实际结果：新增、价格、删除、clear、刷新、首次新写入再恢复均通过；2026-07-22 已直接
读取 DevTools envelope，并确认 clear 后 record 不存在，因此 Week 7 Gate 为 Go。

---

## Day 7：7月30日，休息

今天不做开发、不补欠账。

不做：

- 不开始导入导出。
- 不切真加密。
- 不挪用休息日。

---

## 本周产出物

- 持久化与 hydration 契约。
- IndexedDB StorageAdapter 与测试。
- ledgerRepository 与测试。
- Noop EncryptionService。
- 唯一组装点。
- 页面 hydrate 与 guarded write。
- Week 7 Gate 记录。

## 本周验收标准

- hydration 前绝不写入。
- 空 state 不覆盖旧数据。
- 连续写顺序稳定。
- 写失败保留上次成功数据。
- 刷新、删除、价格和 clear 行为正确。
- 上层不直接依赖 IndexedDB。
- test / lint / build 通过。

## Week 8 进入条件

- [x] adapter round-trip 通过
- [x] repository round-trip 通过
- [x] hydration 防覆盖通过
- [x] 快速连续写通过
- [x] 写失败保留旧数据
- [x] 刷新与 clear 手动验收通过
- [x] test / lint / build 通过
- [x] S-01 / S-02 / S-03 可靠性补漏通过
- [x] D-08 / D-09 入口与导出真相契约已同步
- [x] S-07 资源阈值确认与 ResourcePolicy 实现
- [x] production DevTools envelope / clear record 直接读取通过

2026-07-22 复核：持久化主链、B 批次补漏、S-07 与 D-08 / D-09 文档契约均已通过；
production G-01 / G-02 已关闭。Week 8 已具备开始条件，但尚未开工；详细证据见
[[09A_W7-Storage-Gate最终验收报告_260722]]。

## 本周不可做

- 不使用 localStorage。
- 不做导入导出。
- 不做真加密。
- 不做 per-entity / 多表拆分。
- 不保存 `Position[]`。
- 不做 UI 美化。

## 论文素材点

- typed repository over IndexedDB。
- whole-blob 第一版及未来分片限制。
- hydration 数据覆盖风险与防护。
- 依赖倒置和唯一组装点。

## 落后时处理

- 先保 whole-blob、最小 repository 和数据安全。
- 不为赶进度改用 localStorage。
- Week 8 整体顺延。
- Day 7 保持休息。
