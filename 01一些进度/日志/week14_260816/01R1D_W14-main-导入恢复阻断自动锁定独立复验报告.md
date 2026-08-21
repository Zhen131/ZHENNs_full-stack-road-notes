# Week 14 main 导入恢复阻断自动锁定独立复验报告

日期：2026-08-20

状态：`FAIL`

对象：`zhennn/w14-v3-cash-assets-market-data@789ebd57e91700a3233d9a8e9814887403f6121d`

## 一、结论

最终判定：`FAIL`。

原 `BLOCKED` 已解除：本次能够控制全新隔离的真实 Google Chrome 和 macOS 原生保存／打开选择器，并取得新的虚构 B/C、revision、SHA-256、Console 与 Network 证据。冻结候选、R1 状态机审查、规定自动测试和全部质量门均通过；真实 Chrome 的 CH-01～CH-12 功能观测也符合对应产品预期。但本轮文件名没有使用强制的 `W14-R1-REVIEW-FAKE` 标记，CH-12 还废弃过一次遗漏原生写权限确认的未完成尝试，因此这些结果只能作为功能证据，不能写成一条合格的正式 `PASS` 链。

但 CH-13 在真实 Chrome 中发现一项可重复 P1：设置页“清空账本”确认区没有锁定键盘焦点。确认区打开后焦点未进入确认控件；从输入框依次 Tab 到“确认清空账本内容”与“取消”后，再按 Tab 会直接逃到 Chrome 地址栏。`Escape` 关闭并返回触发按钮正常，但不能抵消缺失的焦点锁。该行为违反原 01B 第 6.5 节、`UI-10` 与 CH-13 的明确通过线。因此必须在首个强制失败处停止，CH-14 未执行，不能签发 `PASS`。

自动测试全绿只说明现有测试没有覆盖这条真实浏览器焦点反证；不能替代独立安全合同。

## 二、冻结身份与只读边界

| 项目 | 实际结果 |
| --- | --- |
| 根文档仓库起点 | `main@418e24eec7c911f28baff6afb2f24698a4966fa4`；tree `f1a83bfa2dcbc623352b0e687a1d8ef7db9b77d9`；`origin/main...HEAD = 0 behind / 12 ahead` |
| 源码候选 | `zhennn/w14-v3-cash-assets-market-data@789ebd57e91700a3233d9a8e9814887403f6121d`；tree `3eb0a0160cbd20745ffa3cdc1e7b0a4b1e93163c`；`main...HEAD = 0 behind / 18 ahead`；无 upstream |
| `main...HEAD` binary diff SHA-256 | `d6f36e27382ce03ab3f62b218607fb8ebd3dc227c69ee00d2174471121f2be74` |
| `c17a997...HEAD` R1 diff SHA-256 | `fb37de127451ac4dd49c2d7e1592fd2866292d21f58c7c8ec5fda70f354482e0` |
| R1 差异 | README、Hook／Dashboard／Gate 的 3 个生产文件和 3 个正式测试文件；未改 schema、文件合同、依赖、lockfile、fixture、NLP 或 CS2026 |
| 本次仓库写入 | 只更新同一个 `01R1D`；源码、测试、fixture、配置、README、Git index、00B、00D、当前状态与其他现有文档均未改 |
| 禁止项 | 未 merge、push、upstream、rebase、cherry-pick、squash、amend、reset、PR、tag、删分支或处理真实 B／C |

原 01D `FAIL` 保持不变；本文件是新的独立结论，不覆写历史报告。

## 三、原 P0 状态机与 R1-I01～R1-I15

冻结实现仍形成可核对的关闭链：真实 `IMPORT_RECOVERY_BLOCKED` → Hook 同步停止新操作并发布一次带 session 身份的 fatal signal → Dashboard 卸载明文与可编辑工作区 → Gate 校验当前 session 后 quiesce／drain → public Repository façade 同步 revoke → runtime Repository 置空／revoked → lease release → 清除 remembered connection → 原生重选文件、重新输入密码并完整认证后才建立新 session。

