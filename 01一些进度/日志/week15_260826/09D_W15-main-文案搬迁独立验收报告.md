# 09D_W15-main｜文案搬迁独立验收报告

- 日期：2026-09-02
- 验收人：独立验收者（非执行者）
- 轨道：长期账本产品 `main`，分支 `zhennn/w15-main-app-split`
- 验收范围：缝 `ffbe0ff470132efcab2d3651dd446837426d4b33` 之后至 `8fd0b6ebdccd0f7f83bf32b61b080dfafdc1fed8`，共 **57 笔提交**（实测复核，与 `09C` 一致）
- 缝之前的 4 笔属 08 批，本报告未读、未评价
- 本报告不授权合入。合入由产品负责人裁决

---

## 一、结论

### **FAIL**

**理由一句话：本批唯一的承诺是「只换文案的来源，不换文案本身」，而实测查出 4 处屏幕上的中文被改了，1185 条测试全绿、三轮执行报告全部未发现。**

四处均由同一个根因造成：**把中文原文并不相同的多个位置，映射到了同一个文案表 key**。合同赖以自证的证据链（「中文断言全绿 ⇒ 搬运是纯的」，`09A` Q-2）对这种复用**天生盲**——幸存的那条文案仍然正确，测试在另一处调用点上仍然全绿，被改掉的那一处无人看见。我用通电检查 3 直接证实了这一点（见第五节）。

除此之外：**闸门全部实跑通过，四个版本号未变，`core`／`platform` 零改动，测试文件零改动，用例名逐字不变。** 本批的工程纪律整体是好的；失败点集中在「一 key 多用」这一个手法上，修复面很小（4 处、2 个文件）。

**建议处置：不合入。** 补 4 笔修正提交（每处新建一个专用 key，把中文改回缝上的原文），并按第六节的建议补一条能防住「一 key 多用」的机器化检查，再走一次收口验收。

---

## 二、我自己实跑的（原始输出）

全部在 `8fd0b6e` 上执行。闸门在主工作目录执行（只读）；通电检查在 scratchpad 的临时 worktree 中执行，主工作目录零改动（第七节确认）。

### 2.1 默认全量 `npm test`

```text
 Test Files  106 passed (106)
      Tests  1185 passed (1185)
   Start at  12:04:24
   Duration  33.45s
```

### 2.2 冻结派生等价性快照（命令照抄合同原文）

```text
npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  1.70s
```

**7/7，H-2 不成立。**

### 2.3 `npm run build`（先跑）

```text
Route (app)                                 Size  First Load JS
┌ ○ /                                     376 kB         479 kB
└ ○ /_not-found                            993 B         103 kB
+ First Load JS shared by all             102 kB
✓ Generating static pages (5/5)
```

### 2.4 `npm run typecheck`（build 之后串行）

```text
> local-first-trading-ledger@0.1.0 typecheck
> tsc --noEmit
```

（无输出，exit 0）

### 2.5 `npm run lint`

```text
> local-first-trading-ledger@0.1.0 lint
> eslint . --max-warnings=0
```

（无输出，exit 0）

### 2.6 结构守卫两文件

```text
npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts

 Test Files  2 passed (2)
      Tests  8 passed (8)
```

### 2.7 两项 whitespace 检查

```text
$ git diff --check
exit=0            （无输出）

$ git diff origin/main...8fd0b6e --check
exit=0            （无输出）

$ git rev-parse origin/main
8df62d8b4b2bead68bf2209765ce39379e23288d
```

### 2.8 四个版本号复核（指向权威定义处，缝与 HEAD 逐处对照）

```text
--- ffbe0ff ---
src/platform/files/ledgerFileContract.ts:15:  fileFormatVersion: 2,
src/platform/files/ledgerFileContract.ts:16:  cryptoVersion: 1,
src/platform/files/ledgerFileContract.ts:31:export const SUPPORTED_LEDGER_SCHEMA_VERSION = 4 as const;
src/features/backup/backupEnvelope.ts:20:export const BACKUP_FORMAT_VERSION = 3 as const;
src/platform/files/ledgerFileChunkedContainerV3.ts:24-27:
  fileFormatVersion: 3, cryptoVersion: 1, ledgerSchemaVersion: 4, backupFormatVersion: 3

--- 8fd0b6e ---
src/platform/files/ledgerFileContract.ts:15:  fileFormatVersion: 2,
src/platform/files/ledgerFileContract.ts:16:  cryptoVersion: 1,
src/platform/files/ledgerFileContract.ts:31:export const SUPPORTED_LEDGER_SCHEMA_VERSION = 4 as const;
src/features/backup/backupEnvelope.ts:21:export const BACKUP_FORMAT_VERSION = 3 as const;
src/platform/files/ledgerFileChunkedContainerV3.ts:24-27:
  fileFormatVersion: 3, cryptoVersion: 1, ledgerSchemaVersion: 4, backupFormatVersion: 3
```

四个版本号数值全部不变（`backupEnvelope.ts` 的行号 20→21 只因新增一行 import）。`ledgerFileContract.ts` 与 `ledgerFileChunkedContainerV3.ts` 在本批**未被改动**。**H-1 不成立。**

### 2.9 `core` 与 `platform` 是否引用 `@/ui`

```text
$ grep -rn '@/ui' src/core src/platform
(empty)
```

且本批 `core`／`platform` **零改动**：

```text
$ git diff --stat ffbe0ff..8fd0b6e -- src/core src/platform
(empty)
```

**`09A` 修订 B「只列不改」已确认落实。**

### 2.10 文案表三语键数（我自己的口径，见第四节口径说明）

```text
--- 缝 ffbe0ff ---
  chinese: 按行=33    逐键=33    去重=33
  english: 按行=32    逐键=32    去重=32
  hungarian: 按行=32  逐键=32    去重=32
--- HEAD 8fd0b6e ---
  chinese: 按行=660   逐键=1214  去重=1214
  english: 按行=32    逐键=32    去重=32
  hungarian: 按行=32  逐键=32    去重=32
```

