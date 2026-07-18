# Week 1–7 查缺补漏解决方案

日期：2026-07-18

状态：待检阅，未执行

对应问题报告：`02A_W7-Week 1–7 查缺补漏问题报告.md`

目标：为 02A 的 33 项问题分别给出唯一、可执行、可测试的处理方式，供后续 AI 按编号实施。

## 结论

02A 的 33 项问题全部有对应处理方式，但本文件不把它们全部升级为 Week 8 前置 Gate。Week 8 仍只受既有正式 Gate 约束；其他问题按风险和路线分批实施，禁止一次性混成超大提交。

执行顺序：先关闭 `G-01 / G-02`，再完成 Week 8 入口与导入安全边界，之后按产品、文档、跨标签页、真加密和性能阶段推进。

## 执行规则

- 编号必须一一对应 02A；不得跳号、合并问题或用一个模糊改动宣称关闭多项。
- 每项先补失败测试或可复现证据，再做最小修改，再运行定向测试与全量 `test / lint / build / diff-check`。
- 页面不得直接调用 Repository、Reducer、IndexedDB、Web Crypto 或跨标签页浏览器 API。
- 不改变 `LedgerData.schemaVersion`、Adapter、Repository、计算口径或依赖时，不得顺手重构这些区域。
- 必须修改 schema、核心计算口径或依赖大版本时，单独立项、单独提交、单独验收。
- Git 合并、推送和历史文档改写只在明确授权后执行。
- 每项关闭时，把实际文件、测试、浏览器值和 commit 写入后续验收记录；没有证据就保持未关闭。

## 优先级边界

| 级别 | 范围 | 含义 |
| --- | --- | --- |
| 正式 Gate | G-01、G-02 | 未通过时 Week 8 禁止开始 |
| Week 8 前必须定案 | S-07、D-08、D-09 | 导入实现前必须先锁定输入上限、入口 Gate 和导出真相来源 |
| 近期可靠性 | S-01、S-02、S-03、S-06、S-09、S-10 | 独立小批次实现，不与导入导出混写 |
| 产品闭环 | P-01 至 P-10 | 按功能切片推进，每片独立测试与验收 |
| 路线内后续 | S-04、S-05、S-08 | 分别进入多标签页 hardening、Week 9 真加密、Week 11 benchmark |
| 文档与交接 | D-01 至 D-07、R-01、R-02 | 依据真实源码和授权状态单独收口 |

## 一、Week 8 正式 Gate

### G-01 production envelope 直接证据

- 处理：使用独立 production 端口、隔离 origin、单一标签页录入固定 BTC / ETH 数据；在浏览器 DevTools Application 或 Console 直接读取 `local-first-trading-ledger / ledger / ledger:v1`。
- 核对：记录 `formatVersion`、`encryptedPayload` 的解析结果、BTC / ETH 交易与价格，并确认 payload 只有 `LedgerData` 四个数组和 `schemaVersion`，不存在 `Position[]`。
- 产出：把实际值、读取方式、端口、时间和截图或等价原始输出补入 Week 7 验收记录。
- 通过：所有值与页面一致，控制台无 warning / error；不能用源码推断、fake IndexedDB 或刷新成功替代直接证据。

### G-02 clear 后 production record 直接证据

- 处理：在 G-01 相同隔离环境执行固定文本二次确认 clear，随后直接查看 `ledger:v1` key。
- 核对：clear 后 key 不存在；刷新后 key 仍不存在且页面为空；第一次新增交易后 key 才重新出现。
- 产出：把 clear 前、clear 后、刷新后、首次新写入后的四个实际状态补入 Week 7 验收记录。
- 通过：record 没有被初始 BTC / ETH / ADA 空账本自动重建，控制台无 warning / error。

## 二、数据安全、持久化与工程风险

### S-01 页面保存文案与真实持久化状态一致

- 处理：在 `usePersistentLedger` 暴露普通保存状态 `idle | pending | saved | error`；表单成功只表示“已加入账本”，全局状态只有在对应写队列成功后才显示“已保存到本地”。
- 修改：`TradeForm`、`PriceForm` 不再在 dispatch 后立即显示“已保存”；Dashboard 统一展示持久化状态。
- 测试：覆盖 dispatch 后 save 未决、save 成功、save 失败和连续两次写入，证明文案不会提前或串线。
- 通过：用户能区分内存已更新、正在保存、本地已保存和保存失败。

