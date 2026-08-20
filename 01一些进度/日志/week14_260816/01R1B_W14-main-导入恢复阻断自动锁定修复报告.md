# Week 14 main 第 01 批 R1：导入恢复阻断自动锁定修复报告

- 日期：2026-08-20
- 开发结论：`PASS`
- 证据性质：开发执行结果；不是独立复验，不覆盖原 `01D = FAIL`
- 源码分支：`zhennn/w14-v3-cash-assets-market-data`
- R1 起点：`c17a9973c665742a545211e2be76df6660e64279`
- 冻结 HEAD：`789ebd57e91700a3233d9a8e9814887403f6121d`
- 冻结 tree：`3eb0a0160cbd20745ffa3cdc1e7b0a4b1e93163c`

## 结论

原 `W14-01D-P0-01` 已在开发候选中关闭：`IMPORT_RECOVERY_BLOCKED` 不再停在“Dashboard 仍挂载、Repository 只读、等待用户手动锁定”。Hook 现在同步停止新操作并发布一次当前会话 fatal signal；Dashboard 立即卸载明文工作区；Gate 校验 signal 身份后沿既有 session lifecycle 完成 quiesce、drain、Repository revoke、lease release 和 remembered connection 清理。release 第一次失败时旧 Repository 仍不可用，Dashboard 不重挂；重试只继续同一关闭链。完成后必须重新选择文件、输入密码并通过完整验证，才能建立新 session。

最终 R1 直接测试为 3 files / 49 tests，Week 14 定向闭集为 57 / 729，全量为 85 / 914；typecheck、lint、production build、diff-check 和边界扫描全部通过。全新隔离真实 Google Chrome 在同一 production origin 完成 CH-01～CH-14，结果全部 `PASS`。

因此本轮可以判开发 `PASS`，但原 `01D = FAIL` 继续保留；`01R1C` 尚未执行，未生成 `01R1D`。在新的独立 `01R1D = PASS` 前，仍不得合入源码 `main`、push、建立 upstream、处理真实 V3 B 或回写独立验收状态。

## 一、原 P0 与修复后的状态机

原行为：

```text
IMPORT_RECOVERY_BLOCKED
→ Repository 后续 load/save 被拒绝
→ Hook 只显示只读错误
→ Dashboard、解锁页和应用层 session 引用仍在
→ 依赖用户手动锁定
```

修复后：

```text
IMPORT_RECOVERY_BLOCKED
→ Hook acceptingOperations = false / readOnly = true
→ abort import + generation 失效 + 清空 pending/retry/hydration 引用
→ 只发布一次带 sessionId + sessionGeneration 的 fatal signal
→ Dashboard 立即只渲染最小关闭页并只交接一次 signal + drain
→ Gate 拒绝旧／伪造 signal，当前 signal 同步进入 fatal locking
→ beginQuiesce → drain 已接受工作 → lockAfterQuiesce
→ Repository façade revoke → lease release
→ 清除 remembered connection
→ fatal-closed
→ selectExisting → password → 完整 unlock/validation → 新 session
```

应用层引用边界：fatal 后旧 Hook 不再接受 mutation、clear、retry 或第二次 import；旧 Dashboard 被卸载；Gate 持有的旧 session 只用于完成同一关闭链。即使 release 失败，Repository 仍已 revoke，旧 Dashboard 不恢复；成功重试后才清理连接并进入 `fatal-closed`。旧 session 和旧 Repository 永久无效，新进入必须获得新的 sessionId。

## 二、实际修改

### 生产代码

| 文件 | 修改 |
| --- | --- |
| `src/app/usePersistentLedger.ts` | 新增结构化 `LedgerSessionFatalSignal`；同步停止操作、abort、generation 失效、清空待发布引用，只发布一次当前 session fatal signal，并把生命周期切到 quiescing。 |
| `src/app/DashboardShell.tsx` | fatal 后立即卸载工作区、摘要、表单和成功反馈，只显示最小关闭页；同一 signal 只向 Gate 交接一次。 |
| `src/app/LedgerAccessGate.tsx` | 新增 fatal locking / lock-error / fatal-closed；校验 signal 身份，复用 quiesce/drain/revoke/release，清除 remembered connection，保留 release 失败关闭态重试并强制重新选文件、认证和新 session。 |

### 正式测试与文档

| 文件 | 修改 |
| --- | --- |
| `src/app/usePersistentLedger.fileImport.test.tsx` | 新增 recovery-blocked fatal、零候选发布、版本不前进、输入 B 不变、后续操作拒绝和 Repository 永久禁用断言。 |
| `src/app/DashboardShell.fatal.test.tsx` | 新增 Dashboard 明文卸载与 signal/drain 单次交接永久回归。 |
| `src/app/LedgerAccessGate.test.tsx` | 新增真实 session 的 stale signal 拒绝、同步 quiesce、Repository revoke、release 失败重试、连接清理、强制重选／重认证／新 session 回归。 |
| `README.md` | 同步 R1 开发候选已关闭 P0、自动门和 Chrome 已通过，但独立 01R1C 尚未执行。 |