**中文表实测 1214 键，不是 `09C` 所报的 660。** 详见第六节问题 5。中文表**无重复键**（逐键=去重）。

### 2.11 用例全名比对（重点四，同一命令、同一去重方式，两侧重新导出）

我**没有采信** `09C` 的这一条，两侧都由我自己重新导出。

```text
# 缝侧：在 ffbe0ff 的临时 worktree 中
npx vitest list --json=<seam>.json
# HEAD 侧：在 8fd0b6e 主工作目录
npx vitest list --json=<head>.json

jq -r '.[].name' <seam>.json | sort   > seam-names.sorted
jq -r '.[].name' <head>.json | sort   > head-names.sorted
jq -r '.[].name' <seam>.json | sort -u > seam-names.uniq
jq -r '.[].name' <head>.json | sort -u > head-names.uniq
```

**口径 A：不去重（`sort`）**

```text
    1185 seam-names.sorted
    1185 head-names.sorted
$ diff -u seam-names.sorted head-names.sorted
diff_exit=0        （输出为空）
```

**口径 B：去重（`sort -u`）**

```text
    1168 seam-names.uniq
    1168 head-names.uniq
$ diff -u seam-names.uniq head-names.uniq
diff_exit=0        （输出为空）
```

**口径 C：文件路径 + 用例全名（最强）**

```text
    1185 seam-full.txt
    1185 head-full.txt
$ diff -u seam-full.txt head-full.txt
diff_exit=0        （输出为空）
```

**结论：Q-1／Q-16 通过，且比 `09C` 更强——不去重口径下两侧同为 1185、`diff` 为空。** `09C` 第二轮记载的「1185 变 1168」确实只是去重口径差异，此点 `09C` 无误。

### 2.12 Q-13 标点收尾普查（我自己的检索）

```text
$ grep -rn '[：、，。？！；]' src/app src/features src/ui --include='*.ts' --include='*.tsx' \
    | grep -v '\.test\.' | grep -v 'src/ui/i18n.tsx'

src/app/layout.tsx:6:  description: "只由你选择的加密文件承载的本地优先交易账本。",
src/app/usePersistentLedger.ts:179: * 统一管理启动读取、hydration 门禁和 ready 后的串行自动保存。
src/features/trades/tradeRemovalService.ts:25: * 删除交易前重放候选账本的完整交易时间线，包括被界面隔离的未来事实。
src/features/trades/tradeRemovalService.ts:27: * reducer 只负责不可变更新；会影响后续卖出时间线的业务判断放在 service。
src/ui/ConfirmDeleteButton.tsx:25: * 普通删除的共享两段确认控件。
src/ui/ConfirmDeleteButton.tsx:27: * 第一次激活只改变局部 armed 状态；第二次完整激活才调用业务回调。
---- 条数 ----  6
```

与 `09C` 第三轮 Q-13 **逐行一致**：5 行注释 + 1 行服务端 metadata。此条 `09C` 无误。

### 2.13 `package.json` 与 lockfile

```text
$ git diff --name-only ffbe0ff..8fd0b6e -- package.json package-lock.json
(empty)
```

### 2.14 本批是否改过任何测试文件

```text
$ git diff --name-only ffbe0ff..8fd0b6e | grep -E '\.test\.|test-support|test-fixtures|benchmarks'
(empty)
```

**零测试文件改动**，因此 N-1（不改断言／阈值／用例名）在文件层面即已成立，无需依赖计数。

### 2.15 中文断言处数（同一条命令跑两侧）

```text
$ for tgt in ffbe0ff 8fd0b6e; do git grep -h 'expect(.*[一-鿿]' $tgt -- '*.test.ts' '*.test.tsx' | wc -l; done
ffbe0ff  含汉字的 expect( 行数: 357
8fd0b6e  含汉字的 expect( 行数: 357

$ for tgt in ffbe0ff 8fd0b6e; do git grep -h '[一-鿿]' $tgt -- '*.test.ts' '*.test.tsx' | wc -l; done
ffbe0ff  含汉字的测试行总数: 1404
8fd0b6e  含汉字的测试行总数: 1404
```

两侧完全相同（必然如此，因为零测试文件改动）。`09C` 报的「349 → 352」是**两条不同命令**的产物，见第六节问题 6。

### 2.16 产物大小（缝 vs HEAD，我自己各跑一次 build）

```text
--- 缝 ffbe0ff ---
┌ ○ /                                     365 kB         467 kB
└ ○ /_not-found                            990 B         103 kB

--- HEAD 8fd0b6e ---
┌ ○ /                                     376 kB         479 kB
└ ○ /_not-found                            993 B         103 kB
```

净增 `+11 kB` / `First Load JS +12 kB`，与新增 1181 条中文文案相称，无异常膨胀。（`09C` 第一节把缝上记作 364 kB，我实测 365 kB。）

---

## 三、重点一：57 笔提交逐笔审查——非搬运改动清单

我对全部 57 笔跑了 `git show --numstat`，并对所有不符合「两类改动」模式的提交逐笔读了完整 diff。

**先说三条全局事实（由 `git diff --name-only ffbe0ff..8fd0b6e` 直接得出）**：本批共改动 **40 个文件**（39 个产品文件 + `src/ui/i18n.tsx`），其中**没有一个测试文件、没有一个 `core`／`platform` 文件、没有 `package.json`／lockfile、没有结构守卫**。57 笔中**无 merge 提交**。

### 出现「第三类改动」的提交，逐笔列出与判断

