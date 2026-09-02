# 08C-2_W15-main｜拆大文件第二轮执行报告

- 日期：2026-09-02
- 轨道：长期账本产品 `main`
- 依据：`08A` **修订 D**（与修订 A／B／C 冲突处以修订 D 为准）+ `08B` T-1～T-6
- 开工基线：`main@5c825c2`，工作树 clean
- 执行分支：`zhennn/w15-main-test-split`（从 `main@5c825c2` 新切，**未 push、未合并**）
- 收尾 HEAD：`6eca110`
- 提交数：**20 笔**

> **口径声明（Q-18′）**：本报告中的每一个数字均由本轮执行者在本机实测得出，命令与原始输出见各节。**没有任何一个数字抄自 `08C`／`08D`／`08A`／周日志。** 唯一例外已逐条标注「未复核」。

---

## 〇、一句话结论

**S-1″、S-2′、S-3′ 三项全部完成，D-1 通过线达成（`src/app` 下已无 600 行以上测试文件），1,186 条用例全名逐字不变，全部闸门绿。**

**一个测试文件都没有跳过。** 唯一未搬走的是 `LedgerAccessGate.tsx` 中的 `PasswordField`（136 行，含 6 个 hook 调用），理由与提请裁决事项见第七节。

---

## 一、S-1″：拆 7 个测试文件

### 1.1 起点复测（自行实测，非抄写）

```bash
find src/app -name "*.test.ts" -o -name "*.test.tsx" | xargs wc -l | sort -rn
```

原始输出（截取 600 行以上部分，测于 `main@5c825c2`）：

```
   15372 total
    2853 src/app/usePersistentLedger.test.tsx
    2298 src/app/DashboardShell.interaction.test.tsx
    1922 src/app/LedgerAccessGate.test.tsx
    1905 src/app/ledgerFileAccessController.test.ts
    1271 src/app/usePersistentLedger.fileCapabilities.test.tsx
    1149 src/app/usePersistentLedger.fileImport.test.tsx
     699 src/app/TransactionsWorkspace.test.tsx
```

2853+2298+1922+1905+1271+1149+699 = **12,097**。**与修订 D 的 A 节一致，7 个文件、12,097 行属实。**

### 1.2 Q-11：D-1 通过线

```bash
find src/app -name "*.test.ts" -o -name "*.test.tsx" | xargs wc -l | awk '$1>=600 && $2!="total"'
```

原始输出：

```
```

**输出为空（零行）。** 收尾时 `src/app` 下最大的 5 个测试文件：

```
     564 src/app/usePersistentLedger.backupImport.test.tsx
     519 src/app/LedgerAccessGate.sessionRelease.test.tsx
     505 src/app/usePersistentLedger.savePipeline.test.tsx
     491 src/app/DashboardShell.tradeEditing.test.tsx
     484 src/app/DashboardShell.backupImport.test.tsx
```

`src/app` 测试文件数收尾为 **53**；目录内文件总数由 `main@5c825c2` 的 **48** 增至 **103**（`git ls-tree main --name-only src/app/ | wc -l` = 48，`ls src/app | wc -l` = 103）。

### 1.3 Q-13：逐文件行数对照

| 原文件 | 原行数 | 拆出测试文件数 | 测试文件合计 | `testHelpers` | 新合计 | 差值 | 最大新文件 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `usePersistentLedger.test.tsx` | 2,853 | 8 | 2,887 | 184 | 3,071 | **+218** | 564 |
| `DashboardShell.interaction.test.tsx` | 2,298 | 7 | 2,277 | 359 | 2,636 | **+338** | 491 |
| `LedgerAccessGate.test.tsx` | 1,922 | 7 | 2,550 | 207 | 2,757 | **+835** | 519 |
| `ledgerFileAccessController.test.ts` | 1,905 | 7 | 1,691 | 347 | 2,038 | **+133** | 369 |
| `usePersistentLedger.fileCapabilities.test.tsx` | 1,271 | 3 | 1,154 | 203 | 1,357 | **+86** | 419 |
| `usePersistentLedger.fileImport.test.tsx` | 1,149 | 2 | 920 | 270 | 1,190 | **+41** | 467 |
| `TransactionsWorkspace.test.tsx` | 699 | 3 | 640 | 119 | 759 | **+60** | 331 |
| **合计** | **12,097** | **37** | **12,119** | **1,689** | **13,808** | **+1,711** | — |

**差值来源，逐项说明：**

1. **每个新文件各有一份 `import` 头**（20～45 行）。37 个新文件 × 约 30 行 ≈ 1,100 行。
2. **同一 `describe` 被拆到多个文件时，`describe(...)` 与其闭合 `});` 各复制一份**。T-3 要求顶层 `describe` 名称与嵌套层数逐字不变，这两行必须重复。
3. **`vi.mock` 块必须逐字复制到每个新文件**，见 1.5。这是 `LedgerAccessGate` 差值高达 +835 的主因：该文件的 `vi.mock("./DashboardShell", ...)` 共 **102 行**，多出 6 份 = **612 行**；`DashboardShell.interaction` 的 `vi.mock("echarts/core", ...)` 共 **25 行**，多出 6 份 = 150 行。

