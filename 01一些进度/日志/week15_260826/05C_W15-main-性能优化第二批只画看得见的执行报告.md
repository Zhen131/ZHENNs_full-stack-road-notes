# 05C_W15-main｜性能优化第二批「只画看得见的」执行报告

执行日期：2026-08-29
源码轨道：`main` 长期产品；工作分支 `zhennn/w15-main-render-visible-only`
起点核对：`main@c1a6666`，工作树 clean；未读取私有真实数据区，未触碰 `CS2026`。

## 结论

**实现和自动质量门通过，但本次 05B 的开发执行候选为未通过（不是 `PASS`）。**

分页、定位适配、序号列（按修订 A 执行方案 B）以及新测试均已实现并提交；默认全量 95 文件／1123 用例、typecheck、lint、production build、冻结派生快照和结构守卫均通过。`05A` W-1 的强制 S-10K production M-5 四方向测量也全部小于 200 ms，因此没有触发 W-3／W-4，未改动 `RecordWorkspace`。

但阶段三不能补写为完整：S-10K 的 dev 和 production 浏览器命令在外层 30 秒采集窗口到点后仍在运行，采集会话 ID 未被保留，命令自然结束后 JSON 不可回收；为遵守 B-16，没有重试。随后又遗漏了最终 S-10K 的 M-9 调用；S-100K 的 M-9 则真实返回 `setup-failed`。这些都是 05B 3.1／3.2 所要求证据的缺口，故不得声称本批候选通过、不得合入 `main`。本报告完整保留取得的数字、未取得原因和执行偏差，供产品负责人决定后续处置；独立验收 `05D` 尚未开始。

---

## 0. 开工前置与基线

```text
$ git log --oneline -3 main
c1a6666 Restore coverage for epoch-triggered draft reset
c6241a8 Correct the ledger outer-limit error text
828b325 Cache dashboard derivations by fact generation

$ npm test
 Test Files  94 passed (94)
      Tests  1108 passed (1108)
   Duration  12.43s

$ npm run typecheck && npm run lint && npm run build
> tsc --noEmit
> eslint . --max-warnings=0
Route /: Size 348 kB; First Load JS 451 kB
```

环境记录：macOS 26.5.2（25F84），Apple M5、16 GB 内存，接通 AC 电源（100%），Node `v25.9.0`、npm `11.12.1`、Chrome `151.0.7922.171`。改动前性能数值没有重跑，逐格引用 `04C` 第 5.2（Node）、5.3（浏览器）和 5.4（S-100K／S-1M）阶段三结果，遵守 05B 1.1 的同机同种子基线规则。

---

## 1. 分支、提交与实际改动文件

```text
$ git branch --show-current
zhennn/w15-main-render-visible-only

$ git log --oneline main..HEAD
e6c360a Strengthen pagination behavior coverage
0bfc0ba Adapt activity location to pagination
be039af Paginate activity table rows
541d57d Measure rendered element counts
```

| 阶段 | 提交 | 实际文件 |
| --- | --- | --- |
| 一 | `541d57d` | `benchmarks/measure/browserMetrics.ts`、`benchmarks/measure/renderedElementCount.ts`、`benchmarks/measure/renderedElementCount.contract.ts`、`package.json` |
| 二：分页与序号 | `be039af` | `src/app/TransactionsWorkspace.tsx`、`src/features/activity/ActivityTable.tsx`、`src/features/activity/activityPagination.ts`、`src/features/activity/index.ts`、`src/app/TransactionsWorkspace.pagination.test.tsx` |
| 二：定位适配 | `0bfc0ba` | `src/app/TransactionsWorkspace.tsx` |
| 二：加强行为覆盖 | `e6c360a` | 新增的 `src/app/TransactionsWorkspace.pagination.test.tsx` |

最终差异为 9 个文件、641 行新增／14 行删除：

