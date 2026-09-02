# 08D_W15-main｜拆大文件与目录整理独立验收报告

- 日期：2026-09-02
- 轨道：长期账本产品 `main`
- 验收范围：**仅 `e0ff7df..ffbe0ff` 共 4 笔提交**（08 批第一轮）
- 对照基线：`main@e0ff7df`
- `ffbe0ff` 之后的 57 笔属 09 批，本报告**未读取、未评价**
- 验收者身份：独立验收，非执行者。**全程未修改任何源码或测试**（通电检查的临时破坏除外，均已还原并核对 SHA-256）

---

## 一、结论

### **PASS（通过）**

**一句话理由：这 4 笔提交经逐字节比对确认为真正的纯搬运——搬出的 104 行与搬入的 4 个新文件除 `import`／`export` 行外逐字相同，`DashboardShell.tsx` 剩余的 1,413 行主体字节完全一致，三个未改动的大文件 blob 哈希与基线完全相同，我自己重新导出的 hook 调用序列、测试用例全名全集、`src/app/index.ts` 导出集合三项均逐字节不变，我实跑的全部六道闸门全绿。**

**本批唯一可能的坏结局——「借重构之名夹带逻辑改动」——经机械核对确认没有发生。**

关于完成度（第一轮不足 10%）：依任务交代，该点已由产品负责人裁决，不构成 FAIL 理由。我核实了**「没做的确实是没做，而不是做坏了」**——三个未改动的大文件在 `ffbe0ff` 上与 `main@e0ff7df` **blob OID 与 SHA-256 双双相同**，7 个 600 行以上测试文件一个未拆且行数分毫未动。

**但 `08C` 的若干数字与实测不符（见第六节 P-1～P-4），在作为证据引用前必须更正。**其中 `DashboardShell.tsx` 的收尾行数被少报 18 行（报 1,462，实为 1,480），方向是**把成果说大了**；该错误已被 `08A` 修订 B 原样沿用。

---

## 二、我自己实跑的闸门

全部在 `ffbe0ff` 上执行。为避免污染用户的工作树，我用 `git worktree` 在 scratchpad 建立 `ffbe0ff` 与 `e0ff7df` 两个独立检出（共用 `node_modules` 软链），**用户源码仓库的工作树自始至终未被切换、未被修改**；验收结束后两个 worktree 已删除。

`npm run typecheck` 依要求**在 `npm run build` 之后串行执行**，六道闸门全程串行，无并行争抢。

### 2.1 默认全量 `npm test`

```text
 Test Files  106 passed (106)
      Tests  1185 passed (1185)
   Start at  11:26:56
   Duration  32.39s (transform 4.53s, setup 10.11s, import 11.40s, tests 98.70s, environment 16.91s)

EXIT_CODE=0
```

### 2.2 冻结派生等价性快照（Q-1）

命令：`npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts`

```text
 RUN  v4.1.9 .../wt-ffbe0ff

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  11:27:28
   Duration  1.65s (transform 48ms, setup 0ms, import 61ms, tests 1.50s, environment 0ms)

EXIT_CODE=0
```

**7/7 通过。**

### 2.3 `npm run lint`

```text
> local-first-trading-ledger@0.1.0 lint
> eslint . --max-warnings=0

EXIT_CODE=0
```

### 2.4 `npm run build`

```text
> local-first-trading-ledger@0.1.0 build
> next build

   ▲ Next.js 15.5.22

   Creating an optimized production build ...
 ✓ Compiled successfully in 4.2s
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (5/5)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                     365 kB         467 kB
└ ○ /_not-found                            990 B         103 kB
+ First Load JS shared by all             102 kB
  ├ chunks/17366005-1619c29227c12c5e.js  54.2 kB
  ├ chunks/800-8c75c36a57c4be63.js       46.1 kB
  └ other shared chunks (total)           1.9 kB

○  (Static)  prerendered as static content

EXIT_CODE=0
```

### 2.5 `npm run typecheck`（在 build 之后串行）

```text
> local-first-trading-ledger@0.1.0 typecheck
> tsc --noEmit

EXIT_CODE=0
```

### 2.6 结构守卫

命令：`npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts`

```text
 Test Files  2 passed (2)
      Tests  8 passed (8)
   Start at  11:27:45
   Duration  1.03s (transform 116ms, setup 168ms, import 145ms, tests 744ms, environment 0ms)

EXIT_CODE=0
```

### 2.7 Q-5 产物大小：我自己跑的**两端对照**

`08C` 只给了一个数。我在同一台机器、同一 `node_modules` 下**把基线也重新 build 了一次**，做同口径对照：

| 版本 | 首页 Size | First Load JS | `/_not-found` |
| --- | ---: | ---: | ---: |
| `e0ff7df`（基线，我实跑） | **364 kB** | **467 kB** | 990 B |
| `ffbe0ff`（我实跑） | **365 kB** | **467 kB** | 990 B |

**首页 Size +1 kB（+0.27%），First Load JS 零变化。** 判为「无显著变化」，Q-5 通过。该 +1 kB 是模块边界拆分带来的正常开销，与逻辑改动无关。

> 注：`08C` 第五节把改动后的首页 Size 记为 `364 kB`，实测为 `365 kB`（见 P-2）。

### 2.8 两项 whitespace 检查

```text
=== git diff --check (worktree ffbe0ff) ===
EXIT=0
=== git diff origin/main...ffbe0ff --check ===
EXIT=0
=== git diff e0ff7df...ffbe0ff --check ===
EXIT=0
=== 逐笔 git show --check ===
8b21b1f: clean
b602524: clean
00f2c58: clean
ffbe0ff: clean
```