| # | 提交 | 第三类改动 | 判断 |
| --- | --- | --- | --- |
| 19 | `6855e5f fix: preserve price form translation dependency` | 只在 `PriceForm.tsx` 的依赖数组里加了一个 `t`（`+1 −0`） | **可接受**。这是对 `efefa50` 的必要补丁：文案改由 `t()` 取得后，闭包必须随语言变化重算，否则切换语言时该块不刷新。属搬运的必然后果，不是夹带 |
| 47+48 | `6197ae5 refactor: localize metadata description` ＋ `b6738a8 fix: preserve server metadata boundary` | 47 把 `layout.tsx` 的 metadata 改为 `translateDefault()` 并新增 key；48 把 `layout.tsx` **改回**硬编码中文，但**没有一并撤销 key** | **留下孤儿 key**。见第六节问题 4 |
| 31 | `98f5ba4 refactor: localize market validation feedback` | 从 `binanceMappingService.ts` **删除**了导出常量 `BINANCE_VALIDATION_UNAVAILABLE_USER_MESSAGE`；`normalizePairingFailure()` 增加 `t` 形参；新增 `type Translate` 别名 | **可接受**。中文逐字进入文案表（我已逐字比对），删除的是不再被引用的导出常量；typecheck／lint 全绿证明无残留引用 |
| 44/45/46 | `c03bdb7`／`dcd80eb`／`0307c51`（backup report 三笔） | **只改源码、`i18n.tsx` 零改动** | **轻微偏离 D-2**。这三笔用的 key 由更早的 `1f1c0c8` 提前塞进了文案表。中文无损（我已逐条比对拼接结果），但「同一笔提交里换字面量＋新增条目」的自洽性被打破，单读这三笔的 diff 无法确认新文案是什么 |
| 多笔 | 10 处「以中文字符串做判定」被改写 | 见下表 | **必要且逐处等价，但确属逻辑改动**，`09C` 完全未列 |

### 「以中文字符串做判定」的 10 处改写（`09C` 未列）

缝上以中文做判定的位置（我的检索口径：`includes(` / `===` / `!==` / `startsWith(` / `endsWith(` 后紧跟含汉字的字面量）：

```text
缝 ffbe0ff：
  src/app/TransactionsWorkspace.tsx:405,663,665
  src/features/prices/PriceForm.tsx:240,347
  src/features/fees/FeeRuleManager.tsx:105
  src/features/trades/TradeForm.tsx:304,529
  src/features/cash/CashEventPanel.tsx:145
  src/features/asset-transfers/AssetTransferPanel.tsx:174
  src/features/backup/backupImportPreflight.ts:654
HEAD 8fd0b6e（同一命令）：
  src/features/backup/backupImportPreflight.ts:661     ← 只剩这一处
```

逐处核对结果：

| 位置（缝） | 缝上写法 | HEAD 写法 | 等价性 |
| --- | --- | --- | --- |
| `TransactionsWorkspace.tsx:405` | `feedback !== "交易已删除" && feedback !== "现金事实已删除"` | 换成 `t("transactions.delete.tradeDeleted")` / `...cashFactDeleted` | **等价**（键值逐字相同） |
| `TransactionsWorkspace.tsx:663` | 同上 | 同上 | **等价** |
| `TransactionsWorkspace.tsx:665` | `includes("无法") \|\| includes("尚未保存")` | `includes(t("transactions.feedback.errorPrefix")) \|\| includes(t("...notPersistedFragment"))`，键值为 `"无法"`／`"尚未保存"` | **等价** |
| `PriceForm.tsx:240,347` | `=== "正在保存…"` / `=== "价格已认证保存"` | 改比较 `savingMessage` / `certifiedSavedMessage` 两个由 `t()` 求得的常量 | **等价** |
| `FeeRuleManager.tsx:105` | `!== "手续费规则已认证保存"` | `!== certifiedSavedMessage` | **等价** |
| `TradeForm.tsx:304,529` | `successMessage`（存中文文本的 state）比较 | **重构为 `successState: "" \| "certified" \| "saving"` 枚举 state**，渲染时再 `t()` | **等价但是结构改动**：新增了一个 state 变量、改变了状态的表示方式。这已经不止是「换文案来源」 |
| `CashEventPanel.tsx:145` | `!feedback.includes("已")` | `feedback !== certifiedSavedFeedback && feedback !== deletedFeedback` | **等价**：我枚举了缝上该文件全部 8 处 `setFeedback(...)`，含「已」的只有那两条成功文案（`再次点击以确认…` 是「以」不是「已」） |
| `AssetTransferPanel.tsx:174` | `!feedback.includes("已")` | 同上 | **等价**：缝上 10 处 `setFeedback(...)`，含「已」的同样只有那两条 |
| `backupImportPreflight.ts:654` | `endsWith("且不提供迁移")` | **原样保留**（HEAD:661） | 未改，但产生了新的耦合隐患，见第六节问题 3 |

**判断：这 10 处的运行行为在中文下逐处等价，我没有查到行为变化。但它们都是逻辑改动，不是「把字面量换成 `t(key)`」，`09B` D-2 要求「同一笔提交里不得出现任何其他改动」，`09C` R-6／跳过清单也未登记它们。** 属于**应当记录而未记录**，不属于夹带错误。

---

## 四、重点二：中文文本有没有被改掉（本报告的核心）

### 4.1 我的口径（三道，逐道说明）

**第一道 — 中文字符串字面量多重集合比对。** 我没有用正则抓字符串（正则分不清注释和代码），而是**用仓库自带的 TypeScript 编译器逐文件建 AST**，抽出 `StringLiteral`、`NoSubstitutionTemplateLiteral`、模板串的 `TemplateHead/Middle/Tail`、以及 `JsxText` 中含汉字者。注释不进 AST，自然被排除。

**两侧用的是同一个脚本、同一份目录清单（`src/app`／`src/features`／`src/ui`，排除 `*.test.*`），`src/ui/i18n.tsx` 在两侧都被包含**——它本身就是字符串字面量，因此「文案表的值」和「留在各文件里的字面量」被同一条命令一次性抽出，**口径在比较前没有发生任何变化**。

