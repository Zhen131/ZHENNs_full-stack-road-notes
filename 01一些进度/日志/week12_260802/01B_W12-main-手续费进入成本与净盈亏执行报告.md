# Week 12 main PNL-001～003 手续费进入成本与净盈亏执行报告

日期：2026-08-10
执行窗口：开发与自动化 2026-08-09 22:26:15～23:10:02 CST；可见 Chrome 重新补证 2026-08-10（虚构文件落盘 07:24:05～07:42:29 CST）
开发侧结论：`PASS`
源码候选分支：`zhennn/w12-pnl-fee-accounting`
目标：`PNL-001`、`PNL-002`、`PNL-003`

## 结论

PNL-001～003 已形成包含五个本地提交的待独立审查候选：新账本与新金额事实使用 USDT，持仓重放计入实际手续费，页面统一展示成交金额、买入总支出／卖出净到账、含费成本和净盈亏；固定金额、旧 USD、缺价和异币手续费合同均有正式自动化与真实文件页面证据。

2026-08-10 已在可见的真实 Google Chrome、production build 和三个专用虚构 `.lftl` 中重新补证。用户只在浏览器密码页与 macOS 原生保存窗口完成必须的人工作业；每次回复后均先检查文件确实落盘，再继续自动验证。固定样例、零费／多买／部分卖／卖清、缺价、旧 USD、异币手续费、三图、日期筛选、390px / 1280px 响应式、导出、锁定重开与派生不落盘均已取得强制证据，最终控制台为 0 error / 0 warning。因此本报告的当前开发侧结论从历史 `BLOCKED` 据实更新为 `PASS`。

这只是开发侧 `PASS`，不是独立验收结论，也不能表述为 PNL-001～003 已最终完成。没有执行 01C，没有生成 01D，没有回写 00B、00D 或当前开发状态。

## 一、起点、终点与 Git 边界

### 1.1 产品源码仓库

| 项目 | 结果 |
| --- | --- |
| 路径 | `01一些进度/产出/LocalFirstTradingLedger/` |
| 起点 | `main` / `279af4e3248c68306e857b8d0c8eeeaa03a29d6a`，相对 `origin/main = 0/0`，工作树干净 |
| 候选分支 | 从上述实时 `main` 新建并保留 `zhennn/w12-pnl-fee-accounting` |
| 终点 | `f55c9cf3630354d979f07a25f69acc56c8342f06` |
| 相对 `origin/main` | behind / ahead = `0/5` |
| upstream | 未设置 |
| 最终 status | tracked / staged / unstaged / untracked 均为空 |
| push / merge / PR | 均未执行；`main` 仍停在起点 |

五个独立本地提交：

1. `1bc5a47dfd7055083bcff39fc66ef92c86bc00c9 feat: establish USDT fact creation boundaries`
2. `429a2a4f4d4844777487b4b4c6b9dfba4306ef56 feat: include actual fees in position replay`
3. `3a3417dd95245ec2340d427ed722477da3b6d05a feat: propagate fee-aware PnL through ledger views`
4. `21bb151d77367b69bf1a66b9daa58278cf840181 feat: expose fee-aware accounting in the dashboard`
5. `f55c9cf3630354d979f07a25f69acc56c8342f06 test: align writable ledger fixtures with USDT`

最后一个提交专门修复首次完整套件发现的测试夹具漂移：保留历史 USD fixture，新增并行的 USDT 可写 fixture，没有放宽 runtime Validator。

2026-08-10 协调同步：本报告结束后，功能分支只新增一个 README 文档提交 `1d8603f8747f64a5aff5fd94cefb8f96c01290e9`；当前候选相对 `origin/main` 为 `0/6`，工作树干净，仍未合并、未 push、未设 upstream。该文档提交不改写上述五个实现提交和开发证据。

### 1.2 根文档仓库