### S-02 save 失败可以显式重试同一快照

- 处理：Hook 保留最近一次失败的完整 snapshot，并暴露 `retryPersistence()`；重试仍进入现有写队列，不新增第二条保存链。
- 修改：错误区域提供“重试保存”，成功后清除失败 snapshot 与错误；Repository 切换、clear 或卸载后旧重试失效。
- 测试：先让 save 确定失败，再不修改账本直接重试；验证相同 snapshot 被保存一次、旧 record 在失败时不被破坏、重复点击不并发写。
- 通过：用户不需要制造下一次业务修改就能保存当前页面账本。

### S-03 pending save 的页面关闭边界

- 处理：复用 S-01 保存状态，在有排队写时注册 `beforeunload` 防误关；队列完成、失败、clear、Repository 切换或卸载时移除监听。
- 修改：Dashboard 显示“正在保存，请勿关闭页面”；浏览器生命周期逻辑封装在 Hook 或专用 lifecycle adapter，页面只消费状态。
- 测试：覆盖 pending 时注册、settled 后移除、重复写只注册一次、卸载清理和失败后不残留监听。
- 通过：pending 写入期间用户获得可见警告，非 pending 状态不产生无意义拦截。

### S-04 防止多标签页在 clear 后复活旧账本

- 处理：新增独立的跨标签页协调层，使用 `BroadcastChannel` 通知 clear，并在存储元数据中保存单调递增的 ledger revision；save 必须携带其读取时的 revision。
- 规则：clear 先推进 revision，再删除 `ledger:v1`；旧标签页 revision 落后时禁止保存并进入“账本已在其他标签页变更，请重新加载”的只读状态。
- 边界：页面不得直接使用 `BroadcastChannel` 或 IndexedDB；不采用仅靠内存消息、容易被休眠标签页漏收的方案。
- 测试：至少模拟两个实例、clear 广播、休眠后恢复、旧写拒绝和重新 hydration；production 用两个隔离标签页验收。
- 通过：任何 clear 之前打开的标签页都不能重新写回旧账本。

### S-05 用真实加密替换 Noop 明文

- 处理：按 Week 9 单独实现 Web Crypto 加密服务；使用用户口令派生密钥、随机 salt、每次加密独立随机 IV，并把算法与 KDF 参数写入版本化 envelope。
- 规则：Repository 仍只依赖 `EncryptionService`；Adapter 只保存 envelope；页面和业务层不接触 Web Crypto。
- 迁移：旧 Noop 明文必须有显式识别、一次性迁移、失败回滚和不覆盖旧 record 的测试；不得把字段名 `encryptedPayload` 当成已加密证据。
- 通过：production record 不含可读交易明文；错误口令、篡改、迁移失败和随机 IV 均有确定性测试。

### S-06 删除交易增加误触保护

- 处理：点击删除先打开确认框，固定展示交易日期、类型、资产、数量和金额；用户明确确认后才调用既有 `tradeRemovalService`。
- 边界：不绕过现有安全时间线校验；取消确认不得 dispatch；Week 8 备份未完成前文案明确删除不可撤销。
- 测试：覆盖取消、确认、安全删除、会破坏后续卖出的删除和重复点击。
- 通过：单击表格按钮不再立即删除，业务安全错误仍按原口径展示。

### S-07 为完整账本和导入输入设置资源上限

- 处理：新增唯一 `ledgerLimits` 配置，先采用保守上限：导入文件 5 MiB、assets 1,000、trades 50,000、priceSnapshots 100,000、feeRules 1,000、ID 128 字符、名称/平台/币种/符号 120 字符、note/rawText 2,000 字符。
- 修改：完整 Validator 检查数组和字符串上限；Week 8 文件读取在 `JSON.parse` 前先检查字节数；错误码区分文件过大、集合超限和字段过长。
- 边界：所有入口复用同一组常量，不在 UI、Validator 和 import service 各写一套数字。
- 测试：每个上限覆盖等于上限通过、超过一单位失败；超大文件不得进入 parse、decrypt 或 replace。
- 通过：不受控输入无法制造无限内存、校验或渲染负载。

