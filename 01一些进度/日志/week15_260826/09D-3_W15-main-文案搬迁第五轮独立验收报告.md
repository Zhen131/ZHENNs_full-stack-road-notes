# 09D-3　W15-main 文案搬迁第五轮独立验收报告

- 验收对象：`5c825c2`（分支 `zhennn/w15-main-app-split`）
- 上一轮验收对象：`c830e79`
- 缝：`ffbe0ff`
- `origin/main`：`8df62d8b4b2bead68bf2209765ce39379e23288d`（自行 `git rev-parse origin/main` 确认）
- 验收人：独立验收方（本会话），验收日期 2026-09-02
- 依据：`09B` 修订 D（F-6～F-10、G-6～G-11、Q-22～Q-27）

---

## 1　结论

# **PASS**

第五处缺陷已逐字复原；守卫扩容经我自己重跑的通电检查证明**确实通电**（并有决定性反例证明扩容前抓不到）；10 条新增允许清单条目逐条回缝核对，**未发现第六处缺陷**；全部 8 条闸门（含产品负责人未跑过的 `npm run build`）在我这里全绿。

无附加条件。

本报告中每一个数字均由我自己重新跑出或重新数出；**未复核**的事项集中列在第 10 节。

---

## 2　范围前提验证

`git diff --name-only c830e79..5c825c2` 原始输出：

```text
src/features/prices/PriceForm.tsx
src/test-support/translationKeyUsage.test.ts
src/ui/i18n.tsx
```

`git log --oneline c830e79..5c825c2` 原始输出：

```text
5c825c2 test: guard translateDefault key reuse
a943f0b fix: restore asset validation wording
```

`git diff --stat c830e79..5c825c2` 原始输出：

```text
 src/features/prices/PriceForm.tsx            |  2 +-
 src/test-support/translationKeyUsage.test.ts | 24 +++++++++++++++++++++---
 src/ui/i18n.tsx                              |  1 +
 3 files changed, 23 insertions(+), 4 deletions(-)
```

**范围与指令预期逐字一致（三个文件、+23/−4）。因此「本轮可缩小为增量比对」这一前提成立**，第 8 节的四项跳过随之生效。

---

## 3　R-1　第五处是否逐字复原（Q-22）＋ F-7／F-9

### 3.1　缺陷本体

缝上 `src/features/prices/PriceForm.tsx` 有两处不同的中文，**它们不是同一句话**：

`git show ffbe0ff:src/features/prices/PriceForm.tsx | sed -n '52,60p'`：

```tsx
const fieldLabels: Record<keyof PriceSnapshotDraft, string> = {
  assetSymbol: "资产",
  price: "当前价格",
  currency: "计价货币",
  recordedAt: "价格日期",
  source: "价格来源",
  binanceProvenance: "Binance 来源证据",
  note: "价格备注",
};
```

`git show ffbe0ff:src/features/prices/PriceForm.tsx | sed -n '361,363p'`：

```tsx
      <label className="grid gap-2 text-sm font-medium">
        价格资产
```

`git show ffbe0ff:src/features/prices/PriceForm.tsx | sed -n '116,117p'`（错误文案的拼装处）：

```tsx
    case "PRICE_SNAPSHOT_INVALID_INPUT":
      return `${label}不能为空或格式不正确`;
```

即：缝上 **53 行 = `资产`**（校验提示用），**362 行 = `价格资产`**（表单标签用）。

### 3.2　三者对照

| | 校验提示 `PRICE_SNAPSHOT_INVALID_INPUT`（assetSymbol） | 表单 `<label>` |
| --- | --- | --- |
| ① 缝 `ffbe0ff` 原文 | **`资产不能为空或格式不正确`**（53 行 `"资产"` ＋ 117 行后缀） | **`价格资产`**（362 行） |
| ② 修复前 `c830e79` 渲染 | `价格资产不能为空或格式不正确` ← **被改写** | `价格资产` |
| ③ 修复后 `5c825c2` 渲染 | **`资产不能为空或格式不正确`** | **`价格资产`** |

**③ 与 ① 逐字相同，两列皆是。**

推导依据（全部自取）：

- `5c825c2:src/features/prices/PriceForm.tsx:89` → `assetSymbol: t("prices.field.assetSymbolLabel")`
- `5c825c2:src/ui/i18n.tsx:463` → `"prices.field.assetSymbolLabel": "资产"`
- `5c825c2:src/ui/i18n.tsx:482` → `"prices.validation.invalidInputSuffix": "不能为空或格式不正确"`
- `c830e79:src/features/prices/PriceForm.tsx:89` → `assetSymbol: t("prices.field.asset")`；`c830e79:src/ui/i18n.tsx:462` → `"prices.field.asset": "价格资产"`