| 项目 | 结果 |
| --- | --- |
| 分支 / HEAD | `main` / `eb4c6cc48fb6d5f1f600150559abd6f91e51a3fa` |
| 相对 `origin/main` | `0/0` |
| staged | 空 |
| 既有 unstaged | `00C_W12-main-网页与AI开发批次路线.md` 的表格对齐变化，原样保留 |
| 既有 untracked | `01A_W12-main-手续费进入成本与净盈亏执行文档.md`、`01C_W12-main-手续费进入成本与净盈亏独立审查执行文档.md`，原样保留 |
| 本任务新增 | 本 01B，保持 untracked、未提交 |
| commit / push | 均未执行 |

`LocalFirstTradingLedger-CS2026/` 未进入、未修改。根文档与源码没有混入同一提交。

## 二、实际交付与 PNL 映射

候选相对起点共 `52 files changed, 1773 insertions, 187 deletions`。

### 2.1 PNL-001：USDT 新事实与旧 USD 兼容

- `builtInAssets` 的 BTC / ETH / ADA 新建默认计价币种改为 USDT，schema 仍为 1。
- trade / price production service 以稳定错误码拒绝新 USD 金额事实；非零实际手续费必须与交易币种相同。
- Binance merge 只为 USDT 资产写新快照；旧 USD 资产保留原事实并跳过新写入。
- TradeForm、PriceForm 与 Binance 刷新在旧 USD 页面明确禁用；兼容 Validator、hydrate、备份和文件读取仍接受结构合法的旧 USD 事实。
- 历史 USD fixture 未被批量替换；另增 `sampleUsdtTrades`、`createUsdt*` 供当前可写账本测试使用。

主要生产文件：`src/data/builtInAssets.ts`、`src/validators/tradeValidator.ts`、`src/validators/priceSnapshotValidator.ts`、`src/services/tradeService.ts`、`src/services/priceSnapshotService.ts`、`src/services/binancePriceRefreshService.ts`。

### 2.2 PNL-002：唯一含费重放

- 新增纯派生 `calculateTradeCashImpact()`；买入总支出为 `totalValue + fee`，卖出净到账为 `totalValue - fee`。
- `positionReplay` 用 Decimal 完成买入加费、部分卖出含费成本移除、卖出费扣减净到账、全部卖清严格归零。
- 重放不读取 FeeRule；卖清不依赖浮点比例残差。
- 非零异币手续费保留原 Trade，并生成只存在于派生 Position 的 issue；数量和市值继续，成本与 P&L 标为不可靠。

主要生产文件：`src/calculators/positionReplay.ts`、`src/calculators/positionCalculator.ts`、`src/calculators/tradeCashImpact.ts`、`src/models/types.ts`、`src/services/positionService.ts`。

### 2.3 PNL-003：摘要、表格与三图

- 新增纯派生 `pnlSummaryService` 与 `valuationDisplay`，五项摘要不进入 reducer、LedgerData 或文件。
- 交易表新增“不含手续费的成交金额”“实际手续费”“现金影响”；表单提供 Decimal 预览。
- 持仓表改为含费平均成本、剩余含费成本、已实现／未实现净盈亏；缺价不补 0，异币手续费不展示伪精确值。
- 饼图继续只按市场价值；历史成本线读取含费重放并在异币 fee 后断开；热力图仍只数交易笔数。
- 单币种显示 USD 或 USDT；混合汇总显示 `USD/USDT 近似等值`，就近披露 `1 USDT ≈ 1 USD，未接实时汇率`。

主要生产文件：`src/services/pnlSummaryService.ts`、`src/services/valuationDisplay.ts`、`src/services/priceSelectionService.ts`、`src/services/chartDataService.ts`、`TradeForm.tsx`、`PriceForm.tsx`、`DashboardShell.tsx`、`MarketDataControls.tsx`、`ChartsOverview.tsx`、`chartOptionBuilders.ts`。

正式测试覆盖 calculator、validator、service、图表、Dashboard、备份、加密、文件仓库、composition 与 Hook；所有测试文件均随对应阶段或独立测试修复提交进入候选。

## 三、固定金额与边界证据

固定事实：

