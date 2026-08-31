# 05D_W15-main｜性能优化第二批「只画看得见的」独立验收报告

验收日期：2026-08-31（CEST）
验收对象：`05C-2_W15-main-性能优化第二批追加范围执行报告.md`
待验分支：`zhennn/w15-main-render-visible-only`，HEAD `b4d2391`（核对相符）
对照基线：源码仓库 `main` `322ee67`（核对相符）；三点式基准 merge-base `c1a6666`
验收依据：`05A` 修订 A／修订 B（通过线 4.1）、`05B` 正文 B-01～B-13 与修订 A（A-01～A-04、C-01～C-03、P-01～P-07、T-C1～T-C5）、根 `AGENTS.md`

---

## 结论

**有条件通过。**

`05C-2` 所声称的合同遵守情况，凡是能在本机静态或动态查证的，**逐条为真**；所声称的门禁数字，凡是我实跑的，**逐个对得上，没有一个是抄来的或凑出来的**。尤其是本次追加范围最关键的诚信项——W-3′ 三格超线导致 W-3″ 被强制触发——**没有被事后美化**：那四个失败值原样保留在报告里，其后 `ce8a0e7` 那一轮的第二次失败（583.796／602.019）也原样保留。这正是 `05C` 第一次尝试所欠缺的东西。

不给无条件 PASS，只因两点：

1. **F-1：报告有一处可证伪的错误答案。** §9 称「若改成 200，只改该常量的一个数字，三处实现和新增测试均引用常量」。我实测把 `ACTIVITY_PAGE_SIZE` 改成 200，**7 个测试失败**。这是 `05B`「`05C` 交付要求」第 2 项的指定必答项，答错了。产品代码那一半是对的，测试那一半是错的。
2. **性能数字我一个都没有重跑，未核验其真实性。** 依任务约定不重跑浏览器量尺。因此 `05A` 4.1 四条必达线的达标结论，我只核验了它的**内部一致性与来源自洽**，没有核验它的**真实性**。`benchmarks/results/` 在 `.gitignore` 内且本机不存在，仓库里也没有任何可供旁证的量尺产物——除重跑外，本机不存在第二条独立佐证路径。

解除条件：F-1 更正（改报告措辞，或让新增测试真正引用常量）；4.1 的达标由产品负责人明确接受「基于 n=1、未经第二方复现的浏览器数据」这一证据等级。这两点解除后即为 PASS。**本报告不授权合入 `main`，不授权推送。**

---

## 一、我实际跑过的命令与实际数字

全部在 `b4d2391`、工作树 clean 的状态下运行。

| 项目 | 我实跑的结果 | `05C-2` 的自述 | 是否相符 |
| --- | --- | --- | --- |
| 默认全量 `npm test` | **99 files／1134 tests passed**，exit 0 | 99 files／1134 tests | **相符** |
| `npm run typecheck`（`tsc --noEmit`） | 通过，exit 0 | 通过 | 相符 |
| `npm run lint`（`eslint . --max-warnings=0`） | 通过，exit 0 | 通过，0 warning | **相符**（`--max-warnings=0` 即已证明 0 warning） |
| `npm run build` | 通过；`/` **350 kB／First Load 452 kB** | 350 kB／452 kB | **相符** |
| 冻结派生快照 `npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts` | **1 file／7 tests passed** | 7/7 | **相符** |
| 源码结构守卫 `src/test-support/sourceLayout.test.ts` | 7/7 passed | 默认全量中的 7/7 | 相符 |
| `git diff --check` | 通过 | 通过 | 相符 |
| `git diff main...HEAD --check` | 通过 | 通过 | 相符 |
| `git status`（源码仓库） | clean，无未跟踪账本／量尺产物 | clean | 相符 |

**未跑：** 任何 Node 量尺、任何浏览器量尺（M-1／M-3／M-4／M-5／M-6／M-7／M-8／M-9 的采数）、S-1M 极限探测。`bench:test:m9`、`bench:test:browser`、`bench:test:node`、生成器合同（报告称 10/10、3/3、1/1、1/1）**均未跑，未核验**。

