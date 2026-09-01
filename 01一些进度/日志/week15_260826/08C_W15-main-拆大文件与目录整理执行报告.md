# 08C_W15-main｜拆大文件与目录整理执行报告

## 结论

08 阶段在 `zhennn/w15-main-app-split` 完成 4 笔纯重构提交，缝为 `ffbe0ff470132efcab2d3651dd446837426d4b33`。所有已提交变更只位于 `src/app/`；测试、hook 调用序列、`@/app` 出口、四个版本号、依赖与构建产物的 First Load JS 均保持不变。目录整理未执行：新文件仍是其父文件的直接邻居，现有物理结构尚无足以抵消相对引用变更风险的稳定分组。

## 第一节：第零步只读调查

### I-1 行数

命令：`find src/app -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | xargs -0 wc -l | sort -nr`

原始输出（节选为完整的 600 行以上集合，合计行数也由同一命令得出）：

```text
24070 total
2853 src/app/usePersistentLedger.test.tsx
2298 src/app/DashboardShell.interaction.test.tsx
1963 src/app/usePersistentLedger.ts
1922 src/app/LedgerAccessGate.test.tsx
1905 src/app/ledgerFileAccessController.test.ts
1575 src/app/DashboardShell.tsx
1276 src/app/LedgerAccessGate.tsx
1271 src/app/usePersistentLedger.fileCapabilities.test.tsx
1172 src/app/ledgerFileAccessController.ts
1149 src/app/usePersistentLedger.fileImport.test.tsx
792 src/app/TransactionsWorkspace.tsx
699 src/app/TransactionsWorkspace.test.tsx
```

### I-2～I-5 顶层声明、巨型主体与测试关注点

命令：`rg -n '^(export )?(async )?(function|class|const|let|var|interface|type) ' <file>`；组件／hook 另以 `rg -n '\buse(State|Effect|Ref|Memo|Callback)\('` 核对。

原始声明输出的关键边界：

```text
DashboardShell.tsx:64 const LEGACY_CLEAR_LEDGER_CONFIRMATION_TEXT
DashboardShell.tsx:67 type ClearConfirmationMode
DashboardShell.tsx:69 function shortLedgerId
DashboardShell.tsx:73 function getWorkspaceFileStatus
DashboardShell.tsx:112 function Section
DashboardShell.tsx:131 function SummaryMetricCard
DashboardShell.tsx:163 export function DashboardShell
DashboardShell.tsx:1561 function useWriteCycleDashboardDerivations

LedgerAccessGate.tsx:38 type AccessState
LedgerAccessGate.tsx:48 type AccessPath
LedgerAccessGate.tsx:57 type PendingSessionCompletion
LedgerAccessGate.tsx:64 const pendingSessionCompletions
LedgerAccessGate.tsx:69 export function LedgerAccessGate
LedgerAccessGate.tsx:1043 function AccessPanel
LedgerAccessGate.tsx:1068 function PasswordField
LedgerAccessGate.tsx:1204 function FormError

ledgerFileAccessController.ts:33 export const LEDGER_FILE_ACCESS_ERROR_CODES
ledgerFileAccessController.ts:62 export type LedgerFileAccessErrorCode
ledgerFileAccessController.ts:65 export type LedgerFileAccessSessionResult
ledgerFileAccessController.ts:109 type PendingSelection
ledgerFileAccessController.ts:138 class LedgerFileConnectionCommitError
ledgerFileAccessController.ts:145 export class DefaultLedgerFileAccessController
ledgerFileAccessController.ts:995 function staleOperationResult

usePersistentLedger.ts:62 export type PersistentLedgerState
usePersistentLedger.ts:105 export type LedgerSessionFatalSignal
usePersistentLedger.ts:149 const INITIAL_PERSISTENCE_VERSION_STATE
usePersistentLedger.ts:180 export function usePersistentLedger
usePersistentLedger.ts:1854 function invokeRepositorySave
```

最大的主体及其外部部分：`usePersistentLedger` 为 180–1853，外部为类型／常量及 1854 行后的纯 helper；`DashboardShell` 为 163–1560，外部为 64–161 的常量、纯函数和小组件及 1561 行后的 hook；`LedgerAccessGate` 的大组件为 69–1041，外部为类型／弱表和 1043 行后的辅助组件／函数；`DefaultLedgerFileAccessController` 为 145–994，外部为类型、常量和 995 行后的 helper。

测试顶层 `describe` 原始输出：

```text
DashboardShell.interaction.test.tsx: 395 persistent workspace navigation; 544 immediate lock decision B; 746 trade interactions; 1374 future fact correction; 1662 data management (38 tests)
LedgerAccessGate.test.tsx: 331 LedgerAccessGate (30 tests)
ledgerFileAccessController.test.ts: 354 DefaultLedgerFileAccessController (38 tests)
usePersistentLedger.test.tsx: 209 hydration safety; 1013 dirty lifecycle; 1293 backup import; 1816 clear sequencing; 2045 clear recovery and lifecycle (57 tests)
usePersistentLedger.fileCapabilities.test.tsx: 218 file session capabilities (13 tests)
usePersistentLedger.fileImport.test.tsx: 283 ready C import (15 tests)
TransactionsWorkspace.test.tsx: 116 filters and intent; 313 delayed deletion; 623 unified cash activity (13 tests)
```