**运行时复核**（不是只读源码）：我在临时 worktree 里写了一条一次性探针测试，走真实的 `translate()` 解析器断言：

```ts
expect(translate("zh-CN","prices.field.assetSymbolLabel") + translate("zh-CN","prices.validation.invalidInputSuffix"))
  .toBe("资产不能为空或格式不正确");
expect(translate("zh-CN","prices.field.asset")).toBe("价格资产");
```

结果 `Test Files 1 passed / Tests 1 passed`。探针文件随即删除，worktree `git status --porcelain` 为空。

**用户可见后果已消失**：价格表单资产字段校验提示为 `资产不能为空或格式不正确`，不再是 `价格资产不能为空或格式不正确`。

### 3.3　F-7　`prices.field.asset` 的值未被改动

- 缝 `ffbe0ff:PriceForm.tsx:362` 原文：`价格资产`
- `c830e79:src/ui/i18n.tsx:462`：`"prices.field.asset": "价格资产"`
- `5c825c2:src/ui/i18n.tsx:462`：`"prices.field.asset": "价格资产"`

**一字未动。** 修复是**新增** `prices.field.assetSymbolLabel` 并把校验侧调用点切过去，而不是改动 `prices.field.asset` 的值——没有把缺陷搬到对面。**F-7 通过。**

### 3.4　F-9／Q-25　允许清单移除与 `staleApprovals`

`prices.field.asset` 在 `5c825c2` 上的全部调用点（`git grep -n 'prices\.field\.asset"' 5c825c2 -- src`）：

```text
5c825c2:src/features/prices/PriceForm.tsx:370:        {t("prices.field.asset")}
5c825c2:src/ui/i18n.tsx:462:  "prices.field.asset": "价格资产",
```

**只剩 1 个调用点**（i18n.tsx 那行是定义，不是调用）。因此它必须从允许清单移除，否则 `staleApprovals` 会红。我自己比对允许清单确认它已被移除（见第 5.1 节 `comm` 输出）；`staleApprovals` 断言随 `npm test` 全绿通过，并在我的通电检查基线运行中单独跑过（`Tests 1 passed`）。**F-9／Q-25 通过。**

---

## 4　R-2　守卫通电检查（Q-23）——**我自己跑的，未引用 `09C-2` 任何输出**

### 4.1　环境隔离

在 scratchpad 建临时 detached worktree，`node_modules` 以软链接指向主仓库（只读复用，未在主仓库安装或改动任何文件）：

```text
git worktree add <scratchpad>/wt-guard 5c825c2 --detach
Preparing worktree (detached HEAD 5c825c2)
HEAD is now at 5c825c2 test: guard translateDefault key reuse
```

**改动前 SHA-256：**

```text
654273f1b25b850b50ff2fc0af1c4a3a499530e9e91911519b0c1cf3d9233674  src/features/portfolio/ledgerProjection.ts
aa1919081b7ebfe343348c5a5a08ed485cdd27038e23076d71ec24d9e22c3bcc  src/test-support/translationKeyUsage.test.ts
```

### 4.2　步骤 ①　基线（未改动）——应绿

```text
 RUN  v4.1.9 .../wt-guard

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  15:53:59
   Duration  481ms (transform 95ms, setup 96ms, import 134ms, tests 192ms, environment 0ms)
```

### 4.3　步骤 ②　注入 **`translateDefault("key")` 形式**的违规——应红

在 `src/features/portfolio/ledgerProjection.ts` 末尾追加（**刻意不用 `t()` 形式**）：

```ts
// GUARD-ELECTRIFICATION-PROBE (temporary)
const __probeLabel = translateDefault("prices.field.asset");
void __probeLabel;
```

选 `prices.field.asset` 是因为它此刻恰好只有 1 个调用点、且已不在允许清单——加第 2 个调用点就是一个干净的「未获批准的复用」。

**我自己的原始失败输出：**

```text
 ❯ src/test-support/translationKeyUsage.test.ts (1 test | 1 failed) 203ms
     × requires explicit approval before a translation key is reused 202ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/test-support/translationKeyUsage.test.ts > translation key usage > requires explicit approval before a translation key is reused
AssertionError: Translation keys reused without explicit approval:
- prices.field.asset: features/portfolio/ledgerProjection.ts:455, features/prices/PriceForm.tsx:370: expected [ [ 'prices.field.asset', [ …(2) ] ] ] to deeply equal []

- Expected
+ Received

- []
+ [
+   [
+     "prices.field.asset",
+     [
+       "features/portfolio/ledgerProjection.ts:455",
+       "features/prices/PriceForm.tsx:370",
+     ],
+   ],
+ ]

 ❯ src/test-support/translationKeyUsage.test.ts:281:7

 Test Files  1 failed (1)
      Tests  1 failed (1)
```