```text
$ git diff --stat main...HEAD
 benchmarks/measure/browserMetrics.ts               | 139 +++++++++
 .../measure/renderedElementCount.contract.ts       |  24 ++
 benchmarks/measure/renderedElementCount.ts         |  47 +++
 package.json                                       |   2 +
 src/app/TransactionsWorkspace.pagination.test.tsx  | 314 +++++++++++++++++++++
 src/app/TransactionsWorkspace.tsx                  |  97 ++++++-
 src/features/activity/ActivityTable.tsx            |  18 +-
 src/features/activity/activityPagination.ts        |  13 +
 src/features/activity/index.ts                     |   1 +
 9 files changed, 641 insertions(+), 14 deletions(-)
```

## 2. 每页行数常量

常量是 `ACTIVITY_PAGE_SIZE`，位于 `src/features/activity/activityPagination.ts`，值为 `100`。生产实现只从这个常量取页大小；改为 200 只需把该常量改为 `200`，分页函数、当前页切片、序号起点和定位页计算都会随之使用新值。测试的 T2-12 通过参数化页大小验证边界，不需要再改任何生产调用点。

## 3. 分页实现

- `TransactionsWorkspace` 继续用原来的完整 `allItems` 与 `filteredItems` 完成建表、筛选和定位索引；新增 `currentPage` 本地状态。
- `getActivityPageCount()` 与 `getActivityPageItems()` 仅在渲染边界把 `filteredItems` 切成当前页；传给 `ActivityTable` 的是 `currentPageItems`，不是完整结果集。
- 页脚显示 `共 N 条，第 X / Y 页`，空结果不显示分页器；上一页／下一页同时清除展开行。
- 既有 `resetPageState` 仍保持其原始两处调用；它没有被编辑。新增的“回第一页”是筛选控件的 `setCurrentPage(1)`，属于 U-2 的显示状态，不改筛选函数本身。
- 修订 A 的序号列位于最左：`firstItemNumber = (currentPage - 1) * ACTIVITY_PAGE_SIZE + 1`，`ActivityTable` 只据页内下标显示位置序号；空态和展开详情的 `colSpan` 均从 6 改为 7，移动端的 `ActivityCell label="序号"` 仍可见。

## 4. 定位跳转（I-6～I-8）适配

`locateTargetIndex` 在完整的 `filteredItems` 中以 `getLedgerDateKey(item.occurredAt)` 查找，目标页为 `Math.floor(index / ACTIVITY_PAGE_SIZE) + 1`。副作用先把 `currentPage` 设为目标页；仅当该页已成为当前页时才向 `ActivityTable` 传入 `locateRequest`，因而既有滚动／高亮逻辑只面对已渲染的目标行。找不到目标时仍直接传入原请求，保留既有 `"missing"` 反馈。

## 5. U-1～U-9 的实现与测试映射

| 合同 | 实现 | 守护测试 |
| --- | --- | --- |
| U-1 默认最新第一页 | `currentPage` 初值 1，完整结果原有倒序不变 | T2-01、T2-02 |
| U-2 任一筛选回第一页 | 四个筛选处理器均 `setCurrentPage(1)` | T2-06、T-B3 |
| U-3 删除留页／空页后退 | `totalPages` 变化时 clamp 当前页 | T2-07、T2-08 |
| U-4 定位到完整结果中的正确页 | 完整结果索引后计算目标页 | T2-09、T2-10 |
| U-5 翻页收起详情 | 翻页按钮先 `setExpandedItemId(null)` | T2-11 |
| U-6 总数和页码 | 页脚由完整筛选结果与 `totalPages` 输出 | T2-02、T2-04 |
| U-7 筛选集合与顺序等价 | 只切片、不改变 `filteredItems` | T2-05 |
| U-8 空／单条／不足页 | `getActivityPageCount` 最少 1，分页器仅非空显示 | T2-02、T2-03、T2-04 |
| U-9 修订 A 序号 | 页内位置加 `firstItemNumber`，不写入领域数据 | T-B1、T-B2、T-B3 |

## 6. 阶段一、二、三测试合同

