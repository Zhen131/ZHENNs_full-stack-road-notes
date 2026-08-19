# 01C_W14-main｜账本 V3 现金仓位与资产行情执行报告

- 执行日期：2026-08-19
- 合同修订日期：2026-08-20
- 最终结论：`PASS（修订后的开发执行合同）`
- 源码轨道：长期账本产品 `main` 的功能分支
- 功能分支：`zhennn/w14-v3-cash-assets-market-data`
- 最后一个已确认安全的源码提交：`578f4a5af6551b321eb6677c555dd459fa2b168e`
- 产品定义：`01一些进度/日志/week14_260816/01A_W14-main-账本V3现金仓位与资产行情产品定义.md`
- 执行合同：`01一些进度/日志/week14_260816/01B_W14-main-账本V3现金仓位与资产行情执行文档.md`

## 结论

首次执行在 CH-07 遇到 Binance 无效 symbol 的 400 响应被 CORS 隔离，当时正确记为 `BLOCKED`。产品负责人随后明确选择“改良版 C”：页面无法读取 Binance 错误响应时，统一返回 `BINANCE_VALIDATION_UNAVAILABLE`，文案同时说明“交易对可能不存在”和“网络／服务／错误响应不可读”，不删除资产、不写 mapping、不请求 ticker、不自动重试。决策由根文档提交 `683d12ec60414880438889355eaaa727c7d94064` 固定。

恢复执行新增两个独立源码修复：`86d7ee416d54ed4ab8d3491ff319fc42ab62f1ee` 实现改良版 C；真实 Chrome 随后又发现普通 V3 B 可通过预检但 ready import 误要求历史 `Trade.rawText`，`578f4a5af6551b321eb6677c555dd459fa2b168e` 将该要求限定到显式历史模式，同时继续拒绝伪造冻结证据。任一源码／测试变化后都废弃旧绿灯并从头重测。

最后一轮有效自动化结果为：56 个本批定向文件、726 项测试通过；完整 `npm test` 为 84 个测试文件、911 项测试通过；typecheck、lint、production build、diff-check、schema 残留扫描、联网边界扫描、敏感数据与调试残留扫描全部通过。源码工作区干净，候选停留在本地功能分支，无 upstream、merge 或 push。

真实 Chrome 的 CH-01～CH-14 功能链已全部跑完；业务、文件、恢复、响应式与图表语义的观测结果均符合预期。原 01B 规定精确证据原点必须是 `http://127.0.0.1:3414`；该原点已有归属未知的旧账本连接，因此执行时没有读取、忘记、清空或覆盖它，而是在隔离的 `http://localhost:3414` 完成虚构链。在原合同下，localhost 不能冒充 127.0.0.1，故当时判定 `FAIL` 是诚实且正确的历史结论。

产品负责人随后正式认定固定 hostname 和固定端口属于过度约束。01B 现已修订为：使用 production build 和真实 Google Chrome；执行开始时选择并记录一个专用测试原点；hostname 可为 `localhost` 或 `127.0.0.1`，端口可动态选择；CH-01～CH-14 全链必须始终使用同一协议、hostname 和端口；环境必须隔离且不得触碰未知旧连接。固定 `3414`／`127.0.0.1` 不再单独构成开发候选硬门。

重新审阅现有记录后，最终 CH-01～CH-14 明确全部来自同一个 `http://localhost:3414`，没有中途更换原点；该环境只承载专用虚构证据，与 `127.0.0.1` 的未知连接状态隔离，实际启动命令、Chrome 版本、冻结源码、虚构文件、Console 和 Network 观测均有记录。因此现有完整链满足修订后的单一隔离原点合同，当前结论重新归类为 `PASS（修订后的开发执行合同）`。

本轮只修改 01B 与 01C，没有 source、test、config 或 fixture 变化，没有重新运行或伪造自动测试／Chrome 证据；既有最终自动化和 localhost 完整链未因本轮文档修改失效。该 `PASS` 仅是本地开发候选结论，不是独立复审 `PASS` 或最终发布，不授权真实 B、merge、push、删除分支、更新 00B 或独立验收记录。

## 开始前现场

| 仓库 | 路径／分支 | HEAD | 工作区 | 相对远端 | 结论 |
| --- | --- | --- | --- | --- | --- |
| 根文档仓库 | 工作区根目录／`main` | `cf8388c17a6cbaae04295b308823f70284c7dde0` | clean | `origin/main...HEAD = 0/4` | 与预期一致 |
| 长期产品源码 | `01一些进度/产出/LocalFirstTradingLedger/`／`main` | `0d0cb555e5d2fac1660ac51e7b577bcb9710582d` | clean | `origin/main...HEAD = 0/0` | 与预期一致；目标分支尚不存在 |

未执行 fetch、pull、清理或吸收用户改动；未进入 CS2026、NLP、外部参考项目、自然语言整理、投资归档或私人网络文件。

## 基线质量门

