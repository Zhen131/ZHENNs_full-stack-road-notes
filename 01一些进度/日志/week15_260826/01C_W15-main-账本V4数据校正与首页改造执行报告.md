# 01C_W15-main｜账本 V4 数据校正与首页改造执行报告

- 日期：2026-08-28
- 轨道：长期账本产品 `main`
- 源码分支：`zhennn/w15-main-v4-display-home`
- 分支起点：`main@9b8fed78ebb4aef0b7dd5f139f5320d4b0a0ae9b`
- 最终 HEAD：`755fdaba84fe1db0d509c24c98db6a6f20239e65`
- 执行依据：`01A_W15-main-账本V4数据校正与首页改造产品定义.md`、`01B_W15-main-账本V4数据校正与首页改造执行文档.md`、后置已确认决策 `000_W15-账本版本分层与迁移策略决策记录.md`

## 结论

Week 15 第一批三个阶段已按顺序完成。23 条测试合同全部 `PASS`，其中 T1-10 按后置已确认的 `000_W15` 版本分层修订口径执行；最终全量自动化为 92 个测试文件、1081 项测试全部通过，typecheck、lint、production build 与 `git diff --check` 通过；真实 Google Chrome 四项手工确认全部通过。

本结论为开发执行候选 `PASS`，不等于独立验收通过。源码分支未合并、未推送，最终停在 `755fdab`，工作树 clean。

## 一、分支、阶段提交与实际改动文件

### 1. 阶段一：V4 数据模型

主提交：`10ca0fe98fbb15214dae452fce147894128c5a56 feat: implement V4 asset transfer accounting`，共 85 个文件。

- 模块与说明：`src/README.md`
- `src/app/`：`DashboardShell.interaction.test.tsx`、`DashboardShell.test.ts`、`DashboardShell.tsx`、`HomeWorkspace.test.tsx`、`LedgerAccessGate.test.tsx`、`LedgerAccessGate.tsx`、`RecordWorkspace.test.tsx`、`RecordWorkspace.tsx`、`ledgerFileAccessController.test.ts`、`usePersistentLedger.fileImport.test.tsx`、`usePersistentLedger.test.tsx`、`usePersistentLedger.ts`、`week14V3Regression.test.ts`
- `src/core/calculations/`：`cashReplay.test.ts`、`cashReplay.ts`、`positionCalculator.ts`、`positionReplay.test.ts`、`positionReplay.ts`
- `src/core/models/`：`index.ts`、`types.ts`
- `src/core/policies/`：`ledgerFactPolicy.ts`、`ledgerImportPolicy.ts`、`ledgerPolicies.test.ts`
- `src/core/state/`：`initialLedgerData.ts`、`ledgerReducer.test.ts`、`ledgerReducer.ts`
- `src/core/validation/`：`ledgerDataValidator.test.ts`、`ledgerDataValidator.ts`、`priceSnapshotValidator.test.ts`、`priceSnapshotValidator.ts`、`resourcePolicy.test.ts`、`resourcePolicy.ts`、`tradeValidator.test.ts`、`tradeValidator.ts`
- `src/features/asset-transfers/`：`AssetTransferPanel.test.tsx`、`AssetTransferPanel.tsx`、`assetTransferService.test.ts`、`assetTransferService.ts`、`index.ts`、`ui.ts`
- `src/features/assets/`：`LocalAssetManager.tsx`、`assetService.test.ts`、`assetService.ts`
- `src/features/backup/`：`BackupControls.test.tsx`、`BackupControls.tsx`、`backupDownload.test.ts`、`backupDownload.ts`、`backupEnvelope.test.ts`、`backupEnvelope.ts`、`backupImportPreflight.test.ts`、`backupImportPreflight.ts`、`backupImportReport.test.ts`、`backupImportReport.ts`
- `src/features/cash/`：`cashEventService.test.ts`、`cashEventService.ts`
- `src/features/charts/`：`chartDataService.test.ts`、`chartDataService.ts`
- `src/features/fees/`：`FeeRuleManager.test.tsx`、`FeeRuleManager.tsx`
- `src/features/market-data/`：`binancePriceRefreshService.test.ts`、`binancePriceRefreshService.ts`
- `src/features/portfolio/`：`HoldingsDetails.tsx`、`HoldingsOverview.test.tsx`、`positionService.test.ts`、`positionService.ts`
- `src/features/prices/`：`priceSnapshotService.test.ts`、`priceSnapshotService.ts`
- `src/features/trades/`：`tradeRemovalService.test.ts`、`tradeRemovalService.ts`、`tradeService.test.ts`、`tradeService.ts`
- `src/platform/files/`：`ledgerFileContract.test.ts`、`ledgerFileContract.ts`、`ledgerFileCrypto.test.ts`、`ledgerFileCrypto.ts`、`ledgerFileRepository.test.ts`、`ledgerFileRepository.ts`
- `src/test-support/`：`fixtures.ts`、`sourceLayout.test.ts`
- 旧导入回归夹具：`test-fixtures/w11-b-import/invalid-trade-147.backup.json`、`preflight-errors-and-duplicates.backup.json`、`report-1001.backup.json`、`suspicions-only.backup.json`、`valid-300.backup.json`

