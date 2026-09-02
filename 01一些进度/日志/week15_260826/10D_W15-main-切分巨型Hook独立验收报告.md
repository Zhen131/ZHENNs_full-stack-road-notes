# 10D_W15-main｜切分巨型 Hook 独立验收报告

- 日期：2026-09-02
- 验收方：独立验收会话（不代表执行方 Codex，也不代表合同撰写方小C）
- 验收对象：`zhennn/w15-main-hook-split` @ `0858b7f`
- 基线：`main@e6fadc9`
- 合同：`10A` **修订 A**（H 节通过线）＋ `10B`
- 执行报告：`10C`（只读，未采信其任何数字）

---

## 一、结论

# **PASS**

无条件通过。12 块搬运全部满足 `10A` 修订 A 的 H-1／H-2／H-3，全部闸门绿，改动范围未越界。

**本报告中每一个数字都是我自己跑出来的**，未从 `10A`／`10B`／`10C` 抄任何一个。凡未复核的，第十一节明确列出。

**一句话交代结果**：这 12 块函数体不只是「顺序没变」——它们**连一个字节都没变**，包括缩进。原本合同允许的四类差异（缩进变化、闭包变量改名等）**实际一类都没用上**，真正出现的差异只有两类：函数签名多了一个 `deps` 参数，函数体最前面多了一行 `const { ... } = deps;`。所以这一批的可验收性比合同要求的还要高一档。

同时报告两处**需要产品负责人知情、但不构成 FAIL** 的发现（第六节 R-4）：一处是最后一笔在两个调用点新造了对象字面量，一处是最后一笔往一个**没有被搬运**的 `useEffect` 里加了一条 `eslint-disable`。两处我都做了独立核对，**均未改变任何可执行语句**，详见下文。

---

## 二、先说清楚：这一批该用哪把尺子

08、09 两批的通过线是「逐字节相同」，因为那两批是纯搬运。**10 批不是**——函数体离开原文件后够不着原来闭包里的 `ref` 和 setter，签名必然变化。

所以本批的通过线是 `10A` 修订 A 的 H 节：

> **函数体语句逐字节相同 ＋ 新增参数与原闭包变量一一对应、无遗漏无多余。**

我按这把尺子量。**我没有用 08 批的「整块逐字节相同」去卡它**（那会误判 FAIL），**也没有因为「签名本来就该变」而放松对函数体的要求**（那会漏掉本批最该守的东西）。

小C 用的是**行多重集合比对**，那是不看顺序的——它能证明「一本书没多没少」，但证明不了「书的排列顺序没变」。而代码最讲顺序：先存盘再清空，和先清空再存盘，是两件完全不同的事。**本报告的核心就是把这个缺口补上。**

---

## 三、R-1｜序列级比对（本报告核心）

### 3.1 方法

对 12 块中的每一块：

1. 用 **TypeScript AST**（`node_modules/typescript` v5.9.3，`createSourceFile`，**全程禁止正则**）解析 `git show main:src/app/usePersistentLedger.ts`，定位函数 `usePersistentLedger`，遍历其**顶层** hook 调用（遇到嵌套函数即停止下潜，避免把内层回调里的 hook 误当顶层）。
2. 取该 hook 调用的第一个实参（回调函数），取其**函数体大括号之间的原始字符**，按 `\n` 切成行序列。
3. 在 HEAD 侧，先用 AST 找出每个 hook 调用内部调用的 `doXxx`／`runXxx` 名字，**以此建立块的对应关系**（不靠人工列表、不靠名字猜测）；再到 4 个新模块中定位该 `export function`，取其函数体，**剔除开头的 `const { ... } = deps;` 解构语句**，其余按 `\n` 切成行序列。
4. **两个行序列做 `diff`（LCS），不是排序后比较、不是集合比较。** 顺序调换会被抓出来。
5. 每一处差异必须落实为合同允许的四类之一，不允许有未判定残留。

### 3.2 先证明这把尺子是灵的（负控制）

本项目吃过「检查全绿、实为假象」的亏（09 批 1,185 条测试全绿、零发现，实有 5 处中文被静默改写）。所以在报告结果之前，我先在 scratchpad 的临时副本上人为制造两处缺陷，验证工具能抓出来：

```text
=== 控制 A：把 doClearLedger 里相邻两条语句对调（纯顺序变化，多重集合比对抓不到）===
SWAP: 'const operationToken = Symbol("clear-ledger");' <-> 'const operationRepository = activeRepository;'

=== 控制 B：把 doStopForImportRecoveryFatal 里一个 false 改成 true（单字符变化）===

=== 工具输出 ===
doClearLedger: **DIFFERS** ->
36d35
<     const operationToken = Symbol("clear-ledger");
37a37
>     const operationToken = Symbol("clear-ledger");
doStopForImportRecoveryFatal: **DIFFERS** ->
10c10
<       acceptingOperationsRef.current = false;
---
>       acceptingOperationsRef.current = true;
doApplyLedgerAction: IDENTICAL          ← 未被动过的块仍然判定相同，无误报
```

**两处都被抓住，且未污染其他块。** 尺子是灵的。（该副本用完即删，主工作目录零改动，见第十节。）

### 3.3 逐块结果

`函数体行数` = 回调大括号之间的语句行数（**不是** `10A`／`10C` 那个 `CallExpression` 整体跨度，两者定义不同，不可互相对照）。