```text
缝 ffbe0ff：  files=96  hits=1391   （去重后 1047）
HEAD 8fd0b6e：files=96  hits=1182   （去重后  982）
```

两侧不相等是预期的：本批把整句拆成前缀／后缀／分隔符多个 key（条数变多），同时把同一句中文的多个出现合并到一个 key（条数变少）。**所以我没有停在数量差上，而是逐条判定差异是「拆分」还是「改写」。**

**第二道 — 汉字投影可拼性判定（自动化）。** 对每一条「只在缝侧出现」的字符串，取其汉字投影，用动态规划判断它能否由 HEAD 侧全部字符串的汉字投影**拼接而成**。能拼出 ⇒ 是拆分；拼不出 ⇒ **出现了丢失的措辞**。反向同理，检出**新增的措辞**。

**第三道 — `t(key)` 回填后的逐文件渲染流比对。** 我把每个文件的 AST 按源码顺序展开为一条「渲染文本流」，其中每个 `t("key")`／`translateDefault("key")` 调用被**替换回该侧文案表里的中文值**，然后忽略全部空白做逐文件字符级 diff。这一道能直接看见「同一处的中文变了」。

### 4.2 第二道的原始结果

```text
##### 缝有、HEAD 拼不出（疑似措辞丢失）: 5 条 #####
--- 未覆盖: 「已」
      原文: "已"
--- 未覆盖: 「账本或状态已变化价格未写入」
      原文: "账本或 mapping 状态已变化，价格未写入"
--- 未覆盖: 「项导入错误页面显示前」
      原文: " 项导入错误，页面显示前"
--- 未覆盖: 「小数费率」
      原文: "小数费率"
--- 未覆盖: 「固定」
      原文: "\n                  固定 "

##### HEAD 有、缝拼不出（疑似措辞新增）: 1 条 #####
--- 未覆盖: 「条」
      原文: "条"
```

逐条落实：

- `「已」` → 不是文案，是 `AssetTransferPanel.tsx:174` 的判定字符串 `feedback.includes("已")`，已在第三节确认改写等价。
- `「条」` → 分页文案由 `共 N 条，第 P 页` 拆成 `共`／`条`／`第`／`页` 四个 key 的拆分产物，非新措辞。
- **其余 3 条全部是真实的中文被改**，加上第三道另查出的 1 条，共 4 处。

### 4.3 四处中文被改（**确认，逐处有 diff 证据**）

#### 缺陷 1 — `BackupControls.tsx`：两条不同的错误消息被并成一个 key

提交 `c85f1f3 refactor: localize backup controls`：

```diff
       ...skippedSymbols.map((assetSymbol) => ({
         code: "BINANCE_PRICE_NOT_APPLIED",
-        message: "mapping 或全局 ID 状态已变化，价格未写入",
+        message: t("backup.pairing.priceNotWritten"),
       })),
@@
         .map(({ assetSymbol }) => ({
           code: "BINANCE_PRICE_NOT_APPLIED",
-          message: "账本或 mapping 状态已变化，价格未写入",
+          message: t("backup.pairing.priceNotWritten"),
         })),
```

缝上 `BackupControls.tsx:581` 与 `:611` 是同一个函数里**两条不同的消息**，对应两条不同的失败路径（`skippedSymbols` 与「mutation 未应用」）。HEAD 的 `:584` 与 `:614` 都指向同一个 key：

```text
"backup.pairing.priceNotWritten": "mapping 或全局 ID 状态已变化，价格未写入"
```

**第二条路径的用户可见文案由「账本或 mapping 状态已变化，价格未写入」变成了「mapping 或全局 ID 状态已变化，价格未写入」。** 这两句指的不是同一件事。

#### 缺陷 2 — `BackupControls.tsx`：预检报告块丢了「页面」二字

同一笔 `c85f1f3`。缝上两处：

```text
seam :1193   发现 {importErrors.length} 项导入错误，显示前 {…} 项。
seam :1404   发现 {result.hardErrorCount} 项导入错误，页面显示前 {…} 项。
```

HEAD 两处都改用同一组 key：

```text
"backup.errors.foundPrefix": "发现"
"backup.errors.showingPrefix": "项导入错误，显示前"
"backup.errors.suffix": "项。"
```

**`:1407` 的预检报告块由「项导入错误，页面显示前」变成「项导入错误，显示前」。**

#### 缺陷 3 — `FeeRuleManager.tsx:299`：表单字段标签由「小数费率」变成「费率」

提交 `118bb26 refactor: localize fee rule manager`：

```text
seam :297   {form.type === "fixed" ? "金额（USDT）" : "小数费率"}
HEAD :299   {form.type === "fixed" ? t("fees.field.fixedAmount") : t("fees.field.rate")}
            "fees.field.rate": "费率"
```

`fees.field.rate` 的「费率」取自缝上 `:351/:353` 的历史规则 aria-label（那里原文确实是「费率」），却被复用到了 `:299` 这个原文为「小数费率」的表单标签上。

#### 缺陷 4 — `FeeRuleManager.tsx:337`：规则摘要由「固定」变成「固定费」

同一笔 `118bb26`：

```text
seam :335   固定 <LedgerNumber kind="money" value={rule.amount} /> USDT
HEAD :337   {t("fees.type.fixed")} <LedgerNumber kind="money" value={rule.amount} /> USDT
            "fees.type.fixed": "固定费"
```

`fees.type.fixed`（「固定费」）取自 `:294` 的下拉选项，被复用到了 `:337` 这个原文为「固定」的位置，**多出一个「费」字**。

### 4.4 根因定位与「同类问题是否还有」

