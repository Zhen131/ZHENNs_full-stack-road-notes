# Week 12 main FEE-001～003 版本 2 与手续费规则独立审查执行文档

日期：2026-08-10
状态：已延期，不再作为第 02 批的即时下一步；保留为未来集中独立复验的历史输入
正式源码：`01一些进度/产出/LocalFirstTradingLedger/`；受 Git 管理的源码、测试、package 文件与 index 全程只读
审查目标：`FEE-001`、`FEE-002`、`FEE-003`、`F02-M01～M30`、`W12-EVID-001` 的当前版本 2 适用范围
历史候选：`zhennn/w12-v2-fee-rules` / `083b9f7`，已 fast-forward 合入源码 `main`
唯一输出：`02D_W12-main-版本2与手续费规则独立审查报告.md`
配套开发输入：[02A_W12-main-版本2与手续费规则执行文档](02A_W12-main-版本2与手续费规则执行文档.md)

> 2026-08-10 流程决定：本文件不在第 02 批后立即执行，也不生成 02D。未来若启动集中独立复验，必须以当时最新 `main` 和多个已完成批次重新冻结范围；不得直接把本文件中的历史候选身份当成当前审查对象。

## 结论：独立审查必须重新证明的用户结果

独立审查不能继承 02B 的 PASS、测试数字、截图或开发者口述。审查者必须在同一个冻结完整候选上重新证明：用户可以创建并重开版本 2 `.lftl`，管理固定 / 百分比手续费规则，在交易保存前看到可修改候选和现金影响，最终只把用户确认的实际 `Trade.fee` 当历史事实；旧版本 1 `.lftl`、旧明文备份和旧 IndexedDB 完整账本被清楚拒绝且零写入；真实保存只有在 write、close、readback、解密、完整 Validator 后才成功。

真实用户流程必须独立完成：

```text
真实 Google Chrome + 系统 picker
→ 新建宿主可见的专用虚构版本 2 .lftl
→ 新增 / 查看 / 版本更新 / 停用固定费和百分比规则
→ 录入可选平台交易，核对无匹配 / 单匹配 / 多匹配
→ 修改候选为实际手续费并确认
→ 保存、锁定、重开，核对规则历史与 Trade 实际 fee
→ 导出版本 2 备份，零写预检并整本恢复
→ 覆盖权限、重连、previous 恢复、双标签、clear、revision 冲突
→ raw IndexedDB 证明活跃路径只有最小 connection record
```

本批 02C 不能沿用第 01 批“无需重做 Week 11 真实浏览器 Gate”的旧边界。它必须在最新版本 2 候选上承担 [00D](00D_W12-已知问题与验收缺口清单.md) 中 `W12-EVID-001` 的适用关闭证据。

## 一、审查开始条件

只有同时满足以下条件才进入实质审查：

1. [02A](02A_W12-main-版本2与手续费规则执行文档.md) 已被完整执行。
2. `02B_W12-main-版本2与手续费规则执行报告.md` 已存在，并给出开发侧唯一结论、候选 branch / HEAD / 完整 working tree、测试范围、真实 Chrome 范围和两个仓库状态。
3. 源码候选可冻结为一个完整对象：branch、HEAD、tracked staged / unstaged、untracked、实际 package 文件、正式测试和 diff 全部可识别。
4. 02B 所述候选与现场是同一完整候选；若开发使用建议分支，默认应为 `zhennn/w12-v2-fee-rules`。如果用户后来授权了不同分支，02B 必须明确记录该授权与身份，02C 不得自行猜测。
5. 根文档仓库与源码仓库均可记录开始快照；目标 02D 不存在重叠用户改动。

以下任一情况直接停止并判 `BLOCKED`，不得自行切换旧 commit、丢弃 untracked、恢复工作树或选择“看起来最完整”的候选：

- 02A 未完整执行或 02B 不存在；
- 候选 branch / HEAD / working tree 不明确；
- 02B 之后存在无法解释的 tracked / untracked 漂移；
- 实际源码不是产品 `LocalFirstTradingLedger/main` 轨道的候选；
- 02D 已有重叠用户修改；
- 无法证明开始与结束审查的是同一完整候选。

## 二、独立审查硬合同

