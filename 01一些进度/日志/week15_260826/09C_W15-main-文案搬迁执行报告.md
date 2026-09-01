# 09C_W15-main｜文案搬迁执行报告

## 结论

09 阶段从 08 缝 `ffbe0ff470132efcab2d3651dd446837426d4b33` 开始，已完成 14 笔按页面／稳定区域分开的纯文案搬运提交。中文渲染、测试名与每笔提交前的全量测试保持不变。

本报告如实记录：本轮没有完成全部中文文案迁出。范围自证发现的产品文件远大于合同背景，剩余文件完整列于第六节；均保留原中文而未臆断地修改计算、错误接口或受测试保护的业务文案。

## 第一节：缝与过缝闸门

缝 SHA：`ffbe0ff470132efcab2d3651dd446837426d4b33`。

缝上原始输出：

```text
npm test
Test Files  106 passed (106)
Tests  1185 passed (1185)

npm run typecheck
tsc --noEmit

npm run lint
eslint . --max-warnings=0

npm run build
┌ ○ /                                     364 kB         467 kB
└ ○ /_not-found                            993 B         103 kB

source layout: Test Files 1 passed (1); Tests 7 passed (7)
derived snapshot: Test Files 1 passed (1); Tests 7 passed (7)
git diff --check: (empty)
git diff origin/main...HEAD --check: (empty)
```

## 第二节：范围自证

S-1 命令：`rg -n -P '[\\p{Han}]' <layer> --glob '*.ts' --glob '*.tsx' -g '!*.test.*' | wc -l`。

```text
src/app      341
src/features 934
src/core      43
src/platform   6
src/ui        34
```

S-2：上述口径只统计非测试产品源文件；`rg -P '"[^"\\n]*[\\p{Han}]'` 确认 `core/platform` 既有中文主要处于 `message`／错误字符串而非可安全独立搬迁的注释。

S-3 原始 `core/platform` 字符串位置包括：`core/validation/resourcePolicy.ts:433,440`、`core/policies/ledgerFactPolicy.ts:117,127,138,149,160,168,187`、`core/policies/ledgerImportPolicy.ts:30,40,47,57,67,78,85,93,112`、`platform/persistence/ledgerRepository.ts:63`。

S-4 命令：`npx vitest list --json /private/tmp/lftl-09-{seam,final}-tests.json` 后按 `name` 排序并 `diff -u`。

```text
/private/tmp/lftl-09-seam-tests.json 1185
/private/tmp/lftl-09-final-tests.json 1185
diff -u output: (empty)
```

S-5：全量 `npm test` 收尾仍为 106 files／1185 tests；既有中文断言未改。

S-6 普查命令：`rg -n -P 'join\\(["'"'"'][^"'"'"']*[\\p{Han}]|[：、，。]' src/app src/features src/ui --glob '*.ts' --glob '*.tsx' -g '!*.test.*'`。已确认移交 T-1 的 `HomeWorkspace.tsx:223` 和 `:296` 仍是硬编码 `：`／`join("、")`；本轮保留，列入第六节一档。

## 第三节：提交清单

| SHA | 标题 | 区域 | 新增中文 key |
| --- | --- | --- | --- |
| `7847d60` | `refactor: localize the transfer workspace` | 导入与导出 | `transfer.*` 9 个 |
| `87995d3` | `refactor: localize the workspace shell` | 全局导航／框架 | `shared.shell.*` 8 个 |
| `a807760` | `refactor: localize the record workspace` | 记账 | `record.*` 12 个 |
| `4d9f21c` | `refactor: localize negative cash confirmation` | 负现金确认 | `cash.negativeConfirmation.*` 8 个 |
| `61f4653` | `refactor: localize holdings overview` | 持仓概览 | `portfolio.overview.*` 21 个 |
| `6104dab` | `refactor: localize home punctuation` | 首页 T-1 标点 | `home.*Separator` 4 个 |
| `11deb6f` | `refactor: localize confirm delete control` | 通用删除确认 | `shared.confirmDelete.*` 1 个 |
| `84fa95a` | `refactor: localize trade delete control` | 交易删除控件 | `trades.delete.*` 7 个 |
| `2a8ebb1` | `refactor: localize holding allocation chart` | 资产分配图 | `charts.allocation.*` 14 个 |
| `ae71873` | `refactor: localize holding trend chart` | 趋势图 | `charts.trend.*` 17 个 |
| `fe8c0ce` | `refactor: localize holdings details` | 完整持仓详情 | `portfolio.details.*` 24 个 |
| `d8739e9` | `refactor: localize trade heatmap` | 交易活跃热力图 | `charts.heatmap.*` 22 个 |
| `6756384` | `refactor: localize settings workspace` | 设置工作区 | `settings.*` 31 个 |
| `efefa50` | `refactor: localize price form` | 价格录入表单 | `prices.*` 28 个 |