| # | 块 | hook 类型 | main 行 | 函数体行数 | 序列比对 | 函数体 SHA-256（前 16 位，两侧同值） |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | `runPersistenceTargetEffect` | useLayoutEffect | 206 | 59 | **逐字节相同** | `f7d36c5298c16bac` |
| 2 | `doEnqueuePersistence` | useCallback | 351 | 146 | **逐字节相同** | `c8f35ab456e6a5bb` |
| 3 | `doRegisterAcceptedPersistence` | useCallback | 508 | 33 | **逐字节相同** | `f80a25e62e4632a5` |
| 4 | `runHydrationEffect` | useEffect | 606 | 99 | **逐字节相同** | `f3117876cc70ad7b` |
| 5 | `runAutomaticPersistenceEffect` | useEffect | 733 | 74 | **逐字节相同** | `ac053039aa7af46b` |
| 6 | `doApplyLedgerAction` | useCallback | 819 | 73 | **逐字节相同** | `0a579d7fe6541a2d` |
| 7 | `doApplyLedgerMutation` | useCallback | 908 | 55 | **逐字节相同** | `01b22d384b8c688b` |
| 8 | `doRetryPersistence` | useCallback | 978 | 70 | **逐字节相同** | `a080a0d6d81d95fe` |
| 9 | `doClearLedger` | useCallback | 1082 | 163 | **逐字节相同** | `944170a27e687143` |
| 10 | `doStopForImportRecoveryFatal` | useCallback | 1258 | 40 | **逐字节相同** | `40932adb09393fd3` |
| 11 | `doReplaceLedgerFromBackup` | useCallback | 1304 | 336 | **逐字节相同** | `320a14e90b9bc40f` |
| 12 | `doDrainForSessionQuiesce` | useCallback | 1660 | 64 | **逐字节相同** | `c9223c85d718001d` |

```text
blocks=12 differing=0
```

**12 块函数体的行数两侧完全一致，`diff` 全部为空，SHA-256 两侧同值。**

### 3.4 差异落实

合同预留了四类允许差异。实际出现情况如下：

| 允许类别 | 是否出现 | 说明 |
| --- | --- | --- |
| 函数签名新增 `deps` 参数 | **出现，12/12** | 见 3.5，已逐块核对 |
| `const { ... } = deps;` 解构行 | **出现，12/12** | 比对时按方法剔除；剔除的确实是该语句（AST 判定：`ObjectBindingPattern` 且初始化器为标识符 `deps`） |
| `export` 关键字 | 出现 | 12 个函数均为 `export function` |
| **缩进层级变化** | **未出现** | 函数体保留了原来在 hook 参数里的缩进（6/8 空格），**一个空格都没动** |
| **闭包变量被替换为参数名** | **未出现** | 解构后名字与原闭包变量同名，体内标识符零改写 |
| **其余任何差异** | **零** | 无未判定残留 |

**结论：R-1 通过。** 没有任何语句顺序变化，没有任何逻辑语句丢失，没有任何新逻辑语句无法追溯到 `main@e6fadc9`。

### 3.5 函数签名核对（顺带把 H-1 的「签名」这一半也验了）

| 块 | main 回调参数 | 新函数参数（去掉首个 `deps`） | 一致 |
| --- | --- | --- | :---: |
| `runPersistenceTargetEffect` | `[]` | `[]` | 是 |
| `doEnqueuePersistence` | `scheduledSnapshot, ledgerSnapshot, scheduledRepository, scheduledSession` | 同左 | 是 |
| `doRegisterAcceptedPersistence` | `ledgerSnapshot, nextVersionState, scheduledRepository, scheduledSession, action?` | 同左 | 是 |
| `runHydrationEffect` | `[]` | `[]` | 是 |
| `runAutomaticPersistenceEffect` | `[]` | `[]` | 是 |
| `doApplyLedgerAction` | `action, timeSnapshot?` | 同左 | 是 |
| `doApplyLedgerMutation` | `mutation, timeSnapshot?` | 同左 | 是 |
| `doRetryPersistence` | `[]` | `[]` | 是 |
| `doClearLedger` | `confirmationNonce = ""` | 同左 | 是 |
| `doStopForImportRecoveryFatal` | `message` | 同左 | 是 |
| `doReplaceLedgerFromBackup` | `candidate, timeSnapshot?, evidence?, externalSignal?` | 同左 | 是 |
| `doDrainForSessionQuiesce` | `request` | 同左 | 是 |

```text
ALL SIGNATURES = deps + original params in original order: True
```

**12/12 均为「`deps` ＋ 原参数、原顺序」**，可选标记 `?` 与默认值 `= ""` 均原样保留。

---

## 四、R-2｜`Deps` 字段与原闭包引用一一对应

### 4.1 方法

`10A` 修订 A 的 H-1 要求「新增参数与原闭包变量**一一对应、无遗漏、无多余**」。**小C 没验这一条**，这是我的第二个主战场。

1. 在 `main@e6fadc9` 上用**真实 tsconfig 建 Program 并取 TypeChecker**（不是只做词法扫描）。对每一块函数体内的每个标识符，调 `checker.getSymbolAtLocation` 拿到符号，再看它的**声明节点是否恰好落在 `usePersistentLedger` 的顶层作用域**（判据：声明节点最近的外层函数就是 `usePersistentLedger` 本身）。
   - 用 TypeChecker 而不是名字匹配，是为了正确处理**同名遮蔽**：块内部若有同名局部变量，符号解析会指向局部声明，不会被误算成闭包引用。