### 用例数增量的独立佐证

报告称开工基线（`e6c360a`）为 95 files／1123 tests，最终为 99／1134，即 **+4 文件／+11 用例**。我不检出 `e6c360a`（避免扰动工作树），改用算术旁证：本轮新增的四个默认全量测试文件，`it()` 数为

- `src/features/cash/CashEventPanel.pagination.test.tsx` → 4
- `src/features/asset-transfers/AssetTransferPanel.pagination.test.tsx` → 4
- `src/app/DashboardShell.visible-workspace.test.tsx` → 1
- `src/app/useLedgerWorkspaceSession.unmount.test.tsx` → 2

合计 **4 文件、11 用例**，与 95→99、1123→1134 **精确吻合**。这从侧面证明本轮既没有偷删用例，也没有虚报增量。

---

## 二、逐行读 diff 的结果（A 项）

`git diff main...HEAD` 全量读过：22 个文件，1702 insertions／211 deletions。`git diff main...HEAD --diff-filter=DR` 为空——**本批没有删除或改名任何一个文件**。

### A-1　既有测试的断言或阈值（B-05）——通过

这是上次翻车的地方，我用最强的形式查：看 numstat 的删除列。

diff 里涉及测试／契约的文件只有 6 个，**每一个的删除数都是 0**：

```
28	0	benchmarks/measure/renderedElementCount.contract.ts
109	0	src/app/DashboardShell.visible-workspace.test.tsx
314	0	src/app/TransactionsWorkspace.pagination.test.tsx
82	0	src/app/useLedgerWorkspaceSession.unmount.test.tsx
208	0	src/features/asset-transfers/AssetTransferPanel.pagination.test.tsx
198	0	src/features/cash/CashEventPanel.pagination.test.tsx
```

相对 `main`，**全部为纯新增，零删除、零修改**。`main` 上原有的任何一条断言、任何一个阈值、任何一个用例标题，都没有被动过。B-05 通过。

**本轮内部的那一次断言收紧，报告已如实披露，我复核属实。** `b4d2391` 把 `renderedElementCount.contract.ts` 中四条断言由 `toBeGreaterThan(0)`／`toBeGreaterThanOrEqual(0)` 改为 `toBe(0)`：

```
-      expect(result.first.homeWorkspaceElements).toBeGreaterThanOrEqual(0);
-      expect(result.first.recordWorkspaceElements).toBeGreaterThan(0);
-      expect(result.first.transferWorkspaceElements).toBeGreaterThan(0);
-      expect(result.first.settingsWorkspaceElements).toBeGreaterThan(0);
+      expect(result.first.homeWorkspaceElements).toBe(0);
+      expect(result.first.recordWorkspaceElements).toBe(0);
+      expect(result.first.transferWorkspaceElements).toBe(0);
+      expect(result.first.settingsWorkspaceElements).toBe(0);
```

我核对了这四条的来历：它们是 `baecdcb`（本轮阶段〇）新加的，`e6c360a` 时并不存在。同一次改动中，`documentElements` 与 `transactionsWorkspaceElements` 那两条**开工前既有**的断言原样未动。因此这属于 `05B` 修订 A A-03 意义上的「本批内新增断言随强制分岔更新」，不属于 B-05 禁止的「修改既有断言」。报告 §7 单列披露、不并入 §9 的否定性声明，处理方式恰当。**判定：合规，且披露充分。**

方向上仍值得记一笔：这四条从「存在」收紧为「恒为 0」，是把断言绑死在 W-3″ 的卸载实现上。将来若产品决定预挂载某个工作区，这份契约会先红。这是设计取舍，不是缺陷。

### A-2　`resetPageState` 调用（B-06、W-5）——通过

