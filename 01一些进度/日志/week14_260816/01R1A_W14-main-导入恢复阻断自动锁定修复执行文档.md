# Week 14 main 第 01 批 R1：导入恢复阻断自动锁定修复执行文档

- 日期：2026-08-20
- 状态：`READY`；本任务只执行本文件，完成后生成 `01R1B`
- 源码轨道：`01一些进度/产出/LocalFirstTradingLedger/`
- 源码分支：`zhennn/w14-v3-cash-assets-market-data`
- 开始前源码 HEAD：`c17a9973c665742a545211e2be76df6660e64279`
- 原 V3 实现边界：`578f4a5af6551b321eb6677c555dd459fa2b168e`
- 阻断来源：原 `01D_W14-main-账本V3现金仓位与资产行情独立复审报告.md` 的 `W14-01D-P0-01`
- 固定开发报告：`01R1B_W14-main-导入恢复阻断自动锁定修复报告.md`
- 固定独立复验输入：`01R1C_W14-main-导入恢复阻断自动锁定独立复验执行文档.md`

## 结论与唯一目标

本轮只关闭原 `01D` 已确认的一个 P0：V3 B 导入进入 `IMPORT_RECOVERY_BLOCKED` 后，应用不能继续停留在“已解锁 Dashboard + 只读提示 + 等用户手动锁定”的状态，必须把它提升为当前会话的一次性 fatal signal，并自动走既有 session quiesce / drain / revoke / release 生命周期。

成功关闭后必须形成以下不可拆链：

```text
IMPORT_RECOVERY_BLOCKED
→ Hook 同步停止接收新操作并使所有旧异步结果失效
→ 当前会话只发布一次 fatal signal
→ Dashboard 立即退出已解密工作区
→ Gate 同步进入关闭态并开始 quiesce
→ drain 所有此前已经接受的工作
→ Repository façade 被撤销
→ 应用层 LedgerFileRepository / LedgerFileCrypto / CryptoKey 引用随会话撤销变为不可达
→ 释放文件 lease
→ 清除已记住的连接，进入明确的恢复阻断关闭页
→ 下次必须重新选择文件、输入密码并完成整条认证与账本校验，才能重新进入 Dashboard
```

这里的“清密钥”只允许按 Web Crypto 和 JavaScript 能证明的边界表述为“撤销 Repository 并移除应用层可达的 Repository、LedgerFileCrypto 与 CryptoKey 引用”；不得声称已经完成浏览器内存物理清零。

本轮不改变 01A 产品范围，不改写原 01B 第 7.3 节和 `C-10 P0`，不把原 01C 的开发 `PASS` 或原 01D 的 `FAIL` 改名。不得夹带 V3 新功能、真实数据、NLP、CS2026、Binance 方案变化、schema 或文件格式变化。

## 一、冻结现场与仓库边界

执行文档建立前的实时现场：

- 根文档仓库：`main@0dce2356db191413a4b6de70f36417675bc54f58`，相对 `origin/main` 为 `0 behind / 10 ahead`；存在用户自己的 `000-自然语言整理.md` 改动，本任务禁止读取、修改、暂存或提交该文件；
- 源码仓库：`zhennn/w14-v3-cash-assets-market-data@c17a9973c665742a545211e2be76df6660e64279`，`main@0d0cb555e5d2fac1660ac51e7b577bcb9710582d`，相对 `main` 与 `origin/main` 都为 `0 behind / 16 ahead`，无 upstream，工作树干净；
- `c17a997` 只在原 V3 实现边界 `578f4a5` 之后记录 README 的独立复审状态，不得把修复起点误报为 `578f4a5`；
- `LocalFirstTradingLedger-CS2026/`、`02_NLP/`、外部参考项目、私人网络说明、自然语言整理与真实 B/C 均不在范围内。

执行时若分支、HEAD 或工作树出现无法解释的漂移，或源码出现用户未提交改动，必须停止并保留现场。根文档与源码始终按两个 Git 仓库独立检查。

本任务授权的 Git 操作仅限源码功能分支上的小范围英文本地提交。禁止 push、设置 upstream、merge、rebase、cherry-pick、squash、amend、reset、PR、tag、删除分支或修改源码 `main`。本轮根文档不得因源码提交而混入源码仓库，也不得碰用户的 `000-自然语言整理.md`。

