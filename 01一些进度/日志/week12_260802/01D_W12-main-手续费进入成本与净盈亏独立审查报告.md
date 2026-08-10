# Week 12 main PNL-001～003 手续费进入成本与净盈亏独立审查报告

日期：2026-08-10

审查对象：`zhennn/w12-pnl-fee-accounting` / `1d8603f8747f64a5aff5fd94cefb8f96c01290e9`

最终判定：**FAIL**

## 第一屏结论

自动化质量门、手续费重放、USDT 新事实、页面金额、三图、异币手续费保守降级和派生不保存均取得独立通过证据；但旧版本 1 / USD 账本存在一个确定的强制反例：当旧 BTC Asset 没有可选 `binanceMapping` 字段时，备份恢复后的下一次保存会静默补写 `BTCUSDT` 映射。金额、币种和 schema 没有改变，但 Asset 原始事实已经改变。

这直接违反 01A 的“不得重写已加载旧资产”“旧 USD LedgerData 逐字段不变”和 01C `M11` 的“恢复、保存后字段未静默改写”，按 01C 对“账本事实被改写”的定义记为 **P0**。任一强制合同已有反证时必须 `FAIL`，不能由 722 项测试全绿或其余浏览器流程抵消。

因此：`PNL-001 = FAIL`，`PNL-002 = PASS`，`PNL-003 = PASS`；`M11 = FAIL`，其余 M 项通过。本报告不回写 00B；`PNL-001～003` 继续保持未完成，等待另行修复与重新独立审查。

## 一、审查身份与只读边界

### 1.1 根文档仓库

| 项目 | 开始快照 | 结束快照 |
| --- | --- | --- |
| 路径 | `全栈之路/` | 同左 |
| branch | `main` | `main` |
| HEAD | `d9fac867d284ecab055badc3581470aeda34ceb2` | 相同 |
| `origin/main` | `eb4c6cc48fb6d5f1f600150559abd6f91e51a3fa` | 相同 |
| behind / ahead | `0 / 1` | `0 / 1` |
| staged | 无 | 无 |
| tracked unstaged | 无 | 无 |
| untracked | 无；01D 尚不存在 | 仅本报告 `01D_W12-main-手续费进入成本与净盈亏独立审查报告.md` |
| 01A / 01B / 01C | 已存在且受 Git 管理 | 未修改 |

根仓库固定在 `main`。本任务没有修改 00B、00D、当前开发状态、01A、01B、01C 或其他文件，没有暂存、提交、推送或分支操作。

### 1.2 源码仓库

| 项目 | 开始快照 | 结束快照 |
| --- | --- | --- |
| 路径 | `01一些进度/产出/LocalFirstTradingLedger/` | 同左 |
| branch | `zhennn/w12-pnl-fee-accounting` | 相同 |
| HEAD | `1d8603f8747f64a5aff5fd94cefb8f96c01290e9` | 相同 |
| tree | `575ef0775f4fabf52be6431101beae4bc5812e19` | 相同 |
| `main` / `origin/main` | 均为 `279af4e3248c68306e857b8d0c8eeeaa03a29d6a` | 相同 |
| behind / ahead | `0 / 6` | `0 / 6` |
| staged / unstaged / untracked | 均无 | 均无 |
| ignored | `.next/`、`node_modules/`、`next-env.d.ts`、`tsconfig.tsbuildinfo`、`.DS_Store` | 仅构建类 ignored；无源文件漂移 |

候选相对 `main` 的实际完整范围是 `53 files changed, 1781 insertions, 191 deletions`。完整 diff 二进制 SHA-256 为 `8ca4a951822c4829a02c1106a8c850fc684de8e3b08524ce65c587192d77174c`。审查覆盖包括 README 同步提交在内的完整 HEAD，没有只测 `main` 或较早的五提交快照。

正式源码、正式测试、package 文件和 Git index 全程只读。运行 build 只产生 ignored artifact；没有修改、格式化、补测或修复候选。

## 二、01B 陈述独立对照