**全部为空输出。**

### 2.9 四个版本号复核（Q-4／Q-10，指向权威定义处）

我没有只比对数值，而是**先比对三个权威定义文件的 SHA-256**——这比比对数值更强：文件整体未变，则其中任何版本号都不可能变。

```text
src/platform/files/ledgerFileContract.ts
  sha256 e0ff7df: f55c2e6dba42a1e683852eed0d90706dff7673c4a7064084abf87dd1f30bcabc
  sha256 ffbe0ff: f55c2e6dba42a1e683852eed0d90706dff7673c4a7064084abf87dd1f30bcabc

src/features/backup/backupEnvelope.ts
  sha256 e0ff7df: 67b2f0455ae89527851df75590d70a4493f65f58d0872ce6912c7fffeb854cb0
  sha256 ffbe0ff: 67b2f0455ae89527851df75590d70a4493f65f58d0872ce6912c7fffeb854cb0

src/platform/files/ledgerFileChunkedContainerV3.ts
  sha256 e0ff7df: 38e620f7082d7b764dc2b749334eb675571a3b45c8c7c346b10ff9f0b31d7175
  sha256 ffbe0ff: 38e620f7082d7b764dc2b749334eb675571a3b45c8c7c346b10ff9f0b31d7175
```

**三个文件字节完全相同。** 权威定义处的当前取值（`ffbe0ff` 原始输出）：

| 版本号 | 权威定义处 | 取值 |
| --- | --- | ---: |
| `fileFormatVersion`（当前写出） | `ledgerFileChunkedContainerV3.ts:24` | **3** |
| `cryptoVersion` | `ledgerFileChunkedContainerV3.ts:25` | **1** |
| `ledgerSchemaVersion` | `ledgerFileContract.ts:31` `SUPPORTED_LEDGER_SCHEMA_VERSION` | **4** |
| `backupFormatVersion` | `backupEnvelope.ts:20` `BACKUP_FORMAT_VERSION` | **3** |

```text
src/platform/files/ledgerFileChunkedContainerV3.ts
24:  fileFormatVersion: 3,
25:  cryptoVersion: 1,
26:  ledgerSchemaVersion: 4,
27:  backupFormatVersion: 3,

src/platform/files/ledgerFileContract.ts
31:export const SUPPORTED_LEDGER_SCHEMA_VERSION = 4 as const;
15:  fileFormatVersion: 2,      ← LEDGER_FILE_OUTER_V2_CONSTANTS（历史 V2 外壳，非当前写出）
16:  cryptoVersion: 1,

src/features/backup/backupEnvelope.ts
20:export const BACKUP_FORMAT_VERSION = 3 as const;
```

**未引用镜像常量块 `LEDGER_FILE_OUTER_V3_S3_CONSTANTS`**（07 批教训已规避）。四个版本号全部不变，H-1 未触发。

### 2.10 Q-7 新建展示组件的 hook 计数

命令：`grep -cE "\buse[A-Z][A-Za-z]*\(" <文件>`

```text
src/app/SummaryMetricCard.tsx:0
src/app/Section.tsx:0
```

**均为 0。** 我另用更宽的网复查（`grep -nE "\buse[A-Z]"`，连不带括号的标识符也抓）：

```text
（无输出，exit 1）
```

顺带核查另外两个新文件：

```text
src/app/DashboardShellHelpers.ts:0
src/app/DashboardShellTypes.ts:0
```

### 2.11 Q-2 测试用例全名全集（我自己在两端各导出一次）

我没有采信 `08C` 的 1185 这个数，而是在两个 worktree 上各跑一次 `npx vitest list`，排序后比对：

```text
=== 含文件路径的完整名称，排序后 diff ===
>>> IDENTICAL (0 differences) <<<
=== 剥离文件路径、只留 describe 链 + 用例名，排序后 diff ===
>>> IDENTICAL (0 differences) <<<
=== 总数 ===
e0ff7df: 1185 test names
ffbe0ff: 1185 test names
=== 排序后名称集合的 sha256 ===
e0ff7df: ba033b60dd004bd65577b6c20cd2f9c10c16645e377e85c8374c9cda74273e31
ffbe0ff: ba033b60dd004bd65577b6c20cd2f9c10c16645e377e85c8374c9cda74273e31
```

**两端 SHA-256 完全相同。** 含文件路径的版本也相同，这一条额外证明**没有任何测试文件被拆分、改名或移动**。H-2 未触发。

### 2.12 逐笔提交的绿灯复核（C-2）

`08C` 声称每笔提交前都跑过 `npm test`。我在 worktree 上逐个检出这 4 笔各跑一次全量：

```text
8b21b1f refactor: extract dashboard shell types      npm test EXIT=0   Test Files 106 passed (106)   Tests 1185 passed (1185)
b602524 refactor: extract dashboard shell helpers    npm test EXIT=0   Test Files 106 passed (106)   Tests 1185 passed (1185)
00f2c58 refactor: extract dashboard section          npm test EXIT=0   Test Files 106 passed (106)   Tests 1185 passed (1185)
ffbe0ff refactor: extract summary metric card        npm test EXIT=0   Test Files 106 passed (106)   Tests 1185 passed (1185)
```

**四笔逐笔全绿，无中间红态。**

---

## 三、我自己逐行比对的

### 3.1 改动面：只有 5 个文件，全部在 `src/app/`

