# 07C_W15-main｜多语言机制执行报告

- 日期：2026-09-01
- 源码基线：`main@755b4bd`
- 执行分支：`zhennn/w15-main-i18n-mechanism`
- 候选提交：`0a3f5e0`
- 结论：**开发执行 PASS；候选未合入、未推送，等待独立验收 `07D`**

## 结论

本批只建立多语言机制并以首页示范，没有搬运首页以外文案。阶段〇实际修复 15 处产品代码中未指定语言的 `localeCompare`；随后建立中／英／匈文案表、`t()`、唯一语言 Context、测试中文钉死与复位机制，在设置页加入语言开关，并把 `HomeWorkspace` 全部直接文案接入机制。数字显示改为普通空格 U+0020 千分位与点小数点，`.ledger-numeric` 以 `white-space: nowrap` 防止金额跨行折断。

最终默认全量为 106 files／1185 tests，冻结派生快照 7/7，T-A1～T-A8、typecheck、lint、production build、结构守卫和两项 whitespace 检查全部通过。四个版本号相对开工基线不变，文件格式、加密参数与派生计算未改。

源码提交链：

| 提交 | 内容 |
| --- | --- |
| `5fadf30` | `fix: make ASCII sorting deterministic` |
| `b7e2263` | `feat: add ledger language foundation` |
| `4d20d87` | `feat: add settings language selector` |
| `10eba0b` | `feat: localize home workspace` |
| `8f9bc60` | `feat: use locale-neutral number separators` |
| `4ff49a7` | `test: scan UI translation wording` |
| `78fb0ea` | `test: enforce language mechanism contracts` |
| `0a3f5e0` | `test: keep ledger numbers unbroken` |

## R-1／R-14：阶段〇范围自证

检索命令：

```bash
rg -n 'localeCompare\(' src --glob '*.{ts,tsx}'
```

开工原始输出：

```text
src/test-support/sourceLayout.test.ts:397:    sourcePath(left[0]).localeCompare(sourcePath(right[0])),
src/features/backup/backupDuplicateGrouping.ts:291:    left.relation.localeCompare(right.relation)
src/features/backup/backupImportPreflight.ts:947:    left.path.localeCompare(right.path, "en", { numeric: true }) ||
src/features/backup/backupImportPreflight.ts:948:    left.code.localeCompare(right.code)
src/features/portfolio/ledgerProjection.ts:444:    left.localeCompare(right),
src/features/activity/activityService.ts:81:  if (leftDate !== rightDate) return leftDate.localeCompare(rightDate);
src/features/activity/activityService.ts:93:  return left.id.localeCompare(right.id, "en");
src/features/market-data/binanceMappingService.ts:95:    .sort((left, right) => left.localeCompare(right));
src/features/market-data/binanceMappingService.ts:106:    (left, right) => left.localeCompare(right),
src/features/trades/TradeForm.tsx:351:  ).sort((left, right) => left.localeCompare(right));
src/features/charts/chartDataService.ts:196:  return left.assetSymbol.localeCompare(right.assetSymbol);
src/features/charts/chartDataService.ts:570:  const assetOrder = left.assetSymbol.localeCompare(right.assetSymbol);
src/features/charts/chartDataService.ts:743:          .sort((left, right) => left.localeCompare(right))[0]
src/features/portfolio/pnlSummaryService.ts:219:        left.localeCompare(right),
src/features/portfolio/HoldingsOverview.tsx:22:        ? left.assetSymbol.localeCompare(right.assetSymbol)
src/app/TransactionsWorkspace.tsx:544:    .sort((left, right) => left.localeCompare(right));
src/core/calculations/cashReplay.ts:102:    return leftDate.localeCompare(rightDate);
src/core/calculations/cashReplay.ts:120:  return left.id.localeCompare(right.id, "en");
src/core/shared/ledgerDate.ts:83:    return leftDate.localeCompare(rightDate);
```

19 行中，3 行产品代码已经显式指定 `"en"`，1 行属于测试结构守卫；其余 **15 行产品代码**均为本阶段范围。实际处理清单：

