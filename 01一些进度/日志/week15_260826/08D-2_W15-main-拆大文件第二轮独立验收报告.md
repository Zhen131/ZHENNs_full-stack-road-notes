# 08D-2　W15-main 拆大文件第二轮　独立验收报告

- **验收人**：独立验收会话（不代表执行方，也不代表合同作者小C）
- **验收日期**：2026-09-02
- **验收对象**：`zhennn/w15-main-test-split` @ `e6fadc9860c82c4cf1b3a260c82df8fed1139106`
- **基线**：`main` @ `5c825c23bac5bb120a6b7d59f9f1bebf4f3f8e77`
- **`origin/main`**：`8df62d8b4b2bead68bf2209765ce39379e23288d`（已 `git rev-parse` 自行确认）
- **合同**：`08A` 修订 D（冲突处以修订 D 为准）+ `08B` T-1～T-6

> 本报告中的每一个数字都由验收方自行跑出。凡未自行复核的，均在正文中明确标注「未复核」。
> 执行报告 `08C-2`、`08C`、`08D` 原文一字未改；本报告的更正另起一节（见 §7）。

---

## 1　结论

# **PASS**

21 笔提交、12,097 行测试代码的重新组织、63 个新增文件，经双向逐字节比对，**未发现任何一行原代码丢失，也未发现任何一行新代码无法追溯到 `main@5c825c2`**。全部闸门为绿，含验收方自跑的 `npm run build`。

对 `e6fadc9`（合同作者小C 本人所写的那一笔）的独立判断：**维持「允许搬」的结论，但理由与小C 所述不同，且比小C 的理由更强**（见 §5.4）。验收方行使了推翻权并选择不推翻。

无条件通过。附带 4 处**数字更正**（§7），均不影响结论，但应记入项目账，因为其中 2 处是本项目第五、第六次「数字未经复核就写进文档」。

---

## 2　R-1　双向逐字节比对（本轮核心）

### 2.1 为什么必须补反方向

`08C-2` §1.4 的自证是**单向**的：它证明「新文件里的每一行都来自原文件」（无新增、无篡改），但证明不了「原文件里的每一行都还在」（无丢失）。若某条断言行被静默删掉，贪心匹配只会把一个覆盖块拆成两个，`UNCOVERED` 仍是 0。

### 2.2 方法

对 7 个原文件的每一组：

1. 取 `git show main:<原文件>` 的**全部**内容，按行构建**多重集合**（记录每行出现次数）。
2. 取该组全部新文件（`git show e6fadc9:<新文件>`）的全部内容，合并为一个多重集合。
3. 做**双向多重集合差**：`LOST = 原 − 新`（原文件有而新文件缺），`ADDED = 新 − 原`。
4. 对 `LOST` 与 `ADDED` 的**每一条**做归类，只接受四类：`import` 行增减（T-4 允许）、为搬运添加的 `export` 关键字（`08B` F-1 允许）、`vi.mock` 块逐字复制（偏差 1）、以及每文件必需的 `// @vitest-environment jsdom` 与顶层 `describe` 包裹的复制。**任何归不进这四类的残留即为缺陷。**

原文件→新文件的对应关系不采信任务书表格，由 `git show --name-status` 逐笔自行确认：7 个拆分提交各自只动一个原文件及其新文件，互不交叉。

### 2.3 逐组结果

原文件行数（自行 `wc -l`，合计 **12,097**，与任务书一致）：

| 原文件 | 行数 | 新文件数 |
| --- | ---: | ---: |
| `usePersistentLedger.test.tsx` | 2,853 | 8 test + 1 helper |
| `DashboardShell.interaction.test.tsx` | 2,298 | 7 test + 1 helper |
| `LedgerAccessGate.test.tsx` | 1,922 | 7 test + 1 helper |
| `ledgerFileAccessController.test.ts` | 1,905 | 7 test + 1 helper |
| `usePersistentLedger.fileCapabilities.test.tsx` | 1,271 | 3 test + 1 helper |
| `usePersistentLedger.fileImport.test.tsx` | 1,149 | 2 test + 1 helper |
| `TransactionsWorkspace.test.tsx` | 699 | 3 test + 1 helper |
| **合计** | **12,097** | **37 test + 7 helper** |

**`LOST` 方向（原文件的行是否都还在）——逐条归类结果：**