四处的根因完全相同：**一个 key 被用在中文原文并不相同的多个位置上。** 我为此专门写了一道针对性检测：把 HEAD 每个 key 的 `t()` **调用点数量**，与该 key 的中文值**在缝上逐字出现的次数**相比，凡调用点更多者列为可疑。

**第一轮（缝上该原文出现 ≥1）：13 条候选**，逐条打开源码核对后，
`dashboard.futureFacts.deleteTrade`／`deletePrice`／`deleteAssetTransfer`／`dashboard.section.tradeList`／`access.reconnectPrompt.reselect`／`settings.language.label`／`marketData.failure.validationUnavailable`／`charts.heatmap.home.emptyDay`／`prices.field.date`／`prices.field.note` **共 10 条为良性**（缝上原本就是同一句话出现两次，只是其中一次嵌在模板串里导致逐字计数为 1）；
`backup.pairing.priceNotWritten`、`fees.field.rate`、`fees.type.fixed` **即缺陷 1／3／4**。

**第二轮（缝上该原文逐字出现 =0、且 ≥2 个调用点）：14 条候选**，其中 `backup.errors.showingPrefix` **即缺陷 2**；其余 13 条（`取消`／`返回`／`共`／`笔`／`新版本`／`账本外`／`手续费未换算`／`忘记这条连接并选择另一本账`／`重新检查`／`价格资产` 等）逐条核对缝上两处措辞一致，**良性**。

**所以：在「一 key 多用」这个根因上，我认为已经查全——27 条候选里只有这 4 处改了字。**

### 4.5 第三道（渲染流比对）的结果

忽略全部空白后，38 个文件中有 **28 个**存在字符级差异。我逐个读了全部 opcode。除上述 4 处缺陷外，其余全部属于以下三类无害情形：

- **位置移动**：字符串从常量表／对象字面量搬到了使用点（`HoldingsDetails` 的表头标签、`PriceForm`／`TradeForm`／`CashEventPanel`／`FeeRuleManager` 的反馈文案、`DashboardShellHelpers.ts` 的「清空本地账本」移到 `DashboardShell.tsx`）。
- **提取为局部常量**：`BackupControls.tsx:1302` 把 13 处「不可得」提为 `const unavailable = t("backup.report.unavailable")`，渲染结果不变。
- **判定改写**：即第三节那 10 处。

**拼接式文案我逐条核对了拼回结果**，例如 `backupEnvelope.ts`：

```text
seam: `这是账本 schema V${input.ledgerSchemaVersion} 的备份；当前账本 schema 为 V4，且不提供迁移`
HEAD: t("backup.envelope.schemaVersionPrefix")  = "这是账本 schema V"
    + input.ledgerSchemaVersion
    + t("backup.envelope.schemaVersionMiddle") = " 的备份；当前账本 schema 为 V4，且不提供迁移"
```

**逐字相同（含空格）。** `backupImportReport.ts` 的 `日期 `／`资产 `／`- 原始路径：`／` 摘要：` 等前后缀同样逐字核对无误。

### 4.6 我这套方法的盲区（如实声明）

- 第二道基于「汉字投影能否由对侧片段拼出」。**若某处 key 复用后幸存的文案恰好能由对侧片段拼出，第二道不会报出。** 第三道与 4.4 的针对性检测正是为补这个洞而做，但两者都不构成数学上的完备证明。
- 第三道对「位置移动」敏感，需要人工判读 opcode，**判读者是我**。
- 空白差异被第三道刻意忽略（见第六节问题 7 单列）。

---

## 五、重点三与通电检查

### 5.1 重点三：那几处「跳过」是不是真的不能搬（我自己看的代码，不复述 `09C`）

| 跳过项 | 我看到的代码 | 判定 |
| --- | --- | --- |
| `SettingsWorkspace.tsx:15` `"清空账本"` | `export const PUBLIC_CLEAR_LEDGER_CONFIRMATION_TEXT = "清空账本";`，在 `:139` 参与 `confirmationValue !== PUBLIC_CLEAR_LEDGER_CONFIRMATION_TEXT`，同时在 `:141`／`:343` 显示给用户 | **确实参与判定**（被比较）。搬走会让破坏性清空的确认口令随界面语言变化。**跳过成立** |
| `chartDataService.ts:152` `"现金 USDT"` | `assetSymbol: "现金 USDT"`，该字段在 `:196-198` 参与 `left.assetSymbol < right.assetSymbol` / `>` 排序比较（`:575` 另有一处同类比较） | **确实参与判定**（被比较）。**跳过成立** |
| `chartDataService.ts:246` `"其他"` | `assetSymbol: "其他"`，同上排序路径 | **确实参与判定**。**跳过成立** |
| `backupImportPreflight.ts:661` `"且不提供迁移"` | `error.message.endsWith("且不提供迁移")`，且该分支只在 `BACKUP_UNSUPPORTED_FORMAT_VERSION` / `BACKUP_SCHEMA_VERSION_MISMATCH` 下生效 | **确实参与判定**（`endsWith`）。**跳过成立**，但本批把消息的产生侧改成了可翻译文案，产生新隐患，见第六节问题 3 |
| `layout.tsx:6` 服务端 metadata | 我**没有采信 `09C` 的理由，而是自己复现了 `6197ae5` 的改动并跑 build** | **跳过成立**，证据如下 |

复现 `6197ae5` 后 `npm run build` 的原始输出：

```text
 ✓ Compiled successfully in 4.1s
   Collecting page data ...
[Error: Failed to collect configuration for /_not-found] {
  [cause]: Error: Attempted to call translateDefault() from the server but translateDefault is on the client.
  It's not possible to invoke a client function from the server, it can only be rendered as a Component
  or passed to props of a Client Component.
}
> Build error occurred
```

`src/ui/i18n.tsx` 首行确为 `"use client";`。**客户端 i18n 在该处确实会使 build 失败，跳过是正确处置。**（已 `git checkout --` 还原，见第七节。）

