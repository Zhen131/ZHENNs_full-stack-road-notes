# 07D_W15-main｜多语言机制独立验收报告

- 日期：2026-09-01
- 验收对象：`07C_W15-main-多语言机制执行报告.md`
- 源码仓库：`01一些进度/产出/LocalFirstTradingLedger/`
- 待验分支：`zhennn/w15-main-i18n-mechanism@0a3f5e0`
- 对照基线：`main@755b4bd`（已核对，两者均与合同一致）
- 验收者：独立验收（非执行者）；**未修改任何源码或测试**

---

## 结论

# 有条件通过

**本批最危险的那件事——「改排序导致算错钱」——已被证明没有发生**，而且不只是「快照绿了」，是**在数学上证明了这三处派生路径的比较对象取值域内新旧写法排序完全一致**（见二、2.2）。四道禁令、断言完整性、数字格式边界、防折断要求全部实测成立。我自己跑的七道闸门数字与 `07C` 逐项吻合。

判为「有条件通过」而非 PASS，是因为三项**如实性瑕疵**——它们都不导致算错钱，也都不构成合同禁令的违反，但它们使 `07C` 的部分表述强于证据本身。逐条列在第七节，附我的建议处置。**没有一项我认为足以阻塞合入。**

| | |
| --- | --- |
| 我实跑并复算的 | 冻结派生快照、全量、typecheck、lint、build、结构守卫、两项 whitespace、断言计数全仓普查、`localeCompare` 全仓重新枚举 |
| 我自己动手做的通电检查 | **7 次**（合同要求抽查 2 次），每次破坏后 `git checkout` 还原并核对 SHA-256 一致 |
| 我额外做的等价性证明 | 对 `localeCompare` 与 `<`/`>` 在四类真实取值域上做穷举/全集差分比对 |
| 我**未**核验的 | 性能对照（未重跑浏览器量尺）、开工基线的**测试条数**、匈牙利语译文语言质量 |

---

## 一、A 组：我自己实跑的闸门

**全部为我本人在 `0a3f5e0` 上执行，未抄 `07C`。**

| # | 项目 | 我的实测结果 | `07C` 所述 | 一致 |
| --- | --- | --- | --- | :---: |
| 1 | **04 批冻结派生等价性快照** | **1 file／7 tests PASS**（exit 0，1.62s） | 7/7 | ✅ |
| 2 | 默认全量 `npm test` | **106 files／1185 tests PASS**（32.41s） | 106／1185 | ✅ |
| 3 | `npm run typecheck` | PASS（`tsc --noEmit` 无输出） | PASS | ✅ |
| 4 | `npm run lint` | PASS（`eslint . --max-warnings=0` 无输出） | PASS，0 warning／0 error | ✅ |
| 5 | `npm run build` | PASS（5/5 静态页生成，退出 0） | PASS | ✅ |
| 6 | 结构守卫 `sourceLayout.test.ts` | **1 file／7 tests PASS** | 「2 files／8 tests」 | ✅ 见下 |
| 7 | `git diff --check` | 无输出（clean） | PASS | ✅ |
| 8 | `git diff main...HEAD --check` | 无输出（clean） | PASS | ✅ |

**第 6 项的数字差异已查清，不是问题。** 我按合同只跑了 `sourceLayout.test.ts`，得 1 file／7 tests；`07C` 的「2 files／8 tests」是把 `interfaceWording.test.ts` 一并计入。我复跑两文件合并口径，得 **2 files／8 tests PASS**，与 `07C` 完全一致。两个数字各自正确，只是口径不同。

命令 1 的原始输出：

```text
 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  1.62s
```

命令 2 的原始输出：

```text
 Test Files  106 passed (106)
      Tests  1185 passed (1185)
   Duration  32.41s
```

**验收状态：A 组全部通过，无一项与 `07C` 矛盾。**

---

## 二、B 组：排序改动逐处复核

### 2.1 我自己重新枚举（不采信 `07C` 的清单）

检索命令（我执行的）：

```bash
grep -rn "localeCompare" src/ benchmarks/                    # HEAD
git grep -n "localeCompare" main -- src benchmarks           # 基线
grep -rn "localeCompare" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
```

**`main@755b4bd` 原始输出共 19 行**，我的分档：

| 分类 | 条数 | 明细 |
| --- | ---: | --- |
| 已显式指定 `"en"`（不在范围） | 3 | `cashReplay.ts:120`、`activityService.ts:93`、`backupImportPreflight.ts:947` |
| 测试代码（不在范围） | 1 | `sourceLayout.test.ts:397` |
| **产品代码未指定语言 → 本步范围** | **15** | 见 2.2 表 |