2. 排除属性名位置的标识符（`a.foo` 的 `foo`、`{ foo: bar }` 的 `foo`）与声明名本身。
3. HEAD 侧取该函数首参类型 `XxxDeps` 的**字段名集合**（AST 取 `TypeLiteral` 成员）。
4. 两个集合求差：**少字段 → FAIL；多字段 → 记录。**

### 4.2 逐块结果

```text
block                          |Deps|  |refs|  equal   missing(FAIL)   extra(record)
runPersistenceTargetEffect       15      15     YES         -               -
doEnqueuePersistence             12      12     YES         -               -
doRegisterAcceptedPersistence     4       4     YES         -               -
runHydrationEffect               34      34     YES         -               -
runAutomaticPersistenceEffect    15      15     YES         -               -
doApplyLedgerAction              18      18     YES         -               -
doApplyLedgerMutation            17      17     YES         -               -
doRetryPersistence               16      16     YES         -               -
doClearLedger                    30      30     YES         -               -
doStopForImportRecoveryFatal     19      19     YES         -               -
doReplaceLedgerFromBackup        36      36     YES         -               -
doDrainForSessionQuiesce         13      13     YES         -               -

blocks with MISSING deps (FAIL): 0
total EXTRA deps fields: 0
```

**12/12 集合完全相等：零遗漏、零多余。**

### 4.3 附加：调用点是否真的把对的东西传进去了

字段名对上，不代表**传的值**是对的。`{ ledgerDataRef: someOtherThing }` 也能让字段名对上。所以我又核了一层：

```text
块                              调用点键数  Deps 字段数  匹配   全部为简写
runPersistenceTargetEffect          15        15       YES      YES
doEnqueuePersistence                12        12       YES      YES
doRegisterAcceptedPersistence        4         4       YES      YES
runHydrationEffect                  34        34       YES      YES
runAutomaticPersistenceEffect       15        15       YES      YES
doApplyLedgerAction                 18        18       YES      YES
doApplyLedgerMutation               17        17       YES      YES
doRetryPersistence                  16        16       YES      YES
doClearLedger                       30        30       YES      **NO**
doStopForImportRecoveryFatal        19        19       YES      YES
doReplaceLedgerFromBackup           36        36       YES      **NO**
doDrainForSessionQuiesce            13        13       YES      YES

problems: 0
```

**12/12 调用点的键集合与 `Deps` 类型完全相等**，且除两处外全部是**对象简写**（`{ ledgerDataRef }`）——简写在语义上必然绑定到同名的 hook 顶层变量，**不存在张冠李戴的可能**。

两处非简写就是第六节要讲的 `activeCapabilities`，单独核对结论见 6.2。

### 4.4 与 `10C` 的对照（我先算完才去看它的）

`10C` 声明其 AST 实测与 `10B` 预设有 9 处不同。我**独立算出的 12 个数**（19/4/17/15/13/16/15/18/34/12/30/36）**与 `10C` 的实测列逐个吻合**。

这是**独立复算后的相互印证**，不是采信。`10B` 的预设值（20/4/19/17/13/17/15/20/35/13/31/37）**确有 9 处偏高**，`10C` 的更正方向正确。

---

## 五、R-3｜`npm run build`（小C 未跑，我跑了）

```text
> local-first-trading-ledger@0.1.0 build
> next build

   ▲ Next.js 15.5.22

   Creating an optimized production build ...
 ✓ Compiled successfully in 1182ms
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/5) ...
 ✓ Generating static pages (5/5)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                     378 kB         481 kB
└ ○ /_not-found                            993 B         103 kB
+ First Load JS shared by all             102 kB
  ├ chunks/255-3d881dfa8c72bc56.js       46.3 kB
  └ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB

○  (Static)  prerendered as static content

EXIT=0
```

**通过。** 按 `10B` 要求，`build` 先跑，`typecheck` 在其后串行。

**我没有把这些产物大小与任何历史值对照**——`09C` 曾在 build 产物大小上出过错，我不引用别处的数字，也不断言「没有变大」。这是**未核验项**，见第十一节。

---

## 六、R-4｜对最后一笔 `0858b7f` 的独立核对

```text
commit 0858b7fba329d41d1505f528cbe103d301daf266
    refactor: remove hook extraction lint residue

 src/app/usePersistentLedger.ts          | 29 ++++++++++-------------------
 src/app/usePersistentLedgerImport.ts    |  2 +-
 src/app/usePersistentLedgerLifecycle.ts |  1 -
 3 files changed, 11 insertions(+), 21 deletions(-)
```

小C 判定为「只清理失效 import ＋ 删一个行尾空格」，**那是目视**。我做了机械核对，结论是：**小C 的目视漏掉了两样东西**，两样都不构成 FAIL，但产品负责人应当知情。

### 6.1 删掉的 import：15 个，逐个核实，零悬空

要求是「逐个确认它们要么已随代码搬到新模块、要么确实已无人引用」。我用 AST 取两侧 import 名集合求差，再在 HEAD 的 hook 文件里做**标识符使用检查**（排除 import 语句自身、排除属性名位置）：