| ID | 独立证据与本次判定 |
| --- | --- |
| R1-I01 | `usePersistentLedger` 与真实 Repository 回归证明 recovery-blocked 后 apply／save／clear／retry／import 同步停止；`PASS` |
| R1-I02 | Hook 只为当前 session 发布一次结构化 fatal signal，重复错误与重渲染不重复 handoff；`PASS` |
| R1-I03 | generation、abort 与 pending 清理阻止迟到 import／save／hydrate／retry 发布候选；`PASS` |
| R1-I04 | old ledger 与 B 保持，C 在 fatal 后不再写，mutation／persisted 不前进且无 saved／success；`PASS` |
| R1-I05 | `DashboardShell` fatal 回归证明明文汇总、表单、draft 与导入面板立即卸载；`PASS` |
| R1-I06 | `LedgerAccessGate` 只接受当前 active session signal，旧／伪造 signal 不关闭新 session；`PASS` |
| R1-I07 | beginQuiesce → drain → lockAfterQuiesce 各一次且顺序固定，drain 等待已接受工作；`PASS` |
| R1-I08 | beginQuiesce 后公开 Repository façade 同步拒绝，完成 token 后 runtime Repository 为 null／revoked；`PASS` |
| R1-I09 | release 成功后清除 remembered connection，只进入 fatal-closed；`PASS` |
| R1-I10 | release 首次失败仍无 Dashboard 且 Repository 已 revoke；重试只继续同一关闭链；`PASS` |
| R1-I11 | re-entry 永远经过原生选择、密码、fileId／认证／current／previous／schema／revision 验证；`PASS` |
| R1-I12 | 既有 Repository 故障注入稳定返回 `IMPORT_RECOVERY_BLOCKED`，后续 load／save 永久拒绝；`PASS` |
| R1-I13 | 正常 lock、route leave、create/open/save、双代、previous recovery、普通 B 导入与补偿路径的正式回归通过；Chrome CH-01～CH-12 也未发现该 R1 修复造成的退化；`PASS` |
| R1-I14 | 原 C-10 与 P0 等级未降低，没有用手动锁定、只读页或普通 warning 替代自动关闭；`PASS` |
| R1-I15 | 审查前后源码 branch、HEAD、tree、完整 diff hash、index 与工作树一致；`PASS` |

R1-I01～R1-I15 本身没有出现反证；本报告的强制失败来自原 01B 正常产品合同中的 CH-13 P1。

## 四、自动测试与质量门

| 门 | 实际命令／枚举 | 结果 |
| --- | --- | --- |
| R1 直接 | `npx vitest run src/app/usePersistentLedger.fileImport.test.tsx src/app/DashboardShell.fatal.test.tsx src/app/LedgerAccessGate.test.tsx` | exit 0；3 files / 49 tests；0 skip |
| session lifecycle | Hook、Dashboard、Gate、workspace session、file handle／controller／coordinator／repository 共 11 个正式文件 | exit 0；11 files / 303 tests；0 skip |
| 额外相关组合 | 独立扩大到另一组 11 个相关文件 | exit 0；11 files / 334 tests；0 skip；只作补充 |
| Week 14 定向闭集 | `git diff --name-only main...HEAD -- '*test.ts' '*test.tsx' \| xargs npx vitest run` | exit 0；57 files / 729 tests；0 skip |
| 全量 | `npm test` | exit 0；85 files / 914 tests；0 skip |
| TypeScript | `npm run typecheck` | exit 0 |
| ESLint | `npm run lint` | exit 0；0 warning / 0 error |
| Production | `npm run build` | exit 0；Next 15.5.22 production build 成功 |
| 当前／完整差异 | `git diff --check`；`git diff --check main...HEAD` | 均 exit 0 |
| 残留与边界扫描 | `.only`／`.skip`、debugger、console、schema／B／C 版本、生产 fetch／Binance、retry／poll、敏感文件、依赖、NLP、CS2026、二进制与 R1 越界 | 未发现阻断项 |

现有 `SettingsWorkspace.test.tsx` 只断言 Escape 会关闭确认区且不调用 clear，没有断言打开后焦点进入、Tab／Shift+Tab 焦点锁或关闭后焦点返回；因此全绿结果没有覆盖本次 P1。

## 五、真实 Chrome 环境