版本分层决策修正提交：`80bb92d16ac3113e3f2623da6ec593ecc91239f8 fix: separate backup and ledger schema versions`，共 18 个文件。

- `src/app/`：`usePersistentLedger.fileImport.test.tsx`、`week14V3Regression.test.ts`
- `src/core/policies/ledgerPolicies.test.ts`
- `src/features/backup/`：`BackupControls.test.tsx`、`backupDownload.test.ts`、`backupDownload.ts`、`backupEnvelope.test.ts`、`backupEnvelope.ts`、`backupImportPreflight.test.ts`、`backupImportPreflight.ts`、`backupImportReport.test.ts`、`goldenBackupFixture.test.ts`
- 黄金样例：`test-fixtures/golden/golden-backup-format-v3-ledger-schema-v4.json`
- 旧导入回归夹具：`test-fixtures/w11-b-import/invalid-trade-147.backup.json`、`preflight-errors-and-duplicates.backup.json`、`report-1001.backup.json`、`suspicions-only.backup.json`、`valid-300.backup.json`

实现结果：`LedgerData.schemaVersion = 4`，新增 `assetTransfers`、三位置数量与 `giftIncome`；交易与转入转出复用 `compareCashReplayCandidates` 的比较顺序合并重放；币本位 `networkFee` 扣减数量并将对应成本转为已实现亏损；`external-in` 与 `gain` 按到账单价进入成本；四类资产转移不影响 USDT 现金。根据后置已确认的版本分层决策，B 信封保持 `backupFormatVersion = 3`，只将 `ledgerSchemaVersion` 升为 4，并冻结全虚构黄金样例。

### 2. 阶段二：显示格式化

提交：`45701d441dadc421b9a896a4d8a585326a75a0e7 feat: format ledger values at display boundaries`，共 36 个文件。

- `src/app/`：`DashboardShell.golden.test.tsx`、`DashboardShell.interaction.test.tsx`、`DashboardShell.test.ts`、`DashboardShell.tsx`、`HomeWorkspace.test.tsx`、`HomeWorkspace.tsx`、`TransactionsWorkspace.test.tsx`
- `src/features/activity/ActivityTable.tsx`
- `src/features/asset-transfers/`：`AssetTransferPanel.test.tsx`、`AssetTransferPanel.tsx`
- `src/features/assets/`：`LocalAssetManager.test.tsx`、`LocalAssetManager.tsx`
- `src/features/backup/`：`BackupControls.test.tsx`、`BackupControls.tsx`
- `src/features/cash/`：`CashEventPanel.test.tsx`、`CashEventPanel.tsx`、`NegativeCashConfirmationDialog.tsx`
- `src/features/charts/`：`ChartsOverview.test.tsx`、`HoldingAllocationChart.tsx`、`chartOptionBuilders.test.ts`、`chartOptionBuilders.ts`
- `src/features/fees/FeeRuleManager.tsx`
- `src/features/market-data/MarketDataControls.tsx`
- `src/features/portfolio/`：`HoldingsDetails.tsx`、`HoldingsOverview.test.tsx`、`HoldingsOverview.tsx`
- `src/features/trades/`：`TradeForm.test.tsx`、`TradeForm.tsx`、`TradeTable.test.tsx`、`TradeTable.tsx`
- `src/test-support/ledgerNumberDisplayBoundary.test.ts`
- `src/ui/`：`LedgerNumber.test.tsx`、`LedgerNumber.tsx`、`formatLedgerNumber.test.ts`、`formatLedgerNumber.ts`、`index.ts`