**补充：`chartDataService` 的两处不只是标识符，它们同时被渲染到饼图上**，因此切到英文／匈牙利语时图上会出现中文「现金 USDT」「其他」。这是本批范围外的既有设计代价，不影响本批判定，但值得登记。

### 5.2 通电检查（3 次，全部在临时 worktree 中进行）

破坏前 `src/ui/i18n.tsx` SHA-256：

```text
d1112fcee1f7d6be2db98d4b0c6758dac1c21b0dd9a7f913fe05335864508b29  src/ui/i18n.tsx
```

#### 通电 1（必做）：`interfaceWording` 守卫仍然有效

植入 `"audit.probe.deprecatedWording": "总花费"`：

```text
$ npx vitest run src/test-support/interfaceWording.test.ts
- Expected
+ Received
- []
+ [
+   "ui/i18n.tsx: 总花费",
+ ]
 ❯ src/test-support/interfaceWording.test.ts:36:21
 Test Files  1 failed (1)
      Tests  1 failed (1)
```

`git checkout -- src/ui/i18n.tsx` 还原后：

```text
$ shasum -a 256 src/ui/i18n.tsx
d1112fcee1f7d6be2db98d4b0c6758dac1c21b0dd9a7f913fe05335864508b29  src/ui/i18n.tsx   ← 与破坏前一致
$ git status --short
(空)
$ npx vitest run src/test-support/interfaceWording.test.ts
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

**守卫对新增的文案表条目有效。Q-7 成立。**

#### 通电 2（必做）：改掉一个字，确认测试变红

把 `"home.metrics.totalAssets": "当前总资产"` 的「总」改成「總」（仅一字）：

```text
28:  "home.metrics.totalAssets": "当前總资产",

$ npx vitest run src/app/HomeWorkspace.test.tsx
 Test Files  1 failed (1)
      Tests  1 failed | 5 passed (6)
```

还原后 SHA-256 回到 `d1112fce…`，`git status --short` 为空。

**「中文渲染逐字不变」在被断言覆盖的条目上是被真实守住的。**

#### 通电 3（我判断最承重的一条）：本批四处缺陷所涉的文案，究竟有没有被测试守住

这是本批最该问的问题——**为什么 4 处中文被改而 1185 条测试全绿？** 我把三条涉事文案同时替换成不可能出现的探针串，跑**默认全量**：

```text
"backup.errors.showingPrefix"      → "XX审计探针AA"
"fees.field.rate"                  → "XX审计探针BB"
"backup.pairing.priceNotWritten"   → "XX审计探针CC"

$ npx vitest run
 Test Files  2 failed | 104 passed (106)
      Tests  2 failed | 1183 passed (1185)

FAIL  src/features/backup/BackupControls.test.tsx > shows structured parser errors and clears them on a new selection
        XX审计探针AA
FAIL  src/features/fees/FeeRuleManager.test.tsx > creates a replacement action without mutating the historical rule
        aria-label="Binance BTC 新版本XX审计探针BB"
