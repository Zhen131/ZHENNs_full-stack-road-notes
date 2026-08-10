# Week 12 main FEE-001～003 版本 2 与手续费规则执行文档

日期：2026-08-10
状态：已执行；02B 开发侧 PASS，候选已 fast-forward 合入源码 `main`
源码轨道：`01一些进度/产出/LocalFirstTradingLedger/`；目标分支为产品 `main` 轨道
开发目标：`FEE-001`、`FEE-002`、`FEE-003`
执行分支：`zhennn/w12-v2-fee-rules`；本文原始边界不授权 push / merge，后续由用户另行明确授权合入
唯一开发报告：`02B_W12-main-版本2与手续费规则执行报告.md`
配套独立审查输入：[02C_W12-main-版本2与手续费规则独立审查执行文档](02C_W12-main-版本2与手续费规则独立审查执行文档.md)

## 结论：完成后用户得到什么

本批必须一次交付版本 2 新账本、固定费 / 百分比手续费规则和交易页面闭环，不能只升级 schema，也不能把页面、旧格式拒绝或正式测试推迟到 `03`。

真实用户流程固定为：

```text
在真实 Google Chrome 打开网页
→ 用系统 picker 新建一个专用虚构版本 2 .lftl
→ 解锁后新增“OKX + BTC，固定 5 USDT”或“OKX + BTC，0.1%”规则
→ 录入交易，可选填写平台
→ 页面只按“平台 + 资产”精确匹配一个有效规则
→ 保存前显示成交金额、候选手续费、买入总支出 / 卖出净到账和规则来源
→ 用户可修改候选手续费，确认后的实际值写入 Trade.fee
→ 网页执行 Validator 与现有安全保存链
→ write、close、readback、解密、完整 Validator 全部通过后才显示成功
→ 锁定并重开后，实际手续费不因规则后来变化而改变
```

版本 1 `.lftl`、版本 1 明文备份和旧 IndexedDB 完整账本只能得到清楚的“不支持，请新建版本 2 账本”提示；选择、预检或启动过程不得迁移、写回或自动删除它们。

## 一、给开发执行 AI 的硬合同

1. 先完整读取本文、[000](000_W12-规划文件关系与批次命名规则.md)、[00A](00A_W12-网页优先产品共识与架构边界.md)、[00B](00B_W12-总需求快照与待办清单.md)、[00C](00C_W12-main-网页与AI开发批次路线.md)、[00D](00D_W12-已知问题与验收缺口清单.md)、[当前开发状态](../00-当前开发状态.md)、[01R1D](01R1D_W12-main-旧账Binance映射静默写回独立复验报告.md)、实际源码与 [README](../../产出/LocalFirstTradingLedger/README.md)。
2. 开始前分别记录根文档仓库与产品源码仓库的实际路径、branch、HEAD、status、staged / unstaged / untracked、完整 diff、相对本地 `origin/main` 跟踪引用的 ahead / behind。产品 worktree 路径和轨道必须匹配 `LocalFirstTradingLedger/main`。
3. 本文生成时的只读快照为：根文档仓库 `main@e444c7b2de0a608fd4d56e9a7054d599b94e00e7`，源码仓库 `main@44d1e566e08b5e187e23dd2ef51308ebbb6c60b0`，两边相对各自 `origin/main` 均为 `0/0` 且 clean。执行时必须重新核实，不能把本段冒充实时现场。
4. 若存在与本批重叠的用户修改、错误 worktree / 分支、无法解释的 HEAD 或工作树漂移、02A / 02C 合同冲突，停止源码写入并在 02B 判 `BLOCKED`；不得覆盖、清理或吸收用户改动。
5. 允许修改产品源码仓库中本文列出的职责区域及直接正式测试，并在根文档仓库新增唯一 02B。不得修改 `00A～00D`、当前开发状态、01 系列报告、02C、`CS2026` 或其他计划文件；不得生成或执行 02D。
6. 建议候选分支 `zhennn/w12-v2-fee-rules` 只是统一名称，不是 Git 授权。执行任务必须以当时用户明确授权为准；未授权时不得创建分支、暂存、提交、push、merge、rebase、cherry-pick、squash、amend、设置 upstream 或删除分支。
7. 本批只使用专用虚构版本 2 `.lftl`、虚构版本 2 备份和受控旧格式 fixture；禁止打开、导入、覆盖、解密或检查真实个人账本与真实个人交易。
8. 必须一次完成下文 `F02-M01～M30`。不能用“后续 03 做 NLP”解释版本、规则、页面、文件或证据缺口。
9. 02A、02B、开发侧 `PASS`、代码提交或代码进入 `main` 都不能回写 00B，也不能自行进入 03。只有全新任务执行 [02C](02C_W12-main-版本2与手续费规则独立审查执行文档.md) 并生成 `02D = PASS`，后续协调任务才可以更新状态。

## 二、事实优先级与当前基线

### 2.1 事实优先级

1. 当前实现事实：执行时的实时源码与正式测试。
2. 当前里程碑：[当前开发状态](../00-当前开发状态.md)。
3. 目标产品合同：[00A](00A_W12-网页优先产品共识与架构边界.md)。
4. 目标 ID 与通过线：[00B](00B_W12-总需求快照与待办清单.md)。
5. 批次范围：[00C](00C_W12-main-网页与AI开发批次路线.md)。
6. 独立证据缺口：[00D](00D_W12-已知问题与验收缺口清单.md)。
7. 01A / 01C 只提供 A / C 文档结构；旧 Git 条款、旧候选身份和旧批次事实不得覆盖本文件。

### 2.2 已重新核实的当前源码事实