- 实现提交净变化：6 个代码／测试文件，626 insertions / 34 deletions。
- fixture、配置、依赖、lockfile、NLP、CS2026：零修改。
- README 是最终代码冻结后的状态文档提交，不改变 production、test、config 或 fixture；可执行候选仍与完成自动门和 Chrome 的 `bab544f` 完全一致。

## 三、R1-F01～R1-F13

| ID | 机械证据 | 结果 |
| --- | --- | --- |
| R1-F01 | Hook recovery-blocked 测试随后逐一尝试 mutation、clear、第二次 import 与 retry；全部拒绝，fatal 后 write count 不再增加。 | PASS |
| R1-F02 | signal 固定包含 code、occurrence、sessionId、sessionGeneration；rerender 后对象不变，Dashboard handoff callback 只调用一次。 | PASS |
| R1-F03 | fatal 同步 abort import、递增 generation、清空 scheduled snapshot/retry/hydration；既有 deferred import/save/drain 回归证明迟到结果不能发布。 | PASS |
| R1-F04 | recovery-blocked 后 old ledger 保持初始值，candidate 不进入 reducer，mutationVersion/persistedVersion 均为 0，状态为 error 而非 saved；输入 B 序列化前后相同。 | PASS |
| R1-F05 | `DashboardShell.fatal.test.tsx` 证明 `总资产` 等明文工作区立即消失，只保留自动关闭页和一次 signal/drain 交接。 | PASS |
| R1-F06 | Gate 使用真实 `createLedgerSession`；旧／伪造 signal 不触发，当前 signal 只调用一次 beginQuiesce 并进入 `正在安全关闭账本`。 | PASS |
| R1-F07 | beginQuiesce 后旧 session Repository `load/save` 同步抛 `LedgerSessionLifecycleError`；完成 token 后仍不可恢复。 | PASS |
| R1-F08 | session drain 正式回归等待此前接受的 close/import 工作；settle 后旧 Hook 仍不接受新写入。 | PASS |
| R1-F09 | release 成功后 `forgetRememberedConnection` 恰好一次并进入 `账本已因恢复阻断自动关闭`；普通 initialize 不自动重连旧文件。 | PASS |
| R1-F10 | 第一次 release reject 后 Dashboard 仍卸载、Repository 仍 revoked；`重试安全关闭` 只第二次调用同一 release，beginQuiesce 不重复，最终成功。 | PASS |
| R1-F11 | fatal-closed 的重新进入真实经过 `selectExisting`、密码表单、`unlockSelected`，并挂载一个新 session Dashboard；旧 session 仍无效。 | PASS |
| R1-F12 | `ledgerFileRepository.test.ts` 既有“compensation 与 final read 都不能证明旧字节”回归仍返回 recovery-blocked，后续 load/save 继续禁用。 | PASS |
| R1-F13 | 正常 lock、route leave、dirty lock、create/open/save、current/previous、previous recovery、正常 V3 B import 与 compensation 成功路径均在 57 文件闭集、全量和 Chrome 正常链中保持通过。 | PASS |

## 四、失败轮次、修复与证据失效

1. 受控红灯阶段先把原 01D 反证写入正式跨层回归：旧 Hook 没有 fatal signal，Dashboard 不会自动卸载，Gate 没有 fatal close/release retry/fresh re-entry 状态，因此新断言在旧实现上不成立。
2. 最小生产修复一次贯通 Hook → Dashboard → Gate；随后补齐 release 第一次失败、旧 signal、新 session 和迟到工作断言。所有 source/test 变化都使此前绿灯失效，因此最终从 R1 直接测试开始重新跑完整循环。
3. 最后一次 source/test 变化完成后，直接、session lifecycle、57 文件闭集、全量与全部质量门连续通过；之后才建立全新 production Chrome 证据。
4. Chrome CH-13 的两个倒计时撤回探针因自动化到达撤回按钮过晚，在两个一次性恢复副本上完成了已武装删除；这是测试驱动时序错误，不是产品 finding。最终从已认证相邻 revision 生成独立有效目标，重新完成非破坏性的 Enter/Escape、焦点与 390px 检查。
5. 第一个 CH-13 临时目标遗漏 predecessor，产品在密码前正确拒绝为非法账本；补齐 `current.parentRevisionId === previous.revisionId` 后，原生 picker 重新选择并成功解锁。该夹具修正不修改源码、正式测试、配置或冻结候选。
6. README 状态同步发生在 Chrome 完成后，只改变文档。没有 source/test/config/fixture 变化，因此不使最终自动门和 Chrome 证据失效；最终冻结 HEAD/tree/diff 已包含该文档提交。