以下结果取得于源码 `main@0d0cb555e5d2fac1660ac51e7b577bcb9710582d`，之后才创建功能分支；73／797 仅是实施前基线，不作为 V3 最终测试数量。

| 命令 | 退出码 | 真实结果 |
| --- | ---: | --- |
| `npm test` | 0 | 73 个测试文件、797 项测试通过 |
| `npm run typecheck` | 0 | 零 TypeScript 错误 |
| `npm run lint` | 0 | 零 warning、零 error |
| `npm run build` | 0 | Next.js production build 完成 |
| `git diff --check` | 0 | 无空白错误 |

基线后确认工作区干净，创建 `zhennn/w14-v3-cash-assets-market-data`，未设置 upstream，并建立唯一空 checkpoint。

## 八阶段提交

| 阶段 | 完整提交 | 范围 | 阶段证据 |
| --- | --- | --- | --- |
| 1. 基线与分支 | `c99419f018e4e70e395f1c460d65c18e1ce58aab` `chore: mark Week 14 V3 baseline` | 干净基线、指定功能分支、无 upstream | 基线 73 files / 797 tests；全部质量门通过 |
| 2. V3 核心合同 | `df64314fc1312a338462091b72b4725f6739f02b` `feat: define V3 cash ledger contract` | schema 3、CashEvent、显式 mapping、全局校验、cash replay、交易现金 delta | core models／validation／state／calculation 与最小 C payload 定向测试通过 |
| 3. 现金业务闭环 | `3b350424ef6fb00f70d374d0f4952b3449aab181` `feat: complete cash event workflow` | 四类现金事实、校准、负现金二次确认、交易预览与删除重放 | cash／trade／form／stale confirmation 定向测试通过 |
| 4. 本地资产 | `da5b10775693e801c5c95e201e4969d01b8564f8` `feat: add local asset lifecycle` | 离线新增、完整依赖扫描、mapping 与资产删除分离、手动价格 | assets／Settings／manual price／零 fetch 定向测试通过 |
| 5. 显式 Binance | `2263b2e67370a1e87091dfeee0d219d4e992d298` `feat: make Binance mapping explicitly user driven` | 删除隐式刷新与 fallback；四类点击联网；operation／epoch／abort 防旧写回 | client／mapping／refresh／MarketDataControls 与零意外 fetch 定向测试通过 |
| 6. V3 B/C | `aa40752396b6f8ce985fcea26711165368a796dc` `feat: upgrade backup and ledger file payloads to V3` | BackupEnvelopeV3、V2 拒绝、原子导入、C 内部 schema 3、双代与 fail-closed | B/C 文件安全闭集 16 个文件、330 项测试通过 |
| 7. 跨页收口 | `145920e34c3773d886f12e852b2d8789d4c898e7` `feat: integrate cash into portfolio views` | activity、统一 projection、首页／持仓／分配／趋势、P&L 与热力图隔离、响应式与 a11y | 11 个文件、103 项定向测试通过 |
| 8. 总验证与交接 | `c5771b40723f2c481527e939e58edadeafd9935b` `test: complete Week 14 V3 regression coverage` | 虚构 canonical V3 回归场景与集成断言 | 新增回归文件 1 个、3 项测试通过；随后进入全量闭环 |

八个固定阶段提交均保留，除 checkpoint 外均为非空提交；没有 amend、squash 或改写历史。

## 额外 fix 提交