```text
$ git diff --numstat e0ff7df ffbe0ff
9	104	src/app/DashboardShell.tsx
47	0	src/app/DashboardShellHelpers.ts
1	0	src/app/DashboardShellTypes.ts
20	0	src/app/Section.tsx
34	0	src/app/SummaryMetricCard.tsx
```

**A-5 满足**：`core`／`features`／`platform`／`ui`／`test-support` 五区零改动。

`src/app/` 文件名清单 diff（无删除、无改名，只有 4 个新增）：

```text
> src/app/DashboardShellHelpers.ts
> src/app/DashboardShellTypes.ts
> src/app/Section.tsx
> src/app/SummaryMetricCard.tsx
```

### 3.2 核心问题一：这 4 笔是不是真正的纯搬运？

**是。我把搬出的每一行与搬入的每一行做了机械 diff，除 `import`／`export` 行外逐字相同。**

方法：从 `e0ff7df:src/app/DashboardShell.tsx` 取出被删除的原始行区间，从 `ffbe0ff` 取出四个新文件，对新文件**只剥掉 `import` 行与行首的 `export ` 前缀**，然后 `diff`。

```text
###### UNIT A: ClearConfirmationMode（旧 67 行 vs DashboardShellTypes.ts:1） ######
IDENTICAL
###### UNIT B: 常量+纯函数（旧 64,65,69-110 vs DashboardShellHelpers.ts 3,4,6-47） ######
IDENTICAL
###### UNIT C: Section（旧 112-129 vs Section.tsx 3-20） ######
IDENTICAL
###### UNIT D: SummaryMetricCard（旧 131-161 vs SummaryMetricCard.tsx 4-34） ######
IDENTICAL
```

**四个搬运单元全部逐字相同，零差异。**

**留在原文件的部分也必须没变。** 我把两端 `DashboardShell.tsx` 从 `export function DashboardShell` 到文件末尾整段对比：

```text
=== old total: 1575  new total: 1480
=== body starts: old line 163 / new line 68
=== DIFF OF BODY (from 'export function DashboardShell' to EOF) ===
>>> BODY BYTE-IDENTICAL, 0 differences <<<
```

**1,413 行主体字节完全一致。** 结合 3.1 的 numstat（新增 9 行、删除 104 行），可以断定：**新增的 9 行全部是 `import` 语句，删除的 104 行全部被逐字搬进了 4 个新文件。**

`DashboardShell.tsx` 头部的改动经我逐行读过，只有两类：删掉 3 个不再需要的 type import（`ReactNode`、`SummaryMetric`、`FileStatusTone`），新增 4 条指向新文件的 import（第 58–66 行）。**没有任何一行是逻辑。**

### 3.3 核心问题二：hook 有没有被动过？

**没有。我在 `e0ff7df` 与 `ffbe0ff` 上各自重新导出，未采信 `08C` 的 I-7 清单。**

我用的正则**比 `08C` 更宽**——`08C` 只抓 `use(State|Effect|Ref|Memo|Callback)`，我把 `useReducer`／`useLayoutEffect`／`useId`／`useContext`／`useTransition` 等全部 React 内建 hook 一并纳入。结果：

```text
##### src/app/usePersistentLedger.ts #####
  count e0ff7df=35  ffbe0ff=35
  => SEQUENCE IDENTICAL
  序列: useReducer,useState,useState,useReducer,useState,useRef,useRef,useRef,useRef,useRef,
        useRef,useRef,useRef,useRef,useLayoutEffect,useCallback,useMemo,useMemo,useCallback,
        useCallback,useCallback,useEffect,useEffect,useEffect,useEffect,useEffect,useEffect,
        useCallback,useCallback,useCallback,useCallback,useCallback,useCallback,useCallback,useCallback

##### src/app/DashboardShell.tsx #####
  count e0ff7df=19  ffbe0ff=19
  => SEQUENCE IDENTICAL
  序列: useState,useState,useState,useState,useState,useState,useState,useState,useRef,useRef,
        useRef,useEffect,useEffect,useEffect,useEffect,useLayoutEffect,useEffect,useEffect,useEffect

##### src/app/LedgerAccessGate.tsx #####
  count e0ff7df=13  ffbe0ff=13
  => SEQUENCE IDENTICAL
  序列: useState,useState,useState,useState,useRef,useRef,useRef,useCallback,useEffect,useId,
        useState,useEffect,useEffect

##### src/app/ledgerFileAccessController.ts #####
  count e0ff7df=0  ffbe0ff=0
  => SEQUENCE IDENTICAL
```

**四个文件的 hook 调用序列（类型与顺序）逐项相同，Q-8 通过，A-8／S-X1 满足。**

**同时发现 `08C` 的 I-7 基线清单是不完整的**（见 P-3）：它漏掉了 `usePersistentLedger.ts` 的 2 个 `useReducer` 与 1 个 `useLayoutEffect`、`DashboardShell.tsx` 的 1 个 `useLayoutEffect`、`LedgerAccessGate.tsx` 的 1 个 `useId`，共 5 个。**结论不受影响（我用更宽的网重验，仍然全等），但那份基线本身当时抓不住 `useReducer`／`useLayoutEffect`／`useId` 被移动的情况。**

### 3.4 核心问题三：`src/app/index.ts` 的导出集合有没有变？

**没有，文件字节完全相同。**