| 区域 | 位置 |
| --- | --- |
| core | `cashReplay.ts`、`ledgerDate.ts` |
| features/backup | `backupDuplicateGrouping.ts`、`backupImportPreflight.ts` |
| features/activity | `activityService.ts` |
| features/portfolio | `ledgerProjection.ts`、`pnlSummaryService.ts`、`HoldingsOverview.tsx` |
| features/market-data | `binanceMappingService.ts` 两处 |
| features/trades | `TradeForm.tsx` |
| features/charts | `chartDataService.ts` 三处 |
| app | `TransactionsWorkspace.tsx` |

这些比较对象均为 ISO 日期、资产代号、路径、relation 或技术 id 等纯 ASCII，统一改成 `<`／`>` 三路比较，没有引入语言排序。与 `07A` 背景记录的 14 处相比多 1 处，来自 06 批后基线新增的 `pnlSummaryService.ts`；按修订 A 的语义判据处理，没有凑数。

收尾同命令只剩：

```text
src/test-support/sourceLayout.test.ts:397:    sourcePath(left[0]).localeCompare(sourcePath(right[0])),
src/features/backup/backupImportPreflight.ts:947:    left.path.localeCompare(right.path, "en", { numeric: true }) ||
src/features/activity/activityService.ts:93:  return left.id.localeCompare(right.id, "en");
src/core/calculations/cashReplay.ts:120:  return left.id.localeCompare(right.id, "en");
```

其中一处是测试代码，三处产品代码均已显式指定语言；产品代码中未指定语言的调用为 0。

## R-2：冻结派生快照

命令：

```bash
npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts
```

阶段〇后与最终候选均为 **1 file／7 tests PASS**。没有修改快照，排序结果与冻结派生结果逐字段一致。

## R-3：文案表、`t()` 与冻结 key 规则

文案表、`translate()`、Context 与 Hook 统一放在 `src/ui/i18n.tsx`，由 `src/ui/index.ts` 作为 `@/ui` 稳定入口导出；没有新增源码一级区域。

key 规则冻结为：

```text
区域.组件或语义分区.用途
```

- 第一段标识产品区域，如 `home`、`settings`、`shared`。
- 第二段标识组件或稳定语义分区，如 `metrics`、`trend`、`language`、`i18n`。
- 第三段写用途，不把中文或布局位置编码进 key，如 `totalAssets`、`description`、`ariaLabel`。
- 只服务一个区域的文案归该区域；跨多个区域且语义完全相同才归 `shared`。不得仅因中文文本相同就强行复用。

这样 09 批可按所有权查找、按区域迁移，也能避免同字不同义被错误共用。中文表是 `TranslationKey` 的唯一完整来源；英文、匈牙利语使用 `Partial<Record<...>>`，缺项经 `translate()` 回落中文，开发模式告警，不显示空白或 key。

## R-4：语言偏好介质与账本隔离

语言偏好只写浏览器 `localStorage` 的独立 key：

```text
local-first-trading-ledger.ui-language
```

选择它是因为语言属于这台浏览器的界面偏好，不属于账本事实、C 文件、B 文件或文件句柄连接记录；刷新后又可自然恢复。读取失败、存储被禁用或值非法时静默回落 `zh-CN`，写入失败时只保留内存状态，不阻塞启动。

T-A8 读取仓库内虚构 golden V3 `.lftl` 为 `Uint8Array`，通过真实设置页控件切换语言后再次读取，断言前后字节完全相等；同时断言 `localStorage` 只有上述一个 key，值为 `en`。因此语言偏好没有进入账本文件或任何与账本数据同生命周期的存储。

## R-5：唯一 Context 与稳定引用

全仓库 `rg -n 'createContext' src` 只有 `src/ui/i18n.tsx` 的 import 和一次 `LanguageContext` 创建，即本仓库第一个且唯一的 React Context。

- `setLanguage` 由 `useCallback` 稳定；依赖只有可选 storage。
- `t` 由 `useCallback` 稳定；只随当前 language 变化。
- Provider value 由 `useMemo(() => ({ language, setLanguage, t }))` 构造；三个成员不变时引用不变。

其他状态继续沿用现有 props，没有借机引入第二个 Context。

## R-6：首页三语译文、疑问条目与语法数