```text
imports in main: 56   in HEAD: 53   removed: 15

name                                          仍被 hook 文件引用?   现由哪个新模块 import
LEDGER_FILE_REPOSITORY_ERROR_CODES            no                   Import, Persistence
LEDGER_REPOSITORY_ERROR_CODES                 no                   Import, Lifecycle
LedgerFileRepositoryError                     no                   Import, Persistence
assertSessionQuiesceRequest                   no                   Lifecycle
claimLedgerSessionPersistencePort             no                   Lifecycle
evaluateLedgerResourcePolicy                  no                   Actions, Import, Lifecycle
evaluateLedgerResourcePolicyAfterTradeAppend  no                   Actions
hasFutureFacts                                no                   Actions
invokeRepositoryActionSave                    no                   Persistence
invokeRepositorySave                          no                   Persistence
isCorrectionAction                            no                   Actions
isLedgerFileBackedRepository                  no                   Persistence
translateDefault                              no                   Import, Lifecycle, Persistence
validateLedgerData                            no                   Import
validateLedgerImportPolicy                    no                   Import

dangling removals: 0

added imports (12): doApplyLedgerAction, doApplyLedgerMutation, doClearLedger,
doDrainForSessionQuiesce, doEnqueuePersistence, doRegisterAcceptedPersistence,
doReplaceLedgerFromBackup, doRetryPersistence, doStopForImportRecoveryFatal,
runAutomaticPersistenceEffect, runHydrationEffect, runPersistenceTargetEffect
```

**15 个删除全部有着落**：每一个都不再被 hook 文件引用，且每一个都被接收了对应代码的新模块重新 import。新增 12 个 import 恰好是 12 个被搬出的函数，不多不少。

（`typecheck` 与 `lint --max-warnings=0`（含 `no-unused-vars`）双绿也从另一侧佐证了这一点，但我不以闸门代替逐名核对。）

### 6.2 【发现一】两个调用点新造了对象字面量——小C 目视未提

最后一笔把两处调用点从「传整个 `activeCapabilities`」改成「**现场新建一个只含所需字段的对象**」：

```diff
       doClearLedger(
         {
           acceptingOperationsRef,
-          activeCapabilities,
+          activeCapabilities: {
+            canClearHydrationError:
+              activeCapabilities.canClearHydrationError,
+            canClearReadyLedger: activeCapabilities.canClearReadyLedger,
+          },
```
```diff
       doReplaceLedgerFromBackup(
         {
           acceptingOperationsRef,
-          activeCapabilities,
+          activeCapabilities: {
+            canImportBackup: activeCapabilities.canImportBackup,
+          },
```

**这是本批唯一在 `main` 中找不到对应物的新造构造物**，值得单独说明。

**为什么会需要它**（我实测出的机制，非推断）：`react-hooks/exhaustive-deps` 这条规则是**按属性粒度**追踪依赖的。搬运前，回调体内写的是 `activeCapabilities.canClearReadyLedger`，规则只要求依赖数组里有那个属性；搬运后调用点写成整个 `activeCapabilities`，规则就改口要求把整个对象加进依赖数组。而 **H-2 规定依赖数组一个字符都不许变**，加不得。把对象字面量收窄回具体属性，就把属性粒度的引用还原了，依赖数组因此得以保持逐字节不变。

**我的核对结论：行为等价，可以接受。**

```text
=== 两个函数体里对 activeCapabilities 的全部使用（main 原文）===
doClearLedger:             activeCapabilities.canClearReadyLedger
                           activeCapabilities.canClearHydrationError
doReplaceLedgerFromBackup: activeCapabilities.canImportBackup

=== HEAD 的 Deps 类型声明 ===
doClearLedger:  activeCapabilities: { canClearHydrationError: boolean; canClearReadyLedger: boolean }
doReplace...:   activeCapabilities: { canImportBackup: boolean }
```

函数体**只读这些字段，一个不多**；收窄后的字面量**恰好供这些字段，一个不少**；字段值在调用时从同一个源对象上读取的布尔值，**取值完全相同**。

**为什么它不算违反 A-11（禁止 `ctx` 共享对象）**：A-11 否决的是「把身份恒定的 ref 与 setter 打包成一个跨调用点复用的共享对象」。这里是**每个调用点各自内联的、只含 1～2 个布尔字段的收窄**，不跨调用点复用，且它的每一个字段都能与原文的属性读取一一对上（我上面就是这么对的）——**它是可机械验证的**，恰恰不是 A-11 所担心的那种「装错漏装只能靠人眼」的东西。

**但产品负责人应当知情**：这是本批 R-2 的名字集合比对**覆盖不到的一层**——我的集合比对只看字段名 `activeCapabilities`，看不到它的**嵌套形状被收窄了**。这一处是我另做的**属性级用量核对**才覆盖住的。若今后推广到另外三个文件，**这条检查必须补进标准流程**，否则同类改动会从名字集合比对底下漏过去。

### 6.3 【发现二】往一个「没被搬运」的 `useEffect` 里加了 `eslint-disable`——小C 目视未提

```diff
     return () => {
       mountedRef.current = false;
       acceptingOperationsRef.current = false;
+      // Abort the current controller rather than a controller captured at mount.
+      // eslint-disable-next-line react-hooks/exhaustive-deps
       importAbortControllerRef.current?.abort();
```

**这一块不在 12 块搬运清单里**，是留在原地的代码。`main@e6fadc9` **全文没有任何 `eslint-disable`**（我查过），所以这是本批新增的一条永久性 lint 抑制。

**它抑制的是什么**（我在临时 worktree 里把该行删掉重跑 lint 实测得到，非推断）：

