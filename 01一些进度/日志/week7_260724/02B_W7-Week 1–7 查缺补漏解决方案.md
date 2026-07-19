# Week 1–7 查缺补漏解决方案

日期：2026-07-18

状态：部分执行；B 批次、D-01 / D-02、D-07 / D-08 / D-09 与 R-01 / R-02 已关闭

对应问题报告：`02A_W7-Week 1–7 查缺补漏问题报告.md`

目标：为 02A 的 33 项问题给出明确处理、停止条件和通过线，供后续 AI 按批次实施。

## 结论

02A 的 33 项问题全部有对应处理方式。只有 `G-01 / G-02` 是现行 Week 7 正式 Gate；其他问题不得伪装成 Gate，也不得一次性混成超大提交。

固定顺序：持久化可靠性 → Week 8 前资源/导出边界 → 最终候选 commit 的 Gate 证据 → 入口同步 → Week 8。Gate 后若再改受影响源码，必须重做对应证据。

## 执行规则

- 编号必须一一对应 02A；不得跳号、合并问题或用一个模糊改动宣称关闭多项。
- 源码项先补失败测试；浏览器、文档、Git 项先保存可复现证据。源码改动后运行定向测试与全量 `test / lint / build / diff-check`；纯文档项只做链接、事实和 diff-check。
- 页面不得直接调用 Repository、Reducer、IndexedDB、Web Crypto 或跨标签页浏览器 API。
- 不改变 `LedgerData.schemaVersion`、Adapter、Repository、计算口径或依赖时，不得顺手重构这些区域。
- 必须修改 schema、Adapter、Repository、Validator、Calculator、依赖大版本或业务口径时，立即停止并提交失败证据、目标文件和最小理由，获得确认后再单独实施。
- 新校验不得让既有合法 IndexedDB/backup 突然无法读取；必须先定义兼容、迁移、只读导出或回滚路径。
- 新错误码必须归属拥有该失败的 Validator、ResourcePolicy、Service 或 Repository；UI 只映射，不复制一套。
- Git 合并、推送和历史文档改写只在明确授权后执行。
- 每项关闭时，把实际文件、测试、浏览器值和 commit 写入后续验收记录；没有证据就保持未关闭。

## 执行批次与依赖

| 批次 | 项目 | 开始条件 |
| --- | --- | --- |
| B：可靠性 | S-01 → S-02 → S-03 | **已完成**；`529983e` 已进入并推送源码 `main` |
| C：Week 8 前边界 | S-07、D-09 契约 | **部分完成**；D-09 已同步，S-07 只完成测量且待确认阈值 |
| A：最终 Gate | G-01 → G-02 | B、C 的源码与文档定案；两项绑定最终候选 hash，全绿后判 Go |
| A2：入口同步 | D-08 | **阻断条件已同步**；只有 A 实际 Go 后才能把 Week 8 标记为允许开始 |
| D：独立补漏 | S-06、S-09、S-10、P-01 至 P-10、D-03 至 D-07 | 每次只领取一个可独立验收的小项 |
| D2：架构同步 | D-01、D-02 | **已完成**；当前图与未来图已分区，持久化链与源码一致 |
| E：路线后续 | S-04、S-05、S-08 | 分别进入多标签页 hardening、Week 9、Week 11 |
| F：Git | R-01、R-02 | **已关闭原审计问题**；Week 7 源码与文档已进入远程基线 |

## 优先级边界

| 级别 | 范围 | 含义 |
| --- | --- | --- |
| 正式 Gate | G-01、G-02 | 未通过时 Week 8 禁止开始 |
| Week 8 前必须完成 | S-01、S-02、S-03、S-07、D-08、D-09 | 先锁定 dirty/retry、输入边界、入口 Gate 和导出真相来源 |
| 近期可靠性 | S-06、S-09、S-10 | 独立小批次实现，不与导入导出混写 |
| 产品闭环 | P-01 至 P-10 | 按功能切片推进，每片独立测试与验收 |
| 路线内后续 | S-04、S-05、S-08 | 分别进入多标签页 hardening、Week 9 真加密、Week 11 benchmark |
| 文档与交接 | D-01 至 D-07、R-01、R-02 | 依据真实源码和授权状态单独收口 |

