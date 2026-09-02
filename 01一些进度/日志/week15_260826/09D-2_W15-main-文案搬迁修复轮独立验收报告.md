# 09D-2　W15-main 文案搬迁修复轮独立验收报告

- 验收对象：`c830e79`（分支 `zhennn/w15-main-app-split`）
- 上一轮验收对象：`8fd0b6e`
- 缝（08／09 分界，全部比对基准）：`ffbe0ff`
- `origin/main`：`8df62d8b4b2bead68bf2209765ce39379e23288d`（本报告自行 `git rev-parse origin/main` 确认，与 09D 记载一致）
- 验收日期：2026-09-02
- 验收方：独立验收会话（不代表 Codex，也不代表小C）

---

## 1　结论

# FAIL

**理由（一条即足以判 FAIL，此处成立的是第 1 条停止条件）：**

在全仓 AST 复核中查出**第五处中文被静默改写**，位置在 `src/features/prices/PriceForm.tsx` 第 89 行，根因与已修的四处**完全相同**——一个文案表 key 被复用到中文原文并不相同的两个调用点。

| | 内容 |
|---|---|
| key | `prices.field.asset` |
| 缝 `ffbe0ff` 上第一个调用点 | `PriceForm.tsx:53`　`fieldLabels.assetSymbol = "资产"` |
| 缝 `ffbe0ff` 上第二个调用点 | `PriceForm.tsx:362`　JSX 标签文字 `价格资产` |
| `c830e79` 两个调用点 | 均渲染 `t("prices.field.asset")` = **`价格资产`** |
| 被改掉的那一句 | **`资产` → `价格资产`** |

**用户能在屏幕上看到的差异**：价格表单资产字段输入非法时，错误提示由

- 缝：`资产不能为空或格式不正确`
- 现在：`价格资产不能为空或格式不正确`

该字符串**零测试覆盖**（全仓搜索 `不能为空或格式不正确` 仅命中文案表定义，无任何断言），与 `backup.pairing.priceNotWritten` 的情形一致。

**同时须记录的第二项事实**：这一处**已经被写进了新守卫的 117 条允许清单**，第 157–158 行，注释写的是

```text
  // Price form areas use the same Asset field label.
  "prices.field.asset",
```

这句注释与缝上的事实**不符**——两个调用点在缝上并非同一句中文。这直接回答了指令中「Codex 是逐条核对过，还是照着现状抄了一份名单再编理由」的问题，见 §5.3。

**须同时说明的三点，避免这份 FAIL 被误读：**

1. **本轮交付的 5 笔提交本身是干净的、合格的。** 四处修复逐字复原（§4），F-2 无违反（§4.2），守卫通电有效（§5.1／5.2），全部闸门绿（§3）。**在 `8fd0b6e → c830e79` 这个区间内，我没有查出任何新的中文改写**（§6.2，`only-in-prev = 0`）。
2. **第五处不是这一轮引入的。** 它是 09 早前某一轮引入、被 `09D` 漏掉的存量缺陷。但 Q-21 要求的是 `ffbe0ff → c830e79` 的**完整声明**，而它在被验收的 HEAD 上确实存在，所以本批不能判 PASS。
3. **本报告不修复它。** 按硬规矩，我没有改动任何源码。

---

## 2　范围确认（三项跳过的前提）

```bash
git diff --name-only 8fd0b6e..c830e79
```

```text
src/features/backup/BackupControls.tsx
src/features/fees/FeeRuleManager.tsx
src/test-support/translationKeyUsage.test.ts
src/ui/i18n.tsx
```

```bash
git diff --stat 8fd0b6e..c830e79
```

```text
 src/features/backup/BackupControls.tsx       |   4 +-
 src/features/fees/FeeRuleManager.tsx         |   4 +-
 src/test-support/translationKeyUsage.test.ts | 315 +++++++++++++++++++++++++++
 src/ui/i18n.tsx                              |   6 +-
 4 files changed, 323 insertions(+), 6 deletions(-)
```

```bash
git log --oneline 8fd0b6e..c830e79
```

```text
c830e79 test: guard translation key reuse
62eca8d fix: restore fixed amount wording
8e35f26 fix: restore decimal rate wording
fce7513 fix: restore import error visibility wording
b45ec1e fix: restore ledger price failure wording
```

**范围与预期相符**（4 个文件，其中 1 个为本轮新增的守卫文件）。因此指令中的三项跳过前提成立，见 §8。

---

## 3　闸门重跑（全部为本会话实跑，原始输出）

命令逐字照抄自指令 Q-19。`build` 先跑，`typecheck` 在 `build` 之后串行。

### 3.1　`npm test`

