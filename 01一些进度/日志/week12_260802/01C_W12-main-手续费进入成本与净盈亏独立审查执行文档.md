# Week 12 main PNL-001～003 手续费进入成本与净盈亏独立审查执行文档

日期：2026-08-10
状态：已执行；原 01D 据实判 `FAIL`；R1 修复与 01R1D 后最终独立结论为 `PASS`
正式源码：`01一些进度/产出/LocalFirstTradingLedger/`，必须保持受 Git 管理源码只读
固定候选：本次原审查对象为 `zhennn/w12-pnl-fee-accounting` / `1d8603f8747f64a5aff5fd94cefb8f96c01290e9`；本文其余内容保留为当时独立审查合同
审查目标：`PNL-001`、`PNL-002`、`PNL-003`
唯一输出：`01D_W12-main-手续费进入成本与净盈亏独立审查报告.md`

## 结论：独立审查必须证明的用户结果

独立审查者必须从冻结的 `zhennn/w12-pnl-fee-accounting` 功能分支候选重新证明：新建账本和新事实以 USDT 工作；`Trade.totalValue` 始终是不含手续费的成交金额；每笔实际买入费进入成本、实际卖出费从净到账和已实现盈亏扣除；交易列表、持仓表、摘要和三张图使用同一含费口径；旧版本 1 / USD 事实没有被改写；不能换算的非零异币种手续费被明确标为不可可靠计入，而不是按零或 USDT 猜算。

固定样例必须得到：

```text
买入 0.1 BTC：成交金额 6500 USDT，手续费 5 USDT
卖出 0.04 BTC：成交金额 2800 USDT，手续费 3 USDT

含费买入成本 = 6505 USDT
卖出移除成本 = 2602 USDT
卖出净到账 = 2797 USDT
已实现净盈亏 = 195 USDT
剩余成本 = 3903 USDT
```

本文不信任 01B 的完成声明、测试数字、截图或结论。独立审查必须自己读实现与正式测试、自己复跑正式质量门、自己使用虚构数据检查页面，并把所有证据写入唯一 01D。自动化通过、代码已提交到功能分支或将来合入 `main`，都不能代替独立验收。

## 一、独立审查硬合同

1. 先完整读取 [000](000_W12-规划文件关系与批次命名规则.md)、[00A](00A_W12-网页优先产品共识与架构边界.md)、[00B](00B_W12-总需求快照与待办清单.md)、[00C](00C_W12-main-网页与AI开发批次路线.md)、[00D](00D_W12-已知问题与验收缺口清单.md)、[当前开发状态](../00-当前开发状态.md)、[01A](01A_W12-main-手续费进入成本与净盈亏执行文档.md)、实际 01B 与 [源码 README](../../产出/LocalFirstTradingLedger/README.md)。
2. 01B 只是开发者陈述。每个“已实现”“测试通过”“没有越界”“未保存派生数据”都必须回到实际候选源码、diff、正式测试或独立页面证据核对。
3. 审查对象是开始时冻结的源码完整工作树，不是只看 HEAD，也不是只看 01B 所列文件。记录 staged、unstaged、untracked 和 ignored build artifact 的边界。
4. 正式源码、正式测试、package 文件和 Git index 保持只读。允许直接运行现有测试、typecheck、lint、build 和 production 页面；需要补充探针时，只能放在临时副本或系统临时目录，不能写回正式工作树。
5. 独立审查不得修源码、补正式测试、改断言、格式化候选、更新 README、回写 00B / 00D / 当前状态，也不得执行 01A 或生成新的开发报告。
6. 浏览器只使用专门新建的虚构 `.lftl` 和虚构版本 1 / USD fixture。不得打开、导入、覆盖或检查用户真实个人账本。
7. 不得暂存、提交、推送、建分支、merge、rebase、cherry-pick 或修改 `CS2026`。只允许在根文档仓库新增唯一 01D；是否提交 01D 等待用户另行授权。
8. 任一强制合同已有反证时判 `FAIL`，不能降级为普通建议；没有反证但关键证据不可得时判 `BLOCKED`，不能猜成 PASS。
9. Week 11 `02D = BLOCKED` 不阻塞本批虚构数据验收；它继续阻塞真实个人数据 Gate。01D 不得追溯改写 Week 11 02D，也不得因本批 PASS 宣称真实个人数据 Gate 已通过。
10. 只有本批 01D 最终为 `PASS`，后续协调任务才允许更新 00B 的 `PNL-001～003`。独立审查任务本身不更新 00B。

