# Week 12 main PNL-001～003 手续费进入成本与净盈亏执行文档

日期：2026-08-09
状态：已执行；开发结果见 01B = `PASS`；本文保留为当时产品与测试合同
源码轨道：`01一些进度/产出/LocalFirstTradingLedger/`；实际候选分支为 `zhennn/w12-pnl-fee-accounting`，从 `main` / `279af4e` 建立并保留未合并
目标：`PNL-001`、`PNL-002`、`PNL-003`
固定开发报告：`01B_W12-main-手续费进入成本与净盈亏执行报告.md`

Git 同步说明：用户后续提供的开发目标提示词，明确覆盖了本文中“直接在 `main` 开发”和“不建分支 / 不提交”的旧 Git 条款；本文其他产品、安全、测试和证据合同保持有效。

## 结论：完成后用户能看到什么

Week 12 第 `01` 批完成后，新建账本以 USDT 记录新交易、手工价格、Binance 价格和实际手续费。页面不再把 `Trade.totalValue` 写成模糊的“总金额”，而是明确显示“不含手续费的成交金额”、实际手续费、买入总支出或卖出净到账；持仓、摘要和图表从同一套确定性重放结果显示含费成本与净盈亏。

固定用户流程如下：

```text
新建一个虚构账本
→ 买入 0.1 BTC，成交金额 6500 USDT，实际手续费 5 USDT
→ 页面显示买入总支出 6505 USDT、含费成本 6505 USDT
→ 卖出 0.04 BTC，成交金额 2800 USDT，实际手续费 3 USDT
→ 页面显示卖出净到账 2797 USDT、已实现净盈亏 195 USDT
→ 剩余数量 0.06 BTC、剩余含费成本 3903 USDT
→ 如果有合法行情，未实现净盈亏 = 当前市场价值 - 3903 USDT
```

本批继续使用 `schemaVersion: 1` 和现有 `.lftl` / 保存链。旧版本 1 的 USD 事实保持原样并继续可读；本批不是版本 2、迁移或手续费规则批次。

## 一、给开发执行 AI 的硬合同

1. 先完整读取本文件、同目录的 [000](000_W12-规划文件关系与批次命名规则.md)、[00A](00A_W12-网页优先产品共识与架构边界.md)、[00B](00B_W12-总需求快照与待办清单.md)、[00C](00C_W12-main-网页与AI开发批次路线.md)、[00D](00D_W12-已知问题与验收缺口清单.md)、[当前开发状态](../00-当前开发状态.md) 与 [源码 README](../../产出/LocalFirstTradingLedger/README.md)。
2. 修改前必须重新记录根文档仓库与源码仓库各自的分支、HEAD、status、暂存区、未跟踪文件和相对 `origin/main` 远端跟踪引用的 ahead / behind。源码路径和实际分支必须同时匹配 `LocalFirstTradingLedger/main`。
3. 本文生成时只读快照为：源码 `main` HEAD `279af4e3248c68306e857b8d0c8eeeaa03a29d6a`、工作树干净、相对本地 `origin/main` 为 `0/0`；根文档仓库 HEAD `eb4c6cc48fb6d5f1f600150559abd6f91e51a3fa`，已有 `00C_W12-main-网页与AI开发批次路线.md` 的表格对齐未提交变化。执行时必须以实时现场为准，不能把本段快照冒充当前事实。
4. 如果源码 HEAD 已变化，先只读核对差异是否改变本批事实；如果存在与 `PNL-001～003` 重叠的用户改动、分支不符、无法解释的候选漂移或合同冲突，停止开发并在 01B 记为 `BLOCKED`，不得覆盖用户现场。
5. 允许修改的只是 `main` 源码仓库内本文件列出的职责区域及直接正式测试，并在根文档仓库新增唯一的 01B。不得修改 `00A～00D`、当前开发状态、`CS2026` worktree，也不得生成或执行 01C / 01D。
6. 本文件不授权暂存、提交、推送、建分支、合并、rebase 或 cherry-pick。后续执行提示词没有逐项授权时，保持所有变更未暂存，并分别汇报两个仓库。
7. 自动化全绿、开发报告或代码已经在 `main` 上都不是独立验收 PASS。只有全新任务执行 [01C](01C_W12-main-手续费进入成本与净盈亏独立审查执行文档.md) 并生成 `01D = PASS`，协调任务才允许回写 00B。

## 二、当前源码事实、目标设计与未知项

### 2.1 当前源码事实

