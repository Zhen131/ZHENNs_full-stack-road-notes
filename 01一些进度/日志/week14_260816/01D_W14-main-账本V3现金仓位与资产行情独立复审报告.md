# 01D_W14-main｜账本 V3 现金仓位与资产行情独立复审报告

- 复审日期：2026-08-20
- 复审角色：独立执行者
- 最终结论：`FAIL`
- 源码候选：`zhennn/w14-v3-cash-assets-market-data@578f4a5af6551b321eb6677c555dd459fa2b168e`
- 源码基线：`main@0d0cb555e5d2fac1660ac51e7b577bcb9710582d`

## 一、最终结论

本次独立复审结论为 `FAIL`。

冻结候选身份正确，源码工作区始终 clean；本批 56 个定向测试文件／726 项测试、全量 84 个测试文件／911 项测试，以及 typecheck、lint、production build、两类 diff-check、schema/version 残留、联网边界和敏感／调试残留检查均通过。

但重点只读审查确认了一个 `P0` 文件安全合同缺口：V3 B 导入发生 `IMPORT_RECOVERY_BLOCKED`，即写入后的磁盘结果无法确认、补偿和最终复读也无法证明旧文件已经恢复时，当前实现只让持久化 Hook 停止接收操作、把 Dashboard 切为只读并提示用户“请立即锁定”；它没有按 01B 第 7.3 节与自动测试矩阵 `C-10` 的硬要求自动锁定／断开会话，也没有通过会话撤销释放持有 `CryptoKey` 的 Repository 引用。

因此，产品在最严重的导入恢复失败路径中仍保持解锁会话与已解密页面，必须依赖用户再手动点击锁定。Repository 自身虽然已经拒绝后续 load/save，避免继续盲写，但这不能替代合同要求的自动会话撤销与密钥清理。该缺口属于文件安全 `P0`，已经足以稳定判定 `FAIL`。

发现确定性 P0 后没有启动真实 Chrome CH-01～CH-14。Chrome 正常链的局部或完整成功都不能抵消这个 fail-closed 缺口；继续执行只会增加一条无法改变最终结论的证据链。本报告不复用 01C 的 Chrome 结论，也不把 01C 的开发侧 `PASS` 当作独立证据。

## 二、独立复审对象

| 项目 | 实时结果 | 结论 |
| --- | --- | --- |
| 源码路径 | `01一些进度/产出/LocalFirstTradingLedger/` | 正确 |
| 功能分支 | `zhennn/w14-v3-cash-assets-market-data` | 正确 |
| 冻结 HEAD | `578f4a5af6551b321eb6677c555dd459fa2b168e` | 与预期完全一致 |
| 源码 `main` | `0d0cb555e5d2fac1660ac51e7b577bcb9710582d` | 与预期完全一致 |
| `main...HEAD` | `0 behind / 15 ahead` | 与预期完全一致 |
| 功能分支 upstream | 无 | 与预期一致 |
| 源码工作区 | clean，无 staged、unstaged、untracked | 可复审 |

复审对象在自动化、扫描和只读审查期间没有发生分支、HEAD 或工作区漂移。

## 三、开始前 Git 现场

### 3.1 根文档仓库

| 项目 | 开始前实时结果 |
| --- | --- |
| 路径 | 工作区根目录 |
| 分支 | `main` |
| HEAD | `1c9eedff22ebb7b2f31f4df21970e5a3036ecb72` |
| 预期起始 HEAD | `1c9eedf`，一致 |
| 工作区 | clean |
| `origin/main...HEAD` | `0 behind / 9 ahead` |

没有覆盖或吸收用户已有改动；开始前根仓库没有待处理文件。

### 3.2 源码仓库

| 项目 | 开始前实时结果 |
| --- | --- |
| 路径 | `01一些进度/产出/LocalFirstTradingLedger/` |
| 分支 | `zhennn/w14-v3-cash-assets-market-data` |
| HEAD | `578f4a5af6551b321eb6677c555dd459fa2b168e` |
| `main` | `0d0cb555e5d2fac1660ac51e7b577bcb9710582d` |
| `main...HEAD` | `0 behind / 15 ahead` |
| upstream | 无 |
| 工作区 | clean |