| 阶段／合同 | 结果 | 实际证据或失败原因 |
| --- | --- | --- |
| T1-01 M-9 同页两次一致 | 通过 | `npm run bench:test:m9`：1 file／1 test passed；S-100 两次子树均为 2,932。 |
| T1-02 S-100／1K／10K 基线 | 通过 | 分页前 production 实测子树：3,514／34,656／346,060；两次均一致。 |
| T1-03 S-100K 前置失败记录 | 通过 | 基线沿用 04C：导航交易页失败，记录为未取得，没有为数字重试。 |
| T2-01～T2-12 | 通过 | `TransactionsWorkspace.pagination.test.tsx`：15 tests passed（含 T-B1～T-B3）。 |
| T2-13 冻结派生快照 | 通过 | `npx vitest run --config vitest.derived-snapshot.config.ts`：1 file／7 tests passed。 |
| T2-14 默认全量 | 通过 | 95 files／1123 tests passed，高于开工的 94／1108。 |
| 阶段三 Node S-100～S-100K | 通过 | S-100／1K／10K 各 n=10，S-100K n=3，均取得。 |
| 阶段三浏览器 S-100／S-1K | 通过 | dev 与 production 各 n=10，均取得且临时物清理。 |
| 阶段三浏览器 S-10K | **未完成** | dev／production 命令均自然执行结束，但采集会话在 30 秒窗口后丢失，JSON 未取得；B-16 下没有重试。 |
| 阶段三 M-9 S-10K | **未执行** | 属执行顺序偏差，不能补跑以免再破坏 05B 的既定顺序。 |
| 阶段三 M-9 S-100K | **未取得** | production 返回 `setup-failed`：`Next server did not become ready at http://127.0.0.1:65044`；未重试。 |
| 阶段三 S-1M 浏览器 dev | 前置失败（按合同记录） | `backup-serialization`：`The synthetic backup for S-1M exceeded the runtime string limit`；临时物已清理。 |

### 新增测试通电检查

每一项先临时破坏对应实现，确认指定测试变红；随后用 `apply_patch` 恢复，并在最终健康检查前确认绿。实际变红输出如下（只摘取 Vitest 的断言结论）：

| 守护行为 | 临时破坏 | 实际红灯输出 |
| --- | --- | --- |
| T2-01／02／05 | 切片改为 `PAGE_SIZE - 1` | `3 failed`：`99` 不等于 `100`；缺少第 200 条；分页并集缺少 ID。 |
| T2-04／12 | 页数改为多加 1 | `2 failed`：单条得到第 `2` 页；参数化页数得到 `3` 而不是 `2`。 |
| T2-03 | 空结果也显示分页器 | `1 failed`：找到 `流水分页`。 |
| T2-06／T-B3 | 资产筛选后设为第 2 页 | `1 failed`：序号应为 `1`，实得 `101`。 |
| T2-07 | 强制当前页总取第 1 页 | `1 failed`：期望 `page-trade-0102`，实得 `page-trade-0001`。 |
| T2-08 | 禁止总页数 clamp | `1 failed`：删除后仍为第 `2 / 1` 页。 |
| T2-09 | 定位效果强制第 1 页 | `1 failed`：期望第 3 页。 |
| T2-10 | missing 分支改成 found | `1 failed`：找不到 `missing` 反馈。 |
| T2-11 | 翻页时不清展开行 | `1 failed`：返回后仍存在 `事实 ID`。 |
| T-B1～T-B3 | `firstItemNumber` 临时加 2 | `3 failed`：首序号 `2` 非 `1`；末序号 `204` 非 `203`；筛选后首序号 `2` 非 `1`。 |
| T1-01 | 临时令 `measurementsMatch` 为 `false` | `npm run bench:test:m9`：`1 failed`，`expected false to be true`。 |

恢复输出：