| 入口 | 2026-08-09 只读核对到的事实 | 本批要改变什么 |
| --- | --- | --- |
| [`src/models/types.ts`](../../产出/LocalFirstTradingLedger/src/models/types.ts) | `LedgerData.schemaVersion` 固定为 `1`；`Trade` 已有 `fee` / `feeCurrency`；`Position` 是派生类型 | 不改 schema；只补充必要的派生状态或展示类型，不新增持久化金额事实 |
| [`src/data/builtInAssets.ts`](../../产出/LocalFirstTradingLedger/src/data/builtInAssets.ts) | BTC / ETH / ADA 的 `quoteCurrency` 仍为 USD，Binance mapping 已是 USDT | 新建账本内置资产改为 USDT；不得重写已加载旧资产 |
| [`src/state/initialLedgerData.ts`](../../产出/LocalFirstTradingLedger/src/state/initialLedgerData.ts) | 新建 / reset 走内置资产，schema 仍为 1 | 继承新的 USDT 内置资产；schema 不变 |
| [`src/validators/tradeValidator.ts`](../../产出/LocalFirstTradingLedger/src/validators/tradeValidator.ts) | 校验 `quantity × price ≈ totalValue`、fee 非负、交易币种与资产一致；未要求非零 fee 与交易币种一致 | 把 `totalValue` 明确为不含费成交金额；新写入严格拒绝非零异币种手续费，但兼容读取不能因此拒绝旧事实 |
| [`src/services/tradeService.ts`](../../产出/LocalFirstTradingLedger/src/services/tradeService.ts) | 未给 `feeCurrency` 时默认等于交易币种，也允许调用方保留任意 feeCurrency | 新创建事实必须落成与交易计价币种一致的实际手续费；不能影响旧账读取 |
| `src/services/priceSnapshotService.ts` | production 创建入口目前接受受支持的 USD / USDT | production 新价格必须为 USDT；兼容 Validator 仍允许旧 USD 被完整读取 |
| [`src/calculators/positionReplay.ts`](../../产出/LocalFirstTradingLedger/src/calculators/positionReplay.ts) | 买入成本只加 `totalValue`；卖出收入只用 `totalValue`；fee 完全未进入 P&L；卖清后把成本置零 | 成为唯一含费重放真相：买入加费、卖出扣费、部分卖出移除含费成本、全卖清直接移除全部成本 |
| [`src/calculators/positionCalculator.ts`](../../产出/LocalFirstTradingLedger/src/calculators/positionCalculator.ts) 与 [`src/services/positionService.ts`](../../产出/LocalFirstTradingLedger/src/services/positionService.ts) | 市值来自价格，未实现盈亏为市值减当前 costBasis；缺价时不制造字段 | 继续复用重放的含费 costBasis；缺价合同不变 |
| [`src/services/priceSelectionService.ts`](../../产出/LocalFirstTradingLedger/src/services/priceSelectionService.ts) | 支持 USD / USDT 候选，但 `effectiveCurrency` 写死为 `USD` | 改为真实币种 / 明确的近似等值语义，不得把 USDT 伪装成严格 USD |
| [`src/services/binancePriceRefreshService.ts`](../../产出/LocalFirstTradingLedger/src/services/binancePriceRefreshService.ts) | Binance 来源为 USDT，但保存快照币种取资产 `quoteCurrency` | 只为 USDT 资产创建新 Binance 快照；旧 USD 账本保留已有快照但不再新增 USD 快照 |
| [`src/services/chartDataService.ts`](../../产出/LocalFirstTradingLedger/src/services/chartDataService.ts) | 饼图使用市场价值；历史曲线读取重放 costBasis；热力图只数交易笔数 | 饼图金额标签与披露正确；成本线含费；热力图数值不因 fee 改变但必须回归 |
| [`TradeForm.tsx`](../../产出/LocalFirstTradingLedger/src/components/trades/TradeForm.tsx) | 页面写“总金额”，新 feeCurrency 跟随资产币种，没有总支出 / 净到账预览 | 改成交金额文案，显示实际手续费币种和确定性现金影响 |
| [`PriceForm.tsx`](../../产出/LocalFirstTradingLedger/src/components/prices/PriceForm.tsx) | 价格币种跟随资产 quoteCurrency | 新账本自然为 USDT；旧账本仍显示旧 USD，但新增金额事实入口必须明确停用 |
| [`DashboardShell.tsx`](../../产出/LocalFirstTradingLedger/src/components/dashboard/DashboardShell.tsx) | 交易表没有手续费 / 现金影响；持仓表仍写“暂不计手续费”；没有独立的净盈亏摘要 | 用派生结果补齐交易列表、持仓表和紧凑摘要，不做整体页面重构 |
| [`ChartsOverview.tsx`](../../产出/LocalFirstTradingLedger/src/components/charts/ChartsOverview.tsx) | 饼图与 tooltip 写死 USD 等值，成本图声明暂不计手续费 | 更新标签、披露和含费成本语义；热力图交互保持原样 |

### 2.2 当前正式测试事实

当前已有对应测试包括 `builtInAssets.test.ts`、`tradeValidator.test.ts`、`priceSnapshotValidator.test.ts`、`ledgerDataValidator.test.ts`、`tradeService.test.ts`、`priceSnapshotService.test.ts`、`positionCalculator.test.ts`、`positionService.test.ts`、`priceSelectionService.test.ts`、`binancePriceRefreshService.test.ts`、`chartDataService.test.ts`、`ChartsOverview.test.tsx`、`DashboardShell.test.ts`、`DashboardShell.golden.test.tsx` 和 `DashboardShell.interaction.test.tsx`。