| 项目 | 本次新鲜证据 |
| --- | --- |
| Chrome | Google Chrome `151.0.7922.140` |
| production | `npm run start -- --port 3443`；全链固定 origin `http://127.0.0.1:3443/` |
| 隔离 Profile | `/private/tmp/w14-r1-final.8PVUn6/profile`；独立 `--user-data-dir` 与 `--remote-debugging-port=9347` |
| 虚构目录 | `/private/tmp/w14-r1-final.8PVUn6/files`；没有读取或操作任何真实／未知 B/C |
| 原生 picker | 新建 C、选择 C、导入 B、选择拒绝目标和恢复复制件均通过真实 macOS 保存／打开选择器；没有 DOM 文件路径注入 |
| Console／Network | 明确联网只发生在 SOL／KNIGHT 操作；KNIGHT 的 CORS／`BINANCE_VALIDATION_UNAVAILABLE` 为预期；CH-11、CH-12、CH-13 无 Binance 请求；最后一次 CH-13 复测无 request、console、exception，只有 Chrome 对密码表单缺少 username 的 verbose recommendation |
| 执行偏差 | 临时文件名使用 `w14-v3-fictional-*`，虽全部虚构，但没有按 01R1C 的精确 `W14-R1-REVIEW-FAKE` 标记；此外 CH-12 首次写入时遗漏处理 Chrome 原生写权限提示，已废弃该未完成尝试并完整记录。即使没有产品 P1，这两点也使本链不能签发 `PASS` |

## 六、CH-01～CH-14 结果

| CH | 实际结果 | 判定 |
| --- | --- | --- |
| CH-01 | 原生新建 V3 C；初始 current revision `248ad3cb-e260-4a97-adb9-a543b5b73ec2`，SHA-256 `a28f765ece4db64b07142bc3d67e386aa49871e34451982aa83f03edc9df1cdd`；BTC／ETH／ADA 初始资源正确 | 功能符合；证据链命名不合格 |
| CH-02 | 入金 1000、出金 100、外部支出 50、余额校准到 800；before／target／adjustment 与现金重放一致 | 功能符合；不构成正式链 `PASS` |
| CH-03 | SOL 买入 10×90、fee 5；负现金预览 -105，取消零写，确认后一笔交易且现金 -105 | 功能符合；不构成正式链 `PASS` |
| CH-04 | SOL 卖出 2×100、fee 2；统一流水详情完整；外部支出两阶段删除并等待安全倒计时后，现金重放为 143 | 功能符合；不构成正式链 `PASS` |
| CH-05 | 完全离线新增 KNIGHT、买入 10×1、保存跨日手动价 7／9；锁定重开后现金 133、KNIGHT 估值 90，Network 0 | 功能符合；不构成正式链 `PASS` |
| CH-06 | SOL 与原始 `SOLUSDT` 均得到同一映射；每次显式操作只有 exchangeInfo → ticker，未出现后台第二轮 | 功能符合；不构成正式链 `PASS` |
| CH-07 | KNIGHT 仅一次 exchangeInfo，返回 `BINANCE_VALIDATION_UNAVAILABLE`；无 ticker／retry；离线入金、手动价 11 与锁定重开均保留 | 功能符合；不构成正式链 `PASS` |
| CH-08 | 导出合法虚构 V3 B：`local-first-trading-ledger-backup-v3-20260820-091731Z.json`，SHA-256 `829778a7b82f7b3dda83b543eeedf513c8b1ab65b77c4c522a902cd8e87948d7`；5 assets / 3 trades / 4 cash / 4 prices | 功能符合；不构成正式链 `PASS` |
| CH-09 | 空 import-target 原生导入合法 B；预检 hard error 0，导入期间 Network 0；post-import SHA-256 `67c8fb4bd062f07a6c75b26fb9b25c54599c7c023366c1aac026e78663873051`，current `2e87c0ee-27e3-454e-bb00-1c074f7de413` 与 previous 相邻 | 功能符合；不构成正式链 `PASS` |
| CH-10 | 主动联网配对：SOL mapping／price 独立保存，KNIGHT 失败保持 null；网络只有 KNIGHT exchangeInfo、SOL exchangeInfo、SOL ticker，导入事实未回滚 | 功能符合；不构成正式链 `PASS` |
| CH-11 | invalid-cash 精确返回 `LEDGER_DATA_INVALID_ENTITY · cashEvents[0].amount`；V2 精确返回 `BACKUP_UNSUPPORTED_FORMAT_VERSION`；两目标 SHA-256 均保持 `9779c341007040bd6598585e2ae91da0f8dd20e6966f407c666663878e172014`、current `701fa070-4d70-4a19-952f-5156a7803ce6`、previous null，Network 0 | 功能符合；不构成正式链 `PASS` |
| CH-12 | 干净两次认证保存后 primary current `0a26ecb9-a6fb-4b46-be4a-f8654cf84e3d`、previous `621ba518-31b3-4384-b35f-35d9e7b3016d` 相邻，primary SHA-256 `a38a40a94f8a8e2e097ad8bf8ba44981f8c6aac96559cd63f2cf5a361c9ced8f`；只改 current 密文首字符的复制件保持 previous SHA-256 `c1fc511262e40e784a144b6f2b326f370ce3391c2e291aae0147d17e517920ef`，恢复后 current `b7fafd71-c3b6-44ef-9d09-5c8b80371d7a` 指向同一 previous，现金 139，原 primary SHA 不变 | 功能符合；另有一次已废弃执行偏差 |
| CH-13 | 现金／KNIGHT 切换能清除过期确认；SOL+买入筛选为 1 笔；详情可用 Enter 展开；交易删除可用 Enter 进入确认并由 Escape 取消、焦点返回。设置页清空确认区可由真实 Chrome 重复触发焦点外逃，见第七节 | `FAIL` |
| CH-14 | 按合同在首个强制失败处停止，没有继续用汇总页结果抵消 CH-13 | `未执行` |