```text
> local-first-trading-ledger@0.1.0 test
> vitest run

 RUN  v4.1.9 /Users/zhuzhen0131/.../LocalFirstTradingLedger

(node:53572) Warning: `--localstorage-file` was provided without a valid path
(Use `node --trace-warnings ...` to show where the warning was created)
   ...（同类 localstorage 警告若干，逐文件 PASS 清单从略；无任何 FAIL 行）...

 Test Files  107 passed (107)
      Tests  1186 passed (1186)
   Start at  14:10:31
   Duration  36.14s (transform 5.31s, setup 12.19s, import 13.74s, tests 110.77s, environment 20.75s)

EXIT=0
```

对照 09D 在 `8fd0b6e` 上的 106 files／1185 tests：**+1 file／+1 test**，恰为本轮新增守卫，属预期。

### 3.2　冻结派生快照

```bash
npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts
```

```text
 RUN  v4.1.9 /Users/zhuzhen0131/.../LocalFirstTradingLedger

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  14:11:07
   Duration  1.66s (transform 68ms, setup 0ms, import 87ms, tests 1.50s, environment 0ms)

EXIT=0
```

与 09D 参考值 1 file／7 tests 一致。

### 3.3　`npm run build`

```text
> local-first-trading-ledger@0.1.0 build
> next build

   ▲ Next.js 15.5.22

   Creating an optimized production build ...
 ✓ Compiled successfully in 3.5s
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

EXIT=0
```

产物 `377 kB／479 kB`。09D 在 `8fd0b6e` 上记 `376 kB／479 kB`，首列 **+1 kB**，与新增 4 条文案表条目量级相符。

### 3.4　`npm run typecheck`

```text
> local-first-trading-ledger@0.1.0 typecheck
> tsc --noEmit

EXIT=0
```

### 3.5　`npm run lint`

```text
> local-first-trading-ledger@0.1.0 lint
> eslint . --max-warnings=0

EXIT=0
```

### 3.6　结构守卫

```bash
npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts
```

```text
 RUN  v4.1.9 /Users/zhuzhen0131/.../LocalFirstTradingLedger

 Test Files  2 passed (2)
      Tests  8 passed (8)
   Start at  14:11:09
   Duration  977ms (transform 132ms, setup 187ms, import 133ms, tests 703ms, environment 0ms)

EXIT=0
```

与 09D 参考值 2 files／8 tests 一致。

### 3.7　两项 whitespace

```bash
git diff --check
```

```text
（无输出）exit=0
```

```bash
git diff origin/main...c830e79 --check
```

```text
（无输出）exit=0
```

**闸门小结：八项全绿，无一变红。**

---

## 4　Q-17　四处修复的三者对照

缝上原文全部由 `git show ffbe0ff:<路径>` 自行取出，未引用任何报告。

「修复后渲染」由本会话自建的 AST 脚本得出：解析 `c830e79` 的源码，把每个 `t("key")` 调用替换回该版本 `chineseMessages` 里的值。

### 4.1　逐处对照

#### 处 1　`src/features/backup/BackupControls.tsx`（缝第 611 行 → 现第 614 行）

| 阶段 | 内容 |
|---|---|
| 缝 `ffbe0ff:611` 原文 | `message: "账本或 mapping 状态已变化，价格未写入",` |
| 修复前 `8fd0b6e` 渲染 | `mapping 或全局 ID 状态已变化，价格未写入`　← **被 581 行那句覆盖** |
| 修复后 `c830e79` 渲染 | `账本或 mapping 状态已变化，价格未写入` |

新建专用 key `backup.pairing.priceNotWrittenByLedger`。**第三者与第一者逐字相同。** ✅

#### 处 2　`src/features/backup/BackupControls.tsx`（缝第 1404 行 → 现第 1407 行）

| 阶段 | 内容 |
|---|---|
| 缝 `ffbe0ff:1404` 原文 | `发现 {result.hardErrorCount} 项导入错误，页面显示前{" "}` |
| 修复前 `8fd0b6e` 渲染 | `项导入错误，显示前`　← 被第 1193 行那句（`发现 … 项导入错误，显示前`）覆盖 |
| 修复后 `c830e79` 渲染 | `项导入错误，页面显示前` |

新建专用 key `backup.errors.hardErrorVisiblePrefix`。**逐字相同。** ✅

#### 处 3　`src/features/fees/FeeRuleManager.tsx`（缝第 297 行 → 现第 299 行）

| 阶段 | 内容 |
|---|---|
| 缝 `ffbe0ff:297` 原文 | `{form.type === "fixed" ? "金额（USDT）" : "小数费率"}` |
| 修复前 `8fd0b6e` 渲染 | `费率`　← 被第 353／355 行的 `fees.field.rate` 覆盖 |
| 修复后 `c830e79` 渲染 | `小数费率` |

新建专用 key `fees.field.decimalRate`。**逐字相同。** ✅

#### 处 4　`src/features/fees/FeeRuleManager.tsx`（缝第 337 行 → 现第 337 行）

| 阶段 | 内容 |
|---|---|
| 缝 `ffbe0ff:337` 原文 | `固定 <LedgerNumber kind="money" value={rule.amount} /> USDT` |
| 修复前 `8fd0b6e` 渲染 | `固定费`　← 被第 294 行的 `fees.type.fixed` 覆盖 |
| 修复后 `c830e79` 渲染 | `固定` |