实现结果：新增统一 `formatMoney`、`formatQuantity`、`formatPercent` 与 `LedgerNumber`；精度决策使用 `decimal.js` 的 `.e` 属性，未使用 `Math.log10`；仅在渲染边界格式化，原始 `DecimalString` 通过 `title` 与 `aria-label` 保留，表单输入、计算、保存、导出与重新导入不变。

### 3. 阶段三：首页布局、持仓成本与三项界面修整

提交：`1e4e3dff52833972131ff20f2520eedca4120ab3 feat: redesign home portfolio insights`，共 12 个文件。

- `src/app/`：`HomeWorkspace.test.tsx`、`HomeWorkspace.tsx`
- `src/features/charts/`：`TradeHeatmapChart.test.tsx`、`TradeHeatmapChart.tsx`、`chartDataService.test.ts`、`chartDataService.ts`、`chartOptionBuilders.test.ts`、`chartOptionBuilders.ts`
- `src/features/portfolio/`：`HoldingsOverview.test.tsx`、`HoldingsOverview.tsx`、`pnlSummaryService.test.ts`、`pnlSummaryService.ts`

实现结果：首页改为四行；持仓成本区展示前五和八列，现金单独成行，累计总花费与剩余持仓成本分离；低于 2% 的扇区合并为“其他”，总扇区不超过 8；ECharts tooltip 挂到 `body` 且不使用 `confine`；首页热力图移除固定最大宽度。

### 4. 候选证据、Chrome 发现与收尾提交

| 提交 | 实际改动文件 | 结果 |
| --- | --- | --- |
| `0cd065281261871d0178d075428b5d1f593a4192 docs: record Week 15 V4 candidate evidence` | `README.md` | 记录三阶段与版本分层的候选证据 |
| `99bea69f505960f69866d4b720be85876de9bf7b fix: support native lftl pickers on macOS` | `src/platform/files/ledgerFileHandleAdapter.ts`、`src/platform/files/ledgerFileHandleAdapter.test.ts` | 真实 Chrome 发现 macOS 将 `.lftl` 识别为通用二进制文件；picker MIME 提示改为 `application/octet-stream`，`.lftl` 后缀守卫、Save/Open 边界、读写与安全流程不变 |
| `755fdaba84fe1db0d509c24c98db6a6f20239e65 docs: record Week 15 Chrome acceptance` | `README.md` | 把最终自动门、Chrome 四项与 picker 修复如实回写候选状态 |

## 二、三份测试合同逐条结果

### 1. 阶段一 T1-01～T1-12