**守卫变红，且准确指出了两个调用点。**

### 4.4　步骤 ③　决定性反例：把扫描条件退回扩容前，同一违规是否还抓得到

仅把守卫扫描条件从 `["t", "translateDefault"].includes(node.expression.text)` 退回 `node.expression.text === "t"`，**注入的违规原样保留**，再跑：

```text
 FAIL  src/test-support/translationKeyUsage.test.ts > translation key usage > requires explicit approval before a translation key is reused
AssertionError: Stale shared translation-key approvals: expected [ 'backup.markdown.description', …(9) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "backup.markdown.description",
+   "backup.markdown.lineColonSeparator",
+   "backup.markdown.listSeparator",
+   "backup.markdown.summarySeparator",
+   "backup.markdown.unavailable",
+   "backup.preflight.jsonNotParsed",
+   "backup.preflight.jsonSyntaxError",
+   "backup.preflight.versionStageStoppedSuffix",
+   "portfolio.issue.missingCurrentPrice",
+   "portfolio.issue.unsupportedCurrencyMiddle",
+ ]

 ❯ src/test-support/translationKeyUsage.test.ts:282:70
```

**这一步是本次验收里最有信息量的一次运行**，它同时证明了两件事：

1. **281 行的「未获批准的复用」断言通过了**（执行走到了 282 行才失败）。也就是说，**扩容前的守卫对 `translateDefault("prices.field.asset")` 这个违规完全视而不见**。红是扩容带来的，不是原本就有的——`t()` 形式的通电检查证明不了这一点，这一步才能。
2. 报出的 10 条 `staleApprovals` **正好就是本轮新增的那 10 条**，说明这 10 个 key 在全仓**只经由 `translateDefault` 调用、没有任何 `t()` 调用点**。它们此前完全在守卫覆盖范围之外——这也解释了为什么第五处那类缺陷能一路活到第五轮。

### 4.5　步骤 ④　还原与校验