新建专用 key `fees.history.fixedAmountLabel`。**逐字相同。** ✅

### 4.2　F-2　不得改动任何现有 key 的值

用 TypeScript 编译器解析两侧 `src/ui/i18n.tsx`，抽出三张表的 key→value 全映射后逐条比对（脚本自建；注意 `chineseMessages` 是 `as const`，需先剥掉 `AsExpression` 才能拿到对象字面量——这一步若漏掉会**静默地什么都比不出来**，本会话第一版脚本即踩了这个坑，已修正并加了「三张表缺一即抛错」的自检）。

结果：

```text
existing-key value changes: 0 | removed keys: 0
total added: 4
ADDED chineseMessages fees.field.decimalRate                = "小数费率"
ADDED chineseMessages fees.history.fixedAmountLabel         = "固定"
ADDED chineseMessages backup.pairing.priceNotWrittenByLedger = "账本或 mapping 状态已变化，价格未写入"
ADDED chineseMessages backup.errors.hardErrorVisiblePrefix  = "项导入错误，页面显示前"
```

**F-2 无违反**：零个现有 key 的值被改动，零个 key 被删除，新增恰为 4 个专用 key。✅

补充证据——四处的调用点数量变化（由 AST 调用点扫描得出，含 `t` 与 `translateDefault` 两种形式，排除 `*.test.*`）：

| key | `8fd0b6e` 调用点 | `c830e79` 调用点 | 值 |
|---|---|---|---|
| `backup.pairing.priceNotWritten` | 584, 614 | **584** | 未变 |
| `backup.pairing.priceNotWrittenByLedger` | — | **614** | 新增 |
| `backup.errors.showingPrefix` | 1194, 1407 | **1194** | 未变 |
| `backup.errors.hardErrorVisiblePrefix` | — | **1407** | 新增 |
| `fees.field.rate` | 299, 353, 355 | **353, 355** | 未变 |
| `fees.field.decimalRate` | — | **299** | 新增 |
| `fees.type.fixed` | 294, 337 | **294** | 未变 |
| `fees.history.fixedAmountLabel` | — | **337** | 新增 |

这正是「新建专用 key、原 key 留在原位不动」的正确形态。

### 4.3　en／hu 未同步新增 4 个 key —— 判定为符合既有设计，非缺陷

`englishMessages` 与 `hungarianMessages` 的类型是 `Partial<Record<TranslationKey, string>>`，两侧均只有 **32 条**，缺失 key 由 `translate()` 回退到 `chineseMessages`。这是缝之前就有的设计，本轮新增 4 个中文 key 而不加 en／hu 条目与既有 1,214 条中的绝大多数一致。**不作为缺陷记录。**

---

## 5　Q-18　新守卫的通电检查

新增文件：`src/test-support/translationKeyUsage.test.ts`，315 行。

### 5.1　守卫的实际逻辑（本会话读源码得出，非引用）

扫描 `src/` 全树（**包含 `*.test.*`**）的 `.ts`／`.tsx`，用 TS AST 收集**标识符形式** `t("字面量")` 的调用点，然后断言两件事：

1. `unapprovedKeys`：调用点 ≥2 的 key 必须在 `APPROVED_SHARED_TRANSLATION_KEYS` 中，否则失败。
2. `staleApprovals`：允许清单里调用点 <2 的 key 也必须为空，否则失败。

第 2 条是有价值的设计：它使允许清单**不能夹带**已经不再复用的 key。

允许清单条数：`117`（AST 抽取，唯一 117，无重复）。

### 5.2　通电检查（临时 git worktree，主工作目录零改动）

全部在 `scratchpad/wt`（`git worktree add --detach` 到 `c830e79`，`node_modules` 用符号链接借用）中进行。

**探针 C（基线，未改动）** — 期望绿：

```text
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

**探针 A（制造未批准的 key 复用）** — 把 `FeeRuleManager.tsx:353` 的 `t("fees.field.rate")` 改成 `t("fees.field.decimalRate")`，使单调用点的 `decimalRate` 变成两个调用点。期望红：

```text
- Expected
+ Received

- []
+ [
+   [
+     "fees.field.decimalRate",
+     [
+       "features/fees/FeeRuleManager.tsx:299",
+       "features/fees/FeeRuleManager.tsx:353",
+     ],
+   ],
+ ]

 ❯ src/test-support/translationKeyUsage.test.ts:263:7
 Test Files  1 failed (1)
      Tests  1 failed (1)
```

**变红，且报错直接点名 key 与两个调用点。** ✅

**探针 B（使一个已批准的 key 掉到 1 个调用点）** — 把 `ActivityTable.tsx:256`／`:427` 的 `t("activity.table.amount")` 改成两个各不相同的探针 key。期望红：

```text
- []
+ [
+   "activity.table.amount",
+ ]

 ❯ src/test-support/translationKeyUsage.test.ts:264:70
 Test Files  1 failed (1)
      Tests  1 failed (1)
