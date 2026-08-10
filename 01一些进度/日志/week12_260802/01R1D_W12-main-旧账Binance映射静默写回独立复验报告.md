# Week 12 main 第 01 批 R1：旧账 Binance 映射静默写回独立复验报告

## 一、总结论

**PASS**。

本次独立复验没有继承开发者的 PASS 判断，而是从冻结候选重新审读实现链与正式测试，重新运行定向测试、全量测试和全部质量门，并使用 production build、真实 Google Chrome、loopback 地址以及本次新建的虚构 `.lftl` 完成文件级往返。

原 `01D` 的 P0 已被独立复验关闭：合法 v1 / USD 旧账中，BTC Asset 的 `binanceMapping` **absent** 状态经过预检、恢复、加密写入、认证复读、锁定重开和明文导出后仍为 absent；最终导出的 `ledgerData` 与输入逐字段相等。`PNL-001` 与原 `M11` 由 FAIL 复验为 PASS，`PNL-002`、`PNL-003` 及原 `M01～M20` 均为 PASS。

没有 P0、P1、正式门失败、skip、关键证据缺口或候选漂移。独立执行者只新增本报告；没有修改源码、测试、README、Git index、既有协调文档，没有提交、push、merge、rebase、设置 upstream 或切换分支。

本报告只决定 Week 12 `main` 第 01 批冻结候选的独立复验结果。Week 11 `02D = BLOCKED` **未改变**，本报告也不直接更新 `00B`、`00D` 或当前开发状态。

## 二、冻结候选与审查范围

- 源码仓库：`01一些进度/产出/LocalFirstTradingLedger/`
- 分支：`zhennn/w12-pnl-fee-accounting`
- HEAD：`605c7a3c2860b7c4783a8234037882ceca1613c8`
- tree：`565e02969409846d5eb0a3d9b46f4f2fffd89efd`
- 相对 `origin/main`：behind `0` / ahead `9`
- upstream：无
- `origin/main...HEAD` binary diff SHA-256：`92da7ff7761edb5f9e9b68209002fb1aa4f974468f76ff93281f4f1b8aa21106`
- 候选 diff：`61 files changed, 2312 insertions(+), 277 deletions(-)`
- R1 修复提交链：`85b445f`、`9ad0909`、`605c7a3`
- R1 段（`1d8603f...HEAD`）：15 files，538 insertions，93 deletions；binary diff SHA-256 `b7ec4eda197eb058f59b0e6151ff9b0071ec020e1e7cadac6caef4c396828227`

审读覆盖：mapping 运行期解析、LedgerData 校验、BackupEnvelope、内容身份、preflight candidate、文件仓库授权与认证复读、hydration/import、mapping 设置/删除、Binance 刷新与异步失效、内置 USDT 资产、手续费重放、价格选择、摘要、三图和正式测试真实性。

## 三、原 P0 输入与完整往返

### 3.1 独立输入

独立创建、未使用开发者 DEV 文件：

- 文件：`/private/tmp/W12-PNL-R1-REVIEW-FAKE-LEGACY-USD-ABSENT-20260810.json`
- BackupEnvelope：`backupFormatVersion = 1`、`ledgerSchemaVersion = 1`
- 文件 SHA-256：`ae5a82a8cc69b52273f334155768c33a291a74b19cd9d61aa58ad7f1ea51b2f1`
- 3 个 USD Asset；BTC 对象 `Object.hasOwn(asset, "binanceMapping") === false`
- 买入：BTC `0.1 × 65000 = 6500 USD`，fee `5 USD`，总支出 `6505 USD`
- 卖出：BTC `0.04 × 70000 = 2800 USD`，fee `3 USD`，净到账 `2797 USD`
- 手工价格：BTC `70000 USD`
- 每笔 Trade 均含非空 `rawText`

### 3.2 最终真实文件闭环

最终复核使用全新文件，避免后续普通保存实验对首次证据造成歧义：