| 01B 陈述 | 独立结果 | 说明 |
| --- | --- | --- |
| 候选为该功能分支、自动化最终 57 files / 722 tests 通过 | 已确认 | 独立全量复跑得到同样数字；HEAD 另含最终 README / 报告同步提交 |
| 固定金额得到 6505 / 2602 / 2797 / 195 / 3903 | 已确认 | 从 Decimal 重放、正式测试和新建虚构 `.lftl` 页面三层确认 |
| 零费、多买、部分卖出、最终卖清严格归零 | 已确认 | 独立 ETH 页面流程和正式测试均通过 |
| 新账本与新金额事实为 USDT，schema 仍为 1 | 已确认 | 新建文件、交易、手工价、Binance 快照与外层 `.lftl` 均确认 |
| 旧 USD 兼容读取、禁止新增 USD | 部分确认 | 读取、计算、页面禁用和金额 / 币种保存均正确 |
| 旧 USD 锁定重开后“不发生静默迁移” | **与现场不一致** | 新的对抗 fixture 省略可选 `binanceMapping`；恢复保存后被补写 BTCUSDT 映射 |
| 异币 fee 原值可见、fee-sensitive 值 withholding | 已确认 | 5 BNB 保留；成本与净盈亏明确不可可靠计算，市值仍可显示 |
| 三图、响应式、导出、锁定重开、控制台全绿 | 已确认，含一项操作说明 | 三图存在；390×844 / 1280×720 正常；最终 console 列表为空。热力图在实机点击了空日期并清除筛选，活动日的精确 SVG 命中由正式交互测试补证 |
| 候选统计 `52 / 1773 / 187` | 与当前完整 HEAD 不同，但可解释 | 实际固定候选含最后 `1d8603f` 同步提交，为 `53 / 1781 / 191`；不是审查期间漂移 |

01B 使用的旧 USD 样例本身带有映射，因此没有覆盖“合法旧资产缺少可选 mapping”这一保存反例。开发侧 PASS 不构成独立通过。

## 三、Findings

### P0：旧 USD Asset 在恢复保存时被静默补写 Binance 映射

强制影响：`PNL-001 = FAIL`、`M11 = FAIL`、总判定 `FAIL`。

复现输入是结构合法的版本 1 虚构备份：BTC `quoteCurrency = USD`，两笔同币种手续费交易和一条 USD 手工价格；Asset 特意不包含可选 `binanceMapping`。真实 Chrome 预检为 1 Asset、2 Trades、1 Price、0 hard error、0 suspicious group，确认恢复、锁定重开、导出后比较原始 `ledgerData`：

```diff
 {
   "assets": [
     {
+      "binanceMapping": {
+        "baseAsset": "BTC",
+        "provider": "binance",
+        "quoteAsset": "USDT",
+        "symbol": "BTCUSDT"
+      },
       "createdAt": "2026-08-01T00:00:00.000Z",
```

其余 schema、USD quoteCurrency、Trade.currency、feeCurrency、totalValue、数量、价格和 PriceSnapshot.currency 均逐字段相同。因此这不是 USD→USDT 金额迁移，却仍是明确的 Asset 事实改写。

源码根因：

- `src/policies/ledgerFactPolicy.ts:96-113`：`normalizeLedgerDataForRuntime()` 给缺失的内置资产映射补默认值；
- `src/hooks/usePersistentLedger.ts:1388-1403`：备份导入在序列化和写入前调用该 normalize；
- `src/backup/backupImportPreflight.test.ts:117-137` 与 `src/policies/ledgerPolicies.test.ts:67-81`：正式测试明确期待 undefined mapping 被补齐，因此现有全绿不会发现本合同冲突。

这些路径不是本候选相对 `main` 的新改动，说明反例属于完整候选继承的既有行为；但 01C 审查的是完整工作树，并未允许用“非本批引入”豁免 M11。

最小修复方向：默认 Binance mapping 应只作为 runtime 派生配置使用，不能在旧账导入 / hydrate / 保存时写回缺失字段；增加“版本 1 / USD、mapping 字段缺失、恢复→保存→重开→导出后 `ledgerData` 深度相等”的永久正式回归。此处只记录方向，没有修改源码或测试。

## 四、PNL-001～003 结果