| 入口 | 2026-08-10 当前事实 | 本批目标 |
| --- | --- | --- |
| `src/models/types.ts` | `LedgerData.schemaVersion` 是字面量 `1`；Trade 已有实际 `fee`、`feeCurrency`、可选 `feeRuleId`，没有平台；FeeRule 只有 `percentage + rate + currency + platform`，没有资产、固定费、启停或版本关系 | 建立严格版本 2 模型、可选 Trade 平台和完整 FeeRule 判别联合 |
| `src/validators/ledgerDataValidator.ts` | 只接受 schema 1；FeeRule 只接受 percentage；Trade 的 feeRuleId 只检查引用存在 | 只接受 schema 2；校验规则种类、目标资产、启停、版本关系和历史引用，不借规则重算 Trade |
| `src/validators/resourcePolicy.ts` | 已限制文件、集合、ID、platform、note、rawText；feeRules 上限为 500 | 新字段全部纳入同一资源上限，不放宽现有边界 |
| `src/encryption/ledgerFileContract.ts`、`ledgerFileCrypto.ts` | 外层 `fileFormatVersion = 1`；generation 的 `ledgerSchemaVersion = 1`；current / previous、fileId、revision lineage 和 PBKDF2 / AES-GCM 已存在 | 建立只承载 schema 2 的 `.lftl V2`，保留已验收加密和双代语义 |
| `src/repositories/ledgerFileRepository.ts` | 新建、保存、打开、previous 恢复、clear、close-readback、revision / identity 检查均固定调用 V1 合同 | 全链切换到 V2；旧 V1 只识别后拒绝，不能进入解锁、恢复或保存 |
| `src/backup/backupEnvelope.ts`、`backupImportPreflight.ts` | `BackupEnvelopeV1`、`backupFormatVersion = 1`、`ledgerSchemaVersion = 1`；已有零写预检、候选 identity 与整本恢复证据 | 建立 V2 备份、V2 零写预检与整本恢复；V1 备份无 candidate、无写入授权 |
| `src/adapters/ledgerFileConnectionAdapter.ts` | IndexedDB connection record 只有 `connectionFormatVersion`、handle、expectedFileId | 继续只保存这三个最小连接字段；账本 schema 升级不扩张 connection record |
| `src/adapters/indexedDbStorageAdapter.ts`、`src/composition/ledgerAccessController.ts`、`ledgerAccessComposition.ts` | production 仍组合旧 IndexedDB 完整加密账本的解锁、迁移到 C 和显式删除入口 | 退役完整旧整账生产入口；只允许识别为不支持并保持旧记录原样 |
| `src/components/security/LedgerAccessGate.tsx` | 启动时仍可能进入 legacy migration；已有新建、选择、重连、解锁、previous 恢复和锁定页面 | 移除迁移流程；所有可写会话只来自版本 2 `.lftl` |
| `src/state/ledgerReducer.ts` | 没有 FeeRule 新增、版本更新或停用 action | 增加原子规则操作；不能用多个松散 action 暴露中间非法状态 |
| `src/components/trades/TradeForm.tsx` | 没有平台或规则选择；fee 完全手填；reducer 接受后立即显示“交易已加入账本” | 加入可选平台、确定性候选与实际 fee 覆盖；成功必须绑定已认证保存结果 |
| `src/components/dashboard/DashboardShell.tsx` | 没有规则管理区；TradeForm 只收到同步 `ApplyLedgerActionResult` | 接通规则管理、预览、保存确认与只读 / dirty / 错误状态 |

当前正式测试文件数可由源码文件表只读计为 58。58 files / 730 tests、typecheck、lint、production build、whitespace 和真实 Chrome 虚构 `.lftl` 全链的已接受基线来自 [01R1D](01R1D_W12-main-旧账Binance映射静默写回独立复验报告.md)；本执行输入生成任务没有重跑测试或浏览器。

### 2.3 当前里程碑与历史边界

- `PNL-001～003` 已由 `01R1D = PASS` 独立完成并进入源码 `main`。
- 版本 2、固定 FeeRule、规则管理页、Trade 平台和规则候选仍未实现，不得写成当前能力。
- Week 11 `02D = BLOCKED` 保留历史判定；它不阻塞本批虚构版本 2 开发，但真实个人数据 Gate 未关闭。
- `W12-EVID-001` 必须由本批 02C / 02D 在版本 2 冻结候选上重新取得适用证据，不能沿用第 01 批“无需重做”的旧边界。

### 2.4 执行前仍需从实时源码确认的未知项

- 02A 执行时 HEAD 是否已新增版本、FeeRule 或页面相关用户改动。
- 规则管理区在现有 Dashboard 中的最小放置方式；允许新增小型组件，不允许整体页面重构。
- 保存确认需要在 `usePersistentLedger` 暴露何种按 mutation / generation 绑定的 receipt。实现形式可选择，但不得复用一个与本次交易无绑定关系的全局 `saved` 文案。
- 旧 IndexedDB 记录的“存在性检测”如何最小化。允许只读识别旧格式以显示拒绝；不得恢复旧迁移、解密、复制或删除能力。

以上未知项只能决定内部落点，不能改变下文数据合同、用户结果或通过线。

## 三、FEE-001～003 精确范围与依赖

| ID | 必须交付 | 不得偷换的完成口径 |
| --- | --- | --- |
| `FEE-001` | `LedgerData.schemaVersion = 2`；`.lftl V2`、新版明文备份、零写预检、整本恢复；旧 V1 `.lftl`、旧 V1 备份和旧 IndexedDB 整账明确拒绝；IndexedDB 只写最小 connection record | 不能兼容读取后偷偷迁移；不能保留可达的旧整账迁移入口；不能只改 TypeScript 类型 |
| `FEE-002` | Trade 平台可选；固定 USDT 与 totalValue 百分比规则；按平台 + 资产精确匹配；规则版本化、停用、无匹配 / 多匹配 fail closed；实际 Trade fee 为历史事实 | 不能按平台名模糊匹配、按默认平台猜测、原地改费率或让历史交易读取当前规则 |
| `FEE-003` | 页面新增 / 查看 / 版本更新 / 停用规则；交易得到可修改候选 fee；保存前显示成交金额、fee、现金影响和来源；认证保存后才成功 | 不能只做 service 无页面；不能把候选当实际 fee；不能在 reducer 接受后提前显示成功 |

依赖固定为：