首页直接文案清单如下；中文逐字保持原界面：

| key | 中文 | English | Magyar |
| --- | --- | --- | --- |
| `home.workspace.ariaLabel` | 首页工作区 | Home workspace | Kezdőlap munkaterület |
| `home.empty.heading` | 还没有交易记录 | No transactions recorded | Még nincsenek rögzített tranzakciók |
| `home.empty.description` | 记录第一笔交易后，持仓、盈亏和图表会由同一份账本自动推导。 | After the first transaction is recorded, holdings, profit and loss, and charts are derived automatically from the same ledger. | Az első tranzakció rögzítése után a pozíciók, az eredmény és a diagramok automatikusan ugyanabból a főkönyvből származnak. |
| `home.empty.action` | 记录第一笔交易 | Record the first transaction | Az első tranzakció rögzítése |
| `home.metrics.totalAssets` | 当前总资产 | Current total assets | Jelenlegi összvagyon |
| `home.metrics.remainingCostBasis` | 剩余持仓成本 | Remaining cost basis | Fennmaradó bekerülési érték |
| `home.metrics.unrealizedPnl` | 未实现盈亏 | Unrealized profit and loss | Nem realizált eredmény |
| `home.metrics.realizedPnl` | 已实现盈亏 | Realized profit and loss | Realizált eredmény |
| `home.metrics.unavailable` | 不可完整计算 | Cannot calculate completely | Nem számítható ki teljesen |
| `home.metrics.excluded` | 未计入 | Excluded | Nincs beleszámítva |
| `home.trend.heading` | 资产趋势 | Asset trend | A vagyon alakulása |
| `home.trend.description` | 总资产逐日重放现金与可得行情；成本线仍只读取交易。 | Total assets replay cash and available prices by day; the cost line still reads transactions only. | A teljes vagyon napi bontásban használja a készpénzt és az elérhető árakat; a költségvonal továbbra is csak a tranzakciókat olvassa. |
| `home.trend.priceSource` | 价格来源 | Price source | Árforrás |
| `home.trend.priceModeAriaLabel` | 估值价格模式 | Valuation price mode | Az értékelési ár módja |
| `home.trend.priceModeAuto` | 自动选择 | Automatic selection | Automatikus kiválasztás |
| `home.trend.priceModeManual` | 优先手动 | Manual price first | Kézi ár elsőbbsége |
| `home.trend.range` | 范围 | Range | Időtartam |
| `home.trend.rangeAriaLabel` | 持仓历史范围 | Holdings history range | A pozíciótörténet időtartama |
| `home.trend.range1d` | 1 日 | 1 d | 1 d |
| `home.trend.range7d` | 7 日 | 7 d | 7 d |
| `home.trend.range30d` | 30 日 | 30 d | 30 d |
| `home.trend.range365d` | 365 日 | 365 d | 365 d |
| `home.trend.rangeAll` | 全部 | All | Összes |
| `home.quickTrade.heading` | 记一笔交易 | Record transaction | Tranzakció rögzítése |
| `home.quickTrade.description` | 新增真实买入或卖出事实 | Add a real buy or sell fact | Valós vételi vagy eladási tény hozzáadása |
| `home.missingPrices.action` | 更新缺价资产 | Update assets without prices | Ár nélküli eszközök frissítése |

U-4 疑问条目：执行侧未发现必须等待产品裁决的占位符或明显错误条目；**未取得匈牙利语母语者独立审校**，因此这里只判开发侧可用，不把它表述为独立语言验收。

U-5：既有中文首页文案没有需要改写的语法数句式。英文与匈牙利语的时长选项固定使用标签＋数值 `1 d`／`7 d`／`30 d`／`365 d`，不引入复数规则；动态金额、缺价等继续使用既有“标签＋数值”结构。

## R-7／R-17：数字格式申报、裁决与断言迁移

### 检索与裁决

执行者自行检索含逗号千分位的既有断言，实测与修订 A 背景记录一致：4 个文件、20 处。依据修订 A.4，只改期望值中的数字文本，不改断言结构、matcher 或被断言对象。