**这三项全部是「同一份内容出现在多个文件」，不是新增逻辑。** 被移动的用例代码本身一个字符未增未减，证据见 1.4。

### 1.4 T-4 机械自证：被移动的用例代码逐字不变

对每个新测试文件，取其 `import` 头之后的全部内容，在 `git show main:<原文件>` 中做**最长公共块贪心匹配**。若整个文件体能被若干个「原文件的连续行区间」完整覆盖，则每一个字符都来自原文件。

原始输出（`body` = 文件体行数，`blocks` = 覆盖它所需的连续区间数，`UNCOVERED` = 无法在原文件中找到来源的行数）：

```
src/app/usePersistentLedger.hydration.test.tsx                     body= 322 blocks= 2 OK
src/app/usePersistentLedger.savePipeline.test.tsx                  body= 482 blocks= 2 OK
src/app/usePersistentLedger.dirtyLifecycle.test.tsx                body= 279 blocks= 1 OK
src/app/usePersistentLedger.backupImport.test.tsx                  body= 522 blocks= 1 OK
src/app/usePersistentLedger.clearSequencing.test.tsx               body= 228 blocks= 1 OK
src/app/usePersistentLedger.clearRecovery.test.tsx                 body= 264 blocks= 2 OK
src/app/usePersistentLedger.sessionSwitch.test.tsx                 body= 303 blocks= 3 OK
src/app/usePersistentLedger.sessionQuiesce.test.tsx                body= 244 blocks= 2 OK
src/app/DashboardShell.navigation.test.tsx                         body= 173 blocks= 2 OK
src/app/DashboardShell.lockDecision.test.tsx                       body= 226 blocks= 2 OK
src/app/DashboardShell.tradeEditing.test.tsx                       body= 462 blocks= 3 OK
src/app/DashboardShell.tradeHydration.test.tsx                     body= 216 blocks= 3 OK
src/app/DashboardShell.futureCorrection.test.tsx                   body= 312 blocks= 2 OK
src/app/DashboardShell.backupImport.test.tsx                       body= 445 blocks= 3 OK
src/app/DashboardShell.clearRecovery.test.tsx                      body= 243 blocks= 3 OK
src/app/LedgerAccessGate.connectionInspection.test.tsx             body= 316 blocks= 3 OK
src/app/LedgerAccessGate.setupCreation.test.tsx                    body= 211 blocks= 4 OK
src/app/LedgerAccessGate.sessionRelease.test.tsx                   body= 483 blocks= 4 OK
src/app/LedgerAccessGate.fileSelection.test.tsx                    body= 365 blocks= 4 OK
src/app/LedgerAccessGate.unlock.test.tsx                           body= 262 blocks= 4 OK
src/app/LedgerAccessGate.recovery.test.tsx                         body= 408 blocks= 4 OK
src/app/LedgerAccessGate.passwordVisibility.test.tsx               body= 267 blocks= 3 OK
src/app/ledgerFileAccessController.rememberedConnection.test.ts    body= 257 blocks= 2 OK
src/app/ledgerFileAccessController.connectionRecord.test.ts        body= 260 blocks= 3 OK
src/app/ledgerFileAccessController.fileCreation.test.ts            body= 195 blocks= 3 OK
src/app/ledgerFileAccessController.selectionSequencing.test.ts     body= 129 blocks= 3 OK
src/app/ledgerFileAccessController.recoveryConfirmation.test.ts    body= 150 blocks= 3 OK
src/app/ledgerFileAccessController.leaseRelease.test.ts            body= 221 blocks= 3 OK
src/app/ledgerFileAccessController.staleCleanup.test.ts            body= 346 blocks= 2 OK
src/app/usePersistentLedger.fileClear.test.tsx                     body= 297 blocks= 2 OK
src/app/usePersistentLedger.fileSaveReconciliation.test.tsx        body= 369 blocks= 3 OK
src/app/usePersistentLedger.fileStaleWrite.test.tsx                body= 390 blocks= 2 OK
src/app/usePersistentLedger.fileImportEvidence.test.tsx            body= 444 blocks= 2 OK
src/app/usePersistentLedger.fileImportAbort.test.tsx               body= 424 blocks= 2 OK
src/app/TransactionsWorkspace.filters.test.tsx                     body= 196 blocks= 1 OK
src/app/TransactionsWorkspace.delayedDeletion.test.tsx             body= 309 blocks= 1 OK
src/app/TransactionsWorkspace.cashActivity.test.tsx                body=  77 blocks= 1 OK
```

**37 个新测试文件，`UNCOVERED` 全部为 0。** 每个文件体最多只需 4 个连续区间即可完整覆盖（多出的区间就是 `describe` 行、`vi.mock` 块与闭合 `});`）。

**7 个 `testHelpers` 文件同样验证**，唯一差异是本轮为搬运而添加的 `export` 关键字（`08B` F-1 明确允许）：