### S-08 建立大账本性能通过线

- 处理：Week 11 新增确定性账本生成器和 benchmark harness，至少测 1k、10k、50k trades 下的 validate、hydrate、save、position calculate 和首屏渲染。
- 规则：记录硬件、浏览器、数据种子、样本规模、P50 / P95 和内存峰值；最终阈值以 release candidate 实测锁定。
- 临时边界：benchmark 完成前由 S-07 上限保护导入，不宣称 50k 规模已经流畅。
- 通过：README 与 release Gate 有可复现阈值；行为代码变化后 benchmark 必须重跑。

### S-09 增加语义重复交易检测

- 处理：新增纯函数 fingerprint，规范化并组合 `assetSymbol / occurredAt / timePrecision / type / quantity / price / totalValue / currency / fee / feeCurrency`；排除 `id / createdAt / updatedAt / note / rawText`。
- 修改：`tradeService` 在创建前拒绝现有 fingerprint；完整 Validator 拒绝同一账本内的重复 fingerprint；表单提交期间禁用按钮防止连击。
- 边界：Decimal 先按 decimal.js 数值规范化，`1.0` 与 `1.00` 视为相同；不同经济事实不得被误合并。
- 测试：覆盖不同 ID 的完全重复、Decimal 表示差异、仅备注不同、同时间但数量不同和快速双击。
- 通过：生产新增和未来导入都使用同一重复判定。

### S-10 依赖漏洞单独审计

- 处理：保存 `npm audit --json` 原始结果，逐项定位直接/传递依赖、生产/开发路径、可利用条件和可用升级版本。
- 规则：优先同主版本最小升级；涉及 Next.js、React、Vitest、ESLint 大版本时独立分支评估，不运行 `npm audit fix --force`。
- 验证：升级后运行全量 test、lint、production build、浏览器主链和新的 audit；无法无损关闭的条目必须记录接受理由与影响范围。
- 通过：5 个现有条目各有“已修复”或“有证据的暂时接受”结论，不能只记录总数。

## 三、第一版产品与业务口径缺口

### P-01 交易列表显示手续费与备注

- 处理：`TradeTable` 新增手续费和备注列；手续费显示数值与 `feeCurrency`，空备注显示 `—`。
- 边界：只展示已保存字段，不在组件内重算手续费；窄屏继续使用表格容器内横向滚动。
- 测试：覆盖有/无手续费、有/无备注、长备注和 390 / 1280 宽度。
- 通过：用户可从列表核对一条交易的完整持久化事实。

### P-02 手续费进入成本和盈亏

- 处理：买入成本基础增加买入手续费；卖出已实现盈亏按“卖出收入 - 卖出手续费 - 被卖出数量对应成本”计算；剩余成本保留未卖部分的含买入费成本。
- 规则：`fee` 必须与 `feeCurrency` 一致且与交易 `currency` 相同；未提供费用按 `0`；未实现盈亏不预估未来卖出手续费。
- 修改：只在 Calculator / Validator / formatter 处理口径，页面不写公式，`Position[]` 仍不持久化。
- 测试：补买入费、卖出费、部分卖出、清仓、多次买入、零手续费和 golden 手算样例。
- 通过：成本、已实现和未实现盈亏的 README 与页面口径一致，旧“不计手续费”文案全部移除。

### P-03 建立 FeeRule 生产操作链

- 处理：新增 FeeRule draft、Validator、Service、Reducer add/update/delete action 和管理 UI；规则字段使用现有 `name / platform / type / rate / currency`。
- 规则：ID 唯一，name 非空，percentage rate 大于等于 0 且小于等于 1；已被 Trade 引用的规则禁止删除或破坏性修改。
- 接线：交易表单可选择 FeeRule 并计算建议 fee，但最终 Trade 必须保存实际 `fee / feeCurrency / feeRuleId`，历史交易不随规则变化重算。
- 测试：覆盖创建、编辑、引用、删除保护、手动 fee 覆盖和非空 `feeRules` 持久化 round-trip。
- 通过：用户可在生产页面自然生成并核对非空 `feeRules`。