**`0a3f5e0` 收尾输出只剩 4 行**：3 处产品代码显式 `"en"` + 1 处测试代码。**产品代码中未指定语言的 `localeCompare` 为 0。**

我另做了全仓库（排除 `node_modules`／`.next`／`.git`）检索，确认 `src/` 之外**没有任何** `localeCompare` 遗漏点。

**逐一比对 `git show 5fadf30` 的改动位置，实际改动恰为 15 处，不多不少**：`TransactionsWorkspace`1、`cashReplay`1、`ledgerDate`1、`activityService`1、`backupDuplicateGrouping`1、`backupImportPreflight`1、`chartDataService`3、`binanceMappingService`2、`HoldingsOverview`1、`ledgerProjection`1、`pnlSummaryService`1、`TradeForm`1。

**`07C` 的 15 处口径经我独立复算属实。** 与 `07A` 背景记录 14 处的差异（新增 `pnlSummaryService.ts`）我确认为基线前进所致，`07A` 记录的行号亦已普遍漂移（如 `chartDataService` 由 196/445/618 变为 196/570/743）——**符合修订 A 的 A-01～A-03，执行者以实测为准且未凑数，处理正确。**

### 2.2 等价性判断：我没有只看「都是 ASCII」这句话

`07C` 的等价性论证是一句断言：「比较对象均为 ISO 日期、资产代号、路径、relation 或技术 id 等纯 ASCII」。**这句话我不接受作为证据**，理由是：(a) 它没有给出取值域的强制来源；(b) `localeCompare` 与 `<` 的差异并不由「是否 ASCII」决定，而由**大小写与变音符号**决定——纯 ASCII 的 `"a"` 与 `"A"` 两者结果就相反。

因此我先在源码中找出每处比较对象的**取值域强制来源**，再对该取值域做穷举差分。

**先给出反例，证明我的差分测试不是空转**（Node 实测）：

```text
"a" vs "A": localeCompare=-1  relational=+1   ← 相反
"A" vs "a": localeCompare=+1  relational=-1   ← 相反
"é" vs "z": localeCompare=-1  relational=+1   ← 相反
```

即两种比较器**确实不等价**，能否替换完全取决于取值域。

| # | 位置 | 比较对象 | 取值域的强制来源 | 差分结论 |
| --- | --- | --- | --- | --- |
| 1 | **`core/calculations/cashReplay.ts:102`** | `getLedgerDateKey()` 输出 | `ledgerDate.ts:6` 正则 `/^\d{4}-\d{2}-\d{2}/`，不匹配即 **throw**；返回 `match[0]`，**恒为 10 字符** | ✅ **证明等价** |
| 2 | **`core/shared/ledgerDate.ts:83`** | 同上 | 同上 | ✅ **证明等价** |
| 3 | **`features/activity/activityService.ts:81`** | 同上 | 同上 | ✅ **证明等价** |
| 4 | `chartDataService.ts:743` | 同上（`.map(getLedgerDateKey)`） | 同上 | ✅ 证明等价 |
| 5-11 | `chartDataService.ts:196/570`、`HoldingsOverview.tsx:22`、`TransactionsWorkspace.tsx:544`、`binanceMappingService.ts:95/106`、`ledgerProjection.ts:444`、`pnlSummaryService.ts:219` | 资产代号 | `core/validation/ledgerDataValidator.ts:168` `ASSET_SYMBOL_PATTERN = /^[A-Z0-9]{1,32}$/`；`assetService.ts:74` 先 `trim().toUpperCase()` 再校验 | ✅ **证明等价** |
| 12 | `backupDuplicateGrouping.ts:291` | `relation` | 字面量联合类型，**全域仅 2 值** | ✅ 全域实测等价 |
| 13 | `backupImportPreflight.ts:948` | `code` | 类型为 `string`；实际字面量 59 个 | ⚠️ **当前等价，存在潜在隐患**，见 2.3 |
| 14 | **`TradeForm.tsx:351`** | `rule.platform` | **无字符集约束**（`readPersistedString`，用户自由输入） | ❌ **不等价**，见 2.3 |

**三处派生路径（1／2／3）的证明过程**——这是本批唯一能动到钱的地方，我做到底：

`getLedgerDateKey()` 的返回值受 `/^\d{4}-\d{2}-\d{2}/` 强制，**只可能是 10 个字符、只含数字与固定位置的连字符**。我对该取值域做穷举差分（Node）：

```text
ISO date keys（600 个，穷举 360,000 个有序对）: IDENTICAL ORDER
ISO date keys（3,840 个，全集排序数组比对）  : identical = true
```