```text
373:32  warning  The ref value 'importAbortControllerRef.current' will likely have changed
                 by the time this effect cleanup function runs. If this ref points to a node
                 rendered by React, copy 'importAbortControllerRef.current' to a variable
                 inside the effect, and use that variable in the cleanup function
                 react-hooks/exhaustive-deps
```

**为什么 `main` 上同样的代码不报这条警告**——我逐笔 lint 了 13 个提交，把它钉死了：

```text
cae5a93  warn=0   extract stopForImportRecoveryFatal
af6017c  warn=0   extract registerAcceptedPersistence
58d7a22  warn=0   extract applyLedgerMutation
73f8ffc  warn=0   extract runPersistenceTargetEffect
623e134  warn=0   extract drainForSessionQuiesce
6e12c3a  warn=0   extract retryPersistence
4cda253  warn=0   extract runAutomaticPersistenceEffect
2bccc12  warn=0   extract applyLedgerAction
85af412  warn=0   extract runHydrationEffect
e21ef29  warn=0   extract enqueuePersistence
af0f283  warn=1   extract clearLedger              ← activeCapabilities 警告首次出现
747ca34  warn=3   extract replaceLedgerFromBackup  ← 再 +1 个 activeCapabilities，+1 个 ref cleanup
0858b7f  warn=0   remove hook extraction lint residue
```

机制是：`main` 上这个文件里有 **3 处** `importAbortControllerRef.current = ...` 赋值；搬运后**这 3 处全部随代码离开了 hook 文件**（HEAD 侧实测 **0 处**）。规则看不到任何对 `.current` 的赋值，就把它当成可能的 DOM 节点 ref，于是对「在 cleanup 里读 `.current`」发出告警。

```text
'importAbortControllerRef.current = ' 赋值出现次数
main : 3   (L631, L1427, L1460)
head : 0   (全部随代码搬入新模块)
```

**我的核对结论：不构成 FAIL，但这是一处真实的「超出纯搬运」的改动，必须记录在案。**

理由：
- 该语句 `importAbortControllerRef.current?.abort();` 与 `main` **逐字节相同**，改的只有它上面新增的**两行注释**，**零可执行语句变化**（第七节 R-5′ 用机械比对证明了这一点）。
- 触发告警的是**规则的启发式判断变了**，不是代码行为变了。抑制它是把 `main` 的既有状态还原，不是掩盖新缺陷。
- 但它确实是**留在原地的代码被动了**，而且留下了一条**永久生效的规则抑制**。今后若真有人在这个 cleanup 里写出「捕获了挂载时的旧 controller」的 bug，这条抑制会让 lint 不再提醒。

**建议（不作为通过条件）**：这条抑制的存在理由完全来自「赋值搬走了」这一临时状态。等 `10A` D 节说的 `ctx` 打包批次做完、或后续批次再动这个文件时，**复查这条抑制是否还需要**。是否立项由产品负责人决定，我不代为决定。

### 6.4 其余改动

- `usePersistentLedgerImport.ts`：删掉一行行尾空格（`-    ` → 空行）。与小C 目视一致。
- `usePersistentLedgerLifecycle.ts`：删掉未使用的 `ledgerReducer` import。已含在 6.1 的核对里。

---

## 七、R-5～R-11 证据

### R-5｜65 个 hook 调用的类型与顺序逐位不变（H-3）

用 AST，**全程无正则**（本项目已两次栽在 hook 正则上，我不重蹈）。遍历时遇到嵌套函数即停止下潜，因此不会把内层回调里的 hook 误计；遍历的是 `CallExpression` 节点，因此 `import` 语句里的 `useRef` 名字**不会**被计入（`10A` 上文正是这里每项多 1）。

```text
类型分布           main    HEAD
useRef              29      29
useCallback         12      12
useState            11      11
useEffect            6       6
useMemo              4       4
useReducer           2       2
useLayoutEffect      1       1
合计                65      65

序列 diff（序号 + 类型 + 绑定名，按行号排序）：空，exit=0
```

`useReducer` × 2 与 `useLayoutEffect` × 1 **均被正确抓到**（这三个正是 `08C` I-7 和 `10A` 上文两次漏掉的）。**通过。**

### R-5′｜额外自查：另外 53 个「没被搬」的 hook，参数是否原样

R-5 只证明 hook 的**类型和顺序**没变，**没有**证明那 53 个没被搬运的 hook 的**参数内容**没被顺手改过。合同没要求这一条，但不查就有缺口——第六节的 `eslint-disable` 正是藏在这个缺口里。我补了：

```text
unmoved hooks: 53   byte-identical args: 52   differing: 1

===== idx 51  useEffect  main L556 -> head L366 =====
     return () => {
       mountedRef.current = false;
       acceptingOperationsRef.current = false;
+      // Abort the current controller rather than a controller captured at mount.
+      // eslint-disable-next-line react-hooks/exhaustive-deps
       importAbortControllerRef.current?.abort();
       generationRef.current += 1;
```

**53 个中 52 个参数逐字节相同；唯一的差异就是 6.3 那两行注释，零可执行语句变化。**

### R-5″｜额外自查：hook 参数之外的正文是否原样

把两侧 65 个 hook 调用的**实参整体**替换成占位符后做全文 `diff`，用来检查「hook 之间的普通语句」有没有被动过。结果只有三类差异：

