# 10B_W15-main｜切分巨型 Hook 执行文档

- 日期：2026-09-02
- 轨道：长期账本产品 `main`
- 依据：`10A` **修订 A**（与上文冲突处以修订 A 为准）
- 起点：`main@e6fadc9`，工作树 clean，本地只有 `main` 一个分支
- 本批唯一对象：`src/app/usePersistentLedger.ts`（1,763 行）

---

## 本批一句话

**把 12 块大回调的函数体搬到独立模块；`useCallback`／`useEffect` 调用本身原地不动，依赖数组一个字符都不许变。**

不是重新组织 hook，不是优化性能，不是改逻辑。**是搬运，只不过搬的是函数体而不是整个函数。**

---

## 〇、遇阻怎么办（先读这一节）

本项目在这一条上付出过两次代价：**退路太窄会停摆（06 批停了四次），太宽会空转（08 第一轮只干了不到 10%）——两头都是合同的责任，不是执行者的。**

因此本批的处置分三档：

**一档 — 继续做，报告里记一笔。**
- 某块搬出后调用点的参数比函数体还长 → 该块**不搬**，在报告中列出行数与参数数
- 某块的函数体内有嵌套的具名函数 → 一并搬走，作为新模块的内部函数
- 新模块的命名或分文件方式与本文建议不同 → 按你的判断做，报告中说明理由

**二档 — 做完其余部分，在报告中单列一节。**
- 跳过的块累计超过 3 个 → **不要停**，把其余全部做完，单列《跳过清单与举证》
- 结构守卫（`sourceLayout`）因新模块而变红 → 先调整模块划分再试；两次仍不通过则该块留在原地，记录后继续下一块

**这一档的通则（`08A` 修订 D 的 E 节已立为项目通则）：停止条件的目的是让产品负责人尽早知情，不是让执行者尽早收工。** 凡是「继续做下去不会造成损害」的情形，一律做完后报告。

**三档 — 真正停止申报。** 只有下面四条：

| 编号 | 停止条件 | 为什么这条必须真停 |
| --- | --- | --- |
| **H-1** | 某块搬出后，**依赖数组无法保持逐字节不变** | 依赖数组变了就是行为可能变了，`10D` 的证据链失效 |
| **H-2** | 某块搬出后，**hook 调用的位置、类型或顺序发生变化** | React 靠调用顺序定位状态，顺序变了会静默发错数据 |
| **H-3** | 搬运需要**改动函数体内的任何一条语句**（`10A` A-13） | 那已不是搬运，是改逻辑，本批无法验收 |
| **H-4** | 任何闸门变红且**非本轮改动直接所致** | 说明起点就有问题，继续做只会把问题埋深 |

**援引任何一档之前，先核对你的理解与本文逐字一致。** 09 第一轮曾凭记忆构造了一条本仓库从不存在的测试路径，误报「闸门无法执行」并停止申报，浪费整整一轮。

---

## 一、绝对边界

| 编号 | 约束 |
| --- | --- |
| **A-9** | **不得改变 hook 调用的位置、类型、顺序或依赖数组。** 违反即整批作废 |
| **A-10** | **不得新增、删除或修改任何测试**（含断言、用例名、阈值） |
| **A-11** | **不得打包 `ctx` 共享对象。** `10A` 修订 D 节已否决该方案，理由是它无法被机械验证 |
| **A-12** | **只动 `src/app/usePersistentLedger.ts` 及本批新建的模块文件。** 其余文件一律不动 |
| **A-13** | **不得改动被搬运函数体内的任何一条语句。** 包括不得「顺手」重命名局部变量、调整格式、合并分支、补 `await`、改 `import` 顺序 |
| **A-14** | **不得新增 `React.memo`、`useMemo`、`useCallback` 做性能包装。** 那属于性能改动，须另立批次并配性能量尺 |
| **A-15** | **不得改动任何文件格式、版本号、加密参数或派生计算** |
| **A-16** | **不得修改结构守卫来迁就本批改动** |
| **A-17** | 不得引入新依赖。`package.json` 与 lockfile 零改动 |

---

## 二、第零步：只读复测（结论写进 `10C` 第一节）