`DashboardShell.golden.test.tsx:114` 的测试辅助器不是期望值，超出当时 A-10，故触发 H-3 并停止申报。产品负责人以根文档 `295b009` 发布修订 B，只授权该处剥离千分位分隔符字面量，随后继续。

### 20 处一一对照

| 文件:行 | 迁移前 | 迁移后 |
| --- | --- | --- |
| `formatLedgerNumber.test.ts:12` | `6,492.34` | `6 492.34` |
| `formatLedgerNumber.test.ts:16` | `94,288.50` | `94 288.50` |
| `formatLedgerNumber.test.ts:19` | `-1,234.57` | `-1 234.57` |
| `formatLedgerNumber.test.ts:27` | `4,818.72` | `4 818.72` |
| `formatLedgerNumber.test.ts:28` | `6,638.7349` | `6 638.7349` |
| `formatLedgerNumber.test.ts:53` | `+1,234.57%` | `+1 234.57%` |
| `LedgerNumber.test.tsx:15` | `6,638.7349` | `6 638.7349` |
| `LedgerNumber.test.tsx:54` | `6,492.34` | `6 492.34` |
| `HoldingsOverview.test.tsx:243` | `80,000.00` | `80 000.00` |
| `HoldingsOverview.test.tsx:246` | `65,050.00` | `65 050.00` |
| `HoldingsOverview.test.tsx:260` | `3,903.00` | `3 903.00` |
| `HoldingsOverview.test.tsx:263` | `4,800.00` | `4 800.00` |
| `HoldingsOverview.test.tsx:385` | `45,000.00 USDT` | `45 000.00 USDT` |
| `HoldingsOverview.test.tsx:386` | `33,333.33 USDT` | `33 333.33 USDT` |
| `HoldingsOverview.test.tsx:388` | `1,166.67 USDT` | `1 166.67 USDT` |
| `HoldingsOverview.test.tsx:390` | `3,333.33 USDT` | `3 333.33 USDT` |
| `HoldingsOverview.test.tsx:391` | `4,500.00 USDT` | `4 500.00 USDT` |
| `HoldingsOverview.test.tsx:437` | `2,000.00 USDT` | `2 000.00 USDT` |
| `HoldingsOverview.test.tsx:438` | `2,400.00 USDT` | `2 400.00 USDT` |
| `DashboardShell.interaction.test.tsx:1836` | `几何分配 1 项；净总资产 79,999.00 USDT` | `几何分配 1 项；净总资产 79 999.00 USDT` |

### `expect(` 计数

| 文件 | 迁移前 | 只迁移数字后 | 最终候选 |
| --- | ---: | ---: | ---: |
| `formatLedgerNumber.test.ts` | 10 | 10 | 10 |
| `LedgerNumber.test.tsx` | 8 | 8 | 12（B-14 新增一条测试的 4 个新断言） |
| `HoldingsOverview.test.tsx` | 83 | 83 | 83 |
| `DashboardShell.interaction.test.tsx` | 252 | 252 | 252 |

断言未减少。格式化器定向测试与下游数字测试为 5 files／85 tests PASS；最终涉及修订 B 的定向组合为 3 files／30 tests PASS。舍入规格仍覆盖正负数、边界进位、quantity、money、percent；输入值、精度和舍入算法未变，只有分组分隔符由 `,` 改为普通空格。冻结派生快照仍为 7/7。

## R-8：T-A1～T-A8 与通电检查

八条正式测试集中在 `src/app/i18nMechanism.test.tsx`。每条均用同一命令模式单独运行：

```bash
npx vitest run src/app/i18nMechanism.test.tsx -t 'T-Ax ...'
```

| 测试 | 正式证明 | 临时破坏 | 红／恢复绿 |
| --- | --- | --- | --- |
| T-A1 | 默认首页中文 | 默认语言临时改 `en` | exit 1／exit 0 |
| T-A2 | 设置页切英、匈后首页标题真实变化 | 临时取消状态更新 | exit 1／exit 0 |
| T-A3 | remount 后恢复已存语言 | 临时取消 preference 写入 | exit 1／exit 0 |
| T-A4 | 英、匈缺项回落中文并告警 | 临时返回 key | exit 1／exit 0 |
| T-A5 | 非法值、读取抛错均回落中文且可启动 | 非法值临时回落 `en` | exit 1／exit 0 |
| T-A6 | 三语数字均为 `1 234 567.89` | 临时恢复逗号分隔 | exit 1／exit 0 |
| T-A7 | 三语日期均为 ISO `2026-09-01` | 临时改 `toLocaleDateString` | exit 1／exit 0 |
| T-A8 | 切换前后虚构 `.lftl` 字节一致，storage 仅一个界面 key | 临时额外写 `ledger-file-bytes` | exit 1／exit 0 |