| 组 | LOST 总数 | IMPORT | EXPORT 前缀 | **未判定** |
| --- | ---: | ---: | ---: | ---: |
| `usePersistentLedger.test.tsx` | 13 | 3 | 10 | **0** |
| `DashboardShell.interaction.test.tsx` | 19 | 2 | 17 | **0** |
| `LedgerAccessGate.test.tsx` | 14 | 2 | 12 | **0** |
| `ledgerFileAccessController.test.ts` | 13 | 0 | 13 | **0** |
| `usePersistentLedger.fileCapabilities.test.tsx` | 11 | 3 | 8 | **0** |
| `usePersistentLedger.fileImport.test.tsx` | 13 | 2 | 11 | **0** |
| `TransactionsWorkspace.test.tsx` | 7 | 2 | 5 | **0** |

**`ADDED` 方向（新文件的行是否都来自原文件）——逐条归类结果：**

| 组 | IMPORT | VI_MOCK 复制 | 空行 | env 注释 | 顶层 describe 开/闭 | **未判定** |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `usePersistentLedger.test.tsx` | 202 | 0 | 14 | 7 | 3 / 3 | **0** |
| `DashboardShell.interaction.test.tsx` | 175 | 144 | 18 | 6 | 2 / 2 | **0** |
| `LedgerAccessGate.test.tsx` | 202 | 606 | 18 | 6 | 6 / 6 | **0** |
| `ledgerFileAccessController.test.ts` | 122 | 0 | 6 | 0 | 6 / 6 | **0** |
| `usePersistentLedger.fileCapabilities.test.tsx` | 82 | 0 | 4 | 2 | 2 / 2 | **0** |
| `usePersistentLedger.fileImport.test.tsx` | 41 | 0 | 1 | 1 | 1 / 1 | **0** |
| `TransactionsWorkspace.test.tsx` | 59 | 0 | 4 | 2 | 0 / 0 | **0** |

**全项合计：`IMPORT` 897、`EXPORT 前缀` 76、`VI_MOCK 复制` 750、空行 65、env 注释 24、顶层 describe 开 20 闭 20。**

```
TOTAL UNRESOLVED (either direction): 0
```

**7 组、两个方向、零未判定残留。**

### 2.4 补充：顺序保持性（多重集合比对的已知盲区之补强）

多重集合比对对**顺序不敏感**。为此另做一次顺序敏感的检验：剥掉 `import` / `vi.mock` / env 注释后，用 `difflib.SequenceMatcher` 把每个新文件的正文对原文件正文做**单调递增**的连续区间匹配。

- **37 个新测试文件全部 `unmatched = 0`，每个只需 2～4 个连续区间**即可完整覆盖。即：每个测试文件的正文都是原文件若干段连续行的**保序拼接**。
- 7 个 `testHelpers` 文件各有若干行未匹配，逐组核对后确认：**未匹配行数恰好等于该组 `EXPORT 前缀` 数**（10/17/12/13/8/11/5），且每一条都验证为「`export ` + 原文件中某条未被覆盖的声明行」，剩余量为 0。
- 原文件正文侧覆盖率：未被覆盖的行 = 上述被加了 `export` 的声明行 + 少量空行（空行在多重集合方向已证明只增不减）。

两个方向都干净，**R-1 判定 PASS**。

### 2.5 附带：产品代码 14 笔提交的同口径检验

R-1 只要求测试文件。验收方另对 14 笔产品代码提交（3 笔 S-2′ + `e6fadc9` + 10 笔 S-3′）做了同样的「移走的行是否都重新出现」检验：

```
TOTAL UNACCOUNTED REMOVED LINES ACROSS 14 PRODUCTION COMMITS: 0
```

---

## 3　R-2　describe 结构与用例全名

### 3.1 R-2b　用例全名（主证据链，独立重跑）

两侧使用**同一条命令、同一去重方式**。`main` 侧在 scratchpad 的临时 worktree 中导出（用完已删除，见 §8）。

```bash
npx vitest list --json
```

| | 全部（含重复） | `sort -u` 后 |
| --- | ---: | ---: |
| `main@5c825c2` | **1,186** | **1,169** |
| `e6fadc9` | **1,186** | **1,169** |
| `diff` | **空** | **空** |

两侧排序后文件的 SHA-256 完全相同：

```
d3b5c83df3675ad04f5aa915bee67c09ef2c82c5f94fad75db326d0fe6753e3b  names_main.txt
d3b5c83df3675ad04f5aa915bee67c09ef2c82c5f94fad75db326d0fe6753e3b  names_head.txt
```

**用例全名逐字未变。** 与小C 的参考值（1186 / 1169）一致——但本行数字是验收方独立跑出的。