## 七、Finding：W14-R1D-P1-01

等级：`P1`

标题：设置页清空确认区没有锁定键盘焦点

复现：

1. 在真实 Chrome 解锁虚构 `.lftl`，进入“设置”→“危险操作”；
2. 通过 Chrome 辅助功能树直接点击“打开清空账本操作”；
3. 确认区出现后，辅助功能树报告焦点仍在页面 HTML content，没有进入“输入清空确认文本”；
4. 按一次 Tab 进入确认输入框，再依次 Tab 到“确认清空账本内容”和“取消”；
5. 再按一次 Tab，Chrome 选中地址栏 `127.0.0.1:3443`，焦点已离开确认区；
6. Escape 关闭时能返回“打开清空账本操作”，该部分正常。

期望：打开确认区后焦点进入确认控件；Tab／Shift+Tab 在输入框、确认和取消之间循环；Escape 关闭且焦点返回触发按钮。

实际：确认区未获得初始焦点，也没有焦点锁；键盘焦点可逃到浏览器地址栏。`SettingsWorkspace.tsx` 只实现 Escape 关闭后的 `requestAnimationFrame(...focus())`，没有打开后的焦点进入或 Tab／Shift+Tab trap；现有测试也没有相应断言。

影响：纯键盘用户在破坏性操作确认过程中可失去确认上下文，违反 01B 第 6.5 节、`UI-10` 与 CH-13 的 P1 可访问性合同。

最小建议：在 `src/app/SettingsWorkspace.tsx` 为确认 region 建立 ref；展开后聚焦确认输入；拦截 Tab／Shift+Tab 并在输入、确认、取消间循环；保留 Escape 关闭与触发按钮返回；在 `SettingsWorkspace.test.tsx` 和至少一条真实交互回归中固定初始焦点、正反向循环、Escape 和返回焦点。任何 source／test 变化后，原有绿灯全部失效，必须重新跑全部自动门，并由新的全新独立 Chrome 从 CH-01 开始完整取证。

## 八、收尾边界

- 本文件是唯一仓库写入；不更新源码 README、`00-当前开发状态.md`、其他 Week 14 文档、00B 或 00D；
- 不创建源码提交或根文档提交；
- 不 merge／push，不进入 R2，不处理真实 V3 B；
- 候选保持冻结在 `789ebd57e91700a3233d9a8e9814887403f6121d`；
- 下一步应在新的开发任务中修复 `W14-R1D-P1-01` 并补永久回归；修复后所有自动门和完整 CH-01～CH-14 必须从头重跑。