```text
买入：0.1 × 65000 = 6500；fee = 5；买入总支出 / 含费成本 = 6505
卖出：0.04 × 70000 = 2800；fee = 3；卖出净到账 = 2797
卖出前含费均价 = 6505 / 0.1 = 65050
移除成本 = 0.04 × 65050 = 2602
已实现净盈亏 = 2797 - 2602 = 195
剩余数量 = 0.06；剩余含费成本 = 6505 - 2602 = 3903
合法价格 80000 时：市场价值 = 4800；未实现净盈亏 = 4800 - 3903 = 897
```

程序三层结果：

| 层 | 证据 |
| --- | --- |
| 纯重放 | 精确得到 `6505 / 2602 / 2797 / 195 / 3903`，并锁定多买、部分卖、最终卖清和 40 位 Decimal |
| service / chart | summary 得到 `6505 / 2797 / 3903 / 195 / 897`；历史成本含费，饼图市值与热力图笔数不因 fee 改写 |
| 页面组件 | jsdom 真实 TradeForm / PriceForm 得到同一组值；交易表显示 fee 与现金影响；持仓和摘要一致 |
| 真实文件页面 | `PASS`：真实 Chrome 中得到 `6505 / 2797 / 3903 / 195 / 897`；交易行、持仓、摘要和含费成本图口径一致，锁定重开后保持不变 |

边界矩阵已由正式测试锁定：零费保持旧结果；多次买入分别加实际 fee；部分卖出按卖出前含费均价；最终卖清数量、均价和成本严格为字符串 `"0"`；缺价不生成 unrealized；旧 USD 逐字段可读且新增入口禁用；异币 fee 原值可见但 fee-sensitive 数值全部 withholding，市值与热力图继续。

## 四、质量门

| 检查 | 命令 / 结果 |
| --- | --- |
| PNL-001 定向 | 9 files / 111 tests，exit 0 |
| PNL-002 定向 | 4 files / 29 tests，exit 0 |
| PNL-003 定向 | 8 files / 45 tests，exit 0 |
| 页面定向 | 6 files / 62 tests，exit 0 |
| 首次完整套件 | 57 files；596 passed / 126 failed，共 722；失败集中为新 USDT 初始资产与历史 USD 测试事实混拼，随后以独立提交修复 |
| 修复后相关大组 | 11 files / 276 tests，exit 0 |
| 最终完整套件 | `npm test`：57 files / 722 tests 全部通过，exit 0；jsdom 仅输出既有 `Not implemented: navigation to another Document` 提示，无失败 |
| 类型 | `npm run typecheck`，exit 0 |
| lint | `npm run lint`，exit 0，0 warning |
| production build | `npm run build`，exit 0；Next.js 15.5.22 编译、类型检查、5 个静态页面生成成功；`/` 为静态路由 |
| 真实 Chrome 补证 | 2026-08-10 在 `http://127.0.0.1:3101/` 使用 production build 与三个专用虚构 `.lftl` 完成 01A 第十二节；最终 console 0 error / 0 warning |
| whitespace | 各阶段 `git diff --cached --check` 与最终 `git diff --check` 均 exit 0 |
| 未跟踪 01B whitespace | `git diff --no-index --check /dev/null <01B>` 无任何 whitespace 诊断；命令 exit 1 仅表示 01B 与空文件存在内容差异 |
| 禁止调试残留 | 候选文件扫描无 `.only(`、`.skip(`、`debugger`、`console.log/debug` |
| 业务金额边界 | replay / cash-impact / summary / position service 扫描无 `Number()`、`parseFloat`、`parseInt`、FeeRule / feeRules 使用 |

源码最终工作树干净，因此没有未跟踪源码需要额外 no-index whitespace 检查；根仓库新增的 01B 在收尾时单独执行 no-index whitespace 检查。

## 五、防越界结果