没有切换分支、fetch、pull、清理、reset、修改或提交。

## 四、复审范围与排除项

本次实际完成：

- 按顺序读取 AGENTS、ledger-workflow、当前开发状态、01A、01B、01C；
- 独立核对两个 Git 仓库现场；
- 独立运行 01B 规定的本批定向测试、全量测试和全部质量门；
- 独立执行 schema/version、联网、敏感数据和调试残留扫描；
- 对 `main...HEAD` 的 V3 核心、现金、资产、行情、B/C、安全恢复和跨页投影做重点只读审查；
- 发现并确认 `C-10` 的应用层 fail-closed 缺口；
- 只新建本 01D 报告。

明确没有读取或进入：

- `000-自然语言整理.md`；
- 真实投资归档或个人真实 B/C；
- `02_NLP/`；
- `LocalFirstTradingLedger-CS2026/`；
- 私人网络说明；
- 外部参考项目；
- 01C 使用过的虚构文件或 Chrome 状态。

## 五、自动化与质量门

以下均为冻结 HEAD 上本次独立运行的新鲜结果。

| 门 | 命令／检查 | 退出码 | 独立结果 | 判定 |
| --- | --- | ---: | --- | --- |
| 本批定向测试 | 从 `main...HEAD` 枚举全部新增／修改的 `*.test.ts(x)` 后执行 `npx vitest run` | 0 | 56 files / 726 tests passed | `PASS` |
| 全量测试 | `npm test` | 0 | 84 files / 911 tests passed | `PASS` |
| 类型检查 | `npm run typecheck` | 0 | 零 TypeScript 错误 | `PASS` |
| 静态规则 | `npm run lint` | 0 | 零 warning、零 error | `PASS` |
| 生产构建 | `npm run build` | 0 | Next.js 15.5.22；5 个静态页面；`/` 338 kB，First Load JS 440 kB | `PASS` |
| 工作树差异卫生 | `git diff --check` | 0 | 无空白错误 | `PASS` |
| 候选差异卫生 | `git diff --check main...HEAD` | 0 | 无空白错误 | `PASS` |
| 候选身份复核 | branch、HEAD、main、status、ahead/behind、upstream | 0 | 身份未漂移；源码继续 clean | `PASS` |
| schema/version 残留 | 定点扫描 schema 2、BackupEnvelopeV2、fallback mapping、mount refresh | 0 | 命中仅位于三处明确测试／旧格式拒绝场景；生产 V3、B 与 C generation 无残留 | `PASS` |
| 联网边界 | 枚举生产域名、fetch 实现、validate／ticker 调用点与异步触发入口 | 0 | 唯一生产域名为 `https://data-api.binance.vision`；未发现代理、WebSocket、EventSource、全量列表、后台轮询或 mount 自动刷新 | `PASS` |
| 敏感／调试残留 | 扫描 `console.log/debug`、`debugger`、`.only/.skip`、私钥、API key、敏感扩展名及 diff 文件名 | 无命中 | 无真实 B/C、密钥、环境文件、调试断点或跳过测试进入 diff | `PASS` |

第一条定向命令最初使用了本机 `rg` 不支持的 NUL 匹配写法，输出“pattern contains `\0`”且没有启动测试；该空运行不计入证据。纠正为换行清单转 NUL 后，从头取得 56／726 的有效结果。

自动化全绿只能证明自动测试覆盖到的行为，不会把本节后续确认的 `P0` 变成通过。

## 六、关键合同只读审查