```text
sha256 e0ff7df: f0c582411b4928677cd0cceff6e3c4214bfd625d309f2d1e31fbbf456183b711
sha256 ffbe0ff: f0c582411b4928677cd0cceff6e3c4214bfd625d309f2d1e31fbbf456183b711
```

内容（两端一致），3 条 `export` 语句、7 个符号：

```ts
export type {
  ApplyLedgerActionResult,
  PersistenceOperation,
  PersistenceStatus,
  PersistentLedgerState,
} from "./usePersistentLedger";
export type { HydrationStatus } from "./hydrationState";
export type {
  PriceWorkspaceDraft,
  TradeWorkspaceDraft,
} from "./workspaceDrafts";
```

**Q-9／A-10 通过，`@/app` 的对外形状一字未变。**

### 3.5 Q-6 外部 `@/app` 引用

我在两端各检索一次并 diff：

```text
>>> @/app REFERENCE SET IDENTICAL <<<
```

`ffbe0ff` 原始输出（12 条 import 语句，分布在 11 个文件）：

```text
src/features/asset-transfers/AssetTransferPanel.tsx:8:} from "@/app";
src/features/assets/LocalAssetManager.tsx:8:} from "@/app";
src/features/backup/BackupControls.tsx:32:} from "@/app";
src/features/backup/BackupControls.tsx:34:import type { HydrationStatus } from "@/app";
src/features/cash/CashEventPanel.tsx:8:} from "@/app";
src/features/fees/FeeRuleManager.tsx:8:} from "@/app";
src/features/market-data/MarketDataControls.test.tsx:14:import type { ApplyLedgerActionResult } from "@/app";
src/features/market-data/MarketDataControls.tsx:8:} from "@/app";
src/features/prices/PriceForm.test.tsx:11:} from "@/app";
src/features/prices/PriceForm.tsx:9:} from "@/app";
src/features/trades/TradeForm.test.tsx:11:} from "@/app";
src/features/trades/TradeForm.tsx:16:} from "@/app";
```

深层引用检查：

```text
=== grep -rn 'from "@/app/' src ===
(none)
```

**无任何 `@/app/xxx` 深层引用。** 关于「11 处」与「12 处」的口径差异见 P-4——**11 是文件数，12 是 import 语句数，两端完全相同，不影响判定。**

四个新文件的 import 行（F-3 核查，`src/app/` 内部互引全用相对路径，跨区引用沿用原文件既有写法）：

```text
src/app/DashboardShellTypes.ts    : （无 import）
src/app/DashboardShellHelpers.ts:1: import type { FileStatusTone } from "@/ui";
src/app/Section.tsx:1             : import type { ReactNode } from "react";
src/app/SummaryMetricCard.tsx:1   : import type { SummaryMetric } from "@/features/portfolio";
src/app/SummaryMetricCard.tsx:2   : import { LedgerNumber } from "@/ui";
```

### 3.6 Q-10 依赖零改动

```text
$ git diff --stat e0ff7df ffbe0ff -- package.json package-lock.json
（空）
sha256 package.json      e0ff7df / ffbe0ff: e3c5fa29...（相同）
sha256 package-lock.json e0ff7df / ffbe0ff: b8c0c03d...（相同）
```

**A-7 满足，未引入任何依赖。**

### 3.7 「没做的确实是没做，而不是做坏了」

这是任务要求我核实的那一条。**三个未改动的大文件在 `ffbe0ff` 上与 `main@e0ff7df` blob OID 与 SHA-256 双双相同**：

```text
src/app/usePersistentLedger.ts
  blob   e0ff7df = 751308ad8b45955714e063c19bdb0f0af4729c0e
  blob   ffbe0ff = 751308ad8b45955714e063c19bdb0f0af4729c0e
  sha256 e0ff7df = 99e1bba45f3ace55bcc716d79a8b1a7648b17d0146c58afcea3a01020a4b19cf
  sha256 ffbe0ff = 99e1bba45f3ace55bcc716d79a8b1a7648b17d0146c58afcea3a01020a4b19cf
  => IDENTICAL

src/app/LedgerAccessGate.tsx
  blob   e0ff7df = 619f05a92f964d60a6bb293597e11337ad8fca6a
  blob   ffbe0ff = 619f05a92f964d60a6bb293597e11337ad8fca6a
  sha256 e0ff7df = 398cd5514134e7659ea64a627d36334cdb31932cfa340aa70fa6efe02ed9a120
  sha256 ffbe0ff = 398cd5514134e7659ea64a627d36334cdb31932cfa340aa70fa6efe02ed9a120
  => IDENTICAL

src/app/ledgerFileAccessController.ts
  blob   e0ff7df = 537d0ea2015b0494398ad573c649d2e9bcb688c3
  blob   ffbe0ff = 537d0ea2015b0494398ad573c649d2e9bcb688c3
  sha256 e0ff7df = 94c22890e905ce625c2eb6a42cf0df3676a817a2acebcb3ff518231a8b862c69
  sha256 ffbe0ff = 94c22890e905ce625c2eb6a42cf0df3676a817a2acebcb3ff518231a8b862c69
  => IDENTICAL
```

**这三个文件确实是「一个字节没碰」，不是「碰了但看不出来」。**

### 3.8 我自己实测的文件与行数对照（不采信 `08C`）

命令：`find src/app -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | xargs -0 wc -l | sort -nr`