```

**变红。** ✅

**探针 D2（绕过形式）** — 向 `FeeRuleManager.tsx` 末尾追加三种调用形式，各自复用 `fees.field.decimalRate`：

```ts
const __probeA = translateDefault("fees.field.decimalRate");
const __probeB = i18n.t("fees.field.decimalRate");
const __k = "fees.field.decimalRate";
const __probeC = t(__k);
```

结果：

```text
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

**三种形式全部绕过守卫**，见 §5.4。

> 说明一处我自己的失误，以免读者被中间过程误导：我最初的探针 D 是把 `:353` 的 `t("fees.field.rate")` 原地改成 `translateDefault(...)`，它变红了，但变红的原因是 `fees.field.rate` 因此掉到 1 个调用点触发了 `staleApprovals`，与 `translateDefault` 是否被扫描无关。该探针被判为无效，重做为上面的 D2。

**还原与核对**：每个探针做完立即还原，`git -C wt status --porcelain` 为空。worktree 已 `git worktree remove --force` + `git worktree prune` 删除，`git worktree list` 只剩主工作目录。

主工作目录四个文件的 SHA-256，通电检查前后**完全一致**：

```text
7a43b0fbe120b2bfacbbf52cea0cd089966d695f803b219b5d8afc1154342ecd  src/test-support/translationKeyUsage.test.ts
7d3745634afb52bcc75186ab702267746a8393fbef3aceffaa1876913e1a7cda  src/features/fees/FeeRuleManager.tsx
f23370a1b9129f94d9a36e4154c4568a21d27db15949b2acce1032749903688c  src/features/backup/BackupControls.tsx
7d18db02b7fa800e3caf8db5bad78eb2f36046c19489b429a41128b94abd626b  src/ui/i18n.tsx
```

`git status --porcelain` 为空，`HEAD` 仍为 `c830e791077e36d9479e2e4589ec36d0a5298520`。

**Q-18 通电结论：守卫在其声明的作用域内确实会变红，不是哑的。** 停止条件第 3 条不成立。

### 5.3　117 条允许清单：是逐条核对，还是抄了现状？

**判定：照着现状抄的名单，逐条理由是事后补写的合理化说明，不是核对结果。**

依据三条，第一条是决定性的：

**依据一（决定性，反例）**：`prices.field.asset` 在清单第 158 行，注释写「Price form areas use the same Asset field label.」。但缝上这两个调用点**并非同一句中文**——一处是 `"资产"`，一处是 `价格资产`。**只要逐条核对过，这一条就必然被发现**；它没有被发现，说明核对没有发生。这同时就是 §1 的 FAIL 事由。

**依据二（结构性）**：守卫自带 `staleApprovals` 断言，要求清单与当前复用集合**精确相等**。这意味着清单在构造上**只能**由「扫描当前代码、把所有 ≥2 调用点的 key 抄下来」得到——多一条会被 `staleApprovals` 判红，少一条会被 `unapprovedKeys` 判红。清单的**成分**因此天然等于现状，与是否核对过语义无关。

**依据三（我自己的独立核对结果）**：我对 117 条逐条做了机械核对——取每条 key 的值，在缝的全部中文字面量里统计其汉字投影出现次数，与该 key 在 `c830e79` 的调用点数比较。117 条中：

- 8 条值不含汉字，跳过；
- 106 条缝上出现次数 ≥ 调用点数，通过；
- **3 条不足**，逐条落实为：
  - `marketData.failure.validationUnavailable` —— **合格**。缝上两个调用点（`BackupControls.tsx:1275`、`MarketDataControls.tsx:1168`）引用的是同一个共享常量 `BINANCE_VALIDATION_UNAVAILABLE_USER_MESSAGE`（定义在 `binanceMappingService.ts:33`），本来就是同一句，只是以标识符而非字面量出现，所以字面量计数只有 1。
  - `settings.language.label` —— **合格**。缝上它**已经是** key（缝的 `chineseMessages` 有 33 条，含此条），两个调用点 `SettingsWorkspace.tsx:192`（标签）与 `:194`（aria-label）在缝上就已共用。
  - `prices.field.asset` —— **不合格，即 §1 的缺陷**。

另外记录一条正面结果：117 条中**没有一条**的「复用」是「生产代码 1 处 + 测试文件 1 处」凑出来的（我的扫描排除 `*.test.*`，117 条全部有 ≥2 个生产调用点）。守卫本身扫描测试文件，本来存在这种凑数的可能，但实际没有发生。

### 5.4　守卫的可绕过漏洞（如实列出，未修）

由探针 D2 实测确认，以下三种形式**完全不被扫描**：