1. 先完整读取 [000](000_W12-规划文件关系与批次命名规则.md)、[00A](00A_W12-网页优先产品共识与架构边界.md)、[00B](00B_W12-总需求快照与待办清单.md)、[00C](00C_W12-main-网页与AI开发批次路线.md)、[00D](00D_W12-已知问题与验收缺口清单.md)、[当前开发状态](../00-当前开发状态.md)、[02A](02A_W12-main-版本2与手续费规则执行文档.md)、实际 02B、[01R1D](01R1D_W12-main-旧账Binance映射静默写回独立复验报告.md)、[Week 11 02D](../week11_260727/02D_W11-C文件安全闭环与正式接管合并独立测试审查报告.md) 和 [源码 README](../../产出/LocalFirstTradingLedger/README.md)。
2. 事实优先级固定为：实时候选源码 / 正式测试 > 当前状态 > 00A > 00B > 00C > 00D > 02A / 02B 陈述。目标合同仍由 00A / 00B / 02A 冻结，候选不能用自己的实现反向降低通过线。
3. 正式源码、正式测试、README、package.json、lockfile、配置文件和 Git index 全程只读。不得修代码、补正式测试、改断言、格式化、删 untracked、更新依赖或写入候选目录。
4. 允许运行候选已经存在的正式测试、typecheck、lint、production build 和真实页面。build 生成的 ignored artifact 必须单独记录，不能把它当候选源码，也不能用它掩盖 tracked / untracked 漂移。
5. 若必须补充对抗探针，只能使用系统临时目录或候选的完整临时副本。探针不得写回正式源码，不得修改正式 package 文件或 lockfile；独立审查写出的测试不能加入正式源码后再自证 PASS。
6. 正式测试缺口本身必须记 Finding。临时探针可以补证据，不能把“候选没有永久回归”伪装成已关闭。
7. 浏览器只使用专门新建的虚构版本 2 `.lftl`、虚构 V2 / V1 备份和受控旧格式 fixture。禁止打开、选择、导入、覆盖、解密或检查真实个人账本与真实交易。
8. 独立审查只允许在根文档仓库新增唯一 02D。不得修改 00B、00D、当前状态、02A、02B、源码、正式测试或 `CS2026`。
9. 不得暂存、提交、push、建分支、切换候选、merge、rebase、cherry-pick、squash、amend、设置 upstream 或删除分支。本文不授权任何 Git 写操作。
10. jsdom、组件测试、内置浏览器、开发服务器静态观察、02B 截图、开发者口述或代码已合入 `main` 不能替代真实 Google Chrome、系统 picker 与宿主文件证据。

## 三、候选冻结与前后只读证明

### 3.1 开始快照

分别记录：

| 范围 | 开始时必须记录 |
| --- | --- |
| 根文档仓库 | 实际路径、branch、HEAD、tree、相对 `origin/main` ahead / behind、status porcelain、staged / unstaged / untracked、02A / 02B / 02C / 02D 状态、diff 文件表与统计 |
| 源码仓库 | 实际路径、branch、HEAD、tree、upstream、相对 `origin/main` ahead / behind、status porcelain、tracked staged / unstaged、untracked、ignored build 边界、完整 diff 文件表与统计 |
| package / 测试 | package.json、lockfile、测试配置和所有正式测试文件 hash；测试文件总数；02B 声称的测试范围 |
| 候选身份 | HEAD tree + tracked diff binary hash + staged diff hash + 每个 untracked 候选文件的路径、字节数和 SHA-256；记录生成方法 |

审查对象是这一个完整 working tree，不是只看 HEAD，也不是只看 02B 所列文件。未提交候选可以审查，但必须能稳定 hash，且审查前后完全一致。

### 3.2 审查中漂移

- 每轮关键自动化与真实 Chrome 矩阵后快速复核 branch、HEAD 和 status。
- 若 tracked、staged 或 untracked 源文件发生非预期变化，立即停止；不能自行还原。没有强制反证但候选身份失真时判 `BLOCKED`。
- 若漂移本身证明生产流程会改写源码、测试或 package 文件，按实际影响记 Finding，并优先考虑 `FAIL`。
- `.next` 等明确 ignored build artifact 可以变化，但 02D 必须列出并与正式候选 hash 分离。

### 3.3 结束快照

在写 02D 前再次记录同一字段，并逐项比较开始 / 结束：

- 根仓库只有预期新增 02D；若此前已有用户改动，保持原样且单独列出。
- 源码 branch、HEAD、tree、tracked diff、staged diff、untracked 路径 / hash 与开始一致。
- package / lockfile / 正式测试 hash 一致。
- 若临时副本或临时探针存在，记录路径、用途、结果和清理状态；不得把临时文件混入正式候选。

## 四、PASS / FAIL / BLOCKED 判定优先级

| 结论 | 强制定义 |
| --- | --- |
| `PASS` | `FEE-001～003`、`F02-M01～M30`、正式测试质量、全部质量门、真实 Chrome 版本 2 矩阵和 `W12-EVID-001` 适用证据全部独立取得；候选前后保持只读；无阻塞 Finding 或关键证据缺口 |
| `FAIL` | 已有强制反证：任一当前批目标 / M 项违反、正式质量门失败、旧格式发生写入 / 迁移、账本事实错误、成功提前发布、数据安全类 Finding、测试通过依赖删测 / skip / 放宽断言，或审查操作发现候选不能兑现合同 |
| `BLOCKED` | 尚无强制反证，但候选无法冻结、发生无法解释漂移、真实 Chrome / picker / 权限 / 双标签 / raw IndexedDB 等关键环境不可取得，或其他外部条件使强制证据缺失 |

判定顺序固定：

1. 已有强制反证时判 `FAIL`，即使另有浏览器阻塞也不能改成 `BLOCKED`。
2. 没有反证，但任一关键环境或证据不可取得时判 `BLOCKED`，不能猜成 PASS。
3. 只有所有强制项都有独立证据且候选前后只读一致时才判 `PASS`。

### Finding 分级