`src/app/TransactionsWorkspace.tsx:312` 的 `if (!active) resetPageState();` **一字未改**——该文件的 diff 中不存在任何含 `active` 的行。改动只发生在 `resetPageState` 的**函数体**内（增加 `setCurrentPage(1)`），这正是 `05B`「`05C` 交付要求」第 3 项要求交代、W-5「只允许在其中增加需要重置的项」明确允许的动作。B-06 通过。

### A-3　筛选逻辑与 `activityService.ts`（B-07）——通过

`src/features/activity/activityService.ts` **完全不在 diff 内**。`TransactionsWorkspace.tsx` 的两个 `useMemo`（`allItems`／`filteredItems`）函数体未改，diff 中该区域只有其后新增的分页派生。四个筛选控件的 `onChange` 各增加一句 `setCurrentPage(1)`——这是 `05A` U-2（改筛选回到第 1 页）的实现，属页码状态，不属筛选逻辑。B-07 通过。

### A-4　`RecordWorkspace` 的 `[ledgerEpoch]` 草稿丢弃覆盖（C-02）——通过

这是 W-4 的状态提升正好要动的那段代码，我做了逐字比对，不采信报告自述。

`HEAD:src/app/RecordWorkspace.tsx` 与 `main:src/app/RecordWorkspace.tsx` 的该 effect **逐字符相同**：

```js
  useEffect(() => {
    setRecordTarget({ kind: "cash", currency: "USDT" });
    setTradeDraft(createTradeWorkspaceDraft(defaultAssetSymbol, todayKey));
    setPriceDraft(createPriceWorkspaceDraft(defaultAssetSymbol, todayKey));
    onDraftStatusChange(false);
    // A ledger epoch is the only event that clears session-local drafts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerEpoch]);
```

依赖数组、注释、eslint 抑制行、四个语句的顺序全部一致。承载用例 `discards drafts and resets the record target when the ledger epoch changes` 所在的测试文件不在 diff 内（未被触碰），且在我实跑的 1134 个用例中通过。C-02 通过。

**但这里有一个覆盖上的空当，见后文 F-4。**

### A-5　阶段〇那一笔（`baecdcb`）——通过

```
39	4	benchmarks/measure/browserMetrics.ts
4	0	benchmarks/measure/renderedElementCount.contract.ts
```

**只动了 `benchmarks/` 下两个文件，`src/` 零改动。** A-01 通过。

A-02（既有两个字段原样保留）我也逐行核了。那 4 行删除全部是重构位移，语义未变：

- `transactionsWorkspaceElements` 的计算公式仍为 `transactionsWorkspace.querySelectorAll("*").length + 1`，选择器仍为 `[data-workspace-page="transactions"]`，**加一（含工作区自身）的口径未变**；
- 「交易工作区不存在则抛错」的保护仍在；
- `measurementsMatch` 由比较 1 个字段扩为比较 6 个字段，是**超集**，原比较项未被移除。

A-02、A-04 通过。

### A-6　四个版本号——通过

| 版本号 | 值 | 定义位置 |
| --- | ---: | --- |
| `fileFormatVersion` | **2** | `src/platform/files/ledgerFileContract.ts:15` |
| `cryptoVersion` | **1** | `src/platform/files/ledgerFileContract.ts:16` |
| `ledgerSchemaVersion` | **4** | `src/platform/files/ledgerFileContract.ts:31` |
| `backupFormatVersion` | **3** | `src/features/backup/backupEnvelope.ts:20` |

与 `05C-2` §8 的自述一致。更强的证明：**`git diff main...HEAD --name-only` 中没有任何一个 `src/core/` 或 `src/platform/` 下的文件**，承载前三个版本号的文件根本不在本批改动范围内；`src/features/backup/` 同样不在。B-01 通过。

### A-7　其余禁止项