1. **`translateDefault("key")`** —— 这是最严重的一条，因为**它不是理论漏洞，而是当前代码里大量使用的真实调用形式**。`src/app/usePersistentLedger.ts` 有 11 处，`src/features/cash/cashEventService.ts` 有 8 处以上，服务层与持久化层普遍使用。守卫对这整类调用点视而不见。
2. **成员调用 `obj.t("key")`** —— 守卫要求 `node.expression` 是 `Identifier`，属性访问形式不匹配。
3. **变量 key `t(someVar)`** —— 守卫要求首参是字面量。

量化影响：按**标识符 `t`** 计，复用 key 有 117 个（即清单全量）；按**全部调用形式**（`t` + `translateDefault`，仅生产文件）计，复用 key 有 **127** 个。差额 10 个 key 的复用完全在守卫视野之外。

**这不构成本次 FAIL 的独立事由**（守卫在其声明作用域内确实通电），但它意味着：**守卫只挡住了缺陷的一部分来源**。四处已修缺陷中的第 1 处（`BackupControls` 的 `message:` 字段）恰恰是服务层风格的字符串，与 `translateDefault` 的使用场景高度重合。

---

## 6　Q-21　全量 AST 复核

### 6.1　方法说明（本会话实际使用的四道口径）

全部用**仓库自带的 TypeScript 5.9.3 编译器**逐文件建 AST。目录清单两侧同一份：`src/app`／`src/features`／`src/ui`，排除 `*.test.*`，`src/ui/i18n.tsx` 两侧都包含。抽取节点类型：`StringLiteral`、`NoSubstitutionTemplateLiteral`、`TemplateHead/Middle/Tail`、`JsxText`，取含汉字者。注释不进 AST，自动排除。

- **道 1　中文字面量集合比对**。相对 09D，我把口径从**多重集**改成**集合**。理由：文案搬迁本身就是「N 个调用点的同一句话去重成表里 1 条」，多重集必然产生大量纯计数差（我先跑了多重集版本，得到 145／32 条候选，其中绝大多数是这种计数噪声）。集合口径下候选降到 40／27 条，信噪比高得多。
- **道 2　汉字投影可拼性判定**。对每条只在一侧出现的字符串取汉字投影，用动态规划判断能否由对侧全部字符串的汉字投影拼接而成（允许重复取用）。
- **道 3　`t(key)` 回填后的逐文件渲染流比对**。把每个文件按源码顺序展开成渲染文本流，`t("key")`／`translateDefault("key")` 替换回该侧文案表的中文值，忽略空白。**我把 09D 的「折叠成单个差异窗口」升级成了字符级 LCS 对齐**，逐个差异区段输出，并把每个区段的 head 侧字符**归属回产生它的 key 与行号**。
- **道 4（09D 没有的两道，本会话新增）**：
  - **孤儿键检查**：文案表中定义但无任何调用点的 key。一条中文若在搬迁中丢了渲染点，会表现为孤儿键，而道 1 因为 `i18n.tsx` 两侧都扫描而看不见。
  - **复用 key 的逐调用点缝上原文重建**：利用道 3 的 LCS 对齐，把 head 侧每个复用 key 的每个调用点，反查出缝上对齐到该位置的原文，逐点比对。**这一道是本次抓到第五处缺陷的手段**，也是 09D 声明的盲区所在。

### 6.2　`8fd0b6e → c830e79`（本轮增量，用于定位）

```text
=== 道1 集合比对 ===
literal occurrences: prev=1182  head=1186
only-in-prev: 0 distinct   only-in-head: 4 distinct

=== 道2 ===
[UNSPLICEABLE] ONLY_IN_head x1  "小数费率"
[UNSPLICEABLE] ONLY_IN_head x1  "固定"
[UNSPLICEABLE] ONLY_IN_head x1  "账本或 mapping 状态已变化，价格未写入"
[UNSPLICEABLE] ONLY_IN_head x1  "项导入错误，页面显示前"
UNSPLICEABLE COUNT: 4

=== 道3 ===
FILES WITH RENDER-STREAM DIFF: 3 / 96
  src/features/backup/BackupControls.tsx    （处 1、处 2）
  src/features/fees/FeeRuleManager.tsx      （处 3、处 4）
  src/ui/i18n.tsx                           （新增 4 个 key）

=== 道4 孤儿键 ===
prev orphans: 6   head orphans: 6   identical: true
```

**`only-in-prev = 0` 是本轮最强的一条正面证据**：这一轮**没有让任何一句中文消失或被改掉**，只新增了 4 句——恰好是要复原的 4 句。逐条判定：4 条候选全部为**「新增（复原）」**，无残留。

孤儿键 6 条两侧完全相同（`metadata.description`、`shared.i18n.fallbackExample`、`trades.form.field.timePrecision`／`.platform`／`.feeRule`／`.rawText`），本轮未增未减，非本轮事项。

### 6.3　`ffbe0ff → c830e79`（缝 vs 新 HEAD，完整声明）

**道 1 + 道 2**：

```text
distinct seam=991  distinct head=978
only-in-seam=40  only-in-head=27
only-in-seam UNSPLICEABLE: 1 of 40
only-in-head UNSPLICEABLE: 1 of 27
```

