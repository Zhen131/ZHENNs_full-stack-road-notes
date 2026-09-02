# 10C_W15-main｜切分巨型 Hook 执行报告

- 日期：2026-09-02
- 源码起点：`main@e6fadc9`
- 工作分支：`zhennn/w15-main-hook-split`
- 最终源码提交：`0858b7f`
- 结论：**12／12 块已完成。H-1／H-2／H-3、全部 10B 闸门通过；未 push、未合并，待独立 10D 验收。**

## Q-1｜I-1～I-4 只读复测

用 `node_modules/typescript` 的 `createSourceFile` 遍历 `usePersistentLedger` 顶层，未使用正则。

| 项目 | `e6fadc9` | 最终 HEAD |
| --- | ---: | ---: |
| 文件逻辑行数 | 1,763 | 844 |
| Hook 函数范围 | 91–1763 | 92–844 |
| 顶层 hook 总数 | 65 | 65 |
| useRef / useCallback / useState / useEffect / useMemo / useReducer / useLayoutEffect | 29 / 12 / 11 / 6 / 4 / 2 / 1 | 29 / 12 / 11 / 6 / 4 / 2 / 1 |

最终文件没有末尾换行，故 `wc -l` 为 843、AST 最后一逻辑行是 844；这是计数口径，非通过线。

12 个候选的原 `CallExpression` 跨度实测仍为 45、47、69、70、71、78、85、88、107、156、175、355 行，合计 1,346，与 10B 一致。外部标识符字段数以下表 AST 实测为准，不能抄 10B 的预设计数：

| 块 | 10B | AST 实测 |
| --- | ---: | ---: |
| stopForImportRecoveryFatal | 20 | 19 |
| registerAcceptedPersistence | 4 | 4 |
| applyLedgerMutation | 19 | 17 |
| runPersistenceTargetEffect | 17 | 15 |
| drainForSessionQuiesce | 13 | 13 |
| retryPersistence | 17 | 16 |
| runAutomaticPersistenceEffect | 15 | 15 |
| applyLedgerAction | 20 | 18 |
| runHydrationEffect | 35 | 34 |
| enqueuePersistence | 13 | 12 |
| clearLedger | 31 | 30 |
| replaceLedgerFromBackup | 37 | 36 |

字段名由最终具名 `Deps` type 输出，并与原闭包捕获字段逐块比对：