- P0：错误 / 静默改写账本事实；V1 被迁移或覆盖；完整账本 / 密码 / CryptoKey 写入 IndexedDB；错误 fee / P&L 被当真；派生或候选进入账本；外部 revision 被覆盖；候选被审查过程污染。
- P1：数据安全类缺陷；任一 FEE 目标或 `F02-M01～M30` 强制行为反证；规则猜测、多匹配自动选择、历史重算、保存未认证即成功；正式测试被削弱。
- P2：不直接构成当前强制反证，但永久测试、错误分类、可维护性或证据质量存在显著缺口。
- P3：低风险文案、结构或维护问题。

任一 P0、数据安全类 P1、当前批强制项反证或正式质量门失败都阻塞 PASS。普通 P2 / P3 只有在不影响强制通过线且证据完整时才可随 PASS 登记。

## 五、必须独立阅读的当前候选

以下是 2026-08-10 基线的实际路径；执行 02C 时还要按候选 diff 扩展，但不得遍历无关工作区。

### 5.1 模型、Validator、规则与 PNL

- `src/models/types.ts`、`src/models/index.ts`
- `src/state/initialLedgerData.ts`、`src/state/ledgerReducer.ts`
- `src/validators/ledgerDataValidator.ts`、`tradeValidator.ts`、`resourcePolicy.ts`
- `src/policies/ledgerFactPolicy.ts`、`ledgerImportPolicy.ts`
- `src/utils/decimalMath.ts`
- 候选实际新增的 FeeRule service / calculator 文件
- `src/services/tradeService.ts`、`pnlSummaryService.ts`、`chartDataService.ts`
- `src/calculators/positionReplay.ts`、`positionCalculator.ts`

重点：schema 2 exact shape、Rule 判别联合、引用与资源限制、平台可选、候选与实际 fee 分离、规则变化不重算、Decimal 真相和派生不保存。

### 5.2 文件、加密、备份、IndexedDB 与 composition

- `src/encryption/ledgerFileContract.ts`、`ledgerFileCrypto.ts`、`ledgerKeyDerivation.ts`、`passphrasePolicy.ts`
- `src/repositories/ledgerFileRepository.ts`、`ledgerRepository.ts`
- `src/backup/backupEnvelope.ts`、`backupImportPreflight.ts`、`backupContentIdentity.ts`、`backupImportReport.ts`、`backupDownload.ts`
- `src/adapters/ledgerFileHandleAdapter.ts`、`ledgerFileConnectionAdapter.ts`、`indexedDbStorageAdapter.ts`
- `src/composition/ledgerFileAccessController.ts`、`ledgerAccessController.ts`、`ledgerAccessComposition.ts`
- `src/coordination/ledgerFileSessionCoordinator.ts`
- `src/hooks/usePersistentLedger.ts`

重点：V2 外层与 payload、current / previous、fileId / revision、PBKDF2 / AES-GCM、每一保存阶段、V2 备份 / 预检 / 恢复、旧三类整账拒绝、legacy production 不可达、raw IndexedDB 最小记录。

### 5.3 页面与 package

- `src/components/security/LedgerAccessGate.tsx`
- `src/components/backup/BackupControls.tsx`
- `src/components/trades/TradeForm.tsx`
- `src/components/dashboard/DashboardShell.tsx`
- 候选实际新增的规则管理组件
- `package.json`、`package-lock.json`、TypeScript / ESLint / Vitest / Next 配置

重点：规则管理闭环、预览、用户覆盖、只读 / dirty / saving / error、按本次 mutation 的认证复读才成功、无无关依赖或 UI 重构。

### 5.4 正式测试

至少阅读实际存在并受候选影响的：

```text
src/validators/ledgerDataValidator.test.ts
src/validators/tradeValidator.test.ts
src/validators/resourcePolicy.test.ts
src/state/ledgerReducer.test.ts
src/services/tradeService.test.ts
src/calculators/positionReplay.test.ts
src/calculators/positionCalculator.test.ts
src/services/pnlSummaryService.test.ts
src/services/chartDataService.test.ts
src/services/binancePriceRefreshService.test.ts
src/policies/ledgerPolicies.test.ts
src/encryption/ledgerFileContract.test.ts
src/encryption/ledgerFileCrypto.test.ts
src/repositories/ledgerFileRepository.test.ts
src/adapters/ledgerFileHandleAdapter.test.ts
src/adapters/ledgerFileConnectionAdapter.test.ts
src/adapters/indexedDbStorageAdapter.test.ts
src/backup/backupEnvelope.test.ts
src/backup/backupImportPreflight.test.ts
src/composition/ledgerFileAccessController.test.ts
src/composition/ledgerAccessController.test.ts
src/composition/ledgerAccessComposition.test.ts
src/coordination/ledgerFileSessionCoordinator.test.ts
src/hooks/usePersistentLedger.test.tsx
src/hooks/usePersistentLedger.fileCapabilities.test.tsx
src/hooks/usePersistentLedger.fileImport.test.tsx
src/components/security/LedgerAccessGate.test.tsx
src/components/backup/BackupControls.test.tsx
src/components/dashboard/DashboardShell.test.ts
src/components/dashboard/DashboardShell.golden.test.tsx
src/components/dashboard/DashboardShell.interaction.test.tsx
src/components/charts/ChartsOverview.test.tsx
src/components/market-data/MarketDataControls.test.tsx
```