| 编号 | 结果 | 实际证据 |
| --- | --- | --- |
| T1-01 | PASS | 无手续费 `internal` 后，总数量与平均购价逐字符不变，`exchange` 与 `cold-wallet` 数量此消彼长。`positionReplay.test.ts` 专项用例通过。 |
| T1-02 | PASS | 带币本位手续费的 `internal` 扣减 `quantity + networkFee`，目的位置只增 `quantity`，总数量减手续费，对应成本进入已实现亏损。 |
| T1-03 | PASS | 固定虚构样例得到总量 `150`、剩余成本 `1200`、均价 `8`，逐字段断言通过。 |
| T1-04 | PASS | 固定虚构 `external-out` 样例得到总量 `80`、剩余成本 `800`、已实现盈亏减少 `200`。 |
| T1-05 | PASS | `gain` 固定样例得到总量 `150`、剩余成本 `1200`、均价 `8`、`giftIncome = 200`；测试另外断言结果不是零成本算法的 `6.6667`。 |
| T1-06 | PASS | `cashReplay.test.ts` 将四类 `assetTransfers` 逐类放入虚构账本，USDT 现金结果逐字符不变。 |
| T1-07 | PASS | `internal`、`external-out` 在 `quantity + networkFee` 超过总持仓或来源位置数量时均明确拒绝。 |
| T1-08 | PASS | 卖出时 `exchange` 不足即拒绝，即使其他位置使总持仓足够也不放行。`positionReplay.test.ts` 与 `tradeService.test.ts` 均有回归。 |
| T1-09 | PASS | 类别与 `fromLocation`、`toLocation`、`unitPrice`、`networkFee` 的四行组合规则均有缺失／多余／同位置拒绝用例；六种 `reason` 各有一条与错误 `category` 组合的拒绝用例。 |
| T1-10 | PASS | 按 `000_W15` 修订后的版本分层：当前 B 为 `backupFormatVersion = 3` + `ledgerSchemaVersion = 4`；旧 ledger schema V3/V2 B 与 backup format V2 明确拒绝。V3 `.lftl` 在密码、KDF 和解密前拒绝，内存文件测试断言零写入，页面测试继续走通新建 V4 与导入入口；真实 Chrome 另行验证原文件哈希、inode 与字节数不变。 |
| T1-11 | PASS | 交易与转移两个输入数组打乱后，重放结果逐字段等于已排序输入；不比较两个数组的下标。 |
| T1-12 | PASS | 空持仓、全量消耗与仅转移事实等情况下，`locationQuantities` 始终同时含三个 key，无持仓时均为 `"0"`。 |

### 2. 阶段二 T2-01～T2-05

| 编号 | 结果 | 实际证据 |
| --- | --- | --- |
| T2-01 | PASS | `formatLedgerNumber.test.ts` 逐行覆盖 2.3 的 18 个效果通过线，18/18 命中；同时补了十进制指数边界、12 位上限和 `ROUND_HALF_UP` 回归。 |
| T2-02 | PASS | `ledgerNumberDisplayBoundary.test.ts` 完成保存、重开、导出、重新导入闭环，现金、转移数量与到账单价均逐字符不变；交易与资产转移表单另有原字符保留回归。 |
| T2-03 | PASS | `TradeForm.test.tsx`、`AssetTransferPanel.test.tsx` 与 `LedgerNumber.test.tsx` 分别覆盖受控输入、草稿与保存参数不被只读格式化改写。 |
| T2-04 | PASS | `LedgerNumber.test.tsx` 对 money、quantity、percent 逐类断言可见文本已格式化，`title` 与 `aria-label` 均等于未格式化原值。 |
| T2-05 | PASS | TypeScript AST 守卫扫描 `src/app` 与 `src/features` 的全部非测试 TSX，只读 JSX 直接插值 `DecimalString` 违规数为 0；反向 sentinel 证明守卫能捕获违规。 |

T2-01 的 18 个实际结果如下：

| 函数 | 输入 | 实际输出 | 结果 |
| --- | --- | --- | --- |
| money | `594.862375883946480045` | `594.86` | PASS |
| money | `6492.3391` | `6,492.34` | PASS |
| money | `0.0003` | `0.0003` | PASS |
| money | `0.5` | `0.50` | PASS |
| money | `0` | `0.00` | PASS |
| money | `94288.5` | `94,288.50` | PASS |
| money | `0.6134` | `0.6134` | PASS |
| money | `0.000000134` | `0.000000134` | PASS |
| money | `-1234.5678` | `-1,234.57` | PASS |
| quantity | `0.03619818` | `0.03619818` | PASS |
| quantity | `0.6177` | `0.6177` | PASS |
| quantity | `4818.72` | `4,818.72` | PASS |
| quantity | `6638.73487823` | `6,638.7349` | PASS |
| quantity | `300` | `300` | PASS |
| quantity | `0` | `0` | PASS |
| percent | `-0.1814` | `-18.14%` | PASS |
| percent | `0.0679` | `+6.79%` | PASS |
| percent | `0` | `0.00%` | PASS |

### 3. 阶段三 T3-01～T3-06