- `.lftl`：`/private/tmp/W12-PNL-R1-REVIEW-FAKE-ABSENT-FINAL-20260810.lftl`
- 密码：仅用于本次虚构证据的 `W12-R1-Review-Absent-Final-2026!`
- `.lftl` SHA-256：`a3f61bc964b43163e733240d4e2393b9df16eb13a671234719a3d680d4a62fda`
- 导出：`/private/tmp/W12-PNL-R1-REVIEW-FAKE-ABSENT-FINAL-EXPORTED-20260810.json`
- 导出文件 SHA-256：`c89189e594212836e278ee2a513791da98d87ebd1cc07783cad7c0828b6ad15e`

实际顺序：新建空 C → 选择独立备份 → 完整 preflight → 确认恢复 → 加密写入及认证复读 → 页面核对 → 立即锁定 → 同一密码认证重开 → 明文导出 → 直接读取 JSON。

逐字段结果：

```text
input  ledgerData canonical SHA-256:
258135ba8f2438d7b30441cff7cf20d64f2a1a244b35b1337773b48a31787ed2

export ledgerData canonical SHA-256:
258135ba8f2438d7b30441cff7cf20d64f2a1a244b35b1337773b48a31787ed2

jq deep equality: true
exported BTC has("binanceMapping"): false
```

首次闭环的独立导出 `/private/tmp/W12-PNL-R1-REVIEW-FAKE-ROUNDTRIP-EXPORTED-20260810.json` 也得到同一 `ledgerData` hash，且原始导出文件 SHA-256 为 `25be279eef3da489ee619d08b9d096c20a44d15c78d5942e66fd7554b5061945`。

### 3.3 普通保存不物化 absent key

在另一条虚构 absent C 会话中，主动删除卖出交易并等待普通 repository save 完成，再导出：

- 中间导出：`/private/tmp/W12-PNL-R1-REVIEW-FAKE-ABSENT-NORMAL-SAVE-EXPORTED-20260810.json`
- SHA-256：`f734e40faac6864c7f5e537a2f31d2fd085d2328ae9dc7a2e6c312d4966011e2`
- 交易数：1，仅保留原买入
- BTC `has("binanceMapping") === false`

该临时 C 的 import capability 按现有安全设计为一次性授权，后续同 C 再覆盖返回 `LEDGER_IMPORT_NOT_ALLOWED`；本报告没有把该返回误记为恢复成功，而是另建上述 `ABSENT-FINAL` 新空 C 完成最终全链深比较。

用户在复验期间反馈点击了一个保存按钮。反馈到达时原生窗口经复核实际为 `Open` sheet，而不是 `Save` sheet；随后扫描 `/private/tmp/W12-PNL-R1-REVIEW-FAKE*`，没有发现意外文件、个人文件或重复文件。最终 PASS 采用的是该反馈后重新创建、重新恢复、重新锁定重开并重新导出的 `ABSENT-FINAL` 证据，不把未确认点击当作通过依据。

## 四、R1-M01～R1-M15