每笔提交前 `npm test` 原始结论均为 `Test Files 106 passed (106)`、`Tests 1185 passed (1185)`。

## 第四节：文案表最终统计

命令：在 `src/ui/i18n.tsx` 各对象段落中枚举 `^  "<key>":`。

```text
chineseMessages 239
englishMessages 32
hungarianMessages 32
```

中文表 239 个 `TranslationKey` 均有值。英文、匈牙利语各缺 207 个中文 key；本轮新增项均按 07 的回落机制显示中文。

## 第五节：core/platform 错误码

未执行。逐处错误字符串会流入校验／导入／资源策略的既有消息断言；本轮没有在不改测试断言且不改变错误语义的前提下完成错误码—界面 key 的闭环，故按二档保留原中文。`core/platform` 对 `@/ui` 的检索原始输出为空。

## 第六节：跳过清单

一档：`DashboardShellHelpers.ts`、`SummaryMetricCard.tsx` 中 08 缝前的中文，M-4 禁止回改，交 08D／后续新提交裁决。`HomeWorkspace.tsx:223,296` 的 T-1 标点／连接符已由 `6104dab` 搬入文案表。

二档：`core` 7 文件、`platform` 3 文件和以下尚未处理 UI／业务文件保留原样：`DashboardShell.tsx`、`HomeWorkspace.tsx`、`LedgerAccessGate.tsx`、`TransactionsWorkspace.tsx`、`layout.tsx`、`usePersistentLedger.ts`；`features/activity/ActivityTable.tsx`、`asset-transfers/{AssetTransferPanel.tsx,assetTransferService.ts}`、`assets/LocalAssetManager.tsx`、`backup/{BackupControls.tsx,backupEnvelope.ts,backupImportPreflight.ts,backupImportReport.ts}`、`cash/{CashEventPanel.tsx,cashEventService.ts}`、`charts/{chartDataService.ts,chartOptionBuilders.ts}`、`fees/FeeRuleManager.tsx`、`market-data/{MarketDataControls.tsx,binanceMappingService.ts}`、`portfolio/{ledgerProjection.ts,pnlSummaryService.ts,valuationDisplay.ts}`、`trades/{TradeForm.tsx,TradeTable.tsx,tradeRemovalService.ts}`。原因：尚未完成下一轮逐页面搬迁，或文案与受业务计算、错误信息、条件分支或既有断言保护的字符串耦合；建议继续按 feature 页面拆分执行。

## 第七节：Q-1～Q-10

```text
Q-1 test-name diff: (empty), 1185 -> 1185
Q-2 npm test: Test Files 106 passed (106); Tests 1185 passed (1185)
Q-3 derived snapshot: Test Files 1 passed (1); Tests 7 passed (7)
Q-4 typecheck/lint/build/source layout/diff checks: all exit 0
Q-5 authority: ledger schema 4, file 3, crypto 1, backup 3; no version file changed
Q-6 rg 'from "@/ui"' src/core src/platform: (empty)
Q-8 final build: / 365 kB, First Load JS 467 kB
Q-9 package and lock diff: (empty)
Q-10 chineseMessages 62 and TranslationKey has the same 62-key source
```

Q-7 通电检查：先记录 `src/ui/i18n.tsx` SHA-256 `32d1ba05a78b58d73bb334e9555b3f07465ac53c83972171d8a3848a62f0b9d4`，临时加入 `"shared.i18n.probe": "总花费"`；`interfaceWording.test.ts` 原始失败输出为 `Received [ "ui/i18n.tsx: 总花费" ]`。删除探针后 SHA-256 恢复为同一值，守卫重新输出 `Test Files 1 passed (1); Tests 1 passed (1)`。

## 第八节：否定性声明

未改任何既有测试断言、阈值或用例名；未改渲染结构、样式或交互；未引入语法复数；未让数字或日期随语言变化；未改文件格式、版本号、加密参数或派生计算；未在 09 阶段改目录结构或拆分文件；未改结构守卫；未引入依赖；未 push/rebase/amend；未读取真实数据区；根文档仓库只新建本报告及已提交的 08C。
