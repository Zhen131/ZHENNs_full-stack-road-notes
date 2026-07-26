# 02B_W10：三图与 Binance 行情独立测试标准

日期：2026-07-25

状态：历史独立测试标准；已执行，结果见 02C，后续修复与复验见 03A–03D

依据：[[01C_W10-三图与Binance行情执行计划]]、[[02A_W10-三图与Binance行情执行验收记录]]

## 结论

本文件是 Week 10 的独立补充测试标准，不是开发计划，也不是测试结果。执行 AI 只负责测试、取证和判定，不得修改正式源码、现有测试或本文件。测试结果必须另建：

```text
02C_W10-三图与Binance行情独立测试结果.md
```

Week 10 只有在 production 主链、响应式与 V2 恢复、真实 Binance 外部状态三类浏览器证据，以及依赖安全分类和既有质量 Gate 均取得真实结果后，才能由 02C 给出“通过 / 有条件通过 / 不通过 / 受阻”。

执行优先级固定为：本文件的步骤与通过线 > 02A 的开发侧结论。02A 只能作为待复核证据，不能替代本轮实测。执行 AI 不得自行缩小范围、改写严重度或把“已有自动化覆盖”直接记成本轮通过。

## 一、固定对象与仓库边界

测试对象：

```text
源码仓库：01一些进度/产出/LocalFirstTradingLedger/
预期分支：zhennn/week10-charts-binance
预期 HEAD：fd5391e
开发者验收：02A_W10-三图与Binance行情执行验收记录.md
```

执行前必须同时检查外层文档仓库和独立源码仓库：

- 必须在当前本地工作区 `/Users/zhuzhen0131/Documents/NOTe/全栈之路` 执行，不得新建 Codex Worktree 或运行 `git worktree add`。源码是外层仓库忽略的嵌套独立仓库；新外层 Worktree 不能视为包含测试对象。
- 源码分支、HEAD 或工作树与上述事实不符时，停止测试并记为 `BLOCKED`，不得自行切换、清理或恢复。
- 正式源码仓库全程只读；不得修改源文件、测试、依赖、lockfile 或 Git 历史。
- 外层文档仓库只允许新增 02C 和测试证据。
- 不得 push、merge、rebase、stash、reset、checkout 覆盖或删除既有改动。

执行前在对应仓库分别运行并把输出写入 02C：

```bash
git -C "/Users/zhuzhen0131/Documents/NOTe/全栈之路" status --short --branch
git -C "/Users/zhuzhen0131/Documents/NOTe/全栈之路" rev-parse --show-toplevel
git -C "/Users/zhuzhen0131/Documents/NOTe/全栈之路/01一些进度/产出/LocalFirstTradingLedger" status --short --branch
git -C "/Users/zhuzhen0131/Documents/NOTe/全栈之路/01一些进度/产出/LocalFirstTradingLedger" rev-parse --show-toplevel
git -C "/Users/zhuzhen0131/Documents/NOTe/全栈之路/01一些进度/产出/LocalFirstTradingLedger" rev-parse HEAD
```

## 二、测试员权限与禁止事项

允许：

- 阅读 01A、01B、01C、02A、02B、源码和现有测试。
- 运行现有 test、lint、build、diff-check 和只读依赖审查。
- 启动 production server，使用全新浏览器会话和虚构测试数据。
- 在 `mktemp` 创建的临时目录复制当前源码，增加只用于控制时间、响应延迟和错误类型的测试接线。
- 保存 5–8 张不含密码和私人数据的关键截图。
- 在外层文档仓库生成 02C 和证据目录。

禁止：

- 修改正式源码或现有自动化测试。
- 测试失败后顺手修复产品代码。
- 修改本文件的步骤、预期结果或通过线。
- 通过反复重跑掩盖失败。
- 运行 `npm audit fix`、升级依赖或改写 `package-lock.json`。
- 使用用户真实账本、真实密码或私人交易数据。
- 通过高频真实请求故意触发 Binance 429/418。

临时测试副本必须满足：

1. 来源固定为测试开始时记录的源码 HEAD。
2. 使用 `git archive <记录的HEAD>` 解出到 `mktemp -d` 返回的独立目录；不得直接复制带 `.git` 的正式工作树，不得在正式源码仓库生成临时文件。
3. 只允许新增以下文件，不得修改 archive 中的任何既有文件：
   - `src/independent-tests/independentHarness.tsx`
   - `src/independent-tests/t2-binance-failures.independent.test.tsx`
   - `src/independent-tests/t3-future-correction.independent.test.tsx`
   - `src/independent-tests/t4-race-protection.independent.test.tsx`