- `LedgerData.schemaVersion` 继续固定为 1；未改 `.lftl`、加密 metadata、BackupEnvelope 版本或 IndexedDB connection contract。
- 未修改 production backup、repository、file access、encryption 或 import 实现；相应测试在完整套件中通过。
- 没有把 summary、cash impact、Position issue 或 chart data 写入 LedgerData、Trade 或持久化层。
- 未实现 FeeRule 匹配／重算、平台字段、汇率 API、NLP、Agent、Notebook、桌面端或移动端。
- 没有依赖升级、package 变化、跨分支复制、rebase、cherry-pick、amend、squash、merge、push 或 PR。
- 用户既有根 `00C` 变化和未跟踪 01A / 01C 全程未触碰。

## 六、真实 Chrome 重新补证结果

使用已优化 production build，在真实 Google Chrome 打开隔离 origin `http://127.0.0.1:3101/`。`127.0.0.1:3000` 已记住用户原有 C 连接，因此未在该 origin 验收；本轮从未打开、导入、覆盖或删除个人账本。

### 6.1 首次尝试保留为历史

2026-08-09 首次尝试确实停在原生保存选择器和 Google Password Manager 交接处，最终没有生成专用 `.lftl`，所以当时的 `BLOCKED` 符合现场。2026-08-10 用户把测试 Chrome 置于前台后重新执行；每遇到浏览器密码页或 macOS 保存窗口，立即暂停并给出按钮、文件名和虚构内容，用户完成后先检查宿主文件存在、大小和页面状态，再继续自动验收。首次失败只保留为历史，不再代表当前结论。

### 6.2 三个独立虚构 C

| 用途 | 宿主文件 | 结束时大小 | SHA-256 |
| --- | --- | ---: | --- |
| 固定样例、缺价、零费、多买、部分卖、卖清、三图与响应式 | `~/Downloads/W12-PNL-FAKE-2026-08-10.lftl` | 9445 bytes | `39d891cbaa841f4c2dee666645c456080e8d866f807a435e660ee662e4a63b2f` |
| 旧 USD 兼容读取 | `~/Downloads/W12-PNL-COMPAT-EMPTY-2026-08-10.lftl` | 3145 bytes | `951e25dd5613768cbe68a231833a604e341843bc6a6fd4fa2ab189bb2836aa98` |
| 异币种手续费 | `~/Downloads/W12-PNL-FOREIGN-FEE-2026-08-10.lftl` | 3864 bytes | `8cbd7e85f7ea9d9c946fad2a58b93a978b69ad0ccb98cf787d9336c60bce22b3` |

三者的 `fileId` 各不相同；外层均只有 `crypto / current / fileFormatVersion / fileId / previous`，文件格式和账本 schema 均为 1。`current / previous` 只含密文、IV、schema、revision 和 parent revision metadata。

### 6.3 主虚构账本页面证据

1. 新账本 BTC / ETH / ADA 和表单计价币种为 USDT；页面就近披露 `1 USDT ≈ 1 USD` 且明确没有实时汇率。
2. BTC 买入 `0.1 × 65000`、fee `5 USDT`，卖出 `0.04 × 70000`、fee `3 USDT` 后，页面同时显示成交金额、实际手续费与现金影响；持仓和摘要精确得到买入总支出 `6505`、卖出净到账 `2797`、剩余含费成本 `3903`、已实现净盈亏 `195`。手工价格 `80000` 后市场价值 `4800`、未实现净盈亏 `897`。
3. ETH 以零费完成两次不同价格买入、部分卖出和最终全部卖清；中间得到数量 `1.5`、平均成本 `1500`、剩余成本 `2250`、已实现 `500`，最终数量、平均成本和成本严格归零，累计已实现 `2750`。
4. ETH 缺价时明确显示“未输入价格 / 缺少合法价格”，没有用 0、成交价或成本价代替。价格补入后只改变市值和未实现结果，不改交易事实。
5. 饼图按市值显示；历史图成本线使用含费成本；热力图统计 6 笔交易。点击 `2026-08-09` 日期格后交易列表出现当前日期筛选，清除后恢复；`1日 / 7日 / 30日 / 365日 / 全部` 分别显示 `2 / 7 / 30 / 365 / 2` 个点，1 日明确提示无可靠日内变化。
6. `390×844` 时页面 `clientWidth = scrollWidth = 390`，两张 960px 宽表只在各自 `overflow-x: auto` 容器滚动；`1280×900` 时页面宽度保持 1280，持仓表局部容器为 `622 / 960`，交易表为 `1128 / 1128`，没有页面级横向溢出。
7. 立即锁定、输入同一虚构密码重开后，6 笔交易和手工价格仍存在。解锁时 Binance 自动刷新可以产生独立 API 价格；切回“手动价格”仍恢复 `80000` 与 `897`，证明原手工事实没有被覆盖。
8. 明文导出实际生成 `~/Downloads/local-first-trading-ledger-backup-v1-20260809-232426Z.json`（5207 bytes）。`backupFormatVersion = 1`、`ledgerSchemaVersion = 1`；`ledgerData` 只有 `assets / feeRules / priceSnapshots / schemaVersion / trades`，含 3 个资产、6 笔交易和 2 个价格快照，没有 summary、cash impact、cost basis、realized / unrealized P&L、Position、chart data 或 fee issue。