| 编号 | 结果 | 实际证据 |
| --- | --- | --- |
| T3-01 | PASS | `HoldingsOverview.test.tsx` 固定虚构账本的币种、当前价格、平均购价、涨跌幅、盈亏金额、持仓量、总花费、当前市值八列数值全部正确。 |
| T3-02 | PASS | 涨跌幅使用十进制运算；涨绿跌红；`averageCost = 0` 时不除零、不抛错，显示“不可计算”。 |
| T3-03 | PASS | 有卖出的虚构样例中，历史累计买入总花费与剩余持仓成本数值不同，两个口径未互相替代。 |
| T3-04 | PASS | 复用 `getTopMarketValuePositions(positions, 5)`，按市值降序取前五；缺价资产不进入排名并单独提示。 |
| T3-05 | PASS | 占比严格低于 2% 的资产（包含正现金参与情况）合并进“其他”，正好 2% 不合并；合并前后总市值逐字符相同。 |
| T3-06 | PASS | 超过上限时保留前七并把其余折入“其他”，最终扇区总数不超过 8。 |

## 三、统一自动质量门

`99bea69` 是最后一笔产品源码／测试改动。修复 macOS picker 后重新执行完整质量门，随后又在已提交的同一代码树上复跑一次。`755fdab` 仅更新 README 的已完成证据，没有改动源码、测试、配置或夹具。

| 质量门 | 实际命令 | 实际结果 | 结论 |
| --- | --- | --- | --- |
| 定向 picker 回归 | `npm test -- src/platform/files/ledgerFileHandleAdapter.test.ts` | 1 个文件，22 项测试通过 | PASS |
| 全量测试 | `npm test` | 92 个测试文件，1081 项测试全部通过；最终复跑耗时 12.52 s | PASS |
| 类型检查 | `npm run typecheck` | `tsc --noEmit`，0 error | PASS |
| 静态检查 | `npm run lint` | `eslint . --max-warnings=0`，0 warning / 0 error | PASS |
| production build | `npm run build` | Next.js 15.5.22 编译成功，类型检查成功，5/5 静态页生成，`/` 与 `/_not-found` 路由输出正常 | PASS |
| 差异检查 | `git diff --check` | 无输出 | PASS |
| 源码收尾 | `git status --short --branch` | 停在 `zhennn/w15-main-v4-display-home@755fdab`，工作树 clean | PASS |

## 四、真实 Chrome 四项手工确认

环境：真实 Google Chrome，production build 由本机 `127.0.0.1` 提供，`.lftl` 全部通过 macOS 原生 Open/Save picker 选择。仅使用全虚构 V3/V4 验收文件和虚构密码，没有生成、导入或打开任何真实账本。

| Chrome 项目 | 实际结果 | 结论 |
| --- | --- | --- |
| 1. 饼图提示框完整显示在卡片之外 | 虚构分配饼图卡片矩形为 `x=929.48, y=404, width=307.5, height=250`；“其他” tooltip 为 `x=822, y=257, width=239.14, height=190`，顶部和左侧均越出卡片，`z-index=9999999`，文本完整，未被 `overflow` 裁切 | PASS |
| 2. 小额币合并为“其他”且悬停展开 | 10 个虚构正资产绘制为 7 个几何扇区；悬停“其他”完整展示 `ETA`、`THA`、`IOT`、`KAP` 及各自虚构金额，并显示“小额资产合并”来源 | PASS |
| 3. 首页热力图填满整行 | 首页区域与热力图卡片宽度均为 1000 px；内边距后网格宽 966 px，365 个日格跨满 53 列，最左 `x=254`、最右边界 `x=1220`，无原有固定最大宽度造成的大片留白 | PASS |
| 4. V3 `.lftl` 明确拒绝且可继续新建 | 打开虚构 V3 时页面显示：“该文件承载 V3、其他旧版或未知 schema 的账本；当前 V4 不兼容且不提供迁移。已在密码、KDF 和解密前停止；原文件未被写入、删除或覆盖。你仍可新建 V4 账本。”页面未崩溃，文件 SHA-256、inode 与 size 拒绝前后不变；随后新建 V4 成功进入 Dashboard，再进入“导入与导出”工作区 | PASS |