**另有一层结构性保障**：这三处的改法均写在 `if (leftDate !== rightDate)` 之内——

```js
if (leftDate !== rightDate) {
  return leftDate < rightDate ? -1 : 1;    // 相等分支已被 if 排除
}
```

即两路三元不必表达「相等」，**不存在把 0 误报为 1 的风险**。我逐处读了三个文件的上下文，三处的守卫写法一致，均正确。

**资产代号取值域的穷举差分**：

```text
[A-Z0-9] 长度1        : 36 串,      1,296 有序对 → IDENTICAL ORDER
[A-Z0-9] 长度1-2      : 1,332 串, 1,774,224 有序对 → IDENTICAL ORDER
[A-Z0-9] 长度1-3      : 47,988 串, 全集排序数组 identical = true
```

**结论：`cashReplay` / `ledgerDate` / `activityService` 三处派生路径，以及全部资产代号排序，新旧写法在其取值域内排序结果完全一致——这不依赖快照，是取值域上的穷举证明。** 冻结快照 7/7 是独立的第二重印证。

### 2.3 我发现的两处不等价（快照是绿的，仍如实写出）

合同要求：「若你发现某处改法在某类输入上可能不等价，如实写出来，即使快照是绿的。」以下两条即为此。

#### 发现 1（实际不等价）：`TradeForm.tsx:351` 的 `platform` 不是纯 ASCII

`platformSuggestions` 排序的是 `ledgerData.feeRules[].platform.trim()`。我追到校验层：该字段经 `readPersistedString`（`ledgerDataValidator.ts:1186`）读取，**没有任何字符集或大小写约束**——与资产代号有 `/^[A-Z0-9]{1,32}$/` 强制完全不同。用户可以输入 `Binance`、`binance`、`币安`、`Étoile`。

实测该取值域上的排序差异：

```text
["Binance","binance","OKX","okx","Bybit"]
  localeCompare（改前）: ["binance","Binance","Bybit","okx","OKX"]
  relational  （改后）: ["Binance","Bybit","OKX","binance","okx"]   ← 顺序变了

["Étoile","Zurich","apple"]
  localeCompare（改前）: ["apple","Étoile","Zurich"]
  relational  （改后）: ["Zurich","apple","Étoile"]                 ← 顺序变了
```

（附注：中文平台名如 `["币安","OKX","欧易","Binance"]` 实测**未**变序；变序的是**大小写混用**与**变音符号**两类。）

| 项 | 判断 |
| --- | --- |
| 影响 | `TradeForm` 平台名输入建议列表的**显示顺序** |
| 是否影响金额 | **否。** 纯展示用的建议列表，不参与任何派生计算，不写入账本 |
| 是否违反合同 | **否。** `07A` 1.2 已把此处列为「一并修／只影响显示顺序」档 |
| 是否被快照覆盖 | 否（快照不覆盖此路径） |
| 问题所在 | **`07C` R-1 称 15 处比较对象「均为……纯 ASCII」，对该处不成立** |

**我的判断：改动本身可以接受**（用户很可能本就期望 `binance` 与 `Binance` 分开排，且这是显示顺序）；**需要修正的是 `07C` 的表述**，不应把一处自由文本字段写成「纯 ASCII」。

#### 发现 2（当前等价，潜在隐患）：`backupImportPreflight.ts:948` 的 `code` 类型为 `string`

我枚举了全仓库 59 个 `code:` 字面量（全部 `[A-Z_]` 大写蛇形），对**真实全集**做差分：

```text
真实 59 个错误码全集: SAME ORDER → 该处改动在今天是无操作（no-op）
```

**但该字段的类型声明是 `code: string`（`backupImportPreflight.ts:47`），不是字面量联合类型。** 下划线在两种比较器中的位置相反（ICU 视其为标点，排在字母前；码点序中 `_`=0x5F 排在大写字母后），因此将来若新增出现**前缀重叠**的错误码即会变序：

```text
["BACKUP","BACKUP_BAD_JSON","BACKUPS_TOTAL"]
  localeCompare: ["BACKUP","BACKUP_BAD_JSON","BACKUPS_TOTAL"]
  relational   : ["BACKUP","BACKUPS_TOTAL","BACKUP_BAD_JSON"]   ← 顺序不同
```

**当前无害**（真实码集无此形态，且 `code` 只在 `stage` 与 `path` 均相等时才作为末级 tiebreaker，`path` 那一路仍显式 `"en"` 未改）。**登记为潜在隐患**，非本批缺陷。

---