## 二、执行前冻结候选与独立性

### 2.1 两个 Git 仓库必须分别记录

| 范围 | 必须记录 |
| --- | --- |
| 根文档仓库 | 实际路径、branch、HEAD、status、staged / unstaged / untracked、相对 `origin/main` 远端跟踪引用的 ahead / behind、01A / 01B / 01C / 01D 状态 |
| 源码仓库 | 实际路径、branch、HEAD、status、staged / unstaged / untracked、完整 diff 文件表与统计、相对 `origin/main` 的 ahead / behind、候选总哈希或等价可复现身份 |
| 01B | 声称的起止 HEAD、文件范围、测试、浏览器结果、偏差、风险和 Git 状态 |

`zhennn/w12-pnl-fee-accounting` 是本次强制候选分支；`main` 必须仍停在本批起点且不得合并。源码工作树必须干净，审查者冻结并审查候选分支的完整 HEAD，不得只测基线 `main` 或丢掉 README 同步提交。

当前已知起点是源码 `main` / `279af4e3248c68306e857b8d0c8eeeaa03a29d6a`，当前候选是 `zhennn/w12-pnl-fee-accounting` / `1d8603f8747f64a5aff5fd94cefb8f96c01290e9`，相对 `origin/main` 为 `0/6`。真正审查时必须重新记录实时值，不能只复用本段快照。

### 2.2 漂移处理

- 如果实际分支不是 `zhennn/w12-pnl-fee-accounting`、路径不是产品 worktree、`main` 已被合并改写或候选范围无法确定，停止并判 `BLOCKED`。
- 如果 01B 之后存在无法解释的源码漂移，列出文件、mtime / hash / diff 证据，停止把 01B 当事实并判 `BLOCKED`；不得自行选择某个旧 commit 测试。
- 开始与结束分别记录正式源码候选身份。若审查操作造成 tracked / untracked 源文件漂移，01D 必须披露；在恢复明确只读前不得给 PASS。
- build 生成的 `.next` 等 ignored artifact 可以存在，但必须与候选源文件区分；不得把 build artifact 当源码差异或验收证据。

### 2.3 临时独立探针

正式测试已经覆盖本文件合同则优先复跑，不为了“显得独立”复制测试。若某个关键对抗场景只能用临时探针证明：

1. 使用临时目录或正式仓库的只读副本；
2. 不改 package lock、不安装额外生产依赖、不调用真实个人数据；
3. 01D 记录探针文件、覆盖场景、输入、输出、退出码和清理结果；
4. 临时探针只能补证据，不能替代缺失的正式回归测试。正式测试缺口本身必须作为 Finding 记录。

## 三、PASS、FAIL、BLOCKED 判定

| 结论 | 强制定义 |
| --- | --- |
| `PASS` | `PNL-001～003`、下列 M01～M20、定向测试、全量测试、全部质量门和虚构页面流程均有独立证据；没有强制失败、P0 / P1 或关键证据缺口；候选前后保持只读 |
| `FAIL` | 任一 PNL 目标或 M01～M20 强制合同有反证；正式测试 / typecheck / lint / build / whitespace 失败；或测试通过是通过删测、skip、只改断言迎合错误实现获得。即使另有环境阻塞，已有强制反证时仍优先 FAIL |
| `BLOCKED` | 尚无强制失败反证，但错误分支、无法冻结候选、候选漂移、真实 Chrome / picker 不可用或外部环境使关键证据无法取得，且没有等价确定性证据 |