### 3.2 R-2a　describe 结构

逐文件核对顶层 `describe` 名称与嵌套层数：

- 7 个原文件的 `describe` **全部位于第 0 缩进层，无任何嵌套**（各组顶层 describe 数：5 / 5 / 1 / 1 / 1 / 1 / 3）。
- 37 个新测试文件**每个恰有 1 个顶层 `describe`，无嵌套**，且其名称**全部取自原文件的顶层 describe 名称集合**，无一例外、无新造名称。
- 嵌套层（缩进 > 0）的 `describe` 多重集合：**main 为空，新文件也为空——完全守恒**。

因此**没有任何一层 `describe` 被新增或删除**。这一点同时被 §3.1 独立佐证：用例全名即 `describe > … > it` 链，全名逐字不变即意味着层级不变。

顺带说明一处**不是缺陷**的现象：`usePersistentLedger.savePipeline.test.tsx` 的顶层 describe 名为 `usePersistentLedger hydration safety`，`sessionQuiesce` / `sessionSwitch` 两个文件的顶层 describe 名为 `usePersistentLedger clear recovery and lifecycle`。即**文件名的关注点与 describe 名不一一对应**——因为原文件里这些用例本就在那个 describe 之下。合同要求的是 describe 名**不变**，而非与文件名一致，故合规。

### 3.3 R-2c　T-1／T-2 命名

- **无编号**：`part[0-9]` / `split[0-9]` / `.1.` / `.a.` / `.b.` 等模式全数组扫描，**0 命中**。
- **无中文/非 ASCII**：63 个新增文件名全数组扫描，**0 命中**。
- **格式**：37 个新测试文件**全部**匹配 `^<被测对象>.<关注点>.test.(ts|tsx)$`，逐个列出核对，**0 例外**。
- 7 个 helper 均为 `<被测对象>.testHelpers.(ts|tsx)`。

---

## 4　R-3　S-2′ 与 S-3′ 的纯搬运性

### 4.1 R-3a　10 个 S-3′ 子组件：JSX 逐字节 + 原本在巨型组件内部

`main@5c825c2` 上两个巨型组件的括号跨度（自行按大括号配平计算）：
`DashboardShell` = 第 **68–1466** 行；`LedgerAccessGate` = 第 **70–1042** 行。

对每个新组件取其 `return ( … );` 之间的正文，在**其提取前的父提交**中做连续行序列精确查找，并在 `main@5c825c2` 上定位：

| 新组件 | JSX 行数 | 提取前逐字相同 | 在 `main` 上的起止行 | 在巨型组件内部 |
| --- | ---: | --- | --- | --- |
| `SessionFatalPanel.tsx` | 10 | 是 | 530–539 | ✅ |
| `SessionQuiescingPanel.tsx` | 5 | 是 | 545–549 | ✅ |
| `LockConfirmationPanel.tsx` | 38 | 是 | 569–606 | ✅ |
| `PersistenceErrorNotice.tsx` | 16 | 是 | 636–651 | ✅ |
| `RepositorySwitchBlockedNotice.tsx` | 15 | 是 | 671–685 | ✅ |
| `CompatibilityWarningList.tsx` | 13 | 是 | 688–700 | ✅ |
| `FutureCorrectionPanel.tsx` | 91 | 是 | 703–793 | ✅ |
| `SessionLockingPanel.tsx` | 14 | 是 | 706–719 | ✅ |
| `AccessCheckingPanel.tsx` | 8 | 是 | 774–781 | ✅ |
| `LegacyRetiredPanel.tsx` | 8 | 是 | 787–794 | ✅ |

**10/10 全部通过。** 提取时连原有的深层缩进都原样保留（新文件的 `return (` 之后直接是原来那一段带 10～14 个空格缩进的 JSX），这是纯复制粘贴的强旁证。

### 4.2 R-3b　新提取文件不含 hook

对 19 个新增产品文件全数扫描（正则口径见 §4.3）：

- **10 个 S-3′ 子组件：hook 调用数全部为 0。** ✅
- 其余 8 个类型/helper 文件：全部为 0。
- `PasswordField.tsx`：6 个（`useLanguage` / `useId` / `useRef` / `useState` / `useEffect` / `useEffect`）。**这不违反 S-3′**，因为 `PasswordField` 不是从巨型组件内部提取的子组件，而是 S-2′ 的「已有小组件」整体搬运——`main@5c825c2` 上它是第 1069 行起的**顶层同级函数**，位于 `LedgerAccessGate`（70–1042）**之外**。详见 §5.4。