## 三、C 组：数字格式——只准改那两类

### 3.1 实际 diff 是否越界

我逐行读了全部被改测试文件的 diff。**结论：没有越界。**

| 检查项 | 我的实测结果 |
| --- | --- |
| 断言的**结构**被改动？ | **否。** 全部改动都在字符串字面量内部 |
| **matcher** 被改动？ | **否。** `toBe`／`toEqual`／`toContain`／`toHaveLength` 一字未动 |
| **被断言对象**被改动？ | **否。** `getByTitle(...)`／`cells[n]?.textContent`／`isWithinTolerance(...)` 全部原样 |
| 有断言被**删除**？ | **否。** 见 3.2 全仓普查 |
| **阈值**被改动？ | **否。** `"0.0000000001"` 原样 |
| 超出两类授权的改动？ | **否。** 期望值千分位 20 处 + 辅助器分隔符 1 处，无第三类 |

实际改动恰为 **20 处期望值** + **1 处辅助器**，与修订 A.4 的实测背景与 `07C` 的对照表**逐条吻合**（`formatLedgerNumber.test.ts` 6、`LedgerNumber.test.tsx` 2、`HoldingsOverview.test.tsx` 11、`DashboardShell.interaction.test.tsx` 1 = 20）。

辅助器改动我核对了原文，唯一差异是 `.replaceAll(",", "")` → `.replaceAll(" ", "")`，其后一行 `expect(isWithinTolerance(actual, expected, "0.0000000001")).toBe(true);` **完全未动**——与修订 B.0 的授权边界一致。

### 3.2 `expect(` 计数：我做了全仓普查，不止 `07C` 列的四个文件

`07C` 只给了 4 个文件的计数。我改为**遍历 `main` 上全部 104 个测试文件**，逐个比对 `main` 与 `HEAD` 的 `expect(` 数量：

```text
（脚本输出）(scan complete)   ← 无任何 "DECREASED" 行
```

**全仓库没有任何一个测试文件的 `expect(` 数量减少。** 被改动文件的计数：

| 文件 | main | HEAD | `07C` 所述 | 一致 |
| --- | ---: | ---: | ---: | :---: |
| `formatLedgerNumber.test.ts` | 10 | 10 | 10 | ✅ |
| `LedgerNumber.test.tsx` | 8 | 12 | 12 | ✅ |
| `HoldingsOverview.test.tsx` | 83 | 83 | 83 | ✅ |
| `DashboardShell.interaction.test.tsx` | 252 | 252 | 252 | ✅ |
| `DashboardShell.golden.test.tsx` | 33 | 33 | （未列） | — |

我另做了测试文件普查：`main` 104 个 `.test.ts(x)`，`HEAD` 106 个，**差集为空——没有任何测试文件被删除**（新增 `i18nMechanism.test.tsx`、`i18n.test.tsx`）。这与 `07C` R-9 的 104→106 完全吻合。

（`DashboardShell.golden.test.tsx` 未出现在 `07C` 的计数表中，虽然它正是修订 B 的授权对象。我已代为核实其计数 33→33 未变。属报告完整性的小瑕疵，非缺陷。）

### 3.3 舍入行为未变——我验证证明，不复述证明

`07C` 声称「输入值、精度和舍入算法未变，只有分组分隔符由 `,` 改为普通空格」。我去看了**格式化器本身的 diff**：

```diff
-  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
+  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
```

**`src/ui/formatLedgerNumber.ts` 全文件仅此一行变动，且只改了 replacement 字符串中的一个字符。** 该行位于 `insertThousandsSeparators()` 内，作用是在已经成串的整数部分插入分隔符——**舍入与精度发生在此之前，代码路径完全未被触碰**。这是比「跑了测试所以没变」更强的证据。

旁证：舍入规格断言本身**因不含千分位而根本未被改动**，且仍在通过：

```js
expect(formatMoney("1.005")).toBe("1.01");     // 未改
expect(formatMoney("-1.005")).toBe("-1.01");   // 未改
```

同理 `"594.86"`／`"0.0003"`／`"0.50"`／`"0.00"`／`"0.6134"`／`"0.000000134"`／`"0.03619818"`／`"300"`／`"0"` 等边界期望值全部原样保留。**舍入行为未变，成立。**

---

## 四、D 组：三条绝对禁令

