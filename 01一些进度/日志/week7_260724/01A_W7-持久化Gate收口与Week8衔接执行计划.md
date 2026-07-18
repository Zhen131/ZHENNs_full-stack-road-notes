# Week 7：持久化 Gate 收口与 Week 8 衔接执行计划

日期：2026-07-18

版本：v2（风险审查修订版）

状态：待执行

读者：负责修改 `LocalFirstTradingLedger` 源码的 AI Agent

> 原 Week 7 每日清单保留为路线基线；当前实施以源码事实和本 `01A` 为准。不要重写已完成的持久化地基。

## 1. 结论

Week 7 只关闭 Storage Gate：实现安全 clear、完成固定数据的刷新恢复、核对 IndexedDB envelope，并用确定性故障注入证明 load/save/clear 失败不会破坏旧数据。

执行顺序：

```text
复验基线
-> 锁定 clear 语义与操作状态
-> 实现 clear 与错误态恢复
-> 完成并发、失败、重挂载测试
-> 固定数据生产浏览器验收
-> 复核全部 Gate 证据
-> 记录 Week 7 Go / No-Go 和源码 hash
-> 条件满足后单独处理 Week 8 衔接
```

Week 7 未 Go 前禁止开始 Week 8；Week 8 衔接不得混入 Week 7 Gate 提交或复用旧验证结果。

## 2. 当前源码事实

| 能力 | 状态 | 执行要求 |
| --- | --- | --- |
| `StorageAdapter.read/write/clear` | 已完成 | 不重写 |
| 原生 IndexedDB whole-blob | 已完成 | 仅在失败测试证明缺陷时修改 |
| `LedgerRepository.load/save/clear` | 已完成 | 保持上层唯一持久化入口 |
| `NoopEncryptionService` 与唯一组装点 | 已完成 | Week 7 不切 WebCrypto |
| 安全 hydration | 已完成 | `ledger/replace` 进入 reducer 后才 `ready` |
| ready 后串行自动保存 | 已完成 | clear 必须进入同一顺序边界 |
| 交易与价格重挂载恢复 | 已自动化证明 | 补删除、clear 和错误恢复 |
| 页面 clear 入口 | 未实现 | 本次新增 |
| 真实浏览器刷新、clear、envelope | 未验收 | 本次 Gate |
| Week 8 导入导出 | 未实现 | Week 7 Go 前禁止开始 |

2026-07-18 基线：19 个测试文件、154 项测试通过；lint、production build 通过；源码与文档仓库均从干净工作树开始。

## 3. 必读入口

按顺序读取，不扫描外部参考项目：

```text
01一些进度/日志/00-当前开发状态.md
01一些进度/日志/week7_260724/00-Week7每日执行清单.md
01一些进度/日志/week7_260724/00-Week7-Checklist.md
01一些进度/日志/week8_260731/00-Week8每日执行清单.md
01一些进度/产出/LocalFirstTradingLedger/README.md
src/hooks/usePersistentLedger.ts
src/hooks/usePersistentLedger.test.tsx
src/repositories/ledgerRepository.ts
src/repositories/ledgerRepository.test.ts
src/adapters/indexedDbStorageAdapter.ts
src/adapters/indexedDbStorageAdapter.test.ts
src/composition/ledgerRepositoryComposition.ts
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/DashboardShell.test.ts
src/components/dashboard/DashboardShell.interaction.test.tsx
src/state/initialLedgerData.ts
```

## 4. Gate 证据契约

“失败场景人工 Gate”按以下两层证据执行，不得只完成其中一层：

| 层级 | 范围 | 通过线 |
| --- | --- | --- |
| 生产浏览器人工验收 | 新增、价格、删除、clear、刷新、DevTools envelope、控制台 | 使用第 8 节固定数据，逐项记录实际值 |
| 确定性故障注入 | load/save/clear 失败、排队写入、重挂载、错误恢复 | Hook/组件/真实组装链测试全部通过，并人工审阅断言和错误 UI |

不得在生产代码增加 debug 开关、故障按钮或只用于验收的依赖。`01B` 必须分别记录两层证据；只有单元测试通过或只有浏览器成功路径通过都不能宣布 Go。

## 5. clear 的产品语义

clear 删除当前浏览器 origin 下的完整账本记录，包括：

```text
assets
trades
priceSnapshots
feeRules
schemaVersion 对应的整账 payload
```

`Position[]` 是派生数据，不在存储中。clear 成功后页面使用新的 `createInitialLedgerData()`：保留全新的 BTC / ETH / ADA 内置资产，交易、价格和手续费规则为空；IndexedDB 的 `ledger:v1` 必须不存在。