候选新增的正式规则 service / component 测试也必须全部纳入。不能只看 02B 列出的 changed tests。

## 六、FEE-001～003 独立目标核对

### 6.1 FEE-001：版本 2 与旧整账退役

必须在源码、正式测试和真实用户流程三层同时证明：

- `LedgerData.schemaVersion = 2` 是唯一可进入应用状态的版本；V1 / 未知 schema 拒绝且零写。
- `.lftl` 外层 fileFormatVersion 2、generation ledgerSchemaVersion 2；current / previous、fileId、revision、parent、IV 和 crypto metadata 满足 02A。
- 新建、打开、重连、普通保存、previous 恢复、clear、锁定重开全部运行在 V2。
- `BackupEnvelopeV2` 导出、零写预检与整本恢复完整；预检错误没有 candidate / evidence。
- V1 `.lftl`、V1 backup、旧 IndexedDB 完整账本分别有稳定拒绝；没有自动迁移、删除、覆盖、兼容读取或 connection record 污染。
- production composition 和 LedgerAccessGate 不再可达旧完整账本解锁 / 迁移 / 删除 UI。
- 干净 V2 浏览器 profile 的 raw IndexedDB 只有 handle + expectedFileId + connectionFormatVersion；没有完整账本、密码、CryptoKey、revision、feeRules 或候选状态。

### 6.2 FEE-002：确定性 FeeRule

必须证明：

- Trade platform 可选，缺失不自动补；持久化值通过空白与资源校验。
- FeeRule 为 fixed / percentage 判别联合，目标键为 platform + assetSymbol；fixed 当前只允许明确 amount + USDT。
- percentage 候选严格等于不含 fee 的 `Trade.totalValue × rate`，走 Decimal，不使用浮点或未声明舍入。
- 0 个、1 个、多个 active 精确匹配分别走无候选、唯一候选、冲突；没有大小写、别名、包含、最近规则或数组首项猜测。
- 更新规则生成新 ID，并在同一原子 mutation 中停用旧版；旧经济字段不改写；停用不物理删除。
- 用户确认的 `Trade.fee` / `feeCurrency` 是历史会计事实。feeRuleId 只追踪来源，允许引用 inactive 规则。
- 规则新增、更新、停用或冲突变化均不会扫描、修改或重算历史 Trade / P&L。

### 6.3 FEE-003：页面与保存真实性

必须证明：

- 页面可新增、查看、版本更新和停用规则，并显示 active / inactive、版本来源和冲突。
- TradeForm 可选平台；规则候选、公式、来源、成交金额、fee、买入总支出 / 卖出净到账同屏展示。
- 用户可修改候选实际 fee；修改后页面清楚披露，保存 Trade 使用用户值。
- 无匹配、多匹配、无效 Decimal、只读、saving、recovery-blocked 和权限失败时不静默采用规则或写账。
- reducer 接受只表示内存 mutation；页面最终成功严格绑定该 mutation / session / repository / base revision 的 write-close-readback-解密-Validator 结果。
- 锁定、取消、卸载、repository 切换、新 mutation 或旧异步结果不能错误确认当前操作。

## 七、F02-M01～M30 独立审查矩阵

02D 必须逐项记录 `PASS` / `FAIL` / `BLOCKED`、源码证据、正式测试证据和真实页面 / 文件证据。编号、名称和通过线必须与 02A 一致。