| 项目 | 结果 | 独立证据 |
| --- | --- | --- |
| R1-M01 absent | PASS | Validator、preflight、文件保存、重开和最终导出均保留缺 key；运行期 UI 可显示 BTCUSDT fallback，但 JSON 不物化 |
| R1-M02 explicit null | PASS | 独立 null C 的 UI 输入为空、删除按钮 disabled；导出仍有 own key 且值为 null；输入/导出 ledgerData hash 均为 `8b0471b4691c0ad0d5d6c1047a2f957acacb9799fb29ab3d0529293a721192cc` |
| R1-M03 explicit object | PASS | 独立 explicit C 显示并使用 `BTCUSDT`；导出对象四字段精确；输入/导出 ledgerData hash 均为 `53eeeed221963738f0e22f8ca96495a12c882d1809bff44656bb678fa92463db` |
| R1-M04 直接 hydration | PASS | `usePersistentLedger.test.tsx` 证明 load 后无自动迁移 save，普通无关保存仍 absent；真实普通删除保存后的导出也仍 absent |
| R1-M05 backup import | PASS | 页面 preflight hash 与独立文件一致；candidate、写前授权、repository readback 由正式测试精确绑定；真实最终导出逐字段相等 |
| R1-M06 content identity | PASS | absent/null/explicit 的正式身份测试互不相等；实际三个独立导出分别保留三种序列化事实 |
| R1-M07 用户新增/修改 | PASS | 新 USDT C 删除 mapping 后输入 `BTCUSDT`，真实 Binance 验证成功并显示“交易对已验证并加入保存队列”；导出为 explicit object |
| R1-M08 用户删除 | PASS | 新 USDT C 双击确认删除后输入框为空、删除 disabled、历史 API 价格保留；正式测试证明 absent/explicit 用户删除均写 null，且不会被推导补回 |
| R1-M09 新 USDT 账 | PASS | 真实新 C 的 BTC/ETH/ADA 均为 USDT，分别有 BTCUSDT/ETHUSDT/ADAUSDT；导出 schema 仍为 1 |
| R1-M10 Binance 正常刷新 | PASS | 真实 Chrome 公开刷新 `BTCUSDT`：updated 1 / failed 0；价格 `65160.01000000 USDT`，provenance 完整 |
| R1-M11 旧 USD 防新事实 | PASS | 旧 USD 页面可读可算；新 Trade、手工 Price 与 Binance 刷新明确 disabled；导出未产生新 USD 事实 |
| R1-M12 Binance 失败与异步 | PASS | 正式测试覆盖失败保旧价不写 0、epoch/session/mapping 变化丢弃旧响应；组件异步测试通过 |
| R1-M13 file safety | PASS | 文件安全组合 10 files / 242 tests 全过；revision、双代、close-readback、恢复、recovery-blocked、session lease 均在正式测试中 |
| R1-M14 格式边界 | PASS | 无 schema/format/envelope/connection 版本变更；schema 2 命中仅为拒绝非法版本的负测；无依赖或 lockfile 改动 |
| R1-M15 候选只读 | PASS | 审查前后 branch、HEAD、tree、ahead/behind、upstream、完整 diff hash 一致；源码仓库始终 clean |

## 五、PNL-001～003 与原 M01～M20

### 5.1 PNL-001～003

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| PNL-001 USDT 与成交金额 | PASS | 新 C 和新事实使用 USDT；Trade.totalValue 仍不含 fee；旧 USD 逐字段不变且禁写；原 absent mapping P0 已由最终真实文件深比较关闭 |
| PNL-002 实际手续费进入确定性重放 | PASS | 定向 PNL/图表 14 files / 160 tests；真实旧账固定值为 6505、2797、3903、195、297 USD |
| PNL-003 页面、摘要与三图 | PASS | 交易行、持仓表、摘要、饼图、历史成本线和热力图口径一致；缺价不补零；390×844、1280 宽度与 console 0 error 均重新取证 |

### 5.2 原 M01～M20