### 5.1 正常 clear

- 只在 `hydrationStatus === "ready"` 时允许进入确认流程。
- 采用组件内二段确认，并要求输入固定文本 `清空本地账本`。
- 警告必须明确：自定义资产、交易、价格、手续费规则全部删除；Week 8 备份尚未实现，当前不可恢复。
- 取消、输入不匹配或 clear 失败时不改变页面和旧存储。

### 5.2 读取错误后的恢复 clear

- `hydrationStatus === "error"` 时禁止交易、价格和删除，但必须提供独立的“清除损坏或无法读取的本地数据”入口。
- 恢复入口使用同一固定确认文本，并额外警告：读取失败可能是暂时性错误，继续将删除仍可能可恢复的本地记录。
- 恢复 clear 成功后进入新的初始账本，将 hydration 切为 `ready`，清除旧 persistence error。
- 恢复 clear 失败时保持 `error`，不伪装为已恢复。
- `loading` 状态绝不允许 clear。

## 6. clear 的持久化操作契约

不要新增第二套错误码。失败结果复用既有：

```ts
LEDGER_REPOSITORY_ERROR_CODES.CLEAR_FAILED
```

Hook 对外最小接口：

```ts
type PersistenceOperation = "idle" | "clearing";

type ClearLedgerResult =
  | { ok: true }
  | {
      ok: false;
      code: typeof LEDGER_REPOSITORY_ERROR_CODES.CLEAR_FAILED;
    };

clearLedger(): Promise<ClearLedgerResult>;
persistenceOperation: PersistenceOperation;
```

使用通用 `persistenceOperation`，不要只暴露 `isClearing`；Week 8 原子 replace 可扩展为 `"replacing"`，不得再造平行互斥状态。

### 6.1 强制顺序

1. `clearLedger()` 先用 operation ref 同步抢占 `idle -> clearing`，再更新 React operation state。
2. 同步锁必须同时约束公共 dispatch、自动保存 effect 和重复 clear；只禁用按钮不算通过。
3. 重复 clear 共享当前 clear Promise，`repository.clear()` 最多调用一次。
4. 捕获当前 repository 与 operation token；clear 加入现有 `writeQueueRef`，等待此前 save resolve/reject 后再执行。
5. 队列中的旧 save 失败不得阻断 clear，但失败证据仍需保留到 clear 结果明确。
6. `repository.clear()` 成功后创建新的初始账本，先同步 snapshot refs，再 `ledger/replace` 并清除 persistence error；自动保存不得重新创建空 envelope。
7. 成功后 `repository.load()` 返回 `null`；第一次新的用户写入后才重新生成 `ledger:v1`。
8. clear 失败时不 replace/reset，不改变旧存储，错误映射为既有 `CLEAR_FAILED`。
9. `finally` 只允许当前 operation token 解锁，防止旧异步结果解锁新操作。

### 6.2 生命周期保护

- 自动保存 effect 在 operation 非 `idle` 时不得排新 save；operation 回到 `idle` 后必须保持可继续保存。
- clear 完成时若组件已卸载，仍允许存储操作结束，但不得 set state。
- clear 完成时若 repository 已切换，不得用旧 repository 的结果替换新页面状态或清除新错误。
- 捕获和比较当前 repository 身份；不得只依赖闭包中的旧实例。
- clear 进行期间所有表单、删除和再次 clear 均禁用，并显示明确 busy 状态。

禁止直接执行：

```text
repository.clear()
-> dispatch({ type: "ledger/reset" })
```

该写法没有处理排队写入、自动保存、重复操作、repository 切换和错误恢复。

## 7. UI 与自动化测试

### 7.1 数据管理 UI

在 `DashboardShell` 增加“数据管理”区域：

- `isWritable = hydrationStatus === "ready" && persistenceOperation === "idle"`。
- ready 状态显示正常 clear；error 状态显示恢复 clear；loading 状态不显示可执行 clear。
- 正常和恢复 clear 都使用固定确认文本，不使用单次 `window.confirm`。
- 成功后显示“账本已清空”；失败只显示错误，不显示成功。
- 页面只调用 `clearLedger()`，不得直接调用 Repository、IndexedDB API 或 reducer。

### 7.2 必须新增的测试

优先修改：

```text
src/hooks/usePersistentLedger.test.tsx
src/components/dashboard/DashboardShell.test.ts
src/components/dashboard/DashboardShell.interaction.test.tsx
```