## 二、fatal signal 与会话状态机合同

### 2.1 Hook 的同步失效边界

`usePersistentLedger` 收到 Repository 的 `IMPORT_RECOVERY_BLOCKED`，或发现已复读候选与预检候选身份不一致时，必须在发布任何候选、成功或 saved 状态之前完成：

1. `acceptingOperations = false`，后续 apply、save、clear、retry、import 全部拒绝；
2. 递增 Hook generation，使当前导入之后的所有迟到 Promise、hydration、save、retry 与 UI 发布条件失效；
3. abort 当前导入控制器，并清除可重试保存、待发布 snapshot、pending hydration 等可继续工作的引用；
4. 把持久化状态置为错误／关闭方向，不得继续显示 `saved`、成功、普通 warning 或“可继续编辑”；
5. 保持页面中的旧 ledger 不被候选替换，不发布 candidate，不增加 persistedVersion，不产生新的 C 写入；
6. 为当前 ledger-file session 发布一次且只发布一次结构化 fatal signal；重复错误、迟到 rejection 或 React 重渲染不得产生第二次会话关闭；
7. signal 必须绑定实际 sessionId、session generation 与本次 occurrence，旧会话 signal 不得关闭后来进入的新会话。

fatal 后的 import Promise 可以向原调用方返回 `LEDGER_IMPORT_RECOVERY_BLOCKED`，但调用方的任何完成消息都不得重新挂载或覆盖关闭页。

### 2.2 Dashboard 的自动交接

- Dashboard 收到当前会话 fatal signal 后，立即停止渲染含明文数据的工作区，只显示最小关闭中页面；
- 通过专用 `onSessionFatal` 边界把 signal 与 Hook 的 `drainForSessionQuiesce` 交给 Gate；不得伪装成用户点击锁定；
- 同一 signal 只能交接一次；组件卸载、重复 effect 或 Strict Mode 不得重复 beginQuiesce；
- 所有 workspace draft、对话框、导入面板、成功反馈和 pending UI 随 Dashboard 卸载，不得被迟到结果复活。

### 2.3 Gate 与 session lifecycle

Gate 只接受仍为 `activeSessionRef.current` 的当前 session fatal signal。接受后必须：

1. 同步 invalidate Gate 中的文件选择、解锁、恢复等 pending operation；
2. 清空密码、确认文本、recoveryId 和普通表单错误；
3. 先把 `accessState` 设为关闭／locking，使 Dashboard 卸载；
4. 对当前 session 调用一次 `beginQuiesce("immediate-lock")`；
5. 使用 Hook drain 等待此前已接受工作 settle；
6. 使用同一 token 执行 `lockAfterQuiesce`，由既有 session runtime 先把 Repository 设为 `null`、phase 设为 revoked，再释放 lease；
7. release 成功后清除 remembered connection，仅清理浏览器中的连接记录和 pending selection，不删除、不覆盖、不修复 C 文件；
8. 进入独立的 fatal-closed 页面，明确说明磁盘结果未知、系统没有自动修复或继续写入、应保留文件用于恢复；
9. fatal-closed 的唯一重入路径是重新调用系统文件选择器，随后输入密码并完成 fileId、current／previous、认证、LedgerData 与 revision 全链验证；不得自动使用旧 Repository、旧 selected handle 或旧 Dashboard。

若 beginQuiesce 或 drain 本身失败，页面必须停在关闭错误态，不恢复 Dashboard。若 lease release 或 remembered connection 清理失败：

- Repository façade 仍保持 revoked；
- Dashboard 与明文工作区继续卸载；
- 只提供“重试安全释放／关闭”的安全动作；
- 重试只能继续同一个 token 对应的 release 与关闭清理，不能创建新 session、复活旧 Repository、重新执行导入或继续 mutation；
- 成功后进入 fatal-closed，而不是自动重连旧文件。

## 三、生产代码允许范围

优先只修改以下最小职责面：