Finding 等级：

- P0：账本事实被改写、派生金额被保存、错误净盈亏被当真、schema / 文件格式越界或候选被审查过程污染。
- P1：`PNL-001～003` 强制行为错误、异币种 fee 被静默按零 / USDT 计算、缺价伪造、旧 USD 不可读、Decimal / 全卖清错误、正式测试被削弱。
- P2：未直接触发强制失败但会使口径、可维护性或正式证据显著不足的问题。
- P3：文案、结构或低风险维护问题，不得用来掩盖 P0～P2。

任一 P0 / P1 必须 `FAIL`。P2 / P3 可以记录，但只有在不破坏强制通过线且证据完整时才不自动决定最终结果。

## 四、先独立阅读的源码与正式测试

至少重新阅读以下实际候选及对应正式测试，不得只看 diff：

### 4.1 模型、初始化与兼容

- [`src/models/types.ts`](../../产出/LocalFirstTradingLedger/src/models/types.ts)
- [`src/data/builtInAssets.ts`](../../产出/LocalFirstTradingLedger/src/data/builtInAssets.ts)
- [`src/state/initialLedgerData.ts`](../../产出/LocalFirstTradingLedger/src/state/initialLedgerData.ts)
- [`src/validators/tradeValidator.ts`](../../产出/LocalFirstTradingLedger/src/validators/tradeValidator.ts)
- [`src/validators/priceSnapshotValidator.ts`](../../产出/LocalFirstTradingLedger/src/validators/priceSnapshotValidator.ts)
- [`src/validators/ledgerDataValidator.ts`](../../产出/LocalFirstTradingLedger/src/validators/ledgerDataValidator.ts)
- `src/policies/ledgerFactPolicy.ts`、`ledgerImportPolicy.ts` 和受影响的 ResourcePolicy / backup validator

重点判断：schema 是否仍为 1；新建默认与旧数据读取是否分开；是否存在全局替换 USD、hydrate / normalize 静默迁移或新持久化字段。

### 4.2 交易、重放、价格与图表

- [`src/services/tradeService.ts`](../../产出/LocalFirstTradingLedger/src/services/tradeService.ts)
- `src/services/priceSnapshotService.ts`
- [`src/calculators/positionReplay.ts`](../../产出/LocalFirstTradingLedger/src/calculators/positionReplay.ts)
- [`src/calculators/positionCalculator.ts`](../../产出/LocalFirstTradingLedger/src/calculators/positionCalculator.ts)
- [`src/services/positionService.ts`](../../产出/LocalFirstTradingLedger/src/services/positionService.ts)
- [`src/services/priceSelectionService.ts`](../../产出/LocalFirstTradingLedger/src/services/priceSelectionService.ts)
- [`src/services/binancePriceRefreshService.ts`](../../产出/LocalFirstTradingLedger/src/services/binancePriceRefreshService.ts)
- [`src/services/chartDataService.ts`](../../产出/LocalFirstTradingLedger/src/services/chartDataService.ts)
- `src/utils/decimalMath.ts` 与 `src/components/charts/chartOptionBuilders.ts`

重点判断：金额公式是否只存在于受控 pure calculator / service；图表的 number 转换是否只用于绘制；FeeRule 是否完全未参与历史计算；价格缺失是否继续缺失。

### 4.3 页面

- [`TradeForm.tsx`](../../产出/LocalFirstTradingLedger/src/components/trades/TradeForm.tsx)
- [`PriceForm.tsx`](../../产出/LocalFirstTradingLedger/src/components/prices/PriceForm.tsx)
- [`DashboardShell.tsx`](../../产出/LocalFirstTradingLedger/src/components/dashboard/DashboardShell.tsx)
- [`ChartsOverview.tsx`](../../产出/LocalFirstTradingLedger/src/components/charts/ChartsOverview.tsx)
- `src/components/market-data/MarketDataControls.tsx`

