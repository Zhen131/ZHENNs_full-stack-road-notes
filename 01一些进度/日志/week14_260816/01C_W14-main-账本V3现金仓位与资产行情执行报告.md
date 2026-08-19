# 01C_W14-main｜账本 V3 现金仓位与资产行情执行报告

- 执行日期：2026-08-19
- 最终结论：`BLOCKED`
- 源码轨道：长期账本产品 `main` 的功能分支
- 功能分支：`zhennn/w14-v3-cash-assets-market-data`
- 最后一个已确认安全的源码提交：`59ee9235b98b5182784f81d1c8225f8f55cc0186`
- 产品定义：`01一些进度/日志/week14_260816/01A_W14-main-账本V3现金仓位与资产行情产品定义.md`
- 执行合同：`01一些进度/日志/week14_260816/01B_W14-main-账本V3现金仓位与资产行情执行文档.md`

## 结论

八阶段源码实施、五个独立 `fix:` 提交和最后一轮自动化质量门已经完成。最后一轮有效结果为：55 个本批定向测试文件、713 项测试通过；完整 `npm test` 为 84 个测试文件、900 项测试通过；typecheck、lint、production build、diff-check、版本残留扫描和联网边界扫描全部通过。源码工作区干净，候选完整停留在指定本地功能分支，没有 upstream、merge 或 push。

真实 Google Chrome 已在 production build 上完成 CH-01～CH-06。CH-07 发现新的、可复现的浏览器网络边界：Binance 对不存在的 `KNIGHTUSDT` 返回 HTTP 400 和 `{"code":-1121,"msg":"Invalid symbol."}`，但该错误响应没有 `Access-Control-Allow-Origin`；Chrome 的页面脚本因此只能得到 `fetch` 异常，当前应用按既定代码落到 `BINANCE_NETWORK_ERROR`，无法得到 01B 要求的 `BINANCE_SYMBOL_MISSING`。

01A／01B 没有定义“上游错误响应被 CORS 隔离”时的唯一处理。01B 同时禁止代理、全量 `exchangeInfo` 和自动重试，并要求区分断网、418／429、其他 HTTP 错误与无交易对。加入同源代理、二次诊断请求，或放宽错误口径都会新增产品／网络／安全决定，不能由本轮执行者猜测。因此没有修改源码或测试来伪造成功，终态按目标模式规则记为 `BLOCKED`。

CH-08～CH-14 在最后一轮有效 Chrome 链中没有继续执行；第一次真实 B 导入、合并与推送继续禁止。此前 CH-13 曾发现并修复统一流水键盘事件冒泡缺陷，但源码修改后旧 Chrome 链已按规则作废，不能把局部旧结果计入最终通过数。

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

额外 fix 共 5 个，全部独立提交；没有 amend 或 squash。

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

最后一轮自动化没有未解决失败。终态 `BLOCKED` 只来自随后真实 Chrome 暴露的上游 CORS 错误边界没有安全唯一方案。

## 真实 Google Chrome CH-01～CH-14

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

CH-01～CH-14 的总体结果为 `BLOCKED`，不是 `PASS`。

## Console、Network、原生 picker 与虚构文件证据

| 证据 | 结果 |
| --- | --- |
| Console | 最终 production Chrome 标签页通过开发者日志接口读取，warning/error 共 0。DevTools Issues 的静态改进提示不计为 Console 错误。 |
| Network | CH-05 Binance 0；CH-06 每次明确动作均只有预期的 exchangeInfo→ticker，等待后无第二轮；CH-07 只有 KNIGHT exchangeInfo 400，无 ticker、无 retry。没有发现解锁、切页、本地资产、手动价或 C 文件操作触发的意外 Binance 请求。 |
| 原生 picker | 首次运行由 macOS 原生保存选择器创建 primary；源码修复并重新 production build 后，再由原生重选路径打开同一虚构 primary 并成功解锁。第一次锁屏阻塞已由用户解锁并以防休眠恢复，不再是最终 blocker。 |
| 虚构 C | `w14-v3-fictional-primary.lftl` 为外层 V2／内部 schema 3；current 与 previous 均为 schema 3，`current.parentRevisionId === previous.revisionId`。未记录密码、salt、IV、ciphertext 或完整 revision ID。 |
| 虚构 B | 因 CH-07 阻塞，未导出 V3 B，也未生成 invalid-cash／V2 B。没有个人 B/C 或真实投资数据进入浏览器、临时目录、源码或报告。 |

## 已解决问题 B-01：macOS 自动锁屏

最初 Chrome 运行在 CH-01 原生保存选择器时，Mac 自动锁屏，连续检查均需要用户手动解锁，因此第一版 01C 记录为 `BLOCKED`。用户随后明确解锁；本轮启动防休眠，成功完成原生 primary 创建／重选、CH-01～CH-06 和新的网络调查。B-01 已解决，不再是最终 blocker。

## 未解决问题 B-02：Binance 无效 symbol 的 400 响应被 CORS 隔离

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

## 最终 Git 现场

### 源码仓库

- 当前分支：`zhennn/w14-v3-cash-assets-market-data`
- HEAD：`59ee9235b98b5182784f81d1c8225f8f55cc0186`
- `main`：仍为 `0d0cb555e5d2fac1660ac51e7b577bcb9710582d`
- 工作区：clean，无 staged、unstaged、untracked
- `origin/main...HEAD = 0/13`
- upstream：无
- 固定阶段提交：8 个；额外 fix：5 个

### 根文档仓库

- 恢复执行前：`main@d1ae5c9053eca2a1b4c1b9cdebfb520a56ec67a4`，clean，`origin/main...HEAD = 0/5`
- 本轮只更新同一份 01C，不修改 01A、01B、`00-当前开发状态.md`、README 或其他 Week 14 文件
- 只暂存并提交本 01C；更新提交 hash 在最终回复记录，避免文档自引用和 amend
- 提交后应为 `main`、clean、相对 `origin/main` ahead 6／behind 0

## 边界声明

- 没有 merge、rebase、cherry-pick、squash、amend、reset、tag、PR 或分支删除。
- 没有 push，也没有给功能分支设置 upstream。
- 没有修改或进入 CS2026 源码轨道。
- 没有导入、复制或读取真实 B/C；没有使用真实投资数据。
- 自动化与本报告不是独立复审；独立执行者复审尚未执行。
- `BLOCKED` 不撤销八阶段、五个 fix 和最后一轮自动化绿灯，但也不能升级为本地开发候选 `PASS`。

## 恢复通过线

产品负责人先决定 B-02 的网络／错误口径，并据此更新或明确授权修改 01A／01B。之后从 `59ee923...` 建立新的独立 `fix:` 提交与正式测试，重新完成 55 文件定向闭集、完整测试、typecheck、lint、build、diff-check、版本／联网扫描，再从受影响的 Chrome 链按合同重跑；若代码、网络或文件合同变化，CH-01～CH-14 必须重新完整执行。全部通过后仍需新鲜独立执行者复审，真实 B 才可能进入下一步。