| 编号 | 结论 | 依据 |
| --- | --- | --- |
| B-03 虚拟化／无限滚动／分块存储 | 未见 | 分页为纯 `slice`，`activityPagination.ts` 全文 13 行 |
| B-09 生成物入库 | 未见 | `git status` clean；`benchmarks/results/` 已 gitignore 且本机不存在 |
| B-11 图表 | 未动 | `src/features/charts/` 不在 diff 内 |
| B-12 `TradeTable.tsx` | 未动 | 不在 diff 内 |
| B-13 下调每页行数 | 未见 | `ACTIVITY_PAGE_SIZE = 100`，仓库唯一定义于 `src/features/activity/activityPagination.ts` |
| P-02 倒序保留 | 通过 | L-1／L-2 均为 `[...x].reverse()` 后再切片 |
| P-05 不新增序号列 | 通过 | 序号列仅存在于 `ActivityTable.tsx`（交易页），两个面板未加 |
| A.6 merge／push／rebase | 未见 | 分支线性 11 笔，无 merge commit；`main` 仍在 `322ee67`，无 `origin` 变动痕迹 |
| B-04 私有数据 | 我本人未读取 `~/Downloads/history_OKX/`，未打开任何真实 `.lftl` 或真实 B。执行者是否读过，**我无法从仓库状态证伪，未核验** | — |

### A-8　序号列（`05A` 修订 A 方案 B）

第一轮（`05C`）的产出，在本次 diff 范围内，一并核过：`ActivityTable.tsx` 表头新增 `<th>#</th>`，空状态与展开详情行的 `colSpan` **由 6 改为 7**（修订 A A.4 第 2 项点名「最容易漏掉的一处」——已改，两处都改了），序号由 `firstItemNumber + pageIndex` 推导、不落数据层。T-B1／T-B2／T-B3 三条用例实际存在于 `TransactionsWorkspace.pagination.test.tsx` 并通过。

---

## 三、通电检查的可信度（E 项）

报告声称八条新增测试都做过通电检查。我不抽查、我自己动手破坏了**三次**，其中一次是报告没有单列的、本批最核心的卸载合同。

| # | 我做的破坏 | 结果 | 还原 |
| --- | --- | --- | --- |
| 1 | `CashEventPanel.tsx` 当前页切片追加 `.slice(0, 99)` | **红**：4 条中 3 条失败，`expected […] to have a length of 100 but got 99` | `git checkout --` 后 SHA-256 与破坏前**完全相同**，重跑 4/4 绿 |
| 2 | `AssetTransferPanel.tsx` 删除 `Math.min(page, totalPages)` 页数 clamp effect | **红**：T-C5.3 失败，末页删空后停在 `第 2 / 1 页`，等不到 `共 100 条，第 1 / 1 页` | 同上，SHA-256 完全相同，重跑 4/4 绿 |
| 3 | `DashboardShell.tsx` 把 `session && workspace.currentPage === "settings"` 改回 `session`（设置页恒挂载） | **红**：`expectVisibleWorkspace` 断言「`[data-workspace-page]` 恰好 1 个」失败 | 同上，SHA-256 完全相同，重跑 1/1 绿 |

**三次全部真变红，三个文件全部逐字节还原，收尾工作树 clean。通电检查可信。**

### 一个意外的强佐证：报告给出的 SHA 可以复现

报告 §3 列了两个「恢复证据」SHA。我原本只想核 A 项，顺手比对后发现它们**精确可复现**：

| 报告声称 | 我算出的匹配对象 |
| --- | --- |
| 现金目标文件 `c9bd93a9ba1c559f9435757389a99c91ea1a084657be64fe6efcc47b0392db35` | `CashEventPanel.tsx` 在 `467517e`／`31eb526`／`3755cbb`／`ce8a0e7` 四笔上的内容哈希，**完全一致** |
| 资产转移目标文件 `aa053b456384993dce3d2c2b6b1df2e9350c20340c7af13b2813babb1e3c2139` | `AssetTransferPanel.tsx` 在 `31eb526`～`b4d2391` 全部五笔上的内容哈希，**完全一致**（该文件此后未再改动，等于当前工作树） |

现金文件当前工作树 SHA 是 `28af60a2…`，与报告不同——原因是 `6a9c43a` 之后给它加了 `cashBalance` 入参。也就是说，**报告记录的是做通电检查那一刻的真实哈希，而不是事后补写的当前哈希**。这类细节伪造不出来。