```text
=== SHA-256 AFTER RESTORE ===
654273f1b25b850b50ff2fc0af1c4a3a499530e9e91911519b0c1cf3d9233674  src/features/portfolio/ledgerProjection.ts
aa1919081b7ebfe343348c5a5a08ed485cdd27038e23076d71ec24d9e22c3bcc  src/test-support/translationKeyUsage.test.ts
=== worktree status ===
(空)
=== post-restore guard run ===
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

**SHA-256 与改动前逐字节一致。** worktree 已 `git worktree remove --force` 删除，`git worktree list` 只剩主工作树。

**主工作目录全程零改动**：验收结束时 `git status --porcelain` 输出为空，`HEAD` 仍是 `5c825c23bac5bb120a6b7d59f9f1bebf4f3f8e77`。

### 4.6　守卫仍存在的可绕过写法（G-11，如实记录，**不判 FAIL**）

`09D-2` §5.4 已指出的两种，我在 `5c825c2` 上重新扫了一遍：

| 绕过写法 | 守卫能否抓到 | 当前仓库是否存在实例 |
| --- | --- | --- |
| 成员调用 `obj.t("key")` | 抓不到（要求 `ts.isIdentifier(node.expression)`） | **0 处**（`git grep -nE '\b[A-Za-z_$][A-Za-z0-9_$]*\.t\("'` 无命中） |
| 变量 key `t(someVar)` | 抓不到（要求首参是字符串字面量） | **0 处** |
| 直接两参 `translate(lang, "key")` | 抓不到（标识符名不在白名单） | 非测试源码 **0 处**；仅测试文件 `src/app/i18nMechanism.test.tsx:112,115` 有 2 处 |
| 别名包装 `defaultTranslate("key")` | 抓不到 | **0 处**——`src/features/charts/chartOptionBuilders.ts:37-38` 定义了 `defaultTranslate`，但它只作为默认值传给形参 `t`，实际调用点仍写成 `t("key")`，在守卫覆盖内 |

**结论：这四种盲区当前均无真实实例，守卫的实际覆盖率在本仓库是完整的。** 按合同 G-11，收窄这些盲区非本轮收口条件；建议列入后续批次（尤其 10 批动 `usePersistentLedger.ts` 时，新增代码若引入别名包装会静默逃逸）。

---

## 5　R-3　10 条新增允许清单条目逐条回缝举证（Q-24）

### 5.1　清单条数——我自己数的

方法：从两个 commit 各自抽出 `APPROVED_SHARED_TRANSLATION_KEYS` 数组体，提取字面量后排序去重比较。

```text
c830e79 allowlist count:      117
5c825c2 allowlist count:      126
=== removed ===
prices.field.asset
=== added ===
backup.markdown.description
backup.markdown.lineColonSeparator
backup.markdown.listSeparator
backup.markdown.summarySeparator
backup.markdown.unavailable
backup.preflight.jsonNotParsed
backup.preflight.jsonSyntaxError
backup.preflight.versionStageStoppedSuffix
portfolio.issue.missingCurrentPrice
portfolio.issue.unsupportedCurrencyMiddle
added count:       10
=== dups ===
(无重复)
```

**117 → 126，移除 1 条、新增 10 条，与合同一致，且新增的 10 条与指令列出的 10 条逐条相同。**

### 5.2　逐条回缝核对

对每条，我先用 `git grep -n '"<key>"' 5c825c2 -- src` 取全部调用点，再用 `git show ffbe0ff:<文件>` 取每个调用点在缝上的原文。

---

**① `backup.markdown.description` ＝ `"- 说明："`**

`5c825c2` 调用点（2）：`src/features/backup/backupImportReport.ts:113`、`:178`

```ts
translateDefault("backup.markdown.description") + singleLine(error.message),
translateDefault("backup.markdown.description") + singleLine(detail.message),
```

缝 `ffbe0ff:src/features/backup/backupImportReport.ts`：

```text
106:    `- 说明：${singleLine(error.message)}`,
154:  lines.push(`- 说明：${singleLine(detail.message)}`, "");
```

两处前缀均为 `- 说明：`。**一致 ✓**

---

**② `backup.markdown.lineColonSeparator` ＝ `"："`**

`5c825c2` 调用点（2）：`backupImportReport.ts:57`、`:65`

缝：

```text
56:        `- \`${inline(warning.code)}\`：${singleLine(warning.message)}`,
64:      lines.push(`- \`${inline(check)}\`：${singleLine(reason)}`);
```

两处分隔符均为全角 `：`。**一致 ✓**

---

**③ `backup.markdown.listSeparator` ＝ `"、"`**

`5c825c2` 调用点（3）：`backupImportReport.ts:155`、`:158`、`:244`

缝：

```text
132:      .join("、")}`,
135:      .join("、")}`,
199:    : value.map((symbol) => `\`${inline(symbol)}\``).join("、");
```

三处均为 `、`。**一致 ✓**（3 个调用点对 3 个缝上位置，数量也对得上）

---

**④ `backup.markdown.summarySeparator` ＝ `"；"`**

`5c825c2` 调用点（2）：`backupImportReport.ts:168`、`:224`

缝：

```text
145:      .join("；")}`,
184:  return values.length > 0 ? values.join("；") : "无可安全取得的摘要字段";
```

两处均为 `；`。**一致 ✓**

（近旁风险已排除：缝 159、164 行另有含 `；` 的整句 `"BLOCKED；存在硬错误，不得继续导入。"`、`"预检通过；本报告本身不代表已经写入当前账本文件。"`，它们在 `5c825c2` 上**没有**使用本 key——本 key 在全仓只有上述 2 个调用点。）

---

**⑤ `backup.markdown.unavailable` ＝ `"不可得"`**

`5c825c2` 调用点（3）：`backupImportReport.ts:230`、`:236`、`:241`

缝：

```text
188:  return value === undefined ? "不可得" : singleLine(value);
192:  return value === undefined ? "不可得" : String(value);
196:  if (value === undefined) return "不可得";
```

三处均为 `不可得`。**一致 ✓**

---

**⑥ `backup.preflight.jsonNotParsed` ＝ `"JSON 未解析。"`**

`5c825c2` 调用点（5）：`src/features/backup/backupImportPreflight.ts:200`–`:204`

缝 `ffbe0ff:src/features/backup/backupImportPreflight.ts`：

```text
199:      skipped("backup-envelope", "JSON 未解析。"),
200:      skipped("ledger-structure", "JSON 未解析。"),
201:      skipped("resource-policy", "JSON 未解析。"),
202:      skipped("import-policy", "JSON 未解析。"),
203:      skipped("duplicate-grouping", "JSON 未解析。"),
```