重点判断：交易表单、交易列表、持仓表、摘要和三图是否消费同一派生口径；UI 是否另写浮点公式或第二份账本 state；旧 USD、混合 USD / USDT 和异币种手续费的披露是否就近出现。

### 4.4 正式测试

至少阅读并复跑实际存在的：

```text
src/data/builtInAssets.test.ts
src/validators/tradeValidator.test.ts
src/validators/priceSnapshotValidator.test.ts
src/validators/ledgerDataValidator.test.ts
src/services/tradeService.test.ts
src/services/priceSnapshotService.test.ts
src/calculators/positionReplay.test.ts（若候选新增）
src/calculators/positionCalculator.test.ts
src/services/positionService.test.ts
src/services/priceSelectionService.test.ts
src/services/binancePriceRefreshService.test.ts
src/services/chartDataService.test.ts
src/components/charts/chartOptionBuilders.test.ts
src/components/charts/ChartsOverview.test.tsx
src/components/dashboard/DashboardShell.test.ts
src/components/dashboard/DashboardShell.golden.test.tsx
src/components/dashboard/DashboardShell.interaction.test.tsx
```

还要抽查受影响的 ledger validator、backup、repository、`.lftl` 和 persistence 回归测试，确认版本 1 保存 / 恢复与派生不持久化。

## 五、PNL-001～003 独立目标核对

### 5.1 PNL-001：USDT 与成交金额

必须同时证明：

- 新 `createInitialLedgerData()` 的 BTC / ETH / ADA quoteCurrency 是 USDT，schemaVersion 仍为 1；
- TradeForm、PriceForm 和 Binance merge 在新账本写出 USDT 事实，实际 feeCurrency 与交易币种相同；
- 旧 USD 账本仍可读取和计算，但 TradeForm、PriceForm、production create service 与 Binance 刷新不能继续创建新 USD 金额事实；页面必须说明本批不迁移旧账、要新增 USDT 事实需新建账本；
- `Trade.totalValue` 在 Validator、service、页面、测试和序列化事实中仍等于 `quantity × price`，不包含 fee；
- 页面使用“成交金额（不含手续费）”，而不是继续用含义不明的“总金额”；
- 旧版本 1 / USD 账本加载、计算、备份恢复和再次保存后 USD 字段逐项不变；
- `1 USDT ≈ 1 USD` 披露存在，且没有接入实时汇率或伪称严格兑换。

### 5.2 PNL-002：实际手续费进入确定性重放

必须从代码与测试证明：

- 买入成本 = totalValue + 同币种实际 fee；
- 卖出净到账 = totalValue - 同币种实际 fee；
- 部分卖出按卖出前含费平均成本移除；
- 全卖清直接移除全部剩余成本并严格归零；
- 已实现净盈亏与未实现净盈亏分别使用净到账和剩余含费成本；
- 多次买入、零 fee、极小小数和重复卖出全部走 Decimal；
- 历史只读 Trade.fee，不读取 FeeRule，也不因为规则变化重算历史；
- 非零异币种 fee 不被当零、不被按 USDT / USD 猜算；相关 fee 敏感结果被明确标为不可靠，旧 Trade 仍原样可读。

### 5.3 PNL-003：页面、摘要与三图

必须独立核对：

- TradeForm 预览与交易表都显示成交金额、实际 fee、买入总支出 / 卖出净到账；
- 持仓表显示含费平均成本、剩余含费成本、已实现净盈亏、未实现净盈亏，不再出现“暂不计手续费”；
- 摘要至少显示累计买入总支出、累计卖出净到账、当前剩余含费成本、已实现净盈亏和有完整价格时的未实现净盈亏；
- 缺价、非支持估值币种或异币种 fee 会让相应合计明确不完整，不按零加入；
- 饼图仍按市场价值，不声称 fee 改变市值；历史成本线读取含费重放；热力图仍只数交易并能筛选新口径交易表；
- 所有显示使用同一派生 service / calculator，而不是组件各写一套公式。

