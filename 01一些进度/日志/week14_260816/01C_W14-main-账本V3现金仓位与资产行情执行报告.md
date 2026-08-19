# 01C_W14-main｜账本 V3 现金仓位与资产行情执行报告

- 执行日期：2026-08-19
- 最终结论：`BLOCKED`
- 源码轨道：长期账本产品 `main` 的功能分支
- 功能分支：`zhennn/w14-v3-cash-assets-market-data`
- 最后一个已确认安全的源码提交：`b71987b4a5c37cdd0e7d62f07aeb4215d198588e`
- 产品定义：`01一些进度/日志/week14_260816/01A_W14-main-账本V3现金仓位与资产行情产品定义.md`
- 执行合同：`01一些进度/日志/week14_260816/01B_W14-main-账本V3现金仓位与资产行情执行文档.md`

## 结论

八阶段源码实施、四个额外修复提交、最后一轮定向测试、完整 `npm test`、typecheck、lint、生产构建、diff-check、版本残留和联网边界扫描均已通过；源码工作区干净，候选完整停留在指定本地功能分支。

本轮不能报告本地开发候选 `PASS`。真实 Google Chrome 已在生产端口进入 CH-01，但 Mac 在原生保存选择器阶段自动锁屏；连续三次恢复检查均确认必须由用户手动解锁。01B 禁止用 jsdom、组件测试、截图、内嵌浏览器或绕过原生选择器的方式替代，因此 CH-01 未完成，CH-02～CH-14 不能串行继续，终态按合同记为 `BLOCKED`。

这不是已确认的源码缺陷，也不需要猜测性代码修改。恢复入口是：用户解锁 Mac 后，从 CH-01 重新完整执行 CH-01～CH-14；完成前继续禁止真实 B 导入、合并和推送。

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

额外 fix 共 4 个，全部独立提交；没有 amend 或 squash。

## 全量测试—修复闭环

### 第 1 轮：本批定向闭集

- 源码 HEAD：`c5771b40723f2c481527e939e58edadeafd9935b`
- 命令：`npx vitest run <本批新增或修改的 54 个测试文件>`
- 退出码：1
- 结果：54 个测试文件、712 项测试；3 项失败。
- 失败：
  - `src/app/usePersistentLedger.test.tsx`：完整备份 fixture 的 Trade 使用 feeRuleId，但缺少匹配 platform 的 FeeRule。
  - `src/core/calculations/positionCalculator.test.ts`：V3 断言仍期待 USD。
  - `src/features/portfolio/pnlSummaryService.test.ts`：断言仍要求聚合 V3 不支持的 USD 事实。
- 处理：回查 01A／01B 后可确定唯一安全结果；修正正式 fixture／断言，建立 `2451501...`，直接相关 3 files / 67 tests 通过。

### 第 2 轮：定向闭集通过，完整测试发现模块边界问题

- 源码 HEAD：`245150173272c848d334535beb42e89749cbf853`
- `npx vitest run <同一 54 个测试文件>`：退出 0，54 files / 712 tests 全部通过。
- `npm test`：退出 1，83 个测试文件、899 项测试中 1 项失败。
- 失败测试：`src/architecture/sourceLayout.test.ts`。
- 实际结果：`src/features/cash/CashEventPanel.tsx` 从 cash feature 内部导入 `@/features/cash` 稳定入口，违反 feature 内部依赖方向。
- 处理：改为模块内相对导入，建立 `b71987b...`；直接相关 2 files / 12 tests 通过。因为正式源码发生变化，之前绿灯全部作废并重新执行完整链。

### 第 3 轮：最后一轮有效自动化结果