**候选数：67 条**（40 + 27）。逐条判定如下。

**（a）27 条 only-in-head——全部判为「拆分」。** 判据：这 27 条**无一例外全部位于 `src/ui/i18n.tsx`**（即文案表本身），没有一条是新出现在渲染点上的字面量。形态一律是「缝上带标点／分隔符的整串，被拆成表里的裸词 + JSX 里的标点」，例如缝 `"· 替代"` → 表 `"替代"`，缝 `"- 错误码：`"` → 表 `"- 错误码："`，缝 `"输入“"`／`"”以确认"` → 表 `"输入"`／`"以确认"`。

其中唯一的 UNSPLICEABLE 是 `"条"`：缝 `CashEventPanel.tsx:437` 为 `共 {n} 条，第 {p} / {q} 页`，JsxText 切成 `共`／`条，第`／`页`；head 拆成 `共`／`条`／`，`／`第`／`页`。缝上没有独立的 `"条"`，故拼不出。**判定：拆分。**

**（b）40 条 only-in-seam——39 条判为「拆分／合并」，1 条判为「改写（非界面文字）」。**

39 条同为上述拆分的另一侧（`"· 数量"`、`"未来交易："`、`"→ 账本外"`、`"项（"`、`"笔 · 买入"` 等），汉字投影均可由 head 侧拼出。

唯一的 UNSPLICEABLE 是 `"已"`，出现在 `AssetTransferPanel.tsx` 与 `CashEventPanel.tsx`。查证原文：

```ts
// 缝 CashEventPanel.tsx:145
if (!feedback.includes("已")) return;
```

这是**代码逻辑里的子串判断**，不是渲染到屏幕的文字。head 改成了对两条成功文案的精确相等判断：

```ts
// c830e79 CashEventPanel.tsx:151
if (feedback !== certifiedSavedFeedback && feedback !== deletedFeedback) return;
```

**判定：改写，但改的是逻辑而非界面中文。** 且是必要改动——`includes("已")` 这种子串启发式在多语言下必然失效。**不计为中文改写缺陷。**

**（c）道 3（字符级 LCS 对齐，逐文件）**：`src/ui/i18n.tsx` 除外（它是字典不是渲染点，且长度超出 DP 上限），95 个文件中共 **46 个差异区段**。

其中「seam 侧与 head 侧同时非空」的替换型区段：**0 个**。其余 46 段全为纯删除或纯插入，成对出现，属于同文件内的位置移动或跨文件搬迁（例如 `清空本地账本` 从 `DashboardShellHelpers.ts` 移到 `DashboardShell.tsx`；`BINANCE_VALIDATION_UNAVAILABLE_USER_MESSAGE` 从 `binanceMappingService.ts` 移进文案表后在两个调用点展开）。

**（d）道 4 之二——复用 key 逐调用点重建**（本次的关键一道）：

复用 key（≥2 生产调用点，含全部调用形式）：**127** 个，覆盖 **286** 个调用点，逐点重建缝上原文后比对，**10 个调用点不一致**。逐条判定：

| # | 位置 | key | 缝上重建 | head 渲染 | 判定 |
|---|---|---|---|---|---|
| 1 | `AssetTransferPanel.tsx:238` | `assetTransfers.status.ledgerNotWritable` | `…已删除已账本当前不可写` | `账本当前不可写` | **对齐噪声**。多出的前缀是同文件内状态串重排产生的删除段；尾部逐字相同 |
| 2 | `BackupControls.tsx:1276` | `marketData.failure.validationUnavailable` | `""` | 长消息 | **合格**。缝上此处引用共享常量（标识符），流里无字面量 |
| 3 | `BackupControls.tsx:1374` | `backup.report.hardErrors` | `不可得硬错误` | `硬错误` | **对齐噪声**。缝 1371 行确为 `<dt>硬错误</dt>`；前缀来自相邻 `不可得` 的删除段 |
| 4 | `CashEventPanel.tsx:159` | `cash.status.ledgerNotWritable` | `…已删除已账本当前不可写` | `账本当前不可写` | 同 #1，**对齐噪声** |
| 5 | `MarketDataControls.tsx:1180` | `marketData.failure.validationUnavailable` | `网络不可用` | 长消息 | **合格**。缝 1168 行引用同一共享常量，非字面量；`网络不可用` 是相邻项被误对齐 |
| 6 | `HoldingsDetails.tsx:55` | `portfolio.details.unreliable` | `""` | `不可可靠计算` | **对齐噪声**。缝 137／198 行确有 `"不可可靠计算"` |
| 7 | `HoldingsDetails.tsx:79` | `portfolio.details.ariaLabel` | `持仓详情` | `完整持仓详情` | **合格**。缝 46 行原文为 `aria-label="完整持仓详情"`，逐字相同；缺的 `完整` 是被相邻区段吸走 |
| 8 | **`PriceForm.tsx:89`** | **`prices.field.asset`** | **`资产`** | **`价格资产`** | **⛔ 真缺陷** |
| 9 | `PriceForm.tsx:370` | `prices.field.asset` | `…价格已认证保存价格资产` | `价格资产` | **对齐噪声**。缝 362 行确为 `价格资产`；尾部逐字相同 |
| 10 | `TradeForm.tsx:877` | `trades.form.action.saving` | `""` | `正在保存` | **对齐噪声**。缝 418／854 行确有 `"正在保存…"` |