1. 删除 15 个失效 import ／ 新增 12 个模块 import（6.1 已逐个核实）
2. 两个 hook 调用的**括号换行格式**被 prettier 重排（`useCallback(<占位符>)` → `useCallback(\n  <占位符>,\n)`），无语义
3. 无其他差异

**hook 之间的普通语句零改动。**

至此，`usePersistentLedger.ts` 的全部改动已**完整清点、无残留**：12 块搬出的函数体、12 处调用点、import 增删、2 处括号格式、2 行注释。**再无第七类。**

### R-6｜依赖数组逐字符不变（H-2）

```text
依赖数组个数        main 23   HEAD 23
逐字符 diff         空，exit=0
文件 SHA-256        7d72192752babd814e0890df9a39cd4ad379aab5f4793f0d8e875d5adf20272d
                    7d72192752babd814e0890df9a39cd4ad379aab5f4793f0d8e875d5adf20272d
```

两侧导出文件 **SHA-256 完全相同**。**一个字符、一个空格都没变。通过。**

### R-7｜零测试改动（A-10）

我没有停在「没有 test 文件出现在 diff 里」——`sourceLayout.test.ts` 是**按文件枚举生成用例**的结构守卫，新增 4 个模块**有可能改变生成出来的用例名**。所以我在 `main` 与 HEAD 两侧各跑一次全量，导出**全部用例全名**做比对：

```text
git diff --name-only main..0858b7f 中的 test 文件数：0

HEAD total tests: 1186   main total tests: 1186
sorted full-name lists identical: True
HEAD statuses: {'passed': 1186}
main statuses: {'passed': 1186}
```

**全量用例全名 `diff` 为空，1186 = 1186，两侧全绿。通过。**

### R-8｜未打包 `ctx` 共享对象（A-11）

```text
5 个文件中名为 ctx / context 的标识符：NONE
用 useMemo 构造、跨调用点复用的 deps 对象：无
（12 处 deps 均为调用点内联对象字面量，且 R-2 已证明字段全部为简写）
```

**通过。** 唯一的新造对象是 6.2 的 `activeCapabilities` 收窄，性质与 `ctx` 不同，已单独论证。

### R-9｜改动范围（A-12、A-17）

```text
src/app/usePersistentLedger.ts
src/app/usePersistentLedgerActions.ts
src/app/usePersistentLedgerImport.ts
src/app/usePersistentLedgerLifecycle.ts
src/app/usePersistentLedgerPersistence.ts

package.json / lockfile changed: 0
```

**恰好 5 个文件：1 个原文件 ＋ 4 个新模块，其余零改动。通过。**

新模块对外零暴露——除 `usePersistentLedger.ts` 外，**全仓库无任何文件 import 它们**：

```text
src/app/usePersistentLedger.ts:66:} from "./usePersistentLedgerLifecycle";
src/app/usePersistentLedger.ts:72:} from "./usePersistentLedgerPersistence";
src/app/usePersistentLedger.ts:76:} from "./usePersistentLedgerActions";
src/app/usePersistentLedger.ts:77:import { doReplaceLedgerFromBackup } from "./usePersistentLedgerImport";
```

### R-10｜未新增性能包装（A-14）

```text
React.memo / memo(     main 0   HEAD 0
useCallback            main 12  HEAD 12   （R-5 已证类型分布逐位相同）
useMemo                main 4   HEAD 4

4 个新模块内的 hook 调用数：
  usePersistentLedgerActions.ts      0
  usePersistentLedgerImport.ts       0
  usePersistentLedgerLifecycle.ts    0
  usePersistentLedgerPersistence.ts  0
```

**新模块是纯函数模块，零 hook 调用**——这一点很要紧：若新模块里出现任何 hook 调用，React 的注册序列就会变，H-3 的保证会落空。**通过。**

### R-11｜行数（仅记录，非通过线）

```text
main : wc -l = 1763   endsWithNewline=true   usePersistentLedger 函数 91-1763（1673 行）
HEAD : wc -l =  843   endsWithNewline=true   usePersistentLedger 函数 92-843 （ 752 行）

新模块：Actions 265 ＋ Import 463 ＋ Lifecycle 770 ＋ Persistence 508 = 2006 行
```

`10A` 修订 F 预估收尾「约 700–780 行」，实测 843。**预估本就不是通过线**（`10A` 原文如此），记录备查。

---

## 八、全部闸门原始输出

命令逐条照抄自验收指令，未凭记忆构造路径。执行顺序：`build` 先跑，`typecheck` 在其后串行。

```text
### BUILD          npm run build                                   → EXIT=0（全文见第五节）
### TYPECHECK      npm run typecheck  (tsc --noEmit)               → 无输出，EXIT=0
### LINT           npm run lint  (eslint . --max-warnings=0)       → 无输出，EXIT=0
### DIFFCHECK      git diff --check                                → 无输出，EXIT=0
### DIFFCHECK-ORIGIN  git diff origin/main...0858b7f --check       → 无输出，EXIT=0
```

```text
### TEST
+ npm test
 RUN  v4.1.9 .../LocalFirstTradingLedger
 Test Files  137 passed (137)
      Tests  1186 passed (1186)
   Duration  38.97s (transform 5.41s, setup 15.87s, import 18.48s, tests 126.79s, environment 32.29s)
EXIT=0
```

```text
### 冻结派生快照
+ npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts
 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  1.74s
EXIT=0
```