| 测试 | 通过线 |
| --- | --- |
| 正常 clear 成功 | Repository clear 一次；state 为新初始账本；`load() === null`；无额外 save |
| 完整删除范围 | 自定义 assets、trades、priceSnapshots、feeRules 全部消失，内置资产恢复 |
| clear 等待排队写 | deferred save 未 settled 时不 clear；settled 后才 clear |
| 前置 save 失败后 clear | 队列可继续；clear 结果独立；最终存储状态明确 |
| clear 期间写保护 | dispatch 和自动保存 effect 都不排新写 |
| 重复 clear | 两次调用共享一次操作；Repository clear 只调用一次 |
| clear 失败 | 原 state、旧存储不变；只显示既有 clear error |
| 取消或确认文本错误 | 不调用 clear；页面和存储不变 |
| load 失败 | 进入 error；表单禁用；不自动保存 |
| error 状态恢复 clear | 成功后 ready + 初始账本；失败继续 error |
| repository 切换 | 旧 clear 结果不污染新 repository 页面 |
| clear 中卸载 | 存储 Promise 可结束；无卸载后 state 更新 |
| fake IndexedDB 重挂载 | 新增与价格恢复 -> 删除恢复 -> clear -> 再挂载为空 |

保留并复验现有测试：hydration 前禁写、空库不自动保存、连续写串行、save 失败保留页面、load 失败不写、真实组装链 round-trip。

## 8. 固定生产浏览器 Gate

使用 production build、独立端口、隔离浏览器环境和单一标签页；不得删除默认 `http://localhost:3000` 下的用户数据。验收前关闭同 origin 的其他标签页。

### 8.1 固定输入与预期

第一笔交易：

```text
日期：2026-07-14
类型：buy
资产：BTC
数量：0.001
成交均价：70000
总金额：70
手续费：0 USD
```

刷新后必须得到：

```text
交易数：1
BTC 数量：0.001
平均成本：70000 USD
剩余成本：70 USD
已实现盈亏：0 USD
```

价格：

```text
资产：BTC
当前价格：80000 USD
价格日期：2026-07-16
```

刷新后必须得到：

```text
BTC 市值：80 USD
BTC 未实现盈亏：10 USD
```

安全删除样例：

```text
日期：2026-07-15
类型：buy
资产：ETH
数量：0.005
成交均价：2000
总金额：10
手续费：0 USD
```

保存并刷新后交易数为 2；删除 ETH 买入再刷新，交易数必须为 1、ETH 持仓消失、BTC 数值保持不变。

### 8.2 envelope 与 clear

clear 前在 DevTools 核对：

```text
database = local-first-trading-ledger
store = ledger
key = ledger:v1
formatVersion = 1
```

Noop 阶段 `encryptedPayload` 是可读 JSON，必须包含完整 `LedgerData`，且 BTC 交易和价格与页面一致；不得包含 `Position[]`。

输入 `清空本地账本` 后确认 clear：

- 页面立即回到内置资产 + 空交易 + 空价格 + 空手续费规则。
- `ledger:v1` 不存在。
- 刷新后仍为空，且不会自动重建 record。
- 新增一笔交易后 record 才重新出现。
- 控制台无未处理异常和 React warning。

### 8.3 多标签页边界

Week 7 只保证单标签页内的顺序和数据安全。另一标签页可能在 clear 后重新写入旧状态；本周不实现 BroadcastChannel、跨标签页锁或冲突版本。`01B` 和 README 必须记录该限制，不得把 clear 描述为跨标签页原子操作。

## 9. Week 8 条件衔接

默认在 Week 7 Go 后停止。只有当前任务明确授权继续 Week 8，且以下条件全部满足，才允许追加纯备份契约：

1. Week 7 自动化、浏览器 Gate 和边界复审全绿。
2. `01B` 已记录 Week 7 Gate 对应源码 commit hash。
3. Week 7 源码与验收文档已单独提交。
4. Week 8 衔接使用独立提交；不得 amend 或混入 Week 7 Gate commit。
5. Week 8 变更后重新运行 test、lint、build、diff-check；不得沿用 Week 7 验证结果。

允许新增：

```text
src/backup/backupEnvelope.ts
src/backup/backupEnvelope.test.ts
```

### 9.1 固定 backup 契约

```ts
type BackupEnvelopeV1 = {
  backupFormatVersion: 1;
  appVersion: string;
  exportedAt: string;
  ledgerSchemaVersion: 1;
  ledgerData: LedgerData;
};
```

职责必须拆分：