### 4.3 R-3c　四个大文件的 hook 调用点多重集合

**口径（明确声明，因本项目已两次栽在正则漏抓上）**：`(?<![\w.])(use[A-Z][A-Za-z0-9_]*)\s*(?:<泛型，允许一层嵌套>)?\s*\(`，即**能匹配 `useRef<HTMLInputElement>(null)` 这类泛型写法**，且排除 `foo.useX(` 这类成员调用。已验证 `useReducer` / `useLayoutEffect` / `useId` 均被抓到（见下表）。

| 文件 | main | HEAD | 判定 |
| --- | ---: | ---: | --- |
| `usePersistentLedger.ts` | 65 | 65 | **多重集合完全相同** |
| `DashboardShell.tsx` | 28 | 28 | **多重集合完全相同** |
| `ledgerFileAccessController.ts` | 0 | 0 | **多重集合完全相同** |
| `LedgerAccessGate.tsx` | 23 | 17 | 差 6，全部由 `PasswordField` 搬出所致 |

`usePersistentLedger.ts` 明细（main = HEAD）：`useCallback` 12、`useEffect` 6、`useLayoutEffect` 1、`useMemo` 4、`usePersistentLedger` 1、`useReducer` 2、`useRef` 28、`useState` 11。
`DashboardShell.tsx` 明细（main = HEAD）：`useEffect` 7、`useLanguage` 1、`useLayoutEffect` 1、`useLedgerWorkspaceSession` 1、`usePersistentLedger` 1、`useRef` 5、`useState` 10、`useWriteCycleDashboardDerivations` 2。

**三个文件多重集合逐项相同；第四个的差额在 §4.4 合并后归零。**

### 4.4 R-3d　`e6fadc9`（小C 那一笔）

**（a）`PasswordField` 函数体逐字节比对**——三方 SHA-256：

```
main@5c825c2  LedgerAccessGate.tsx 第 1069–1204 行（136 行） : 80cb60eb8a3ca2aa7bfb3be20ad1dee55cfb3b75eed82d9d6d4567c25c21e549
父提交 6eca110 LedgerAccessGate.tsx 第 998–1133 行（136 行） : 80cb60eb8a3ca2aa7bfb3be20ad1dee55cfb3b75eed82d9d6d4567c25c21e549
HEAD e6fadc9  PasswordField.tsx 第 6–141 行（去掉 export 前缀） : 80cb60eb8a3ca2aa7bfb3be20ad1dee55cfb3b75eed82d9d6d4567c25c21e549
```

**三者字节完全相同。** 唯一改动是首行加 `export ` 与新增 import 头。

**（b）内部 hook 顺序**：`useLanguage → useId → useRef → useState → useEffect → useEffect`，与 `main` 一致（同一段字节，必然一致）。

**（c）两文件合计 hook 调用点**：

| | 调用点数 |
| --- | ---: |
| `main` 的 `LedgerAccessGate.tsx` | **23** |
| HEAD 的 `LedgerAccessGate.tsx` | 17 |
| HEAD 的 `PasswordField.tsx` | 6 |
| **HEAD 合计** | **23** |

逐项：`useCallback` 1=1、`useEffect` 3=3、`useId` 1=1、`useLanguage` 2=2、`useRef` 7=7、`useState` 9=9。**合并后多重集合与 `main` 完全相同。**

> 注意：小C 的参考值与 `e6fadc9` 的提交信息都写「**25**」。验收方在自己的口径下得到 **23 = 23**。两者的**相等关系**都成立，结论不受影响，但 25 这个数字验收方**无法复现**，见 §7.3。

**（d）删除 `useId` import**：`e6fadc9` 的 diff 确认从 `LedgerAccessGate.tsx` 的 import 块删掉了 `useId`，并新增 `import { PasswordField } from "./PasswordField";`。搬走后 `LedgerAccessGate.tsx` 内已无 `useId` 调用（上表 `useId` main=1、HEAD=0），删除正确，`typecheck` 与 `lint` 均为绿。

### 4.5 R-3e　S-4′ 未做

`src/app` 下的目录集合，`main` 与 `e6fadc9` **逐字相同**：

```
main:     src/app  src/app/fonts
e6fadc9:  src/app  src/app/fonts
diff: 空
```

`src/app/fonts` 在 `main` 上**本就存在**，非本批新增。**无任何新增子目录，S-4′ 确未开工。** ✅

---

## 5　R-4／对 `e6fadc9` 那条裁决的独立判断

