# Week 7：持久化 Gate 收口与 Week 8 衔接执行计划

日期：2026-07-18

状态：待执行、待用户审查

读者：负责修改 `LocalFirstTradingLedger` 源码的 AI Agent

> 原 Week 7 每日清单保留为路线基线；当前实施以源码事实和本 `01A` 为准。不要重写已完成的持久化地基。

## 1. 结论

Week 7 只关闭存储 Gate：补齐产品级 clear、消除 clear 与自动保存的竞争、完成刷新与 IndexedDB 人工验收。Gate 全绿后，才允许追加 Week 8 的纯 backup envelope 与解析校验地基。

执行顺序：

```text
复验当前基线
-> 实现互斥 clear
-> 补 clear / 失败 / 重挂载测试
-> 真实浏览器刷新与 envelope 验收
-> Week 7 Go / No-Go
-> Go 后可追加 Week 8 纯备份契约
```

## 2. 当前源码事实

| 能力 | 状态 | 执行要求 |
| --- | --- | --- |
| `StorageAdapter.read/write/clear` | 已完成 | 不重写 |
| 原生 IndexedDB whole-blob | 已完成 | 仅在测试证明缺陷时修改 |
| `LedgerRepository.load/save/clear` | 已完成 | 保持上层唯一持久化入口 |
| `NoopEncryptionService` 与唯一组装点 | 已完成 | Week 7 不切 WebCrypto |
| 安全 hydration | 已完成 | `ledger/replace` 真正进入 reducer 后才 `ready` |
| ready 后串行自动保存 | 已完成 | clear 必须复用同一顺序边界 |
| 交易与价格重挂载恢复 | 已自动化证明 | 补删除与 clear 闭环 |
| 页面 clear 入口 | 未实现 | 本次新增 |
| 真实浏览器刷新、clear、envelope | 未验收 | 本次 Gate |
| Week 8 导入导出 | 未实现 | Gate Go 前禁止开始 |

2026-07-18 基线：19 个测试文件、154 项测试通过；lint、production build 通过；源码与文档仓库均从干净 `main` 开始。

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
src/adapters/indexedDbStorageAdapter.ts
src/composition/ledgerRepositoryComposition.ts
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/DashboardShell.interaction.test.tsx
```

## 4. Week 7 源码任务

### 4.1 在持久化 Hook 暴露 clear 操作

在 `usePersistentLedger` 返回值增加：

```ts
clearLedger(): Promise<ClearLedgerResult>
isClearing: boolean

type ClearLedgerResult =
  | { ok: true }
  | { ok: false; code: "CLEAR_FAILED" };
```

必须满足：

1. clear 开始时先用 ref 同步锁住新的 dispatch，再用 `isClearing` 驱动页面禁用状态。
2. clear 进入现有 `writeQueueRef` 顺序边界，等待已经排队的 save 全部 settled 后再调用 `repository.clear()`；不得另建无序 Promise 链。
3. `repository.clear()` 成功后创建新的 `createInitialLedgerData()`，先同步持久化快照 refs，再用 `ledger/replace` 替换页面状态。
4. clear 成功后不得由自动保存立即重建 `ledger:v1`；Repository 再次 `load()` 必须返回 `null`。
5. clear 失败时保留当前页面和最后成功存储，不 dispatch reset/replace，并通过 `persistenceError` 暴露稳定中文错误。
6. clear 完成后解除互斥；成功提示由 Dashboard 的本地 UI 状态管理，不写入 `LedgerData`。

禁止直接执行：

```text
repository.clear()
-> dispatch({ type: "ledger/reset" })
```

该写法没有处理排队写入、操作互斥和 reset 后自动回写。

### 4.2 增加最小数据管理 UI

在 `DashboardShell` 增加“数据管理”区域：

- 统一使用 `isWritable = hydrationStatus === "ready" && !isClearing` 控制可写操作。
- 提供“清空账本”入口和组件内二次确认。
- 明确提示：清除本浏览器中的交易与价格，恢复 BTC / ETH / ADA 初始资产；当前操作不可撤销。
- `loading / error / clearing` 时禁用确认按钮、交易表单、价格表单和删除操作。
- 成功后交易与持仓进入空状态，表单资产恢复内置资产；显示“账本已清空”。
- 取消确认不调用 Repository；失败时保持页面数据并显示存储错误。

页面只调用 `clearLedger()`，不得直接调用 `repository.clear()`、IndexedDB API 或 reducer。

### 4.3 自动化测试矩阵

优先修改：

```text
src/hooks/usePersistentLedger.test.tsx
src/components/dashboard/DashboardShell.interaction.test.tsx
```

必须新增：

| 测试 | 通过线 |
| --- | --- |
| clear 成功 | Repository clear 一次；state 回到初始账本；clear 后无额外 save |
| clear 等待排队写 | deferred save 未完成时不 clear；save 完成后才 clear；最终 `load() === null` |
| clear 期间写保护 | 交易、价格、删除 dispatch 不进入 reducer |
| clear 失败 | 原 state 不变；最后成功数据不变；显示 `CLEAR_FAILED` 对应错误 |
| 取消确认 | 不调用 clear；页面不变 |
| fake IndexedDB 重挂载 | 新增交易与价格 -> 重挂载恢复 -> 删除后重挂载 -> clear -> 再重挂载为空 |

保留并复验现有测试：hydration 前禁写、空库不自动保存、连续写串行、save 失败保留页面、load 失败进入 error 且不写。

## 5. 真实浏览器 Gate

使用 production build、独立端口和隔离浏览器环境；不得删除默认 `http://localhost:3000` 下的用户数据。