已有断言大多固定 USD、无手续费成本和“总金额”文案；当前没有正式样例锁定 6500 / 5、2800 / 3 的含费重放，也没有对历史非零异币种手续费的安全降级合同。执行者必须新增行为测试，不能只把旧断言从 USD 批量替换成 USDT。

本文件生成任务没有运行正式测试。README 记录的 55 files / 698 tests 是旧开发基线，只能作为历史数字，执行时必须独立重跑并报告实时数量。

### 2.3 未知项

- 当前 `Position` 没有表达“手续费无法可靠计入”的派生状态；开发前需要选择一个最小的派生类型落点，但该状态不得进入 `LedgerData`。
- 当前页面没有独立净盈亏摘要组件；本批允许在 Dashboard 内增加一个紧凑摘要或一个小型纯展示组件，不允许借机重排整个页面。
- 当前图表把 DecimalString 转为 JavaScript number 仅用于 ECharts 绘图边界；本批不得把该转换向业务计算、汇总或保存链扩散。

## 三、PNL-001～003 精确范围

| ID | 本批必须交付 | 不得偷换的完成口径 |
| --- | --- | --- |
| `PNL-001` | 新建账本内置资产、由这些资产创建的新交易、手工价格、Binance 价格快照和实际手续费使用 USDT；`Trade.totalValue` 在类型注释、校验、页面和测试中统一表示不含费成交金额 | 不能把所有 `USD` 字符串批量替换；旧 USD 事实必须原样读取，schema 仍为 1 |
| `PNL-002` | 历史重放只读取每笔 `Trade.fee`；买入费进入成本，卖出费扣减净到账和已实现盈亏；部分卖出按含费平均成本移除，卖清直接移除全部剩余成本 | 不读取 FeeRule，不保存派生金额，不用浮点计算，不把异币种手续费当零或按 USDT 猜算 |
| `PNL-003` | 交易表、交易表单预览、持仓表、净盈亏摘要和三张现有图统一显示含费 / 净口径与 USDT / USD 近似披露 | 不做整体 UI 重构；饼图和热力图不应伪造手续费造成的数值变化 |

## 四、明确排除项

本批禁止：

- 升级 `LedgerData.schemaVersion`，实现版本 2 或修改 `.lftl` 文件格式、加密 metadata、BackupEnvelope 版本；
- 退役、迁移或改写旧 `.lftl`、旧明文备份、旧 IndexedDB 整账或连接记录；
- 实现 FeeRule 页面、固定费、百分比规则、规则匹配或重算历史交易；
- 新增交易平台字段、交易编辑、历史 K 线、账户净值或现金账户；
- 接入 Python、Ollama、NLP、Agent、Notebook、桌面端、移动端或论文功能；
- 整体 UI 重构、无关样式翻新、依赖升级或跨 `main` / `CS2026` 复制代码；
- 修改保存、加密、文件选择、重连、恢复、清空或导入语义；只允许为“不重复保存派生字段”补回归证明。

## 五、固定金额合同

### 5.1 唯一语义

```text
Trade.totalValue = 不含手续费的成交金额
成交金额 = 数量 × 成交均价
买入总支出 = 成交金额 + 实际买入手续费
卖出净到账 = 成交金额 - 实际卖出手续费
已实现净盈亏 = 卖出净到账 - 本次卖出移除的含费成本
未实现净盈亏 = 当前市场价值 - 剩余含费成本
```

`Trade.totalValue`、`Trade.fee` 与 `Trade.feeCurrency` 是账本事实。买入总支出、卖出净到账、平均含费成本、剩余含费成本、已实现净盈亏、未实现净盈亏和摘要合计都是临时派生结果，禁止写入 `Trade`、`LedgerData`、`.lftl`、IndexedDB connection record 或备份。

### 5.2 固定样例

```text
买入：0.1 BTC × 65000 = 成交金额 6500 USDT
实际买入手续费：5 USDT
含费买入成本：6505 USDT

卖出：0.04 BTC × 70000 = 成交金额 2800 USDT
实际卖出手续费：3 USDT
卖出前含费平均成本：65050 USDT / BTC
卖出移除成本：0.04 × 65050 = 2602 USDT
卖出净到账：2800 - 3 = 2797 USDT
已实现净盈亏：2797 - 2602 = 195 USDT
剩余数量：0.06 BTC
剩余成本：6505 - 2602 = 3903 USDT
```

固定样例必须在纯重放、service / chart 派生和真实页面流程三层取得一致证据。

### 5.3 重放规则