#7、#6、#10 我都回到缝的源码逐行核对过，不是靠推断结案的。

**逐条判定完毕，无未判定残留。候选 67 条（道 1／道 2）+ 46 区段（道 3）+ 10 个调用点（道 4 之二），最终确认缺陷 1 处：`prices.field.asset`。**

---

## 7　Q-20　中文文案表键数

用 TS 编译器解析对象字面量逐属性计数，**天然正确处理「多个 key 写在同一行」**（`i18n.tsx` 里大量存在一行数十个 key 的写法，`awk` 按行计数会严重低估——`09C` 因此把 1,214 数成 660）。

脚本核心（完整脚本见 §10 说明）：

```js
const ts = require('<repo>/node_modules/typescript');
const src = ts.createSourceFile(file, fs.readFileSync(file,'utf8'),
              ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
// 找到 chinese/english/hungarianMessages 的 VariableDeclaration，
// 剥掉 as const（AsExpression）拿到 ObjectLiteralExpression，
// 遍历 properties 逐条计数。三张表缺一即抛错。
```

实测值（`c830e79`）：

| 表 | 条目数 | 唯一 key 数 | 重复 key |
|---|---|---|---|
| `chineseMessages`（中文） | **1218** | 1218 | 无 |
| `englishMessages`（英文） | **32** | 32 | 无 |
| `hungarianMessages`（匈牙利文） | **32** | 32 | 无 |

参照（同一脚本、同一口径）：

| 版本 | 中文 | 英文 | 匈牙利文 |
|---|---|---|---|
| `ffbe0ff`（缝） | 33 | 32 | 32 |
| `8fd0b6e`（上轮） | 1214 | 32 | 32 |
| `c830e79`（本轮） | **1218** | **32** | **32** |

中文 `1214 → 1218`，`+4`，与本轮新增的 4 个专用 key 吻合。英／匈两表为 `Partial`，本就只译了 32 条，见 §4.3。

另：三张表全部条目均为纯字符串字面量，无计算属性、无展开、无非字面量值（脚本会把这类标记出来，实测为零）。

---

## 8　按指令跳过的三项

前提已在 §2 验证成立（改动范围确为那 4 个文件），因此三项跳过有效。以下三项**我没有做，不声称已验**：

| 跳过项 | 指令给出的理由 | 我对前提的验证 |
|---|---|---|
| 用例全名比对 | `09D` 已用三种口径比对且 `diff` 全空；本轮零测试文件改动（新增守卫除外） | ✅ `git diff --name-only 8fd0b6e..c830e79` 命中的测试文件只有新增的 `translationKeyUsage.test.ts`；且 `npm test` 计数 1185→1186 恰为 +1，与「只多了一条守卫用例」一致 |
| 四个版本号复核 | 本轮改动的 4 个文件不含任何版本号定义处 | ✅ 我在 4 个文件里搜过版本号定义。唯一命中是 `BackupControls.tsx:692` 的 `appVersion: packageJson.version`，那是**引用**不是定义，且不在本轮 diff 触及的行（本轮只动了 611、1404 两行） |
| `core`／`platform` 零改动核对 | 同上 | ✅ `git diff --name-only 8fd0b6e..c830e79 \| grep -E "^src/(core\|platform)/"` 无输出 |

---

## 9　本方法的盲区（如实声明它证明不了什么）