### 6.4 旧 USD 与异币种手续费

- 旧 USD 备份在第一本独立空 C 中预检为 1 资产、1 交易、1 价格、0 硬错误、0 可疑重复组，确认恢复后保留 `6500 USD + 5 USD` 原事实；页面得到含费成本 `6505 USD`、价格 `80000 USD`、市值 `8000 USD`、未实现净盈亏 `1495 USD`。TradeForm、PriceForm 和 Binance 新写入均禁用，并提示在新 USDT 账本继续录入；锁定重开后全部保持，不发生静默迁移。取得该证据后，才按正式清空流程把这一本专用 C 的 current 清空；文件 previous 仍保留清空前加密代，因此上表的结束状态不是把 USD 事实迁移成 USDT。
- 整本恢复只允许“同一会话中新建且仍为空”的 C。旧 USD C 完成一次恢复后即使按正式清空流程回到空数据，再次恢复也被页面以“当前状态不允许恢复备份”拒绝；因此异币种样例另建独立 C，而不是绕开导入安全门。
- 异币种备份同样以 0 硬错误、0 可疑重复组通过预检。确认恢复后交易行原样显示 `6500 USDT` 与 `5 BNB`，现金影响、成本、已实现／未实现净盈亏均明确为不可可靠计算；没有把 BNB 按 0 或 USDT 换算。手工价格 `80000 USDT` 仍给出 `8000 USDT` 市值，热力图仍统计 1 笔交易，历史成本线明确断开 3 个不可可靠成本点。
- 异币种 C 锁定重开后上述事实与可靠性状态保持。Binance 自动刷新成功时可独立显示实时价格；切回手动模式仍恢复 `80000 / 8000 USDT`，手续费可靠性状态不变。

两份一次性明文 fixture 只用于本轮可见 Chrome 导入，结束时已从 ignored `.next/w12-browser-fixtures/` 清理；源码仓库没有因此留下 tracked 或 untracked 变化。

最终 production 页面 console 的 error / warn / warning 列表为空。以上已经覆盖 01A 第十二节的全部强制项，因此没有剩余的真实 Chrome / picker 强制缺口，开发侧结论为 `PASS`。

复现入口：

```text
npm run build
npm run start -- --port 3101
真实 Google Chrome 打开 http://127.0.0.1:3101/
只使用上述专用虚构 C 与虚构备份，按 01A 第十二节复现
```

## 七、交付边界

- 已形成开发侧 `PASS` 的待独立审查候选，但不宣称最终完成。
- 未执行 01C，未生成 01D。
- 未更新 00B、00D、`00-当前开发状态.md`。
- Week 11 `02D = BLOCKED` 未被改写，本批自动化结果不构成真实个人数据 Gate。
- 源码候选分支保留在本地，无 upstream、无 push；根 01B 保持未跟踪、未提交，等待后续处理。