| 目标 | 结果 | 独立证据 |
| --- | --- | --- |
| `PNL-001` USDT 与成交金额 | **FAIL** | 新账本 USDT、schema 1、`totalValue` 不含 fee、旧 USD 金额币种不变和禁写均通过；但旧 Asset 缺 mapping 时保存补写字段，违反逐字段不变 |
| `PNL-002` 实际手续费进入确定性重放 | PASS | 固定样例、零费、多买、部分卖出、卖清、Decimal、缺价和异币 fee 全部从代码、测试和页面确认 |
| `PNL-003` 页面、摘要与三图 | PASS | 交易行、持仓、摘要、饼图、历史成本线、热力图和缺口文案来自同一派生口径；真实 Chrome 数值一致，控制台无错误 |

## 五、M01～M20 强制矩阵

| ID | 结果 | 源码证据 | 正式测试证据 | 页面 / 文件证据 |
| --- | --- | --- | --- | --- |
| M01 | PASS | `positionReplay` 与 cash-impact / summary service 共用 Decimal 口径 | 固定值精确断言通过 | 6505、2602、2797、195、3903；当前价 70000 后市值 4200、unrealized 297 |
| M02 | PASS | fee=`0` 走同一重放，无 FeeRule 参与 | 零费回归通过 | ETH 交易行显示 fee 0；结果与无费算法一致 |
| M03 | PASS | 每次 buy 将 `totalValue + fee` 加入 cost | 多买平均成本精确测试通过 | ETH 1000 + 2000，数量 2、均价 1500、成本 3000 |
| M04 | PASS | sell 按卖出前 average cost 移除 | 部分卖出回归通过 | 卖 0.5 ETH 后数量 1.5、成本 2250、realized 250 |
| M05 | PASS | 最终卖清分支直接清零 quantity / average / basis | 分摊小数和卖清测试通过 | 卖清剩余 1.5 ETH 后三项严格显示 0、realized 1000 |
| M06 | PASS | 买入 fee 仅进入 cost / total outflow；Trade.totalValue 不变 | Validator、trade service、replay 断言通过 | 成交金额 6500、fee 5、总支出 6505 分列 |
| M07 | PASS | 卖出 fee 从 net proceeds / realized 扣除，不改剩余成本公式 | 精确卖出测试通过 | 成交 2800、fee 3、净到账 2797、移除成本 2602、realized 195 |
| M08 | PASS | unrealized = 合法 marketValue - fee-aware costBasis | calculator / service 测试通过 | 4200 - 3903 = 297 |
| M09 | PASS | 缺价保留 `undefined`，图表断点不补零 | price selection / position / chart 测试通过 | 首笔买入后页面显示缺价，未用成交价或成本价伪造；异币成本线明确断开 |
| M10 | PASS | 内置资产、新 Trade / Price service、Binance merge 使用 USDT；schema 常量仍 1 | built-in、validator、service 测试通过 | 新 C 的资产 / 交易 / feeCurrency / 手工与 Binance 价格均为 USDT；三本 `.lftl` 外层 schema 1 |
| M11 | **FAIL** | import normalize 会把缺失 mapping 补写后序列化 | 现有测试反而锁定该补写行为，缺少逐字段保存回归 | 旧 USD 页面计算与禁写正确，但导出 diff 出现新增 `binanceMapping` |
| M12 | PASS | valuation display 明确近似语义，不接汇率写事实 | dashboard / chart 文案测试通过 | 页面就近显示 `1 USDT ≈ 1 USD`、未接实时汇率；单笔仍显示 USD 或 USDT |
| M13 | PASS | production create 拒绝非零异币 fee；runtime validator 兼容旧事实并生成 issue | validator / service / replay / summary / chart 测试通过 | 旧 5 BNB 原样显示；成本、realized、unrealized 均“不可可靠计算”，未按 0 或 USDT 猜算 |
| M14 | PASS | Dashboard、summary、position、chart data 复用 calculator / service | golden、interaction、ChartsOverview、option builder 测试通过 | 交易、持仓、摘要、饼图、历史线、热力图金额 / 币种 / 缺口一致 |
| M15 | PASS | `LedgerData` 仍仅事实集合；connection / envelope 格式未增派生字段 | backup、repository、persistence 399 项回归通过 | 主备份扫描无 cost / P&L / summary / Position / chart / fee issue；`.lftl` 外层只有加密双代字段 |
| M16 | PASS | 注释、Validator 与 service 均把 totalValue 定义为不含费乘积 | 容差与 fee 分离测试通过 | 页面标签为“成交金额（不含手续费）”；原始 JSON 保存 6500 / 2800 而非 6505 / 2797 |
| M17 | PASS | 业务重放使用 decimal.js；number 转换限制在 ECharts 绘制边界 | 极小数、重复分摊、最后卖清测试通过 | 实机卖清无残值；静态扫描未发现业务层原生浮点公式替代 |
| M18 | PASS | 时间线、超卖、未来事实、价格选择、Binance 失败保旧价、保存锁定恢复路径未被无关重写 | 定向回归与全量 722 项通过 | 三本虚构 C 均保存、锁定、重开；USD / foreign 页面状态保留 |
| M19 | PASS | diff 无 schema 2、格式 v2、FeeRule 计算、平台、NLP、编辑或整体 UI 重构 | 既有格式与安全测试通过 | `.lftl` fileFormatVersion 1、BackupEnvelope 1；无新数据入口 |
| M20 | PASS | 新增测试经过真实 replay / service / Dashboard 链；没有删测、skip 或放宽固定金额 | 57 files / 722 tests；关键金额为精确断言 | 测试体系未造绿；但 M11 的 mapping 缺口说明测试覆盖仍不足，不能推翻实际反例 |