```text
PNL-003 + BASE-002
→ FEE-001
→ FEE-002
→ FEE-003
→ 02B 开发报告
→ 全新任务执行 02C / 02D
```

## 四、版本 2 数据合同

### 4.1 LedgerData V2

- `LedgerData.schemaVersion` 必须是字面量 `2`。
- 持久化根字段仍只有 `schemaVersion`、`assets`、`trades`、`priceSnapshots`、`feeRules`；不得保存 Position、P&L、现金影响、图表、候选 fee、表单状态或会话状态。
- 新建、reset、clear 后都生成 schema 2；内置 BTC / ETH / ADA 继续使用已验收的 USDT 与 explicit Binance mapping。
- runtime Validator 只接受 schema 2。任何 schema 1 LedgerData 均返回稳定的 unsupported-version 错误，不重构对象、不 dispatch、不保存。
- 版本升级不是数据迁移：不提供 `v1 -> v2` converter，不批量改写 USD、mapping 或旧 feeRules。

### 4.2 `.lftl V2` 外层与加密 metadata

为使旧 `.lftl V1` 在密码和业务数据进入前即可明确拒绝，本批冻结以下新外层：

```text
LedgerFileV2
├─ fileFormatVersion: 2
├─ fileId: 非空、受资源上限约束的随机技术 ID
├─ crypto:
│  ├─ cryptoVersion: 1
│  ├─ PBKDF2 / SHA-256 / 600000 / 16-byte random salt
│  └─ AES-256-GCM / 12-byte unique IV / 128-bit tag
├─ current: EncryptedLedgerGenerationV2
└─ previous: EncryptedLedgerGenerationV2 | null

EncryptedLedgerGenerationV2
├─ revisionId: 随机且不得与 current / previous 重复
├─ parentRevisionId: 首代为 null；否则精确等于 previous.revisionId
├─ ledgerSchemaVersion: 2
├─ ivBase64Url
└─ ciphertextBase64Url
```

规则：

1. `fileId` 创建后永久不变；复制文件可保留 fileId，真实物理同一文件仍用 `isSameEntry()` 判断，不能用文件名判断。
2. `cryptoVersion` 和已验收密码学参数保持 1，不因 ledger schema 升级而静默改变 KDF 或密码策略。
3. current / previous 必须是相邻、独立 IV 的两代；previous 只保存上一个已验证 current。
4. 每次成功保存、恢复或 clear 都生成新 revisionId；current.parentRevisionId 精确指向新 previous.revisionId。
5. 解密 payload 仍只有 `savedAt` 与 `ledgerData`；payload 必须通过 JSON、schema 2 Validator、ResourcePolicy 和完整交易时间线校验。
6. 保存前复读 file identity、fileId、crypto metadata 和 current revision；任一漂移都在写前拒绝。
7. 只有 `write → close → 原句柄 readback → 外层 V2 校验 → current 解密 → LedgerData V2 Validator → ResourcePolicy → identity / revision 对照` 全部通过才发布成功。
8. 未知 fileFormatVersion、cryptoVersion、ledgerSchemaVersion、额外字段、损坏 Base64URL、错误 lineage、current / previous 同 IV 或超限内容均 fail closed。

### 4.3 明文 `BackupEnvelopeV2`

```text
backupFormatVersion: 2
appVersion: 非空字符串
exportedAt: 带时区的严格 ISO datetime
ledgerSchemaVersion: 2
ledgerData: 完整 LedgerData V2
```

- 导出前重新执行完整 Validator 与 ResourcePolicy；备份仍是明文，页面继续披露下载位置与同步目录风险。
- 预检在 JSON.parse 前先做 8 MiB 字节上限；随后校验 envelope、schema、资源、引用、时间线、未来事实、重复 ID、rawText 要求和可疑重复分组。
- 预检阶段零写入：不得 dispatch、save、clear、创建 connection record、获取写锁或改变当前 C。
- 只有无 hard error、candidate / candidateIdentity / contentIdentity / selectionGeneration 全部仍有效，且可疑组已显式确认，才能形成一次性恢复授权。
- 整本恢复保持“全量替换、不合并、不跳过、不自动去重”。继续受现有 ready C 安全 capability 约束；不得为了方便放宽为任意非空 C 的隐式覆盖。
- 恢复必须保存旧 C 精确 bytes 与身份；candidate 成功 close-readback 并完成 V2 全校验后才发布。失败补偿遵循已接受浏览器边界：只有能证明磁盘仍是本事务精确 candidate 时才补偿；无法确认时进入 recovery-blocked，停止后续写入且不显示成功。

### 4.4 三类旧整账退役

| 旧格式 | 必须行为 | 禁止行为 |
| --- | --- | --- |
| `.lftl V1` | 读取足够的非秘密外层以识别 `fileFormatVersion = 1`，显示“不支持，请新建版本 2 账本”，保持文件字节不变 | 不询问密码继续解密；不迁移、不覆盖、不恢复 previous、不建立 connection record |
| `BackupEnvelopeV1` | 预检报告稳定 unsupported-format / schema 错误，无 candidate、无授权、当前 C 零写入 | 不兼容读取、不转换、不导入部分数据、不删除原备份 |
| 旧 IndexedDB 完整账本 | 启动时最多只读识别其存在并显示旧格式已退役；旧 record 逐字节 / 逐字段保持原样 | 不解锁、不迁移到 C、不自动删除、不复制到 connection DB、不作为 Dashboard 数据源 |

生产 composition 与页面必须移除旧完整账本的解锁、迁移、验证目标和删除流程。若保留旧解析器或 adapter，只能用于拒绝性正式测试或最小存在性检测，不能从 production composition 可达。

### 4.5 IndexedDB 最小 connection record

