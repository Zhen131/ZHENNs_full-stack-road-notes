# Week 1–7 查缺补漏问题报告

日期：2026-07-18

状态：待检阅

范围：Week 1 至 Week 7 已有文档、当前状态、总路线、现行总架构图、源码 README，以及与问题直接相关的当前源码。

边界：本文件只记录问题、事实证据和影响，不记录解决方案，不修改源码，不开始 Week 8。

## 结论

Week 7 Storage Gate 当前仍是 **No-Go**。正式 Gate 有 2 项 production 直接证据缺失；除此之外，当前源码、产品行为、跨周文档和 Git 交接状态仍存在 31 项未关闭问题，共计 33 项。

这些问题分为五类：

| 类别 | 数量 | 当前性质 |
| --- | ---: | --- |
| Week 8 正式阻断 | 2 | 任一项未通过，Week 8 禁止开始 |
| 数据安全、持久化与工程风险 | 10 | 不全是 Week 7 Gate 条目，但会影响真实数据可靠性或后续导入安全 |
| 第一版产品与业务口径缺口 | 10 | Week 1–7 结束后仍可从生产页面或源码直接观察 |
| 文档与认知问题 | 9 | 会让后续 AI 读取到相互冲突的事实或错误的 Week 8 入口条件 |
| Git 交接问题 | 2 | 会让后续任务从缺少 Week 7 成果的分支或远端基线继续开发 |

## 一、Week 8 正式阻断

### G-01 production envelope 没有直接读取证据

production 浏览器中没有直接读取 `database = local-first-trading-ledger`、`store = ledger`、`key = ledger:v1` 对应 record，因此没有直接确认：

- `formatVersion === 1`。
- `encryptedPayload` 在 Noop 阶段是可读的完整 `LedgerData` JSON。
- payload 中的 BTC 交易和价格与页面一致。
- payload 不包含 `Position[]`。

当前证据只有源码契约、fake IndexedDB 自动化和刷新行为，均不等于 01A 要求的 production DevTools 直接证据。

证据：`week7_260724/01B_W7-持久化Gate验收记录.md` 第 4、7 节；源码 README“未通过项”。

### G-02 clear 后 production record 不存在没有直接读取证据

clear 后页面为空、刷新仍为空、首次新写入可以恢复，fake IndexedDB 中也有 `load() === null` 证据；但 production 浏览器中没有直接观察 `ledger:v1` key 已消失，也没有直接观察刷新后 record 没有被初始账本自动重建。

证据：`week7_260724/01B_W7-持久化Gate验收记录.md` 第 3、4、7 节。

## 二、数据安全、持久化与工程风险

### S-01 页面过早显示“已保存”

`TradeForm` 和 `PriceForm` 在调用 `onTradeCreated(...)` / `onPriceSnapshotCreated(...)` 后立即显示“交易已保存”或“价格已保存”。此时只完成了 reducer dispatch，`usePersistentLedger` 的 IndexedDB 自动保存仍是随后触发的异步操作。

因此页面成功文案表达的是“进入内存 state”，不是“已经持久化成功”。后续 save 仍可能失败。

证据：`src/components/trades/TradeForm.tsx`、`src/components/prices/PriceForm.tsx`、`src/hooks/usePersistentLedger.ts`。

### S-02 save 失败后没有独立重试行为

save 失败时页面 state 保留并显示错误，但相同 snapshot 不会自行重新触发 effect。当前测试通过再新增一笔交易触发下一次整账保存来证明“后续写可继续”；如果用户不再修改账本，失败的最新 state 不会再次保存，刷新后回到上一次成功版本。

证据：`src/hooks/usePersistentLedger.ts`；`usePersistentLedger.test.tsx` 中“keeps page state and exposes an error when a save fails”。

### S-03 pending save 没有用户可见状态，也没有关闭页面边界

当前 Hook 只暴露 `persistenceError` 和 clear operation，不暴露普通 save 的 pending / succeeded 状态。源码中没有 `beforeunload`、`pagehide` 或等价生命周期边界；测试也没有覆盖用户在排队写尚未完成时关闭或刷新页面。

影响是用户无法区分“只在内存中”“正在排队写”“已经写入 IndexedDB”三种状态。

证据：`src/hooks/usePersistentLedger.ts` 对外类型和生命周期逻辑。

### S-04 多标签页可在 clear 后重新写回旧 state

Week 7 只保证单标签页。相同 origin 的另一个旧标签页仍可能在 clear 后执行自动保存，把已删除的数据重新写回。

证据：Week 7 01A 第 8.3 节、01B 第 6 节、源码 README“核心原则”。

### S-05 IndexedDB 当前仍是明文