```text
createBackupEnvelope(ledgerData, metadata)
-> 构造已知类型；metadata 注入 appVersion 和严格 ISO exportedAt

serializeBackupEnvelope(envelope)
-> 按固定顶层字段顺序输出 JSON；不改数组业务顺序

parseBackupJson(text)
-> 只处理 JSON 文本语法；坏 JSON 返回 BAD_JSON

validateBackupEnvelope(value: unknown)
-> 校验 backup/app/schema 版本和完整 ledgerData
-> 复用 validateLedgerData
-> 返回结构化错误，不读写 Repository
```

`backupFormatVersion` 和 `ledgerSchemaVersion` 是兼容性 Gate；`ledgerSchemaVersion` 必须等于 `ledgerData.schemaVersion`。`appVersion` 只作为非空来源元数据记录，不得因应用补丁版本不同直接拒绝合法备份。

一致性规则：相同 ledgerData 和相同 metadata 必须产生相同字节；真实二次导出允许 `exportedAt` 不同，验收比较规范化 `ledgerData` payload，不得错误要求整个文件字节相同。

本衔接不做 Blob 下载、文件选择、Repository replace、导入 UI 或真加密。backup envelope、IndexedDB `StoredLedgerEnvelope` 和未来 crypto envelope 必须是三种独立类型。

## 10. 允许修改与禁止范围

Week 7 默认允许：

```text
src/hooks/usePersistentLedger.ts
src/hooks/usePersistentLedger.test.tsx
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/DashboardShell.test.ts
src/components/dashboard/DashboardShell.interaction.test.tsx
README.md
Week 7 状态、Checklist、01B 验收记录和周日志
```

只有失败测试证明下层缺陷时，才允许最小修改 Adapter 或 Repository；必须在 `01B` 记录失败证据和修改理由。

默认禁止：

- 重写 Adapter、Repository、Noop、Calculator、Validator 或业务 Service。
- 修改 `LedgerData` schema、Decimal、盈亏或手续费口径。
- 使用 localStorage、保存 `Position[]`、拆多表或 per-entity 存储。
- Week 7 Gate 前做 backup、导入导出 UI、真加密、图表、排序、分页或性能优化。
- 新增生产依赖或执行 `npm audit fix --force`。

若必须越过默认范围，先记录失败证据、目标文件和最小理由，再请求用户确认。

## 11. Git、验证与收口

### 11.1 Git 边界

- 工作区根目录是文档仓库；`LocalFirstTradingLedger/` 是独立源码仓库。
- 开始和结束分别检查两个仓库的 status、diff、diff-check 和 `origin/main...main`。
- 未执行 fetch 时，ahead/behind 只能表述为“相对本地远端跟踪引用”；不得声称已核对服务器最新状态。
- 保留用户已有改动，不混合两个仓库的 staging、commit 或分支。
- 无相反指令时，源码使用 `zhennn/week7-storage-gate` 功能分支；提交备注使用中文。
- Week 7、Week 8 衔接和文档同步分开提交；未经授权不推送、合并或删除分支。

### 11.2 源码验证

```bash
npm test
npm run lint
npm run build
git diff --check
```

边界复审：

```text
IndexedDB API 只位于 Adapter
页面不直接调用 Repository clear
dispatch、save、clear 共享同一 operation/queue 边界
clear 失败不改变 state 或旧存储
clear 成功后 record 不被初始账本自动重建
error 状态存在受控恢复 clear
Position[] 不进入 state、Repository、IndexedDB 或 backup
生产代码不导入 test fixtures
单标签页限制已记录
```

### 11.3 Week 7 通过线

以下全部通过才可写 `Week 7 Storage Gate: Go`：

- 第 7 节全部自动化测试通过。
- 第 8 节固定数据的新增、价格、删除、刷新和 clear 通过。
- load/save/clear 故障注入的 UI、state、旧存储和恢复结果通过人工审阅。
- envelope 与 clear 后 record 状态符合契约。
- test、lint、build、diff-check 全绿。
- 多标签页和 Noop 明文限制已明确记录。
- `01B` 绑定实际源码 commit hash；没有用 Week 8 代码污染 Gate 证据。

任一失败则 No-Go，Week 8 禁止开始。收口时同步 Week 7 两份 `00`、新增 `01B_W7-持久化Gate验收记录.md`、当前开发状态、总路线图和源码 README。

最终只汇报：Gate 结论、源码改动、固定浏览器实际值、故障注入结果、test/lint/build、源码 hash、双仓库状态、Week 8 是否获准进入。