- 活跃版本 2 路径的 IndexedDB 只允许当前已有三字段：`connectionFormatVersion`、文件 handle、`expectedFileId`。
- connection record 的版本描述其自身 shape，与 ledger schema 独立；本批不得因 schema 升级加入完整账本、revision、crypto metadata、密码、CryptoKey、候选 fee 或规则副本。
- 正确重连读取 record、查询 / 请求 readwrite 权限、检查 handle 与 expectedFileId，然后再按 `.lftl V2` 校验；权限 denied、文件移动 / 删除、错误重选或 V1 文件均零写入。
- 专用干净浏览器 profile 的 raw IndexedDB 必须只看到最小 connection record。另行注入旧完整账本 fixture 时，该旧数据库可仍存在，因为禁止自动删除；审查必须证明它未被读取成正式账本、未被改写且没有新增第二份整账。

## 五、FeeRule 确定性合同

### 5.1 持久化模型

FeeRule 必须成为判别联合，至少表达：

```text
共同字段：
id、name、platform、assetSymbol、status(active | inactive)、
createdAt、updatedAt、deactivatedAt?、replacesFeeRuleId?

fixed：
type = fixed、amount、currency = USDT

percentage：
type = percentage、rate、currency = USDT
```

固定约束：

- `platform`、`assetSymbol` 都是非空、去除首尾空白后仍不变的持久化值；匹配时不做大小写折叠、别名、包含或模糊推断。
- `assetSymbol` 必须引用当前 LedgerData 中的 Asset。
- `amount >= 0`；当前正式固定费币种只允许 `USDT`。
- `rate >= 0`，以小数比例保存，例如 `0.001 = 0.1%`；候选费 = `Trade.totalValue × rate`，基数永远不含 fee。
- 计算只用 `decimalMath` / `decimal.js` 的 40 位十进制上下文；不使用 JavaScript number，不做未声明的交易所舍入或最低手续费猜测。
- `replacesFeeRuleId` 若存在，必须引用同一平台 + 资产的 inactive 旧规则，不能形成环或跨目标替换。
- 可选 `Trade.feeRuleId` 只追踪候选来源；它必须引用账本中存在的规则，但允许引用已停用规则。

### 5.2 新增、版本更新与停用

- 新增规则生成新 ID；ID 冲突必须稳定失败，不能重试后覆盖既有规则。
- “更新规则”不是原地改 `amount`、`rate`、platform、assetSymbol、type 或 currency；必须在同一次 LedgerData mutation 中新增一个新 ID 规则，并把旧规则改为 inactive。
- 对旧规则唯一允许的经济外变化是停用状态、停用时间和指向替代版本的关系；旧金额、费率、平台、资产、创建时间不得改写。
- 更新事务任一步失败都不能留下“两个 active”或“旧已停用但新规则不存在”的中间状态。
- 单独停用不删除规则；被 Trade.feeRuleId 引用的规则永远不能物理删除。
- 本批不提供规则编辑历史的迁移或自动合并。

### 5.3 精确匹配与候选 fee

候选匹配输入只允许 `TradeDraft.platform + assetSymbol`：

1. 未填写平台：无自动候选，用户手填实际 fee。
2. 平台已填但 0 个 active 精确匹配：不猜测，页面显示“无匹配规则”，用户手填。
3. 恰好 1 个 active 精确匹配：计算候选 fee，并显示规则名、ID、类型、公式和币种。
4. 多个 active 精确匹配：禁止选择“第一个”或“最新”；显示冲突，用户必须选择一个来源规则或转为手填实际 fee。规则管理区同时标出冲突。
5. 固定费候选 = rule.amount；百分比候选 = totalValue × rule.rate。
6. 候选只存在表单 / 预览状态，不进入 LedgerData。用户确认时把当时最终实际值写入 `Trade.fee` / `feeCurrency`，若仍采用规则来源则同时写 feeRuleId。
7. 用户修改候选 fee 后，实际 fee 使用用户值；feeRuleId 可以保留为来源追踪，但页面必须明确“规则候选已由用户修改”，不能把规则值冒充实际值。
8. 后续新增、停用或替换规则不得扫描、修改或重算旧 Trade；持仓、P&L、备份与重开只读实际 `Trade.fee`。

### 5.4 Trade 平台

- `Trade` 与 `TradeDraft` 新增可选 `platform?: string`；未填写仍允许手工交易。
- 平台是用户确认的交易事实，保存后原样读取；本批不新增账户、交易所 API、订单 ID 或平台同步。
- Validator 对存在的平台执行非空、首尾空白、资源上限检查；不把缺失平台自动补成 Binance / OKX。
- 页面平台选择 / 输入只能提供便利，不能改变精确持久化语义。

## 六、页面与保存闭环

### 6.1 规则管理

Dashboard 中增加最小规则管理区，至少支持：

- 查看 active / inactive 规则、类型、平台、资产、金额 / 费率、USDT、版本来源和创建 / 停用时间；
- 新增固定费或百分比规则；
- 以“创建新版本并停用旧版”更新规则；
- 显式停用，不提供物理删除；
- 发现同平台 + 资产多个 active 规则时给出冲突状态，不静默修复；
- 只读、hydration 未完成、saving、recovery-blocked、session quiesce 或权限失败时禁用写操作。

### 6.2 交易录入与预览

TradeForm 必须增加可选平台和手续费来源区。保存按钮上方的同一预览至少显示：

```text
成交金额（不含手续费）
候选 / 实际手续费与币种
买入总支出 或 卖出净到账
来源：手填 / FeeRule 名称 + ID + fixed / percentage 公式
如用户改过候选，明确显示“实际手续费已由用户修改”
```

- 数量、均价或 totalValue 未通过基础 Decimal 校验时，不显示伪造候选。
- 规则候选变化不能自动覆盖用户已编辑的实际 fee；切换平台、资产、规则或 totalValue 时必须采用可测试的显式重算 / 保留选择，禁止静默覆盖。
- 多匹配时页面必须阻止“自动采用”；允许用户显式选择来源或手填。
- 最终 Trade 仍满足 `totalValue = quantity × price`，fee 不进入该等式。

### 6.3 认证保存后才成功

当前 TradeForm 在 reducer 接受后立即显示“交易已加入账本”，本批必须修正：