```text
### 结构守卫
+ npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts
 Test Files  2 passed (2)
      Tests  8 passed (8)
   Duration  1.01s
EXIT=0
```

```text
### 文案守卫
+ npx vitest run src/test-support/translationKeyUsage.test.ts
 Test Files  1 passed (1)
      Tests  1 passed (1)
   Duration  469ms
EXIT=0
```

**九项闸门全绿。** 与小C 参考值对照：全量 137/1186 一致，快照 7 一致，结构守卫 2/8 一致，`translationKeyUsage` 1/1 一致。`build` 小C 未跑，由我补齐。

---

## 九、本方法的盲区（这套证据链证明不了什么）

**必须如实说清楚，否则 PASS 会被读成比它实际更强的保证。**

1. **证明的是「代码文本没变」，不是「行为正确」。** 全部证据链的核心是「函数体逐字节相同 ＋ 依赖数组逐字节相同 ＋ hook 序列逐位相同」。如果 `main@e6fadc9` 本身就有 bug，这批会**原样保留**这个 bug，我的方法看不见。

2. **对「函数体离开闭包后运行时语义是否等价」，我给的是静态证据，不是运行时证据。** 我证明了每个引用都有对应的 `deps` 字段、每个字段都以简写绑定同名变量。但 JS 闭包与参数传递在**极端情形**下仍可能有差别（例如某个被捕获的变量在两次读取之间被重新赋值，而搬运改变了读取时机）。**由于函数体逐字节相同、且全部 deps 在调用瞬间一次性求值，我认为这种差别在本批不会出现，但我没有为此构造运行时反例来验证。**

3. **1186 条测试全绿，不等于覆盖了这 12 块的全部路径。** `08A` 修订 C 的 G-1 已登记「`getWorkspaceFileStatus` 8 个返回分支中 7 个无真实断言」且**至今未补测**。测试全绿在本批只用作「没有把已被覆盖的行为改坏」的旁证，**不能读作「这 12 块的行为已被验证」**。09 批的教训正是 1,185 条全绿、零发现、实有 5 处缺陷。

4. **`Deps` 字段的「集合相等」不覆盖嵌套形状。** 6.2 的 `activeCapabilities` 收窄就是从这个缺口里出来的——名字集合比对看不见它，是我另做属性级用量核对才覆盖住。**推广到另外三个文件时，这条必须补进标准流程。**

5. **我没有验证性能。** `10A` G 节把性能量尺（V-4）移出本批。本批不改 hook 注册结构、不改渲染次数，但**函数从闭包捕获改为每次调用构造一个 deps 对象字面量**，这在高频调用路径上会产生额外的对象分配。**我没有测量它，也不断言它可以忽略。**

6. **`build` 产物大小我只记录、不对照。** 我没有把 378 kB / 481 kB / 102 kB 与任何历史值比较，因此**不能**说「产物没有变大」。

7. **逐笔 lint 的那 13 次运行是在临时 worktree 里做的**，共用主仓库的 `node_modules`（软链接）。若 `node_modules` 与某个历史提交的 lockfile 不匹配，结论会有偏差。本批 lockfile 零改动，13 笔提交共享同一份依赖，**在本批范围内这个前提成立**。

8. **我只验了 `0858b7f` 这一个终态**，以及为定位 6.3 的成因而逐笔跑的 lint。**中间 12 笔提交的其余内容我没有逐笔验收**——若某笔中间提交引入又撤销了某样东西，我看不见，也不认为需要看见（合同的验收对象是 HEAD）。

---

## 十、边界确认

| 项 | 状态 |
| --- | --- |
| `git push` | **未执行**，一次都没有 |
| 合并到 `main` | **未执行**。源码仓库仍在 `zhennn/w15-main-hook-split` @ `0858b7f`，`main` 仍为 `e6fadc9` |
| 修改源码或测试 | **未修改**。源码仓库 `git status --porcelain` 为空；5 个文件 SHA-256 与 `0858b7f` 逐个 MATCH |
| 造反例的临时环境 | 在 scratchpad 建临时 git worktree 与文件副本，用完 `git worktree remove --force` ＋ `git worktree prune`，`git worktree list` 现仅剩主工作树 |
| 读取 `~/Downloads/history_OKX/` | **未读取**。未打开任何真实 `.lftl` 或真实备份文件 |
| 改写既有报告 | **未改写**。`10A`／`10B`／`10C` 及历史 `08*`／`09*` 一字未动；本报告为新建文件，更正另起第十二节 |
| `04_DEIK-AI-Challenge-2026/` | **未触碰**。`git status --porcelain` 对该目录为空 |
| 两个仓库分开 | 未在任一仓库产生提交。文档仓库 `git status --porcelain` 为空 |
| `.git/*.lock` | 未遇到，未删除任何锁 |
| 自行 git commit | **未执行**，按指令交回产品负责人裁决 |

---

## 十一、未核验事项清单

**如实列出，不用别的数字顶替，不作推断。**

