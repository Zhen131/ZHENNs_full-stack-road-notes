# Week 14 main 第 01 批 R1：导入恢复阻断自动锁定独立复验执行文档

- 日期：2026-08-20
- 状态：`FROZEN INPUT`；本开发任务不执行
- 独立输入：原 `01D`、`01R1A`、冻结后的 R1 源码候选与 `01R1B`
- 唯一允许生成的独立报告：`01R1D_W14-main-导入恢复阻断自动锁定独立复验报告.md`
- 候选分支：`zhennn/w14-v3-cash-assets-market-data`
- 建文时起点：`c17a9973c665742a545211e2be76df6660e64279`
- 最终冻结 HEAD：`789ebd57e91700a3233d9a8e9814887403f6121d`
- 最终 tree：`3eb0a0160cbd20745ffa3cdc1e7b0a4b1e93163c`
- `main...HEAD` 完整 binary diff SHA-256：`d6f36e27382ce03ab3f62b218607fb8ebd3dc227c69ee00d2174471121f2be74`
- `c17a997...HEAD` 本 R1 完整 binary diff SHA-256：`fb37de127451ac4dd49c2d7e1592fd2866292d21f58c7c8ec5fda70f354482e0`
- 开发门摘要：R1 直接 3 files / 49 tests、session lifecycle 11 / 303、Week 14 定向闭集 57 / 729、全量 85 / 914；typecheck、lint、production build、两类 diff-check 与边界扫描全部退出 0；全新开发侧 Chrome CH-01～CH-14 `PASS`
- R1 直接正式测试：`src/app/usePersistentLedger.fileImport.test.tsx`、`src/app/DashboardShell.fatal.test.tsx`、`src/app/LedgerAccessGate.test.tsx`；Week 14 57 文件闭集必须从冻结候选独立执行 `git diff --name-only main...HEAD -- '*test.ts' '*test.tsx'` 重新枚举，不得信任本摘要

## 结论：必须重新证明原 P0 已关闭

独立执行者不能继承开发任务的 `PASS`，也不能复用原 01C 的自动化、Chrome、文件、hash 或 revision。唯一目标是重新证明 `W14-01D-P0-01` 是否真正关闭，同时证明修复没有破坏原 01B 的 C-10、V3 正常链和文件生命周期。

最终只能据实选择：

- `PASS`：fatal 自动关闭、Dashboard 卸载、Repository revoke、应用层密钥持有者不可达、lease release、失败重试、强制重选／重认证、全部正式测试、质量门和全新 Chrome CH-01～CH-14 均有新鲜证据；
- `FAIL`：存在可重复反证、P0／P1、正式测试或质量门失败、删测／skip／放宽 C-10，或任何旧 session／Repository／Dashboard 可复活；
- `BLOCKED`：没有强制失败反证，但候选无法冻结，或不可替代的真实 Chrome／原生 picker／文件证据无法取得。

已有强制失败时，即使另有环境阻塞，结论仍优先 `FAIL`。开发 `01R1B = PASS`、自动测试全绿或本地提交都不能替代独立结论。

## 一、独立性与只读边界

执行者开始前必须按顺序完整读取：

1. 工作区与源码仓库 `AGENTS.md`、ledger-workflow；
2. `00-当前开发状态.md`；
3. Week 14 原 01A、01B、01C、原 01D；
4. 01R1A、本文件与 01R1B；
5. W11 批次命名规则；
6. 源码 README；
7. 候选中与 Hook、Dashboard、Gate、session lifecycle、file repository 和测试直接相关的实际代码。

开始与结束都记录：

- 根文档仓库 branch、HEAD、status、staged／unstaged／untracked 与相对 `origin/main`；
- 源码 branch、HEAD、tree、status、staged／unstaged／untracked、upstream、`main...HEAD` 与 `origin/main...HEAD`；
- 从冻结范围计算的完整 diff hash和关键源码／测试 SHA-256；
- 原 01D 仍为 `FAIL`，没有被改写或删除；
- 候选没有 merge 到源码 `main`，没有 push 或设置 upstream。

独立执行期间源码、正式测试、fixture、配置、README、Git index 与现有文档全部只读。不得修代码、改测试、临时给正式目录加探针、提交 Git、协调当前状态或生成真实 B。只允许落档 `01R1D`；临时日志放在隔离临时目录，不进入仓库。

不得读取 `000-自然语言整理.md`、真实投资归档、个人 B/C、`02_NLP/`、`LocalFirstTradingLedger-CS2026/`、私人网络说明或外部参考项目。

## 二、候选身份冻结门

本文件在开发开始前先固定复验标准，因此最终候选身份只能由开发完成后的协调步骤登记，不能改变以下通过线。

执行者必须确认：