`NoopEncryptionService` 不提供保密性，`encryptedPayload` 实际是可读的 `LedgerData` JSON。交易、价格、备注和其他账本字段对能读取浏览器 profile / origin 数据的人或程序可见。

证据：`src/encryption/noopEncryptionService.ts`、Week 7 01B 第 4、6 节、源码 README。

### S-06 当前删除交易没有确认、撤销或备份保护

交易行的“删除”按钮单击后立即执行安全时间线校验并 dispatch。安全校验只判断删除后账本是否仍合法，不判断用户是否误触；当前也没有撤销，Week 8 备份尚未实现。

证据：`DashboardShell.tsx` 的 `TradeTable` 与 `handleDeleteTrade(...)`；Week 7 clear 警告中的“Week 8 备份尚未实现”。

### S-07 完整账本 Validator 没有资源上限

当前 `validateLedgerData(...)` 校验 schema、实体字段、Decimal、日期、ID、引用和交易时间线，但没有字符串最大长度、assets / trades / priceSnapshots / feeRules 数组规模上限，也没有导入文件大小上限。

证据：`src/validators/ledgerDataValidator.ts`；`00-当前开发状态.md`“阻塞与风险”；源码 README“尚未关闭”。

### S-08 大账本路径没有性能通过线

当前数据路径同时具有以下特征：

- 每次状态变化会 `JSON.stringify` 完整 `LedgerData`。
- 保存前后会校验完整账本。
- IndexedDB 使用 whole-blob 整账写入。
- 持仓从完整交易数组重算。
- 交易列表一次渲染全部记录。

当前没有支持的数据上限、耗时预算、分页、虚拟列表或超限行为。Week 8 若面对大备份文件，现有文档没有可引用的生产性能边界。

证据：`usePersistentLedger.ts`、`ledgerRepository.ts`、`indexedDbStorageAdapter.ts`、`TradeTable`；Week 5 `06B` P2-02；源码 README。

### S-09 没有语义重复交易检测

当前只保证实体 ID 唯一，不存在 fingerprint / duplicateDetector。相同交易内容使用不同 ID 时可以重复进入账本；交易表单也没有 submitting 锁，快速重复提交没有语义去重边界。

Week 3 与现行总架构图都画出了 duplicateDetector，但当前 `src/` 没有对应实现。

证据：`src/services/tradeService.ts`、`ledgerDataValidator.ts`；`00-账本核心架构与数据流图-当前版.canvas`。

### S-10 依赖漏洞仍未关闭

当前记录仍是 5 个依赖漏洞，其中 1 个 moderate、4 个 high。现有 Week 7 源码提交没有修改依赖，也没有新的漏洞处置结论。

证据：`00-当前开发状态.md`“阻塞与风险”；源码 README“尚未关闭”；当前 `package.json`。

## 三、第一版产品与业务口径缺口

### P-01 交易列表没有展示完整交易事实

Week 1 第一版说明书和首页流程要求交易列表展示手续费与备注；当前 `TradeForm` 已允许输入手续费和备注，`Trade` 也保存这两个字段，但 `TradeTable` 仍只有日期、类型、资产、数量、均价、总金额和可选操作列。

用户无法从交易列表核对已经保存的 `fee` 和 `note`。

证据：Week 1 `01A_W1-账本第一版说明书.md`、`03A_W1-首页草图和用户流程.md`；`DashboardShell.tsx`。

### P-02 手续费仍不进入成本和盈亏

手续费可以录入和保存，但 `Position.costBasis`、`realizedPnl`、`unrealizedPnl` 均明确“暂不计手续费”。因此页面展示的是不含手续费的基础口径，不是交易后的净成本或净盈亏。

证据：Week 2 计算口径、Week 6 01A/01B、Dashboard 资产汇总表头。

### P-03 FeeRule 只有类型和存储位置，没有生产操作链

`LedgerData.feeRules`、`FeeRule` 类型、引用校验和 clear 范围均存在，但生产组件、Service 和 reducer 没有创建、修改或删除手续费规则的入口。正常生产页面产生的 `feeRules` 始终为空。

这与 Week 1“第一版支持手动百分比手续费规则”的设计结果不一致，也使 Week 8 计划中的非空 `feeRules` round-trip 无法由当前用户操作自然准备。

证据：Week 1 `02_W1-核心数据结构设计草稿.md`；`src/models/types.ts`、`src/state/initialLedgerData.ts` 及生产组件 / Service 清单。

### P-04 自定义资产没有生产管理入口

当前生产初始资产固定为 BTC、ETH、ADA。完整账本、Validator、clear 警告和自动化均能处理自定义资产，但页面没有新增、编辑或删除资产的 UI / Service / reducer action。