1. **`build` 产物大小是否相对 `main` 变化** —— 未核验。我只跑了 HEAD 的 build，没在 `main` 上跑 build 做对照。
2. **本批对性能的影响** —— 未核验。未跑任何性能量尺（`10A` G 节已将 V-4 移出本批）。
3. **12 块函数体内部逻辑的正确性** —— 未核验，也不在本批范围。我只证明它与 `main` 逐字节相同。
4. **中间 12 笔提交各自的完整内容** —— 未逐笔验收（仅为定位 6.3 成因逐笔跑了 lint）。
5. **4 个新模块内部的组织质量**（`Lifecycle.ts` 的 import 语句分散在第 10–23 行与第 514–519 行两处，即文件中部仍有 import） —— **我发现了但未判定**。ES 模块允许 import 出现在文件任何顶层位置，`lint`／`typecheck`／`build`／结构守卫均未对此报错，合同 `10A`／`10B` 也未就模块内部排版立规。**记录备查，是否整理由产品负责人决定。**
6. **6.3 那条 `eslint-disable` 未来是否应当撤除** —— 未判定，建议见 6.3，立项与否由产品负责人决定。
7. **小C 声称的 H-1 双向行多重集合比对「旧有新无 21 行」** —— 未复核该具体数字。我用的是更强的序列级比对（R-1）与完整改动清点（R-5′／R-5″），结论覆盖了它要证明的东西，因此未去复算这个中间量。**该数字在本报告中不被引用、也不被背书。**
8. **`08A` 修订 C 的 G-1（7 个返回分支无真实断言）** —— 仍未补测，本批 A-10 禁止新增测试。**与本批无关，但仍然悬着。**

---

## 十二、对既有文档的更正（另起一节，不改原文）

按硬规矩，`10A`／`10B`／`10C` 与本次验收指令的原文一字未动。以下是我实测发现的偏差，供产品负责人裁决是否回填。

### 更正一：验收指令中的 `origin/main` SHA 有误

指令写：

> **`origin/main`**：`8df62d8b4b2bead68bf2209765ce39379e23288d`（请自行 `git rev-parse` 确认）

**实测：**

```text
git rev-parse origin/main  → e6fadc9860c82c4cf1b3a260c82df8fed1139106
git rev-parse main         → e6fadc9860c82c4cf1b3a260c82df8fed1139106
```

`origin/main` 与 `main` **同为 `e6fadc9`**，指令中的 `8df62d8…` 在本仓库中不存在于该引用上。

**影响：闸门 `git diff origin/main...0858b7f --check` 因此等价于 `git diff main...0858b7f --check`。** 我照抄命令执行，EXIT=0，闸门有效。但请注意：**这条闸门实际上并没有比前一条多验到什么**，因为两个引用指向同一提交。

### 更正二：`10C` 对 843／844 行差的解释不成立

`10C` Q-1 写：

> 最终文件没有末尾换行，故 `wc -l` 为 843、AST 最后一逻辑行是 844

**实测：5 个文件末字节全部是 `0a`（换行），`git diff` 中 `No newline at end of file` 出现 0 次。**

```text
head_usePersistentLedger.ts             lastbyte=0a  OK(newline)
head_usePersistentLedgerActions.ts      lastbyte=0a  OK(newline)
head_usePersistentLedgerImport.ts       lastbyte=0a  OK(newline)
head_usePersistentLedgerLifecycle.ts    lastbyte=0a  OK(newline)
head_usePersistentLedgerPersistence.ts  lastbyte=0a  OK(newline)

git diff main..0858b7f | grep -c "No newline at end of file"  → 0
```

**正确的数字：**

```text
HEAD 文件 843 行（有末尾换行）
函数 usePersistentLedger 范围 92–843，共 752 行
```

`10C` 的「844」与「92–844」**均多 1**，其给出的原因（缺末尾换行）**与事实相反**。真实成因应是把 AST 的结束位置（落在最后一个换行之后）换算成了额外一行。

**这是计数口径问题，不影响任何通过线，`10C` 自己也说明了「非通过线」。** 但既然本项目已五次因数字出错付出代价，这一处照样记下来。

### 更正三：`10B` 的外部引用数预设值有 9 处偏高（`10C` 的更正方向正确）

`10B` 预设 20/4/19/17/13/17/15/20/35/13/31/37；我独立 AST 实测为 **19/4/17/15/13/16/15/18/34/12/30/36**，与 `10C` 的实测列逐个吻合。**`10B` 的预设表不应再被引用。**

---

## 十三、给后面三批的一句话

`10A` 最后一句说，本批的结论决定后面三个大文件（`DashboardShell.tsx` 1,337、`LedgerAccessGate.tsx` 996、`ledgerFileAccessController.ts` 916）怎么做。

**这套方法可以推广。** 实际结果比合同要求的还硬一档——12 块函数体**连缩进都没动，逐字节相同**，合同预留的四类允许差异只用上了两类（签名加 `deps`、体首加解构行）。这意味着后续批次可以把通过线直接定成：

> **剔除首行 `const { ... } = deps;` 之后，函数体与原文 SHA-256 相等。**

一条 SHA 比对就能收口，比逐条落实差异省事得多，也没有人眼判断的余地。

**但要带上本批学到的两条补充检查，否则会漏：**

1. **`Deps` 字段的名字集合相等还不够，要再验嵌套形状与属性级用量**（6.2 的 `activeCapabilities` 就是从名字集合底下漏过去的）。
2. **要单独比对「没被搬运」的那部分代码**（6.3 的 `eslint-disable` 就藏在这里；只比对搬走的块，会整个错过它）。

第 2 条尤其要记住：本批 12 块搬运本身**一处问题都没有**，两处需要知情的发现**全都在搬运之外**。

---

*报告完。未自行 git commit，交回产品负责人裁决。*