## 六、二十项强制验收矩阵

01D 必须逐项写 `PASS` / `FAIL` / `BLOCKED`、源码证据、正式测试证据和页面证据；不能只给总判定。

| ID | 强制场景 | 独立通过线 |
| --- | --- | --- |
| `M01` | 固定 6500 / 5、2800 / 3 | 6505、2602、2797、195、3903 在重放、service / chart 和页面一致 |
| `M02` | 零手续费 | 买卖结果与无费旧算法一致，页面仍显示实际 fee 0，不依赖 FeeRule |
| `M03` | 多次买入平均含费成本 | 每笔买入 fee 分别入成本，平均成本 = 总含费成本 / 总数量 |
| `M04` | 部分卖出 | 只按卖出数量移除卖出前含费平均成本，剩余成本正确 |
| `M05` | 全部卖清 | 最后一笔直接移除全部剩余成本，quantity / averageCost / costBasis 严格为 `"0"`，无微小残值 |
| `M06` | 买入手续费 | fee 只增加买入成本与买入总支出，不改 Trade.totalValue |
| `M07` | 卖出手续费 | fee 从卖出净到账和已实现净盈亏扣除，不错误减少剩余成本 |
| `M08` | 未实现净盈亏 | 只等于合法当前市场价值减剩余含费成本 |
| `M09` | 缺少有效价格 | latestPrice / marketValue / unrealizedPnl 与摘要 / 图表相应值缺失；不用零、成交价、成本价或未来价冒充 |
| `M10` | 新账本和新事实 USDT | 新内置资产、Trade.currency、feeCurrency、手工 / Binance PriceSnapshot.currency 均为 USDT；schema 仍为 1 |
| `M11` | 旧 USD 事实 | 旧版本 1 / USD 账本读取、计算、恢复、保存后字段未静默改写；新增交易、价格和 Binance 刷新被明确停用而不是继续写 USD |
| `M12` | 近似披露 | 页面就近显示 `1 USDT ≈ 1 USD`，说明未接实时汇率；单笔事实显示实际币种 |
| `M13` | 不支持手续费币种 | 新写入拒绝非零异币种 fee；旧事实原样可读，相关净结果明确不可可靠计算；无按零或 USDT 换算 |
| `M14` | 页面口径一致 | 交易列表、持仓表、摘要、饼图、历史线和热力图没有相互矛盾的金额 / 币种 / 缺口文案 |
| `M15` | 派生金额不保存 | 总支出、净到账、成本、P&L、summary、Position、chart 和 fee issue 不进入 LedgerData、`.lftl`、IndexedDB connection 或备份 |
| `M16` | totalValue 合同 | 正式 Trade.totalValue 始终等于不含费成交金额；Validator 容差比较不把 fee 加入乘积 |
| `M17` | Decimal 精度与舍入 | 业务计算只用 decimal.js；极小数、重复分摊和最后卖清稳定；ECharts number 只在绘制边界使用 |
| `M18` | 既有回归 | 时间线排序、超卖保护、未来事实、价格选择、Binance 失败保旧价、文件保存、锁定、恢复和重挂载不退化 |
| `M19` | 防越界 | 没有 schema / `.lftl` / BackupEnvelope / IndexedDB 格式变化，没有 FeeRule、固定 / 百分比规则、NLP、平台字段、编辑或整体 UI 重构 |
| `M20` | 正式测试真实性 | 测试新增有效场景，不通过删除 / skip、放宽精确结果、批量替换 USD 断言或 mock 掉真实重放来迎合错误实现 |

## 七、定向正式测试与完整质量门