```
usePersistentLedger.testHelpers.ts                   body= 161 exports_added=10 uncovered_after_stripping_export=0
DashboardShell.testHelpers.tsx                       body= 324 exports_added=17 uncovered_after_stripping_export=0
LedgerAccessGate.testHelpers.ts                      body= 180 exports_added=12 uncovered_after_stripping_export=0
ledgerFileAccessController.testHelpers.ts            body= 315 exports_added=13 uncovered_after_stripping_export=0
usePersistentLedger.fileCapabilities.testHelpers.ts  body= 186 exports_added= 8 uncovered_after_stripping_export=0
usePersistentLedger.fileImport.testHelpers.ts        body= 237 exports_added=11 uncovered_after_stripping_export=0
TransactionsWorkspace.testHelpers.tsx                body= 104 exports_added= 5 uncovered_after_stripping_export=0
```

### 1.5 两处必须如实登记的做法偏差

| # | 偏差 | 原因 | 影响 |
| --- | --- | --- | --- |
| **偏差 1** | `vi.mock(...)` 块**未提入 `testHelpers`，而是逐字复制到每个新测试文件** | `vi.mock` 由 vitest **提升到所在文件的顶部**，其注册作用域是**该测试文件**。把它放进被 `import` 的 helper 模块，注册时机会晚于测试文件自身的 `import`（被测模块可能已解析完毕），等价性无法保证。这是**正确性要求，不是省事** | 是 1.3 中差值的主要来源。不影响任何用例的行为，两处 `vi.mock` 块均与原文件逐字相同 |
| **偏差 2** | 3 个 helper 文件后缀为 `.tsx` 而非 T-5 写的 `.ts`：`DashboardShell.testHelpers.tsx`、`TransactionsWorkspace.testHelpers.tsx`、（`LedgerAccessGate` 的 helper 无 JSX，仍为 `.ts`） | 这些 helper 含 JSX（如 `renderWorkspace`、`DashboardShell` 包装组件），TypeScript 规定含 JSX 的文件必须用 `.tsx` | 命名规则的其余部分（无编号、无中文、`<被测对象>.testHelpers`）全部遵守 |

另有一处命名口径说明：`usePersistentLedger` 有三个原测试文件，其 helper 内容互不相同，因此按各自「被测对象」命名为 `usePersistentLedger.testHelpers.ts`、`usePersistentLedger.fileCapabilities.testHelpers.ts`、`usePersistentLedger.fileImport.testHelpers.ts`，**未合并、未复制**。

### 1.6 新文件清单（T-1／T-2 自证：无编号、无中文）

| 原文件 | 新文件（关注点） |
| --- | --- |
| `usePersistentLedger.test.tsx` | `hydration` / `savePipeline` / `dirtyLifecycle` / `backupImport` / `clearSequencing` / `clearRecovery` / `sessionSwitch` / `sessionQuiesce` |
| `DashboardShell.interaction.test.tsx` | `navigation` / `lockDecision` / `tradeEditing` / `tradeHydration` / `futureCorrection` / `backupImport` / `clearRecovery` |
| `LedgerAccessGate.test.tsx` | `connectionInspection` / `setupCreation` / `sessionRelease` / `fileSelection` / `unlock` / `recovery` / `passwordVisibility` |
| `ledgerFileAccessController.test.ts` | `rememberedConnection` / `connectionRecord` / `fileCreation` / `selectionSequencing` / `recoveryConfirmation` / `leaseRelease` / `staleCleanup` |
| `usePersistentLedger.fileCapabilities.test.tsx` | `fileClear` / `fileSaveReconciliation` / `fileStaleWrite` |
| `usePersistentLedger.fileImport.test.tsx` | `fileImportEvidence` / `fileImportAbort` |
| `TransactionsWorkspace.test.tsx` | `filters` / `delayedDeletion` / `cashActivity` |

7 个原文件全部拆完即为空，**已按 T-6 删除**。

---

## 二、Q-12：用例全名 `diff`

**两侧同一条命令、同一去重方式**（无去重，全量导出后仅按 `name` 字段排序）：

```bash
npx vitest list --json > before.json      # 在 main@5c825c2
npx vitest list --json > after.json       # 在 6eca110
node -e 'const a=require("./X.json");require("fs").writeFileSync("X.names.txt",a.map(x=>x.name).sort().join("\n")+"\n")'
diff before.names.txt after.names.txt
```

原始输出：

```
count 1186          <- before
count 1186          <- after
DIFF_EMPTY_OK       <- diff 无任何输出后打印
```

**改动前 1,186 条，改动后 1,186 条，`diff` 输出为空。** 注意比较的是 `name` 字段（`describe` 链 + 用例名），不含文件路径——文件路径本轮必然变化，用例全名必须不变，这正是 D-2 的口径。

---

## 三、S-2′ 与 Q-14

### 3.1 完成情况