| 完整提交 | 发现的问题 | 依据与处理 | 重测 |
| --- | --- | --- | --- |
| `9ebcbfaae725ea74357deea874925cb7f371e4cb` `fix: ignore iCloud conflict copies during checks` | iCloud 名称带 ` 2.ts/tsx` 的冲突副本会被 TypeScript 检查误纳入 | 只收紧 `tsconfig.json` 排除模式，不删除文件、不改变业务 | 相关检查恢复通过 |
| `f38f43412326e56f8a3607e86bab074c7fc0c703` `fix: enforce globally unique fact IDs` | Trade 与 FeeRule 的旧 ID 生成入口未覆盖 V3 跨集合唯一性和三次碰撞上限 | 按 01A／01B 的全局 ID 合同补齐 service 与 UI 入口，不放宽 validator | Trade／FeeRule 碰撞与耗尽回归通过 |
| `245150173272c848d334535beb42e89749cbf853` `fix: align V3 regression fixtures with USDT contract` | 第一轮定向闭集有 3 项旧 fixture／期望仍按 USD 或错误 FeeRule 引用 | V3 只接受 USDT；非法 USD 不聚合；feeRuleId 必须与事实引用匹配 | 直接相关 3 个文件、67 项测试通过；随后重新全量测试 |
| `b71987b4a5c37cdd0e7d62f07aeb4215d198588e` `fix: keep cash feature imports within module boundaries` | 完整测试的 source layout 规则发现 cash feature 内部通过稳定入口自引用 | 改为模块内相对导入；行为和数据合同不变 | sourceLayout + CashEventPanel 共 2 个文件、12 项测试通过；随后重新全量测试 |
| `59ee9235b98b5182784f81d1c8225f8f55cc0186` `fix: preserve keyboard actions in activity rows` | 真实 Chrome 390px 键盘路径发现删除按钮 Enter／Space 冒泡到整行，展开详情而不进入二次确认 | 行级键盘处理忽略 button／link／input／select；新增 ActivityTable 正式键盘回归 | 新测试 1 file / 1 test；本批 55／713、全量 84／900 和全部质量门重新通过 |
| `86d7ee416d54ed4ab8d3491ff319fc42ab62f1ee` `fix: report unavailable Binance validation honestly` | Binance 无效 symbol 的 400 错误响应被 CORS 隔离，浏览器不能安全区分 missing、断网、429 或 5xx | 按产品决定实现 `BINANCE_VALIDATION_UNAVAILABLE`；不新增代理、诊断请求、全量列表或自动重试；失败零 mutation | client／mapping／controls／导入后配对的正式回归通过；随后全量重测 |
| `578f4a5af6551b321eb6677c555dd459fa2b168e` `fix: allow normal V3 backups through ready import` | 真实 Chrome 中普通 V3 B 预检为零硬错，但 ready import 被历史 `Trade.rawText` 授权条件误拒绝 | 将 `requireHistoricalRawText` 绑定到真实冻结证据、context 与 session；普通 V3 保持 rawText 可选，显式历史模式仍强制，伪造证据仍零写入拒绝 | 导入授权、hook 与 file repository 回归通过；随后重跑 56／726、84／911 及全部质量门 |

额外 fix 共 7 个，全部独立提交；没有 amend 或 squash。

## 全量测试—修复闭环

### 第 1 轮：本批定向闭集发现 fixture 口径问题

- 源码 HEAD：`c5771b40723f2c481527e939e58edadeafd9935b`
- `npx vitest run <本批新增或修改的 54 个测试文件>`：54 files / 712 tests，3 项失败。
- 失败：完整备份 Trade 缺少匹配 FeeRule；position 与 P&L 旧断言仍期待 V3 不支持的 USD。
- 处理：回查 01A／01B 后修正正式 fixture／断言，建立 `2451501...`；直接相关 3 files / 67 tests 通过。

### 第 2 轮：完整测试发现模块边界问题

- 源码 HEAD：`245150173272c848d334535beb42e89749cbf853`
- 同一 54 文件定向闭集：54 files / 712 tests 全部通过。
- `npm test`：83 files / 899 tests 中 `src/architecture/sourceLayout.test.ts` 失败。
- 根因：`CashEventPanel.tsx` 从 cash feature 内部导入自身稳定入口。
- 处理：改为模块内相对导入，建立 `b71987b...`；直接相关 2 files / 12 tests 通过。

### 第 3 轮：自动化全绿，Chrome 发现键盘问题

- 源码 HEAD：`b71987b4a5c37cdd0e7d62f07aeb4215d198588e`
- 定向闭集：54 files / 712 tests 全部通过。
- 完整测试：83 files / 899 tests 全部通过。
- typecheck、lint、build、diff-check、版本和联网扫描全部通过。
- 真实 Chrome CH-01～CH-05 业务链完成；CH-13 预检发现统一流水键盘删除被行级 Enter／Space 截获。
- 处理：按 01B 的键盘和焦点合同修复根因，新增正式回归，建立 `59ee923...`。源码发生变化，旧自动化绿灯与旧 Chrome 链全部作废。

### 第 4 轮：最后一轮有效自动化结果

- 源码 HEAD：`59ee9235b98b5182784f81d1c8225f8f55cc0186`
- 新回归：`src/features/activity/ActivityTable.test.tsx`，1 file / 1 test 通过。
- 本批 diff 定向闭集：55 files / 713 tests 全部通过。
- `npm test`：84 files / 900 tests 全部通过。
- `npm run typecheck`：退出 0，零错误。
- `npm run lint`：退出 0，零 warning、零 error。
- `npm run build`：退出 0，Next.js 15.5.22 production build 完成；`/` route 337 kB，First Load JS 440 kB。
- `git diff --check` 与 `git diff --check main...HEAD`：退出 0。
- 版本残留扫描：通过。生产账本、B 与 generation 均为 V3；允许的 V2 只剩明确拒绝 fixture／断言及 C 外层 `fileFormatVersion = 2`。
- 联网边界扫描：通过。可达 Binance 的生产入口仍只有用户点击验证、单资产刷新、全局刷新和导入后配对；无 API key、WebSocket、timer polling、自动 retry 或 mount refresh。

该轮自动化没有未解决失败。它是首次 `BLOCKED` 前的有效史料；产品决策和后续源码修改使该轮绿灯不再能作为最终结果。

### 第 5 轮：改良版 C 与普通 V3 导入修复后的最终结果