### 7.1 定向测试

按实际候选文件存在情况，至少运行覆盖下列组的正式测试：

```bash
npm test -- src/data/builtInAssets.test.ts src/validators/tradeValidator.test.ts src/validators/priceSnapshotValidator.test.ts src/validators/ledgerDataValidator.test.ts src/services/tradeService.test.ts src/services/priceSnapshotService.test.ts
npm test -- src/calculators/positionReplay.test.ts src/calculators/positionCalculator.test.ts src/services/positionService.test.ts
npm test -- src/services/priceSelectionService.test.ts src/services/binancePriceRefreshService.test.ts src/services/chartDataService.test.ts
npm test -- src/components/charts/chartOptionBuilders.test.ts src/components/charts/ChartsOverview.test.tsx src/components/dashboard/DashboardShell.test.ts src/components/dashboard/DashboardShell.golden.test.tsx src/components/dashboard/DashboardShell.interaction.test.tsx
```

如果候选没有新增 `positionReplay.test.ts`，不能机械执行不存在路径；应记录缺失并确认等价正式测试是否真正覆盖纯重放。缺少固定样例、全卖清、异币种 fee 或旧 USD 兼容的永久正式测试，至少记 P1 / P2，并按是否触发强制证据缺口决定 FAIL。

再定向复跑受实际 diff 影响的 backup、ledger validator、repository、file adapter、persistence 和 import 测试。01D 记录实际命令、退出码、文件数、测试数、失败详情和任何 skip。

### 7.2 完整质量门

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

要求：

- 全量测试必须完整运行，不接受只跑 changed tests 或缓存摘要。
- `git diff --check` 之外，对源码仓库与根文档仓库的全部未跟踪候选文件逐个执行等价 whitespace 检查。
- 扫描 `.only`、`.skip`、`debugger`、意外 `console.log` / `console.debug`、业务层 `Number` / `parseFloat` / 原生浮点金额公式和新 FeeRule 调用。
- typecheck、lint、build 任一非零、warning 超过配置、测试失败 / skip 或 whitespace 错误都为强制 FAIL。
- 01B 的旧测试数字只能列在对照栏；01D 报告独立实际数字。

## 八、正式测试质量审查

不能因为测试通过就直接判实现正确。独立审查至少检查：

1. 固定样例是否断言精确金额，而不是只断言函数不抛错或页面包含任意数字。
2. totalValue 与 fee 是否分别构造，避免 fixture 把 6505 错塞进 totalValue 后仍“通过”。
3. 卖出 fee 是否真的影响净到账和 realizedPnl，而不是只显示文案。
4. 全卖清是否用能产生分摊小数的样例证明严格归零。
5. 旧 USD fixture 是否与新 USDT fixture 并存，而不是把所有旧 fixture 批量改成 USDT 后失去兼容证据。
6. 异币种 fee 测试是否证明“保留事实 + 不给伪净值”，而不是允许后默默忽略。
7. 缺价是否检查字段缺失和图表断点，不是把 `0` 当合法期望。
8. 页面测试是否经过真实 TradeForm / Dashboard / service 链，而不是只 mock Position 返回值。
9. 保存回归是否检查序列化原始 LedgerData，不只是 TypeScript 类型上看不到派生字段。
10. 三图测试是否分别证明：饼图市值不变、成本线含费、热力图计数不变。

发现正式测试只是修改断言来迎合错误实现，或删掉旧安全 / 回归场景，直接按 M20 判 FAIL。

## 九、只用虚构数据的页面核对

### 9.1 环境与数据边界

- 使用 production build、真实 Google Chrome、loopback 地址和专门新建的虚构 `.lftl`。
- 文件名明确标记 `W12-PNL-REVIEW-FAKE`，不得选择任何已有个人文件。
- 旧 USD 与异币种 fee 场景使用审查者在临时目录创建的最小虚构版本 1 fixture / 备份；不写入正式源码或测试目录。
- 记录浏览器版本、视口、候选 HEAD / diff 身份、文件创建与清理结果。