- reducer / in-memory apply 只能显示“待保存”或“正在保存”；不能显示最终成功。
- 每次交易或规则 mutation 必须绑定唯一 mutation / session generation / repository / base revision。
- 只有该 mutation 对应的 V2 保存完成 write、close、readback、解密、完整 Validator、ResourcePolicy、fileId / revision 对照后，页面才显示成功。
- 旧 `saved` 状态、较早 mutation、较早 session、已取消页面、切换 repository 或重新打开后的异步结果不得确认当前操作。
- 保存失败保留明确 dirty / retry 状态；失败不能从列表、规则区或 toast 冒充已持久化。锁定时继续遵守“重试保存或明确放弃后锁定”。

## 七、版本 2 全流程行为

| 流程 | 强制行为 |
| --- | --- |
| 新建 | 系统 Save picker → 非空目标替换确认 → 新 fileId / salt / revision → 初始 LedgerData V2 → write-close-readback 全校验 → connection record → Dashboard；连接记录失败不得发布未可重连的成功 |
| 打开 | 系统 Open picker → 外层 V2 / 资源 / fileId 检查 → 密码 → current 认证解密与完整校验；V1 / 未知 / 损坏明确拒绝 |
| 重连 | 只读最小 connection record → permission query / request → expected file identity → V2 inspect / unlock；错误重选、denied、移动或删除均 fail closed |
| 保存 | 写前复读 identity / revision → encrypt candidate → 再次确认写入意图仍有效 → write-close-readback-解密-Validator；成功后更新 current / previous 与内存确认 |
| previous 恢复 | 仅 current 确认损坏且 previous 独立认证、schema 2、ResourcePolicy 有效时提供；取消零写；确认后生成新 current 并复读，不能直接把 previous 当成功页面状态 |
| clear | 只允许 ready V2 C，固定文本确认；新 current 是初始 LedgerData V2，旧 current 成为 previous；新 revision / IV / savedAt，复读后才成功 |
| 明文导出 | 只导出 BackupEnvelopeV2；披露明文风险；下载触发不能冒充文件一定落盘 |
| 预检 | 选择 V2 备份后只读完成 hash、结构、Validator、ResourcePolicy、policy、重复组与报告；任何错误都零写 |
| 整本恢复 | 一次性 evidence 绑定同一文件选择、candidate、session、repository、fileId、base revision 和 generation；全量替换不合并；成功后页面等于候选 |
| 锁定 / 切换 | quiesce / drain 所有挂起保存与恢复；旧异步结果作废；密码和 CryptoKey 离开会话内存；lease / write lock 释放失败必须显式重试 |

## 八、资源、失败注入与并发合同

### 8.1 ResourcePolicy

- 保留 8 MiB LedgerData JSON、32 MiB `.lftl` 外层、assets 500、trades 25,000、priceSnapshots 5,000、feeRules 500 等现有限制，除非实时源码已由独立授权改变。
- platform、rule name、assetSymbol、feeRuleId、replacesFeeRuleId 和新增状态字段全部进入字符串 / 引用验证。
- 资源超限的打开、预检、保存、恢复、clear 均不得部分写入或显示成功。

### 8.2 强制失败注入

正式测试必须覆盖：

- picker 取消、非 `.lftl`、非空目标、permission `prompt / denied`、文件移动 / 删除；
- 外层 JSON、额外字段、未知版本、crypto metadata、Base64URL、current / previous、lineage、schema、payload、ResourcePolicy 损坏；
- KDF / 加密、写前复读、写入、close、readback、解密、Validator、identity / revision 对照任一步失败；
- 保存、规则更新、clear、恢复过程中外部 revision、fileId、salt / crypto metadata 或 `isSameEntry` 漂移；
- 双标签页真实同文件争用、副本不误锁、lease / Web Lock 不可用或释放失败；
- 旧 picker Promise、旧 permission、旧 preflight、旧候选 fee、旧规则选择、旧 save receipt 在取消、重选、锁定、卸载、repository 切换或新 mutation 后返回；
- 多次点击保存 / 停用 / 版本更新 / clear / 恢复的去重与一次性授权；
- post-close 状态无法确认时停止后续写入，不把 BLOCKED 写成成功。

### 8.3 已接受的浏览器上限

不得重新引入 Week 11 `03A` 的绝对回滚承诺。页面 / Chrome 进程死亡、权限永久丢失或外部原生程序抢先改写后，浏览器无法保证继续补偿。正确合同是：

```text
正常成功必须完整复读
→ 仅在能证明磁盘仍是本事务精确 candidate 时允许补偿
→ 无法确认时 fail closed，停止后续写入并如实提示
```

## 九、F02-M01～M30 统一强制矩阵

02A 开发与 02C 独立审查必须使用同一编号和同一通过线：

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

## 十、预计修改区域与职责

以下路径均来自当前源码；新增文件只能落在对应现有分层，名称由执行者在 02B 据实记录，不得为了满足本文臆造空模块。