```text
fatal(19): acceptingOperationsRef, activePersistenceTargetRef, failedSnapshotRef, fatalOccurrenceRef, generationRef, hydratedRepositoryRef, importAbortControllerRef, latestScheduledSnapshotRef, mountedRef, pendingHydrationRef, persistenceVersionStateRef, publishPersistenceVersionState, readOnlyRef, retryAttemptRef, sessionFatalSignalRef, setIsReadOnly, setLifecycleStatus, setPersistenceError, setSessionFatalSignal
accepted(4): enqueuePersistence, generationRef, lastPersistedSnapshotRef, publishPersistenceVersionState
mutation(17): acceptingOperationsRef, activeRepository, activeSession, clock, failedSnapshotRef, hydratedRepositoryRef, hydrationStatus, ledgerDataRef, mountedRef, operationRef, persistenceVersionStateRef, readOnlyRef, reducerDispatch, registerAcceptedPersistence, retryAttemptRef, setPersistenceError, setResourcePolicyError
target effect(15): acceptingOperationsRef, activePersistenceTargetRef, currentRepositoryRef, importAbortControllerRef, importSessionRef, operationRef, operationRepositoryRef, persistenceVersionStateRef, repositorySwitchPermissionRef, requestedPersistenceRepository, requestedPersistenceTarget, requestedSession, sessionPersistenceBindingsRef, sessionPersistenceOwnerRef, setActivePersistenceTarget
quiesce(13): acceptingOperationsRef, activePersistenceTargetRef, clearPromiseRef, generationRef, hydrationPromisesRef, importAbortControllerRef, importPromiseRef, mountedRef, requestedSession, retryAttemptRef, sessionPersistenceBindingsRef, setLifecycleStatus, writeQueueRef
retry(16): acceptingOperationsRef, activeRepository, activeSession, enqueuePersistence, failedSnapshotRef, generationRef, hydratedRepositoryRef, hydrationStatus, ledgerDataRef, mountedRef, operationRef, persistenceVersionStateRef, publishPersistenceVersionState, readOnlyRef, retryAttemptRef, setPersistenceError
automatic(15): acceptingOperationsRef, activeRepository, activeSession, enqueuePersistence, failedSnapshotRef, generationRef, hydratedRepositoryRef, hydrationStatus, lastPersistedSnapshotRef, latestScheduledSnapshotRef, ledgerData, operationRef, persistenceVersionStateRef, publishPersistenceVersionState, readOnlyRef
action(18): acceptingOperationsRef, activeRepository, activeSession, clock, failedSnapshotRef, hydratedRepositoryRef, hydrationStatus, isFutureFactCorrectionMode, ledgerDataRef, mountedRef, operationRef, persistenceVersionStateRef, readOnlyRef, reducerDispatch, registerAcceptedPersistence, retryAttemptRef, setPersistenceError, setResourcePolicyError
hydration(34): acceptingOperationsRef, activePersistenceTarget, activePersistenceTargetRef, activeRepository, activeSession, clearPromiseRef, failedSnapshotRef, generationRef, hydratedRepositoryRef, hydrationErrorRepositoryRef, hydrationPromisesRef, importAbortControllerRef, importPromiseRef, lastPersistedSnapshotRef, latestScheduledSnapshotRef, ledgerDataRef, operationRef, operationRepositoryRef, operationTokenRef, pendingHydrationRef, publishPersistenceVersionState, readOnlyRef, reducerDispatch, retryAttemptRef, sessionFatalSignalRef, setHydrationStatus, setIsReadOnly, setLifecycleStatus, setPersistenceError, setPersistenceOperation, setResourcePolicyError, setSessionFatalSignal, trackSessionAcceptedWork, writeQueueRef
enqueue(12): currentRepositoryRef, failedSnapshotRef, generationRef, hydratedRepositoryRef, lastPersistedSnapshotRef, latestScheduledSnapshotRef, mountedRef, persistenceVersionStateRef, publishPersistenceVersionState, setPersistenceError, trackSessionAcceptedWork, writeQueueRef
clear(30): acceptingOperationsRef, activeCapabilities, activeRepository, activeSession, clearPromiseRef, currentRepositoryRef, failedSnapshotRef, generationRef, hydratedRepositoryRef, hydrationErrorRepositoryRef, hydrationStatus, lastPersistedSnapshotRef, latestScheduledSnapshotRef, ledgerDataRef, mountedRef, operationRef, operationRepositoryRef, operationTokenRef, pendingHydrationRef, publishPersistenceVersionState, readOnlyRef, reducerDispatch, retryAttemptRef, setHydrationStatus, setIsReadOnly, setLedgerEpoch, setPersistenceError, setPersistenceOperation, trackSessionAcceptedWork, writeQueueRef
import(36): acceptingOperationsRef, activeCapabilities, activeRepository, activeSession, clock, currentRepositoryRef, failedSnapshotRef, generationRef, hydratedRepositoryRef, hydrationErrorRepositoryRef, hydrationStatus, importAbortControllerRef, importPromiseRef, importSessionRef, lastPersistedSnapshotRef, latestScheduledSnapshotRef, ledgerDataRef, mountedRef, operationRef, operationRepositoryRef, operationTokenRef, pendingHydrationRef, persistenceVersionStateRef, publishPersistenceVersionState, readOnlyRef, reducerDispatch, retryAttemptRef, setHydrationStatus, setIsReadOnly, setLedgerEpoch, setPersistenceError, setPersistenceOperation, setResourcePolicyError, stopForImportRecoveryFatal, trackSessionAcceptedWork, writeQueueRef
```

## Q-2｜H-1：函数体逐语句比对

命令以 AST 读取 `git show e6fadc9:src/app/usePersistentLedger.ts`，比较原 callback/effect 的 `body.statements[].getText()` 与新模块 `FunctionDeclaration.body.statements.slice(1).getText()`。唯一排除的首语句是新增 `const { … } = deps;`。

结果：**12／12 通过，无未判定差异。** 每一差异都属于允许项：函数签名的 `deps`／具名 type、`export`、首条 deps 解构或函数所在文件；原函数体语句没有重命名、格式化或改动。