1. 买入：`quantity += trade.quantity`，`costBasis += trade.totalValue + applicableFee`。
2. 部分卖出：先按卖出前 `costBasis / quantity` 得到含费平均成本，再移除 `sellQuantity × averageCost`。
3. 卖出收入：`netProceeds = trade.totalValue - applicableFee`；已实现净盈亏增加 `netProceeds - removedCost`。
4. 全部卖清：用 Decimal 等值比较确认卖出数量等于卖出前数量，直接把本次移除成本设为全部剩余 `costBasis`，随后数量与成本严格归零；不得依赖浮点或比例分摊后再容差清零。
5. 多次买入：每笔买入分别把自己的实际手续费加入成本，再由总含费成本 / 总数量得到平均含费成本。
6. 零手续费：结果与旧无费算法相同，且仍明确显示实际手续费为 `0`。
7. 历史重放只读取 Trade 上已经保存的实际 fee；即使 `feeRuleId` 存在，也不得读取、查找或推测 FeeRule。
8. 所有业务金额继续走 `decimalMath` / `decimal.js`。ECharts 可以在最后绘制边界把已派生 DecimalString 转成有限 number，但该 number 不得反向参与成本、盈亏、现金影响或保存。

## 六、USDT 与旧 USD 过渡合同

### 6.1 新事实

- `createBuiltInAssets()` 的 BTC / ETH / ADA `quoteCurrency` 改为 `USDT`；ID、symbol、Binance mapping 和 schema 不变。
- `createInitialLedgerData()` 与 reset / clear 后的新账本继承 USDT 内置资产。
- `TradeForm` 和 `PriceForm` 继续从所选资产读取 quoteCurrency；生产创建 service 还必须把 USDT 作为本批新金额事实的强制币种，不能只依赖页面 readonly input。
- `mergeBinancePriceRefresh()` 只为 `quoteCurrency === "USDT"` 的资产创建或更新本批新快照，并保留 provenance 的 `sourceQuoteCurrency: "USDT"`。旧 USD 资产已有的手工 / API 快照继续可选价，但刷新不得再创建新的 USD 快照。
- 新创建的非零手续费必须与该 Trade 的 `currency` 相同。当前页面不提供其他手续费币种换算能力。

### 6.2 旧版本 1 / USD 事实

- `validateLedgerData()`、hydrate、备份恢复和 `.lftl` 读取必须继续接受结构合法的版本 1 / USD 资产、交易、价格和同币种手续费。
- 禁止在 normalize、hydrate、导入、保存或页面挂载时把旧资产的 `quoteCurrency`、Trade.currency、feeCurrency 或 PriceSnapshot.currency 从 USD 改成 USDT。
- 由于现有模型要求同一资产的 Trade.currency 与 Asset.quoteCurrency 一致，而本批又禁止迁移旧 Asset，旧 USD 账本进入“兼容读取与计算、禁止新增金额事实”模式：可以查看、计算、保存未改写的旧事实并执行既有安全纠正，但 TradeForm、PriceForm 和 Binance 刷新不得创建新的 USD 交易 / 价格；页面必须解释“本批不迁移旧 USD，若要新增 USDT 事实请新建账本”。
- 兼容 runtime validator 继续接受旧 USD；生产 create service 使用更严格的 USDT 新写入策略。不得为了实现严格新写入而让 ledgerDataValidator 拒绝旧账，也不得为了保留旧账读取而继续从页面创建新 USD 事实。
- 禁止全仓批量替换 `USD`。测试 fixture 中的旧 USD 可以继续作为兼容性样例；新增 USDT fixture 要与其并存。
- USD 与 USDT 都是受支持的估值事实，但不是严格同一货币。跨两者汇总或使用 Binance USDT 近似展示 USD 时，页面必须就近披露 `1 USDT ≈ 1 USD`，并说明未接实时汇率。
- 单资产 / 单交易页面优先显示事实自己的实际币种；只有跨 USD / USDT 的聚合才使用“USD/USDT 近似等值”等不会冒充严格换算的标签。

### 6.3 非零异币种手续费的保守降级

旧版本 1 可能包含 `trade.fee != 0` 且 `trade.feeCurrency !== trade.currency`。本批不迁移、不换算，也不能因此让整个旧账本无法打开。

固定处理如下：

1. 新写入路径严格拒绝这种候选；兼容读取路径仍保留原 Trade，不改成零、不改币种。
2. 确定性重放只把同币种手续费纳入金额。遇到非零异币种手续费时，记录一个仅派生的手续费计入问题，至少包含 tradeId、资产、日期、fee、feeCurrency 和交易币种。
3. 为防止“算了但没算全”冒充净结果，从该问题影响的时间点起，该资产的手续费敏感结果必须标为不可靠：含费平均成本、剩余含费成本、已实现净盈亏、未实现净盈亏及其汇总 / 历史成本线不得作为完整数字展示。
4. 数量、交易原始字段、真实行情、市场价值、饼图分配和热力图笔数不依赖该手续费换算，可以继续展示，但必须与不可用的净值字段区分。
5. 页面在交易行和受影响资产 / 摘要 / 图表旁明确写明“该笔手续费币种无法与交易计价币种可靠对应，未进行换算，相关净盈亏不可可靠计算”，并列出可识别的交易。
6. 零手续费没有换算金额，即使旧事实的 feeCurrency 字符串不同也不产生金额影响；仍原样显示，不改写事实。
7. 实现可以在 `Position` 增加派生状态或由 position service 返回 companion issue，但不得把该状态写入 LedgerData。所有 UI 与图表调用方必须消费同一状态，不能各自猜测。