| 项目 | `e0ff7df` | `ffbe0ff` | 变化 |
| --- | ---: | ---: | ---: |
| `src/app/` 文件数 | 41 | **45** | +4 |
| `src/app/` 总行数 | 24,070 | **24,077** | +7 |
| `DashboardShell.tsx` | 1,575 | **1,480** | **−95** |
| `usePersistentLedger.ts` | 1,963 | 1,963 | 0 |
| `LedgerAccessGate.tsx` | 1,276 | 1,276 | 0 |
| `ledgerFileAccessController.ts` | 1,172 | 1,172 | 0 |

7 个 600 行以上测试文件，在 `ffbe0ff` 上**行数分毫未动**，合计 **12,097** 行：

```text
2853 src/app/usePersistentLedger.test.tsx
2298 src/app/DashboardShell.interaction.test.tsx
1922 src/app/LedgerAccessGate.test.tsx
1905 src/app/ledgerFileAccessController.test.ts
1271 src/app/usePersistentLedger.fileCapabilities.test.tsx
1149 src/app/usePersistentLedger.fileImport.test.tsx
 699 src/app/TransactionsWorkspace.test.tsx
```

**与 `08A` 修订 B 对完成度的描述一致（S-1 一个未拆、另三个大文件零改动），唯一不符的是 `DashboardShell.tsx` 的收尾行数（1,480 而非 1,462）。**

---

## 四、通电检查

合同要求至少 2 次。**我做了 4 次有效通电（含 1 次基线对照），其中 2 次确认变红、1 次未变红并已追查根因、1 次为基线对照。**

> 过程说明（如实记录）：我最初的一轮 `perl` 替换因未加 `-Mutf8`，中文字面量未被匹配，`git diff` 为空——**破坏根本没落地**。我发现后作废了那一轮，加了「diff 为空则中止本例」的守卫重做。**下文只采用破坏确实落地的那些。**

### 通电 1（变红 ✅）：`SummaryMetricCard.tsx` 的取值分支

破坏内容——把三元判据从 `undefined` 改成 `null`，使「不可完整计算」分支永不命中：

```diff
--- a/src/app/SummaryMetricCard.tsx
+++ b/src/app/SummaryMetricCard.tsx
@@ -14,7 +14,7 @@ export function SummaryMetricCard({
      <p className="mt-2 text-xl font-semibold text-slate-950">
-        {metric.value === undefined ? (
+        {metric.value === null ? (
           "不可完整计算"
```

变红输出：

```text
NPM_TEST_EXIT=1
 Test Files  2 failed | 104 passed (106)
     × shows the fixed fee-aware buy, partial sell, and price example through real forms 407ms
     × withholds fee-sensitive UI values for an old foreign-fee fact without hiding market value or heatmap counts 53ms
     × runs golden, price, oversell, and deletion scenarios through the real forms 394ms
     × separates an accepted trade from pending and completed local persistence 350ms
     × lets the user retry the latest failed local save 388ms
     × requires explicit confirmation before abandoning dirty state for a repository switch 271ms
     × creates a validated buy and updates both the trade list and positions 333ms
     × requires explicit fee candidate adoption and persists a user override as history 317ms
     × blocks deletion when removing a buy would invalidate a later sell 250ms
     × deletes a safe trade and updates both empty states 371ms
```

还原核对：

```text
SHA256_BEFORE        = d1e76f39aacff70d4961d5b74fd78b9164ba62ec238a4598d577eb2fcd6bdfc6
SHA256_AFTER_RESTORE = d1e76f39aacff70d4961d5b74fd78b9164ba62ec238a4598d577eb2fcd6bdfc6
RESTORE_OK=YES        git status after restore: []
```

### 通电 2（变红 ✅）：`Section.tsx` 的标题渲染

破坏内容：

```diff
--- a/src/app/Section.tsx
+++ b/src/app/Section.tsx
@@ -11,7 +11,7 @@ export function Section({
         <div>
-          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
+          <h2 className="text-lg font-semibold text-slate-950">{"BROKEN_BY_ACCEPTANCE_CHECK"}</h2>
         </div>
```

变红输出：

```text
NPM_TEST_EXIT=1
 Test Files  2 failed | 104 passed (106)
     × shows the fixed fee-aware buy, partial sell, and price example through real forms 1037ms
     × withholds fee-sensitive UI values for an old foreign-fee fact without hiding market value or heatmap counts 202ms
     × runs golden, price, oversell, and deletion scenarios through the real forms 1686ms
     × requires explicit confirmation before abandoning dirty state for a repository switch 507ms
     × creates a validated buy and updates both the trade list and positions 460ms
     × creates, versions, and deactivates fee rules only after authenticated persistence 175ms
     × requires explicit fee candidate adoption and persists a user override as history 243ms
     × shows exact-match conflicts and never auto-selects the first active rule 469ms
     × shows validator feedback and keeps the ledger unchanged for invalid input 355ms
     × blocks deletion when removing a buy would invalidate a later sell 662ms
     × deletes a safe trade and updates both empty states 483ms
     × saves a manual price and updates market value and unrealized PnL 643ms
```

还原核对：

```text
SHA256_BEFORE        = 7e90d818b1ac1def45d60ea357742718f6c2969915bffa85eeb83cd02217597b
SHA256_AFTER_RESTORE = 7e90d818b1ac1def45d60ea357742718f6c2969915bffa85eeb83cd02217597b
RESTORE_OK=YES        git status after restore: []
```

**通电 1 与 2 满足合同「至少 2 次」的要求：两个新建展示组件都确实被测试网住了，不是空壳。**

### 通电 3（**未变红** ⚠️，已追查根因）：`DashboardShellHelpers.ts` 的 `saved` 分支标签