### 5.1 偏差 1：`vi.mock` 逐字复制而非提入 helper —— **判定：成立，接受**

执行者的理由是关于 vitest hoisting 语义的技术判断。验收方**没有采信，而是做了实验**（在 scratchpad 临时 worktree 中，用完已删除）。

构造三个测试文件，被 mock 的模块 `target.ts` 真实返回 `"REAL"`，helper 中的 `vi.mock` 令其返回 `"MOCKED"`：

| 实验 | `vi.mock` 位置 | import 顺序 | 结果 |
| --- | --- | --- | --- |
| 对照组 | 不引入 helper | — | `REAL` ✅（确认 mock 不会跨文件泄漏，实验有效） |
| orderA | 引入的 helper 中 | **先** helper，**后** target | `MOCKED` ✅ mock 生效 |
| orderB | 引入的 helper 中 | **先** target，**后** helper | **`REAL` ❌ mock 静默失效** |

```
✓ src/exp/noHelper.test.ts > control: no helper import > value is REAL
✓ src/exp/orderA.test.ts   > orderA: helper first > value is MOCKED
× src/exp/orderB.test.ts   > orderB: target first > value is MOCKED
  → expected 'REAL' to be 'MOCKED' // Object.is equality
```

**结论：理由成立，且比执行者写的更严重。** 把 `vi.mock` 放进被 import 的 helper，其是否生效**取决于消费方测试文件里 import 语句的先后顺序**；顺序不利时 mock **静默失效**——测试会转而跑真实模块，且只有在断言恰好能区分两者时才会报错。本仓库 `npm run lint` 以 `--max-warnings=0` 运行，import 顺序正是 lint/格式化工具会重排的东西。**这确实是正确性要求，不是省事。**

**被复制的 `vi.mock` 块是否与原文件逐字相同**——按块取 SHA-256 比对：

| 原文件 | 原文件中的 `vi.mock` 块 | 复制到的新文件 | 结果 |
| --- | --- | ---: | --- |
| `DashboardShell.interaction.test.tsx` | 1 块 `f292c55c7e47` | 7 个测试文件中的 6 个 | **全部 IDENTICAL** |
| `LedgerAccessGate.test.tsx` | 1 块 `f5f45e462e68` | 7 个测试文件中的 6 个 | **全部 IDENTICAL** |
| 其余 5 个原文件 | 0 块 | — | 新文件中亦为 0 块 |

**所有被复制的 `vi.mock` 块与 `main` 逐字节相同，且没有任何 `vi.mock` 混进 helper 文件。** ✅

### 5.2 偏差 2：helper 后缀 `.tsx` —— **判定：理由成立，接受；但数量写错了**

- 理由核实：TypeScript 确实要求含 JSX 的文件用 `.tsx`。两个 `.tsx` helper **都确实含真 JSX**：
  - `DashboardShell.testHelpers.tsx:273`　`render(<DashboardShell repository={repository} />)`
  - `TransactionsWorkspace.testHelpers.tsx:99-114`　`render(<TransactionsWorkspace active={active} … />)`
- 5 个 `.ts` helper **确实不含 JSX**（闭合标签数全为 0），后缀正确。
- **数量更正**：实际是 **2** 个 `.tsx`，不是 `08C-2` §1.5 表头写的「3 个」。见 §7.1。
- 命名规则其余部分（无编号、无中文、`<被测对象>.testHelpers`）全部遵守。

### 5.3 角色重叠的处理

`e6fadc9` 由合同作者小C 本人撰写，且小C 同时裁决了自己那条合同条款（A-2）是否被违反。验收方按任务书要求，**未因「小C 说没问题」而放宽**，对该笔施加了与其余 20 笔相同（实际上更严）的检验：字节级 SHA-256 比对、hook 多重集合合并核算、内部 hook 顺序核对、import 删除核对，以及下面的条款独立解释。

### 5.4 对 A-2 的独立判断：**维持「允许搬」，但理由与小C 不同**

**小C 的理由**是：A-2 的本意是防止改变*一个组件内部*的 hook 注册顺序，整块搬走不改变这一点。

**验收方认为这个理由虽然结论正确，但不是决定性的**——它默认了「`PasswordField` 是 `LedgerAccessGate` 的一部分」，然后论证「整块搬不影响顺序」。真正决定性的事实更简单，且验收方是自己查出来的：