4. `independentHarness.tsx` 只能组合正式的 `usePersistentLedger`、`MarketDataControls`、`DashboardShell`、`LedgerRepository` 接口和测试 spy，提供 client、clock、Repository、延迟 Promise 与测试按钮；不得复制或改写选价、合并、持仓、图表、日期、加密或持久化算法。
5. 使用 macOS `cp -cR` 把正式源码仓库现有 `node_modules` 复制到临时目录；不得通过 symlink 让临时 runner 写入正式 `node_modules`，不得运行 `npm install`、修改依赖或生成新 lockfile。若 clone copy 不可用，可退回普通 `cp -R`，但仍必须是独立副本。
6. 临时定向测试只能在临时目录运行 `./node_modules/.bin/vitest run src/independent-tests/*.independent.test.tsx`；02C 必须记录临时工作目录、完整命令、退出码、每个测试名和结果，不能把它们计入 T0 的正式测试数量。
7. 02C 保存四个临时文件的路径、SHA-256、内容摘要，并证明 archive 中既有文件的 SHA-256 在测试前后完全一致。任一既有文件发生变化，本轮记为 `BLOCKED`。
8. 测试结束后只删除经 `realpath` 验证位于系统临时目录、名称匹配本轮 `mktemp` 返回值的目录；不得删除其他目录。

## 三、执行频率与证据规则

- 全量 test、lint、build、diff-check 各执行一次。
- 每个受控场景至少执行一次。
- 只有测试基础设施异常时允许原样重跑一次，02C 必须同时保留两次结果。
- 功能结果失败时不得循环重跑到通过。
- 本轮不修代码；后续修复必须另开修复任务，并执行相关定向测试和一次全量回归。

日期与跨午夜规则：

- 执行开始时记录宿主机 `Asia/Shanghai` 本地日期为 `RUN_TODAY`，格式 `YYYY-MM-DD`；T1 的交易、手动价格和 as-of 判断均使用该日期，不得继续写死 `2026-07-25`。
- T2、T4 注入的业务 clock 固定为 `now = 2026-07-25T12:00:00Z`、`todayKey = 2026-07-25`。T3 在渲染前由临时 Vitest 文件把 JavaScript 系统时间固定到同一时刻，结束后恢复真实时间；不得修改正式日期实现。`2099-01-01` 始终作为未来事实。
- T1 或 T5 若跨过 `Asia/Shanghai` 午夜，当前场景证据作废，必须换全新 origin 从该场景起点重做一次，并在 02C 记录原因；T0、T2、T3、T4、T6 不因跨午夜重复。

02C 每项必须填写：

| 字段 | 必填内容 |
| --- | --- |
| 测试 ID | `T0` 至 `T6` 及子编号 |
| 测试对象 | 页面、服务、Repository 或依赖 |
| 输入与步骤 | 可由另一名测试员复现 |
| 预期结果 | 执行前固定，不得事后修改 |
| 实际结果 | 页面、存储或命令真实结果 |
| 证据 | 命令、工作目录、退出码、截图编号、DOM/存储观测点或文件 |
| 单项结论 | `PASS / FAIL / BLOCKED` |
| 严重度 | `P0 / P1 / P2 / P3` |
| 发现类型 | `必测合同失败 / 剩余风险 / 外部限制 / 证据受阻` |
| 建议 | 是否进入修复阶段 |

截图保存到：

```text
01一些进度/日志/week10_260814/02C_W10-独立测试证据/
```

截图总数为 5–8 张，只用于证明页面状态；命令输出保存为文本摘要，不截终端长图。每张截图在 02C 标注：编号、URL/origin、视口、场景步骤、可见断言和拍摄时间。所有浏览器测试使用真实 Chromium 页面（Chrome 或 Codex 内置浏览器），jsdom 只用于 T2–T4 临时受控测试，不得冒充 production 浏览器证据。

## 四、T0：独立性与自动化基线

以下命令必须以源码仓库为工作目录执行；02C 逐条记录工作目录、退出码和摘要：

```bash
cd "/Users/zhuzhen0131/Documents/NOTe/全栈之路/01一些进度/产出/LocalFirstTradingLedger"
pwd
git status --short --branch
git rev-parse HEAD
git log --oneline -10
npm test
npm run lint
npm run build
git diff --check
```