- `src/app/usePersistentLedger.ts`
- `src/app/DashboardShell.tsx`
- `src/app/LedgerAccessGate.tsx`
- 上述模块的正式测试
- 为证明 session revoke／release retry 而必须补充的 `src/platform/persistence/ledgerRepository.test.ts`
- 若类型合同确有必要，允许最小修改 `src/platform/persistence/ledgerRepository.ts`；不得改变加密、文件格式或业务 Repository 行为
- 源码 `README.md` 只在最终开发状态需要准确记录 R1 候选时更新

原则上不修改 `BackupControls.tsx`；若测试证明它会在 fatal 后发布成功／warning，可做只阻止迟到 UI 发布的最小修复。不得重做 B 导入、C 加密、补偿算法、Binance、现金、资产、图表或页面设计。

## 四、永久正式回归矩阵

以下测试必须进入正式仓库，不能只写一次性脚本或聊天结论：

| ID | 层 | 必须机械证明的结果 |
| --- | --- | --- |
| `R1-F01` | Hook | Repository 返回 `IMPORT_RECOVERY_BLOCKED` 后立即拒绝新 mutation、clear、retry 与第二次 import |
| `R1-F02` | Hook | 当前 session 只发布一个结构化 fatal signal；重复错误与重渲染不重复关闭 |
| `R1-F03` | Hook | generation、abort 与清理使 pending／late import、save、hydrate、retry 结果不能发布 candidate 或覆盖状态 |
| `R1-F04` | Hook | old ledger 保持；candidate 不进入 reducer；mutationVersion／persistedVersion 不前进；状态不为 saved |
| `R1-F05` | Dashboard | fatal 后工作区、明文汇总、表单与成功反馈立即卸载，只交接一次当前 signal 与 drain |
| `R1-F06` | Gate | 当前 signal 同步进入 locking，调用一次 beginQuiesce、drain 与 lockAfterQuiesce；旧／伪造 signal 被拒绝 |
| `R1-F07` | Session | beginQuiesce 后公开 Repository façade 立即拒绝 load/save/clear，完成 token 后 runtime Repository 被 revoke |
| `R1-F08` | Session | drain 等待此前接受的导入／保存工作；迟到结果 settle 后仍不能获得新写入机会 |
| `R1-F09` | Gate | release 成功后调用 remembered-connection clear，显示 fatal-closed；不调用普通 initialize 自动重连 |
| `R1-F10` | Gate | release 第一次失败时 Dashboard 不重挂、Repository 仍 revoked；安全重试只重试同一关闭链并可最终成功 |
| `R1-F11` | Gate | fatal-closed 后必须 selectExisting → password → 完整 unlock／validation 才能进入一个全新 session Dashboard |
| `R1-F12` | File Repository | 保留既有“compensation 与 final read 均不能证明旧字节”测试，继续返回 recovery-blocked 且 load/save 禁用 |
| `R1-F13` | 回归 | 正常 lock、route leave、dirty lock、create/open/save/current/previous/recovery、正常 B 导入与普通 compensation 成功路径不退化 |

测试必须同时断言：B 原始输入不被改写；C 在 fatal 触发后没有进一步写入；没有 saved／success／普通 warning；旧 session 与旧 Repository 永久无效；清理失败不会让旧 session 复活。

允许使用确定性故障注入、deferred Promise、受控 clock、虚构 handle／lease 与 spy。不得访问网络、真实文件或真实数据。

## 五、开发顺序与测试—修复—重测闭环

严格顺序：

1. 先用正式测试稳定复现 Hook 只读但未自动关闭的旧行为；
2. 实现最小生产修复；
3. 补齐 Hook、Dashboard、Gate 和 session lifecycle 回归；
4. 运行直接相关定向测试；
5. 运行完整 Week 14 定向闭集；
6. 运行完整 `npm test`、typecheck、lint、production build 与 diff/scans；
7. 任一 source、test、config、fixture 修改都会使此前所有绿灯失效，必须从直接定向开始并重新完成最终完整循环；
8. 只有最终源码冻结后，才可开始全新的真实 Chrome CH-01～CH-14。

最终至少运行：

```bash
npx vitest run <本 R1 直接相关正式测试>
npx vitest run <main...HEAD 中全部新增或修改的测试文件>
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
git diff --check main...HEAD
```