## 七、页面与三张图的固定口径

### 7.1 交易表单

- “总金额”统一改为“成交金额（不含手续费）”。错误文案同步为“成交金额与数量 × 成交均价不一致”。
- 手续费写为“实际手续费”，就近显示手续费币种。
- 在不创建第二套事实的前提下，用 Decimal 临时预览：买入显示“买入总支出”，卖出显示“卖出净到账”。输入尚未通过基础十进制校验时不显示伪造数字。
- `Trade.totalValue` 保存前后始终等于用户确认的不含费成交金额；不得为了得到 6505 或 2797 而改写 totalValue。

### 7.2 交易列表

- 至少显示：成交金额（不含手续费）、实际手续费、买入总支出 / 卖出净到账。
- 同币种零费和非零费都显示实际值；旧异币种非零 fee 显示原币种 fee，但现金影响显示“无法可靠换算”，不能按零处理。
- 日期筛选、保存顺序、删除按钮、未来事实标记和小屏局部滚动继续工作。

### 7.3 持仓表

- 列名改为“含费平均成本”“剩余含费成本”“已实现净盈亏”“未实现净盈亏”。删除所有“暂不计手续费”。
- 市场价值仍只等于持仓数量 × 选中的合法价格；手续费不改变市场价值。
- 缺价时当前价格、市场价值和未实现净盈亏继续为缺失 / `--`，不能用 `0`、成交价、成本价或未来价格替代。
- 异币种手续费问题按第 6.3 节显示不可可靠计算状态，不得展示看似精确的净值。

### 7.4 紧凑摘要

当前页面没有独立净盈亏摘要。本批在 Dashboard 现有结构内增加最小摘要，至少覆盖：

- 累计买入总支出；
- 累计卖出净到账；
- 当前剩余含费成本；
- 累计已实现净盈亏；
- 当前未实现净盈亏（只有所有相关非零持仓都有合法价格时才给完整合计）。

摘要必须由事实临时派生，不进入 reducer 或保存。只要存在缺价、非 USD/USDT 资产或异币种手续费导致合计不完整，就明确列出排除 / 缺失原因；不得把缺项按零加入总数。

### 7.5 三张现有图

| 图 | 本批数值影响 | 页面通过线 |
| --- | --- | --- |
| 当前持仓分配饼图 | 仍按市场价值分配；手续费不直接改变市值 | 新 USDT 账本不再被写死成严格 USD；混合汇总显示近似等值与 `1 USDT ≈ 1 USD`；缺价继续不绘制误导性空饼 |
| 持仓总市值 / 持仓成本阶梯线 | 市值线不变；成本线必须读取逐日含费重放 | 标题 / tooltip 写“剩余含费成本”；异币种手续费影响后的成本点断开或标为不可用，不能画一条排除手续费却声称含费的线 |
| 365 天交易活跃热力图 | 仍只按交易笔数计数，fee 不应改变 level | 点击筛选、买卖笔数、365 天范围不退化；筛选后的交易列表显示新的成交金额 / fee / 现金影响口径 |

## 八、预计修改区域与职责

| 区域 | 固定职责 | 防越界要求 |
| --- | --- | --- |
| `src/data/builtInAssets.ts`、`src/state/initialLedgerData.ts` | 新账本 USDT 默认 | 不改 schema、ID 或加载后 normalize 规则 |
| `src/models/types.ts` | 必要的派生状态 / summary 类型 | 不把总支出、净到账、成本、P&L 或 issue 写进 LedgerData |
| `src/utils/decimalMath.ts` | 只在现有 primitive 不足时增加通用 Decimal 比较 / 汇总 helper | 不引入 JavaScript 浮点业务公式 |
| `src/validators/tradeValidator.ts`、`tradeService.ts` | 锁定 totalValue 语义、USDT 新写入和 fee 同币种规则 | 兼容 ledger read 不得被严格新写入规则误伤 |
| `src/validators/priceSnapshotValidator.ts`、`priceSnapshotService.ts`、`ledgerDataValidator.ts` | production 只创建 USDT，兼容层保持 USD / USDT 可读和 schema 1 | 不迁移旧值，不启用 FeeRule 计算 |
| `src/calculators/positionReplay.ts`、`positionCalculator.ts` | 唯一含费重放、全卖清归零、派生 issue | 不读取 FeeRule、价格或存储层 |
| `src/services/positionService.ts` | 组装价格、未实现净盈亏和可靠性状态 | 缺价不补值；UI 不另写公式 |
| `src/services/priceSelectionService.ts` | 消除 hard-coded USD，保留事实币种和近似汇总边界 | 不接汇率 API，不改变选价优先级 |
| `src/services/chartDataService.ts` | 复用同一重放产生饼图、含费历史成本和缺口信息 | 热力图仍只数事实；图表数据不持久化 |
| `src/services/binancePriceRefreshService.ts` | 新 USDT 账本保存 USDT；旧 USD 资产跳过新增刷新并保留已有事实 | 不改 Binance 网络合同、mapping、超时或保存入口 |
| `TradeForm.tsx`、`PriceForm.tsx` | 新事实币种和现金影响文案 | 不把计算结果 dispatch 到账本 |
| `DashboardShell.tsx` 与必要的小型纯展示组件 | 交易表、持仓表、摘要统一展示 | 不新增第二份 LedgerData / Position state，不重排整体 UI |
| `ChartsOverview.tsx`、`chartOptionBuilders.ts` | 币种、tooltip、含费成本与缺口文案 | number 转换只留在绘图边界 |
| 正式测试 | 把本文件合同固化为永久回归 | 不删安全测试，不只改断言迎合实现 |