```text
$ npx vitest run src/app/TransactionsWorkspace.pagination.test.tsx
 Test Files  1 passed (1)
      Tests  15 passed (15)

$ npm run bench:test:m9
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

被临时改动的四个生产／量尺文件恢复后 SHA-256 与通电前逐字节一致：

```text
browserMetrics.ts                 c32d92b2669af6800ba3e830aa7e4e7e0877eaf952013b3511c674fe3e3a109e
TransactionsWorkspace.tsx         d0a789c269abfd147906bd05be17c133a12eb9d6189b4408c7de93d6e5868150
ActivityTable.tsx                 1bc1f00cf17671fe11cb9e509eba78ef0d9ec2f782d41567723ec270d4dd64e7
activityPagination.ts             db19a4cb0655e32cf4db701015e44d876a4bdaef49919c1bbbf08c3dd2a67f5a
```

## 7. 阶段三实测与对照

执行顺序实际为：Node S-100→S-1K→S-10K；浏览器 S-100 dev→build→production→静置 5 分钟；S-1K 同序→静置 5 分钟；S-10K dev→build→production（两格输出未回收）→静置 5 分钟；Node S-100K→production n=1→dev n=1→M-9 前置失败→静置 5 分钟；最后 Node S-1M→dev n=1。前三次和 S-100K 后各已静置完整五分钟。S-10K 的两条浏览器命令因此属于已执行但数据未取得，M-9 S-10K 是执行遗漏。

### Node M-2（ms）

| 档位 | 04C 阶段三 | 本批 | 倍数（本批／04C） | 判定 |
| --- | ---: | ---: | ---: | --- |
| S-100 n=10 | 2.418 | 2.485 [2.305, 3.137] | 1.028 | 观察 |
| S-1K n=10 | 17.127 | 17.283 [16.956, 19.612] | 1.009 | 观察 |
| S-10K n=10 | 167.476 | 167.545 [165.271, 171.089] | 1.000 | ≤200 ms |
| S-100K n=3 | 1,663.762 | 1,689.721 [1,688.384, 1,708.730] | 1.016 | 高档观察 |
| S-1M n=1 | 04C 未取得 | 17,098.108 | 不可算 | 探测值 |

### Node M-7（1d／7d／30d／365d／all，ms）

| 档位 | 04C 阶段三 | 本批 | 倍数（逐项） | 判定 |
| --- | --- | --- | --- | --- |
| S-100 | .525／.776／.858／1.418／.819 | .542／.792／.868／1.396／.836 | 1.032／1.021／1.012／.985／1.021 | 观察 |
| S-1K | 5.171／5.479／5.692／6.231／5.833 | 5.221／5.546／5.759／6.312／5.780 | 1.010／1.012／1.012／1.013／.991 | 观察 |
| S-10K | 53.244／53.673／55.872／62.709／62.709 | 52.907／53.436／55.144／62.339／61.909 | .994／.996／.987／.994／.987 | 观察 |
| S-100K | 545.848／538.322／550.577／582.906／659.390 | 550.559／555.677／555.530／599.115／672.214 | 1.009／1.032／1.009／1.028／1.019 | 观察 |
| S-1M n=1 | 04C 未取得 | 5,534.750／5,568.329／5,555.096／5,855.166／6,895.576 | 不可算 | 探测值 |

### Node M-8（ms）

| 档位 | 04C 阶段三 | 本批 | 倍数（本批／04C） | 判定 |
| --- | ---: | ---: | ---: | --- |
| S-100 | .467 | .496 | 1.062 | 观察 |
| S-1K | 4.878 | 4.859 | .996 | 观察 |
| S-10K | 51.045 | 50.693 | .993 | 观察 |
| S-100K | 529.301 | 541.652 | 1.023 | 观察 |
| S-1M n=1 | 04C 未取得 | 5,530.045 | 不可算 | 探测值 |

### 浏览器 dev（ms；M-5 顺序为记账→首页／首页→记账／记账→交易／交易→记账）

| 档位 | M-1：04C→本批 | M-4：04C→本批 | M-5：04C→本批 | M-6：04C→本批 | M-3：04C→本批 |
| --- | --- | --- | --- | --- |
| S-100 n=10 | 282.787→281.854 | 37.336→37.219 | 93.311／78.415／78.566／70.505→94.172／66.268／77.704／74.310 | 29.318／27.743→29.155／27.673 | 122.493→121.948 |
| S-1K n=10 | 681.203→479.553 | 46.827→45.779 | 165.579／168.765／226.951／171.237→81.010／72.689／65.342／67.073 | 26.600／40.769→29.447／27.076 | 649.214→295.570 |
| S-10K n=10 | 4,116.119→**未取得** | 58.698→**未取得** | 1,310.751／1,321.611／2,168.164／1,459.075→**未取得** | 92.279／84.474→**未取得** | 5,929.201→**未取得** |
| S-100K n=1 | 04C 前置失败→10,789.868 | 同左→90.534 | 同左→1,218.849／2,100.546／1,229.137／1,906.565 | 同左→36.053／31.156 | 同左→19,546.456 |
| S-1M n=1 | 04C 前置失败→`backup-serialization` | 同左 | 同左 | 同左 | 同左 |

S-100／S-1K 的中位数相对 04C 倍数（M-1／M-4／M-3）分别为 `.997／.997／.996` 与 `.704／.978／.455`；未取得和 n=1 格不伪造倍数。

### 浏览器 production（ms）

| 档位 | M-1：04C→本批 | M-4：04C→本批 | M-5：04C→本批 | M-6：04C→本批 | M-3：04C→本批 |
| --- | --- | --- | --- | --- |
| S-100 n=10 | 201.014→193.524 | 28.682→28.782 | 72.436／61.658／71.054／63.608→72.917／60.585／56.302／63.521 | 29.702／29.514→29.112／29.259 | 106.054→105.849 |
| S-1K n=10 | 414.064→366.152 | 29.607→28.932 | 79.081／78.044／139.942／86.780→78.080／73.705／62.957／79.929 | 26.915／27.070→29.707／29.542 | 293.641→256.742 |
| S-10K n=10 | 1,958.299→**未取得** | 40.795→**未取得** | 379.506／369.724／1,142.587／469.983→**未取得** | 74.683／76.791→**未取得** | 2,623.643→**未取得** |
| S-100K n=1 | 04C 前置失败→8,058.147 | 同左→45.086 | 同左→521.570／1,017.808／437.264／1,024.635 | 同左→24.206／31.135 | 同左→17,155.666 |
| S-1M | 05B 允许省略 | 05B 允许省略 | 05B 允许省略 | 05B 允许省略 | 05B 允许省略 |

S-100／S-1K 的中位数相对 04C 倍数（M-1／M-4／M-3）分别为 `.963／1.003／.998` 与 `.884／.977／.874`。最终 W-1 另行取得的 S-10K production M-5（n=10）为 `97.874 [84.712, 116.936]`／`147.822 [141.903, 148.725]`／`87.546 [81.442, 89.627]`／`134.364 [133.281, 136.275]`，四格均≤200 ms；它只证明 W-2 条件，不能代替缺失的正式阶段三格。

### M-9（元素数；首次／第二次一致）

| 档位 | 分页前子树／整文档 | 分页后子树／整文档 | 与规模脱钩判定 |
| --- | --- | --- | --- |
| S-100 | 3,514／4,221 | 2,932／3,639 | 子树≤5,000，通过 |
| S-1K | 34,656／37,579 | 2,962／5,885 | 子树≤5,000，通过；比 S-100 多 30 个固定／环境元素 |
| S-10K | 346,060／370,695 | **未执行** | 不能判定 |
| S-100K | 基线未取得 | **未取得：infrastructure setup-failed** | 不能判定 |

取得的 M-9 命令实际输出（节选）：

```text
$ npm run bench:m9 -- --mode=production --scale=S-100
first/second: documentElements 3639, transactionsWorkspaceElements 2932
measurementsMatch: true; consoleErrors: []; temporaryArtifactsCleaned: true