**动手前先自己把下面这些数字跑出来，不得采信本文或 `10A` 的任何数字。** 本项目已五次因抄数字把错误写进文档。

| 编号 | 要复测的 |
| --- | --- |
| **I-1** | `src/app/usePersistentLedger.ts` 的总行数，以及函数 `usePersistentLedger` 的起止行号 |
| **I-2** | **用 TypeScript AST**（`node_modules/typescript`，**禁止正则**）导出该函数体内**顶层** hook 调用的完整序列：类型、绑定的变量名、起止行号。给出总数与按类型的分布 |
| **I-3** | 对每个函数体 ≥ 40 行的块，统计它引用了多少个「定义在 hook 顶层作用域」的标识符（`ref`、state、setter、其他 callback、以及 hook 的入参），并列出名字 |
| **I-4** | 本文第三节的 12 块清单与 `10A` 修订 F 节的表，与你实测是否一致。**不一致以你的实测为准，并在 `10C` 中更正** |

**为什么 I-2 强制用 AST**：本项目已两次因 hook 正则出错——`08C` I-7 漏抓 `useReducer`／`useLayoutEffect`／`useId` 共 5 个；`10A` 上文的 hook 清单同一个 bug，且每项多 1（把 `import` 行数了进去）。正则分不清 `useRef(` 与 `useRef<HTMLInputElement>(`，也分不清 `import` 与调用。

---

## 三、搬运对象与顺序

**门槛：只搬函数体 ≥ 40 行的块。** 更小的块搬出去，调用点的参数表可能比函数体还长。

**顺序：从小到大，即下表 1 → 12。**

**这与 08 批的「从大到小」相反，是有意的。** 08 批的方法已被验证；本批的方法是全新的、一次都没做过。**若方法本身有缺陷，宁可在 45 行的块上暴露，不要在 355 行的块上暴露。**

| # | 块（`main@e6fadc9` 上的名字） | 类型 | 行数 | 引用外部标识符 |
| ---: | --- | --- | ---: | ---: |
| 1 | `stopForImportRecoveryFatal` | `useCallback` | 45 | 20 |
| 2 | `registerAcceptedPersistence` | `useCallback` | 47 | 4 |
| 3 | `applyLedgerMutation` | `useCallback` | 69 | 19 |
| 4 | （匿名）@L206 | `useLayoutEffect` | 70 | 17 |
| 5 | `drainForSessionQuiesce` | `useCallback` | 71 | 13 |
| 6 | `retryPersistence` | `useCallback` | 78 | 17 |
| 7 | （匿名）@L733 | `useEffect` | 85 | 15 |
| 8 | `applyLedgerAction` | `useCallback` | 88 | 20 |
| 9 | （匿名）@L606 | `useEffect` | 107 | 35 |
| 10 | `enqueuePersistence` | `useCallback` | 156 | 13 |
| 11 | `clearLedger` | `useCallback` | 175 | 31 |
| 12 | `replaceLedgerFromBackup` | `useCallback` | 355 | 37 |
| | | | **1,346** | |

**上表行号为 `main@e6fadc9` 实测，但你必须按 I-4 自行复测。** 每搬完一块，后续块的行号都会变——**每一步都要重新定位，不得沿用本表行号。**

**第 1、2 两块做完即构成一次方法验证**：若这两块的 H-1～H-3 三条都干净通过，说明路线成立，可以继续；若不通过，按三档规则处置。

---

## 四、搬运的标准做法

### 4.1 形态

```ts
// ── 改动前（src/app/usePersistentLedger.ts）
const replaceLedgerFromBackup = useCallback(
  async (envelope: BackupEnvelope, options: ReplaceOptions) => {
    /* 355 行函数体 */
  },
  [activeRepository, activeSession, hydrationStatus, /* ... */],
);

// ── 改动后（src/app/usePersistentLedger.ts）
const replaceLedgerFromBackup = useCallback(
  async (envelope: BackupEnvelope, options: ReplaceOptions) =>
    doReplaceLedgerFromBackup(
      {
        acceptingOperationsRef,
        activeCapabilities,
        /* ...共 37 个，一行一个 */
      },
      envelope,
      options,
    ),
  [activeRepository, activeSession, hydrationStatus, /* ... 逐字节不变 */],
);

// ── 改动后（新模块）
export async function doReplaceLedgerFromBackup(
  deps: ReplaceLedgerFromBackupDeps,
  envelope: BackupEnvelope,
  options: ReplaceOptions,
) {
  const { acceptingOperationsRef, activeCapabilities, /* ... */ } = deps;
  /* 355 行函数体：逐字节不变 */
}
```