## 一、Week 8 正式 Gate

### G-01 production envelope 直接证据

- 处理：使用 production build、独立端口、隔离 origin、单一标签页。固定输入：BTC `2026-07-14 / buy / 0.001 / 70000 / 70 / fee 0 USD`，BTC 价格 `2026-07-16 / 80000 USD`，ETH `2026-07-15 / buy / 0.005 / 2000 / 10 / fee 0 USD`；不得访问默认 `localhost:3000` 数据。
- 读取：在 DevTools Application 或 Console 直接读取 `local-first-trading-ledger / ledger / ledger:v1`，记录可复现查询或截图。
- 核对：记录 `formatVersion`、`encryptedPayload` 的解析结果、BTC / ETH 交易与价格，并确认 payload 只有 `LedgerData` 四个数组和 `schemaVersion`，不存在 `Position[]`。
- 产出：把实际值、读取方式、端口、时间和截图或等价原始输出补入 Week 7 验收记录。
- 通过：所有值与页面一致，控制台无 warning / error；不能用源码推断、fake IndexedDB 或刷新成功替代直接证据。

### G-02 clear 后 production record 直接证据

- 处理：先删除 ETH 并刷新，确认 BTC 仍为 `0.001 / 70000 / 70 / 0 / 80000 / 80 / 10 USD`；再输入固定文本 `清空本地账本` 执行 clear，并直接查看 `ledger:v1`。
- 核对：clear 后 key 不存在；刷新后 key 仍不存在且页面为空；第一次新增交易后 key 才重新出现。
- 产出：把 clear 前、clear 后、刷新后、首次新写入后的四个实际状态补入 Week 7 验收记录。
- 通过：record 没有被初始 BTC / ETH / ADA 空账本自动重建，控制台无 warning / error。

## 二、数据安全、持久化与工程风险

### S-01 页面保存文案与真实持久化状态一致

- 状态：Hook 内部使用 `{ ledgerData, mutationVersion }`。`applyLedgerAction` 先以当前 ref 调用纯 reducer；返回同一 state 时给出 `noop` 且不增版本，真实变化才同步更新 ref、dispatch replace 并返回 `applied`；门禁失败返回 `rejected`。
- 基线：hydration、空库初始化、clear 成功和获 S-03 许可的 Repository 切换分别创建新 generation，并把 `mutationVersion/persistedVersion` 重置为 `0/0`；空库与 clear 后仍不自动写 record。异步结果必须同时匹配 generation 与 version。
- 页面：表单只在 `applied` 后显示“已加入账本”；只有 `persistedVersion === mutationVersion` 才显示“已保存到本地”。这里是页面内 version，不得与 S-04 storage revision 混用。
- 测试：覆盖 applied/noop/rejected、hydration、空库、clear、Repository 切换、A 成功但 B pending、旧 generation/Promise 和 save 失败。
- 通过：用户能区分内存已更新、正在保存、本地已保存和保存失败。

### S-02 save 失败可以安全重试最新账本

- 处理：Hook 记录失败 version；`retryPersistence()` 只能重试调用时的最新 `ledgerData`。若 state 已前进，旧失败 snapshot 永久作废，禁止排在新写之后覆盖新账本。
- 修改：重试复用同一写队列并去重；成功后仅在 version 仍匹配时清错。Repository 切换、clear、卸载或新 mutation 都使旧重试 token 失效。
- 测试：覆盖 A 失败后直接重试、A 失败后产生 B、B 成功后点击旧重试、重复点击和切 Repository。
- 通过：用户不需要制造下一次业务修改就能保存当前页面账本。