| 当前路径 | 本批职责 | 防越界要求 |
| --- | --- | --- |
| `src/models/types.ts`、`src/models/index.ts` | LedgerData V2、Trade platform、FeeRule 联合 | 不把候选、现金影响或派生 P&L 加入 LedgerData |
| `src/state/initialLedgerData.ts`、`src/state/ledgerReducer.ts` | schema 2 初始化；规则新增 / 原子版本更新 / 停用 action | 不在 reducer 计算候选 fee 或碰存储 |
| `src/validators/ledgerDataValidator.ts`、`tradeValidator.ts`、`resourcePolicy.ts` | V2 结构、引用、平台、规则、资源和交易完整校验 | V1 只拒绝，不 normalize / migrate |
| `src/policies/ledgerFactPolicy.ts`、`ledgerImportPolicy.ts` | 新事实与 V2 恢复边界 | 不删除 PNL/R1 mapping 三态合同 |
| `src/utils/decimalMath.ts` | 仅在现有 primitive 不足时提供通用 Decimal helper | 不增加 JS 浮点业务公式 |
| `src/encryption/ledgerFileContract.ts`、`ledgerFileCrypto.ts`、`ledgerKeyDerivation.ts` | `.lftl V2` 外层、payload、metadata 与加解密 | KDF / AES 参数保持独立显式；不复用旧 shared default |
| `src/repositories/ledgerFileRepository.ts`、`ledgerRepository.ts` | V2 新建、打开、保存、恢复、clear、readback；退役旧整账可达路径 | 不降低 identity / revision / fail-closed 语义 |
| `src/backup/backupEnvelope.ts`、`backupImportPreflight.ts`、`backupContentIdentity.ts`、`backupImportReport.ts`、`backupDownload.ts` | V2 导出、零写预检、identity、报告与下载 | V1 无候选；不合并、不部分导入 |
| `src/adapters/ledgerFileHandleAdapter.ts`、`ledgerFileConnectionAdapter.ts`、`indexedDbStorageAdapter.ts` | picker / 文件 I/O；最小 connection；旧整账退役 | IndexedDB 不新增第二份整账、秘密或规则缓存 |
| `src/composition/ledgerFileAccessController.ts`、`ledgerAccessController.ts`、`ledgerAccessComposition.ts` | V2 新建 / 打开 / 重连 / 恢复；移除 production legacy migration | 不让旧整账 controller 从 production UI 可达 |
| `src/coordination/ledgerFileSessionCoordinator.ts`、`src/hooks/usePersistentLedger.ts` | session / lease / revision、保存 receipt、旧异步失效 | 不用全局 saved 替代本次 mutation 证据 |
| `src/components/security/LedgerAccessGate.tsx` | V2 入口、V1 拒绝、权限 / 重连 / 恢复 / 锁定 | 不保留旧迁移 UI；不打开真实个人文件 |
| `src/components/backup/BackupControls.tsx` | V2 导出、预检和整本恢复 UI | 选择 / 预检阶段严格零写 |
| `src/components/trades/TradeForm.tsx` | 平台、规则候选、实际 fee、预览与认证成功 | 不在组件复制规则匹配或金额真相 |
| `src/components/dashboard/DashboardShell.tsx` | 规则管理区、持久化状态编排 | 不建立第二份 LedgerData state，不整体重构页面 |
| `src/calculators/positionReplay.ts`、`src/services/pnlSummaryService.ts`、`src/services/chartDataService.ts` | PNL 永久回归，只读 Trade 实际 fee | 不读取 FeeRule 重算历史，不保存派生结果 |

允许在现有 `services/` 分层新增纯 FeeRule 校验 / 匹配 / 版本服务，在现有 `components/` 分层新增小型规则管理组件；生产公式只能有一个确定性 service / calculator 真相，UI 不复制。

## 十一、开发顺序

1. 冻结双仓库和实际授权，确认产品 main 轨道与无重叠用户改动。
2. 先写失败的正式合同测试，锁定 `F02-M01～M30`，尤其是三类旧整账零写拒绝、raw IndexedDB 和成功真实性。
3. 建立 LedgerData / File / Backup V2 Validator 与负面 V1 检测；先证明旧格式只能拒绝且字节 / record 不变。
4. 全链切换新建、打开、重连、保存、previous 恢复、clear、备份和整本恢复到 V2。
5. 从 production composition 与 LedgerAccessGate 退役旧 IndexedDB 完整账本迁移；保留拒绝性测试。
6. 建立 FeeRule 联合、Validator、原子版本服务、精确 matcher 与候选计算。
7. 接入 reducer、规则管理区、TradeForm 平台 / 预览 / 用户覆盖；修正保存 receipt 与最终成功时点。
8. 运行覆盖实际改动的定向正式测试；不得用删测、skip、放宽断言或只改 fixture 迎合实现。
9. 完整运行全量测试、typecheck、lint、production build、whitespace 和残留扫描。
10. 在真实 Google Chrome 用宿主可见专用虚构 V2 文件执行开发侧页面矩阵；不使用内置浏览器代替。
11. 再次冻结两个仓库，生成唯一 02B；不执行 02C，不生成 02D，不回写 00B / 00D / 当前状态，不自行进入 03。

## 十二、永久正式测试矩阵

### 12.1 模型、Validator 与规则

- `src/validators/ledgerDataValidator.test.ts`：schema 2 正例；schema 1 / 未知版本拒绝；FeeRule 两种联合、asset / rule 引用、状态、版本环、重复 ID、多 active 冲突可检测；未知字段不进入状态。
- `src/validators/tradeValidator.test.ts`、`src/services/tradeService.test.ts`：可选平台、首尾空白、feeRuleId、totalValue 不含 fee、用户实际 fee、USDT 与异币 fee 现有合同。
- `src/validators/resourcePolicy.test.ts`：新增字段长度、500 rules、8 MiB 边界和超限零写。
- `src/state/ledgerReducer.test.ts`：新建规则、原子版本更新、停用、重复 / 旧 action、不变性和 reset V2。
- 新增规则 service 正式测试：fixed、percentage、无匹配、单匹配、多匹配、用户覆盖、inactive、历史不重算、Decimal 极值与输入不变性。

### 12.2 文件、备份、连接与旧格式

- `src/encryption/ledgerFileContract.test.ts`、`ledgerFileCrypto.test.ts`：V2 精确字段、加密参数、payload schema 2、current / previous、IV、revision、未知 / V1 / 损坏 / 超限拒绝。
- `src/repositories/ledgerFileRepository.test.ts`：V2 create/open/save/recovery/clear/import；每阶段失败注入；identity、fileId、revision、salt、previous 和 recovery-blocked。
- `src/adapters/ledgerFileHandleAdapter.test.ts`：picker、write-close-readback、权限、取消、非空目标和宿主文件。
- `src/adapters/ledgerFileConnectionAdapter.test.ts`：三字段 exact shape、raw record、错误 fileId / handle / version、clear 和 stale operation；无任何账本 / secret 字段。
- `src/backup/backupEnvelope.test.ts`、`backupImportPreflight.test.ts`、`BackupControls.test.tsx`：V2 导出、V2 零写预检、candidate identity、可疑组、V1 拒绝无候选、整本替换和 stale selection。
- `src/composition/ledgerFileAccessController.test.ts`、`ledgerAccessController.test.ts`、`ledgerAccessComposition.test.ts`、`LedgerAccessGate.test.tsx`：V2 新建 / 打开 / 重连 / previous 恢复 / 锁定；legacy migration production 不可达；旧 IndexedDB fixture 原样不动。
- `src/hooks/usePersistentLedger.test.tsx`、`usePersistentLedger.fileCapabilities.test.tsx`、`usePersistentLedger.fileImport.test.tsx`：按 mutation 绑定的保存 receipt、dirty / retry / quiesce、clear / restore、旧异步、repository 切换和页面成功时点。