最终不存在未解决的自动门失败、P0、P1 或产品反证。

## 五、最终自动化与质量门

| 门 | 实际命令／枚举 | 结果 |
| --- | --- | --- |
| R1 直接 | `npx vitest run src/app/usePersistentLedger.fileImport.test.tsx src/app/DashboardShell.fatal.test.tsx src/app/LedgerAccessGate.test.tsx` | exit 0；3 files / 49 tests；0 skip |
| session lifecycle 补充组合 | Hook、Dashboard、Gate、workspace session、file access/controller/repository 等 11 个相关正式文件 | exit 0；11 files / 303 tests；0 skip |
| Week 14 定向闭集 | 从 `git diff --name-only main...HEAD -- '*test.ts' '*test.tsx'` 机械枚举后执行 | exit 0；57 files / 729 tests；0 skip |
| 全量 | `npm test` | exit 0；85 files / 914 tests；0 skip |
| TypeScript | `npm run typecheck` | exit 0 |
| ESLint | `npm run lint` | exit 0；0 warning / 0 error |
| Production | `npm run build` | exit 0；Next production build 成功 |
| 当前差异 | `git diff --check` | exit 0 |
| 完整候选差异 | `git diff --check main...HEAD` | exit 0 |
| 残留与边界扫描 | `.only`、`.skip`、`debugger`、意外 console、敏感词／文件、schema/version、生产 fetch/Binance、自动 retry/poll、依赖／lockfile、NLP、CS2026、无关 diff | 全部通过；未发现新增越界 |

所有最终自动门发生在最后一次 source/test 变化之后；测试数量只记录实际输出。

## 六、全新真实 Chrome CH-01～CH-14

### 环境与边界

- Google Chrome：`151.0.7922.140`
- production origin：`http://127.0.0.1:3427/`，CH-01～CH-14 未更换协议、hostname 或端口
- 隔离 Profile：`/private/tmp/w14-r1-chrome-proof.ddBtpw/profile`
- 启动入口：production `next start`；Chrome 使用独立 `--user-data-dir` 与 `--remote-debugging-port=9333`
- 虚构数据：只使用 `W14-R1-FAKE-*`、虚构金额／备注／密码；没有读取或导入真实 B/C、真实持仓或未知旧连接
- 文件操作：创建、选择与导入均走 macOS 原生 Save/Open picker；最终由执行者自动完成，无需用户代选文件

| 步骤 | 结果与新鲜证据 | 判定 |
| --- | --- | --- |
| CH-01 | 原生创建 `W14-R1-FAKE-PRIMARY.lftl`；外层 V2、内部 schema 3、previous null；BTC/ETH/ADA、现金 0；无 Binance。 | PASS |
| CH-02 | 入金 1000、出金 100、外部支出 50、校准目标 800；显示 before 850 / target 800 / adjustment -50；现金 800。 | PASS |
| CH-03 | 离线新增 SOL；买入 9×100、fee 5；负现金确认 800 / -905 / -105 / gap 105；取消零写，确认后恰好一笔。 | PASS |
| CH-04 | 卖出 SOL 2×100、fee 2 后现金 93；统一流水详情完整；外部支出经两段删除后现金 143。 | PASS |
| CH-05 | 全程 offline；新增 KNIGHT、买入 10×1、手动价 7/9；锁定重开后现金 133、mapping null、手动价 9。 | PASS |
| CH-06 | 明确 online 后 SOL / ` solusdt ` 均只走 exchangeInfo → ticker；单资产刷新同序；等待 10 秒无后台第二轮。 | PASS |
| CH-07 | KNIGHT 一次 exchangeInfo，精确 `BINANCE_VALIDATION_UNAVAILABLE`；无 ticker/retry；离线入金 1、手动价 11、重开后现金 134。 | PASS |
| CH-08 | 两段删除 SOL mapping，旧 API 价保留；导出合法 V3 B；锁定后无 Dashboard 明文。 | PASS |
| CH-09 | 原生选择全新 import target 与 B；零网络预检、完整替换；现金 134、7 条流水、SOL/KNIGHT 数据与手动价完整。 | PASS |
| CH-10 | 独立 pairing target；只有明确点击自动配对后联网；SOL 成功、KNIGHT unavailable，无回滚；请求仅 KNIGHT exchangeInfo、SOL exchangeInfo、SOL ticker。 | PASS |
| CH-11 | invalid-cash V3 精确报 amount must be greater than 0；V2 精确报不迁移；两个空 C hash/revision 均零变化。 | PASS |
| CH-12 | primary 连续入金 2、3，现金 136→139，双代相邻；损坏副本 current 后恢复 previous，得到现金 136；原 primary 仍是 139 且 hash 不变。 | PASS |
| CH-13 | 1200 与 390×844 均无页面横溢；Cash/KNIGHT 切换卸载旧表单；筛选／详情／清除可键盘操作；Enter 武装、Escape 取消，危险确认 Escape 后焦点回触发按钮；现金 136、8 条流水。 | PASS |
| CH-14 | 总资产 842.89、现金 136、SOL 596.89、KNIGHT 110、3 个正扇区；P&L 不随现金变化；趋势文案正确；热力图只计 8/14 一买与 8/19 一买一卖；无单币价格图。 | PASS |