### S-03 dirty 账本的页面关闭边界

- 处理：`persistedVersion !== mutationVersion` 即 dirty；pending 和 save error 都注册 `beforeunload`。只有最新 version 保存成功、clear 成功或用户明确放弃 dirty state 后才能解除；Repository 切换不得静默丢弃。
- 修改：pending 显示“正在保存”，error 显示“尚未保存”；`beforeunload` 只负责警告，不尝试或宣称能完成异步 IndexedDB 写入。
- 测试：覆盖 pending、error、retry success、旧 save success、新 mutation、clear 和卸载。
- 通过：任何未落盘页面 state 都不会被误标为 clean。

### S-04 防止多标签页在 clear 后复活旧账本

- 处理：该项会改变 Adapter/Repository 契约，必须先停下确认。获准后定义无用户账本内容的 `ledger:meta`；不存在时 revision 为 `0`，类型为非负 safe integer，达到 `MAX_SAFE_INTEGER` 时拒绝继续写。
- 接口：`load()` 返回 `{ ledgerData, storageRevision }`；`save(data, expectedRevision)` 与 `clear(expectedRevision)` 返回新 revision。Adapter 在同一 readwrite transaction 内校验 expected、写入/删除、递增 meta；冲突使用一个 Repository `REVISION_CONFLICT`，不复用 clear 失败码。
- 规则：Hook 保存最新 revision；冲突后禁止写并进入只读 reload-required。BroadcastChannel 只做即时提示，不能充当一致性保证。
- 边界：页面不得直接使用 `BroadcastChannel` 或 IndexedDB；不采用仅靠内存消息、容易被休眠标签页漏收的方案。
- 测试：覆盖 meta 缺失、revision 返回/溢出、两个实例竞写、clear 与 stale save 穿插、休眠恢复、事务失败和重载；G-02 仍只要求 `ledger:v1` 不存在，meta 不得含账本数据。
- 通过：任何 clear 之前打开的标签页都不能重新写回旧账本。

### S-05 用真实加密替换 Noop 明文

- 处理：该项进入 Week 9 安全设计审查，未经确认不得编码。只允许认证加密；候选为 AES-256-GCM，口令经 PBKDF2-HMAC-SHA-256 派生，salt 至少 16 bytes、IV 12 bytes 且每次随机，KDF work factor 必须经当期安全基线与设备 benchmark 确认。
- 规则：Repository 仍只依赖 `EncryptionService`；Adapter 只保存 envelope；页面和业务层不接触 Web Crypto。
- 迁移：envelope 明确算法、KDF、salt、IV、ciphertext 和版本；定义解锁状态、密钥生命周期、旧 Noop 识别、一次性迁移、失败回滚与旧 record 保留。
- 通过：production record 不含可读交易明文；错误口令、篡改、迁移失败和随机 IV 均有确定性测试。

### S-06 删除交易增加误触保护

- 处理：点击删除先显示交易事实；确认后才调用既有 Service。成功删除保存一次 pre-delete 页面 snapshot；下一次其他 mutation、clear、Repository 切换或卸载后失效。
- 边界：undo 恢复并验证 pre-delete snapshot。若它等于最后成功持久化 snapshot，直接恢复 clean 且不重复保存；否则作为最新 mutation 进入正常队列。删除 save 失败时不得假定本地状态，只按 snapshot 相等性判断。
- 测试：覆盖取消、确认、阻断删除、delete save 成功/失败后的 undo、undo 保存失败、失效和重复点击。
- 通过：单击不立即删除，且成功删除至少有一种真实恢复路径。

### S-07 为完整账本和导入输入设置资源上限