每次破坏后均恢复原文件；最终 T-A1～T-A8 为 **8/8 PASS**，源码工作树无临时破坏残留。

## R-9：全量用例数

| 状态 | 测试文件 | 测试数 | 结果 |
| --- | ---: | ---: | --- |
| 开工基线 `main@755b4bd` | 104 | 1174 | PASS |
| 最终候选 `0a3f5e0` | 106 | 1185 | PASS |

测试文件增加 2，测试增加 11，没有删除既有测试。首次候选全量曾因未获授权的 golden 辅助器仍剥逗号而出现 1 条失败；依修订 B 只改分隔符字面量后，最终全量 1185/1185 通过。

## R-10：性能对照

使用同一台机器、Chrome `152.0.7977.65`、production、S-100、每项 10 个保留样本，紧邻运行 `main@755b4bd` 临时只读导出与最终候选：

```bash
npm run bench:browser -- --mode=production --scale=S-100
```

| 指标 | 开工基线中位数 | 最终候选中位数 | 差异 |
| --- | ---: | ---: | ---: |
| M-1 冷启动 `open-unlock-home` | 298.479 ms | 298.199 ms | -0.280 ms（-0.09%） |
| M-5 页面切换最差 | 73.465 ms | 74.286 ms | +0.821 ms（+1.12%） |

两项差异均处于本轮浏览器计时噪声带，未发现可测量退化。仓库 README 的历史 S-100 约 0.20 s／0.07 s 来自较早环境，本报告不把它冒充本轮直接基线。第一次受限沙箱运行因 `listen EPERM 127.0.0.1` 得到 infrastructure setup-failed；获准启动本机临时服务后两次正式测量均 completed、console error 0、临时浏览器产物清理成功。基线导出目录测后已删除，不进入 Git。

## R-11／R-16：四个版本号对照

开工时从 `main@755b4bd` 的实际常量读取，收尾从候选再次读取；没有引用合同预设值：

| 版本 | 开工基线 | 收尾候选 | 变化 |
| --- | ---: | ---: | --- |
| `fileFormatVersion` | 3 | 3 | 无 |
| `cryptoVersion` | 1 | 1 | 无 |
| `ledgerSchemaVersion` | 4 | 4 | 无 |
| `backupFormatVersion` | 3 | 3 | 无 |

`git diff main...HEAD -- src/platform/files/ledgerFileChunkedContainerV3.ts src/features/backup/backupEnvelope.ts` 无输出；版本与文件合同零改动。

## R-12：H-1～H-5

| 停止条件 | 是否触发 | 处理 |
| --- | --- | --- |
| H-1 无法避免语法数 | 否 | 首页使用标签＋数值；时长译文固定为 `n d` |
| H-2 冻结快照变化 | 否 | 阶段〇后及最终均 7/7 |
| H-3 必须改既有断言／辅助器 | **是** | 20 处期望数字由修订 A 预授权；golden 辅助器不在 A-10 内，执行者停止申报，修订 B 只授权分隔符字面量后继续 |
| H-4 需要第三方库或第二 Context | 否 | 一张表、一个 Context、一个 `t()` 足够 |
| H-5 文案表导致结构守卫无法通过 | 否 | 文案表位于既有 `src/ui`，结构守卫 8/8 |

## R-13：强制否定性声明

