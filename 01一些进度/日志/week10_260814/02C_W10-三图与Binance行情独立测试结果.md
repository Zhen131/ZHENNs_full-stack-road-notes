# Week 10 三图与 Binance 行情独立测试结果

## 结论

**总判定：不通过。**

出现一个 P1 和一个已执行的必测合同 FAIL：

1. T3 正式 `DashboardShell` 的未来事实纠正模式无法单条删除：未来交易删除按钮被禁用，未来价格没有单删入口。该交互缺口记 P2，但它是已执行的 02B 必测合同 FAIL，按标准仍强制“不通过”。
2. `next@14.2.35` 存在 production-reachable 的 WebSocket upgrade SSRF 高危风险（[GHSA-c4j6-fc7j-m34r](https://github.com/advisories/GHSA-c4j6-fc7j-m34r)）；当前部署命令直接使用 `next start` 内置 Node server，仓库中没有可证明隔离该入口的代理或过滤规则。

另有 T5 raw IndexedDB V2 envelope 和 T3 部分证据受阻，但按 02B 固定判定顺序，P1/必测合同 FAIL 先于 BLOCKED，因此总判定是“不通过”，不是“受阻”。

```text
当前是否可以进入合并审查：否
是否需要生成独立修复计划：是
```

## 测试身份与边界

- 标准：`02B_W10-三图与Binance行情独立测试标准.md`
- `RUN_TODAY`：2026-07-25
- 开始：2026-07-25 22:14:16 CST
- 结束取证：2026-07-25 22:54:13 CST
- 源码分支：`zhennn/week10-charts-binance`
- 源码 HEAD：`fd5391e7e4de735a30e9e41c022297fa59ebc44e`
- production origin：`http://127.0.0.1:3187`
- 浏览器：Codex 内置真实 Chromium 页面
- 数据：仅 02B 固定虚构 BTC/ETH/ADA 事实；未使用真实账本、真实交易、真实密码
- 正式源码、既有测试、`package.json`、lockfile 和 Git 历史全程只读

开始基线：

| 仓库 | 分支/状态 | HEAD | 工作树 |
| --- | --- | --- | --- |
| 外层文档 | `main...origin/main [ahead 1]` | `97156d6` | clean |
| 内层源码 | `zhennn/week10-charts-binance...origin/zhennn/week10-charts-binance` | `fd5391e` | clean |

## T0–T6 总表

| 项目 | 单项结论 | 严重度 | 发现类型 | 核心证据 |
| --- | --- | --- | --- | --- |
| T0 自动化基线 | PASS | — | 必测合同 | test 41/41 files、362/362；lint/build/diff-check 均 exit 0 |
| T1 production 主链 | PASS；raw IDB 前置为 BLOCKED | — | 必测合同/证据受阻 | 真实 Binance 3/3；模式、三图、5 范围、热力筛选、export/clear/import/relock 均完成 |
| T2 失败/限流/部分成功 | PASS | — | 必测合同 | 6/6 独立 tests；timeout/network/418/429/500/partial 全部满足 |
| T3 未来事实纠正 | FAIL；部分证据 BLOCKED | P2 | 必测合同失败/证据受阻 | 单删入口不可用；其余 2/3 tests 通过 |
| T4 竞态保护 | PASS | — | 必测合同 | 3/3 独立 tests；旧响应不污染 mapping/import，最新账本合并正确 |
| T5 响应式/恢复 | 部分 PASS；V2 raw envelope BLOCKED | — | 证据受阻 | 390/1280、console、reload 恢复、export schema 均有证据；raw IDB API 不可用 |
| T6 依赖安全 | FAIL | P1 | 剩余风险 | production audit 2 high；Next WebSocket SSRF 可达 |

## T0：自动化基线

工作目录均为内层源码仓库。

| 命令 | 退出码 | 摘要 |
| --- | ---: | --- |
| `npm test` | 0 | 41/41 files，362/362 tests，7.81s；仅 3 条既有 jsdom 下载导航提示 |
| `npm run lint` | 0 | 无 warning/error |
| `npm run build` | 0 | Next 14.2.35 production build 成功；5 个静态页面 |
| `git diff --check` | 0 | 无输出 |

production server 首次在 sandbox 内因 bind `EPERM` 退出 1；授权后原命令成功，PID 51737，Ready 106ms。该次属于执行环境权限，不覆盖或改变 T0 结果。测试结束只停止本轮 PID，端口 3187 已释放。

## T1：原始 production 主链

功能链 PASS：

- 三项默认映射可见。
- 真实 Binance 首次刷新成功 3、失败 0；价格均为正，来源与 as-of 可见。
- 自动模式三项使用 Binance；手动模式 BTC 使用 70000 manual，ETH/ADA 回退 Binance。
- 持仓表、饼图和曲线使用同一结果；三图真实 canvas 渲染。
- 1/7/30/365/全部范围分别为 2、7、30、365、1 个显示点。
- 热力图真实点击 2026-07-25 后只显示当日 4 笔，再点取消；clear/import 后筛选重置。
- 明文导出提示、严格 clear、无刷新 import、reload 锁定和重新解锁恢复均完成。
- 重解锁后真实 Binance 再次成功 3、失败 0。
- production console 两次检查均为 `[]`。

首次行情观测：

| 资产 | 价格 | 来源 | as-of |
| --- | ---: | --- | --- |
| BTC | 64158.50000000 | Binance | 2026-07-25T14:28:51.543Z |
| ETH | 1866.45000000 | Binance | 2026-07-25T14:28:51.543Z |
| ADA | 0.16340000 | Binance | 2026-07-25T14:28:51.543Z |

证据限制：新端口 origin 的 Cache Storage 与 Service Worker 均为空，但内置浏览器桥接没有暴露 raw IndexedDB API，无法直接证明建账前 `local-first-trading-ledger` 数据库不存在。该前置点单列 BLOCKED，不以“新端口”推断成 raw 存储证据。

## T2：受控失败、限流与部分成功

临时架构严格使用正式 `MarketDataControls`、正式 `usePersistentLedger`、recording `LedgerRepository` 和由 `createBinanceMarketDataClient({ fetch: controlledFetch })` 创建的 client。

| 场景 | 结果 | 关键观测 |
| --- | --- | --- |
| T2.1 8000ms timeout | PASS | 7999ms 仍 loading；8001ms 后三项 `BINANCE_TIMEOUT`；3 validation + 1 ticker；无重试 |
| T2.2 offline | PASS | 三项 `BINANCE_NETWORK_ERROR`；新增本地交易与 manual 价格均保存并 remount |
| T2.3a HTTP 429 | PASS | `BINANCE_RATE_LIMITED`、status 429；无重试/清价 |
| T2.3b HTTP 418 | PASS | `BINANCE_RATE_LIMITED`、status 418；无重试/清价 |
| T2.4 HTTP 500 | PASS | `BINANCE_HTTP_ERROR`、status 500；不写 0 |
| T2.5 partial | PASS | BTC=62000、ETH=2200 一次 mutation/一次 save；ADA `BINANCE_SYMBOL_MISSING` 且 0.45 旧价保留 |

所有场景均保存旧 API/manual 价格、三项映射和本地交易；同 Repository remount 结果一致。

## T3：旧未来事实纠正

通过的部分：

- 正式 Dashboard 进入纠正模式并列出 `future-trade-2099`、`future-price-2099`。
- 未来事实不进入计算：BTC 持仓为 1 而非 2、选价 61000 而非 123456；allocation 为 3 项/65650；history 30 点；heatmap 365 日/3 笔。
- 普通新增、正常历史删除和 Binance 刷新被暂停。
- 删除全部未来事实成功：事实由 4 trades/4 prices 变为 3/3，save=1。
- 卸载 Dashboard 后，同 Repository 挂载受控 Harness；Binance 3 项刷新成功并保存，普通 `concurrent-trade` 成功保存；再次 remount 完整恢复。
- 合法整账替换成功；当前 UI 新建 2099 未来交易被拒绝且不 save；纠正模式 clear 成功。

合同失败：

- 未来交易行的正式删除按钮 `disabled=true`。
- 正式 Dashboard 没有未来价格单删入口。
- 单删尝试后 save=0，事实 ID 清单不变。

这不符合 02B “删除单条后再删除全部”的正式 UI/Repository 合同。由于仍有删除全部、合法整账替换和 clear 三条恢复路径，严重度记为 P2；但它是已执行必测合同 FAIL，按 02B 仍强制总判定“不通过”。

证据受阻：

- T3.1 后段被独立夹具中未来交易 `totalValue` 与 `price × quantity` 不一致打断；该问题属于临时测试夹具，而非产品结论。
- 02B 允许的唯一复跑已经用尽，因此本轮没有把 T3 救援导出和 strict future import 写成 PASS；两项记录 BLOCKED。

## T4：竞态与最新账本保护

| 场景 | 结果 | Repository 证据 |
| --- | --- | --- |
| T4.1 删除映射 | PASS | 响应故意忽略 abort；操作保存后再 resolve，旧响应未新增 mutation/save；remount 保持无 BTC mapping |
| T4.2 整账替换 | PASS | epoch 变为 2；旧响应再 resolve 后 mutation=0、无附加 save；remount 等于替换账本 |
| T4.3 新增交易 | PASS | 行情 mutation 恰好 1 次，以含 `concurrent-trade` 的 4 笔最新账本为输入；新增 3 API 价、一次 save；remount 保留 |

## T5：响应式、安全与恢复

通过：

- 390×844 无页面级横向溢出；宽表只在父容器横向滚动。
- 1280 无页面级横向溢出；三图宽 1124。
- 正常提示和按钮可读可用；console 无未解释 warning/error。
- reload 后锁定；重新解锁恢复映射、4 笔交易、manual/API provenance 和价格。
- 导出 JSON 只含账本事实字段；派生字段命中 `[]`；明文警告可见。

BLOCKED：

- 内置 Chromium 的页面自动化桥接环境未暴露 `indexedDB`；Chrome 控制扩展也不可用。
- 因而无法读取 database/store/key 的 raw 值，不能核对严格 V2 顶层 key、KDF/cipher 参数、明文关键词、mutation 前后 IV/ciphertext 变化和 reload 后第二次 raw envelope。
- 页面成功解锁恢复只证明应用恢复行为，未被冒充为 raw V2 envelope 证据。

## T6：依赖安全分类

`npm audit --json` 与 `npm audit --omit=dev --json` 的授权后输出均为可解析 JSON，退出码 1 表示发现漏洞，不是基础设施失败。

| 范围 | high | critical | 涉及包 |
| --- | ---: | ---: | --- |
| 全量 | 7 | 0 | `@next/eslint-plugin-next`、`brace-expansion`、`eslint-config-next`、`glob`、`js-yaml`、`next`、`postcss` |
| production | 2 | 0 | `next`、`postcss` |

### P1：可达 production high

`next@14.2.35` 受 [GHSA-c4j6-fc7j-m34r](https://github.com/advisories/GHSA-c4j6-fc7j-m34r) 影响。攻击面是 self-hosted 内置 Node server 的 crafted WebSocket upgrade；本项目 production 直接运行 `next start`，因此匿名请求可达该入口。官方修复线包括 15.5.16/16.2.5；本轮未升级。

### P2：已隔离 production dependency 风险

`next -> postcss@8.4.31` 受 [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) 与 [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) 影响。项目仅在构建期处理仓库内 CSS；匿名页面、备份 JSON 和 Binance 响应不能向 PostCSS 提供 CSS 文件路径，因此没有当前 production 输入调用链，记 P2 剩余风险。

### P2/P3：其余 Next/dev-only 风险

- RSC/Server Function DoS 与 Server Action SSRF：`.next/server/server-reference-manifest.json` 的 node/edge 均为空，Server Actions=0。
- dynamic-host rewrite/redirect SSRF：routes manifest 的 rewrites 为空。
- Pages Router+i18n+middleware 绕过：本项目为 App Router，无 i18n/middleware。
- `glob` CLI command injection：仅 dev 链，项目不运行 `glob -c`。
- `brace-expansion` DoS/OOM：仅测试/lint 工具链，pattern 由仓库控制。
- `js-yaml` quadratic merge：仅 ESLint 配置解析，输入由仓库控制。

未运行 `npm audit fix`，未升级依赖，未修改 lockfile。建议在独立修复计划中统一确定受支持的 Next 升级目标，而不是只处理单个 advisory。

## 临时副本独立性

- 临时目录：`/private/tmp/week10-02c.iPXge8`
- 来源：`git archive fd5391e7e4de735a30e9e41c022297fa59ebc44e`
- `node_modules`：`cp -cR` 复用；无安装
- 新增文件：严格为 02B 锁定的 4 个路径
- 正式归档既有文件：117
- 前后 hash manifest `cmp` 退出码：0
- 完成取证后已按 exact realpath 删除临时目录；cleanup exit 0

定向测试首次运行 exit 1：12 tests 中 10 passed，2 个独立断言基础设施问题；修正后按 02B 唯一允许的例外原样复跑一次。复跑 exit 1：11 passed、1 failed；剩余失败包含 T3 单删正式合同的真实失败。没有第三次运行。

## 发现清单

| ID | 严重度 | 类型 | 结论 | 建议 |
| --- | --- | --- | --- | --- |
| F-01 | P2 | 必测合同失败 | 纠正模式不能单删未来交易/价格 | 生成独立修复计划；补齐正式 UI 单删并加 Repository/DOM 回归 |
| F-02 | P1 | 剩余风险 | Next 内置 server WebSocket SSRF 可达 | 独立升级/缓解计划；升级后重跑完整基线与 production audit |
| F-03 | — | 证据受阻 | raw IndexedDB V2 envelope 无法读取 | 换用可访问 DevTools/IndexedDB 的真实 Chromium 环境重测 T5 |
| F-04 | — | 证据受阻 | T3 rescue export/strict import 独立链未完成 | 修正夹具后按新的独立测试轮次重测，不覆盖本轮结果 |
| F-05 | P2 | 剩余风险 | PostCSS 受影响版本位于 production 依赖树但当前输入不可达 | 随 Next/构建工具升级消除 |
| F-06 | P3 | 剩余风险 | dev-only glob/brace-expansion/js-yaml advisories | 纳入依赖维护，不阻塞业务修复顺序 |

## 截图索引

| 编号 | 文件 | origin / 视口 | 可见断言 | 时间 |
| --- | --- | --- | --- | --- |
| 01 | `01-production-1280-manual-and-charts.png` | `http://127.0.0.1:3187` / 1280 | 交易/恢复状态、无整体溢出；同轮三图与 manual 模式 | 2026-07-25T14:34:52.865Z |
| 02 | `02-production-390-responsive.png` | 同上 / 390 | 窄屏提示/按钮/图表可读，宽表局部滚动 | 2026-07-25T14:35:20.213Z |
| 03 | `03-production-reload-locked.png` | 同上 / 390×844 | reload 后锁定且密码未保存 | 2026-07-25T14:35:39.761Z |
| 04 | `04-production-reload-unlocked-recovery.png` | 同上 / 390 | 重解锁后 facts/provenance/行情恢复 | 2026-07-25T14:36:21.362Z |
| 05 | `05-production-export-plaintext-warning.png` | 同上 / 390 | 导出成功且“备份为明文”警告可见 | 2026-07-25T14:36:38.400Z |

命令、浏览器、临时测试和 audit 的详细文本摘要位于同目录的 `00`–`03` 证据文件。

## Git 收口要求

- 内层源码必须保持 `zhennn/week10-charts-binance`、HEAD `fd5391e7e4de735a30e9e41c022297fa59ebc44e`、工作树 clean。
- 外层只允许本报告与 `02C_W10-独立测试证据/`。
- 仅创建外层本地提交：`测试：完成第十周独立补充验收`。
- 不 push、不 merge、不 rebase、不 stash。