| 合同路径 | 只读结果 | 结论 |
| --- | --- | --- |
| V3 schema 与全局事实校验 | `LedgerData.schemaVersion = 3`；CashEvent 联合类型、exact keys、全局 ID 唯一、引用、Decimal 与资源上限均进入完整 validator | `PASS` |
| USDT 现金重放 | Trade 与 CashEvent 使用稳定排序和 decimal.js 增量；买入／卖出与 USDT／非 USDT 手续费口径分离，不生成镜像 CashEvent | `PASS` |
| 负现金二次确认 | 现金新增／删除、交易新增、统一流水删除均绑定 ledger epoch、mutationVersion、persistedVersion，并在确认时重算 | `PASS` |
| 本地资产与 mapping 解耦 | 离线标准化、本地新增、完整依赖扫描、mapping 删除与资产删除分离；USDT 保留字不进入 assets | `PASS` |
| 手动价格 | 手动 PriceSnapshot 走本地 service、未来日期拒绝；as-of 选择和趋势按日期消费，不依赖 mapping | `PASS` |
| BackupEnvelope V3 | 五字段 V3 外层、canonical LedgerData、资源与 import policy、V2 版本阶段短路拒绝均存在 | `PASS` |
| V2 C 拒绝 | C 外层仍为 v2／crypto v1；generation schema 2 在文件结构检查阶段拒绝，发生在密码/KDF/decrypt 前 | `PASS` |
| B 预检与零网络 | raw bytes／JSON／版本／结构／资源／业务／candidate identity／确认收据分层存在；普通 V3 rawText 可选，历史模式单独强制；预检本身无 fetch | `PASS` |
| B 原子替换 | 空 C 授权、磁盘复核、加密候选、write/close/readback、exact bytes、decrypt/validate/identity、补偿路径与 verified 后一次发布均存在 | `PASS`（正常链） |
| C current/previous、revision 与恢复 | current/previous 相邻、独立 IV、AAD、revision、readback 与 previous 恢复外壳保留 | `PASS` |
| C 补偿失败 fail-closed | Repository 会阻止后续读写；应用层只设只读并提示用户手动锁定，没有自动撤销会话和释放密钥持有者 | `FAIL`，`P0` |
| `BINANCE_VALIDATION_UNAVAILABLE` | validation fetch 无可读响应时使用独立错误码；ticker 网络错误保持普通 network；无额外探测或重试 | `PASS` |
| P&L、趋势、分配、热力图 | 统一 projection 加 signed cash；负现金不画伪正扇区；趋势按日重放；P&L 与热力图仍只读 Trade | `PASS` |

## 七、阻断发现：W14-01D-P0-01

### 7.1 发现步骤

在自动化全绿后，按 01B 第 7.3 节第 7 步和测试矩阵 `C-10` 追踪 `LedgerFileRepository.importReadyLedger()` 的补偿失败路径，再向上检查 `usePersistentLedger`、`BackupControls`、`DashboardShell` 和 `LedgerAccessGate` 的会话生命周期。

现有正式测试 `ledgerFileRepository.test.ts` 中的场景 “marks the session recovery-blocked when neither compensation nor final read can prove the old bytes” 会机械制造：

1. candidate 已写入；
2. close 后第一次 readback 失败；
3. 补偿 write 失败；
4. 最终 read 也无法证明旧字节；
5. Repository 返回 `IMPORT_RECOVERY_BLOCKED`，后续 load/save 均拒绝。

该正式测试包含在本次 56／726 与 84／911 的通过集合中，因此 P0 触发条件和 Repository 禁写行为是可重复、确定的，不依赖真实数据或 Chrome 偶发现象。

### 7.2 预期

01B 明确要求：补偿 write、close 或 readback 任一步失败时，必须 fail closed，自动锁定／断开会话、清密钥和 pending mutation，并且不得继续显示已连接可编辑状态。

### 7.3 实际

`src/app/usePersistentLedger.ts:1490` 附近处理 `IMPORT_RECOVERY_BLOCKED` 时只执行：

- `acceptingOperationsRef.current = false`；
- `readOnlyRef.current = true`；
- `setIsReadOnly(true)`；
- 显示“当前会话已停止全部写入，请立即锁定”的错误；
- 返回 `LEDGER_IMPORT_RECOVERY_BLOCKED`。