## 六、自动化与质量门

所有命令均在冻结的源码候选运行，退出码均为 0，除下面明确记录的临时 helper 未执行外没有隐藏重试或改测。

### 6.1 定向正式测试

| 命令组 | 独立结果 |
| --- | --- |
| `npm test -- builtInAssets + 4 validators/services`（01C 7.1 第一组 6 文件） | 6 files / 91 tests PASS |
| `npm test -- positionReplay + positionCalculator + positionService` | 3 files / 16 tests PASS |
| `npm test -- priceSelection + Binance refresh + chartData` | 3 files / 23 tests PASS |
| `npm test -- chartOptionBuilders + ChartsOverview + 3 Dashboard tests` | 5 files / 53 tests PASS |
| 22 个 adapter / backup / composition / encryption / persistence / repository / ledger validator 文件 | 22 files / 399 tests PASS；仅 jsdom 输出既有 `Not implemented: navigation to another Document` 文本，无测试失败 |

最后一组实际显式覆盖 IndexedDB adapter、file connection / handle、backup download / envelope / preflight / report、BackupControls、三层 access controller / composition、session coordinator、`.lftl` contract / crypto、三组 `usePersistentLedger`、三组 repository 和 ledgerDataValidator。

### 6.2 完整质量门

| 命令 | 结果 |
| --- | --- |
| `npm test` | 57 files / 722 tests PASS，0 failed，0 skipped |
| `npm run typecheck` | PASS，无输出 |
| `npm run lint` | PASS，warning 上限 0，实际 0 |
| `npm run build` | PASS；Next.js 15.5.22；5 个静态页面；`/` First Load 404 kB |
| `git diff --check` | PASS |
| `git diff --check main...HEAD` | PASS |
| 根文档 `git diff --check` | PASS；01D 另做未跟踪文件尾空格检查 |
| `.only` / `.skip` / `debugger` / 意外 `console.log` / `console.debug` 扫描 | 无命中 |
| schema / FeeRule / NLP / 平台 / 格式越界扫描 | 无越界实现 |

正式测试没有通过删除安全场景、skip、批量替换所有 USD fixture、mock 掉重放或放宽固定金额来迎合实现。旧 USD fixture 与新 USDT fixture 共存；三图分别验证市值、含费成本线和交易计数。缺口是没有一条“旧 Asset 可选 mapping 缺失后仍逐字段不变”的永久保存回归，而已有 policy 测试还把补写当作预期。

## 七、真实 Chrome 与虚构文件证据

### 7.1 环境

- Google Chrome `151.0.7922.109`；真实用户 Chrome，不是内置 Chromium、jsdom 或开发者截图；
- production build：`http://127.0.0.1:3102/`；
- 真实 macOS Create / Open / Save picker；只选择本轮虚构文件；
- 视口：390×844 与 1280×720 均检查；页面级布局无横向溢出，宽内容保留局部容器，三图存在；
- 最终 `error / warning / warn` 控制台查询结果：`[]`；
- 从未打开、导入、覆盖、读取或删除任何个人账本。