`DashboardShell` 的可抽取 JSX 为原 112–129 `Section` 与 131–161 `SummaryMetricCard`；`LedgerAccessGate` 的 `AccessPanel`、`FormError` 可抽，但本轮不扩大到该文件。`PasswordField` 含 `useId/useRef/useState/useEffect`，不符合展示组件条件。

### I-6 用例全集

命令：`npx vitest list --json /private/tmp/lftl-08-baseline-tests.json`，再按 `name` 排序。

```text
test names: 1185
```

临时全集未提交；收尾 `diff -u` 无输出。

### I-7 hook 基线

命令：`rg -n '\buse(State|Effect|Ref|Memo|Callback)\(' <four files>`。

原始序列（按出现顺序）：

```text
usePersistentLedger.ts: useState,useState,useState,useRef,useRef,useRef,useRef,useRef,useRef,useRef,useRef,useRef,useCallback,useMemo,useMemo,useCallback,useCallback,useCallback,useEffect,useEffect,useEffect,useEffect,useEffect,useEffect,useCallback,useCallback,useCallback,useCallback,useCallback,useCallback,useCallback,useCallback
DashboardShell.tsx: useState,useState,useState,useState,useState,useState,useState,useState,useRef,useRef,useRef,useEffect,useEffect,useEffect,useEffect,useEffect,useEffect,useEffect
LedgerAccessGate.tsx: useState,useState,useState,useState,useRef,useRef,useRef,useCallback,useEffect,useState,useEffect,useEffect
ledgerFileAccessController.ts: (none)
```

### I-8 路由探针

临时创建 `src/app/_routeProbe/page.tsx` 后执行 `npm run build`，Route 原始输出为：

```text
┌ ○ /                                     364 kB         467 kB
└ ○ /_not-found                            993 B         103 kB
```

没有 `/_routeProbe`。删除临时目录后第二次 build 的 Route 输出完全相同，`git status --short` 为空。因此下划线前缀验证通过；第四步仍按实际结构判断不分目录。

## 第二节：步骤与提交

| 步骤 | SHA | 内容 |
| --- | --- | --- |
| 二 | `8b21b1f` | `DashboardShellTypes.ts`，迁出 `ClearConfirmationMode` |
| 二 | `b602524` | `DashboardShellHelpers.ts`，迁出常量、`shortLedgerId`、`getWorkspaceFileStatus` |
| 三 | `00f2c58` | `Section.tsx`，纯展示组件 |
| 三 | `ffbe0ff` | `SummaryMetricCard.tsx`，纯展示组件；此 SHA 为缝 |

每笔提交前都运行 `npm test`；每次输出均为 `Test Files 106 passed (106)`、`Tests 1185 passed (1185)`。

## 第三节：新文件清单

| 文件 | 来源 | 行数 |
| --- | --- | ---: |
| `DashboardShellTypes.ts` | `DashboardShell.tsx:67` | 1 |
| `DashboardShellHelpers.ts` | `DashboardShell.tsx:64–110` | 47 |
| `Section.tsx` | `DashboardShell.tsx:112–129` | 20 |
| `SummaryMetricCard.tsx` | `DashboardShell.tsx:131–161` | 34 |

## 第四节：行数对照

`DashboardShell.tsx`：1575 → 1462；其余 600 行以上原文件未改。两项展示文件的 hook 检查原始输出：

```text
src/app/Section.tsx:0
src/app/SummaryMetricCard.tsx:0
```

## 第五节：Q-1～Q-10

```text
derived snapshot: Test Files 1 passed (1); Tests 7 passed (7)
source layout: Test Files 1 passed (1); Tests 7 passed (7)
npm test: Test Files 106 passed (106); Tests 1185 passed (1185)
typecheck: tsc --noEmit (exit 0)
lint: eslint . --max-warnings=0 (exit 0)
build: / 364 kB, First Load JS 467 kB
git diff --check: (empty)
git diff origin/main...HEAD --check: (empty)
package/lock diff: (empty)
```

版本权威定义复核：`ledgerFileContract.ts` 的 schema 为 4，`backupEnvelope.ts:20` 的 `BACKUP_FORMAT_VERSION` 为 3，当前写出容器为 `ledgerFileChunkedContainerV3.ts:24-25` 的 file 3、crypto 1；均未改。外部 `@/app` 引用仍为 11 处，且全为 `from "@/app"`，无深层路径。`src/app/index.ts` 三个 export 声明未改。

## 第六节：hook 对照

第一节 I-7 的四条类型序列与收尾重新导出的四条序列逐项相同；没有移动 `useState/useEffect/useRef/useMemo/useCallback`。

## 第七节：跳过清单

一档：`usePersistentLedger.ts` 巨型 hook；`DashboardShell.tsx:1561` 的 hook；`LedgerAccessGate.tsx:1068` 的 `PasswordField`。均含 hook，归属 10 批。

二档：7 个 600 行以上测试文件均未拆。虽可见 describe 分组，但共享 jsdom lifecycle、mock、fixture 与 helper；在本轮未能证明逐字搬运后仍不复制 helper 且不改变全名，故按文件跳过，建议后续专项测试重构批处理。第四步目录整理未执行，原因见结论。

## 第八节：否定性声明

未改测试断言、阈值或用例名；未移动 hook；未使用 memo；未新增包裹 DOM；未改 `src/app/` 外文件；未改结构守卫；未改 `src/app/index.ts` 导出集合；未引入依赖；未 push/rebase/amend；未读取真实数据区。
