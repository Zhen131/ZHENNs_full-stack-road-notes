# 02C_W15-main｜首页持仓表用词统一与成本列校正执行报告

- 日期：2026-08-28
- 轨道：长期账本产品
- 源码分支：`zhennn/w15-main-holdings-wording`
- 分支起点：`main@10c243f2f25e405c88c3fc2687301310da737307`
- 最终 HEAD：`bbaafa70357741c78a2e9d8bf78bf92981008a29`
- 执行依据：`02A_W15-main-首页持仓表用词统一与成本列校正产品定义.md`、`02B_W15-main-首页持仓表用词统一与成本列校正执行文档.md`

## 结论

三个实现阶段已按“统一词表 → 首页持仓表换列 → 累计买入流出移位”的顺序完成，T-01～T-20 自动测试合同全部 `PASS`。收尾全量自动化为 93 个测试文件、1092 项测试全部通过，typecheck、lint、production build、`git diff --check` 与九项旧叫法扫描全部通过。

真实 Chrome 四项只读确认没有完成：浏览器可以连接，但唯一已存在的账本页面不是本批专用的虚构验收会话，无法证明符合“只使用虚构账本”的强制边界；确认后立即停止，没有点击或执行任何保存、删除、导入、清空、锁定操作，也没有打开任何 `.lftl` 或 B 文件。根据 `02B`“任一质量门未通过即为失败”的规则，本次开发执行候选结论为 **FAIL**，不得以自动门全绿代替真实 Chrome 证据。

源码分支未合并、未推送，最终停在 `bbaafa7`，工作树 clean。下一步应先准备一份明确的虚构账本 Chrome 会话并补齐四项只读确认；四项全部通过后，才进入独立验收 `02D`。

## 一、分支、阶段提交与实际改动文件

### 1. 阶段一：统一词表

提交：`3653415 Standardize holdings terminology across product views`

- `src/app/DashboardShell.test.ts`
- `src/app/DashboardShell.tsx`
- `src/features/charts/ChartsOverview.test.tsx`
- `src/features/charts/HoldingTrendChart.tsx`
- `src/features/charts/chartOptionBuilders.test.ts`
- `src/features/charts/chartOptionBuilders.ts`
- `src/features/portfolio/HoldingsDetails.tsx`
- `src/features/portfolio/HoldingsOverview.test.tsx`
- `src/features/portfolio/HoldingsOverview.tsx`
- `src/test-support/interfaceWording.test.ts`

结果：统一“当前持仓、剩余持仓成本、持仓均价、相对均价涨跌、已实现盈亏、未实现盈亏、累计买入流出”等界面词语，并新增扫描守卫，禁止九个旧叫法重新进入 `src/app` 与 `src/features`。

### 2. 阶段二：首页持仓表换列

提交：`938f928 Show remaining position cost in the holdings overview`

- `src/app/HomeWorkspace.tsx`
- `src/features/portfolio/HoldingsOverview.test.tsx`
- `src/features/portfolio/HoldingsOverview.tsx`

结果：首页八列表格的第七列由历史累计买入现金流出改为 `Position.costBasis`，列名为“剩余持仓成本”；移除首页持仓表对 `buyOutflowByAsset` 的依赖。手续费口径不可靠时，持仓均价、相对均价涨跌、未实现盈亏与剩余持仓成本统一显示“不可可靠计算”。首页四行布局、八列结构、`min-w-[1120px]`、现金行合并方式和前五排序保持不变。

### 3. 阶段三：累计买入流出移位

提交：`1259c8b Move cumulative buy outflow to holdings details`

- `src/app/HomeWorkspace.test.tsx`
- `src/app/HomeWorkspace.tsx`
- `src/features/portfolio/HoldingsDetails.tsx`
- `src/features/portfolio/HoldingsOverview.test.tsx`

结果：完整持仓详情面板新增最右侧第十二列“累计买入流出”，数据来自 `pnlSummary.buyOutflowByAsset`；缺少资产映射时显示 `0.00`，值不完整时显示“不可完整计算”，现金行显示“—”。面板新增说明：“累计买入流出是历史上买入一共支出的现金，不与本表其他任何列相减。”该列通过分隔线与其他持仓列区分。

### 4. 收尾清理

提交：`bbaafa7 Remove obsolete holdings summary setup`

- `src/features/portfolio/HoldingsOverview.test.tsx`

结果：删除阶段二移除旧属性后遗留的未使用测试变量，使 lint 恢复为零 warning；没有改变测试输入、业务逻辑或预期结果。

## 二、开工前全量测试基线

在正式源码改动前，于 `main@10c243f` 执行 `npm test`：