- 源码 HEAD：`578f4a5af6551b321eb6677c555dd459fa2b168e`。
- 本批 diff 定向闭集：56 files / 726 tests 全部通过。
- `npm test`：84 files / 911 tests 全部通过。
- `npm run typecheck`：退出 0，零 TypeScript 错误。
- `npm run lint`：退出 0，零 warning、零 error。
- `npm run build`：退出 0，Next.js 15.5.22 production build 完成；`/` route 338 kB，First Load JS 440 kB。
- `git diff --check` 与 `git diff --check main...HEAD`：退出 0。
- schema 扫描：生产 LedgerData、B 和 C 内部均为 V3；只保留明确 V2 拒绝 fixture／断言与 C 外层 `fileFormatVersion = 2`。
- 联网扫描：生产域名只有 `https://data-api.binance.vision`；只有单 symbol `exchangeInfo` 与 ticker；无代理、API key、WebSocket、全量 `exchangeInfo`、多供应商、mount refresh、timer polling 或自动 retry。
- 调试／测试扫描：无 `console.log`、`console.debug`、`debugger`、`.only`、`.skip`；没有新增敏感文件或二进制 diff。
- fixture 扫描：回归中明确使用“虚构历史交易原句，非真实用户数据”。

本轮自动化没有未解决失败。原报告的 `FAIL` 只来自 Chrome 证据原点不符合当时 01B 的精确地址合同，不是源码、测试或功能链失败；该历史结论继续保留，当前结论则依据修订后的合同重新归类。

## 首次 `BLOCKED` 执行的历史 Chrome 记录

- Chrome：Google Chrome `151.0.7922.140`
- 环境：production build，`npm run start -- --port 3414`，`http://127.0.0.1:3414`
- 最终源码：`zhennn/w14-v3-cash-assets-market-data@59ee9235b98b5182784f81d1c8225f8f55cc0186`
- 虚构目录：`/private/tmp/w14-v3-chrome.YfKel6`
- 数据边界：只使用本轮虚构 C、资产、金额、备注和一次性密码；没有创建、复制、读取或导入任何个人 B/C。

| 步骤 | 结果 | 实际证据 |
| --- | --- | --- |
| CH-01 | `PASS` | 真实 Chrome 与 macOS 原生保存选择器创建 `w14-v3-fictional-primary.lftl`；C 外层 `fileFormatVersion = 2`、内部 `ledgerSchemaVersion = 3`；BTC／ETH／ADA 可见、现金 0；首次行情点击前 Binance 请求 0，Console warning/error 0。 |
| CH-02 | `PASS` | 依次入金 1000、出金 100、外部支出 50、校准目标 800；四条现金事实可见；校准显示 before 850、target 800、adjustment -50；余额 800。 |
| CH-03 | `PASS` | 离线新增 SOL；买入 total 900、fee 5 USDT。负现金确认显示当前 800、delta -905、结果 -105、缺口 105；第一次取消后零 Trade／零 mutation，第二次确认后恰好一条买入 Trade，现金 -105，负现金没有伪正分配。 |
| CH-04 | `PASS` | 卖出 SOL total 200、fee 2 USDT 后现金 93；流水详情展示 fact ID、type、currency、date、timePrecision、createdAt、updatedAt；删除外部支出 50 经二段确认和 5 秒撤销窗后，事实数 6→5，现金重放为 143。 |
| CH-05 | `PASS` | DevTools 明确切到 `Presets: Offline`；离线新增 KNIGHT，记账表单可选，保存 7 USDT 手动价格；恢复 online 并用最新 production build 原生重选／重开 primary 后，KNIGHT、mapping=null 和 `7 USDT · 手动` 均持久化；该段 Binance 请求 0。 |
| CH-06 | `PASS` | `SOL` 与 ` solusdt ` 都规范化为 SOLUSDT；每次明确点击均观察到 `exchangeInfo 200 → mapping 保存 → ticker 200`，页面显示“映射与首次价格均已保存”；明确点击“刷新该资产”再次得到 exchangeInfo 200→ticker 200；等待后无后台第二轮。 |
| CH-07 | `BLOCKED` | KNIGHT 明确点击验证时只有一个 `exchangeInfo?symbol=KNIGHTUSDT`；DevTools 显示 `400 Bad Request`、Fetch request failed、0 B，页面显示 `BINANCE_NETWORK_ERROR · 网络不可用`。独立公共响应为 `-1121 Invalid symbol`，但缺少 CORS 允许头，页面脚本不能读取 400／JSON。KNIGHT 未删除、mapping 仍为 null、7 USDT 手动价保留、没有 ticker 或自动重试。无法按 01B 唯一安全修复，停止后续写入。 |
| CH-08 | 未执行 | 依赖 CH-07 完整通过；没有导出合法 V3 B，不能跳步。 |
| CH-09 | 未执行 | 没有创建 import-target C 或导入 B。 |
| CH-10 | 未执行 | 没有取得合法导入后的缺 mapping 状态。 |
| CH-11 | 未执行 | 没有生成或导入 invalid-cash V3／V2 B；不以自动测试代替真实文件链。 |
| CH-12 | 未执行 | primary 已有相邻 current／previous 双代，但没有执行损坏 current 副本与 previous 恢复，不能计为通过。 |
| CH-13 | 未执行 | 前一轮局部检查发现并修复键盘缺陷；源码变化后该轮证据作废。最后一轮有效 Chrome 链在 CH-07 停止，不能复用旧结果。 |
| CH-14 | 未执行 | 没有完成最后一轮 CH 全链，不能以局部首页查看或自动测试替代总账、图表与全程日志复核。 |