破坏内容（这次确实落地了）：

```diff
--- a/src/app/DashboardShellHelpers.ts
+++ b/src/app/DashboardShellHelpers.ts
@@ -38,7 +38,7 @@ export function getWorkspaceFileStatus({
   if (persistenceStatus === "saved") {
-    return { label: "已保存到加密文件", tone: "saved" };
+    return { label: "BROKEN_BY_ACCEPTANCE_CHECK", tone: "saved" };
   }
```

结果：

```text
NPM_TEST_EXIT=0
 Test Files  106 passed (106)
```

**依任务要求，我没有直接下「测试是空的」的结论，而是先追查是否有第二条路径兜住。追查结果：没有第二条路径，这是一处真实的断言缺口。**

追查证据：

```text
=== 谁调用 getWorkspaceFileStatus？ ===
src/app/DashboardShell.tsx:61:  getWorkspaceFileStatus,          ← import
src/app/DashboardShell.tsx:514:  const fileStatus = getWorkspaceFileStatus({   ← 真实调用点
src/app/DashboardShellHelpers.ts:10:export function getWorkspaceFileStatus({

=== 字面量「已保存到加密文件」在全仓的出现处 ===
src/app/LedgerWorkspaceFrame.test.tsx:19:        fileStatusLabel="已保存到加密文件"
src/app/LedgerWorkspaceFrame.test.tsx:36:      "已保存到加密文件",
src/app/DashboardShellHelpers.ts:41:    return { label: "已保存到加密文件", tone: "saved" };
```

关键点：**`LedgerWorkspaceFrame.test.tsx` 是把该字符串当作 prop 字面量硬编码传进去的**，它测的是「Frame 能否把给它的 label 渲染出来」，**根本不经过 `getWorkspaceFileStatus`**：

```tsx
<LedgerWorkspaceFrame
  currentPage="home"
  fileStatusLabel="已保存到加密文件"   ← 硬编码的入参，不是被测函数的产物
  fileStatusTone="saved"
  ...
```

该函数 8 个返回分支的断言覆盖情况（我逐个检索）：

| 标签 | 测试命中 | 性质 |
| --- | ---: | --- |
| `切换已阻止` | 0 | 无断言 |
| `正在读取账本` | 0 | 无断言 |
| `文件需要处理` | 1 | **否定断言**（`queryByText(...)).toBeNull()`，改标签反而更容易通过，不构成保护） |
| `只读账本` | 0 | 无断言 |
| `正在保存到加密文件` | 0 | 无断言 |
| `已保存到加密文件` | 0（仅 prop 字面量） | 无断言 |
| `有修改等待保存` | 0 | 无断言 |
| `加密文件已连接` | 1 | **唯一的真实肯定断言**（`DashboardShell.golden.test.tsx:201`） |

**该函数是活代码（`DashboardShell.tsx:514` 真实调用），但 8 个分支里只有 1 个被真正断言。**

### 通电 4（基线对照）：证明这个缺口是既有的，不是本批造成的

我在 `e0ff7df` 上对**同一段代码**（当时还在 `DashboardShell.tsx` 里面）施加**同一个破坏**：

```diff
--- a/src/app/DashboardShell.tsx     （基线 e0ff7df）
@@ -101,7 +101,7 @@ function getWorkspaceFileStatus({
   if (persistenceStatus === "saved") {
-    return { label: "已保存到加密文件", tone: "saved" };
+    return { label: "BROKEN_BY_ACCEPTANCE_CHECK", tone: "saved" };
```

```text
NPM_TEST_EXIT=0
 Test Files  106 passed (106)

BASELINE SHA256_BEFORE        = 80e8bd875baf1785de1e8ec8a5c2a3b33295615334e1c69c85d043b108ed930b
BASELINE SHA256_AFTER_RESTORE = 80e8bd875baf1785de1e8ec8a5c2a3b33295615334e1c69c85d043b108ed930b
RESTORE_OK=YES        git status: []
```

**基线上同样不变红。该缺口在 08 批开工之前就存在，本批既未引入也未加重它**（被搬运的函数体逐字节相同）。**因此它不构成对 08 批的扣分，但必须记录**——见 P-5。

### 通电检查还原总表

| 编号 | 目标文件 | 破坏是否落地 | 是否变红 | 还原前 SHA-256 | 还原后 SHA-256 | 一致 |
| --- | --- | --- | --- | --- | --- | --- |
| 通电 1 | `src/app/SummaryMetricCard.tsx` | 是 | **红 ✅** | `d1e76f39…6bdfc6` | `d1e76f39…6bdfc6` | ✅ |
| 通电 2 | `src/app/Section.tsx` | 是 | **红 ✅** | `7e90d818…17597b` | `7e90d818…17597b` | ✅ |
| 通电 3 | `src/app/DashboardShellHelpers.ts` | 是 | 绿 ⚠️ | `9e39397d…4a4876` | `9e39397d…4a4876` | ✅ |
| 通电 4 | `src/app/DashboardShell.tsx`（基线） | 是 | 绿（对照） | `80e8bd87…ed930b` | `80e8bd87…ed930b` | ✅ |
| （作废）| `DashboardShellHelpers.ts`／`SummaryMetricCard.tsx` | **否**（编码问题，diff 为空） | — | 未变 | 未变 | ✅ |

**全部 4 次破坏均已还原，还原前后 SHA-256 逐个一致，`git status` 为空。**

---

## 五、我**未核验**的事项（如实列出，不用别的数字顶替，不作推断）