固定流程：

1. 在隔离环境录入一笔 BTC 买入，刷新，核对交易、数量和成本。
2. 录入 BTC 价格，刷新，核对最新价格、市值和未实现盈亏。
3. 新增可安全删除的交易，删除后刷新，确认交易与持仓未复活。
4. 执行 clear，确认页面立即恢复初始空账本；刷新后仍为空。
5. DevTools 检查：
   - database：`local-first-trading-ledger`
   - store：`ledger`
   - key：`ledger:v1`
   - 保存时：`formatVersion === 1`
   - Noop 阶段：`encryptedPayload` 是可读 JSON 字符串
   - payload 含完整 `LedgerData`，不含 `Position[]`
   - clear 后：`ledger:v1` 不存在
6. 控制台不得出现未处理异常或 React warning。

load/save/clear 失败使用可注入 `LedgerRepository` 的 Hook/组件集成测试完成；不得为了人工制造失败加入生产 debug 开关。

## 6. Week 8 条件衔接

仅当 Week 7 Gate 全绿且仍有执行额度时，允许新增纯函数地基：

```text
src/backup/backupEnvelope.ts
src/backup/backupEnvelope.test.ts
```

最小范围：

- 定义独立的 `BackupEnvelopeV1`；不要复用 IndexedDB 的 `StoredLedgerEnvelope`。
- 提供纯 `create/serialize/parse` 能力；动态时间通过参数注入。
- parser 接收 `unknown`，拒绝坏 JSON、未知 backup 版本，并复用 `validateLedgerData` 校验完整 payload。
- 返回结构化结果；校验失败零写入。
- 不接 Blob 下载、文件选择、Repository replace 或导入 UI；这些留给 Week 8 正式任务。

Week 9 只保留兼容边界：不改 `EncryptionService` 上层依赖，不实现 PBKDF2/AES-GCM，不把 backup envelope、IndexedDB envelope 和未来 crypto envelope 混为同一类型。

## 7. 允许修改与禁止范围

默认允许：

```text
src/hooks/usePersistentLedger.ts
src/hooks/usePersistentLedger.test.tsx
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/DashboardShell.interaction.test.tsx
src/backup/*（仅 Week 7 Go 后）
README.md
Week 7 状态、Checklist、验收记录和周日志
```

默认禁止：

- 重写 Adapter、Repository、Noop、Calculator、Validator 或现有业务 Service。
- 修改 `LedgerData` schema、Decimal/盈亏/手续费口径。
- 使用 localStorage、保存 `Position[]`、拆成多表或 per-entity 存储。
- 提前做导入导出 UI、真加密、图表、排序、分页、性能优化。
- 新增生产依赖、执行 `npm audit fix --force`。

若测试证明必须越过默认范围，先记录失败证据、目标文件和最小改动理由，再请求用户确认。

## 8. 验证与收口

源码仓库执行：

```bash
npm test
npm run lint
npm run build
git diff --check
```

再检查：

```text
IndexedDB API 只位于 Adapter
页面不直接调用 Repository clear
clear 与 save 使用同一顺序边界
clear 失败不改变 state 或旧存储
clear 成功后 record 不被空账本自动重建
Position[] 不进入 state、Repository 或 backup
生产代码不导入 test fixtures
```

以下全部通过才可写 `Week 7 Storage Gate: Go`：

- 新增、价格、删除刷新恢复通过。
- clear 成功、失败、竞争和刷新行为通过。
- IndexedDB envelope 与 clear 后 record 状态符合第 5 节。
- 现有及新增 test、lint、build、diff-check 全绿。
- 没有越界进入 Week 9+。

任一失败则 No-Go，Week 8 代码不得开始。收口时同步 Week 7 两份 `00`、新增 `01B_W7-持久化Gate验收记录.md`、当前开发状态、总路线图和源码 README；文档仓库与源码仓库分开处理，未经授权不推送、合并或删除分支。

最终汇报只写：Gate 结论、源码改动、自动化结果、浏览器六项证据、双仓库状态、Week 8 是否获准进入。