- 源码 HEAD：`b71987b4a5c37cdd0e7d62f07aeb4215d198588e`
- `npx vitest run <同一 54 个测试文件>`：退出 0，54 files / 712 tests 全部通过。
- `npm test`：退出 0，83 个测试文件、899 项测试全部通过。
- `npm run typecheck`：退出 0，零错误。
- `npm run lint`：退出 0，零 warning、零 error。
- `npm run build`：退出 0，Next.js 15.5.22 production build 完成；`/` route 337 kB，First Load JS 440 kB。
- `git diff --check`：退出 0。
- 版本残留扫描：通过。生产账本、B 与 generation 均为 V3；允许的 `schemaVersion: 2`／`backupFormatVersion: 2` 只剩明确拒绝 fixture／断言，C 外层 `fileFormatVersion = 2` 按合同保留；`BackupEnvelopeV2`、`DEFAULT_BINANCE_MAPPINGS`、`autoAttemptedRef` 无生产残留。
- 联网边界扫描：通过。可达 Binance 的入口只有用户点击单资产验证、单资产刷新、全局刷新和导入后联网配对；无 mount refresh、API key、WebSocket、timer polling 或自动 retry。

自动化质量门没有未解决失败。终态 `BLOCKED` 只来自后续真实 Chrome 强制证据无法取得。

## 真实 Google Chrome CH-01～CH-14

- Chrome：Google Chrome `151.0.7922.140`
- 环境：production build，`npm run start -- --port 3414`，`http://127.0.0.1:3414`
- 源码：`zhennn/w14-v3-cash-assets-market-data@b71987b4a5c37cdd0e7d62f07aeb4215d198588e`
- 数据边界：只准备了 `/private/tmp` 专用虚构目录和 fixture 派生工具；没有创建、复制、读取或导入任何个人 B/C。

| 步骤 | 结果 | 实际证据 |
| --- | --- | --- |
| CH-01 | `BLOCKED` | 真实 Chrome 已打开生产页面并进入新建加密账本流程；填写一次性虚构密码后触发 macOS 原生保存选择器。Mac 已锁屏，控制器明确要求用户手动解锁，未能选择 `w14-v3-fictional-primary.lftl`，没有创建 C。 |
| CH-02 | 未执行 | 依赖 CH-01 的 primary C；不能跳步。 |
| CH-03 | 未执行 | 依赖 CH-01～02；未新增 SOL，未写虚构 Trade。 |
| CH-04 | 未执行 | 依赖既有现金与 SOL Trade。 |
| CH-05 | 未执行 | 未进入可写 C；没有进行 KNIGHT 离线流程。 |
| CH-06 | 未执行 | 未进行 Binance 显式点击；不能用自动测试代替真实 Network 顺序。 |
| CH-07 | 未执行 | 未建立可锁定／重开的虚构 C。 |
| CH-08 | 未执行 | 未导出 V3 B。 |
| CH-09 | 未执行 | 未创建 import-target C，未导入 B。 |
| CH-10 | 未执行 | 未取得合法导入后的缺 mapping 状态。 |
| CH-11 | 未执行 | 已准备只接受本次临时目录文件的派生工具，但没有生成或导入 invalid-cash V3／V2 B；不把工具准备算验收。 |
| CH-12 | 未执行 | 未取得具有双代的 primary C，也未生成损坏 current 的副本。 |
| CH-13 | 未执行 | 不能在无账本状态下把响应式／键盘局部查看冒充完整关键路径。 |
| CH-14 | 未执行 | 没有完成业务数据链，无法审阅总资产、趋势、P&L、热力图及全程日志。 |

CH-01～CH-14 的总体结果为 `BLOCKED`，不是 `FAIL`，更不是 `PASS`。

## Console、Network、原生 picker 与虚构文件证据

| 证据 | 结果 |
| --- | --- |
| Console | 阻塞前读取到的 warning/error 数为 0；但未取得 CH 全链日志，因此不能支持 PASS。 |
| Network | 阻塞前未执行任何 Binance 点击，也未观察到 Binance 请求；未完成 DevTools Preserve log 的 CH 全链审阅，因此不能支持 PASS。 |
| 原生 picker | File System Access API 已触发 macOS 原生保存路径流程；Mac 锁屏导致无法选择路径。连续三次自动续跑均得到“必须手动解锁”的同一结果；唤醒显示器不等于解锁。 |
| 虚构文件 | 没有生成 B/C；临时目录只含本次派生脚本。没有密码、密钥、完整 ciphertext 或个人投资数据写入报告。 |

真实 Chrome 标签页和生产服务曾保留用于恢复，但本报告不假定该运行时会永久存活；恢复验收时应重新清空 Console／Network 并从 CH-01 开始。

## 未解决问题 B-01