- 测量：用同一确定性生成器测 1k/5k/10k/25k/50k trades 及成比例 snapshots，记录 JSON bytes、parse、结构校验和计算耗时；只提交结果与候选上限，等待用户确认，不自行宣布阈值。
- 分层：`validateLedgerData` 只负责结构、引用和业务时间线，保持既有 load 兼容；新增 `evaluateLedgerResourcePolicy` 负责 file/collection/string 策略。文件 bytes 在 parse 前检查，新 UI/import 在 mutation/replace 前执行策略。
- 兼容：Repository load 先通过结构校验；Hook 再评估策略。超限旧账本以 read-only 状态 hydrate，现阶段只允许查看，Week 8 实现 D-09 后才允许救援导出；禁止 mutation/自动保存，不得覆盖或清空。
- 测试：等于上限通过、超一单位失败；UI 不能先接受超限 state 再等 save 失败；错误只由 ResourcePolicy 返回，UI 不复制错误码。
- 通过：不受控输入无法制造无限内存、校验或渲染负载。

### S-08 建立大账本性能通过线

- 处理：Week 11 新增确定性生成器和 benchmark harness，至少测 1k、10k、候选上限下的 validate、hydrate、save、position calculate 和首屏渲染。
- 规则：执行前锁定重复次数、预热、硬件、浏览器、数据种子、P50/P95 与内存采集方法；测量后必须给出用户批准的最大耗时和内存阈值，否则保持未关闭。
- 临时边界：benchmark 完成前由 S-07 上限保护导入，不宣称 50k 规模已经流畅。
- 通过：README 与 release Gate 有可复现阈值；行为代码变化后 benchmark 必须重跑。

### S-09 增加语义重复交易检测

- 处理：表单 submitting 锁先解决快速双击；fingerprint 只作为提示，不作为 Validator 错误。fingerprint 使用 `assetSymbol / occurredAt / timePrecision / type / quantity / price / totalValue / currency / fee / feeCurrency`，Decimal 用 decimal.js 规范化，字段用稳定 JSON 序列化；note/rawText/id/时间戳不参与，但在确认 UI 中展示。
- 规则：用户可明确确认两笔相同经济字段的真实交易；导入保留合法重复，只报告疑似数量。未来增加可靠外部交易 ID 后再评估强去重。
- 测试：覆盖快速双击被阻止、相同字段经确认可保存、不同 ID 的备份可导入、Decimal 表示差异只触发同一提示。
- 通过：防止误操作，同时不破坏合法旧账本和 round-trip。

### S-10 依赖漏洞单独审计

- 处理：执行时重新保存 `npm audit --json`，不得硬编码“5 个”；逐项定位直接/传递依赖、生产/开发路径、可利用条件和可用升级版本。
- 规则：优先同主版本最小升级；涉及 Next.js、React、Vitest、ESLint 大版本时独立分支评估，不运行 `npm audit fix --force`。
- 验证：升级后运行全量 test、lint、production build、浏览器主链和新的 audit；无法无损关闭的条目必须记录接受理由与影响范围。
- 通过：每个当期条目都有“已修复”或“暂时接受”结论；接受项必须写责任范围、复查日期和失效条件。

## 三、第一版产品与业务口径缺口

### P-01 交易列表显示手续费与备注

- 处理：`TradeTable` 新增手续费和备注列；手续费显示数值与 `feeCurrency`，空备注显示 `—`。
- 边界：只展示已保存字段，不在组件内重算手续费；窄屏继续使用表格容器内横向滚动。
- 测试：覆盖有/无手续费、有/无备注、长备注和 390 / 1280 宽度；production 固定样例核对页面实际值与控制台。
- 通过：用户可从列表核对一条交易的完整持久化事实。

### P-02 手续费进入成本和盈亏