$ npm run bench:m9 -- --mode=production --scale=S-1K
first/second: documentElements 5885, transactionsWorkspaceElements 2962
measurementsMatch: true; consoleErrors: []; temporaryArtifactsCleaned: true

$ npm run bench:m9 -- --mode=production --scale=S-100K
status: setup-failed
stage: infrastructure
reason: Next server did not become ready at http://127.0.0.1:65044
consoleErrors: []; temporaryArtifactsCleaned: true
```

## 8. 05B 3.3 的六个问题

1. **必达线未能逐格判为通过。** W-1 的 S-10K production M-5 四方向全部≤200 ms；production S-100／S-1K 的 M-6 都≤100 ms、M-4 都≤200 ms，S-10K Node M-2 为 167.545 ms≤200。但正式阶段三 S-10K 浏览器结果未取得，M-9 S-10K 未执行，M-9 S-100K 前置失败，所以 05A 4.1 的全格证据不完整，整体不得判 `PASS`。
2. **尚不能证明 M-9 已与规模完全脱钩。** S-100 与 S-1K 子树只差 30（2,932→2,962），这支持分页设计；但 S-10K 无最终测量、S-100K setup-failed，四档断言没有证据。
3. **S-100K 现在能打开交易页。** production n=1：M-4 45.086 ms，M-6 输入／删除 24.206／31.135 ms，M-5 四方向 521.570／1,017.808／437.264／1,024.635 ms；因此页面可到达，但 M-5 已高于 200 ms。dev n=1 的相应 M-5 为 1,218.849／2,100.546／1,229.137／1,906.565 ms。
4. **04 批等价性快照仍全绿。** `vitest.derived-snapshot.config.ts` 为 1 file／7 tests passed。
5. **1.9～2.3 微秒不能用新数据得到一个有效的替代常数。** W-1 的 S-10K production `record→transactions` 为 87.546 ms，已低于同批 Node M-2 的 167.545 ms；两项工作区间重叠，作差会得到负值（`-79.999 ms`），不再可归因为每个 DOM 元素。旧系数只能作为“未分页、14,000 行拥挤表”的保守上界，不能把它伪装成分页后的实测常数。
6. **按已取得的 production 用户可见值，可用性从 S-100K 开始失败；但 10K 的正式复测缺失。** S-100 为可用（M-5 最差 .073 s），S-1K 为可用（.080 s），S-100K 不可用（最差 1.025 s，n=1）；S-10K 有 W-1 的 .148 s 辅助证据却没有正式阶段三格，结论只能写为“待重做确认”，不能宣称已经把可用线推进到 10⁵。

| 档位 | M-1 | M-3 | M-4 | M-5 最差 | M-6 最差 | 当前判定 |
| --- | --- | --- | --- | --- | --- |
| S-100 | .194 s，可用 | .106 s，可用 | .029 s，可用 | .073 s，可用 | .029 s，可用 | 可用 |
| S-1K | .366 s，可用 | .257 s，可用 | .029 s，可用 | .080 s，可用 | .030 s，可用 | 可用 |
| S-10K | 正式格未取得 | 正式格未取得 | 正式格未取得 | W-1 辅助值 .148 s | 正式格未取得 | 待重做确认 |
| S-100K n=1 | 8.058 s，勉强可用 | 17.156 s，不可用 | .045 s，可用 | 1.025 s，不可用 | .031 s，可用 | 不可用 |

## 9. 最终质量门与开工基线对比

```text
$ npm test
 Test Files  95 passed (95)
      Tests  1123 passed (1123)
   Duration  15.26s