5 处逐字相同（含句末全角句号）。**一致 ✓**

---

**⑦ `backup.preflight.jsonSyntaxError` ＝ `"JSON 语法错误。"`**

`5c825c2` 调用点（5）：`backupImportPreflight.ts:227`–`:231`

缝：

```text
226:      skipped("backup-envelope", "JSON 语法错误。"),
227:      skipped("ledger-structure", "JSON 语法错误。"),
228:      skipped("resource-policy", "JSON 语法错误。"),
229:      skipped("import-policy", "JSON 语法错误。"),
230:      skipped("duplicate-grouping", "JSON 语法错误。"),
```

5 处逐字相同。**一致 ✓**

**这一条我做了额外的近似句排查**——缝上 245／246 行另有两句以「JSON 语法错误」开头但**并不相同**的句子：

```text
245:              ? "JSON 语法错误；解析器没有提供可靠的行列位置。"
246:              : `JSON 语法错误，位置为第 ${location.line} 行、第 ${location.column} 列。`,
```

若这两句被并进本 key，就是第六处缺陷。实测它们在 `5c825c2` 上走的是各自独立的 key，值也逐字保留：

```text
320:  "backup.preflight.jsonLocationUnavailable": "JSON 语法错误；解析器没有提供可靠的行列位置。",
321:  "backup.preflight.jsonLocationPrefix": "JSON 语法错误，位置为第 ",
```

**没有被并 ✓**

---

**⑧ `backup.preflight.versionStageStoppedSuffix` ＝ `" 已在版本阶段停止。"`（注意值以半角空格开头）**

`5c825c2` 调用点（4）：`backupImportPreflight.ts:283`–`:286`，形如 `retiredBackupBoundary + translateDefault(...)`

缝：

```text
276:      skipped("ledger-structure", `${retiredBackupBoundary} 已在版本阶段停止。`),
277:      skipped("resource-policy", `${retiredBackupBoundary} 已在版本阶段停止。`),
278:      skipped("import-policy", `${retiredBackupBoundary} 已在版本阶段停止。`),
279:      skipped("duplicate-grouping", `${retiredBackupBoundary} 已在版本阶段停止。`),
```

缝上模板是「变量 ＋ 空格 ＋ `已在版本阶段停止。`」，`5c825c2` 是「变量 ＋ `" 已在版本阶段停止。"`」，**拼装结果逐字相同**，且 4 处彼此相同。**一致 ✓**

---

**⑨ `portfolio.issue.missingCurrentPrice` ＝ `" 缺少合法当前价格"`（前导空格）**

`5c825c2` 调用点（2）：`src/features/portfolio/ledgerProjection.ts:178`、`src/features/portfolio/pnlSummaryService.ts:128`

缝：

```text
ledgerProjection.ts:172:        message: `${position.assetSymbol} 缺少合法当前价格`,
pnlSummaryService.ts:127:      unrealizedReasons.push(`${position.assetSymbol} 缺少合法当前价格`);
```

两处「变量之后的部分」均为 ` 缺少合法当前价格`。**一致 ✓**

---

**⑩ `portfolio.issue.unsupportedCurrencyMiddle` ＝ `" 使用不支持的计价币种 "`（前后各一个空格）**

`5c825c2` 调用点（3）：`ledgerProjection.ts:166`、`pnlSummaryService.ts:65`、`pnlSummaryService.ts:102`

缝：

```text
ledgerProjection.ts:163:        message: `${position.assetSymbol} 使用不支持的计价币种 ${position.currency}`,
pnlSummaryService.ts:64:      const reason = `${trade.id} 使用不支持的计价币种 ${trade.currency}`;
pnlSummaryService.ts:101:      const reason = `${position.assetSymbol} 使用不支持的计价币种 ${position.currency}`;
```

三处中段均为 ` 使用不支持的计价币种 `（前后空格一致）。注意左侧变量三处并不相同（`assetSymbol` / `trade.id` / `assetSymbol`），但**被复用的只是中段常量**，不涉及变量。**一致 ✓**

---

### 5.3　R-3 小结

**10 条全部核对完毕，缝上调用点原文逐条一致，未发现第六处缺陷。**

其中指令注明「产品负责人已抽验 5 条」的那 5 条我重新独立核了一遍，结论相同；**此前无人核过的另 5 条**（`backup.markdown.description`、`lineColonSeparator`、`listSeparator`、`summarySeparator`、`backup.preflight.jsonSyntaxError`）也全部一致。