| 文件 | 改动前行数 | 改动后行数 | 主体起止行号 | 主体行数 | **主体外剩余** |
| --- | ---: | ---: | :--- | ---: | ---: |
| `usePersistentLedger.ts` | 1,964 | 1,763 | 91–1763（`usePersistentLedger` hook） | 1,673 | **90 行**：1–86 全为 `import`／`export type … from`，87 空行，88–90 是 hook 自己的 3 行 JSDoc。**非 import／非注释的残留 = 0** |
| `ledgerFileAccessController.ts` | 1,172 | 916 | 68–916（`DefaultLedgerFileAccessController` class） | 849 | **67 行**：全部为 `import` 与 `export … from` 再导出。**残留 = 0** |
| `LedgerAccessGate.tsx` | 1,282 | 1,133 | 51–996（`LedgerAccessGate` 组件） | 946 | **187 行**：1–50 全为 `import`；997 空行；**998–1133 为 `PasswordField`（136 行），未搬走，见第七节** |

上表「改动前行数」由 `git show main:<file> | wc -l` 实测；产品负责人在合同中给出的 `usePersistentLedger.ts` 骨架（1–180 类型与 import、181–1853 巨型 hook、1855–1964 五个纯函数）**经本轮复测属实**。

### 3.2 搬出去的东西

| 来源 | 新文件 | 行数 | 内容 |
| --- | --- | ---: | --- |
| `usePersistentLedger.ts` | `usePersistentLedgerTypes.ts` | 124 | 13 个类型（原 63–148、156–176） |
| | `usePersistentLedgerHelpers.ts` | 125 | 1 个常量 + 6 个纯函数（原 150–154、1855–1964） |
| `ledgerFileAccessController.ts` | `ledgerFileAccessControllerTypes.ts` | 113 | 错误码常量 + 9 个类型／接口（原 33–136） |
| | `ledgerFileAccessControllerHelpers.ts` | 197 | 1 个错误类 + 13 个纯函数（原 138–143、995–1172） |
| `LedgerAccessGate.tsx` | `LedgerAccessGateTypes.ts` | 28 | 3 个类型（原 39–63） |
| | `LedgerAccessGateHelpers.ts` | 85 | 1 个 `WeakMap` + 2 个纯函数（原 65–68、1214–1282） |
| | `AccessPanel.tsx` | 26 | 无 hook 的既有小组件（原 1044–1067） |
| | `FormError.tsx` | 8 | 无 hook 的既有小组件（原 1206–1212） |

**`AccessPanel` 与 `FormError` 原本就在巨型组件之外，按 B-4 计入 S-2′，不计入 S-3′。**

### 3.3 逐字不变自证

同 1.4 的贪心块匹配，`uncovered` 全为 0，唯一差异是新增的 `export` 关键字：

```
usePersistentLedger.ts             -> usePersistentLedgerTypes.ts            body= 107 blocks= 2 export_keyword_added= 6 uncovered=0
usePersistentLedger.ts             -> usePersistentLedgerHelpers.ts          body= 115 blocks= 2 export_keyword_added= 7 uncovered=0
ledgerFileAccessController.ts      -> ledgerFileAccessControllerTypes.ts     body= 104 blocks= 1 export_keyword_added= 4 uncovered=0
ledgerFileAccessController.ts      -> ledgerFileAccessControllerHelpers.ts   body= 184 blocks= 2 export_keyword_added=14 uncovered=0
LedgerAccessGate.tsx               -> LedgerAccessGateTypes.ts               body=  25 blocks= 1 export_keyword_added= 3 uncovered=0
LedgerAccessGate.tsx               -> LedgerAccessGateHelpers.ts             body=  73 blocks= 2 export_keyword_added= 3 uncovered=0
LedgerAccessGate.tsx               -> AccessPanel.tsx                        body=  24 blocks= 1 export_keyword_added= 1 uncovered=0
LedgerAccessGate.tsx               -> FormError.tsx                          body=   7 blocks= 1 export_keyword_added= 1 uncovered=0
S2_VERBATIM_MODULO_EXPORT
```

**留在原地的巨型主体逐字节未变**（`shasum` 对照，左为 `main` 原区间，右为收尾区间）：

```
cecc9e8de40faef2e8fc503cf7e9f98e05ba8b31   main:usePersistentLedger.ts 181-1853
cecc9e8de40faef2e8fc503cf7e9f98e05ba8b31   HEAD:usePersistentLedger.ts  91-1763
f533b0f6ef0f02137a2b14229fba3708bdab39b9   main:ledgerFileAccessController.ts 145-993
f533b0f6ef0f02137a2b14229fba3708bdab39b9   HEAD:ledgerFileAccessController.ts  68-916
97888058cb88d4ec3f453170ee42cc0c0e79f3aa   main:LedgerAccessGate.tsx 1069-1204   (PasswordField)
97888058cb88d4ec3f453170ee42cc0c0e79f3aa   HEAD:LedgerAccessGate.tsx  998-1133   (PasswordField)
```

`LedgerAccessGate` 与 `DashboardShell` 的巨型主体因 S-3′ 而有改动，逐段证据见第四节。

---

## 四、S-3′ 与 Q-15

**全部 10 个子组件都取自巨型组件主体内部。** 下表的行号是它们在 `main@5c825c2` 中的位置；两个宿主的巨型主体在 `main` 中分别是 `DashboardShell.tsx` 的 **68–1466** 与 `LedgerAccessGate.tsx` 的 **70–1042**。