- 未引入任何 i18n 第三方库，`package.json` 与 lockfile 零改动。
- 未新增第二个 React Context；全仓库只有语言 Context 一次创建。
- 未使用依赖语法数的文案。
- 未让数字或日期随语言变化；未使用 `Intl`／`toLocaleString` 做账本显示格式化。
- 未搬运首页以外文案；设置页只新增语言开关自身文案。
- 未让 `src/core` 或 `src/platform` 引用 `@/ui`，未在两层新增用户可见文案。
- 未改 `src/app/` 目录结构，未拆分大文件。
- 未改文件格式、四个版本号、加密参数、底层数值、精度、舍入规则或派生计算。
- 未实现语言自动探测；默认中文。
- 未读取、引用或复制 `~/Downloads/history_OKX/`，未打开真实 `.lftl` 或真实 B。
- 未把语言偏好写入账本文件或账本生命周期存储。
- 未 merge、push、rebase，未使用破坏性 Git 命令。

## R-15：测试语言钉死、复位与不泄漏证明

`src/test-support/vitest.setup.ts` 在每个用例前把独立 localStorage key 写为 `zh-CN`；每个用例后先执行 React Testing Library `cleanup()`，再移除该 key。若 Node/jsdom 暴露不可用 localStorage，则只为测试环境安装内存 Storage；存储故障测试仍可显式传入抛错边界。

`src/ui/i18n.test.tsx` 的第一条测试切换并持久化 `en`；紧接的第二条重新渲染 Provider，断言从 `DEFAULT_LEDGER_LANGUAGE`（`zh-CN`）启动。该顺序证明前一用例的语言没有泄漏到后一用例。最终全量包含真实切换语言的 T-A2／T-A3，仍稳定 1185/1185。

## R-18：golden 测试辅助器授权改动

改前：

```ts
const actual = getPositionCellValue(assetSymbol, columnIndex).replace(
  /\s+(?:USD|USDT)$/,
  "",
).replaceAll(",", "");
```

改后：

```ts
const actual = getPositionCellValue(assetSymbol, columnIndex).replace(
  /\s+(?:USD|USDT)$/,
  "",
).replaceAll(" ", "");
```

唯一差异是 `.replaceAll` 的千分位分隔符字面量 `","` → `" "`。紧随其后的断言保持原文：

```ts
expect(isWithinTolerance(actual, expected, "0.0000000001")).toBe(true);
```

断言结构、`toBe` matcher、`0.0000000001` 阈值、被断言对象 `isWithinTolerance(actual, expected, ...)` 全部未改动。全仓库此类辅助器只有这一处。

## R-19：数字防折断与普通空格 codepoint

`src/app/globals.css` 的 `.ledger-numeric` 新增：

```css
white-space: nowrap;
```

`LedgerNumber` 仍渲染 `ledger-numeric` class。新增 B-14 测试渲染 `1234567.89`，同时断言：

1. 文本严格等于普通源码字符串 `1 234 567.89`；
2. 两个分隔字符的 `codePointAt(0)` 均为 `[0x20, 0x20]`；
3. 渲染元素包含 `ledger-numeric` class；
4. 该 class 的 CSS 规则包含 `white-space: nowrap`。

通电检查临时删除 `nowrap` 后，该测试 1/1 变红（exit 1）；恢复后 1/1 变绿（exit 0）。全源码检索 U+00A0／U+202F 无命中，数据层保持普通空格 U+0020，防折断完全由样式承担。

## 最终质量门

| 闸门 | 结果 |
| --- | --- |
| 默认全量 | 106 files／1185 tests PASS |
| T-A1～T-A8 | 8/8 PASS，逐条通电完成 |
| 冻结派生快照 | 7/7 PASS |
| 结构守卫 | 2 files／8 tests PASS |
| typecheck | PASS（build 完成后的稳定生成目录中串行复跑） |
| lint | PASS，0 warning／0 error |
| production build | PASS |
| 当前 diff whitespace | `git diff --check` PASS |
| 分支累计 whitespace | `git diff main...HEAD --check` PASS |
| 分支／工作树 | `zhennn/w15-main-i18n-mechanism@0a3f5e0`，clean |

并行质量门时，typecheck 曾与 `next build` 重建 `.next/types` 竞争而报告瞬时生成文件缺失；build 完成后串行重跑 typecheck 为 PASS。本报告只采用稳定状态的串行结果，不把基础设施竞争记为源码绿灯。

本报告不替代独立验收 `07D`，也不授权合入 `main`。