| ID | 强制项 | 统一通过线 |
| --- | --- | --- |
| `F02-M01` | LedgerData V2 | schema 2 为唯一可进入状态的版本；根字段准确；派生数据不持久化 |
| `F02-M02` | `.lftl V2` | fileFormatVersion 2、ledgerSchemaVersion 2、metadata 精确；未知 / V1 拒绝 |
| `F02-M03` | current / previous | 相邻 revision、独立 IV、正确 parent、fileId 稳定、双代内容正确 |
| `F02-M04` | 加密合同 | PBKDF2-SHA-256 600k、随机 salt、AES-256-GCM、非导出 session key 不退化 |
| `F02-M05` | 新建 / 打开 / 重连 | 系统 picker、权限、identity、connection record 与 Dashboard 发布顺序正确 |
| `F02-M06` | 普通保存 | 写前复读与 write-close-readback-解密-Validator 全过后才成功 |
| `F02-M07` | previous 恢复 | current 确认损坏 + previous 独立有效；取消零写；确认后新 current 复读 |
| `F02-M08` | clear | ready V2 + 固定确认；新空 current、旧 current 成 previous；失败不成功 |
| `F02-M09` | V2 明文备份 | envelope / schema 都为 2，事实完整，明文风险披露 |
| `F02-M10` | V2 预检 / 整本恢复 | 预检零写、一次性 identity / generation、整本替换、失败恢复 / blocked 真实 |
| `F02-M11` | 旧 `.lftl V1` | 清楚拒绝、文件零写、无解密 / 迁移 / connection record |
| `F02-M12` | 旧备份 V1 | 清楚拒绝、无 candidate / evidence、当前 C 零写 |
| `F02-M13` | 旧 IndexedDB 整账 | production 不解锁、不迁移、不删除；旧 record 原样，不能成为 Dashboard 真相 |
| `F02-M14` | raw IndexedDB | 干净 V2 profile 只有最小 connection record；无完整账本、密码、CryptoKey 或规则副本 |
| `F02-M15` | 资源 / 损坏 / 未知版本 | Validator、ResourcePolicy 与稳定错误覆盖全部入口，全部 fail closed |
| `F02-M16` | Trade 平台 | 可选、持久化精确、无默认猜测，资源与空白验证明确 |
| `F02-M17` | FeeRule 模型 | fixed / percentage 判别联合、asset、platform、USDT、状态与版本引用完整 |
| `F02-M18` | 精确匹配 | 只按平台 + 资产；不做大小写、别名、模糊或“最近规则”匹配 |
| `F02-M19` | 固定费 | 明确 amount + USDT；候选精确等于 amount |
| `F02-M20` | 百分比 | 候选精确等于不含费 totalValue × rate，Decimal 计算，无隐式舍入 |
| `F02-M21` | 无匹配 / 多匹配 | 均不猜测；多匹配不得自动选第一个，页面暴露冲突 |
| `F02-M22` | 规则版本 / 停用 | 更新生成新 ID 并原子停用旧规则；历史经济字段不原地改；规则不物理删 |
| `F02-M23` | 候选与实际 fee | 候选可改；最终 Trade.fee 是用户确认事实；修改状态有清楚披露 |
| `F02-M24` | 历史稳定 | 后续规则变化不重算 Trade；feeRuleId 只追踪来源，inactive 引用继续合法 |
| `F02-M25` | 规则管理页面 | 新增、查看、版本更新、停用、冲突和只读状态全部闭环 |
| `F02-M26` | 交易预览 | 成交金额、fee、买入总支出 / 卖出净到账、规则来源与用户覆盖同屏可核对 |
| `F02-M27` | 成功真实性 | reducer 接受不等于成功；本 mutation 的认证复读完成后才显示成功 |
| `F02-M28` | 失败 / 异步 / 并发 | 权限、旧 Promise、identity / revision、双标签和每一保存阶段失败不污染新状态 |
| `F02-M29` | PNL-001～003 永久回归 | 6505 / 2602 / 2797 / 195 / 3903；零费、多买、部分卖、卖清、缺价、异币 fee 全部不退化 |
| `F02-M30` | R1 mapping 与不保存 | absent / null / explicit Binance mapping 经保存链不被静默改写；P&L、图表、候选 fee 不进账 |

任一 M 项有反证即当前批强制失败；不能把它降为普通 P2 或“未来优化”。

## 八、正式测试运行与质量审查

### 8.1 定向正式测试

按候选实际文件存在情况，至少分组运行：

```bash
npm test -- src/validators/ledgerDataValidator.test.ts src/validators/tradeValidator.test.ts src/validators/resourcePolicy.test.ts src/state/ledgerReducer.test.ts src/services/tradeService.test.ts
npm test -- src/encryption/ledgerFileContract.test.ts src/encryption/ledgerFileCrypto.test.ts src/repositories/ledgerFileRepository.test.ts src/adapters/ledgerFileHandleAdapter.test.ts src/adapters/ledgerFileConnectionAdapter.test.ts
npm test -- src/backup/backupEnvelope.test.ts src/backup/backupImportPreflight.test.ts src/components/backup/BackupControls.test.tsx
npm test -- src/composition/ledgerFileAccessController.test.ts src/composition/ledgerAccessController.test.ts src/composition/ledgerAccessComposition.test.ts src/coordination/ledgerFileSessionCoordinator.test.ts src/components/security/LedgerAccessGate.test.tsx
npm test -- src/hooks/usePersistentLedger.test.tsx src/hooks/usePersistentLedger.fileCapabilities.test.tsx src/hooks/usePersistentLedger.fileImport.test.tsx
npm test -- src/calculators/positionReplay.test.ts src/calculators/positionCalculator.test.ts src/services/pnlSummaryService.test.ts src/services/chartDataService.test.ts src/services/binancePriceRefreshService.test.ts
npm test -- src/components/dashboard/DashboardShell.test.ts src/components/dashboard/DashboardShell.golden.test.tsx src/components/dashboard/DashboardShell.interaction.test.tsx src/components/charts/ChartsOverview.test.tsx src/components/market-data/MarketDataControls.test.tsx
```

把候选新增的 FeeRule service / component 正式测试加入对应组。不存在的路径不能机械执行；必须记录缺失并判断是否意味着永久测试缺口。

### 8.2 完整质量门

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

- 全量测试必须完整运行，不接受 changed tests、watch、缓存摘要或 02B 输出。
- 记录退出码、测试文件数、测试数、skip、warning / error、耗时和失败详情。
- 对根仓库 02D 与所有未跟踪候选文件做等价 whitespace 检查。
- 扫描 `.only`、`.skip`、`debugger`、意外 console、merge conflict、新 TODO / FIXME / XXX / HACK、业务层 `Number` / `parseFloat` / 原生浮点 fee 公式。
- 扫描 production 对 schema 1、file V1、BackupEnvelopeV1、legacy migration、IndexedDbStorageAdapter 的可达性；负面测试 fixture 必须与生产调用分开。
- 测试、typecheck、lint、build、whitespace 或配置 warning 门任一失败，最终判 `FAIL`。