顺带针对 `09D-2` §5.3 对旧 117 条清单的「照现状抄名单」定性：本轮新增的 10 条注释与我核到的事实是**吻合**的（例如 `backup.markdown.description` 注释写「both use the original "- 说明：" label」，缝上确实两处都是 `- 说明：`），不再出现 `prices.field.asset` 那种注释与事实相反的情况。**但我只核了新增的 10 条，旧 116 条未逐条重核**——见第 10 节。

---

## 6　R-4　增量 AST 复核（Q-26）＋ 全部闸门（Q-27）

### 6.1　增量复核方法（我实际用的）

`c830e79 → 5c825c2` 只有 +23/−4，我用两条相互独立的机械比对把「渲染出的中文」这一层封死：

**方法 A——文案表全量键值比对。** 从两个 commit 各自抽出 `i18n.tsx` 里所有 `^  "key": value` 行，排序后 `diff`：

```text
c830e79 entries:      710
5c825c2 entries:      711
=== i18n key:value diff c830e79 -> 5c825c2 ===
594a595
>   "prices.field.assetSymbolLabel": "资产",
```

**全表唯一变化是新增一行，没有任何既有键的值被改动。** （710/711 是三张表 `chineseMessages`／`englishMessages`／`hungarianMessages` 的合计行数，我用的是全文件口径，比只看中文表更严。）

补充确认：`englishMessages`（`i18n.tsx:712`）与 `hungarianMessages`（`:750`）都是**部分覆盖表**，只含 `home.*`／`settings.language.*`，完全不含 `prices.field.*`。因此只往中文表加键不会造成键集失衡，回退路径不变。

**方法 B——调用侧全量 diff。** `git diff c830e79..5c825c2` 显示非测试源码只改了一行：

```diff
-    assetSymbol: t("prices.field.asset"),
+    assetSymbol: t("prices.field.assetSymbolLabel"),
```

A ＋ B 合起来即：**本增量在整个应用中造成的「渲染中文」变化有且只有一处**，就是 §3.2 表格里那一格，且方向是**从被改写状态复原回缝上原文**。除此之外零变化。

第三个改动文件 `translationKeyUsage.test.ts` 是守卫自身，不含任何面向用户的文案。

**接续关系**：`09D-2` 已完成 `ffbe0ff → c830e79` 全仓比对（结论：唯一缺陷 `prices.field.asset`），本节完成 `c830e79 → 5c825c2` 增量比对（结论：仅该缺陷被复原）。两段首尾相接，**因此「`ffbe0ff → 5c825c2` 全仓中文逐字不变」成立——但这个结论有一半是继承 `09D-2` 的，不是我自己跑的，见第 9、10 节。**

### 6.2　全部闸门原始输出（我自己跑的，含 `build`）

命令逐字照抄指令，未凭记忆构造路径。顺序：`build` 在 `typecheck` 之前串行。

**① `npm test`**

```text
 Test Files  107 passed (107)
      Tests  1186 passed (1186)
   Start at  15:51:21
   Duration  34.64s (transform 5.13s, setup 11.67s, import 13.72s, tests 108.40s, environment 18.71s)

EXIT=0
```

（运行中有若干 `Warning: --localstorage-file was provided without a valid path` 的 node 警告，属既有噪声，不影响结果。）

**② `npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts`**

```text
 RUN  v4.1.9 /Users/zhuzhen0131/.../LocalFirstTradingLedger

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  15:51:56
   Duration  1.68s (transform 74ms, setup 0ms, import 95ms, tests 1.53s, environment 0ms)

EXIT=0
```

**③ `npm run build`（产品负责人本轮未跑过，此为第一次第二人复核）**

```text
   Creating an optimized production build ...
 ✓ Compiled successfully in 1226ms
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

**build 通过。** 以上尺寸数字是我这次实测的原始输出，我**没有**与 `09C-2` 的数字做过比对（见第 10 节）。

**④ `npm run typecheck`**

```text
> local-first-trading-ledger@0.1.0 typecheck
> tsc --noEmit

EXIT=0
```

无输出，exit 0。

**⑤ `npm run lint`**

```text
> local-first-trading-ledger@0.1.0 lint
> eslint . --max-warnings=0

EXIT=0
```

无输出，exit 0。

**⑥ `npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts`**

```text
 Test Files  2 passed (2)
      Tests  8 passed (8)
   Start at  15:52:09
   Duration  1.01s (transform 145ms, setup 198ms, import 142ms, tests 714ms, environment 0ms)