- 处理：这是核心业务口径变更，必须先停下确认。候选 v1 口径仅支持 `feeCurrency === trade.currency`：买入成本增加 fee；卖出已实现盈亏为 `收入 - fee - 结转成本`；未实现盈亏不预估未来卖出费。
- 兼容：先扫描 fixture、测试和可读取旧数据是否存在跨币种 fee；存在时不得静默拒绝、换汇或丢费，需另定 FX/迁移口径。
- 修改：只在 Calculator / Validator / formatter 处理口径，页面不写公式，`Position[]` 仍不持久化。
- 测试：补买入费、卖出费、部分卖出、清仓、多次买入、零手续费和 golden 手算样例。
- 通过：成本、已实现和未实现盈亏的 README 与页面口径一致，旧“不计手续费”文案全部移除。

### P-03 建立 FeeRule 生产操作链

- 处理：新增 FeeRule draft、Validator、Service、Reducer add/update/delete action 和管理 UI；规则字段使用现有 `name / platform / type / rate / currency`。
- 规则：`rate` 使用小数比例，`0.001 = 0.1%`，范围 `0..1`；只允许选择 `feeRule.currency === trade.currency` 的规则。建议 fee 用 decimal.js 计算 `totalValue * rate` 并保存规范化 DecimalString，不用 Number。被 Trade 引用的规则不可原地修改或删除；变更时创建新规则。
- 接线：交易表单可选择规则并显示建议 fee，用户可覆盖；最终 Trade 保存实际 `fee / feeCurrency / feeRuleId`，历史交易不随规则变化重算。
- 测试：覆盖创建、编辑、引用、删除保护、手动 fee 覆盖和非空 `feeRules` 持久化 round-trip。
- 通过：用户可在生产页面自然生成并核对非空 `feeRules`。

### P-04 建立自定义资产管理入口

- 处理：新增 Asset draft、Validator、Service、Reducer add/update/delete action 和资产管理 UI。
- 规则：仅生产新增入口把 symbol/currency trim 后统一大写；id 由 Service 依赖生成，decimals 为 0–18 整数。导入不得静默改写 symbol 或引用；不符合规范就返回结构化错误，未来迁移必须另立契约。被引用资产禁止删除，symbol、quoteCurrency、decimals 不可原地修改。
- 边界：hydrate/import 继续以完整 `LedgerData.assets` 为准，不自动混入内置资产。
- 测试：覆盖新增、自定义资产交易、重复 symbol、合法编辑、引用删除保护和持久化恢复。
- 通过：生产页面能创建自定义资产并完成交易与价格链。

### P-05 增加安全交易编辑

- 处理：新增 `updateValidatedTrade`，在原数组 index 原位替换后校验完整时间线；成功后 dispatch `trade/update`，不得通过删除再追加改变同时间顺序。
- 规则：保留 `id / createdAt`，更新 `updatedAt`；重复提示检查必须排除被编辑的自身 ID。任一字段或时间线错误时旧交易保持不变。
- UI：复用交易表单字段，以明确的编辑模式和取消入口呈现。
- 测试：覆盖普通编辑、回填时间、买卖类型变化、破坏后续卖出、取消和保存失败。
- 通过：错误交易可原位修正，且不会绕过安全时间线。

### P-06 增加价格历史、编辑与删除

- 处理：新增按 `recordedAt` 倒序的价格历史表，以及 `priceSnapshot/update`、`priceSnapshot/delete` 对应 Service 和 Reducer action。
- 规则：编辑在原数组 index 替换，保留 `id / createdAt` 并更新 `updatedAt`，不得改变“同时间数组后出现者获胜”；删除需要确认。删除或编辑后 Position 继续由完整数组派生。
- 边界：不把 latest price 单独存进 state，不在页面内选择最新价格。
- 测试：覆盖同时间后出现者规则、编辑最新/旧快照、删除最新后回退、空历史和持久化恢复。
- 通过：用户可看到并纠正每一条价格事实。

### P-07 统一交易显示顺序