通过线：

- 源码位于预期分支和 HEAD，工作树干净。
- `npm test` 为 41 个测试文件、362 项测试通过；数字变化必须解释。
- lint 无 warning/error。
- production build 成功。
- diff-check 通过。
- 三条既有 jsdom 下载导航提示可记录为已知非阻塞输出，但不得出现新的未解释失败。

`npm test`、lint、build 或 diff-check 任一退出码非 0，均是“必测合同失败”；不得以 P2、有条件通过或再次运行后的成功覆盖第一次失败。只有明确属于测试基础设施异常时，才按第三节原样重跑一次并保留两次证据。

## 五、T1：原始 production 最短主链

T0 build 成功后，在源码仓库启动构建产物：

```bash
cd "/Users/zhuzhen0131/Documents/NOTe/全栈之路/01一些进度/产出/LocalFirstTradingLedger"
npm run start -- --hostname 127.0.0.1 --port <本轮未占用端口>
```

02C 记录端口、完整 origin、server 启动摘要和 PID；测试结束只停止本轮 PID。使用该 origin 的全新 Chromium 浏览器上下文，先确认 IndexedDB 中不存在本项目数据库，再创建全新的加密测试账本。不得复用开发服务器、旧标签页、旧 Service Worker、旧 IndexedDB 或浏览器缓存状态。测试密码不得写入截图或 02C。

固定虚构事实：

- `RUN_TODAY`：BTC 买入 1 @ 60000 USD。
- `RUN_TODAY`：ETH 买入 2 @ 2000 USD。
- `RUN_TODAY`：ADA 买入 1000 @ 0.5 USD。
- `RUN_TODAY`：ADA 卖出 100 @ 0.55 USD，且发生顺序晚于买入。
- `RUN_TODAY`：手动 BTC 价格 70000 USD。

必须验证：

1. 三项默认映射可见。
2. 真实 Binance 刷新成功时，价格为正数，来源为 Binance，as-of 可见。
3. 不锁定具体价格数值；价格随市场变化不构成失败。
4. 自动模式同日选择 Binance，手动模式选择 BTC 手动价并让其他资产回退 Binance。
5. 持仓表、饼图和曲线使用同一价格结果。
6. 饼图、阶梯曲线和 365 天热力图均真实渲染；1/7/30/365/全部区间可切换，点击一个有交易的热力日期只显示当日交易，再次点击取消，clear/import 后筛选重置。
7. 完成一次明文导出提示、clear、无刷新导入和重新解锁。

真实 Binance 因地域、DNS、CORS 或网络不可用时，T1 的“真实 Binance 成功”发现类型记为 `外部限制`、单项记为 `BLOCKED`，不得写 PASS，也不直接判产品失败；保留页面错误、Network 面板状态和 origin 证据，继续执行 T2。若 T2 全部通过且其余必测合同通过，该外部限制最多使总结果为“有条件通过”，不能升级为“通过”。

## 六、T2：受控失败、限流与部分成功

使用第二节锁定的临时测试副本和 `independentHarness.tsx`。测试必须渲染正式 `MarketDataControls`，通过正式 `usePersistentLedger` 连接 recording `LedgerRepository`；T2 client 必须由正式 `createBinanceMarketDataClient({ fetch: controlledFetch })` 创建，只注入受控 fetch、clock、ID 和响应 Promise。不得用伪造页面、复制业务逻辑、直接返回自造 failure code 或只调用 mock 自己来代替真实组件、client 与 Hook。

T2.1–T2.5 的 `exchangeInfo` 受控响应均返回 BTCUSDT、ETHUSDT、ADAUSDT 的合法 SPOT/TRADING 映射；故障只发生在随后的一次 ticker batch。每个场景必须证明 3 次映射验证和 1 次 ticker 请求，且没有第二轮请求。T2.1 使用默认 `8000ms` 合同和受控时间推进到 `8001ms`，不得把更短的测试超时冒充生产 8 秒合同。

每个子场景使用新的 Repository 和完全相同的失败前账本：

- BTC、ETH、ADA 均有非零持仓和默认 Binance 映射。
- BTC 旧 API 价：`61000 USD`；ETH 旧 manual 价：`2100 USD`；ADA 旧 API 价：`0.45 USD`。
- 三条旧价的 `recordedAt = 2026-07-24`；API 价 `fetchedAt = 2026-07-24T12:00:00Z`；ID 固定且各不相同。
- recording Repository 必须记录 `load/save/clear` 次数及每次完整 LedgerData 的结构化快照，不得只记录页面文字。