如果需要新增一个纯派生 summary / cash-impact service 或 `positionReplay.test.ts`，允许放在现有 `calculators` / `services` 分层中；不得为了少改文件把公式复制到多个组件。

## 九、开发顺序

1. 重新冻结两个仓库；确认 `main`、现场无重叠用户修改，并在 01B 记录起点。
2. 先写失败的正式合同测试：固定样例、零费、多次买入、部分卖出、全卖清、旧 USD、异币种 fee、缺价和派生不保存。
3. 修改内置资产与新事实 USDT 默认；先证明旧 USD LedgerData 仍逐字段不变地通过读取 / 恢复。
4. 在 Validator / trade service 划开“新写入严格”与“旧账兼容读取”两个入口，锁定 totalValue 与 feeCurrency 合同。
5. 在 `positionReplay` 一次实现含费成本、净收入、全卖清和派生 issue；Calculator / Service 只复用，不复制公式。
6. 让 price selection、Binance merge、summary 和 chart data 消费真实币种 / 同一派生状态。
7. 更新 TradeForm、PriceForm、交易表、持仓表、摘要和三图文案；保留响应式、删除、筛选、未来事实和保存状态行为。
8. 运行定向正式测试；任何失败先修合同或实现，不得通过放宽关键断言收口。
9. 运行完整质量门和只使用虚构数据的 production 浏览器检查。
10. 再次冻结两个仓库，生成唯一 01B；不执行 01C，不回写 00B / 00D / 当前状态，不做 Git 写操作。

## 十、正式测试新增与修改计划

### 10.1 核心金额与 Decimal

在 `positionReplay` / `positionCalculator` 正式测试中至少锁定：

1. 固定 6500 / 5、2800 / 3 样例精确得到 6505、2602、2797、195、3903；
2. 零手续费结果与旧算法一致；
3. 两次不同价格、不同手续费买入后的总含费成本和平均成本；
4. 部分卖出按卖出前含费平均成本移除；
5. 全部卖清时 quantity、averageCost、costBasis 严格为字符串 `"0"`；
6. 卖出手续费只扣净到账 / 已实现净盈亏，不减少剩余成本；
7. 40 位 Decimal 精度下的小数交易、重复部分卖出和最后卖清不残留成本；
8. 交易输入、LedgerData 和 Trade 对象保持不可变；
9. 重放不访问 FeeRule。

### 10.2 币种、Validator 与兼容性

- `builtInAssets.test.ts`：新 catalog 为 USDT，克隆 / 唯一性合同不变。
- `initialLedgerData` / reducer 测试：新建与 reset 为 USDT，schema 仍为 1。
- `tradeValidator.test.ts`：totalValue 继续独立校验 `quantity × price`，fee 不进入该等式；新写入非零异币种 fee 被稳定错误码拒绝；零费与默认 feeCurrency 行为明确。
- `tradeService.test.ts`：新 Trade 的 currency / feeCurrency 为 USDT；不得再把“保留 CNY 非零手续费”当成功新写入合同。
- `priceSnapshotValidator.test.ts` 与 price service 测试：USDT 新事实成功；兼容 runtime validation 仍接受旧 USD asset + USD price；生产新写入拒绝 USD 和不支持币种。
- `ledgerDataValidator.test.ts`：schema 1 / USD 完整账本逐字段保留；旧非零异币种 fee 可读取但派生结果标记不可可靠计算；schema 2 仍拒绝。
- `priceSelectionService.test.ts`：USD 与 USDT 均返回真实币种语义；选价顺序、同日 Binance 优先和旧 API 无 provenance 排除不变。
- `binancePriceRefreshService.test.ts`：新 USDT asset 写 USDT snapshot；旧 USD asset 跳过新刷新且已有 snapshot 不变；mapping 删除、并发事实和同日 upsert 回归不变。