```

结果解读——**这正是缺陷得以溜过的机制**：

- `backup.pairing.priceNotWritten`（缺陷 1）**零测试覆盖**，改成乱码全量仍绿。
- `backup.errors.showingPrefix`（缺陷 2）有一条测试，但它守的是 `:1194` 那个**没有被改坏**的调用点；`:1407` 那个丢了「页面」的调用点无人守。
- `fees.field.rate`（缺陷 3）有一条测试，但它断言的是 `:355` 的 aria-label `"Binance BTC 新版本费率"`，即**没有被改坏**的那个调用点；`:299` 的表单标签无人守。

**结论：「1185 条中文断言全绿」不能证明「搬运是纯的」。一旦允许一个 key 服务多个调用点，测试只需守住其中一个就全绿。** 这是 `09A` Q-2 证据链的结构性漏洞，不是执行者一时疏忽。

还原后：

```text
$ shasum -a 256 src/ui/i18n.tsx
d1112fcee1f7d6be2db98d4b0c6758dac1c21b0dd9a7f913fe05335864508b29   ← 与破坏前一致
$ git status --short
(空)
```

---

## 六、问题清单（按严重度）与建议处置

### 阻塞级（导致 FAIL）

**问题 1｜四处屏幕上的中文被改（D-3／Q-2 违反）**

| # | 位置（HEAD） | 缝上原文 | 现在渲染 | 提交 |
| --- | --- | --- | --- | --- |
| 1a | `BackupControls.tsx:614` | `账本或 mapping 状态已变化，价格未写入` | `mapping 或全局 ID 状态已变化，价格未写入` | `c85f1f3` |
| 1b | `BackupControls.tsx:1407` | `项导入错误，页面显示前` | `项导入错误，显示前` | `c85f1f3` |
| 1c | `FeeRuleManager.tsx:299` | `小数费率` | `费率` | `118bb26` |
| 1d | `FeeRuleManager.tsx:337` | `固定 ` | `固定费 ` | `118bb26` |

**建议处置**：不 `amend`、不 `rebase`（`M-2`／`M-4′` 仍然有效），**用 4 笔新提交修**。每处**新建一个专用 key**，把中文改回缝上原文：

- `backup.pairing.ledgerOrMappingChangedPriceNotWritten` = `"账本或 mapping 状态已变化，价格未写入"`，用于 `:614`；
- `backup.errors.showingOnPagePrefix` = `"项导入错误，页面显示前"`，用于 `:1407`；
- `fees.field.decimalRate` = `"小数费率"`，用于 `:299`；
- `fees.history.fixedPrefix` = `"固定"`，用于 `:337`。

**不要**反过来去改现有 key 的值——那会把另一个调用点弄坏。

### 高（不阻塞，但应在收口前处理）

**问题 2｜证据链本身有洞：Q-2 无法证明它声称的事**

`09A` Q-2 写「中文界面逐字不变，可由既有中文断言全绿直接证明」。通电 3 已证伪：一个 key 服务 N 个调用点时，断言只需覆盖 1 个即全绿。

**建议处置**：在收口前加一条机器化检查（可放进 `src/test-support/`），实现第 4.4 节那道检测的常驻版本——**对每个 key，比对其全部 `t()` 调用点在上一个已验收基线上的原文是否一致**；或更简单也更彻底的一次性验证：把第四节那套「AST 抽取 + `t()` 回填 + 逐文件渲染流比对」脚本化并入仓，作为将来任何文案搬迁批次的收口闸门。**这比再加 100 条中文断言都管用。**

**问题 3｜`backupImportPreflight.ts:661` 的 `endsWith("且不提供迁移")` 已成为跨语言定时炸弹**

判定侧是**硬编码中文**，而产生侧（`backupEnvelope.ts:154,173`）在本批之后已变成**可翻译文案** `backup.envelope.formatVersionSuffix` / `schemaVersionMiddle`。今天中文下成立（我已逐字核对结尾）；**一旦有人给这两个 key 补上英文或匈牙利语译文，该分支会静默失效**，备份版本不兼容的报告文案会走错分支，且没有任何测试会变红。

**建议处置**：本批不必修（超出「纯搬运」）。但必须**登记为下一批的必做项**，与 `09A` 修订 B 移出的 `core`／`platform` 错误码改造同批处理——正确解法是判定改用 `error.code`（该处已经在比 `code` 了，`message.endsWith` 是多余的第二重条件）。**在修掉它之前，不得给这两个 key 补译文。**

### 中（记录，不阻塞）

**问题 4｜`metadata.description` 是孤儿 key**

`6197ae5` 新增了它，`b6738a8` 把 `layout.tsx` 改回硬编码中文却**没有撤销这个 key**。现状：

```text
$ grep -rn 'metadata\.description' src --include='*.ts' --include='*.tsx' | grep -v 'ui/i18n.tsx'
(none — orphan key)
src/ui/i18n.tsx:422:  "metadata.description": "只由你选择的加密文件承载的本地优先交易账本。",
src/app/layout.tsx:6:  description: "只由你选择的加密文件承载的本地优先交易账本。",
```

同一句中文在两处各存一份，将来改一处必漏另一处。**建议处置**：随修正提交一并删除该 key（或加注释说明它是服务端边界的备案副本）。

**问题 5｜`09C` 的文案表键数 660 是错的，实测 1214**

`09C` 第三轮用的 `awk` 按 `^  "key":` **计行**，而 `i18n.tsx` 的中文表大量把多个 key 写在同一行，被吞掉。连带三个数字都错：

| 项 | `09C` | 我实测 |
| --- | ---: | ---: |
| 中文表键数 | 660 | **1214** |
| 英／匈相对中文表缺项 | 628 | **1182** |
| 英／匈覆盖率 | （约 5%，见任务书背景） | **32 / 1214 = 2.6%** |

**建议处置**：`09C` 更正为实测值。**同时提醒：`AGENTS.md` 写「在多语言功能落地前不得声称已具备英文交付能力」——按 2.6% 的实际覆盖率，本批之后依然不具备英文交付能力，论文表述必须继续按「机制已就位、译文分阶段补齐」写，不得写成「已支持中英匈三语」。** 这一点比数字本身更要紧。

**问题 6｜`09C` 的「中文断言 349 → 352」是两条不同命令的产物，不构成比对**

`09C` 第三轮缝侧用 `git grep -P … ffbe0ff`，收尾侧用 `rg -P … src`，两条命令的文件范围与匹配语义都不同。**口径在比较前发生了变化，该结论不成立。** 我用同一条命令跑两侧，结果 **357 = 357**（含汉字测试行 1404 = 1404）。而且本批**零测试文件改动**，这个数只可能相等。

**建议处置**：`09C` 更正；今后凡「前后对照」一律先固定命令再取两侧。

### 低（登记）

**问题 7｜6 处 JSX 引入了冗余空格**

```text
$ grep -rn '} {" "}' src --include='*.tsx' | grep -v '\.test\.'
src/app/DashboardShell.tsx:724, 725, 746, 766
src/features/trades/TradeForm.tsx:760
src/features/charts/TradeHeatmapChart.tsx:110
（缝上同模式：0 处）
```

例：缝 `{trade.assetSymbol} · 数量{" "}` → HEAD `{trade.assetSymbol} · {t("…quantity")} {" "}`，DOM 文本多出一个空格。浏览器会折叠连续空白，**视觉上不可见**，故不计入缺陷 1；但严格按 D-3「逐字不变」它是偏离。**建议处置**：随修正提交顺手去掉多余的 `{" "}` 或那个空格。

**问题 8｜第三轮的标点收口没有真正做完**

P-1 列举的字符集是 `：、，。；？！` 加 `join()` 分隔符，**不含 `·`、`“`、`”`、`／`、`…`**。这些仍硬编码在 `t()` 之外：

```text
$ grep -rn '[“”·…／]' src/app src/features src/ui --include='*.ts' --include='*.tsx' \
    | grep -v '\.test\.' | grep -v 'src/ui/i18n.tsx' | grep -vE ':[[:space:]]*(\*|//|/\*)' | wc -l