- 处理：这是 Calculator 口径修改，先停下确认。获准后让 Calculator、Validator 时间线和展示 selector 共用一个 comparator：date-only 按日历日；datetime 按 epoch；混合先比较字符串中的日历日期，同日保留账本原顺序。Calculator 正序、UI 倒序仅方向不同。
- 边界：selector 不修改持久化顺序；现有 day-only golden 结果必须不变。
- 测试：覆盖 date-only、不同 offset 但同一 instant、混合格式、回填、同时间稳定顺序、原数组和持仓结果。
- 通过：列表顺序可预测，且不会偷偷改变业务计算顺序。

### P-08 落地统一展示格式层

- 处理：USD 金额/市值/盈亏用 decimal.js `ROUND_HALF_UP` 显示 2 位；其他 currency 和缺失 Asset.decimals 时显示规范化完整 DecimalString，不擅自截断。已定义 decimals 的数量按其限制并去尾零，负零显示 `0`。
- 规则：这是展示口径，执行前在该项验收样例中确认；只格式化展示，禁止写回 LedgerData 或使用 Number 计算。
- 日期：date-only 保持原日历日期；datetime formatter 显式接收 timeZone，生产默认浏览器时区，不硬编码 `Asia/Shanghai`。
- 测试：覆盖舍入模式、负零、长 DecimalString、极小数、尾零、date-only、UTC/offset datetime 和缺失值。
- 通过：页面不再出现 38 位无意义小数或原始 ISO 字符串。

### P-09 表单日期默认当前时间

- 处理：当前两个输入都是 `type="date"`，因此都只默认本地“今天”；不得写入不存在的时分秒。未来改为 datetime-local 时另行定义 timePrecision、offset 和迁移。
- 规则：默认值只在首次挂载和成功重置时生成，不在每次 render 改变；用户输入后不得被时钟覆盖。
- 测试：固定 clock 覆盖首次值、跨日、成功提交后重置和编辑中不跳变。
- 通过：用户打开表单即可获得正确默认时间，测试不依赖真实系统时间。

### P-10 移除虚假可用控件

- 处理：锁定唯一结果：删除“买入、卖出、报告、设置”和无口径时间筛选，只保留能对应真实 DOM section 的“总览、价格、交易记录”导航；不通过导航修改未提交表单 state。
- 修改：删除 “Day 4 only reserves the space” 等开发占位文案；未来功能只有实现行为和测试后才重新出现。
- 测试：扫描无 `href="#"`，交互测试验证导航到真实区域，键盘焦点和按钮语义正确。
- 通过：页面上每个可交互控件都有可观察行为。

### 产品项统一浏览器 Gate

- P-01 至 P-10 每项完成后使用 production build、独立端口、隔离环境和固定样例验收；记录页面实际值、刷新恢复、390/1280 宽度和控制台。
- 写入类功能还要核对保存状态与 IndexedDB 恢复；发现保存失败时按“失败测试 → 最小修复 → 全量验证 → 重做受影响浏览器步骤”处理。

| 项目 | 固定样例与预期 |
| --- | --- |
| P-01 | BTC `fee=1 USD`、`note=测试`；列表逐字段一致 |
| P-02 | 买 `1 BTC / 100 / total 100 / fee 1`，卖 `0.4 / 120 / total 48 / fee 0.5`；剩余数量 `0.6`、成本 `60.6`、已实现 `7.1 USD` |
| P-03 | USD rate `0.001`、total `1000`；建议 fee `1 USD`，手动覆盖 `2 USD` 后 Trade 保存 `2` |
| P-04 | 新增 `DOGE / USD / decimals 8`，买 `10 @ 0.2 / total 2`，刷新恢复 |
| P-05 | DOGE 买入原位改为 `12 @ 0.2 / total 2.4`，ID/index 不变，刷新恢复 |
| P-06 | DOGE 价格 `0.25`、`0.30`；编辑最新为 `0.28`，删除后回退 `0.25` |
| P-07 | 按数组输入 `2026-07-15`、`2026-07-15T09:00:00+08:00`、`2026-07-15T01:00:00Z`；后两条同 instant 保持原顺序，混合 date-only 同日也不推断时区 |
| P-08 | USD `1.005 -> 1.01`、`-0.004 -> 0.00`；无 decimals 的数量不截断 |
| P-09 | clock 固定 `2026-07-18`；交易和价格日期默认 `2026-07-18` |
| P-10 | 只存在总览/价格/交易记录导航；无 `href="#"`、假筛选或占位文案 |

