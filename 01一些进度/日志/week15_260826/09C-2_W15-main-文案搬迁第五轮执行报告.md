# 09C-2_W15-main｜文案搬迁第五轮执行报告

日期：2026-09-02  
状态：完成本轮开发收口；未合入、未 push

## 结论

在源码仓库 `01一些进度/产出/LocalFirstTradingLedger/` 的 `zhennn/w15-main-app-split` 分支上，从 `c830e79` 接续完成两笔提交：`a943f0b fix: restore asset validation wording` 与 `5c825c2 test: guard translateDefault key reuse`。

第五处已把价格表单校验字段恢复为缝 `ffbe0ff` 的“资产”，可见标签仍为正确的“价格资产”。翻译 key 复用守卫现同时扫描 `t("...")` 与 `translateDefault("...")`；新增的 10 条允许项均逐条回到缝上核对，未发现第六处。全部合同闸门通过。

## 范围与提交

源码工作树：`01一些进度/产出/LocalFirstTradingLedger/`  
分支：`zhennn/w15-main-app-split`  
起点：`c830e791077e36d9479e2e4589ec36d0a5298520`

| SHA | 标题 | 改动 |
| --- | --- | --- |
| `a943f0b` | `fix: restore asset validation wording` | 新增 `prices.field.assetSymbolLabel = "资产"`，只替换校验字段调用；保留 `prices.field.asset = "价格资产"`，并移除其过期允许项。 |
| `5c825c2` | `test: guard translateDefault key reuse` | 将 AST 扫描条件扩至 `t` 与 `translateDefault`，加入经缝上举证的 10 条允许项。 |

`c830e79..HEAD` 的变更文件原始输出：

```text
src/features/prices/PriceForm.tsx
src/test-support/translationKeyUsage.test.ts
src/ui/i18n.tsx
```

未修改既有断言结构或阈值；`unapprovedKeys` 与 `staleApprovals` 两条断言保持原样。未 push、未合并到 `main`，未访问真实数据区。

## Q-22：第五处逐字复原

缝上依据命令：`git show ffbe0ff:src/features/prices/PriceForm.tsx`。

| 位置 | 缝 `ffbe0ff` 原文 | 修复前渲染 | 修复后渲染 |
| --- | --- | --- | --- |
| `fieldLabels.assetSymbol`（缝上第 53 行；现校验错误字段） | `资产` | `价格资产` | `资产` |
| JSX 标签（缝上第 362 行；现第 370 行） | `价格资产` | `价格资产` | `价格资产` |

第一行通过专用 key `prices.field.assetSymbolLabel` 取值“资产”；第二行继续使用原 key `prices.field.asset`，其值未改。故校验提示恢复为“资产不能为空或格式不正确”，而标签继续为“价格资产”。

## Q-23、Q-25：守卫扩容与通电检查

扫描条件由：

```ts
node.expression.text === "t"
```

改为：

```ts
["t", "translateDefault"].includes(node.expression.text)
```

`prices.field.asset` 已从 `APPROVED_SHARED_TRANSLATION_KEYS` 移除；它在修复后仅有 JSX 处一个 `t()` 调用，最终守卫通过，故 `staleApprovals` 同时通过。

通电检查在临时 worktree `/private/tmp/lftl-translation-guard.9z0YGh` 完成。该 worktree 载入第二笔候选守卫后，临时在 `src/app/usePersistentLedger.ts` 的既有单调用 key `persistence.externalChange` 旁加入第二个合法语法调用：

```ts
void translateDefault("persistence.externalChange");
```

执行 `./node_modules/.bin/vitest run src/test-support/translationKeyUsage.test.ts` 的原始失败输出：

```text
 RUN  v4.1.9 /private/tmp/lftl-translation-guard.9z0YGh

 ❯ src/test-support/translationKeyUsage.test.ts (1 test | 1 failed) 191ms
     × requires explicit approval before a translation key is reused 190ms

 FAIL  src/test-support/translationKeyUsage.test.ts > translation key usage > requires explicit approval before a translation key is reused
AssertionError: Translation keys reused without explicit approval:
- persistence.externalChange: app/usePersistentLedger.ts:63, app/usePersistentLedger.ts:581
```

移除这行后，`src/app/usePersistentLedger.ts` 的 SHA-256 在前后均为：

```text
e041bad841aa722ac56a03569e2c7e72504c5a1f8b1b01c46fb9efd7f52c7b98  src/app/usePersistentLedger.ts
```

恢复后的同一守卫原始输出：

```text
 RUN  v4.1.9 /private/tmp/lftl-translation-guard.9z0YGh

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  14:56:01
   Duration  462ms (transform 81ms, setup 83ms, import 127ms, tests 194ms, environment 0ms)
```

临时 worktree 已用 `git worktree remove --force` 删除。主工作目录在清理后仅保留第二笔候选的 `src/test-support/translationKeyUsage.test.ts`，提交后源码工作树 clean。

## Q-24：新增允许项的缝上逐条举证

取证方法：对每个守卫新增项，使用 `git show ffbe0ff:<文件>` 读取**全部**当前调用点对应的缝上原文。下表中的行号均为缝 `ffbe0ff` 文件行号；同一行内的插值变量不改变列出的中文原文。