| 块 | 原 AST 语句数 | 提取函数 | 单块提交 |
| --- | ---: | --- | --- |
| stopForImportRecoveryFatal | 19 | doStopForImportRecoveryFatal | cae5a93 |
| registerAcceptedPersistence | 6 | doRegisterAcceptedPersistence | af6017c |
| applyLedgerMutation | 16 | doApplyLedgerMutation | 58d7a22 |
| runPersistenceTargetEffect | 10 | runPersistenceTargetEffect | 73f8ffc |
| drainForSessionQuiesce | 15 | doDrainForSessionQuiesce | 623e134 |
| retryPersistence | 16 | doRetryPersistence | 6e12c3a |
| runAutomaticPersistenceEffect | 15 | runAutomaticPersistenceEffect | 4cda253 |
| applyLedgerAction | 17 | doApplyLedgerAction | 2bccc12 |
| runHydrationEffect | 28 | runHydrationEffect | 85af412 |
| enqueuePersistence | 8 | doEnqueuePersistence | e21ef29 |
| clearLedger | 18 | doClearLedger | af0f283 |
| replaceLedgerFromBackup | 42 | doReplaceLedgerFromBackup | 747ca34 |

`0858b7f` 是 12 笔单块提交之后的收尾：删除搬运残留 import、修复一处空白、使 Clear／Import 显式传入与原依赖数组相同的 capability 字段，并为未搬运 cleanup 的“卸载时读取当前 controller”既有语义添加定点 lint 抑制。随后 H-1／H-2／H-3 全部重跑通过。

## Q-3｜H-2：依赖数组逐字符对照

AST 读取每个 hook 的第二参数 `getText()` 并作字符串相等比较。每项下的 `before === after` 是原始判定；内容按改前／改后两侧完全相同呈现。

```ts
// 1 stopForImportRecoveryFatal, before === after
[publishPersistenceVersionState]

// 2 registerAcceptedPersistence, before === after
[
      enqueuePersistence,
      publishPersistenceVersionState,
    ]

// 3 applyLedgerMutation, before === after
[
      activeRepository,
      activeSession,
      clock,
      hydrationStatus,
      registerAcceptedPersistence,
    ]

// 4 runPersistenceTargetEffect, before === after
[
    activePersistenceTarget,
    persistenceOperation,
    persistenceVersionState.mutationVersion,
    persistenceVersionState.persistedVersion,
    repositorySwitchRequestVersion,
    requestedPersistenceRepository,
    requestedPersistenceTarget,
    requestedSession,
  ]

// 5 drainForSessionQuiesce, before === after
[requestedSession]

// 6 retryPersistence, before === after
[
    enqueuePersistence,
    hydrationStatus,
    publishPersistenceVersionState,
    activeRepository,
    activeSession,
  ]

// 7 runAutomaticPersistenceEffect, before === after
[
    enqueuePersistence,
    hydrationStatus,
    ledgerData,
    persistenceOperation,
    persistenceVersionState.mutationVersion,
    publishPersistenceVersionState,
    activeRepository,
    activeSession,
  ]

// 8 applyLedgerAction, before === after
[
      activeRepository,
      activeSession,
      clock,
      hydrationStatus,
      isFutureFactCorrectionMode,
      registerAcceptedPersistence,
    ]

// 9 runHydrationEffect, before === after
[
    activePersistenceTarget,
    activeRepository,
    activeSession,
    publishPersistenceVersionState,
    trackSessionAcceptedWork,
  ]

// 10 enqueuePersistence, before === after
[publishPersistenceVersionState, trackSessionAcceptedWork]

// 11 clearLedger, before === after
[
    activeRepository,
    activeSession,
    activeCapabilities.canClearHydrationError,
    activeCapabilities.canClearReadyLedger,
    hydrationStatus,
    publishPersistenceVersionState,
    trackSessionAcceptedWork,
  ]

// 12 replaceLedgerFromBackup, before === after
[
      activeRepository,
      activeSession,
      activeCapabilities.canImportBackup,
      clock,
      hydrationStatus,
      publishPersistenceVersionState,
      stopForImportRecoveryFatal,
      trackSessionAcceptedWork,
    ]
```

**结果：12／12 `EQUAL true`。**

## Q-4｜H-3：Hook AST 序列