由于 Chrome 语义层不能操作系统 picker 与 ECharts 内部像素，原生 picker 和视口截图使用本机 Computer Use 辅助；页面金额、DOM、交互和控制台仍通过受控的真实 Chrome 标签独立读取。

### 7.2 主 USDT 虚构账本

文件实际保存在用户提示的“文档”目录：

`/Users/zhuzhen0131/Documents/W12-PNL-REVIEW-INDEPENDENT-2026-08-10.lftl`

大小 9624 bytes；SHA-256 `5612da89ac41b3b6b5a68656461c263f281b78a2d1b4e3f4ec727976692014e9`。文件是专用虚构账本，但文件名没有按 01C 字面包含 `FAKE`，记为本轮证据命名偏差，不改变数据隔离事实。

页面独立结果：

- BTC buy：0.1 × 65000，`totalValue 6500`，fee 5；预览和交易行总支出 6505；
- BTC sell：0.04 × 70000，`totalValue 2800`，fee 3；净到账 2797、移除成本 2602、realized 195、remaining 3903；
- 手工价 70000：剩余市值 4200、unrealized 297；
- ETH 零费两买一卖：2 ETH、均价 1500、成本 3000；卖 0.5 后数量 1.5、成本 2250、realized 250；卖清后 quantity / average / cost 均严格 0、realized 1000；
- 最终组合摘要：买入总支出 9505、卖出净到账 6797、剩余成本 3903、realized 1195、unrealized 297；
- 饼图按市值 4200；历史线明确使用实际买入手续费；热力图记录 6 笔交易；
- 锁定、重新输入密码、打开同一 C 后数据保持。

主备份因原生 Save 对话框操作误把拟查看的地址文本保存为文件名，实际下载为：

`/Users/zhuzhen0131/Downloads/chrome-:downloads.json`

文件名异常只是操作痕迹；内容有效，大小 5267 bytes，SHA-256 `984456f883b3f07004c86bab59340fc19a5fe7d39cdcb64c3c4485b56dce5081`。其 top keys 为 `appVersion / backupFormatVersion / exportedAt / ledgerData / ledgerSchemaVersion`；LedgerData 仅 `schemaVersion / assets / trades / priceSnapshots / feeRules`，共 3 Assets、6 Trades、2 Prices、0 FeeRules。派生字段关键词扫描无命中。

### 7.3 旧 USD 虚构账本

`/Users/zhuzhen0131/Documents/W12-PNL-REVIEW-FAKE-USD-2026-08-10.lftl`

大小 3599 bytes；SHA-256 `3b99d22e628b0eaa04c86c83caa34074293568216cb99f24932b5fb447a72c29b`。

备份预检 1 Asset、2 Trades、1 Price、0 hard error、0 suspicious group。页面和锁定重开结果：quantity 0.6、average 102 USD、remaining 61.2 USD、realized 18.2 USD、market 90 USD、unrealized 28.8 USD、累计买入 102 USD、卖出净到账 59 USD；新增交易、手工价格和 Binance 刷新明确禁用，并提示新建 USDT 账本。

恢复后导出的 `/Users/zhuzhen0131/Downloads/W12-PNL-REVIEW-FAKE-USD-resaved-2026-08-10.json` 大小 2032 bytes、SHA-256 `e304796ae2a08d0d4f70b7d151c0310edc7c08b0fa7e244d4d2d03af702c4004`。它保留所有金额和 USD 币种，但出现 Findings 所述新增 mapping，因此 M11 失败。

### 7.4 异币手续费虚构账本

`/Users/zhuzhen0131/Documents/W12-PNL-REVIEW-FAKE-FOREIGN-FEE-2026-08-10.lftl`

大小 3938 bytes；SHA-256 `8cd9e7ce06b79ab8e719db940112f63687114cb3ee98ffb8e49d80fc5e2ef00c`。

真实页面预检 1 Asset、1 Trade、1 Price、0 hard error、0 suspicious group。旧 buy 保存 `6500 USDT + 5 BNB`；页面保留数量 0.1 和市值 7000 USDT，但 average cost、remaining cost、realized、unrealized 及累计买入均明确不可可靠计算；历史成本线显示 10 个因异币手续费无法换算的断点，饼图与热力图继续显示各自独立事实。锁定重开后 5 BNB 与 withholding 状态保持；切回手动价后仍是 70000 / 7000。