Chrome 额外证据：完整虚构 V4 经产品链路 `parseBackupJson → LedgerFileRepository.create/load → open/load` 生成与复读，外壳为 `fileFormatVersion=2`、`cryptoVersion=1`、`current.ledgerSchemaVersion=4`、`previous=null`；Chrome 页面显示“加密文件已连接”。检查期间页面控制台为 0 warning / 0 error，验收结束后已锁定虚构账本并停止 production server。

## 五、与 01A／01B 不一致之处与处理

发现一处已被后置产品决策明确修正的版本绑定：

- `01A` 第十一节把明文导入导出称为 `BackupEnvelope V4`；`01B` 1.5 也要求把 `BACKUP_FORMAT_VERSION` 升为 4。
- 2026-08-27 已确认且长期有效的 `000_W15-账本版本分层与迁移策略决策记录.md` 明确四个版本号独立演进，并在第七节专门修正本批：B 的五键信封结构未变，所以 `backupFormatVersion` 保持 3，只升 `ledgerSchemaVersion` 至 4。
- 执行时没有自行取舍：依后置已确认决策实施 `backupFormatVersion = 3` + `ledgerSchemaVersion = 4`，新增并冻结全虚构黄金 B 样例，将低 ledger schema 与低 backup format 分开拒绝和测试。源码修正提交为 `80bb92d`。

除此处已确认修正外，没有发现其他需要自行取舍的 01A 产品决定冲突。

## 六、执行中发现的问题与最终状态

以下为中途真实出现、但已在最终质量门前修复或隔离的问题，不隐藏为“大部分通过”：

- 黄金样例首次针对性测试暴露 canonical key order 不符合冻结合同；修正样例键序后通过。
- 版本分层修正后首次 typecheck 暴露测试代码的类型缩小错误；修正测试后通过。
- 低 ledger schema 元数据的原测试假设与四版本分层决策冲突；改为分层拒绝用例后，全量数由 1079 增至 1081 并通过。
- 早期一次全量运行中 `cryptoEncoding` 大载荷用例在 15 s 超时；隔离复跑与最终两轮全量均通过，未通过放宽精度或删测规避。
- 并行工作时有一次 build 因共享 `.next` 产物竞争失败；无并发的最终 production build 通过。
- 真实 Chrome 首轮原生 picker 发现 `application/json` 会让 macOS 上的 `.lftl` 变为不可选。这是产品问题，以 `99bea69` 最小修复，随后重跑 22 项定向测试、1081 项全量测试、typecheck、lint、build 与 Chrome 四项，全部通过。
- Chrome 扩展的网页文件注入因未开启“Allow access to file URLs”而不可用；未改动用户扩展权限。`.lftl` 的强制验收本就通过产品的 macOS 原生 picker 完成；完整虚构 V4 使用产品 Repository 链路生成并复读，因此未将扩展限制冒充为产品失败。

最终失败合同项：无。最终未通过质量门：无。

## 七、边界与禁止事项声明

- 未读取、未引用、未复制、未列举 `~/Downloads/history_OKX/` 下任何内容。
- 没有任何真实账户数字进入源码、测试夹具、注释、README 或提交信息；本批测试和 Chrome 文件全为虚构数据。
- 未通过伪造买入或卖出交易凑数量；数量变化由独立 `AssetTransfer` 事实表达。
- `decimal.js` 保持 40 位精度；显示格式化未改变任何持久化 `DecimalString`。
- 未改动加密、双代保存、文件锁、会话协调或导入准入安全约束；未新增联网行为。
- 未生成或导入真实数据，未创建、覆盖、写回或删除任何真实 `.lftl`。
- 未进入或改动 `LocalFirstTradingLedger-CS2026/`。
- 未执行 merge、push、rebase、cherry-pick 或破坏性 Git 命令。源码分支未合并回 `main`，也未与 `CS2026` 建立任何关联。

## 八、交付边界

本文档只给出开发执行候选结论。分支是否进入独立验收、是否合并回源码 `main` 以及是否推送，均由用户后续单独决定。