`src/features/backup/BackupControls.tsx:972` 附近同样只显示“请立即锁定”。该失败分支没有调用 `session.beginQuiesce(...)`、`lockAfterQuiesce(...)`、`releaseAfterQuiesce(...)`，也没有把错误上抛给 `LedgerAccessGate` 触发自动 session lifecycle。

真正撤销会话的逻辑只存在于用户主动锁定路径：`DashboardShell` 调用 `onFinalLock`，随后 `finishSessionQuiesce()` 才会把 session runtime 的 Repository 设为 `null` 并进入 revoked/released。P0 分支没有进入这条路径。

所以实际状态是：

- 底层 Repository 已禁止继续读写，避免进一步覆盖磁盘；
- Dashboard 仍处于解锁且已挂载状态，可继续显示内存中的明文账本；
- 当前 session runtime 尚未 revoked/released；
- 持有 `LedgerFileCrypto` 与 `CryptoKey` 的 Repository 仍由活动会话／Hook 引用；
- 是否完成锁定与释放依赖用户看到错误后再主动操作。

### 7.4 影响范围

- 影响路径：V3 B 导入写入已经开始，随后 readback 与补偿证明链同时失败的严重恢复场景。
- 影响模块：`usePersistentLedger`、`BackupControls`、`DashboardShell`、`LedgerAccessGate` 与 session lifecycle 接口。
- 数据安全：Repository 禁写避免了继续盲写，但磁盘结果仍未知；自动断开和密钥清理没有完成。
- 保密边界：已解密账本和加密密钥持有对象不会在 P0 发生后自动退出当前会话，违反 01B 的明确安全门。
- 真实数据：本次复审没有读取、写入或处理真实数据；上述影响是对生产失败路径的源码合同判断。

### 7.5 为什么判定 `FAIL`

这不是浏览器、权限、网络或工具不足造成的证据缺失，也不是只有文案差异。01B 将 `C-10` 明确定义为 `P0`，且要求的 session revoke/lock 动作在实际错误分支中不存在。当前实现的“只读并提示手动锁定”弱于冻结合同，因此属于可稳定复现的文件安全产品缺陷。

### 7.6 建议交回开发者的最小修复范围

本次独立复审不修改源码。建议后续开发任务最小处理：

1. 让 `IMPORT_RECOVERY_BLOCKED` 成为会话级 fatal signal，而不只是一项 Hook 错误状态；
2. 自动停止新操作、撤销／清理 pending import 与 UI session state，进入 quiesce；
3. 自动执行 lock/release，使 active session 的 Repository 引用被撤销，Dashboard 退出解锁态；
4. 如果 lease/session release 自身失败，显示关闭态的 lock-error 与可重试释放入口，不重新展示已解密 Dashboard；
5. 新增 Hook + Gate 集成回归，断言 P0 后自动调用 session 生命周期、Dashboard 被卸载、Repository façade 被 revoke，并保留现有 Repository 禁写测试；
6. 修复后重新运行全部自动化、质量门和一条全新的 CH-01～CH-14，不复用本报告结果。

## 八、真实 Chrome 环境与 CH-01～CH-14

### 8.1 环境

| 项目 | 本次独立结果 |
| --- | --- |
| production build | 已独立构建成功 |
| Google Chrome 版本 | 未读取；没有启动验收实例 |
| 启动命令 | 未执行 |
| 专用原点 | 未分配 |
| 隔离 Profile | 未创建 |
| 专用临时目录 | 未创建 |
| 原生 picker | 未打开 |

原因：关键合同只读审查已经确认 `C-10 P0 FAIL`。按照缺陷优先于环境缺证的判定规则，Chrome 成功不能改变最终结论；没有用 01C 的 Chrome、文件、hash 或 revision 填补本次证据。

### 8.2 CH 逐项结果