### P-04 建立自定义资产管理入口

- 处理：新增 Asset draft、Validator、Service、Reducer add/update/delete action 和资产管理 UI。
- 规则：symbol 与 id 全账本唯一；quoteCurrency 非空；decimals 为 0–18 的整数；被交易或价格引用的资产禁止删除，symbol 和 quoteCurrency 禁止直接改写。
- 边界：hydrate/import 继续以完整 `LedgerData.assets` 为准，不自动混入内置资产。
- 测试：覆盖新增、自定义资产交易、重复 symbol、合法编辑、引用删除保护和持久化恢复。
- 通过：生产页面能创建自定义资产并完成交易与价格链。

### P-05 增加安全交易编辑

- 处理：新增 `updateValidatedTrade`，用编辑后的交易替换原交易后对完整时间线重新校验；成功后 dispatch `trade/update`。
- 规则：保留 `id / createdAt`，更新 `updatedAt`；任一字段错误或导致历史任一点负持仓时整次编辑失败，旧交易保持不变。
- UI：复用交易表单字段，以明确的编辑模式和取消入口呈现。
- 测试：覆盖普通编辑、回填时间、买卖类型变化、破坏后续卖出、取消和保存失败。
- 通过：错误交易可原位修正，且不会绕过安全时间线。

### P-06 增加价格历史、编辑与删除

- 处理：新增按 `recordedAt` 倒序的价格历史表，以及 `priceSnapshot/update`、`priceSnapshot/delete` 对应 Service 和 Reducer action。
- 规则：编辑复用价格 Validator；保留 `id / createdAt`，更新 `updatedAt`；删除或编辑后 Position 继续由完整快照数组派生。
- 边界：不把 latest price 单独存进 state，不在页面内选择最新价格。
- 测试：覆盖同时间后出现者规则、编辑最新/旧快照、删除最新后回退、空历史和持久化恢复。
- 通过：用户可看到并纠正每一条价格事实。

### P-07 统一交易显示顺序

- 处理：新增纯展示 selector，按 `occurredAt` 倒序返回新数组；同时间保留原数组相对顺序，并在表头明确“交易时间（新到旧）”。
- 边界：Calculator 继续使用自己的正向安全时间线；selector 不修改 `LedgerData.trades`，不改变持久化顺序。
- 测试：覆盖回填交易、同时间稳定顺序、原数组不变和计算结果不变。
- 通过：列表顺序可预测，且不会偷偷改变业务计算顺序。

### P-08 落地统一展示格式层

- 处理：新增纯 formatter：金额/市值/盈亏默认 2 位；数量按 Asset decimals 限制并去掉无意义尾零；均价保留必要精度；日期统一格式化。
- 规则：只格式化展示，禁止把格式化结果写回 LedgerData；禁止 Number 浮点参与业务计算。
- 日期：date-only 保持原日历日期；datetime 使用明确的 `Asia/Shanghai` 时区显示，测试固定时区。
- 测试：覆盖长 DecimalString、负数、极小数、尾零、date-only、UTC datetime 和缺失值。
- 通过：页面不再出现 38 位无意义小数或原始 ISO 字符串。

### P-09 表单日期默认当前时间

- 处理：交易表单初始化为今天，价格表单初始化为当前本地时间；通过可注入 clock helper 生成 input 值。
- 规则：默认值只在首次挂载和成功重置时生成，不在每次 render 改变；用户输入后不得被时钟覆盖。
- 测试：固定 clock 覆盖首次值、跨日、成功提交后重置和编辑中不跳变。
- 通过：用户打开表单即可获得正确默认时间，测试不依赖真实系统时间。

### P-10 移除虚假可用控件

- 处理：已实现区域的导航改为真实 section anchor/scroll；未实现的“报告、设置”和无口径的时间筛选先移除，不保留 `href="#"` 或可点击假按钮。
- 修改：删除 “Day 4 only reserves the space” 等开发占位文案；未来功能只有实现行为和测试后才重新出现。
- 测试：扫描无 `href="#"`，交互测试验证导航到真实区域，键盘焦点和按钮语义正确。
- 通过：页面上每个可交互控件都有可观察行为。