> **`PasswordField` 从来就不在 `LedgerAccessGate` 里面。**
>
> 在 `main@5c825c2` 的 `LedgerAccessGate.tsx` 中，按大括号配平计算：
> - `export function LedgerAccessGate(` 的函数体跨度 = 第 **70 – 1042** 行
> - `function PasswordField(` 起于第 **1069** 行
>
> 该文件第 0 缩进层的声明依次为：`AccessState`(39)、`AccessPath`(49)、`PendingSessionCompletion`(58)、`pendingSessionCompletions`(65)、`LedgerAccessGate`(70)、`AccessPanel`(1044)、**`PasswordField`(1069)**、`FormError`(1206)、`getAccessErrorMessage`(1214)、`getFileAccessErrorMessage`(1230)。
>
> `PasswordField` 是与 `LedgerAccessGate` **平级的顶层函数**，只是恰好住在同一个文件里。

由此：

1. **A-2 根本没有被触发。** A-2 禁止的是移动 hook 调用以致改变*某个组件内部*的注册顺序。此处不存在任何一个组件的内部 hook 顺序发生变化：`PasswordField` 自身的 6 个 hook 是同一段字节（SHA-256 已证），顺序不动；`LedgerAccessGate` 自身的 17 个 hook 一个没碰。
2. **它本来就该走 S-2′，不是 S-3′。** `08A` 修订 A 的 S-2 把「已有的小组件」列入可搬范围；任务书 R-3a 的 B-4 更是明写「原本就在主体外的组件属 S-2′，不计入 S-3′」。`PasswordField` 与同批搬走的 `AccessPanel`(1044)、`FormError`(1206) 完全同类，而后两者在 `8661418` 中搬走时无人认为有争议。
3. **因此当初根本不存在 A-2 与 S-2 的冲突**，执行者是过度谨慎地自设了一个冲突并上报。这一点上执行者的谨慎无可指摘（宁可上报也不擅动是对的），小C 的裁决结论也正确。

**验收方不推翻该裁决。** 但要记录一句：这次「合同作者自己写代码 + 自己裁决自己的条款」之所以没出事，靠的是结论恰好正确，而不是靠流程。流程上它仍是一处角色重叠，下批应避免。

---

## 6　R-5　全部闸门原始输出

命令全部照抄任务书，未凭记忆构造路径。顺序：`build` 先跑，`typecheck` 在 `build` 之后串行。

### `npm test`
```
> local-first-trading-ledger@0.1.0 test
> vitest run

 RUN  v4.1.9 …/LocalFirstTradingLedger

 Test Files  137 passed (137)
      Tests  1186 passed (1186)
   Start at  20:20:10
   Duration  39.29s (transform 6.68s, setup 15.95s, import 21.93s, tests 133.77s, environment 34.35s)

NPM_TEST_EXIT=0
```
（原始输出另含 `(node:…) Warning: --localstorage-file was provided without a valid path` 若干行，为 vitest 环境噪声，`main` 侧同样存在，与本批无关。）

### `npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts`
```
 RUN  v4.1.9 …/LocalFirstTradingLedger

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  20:28:16
   Duration  1.67s (transform 67ms, setup 0ms, import 86ms, tests 1.51s, environment 0ms)

EXIT=0
```

### `npm run build`　（小C 未跑，验收方自跑）
```
> local-first-trading-ledger@0.1.0 build
> next build

   ▲ Next.js 15.5.22

   Creating an optimized production build ...
 ✓ Compiled successfully in 4.4s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/5) ...
 ✓ Generating static pages (5/5)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                     377 kB         479 kB
└ ○ /_not-found                            993 B         103 kB
+ First Load JS shared by all             102 kB
  ├ chunks/255-3d881dfa8c72bc56.js       46.3 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)           1.9 kB

○  (Static)  prerendered as static content

BUILD_EXIT=0
```

### `npm run typecheck`
```
> local-first-trading-ledger@0.1.0 typecheck
> tsc --noEmit

TYPECHECK_EXIT=0
```
（无任何输出）

### `npm run lint`
```
> local-first-trading-ledger@0.1.0 lint
> eslint . --max-warnings=0

EXIT=0
```
（无任何输出）

### `npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts`
```
 RUN  v4.1.9 …/LocalFirstTradingLedger

 Test Files  2 passed (2)
      Tests  8 passed (8)
   Start at  20:28:22
   Duration  2.76s (transform 402ms, setup 540ms, import 275ms, tests 2.09s, environment 0ms)

EXIT=0
```

### `npx vitest run src/test-support/translationKeyUsage.test.ts`
```
 RUN  v4.1.9 …/LocalFirstTradingLedger

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  20:28:26
   Duration  1.00s (transform 188ms, setup 227ms, import 221ms, tests 410ms, environment 0ms)

EXIT=0
```