两个版本均用 TypeScript AST 导出 `hook 类型 + 绑定名` 并作 `JSON.stringify` 比较，输出：

```text
AST H-3 PASS: 65 entries, types and bindings identical.
```

为便于复算，完整序列如下（`—` 表示匿名 effect）：

```text
01 useReducer [ledgerData, reducerDispatch]        02 useState [hydrationStatus, setHydrationStatus]
03 useState [persistenceError, setPersistenceError] 04 useState [resourcePolicyError, setResourcePolicyError]
05 useState [isReadOnly, setIsReadOnly]           06 useState [persistenceOperation, setPersistenceOperation]
07 useState [persistenceVersionState, setPersistenceVersionState] 08 useState [ledgerEpoch, setLedgerEpoch]
09 useState [lifecycleStatus, setLifecycleStatus] 10 useState [sessionFatalSignal, setSessionFatalSignal]
11 useReducer [, requestClockRefresh]             12 useState [repositorySwitchRequestVersion, requestRepositorySwitchRender]
13 useRef mountedRef                              14 useRef sessionPersistenceOwnerRef
15 useRef sessionPersistenceBindingsRef           16 useMemo sessionPersistenceRepository
17 useMemo requestedPersistenceTarget             18 useState [activePersistenceTarget, setActivePersistenceTarget]
19 useRef activePersistenceTargetRef              20 useRef repositorySwitchPermissionRef
21 useRef currentRepositoryRef                    22 useRef ledgerDataRef
23 useRef generationRef                           24 useRef persistenceVersionStateRef
25 useRef lastPersistedSnapshotRef                26 useRef latestScheduledSnapshotRef
27 useRef failedSnapshotRef                       28 useRef retryAttemptRef
29 useRef writeQueueRef                           30 useRef hydratedRepositoryRef
31 useRef hydrationErrorRepositoryRef             32 useRef operationRef
33 useRef operationRepositoryRef                  34 useRef operationTokenRef
35 useRef clearPromiseRef                         36 useRef importPromiseRef
37 useRef importAbortControllerRef                38 useRef importSessionRef
39 useRef hydrationPromisesRef                    40 useRef pendingHydrationRef
41 useRef readOnlyRef                             42 useRef acceptingOperationsRef
43 useRef sessionFatalSignalRef                   44 useRef fatalOccurrenceRef
45 useLayoutEffect —                              46 useCallback trackSessionAcceptedWork
47 useMemo compatibilityWarnings                  48 useMemo factPartition
49 useCallback publishPersistenceVersionState     50 useCallback enqueuePersistence
51 useCallback registerAcceptedPersistence        52 useEffect —
53 useEffect —                                    54 useEffect —
55 useEffect —                                    56 useEffect —
57 useEffect —                                    58 useCallback applyLedgerAction
59 useCallback applyLedgerMutation                60 useCallback retryPersistence
61 useCallback discardDirtyChangesAndSwitchRepository 62 useCallback clearLedger
63 useCallback stopForImportRecoveryFatal         64 useCallback replaceLedgerFromBackup
65 useCallback drainForSessionQuiesce
```

## Q-5｜逐块行数

原／调用点为 AST `CallExpression` 闭区间；模块函数体为 `FunctionDeclaration.body`（含花括号、deps 解构和原语句）。

| 块 | 原调用点 | 最终调用点 | 模块函数体 |
| --- | --- | --- | --- |
| stopForImportRecoveryFatal | 1258–1302 (45) | 693–720 (28) | 59–121 (63) |
| registerAcceptedPersistence | 508–554 (47) | 339–364 (26) | 45–85 (41) |
| applyLedgerMutation | 908–976 (69) | 548–583 (36) | 61–136 (76) |
| runPersistenceTargetEffect | 206–275 (70) | 207–233 (27) | 145–222 (78) |
| drainForSessionQuiesce | 1660–1730 (71) | 787–810 (24) | 245–325 (81) |
| retryPersistence | 978–1055 (78) | 585–612 (28) | 113–202 (90) |
| runAutomaticPersistenceEffect | 733–817 (85) | 481–507 (27) | 229–321 (93) |
| applyLedgerAction | 819–906 (88) | 509–546 (38) | 171–265 (95) |
| runHydrationEffect | 606–712 (107) | 418–460 (43) | 377–513 (137) |
| enqueuePersistence | 351–506 (156) | 309–337 (29) | 347–508 (162) |
| clearLedger | 1082–1256 (175) | 639–691 (53) | 573–770 (198) |
| replaceLedgerFromBackup | 1304–1658 (355) | 722–785 (64) | 87–463 (377) |