### 9.2 页面步骤

1. 新建虚构账本，确认内置资产、新 Trade、手工 price 与 feeCurrency 为 USDT；原始 schema 仍为 1。
2. 录入固定买入：0.1 BTC、均价 65000、成交金额 6500、fee 5；检查表单预览 6505、交易表和持仓 / 摘要。
3. 录入固定卖出：0.04 BTC、均价 70000、成交金额 2800、fee 3；检查净到账 2797、移除成本 2602、realized 195、remaining cost 3903。
4. 输入合法当前价，例如 70000 USDT；检查剩余市值 4200、未实现净盈亏 297。删除 / 缺失价格时，相关值必须变成缺失而非 0 或成交价。
5. 用虚构 ETH / ADA 覆盖零 fee、两次买入、部分卖出和最后全部卖清；检查成本严格归零。
6. 查看交易表、持仓表、摘要、饼图、历史成本线和热力图；点击热力图筛选后仍显示 fee / 现金影响；检查 `1 USDT ≈ 1 USD` 披露。
7. 打开虚构旧 USD 版本 1 fixture，核对旧事实仍是 USD、同币种 fee 进入净结果、保存 / 重开后没有被改为 USDT；确认新增交易、手工价格和 Binance 刷新被明确阻止，并提示新建 USDT 账本。
8. 打开虚构非零异币种 fee fixture，核对原始 fee / feeCurrency 可见，相关成本 / 净盈亏明确不可可靠计算，页面没有伪造换算或按零给出“净”结果。
9. 锁定并重开虚构 `.lftl`，必要时导出虚构明文备份；检查原始 JSON / 解密 LedgerData 只含事实，不含总支出、净到账、Position、summary、chart 或 fee issue。
10. 在 390×844 与 1280 宽度检查页面级无横向溢出、宽表局部滚动、三图存在；控制台 0 error。

真实 Chrome / 系统 picker 不可用且没有等价关键证据时记 `BLOCKED`。内置 Chromium、jsdom、01B 截图或执行者口述只能补充，不能替代本节用户级证据。若前面已出现强制 FAIL，则最终仍为 FAIL，不因浏览器阻塞改成 BLOCKED。

## 十、派生不保存与回归核对

独立审查必须在代码、测试和虚构文件三层确认：

- `LedgerData` 仍只有 `schemaVersion`、assets、trades、priceSnapshots、feeRules；
- Trade 仍保存 `totalValue`、fee、feeCurrency 等事实，不保存 cash impact 或 P&L；
- `.lftl`、BackupEnvelopeV1、legacy IndexedDB 数据和 connection record 格式未因本批改变；
- Position、summary、chart、selected price、fee issue 都只在运行时派生；
- 保存、close、readback、解密、Validator、恢复、clear、revision、双代和锁定代码没有本批无关修改；
- 旧 USD 读取后的下一次保存没有发生静默迁移。

既有 `02D BLOCKED` 证据缺口只需按 [00D](00D_W12-已知问题与验收缺口清单.md) 快速复核没有被本批错误宣称关闭。本批不要求重做 Week 11 真实 picker / 双标签 / raw IndexedDB Gate，也不能用 01D 替代它。

## 十一、防越界扫描

审查完整 diff 和源码搜索，确认没有：

- `schemaVersion: 2`、新 `.lftl` formatVersion、BackupEnvelope 新版本或旧入口退役；
- FeeRule 固定费 / 百分比实现、规则页面、规则匹配或历史 fee 推测；
- Trade 平台字段、交易编辑、NLP / Python / Ollama / Agent / Notebook；
- 保存链、文件选择、IndexedDB connection、加密、KDF、clear、恢复或 legacy 迁移的无关行为改动；
- 复制到 `CS2026`、整体 Dashboard 重排、依赖升级或无关格式化；
- 在 UI、图表或 reducer 中复制金额公式；
- 用实时汇率、网络换算或固定 1:1 值改写原始事实。