行号由脚本自动定位得出：取新组件文件 `return (` 与 `);` 之间的内容，在 `git show main:<宿主>` 中查找**逐行完全相同**的连续区间。**能定位到，本身就证明搬过去的 JSX 一个字符没变。**

| 新组件 | 宿主 | 在 `main` 中的起止行 | 行数 | 是否在主体内 | `use[A-Z]…(` 计数 |
| --- | --- | :--- | ---: | :---: | ---: |
| `SessionFatalPanel.tsx` | `DashboardShell.tsx` | 530–539 | 10 | ✅ 68–1466 内 | **0** |
| `SessionQuiescingPanel.tsx` | `DashboardShell.tsx` | 545–549 | 5 | ✅ | **0** |
| `PersistenceErrorNotice.tsx` | `DashboardShell.tsx` | 636–651 | 16 | ✅ | **0** |
| `RepositorySwitchBlockedNotice.tsx` | `DashboardShell.tsx` | 671–685 | 15 | ✅ | **0** |
| `CompatibilityWarningList.tsx` | `DashboardShell.tsx` | 688–700 | 13 | ✅ | **0** |
| `LockConfirmationPanel.tsx` | `DashboardShell.tsx` | 569–606 | 38 | ✅ | **0** |
| `FutureCorrectionPanel.tsx` | `DashboardShell.tsx` | 703–793 | 91 | ✅ | **0** |
| `SessionLockingPanel.tsx` | `LedgerAccessGate.tsx` | 706–719 | 14 | ✅ 70–1042 内 | **0** |
| `AccessCheckingPanel.tsx` | `LedgerAccessGate.tsx` | 774–781 | 8 | ✅ | **0** |
| `LegacyRetiredPanel.tsx` | `LedgerAccessGate.tsx` | 787–794 | 8 | ✅ | **0** |

脚本原始输出：

```
SessionFatalPanel                DashboardShell.tsx@main lines 530-539  (10 lines)
SessionQuiescingPanel            DashboardShell.tsx@main lines 545-549  (5 lines)
LockConfirmationPanel            DashboardShell.tsx@main lines 569-606  (38 lines)
FutureCorrectionPanel            DashboardShell.tsx@main lines 703-793  (91 lines)
CompatibilityWarningList         DashboardShell.tsx@main lines 688-700  (13 lines)
RepositorySwitchBlockedNotice    DashboardShell.tsx@main lines 671-685  (15 lines)
PersistenceErrorNotice           DashboardShell.tsx@main lines 636-651  (16 lines)
LegacyRetiredPanel               LedgerAccessGate.tsx@main lines 787-794  (8 lines)
AccessCheckingPanel              LedgerAccessGate.tsx@main lines 774-781  (8 lines)
SessionLockingPanel              LedgerAccessGate.tsx@main lines 706-719  (14 lines)
```

Q-7 自检（`grep -cE "\buse[A-Z][A-Za-z]*\(" <新文件>`）10 个文件**全部输出 0**。

**S-X2／P-4 自证**：未新增任何包裹 DOM 元素——每个新组件的 `return (` 之后就是原封不动的那一段 JSX，没有加 `<div>`，也没有用到 Fragment。
**S-X3／P-3 自证**：未使用 `React.memo`，未新增 `useMemo`／`useCallback`。
**P-2 自证**：所需数据与回调全部经 props 显式传入；为保持 JSX 逐字不变，props 一律沿用父组件中的原变量名（如 `retrySaveBeforeLock`、`setShowLockConfirmation`、`accessState`），`t` 亦作为 prop 传入而非在子组件里调 `useLanguage()`。

**改动后两个宿主的行数**：`DashboardShell.tsx` 1,482 → **1,337**（净减 145）；`LedgerAccessGate.tsx` 1,282 → **1,133**（净减 149，其中 S-2′ 与 S-3′ 都有贡献）。

---

## 五、Q-16：全部闸门原始输出

### 5.1 `npm test`

```
> local-first-trading-ledger@0.1.0 test
> vitest run

 RUN  v4.1.9 .../LocalFirstTradingLedger

 Test Files  137 passed (137)
      Tests  1186 passed (1186)
   Duration  40.45s
```

（起点基线 107 files／1186 tests；**文件数 107 → 137 是本轮拆分的直接结果，用例数 1186 不变**。）

### 5.2 冻结派生快照

```bash
npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts
```

```
 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  1.71s
```

### 5.3 `npm run build`

```
> next build

   ▲ Next.js 15.5.22
 ✓ Compiled successfully in 2.7s
 ✓ Generating static pages (5/5)

Route (app)                                 Size  First Load JS
┌ ○ /                                     376 kB         479 kB
└ ○ /_not-found                            993 B         103 kB
+ First Load JS shared by all             102 kB
  ├ chunks/255-3d881dfa8c72bc56.js       46.3 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)           1.9 kB
```

**Q-5 产物大小对照**：合同的起点基线未含 build 数据，**因此本轮自行在 `main@5c825c2` 上跑了一次基线 build**（`git checkout main && npm run build`，随后切回分支）：