### 10.3 页面、摘要与三图

- `DashboardShell.test.ts`：交易列、持仓列、摘要与文案不再出现“总金额”或“暂不计手续费”；空状态 colSpan 与局部滚动同步。
- `DashboardShell.golden.test.tsx`：通过真实表单输入固定含费样例，逐列检查交易、持仓、摘要、价格后未实现净盈亏和图表摘要。
- `DashboardShell.interaction.test.tsx`：USDT 新交易 / 价格保存，旧 USD hydrate / import，异币种 fee 明确不可用，缺价不伪造，删除与重新挂载后结果一致。
- `chartDataService.test.ts`：历史成本线含 fee；饼图市值不因 fee 改变；热力图计数不因 fee 改变；缺价和异币种 fee 产生明确缺口。
- `ChartsOverview.test.tsx` 与 `chartOptionBuilders.test.ts`：USDT / 近似等值标签、`1 USDT ≈ 1 USD` 披露、含费成本 tooltip 和三图无退化。
- `TradeForm` / `PriceForm` 没有独立测试文件时，通过 Dashboard interaction 覆盖真实组件；不得只测 mock 组件。

### 10.4 保存与回归

至少定向复跑与 LedgerData / 备份 / 文件保存相关的既有正式测试，证明：

- 派生 summary、现金影响、Position issue 和图表数据没有进入序列化账本；
- 版本 1 `.lftl`、BackupEnvelopeV1、legacy USD、恢复、clear 和文件 readback 合同没有改变；
- 交易时间线、超卖保护、未来事实隔离、价格选择、Binance 失败保旧价、删除和持久化重挂载不退化。

## 十一、开发侧命令与质量门

先运行覆盖实际改动的定向测试，至少包含上述 calculator、validator、service、chart 和 Dashboard 正式测试。随后完整执行：

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

额外要求：

- 01B 逐条记录命令、退出码、测试文件数、测试数、warning / error；不能只写“全绿”。
- 检查 `.only`、`.skip`、`debugger`、意外 `console.log` / `console.debug` 和新业务浮点公式。
- `git diff --check` 不覆盖未跟踪文件。所有未跟踪源码、测试和 01B 必须逐个用等价的 `git diff --no-index --check /dev/null <file>` 或其他只读等价方法检查。
- build 或浏览器检查生成的 ignored artifact 不计源码修改，但结束时仍需证明所有 tracked / untracked 源文件范围明确。
- 任一定向测试、全量测试、typecheck、lint、production build 或 whitespace 强制项失败，开发侧不得写 PASS。

## 十二、只用虚构数据的浏览器检查

自动化通过后，用 production build 和真实 Google Chrome 检查；只能使用专门新建的虚构账本与虚构备份，不得打开、导入或覆盖个人账本。

1. 新建虚构 `.lftl`，确认 BTC / ETH / ADA 计价币种为 USDT；新交易、手工价格和 feeCurrency 保存为 USDT。
2. 录入固定 BTC 买入 / 卖出样例，核对表单预览、交易表、持仓表、摘要、历史成本线和精确结果。
3. 输入一个合法当前价格，核对市值与未实现净盈亏；删除价格或使用缺价资产，确认没有用 0 / 成交价冒充行情。
4. 用另一个虚构资产 / 交易覆盖零费、多次买入、部分卖出和最后全部卖清；检查严格归零。
5. 打开纯虚构的旧版本 1 / USD fixture，确认所有 USD 事实未被改写且同币种 fee 能进入净结果；TradeForm、PriceForm 与 Binance 刷新明确禁止创建新 USD 金额事实，并提示新建 USDT 账本。
6. 打开纯虚构的旧异币种 fee fixture，确认原 fee 仍可见、相关净值不可可靠计算、没有按零或 USDT 换算。
7. 检查页面就近显示 `1 USDT ≈ 1 USD`，并说明没有实时汇率。
8. 检查三图：饼图市值、含费成本阶梯线、热力图及日期筛选；确认控制台 0 error，390px / 1280px 页面级无横向溢出，宽表只局部滚动。
9. 保存、锁定、重开虚构文件，核对原始 Trade 仍只保存 totalValue / fee，而摘要、总支出、净到账、Position 和 chart data 未写入账本。

如果真实 Chrome 或文件选择器不可用，01B 记 `BLOCKED` 和缺失证据；不得用开发服务器静态观察、内置 Chromium 或自动化结果冒充真实流程。

Week 11 `02D = BLOCKED` 不阻止本批虚构数据检查，但本批浏览器成功也不得宣称真实个人数据 Gate 已通过，更不得改写 Week 11 02D。

## 十三、01B 固定报告合同

开发任务无论 `PASS`、`FAIL` 或 `BLOCKED` 都生成唯一：

```text
01B_W12-main-手续费进入成本与净盈亏执行报告.md
```

01B 至少包含：