1. `01R1B` 记录的最终 HEAD、tree、diff hash 与现场完全一致；
2. 修复提交全部晚于 `c17a997`，并且原 V3 实现边界 `578f4a5` 与 README 状态提交 `c17a997` 均仍在历史中；
3. diff 只涉及 01R1A 允许的最小生产／测试／README 范围；
4. 没有修改 schema、BackupEnvelope、C 文件格式、加密、Binance、现金、资产、图表、NLP、CS2026 或真实 fixture；
5. 正式测试没有被删除、skip、重命名隐藏或放宽期望；
6. 审查前后 HEAD、tree、index 与源码工作树一致。

任一候选身份不一致且无法只读解释，判 `BLOCKED`；发现擅自降低 C-10、删测或混入危险功能，判 `FAIL`。

## 三、原 P0 的独立状态机审查

必须从实际源码重新追踪：

```text
LedgerFileRepository.importReadyLedger
→ IMPORT_RECOVERY_BLOCKED
→ usePersistentLedger fatal invalidation
→ DashboardShell fatal handoff and workspace unmount
→ LedgerAccessGate current-session validation
→ beginQuiesce
→ Hook drain of accepted work
→ lockAfterQuiesce
→ session runtime repository = null / phase = revoked
→ lease release
→ remembered connection clear
→ fatal-closed page
→ native picker reselection
→ password + full file validation
→ new session Dashboard
```

必须明确区分：

- Repository 内部已经 recovery-blocked、拒绝后续 load/save；
- 公开 session Repository façade 在 beginQuiesce 后同步 revoke；
- Gate 完成 session revoke 与 lease release；
- React／应用层不再保留可达的 LedgerFileRepository、LedgerFileCrypto、CryptoKey 与 decrypted Dashboard；
- 以上不等于浏览器物理内存零化，报告不得夸大。

## 四、R1 独立复验矩阵

`01R1D` 必须逐项给出源码证据、正式测试证据、本次运行结果和判定：

| ID | 必须独立证明的强制通过线 |
| --- | --- |
| `R1-I01` | recovery-blocked 同步停止新 apply／save／clear／retry／import，不能继续操作 |
| `R1-I02` | Hook 为当前 session 只发布一次结构化 fatal signal；重复错误、重渲染和迟到 rejection 不重复 beginQuiesce |
| `R1-I03` | generation／abort／pending 清理使所有迟到 import、save、hydrate、retry 不能发布 candidate 或覆盖关闭状态 |
| `R1-I04` | old ledger 保持；B 不变；C 在 fatal 后零进一步写；mutation／persisted 不前进；无 saved／success／普通 warning |
| `R1-I05` | fatal 后 Dashboard、明文汇总、表单、draft、导入面板和成功反馈立即卸载 |
| `R1-I06` | Gate 只接受当前 active session signal；旧／伪造 signal 不能关闭新 session |
| `R1-I07` | beginQuiesce、drain、lockAfterQuiesce 各一次且顺序正确，drain 等待所有此前接受的工作 |
| `R1-I08` | beginQuiesce 后公开 Repository façade 拒绝 load/save/clear；完成 token 后 runtime Repository 为 null／revoked |
| `R1-I09` | lease release 成功后 remembered connection 被清理，只进入 fatal-closed，不执行普通 initialize 自动重连 |
| `R1-I10` | release／关闭清理第一次失败时仍无 Dashboard、Repository 保持 revoked；安全重试只继续同一关闭链并可最终完成 |
| `R1-I11` | fatal-closed 后必须原生选择文件、输入密码、验证 fileId／认证／current／previous／schema／revision，才进入全新 session |
| `R1-I12` | 既有 File Repository recovery-blocked 故障注入仍稳定返回该错误，且 Repository load/save 永久拒绝 |
| `R1-I13` | 正常 immediate lock、dirty lock、route leave、create/open/save、current/previous、previous recovery、正常 B 导入与补偿成功路径无回归 |
| `R1-I14` | 原 01B C-10 与 P0 等级未降低；没有用“请手动锁定”、只读页或普通 warning 替代自动关闭 |
| `R1-I15` | 候选只读：审查前后 HEAD、tree、完整 diff hash、tracked／untracked 源文件和 index 一致 |

`R1-I01～R1-I12` 或 `R1-I14` 任一反证强制 `FAIL`。

## 五、正式测试真实性审查

至少阅读并复跑实际存在的相关正式测试：

```text
src/app/usePersistentLedger.fileImport.test.tsx
src/app/usePersistentLedger.test.tsx
src/app/DashboardShell*.test.ts(x)
src/app/LedgerAccessGate.test.tsx
src/platform/persistence/ledgerRepository.test.ts
src/platform/files/ledgerFileRepository.test.ts
src/features/backup/BackupControls.test.tsx（若 R1 diff 或行为涉及）
```

测试质量必须证明：