- 测试文件：92 个通过，0 个失败。
- 测试用例：1081 项通过，0 项失败。
- `cryptoEncoding` 大载荷往返测试：本次默认全量运行未超时，正常通过。

## 三、测试合同 T-01～T-20

| 编号 | 结果 | 实际证据 |
| --- | --- | --- |
| T-01 | PASS | `HoldingsOverview.test.tsx` 的 T-01～T-05 虚构 BTC 样例逐格断言第七列读取剩余持仓成本。 |
| T-02 | PASS | 同一虚构样例断言当前市值、剩余持仓成本与未实现盈亏满足合同关系。 |
| T-03 | PASS | 同一虚构样例断言持仓均价与相对均价涨跌读取剩余仓位口径。 |
| T-04 | PASS | 同一虚构样例断言首页不再显示累计买入流出原值。 |
| T-05 | PASS | 同一虚构样例完整核对八列顺序、显示值和正向颜色。 |
| T-06 | PASS | 新增虚构 ETH 外部转出场景，剩余成本、当前市值与未实现盈亏分别按合同来源显示。 |
| T-07 | PASS | 新增虚构 SOL 赠与加买入场景，剩余成本与累计买入流出明确分离，首页不显示后者。 |
| T-08 | PASS | 既有外币手续费不可靠场景扩充断言：持仓均价、相对均价涨跌、未实现盈亏和剩余持仓成本均显示“不可可靠计算”。 |
| T-09 | PASS | 新增缺当前价格与缺市值的回退场景；不可计算提示及不进入前五排名的行为保持正确。 |
| T-10 | PASS | 既有 T3-02 零均价场景继续显示“不可计算”，没有除零或抛错。 |
| T-11 | PASS | 新增未实现盈亏不完整场景；未实现盈亏显示“不可完整计算”，剩余持仓成本仍保留。 |
| T-12 | PASS | `interfaceWording.test.ts` 扫描 `src/app` 与 `src/features`，九个旧叫法命中列表为空。 |
| T-13 | PASS | `HomeWorkspace.test.tsx` 断言首页指标、概览表和详情面板使用同一套新词。 |
| T-14 | PASS | 完整持仓详情面板最右侧存在“累计买入流出”列，读取 `pnlSummary.buyOutflowByAsset`。 |
| T-15 | PASS | 详情面板显示固定说明文字，明确该列不与其他列相减；视觉分隔断言通过。 |
| T-16 | PASS | 资产无映射时显示 `0.00`；`value === undefined` 时显示“不可完整计算”并保留原因提示。 |
| T-17 | PASS | 现金行的累计买入流出列显示“—”。 |
| T-18 | PASS | `positionReplay.ts`、`pnlSummaryService.ts` 及对应既有测试相对 `main` 均无 diff；相关回归与 T-19 组合复跑为 3 个文件、32 项测试全部通过。 |
| T-19 | PASS | `ledgerNumberDisplayBoundary.test.ts` 的“save, export and re-import DecimalString values byte-for-byte identical”既有用例原样通过。 |
| T-20 | PASS | 新增同市值按币种名字母序场景通过；既有按市值降序取前五回归继续通过。 |

T-01～T-20 最终失败项：无。

## 四、统一自动质量门与基线对比

最后一笔源码／测试改动是 `bbaafa7`。其后在同一代码树上重新执行完整自动质量门：

| 质量门 | 实际命令 | 实际结果 | 结论 |
| --- | --- | --- | --- |
| 全量测试 | `npm test` | 93 个测试文件、1092 项测试全部通过，0 失败；`cryptoEncoding` 大载荷测试未超时；耗时约 12.52 s | PASS |
| 类型检查 | `npm run typecheck` | `tsc --noEmit`，0 error | PASS |
| 静态检查 | `npm run lint` | `eslint . --max-warnings=0`，0 warning / 0 error | PASS |
| production build | `npm run build` | Next.js 15.5.22 编译成功，5/5 静态页生成；`/` 为 347 kB，First Load JS 为 449 kB；`/_not-found` 为 993 B，First Load JS 为 103 kB | PASS |
| 当前差异检查 | `git diff --check` | 无输出 | PASS |
| 分支完整差异检查 | `git diff main...HEAD --check` | 无输出 | PASS |
| 受保护实现检查 | `git diff main...HEAD -- src/core/calculations/positionReplay.ts src/features/portfolio/pnlSummaryService.ts` | 无输出 | PASS |
| 源码状态 | `git status --short --branch` | `zhennn/w15-main-holdings-wording`，工作树 clean | PASS |

与基线相比，测试文件由 92 增至 93（+1），测试用例由 1081 增至 1092（+11），失败项均为 0；基线和收尾两次默认全量运行的 `cryptoEncoding` 大载荷测试均未超时。