| ID | 场景 | 必须结果 |
| --- | --- | --- |
| T2.1 | 可控 fetch 超过 8 秒 | `BINANCE_TIMEOUT`；页面报告超时，旧价和本地账本保留 |
| T2.2 | fetch 抛出 `TypeError("offline")` | `BINANCE_NETWORK_ERROR`；页面报告失败，本地交易和手动价格仍可新增并保存 |
| T2.3a | HTTP 429 | `BINANCE_RATE_LIMITED`，`httpStatus=429`；不重试、不清旧价 |
| T2.3b | HTTP 418 | `BINANCE_RATE_LIMITED`，`httpStatus=418`；不重试、不清旧价 |
| T2.4 | HTTP 500 | `BINANCE_HTTP_ERROR`，`httpStatus=500`；不写 `0` |
| T2.5 | ticker batch 只返回 BTC=`62000`、ETH=`2200`，缺少 ADA | ADA 得到 `BINANCE_SYMBOL_MISSING`；一次 mutation 只更新 BTC/ETH；ADA `0.45` 旧价保留；逐项显示失败 |

全部场景共同通过线：

- 失败不得删除旧 API/manual 价格或映射。
- 不得写入 `0`、交易价、成本或未来价格代替市场价格。
- 手动价格和本地交易继续可用。
- T2.1、T2.3a、T2.3b、T2.4 的 client 每个 endpoint 调用次数必须符合一次刷新链，不得重试；T2.2 失败后新增一笔本地交易和一条手动价格，证明两者保存成功。
- T2.5 `applyLedgerMutation` 恰好调用一次；等待持久化状态完成后，Repository 只出现一次包含该 mutation 的新 `save`。如果底层已有初始化保存，必须用 mutation 前后保存序号区分，不能只看总次数。
- 页面成功数、失败数、逐资产原因与实际一致。
- 重新创建组件并使用同一 recording Repository `load()`；T2.1–T2.4 保持三条旧价，T2.2 还包含新增本地事实，T2.5 包含 BTC/ETH 新价且 ADA 旧价仍在。

## 七、T3：旧未来事实纠正模式

本节属于临时受控兼容测试，不是 production V2 加密证明。使用 T2 同一临时架构，并按第三节固定 JavaScript 系统时间；recording Repository `load()` 预置一笔 `2099-01-01` 未来交易和一条 `2099-01-01` 未来价格，再渲染正式 `DashboardShell`。不得把 Noop 加密、内存 Repository 或 fake IndexedDB 的结果写成“production V2 已验证”。

执行分成两个连续阶段：第一阶段用正式 `DashboardShell` 完成纠正模式、删除、clear、救援导出和 strict import 的 UI/Repository 验证；删除全部未来事实并确认保存后，卸载 Dashboard，再以同一 Repository 渲染 `independentHarness.tsx`，注入受控成功 client 验证 Binance 刷新恢复。不得为了给 Dashboard 注入 client 而修改正式组件文件。

必须验证：

- 页面进入“未来事实纠正模式”并列出无效未来事实。
- 普通新增、正常历史删除和 Binance 刷新不可用。
- 未来事实不进入持仓、价格选择、饼图、曲线和热力统计。
- 救援导出、合法整账替换、clear 和删除全部未来事实仍可用。
- 删除全部未来事实后恢复正常写入和刷新。
- 当前 UI 新建未来事实仍被拒绝。
- strict import 导入未来事实仍被原子拒绝，原页面和保存记录不变。

取证必须同时包含：

- 纠正前、删除单条后、删除全部后和重新挂载后的完整事实 ID 清单。
- 每步 `save` 次数与保存快照；被拒绝的新增和 strict import 不得产生 mutation 或 `save`。
- 未来事实被排除时，持仓、三图和热力统计的具体数量/点位断言，不能只写“看起来没出现”。
- 删除全部未来事实后的普通交易与一次受控 Binance 刷新均成功，以证明写入门禁已经恢复。

## 八、T4：请求竞态与最新账本保护

每个子场景使用独立初始账本、同一固定 clock 和受控延迟响应。受控 client 必须**故意忽略收到的 AbortSignal**：先确认请求已发出；完成中间操作并确认页面/Repository 已进入新状态；最后再主动 resolve 旧 Promise。只证明 signal 已 aborted 不算通过，必须证明“即使旧响应最终返回，也无法写入”。