1. recovery-blocked 来自确定性 write／close／readback／compensation 故障注入，不是直接伪造 UI boolean；
2. Hook 测试断言 fatal signal、operation rejection、generation 失效、old ledger 保持与 no saved；
3. Dashboard 测试使用实际 handoff 逻辑，证明工作区卸载且只交接一次；
4. Gate 测试使用真实 `createLedgerSession`，证明 Repository façade revoke、drain、release 与 retry，而不只数 mock callback；
5. release failure 测试证明第一次失败后 Repository 已 revoked，第二次只重试相同 release，不重新 beginQuiesce；
6. re-entry 测试必须经过 selectExisting、密码和新 session unlock，不允许只 setState 到 Dashboard；
7. 既有 Repository recovery-blocked load/save 禁用测试仍在且未弱化；
8. 正常 import、compensation restored、lock、route leave、dirty、双代与恢复回归仍在；
9. 没有 `.only`、`.skip`、删除旧断言、缩小 fixture 或把 fatal 改成普通 error；
10. 临时探针、聊天推理或 jsdom 单层 mock 不能替代缺失的跨层永久回归。

若生产逻辑看似正确但缺少强制永久证据，登记测试缺口并按证据不足程度判 `FAIL` 或 `BLOCKED`，不得假设通过。

## 六、定向测试与完整质量门

先从候选 diff 独立枚举全部 R1 相关正式测试并运行，随后独立枚举 `main...HEAD` 全部新增／修改测试形成 Week 14 定向闭集。不得照抄 01R1B 的文件清单而不核对。

然后从冻结 HEAD 完整运行：

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
git diff --check main...HEAD
```

还要只读扫描：

- `.only`、`.skip`、`debugger`、意外 `console.log`／`console.debug`；
- schema 2／3、BackupEnvelope V2／V3 与 C 外层版本边界；
- 生产 fetch、Binance 域名、自动 retry／poll／mount refresh；
- API key、私钥、密码、真实 B/C、环境文件和二进制；
- 依赖／lockfile、NLP、CS2026 与修复无关的 diff；
- 原 01B 的 C-10、正常导入、compensation、current／previous 与恢复测试是否仍存在。

每条命令记录实际命令、退出码、文件数、测试数、skip 数和输出摘要。任一正式门非零、skip 或 whitespace error 强制 `FAIL`。

## 七、全新真实 Google Chrome CH-01～CH-14

自动门通过后，必须重新执行原 01B 第十一节完整 CH-01～CH-14。不得使用原 01C 或开发 R1 的 Profile、origin、文件、连接、hash、revision、截图或 Console/Network 结论。

硬要求：

- production build，真实 Google Chrome，全新独立 Profile；
- 执行开始时选择并记录一个专用 loopback origin，CH-01～CH-14 全链不更换协议、hostname 或端口；
- 使用 macOS 原生保存／打开 picker；
- 新文件名明确包含 `W14-R1-REVIEW-FAKE`，全部内容与密码虚构；
- 不读取、删除、忘记、清空、覆盖或重新绑定任何未知旧连接；
- 记录实际 Chrome 版本、启动命令、origin、Profile、branch／HEAD、文件名、revision、SHA-256、Console warning/error、Network 与 Binance 明确点击触发点；
- 重新完成现金、交易、离线资产／手动价、SOL／KNIGHT、B 导出导入、invalid-cash／V2 零写拒绝、双代与 previous 恢复、桌面／390px／键盘、汇总／图表／P&L／热力图全部步骤；
- Chrome 正常链不能替代 fatal 故障注入；fatal 的 release-failure 与 late-promise 证据来自冻结候选中的正式自动回归。

CH-01～CH-14 任一失败、原点漂移、环境无法证明隔离或触碰未知连接，不能判 `PASS`。真实 Chrome／原生 picker 不可用且没有强制反证时判 `BLOCKED`；jsdom、组件测试、内置浏览器、截图或开发报告不能替代。

## 八、01R1D 报告格式与判定

`01R1D` 至少包含：

1. 最终结论 `PASS`／`FAIL`／`BLOCKED`；
2. 候选 branch、HEAD、tree、完整 diff hash与前后只读身份；
3. 原 P0 状态机逐节点源码证据；
4. `R1-I01～R1-I15` 的预期、实际、证据与判定；
5. 正式测试真实性审查与缺口；
6. R1 定向、Week 14 定向闭集、全量和全部质量门的本次命令与原始摘要；
7. 全新 Chrome CH-01～CH-14 的逐步结果、环境、文件、revision/hash、Console 与 Network；
8. findings，含等级、复现、期望／实际、影响文件和最小建议；
9. 原 01D `FAIL` 仍保留，01R1D 是新的独立结论而非覆写；
10. 没有修改源码、测试、fixture、配置、README、Git index、00B、00D、当前状态或其他现有文档；
11. 没有 merge、push、upstream、PR、tag、真实 B 或真实数据操作。

只有全部强制证据成立、没有 P0／P1／关键正式测试缺口、候选身份一致且 CH-01～CH-14 全部通过时，才能写 `PASS`。

## 九、独立执行后的边界

- 独立执行者无论结论为何，只生成 `01R1D`，不提交 Git；
- `01R1D = PASS` 后，仍由另一个协调步骤决定是否更新 00B、00D、当前状态、README、merge 或 push；
- `01R1D = FAIL / BLOCKED` 时，不更新完成状态，不进入 R2，不开始真实 V3 B；
- 本开发任务不执行本文件，不生成 `01R1D`。