| 禁令 | 我的核验方式 | 结果 |
| --- | --- | --- |
| **B-01** 未引入 i18n 第三方库 | `git diff main...HEAD -- package.json package-lock.json` | **输出为空——零改动** ✅ |
| **B-02** 只新增一个 React Context | `grep -rn "createContext" src/` | 仅 2 行命中，且同属一个文件：`i18n.tsx:4`（import）与 `i18n.tsx:198`（唯一一次 `createContext`）✅ |
| **B-06** 语言偏好不进账本文件 | T-A8 实跑 + 我的通电检查 + 结构性证据 | ✅ 成立，但**证据强度与 `07C` 表述不符**，见下 |

### B-06 的深查

**T-A8 我自己跑了，也自己破坏了。** 破坏方式：让 `writeLanguagePreference` 额外写入第二个存储键。

```text
--- 破坏后 ---
 Test Files  1 failed (1)
      Tests  1 failed | 7 skipped (8)
--- 还原后 SHA-256 ---
8f6e5a44458fd30cf2cf5d10c9990b72cf646186399126d26075a20930d86ebe  src/ui/i18n.tsx   ← 与破坏前一致
```

**但我要如实指出 T-A8 的证据结构**：该测试有两个断言，承重的只有一个。

- `expect(after).toEqual(before)`（`.lftl` 字节相等）——**这一半接近空转**。该断言比较的是**同一个仓库内固定 fixture 文件在切换语言前后的两次读取**；而测试 harness 里根本不存在任何写文件的代码路径，因此**它在任何实现下都不可能变红**。我的破坏之所以能让 T-A8 变红，靠的是另一个断言。
- `expect(window.localStorage.length).toBe(1)`——**这才是真正承重的断言**，它证明语言写入只落在一个专用界面键上，没有波及其他存储。

**B-06 本身我确认成立**，但依据主要来自结构性事实而非 T-A8 的标题断言：

| 结构性证据（我实测） | 结果 |
| --- | --- |
| `git diff main...HEAD --stat -- src/platform` | **完全为空——platform 层零改动** |
| `src/core` 的全部改动 | **仅 2 行**，都是日期比较，无任何 language 字段 |
| `git diff main...HEAD -- src/core src/platform \| grep -i "language\|locale\|lang"` | **零命中** |
| `grep -rn "language" src/platform/` | **零命中——平台层完全不知道语言的存在** |
| 语言存储键的引用范围 | 仅 `src/ui`／`src/app`／`src/test-support`，未外溢 |

**结论：B-06 成立，且成立得比 T-A8 所能证明的更牢固。** 建议将 `07C` R-4 中「T-A8 ⋯⋯断言前后字节完全相等」作为主证据的表述，改为以「`length===1` + core/platform 零改动」为主证据。

---

## 五、E 组：测试语言的钉死与复位

### 5.1 复位机制我读了实现

`src/test-support/vitest.setup.ts` 新增：`beforeEach` 把语言键写为 `zh-CN`（钉死）；`afterEach` 先 `cleanup()` 再 `removeItem` 该键（复位）；jsdom 无可用 `localStorage` 时安装内存 Storage。设计合理。

### 5.2 我做了针对性的顺序与隔离检查

合同建议「把切换语言的那几条测试单独跑、再全量跑，确认结果一致」。我做了四种跑法：

| 跑法 | 结果 |
| --- | --- |
| 全量 `npm test` | 106 files／1185 tests PASS |
| 两个语言测试文件单独跑 | 2 files／**10 tests PASS** |
| 同样两个文件**反转文件顺序** | 2 files／**10 tests PASS** |
| 只跑 T-A2（切换语言）／只跑 T-A3（刷新保持） | 各 1 passed｜7 skipped |

**四种跑法结果一致，未观察到任何语言状态泄漏或随机失败。**

### 5.3 发现 3：复位机制的两半互为冗余，`07C` 的「不泄漏证明」不能区分二者

`07C` R-15 举 `i18n.test.tsx` 的两条测试为「用例间不泄漏」的证明用例（第一条切到 `en` 并持久化，第二条断言重新以 `zh-CN` 启动）。**合同要求我「验证它真的有效」，所以我对复位机制本身做了单点破坏。结果值得记录：**

| 破坏内容 | 证明用例结果 |
| --- | --- |
| 只禁用 `afterEach` 的复位（`removeItem`） | **2 passed —— 仍然绿** |
| 只禁用 `beforeEach` 的钉死（`setItem`） | **2 passed —— 仍然绿** |
| **两半同时禁用** | **1 failed｜1 passed —— 变红** |

（还原后 SHA-256 `450b0a7b44be71a7affb388ddf070de5d7ab7308e62e0d41d84278a800a00f04`，与破坏前一致。）

**解读——这一条正是合同提醒我警惕的 06 批教训（「单点破坏不再充分，因为有第二条路径兜住」）：**