| 项目 | 结果 | 独立复验摘要 |
| --- | --- | --- |
| M01 | PASS | 固定样例：6505、移除成本 2602、净到账 2797、realized 195、剩余成本 3903；当前价 70000 后 marketValue 4200、unrealized 297 |
| M02 | PASS | 零手续费回归精确通过，不依赖 FeeRule |
| M03 | PASS | 多次买入 fee 分别进入成本，含费平均成本精确 |
| M04 | PASS | 部分卖出按卖出前平均成本移除，剩余成本正确 |
| M05 | PASS | 最后卖清 quantity/averageCost/costBasis 严格为字符串 `"0"` |
| M06 | PASS | 买入 fee 只增加成本与总支出，不改 Trade.totalValue |
| M07 | PASS | 卖出 fee 只扣净到账和 realized，不错误减少剩余成本 |
| M08 | PASS | unrealized 只等于合法 marketValue 减 fee-aware costBasis |
| M09 | PASS | 缺价保持 undefined；真实新 USDT 页面先显示“缺少合法价格”和图表断点，不用 0/成交价/成本价冒充 |
| M10 | PASS | 新 Asset、Trade、feeCurrency、手工/API Price 使用 USDT；schema 仍为 1 |
| M11 | PASS | 旧 v1/USD 读取、计算、恢复、保存与导出不静默补 mapping；新 USD 事实入口禁用 |
| M12 | PASS | 页面就近披露 `1 USDT ≈ 1 USD` 且未接实时汇率；单笔事实显示实际币种 |
| M13 | PASS | 新非零异币 fee 被拒；旧异币 fee 保留并明确不可可靠计算，不按 0 或 USDT 猜算 |
| M14 | PASS | 页面、摘要和三图来自同一重放/价格选择链，金额、币种和缺口一致 |
| M15 | PASS | 派生 P&L/Position/summary/chart/issue 不进入 LedgerData、备份、`.lftl` 或 connection |
| M16 | PASS | totalValue 始终是不含费成交金额；真实 JSON 保留 6500/2800，而非 6505/2797 |
| M17 | PASS | 业务重放使用 decimal.js；极小数、重复分摊、最终卖清稳定；number 仅在绘图边界 |
| M18 | PASS | 时间线、超卖、未来事实、价格选择、Binance 失败保旧价、保存、锁定、恢复与重挂载回归通过 |
| M19 | PASS | 无 schema/文件/BackupEnvelope/IndexedDB 变更，无 FeeRule/NLP/平台/编辑或整体 UI 越界 |
| M20 | PASS | 正式测试未删测、skip、放宽精确金额或 mock 掉真实重放；全量 58 files / 730 tests |

## 六、实现链与正式测试真实性审查

### 6.1 实现链

- `ledgerFactPolicy.ts`：`resolveAssetBinanceMappingForRuntime` 区分 null、explicit 与 absent；absent 仅返回运行时 clone，不修改 Asset。
- `ledgerDataValidator.ts`：undefined 保持 absent，null 保持 null，explicit 对象逐字段重建；只有非 undefined 才向 Asset 写 key。
- `backupContentIdentity.ts` / `backupImportPreflight.ts`：身份针对校验后的精确 candidate；candidate 是 deep-frozen clone，没有 normalize/materialize。
- `usePersistentLedger.ts`：hydration 直接采用已保存 LedgerData，不执行迁移；import 的 candidate、证据、写入、readback 和页面状态保持同一事实。
- `ledgerFileRepository.ts`：import 授权绑定 candidate identity，写前重验、加密当前/上一代、字节复读与解密校验；load 返回 detached clone。
- `binanceMappingService.ts`：用户 set/delete 是显式业务操作；delete 写 null；运行时 fallback 不落盘。
- `binancePriceRefreshService.ts`：只为 USDT 非零持仓刷新；null 禁用；absent built-in 可运行时使用；mapping/session/epoch 变化会阻止旧响应写入；失败不写 0。
- `builtInAssets.ts`：新 BTC/ETH/ADA 创建即为 USDT + explicit Binance mapping，schema 未变。
- PNL 链：`positionReplay` 使用 Decimal；买入 fee 进入成本，卖出 fee 扣净到账，最后卖清精确归零；position、summary、price selection 和 chart data 复用同一事实。

### 6.2 正式测试真实性

- `ledgerPolicies.test.ts`：absent/null/explicit 运行期语义与不变性。
- `backupImportPreflight.test.ts`：candidate deep-freeze，absent/null/explicit identity 区分。
- `ledgerFileRepository.test.ts`：独立合法 USD fixture 从 BackupEnvelope preflight 到新空 C、save/readback、重开、导出并断言 absent。
- `usePersistentLedger.test.tsx`：hydration 无自动 save；普通无关保存仍 absent。
- `usePersistentLedger.fileImport.test.tsx`：import 后 state/repository 均保持 absent。
- `MarketDataControls.test.tsx`：fallback 显示、验证/删除确认和显式用户变更。
- `binancePriceRefreshService.test.ts`：USDT/absent/null/partial failure/stale response/旧 USD 禁写。
- PNL、Dashboard、Charts 正式测试使用精确金额和真实 replay/service 链；未以 mock 代替关键重放。