### 8.3 测试真实性

独立审查至少检查：

1. V2 测试是否断言实际序列化字段，而不是只检查类型编译。
2. V1 / 未知版本是否在文件、backup、IndexedDB 三条入口分别验证“清楚拒绝 + 零写 + 原对象不变”。
3. current / previous 是否使用不同内容和失败注入，真正验证 parent / revision / IV / readback。
4. connection record 是否对 raw exact shape 断言，而不是只看 TypeScript 接口。
5. fixed / percentage 是否用精确 Decimal 数值；percentage 的基数是否是 totalValue 而非含 fee 总支出。
6. 0 / 1 / 多匹配是否真的构造，不把重复规则在 fixture 中提前去重。
7. 规则更新是否断言新 ID + 旧 inactive + 旧经济字段不变 + 单次 mutation 原子性。
8. 用户修改候选后是否断言 Trade.fee 为用户值，并证明 rule 改变后历史 P&L 不动。
9. 页面成功测试是否控制 write、close、readback、decrypt / Validator gate，而不是只 mock `applyLedgerAction = applied`。
10. PNL 与 mapping 回归是否仍走真实 replay / save / import 链；没有批量把旧 fixture 改成 V2 后丢失负面证据。

删测、skip、只改预期迎合错误实现、mock 掉真实 matcher / repository 或让临时独立探针替代缺失正式测试，均阻塞 PASS。

## 九、三类旧整账的零写独立证明

### 9.1 `.lftl V1`

- 在临时目录创建独立虚构 V1 文件，记录路径、字节数、SHA-256、fileId、current / previous revision。
- 用真实 Chrome 系统 Open picker 选择；必须在不进入 Dashboard / 不创建 connection record / 不请求数据迁移的情况下显示 V1 不支持。
- 选择前后重新读取 SHA-256 与 mtime；文件字节必须完全一致。
- 错误提示不能混成“密码错误”或“文件损坏”，否则无法证明明确版本拒绝。

### 9.2 `BackupEnvelopeV1`

- 创建独立虚构 V1 明文备份，记录 SHA-256。
- 在已打开的专用 V2 C 选择预检，记录 C 当前 file hash / revision、LedgerData identity 和 raw connection record。
- 预检必须给 unsupported format / schema，hard error > 0，无 candidate、candidateIdentity、evidence 或写入按钮。
- 预检前后 V1 备份、V2 C、页面 LedgerData 和 connection record 全部不变。

### 9.3 旧 IndexedDB 完整账本

- 在独立受控 origin / profile 注入虚构旧 StoredLedgerEnvelopeV2，记录 raw record 的结构与 hash；不得使用个人浏览器数据。
- 启动 production 页面，必须清楚提示旧完整账本已退役，不出现解锁迁移到 C、确认删除或把旧数据挂入 Dashboard 的入口。
- 关闭 / 刷新后 raw old record 保持原样；应用没有新增或复制另一份完整账本。
- 干净 V2 profile 另行证明活跃 connection DB 只有三字段最小 record。旧 fixture profile 中旧 database 可以继续存在，因为合同禁止自动删除；02D 必须把“旧 record 原样保留”和“活跃路径不写完整账本”分开记录。

## 十、真实 Google Chrome 与 `W12-EVID-001` 矩阵

### 10.1 环境与文件边界

- 使用候选 production build、真实 Google Chrome、loopback 地址和系统原生 picker。
- 新建宿主文件名包含 `W12-V2-FEE-REVIEW-FAKE`；路径、字节数、SHA-256、创建 / 清理状态写入 02D。
- 记录 Chrome 版本、macOS、origin、视口、候选 hash、raw IndexedDB database / store / key。
- 所有数据均为虚构；禁止选择任何已有个人 `.lftl`。

### 10.2 版本 2、规则与交易

1. 新建 V2 C：核对外层 `fileFormatVersion = 2`、current `ledgerSchemaVersion = 2`、previous null、解密 LedgerData schema 2、fileId / revision / salt / IV 合同。
2. 新增 `OKX + BTC，fixed 5 USDT`；版本更新为 6 时生成新 ID、旧 inactive；新增 `Binance + BTC，percentage 0.001`；单独停用不删除。
3. 无平台 / 无匹配：无自动候选，手填可保存；OKX + BTC：唯一 fixed 候选；Binance + BTC totalValue 6500：候选 6.5。
4. 构造两个 active OKX + BTC：页面显示冲突，不自动选首项；显式来源选择或手填后才可继续。
5. 修改候选为另一实际 fee，核对预览披露、Trade.fee / feeCurrency / platform / feeRuleId 与重开事实。
6. 在规则更新 / 停用后锁定重开，旧 Trade fee、现金影响、成本与 P&L 不变。
7. 保存阶段用可控 gate 观察：reducer 接受、write、close、readback、decrypt / Validator 完成前均不得显示最终成功；旧 receipt 不确认新 mutation。