| 新增 key | 缝上全部调用点原文 |
| --- | --- |
| `backup.markdown.description` | `src/features/backup/backupImportReport.ts:106` 为 ``- 说明：${singleLine(error.message)}``；`:154` 为 ``- 说明：${singleLine(detail.message)}``。 |
| `backup.markdown.lineColonSeparator` | `backupImportReport.ts:56` 为 ``- \`${inline(warning.code)}\`：${singleLine(warning.message)}``；`:64` 为 ``- \`${inline(check)}\`：${singleLine(reason)}``。 |
| `backup.markdown.listSeparator` | `backupImportReport.ts:132`、`:135`、`:199` 均为 `.join("、")`。 |
| `backup.markdown.summarySeparator` | `backupImportReport.ts:145` 与 `:184` 均为 `.join("；")`。 |
| `backup.markdown.unavailable` | `backupImportReport.ts:188`、`:192`、`:196` 均为 `"不可得"`。 |
| `backup.preflight.jsonNotParsed` | `src/features/backup/backupImportPreflight.ts:199`、`:200`、`:201`、`:202`、`:203` 均为 `"JSON 未解析。"`。 |
| `backup.preflight.jsonSyntaxError` | `backupImportPreflight.ts:226`、`:227`、`:228`、`:229`、`:230` 均为 `"JSON 语法错误。"`。 |
| `backup.preflight.versionStageStoppedSuffix` | `backupImportPreflight.ts:276`、`:277`、`:278`、`:279` 均为 ``${retiredBackupBoundary} 已在版本阶段停止。``。 |
| `portfolio.issue.missingCurrentPrice` | `src/features/portfolio/ledgerProjection.ts:172` 与 `src/features/portfolio/pnlSummaryService.ts:127` 均为 ``${position.assetSymbol} 缺少合法当前价格``。 |
| `portfolio.issue.unsupportedCurrencyMiddle` | `ledgerProjection.ts:163`、`pnlSummaryService.ts:64`、`:101` 分别为 ``${position.assetSymbol} 使用不支持的计价币种 ${position.currency}``、``${trade.id} 使用不支持的计价币种 ${trade.currency}``、``${position.assetSymbol} 使用不支持的计价币种 ${position.currency}``。 |

上述 10 项的每个缝上调用点中文均一致；没有触发 G-8 的第六处停止条件。

## Q-26：全部收口闸门原始输出

`npm test`（Node 同时输出多条既有 `--localstorage-file` 无有效路径 warning；命令退出码为 0）：

```text
> local-first-trading-ledger@0.1.0 test
> vitest run

 RUN  v4.1.9 /Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路/01一些进度/产出/LocalFirstTradingLedger

 Test Files  107 passed (107)
      Tests  1186 passed (1186)
   Start at  14:56:40
   Duration  34.34s (transform 4.99s, setup 11.33s, import 12.44s, tests 105.10s, environment 17.53s)
```

`npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts`：

```text
 RUN  v4.1.9 /Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路/01一些进度/产出/LocalFirstTradingLedger

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  14:57:20
   Duration  1.68s (transform 71ms, setup 0ms, import 91ms, tests 1.50s, environment 0ms)
```

`npm run build`：

```text
> local-first-trading-ledger@0.1.0 build
> next build

   ▲ Next.js 15.5.22

   Creating an optimized production build ...
 ✓ Compiled successfully in 2.5s
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
```

按合同顺序，以下 `typecheck` 在 build 之后执行：

```text
> local-first-trading-ledger@0.1.0 typecheck
> tsc --noEmit
```

`npm run lint`：

```text
> local-first-trading-ledger@0.1.0 lint
> eslint . --max-warnings=0
```

`npx vitest run src/test-support/sourceLayout.test.ts src/test-support/interfaceWording.test.ts`：

```text
 RUN  v4.1.9 /Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路/01一些进度/产出/LocalFirstTradingLedger

 Test Files  2 passed (2)
      Tests  8 passed (8)
   Start at  14:57:53
   Duration  1.01s (transform 136ms, setup 194ms, import 135ms, tests 727ms, environment 0ms)
```

`git diff --check`：

```text
(empty)
```

`git diff origin/main...HEAD --check`：

```text
(empty)
```

## Q-27：本轮中文改写自查

方法：执行 `git diff --name-only c830e79..HEAD` 确认仅三个允许文件；再执行：

```text
git diff --unified=0 c830e79..HEAD -- src | rg -n '^[+-].*[\p{Han}]' || true
```

原始输出：

```text
13:+  // Backup report detail lines both use the original "- 说明：" label.
44:+  "prices.field.assetSymbolLabel": "资产",
```

结果：唯一产品渲染文字增量是专用 key 的“资产”，它已在 Q-22 与缝上原文逐字比对；另一处是测试守卫英文注释中引用的中文标签，非产品渲染。没有删改其他中文渲染文本，故本轮自查未发现新的中文改写。全量 AST 回填复核仍属于独立验收方工作，本报告未把本自查冒充为该复核。

## 未完成事项

- G-11 的另两种非收口盲区（成员调用 `obj.t("key")`、变量 key `t(someVar)`）未处理；合同允许该项留待后续，本轮没有借此扩大改动范围。
- 本报告是根文档仓库的新未提交文件；源码两笔提交已完成。未 push，未合入 `main`。