以下各项我**没有**独立验证，不应把本报告当作它们的证据：

| 编号 | 未核验事项 | 说明 |
| --- | --- | --- |
| **N-1** | **I-8 下划线前缀路由探针本身** | 我没有重建 `src/app/_routeProbe/page.tsx` 复跑三次 build。我只能证明：`ffbe0ff` 的 build Route 列表**只有 `/` 与 `/_not-found`**，不存在任何多余路由。「下划线目录不产生路由」这一结论我未独立复现 |
| **N-2** | **`08C` 第七节一档跳过项的调查依据** | 修订 B 的 B-5 要求给出 I-5 式的「JSX 无 hook 段落枚举」。`08C` 只给了结论。我未自行枚举 `DashboardShell.tsx` 与 `LedgerAccessGate.tsx` 巨型组件内部可提取的 JSX 段落，因此**无法判断「提不出更多」是否属实** |
| **N-3** | **`LedgerAccessGate.tsx` 的 `AccessPanel`／`FormError` 可抽性** | `08C` 称二者可抽但本轮不做，`PasswordField` 因含 hook 不可抽。我未核验这三项判断 |
| **N-4** | **7 个测试文件「找不到干净关注点边界」的理由是否成立** | 我只核实了它们确实未被改动。该理由已被修订 B 判定为不成立（B-1），属已裁决事项，我未另行取证 |
| **N-5** | **真实运行时 DOM 等价性** | 我没有启动应用、没有做渲染 DOM 的前后快照对比。「渲染结果不变」是从「JSX 逐字节相同 + hook 序列不变 + 1185 用例全绿」推出的，**不是直接观测到的** |
| **N-6** | **`derivedSnapshot` 以外的其他 benchmark** | 只按任务要求跑了冻结派生等价性快照，未跑 `bench:node`／`bench:browser`／`bench:m9` 等 |
| **N-7** | **`08C` 声称「每笔提交之前」跑过测试** | 我核实的是**这 4 笔提交的每一笔在今天重跑均为全绿**（2.12），这与「当时提交前跑过」不是同一件事，后者无法事后取证 |
| **N-8** | **`ffbe0ff` 之后的 57 笔（09 批）** | 依任务边界，未读取、未运行、未评价 |
| **N-9** | **`e0ff7df` 及之前的历史（07 批及更早）** | 只作为基线使用，未验收 |

---

## 六、发现的问题与建议处置

**没有发现任何逻辑夹带。** 以下全部是**文档口径**问题与**一条既有的测试缺口**，按严重度排列。

### P-1（中）`08C` 把 `DashboardShell.tsx` 的收尾行数少报了 18 行，方向是把成果说大

- **实测**：1,575 → **1,480**（−95）。`08C` 第四节与 `08A` 修订 A／B 均写 **1,462**（−113）。
- **根因**：113 是 `git diff --stat` 的**变更行合计**（9 新增 + 104 删除），不是净减少。净减少是 104 − 9 = 95。
- **影响**：`08A` 修订 B 「1,575 → 1,462」原样沿用了这个错误。数字方向是**高估成果**，虽然不改变「第一轮完成度不足 10%」这一已裁决结论，但作为证据不可直接引用。
- **建议**：更正 `08C` 第四节与 `08A` 修订 B 的该数字为 **1,480**。**不需要改动任何源码。**

### P-2（低）`08C` 第五节把改动后的首页 Size 记成了基线值

- **实测（同机同 `node_modules` 两端对照）**：基线 `364 kB` → `ffbe0ff` **`365 kB`**；First Load JS 两端均 `467 kB`。
- `08C` 记 `364 kB`，等于把基线数字当成了改动后的数字。
- **影响**：Q-5 判定不受影响（+1 kB／+0.27%，确属「无显著变化」），但对照表失真。
- **建议**：更正为 `365 kB`，并注明 First Load JS 零变化。

### P-3（中）`08C` 的 I-7 hook 基线正则过窄，漏掉 5 个 hook

- `08C` 用 `use(State|Effect|Ref|Memo|Callback)`，**漏抓** `useReducer`（`usePersistentLedger.ts` ×2）、`useLayoutEffect`（`usePersistentLedger.ts` ×1、`DashboardShell.tsx` ×1）、`useId`（`LedgerAccessGate.tsx` ×1）。
- 实际计数：`usePersistentLedger.ts` **35**（`08C` 记 32）、`DashboardShell.tsx` **19**（记 18）、`LedgerAccessGate.tsx` **13**（记 12）。
- **影响**：**结论不受影响**——我用覆盖全部 React 内建 hook 的更宽正则在两端重验，序列仍逐项全等。但 `08C` 当时的那份基线**抓不住 `useReducer`／`useLayoutEffect`／`useId` 被移动的情况**，即 Q-8 的防护网当时是漏的。
- **建议**：把 `08B` Q-8 与 `08A` S-X1 的正则口径扩展为全部 React 内建 hook（至少加上 `useReducer|useLayoutEffect|useId|useContext|useTransition|useDeferredValue|useSyncExternalStore|useImperativeHandle|useInsertionEffect`），并在 08 第二轮与 10 批沿用。

### P-4（低）「外部 `@/app` 引用 11 处」是文件数，不是引用数

- **实测**：**12 条 import 语句**分布在 **11 个文件**（`BackupControls.tsx` 有 2 条）。
- 两端集合逐行相同，Q-6 通过。
- **建议**：在 `08A` 2.2 与 `08B` Q-6 中写明口径为「11 个文件、12 条 import 语句」，避免后续批次拿 11 去比对 12 而误判。