下表中的 `BLOCKED` 仅表示该浏览器步骤因已确认 P0 而没有启动，不表示最终结论是环境型 `BLOCKED`。最终结论仍由已确认产品缺陷优先判为 `FAIL`。

| 步骤 | 本次实际操作 | 预期 | 实际结果 | 状态 |
| --- | --- | --- | --- | --- |
| CH-01 | 未执行 | 新建 V3 C | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-02 | 未执行 | 四类现金事实 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-03 | 未执行 | 买入、现金扣减、负现金确认 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-04 | 未执行 | 卖出、统一流水、删除重放 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-05 | 未执行 | 离线本地资产与多日手动价 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-06 | 未执行 | SOL mapping 与刷新 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-07 | 未执行 | KNIGHT validation-unavailable | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-08 | 未执行 | 导出合法 V3 B | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-09 | 未执行 | 合法 V3 B 预检与导入 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-10 | 未执行 | 导入后主动联网配对 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-11 | 未执行 | invalid-cash V3 与 V2 B 零写拒绝 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-12 | 未执行 | C 双代、revision 与 previous 恢复 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-13 | 未执行 | 桌面、390px、键盘与危险确认 | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |
| CH-14 | 未执行 | 汇总、图表、Console 与 Network | 被前置 P0 终止，无独立 Chrome 证据 | `BLOCKED` |

## 九、Console、Network、picker 与虚构文件证据

| 证据 | 本次独立结果 |
| --- | --- |
| Console warning/error | 未启动 Chrome，无法计数；不复用 01C 的 0/0 |
| Binance 请求触发点 | 未启动 Chrome；只完成源码调用点与静态联网边界扫描 |
| Network HAR／日志 | 无 |
| macOS 原生 picker | 未打开 |
| 虚构 V3 B/C 文件名 | 未创建 |
| revision/hash | 未生成浏览器文件证据 |
| 密码／密文／个人数据 | 未使用、未读取、未写入 |

## 十、发现项

发现 1 个阻断项：

- `W14-01D-P0-01`：B 导入补偿失败的应用层 fail-closed 只停写并提示手动锁定，没有自动锁定／断开与密钥持有者释放，违反 01B `C-10`。

未发现第二个已经足以独立判定 `FAIL` 的源码问题。其余关键合同路径的重点审查结果见第六节；这不表示未逐行审查的 14,447 行新增差异不存在其他问题。

## 十一、最终 Git 现场

### 11.1 源码仓库

- 路径：`01一些进度/产出/LocalFirstTradingLedger/`
- 分支：`zhennn/w14-v3-cash-assets-market-data`
- HEAD：`578f4a5af6551b321eb6677c555dd459fa2b168e`
- `main`：`0d0cb555e5d2fac1660ac51e7b577bcb9710582d`
- `main...HEAD`：`0 behind / 15 ahead`
- upstream：无
- 工作区：clean
- 源码、测试、fixture、配置：零修改

### 11.2 根文档仓库

- 分支：`main`
- HEAD：`1c9eedff22ebb7b2f31f4df21970e5a3036ecb72`
- `origin/main...HEAD`：`0 behind / 9 ahead`
- 本任务唯一新增持久化文件：本 01D 报告
- 未修改 01A、01B、01C、`00-当前开发状态.md`、README、00B 或其他 Week 14 日志
- 未 staged、未 commit、未 push

## 十二、结论允许的下一步

本候选不能进行成果固定、合入源码 `main`、真实 V3 B 生成或第一次真实 B 导入。

下一步应把 `W14-01D-P0-01` 交回功能分支开发任务，按第 7.6 节的最小范围修复，并新增应用层会话自动锁定回归。任何源码、测试、fixture 或配置变化都会使本次自动化绿灯失效；修复后必须重新运行完整自动门，并由新的独立执行重新完成真实 Chrome CH-01～CH-14，生成新的复审报告。

本任务没有修复代码，没有合并、推送、提交、设置 upstream、创建 PR/tag，也没有处理任何真实数据。