该次历史执行的 CH-01～CH-14 总体结果为 `BLOCKED`，不是 `PASS`。后续产品决策、源码修复和新鲜全链见下文。

## 首次执行的历史 Console、Network、picker 与虚构文件证据

| 证据 | 结果 |
| --- | --- |
| Console | 最终 production Chrome 标签页通过开发者日志接口读取，warning/error 共 0。DevTools Issues 的静态改进提示不计为 Console 错误。 |
| Network | CH-05 Binance 0；CH-06 每次明确动作均只有预期的 exchangeInfo→ticker，等待后无第二轮；CH-07 只有 KNIGHT exchangeInfo 400，无 ticker、无 retry。没有发现解锁、切页、本地资产、手动价或 C 文件操作触发的意外 Binance 请求。 |
| 原生 picker | 首次运行由 macOS 原生保存选择器创建 primary；源码修复并重新 production build 后，再由原生重选路径打开同一虚构 primary 并成功解锁。第一次锁屏阻塞已由用户解锁并以防休眠恢复，不再是最终 blocker。 |
| 虚构 C | `w14-v3-fictional-primary.lftl` 为外层 V2／内部 schema 3；current 与 previous 均为 schema 3，`current.parentRevisionId === previous.revisionId`。未记录密码、salt、IV、ciphertext 或完整 revision ID。 |
| 虚构 B | 因 CH-07 阻塞，未导出 V3 B，也未生成 invalid-cash／V2 B。没有个人 B/C 或真实投资数据进入浏览器、临时目录、源码或报告。 |

## 已解决问题 B-01：macOS 自动锁屏

最初 Chrome 运行在 CH-01 原生保存选择器时，Mac 自动锁屏，连续检查均需要用户手动解锁，因此第一版 01C 记录为 `BLOCKED`。用户随后明确解锁；本轮启动防休眠，成功完成原生 primary 创建／重选、CH-01～CH-06 和新的网络调查。B-01 已解决，不再是最终 blocker。

## 历史问题 B-02：Binance 无效 symbol 的 400 响应被 CORS 隔离

| 字段 | 记录 |
| --- | --- |
| 问题编号 | `B-02` |
| 发现位置 | 最后一轮真实 Chrome `CH-07`，KNIGHT 点击“验证并保存” |
| 失败步骤 | production Chrome 请求 `GET https://data-api.binance.vision/api/v3/exchangeInfo?symbol=KNIGHTUSDT` |
| 01B 预期 | 无交易对应返回 `BINANCE_SYMBOL_MISSING`；KNIGHT 保留、mapping=null、手动价保留；无 ticker、无 retry |
| 实际结果 | DevTools 看到 HTTP 400 与 Fetch request failed；公共 JSON 为 `{"code":-1121,"msg":"Invalid symbol."}`；响应没有 `Access-Control-Allow-Origin`，页面 `fetch` 抛异常并返回 `BINANCE_NETWORK_ERROR` |
| 涉及模块 | `src/platform/integrations/binanceMarketDataClient.ts` 的 `requestJson`／`validateSpotSymbol`；`src/features/market-data/binanceMappingService.ts`；`MarketDataControls.tsx` 的显式验证与导入后配对 |
| 数据／安全影响 | 本次失败零 mutation：KNIGHT、SOL、现金、Trade、手动价和 C 双代均未破坏。若猜测处理，可能错误区分断网、429、500 与不存在 symbol，或引入新的服务器网络边界 |
| 安全调查 | 确认 DevTools 为 No throttling；同一会话 SOL exchangeInfo／ticker 均为 200；KNIGHT 只有一项 400，无 ticker／retry；带 localhost Origin 的公共 curl 仍缺少 CORS 允许头；Binance 官方文档确认无效 symbol 使用 `-1121 Invalid symbol`，并推荐 `data-api.binance.vision` 作为公开行情地址；回查 01A／01B 的联网、失败码、无代理、无全量列表和无重试合同 |
| 01A／01B 为什么不足 | 文档假定页面能读取 Binance HTTP 错误，没有定义错误响应被浏览器 CORS 隔离时的降级。01B 又要求精确区分 network、timeout、418／429、其他 HTTP 和 missing，并禁止代理、全量 exchangeInfo 与自动 retry；现有合同无法同时满足这些条件 |
| 为什么没有修改 | 浏览器侧无法从同一个 `TypeError` 安全得知原始状态是 400／-1121、断网、DNS、CORS、429 还是 5xx。把任一 fetch 异常猜成 missing 会破坏 NET-04；新增网络探针、同源代理或全量列表都改变已冻结的网络／安全行为 |
| 方案 A | 新增同源 server route／代理读取 Binance 400 body，再把精确状态返回浏览器。优点是能识别 -1121；代价是新增服务器部署、代理、隐私与可用性边界，和当前“无代理”扫描合同冲突 |
| 方案 B | exchangeInfo 发生 CORS fetch 异常后，再调用另一个只包含该 candidate 的公开 ticker／状态探针。优点是不建代理；代价是新增自动网络请求，仍不能可靠区分所有 4xx／5xx，且与“无重试／准确顺序”冲突 |
| 方案 C | 接受真实 Chrome 下此场景显示 `BINANCE_NETWORK_ERROR`，修改 CH-07／测试预期，把“无交易对”和“错误响应不可读”合并。实现最小，但会降低错误可解释性并改变 01B 已固定口径 |
| 方案 D | 请求或缓存全量 exchangeInfo 后本地判断。可避免无效 symbol 400，但 01B 已明确禁止全量 exchangeInfo，且扩大数据量、缓存与刷新策略 |
| 需要产品负责人决定 | 选择允许的新网络边界，或授权修改 01B 的错误口径／禁止事项；在决定前不能安全继续 |
| 最后安全提交 | `59ee9235b98b5182784f81d1c8225f8f55cc0186` |
| 未提交源码 diff | 无；源码工作区 clean |
| 对真实 B 的影响 | CH-01～CH-14 与独立复审未完成，第一次真实 B 导入继续禁止 |