### 4.2 逐条规矩

| 编号 | 规矩 |
| --- | --- |
| **T-1** | **函数体内的每一条语句逐字节不变。** 唯一允许的改动是：原本引用闭包变量的标识符，现在引用从 `deps` 解构出的同名变量——**名字必须相同**，不得改名 |
| **T-2** | **依赖数组逐字节不变。** 一个字符、一个空格都不许变。这是本批最硬的一条 |
| **T-3** | **hook 调用本身留在原地**，类型不变、相对顺序不变、绑定的变量名不变 |
| **T-4** | `deps` 用**具名 `type`** 声明，字段名与原闭包变量**同名**。字段顺序按字母序，便于比对 |
| **T-5** | 搬出的函数命名为 `do<原名首字母大写>`（如 `doClearLedger`）。匿名 `useEffect`／`useLayoutEffect` 按其职责命名（如 `runHydrationEffect`），**不得用编号**（`effect1`／`step2` 一律禁止），**文件名与函数名中不得出现中文** |
| **T-6** | 新模块放在 `src/app/` 下，命名 `usePersistentLedger<关注点>.ts`。已存在 `usePersistentLedgerTypes.ts` 与 `usePersistentLedgerHelpers.ts`（08 批产出），**照抄该惯例** |
| **T-7** | 一个新模块还是若干个，由你按结构守卫（`sourceLayout`）能否通过来定；报告中说明划分依据 |
| **T-8** | **若某块的函数体返回清理函数（`useEffect` 的 `return () => {...}`），该返回必须原样保留。** 搬出后仍由 `doXxx` 返回、由调用点原样 `return` |

### 4.3 每搬完一块，立刻自证（不要攒到最后）

```bash
npm test
```

全绿才提交。**红了先还原这一块，不要在红着的状态上继续搬下一块。**

---

## 五、通过线（三条机械比对，全部不依赖人的判断）

| 编号 | 通过线 |
| --- | --- |
| **H-1** | **搬出去的函数体语句逐字节相同。** 对每一块，把新模块中的函数体与 `main@e6fadc9` 原位对应行逐字节比对。允许的差异**只有三类**：函数签名新增的 `deps` 参数、`const { ... } = deps;` 解构行、`export` 关键字。**其余任何差异都是缺陷** |
| **H-2** | **依赖数组逐字节不变。** 12 个调用点逐个贴出改动前后的依赖数组，证明字符级相同 |
| **H-3** | **65 个 hook 调用的类型与顺序逐个不变。** 用 **TypeScript AST**（禁止正则）导出 `main@e6fadc9` 与本批 HEAD 两侧的顶层 hook 调用序列，逐位比对 |

**另须保持的既有闸门**见第七节。

**注意 H-1 的口径与 08 批不同**：08 批是「整块逐字节相同」；本批因为函数体离开闭包后必须改为参数传入，口径是**「函数体语句逐字节相同 + 新增参数与原闭包变量一一对应、无遗漏无多余」**。这一条差别必须在 `10C` 中写明，`10D` 会照此验收。

---

## 六、提交纪律（`10D` 能不能审，全靠这一节）

| 编号 | 要求 |
| --- | --- |
| **P-1** | 从 `main@e6fadc9` 切新分支，建议名 `zhennn/w15-main-hook-split`。**不得在 `main` 上直接作业** |
| **P-2** | **一块一笔提交。** 标题英文，格式 `refactor: extract <块名> body from usePersistentLedger` |
| **P-3** | **每笔提交前 `npm test` 全绿才提交。** 红了先还原这一笔 |
| **P-4** | 不得 `rebase`／`amend`／`squash` 已提交的内容 |
| **P-5** | **不得 `git push`。不得合并到 `main`。** 推送只有产品负责人本人做 |
| **P-6** | 源码仓库用**英文** commit；根文档仓库用**中文** commit。**两个仓库不得混提交** |
| **P-7** | ⚠️ **根文档仓库有另一个会话在并行写入**（`04_DEIK-AI-Challenge-2026/`，与本项目无关）。**不要触碰该目录。** 若撞到 `.git/*.lock`，先确认没有活着的 git 进程再处理，不要盲目删锁 |