### 12.3 页面与 PNL / R1 永久回归

- `src/components/dashboard/DashboardShell.test.ts`、`DashboardShell.golden.test.tsx`、`DashboardShell.interaction.test.tsx`：规则管理、平台、候选、实际 fee 覆盖、预览、保存中 / 成功 / 失败、锁定重开。
- 固定费：OKX + BTC = 5 USDT；百分比：OKX + BTC = `0.001 × totalValue`；无匹配与两个 active 冲突均不得自动采用。
- 固定 PNL：6500 / 5、2800 / 3 精确得到 6505、2602、2797、195、3903。
- `positionReplay.test.ts`、`positionCalculator.test.ts`、`pnlSummaryService.test.ts`、`chartDataService.test.ts`、`ChartsOverview.test.tsx`：零费、多次买入、部分卖出、全部卖清、缺价、异币 fee、历史规则变化和三图不退化。
- `ledgerPolicies.test.ts`、`binancePriceRefreshService.test.ts`、`backupImportPreflight.test.ts`、`ledgerFileRepository.test.ts`、`usePersistentLedger*`、`MarketDataControls.test.tsx`：absent / explicit null / explicit Binance mapping 经 hydrate、preflight、save、readback、reopen、export 不被静默物化或合并。
- 序列化断言必须证明候选 fee、matching result、Position、summary、cash impact、chart data、P&L 和 issue 均不进入 LedgerData / `.lftl` / backup / connection record。

## 十三、开发侧质量门

先按实际改动运行定向测试，随后完整执行：

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

固定要求：

- 02B 记录每条命令、退出码、测试文件数、测试数、warning / error，不只写“全绿”。
- 检查 `.only`、`.skip`、`debugger`、意外 `console.log` / `console.debug`、merge conflict、TODO / FIXME / XXX / HACK、业务层 `Number` / `parseFloat` / 原生浮点手续费公式。
- 检查旧 `schemaVersion: 1`、`fileFormatVersion: 1`、`BackupEnvelopeV1`、legacy migration 和 `IndexedDbStorageAdapter` 的 production 可达性；负面测试 fixture 命中必须与生产命中分开报告。
- `git diff --check` 不覆盖未跟踪文件；对所有未跟踪源码、测试和 02B 做等价 whitespace 检查。
- 任一定向测试、全量、typecheck、lint、build、whitespace、强制扫描或开发侧真实 Chrome 强制项失败，02B 不得判 PASS。

## 十四、真实 Google Chrome 开发侧页面验收

必须使用 production build、真实 Google Chrome、loopback 地址、系统 picker 和宿主可见专用虚构文件；文件名建议含 `W12-V2-FEE-DEV-FAKE`。不得使用个人文件，也不得用 jsdom、组件测试、内置浏览器或静态观察替代。

1. 新建 V2 C，确认外层 fileFormatVersion 2、current ledgerSchemaVersion 2、解密 LedgerData schema 2、previous null；raw IndexedDB 只有三字段 connection record。
2. 新增 `OKX + BTC，fixed 5 USDT`；查看后以新 ID 更新为 6 并停用旧版，再新增 `Binance + BTC，percentage 0.001`；验证旧规则经济字段未改。
3. 录入无平台交易：无候选、手填 fee 可保存；录入 OKX + BTC：得到唯一固定候选；修改实际 fee 后预览与保存 Trade 使用用户值。
4. 制造两个 active `OKX + BTC` fixture：页面显示冲突，不自动选第一个；显式选择来源或手填才可继续。
5. 用百分比规则录入 totalValue 6500，核对候选 6.5；再完成固定 PNL 买卖样例，核对 6505 / 2602 / 2797 / 195 / 3903 与三图。
6. 在保存 write / close / readback 尚未完成时确认页面没有最终成功；完成后才成功。锁定、重开后 Trade 实际 fee / platform / feeRuleId 和规则历史准确。
7. 修改 / 停用规则后重开，旧 Trade 的 P&L 与实际 fee 不变；不存在按当前规则重算。
8. 导出 V2 明文备份，预检并在受允许的专用空 V2 C 中整本恢复；核对 fileId / revision / current / previous、页面、规则与 Trade 全量一致。
9. 分别选择虚构 `.lftl V1`、BackupEnvelopeV1 和注入旧 IndexedDB 整账，确认清楚拒绝、零写、不迁移、不自动删除；记录前后 hash / raw record。
10. 覆盖 current 损坏 + previous 有效恢复、取消、clear、permission prompt / denied / reselect、文件移动 / 删除、错误文件、双标签同文件、文件副本和外部 revision 冲突。
11. 在 390×844 与 1280 视口核对页面级无横向溢出、宽表局部滚动、规则表和预览可用；Chrome console 0 error。

开发侧浏览器流程即使全部通过，也不能替代 02C 的全新独立真实 Chrome 取证，不能单独关闭 `W12-EVID-001`。

## 十五、02B 唯一输出合同

无论 `PASS`、`FAIL` 或 `BLOCKED`，开发任务只生成：

```text
02B_W12-main-版本2与手续费规则执行报告.md
```

02B 第一屏必须给出唯一开发侧结论，并至少包含：