未发现删测、`.only`、`.skip`、批量放宽断言、批量替换 USD 预期、假实现或只测 mock 的造绿行为。

## 七、定向测试与完整质量门

### 7.1 原始摘要

```text
R1 专项：
Test Files  8 passed (8)
Tests       170 passed (170)
exit        0

文件安全组合：
Test Files  10 passed (10)
Tests       242 passed (242)
exit        0

PNL / 图表回归：
Test Files  14 passed (14)
Tests       160 passed (160)
exit        0

npm test：
Test Files  58 passed (58)
Tests       730 passed (730)
Duration    13.07s
exit        0

npm run typecheck  exit 0
npm run lint       exit 0
npm run build      exit 0
git diff --check   exit 0
git diff --check origin/main...HEAD  exit 0
```

Vitest 没有报告 skipped tests。文件安全组合输出的 `Not implemented: navigation to another Document` 是 jsdom 已知提示，不是失败、skip 或真实 Chrome 替代；该组合 exit 0，真实 Chrome 另行完整执行。

### 7.2 静态与越界扫描

- `.only` / `.skip`：0
- `debugger`：0
- 非测试生产 `console.log/debug/info/warn/error`：0
- merge conflict 标记：0
- 新增 TODO/FIXME/XXX/HACK：0
- 依赖或 lockfile 变化：0
- schemaVersion 2 / fileFormatVersion 2 / BackupEnvelope v2：无生产改动；命中仅为负测非法输入
- 无 FeeRule 计算、平台、NLP、Agent、桌面端、`CS2026` 或整体 UI 重构越界

## 八、真实 Google Chrome 证据

### 8.1 环境

- production build：Next.js 15.5.22，`next build` 成功
- production server：`next start --hostname 127.0.0.1 --port 3123`
- 浏览器：真实 Google Chrome（扩展控制），不是 jsdom、内置浏览器或开发者截图
- 地址：`http://127.0.0.1:3123`
- 所有 `.lftl`、备份与导出均位于 `/private/tmp`，名称均含 `W12-PNL-R1-REVIEW-FAKE`
- 没有选择个人 `.lftl`

### 8.2 absent 旧 USD

- preflight：3 assets、2 trades、1 price、0 fee rules、0 hard errors、0 suspicious groups
- 页面 B SHA-256：`ae5a82a8cc69b52273f334155768c33a291a74b19cd9d61aa58ad7f1ea51b2f1`，与独立文件一致
- 页面保留 USD 买/卖/fee/手工价；新交易、新手工价和 Binance 刷新均明确禁用
- 运行时 mapping UI 可显示 BTCUSDT fallback；最终 JSON 仍无 key
- PNL：6505 / 2797 / 3903 / 195 / 297 USD
- 持仓：0.06 BTC，含费平均成本 65050 USD，市场价值 4200 USD
- 三图：USD 分配饼图、市场价值/剩余含费成本阶梯线、365 天热力图
- 缺价：历史线明确 2 个市值点因缺价断开
- 锁定、认证重开和最终导出均成功；深比较见第三节

### 8.3 null 与 explicit 独立新文件

- null C：`/private/tmp/W12-PNL-R1-REVIEW-FAKE-NULL-20260810.lftl`
  - 导出 `/private/tmp/W12-PNL-R1-REVIEW-FAKE-NULL-EXPORTED-20260810.json`
  - own key 存在且值为 null；UI 为空；删除 disabled；输入/导出 ledgerData hash 相同
- explicit C：`/private/tmp/W12-PNL-R1-REVIEW-FAKE-EXPLICIT-20260810.lftl`
  - 导出 `/private/tmp/W12-PNL-R1-REVIEW-FAKE-EXPLICIT-EXPORTED-20260810.json`
  - `provider/binance`、`BTCUSDT`、`BTC`、`USDT` 四字段精确；UI 显示并允许删除；输入/导出 ledgerData hash 相同