官方接口参考：

- [Binance Spot REST API](https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md)：无效 `symbol` 会返回 Invalid symbol；公开行情建议使用 `data-api.binance.vision`。
- [Binance Spot 错误码](https://github.com/binance/binance-spot-api-docs/blob/master/errors.md)：`-1121 BAD_SYMBOL`。

## 改良版 C 恢复执行：最终 Chrome CH-01～CH-14

- Chrome：Google Chrome `151.0.7922.140`。
- 生产启动：`npm run start -- --port 3414`。
- 原 01B 指定原点：`http://127.0.0.1:3414`。
- 修订后的 01B：允许执行开始时选择并记录 `localhost` 或 `127.0.0.1` 与任意可用端口，但整条证据链必须保持同一个精确隔离原点。
- 实际虚构链原点：`http://localhost:3414`。
- 全链一致性：CH-01～CH-14 的全部最终观测均来自上述实际原点，没有中途更换协议、hostname 或端口。
- 最终源码：`zhennn/w14-v3-cash-assets-market-data@578f4a5af6551b321eb6677c555dd459fa2b168e`。
- 虚构证据目录：`/private/tmp/w14-v3-chrome-proof.kl6Ukx`。
- 数据边界：只使用虚构资产、金额、备注、密码和 B／C；没有读取、复制或导入真实用户账本或投资数据。

`127.0.0.1` 原点的归属未知旧连接被原样保留，没有读取、忘记、清空、覆盖或重新绑定。下表的“功能符合”只记录 localhost 隔离链中的观测：它在原精确地址合同下不能换算为 `PASS`，但满足修订后的单一隔离原点合同。

| 步骤 | 功能观测 | 新鲜证据 |
| --- | --- | --- |
| CH-01 | 符合 | 真实 Chrome 与 macOS 原生保存面板创建 `w14-v3-fictional-primary.lftl`；C 外层 `fileFormatVersion = 2`、内部 `ledgerSchemaVersion = 3`、`previous = null`；BTC／ETH／ADA 可见，现金 0。 |
| CH-02 | 符合 | 依次保存入金 1000、出金 100、外部支出 50、校准目标 800；校准显示 before 850、target 800、adjustment -50；4 条现金事实、余额 800。 |
| CH-03 | 符合 | 本地 SOL 的 mapping 为 null；买入 quantity 9、price 100、total 900、fee 5。负现金确认显示当前 800、delta -905、结果 -105、缺口 105；首次取消零写入，二次确认后恰好 1 条 SOL 买入，没有伪正现金扇区。 |
| CH-04 | 符合 | SOL 卖出 total 200、fee 2 后现金 93；统一流水详情显示 fact ID、type、currency、date、timePrecision、createdAt、updatedAt；外部支出经二段确认与 5 秒撤销窗后事实 6→5、现金 143。 |
| CH-05 | 符合 | DevTools 明确切换 Offline；离线新增 KNIGHT，保存买入 quantity 10、price 1 以及 2026-08-15=7、2026-08-18=9 两个手动价；离线锁定／解锁后现金 133、mapping=null、最新手动价 9 均持久化。 |
| CH-06 | 符合 | 明确恢复 Online；`SOL` 与 ` solusdt ` 均得到 SOLUSDT candidate 并成功；mapping 先落盘，随后 ticker 价格落盘；单资产刷新成功，页面曾显示 `78.43000000 USDT · Binance`；等待期间无后台第二轮。 |
| CH-07 | 符合 | KNIGHT 明确验证后显示 `BINANCE_VALIDATION_UNAVAILABLE`及改良版 C 完整文案；KNIGHT 保留、mapping=null、手动价 9 保留，无 ticker 与自动重试。随后离线切页、入金 1、保存 2026-08-19=11 手动价、锁定／解锁后，现金 134 与手动价 11 仍在。 |
| CH-08 | 符合 | SOL mapping 经二段确认删除，已有 API 价格事实保留；原生下载导出合法 V3 B，再复制为 `B.json`，两者 SHA-256 均为 `7a9843fe66cce883ac2bca69c7b4fb8c4730accba430a8e969e81df8d9e3cb05`；锁定后无工作区明文与可编辑状态。 |
| CH-09 | 符合 | 原生新建 import-target C，原生选择 `B.json`；预检为 B3／schema3、5 资产、3 Trade、4 现金事实、4 价格、0 规则、现金 134、硬错 0，缺 mapping 为 KNIGHT／SOL，hash 完全一致。首次确认恢复暴露 ready-import rawText 缺陷；修复并从头重跑后成功落盘，首页现金 134、流水 7 条、资产／交易／手动价完整。 |
| CH-10 | 符合 | 在独立 pairing-target 中重复 CH-09，导入后面板列出 KNIGHT／SOL。首次因 Offline 残留两项均 unavailable；明确切回 Online 且只有手动点击“重试仍缺失的资产”才再联网。最终 SOL mapping 与价格各落盘 1 项，KNIGHT 仍 unavailable；现金 134、7 条事实、KNIGHT 手动价 11 无回滚。 |
| CH-11 | 符合 | 从真实 Chrome 创建的 import-target 中取导入前真实空 `previous` 修订，机械生成两个专用空 C，再由原生 picker 分别选中。invalid-cash V3 精确报 `LEDGER_DATA_INVALID_ENTITY · cashEvents[0].amount · must be greater than 0`；V2 报 `BACKUP_UNSUPPORTED_FORMAT_VERSION · 这是 V2 备份；V3 不提供迁移`。两个 C 拒绝前后 hash 均为 `e3753bc31e2edf50c87a657f2dc39d0cf5f5f494f60098e2ceff811f2cda2791`，current revision 不变、`previous=null`、现金 0。 |
| CH-12 | 符合 | primary 连续入金 2 与 3，每次等到“已保存到加密文件”，现金 136→139，current／previous 严格相邻；锁定重开 current 为 139。仅改动副本 current ciphertext 第一字符，副本与 primary 中的 previous 对象 SHA-256 完全一致。解锁时损坏 current 被拒绝，页面明确“最新一次保存没有恢复”；确认后由 previous 生成新 current，复读现金 136。 |
| CH-13 | 符合 | 默认 1495×812 与显式 390×844 viewport 均满足 `scrollWidth === clientWidth`。两种尺寸下现金／KNIGHT 表单切换无过期表单；资产／类型／准确日期筛选正确；Enter 可展开／收起详情、清除筛选、打开危险确认与取消；取消后现金 136 和数据完整。 |
| CH-14 | 符合 | 首页显示净总资产 795.01、现金 136、SOL 549.01、KNIGHT 110；分配恰好 3 个正资产扇区。现金从 134 变到 136 后，已实现／未实现盈亏仍为 -3.111111…／-54.878888…，证明 P&L 不吸收现金事实。趋势文案明确“总资产逐日重放现金与可得行情；成本线仍只读取交易”；热力图仅显示 8月14日 1 笔买入、8月19日 1 买 1 卖，未把 5 条现金事实计为交易。页面标题仅有总资产／成本趋势、分配、P&L 与交易热力图，没有单币价格图。Console warning/error 为 0。 |

功能观测合计为 CH-01～CH-14 全部符合，且所有最终观测均来自同一个隔离的 `http://localhost:3414`。依修订后的合同，当前开发执行结论为 `PASS（修订后的开发执行合同）`；原精确地址合同下的 `FAIL` 仍作为历史保留。

### 最终文件与运行证据

| 证据 | 结果 |
| --- | --- |
| 合法 B | `B.json` 为 Backup V3／schema 3，5 资产、3 Trade、4 现金事实、4 价格，现金 134；SHA-256 `7a9843fe66cce883ac2bca69c7b4fb8c4730accba430a8e969e81df8d9e3cb05`。 |
| invalid-cash V3 | SHA-256 `83023edc8ffdc8848612bc276329dbfb9644ba90ac98cf3f540a8f0f7947f408`。 |
| V2 B | SHA-256 `901605845c5dbefa259082b4885d9b6d5fbd00e534d19dac437781f9c901c301`。 |
| primary C | 最终双代为 current `c5bdedc4…`／previous `0403a9b9…`，`current.parentRevisionId === previous.revisionId`；SHA-256 `6817febd51c3207c9bee5513705c30987d2477e015dacb385af10ebdc5d9c804`。 |
| recovered C | 损坏 current 恢复后的新 current 为 `cc0e3de7…`，parent 与 previous 均为 `0403a9b9…`；SHA-256 `e6f1f46413c934798b9eb663830f15fa6f5ac54762bf60b24b8c5507459e9706`。 |
| 零写入 C | invalid-cash-target 与 v2-target 拒绝后 SHA-256 均为 `e3753bc31e2edf50c87a657f2dc39d0cf5f5f494f60098e2ceff811f2cda2791`，修订与 `previous=null` 不变。 |
| picker | C 的创建／重选、B 的导出／选择均走 macOS 原生面板；用户曾手动帮助选中一次 `B.json`，其余由执行者完成。 |
| Console | 最终页面开发者日志 warning/error 共 0。 |
| Network 边界 | 无可导出的 raw HAR；请求次数／顺序证据来自明确点击前后页面状态、等待无第二轮的观察，以及冻结 HEAD 的代码／正式测试／联网扫描；不冒充为完整 DevTools HAR。 |
| 临时截图 | 为检查隐藏系统提示而产生的全屏临时截图已从 `/private/tmp` 删除，不可恢复；不作为验收证据。 |

### B-02 决策与解决状态

- 决策：选择改良版 C，而不是代理、额外诊断请求或全量列表。
- 失败码：`BINANCE_VALIDATION_UNAVAILABLE`。
- 用户可见口径：无法确认时同时保留“交易对可能不存在”和“错误响应不可读／网络或服务不可用”两种真实可能。
- 失败边界：资产、历史交易与手动价不改，mapping 不写，ticker 不请求，没有自动 retry／poll。
- 实现提交：`86d7ee416d54ed4ab8d3491ff319fc42ab62f1ee`。
- 真实 Chrome：KNIGHT 稳定进入 unavailable；SOL 在 Online 且明确手动重试后成功，证明改良版 C 没有把全部网络结果猜成 missing。
- 结论：B-02 已解决，不再是 blocker。原合同下的 `FAIL` 与 B-02 无关，只由精确 Chrome 原点不符合产生；本次合同修订不改变 B-02 的实现或证据。

## 最终 Git 现场

### 源码仓库

- 当前分支：`zhennn/w14-v3-cash-assets-market-data`
- HEAD：`578f4a5af6551b321eb6677c555dd459fa2b168e`
- `main`：仍为 `0d0cb555e5d2fac1660ac51e7b577bcb9710582d`
- 工作区：clean，无 staged、unstaged、untracked
- `origin/main...HEAD = 0/15`
- upstream：无
- 固定阶段提交：8 个；额外 fix：7 个

### 根文档仓库

- 本次合同修订提交前：`main@7098a493f253bdb2a5459e207551cd087bf3027f`，clean，`origin/main...HEAD = 0/8`
- 本轮只更新 01B 与 01C，不修改 01A、`00-当前开发状态.md`、00B、README 或其他 Week 14 文件
- 只暂存并提交 01B 与 01C；更新提交 hash 在最终回复记录，避免文档自引用和 amend
- 提交后应为 `main`、clean、相对 `origin/main` ahead 9／behind 0

## 边界声明

- 没有 merge、rebase、cherry-pick、squash、amend、reset、tag、PR 或分支删除。
- 没有 push，也没有给功能分支设置 upstream。
- 没有修改或进入 CS2026 源码轨道。
- 没有导入、复制或读取真实 B/C；没有使用真实投资数据。
- 本轮没有修改 source、test、config 或 fixture，没有重新运行或伪造自动测试／Chrome 证据。
- 自动化与本报告不是独立复审；独立执行者复审尚未执行，本地开发候选 `PASS` 不能自我升级为独立验收或最终发布。
- B-02 已解决，源码与 localhost 功能链均无未解决失败；现有完整链在修订后的合同下为本地开发候选 `PASS`。
- 不使用本次开发侧 `PASS` 更新 00B 或独立验收记录，不开始第一次真实 B 导入。

## 下一步

`交由新的独立执行者复审`。

独立执行者必须在不读取、删除、覆盖或重新绑定未知用户状态的前提下，建立全新隔离 Chrome Profile，自行选择并记录一个可用的专用原点；hostname 可为 `localhost` 或 `127.0.0.1`，端口可为任意可用端口，但冻结 HEAD 的独立 CH-01～CH-14 全链必须始终使用同一协议、hostname 和端口。新的独立执行者应据此给出自己的 `PASS`／`FAIL`／`BLOCKED`；在独立 `PASS` 前继续禁止真实 B 导入、merge 和 push。