1. 起止时间；两个仓库路径、branch、HEAD、ahead / behind、status、staged / unstaged / untracked、完整 diff 和候选 identity。
2. 实际 Git 授权与动作；若使用建议分支，记录建立基线、终点和 commit；不得把本文当 Git 授权。
3. `FEE-001～003` 与 `F02-M01～M30` 逐项实现 / 证据 / 结果。
4. LedgerData V2、`.lftl V2`、BackupEnvelopeV2、connection record、旧格式拒绝和 production legacy 退役的实际代码证据。
5. FeeRule 模型、匹配、版本、停用、用户覆盖、历史不重算和页面闭环证据。
6. 新建、打开、重连、保存、previous 恢复、clear、预检、整本恢复和 failure injection 结果。
7. 定向测试、全量测试、typecheck、lint、production build、whitespace、残留扫描的命令、退出码和数量。
8. 开发侧真实 Chrome、系统 picker、宿主 V2 文件、raw IndexedDB、视口、console 和文件 / 备份 hash 证据。
9. 任何偏离、未完成项、环境限制、Finding、已接受浏览器上限和停止原因。
10. 明确没有执行 02C、没有生成 02D、没有回写 00B / 00D / 当前状态、没有进入 03、没有修改 `CS2026`。

02B 不得写“FEE-001～003 已最终完成”。开发侧最多写“已形成待独立审查候选”。

## 十六、开发侧 PASS / FAIL / BLOCKED 与停止条件

| 结论 | 开发侧定义 |
| --- | --- |
| `PASS` | `FEE-001～003` 与 `F02-M01～M30` 全部实现；正式测试、全部质量门和开发侧真实 Chrome 强制流程完整；无强制失败、关键证据缺口或越界修改 |
| `FAIL` | 已有证据证明任一版本、存储、旧格式零写、FeeRule、历史稳定、页面成功真实性、PNL / mapping 回归或正式质量门违反强制合同 |
| `BLOCKED` | 没有强制反证，但错误分支、重叠用户改动、候选漂移、真实 Chrome / picker /系统权限不可用或其他外部条件使关键证据无法取得 |

已有强制反证时优先 `FAIL`，不能因同时缺浏览器证据改写成 `BLOCKED`。

立即停止扩大实现并转入 02B 的条件：

- 路径 / 轨道错误，或会覆盖用户改动；
- 发现 00A～00D 与实时目标不可调和；
- 只能通过兼容读取 / 迁移 / 删除 V1、把完整账本写回 IndexedDB、猜测规则、多匹配选第一个、原地改规则或历史重算才能继续；
- 只能降低 current / previous、identity / revision、close-readback、ResourcePolicy 或密码学合同才能收口；
- 必须删除 / skip 安全测试、放宽精确金额、把失败文案改成成功或用 mock 代替真实保存链；
- 出现 P0、数据安全类 P1 或当前批强制项反证。

## 十七、明确排除项

本批禁止：

- NLP、Ollama、Python、Agent、Prompt、RAG、语音、图片或账本问答；
- `03～07` 批次、比赛材料、课程 Notebook、公平评估或视频；
- 交易编辑 / 删除功能扩张、账户体系、交易所 API 下单或同步；
- 历史 K 线、轮询、WebSocket、实时 USD / USDT 汇率；
- 桌面端、移动端、iCloud、CloudKit、Keychain、Touch ID、Face ID；
- 论文、`CS2026`、benchmark 或复制两条长期分支；
- 真实个人账本和真实个人交易；
- 自动迁移、自动删除或兼容读取三类旧整账；
- 无关 UI 重构、动画、美化、主题、依赖升级或格式化全仓。

## 十八、两个 Git 仓库的交付边界

| 仓库 | 未来执行任务允许的内容变化 | 必须分别报告 |
| --- | --- | --- |
| 根文档仓库 `main` | 只新增 02B，并保留执行前已有用户变化 | branch、HEAD、ahead / behind、02B、其他原有变化、staged / unstaged / untracked、commit / push |
| 产品源码仓库 | 本文职责内实现与正式测试；实际工作分支必须由执行任务授权 | branch、HEAD、基线、完整 diff、测试、candidate hash、commit / push / upstream |
| `LocalFirstTradingLedger-CS2026/` | 零读取扩展、零修改 | 明确未进入；不得用旧快照冒充实时检查 |

不得把根文档与源码变更混成一个提交或一条 status。本文不授权任何 Git 写操作。

## 十九、开发完成自检

- [ ] 第一屏先说明普通用户的 V2 + 规则 + 预览 + 认证保存流程。
- [ ] 当前 V1 / 未接线 FeeRule 事实与目标 V2 设计分开书写。
- [ ] `FEE-001～003` 和 `F02-M01～M30` 全部有实现与永久正式测试。
- [ ] LedgerData、`.lftl` 和 backup 的版本 2 合同一致；crypto 参数未偷换。
- [ ] 三类旧整账明确拒绝、零写入、不迁移、不自动删除。
- [ ] raw IndexedDB 活跃路径只有最小 connection record。
- [ ] fixed、percentage、精确匹配、无匹配、多匹配、版本更新、停用均有证据。
- [ ] 候选可修改；实际 Trade.fee 是历史事实；规则变化不重算旧 Trade。
- [ ] 页面成功绑定本次 save readback，不在 reducer 接受后提前成功。
- [ ] 新建、打开、重连、恢复、clear、备份、预检、整本恢复和失败注入完整。
- [ ] PNL 固定样例、零费、多买、部分 / 全部卖出、缺价、异币费不退化。
- [ ] absent / null / explicit Binance mapping 与派生不保存永久回归通过。
- [ ] 定向、全量、typecheck、lint、build、whitespace、残留扫描和真实 Chrome 开发侧流程有完整结果。
- [ ] 只生成 02B；不执行 02C，不生成 02D，不回写 00B / 00D / 当前状态，不进入 03。
- [ ] 两个仓库分别冻结、分别报告；Git 动作严格等于当时授权。

本文、02B 或开发侧 PASS 均不能把 `FEE-001～003` 写成最终完成，也不能关闭 `W12-EVID-001`。只有 `02D_W12-main-版本2与手续费规则独立审查报告.md = PASS`，后续协调任务才可以决定回写与进入 03。