59        （分布 17 个文件；中点 `·` 为主，另有清空确认的全角引号 “”）
```

严格说不违约（P-1 是封闭清单），**但 `09B` 修订 B 的 B 节自称「把界面层中所有硬编码在 `t()` 之外的中文标点与分隔符搬进文案表」，这句话与现状不符。** 建议 `09C` 把措辞收窄为「P-1 所列字符已搬完」，并把 `·` 与 `“”` 登记为下一批范围。

**问题 9｜三笔提交只改源码、不动文案表（轻微偏离 D-2）**

`c03bdb7`／`dcd80eb`／`0307c51` 用的 key 由更早的 `1f1c0c8` 提前加入。中文无损，但单读这三笔 diff 无法确认新文案内容，削弱了 D-1「每笔 diff 可被逐行读完」的初衷。**建议处置**：仅登记，不返工。

**问题 10｜10 处「以中文做判定」的改写未被 `09C` 登记**

见第三节表。逐处等价，但 `TradeForm` 那处是实打实的 state 结构重构。**建议处置**：`09C` 补记为「本批实际发生的第三类改动」，不必返工。

**问题 11｜`09C` 第一节把缝上 build 记作 364 kB**

我实测 365 kB。**建议处置**：更正。

---

## 七、边界与状态确认

### 我做了什么、没做什么

- **未修改任何源码或测试。** 通电检查的三次临时破坏全部发生在 scratchpad 的临时 worktree 中，每次 `git checkout --` 还原并核对 SHA-256 与破坏前一致（三次均为 `d1112fce…`）。
- **未 merge、未 push、未 rebase、未 amend。** 不授权合入。
- **未读取 `~/Downloads/history_OKX/`，未打开任何真实 `.lftl` 或真实 B 文件。**
- 根文档仓库**只新建本文件**；源码仓库**零提交**。
- 临时 worktree 已清理。

### 源码仓库收尾状态

```text
$ git worktree list
…/LocalFirstTradingLedger   8fd0b6e [zhennn/w15-main-app-split]
（临时 worktree seam / probe 已 remove）

$ git status --short --branch
## zhennn/w15-main-app-split

$ git log -1 --format='%h %s'
8fd0b6e refactor: localize trade table separator
```

**主工作目录仍在 `zhennn/w15-main-app-split@8fd0b6e`，`git status --short` 无输出。**

---

## 八、收尾状态表

| 项 | 判定 | 依据 |
| --- | --- | --- |
| 缝与提交笔数（`ffbe0ff`，57 笔，0 merge） | **通过** | 2.x 实测，与 `09C` 一致 |
| 零测试文件改动（N-1） | **通过** | `git diff --name-only` 过滤为空 |
| 用例全名不变（Q-1／Q-16） | **通过** | 三种口径 `diff` 全空；不去重两侧同为 1185 |
| 默认全量 `npm test` | **通过** | 106 files / 1185 tests |
| 冻结派生等价性快照（Q-3／H-2） | **通过** | 7/7 |
| `typecheck` / `lint` / `build`（Q-4） | **通过** | 全部 exit 0 |
| 结构守卫两文件（H-3） | **通过** | 2 files / 8 tests |
| 两项 whitespace 检查 | **通过** | 均为空 |
| 四个版本号不变（Q-5／H-1，权威定义处） | **通过** | 缝与 HEAD 逐处对照相同 |
| `core`／`platform` 未引用 `@/ui`（Q-6） | **通过** | 检索为空 |
| `core`／`platform` 本批零改动（修订 B「只列不改」） | **通过** | `git diff --stat` 为空 |
| `package.json` / lockfile 零改动（Q-9） | **通过** | 为空 |
| 产物无异常膨胀（Q-8） | **通过** | 365→376 kB，与新增文案相称 |
| `interfaceWording` 守卫仍然有效（Q-7） | **通过** | 通电 1，SHA-256 还原一致 |
| 「改一个字测试变红」（D-3 是否被真实守住） | **部分成立** | 通电 2 通过；通电 3 证明覆盖有大片空白 |
| Q-13 标点收尾普查（P-1 字符集内） | **通过** | 6 行，与 `09C` 逐行一致 |
| 跳过清单 4 处（重点三） | **通过** | 逐处读代码确认参与判定；`layout.tsx` 已自行复现 build 失败 |
| **中文渲染逐字不变（D-3／Q-2）** | **不通过** | **4 处被改，见第 4.3 节** |
| Q-13 之外的标点收口（`·`／`“”`） | **未做完** | 59 行 17 文件，问题 8 |
| `09C` 数字准确性 | **有 3 处不符** | 键数 660→1214；断言 349/352 口径不一致→357=357；缝上 build 364→365 kB |
| 文案表键数（本报告实测口径） | 中文 **1214**、英 **32**、匈 **32**，中文表无重复键 | 2.10 |

### 未核验的事项（如实列出，不用别的数字顶替，不作推断）

1. **未在浏览器中实际渲染核对任何页面。** 第四节的全部结论来自源码与 AST 分析，不是运行时截图比对。
2. **未核验英文（32 条）与匈牙利语（32 条）译文的语义正确性**，只核验了条数与回落机制的类型约束。
3. **未验证「一 key 多用」之外的其他潜在改写路径的完备性。** 第 4.6 节已声明我这套方法的盲区：第二道的可拼性判定与第三道的 opcode 判读都不构成完备证明。我能说的是：在我实施的三道检查与两轮针对性检测下，只查出这 4 处。
4. **未核验缝之前的 4 笔提交**（属 08 批，任务边界明确排除）。
5. **未核验第三节判定为「等价」的 10 处改写在极端并发／竞态下的行为**，只做了静态的取值集合枚举。
6. **未测量本批对运行时性能的影响**（`t()` 调用数量大幅增加），本批合同未设该闸门，我也未自行加设。

---

## 九、给产品负责人的一句话

**本批的工程纪律（分批提交、不碰测试、不碰 `core`、版本号不动、用例名不动）执行得很好，问题只出在一个手法上：允许一个 key 服务多个调用点。** 这个手法让 4 处中文被静默改掉，也让「中文断言全绿」这条本批最倚重的证据失去了效力。修复面很小（4 处、2 个文件、4 笔新提交），但**在补上一条能防住「一 key 多用」的机器化检查之前，同类问题会在下一个文案批次里重演**。