### `git diff --check` / `git diff origin/main...e6fadc9 --check`
```
$ git diff --check
EXIT=0                       （无输出）

$ git diff origin/main...e6fadc9 --check
EXIT=0                       （无输出）
```

### D-1 通过线
```bash
find src/app -name "*.test.ts" -o -name "*.test.tsx" | xargs wc -l | awk '$1>=600 && $2!="total"'
```
```
（无输出）
```
**`src/app` 下已无 600 行以上的测试文件。** ✅

四个大文件收尾行数（自跑，与小C 参考值一致）：

| 文件 | main | HEAD |
| --- | ---: | ---: |
| `usePersistentLedger.ts` | 1,964 | **1,763** |
| `DashboardShell.tsx` | 1,482 | **1,337** |
| `LedgerAccessGate.tsx` | 1,282 | **996** |
| `ledgerFileAccessController.ts` | 1,172 | **916** |

**全部闸门为绿，无一变红。**

---

## 7　更正（本报告新增，不改写任何既有报告原文）

### 7.1　`08C-2` §1.5 偏差 2：「3 个 helper 文件后缀为 `.tsx`」——实为 **2 个**

实际后缀分布：**5 个 `.ts` + 2 个 `.tsx`**。

`.tsx`：`DashboardShell.testHelpers.tsx`、`TransactionsWorkspace.testHelpers.tsx`。

该表格单元格自身的枚举其实是对的（它列了 2 个 `.tsx`，第三项是括号里说明 `LedgerAccessGate` 的 helper **无 JSX、仍为 `.ts`**），是表头的「3 个」这个数与枚举内容不符。属计数笔误，不影响判定。

### 7.2　任务书 R-3d：「`main@5c825c2` 的 `LedgerAccessGate.tsx` 第 998–1133 行」——行号张冠李戴

第 998–1133 行是**父提交 `6eca110`** 上的位置（`e6fadc9` 的提交信息原话是「lines 998-1133 of the **previous file**」，本身没错）。在 `main@5c825c2` 上，`PasswordField` 位于第 **1069–1204** 行。`main` 第 998 行的实际内容是 `          <button`。

两处的 136 行字节完全相同（§4.4 三方 SHA-256 已证），故**实质结论不受影响**；但任务书把「父提交的行号」转述成了「`main` 的行号」，属转述失真。

### 7.3　hook 调用点「25」无法复现——验收方口径为 **23**

小C 参考值与 `e6fadc9` 提交信息均称 `LedgerAccessGate.tsx` + `PasswordField.tsx` 合计 hook 调用点「25 = 25」。验收方在 §4.3 声明的口径下逐个列出全部调用点及行号，得 **23 = 23**（`main` 侧 23 个：第 77、78、81–86、88、89–93、97、111、202、1082–1085、1087、1093 行）。

**相等关系两种口径都成立，结论不受影响。** 但 25 这个数验收方无法复现，也未能推断出产生它的口径（同文件「任意 `use[A-Z]` 词元」的宽松计数为 34，亦非 25）。**按任务书要求，此处标注为：小C 的 25 未获复核，验收方自跑值为 23。**

### 7.4　`08C-2` §1.4 的 `body` 行数与验收方口径不一致（非缺陷）

例如 `usePersistentLedger.hydration.test.tsx`，`08C-2` 记 `body=322`，验收方剥离口径下为 325。差异来自「文件体」如何界定（是否含 env 注释行、`describe` 包裹行、末尾空行）。**两者都不构成缺陷**，仅说明两份报告的 `body` 数不可互相引用。验收方的结论不依赖该数。

---

## 8　边界确认

| 项 | 状态 |
| --- | --- |
| **未 `git push`** | ✅ 全程未执行任何 push。`origin/main` 仍为 `8df62d8`，本地分支未推送 |
| **未合并到 `main`** | ✅ `main` 仍为 `5c825c2`，未做任何 merge |
| **未修改任何源码或测试** | ✅ 源码仓库 `git status --porcelain` **输出为空**；HEAD 仍为 `e6fadc9`；分支仍为 `zhennn/w15-main-test-split` |
| **反例实验的隔离** | ✅ §5.1 的 vitest 实验与 §3.1 的 `main` 侧用例导出，均在 scratchpad 的临时 detached worktree 中进行；实验文件已删、`node_modules` 符号链接已删、`git worktree remove --force` + `git worktree prune` 已执行；`git worktree list` 现仅剩主工作目录一条 |
| **未读取私有区** | ✅ 全程未访问 `/Users/zhuzhen0131/Downloads/history_OKX/`，未打开任何真实 `.lftl` 或真实备份文件 |
| **未改写既有报告** | ✅ `08C`／`08C-2`／`08D` 一字未动（仅读取）。本报告为新建文件，更正另起 §7 |
| **未碰 DEIK 目录** | ✅ 全程未访问 `04_DEIK-AI-Challenge-2026/`，未在根文档仓库执行任何 git 写操作，未触碰任何 `.git/*.lock` |
| **两仓库未混提交** | ✅ 验收方未做任何 commit |