| 字段 | 记录 |
| --- | --- |
| 问题编号 | `B-01` |
| 发现位置 | 真实 Chrome `CH-01`，macOS 原生保存选择器 |
| 失败命令／步骤 | production Chrome 点击“选择位置并创建”后，调用 macOS 原生窗口控制；连续三次返回 Mac 已锁定，必须由用户手动解锁 |
| 预期结果 | 用系统原生 picker 在专用临时目录创建 `w14-v3-fictional-primary.lftl`，随后验证 V3 初始账本和零意外 Binance 请求 |
| 实际结果 | 原生 picker 无法操作，C 未创建；CH 链在第一步停止 |
| 涉及模块 | 页面入口 `src/app/LedgerAccessGate.tsx`、File System Access API 与 macOS 原生 picker；没有证据表明 Repository、加密或 V3 源码失败 |
| 安全调查 | 复核生产服务仍可用；保留 Chrome 会话；连续三个目标回合检查系统状态；尝试仅唤醒显示器；复核 Chrome 页面、Console 与源码／Git 均无新增异常 |
| 01A／01B 为什么不能给出代码修复 | 01B 已明确要求真实 Chrome 和原生 picker，并明确禁止替代证据。锁屏是外部安全状态，不是文档定义的产品分支；任何绕过都会削弱验收可信度 |
| 为什么没有继续修改 | 没有源码根因；修改 File System Access 或放宽验收会制造新安全行为。CH-02～14 串行依赖 primary C，跳过会使结果不可复现 |
| 可选方案 A | 用户解锁当前 Mac；重新启动／确认 production 服务，清空 Console 与 Network，从 CH-01 完整重跑 CH-01～14。推荐此方案 |
| 可选方案 B | 安排一个新的、全程保持解锁的专用 Chrome 验收时段；重新建立一次性临时目录并从 CH-01 完整重跑，不复用局部结果 |
| 需要用户决定 | 解锁后直接回复“已解锁”继续，或指定另一个保持解锁的验收时段；这只是操作选择，不需要新增产品决定 |
| 最后安全提交 | `b71987b4a5c37cdd0e7d62f07aeb4215d198588e` |
| 未提交源码 diff | 无；源码工作区 clean |
| 对真实 B 的影响 | 独立复审和真实 Chrome 文件闭环均未完成，第一次真实 B 导入继续禁止 |

## 最终 Git 现场

### 源码仓库

- 当前分支：`zhennn/w14-v3-cash-assets-market-data`
- HEAD：`b71987b4a5c37cdd0e7d62f07aeb4215d198588e`
- `main`：仍为 `0d0cb555e5d2fac1660ac51e7b577bcb9710582d`
- 工作区：clean，无 staged、unstaged、untracked
- `origin/main...HEAD = 0/12`
- upstream：无
- 固定阶段提交：8 个；额外 fix：4 个

### 根文档仓库

- 创建 01C 前：`main@cf8388c17a6cbaae04295b308823f70284c7dde0`，clean，`origin/main...HEAD = 0/4`
- 收口范围：只新增并暂存本 01C；不修改 01A、01B、`00-当前开发状态.md`、README 或其他 Week 14 文件
- 本文提交后应为：`main`、clean、相对 `origin/main` ahead 5／behind 0；提交 hash 在最终回复记录，避免文档自引用和 amend

## 边界声明

- 没有 merge、rebase、cherry-pick、squash、amend、reset、tag、PR 或分支删除。
- 没有 push，也没有给功能分支设置 upstream。
- 没有修改或进入 CS2026 源码轨道。
- 没有导入、复制或读取真实 B/C；没有使用真实投资数据。
- 自动化与本报告不是独立复审；独立执行者复审尚未执行。
- `BLOCKED` 不撤销已经通过的八阶段与自动化结果，但也不能升级为本地开发候选 `PASS`。

## 恢复通过线

用户解锁 Mac 后，从 CH-01 重新执行完整 CH-01～CH-14。只有真实 Chrome、原生 picker、Console／Network 和虚构 B/C 文件闭环全部通过，且届时源码／Git 现场仍与本报告一致，才能另行把候选结论更新为 `PASS`；之后仍需新鲜独立执行者复审，真实 B 才可能进入下一步。