### 新增测试的分量

通电检查只能证明测试不是空转，不能证明它有分量，所以我读了测试本体。`CashEventPanel.pagination.test.tsx` 的 T-C2 是翻遍所有页收集 `note`、与 `[...cashEvents].reverse().map(note)` 做**整表相等**比对，再加 `Set.size` 查重；T-C3 是真点删除、真 rerender、断言 `共 101 条，第 2 / 2 页` → 删空后 `共 100 条，第 1 / 1 页`。`DashboardShell.visible-workspace.test.tsx` 除了「恰好挂载一个工作区」，还对 `replayUsdtCash` 与 `getPositionsFromLedger` 下 spy，断言导航到记账页后**两次重放调用均为 0**——即 `6a9c43a` 那条复用声明有真实断言守着，不是只写在报告里。**不是同义反复的测试。**

---

## 四、性能数字（D 项）：只核内部一致性与来源

**声明：本节所有数字我一个都没有重跑，未核验其真实性。** 依任务约定不重跑浏览器量尺；且 `benchmarks/results/` 在 `.gitignore` 内、本机不存在，仓库内无任何量尺产物，除重跑外本机不存在第二条独立佐证路径。以下只回答「自不自洽」，不回答「真不真」。

### 4.1　W-3′ 有没有被事后美化——**没有**（重点复核项）

`05C-2` §4.1 保留的四个值：

| 方向 | M-5（ms） | 对 200 ms 线 |
| --- | ---: | --- |
| 记账→首页 | 210.846 | 超 |
| 首页→记账 | 216.194 | 超 |
| 记账→交易 | 214.260 | 超 |
| 交易→记账 | 197.493 | 通过 |

三格超线、一格通过，与摘要「四方向中三格超过 200 ms 而触发 W-3″」**完全一致**；与 `05B` 修订 A A.3 的分岔规则（任一方向 > 200 ms → 触发 W-3″）一致。**这四个值没有被替换成通过的值，也没有被重测取优——报告明写「没有重测取优或推迟」。**

更能说明问题的是：报告连**第二次失败**也留着。`ce8a0e7`（初次卸载）之后测得 66.101／**583.796**／114.881／**602.019**，进记账页两格大幅失败，报告直书「不能结案」，然后才有 `6a9c43a` 的复用补正。一份想美化的报告不会主动留下两轮失败。**这一项我判定为如实交代。**

### 4.2　算术自洽——全部正确

我把报告里的倍数抽了 **23 个**逐一重算（`04C` 中位数 ÷ 本批中位数），**23/23 与报告一致，无一处算错**（含 M-2 四档、M-8 三档、M-1 dev/prod、M-5 dev/prod S-10K 四方向、M-3、M-6 等）。

M-9 的「五工作区之和与 `documentElements` 恒差 70」我逐档验算，**7 组全部恰为 70**：

| 档位／时点 | document | 五区之和 | 差 |
| --- | ---: | ---: | ---: |
| S-10K 阶段〇 | 27,561 | 27,491 | 70 |
| S-100K 阶段〇 | 243,677 | 243,607 | 70 |
| W-3′ 时点 | 4,282 | 4,212 | 70 |
| S-100 最终 | 3,002 | 2,932 | 70 |
| S-1K 最终 | 3,032 | 2,962 | 70 |
| S-10K 最终 | 2,996 | 2,926 | 70 |
| S-100K 最终 | 3,000 | 2,930 | 70 |

其余：V-3 比值 `240,171 / 24,151 = 9.9446`（报告同值）；V-1 反算偏差「低 149～599 个、约 0.6%～2.4%」重算无误；S-1K dev M-4 的两倍判定 `46.604 × 2 = 93.208 < 96.542`，标注「可能受采样抖动影响」且未重跑取优，处理正确。

热控：阶段〇两档静置 5m05s／5m11s，阶段三五档静置 5m32s／5m39s／5m53s／5m31s／5m04s，W-3′ 时点 5m14s——**全部 > 5 分钟**，与 A.4 第 4 项相符。