还必须扫描 `.only`、`.skip`、`debugger`、意外 `console.log`／`console.debug`、敏感文件、真实 B/C、schema/version 越界、联网入口、依赖变化和无关 diff。测试数量只能记录实际输出。

## 六、真实 Google Chrome CH-01～CH-14

自动化与质量门最终全绿后，按原 01B 第十一节重新执行完整 CH-01～CH-14，不能复用原 01C 或原 01D 的 Profile、origin、文件、hash、revision、截图或观测。

硬要求：

- production build；真实 Google Chrome；全新隔离 Profile；
- 执行开始时选择并记录一个专用 loopback origin，整条链保持同一协议、hostname 与端口；
- 使用 macOS 原生文件选择器创建／选择全新的虚构 `.lftl` 与 B 文件；
- 文件名明确带 `W14-R1-FAKE`，资产、金额、备注和密码全部虚构；
- 不读取、忘记、清空、覆盖或重新绑定任何归属未知的旧连接；
- 记录 Chrome 版本、启动命令、origin、branch、HEAD、Profile 目录、文件名、revision、SHA-256、Console warning/error 与所有 Binance 请求触发点；
- 除原 CH-01～CH-14 正常链外，必须通过正式自动测试而非破坏真实文件的方式证明 fatal 故障注入；Chrome 中至少确认正常导入、锁定、重开与恢复没有因自动关闭修复而退化。

任一 CH 步骤失败、环境不隔离、原点漂移或触碰未知旧连接，开发结果不能写 `PASS`。发现可安全修复的源码问题时，修复并新增回归后，所有自动门和完整 Chrome 链都从头重跑。

## 七、源码提交、01R1B 与冻结

源码按真实关键节点使用英文小提交，建议但不强制拆成：

1. `fix: close sessions after blocked import recovery`
2. `test: lock fatal import recovery lifecycle`
3. `docs: record Week 14 R1 candidate status`

每次提交前核对 source status、diff、cached diff 与 `git diff --check`，只暂存本 R1 文件。禁止 amend 或 squash；若后续测试发现问题，使用新的精确 `fix:`／`test:` 提交。

完成后生成 `01R1B`，至少记录：

- 原 P0、实际状态机与应用层引用释放边界；
- 实际修改的生产代码、测试、fixture、配置与 README；
- `R1-F01～R1-F13` 逐项证据；
- 每轮失败、根因、修复以及哪一轮绿灯因代码变化而失效；
- 最终直接定向、Week 14 定向闭集、全量、typecheck、lint、build、diff/scans 的命令、退出码、文件数和测试数；
- 全新 Chrome CH-01～CH-14 的环境、步骤、文件、revision/hash、Console 与 Network 证据；
- 全部本地英文提交、最终 HEAD、tree、`main...HEAD`、upstream 与工作树；
- 未 merge／push、未处理真实 B、仍等待全新独立执行者按 01R1C 生成 01R1D。

源码冻结后，只允许在 `01R1C` 的候选身份栏登记最终精确 HEAD、tree、完整 diff hash、正式测试清单和开发门摘要；不得回写降低复验标准。`01R1B = PASS` 只是开发结果，不能替代独立 `01R1D = PASS`。

## 八、停止线

以下任一情况必须修复并从头重测，无法安全修复时在 01R1B 判 `BLOCKED`：

- fatal 后仍显示或重新挂载 Dashboard；
- 新操作、迟到 Promise、旧 session 或旧 Repository 仍能读取／写入／发布候选；
- Repository revoke 或 lease release 没有发生；
- release 失败后旧 session、Dashboard 或 mutation 被恢复；
- 下次进入未经过重新选文件、密码与完整验证；
- B 被改写、C 在 fatal 后继续写、页面出现 saved／success；
- 正常锁定、route leave、创建／打开／保存／双代／恢复／普通导入或补偿路径退化；
- 任一最终自动门、扫描或 CH-01～CH-14 非绿；
- 候选漂移、分支不符或出现无法解释的用户源码改动。

本任务不执行 `01R1C`，不生成 `01R1D`，不合入 `main`，不 push，不开始真实 V3 B。