### 8.4 新 USDT、真实 Binance 与主动 mapping

- C：`/private/tmp/W12-PNL-R1-REVIEW-FAKE-USDT-20260810.lftl`
- 新建时 BTC/ETH/ADA 均为 USDT 且有正确 explicit mapping
- 新增虚构买入：BTC 0.1 @ 65000，totalValue 6500，fee 5 USDT；普通保存成功且 mapping 未变化
- 刷新前页面明确显示 BTC 缺价、unrealized 不可完整计算、饼图不绘制误导性空饼、历史线 1 个断点
- 真实 Binance 刷新：`已更新 1 项，失败 0 项`
- 返回价格：`65160.01000000 USDT`
- provenance：`provider=binance`、`symbol=BTCUSDT`、`sourceQuoteCurrency=USDT`、`fetchedAt=2026-08-10T02:01:12.103Z`
- 市值：`6516.001 USDT`；unrealized：`11.001 USDT`
- 用户主动删除：首次点击进入确认，第二次写 null；UI 空框、删除 disabled，历史 API 价格保留
- 用户主动新增：输入 BTCUSDT 后真实验证成功并加入保存队列；最终导出恢复 explicit object
- 导出：`/private/tmp/W12-PNL-R1-REVIEW-FAKE-USDT-EXPORTED-20260810.json`，SHA-256 `7a3af7387176f4eaec3c3011d8864160acdf63699d62c2a915485c8dc510fb9a`

### 8.5 响应式与控制台

- 390×844：`innerWidth=390`、`innerHeight=844`、`document.scrollWidth=390`、`bodyScrollWidth=390`，无横向溢出
- 1280 宽度：三图、摘要、资产表、交易表与表单均正常；未见裁切或互相覆盖
- Chrome console error：`[]`，即 0 条 error；最终 browser session 已正常释放

## 九、候选前后身份

### 9.1 审查开始

源码仓库：

```text
branch: zhennn/w12-pnl-fee-accounting
HEAD:   605c7a3c2860b7c4783a8234037882ceca1613c8
tree:   565e02969409846d5eb0a3d9b46f4f2fffd89efd
status: clean
upstream: none
origin/main...HEAD: behind 0 / ahead 9
diff SHA-256: 92da7ff7761edb5f9e9b68209002fb1aa4f974468f76ff93281f4f1b8aa21106
```

根文档仓库：

```text
branch: main
HEAD:   af427f44f8294ecc374835cff69fe77bbdd2faa8
tree:   cb4ca714720eef0b775b45675bb0f8be8590472f
status: clean
upstream: origin/main
origin/main...HEAD: behind 0 / ahead 4
```

### 9.2 审查结束、写报告前

源码仓库上述 branch、HEAD、tree、status、upstream、ahead/behind 与完整 diff hash **全部一致**，staged/unstaged/untracked 均为 0。

根文档仓库在写本报告前仍为同一 `main`、HEAD、tree、ahead/behind 且 clean；写报告后唯一允许的正式变化是新增本 `01R1D`，未暂存、未提交。

## 十、Findings

无 P0、P1、P2 或需要修复的 finding。

原 `01D` 的 P0 已由以下相互独立的证据关闭：

1. 实现链不再 normalize/materialize absent mapping；
2. 正式测试覆盖 hydration、import、ordinary save、file readback、reopen 与 export；
3. production + 真实 Chrome + 全新虚构文件最终导出逐字段相等；
4. 普通业务保存后的中间导出仍保持 absent；
5. null 与 explicit 的独立文件没有被合并成同一语义。

## 十一、边界与后续

- Week 11 `02D = BLOCKED` 未改变；本次证据不能替代其真实 picker/C/permission/双标签页/raw IndexedDB 独立证据。
- 本报告 PASS 后，只允许总控另行核对并协调 `00B`、`00D` 与当前开发状态；本独立执行者不修改这些文件。
- 本次没有修改源码、测试、README、Git index 或既有协调文档；没有提交、push、merge、rebase、设置 upstream、删除分支或修改 `CS2026`。