## 四、文档与认知问题

### D-01 修正现行总架构图

- 处理：按当前源码重画持久化链为 `UI -> Hook -> Repository -> EncryptionService -> StorageAdapter -> IndexedDB`。
- 内容：写明 Adapter 只读写 `StoredLedgerEnvelope`；Repository 当前只有 `load / save / clear`；Noop payload 为明文；Reducer 整账 action 为 `ledger/replace`。
- 验证：在相关源码批次结束后再更新图；逐项对照当前接口、测试和唯一组装点，避免先画计划后让“当前版”再次过期。
- 通过：标记“当前版”的节点与 Week 7 源码不存在职责冲突。

### D-02 在架构图区分当前与未来

- 处理：所有节点增加 `已实现 / 计划中` 状态；normalize、fingerprint、duplicateDetector、migrator、import/export、真加密和 unlock lifecycle 移入明确的未来区域。
- 规则：未来节点不能画在当前生产主链上；每次功能落地后才移动到已实现区。
- 通过：只读图也能判断哪些文件真实存在、哪些只是路线计划。

### D-03 标记旧持久化契约已失效

- 处理：在 Week 1 `05A/05B` 和 Week 3 `07B` 首屏增加历史状态块，列出已失效契约并链接 Week 7 `01A/01B` 和源码 README。
- 边界：保留历史正文，不静默改写当时设计；不得移动文件导致旧链接失效。
- 通过：后续 AI 打开任何旧文档时，第一屏即可知道现行契约入口。

### D-04 统一 Week 1 golden 数据

- 处理：把“4 买 1 卖”声明为唯一 golden 输入；在 Week 1 验收记录顶部增加勘误，明确旧“第 5 条 buy / 251.2006 / 62”只适用于错误旧输入。
- 修改：当前测试、验收记录和后续引用统一链接 canonical 5 条数据，不复制第二份样例。
- 通过：任一入口都能得到相同的 5 条交易、持仓和盈亏预期。

### D-05 Week 3 认知债按真实学习证据关闭

- 处理：这是人工确认项，不得交给 AI 自治关闭。把未完成项保留为未完成，只有用户完成一问一答或代码定位并确认后才勾选。
- 边界：AI 不得代替用户批量勾选“已理解”，也不得因为源码已完成就宣称认知债完成。
- 通过：每个已勾选项都有用户确认或可复述证据；其余项继续保持开放。

### D-06 同步历史周文档状态

- 处理：只修改以下已核实目标：Week 1 Checklist Day 7、Week 2 `06A`、Week 5 `06A`、Week 5 每日清单冲突，以及 `00-当前开发状态.md` 中仍写旧 Week 7 功能分支/未合并的段落；每处保留原计划、实际结果和证据。
- 范围：发现新冲突时另行报告，不得用“逐份同步”扩大历史改写范围。
- 边界：只改状态与勘误，不重写历史计划内容。
- 通过：Checklist、周日志、当前状态和 Git 结果不再给出相反结论。

### D-07 修正根协作文件路径

- 处理：把根 `AGENTS.md` 的文档规范路径改为实际存在的 `99_tool/00-文档产出规范.md`。
- 验证：使用 `test -f` 或等价检查确认入口存在，并扫描工作区协作文件是否仍引用旧路径。
- 通过：新 AI 能从根协作文件直接打开正确规范。

### D-08 把完整 Storage Gate 写入 Week 8 入口