### 10.3 PNL 与 R1 永久回归

- 固定买入 0.1 BTC、6500、fee 5；卖出 0.04、2800、fee 3，精确显示 6505、2602、2797、195、3903。
- 覆盖零费、多次买入、部分卖出、全部卖清、缺价、异币 fee；缺价不补 0，异币 fee 不猜算。
- 交易表、持仓表、摘要、饼图、历史成本线和热力图口径一致；派生值不出现在解密 LedgerData、V2 backup 或 connection record。
- 使用独立虚构 fixture 覆盖 absent / explicit null / explicit Binance mapping；保存、备份预检 / 恢复、锁定重开和导出后保持三态精确。

### 10.4 `W12-EVID-001` 适用关闭证据

下列真实用户级场景每项都必须有文件 / raw / 页面证据，不能只引用正式测试：

| 场景 | 独立通过线 |
| --- | --- |
| 系统 picker / 宿主文件 | Save / Open picker 实际出现；V2 `.lftl` 在宿主可见；hash 与页面会话绑定 |
| 权限 / 重连 | granted / prompt / denied、刷新后 handle persistence、正确重连、错误重选、文件移动 / 删除真实 |
| previous 恢复 | current 真实损坏、previous 有效、页面披露、取消零写、确认后新 current 与复读 |
| 双标签同文件 | 两个真实标签页选择同一物理 C 时互斥；释放后显式重试；字节副本不被误锁 |
| revision 冲突 | 外部 / 另一页面产生新 revision 后，旧页面写入被拒绝，不覆盖磁盘新事实 |
| clear | 固定确认；新 current 为 V2 空账、旧 current 成 previous；失败 / retry / 旧异步不冒充成功 |
| raw IndexedDB | 干净 profile 只有最小 connection record；无完整账本、密码、密钥；旧整账 fixture 原样且不可达 |
| 保存 / 锁定 / 重开 | 本 mutation 认证复读后成功；dirty 重试 / 放弃、立即锁定、session / lease 释放真实 |
| V2 backup / restore | 明文 V2 导出、零写预检、整本替换、readback、锁定重开和失败真实性完整 |

以上矩阵是 `W12-EVID-001` 在当前 V2 候选上的适用关闭证据。只完成规则页面、自动测试或普通单标签成功链，不足以关闭。

### 10.5 响应式与 console

- 390×844：页面 `scrollWidth = clientWidth`，规则 / 交易宽表只在局部滚动，预览和确认按钮可操作。
- 1280：规则管理、交易预览、三图、数据管理没有裁切 / 覆盖。
- console 0 error；网络失败不能阻塞本地账本或写入 0 价格。

如果真实 Chrome、系统 picker、宿主文件、权限、双标签或 raw IndexedDB 任一强制环境不可用，且前面没有强制反证，最终判 `BLOCKED`。不得用 02B 截图、自动化浏览器、内置 Chromium 或 jsdom 替代。

## 十一、失败注入与平台上限复核

独立审查必须从正式测试与必要临时探针核对：

- write 前 identity / revision、encrypt 后、write、close、readback、decrypt、Validator / ResourcePolicy 各阶段失败；
- save / clear / restore / rule version mutation 的重复点击、取消、锁定、卸载、session / repository 切换；
- 旧 picker、permission、preflight、fee candidate、rule selection、save receipt 返回；
- fileId、revision、parent、salt / crypto metadata、isSameEntry 与外部 bytes 漂移；
- lease / Web Lock 获取、持有、释放、无响应 holder、显式 retry；
- post-close 无法确认磁盘状态时停止后续写入，不显示成功。

不得因纯浏览器无法在页面 / 进程死亡后继续执行 JavaScript 而把候选判错。候选只需满足已确认的平台合同：正常链完整复读；仅能证明磁盘仍为本事务 candidate 时补偿；无法确认时 fail closed。若候选重新声称“任意异常都恢复旧文件”，把超出平台能力的声明登记为强制问题。

## 十二、防越界审查

完整 diff、源码搜索、package diff 与页面检查必须确认没有：

- NLP、Python、Ollama、Agent、Prompt、Notebook 或 `03～07` 实现；
- 交易编辑 / 删除扩张、历史 K 线、轮询、WebSocket、实时汇率；
- 桌面、移动、iCloud、CloudKit、Keychain、Touch ID、Face ID；
- 论文、`CS2026`、benchmark、比赛材料或跨分支复制；
- 真实个人数据 fixture、真实账号 / 文件路径或秘密；
- V1 自动迁移 / 自动删除 / 兼容读取；
- 无关 UI 重构、动画、美化、主题、依赖升级或全仓格式化；
- 在组件、reducer 或图表中复制 FeeRule / 金额公式；
- 把 02B、代码合入或自动化绿灯写成 00B 已完成或 03 已获准。

越界按实际影响判 P0 / P1；无关但低风险的范围污染至少记 P2，不能静默接受。

## 十三、02D 唯一输出合同

无论最终结果如何，只生成：

```text
02D_W12-main-版本2与手续费规则独立审查报告.md
```

02D 第一屏只能出现一个最终结论：`PASS`、`FAIL` 或 `BLOCKED`。不得同时出现“总体 PASS / 浏览器 BLOCKED”等两个并列结论。