### 文件、revision 与 hash

| 证据 | 结果 |
| --- | --- |
| 合法 V3 B | `local-first-trading-ledger-backup-v3-20260820-020519Z.json`；5 assets / 3 trades / 4 cash / 4 prices / 0 rules；SHA-256 `968467b460c09bc9ecc729167ce499c6f74cb52b987a13b78ca2286bc6e23866` |
| import target | 导入后 current/previous 相邻；SHA-256 `2de55c1ff05d393af026ee6c43d63dc7e0575543625ef13af2ba23b4aa23df21` |
| invalid-cash / V2 空目标 | 拒绝前后均为 SHA-256 `a09cfd85992e4feed2c4ba32c95ebc27d8f54792020c3066653fb2e2cecafcad`，previous null |
| primary | CH-12 两次保存后 SHA-256 `b5feac4c022a44389311dad4d29ea3fcf42a1d0019793b3ee9ae726479d4dc38`；锁定复读现金 139；恢复副本操作后仍不变 |
| CH-13 最终目标 | SHA-256 `45766632af33f32570b7c857bb619560cf30b6d0b09f6ea5afd236788de75ff7`；current `0d3fbadf...`、previous `855be023...`，严格相邻；复读现金 136 / 8 facts |

### Console 与 Network

- CH-01～CH-05 本地／离线阶段 Binance 0。
- CH-06 每个明确动作只有预期 exchangeInfo → ticker，等待后无第二轮。
- CH-07 KNIGHT 只有一次 exchangeInfo，无 ticker、retry 或后台请求。
- CH-10 只有一次 KNIGHT exchangeInfo、一次 SOL exchangeInfo、一次 SOL ticker；KNIGHT 的两条 DevTools error 是同一次 unreadable CORS 响应的预期浏览器表现，已单独归因。
- CH-11～CH-14 清空事件缓冲后无意外请求。CH-14 最终再观察 10 秒：Network 0，Console/Log 0。
- Chrome 只曾给出密码表单缺少 username 的 verbose recommendation；它不是 application warning/error，也没有影响功能或安全结论。

完整逐步证据保存在本次隔离临时目录的 `logs/chrome-evidence.md`；它不进入源码提交，不作为独立 01R1C 可复用证据。

## 七、Git 冻结

### 本地英文提交

1. `bab544f2506c417969bfae6122e0f712e06a4b73 fix: close sessions after blocked import recovery`
2. `789ebd57e91700a3233d9a8e9814887403f6121d docs: record Week 14 R1 candidate status`

### 最终身份

- branch：`zhennn/w14-v3-cash-assets-market-data`
- HEAD：`789ebd57e91700a3233d9a8e9814887403f6121d`
- tree：`3eb0a0160cbd20745ffa3cdc1e7b0a4b1e93163c`
- `main...HEAD`：`0 behind / 18 ahead`
- `main...HEAD` 完整 binary diff SHA-256：`d6f36e27382ce03ab3f62b218607fb8ebd3dc227c69ee00d2174471121f2be74`
- `c17a997...HEAD` 本 R1 完整 binary diff SHA-256：`fb37de127451ac4dd49c2d7e1592fd2866292d21f58c7c8ec5fda70f354482e0`
- upstream：无
- source worktree：clean

## 八、边界与下一步

- 未执行 `01R1C`，未生成 `01R1D`。
- 原 `01D = FAIL` 与 `W14-01D-P0-01` 历史证据完整保留；本报告不覆盖它。
- 未 merge、push、upstream、PR、tag、rebase、cherry-pick、squash 或 amend。
- 未读取、导入、复制或改写真实 B/C；未开始自然语言转换；未回写 00B 或独立验收记录。
- 下一步唯一入口：把冻结候选、原 01D、01R1A、01R1B 和冻结的 01R1C 交给一个全新的独立执行者；只有它生成新的 `01R1D = PASS`，才可另行讨论后续收口。