| ID | 请求期间操作 | 通过线 |
| --- | --- | --- |
| T4.1 | 删除资产映射 | 旧响应不得重新写入该资产 |
| T4.2 | 导入另一份合法整账 | 旧响应不得污染替换后的账本 |
| T4.3 | 新增普通交易 | 新交易必须保留，行情只合并到最新账本 |

每项记录请求前、操作后、响应后和重新挂载后的：

- 交易数量与关键 ID。
- 映射状态。
- 价格快照数量、来源、recordedAt 和 fetchedAt。
- 页面成功/失败提示。

T4.1、T4.2 的旧请求在响应后不得调用 `applyLedgerMutation`，不得增加 `save`；T4.3 允许且只能有一次行情 mutation，必须以响应时最新账本为输入，不得恢复请求开始时的旧快照。每项等待持久化完成后，以同一 Repository 新建组件重新挂载；只看页面瞬时状态、只检查 `signal.aborted` 或只检查内存变量均不足以通过。

## 九、T5：响应式、安全与恢复抽查

本节回到 T1 的原始 production server 和真实 Chromium，不使用临时测试副本、Noop EncryptionService、fake IndexedDB 或 recording Repository。

- 390×844：页面 `scrollWidth` 不得超过视口；宽表只在自身容器滚动。
- 1280px：页面无整体横向溢出，三图宽度正常。
- 两种宽度下，正常页面的提示和操作按钮必须可读可用；若 T1 真实出现 Binance 外部错误，还要验证该失败提示不造成横向溢出。未来事实纠正模式的行为以 T3 正式组件 DOM 断言取证，不得伪称为本节 production 响应式证据。
- production 控制台无未解释 warning/error。
- 在 production origin 写入映射、API/manual provenance 和价格事实并等待“已保存到本地”。真实 Binance 成功时由刷新生成 API provenance；外部不可用时允许导入一份合法的虚构备份来产生 API provenance，但必须注明它只证明保存恢复，不证明实时联网。
- 读取 IndexedDB 数据库 `local-first-trading-ledger`、store `ledger`、key `ledger:v1`，必须是严格 V2 envelope。顶层 key 只能是 `cipher`、`ciphertextBase64Url`、`cryptoVersion`、`formatVersion`、`kdf`、`ledgerSchemaVersion`；`kdf` 只能含 `hash`、`iterations`、`name`、`saltBase64Url`；`cipher` 只能含 `ivBase64Url`、`keyLength`、`name`、`tagLength`。值必须为 `formatVersion=2`、`cryptoVersion=1`、`ledgerSchemaVersion=1`、`PBKDF2/SHA-256/600000`、`AES-GCM/256/tagLength=128`，且不得出现 BTC、ETH、ADA、价格、交易、映射或密码明文。
- 保存前后记录 envelope；发生有效 mutation 后 IV 与 ciphertext 必须变化。刷新页面后重新解锁，页面恢复映射、API/manual provenance 和价格事实；再次读取的仍是 V2 envelope。
- 导出文件继续明确标注为明文，且不包含 Position、图表点、热力等级、估值模式或选中日期。
- 证据不得包含密码、真实账本或其他私人数据。

证据节点固定为：

1. 390×844 页面整体现状与局部宽表滚动。
2. 1280px 三图与页面宽度。
3. 本轮受控失败或未来事实纠正模式的可读状态；若该状态只能在 T2/T3 临时 jsdom 得到，则保存 DOM 文本断言，不得伪造成 production 截图。
4. mutation 后 V2 envelope 的字段名与“未命中明文关键词”检查摘要；不在截图中展示完整 ciphertext、salt 或 IV。
5. 刷新、重新解锁后的恢复页面与第二次 V2 检查摘要。
6. 明文导出警告和导出 JSON 顶层/账本字段清单。

真实 Binance 外部限制状态必须在本节再次注明为“成功 / 地域限制 / DNS / CORS / 其他网络错误”之一，并引用 T1 的 Network 证据；不得把 T2 mock 成功写成真实 Binance 成功。

## 十、T6：依赖安全只读分类

以下命令必须在正式源码仓库执行，不得在临时副本执行；每条命令独立保存 stdout、stderr 和退出码：

```bash
cd "/Users/zhuzhen0131/Documents/NOTe/全栈之路/01一些进度/产出/LocalFirstTradingLedger"
npm audit --json
npm audit --omit=dev --json
```