### 4.3　需要产品负责人注意的两处

1. **结论所依赖的 10⁵ 数字全部是 n=1。** 报告自己标明了，未伪作中位数，处理合规。但 4.1 的达标就建立在单次采样上。
2. **同一口径的两次 S-100K 测量存在可观离散。** §4.2「最终候选」（13:49）为 66.496／66.820／114.404／67.006；§5.4 阶段三（14:19）为 66.026／**100.667**／114.069／**83.257**。报告用后者进结论，是保守的选法。但「首页→记账」两次相差 33.8 ms、「交易→记账」相差 16.3 ms，而结论距 200 ms 线的余量正是靠这类单点撑着。这不是矛盾，也不是缺陷——报告如实给出了两组——但**「四格全部 ≤ 200 ms」这一结论的证据强度，等于两次 n=1 观测**，请在裁决时按这个等级对待。

---

## 五、我发现的问题

### F-1　报告有一处可证伪的错误答案（必须更正）

**位置：** `05C-2` §9 第 1 条。

> 「`ACTIVITY_PAGE_SIZE = 100` 唯一定义于 `src/features/activity/activityPagination.ts`；若改成 200，**只改该常量的一个数字**，三处实现和**新增测试均引用常量**。」

**我做的实验：** 把该常量改成 200，跑三个分页测试文件。

**结果：`Tests 7 failed | 16 passed (23)`，三个文件全红。**（随即还原，常量已复位为 100，工作树 clean。）

**原因：** 新增测试只有夹具规模引用了常量（`cashLedger(ACTIVITY_PAGE_SIZE + 3)`），**渲染文案是写死的字面量**：

```
CashEventPanel.pagination.test.tsx:32   共 103 条，第 1 / 2 页
CashEventPanel.pagination.test.tsx:79   共 101 条，第 2 / 2 页
CashEventPanel.pagination.test.tsx:100  共 100 条，第 1 / 1 页
AssetTransferPanel.pagination.test.tsx:32/84/105/122/129  同类
```

常量变 200 后夹具变成 203 条，实际渲染「共 203 条」，与写死的「共 103 条」对不上。

**判定：** 声明的前半（产品代码只有一个定义点、改一个数字即可）**为真**，我已核实；后半（新增测试均引用常量）**为假**。这是 `05B`「`05C` 交付要求」第 2 项的指定必答项，答错了。

**危害等级：低，但必须改。** 它不影响任何一条通过线，不影响任何实测数据，也不是为了美化而写——更像是想当然。但这份答案存在的意义就是给将来改每页行数的人一个准确的工作量估计，**错误的估计比没有估计更坏**。

**解除方式（二选一）：** 把 §9 那句改为「产品代码只需改该常量一处；新增测试中的页码文案为字面量，同步需改 7 处断言」；或把测试里的字面量改为由 `ACTIVITY_PAGE_SIZE` 推导。后者更好，但属新工作，由产品负责人定。

### F-2　`if (!active) resetPageState();` 在产品路径上已成死代码（观察，非违规）

`ce8a0e7` 之后，`DashboardShell` 对交易页改为条件挂载，`active` 是写死的字面量 `true`。因此 `TransactionsWorkspace.tsx:312` 的 `if (!active)` 分支**在真实产品路径上永不成立**，只有传 `active={false}` 的测试还在走它。

**这不违反 B-06**：条文禁止的是「修改或删除该行」，该行一字未改；而它守护的安全意图（离开交易页后筛选不残留）被卸载**更强地**满足了——整个组件连同全部状态一起销毁。同文件 `:314` 的 `useEffect(() => resetPageState(), [ledgerEpoch, ...])` 仍在真实路径上生效。

记在这里只为让产品负责人知情：`05A` 5.2 把这行定性为「安全设计，不是待优化项」，如今它的**实际守护者已经换人**。将来若有人以「它反正跑不到」为由删掉它，那才是行为倒退。建议保留，并在 `05A`／`05B` 的后续修订中把这层变化写明。