- **保护本身是真实的，而且是双重冗余的**（任一半独立即可保证不泄漏）。从工程角度这是**优点**，不是缺陷。
- **但 `07C` R-15 把该用例呈现为复位机制的证明，而它并不能区分两半中哪一半在起作用**——对任一半做通电检查都会得到「绿」，从而误判为「破坏无效」或「测试没用」。
- 这**不影响本批任何功能与数据正确性**，属证据表述精度问题。

---

## 六、F 组：其余核验

| 项 | 我的核验方式与结果 | 判定 |
| --- | --- | :---: |
| **四个版本号不变** | 不信报告，直接看 diff：`git diff main...HEAD --stat -- src/platform` **完全为空**；四个版本常量全部位于 `src/platform/files/`／`src/platform/legacy/`，**文件零改动 ⇒ 数值必然未变**。另读 HEAD 实际值：`fileFormatVersion=3`、`cryptoVersion=1`、`ledgerSchemaVersion=4`、`backupFormatVersion=3`，与 `07C` R-11 一致 | ✅ |
| **`core`／`platform` 未引用 `@/ui`** | `grep -rn "@/ui" src/core/ src/platform/` → **零命中** | ✅ |
| **`core`／`platform` 未新增用户可见文案** | `core` 全部改动仅 2 行日期比较；`platform` 零改动 | ✅ |
| **示范范围确实只有首页** | `HomeWorkspace.tsx` 为纯「字面量 → `t()`」替换，中文取值逐字未变，无逻辑改动；`SettingsWorkspace.tsx` 仅新增语言开关卡片（其既有 `aria-label="设置分类"` 等仍为硬编码中文，**正确地未被搬运**）；`page.tsx` 仅包一层 `LanguageProvider` | ✅ |
| **未处理 `core` 已有中文（09 批）** | `core` diff 仅 2 行，未触碰任何中文字符串 | ✅ |
| **未改 `src/app/` 目录结构、未拆文件** | `git diff --name-status --diff-filter=ADR` 仅 3 个 `A`（新增），**无 R（重命名）、无 D（删除）** | ✅ |
| **`interfaceWording` 扫描范围已扩大** | diff 显示 `INTERFACE_ROOTS` 新增 `join(SRC_ROOT, "ui")` | ✅ |
| **⇧ 且仍然有效** | **我做了通电检查**：在 `src/ui/i18n.tsx` 的文案表中植入已废弃叫法 `总花费` → 守卫报 `AssertionError: expected [ 'ui/i18n.tsx: 总花费' ] to deeply equal []`，**1 failed**。还原后 SHA 一致 | ✅ **实证有效** |
| **`.ledger-numeric` 加了 `white-space: nowrap`** | `globals.css` diff 恰为 1 行新增，规则现为 `tabular-nums` + `tnum` + `nowrap` | ✅ |
| **数据里仍为普通空格 U+0020（codepoint 证明）** | 我不采用 `grep -P`（先验证了本机支持，但仍改用更权威方式），**用 Node 逐字符扫描 `src/` 全部 `.ts`／`.tsx`／`.css`**，检查 U+00A0／U+202F／U+2009／U+2007：**全部零命中**。测试内断言 `separatorCodePoints` 为 `[0x20, 0x20]` | ✅ |

---

## 七、G 组：通电检查抽查（合同要求 2 条，我做了 7 条）

**全部在 HEAD `0a3f5e0` 上进行**（遵合同对 06 批教训的提醒）。**每次破坏后一律 `git checkout -- <file>` 还原，并核对 SHA-256 与破坏前完全相同。**

| # | 破坏内容 | 目标 | 破坏后 | 还原后 SHA-256 一致 |
| --- | --- | --- | --- | :---: |
| 1 | 删除 `.ledger-numeric` 的 `white-space: nowrap` | **B-14** | **1 failed｜5 passed** | ✅ `022123a9…` |
| 2 | 千分位分隔符 U+0020 → **U+00A0** | **B-15** | **2 files failed，9 failed｜17 passed** | ✅ `b07016db…` |
| 3 | 语言写入额外泄漏到第二个存储键 | **T-A8** | **1 failed｜7 skipped** | ✅ `8f6e5a44…` |
| 4 | 禁用 `afterEach` 复位 | A-05/A-06 | 2 passed（**未变红**，见 5.3） | ✅ `450b0a7b…` |
| 5 | 禁用 `beforeEach` 钉死 | A-05/A-06 | 2 passed（**未变红**，见 5.3） | ✅ `450b0a7b…` |
| 6 | 同时禁用两半 | A-05/A-06 | **1 failed｜1 passed** | ✅ `450b0a7b…` |
| 7 | 在 `src/ui` 文案表植入废弃叫法 `总花费` | `interfaceWording` 扩范围 | **1 failed** | ✅ `8f6e5a44…` |