EXIT=0
```

**⑦ `git diff --check` / ⑧ `git diff origin/main...5c825c2 --check`**

```text
########## git diff --check
EXIT=0
########## git diff origin/main...5c825c2 --check
EXIT=0
```

两项均无输出。

### 6.3　与参考值对照

| 项 | 指令给的参考值 | 我实测 | 是否吻合 |
| --- | --- | --- | --- |
| 全量 | 107 files / 1186 tests | 107 / 1186 | ✓ |
| 冻结派生快照 | 1 file / 7 tests | 1 / 7 | ✓ |
| 结构守卫 | 2 files / 8 tests | 2 / 8 | ✓ |
| 两项 whitespace | 均为空 | 均为空 | ✓ |
| typecheck / lint | 无输出 exit 0 | 无输出 exit 0 | ✓ |
| build | **未测** | **通过，exit 0** | 本报告首次补上 |

**8 条闸门全绿，无一变红。**

---

## 7　停止条件逐条核对

| 停止条件 | 是否触发 |
| --- | --- |
| ① 发现任何新的中文被改写 | **否**（§6.1 方法 A/B） |
| ② 10 条新增清单有任一条缝上原文不一致（第六处缺陷） | **否**（§5.2 逐条） |
| ③ `prices.field.asset` 的值被改动（违反 F-7） | **否**（§3.3） |
| ④ 通电检查证明守卫不会因 `translateDefault` 形式复用变红 | **否**——恰恰相反，§4.3 证明会红，§4.4 证明扩容前不会红 |
| ⑤ 改动范围超出那三个文件 | **否**（§2） |
| ⑥ 任何闸门变红 | **否**（§6.2） |

**六条停止条件均未触发。**

---

## 8　按指令跳过的四项

以下四项**按指令跳过，我没有做，不声称已验**。三条依赖的共同前提是 §2 的 `git diff --name-only c830e79..5c825c2`，我已实跑，输出为那三个文件，**前提成立**。

| 跳过项 | 指令给的理由 | 我对前提的验证 |
| --- | --- | --- |
| `ffbe0ff → 5c825c2` 全仓 AST 比对 | `09D-2` 已完成 `ffbe0ff → c830e79` 全仓比对，本轮增量仅三文件 | 增量仅三文件 ✓（§2）。**但「`09D-2` 那次全仓比对本身做得对不对」我没有复核**，见第 10 节 |
| 用例全名比对 | `09D-2` 已用三种口径比对且 diff 全空；本轮唯一测试文件改动是守卫自身，用例数 1186 未变 | 改动文件中唯一测试文件是 `src/test-support/translationKeyUsage.test.ts`（守卫自身）✓；我实测用例数 **1186**，与参考值一致 ✓ |
| 四个版本号复核 | 本轮三个文件均不含版本号定义处 | 三个文件为 `PriceForm.tsx`／`translationKeyUsage.test.ts`／`i18n.tsx`，`git diff` 全文我已通读，未见版本号定义或改动 ✓ |
| `core`／`platform` 零改动核对 | 本轮 `git diff --name-only` 不含这两个目录 | 三个文件路径均在 `src/features/`、`src/test-support/`、`src/ui/` 下，不含 `core`／`platform` ✓ |

R-1～R-4 四项**一项未跳**。唯一留待后续的是 G-11 的守卫盲区收窄（§4.6），按合同非本轮收口条件。

---

## 9　我这套方法的盲区——它证明不了什么

如实声明，请裁决时把这些一并计入：

1. **我没有从缝开始重跑全仓比对。** 「全仓中文逐字不变」这个结论的前半段（`ffbe0ff → c830e79`）是**继承 `09D-2` 的**。如果 `09D-2` 那次 286 个调用点的回填重建本身漏了某处，我这次不会发现。本报告只能证明「相对 `c830e79` 没有新增改写」，加上「第五处已复原」。

2. **我只核了新增的 10 条清单条目，旧的 116 条没有逐条重核。** `09D-2` 已把旧清单定性为「照现状抄的名单」，那批条目的可信度依然继承自 `09D-2` 的全仓扫描，不是我核出来的。

3. **`09A` Q-2 的教训在这里同样成立**：本报告任何一处都**没有**用「测试全绿」当作「中文没被改坏」的证据。我用的是「缝上原文 ↔ 当前渲染」的直接文本比对。反过来说，**闸门全绿这件事本身，对文案正确性零证明力**，请不要把 §6.2 当成文案证据。

4. **第五处缺陷至今仍零测试覆盖。** `git grep '不能为空或格式不正确' -- src` 在 `5c825c2` 上只命中 `i18n.tsx` 的两处定义（`prices.validation.invalidInputSuffix` 与 `trades.form.error.invalidInput`），**没有任何测试断言过 `资产不能为空或格式不正确` 这个渲染结果**。也就是说，今天这个修复正确，但明天有人把它改回去，全量 1186 条测试仍会全绿。§3.2 的运行时探针是我临时写的，**没有留在仓库里**（按硬规矩不得改动源码/测试）。**建议后续补一条断言**——这是防止第五处复发的唯一实质手段。

5. **通电检查只覆盖了「未获批准的复用」这半边断言。** 我用 `translateDefault` 形式证明了 281 行断言会红；`staleApprovals`（282 行）那半边我没有单独造反例通电（§4.4 里它是作为副产物变红的，不是我刻意设计的探针）。

6. **守卫的语义边界**：它检查的是「同一个 key 被调用两次以上」，**不检查 key 对应的中文与缝上是否一致**。也就是说，如果有人给两处原文不同的地方各建一个 key，但把值填错，守卫不会响。守卫防的是「复用导致覆盖」，不是「文案写错」。

7. **`build` 产物我只确认了 exit 0 与路由表**，没有解包 chunk 去核对里面的中文字符串。

---

## 10　边界确认

- **没有 `git push`。** 全程未执行任何 push。
- **没有合并到 `main`。** 未执行任何 merge/rebase。
- **没有修改任何源码或测试。** 通电检查全部在 scratchpad 的临时 detached worktree 中进行，改动两个文件后已还原并核对 SHA-256 逐字节一致，worktree 已删除。
- **主工作目录 clean**：源码仓库 `git status --porcelain` 输出为空，`HEAD = 5c825c23bac5bb120a6b7d59f9f1bebf4f3f8e77`，`git worktree list` 只剩主工作树。（`npm run build` 产生的 `.next/` 已被 gitignore，未污染工作区。）
- **没有读取** `/Users/zhuzhen0131/Downloads/history_OKX/`，没有打开任何真实 `.lftl` 或真实备份文件。
- **没有改写任何既有报告。** `09C`／`09C-2`／`09D`／`09D-2` 一字未动，本报告为新建文件。
- **两个仓库未混提交。** 我未在任一仓库执行 commit。根文档仓库当前有一个来自并行会话的未跟踪文件 `04_DEIK-AI-Challenge-2026/02-Idea赛-视频脚本-v2.md`，**不是我创建的，我也未触碰**；全程未遇到 `.git/*.lock` 冲突。

---

## 11　未核验事项清单（如实列出，不用别的数字顶替）

1. **`ffbe0ff → c830e79` 的全仓 AST 比对结论**——继承 `09D-2`，我未复核。含其「67 条候选 / 46 个差异区段 / 127 个复用 key / 286 个调用点」这组数字，**我一个都没有复算**。
2. **旧 116 条允许清单条目的回缝理由**——未逐条重核。
3. **`09C-2` 执行报告中的任何数字**——我通篇未采信、也未做逐项比对，包括其 build 输出。§6.2 ③ 的尺寸数字是我这次实测的原始值，**与 `09C-2` 是否一致，未比对**。
4. **四个版本号的实际值**——按指令跳过，未核。
5. **`core`／`platform` 目录内容**——按指令跳过，未核（仅确认本轮 diff 不含这两个目录）。
6. **用例全名清单**——按指令跳过，未做名称级比对；仅确认总数 1186 与参考值一致。
7. **`staleApprovals` 断言的独立通电反例**——未单独设计，见 §9.5。
8. **`en`／`hu` 两张翻译表的完整性**——仅确认它们不含 `prices.field.*`，未做整表回缝核对（本批不涉及）。
9. **守卫扫描是否遗漏了 `src` 之外的目录**——`SRC_ROOT` 固定为 `src/`，`benchmarks/`、`scripts/` 等目录若含文案调用点则不在守卫覆盖内，我未逐一排查。

---

## 12　给裁决者的一句话

第五轮我查空了，**和 Codex 的自查结论一致，但结论是各自独立得出的**。

四轮以来第一次出现「两方独立核对、都没挖到新东西」，且这次的通电检查不只证明了守卫会红，还顺带证明了**扩容前它对这 10 个 key 完全失明**——这解释了这条矿脉为什么能藏到第五轮，也说明这一次是真的把入口堵上了，不是运气。

**我的判断：09 批可以收口合入。** 唯一我想强调的遗留项不是缺陷，是 §9.4——**第五处至今零测试覆盖**，建议在合入前后补一条断言，否则今天修好的字明天能被无声改回去，而全量测试依然全绿。