`npm audit` 因发现漏洞返回非 0 不等于命令基础设施失败：只要输出是可解析的 audit JSON，就必须继续按 advisory 内容分类。只有 DNS、权限、registry 或响应损坏导致没有可解析 JSON 时，才把对应命令记为 `BLOCKED`。不得使用 `|| true` 吞掉退出码，也不得因退出码非 0 跳过第二条命令。

本轮威胁模型固定为：

- production 面包括 `npm run start` 的 Next.js runtime、发送给浏览器的生产 bundle、匿名页面输入、备份导入内容和 Binance 响应处理路径。
- dev-only 面包括只在 test、lint、类型、构建工具链运行且不进入 production runtime/bundle 的依赖；“devDependency”标签本身不能证明不可到达。
- “可到达”必须指出本项目入口文件、调用链或构建产物中的使用证据；“不可到达”必须给出依赖用途和为什么生产输入无法触达，不能只复述 advisory 标题。

对每个 high/critical 项记录：

- advisory 编号和权威来源。
- 直接依赖或传递依赖。
- production dependency 或 dev dependency。
- 当前版本和受影响范围。
- 在本项目中是否存在可到达利用路径。
- 官方建议版本；本轮不执行升级。

判定：

- 可到达的 production high/critical 风险记为 P1。
- 仅开发环境、不可到达或不影响当前部署面的风险，说明理由后记为 P2/P3。
- production audit 有可解析结果但单个 advisory 详情无法从 registry/权威来源补齐时，该 advisory 记为 `BLOCKED`，不得写“安全通过”；只有 dev-only advisory 详情缺失且 production audit 明确不包含它时，才允许作为非阻塞外部限制记录。
- 不因审查结果运行自动修复或改变 lockfile。

## 十一、严重度与总判定

| 等级 | 定义 | 总结论影响 |
| --- | --- | --- |
| P0 | 数据不可恢复、明文秘密泄漏、错误删除其他数据 | 不通过，立即停止 |
| P1 | 旧响应覆盖新账本、未来事实进入计算、网络失败破坏本地可用性、可利用的生产高危漏洞 | 不通过 |
| P2 | 已完成测试后发现的非核心显示/交互问题，或有充分隔离证据的剩余依赖风险 | 有条件通过，交用户决定 |
| P3 | 轻微文案、视觉或非阻塞记录问题 | 可通过并记录 |

02C 总结论只能使用：

- **通过**：所有必测项完成，无 P0/P1/P2 遗留；P3 可记录。
- **有条件通过**：所有可执行的必测合同均 PASS、无 P0/P1，但存在已解释的 P2 或本文件明确允许替代证据的真实 Binance 外部限制。
- **不通过**：出现 P0/P1，或任何已执行的必测合同实际结果不符合通过线；即使该失败影响较小、被标为 P2，也不能改写成有条件通过。
- **受阻**：源码状态、权限、production 浏览器、关键 advisory 或证据链使一个必测合同无法得出结果。缺少必填证据也属于 `BLOCKED`，不是 P2。

判定顺序固定为：先看是否出现 P0；再看是否有 P1 或必测合同 FAIL；再看是否有必测项 BLOCKED；最后才判断 P2/P3。任何未执行的必测项不得算作通过。单项 `BLOCKED` 只有在本文件明确声明为非阻塞外部限制时才允许总结果“有条件通过”，其他必测 `BLOCKED` 一律使总结果为“受阻”。

02C 还必须明确回答：

```text
当前是否可以进入合并审查：是 / 否
是否需要生成独立修复计划：是 / 否
```

## 十二、Git 收口

测试结束后：

1. 源码仓库必须仍位于原分支和原 HEAD，工作树 clean。
2. 外层文档仓库只包含 02C 和约定的证据文件。
3. 先展示外层 diff 和两个仓库状态。
4. 只在外层文档仓库创建中文本地提交：

```text
测试：完成第十周独立补充验收
```

5. 不 push、不 merge、不 rebase，等待用户审查。

Git 收口前必须验证外层变更白名单只包含：

```text
01一些进度/日志/week10_260814/02C_W10-三图与Binance行情独立测试结果.md
01一些进度/日志/week10_260814/02C_W10-独立测试证据/
```

若出现其他文件，停止提交并记为 `BLOCKED`；不得自行丢弃或覆盖。提交后再次输出两个仓库的 `status --short --branch`、源码 `rev-parse HEAD` 和外层最新一条 commit；源码必须仍为原 HEAD 且 clean，外层不得有未提交的本轮文件。