### F-3　派生结果复用的等价性（我已追到底，判定等价）

`6a9c43a` 让记账页复用 Dashboard 已算好的结果，这是本批唯一可能触发 B-02（「算快了但算错了」）的改动，我没有采信报告自述，自己追了调用链：

- **现金余额：** `CashEventPanel` 由 `replayUsdtCash(ledgerData, { asOf: todayKey })` 改为 `cashBalance ?? replayUsdtCash(...)`；上游传入 `projection.cash.balance`，而 `projection` 来自 `buildLedgerProjection`，其内部**正是** `replayUsdtCash(ledgerData, { asOf: options.asOf })`，`asOf` 即同一个 `todayKey`，同一个 `clock` 向下传递。**同一函数、同一入参，值等价。**
- **持仓：** `MarketDataControls` 由 `getPositionsFromLedger(ledgerData, { todayKey, mode })` 改为 `positions ?? getPositionsFromLedger(...)`；上游传入 `projection.positions`，两个调用点均同时传 `todayKey={todayKey}` 与 `mode={valuationPriceMode}`，与 `useWriteCycleDashboardDerivations` 的入参**同源**。`.filter(非零)` 保留在复用之后。**值等价。**
- 组件独立使用时 fallback 仍在，报告此点属实。
- `dashboardDerivations.ts`、`ledgerProjection.ts`、`src/core/` 全部不在 diff 内，派生函数本体未动。

**残留风险（记录，不阻断）：** 在增量缓存路径上，面板现在显示的是缓存值，而非当场重算值。二者的等价由 04 批冻结派生快照裁判——**我实跑 7/7 通过**。这就是 B-02 指定的唯一裁判，判定合规。

另注一处不一致（无害）：`DashboardShell.tsx:894` 还有第三个 `MarketDataControls` 调用点（`session === undefined` 分支），**没有**接收 `positions`，仍自行计算。不影响正确性，只是优化没铺满。

### F-4　`[ledgerEpoch]` 保护现在靠两个半边，端到端无覆盖（观察，建议下批补）

C-02 逐字合规，已在 A-4 确认。但状态提升带来一个结构变化，值得记：

`RecordWorkspace` 的 `[ledgerEpoch]` effect 调的是**本地** setter（`setRecordTarget`／`setTradeDraft`／`setPriceDraft`）。而在受控路径下，`recordTarget = controlledRecordTarget ?? localRecordTarget`、`tradeDraft = initialTradeDraft ? sessionTradeDraft : localTradeDraft`——`DashboardShell` 一旦供值，**本地 state 就被遮蔽，那个 effect 的写入不再影响所见**。真实清空改由 `useLedgerWorkspaceSession` 自己的 `[ledgerEpoch]` effect 里的 `resetRecordSession()` 完成。报告 §4.2 说的「由 hook 和原 04D effect 共同清空」属实。

问题在覆盖：

- 04D 那条 `discards drafts and resets the record target when the ledger epoch changes` 渲染的是**非受控**的 `RecordWorkspace`，走的是旧路径；
- `useLedgerWorkspaceSession.unmount.test.tsx` 在 **hook 层**覆盖新路径；
- **没有一条测试把二者合起来，在组装好的 `DashboardShell` 上端到端验证「换账本 → 已提升的草稿被清空」。**

也就是说，`04D` 刚补回来的那条保护，如今在产品实际走的那条路上，是由另一段代码提供的，而那段代码只在 hook 层被单测。这正是 `05A` 修订 B B.4 当初暂缓 W-3 时所担心的位置（「`04D` 刚刚补回的 `[ledgerEpoch]` 草稿丢弃覆盖正落在 W-4 要动的那段代码上」）。

**不阻断本批**：合同只要求 effect 原文保留、既有用例继续为真，两条都做到了。但建议列入下一批：补一条 `DashboardShell` 层的 epoch 用例。

---

## 六、边界：我没做的事

严格按事实列，不留白、不推断。