三本 `.lftl` 外层均只有 `crypto / current / fileFormatVersion / fileId / previous`，`fileFormatVersion = 1`，current / previous 的 `ledgerSchemaVersion = 1`，双代字段只含 ciphertext、iv、schema 与 revision identity。

### 7.5 页面操作偏差与临时文件

- 热力图在真实 Chrome 中成功点击一个空日期 `2026-02-06` 并清除筛选，证明页面筛选 / 解除链可用；ECharts 活动格精确像素命中没有在本轮重新取得，因此“筛选后活动交易行仍显示 fee / cash impact”主要由正式 Dashboard interaction 测试补证。它不改变已经出现的 M11 确定反例。
- 临时 fixture 位于 `/private/tmp`，不在正式源码或测试目录；一个辅助 `vite-node` helper 因候选没有本地 `vite-node` 可执行文件而未运行，实际 fixture 合法性由产品的真实备份预检确认。结束时删除这三份临时 helper / fixture；三本虚构 `.lftl` 与两份导出备份保留，便于用户复核。

## 八、持久化与防越界结论

- `LedgerData.schemaVersion`、`.lftl fileFormatVersion`、BackupEnvelope 均保持 1；
- 未新增 Position、summary、chart、cash impact、P&L 或 fee issue 持久化字段；
- IndexedDB connection 仍只保存文件句柄 / expected file identity 等少量连接信息；
- 没有 FeeRule 固定费 / 百分比计算，没有根据规则回推历史 fee；
- 没有平台字段、交易编辑、NLP、Python、Ollama、Agent、Notebook 或实时汇率；
- 没有保存链、加密、KDF、clear、revision、双代、文件选择和 legacy 迁移的本批无关改动；
- 没有复制改动到 `CS2026`，也没有操作论文 worktree；
- 唯一越过“原事实不改写”通过线的是 P0 finding 中的 legacy mapping 持久化。

## 九、PASS、FAIL 与 BLOCKED 汇总

### PASS

- `PNL-002`、`PNL-003`；
- M01～M10、M12～M20；
- 所有定向测试、全量测试、typecheck、lint、build、whitespace 与 debug / skip 扫描；
- 真实 Chrome 的主 USDT、零费、多买、部分卖、卖清、缺价、异币手续费、三图、响应式、导出与锁定重开；
- 派生不保存、schema / 文件格式、FeeRule / NLP / 平台 / CS2026 防越界。

### FAIL

- `PNL-001`：旧 Asset 缺少可选 mapping 时，恢复保存后没有保持 LedgerData 逐字段不变；
- `M11`：发生静默补写 `binanceMapping`；
- 总判定：`FAIL`。

### BLOCKED

- 无决定最终结论的环境阻塞；真实 Chrome、picker、production、文件和控制台证据均已取得。

## 十、历史边界与后续含义

Week 11 `02D = BLOCKED` 保持原状。本轮只使用虚构文件，不重做也不替代真实个人数据的 picker / C / permission / dual-tab / raw IndexedDB Gate；不得用本报告宣称真实个人数据 Gate 已通过。

因为 01D 为 `FAIL`：

1. 00B 的 `PNL-001～003` 保持未完成；
2. 本任务不更新 00B、00D 或当前开发状态；
3. 等待另行生成最小修复执行文档，修复 M11 后再用新候选重新独立审查；
4. 本报告保持未暂存，不提交、不推送。

## 十一、完成线

- [x] 冻结并复核完整候选 HEAD，开始 / 结束身份一致；
- [x] 正式源码与正式测试全程只读；
- [x] 独立阅读金额、币种、重放、价格、图表、页面和持久化边界；
- [x] PNL-001～003 与 M01～M20 均有单项结果；
- [x] 固定金额、零费、多买、部分卖、卖清、缺价、旧 USD、异币 fee 与 Decimal 均独立验证；
- [x] 定向、全量、typecheck、lint、build、whitespace 和测试质量审查完成；
- [x] 真实 Google Chrome 只使用虚构数据；
- [x] 防越界扫描完成；
- [x] 唯一新增根文档为本 01D；
- [x] 没有回写状态文件，没有 Git 写操作。