- 处理：在 Week 8 两份 `00` 文件加入 G-01 / G-02 的 production 直接证据要求，并根据 Week 7 01B 勾选已有通过项。
- 规则：只有 Week 7 01B 最终改为 Go 后，Week 8 才能标记“允许开始”；fake IndexedDB 不替代 production 证据。
- 通过：只读 Week 8 两份入口也不会误判当前 Gate。

### D-09 锁定导出数据真相来源

- 处理：点击时立即调用 `validateLedgerData(ledgerData)`；只把成功结果中重新构造的 `value` 作为 immutable export snapshot，再传给既定 `createBackupEnvelope`。不得继续引用活跃页面对象，也不得从 Repository 二次读取覆盖。
- 状态边界：hydration 未 ready 或 clearing 时禁止导出；pending/error 时允许救援导出，但 UI 必须明确“该备份可能新于最后成功保存版本”。不得向固定 `BackupEnvelopeV1` 擅加 persistence 字段。
- C 阶段：只把以上决定和测试清单同步到 Week 8 入口；不提前实现 export。
- Week 8 测试：覆盖 ready、pending、error、clearing、点击后页面继续变化、Repository 旧于页面 state；导出必须是点击瞬间 snapshot。
- 通过：C 阶段以契约无冲突为准；Week 8 实现后再以真实导出结果关闭功能项。

## 五、Git 交接

### R-01 确认 Week 7 源码开发基线

- 当前事实（2026-07-19）：源码 `main` 与 `origin/main` 均包含 `02e28f3`、`8f96cc6`、
  `b609e8f`、`97e8b23`、`401baff` 和合并提交 `529983e`。
- 状态：R-01 已关闭；后续从源码 `main` 继续，不得按旧功能分支描述当前基线。

### R-02 发布本地代码与文档

- 当前事实（2026-07-19）：原审计中“Week 7 代码和文档只存在本地”已失效；源码
  `origin/main` 已包含 `529983e`，文档 `origin/main` 已包含 Week 7 计划、验收与 Gap 记录。
- 状态：R-02 的原始交接问题已关闭；后续新文档仍需按实际提交和推送状态单独验证。

## 最终自检

| 检查项 | 通过标准 |
| --- | --- |
| 问题映射 | G 2 项、S 10 项、P 10 项、D 9 项、R 2 项，共 33 项 |
| Gate 边界 | 只有 G-01 / G-02 沿用现行正式 Gate；没有擅自重定义 Week 7 |
| 执行依赖 | B → C → A → A2；Gate 必须绑定所有前置源码完成后的候选 hash |
| 快照安全 | 旧 version、旧 retry、旧 Repository 结果均不能覆盖最新 state |
| 离开保护 | pending 与 error 都是 dirty；不能在 save 失败后解除警告 |
| 多标签页 | revision 校验/写入与 revision 推进/clear 分别保持同事务原子性 |
| 兼容性 | 结构 Validator 与 ResourcePolicy 分开；新规则不得让合法旧数据突然无法读取 |
| 分层边界 | 页面不直接碰 Repository、Reducer 或浏览器存储/加密 API |
| 业务变更 | Calculator、跨币种 fee、schema、crypto 参数必须先停下确认 |
| 重复交易 | 无可靠外部 ID 时只警告，不由完整 Validator 强拒绝 |
| 产品验收 | P-01 至 P-10 各有固定输入、实际值、刷新与 production 证据 |
| 文档真实性 | 当前实现与未来计划分开，历史错误用勘误保留 |
| Git 安全 | 以执行时事实为准；合并、建分支、推送必须获授权，禁止 force push |

## 本文件边界

- 本文件是执行约束，不代表 33 项已经完成。
- 本文件不修改源码、不补测试、不改变当前 Week 7 No-Go 结论。
- 本文件不开始 backup、导入导出、真加密、图表或 benchmark。
- 后续 AI 每次只领取一个清晰批次，完成后提交真实验收证据。