1. 开发侧最终结论：`PASS` / `FAIL` / `BLOCKED`；明确它不是独立验收结论。
2. 起止时间、源码分支、起点 / 终点 HEAD、相对远端跟踪引用差异，以及根文档仓库快照。
3. 实际修改的生产文件、测试文件、未跟踪文件和 diff 统计；逐项映射 PNL-001～003。
4. 固定金额样例的手算与程序结果；零费、多次买入、部分卖出、卖清、旧 USD、缺价和异币种 fee 证据。
5. 页面四个区域与三张图的实际变化和截图 / 可复现步骤；不得只写“UI 正常”。
6. 定向测试、全量测试、typecheck、lint、production build、whitespace 和浏览器检查的命令、退出码与数量。
7. schema、LedgerData、`.lftl`、BackupEnvelope、IndexedDB connection、FeeRule、平台字段、NLP 和保存链的防越界扫描。
8. 任何偏离本文件的实现、环境限制、未完成项、已知风险和停止原因。
9. 明确说明没有执行 01C、没有生成 01D、没有回写 00B / 00D / 当前状态。
10. 分别报告两个 Git 仓库的 status、staged / unstaged / untracked、commit 和 push 状态；没有授权时明确“未暂存、未提交、未推送”。

01B 不得写“PNL-001～003 已最终完成”。开发侧最多写“已形成待独立审查候选”。

## 十四、PASS、FAIL、BLOCKED 与停止条件

| 结论 | 开发侧定义 |
| --- | --- |
| `PASS` | `PNL-001～003` 全部实现；固定样例与边界矩阵通过；全部质量门和虚构数据浏览器检查有证据；无强制缺口、无越界修改 |
| `FAIL` | 已有证据证明任一金额、手续费、币种、缺价、兼容、派生不保存或防越界强制合同被违反；或任一正式质量门失败 |
| `BLOCKED` | 没有已证明的强制失败，但错误分支、重叠用户改动、候选漂移、真实 Chrome / picker 不可用或其他外部条件使关键证据无法取得 |

立即停止扩大实现并转入 01B 报告的条件：

- 实际源码分支不是 `main`，或路径不是产品 worktree；
- 发现会被覆盖的用户改动、无法解释的源码漂移或根 `00C` 既有改动被触碰；
- 正确实现被证明必须升级 schema、修改文件格式或引入 FeeRule / 汇率 / 平台字段；
- 只能通过把异币种 fee 当零、按 USDT 猜算、改写旧 USD 或用 JavaScript 浮点才能继续；
- 正式测试需要删除 / skip 安全断言、只改预期才能“变绿”；
- 已出现明确强制 FAIL。此时可以完成必要诊断和 01B，不得顺手进入版本 2 或其他批次。

本文完成、01B 生成或开发侧 PASS 都不允许回写 00B。只有 `01D_W12-main-手续费进入成本与净盈亏独立审查报告.md = PASS` 才允许后续协调任务更新 PNL-001～003。

## 十五、Git 与交付边界

| 仓库 | 本开发任务允许的变化 | 必须分别汇报 |
| --- | --- | --- |
| 根文档仓库 `main` | 只新增 01B；保留本批开始前已有 00C 表格对齐变化 | branch、HEAD、ahead / behind、原有改动、01B、staged / unstaged / untracked |
| 独立源码仓库 `LocalFirstTradingLedger/main` | 本文明确范围内的实现与正式测试 | branch、HEAD、ahead / behind、完整 diff、测试、commit / push 状态 |
| `LocalFirstTradingLedger-CS2026/` | 零读取扩展、零修改 | 明确未进入，不用旧状态冒充实时检查 |

不得把两个仓库的变更混成一个提交或一条 status。没有后续明确授权时，不暂存、不提交、不推送，也不创建分支。

## 十六、开发完成自检

- [ ] 页面先展示用户能理解的成交金额、实际手续费、总支出 / 净到账和净盈亏。
- [ ] `PNL-001～003` 均有生产实现与正式测试，不把目标写成当前事实。
- [ ] 固定 6500 / 5、2800 / 3 样例精确通过。
- [ ] 零费、多次买入、部分卖出、全部卖清、缺价、旧 USD、异币种 fee 均有证据。
- [ ] 新账本与新事实使用 USDT；旧 USD 未被静默改写。
- [ ] `1 USDT ≈ 1 USD` 披露存在，未接实时汇率。
- [ ] `Trade.totalValue` 仍是不含费成交金额，派生金额没有保存。
- [ ] 持仓表、摘要、交易列表与三张图口径一致。
- [ ] schema、FeeRule、平台字段、NLP、文件格式和保存链没有越界变化。
- [ ] 定向 / 全量 / typecheck / lint / build / whitespace / 虚构浏览器检查有完整结果。
- [ ] 只生成 01B，不执行 01C，不生成 01D，不回写 00B / 00D / 当前状态。
- [ ] 两个 Git 仓库分别核对并报告；无授权时没有 Git 写操作。