发现任何一项，按实际影响判 P0 / P1，并检查是否直接触发 M15 / M19 FAIL。

## 十二、01D 唯一输出合同

无论最终结果如何，只生成：

```text
01D_W12-main-手续费进入成本与净盈亏独立审查报告.md
```

01D 至少包含：

1. 第一屏给出唯一最终判定：`PASS`、`FAIL` 或 `BLOCKED`。
2. 审查对象身份：两个仓库的路径、branch、HEAD、ahead / behind、staged / unstaged / untracked、源码完整 diff / 候选哈希、开始与结束快照。
3. 01B 陈述逐项对照：已独立确认、与现场不一致、无法确认。
4. `PNL-001～003` 逐项目证据，不用开发者结论代替。
5. M01～M20 完整矩阵，每项写源码、正式测试、页面证据和结果。
6. 定向测试、全量测试、typecheck、lint、production build、whitespace、debug / skip 扫描的命令、退出码、文件数、测试数、warning / error。
7. 虚构浏览器流程、Chrome / picker 环境、视口、控制台、文件 / 备份检查与清理结果。
8. 正式测试质量审查：新增覆盖、旧回归是否保留、是否存在只改断言迎合实现。
9. PASS 项、FAIL 项和 BLOCKED 项分开列出；Findings 按 P0～P3 排序并给文件 / 行号 / 复现步骤。
10. schema、文件格式、FeeRule、平台字段、NLP、保存链、派生不保存和 `CS2026` 防越界结论。
11. 明确 `02D BLOCKED` 的历史边界：本批不追溯改写，不宣称真实个人数据 Gate 通过。
12. 明确没有修改正式源码 / 测试、没有执行 Git 写操作、没有回写 00B / 00D / 当前状态；分别报告根文档与源码仓库最终 status。

01D 的后续含义：

- `PASS`：只允许后续协调任务更新 00B 的 `PNL-001～003`；01D 自身不回写、不提交。
- `FAIL`：00B 保持未完成；列出最小阻塞 Finding，等待另行生成修复 NNA / NNC。
- `BLOCKED`：00B 保持未完成；保留已取得证据，写清解除阻塞所需最小外部条件。

## 十三、执行完成线

- [ ] 已冻结并复核实际 `zhennn/w12-pnl-fee-accounting` 候选完整 HEAD，不只看 `main` 或 01B。
- [ ] 正式源码与正式测试全程只读；候选开始 / 结束身份一致。
- [ ] 已独立阅读金额、币种、重放、价格、图表、页面和持久化边界。
- [ ] `PNL-001～003` 与 M01～M20 都有明确证据和单项结果。
- [ ] 固定样例、零费、多买、部分卖、卖清、缺价、旧 USD、异币种 fee 和 Decimal 边界均已独立验证。
- [ ] 交易列表、持仓表、摘要和三张图口径一致，派生金额未保存。
- [ ] 定向、全量、typecheck、lint、build、whitespace 和测试质量审查完成。
- [ ] 真实 Google Chrome 只使用虚构数据；没有接触真实个人账本。
- [ ] 没有越界实现版本 2、FeeRule、平台、NLP、文件格式或 UI 重构。
- [ ] 已生成唯一 01D，并且最终判定只有 PASS / FAIL / BLOCKED 之一。
- [ ] 没有回写 00B / 00D / 当前状态，没有暂存、提交或推送。

本文被执行并生成 01D 之前，`PNL-001～003` 继续保持未完成。01D 即使 PASS，也不能关闭 `W12-EVID-001` 或改写 Week 11 `02D BLOCKED`；它只决定 Week 12 `main` 产品轨道第 01 批的未合并含费 P&L 候选是否通过独立审查。