## 四、文档与认知问题

### D-01 修正现行总架构图

- 处理：按当前源码重画持久化链为 `UI -> Hook -> Repository -> EncryptionService -> StorageAdapter -> IndexedDB`。
- 内容：写明 Adapter 只读写 `StoredLedgerEnvelope`；Repository 当前只有 `load / save / clear`；Noop payload 为明文；Reducer 整账 action 为 `ledger/replace`。
- 验证：逐项对照当前接口和唯一组装点，图中名称必须能在源码中定位。
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

- 处理：把未完成项保留为未完成，按 Checklist 逐项进行一问一答或代码定位；每项写下用户自己的判断与实际文件证据后再勾选。
- 边界：AI 不得代替用户批量勾选“已理解”，也不得因为源码已完成就宣称认知债完成。
- 通过：每个已勾选项都有用户确认或可复述证据；其余项继续保持开放。

### D-06 同步历史周文档状态

- 处理：逐份把状态字段改为有证据的真实结果，并在历史文档中保留“原计划状态 / 实际完成状态 / 证据 commit 或验收记录”。
- 范围：至少关闭 02A 已列出的 Week 1 Day 7、Week 2 `06A`、Week 5 `06A` 和 Week 5 每日清单冲突。
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

- 处理：导出对象统一定义为“用户当前页面可见的完整 LedgerData”，由 `createBackupEnvelope(ledgerData, metadata)` 接收；导出前必须复用完整 Validator。
- 状态边界：hydration 未 ready 或 clearing 时禁止导出；save pending / save error 时允许导出当前内存账本，但文件 metadata 必须记录 persistence 状态，明确它可能新于最后成功落盘版本。
- 禁止：导出流程不得再从 Repository 二次读取并覆盖页面当前事实。
- 测试：覆盖 ready、pending、save error、clearing 和 Repository 中旧于页面 state 的场景。
- 通过：导出内容与用户点击时看到的账本一致，且文件能说明其持久化状态。

## 五、Git 交接

### R-01 将 Week 7 源码带入正确开发基线

- 处理：G-01 / G-02 全绿并获得明确授权后，把 `zhennn/week7-storage-gate` 合入源码 `main`；合并前后都运行全量 test、lint、build 和 diff-check。
- 规则：不改写历史、不 amend、不丢弃两个 Week 7 提交；若 main 已前进，先审查差异和冲突。
- 通过：源码 main 包含 `02e28f3` 与 `8f96cc6` 的行为，工作树干净，Week 8 从该 main 创建独立分支。

### R-02 发布本地代码与文档

- 处理：获得明确推送授权后，分别推送源码仓库和文档仓库；两个仓库独立核对 remote、branch、ahead/behind 和工作树。
- 规则：不混用提交，不把 Week 8 代码混入 Week 7 发布，不删除分支，除非另有授权。
- 通过：各仓库 `origin` 含对应提交，`origin/main...main` 为 `0 0`，工作树分别干净；实际 hash 写入验收记录。

## 最终自检

| 检查项 | 通过标准 |
| --- | --- |
| 问题映射 | G 2 项、S 10 项、P 10 项、D 9 项、R 2 项，共 33 项 |
| Gate 边界 | 只有 G-01 / G-02 沿用现行正式 Gate；没有擅自重定义 Week 7 |
| 可执行性 | 每项都有处理位置、边界或测试通过线 |
| 分层边界 | 页面不直接碰 Repository、Reducer 或浏览器存储/加密 API |
| 数据安全 | import、clear、save、删除、跨标签页和加密均有失败路径 |
| 业务口径 | 手续费、排序、格式化、日期和编辑行为有唯一规则 |
| 文档真实性 | 当前实现与未来计划分开，历史错误用勘误保留 |
| Git 安全 | 合并和推送必须等待明确授权，两个仓库分别验证 |

## 本文件边界

- 本文件是执行约束，不代表 33 项已经完成。
- 本文件不修改源码、不补测试、不改变当前 Week 7 No-Go 结论。
- 本文件不开始 backup、导入导出、真加密、图表或 benchmark。
- 后续 AI 每次只领取一个清晰批次，完成后提交真实验收证据。