| 项目 | 状态 |
| --- | --- |
| 全部性能实测数字（M-1／M-3／M-4／M-5／M-6／M-7／M-8／M-9 各档各方向） | **未重跑，未核验其真实性**。只核了内部一致性、算术与来源自洽 |
| W-3′ 四个值、W-3″ 两轮值、阶段三四档主数据 | **未核验真实性**。已核验：未被替换为通过值、与分岔结论自洽 |
| S-1M 极限探测（`RangeError: Invalid string length`、RSS 2,817,671,168） | **未核验** |
| 运行环境自述（macOS 26.6.2／M5／16 GB／Chrome 151／AC 供电） | **未核验** |
| 开工基线 95 files／1123 tests | **未直接核验**（未检出 `e6c360a`）。已用「新增 4 文件／11 用例」算术旁证，与最终 99／1134 吻合 |
| `bench:test:m9`（1/1）、`bench:test:browser`（1/1）、`bench:test:node`（3/3）、生成器合同（10/10） | **未跑，未核验** |
| 执行者是否读取过 `~/Downloads/history_OKX/` 或真实 `.lftl`／B 文件 | **无法从仓库状态证伪，未核验**。我本人未读取 |
| 报告中各时刻（12:47:55、13:08:20、14:19:10 等）是否为真实时钟 | **未核验**。只核了它们彼此的间隔自洽且静置均 > 5 分钟 |
| 通电检查 | **已自行执行 3 次**（非抽查报告记录，是我自己破坏并还原），见第三节 |

---

## 七、收尾状态

| 仓库 | 状态 |
| --- | --- |
| 源码仓库 `LocalFirstTradingLedger/` | 分支 `zhennn/w15-main-render-visible-only`，HEAD **`b4d2391`**，工作树 **clean**。三次破坏与一次常量实验的四个文件（`CashEventPanel.tsx`、`AssetTransferPanel.tsx`、`DashboardShell.tsx`、`activityPagination.ts`）均已 `git checkout --` 还原，SHA-256 逐一比对与破坏前相同。**未 merge、未 push、未 rebase，未新增任何提交** |
| 根文档仓库 | `main`，仅新增本报告一个文件，单独提交，不含任何源码仓库路径 |

我另核了执行者的仓库边界：`11d2f83`（写入 `05C-2`）与 `b8aa8fb`（周日志补记）**均只含文档路径**，没有把源码改动混进文档提交。`AGENTS.md`「两个 Git 仓库分别提交」的要求，本批遵守。

---

## 八、给产品负责人的裁决建议

**建议按「有条件通过」处理，条件两条：**

1. **更正 F-1。** 改 `05C-2` §9 的措辞，或把新增测试的页码字面量改为由常量推导。前者几分钟，后者更彻底。
2. **明确接受性能证据等级。** 4.1 四条必达线的达标，其证据是 10⁵ 档 n=1、未经第二方复现的浏览器观测，且两次同口径测量在两个方向上有 16～34 ms 的离散。这是任务约定的边界（不重跑量尺），不是执行者的过失，但**需要由你而不是由我来接受**。若你要求更强证据，最小代价是让执行者在 S-100K production 补测一次 M-5 四方向（`n=3`），三次中位数仍全部 ≤ 200 ms 即可升为无条件 PASS。

**建议不因下列事项阻断：** F-2（死代码，属知情记录）、F-3（已追证等价，且冻结快照 7/7 实跑通过）、F-4（合同已满足，属下批补覆盖的建议）。

**本次验收的正面结论要说清楚：** 就「有没有如实交代」这个核心问题而言，`05C-2` **交代得住**。它保留了两轮失败数据、单列披露了本批内唯一一次断言演化、明确写出了「修正系数未取得」而不是拿估算顶替、把 M-3 不达标与 4.1 必达线严格分开不混为一谈。我按最强形式查了 `05C` 上次翻车的那类问题（既有测试断言被删改），diff 中每一个测试文件的删除计数都是 0。**这一份没有重蹈覆辙。**