首次统一 lint 曾发现 `HoldingsOverview.test.tsx` 中一个已失去用途的测试变量，报告为 1 个 warning；以 `bbaafa7` 删除该变量后，重新执行相关测试、lint、diff-check 与上述完整收尾门，最终结果为零 warning、零 error。没有通过改动计算结果或测试输入规避失败。

## 五、真实 Chrome 四项只读确认

浏览器连接可用，但没有可合规使用的虚构账本会话。唯一已存在的账本页面不是本批专用验收会话，无法证明其中数据为虚构；发现后立即停止。没有点击“查看全部持仓”或其他按钮，没有保存价格、删除事实、导入、清空或锁定账本，也没有打开任何 `.lftl` 或 B 文件。

| Chrome 项目 | 实际结果 | 结论 |
| --- | --- | --- |
| 1. 首页八列表头为合同指定新词 | 未执行；缺少明确的虚构账本会话 | FAIL |
| 2. 任取一行手算当前市值减剩余持仓成本 | 未执行；缺少明确的虚构账本会话 | FAIL |
| 3. 查看全部持仓存在累计买入流出列与说明 | 未执行；为保持只读边界，没有点击现有页面 | FAIL |
| 4. 顶部指标卡与下方表格用词一致 | 未执行；缺少明确的虚构账本会话 | FAIL |

本节没有复用既有页面内容，也没有伪造结论。依 `02B` 质量门规则，四项未通过使本次开发执行候选整体判定为 `FAIL`。

## 六、九个旧叫法扫描

扫描范围：`src/app`、`src/features`。

| 旧叫法 | 剩余命中数 |
| --- | ---: |
| `总花费` | 0 |
| `盈亏金额` | 0 |
| `平均购价` | 0 |
| `涨跌幅` | 0 |
| `含费平均成本` | 0 |
| `剩余含费成本` | 0 |
| `已实现净盈亏` | 0 |
| `未实现净盈亏` | 0 |
| `累计买入总支出` | 0 |

扫描守卫作为 `src/test-support/interfaceWording.test.ts` 纳入全量测试；直接扫描与自动守卫结果一致。

## 七、与 02A 产品决定不一致之处

实现内容与 `02A` 产品决定没有不一致之处；`02A` 与修订后的 `02B` 之间也没有发现需要自行取舍的冲突。

执行结果层面存在一项未完成：真实 Chrome 四项没有取得合规的虚构账本证据。该项没有以自动测试代替，也没有自行放宽产品或安全边界，已按 `02B` 判为失败并留待补做。

## 八、按 B-09 更新的预期输出断言

本批只更新了一条既有预期输出数值：

| 文件 | 断言位置 | 旧值 | 新值 | 合同依据 |
| --- | --- | ---: | ---: | --- |
| `src/features/portfolio/HoldingsOverview.test.tsx` | `T3-01 renders all eight fixed-ledger columns with exact values`，首页 BTC 行第七格 `cells[6]`；当前位于第 259 行 | raw/title `6505`，可见 `6,505.00` | raw/title `3903`，可见 `3,903.00` | `02B` 2.1、2.2：第七列改读 `Position.costBasis`；修订后的 B-09：数据来源改变时必须把预期输出更新为新来源的正确值 |

没有修改该测试的交易、价格、数量、现金事件或其他输入夹具数值。其余新增数值断言均属于本批新建用例自带的全虚构输入，不属于既有断言的旧值更新。

## 九、边界与禁止事项声明

- 未读取、引用或复制 `~/Downloads/history_OKX/` 下任何内容。
- 没有真实账户数字进入源码、测试夹具、注释、提交信息或本文档。
- 未修改 `src/core/calculations/positionReplay.ts`。
- 未修改 `src/features/portfolio/pnlSummaryService.ts` 的任何计算逻辑；该文件本批无 diff。
- 未修改任何既有测试输入夹具数值；只按 B-09 更新了一条数据来源已经改变的预期输出，并为本批新增用例使用虚构输入。
- 未改动加密、备份信封、文件外壳、导入准入、锁定与出错即关闭逻辑。
- 未改动首页四行布局、首页表格八列结构或 `min-w-[1120px]`。
- 未进入、读取或改动 `LocalFirstTradingLedger-CS2026/`。
- 未执行 merge、push、rebase、cherry-pick 或破坏性 Git 命令；源码分支未合并回 `main`。

## 十、下一步

先由用户或后续执行者提供一份明确的虚构账本 Chrome 会话，仅以只读方式补做四项确认。若四项全部通过，应重新执行受影响的收尾核对并据实修订本报告结论；之后再把冻结源码候选交给另一执行者完成独立验收 `02D`。在此之前，不把本批称为开发执行候选 `PASS`。