**合同指定优先抽查的两条（T-A8 与 B-14）均确认变红，还原后 SHA-256 一致。**

第 2 条尤其值得记录：**修订 B 的 B-15（不得改用非断行空格绕过）不是一句纸面要求，它被测试真实守住了**——把分隔符换成 U+00A0 会立刻打红 9 条断言。

第 4／5 条未变红，我**没有就此下「通电检查造假」的结论**，而是按合同要求「先追查是不是有第二条路径兜住了」，进而做了第 6 条，查明是两半互为冗余（见 5.3）。

---

## 八、H 组：性能

**未核验。**

`07C` R-10 给出了 `main@755b4bd` 与 `0a3f5e0` 的对照（M-1 冷启动 298.479 ms → 298.199 ms，-0.09%；M-5 页面切换最差 73.465 ms → 74.286 ms，+1.12%），并声明两者均在噪声带内。

合同明示「你不需要重跑浏览器量尺；若没跑，如实写『未核验』」。**我没有重跑浏览器量尺，因此 `07C` R-10 的两个数字我不背书，也不复述为已验证结论。** 本批不设性能通过线，此项不影响我的结论。

---

## 九、我发现的问题清单

**没有一项导致算错钱，没有一项违反合同禁令。三项都是「表述强于证据」，一项是实现瑕疵。**

| # | 问题 | 严重度 | 建议处置 |
| --- | --- | --- | --- |
| **1** | `07C` R-1 称 15 处比较对象「均为……纯 ASCII」，但 `TradeForm.tsx:351` 的 `platform` 是**无字符集约束的用户自由文本**；大小写混用或带变音符号时排序**确实与改前不同**（实测见 2.3）。影响仅限平台名建议列表的显示顺序 | 低 | 修正 `07C` 表述；改动本身建议保留 |
| **2** | `07C` R-4 把 T-A8 的 `.lftl` 字节相等断言作为 B-06 主证据，但**该断言在任何实现下都不会变红**（harness 内无写文件路径）；真正承重的是 `localStorage.length===1` | 低 | 修正表述；B-06 结论不变（结构性证据更强） |
| **3** | `07C` R-15 的「不泄漏证明用例」**无法区分复位机制的两半**——单独禁用任一半测试仍绿（实测见 5.3）。保护真实且冗余，但该用例不足以证明复位机制生效 | 低 | 修正表述；机制建议保留（冗余是优点） |
| **4** | `HomeWorkspace.tsx:223,296` 把全角冒号 `：` 与顿号 `、`（`join("、")`）**硬编码在 `t()` 之外**。英文／匈牙利语下会渲染成 `Update assets without prices：BTC、ETH`，中日韩标点混进西文排版 | 低（外观） | 建议 09 批一并处理；本批 U-3「首页文案全部经 `t()`」严格讲有此小缺口 |
| 5 | `backupImportPreflight.ts:948` 的 `code` 类型为 `string` 而非字面量联合；今日 59 个真实码集排序无变化，但下划线与字母的相对次序在两种比较器中相反，将来新增前缀重叠的码会变序 | 提示 | 登记为潜在隐患，非本批缺陷 |
| 6 | `07C` R-7 的 `expect(` 计数表未列 `DashboardShell.golden.test.tsx`（修订 B 的授权对象本身）。我已代为核实 33→33 未变 | 提示 | 报告完整性小瑕疵 |
| 7 | `07C` R-6 译文表列了 26 条 `home.*`，未列 6 条 `settings.language.*` 与 1 条 `shared.i18n.fallbackExample`（中文表共 33 键；英／匈各 32 键，仅缺回退示例键，属刻意设计）。设置页文案在 R-13 另有披露 | 提示 | 报告完整性小瑕疵 |

---

## 十、我未核验的事项（不推断、不用别的数字顶替）