### P-5（中，**既有问题，不属本批**）`getWorkspaceFileStatus` 8 个分支只有 1 个被真正断言

- 通电 3 与通电 4 共同证明：该函数是活代码，但改掉 `saved` 分支的标签**全量测试仍然全绿**，且**基线上同样不红**——缺口是既有的，本批既未引入也未加重。
- 8 个分支中：1 个有真实肯定断言（`加密文件已连接`）、1 个只有否定断言（`文件需要处理`，改标签反而更易通过）、**6 个完全无断言**。
- **对本批的意义**：这说明「全量绿」本身**并不足以**为这个文件的搬运背书。**本批的保证来自我做的逐字节比对，不是来自测试全绿**——这一点在采信本报告时必须记住。
- **处置建议**：依 `08A` A-2「发现真问题记下来，另开批次」，**本批不修**。建议在 08 第二轮或 10 批为该函数补一组直接的单元测试（8 个分支各一条，走真实调用路径而非 prop 字面量）。**在补上之前，任何触及 `getWorkspaceFileStatus` 的改动都不得只凭「测试全绿」申报。**

### P-6（信息）本批 `src/app/` 总行数净增 7 行

- 24,070 → 24,077。原因是 4 个新文件各自的 `import` 头与 `export` 声明。属纯搬运的正常开销，不构成问题，记录以免后续批次误读为「拆分反而变长」。

---

## 七、合同闸门逐条判定

| 编号 | 闸门 | 判定 | 依据 |
| --- | --- | --- | --- |
| Q-1 | 冻结派生等价性快照 7/7 | **通过** | 2.2，我实跑 |
| Q-2 | 用例全名全集不变 | **通过** | 2.11，两端导出 SHA-256 相同 |
| Q-3 | 全量／typecheck／lint／build／守卫／两项 whitespace | **通过** | 2.1、2.3–2.6、2.8，我实跑 |
| Q-4 | 四个版本号不变 | **通过** | 2.9，权威定义文件字节相同 |
| Q-5 | 产物大小无显著变化 | **通过** | 2.7，两端对照 +1 kB／FLJS 零变化（`08C` 数字需更正，P-2） |
| Q-6 | `@/app` 引用照旧、无深层引用 | **通过** | 3.5，两端集合逐行相同 |
| Q-7 | 新建展示组件 `use[A-Z]` 计数为 0 | **通过** | 2.10 |
| Q-8 | 四个大文件 hook 序列不变 | **通过** | 3.3，我用更宽正则两端重验（`08C` 基线口径需扩展，P-3） |
| Q-9 | `src/app/index.ts` 导出集合不变 | **通过** | 3.4，文件 SHA-256 相同 |
| Q-10 | `package.json` 与 lockfile 零改动 | **通过** | 3.6 |
| A-1 | 不改变任何外部行为 | **通过** | 3.2，逐字节比对 |
| A-5 | 只动 `src/app/` | **通过** | 3.1 |
| A-8／S-X1 | 未移动任何 hook | **通过** | 3.3 |
| A-9／S-X3 | 未用 `memo`／新增 `useMemo`／`useCallback` | **通过** | 2.10，新文件 `use[A-Z]` 计数为 0 |
| S-X2 | 未新增包裹 DOM 元素 | **通过** | 3.2，Unit C／D 逐字相同，JSX 根节点未变 |
| H-1～H-4 | 三档停止条件 | **均未触发** | 2.9、2.11、2.6、2.12 |

---

## 八、收尾状态表

| 项目 | 状态 |
| --- | --- |
| 源码仓库工作树是否 clean | **是**。`git status --porcelain` 输出 0 条 |
| 源码仓库分支／HEAD 是否被我改动 | **否**。开始与结束均为 `zhennn/w15-main-app-split` @ `8fd0b6e`，我一次都没有切换用户的工作树 |
| 是否修改过任何源码或测试 | **否**。全部读取与实跑在 scratchpad 的两个临时 `git worktree` 中进行 |
| 通电检查是否全部还原 | **是**。4 次破坏全部 `git checkout -- <文件>` 还原，还原前后 SHA-256 逐个一致（见第四节总表），破坏均发生在临时 worktree 内 |
| 临时 worktree 是否清理 | **是**。`git worktree remove --force` 已删除两个，`git worktree list` 只剩用户的主工作树 |
| 是否执行过 merge | **否** |
| 是否执行过 push | **否**。`origin/main` 仍为 `8df62d8`，本地 `main` 仍为 `e0ff7df`，两者关系未被我改变 |
| 是否执行过 rebase／amend／squash／reset --hard／clean -fd | **否** |
| 源码仓库是否产生任何提交 | **否** |
| 是否读取 `~/Downloads/history_OKX/` 或真实 `.lftl`／B 文件 | **否** |
| 根文档仓库改动 | **只新建本文件 `08D` 一个**，中文 commit，与源码仓库分别检查、分别提交 |
| 是否读取或评价 09 批的 57 笔 | **否** |

---

## 九、给产品负责人的一句话

**这 4 笔可以放心合入：它们是我能验证的最干净的一种 refactor——搬走的每一个字节都对得上，留下的每一个字节都没动。**

合入决定权在你，我不授权合入。合入前建议先按第六节 P-1～P-4 更正 `08C` 与 `08A` 修订 B 的四处数字，并把 P-5 那条既有的断言缺口记入 08 第二轮或 10 批的待办。