$ npm run typecheck
> tsc --noEmit

$ npm run lint
> eslint . --max-warnings=0

$ npm run build
✓ Compiled successfully
Route /: Size 349 kB; First Load JS 451 kB

$ git diff --check main...HEAD
(no output)
```

| 项目 | 开工基线 | 最终 | 对比 |
| --- | --- | --- | --- |
| 默认全量 | 94 files／1108 tests | 95 files／1123 tests | +1 file／+15 tests |
| typecheck／lint | 通过／通过 | 通过／通过 | 不变 |
| production build | 348 kB／451 kB | 349 kB／451 kB | +1 kB／不变 |
| 派生等价快照 | 7／7 | 7／7 | 不变 |
| 结构守卫 | 7／7 | 7／7 | 不变 |
| M-9 合同 | 新增 | 1／1 | 通过 |

## 10. 与 05A 的不一致及处理

产品实现没有偏离 05A；没有启用虚拟化、`table-layout: fixed`、图表改动、`TradeTable` 改动或工作区卸载。W-1 实测四个 M-5 均≤200 ms，故按 W-2 不进入 W-3／W-4。**执行证据层有偏差**：S-10K 两轮浏览器输出未回收、最终 S-10K M-9 遗漏、S-100K M-9 基础设施前置失败；均在本报告明确申报，未用重试掩盖。

## 11. 第六节待定项

**按修订 A 执行方案 B。** 新增左侧“序号”列，序号是当前筛选结果中的位置序号；T-B1～T-B3 已新增、通电并通过。序号列没有成为任何性能线放宽的理由。

## 12. 实际 import 路径（C-05）

实际新使用的稳定入口如下，均符合本批指定边界：

```text
@/core/shared                         addLedgerDays, getLedgerDateKey
@/features/activity                   ActivityTable, buildLedgerActivityItems,
                                      filterLedgerActivityItems, getActivityPageCount,
                                      getActivityPageItems, ACTIVITY_PAGE_SIZE