| | 首页 Size | First Load JS |
| --- | ---: | ---: |
| `main@5c825c2`（本轮实测） | 377 kB | 479 kB |
| `6eca110`（本轮实测） | **376 kB** | **479 kB** |

**差 −1 kB／±0 kB，无显著变化。** 共享 chunk 的 hash（`255-3d881dfa8c72bc56.js`、`4bd1b696-c023c6e3521b1417.js`）与大小两侧完全一致。

> `08B` Q-5 写的基线 `364 kB / 467 kB` 是 08 第一轮时的旧值，**本轮不引用**。

### 5.4 `npm run typecheck` / `npm run lint`

```
> tsc --noEmit
TYPECHECK_EXIT=0

> eslint . --max-warnings=0
LINT_EXIT=0
```

两者均无任何输出，退出码 0。

### 5.5 结构守卫

```bash
npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts
```

```
 Test Files  2 passed (2)
      Tests  8 passed (8)
```

```bash
npx vitest run src/test-support/translationKeyUsage.test.ts
```

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

（`translationKeyUsage` 是 09 批新增守卫，本轮首次作为起点存在，已纳入收口。）

### 5.6 空白字符检查

```bash
git diff --check                      # exit=0，无输出
git diff origin/main...HEAD --check   # exit=0，无输出
```

### 5.7 其余边界闸门

| 编号 | 检查 | 命令 | 结果 |
| --- | --- | --- | --- |
| Q-9／A-10 | `src/app/index.ts` 导出集合 | `git diff main -- src/app/index.ts` | **无输出（文件零改动）** |
| Q-10／A-7 | 依赖 | `git diff --stat main -- package.json package-lock.json` | **无输出（零改动）** |
| A-6 | 只动 `src/app/` | `git diff --name-only main \| grep -v "^src/app/"` | **无输出** |
| Q-6／F-3 | 无新增 `@/app` 深层引用 | `grep -rn '"@/app/' src/` | **无匹配（exit 1）**；外部 `from "@/app"` 仍为 11 个文件 |
| Q-4 | 四个版本号 | `git diff --stat main -- src/platform/files/ledgerFileContract.ts src/features/backup/backupEnvelope.ts src/platform/files/ledgerFileChunkedContainerV3.ts` | **无输出**。权威定义处实测：`ledgerFileContract.ts` `fileFormatVersion: 2`／`cryptoVersion: 1`／`SUPPORTED_LEDGER_SCHEMA_VERSION = 4`；`backupEnvelope.ts` `BACKUP_FORMAT_VERSION = 3`；`ledgerFileChunkedContainerV3.ts` 当前写出 `fileFormatVersion: 3`。**均未引用镜像常量块** |

### 5.8 Q-8′：hook 调用序列（三种口径全部比对）

按修订 C 的 Q-8′「宁可多抓不可漏抓」，逐个比对 `main` 与 `HEAD`。**本轮跑了三种口径，因为发现修订 C 建议的那一条本身是漏的。**

**口径一：修订 C 建议的 `\buse[A-Z][A-Za-z]*\(`**

```
usePersistentLedger.ts                   before=36 after=36 diff: IDENTICAL
DashboardShell.tsx                       before=24 after=24 diff: IDENTICAL
LedgerAccessGate.tsx                     before=15 after=15 diff: IDENTICAL
ledgerFileAccessController.ts            before= 0 after= 0 diff: IDENTICAL
```

**口径二：`\buse[A-Z][A-Za-z]*(<[^()]*>)?\(`（允许泛型实参）**

```
usePersistentLedger.ts             before=  65 after=  65 IDENTICAL
DashboardShell.tsx                 before=  28 after=  28 IDENTICAL
LedgerAccessGate.tsx               before=  21 after=  21 IDENTICAL
ledgerFileAccessController.ts      before=   0 after=   0 IDENTICAL
```

**口径三：最宽的 `\buse[A-Z][A-Za-z]*`（连标识符本身都抓，必然过抓）**

```
usePersistentLedger.ts             before=  73 after=  76 DIFF:
> usePersistentLedgerTypes
> usePersistentLedgerHelpers
> usePersistentLedgerTypes
DashboardShell.tsx                 before=  37 after=  37 IDENTICAL
LedgerAccessGate.tsx               before=  34 after=  32 DIFF:
< useLanguage
< useLanguage
ledgerFileAccessController.ts      before=   0 after=   0 IDENTICAL
```

**口径三的 5 处差异全部是非 hook 的误抓，逐条解释：**

- `usePersistentLedgerTypes` ×2、`usePersistentLedgerHelpers` ×1：本轮新增的 `import … from "./usePersistentLedgerTypes"` ／ `"./usePersistentLedgerHelpers"` **模块路径**，被正则当成了 hook 名。
- `useLanguage` ×2：`getAccessErrorMessage` 与 `getFileAccessErrorMessage` 两个纯函数的形参类型写作 `ReturnType<typeof useLanguage>["t"]`，是**类型位置的引用，不是调用**；这两个函数已按 S-2′ 搬到 `LedgerAccessGateHelpers.ts`，所以原文件里少了两处。