---

## 七、闸门（命令一律照抄本节原文）

**判定任何闸门「无法执行」之前，先核对命令与本节逐字一致。**

```bash
npm test
```

```bash
npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts
```

```bash
npm run build
```

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts
```

```bash
npx vitest run src/test-support/translationKeyUsage.test.ts
```

```bash
git diff --check
```

```bash
git diff origin/main...HEAD --check
```

顺序：`build` 先跑，`typecheck` 在 `build` 之后串行。

**起点基线（产品负责人 2026-09-02 在 `main@e6fadc9` 上实测，供对照异常，不是让你抄）**：全量 **137 files／1186 tests**；`typecheck`／`lint` 无输出 exit 0；`git diff --check` 空。冻结派生快照、结构守卫、`translationKeyUsage`、`build` 未在该提交上复跑，**请自行建立基线**。

---

## 八、`10C` 必须回答的问题

| 编号 | 问题 |
| --- | --- |
| **Q-1** | I-1～I-4 的只读复测结果，含与本文第三节表格的差异及更正 |
| **Q-2** | H-1：逐块给出函数体逐字节比对的方法、命令与结果。**每一条差异都要落实为三类允许项之一，不允许有未判定的残留** |
| **Q-3** | H-2：12 个调用点逐个贴出改动前后的依赖数组，证明字符级相同 |
| **Q-4** | H-3：两侧 hook 调用序列的 AST 导出与逐位比对结果，**说明你用的是 AST 而非正则** |
| **Q-5** | 逐块给出：原行数 → 搬出后调用点行数 → 新模块中函数体行数，以及 `usePersistentLedger.ts` 的收尾行数 |
| **Q-6** | 新模块的划分方式与依据，以及结构守卫的通过证据 |
| **Q-7** | 全部闸门的**原始输出**（不是摘要） |
| **Q-8** | 若有跳过的块，单列《跳过清单与举证》，逐块给出行数、参数数与不搬的理由 |
| **Q-9** | **强制否定性声明**：未改动任何测试；未新增性能包装；未打包 `ctx`；未改动 `src/app/usePersistentLedger.ts` 与新模块之外的文件；未改动版本号／加密参数／派生计算；未修改结构守卫；未 push；未合并 `main`；未读取真实数据区；未触碰 `04_DEIK-AI-Challenge-2026/` |
| **Q-10** | **报告中每个数字要么你自己跑出来，要么明确标注「未复核」。不得抄任何既有报告的数字**——本项目已五次因抄数字把错误写进文档（`08C` 净减少行数、`09C` 文案表键数、`09C` build 产物大小、`08A` 修订 B 的 10,249 行、小C 的 hook 调用点 25） |
| **Q-11** | **如实的未完成事项清单。** 做到一半上下文不够就如实写明做到哪一块、剩下什么、下一个人从哪里接。**如实的半成品比虚报的完成品有价值得多** |

---

## 九、交付物

新建 `01一些进度/日志/week15_260826/10C_W15-main-切分巨型Hook执行报告.md`。

---

## 十、两条这个项目付出代价学来的教训

1. **「测试全绿」不等于「没改坏」。** 09 批有 5 处中文被静默改写，1,185 条测试全绿一处没发现，因为涉事代码零覆盖。**本批的核心证据是 H-1／H-2／H-3 三条机械比对，不是「测试通过」。**

2. **每条退路都必须写明它不适用于什么。** 只写「遇到 X 可以跳过」不写「但 Y 不算 X」，等于把范围交给执行者自行解释——08 第一轮 7 个文件因此全被跳过。**本批的跳过理由已写死在第〇节一档，且跳过超过 3 块也不停摆、做完再报。**