证据：`src/data/builtInAssets.ts`、`src/state/ledgerReducer.ts`、Dashboard 生产组件；Week 5 Day 4“本周不做资产管理 UI”。

### P-05 交易没有编辑能力

Week 1 用户流程记录了发现错误交易后的修改入口；当前生产能力只有新增和删除，没有 `trade/update` 或编辑页面。若旧买入支撑后续卖出，安全删除会阻止直接删除该买入，原交易也不能原位修正。

证据：Week 1 `03A_W1-首页草图和用户流程.md`；`ledgerReducer.ts`、Dashboard 交易操作列。

### P-06 价格历史不可见、不可修改、不可删除

用户可以持续追加 `PriceSnapshot`，Calculator 会选择最新或同时间后出现的记录；页面只显示每个持仓的派生最新价格，没有价格快照列表，也没有 update/delete action。错误价格记录无法从生产 UI 直接检查或删除。

证据：`PriceForm.tsx`、`ledgerReducer.ts`、`positionCalculator.ts`、Dashboard 资产汇总。

### P-07 交易显示顺序与计算顺序不一致

Calculator 按 `occurredAt` 排序并在同时间保持稳定顺序；交易列表按数组保存顺序原样展示。回填的历史交易会显示在列表末尾，但参与计算时会被放回历史时间线。

用户看到的列表顺序可能与实际影响持仓的计算顺序不同，同时间展示规则和升降序仍未定义。

证据：Week 5 `06B` P2-01；`positionCalculator.ts`；`TradeTable`。

### P-08 Week 2 展示格式标准没有落地

Week 2 标准写明 USD 金额、市值和盈亏默认显示 2 位，均价按资产保留必要精度；当前 Dashboard 直接展示完整 `DecimalString`。Week 6 production 记录中 ADA 剩余成本和已实现盈亏已经显示为 38 位小数。

日期也仍是原始 ISO 字符串，统一的纯展示格式层尚不存在。

证据：Week 2 `01D_W2-存算展示三段式标准.md`；Week 6 `01B_W6-全周开发与Gate验收记录.md`；Dashboard 资产汇总和交易表格。

### P-09 表单日期没有按 Week 1 约定默认今天

Week 1 首页流程多次规定新增交易日期默认今天、价格记录时间默认现在；当前 `TradeForm` 和 `PriceForm` 的初始日期均为空字符串，成功后只保留用户上次输入日期。

证据：Week 1 `03A_W1-首页草图和用户流程.md`；`TradeForm.tsx`、`PriceForm.tsx`。

### P-10 页面存在看似可用但没有行为的控件

左侧“总览、买入、卖出、交易记录、价格、报告、设置”全部是 `href="#"`；顶部 `Today / This Month / All` 按钮没有状态或筛选行为。页面仍显示 “Day 4 only reserves the space” 等早期空壳文案。

证据：`DashboardShell.tsx`。

## 四、文档与认知问题

### D-01 现行总架构图与 Week 7 源码冲突

`00-账本核心架构与数据流图-当前版.canvas` 仍写成：

- IndexedDB 只保存真正的 `EncryptedEnvelope`，不保存明文。
- StorageAdapter 调用 EncryptionService，并负责 parse / schema validation / migrate。
- Repository 提供 `getLedgerData / listTrades / saveTrade / savePriceSnapshot / exportData / importData`。
- action 使用 `ledger/load`、`ledger/import`。

当前源码事实是：

- IndexedDB 保存 `StoredLedgerEnvelope { formatVersion, encryptedPayload }`，Noop 下 payload 为明文 JSON。
- `DefaultLedgerRepository` 调用 EncryptionService、JSON parse 和完整 Validator。
- Adapter 只读写 envelope。
- Repository 只有 `load / save / clear`。
- reducer 当前整账替换 action 是 `ledger/replace`，没有 `ledger/load` 或 `ledger/import`。

该文件名仍标记为“当前版”，会直接污染 Week 8 架构判断。

### D-02 现行总架构图把未来模块画成当前链路

当前总图包含 normalize、deterministic fingerprint、duplicateDetector、schema migrator、import/export Service、真加密 envelope、unlock lifecycle 等节点，但源码尚无这些实现；图中没有稳定地区分“已实现”和“未来计划”。

证据：`00-账本核心架构与数据流图-当前版.canvas` 与当前 `src/` 文件清单。

### D-03 Week 1 与 Week 3 持久化文档保留了相互冲突的旧契约