| 事项 | 状态 |
| --- | --- |
| 性能对照（冷启动 M-1、页面切换 M-5） | **未核验。** 我未重跑浏览器量尺，`07C` 的两个数字我不背书 |
| 开工基线 `main@755b4bd` 的**测试条数 1174** | **未核验。** 我未 checkout `main` 跑全量（会弄脏工作树）。我改以**静态方式**核验了更关键的事实：测试文件 104→106、**无任何测试文件被删除**、**无任何文件的 `expect(` 计数减少** |
| 匈牙利语／英语译文的**语言质量** | **未核验。** 我不具备匈牙利语母语判断力。`07C` U-4 已诚实声明「未取得匈牙利语母语者独立审校」，我认可该边界 |
| `07C` R-8 中 T-A1～T-A7 的通电检查过程 | **部分核验。** 我实跑了八条测试全绿，并对 T-A8 及 B-14／B-15／守卫／复位机制做了自己的破坏还原；**T-A1～T-A7 的破坏过程我未逐条复现** |
| `07C` R-10 提到的沙箱 `EPERM` 与临时服务启动经过 | **未核验。** 属执行环境叙述，我无从复算 |

---

## 十一、收尾状态

| 项 | 状态 |
| --- | --- |
| 源码仓库工作树 | **clean**（`git status --short` 无输出） |
| 源码仓库分支／HEAD | `zhennn/w15-main-i18n-mechanism` @ **`0a3f5e0`**（未移动） |
| 通电检查残留 | **无。** 7 次破坏全部还原，逐一核对 SHA-256 与破坏前一致 |
| 我是否修改过源码或测试 | **否。** 仅做临时破坏并立即还原；未为使测试通过而改动任何代码 |
| merge／push／rebase／破坏性 git 命令 | **均未执行** |
| `~/Downloads/history_OKX/`、真实 `.lftl`、真实 B 文件 | **均未读取。** T-A8 使用的是仓库内 `test-fixtures/golden/` 虚构 fixture |
| 根文档仓库 | **clean**，HEAD `89e0609`。**未发现任何与本批无关的用户改动**（无笔记、课程资料或 Obsidian 配置的未提交变更），故无需列出 |
| 两仓库提交 | **分别检查、分别提交。** 本报告 `07D` 只提交至根文档仓库；源码仓库不产生任何提交 |

---

## 十二、结论与依据

# 有条件通过

**通过的依据：**

1. **本批唯一能造成真实损失的风险已被排除，且是双重排除的。** `cashReplay`／`ledgerDate`／`activityService` 三处派生路径比较的是 `getLedgerDateKey()` 输出，受正则 `/^\d{4}-\d{2}-\d{2}/` 强制为定长纯数字串；我在该取值域上做了穷举差分（360,000 有序对 + 3,840 元素全集排序），**新旧写法排序完全一致**；三处改法又都写在 `!==` 守卫之内，不存在相等分支误判。04 批冻结派生等价性快照**由我亲自运行**，7/7 PASS。
2. **A 组八项闸门全部由我实跑，数字与 `07C` 逐项吻合**（106 files／1185 tests、typecheck、lint、build、结构守卫、两项 whitespace 均通过），唯一的数字差异（结构守卫 7 vs 8）已查明为口径不同，两者各自正确。
3. **排序范围我独立重新枚举**：`main` 上 15 处产品代码未指定语言，`HEAD` 上 0 处，实际改动恰为 15 处，不多不少；`src/` 之外无遗漏。
4. **断言完整性经全仓普查**：全部 104 个既有测试文件中，**没有任何一个的 `expect(` 计数减少，没有任何测试文件被删除**；被改动处恰为 20 处期望值 + 1 处授权辅助器，无结构、matcher、被断言对象、阈值的改动。
5. **舍入未变有代码级证据**：格式化器全文件仅一行、一个字符的变动，且位于分组插入函数内，舍入与精度路径未被触碰；舍入规格断言原样保留并通过。
6. **三条绝对禁令成立**：`package.json`／lockfile 零改动；全仓仅一次 `createContext`；语言偏好只落 `localStorage` 专用键，`platform` 层零改动且零 language 引用。
7. **通电检查我做了 7 次**（合同要求 2 次），T-A8 与 B-14 均确认变红，`interfaceWording` 扩范围后确认仍能拦住废弃叫法，B-15 确认被真实守住；全部还原并核对 SHA-256 一致。

**「有条件」的依据（第九节 1～4 项）：**

四项瑕疵均**不影响数据正确性、不违反合同禁令、不阻塞合入**，但使 `07C` 的部分表述强于其证据：`platform` 一处排序**实际不等价**而被表述为「纯 ASCII」；T-A8 的字节断言与复位机制的证明用例**均无法在单点破坏下变红**，却被作为主证据呈现；首页全角标点漏出 `t()`。

**建议处置：** 请执行者修订 `07C` 的上述三处表述（不需改代码），并将首页标点问题与 `code` 类型隐患登记给 09 批。**修订完成后，我认为本批可以合入 `main`。**

---

本报告为独立验收产出，不授权合入，合入与否由产品负责人裁决。