## Q-6｜模块划分与结构守卫

- `usePersistentLedgerPersistence.ts`：enqueue、accepted persistence、retry、自动保存 effect（508 行）。
- `usePersistentLedgerLifecycle.ts`：target/hydration effect、quiesce、clear、fatal stop（770 行）。
- `usePersistentLedgerActions.ts`：action 与 mutation（265 行）。
- `usePersistentLedgerImport.ts`：备份替换（463 行）。

每个调用点显式传具名 deps，没有共享 `ctx`。结构守卫命令通过：`npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts`，2 files／8 tests。

## Q-7｜最终 10B 闸门原始输出

全部在 `0858b7f` 上运行：

```text
$ npm test
> local-first-trading-ledger@0.1.0 test
> vitest run
 RUN  v4.1.9 .../LocalFirstTradingLedger
 Test Files  137 passed (137)
      Tests  1186 passed (1186)
   Start at  22:40:20
   Duration  35.90s (transform 4.86s, setup 14.34s, import 16.46s, tests 111.66s, environment 27.81s)

$ npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts
 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  1.74s

$ npm run build
> next build
✓ Compiled successfully in 2.5s
✓ Generating static pages (5/5)

$ npm run typecheck
> tsc --noEmit

$ npm run lint
> eslint . --max-warnings=0

$ npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts
 Test Files  2 passed (2)
      Tests  8 passed (8)

$ npx vitest run src/test-support/translationKeyUsage.test.ts
 Test Files  1 passed (1)
      Tests  1 passed (1)

$ git diff --check
$ git diff origin/main...HEAD --check
```

<details>
<summary><code>npm test</code> 的完整 141 行原始输出（含 worker 环境警告）</summary>

```text

> local-first-trading-ledger@0.1.0 test
> vitest run


 RUN  v4.1.9 /Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路/01一些进度/产出/LocalFirstTradingLedger

(node:31676) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31679) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31677) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31675) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31674) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31680) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31678) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31681) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31682) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31683) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31685) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31689) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31688) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31690) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31691) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31692) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31696) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31697) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31698) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31699) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31700) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31702) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31703) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31705) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31708) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31710) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31711) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31712) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31713) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31714) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31715) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31717) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31718) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31719) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31721) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31722) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31723) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31725) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31726) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31727) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31729) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31730) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31731) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31732) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31733) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31734) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31735) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31736) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31737) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31739) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31740) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31742) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31743) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31744) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31747) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31748) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31750) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31752) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31755) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31756) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31757) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31769) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31774) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
(node:31799) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)

 Test Files  137 passed (137)
      Tests  1186 passed (1186)
   Start at  22:40:20
   Duration  35.90s (transform 4.86s, setup 14.34s, import 16.46s, tests 111.66s, environment 27.81s)
```

</details>

两项 whitespace 命令均无输出、exit 0。

## Q-8｜跳过清单与举证

无跳过块；全部 12 个 ≥40 行候选均已搬运。

## Q-9｜否定性声明

- 未新增、删除或修改测试、断言、阈值或用例名。
- 未新增性能包装；未打包或引入共享 `ctx`。
- 相对 `e6fadc9`，源码只改 `src/app/usePersistentLedger.ts` 及四个本批新模块；未改其他源码文件、`package.json` 或 lockfile。
- 未改文件格式、版本号、加密参数、派生计算或结构守卫；未引入依赖。
- 未 push、未合并 `main`、未 rebase／amend／squash。
- 未读写真实数据区；未触碰 `04_DEIK-AI-Challenge-2026/`。

## Q-10｜数字来源

每个数字来自本次 AST、`git`、`wc` 或 Q-7 实跑命令。没有从旧报告抄数字，也没有未复核数字。

## Q-11｜未完成事项与交接

实施范围内无未完成块，源码工作树干净。下一步是独立 10D 按 H-1／H-2／H-3 复审；是否合并与 push 由产品负责人决定，均不在本批执行者授权内。