Week 1 `05A/05B` 和 Week 3 `07B` 仍包含 Adapter 调用 Encryption、空库返回默认账本、clear 写回空账本、Repository 按实体读写等旧设计；Week 7 实际契约已经改为空库 `null`、clear 删除 record、`Repository -> EncryptionService -> Adapter` 和整账 `load/save/clear`。

这些旧文件没有统一的“已被 Week 7 契约取代”标记，且 Week 3 `07B` 仍留在周目录而非归档区。

### D-04 Week 1 golden 数据仍有买入 / 卖出冲突

Week 1 `01B_W1-5条假交易样例.md` 的第 5 条是 ADA 卖出；Week 1 `06_W1-Week1验收记录.md` 把第 5 条写成 buy，并使用 `251.2006 / 62` 的全买入手算基准。Week 2 文档说明了当前唯一标准是“4 买 1 卖”，但 Week 1 历史文件本身仍冲突。

后续 AI 若只读取 Week 1 验收记录，会得到错误的 golden 输入和预期。

### D-05 Week 3 认知债只完成第一轮，原通过线大部分仍未勾选

Week 3 Checklist 中除第一项外，大部分每日状态、核心理解通过线和 AI 协作规则仍是未开始 / 未勾选。当前开发状态明确只完成“第一轮”，不表示认知债全部还清。

证据：`week3_260626/00_W3-Week3-Checklist.md`；`00-当前开发状态.md`。

### D-06 多份周文档的状态字段与实际结果不一致

可直接观察的例子：

- Week 1 Checklist 的 Day 7 仍未开始，但 Week 1 日志已有 Day 7 记录。
- Week 2 `06A` 状态仍是“待执行”，Week 2 日志已记录 Step 1–10 完成。
- Week 5 `06A` 状态仍是“待正式执行”，同周日志和 Checklist 已记录执行、合并和发布。
- Week 5 每日清单末尾仍写“本周不可做 IndexedDB / 价格输入”，同文件前文又记录 07A 已提前实现。

这些状态漂移会让“清单状态”和“当前源码事实”给出不同答案。

### D-07 根协作文件引用了不存在的文档路径

根目录 `AGENTS.md` 要求遵循 `01一些进度/日志/00-文档产出规范.md`，该文件不存在；实际文件是 `99_tool/00-文档产出规范.md`。

### D-08 Week 8 入口文件没有完整表达当前 Gate

Week 8 Checklist 的前置 Gate 只有 hydration、round-trip、写失败和 test/lint/build；Week 8 每日清单的进入条件也没有列出 production DevTools envelope / clear record 直接证据。两份文件均未反映当前唯一正式阻断，且 Checklist 中已通过的前置项仍全部未勾选。

如果后续 AI 只读 Week 8 两份 `00`，可能在 G-01 / G-02 未关闭时误判可以开始。

### D-09 Week 8 导出数据真相来源存在冲突

Week 8 每日清单 Day 2 写“从 repository 读取当前完整 `LedgerData`”；Week 7 01A 的 backup 衔接契约写 `createBackupEnvelope(ledgerData, metadata)`。当前页面 state 与 Repository 在 save pending 或 save failure 时可能不同，两个文档没有明确导出对象到底代表“页面当前账本”还是“最后一次成功持久化账本”。

该冲突会直接影响导出文件是否包含用户页面上刚看到但尚未成功落盘的数据。

## 五、当前 Git 交接事实

### R-01 Week 7 源码尚未进入源码 main

Week 7 源码位于 `zhennn/week7-storage-gate`，相对源码 `main` 和本地 `origin/main` 跟踪引用领先 2 个提交；源码 `main` 仍停在 Week 6 基线。后续任务如果从源码 `main` 开始，会缺少安全 clear 和持久化互斥实现。

### R-02 Week 7 代码和文档均只存在本地

源码 Week 7 分支相对本地 `origin/main` 领先 2 个提交且未推送；文档仓库 `main` 相对本地 `origin/main` 领先 3 个提交。远端跟踪引用尚不包含当前 Week 7 计划、验收记录、源码和 README 结果。

证据：2026-07-18 本次审计开始时两个仓库的 `git status --short --branch`、`git log` 和 `git rev-list --left-right --count origin/main...HEAD`。

## 审计边界

- 已关闭的 07A 六项风险、Week 6 React Gate、Week 7 自动化和 production 成功主链没有重新写成未完成项。
- Week 8 的 backup envelope、下载、解析、原子 replace、导入 UI 和 round-trip 本来就属于 Week 8，未把这些“尚未开始”的功能伪装成 Week 7 缺陷。
- Week 9 真加密、Week 10 图表、Week 11 benchmark 和其他更远功能没有进入本问题清单。
- 本文件没有修改任何源码、计划、状态、README 或历史文档。