**结论：口径二是本轮的判定口径，四个文件全部 `IDENTICAL`。本轮未移动、未新增、未删除任何一个 hook 调用（A-2 达成）。**

> **新发现，请写进 10 批（关系到 Q-8″）**：修订 C 建议的 `\buse[A-Z][A-Za-z]*\(` **抓不到带泛型实参的 hook 调用**——`useState<ClearConfirmationMode | null>(null)`、`useRef<HTMLInputElement>(null)` 这类写法，`use…` 后面跟的是 `<` 而不是 `(`。实测差距不小：`usePersistentLedger.ts` 口径一只抓到 **36** 处，口径二抓到 **65** 处，**漏了 29 处**；`DashboardShell.tsx` 24 → 28；`LedgerAccessGate.tsx` 15 → 21。**10 批要动的正是 hook 密集区，请改用口径二 `\buse[A-Z][A-Za-z]*(<[^()]*>)?\(`。**

---

## 六、提交清单

从 `main@5c825c2` 切出 `zhennn/w15-main-test-split`，20 笔提交，**每笔提交前 `npm test` 全绿**：

```
c5b4514 refactor: split usePersistentLedger.test.tsx by concern
ee53fe5 refactor: split DashboardShell.interaction.test.tsx by concern
4d589a1 refactor: split LedgerAccessGate.test.tsx by concern
568f39d refactor: split ledgerFileAccessController.test.ts by concern
6798102 refactor: split usePersistentLedger.fileCapabilities.test.tsx by concern
2f40b4e refactor: split usePersistentLedger.fileImport.test.tsx by concern
71bb828 refactor: split TransactionsWorkspace.test.tsx by concern
9737d33 refactor: move usePersistentLedger types and pure helpers out of the hook file
6dca4e2 refactor: move ledgerFileAccessController types and pure helpers out of the controller class
8661418 refactor: move LedgerAccessGate types, helpers, and hook-free panels out of the gate component
d1f16b0 refactor: extract session fatal panel from DashboardShell
3c9ada9 refactor: extract session quiescing panel from DashboardShell
eb805f9 refactor: extract lock confirmation panel from DashboardShell
e6e9800 refactor: extract future fact correction panel from DashboardShell
06cf137 refactor: extract compatibility warning list from DashboardShell
3289c3b refactor: extract repository switch blocked notice from DashboardShell
6e1d0a0 refactor: extract persistence error notice from DashboardShell
9805bad refactor: extract legacy retired panel from LedgerAccessGate
e054c90 refactor: extract access checking panel from LedgerAccessGate
6eca110 refactor: extract session locking panel from LedgerAccessGate
```

- **P-2′**：一个测试文件一个阶段，按 2,853 → 2,298 → 1,922 → 1,905 → 1,271 → 1,149 → 699 从大到小做，每阶段 `npm test` 全绿才进下一个。
- **P-3′**：一个原文件的拆分 = 一笔提交（含新文件、`testHelpers`、原文件删除）。7 笔。
- **P-4′**：S-2′ 三个文件各一笔（3 笔）；S-3′ 每个子组件一笔（10 笔）。
- **P-5′**：**未 `push`，未合并到 `main`。** 分支停在 `6eca110`，`main` 仍在 `5c825c2`。
- **P-6′**：源码仓库全部英文提交；本报告在文档仓库另行中文提交，两仓库未混提交。
- 未 `amend`／`rebase`／`squash`／`reset --hard`／`clean -fd`。
- 未读取 `~/Downloads/history_OKX/`，未打开任何真实 `.lftl` 或真实 B 文件。

`git diff --stat main..HEAD` 末行：`73 files changed, 15028 insertions(+), 12984 deletions(-)`。

---

## 七、《跳过清单与举证》（Q-17′）

### 7.1 S-1″：跳过 0 个测试文件

**7 个文件全部拆分完成，无一跳过。** B-2 的举证条款本轮无需援引。

> 与第一轮的对照：第一轮以「共享 jsdom lifecycle／mock／fixture／helper」为由跳过全部 7 个文件。本轮实测表明，这些共享内容按 T-5 提到 `testHelpers` 即可处理（`afterEach(cleanup)` 之类的 lifecycle 放在 helper 模块顶层即可随测试文件的收集一并注册，1,186 条用例全绿验证了这一点）；唯一真正不能提出去的是 `vi.mock`，而它逐字复制即可，见 1.5 偏差 1。**B-1 收紧后的合同是可执行的。**

### 7.2 S-2′：跳过 1 处 —— `LedgerAccessGate.tsx` 的 `PasswordField`