1. **静态流不等于运行时渲染次数。** 我的渲染流按源码顺序把每个调用点展开一次。若某个 `t()` 位于被调用 N 次的函数或 `.map()` 中，静态流只记 1 次。这直接影响一处判读：`BackupControls` 在缝上有 13 处 `不可得` 字面量，head 侧 `backup.report.unavailable` 只有 1 个调用点。我把它判为「重构成了统一 fallback」而非「丢了 12 处文案」，**但我没有实际运行页面验证这 13 处的渲染结果**。这是本报告最大的一个未验证判读。
2. **道 4 之二依赖 LCS 对齐，对大幅位置移动敏感。** 10 个 mismatch 里 7 个是对齐噪声，说明信噪比不高；反过来说，**若某处改写恰好被相邻的移动段吸收对齐，我也可能漏掉**。我对 7 条噪声都回到缝源码逐行核对了，但我无法证明不存在第 8 条被完全掩盖的。
3. **`src/ui/i18n.tsx` 未进入道 3／道 4 之二的对齐比对**（长度 13,545 字符，DP 规模超限）。它由道 1（集合，两侧都含）和 §4.2 的 key→value 全映射比对覆盖，但没有做逐文件渲染流对齐。
4. **道 1 的集合口径丢失了出现次数信息。** 一句话若从 3 个调用点减到 1 个，集合比对看不见。这是 `不可得` 一类问题在道 1 里不报的原因。
5. **道 2 的可拼性判定允许片段重复取用**，因此偏宽松：能拼出不等于就是拆分。我对每条 UNSPLICEABLE 都做了源码核对，但对 SPLICEABLE 的 66 条是按**位置全部落在 `i18n.tsx`／形态一致**这一结构性判据整体结案的，没有逐条回源码。
6. **空白差异被道 3 刻意忽略**，全角／半角空格、换行的变化不会被报出。
7. **英文与匈牙利文的实际界面完全未验。** 本报告所有比对都只针对中文。
8. **我没有运行过这个应用。** 全部结论来自静态分析与测试输出。
9. **守卫的漏洞我只证伪了三种形式**（§5.4），没有穷举所有可能的绕过写法。
10. **`09D` 与 `09C` 的任何数字我都没有采信**，但我也**没有复核**它们——本报告中出现的 09D 参考值（106／1185、376 kB 等）仅作为「对照异常」的参照物出现，标注为 09D 记载，**未复核**。

---

## 10　边界确认

- ❌ **没有 `git push`**。全程未执行任何推送。
- ❌ **没有合并到 `main`**。`HEAD` 仍为 `c830e79`，分支仍为 `zhennn/w15-main-app-split`。
- ✅ **没有修改任何源码或测试**。通电检查全部在 scratchpad 的临时 worktree 中完成，已删除；主工作目录四个文件 SHA-256 前后一致（§5.2），`git status --porcelain` 为空。
- ❌ **没有读取** `/Users/zhuzhen0131/Downloads/history_OKX/`，没有打开任何真实 `.lftl` 或备份文件。
- ✅ **两个仓库未混提交**。本报告写在文档仓库；源码仓库工作区干净、无新提交。
- ❌ **没有改写任何已有报告**。`09D`、`09C` 一字未动，本报告为新建文件。
- ✅ **本报告未自行 git commit**，交回产品负责人裁决。
- 分析脚本存放于本次会话 scratchpad（`msgtable.js`／`astscan.js`／`astscan2.js`／`compare.js`／`align.js`／`persite.js`），**不在任何仓库内**，会话结束即失效。若需复现，需要重新生成。

---

## 11　未核验事项清单

如实列出，不用别的数字顶替，不作推断：

1. **`BackupControls` 那 13 处 `不可得` 的运行时渲染结果未验**（见 §9.1）。这是我判读中确定性最低的一项。
2. **英文、匈牙利文界面未验**。
3. **应用未实际运行**，无任何截图或交互证据。
4. **`09D` 与 `09C` 报告中的数字未复核**，仅作参照引用并已标注。
5. **`origin/main` 与本分支之间的其它差异未审**。我只跑了 `git diff origin/main...c830e79 --check`（whitespace），没有审阅这两点之间的全部内容差异。
6. **本轮 5 笔提交的提交信息与提交粒度未做合规审查**（是否符合英文 commit 约定等），指令未要求。
7. **`translationKeyUsage.test.ts` 315 行中，我只详读了允许清单与断言／扫描逻辑**（第 1–20 行、第 245–315 行）；清单中段 117 条 key 的注释文字我做的是机械核对（§5.3 依据三），**没有逐条阅读英文注释是否措辞得当**。
8. **孤儿键 6 条为何存在、是否应当清理，未追查**。仅确认本轮未增未减。
9. **守卫扫描 `*.test.*` 这一行为是否为有意设计，未追问**。我只确认了它当前不会造成 117 条清单的凑数（§5.3 末）。
10. **性能相关指标未测**。本轮不涉及，指令亦未要求。

---

## 12　给产品负责人的处置建议（供裁决参考，非验收结论）

判 FAIL 的是**存量的第五处**，不是这一轮交付的 5 笔提交。两者可以分开处置：

- 本轮 5 笔提交（`b45ec1e`..`c830e79`）**质量合格**，四处修复正确、F-2 未违反、守卫通电有效、闸门全绿、未引入任何新的中文改写。
- 需要补的是**第六笔**：为 `PriceForm.tsx:89` 新建专用 key（例如 `prices.field.assetSymbolLabel = "资产"`），并把 `prices.field.asset` 从 117 条允许清单中移除（移除后它只剩 1 个调用点，`staleApprovals` 会强制要求移除，所以这一步是守卫自动保证的）。
- 另建议单独立项处理 §5.4 的 `translateDefault` 覆盖缺口——**这不是本批的收口条件**，但只要它还在，同类缺陷仍可能从服务层再次进来。

在这一处修复并重新验收通过之前，**不建议合并到 `main`**。

---

*本报告由独立验收会话撰写。报告中的每一个数字，除已明确标注为「09D 记载／未复核」者外，均由本会话自行跑出。*