---

## 9　本方法的盲区（如实声明它证明不了什么）

1. **多重集合比对本身对顺序不敏感。** §2.4 的保序区间匹配补强了这一点（37 个测试文件全部 `unmatched=0`、仅需 2～4 段），但 `difflib` 的区间匹配是**贪心**的，且空行、`});` 这类高频重复行的对齐存在多解。**若有人在同一组内、在两个用例之间对调了两段行数相同的代码，且对调后各自仍构成连续区间**，本方法可能仍显示为若干个连续区间而不报警。区间数低（≤4）把这种可能性压得很小，但没有排除到零。
2. **行级比对看不见「同一行内的字符重排」以外的语义。** 本方法证明的是**文本搬运**，不是**行为等价**。若原文件中某段代码本身就有 bug，搬运后 bug 原样保留——这不是本次验收要发现的问题。
3. **`npm test` 全绿不等于「什么都没变」。** 这正是 09 批 4 处中文被静默改写而 1,185 条测试全绿的教训。本报告的主证据是 §2 的逐字节比对，**不是**闸门为绿；闸门只是必要条件。
4. **用例全名不变不等于用例内容不变。** 一个被改成空壳的用例仍会顶着原名通过。此项由 §2 的字节比对覆盖，但如果有人**同时**改了字节又改了名字使两者自洽——本方法会在 §2 报警，不会漏。
5. **未验证被跳过的用例。** 全名清单来自 `vitest list`，两侧同为 1,186 且逐字相同；`npm test` 报 1,186 passed，无 skipped。但验收方**没有单独核对 `it.skip` / `it.only` 的分布**是否与 `main` 一致（若两侧都 skip 同一条，全名与计数都不会变）。
6. **`e6fadc9` 之外的 20 笔提交，验收方没有逐笔审阅提交信息的文字表述**，只机械核验了其代码效果。若某笔提交信息里写了与事实不符的话，本报告不保证发现（`e6fadc9` 的提交信息因属重点对象而被逐句核对，并发现了 §7.3 的「25」）。
7. **性能未验。** 本批是纯搬运，理论上不影响运行时；验收方**未跑**任何性能基线做前后对比。冻结派生快照合约（7 tests）为绿，仅说明该合约未被破坏。

---

## 10　未核验事项清单（如实列出，不用别的数字顶替，不作推断）

1. **小C 的「hook 调用点 25」——未复核，无法复现。** 验收方自跑值为 23（§7.3）。
2. **`08C-2` §1.4 表中 37 行 `body` / `blocks` 数字——未逐个复核。** 验收方用自己的口径重做了等价且更强的检验（§2），两套数字不可互引（§7.4）。
3. **`08C`（第一轮）与 `08D`（第一轮验收）中的全部数字——未复核。** 本次验收范围为 `main..e6fadc9` 的 21 笔。
4. **`08A` 修订 A／B／C 的历史结论——未复核。** 本次仅以修订 D 为准执行验收。
5. **`it.skip` / `it.only` 分布是否与 `main` 一致——未核验**（见 §9.5）。
6. **20 笔非 `e6fadc9` 提交的提交信息文字表述——未逐笔审阅**（见 §9.6）。
7. **性能基线前后对比——未跑**（见 §9.7）。
8. **`main` 侧的 `npm run build` / `lint` / `typecheck`——未跑。** 验收方只在 `e6fadc9` 侧跑了闸门；未验证这些闸门在 `main` 上是否同样为绿（若 `main` 本就为红，则「闸门绿」的信息量更大而非更小，故不影响 PASS 判定）。
9. **10A 批次提到的 hook 清单错误——未复核，不在本批范围。**

---

## 11　交回

本报告写完**未做任何 git commit**，交回产品负责人裁决。

按硬规矩，合并到 `main` 由小C 在 PASS 之后代做；**推送到远端只有产品负责人本人做**。