./activityService                     ActivityTable 内的 LedgerActivityItem 类型
./browserMetrics                      renderedElementCount 量尺入口
../generator/syntheticLedger          量尺的 SyntheticScale／档位表
```

没有为分页引入新的深层 alias；`getLedgerDateKey` 来自既有 `@/core/shared` 稳定入口。

## 13. 强制否定性声明与命令输出

1. **未改动任何文件格式或版本号。**

```text
$ git diff -- main...HEAD -- src | rg 'fileFormatVersion|cryptoVersion|ledgerSchemaVersion|backupFormatVersion' || true
(no output)
```

2. **未改动派生计算的数值。**

```text
$ git diff -- main...HEAD -- src | rg 'derived|calculate|calculation' || true
(no output)
```

3. **未修改 `TransactionsWorkspace.tsx:306` 的 `resetPageState` 调用。** 开工基线与当前文件的实际摘录完全相同：

```text
useEffect(() => {
  if (!active) resetPageState();
}, [active, resetPageState]);
useEffect(() => resetPageState(), [ledgerEpoch, resetPageState]);
```

同时，`git diff --unified=0 main...HEAD -- src/app/TransactionsWorkspace.tsx` 只显示新增 `currentPage`、页切片、定位页和筛选后的 `setCurrentPage(1)`，没有上述行的删除或新增。

4. **未改变筛选语义或 `filterLedgerActivityItems`。** 为满足 U-2，筛选控件只额外重置显示页；筛选服务没有 diff：

```text
$ git diff --unified=0 main...HEAD -- src/features/activity/activityService.ts
(no output)
```

`git show main:src/app/TransactionsWorkspace.tsx | sed -n '480,512p'` 与当前文件同一范围的 `sed -n '480,512p'` 都实际输出以下两个原样的 memo（两段输出逐字相同）：

```text
const allItems = useMemo(
  () => buildLedgerActivityItems(ledgerData),
  [ledgerData],
);
const filteredItems = useMemo(() => {
  const earliestDate =
    timeFilter === "7d"
      ? addLedgerDays(todayKey, -6)
      : timeFilter === "1y"
        ? addLedgerDays(todayKey, -364)
        : undefined;
  return filterLedgerActivityItems(allItems, {
    type: typeFilter,
    asset: assetFilter,
    ...(exactDate ? { exactDate } : {}),
    ...(timeFilter === "today" ? { exactDate: todayKey } : {}),
    ...(earliestDate ? { earliestDate, latestDate: todayKey } : {}),
  });
}, [allItems, assetFilter, exactDate, timeFilter, todayKey, typeFilter]);
```

5. **未修改既有测试的断言或阈值。** 新增一个测试文件并只在它自身内增强覆盖；不存在被修改的既有测试文件：

```text
$ git diff --diff-filter=M --name-only main...HEAD -- 'src/**/*.test.ts' 'src/**/*.test.tsx'
(no output)
```

6. **未读取 `~/Downloads/history_OKX/`。** 变更中也没有该私有区或 Downloads 引用：

```text
$ git diff --name-only main...HEAD | rg 'history_OKX|Downloads' || true
(no output)
```

7. **未执行 merge 或 push。** 分支只含四个线性执行提交、没有 merge commit；本轮没有 `git push` 调用：

```text
$ git log --merges main..HEAD
(no output)

$ git log --format='%h %s' main..HEAD
e6c360a Strengthen pagination behavior coverage
0bfc0ba Adapt activity location to pagination
be039af Paginate activity table rows
541d57d Measure rendered element counts
```

最终源码工作树仍 clean：

```text
$ git status --short
(no output)
```

本报告只说明开发执行结果；它不替代独立验收 `05D`。