02D 至少包含：

1. 唯一最终结论及一句话原因。
2. 审查对象：两个仓库路径、branch、HEAD、tree、ahead / behind、staged / unstaged / untracked、完整候选 hash、开始 / 结束快照。
3. 02B 陈述对照：独立确认、现场不一致、无法确认。
4. `FEE-001～003` 逐项目源码、正式测试和用户级证据。
5. `F02-M01～M30` 完整矩阵，每项 `PASS / FAIL / BLOCKED` 与三层证据。
6. 通过项、失败项、阻塞项分开列出；Finding 按 P0～P3，给文件 / 行号、复现、影响和最小关闭条件。
7. 定向测试、全量测试、typecheck、lint、production build、whitespace、skip / debug / 浮点 / legacy 可达扫描的命令、退出码、数量和 warning / error。
8. 正式测试质量审查：新增覆盖、旧安全回归、是否删测 / 放宽 / mock 造绿、临时探针与永久测试缺口。
9. 真实 Chrome 版本 / origin / 视口、系统 picker、宿主 V2 文件 / 备份 hash、console、清理结果。
10. 权限、重连、恢复、双标签、revision 冲突、clear、保存锁定重开、V2 backup / restore 和 raw IndexedDB 证据。
11. 三类旧整账拒绝前后 hash / record、零写入、无迁移 / 删除 / compat-read 证据。
12. PNL 固定样例、零费、多买、部分 / 全部卖出、缺价、异币 fee，以及 absent / null / explicit mapping 回归。
13. `W12-EVID-001` 当前 V2 适用关闭证据与剩余风险；Week 11 `02D = BLOCKED` 作为历史判定保持不变。
14. 明确正式源码 / 测试 / package / Git index 全程只读；没有 Git 写操作；没有修改 00B、00D、当前状态、02A、02B 或 `CS2026`。

结论后的协调含义：

- `PASS`：只允许后续独立协调任务勾选 00B 的 `FEE-001～003`、按 00D 规则关闭 `W12-EVID-001` 的当前 V2 适用范围，并决定是否进入 03。
- `FAIL`：00B 保持未完成；当前路线暂停，登记最小阻塞 Finding，等待另行生成修复 A / C。
- `BLOCKED`：00B 与 `W12-EVID-001` 保持未完成；保留已取得证据，写明解除阻塞的最小外部条件。

02C / 02D 自身不得执行上述协调写入，也不得提交报告。

## 十四、明确排除项

独立审查不执行或扩展：

- NLP、Ollama、Python、Agent、Prompt、RAG；
- `03～07` 批次、课程、Notebook、公平评估、比赛材料；
- 交易编辑 / 删除功能扩张；
- 历史 K 线、轮询、WebSocket、实时汇率；
- 桌面端、移动端、iCloud、CloudKit、Keychain、Touch ID、Face ID；
- 论文、`CS2026`、benchmark；
- 真实个人账本或真实个人交易；
- 自动迁移、自动删除或兼容读取三类旧整账；
- 无关 UI 重构、动画、美化、主题或依赖升级。

## 十五、独立审查完成自检

- [ ] 02A 已完整执行、02B 已存在、候选完整 working tree 可冻结。
- [ ] 根文档与源码仓库开始 / 结束 branch、HEAD、status、tracked / untracked、hash 和 diff 已分别记录。
- [ ] 正式源码、正式测试、package 文件和 Git index 全程只读。
- [ ] 补充探针只在完整临时副本 / 临时目录，未写回正式候选。
- [ ] `FEE-001～003` 与 `F02-M01～M30` 均有源码、正式测试和用户级证据。
- [ ] LedgerData / File / Backup V2、Validator、ResourcePolicy、current / previous、identity / revision 完整。
- [ ] 三类旧整账明确拒绝、零写、不迁移、不自动删除。
- [ ] raw IndexedDB 活跃路径只有最小 connection record。
- [ ] fixed、percentage、版本、停用、无匹配、多匹配、候选修改和历史稳定完整。
- [ ] 规则管理、交易预览、保存、锁定和重开真实可用。
- [ ] PNL-001～003 与 R1 mapping 修复完整回归。
- [ ] 真实 Google Chrome 覆盖系统 picker、宿主 V2 文件、权限、重连、恢复、双标签、clear、revision 冲突、raw IndexedDB、V2 backup / restore。
- [ ] jsdom、组件测试、内置浏览器、02B 截图或口述没有替代真实证据。
- [ ] 判定优先级为反证 FAIL > 缺证 BLOCKED > 全证 PASS。
- [ ] 02D 第一屏只有一个最终结论，并分别列出通过、失败、阻塞、测试、Chrome、Git 和剩余风险。
- [ ] 只生成 02D；没有修改 00B / 00D / 当前状态、源码、正式测试或任何 Git 状态。

只有 `02D = PASS`，后续协调任务才可以更新 `FEE-001～003`、关闭 `W12-EVID-001` 的当前适用范围并决定是否进入 03。02A、02B、代码提交、自动化全绿或开发侧 Chrome 成功都不能替代本独立结论。