| | 内容 |
| --- | --- |
| **位置** | `main@5c825c2` 的 `LedgerAccessGate.tsx` 第 1069–1204 行；收尾时位于第 998–1133 行，**逐字节未变**（`shasum` `97888058…`，见 3.3） |
| **规模** | 136 行，是 `LedgerAccessGate.tsx` 主体外仅剩的全部非 `import` 内容 |
| **为什么没搬** | 该组件内部有 **6 个 hook 调用**，位于 `main@5c825c2` 的 `LedgerAccessGate.tsx` 第 1082–1093 行：`useLanguage()`（1082）、`useId()`（1083）、`useRef<HTMLInputElement>(null)`（1084）、`useState(false)`（1085）、`useEffect()`（1087）、`useEffect()`（1093）。本轮任务书的 **A-2 是绝对边界**：「不得移动、新增、删除任何 React hook 调用。那是 10 批的范畴，混进来会同时毁掉两批的可验收性。」搬动它会移动这 6 个 hook 调用 |
| **合同内部的张力，提请裁决** | `08A` **修订 A 的 S-2** 明确把「已有的小组件」列入可搬范围，第一轮据此搬走 `Section.tsx`／`SummaryMetricCard.tsx` 并通过了 `08D` 验收；而本轮任务书的 A-2 写的是「一个 hook 都不许移动」。两者在「含 hook 的既有小组件」这一点上冲突。**本轮按更严的一条执行（不搬），把 D-4 的「剩余接近 0」让给 A-2。** |
| **建议** | 若产品负责人认为「整体搬走一个既有组件」不改变该组件内部 hook 的类型与顺序、因而不属 A-2 所禁，则这是一笔十分钟的补充提交；否则留给 10 批 |

### 7.3 S-3′：未穷尽的可提取段落

本轮从两个巨型组件中提取了 10 个子组件。**`DashboardShell.tsx` 的主 JSX 中仍有更大的可提取段落未做**，主要是 `session === undefined` 分支下的若干 `<Section>`（图表、盈亏汇总、加交易、费率、数据管理等，约 400 行）与五个 workspace 分支。它们无 hook，原则上可提，但每个都需要 10～25 个 props，**props 清单的正确性无法像本轮这样用「JSX 逐字相同」一条机械命令自证**，风险收益比明显变差。

**这不是「拿不准所以跳过」，而是一条留给产品负责人的判断**：`DashboardShell.tsx` 现为 1,337 行，`08A` 修订 A 预估的「约 600」在**不切 hook 的前提下达不到**——真正占体积的是那一大块依赖十余个 state 的 JSX。**这与 `08A` 修订 A 已经明示的「`usePersistentLedger.ts` 基本不改善」是同一类结构性事实**，切它属于 10 批。

---

## 八、未完成事项清单（如实）

| # | 事项 | 状态 |
| --- | --- | --- |
| 1 | `PasswordField` 未搬出 `LedgerAccessGate.tsx` | 见 7.2，待裁决或留 10 批 |
| 2 | `DashboardShell.tsx` 主 JSX 的大段 `<Section>` 未提取 | 见 7.3，建议留 10 批 |
| 3 | S-4′ 分目录 | **按修订 D 的 D 节，已移出 08 批，本轮未做。产出目录结构与起点一致**（`src/app` 仍为一层扁平；文件数由 `main@5c825c2` 的 48 增至 103，全部由本轮拆分产生，无新增子目录） |
| 4 | `08A` 修订 C 的 G-1（`getWorkspaceFileStatus` 8 个返回分支中 7 个无真实断言）| **本轮未补测。** A-4 禁止改动既有测试，新增测试也超出本批「纯搬运」范围。仍建议留 10 批 |
| 5 | 运行时 DOM 等价性 | **未做独立的运行时验证。** 本轮的保证是静态的：JSX 逐字相同 + hook 序列相同 + 1,186 条用例全名与结果不变。**不得把本批引用为「运行时行为经过独立验证」**（沿用 `08D` 第五节的边界） |

---

## 九、强制否定性声明（R-8）

- 未改动任何既有测试的断言、阈值或用例名（Q-12 `diff` 为空，T-4 贪心块匹配 `uncovered=0`）。
- 未移动、未新增、未删除任何 React hook 调用（Q-8′ 四个文件序列 `IDENTICAL`）。
- 未使用 `React.memo`，未新增 `useMemo`／`useCallback`。
- 未新增任何包裹 DOM 元素。
- 未改动 `src/app/` 以外的任何文件。
- 未修改任何结构守卫。
- 未改动 `src/app/index.ts` 的导出集合（文件零改动）。
- 未引入新依赖，`package.json` 与 lockfile 零改动。
- 未 `push`、未合并 `main`、未 `rebase`／`amend`／`squash`。
- 未读取真实数据区。
- 未做 S-4′ 分目录。

---

## 十、留给下一个人的话

1. **本轮的核心证据不是「测试全绿」，是两条机械命令**：Q-12 的用例全名 `diff` 为空，以及 1.4／3.3／第四节的「逐字来源覆盖」检查（`uncovered=0`）。09 批 4 处中文被静默改写而 1,185 条测试全绿的教训，本轮已按合同要求正面处理。

2. **`vi.mock` 是拆测试文件时唯一真正不能共享的东西。** 若将来还要拆别的测试文件，这一条可以直接拿去用：`vi.mock` 逐字复制到每个新文件，其余 helper 一律提到 `testHelpers`。

3. **`DashboardShell.tsx`（1,337）与 `usePersistentLedger.ts`（1,763）仍然很大，这是预期之内的。** 本批的边界就是「不切 hook」，剩下的体积按定义属于 10 批。**不要把它当成本轮没做完。**
