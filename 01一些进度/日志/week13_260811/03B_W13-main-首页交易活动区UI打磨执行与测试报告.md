# Week 13 main 首页交易活动区 UI 打磨执行与测试报告

日期：2026-08-13
源码轨道：`main` 产品账本
执行分支：`zhennn/w13-main-ui-polish`
最终状态：**PASS（开发执行；已发布 `main`，非独立验收）**

## 结论

已按 `03A_W13-main-首页交易活动区UI打磨执行方案.md` 完成首页“最近 365 天交易活动”区域的源码实施、两阶段本地提交、最终自动门禁、真实 Google Chrome、macOS 原生文件选择器、全新虚构 V2 `.lftl`、四档视口、Tooltip 与日期定位检查。

首页底部现在只保留“主要持仓＋最近 365 天交易活动”两卡；桌面比例约为 1:2。活动网格严格保留 365 个日期、53 个自然周列和周一至周日 7 行，使用原暖灰至深橙五级色阶。点击有交易日期会进入未筛选的完整交易列表、滚到当天第一行并短暂高亮当天全部主行；“查看全部交易”只清空筛选，不触发定位。

最终必测 9 文件为 86/86，通过两轮独立全量测试（均为 73 files / 797 tests）、typecheck、lint、production build 和两类 diff check。真实 Chrome 控制台无 error 或 warning。开发执行结束时，源码工作树 clean，停留在 `zhennn/w13-main-ui-polish`，相对当时的 `main` 为 `behind 0 / ahead 2`。

本报告只证明本轮开发在当前环境达到 `03A` 通过线，不是独立验收。2026-08-15 的后续发布收口只改变 Git 与文档状态，不改变这一证据边界。

## Git 边界与开发执行结束状态

| 仓库 | 路径 | 分支 | 起始 HEAD | 最终 HEAD | 最终状态 |
| --- | --- | --- | --- | --- | --- |
| 根文档仓库 | 工作区根目录 | `main` | `afab4b4ccff43964aee050281aba183f2d3a7ca7` | 未提交、未移动 | 保留用户原有 `.obsidian/app.json` 修改；`03A`、本报告和 3 张截图均未跟踪；无 staged 文件 |
| 源码仓库 | `01一些进度/产出/LocalFirstTradingLedger/` | `zhennn/w13-main-ui-polish` | `baae5ab094068870e7390cb98dabd95357e00c79` | `e378d32043bd432f551666808da18230a8f47120` | clean；无 staged / unstaged / untracked；相对本地 `main` 与 `origin/main` 均为 `0 / 2` |

未进入或修改 `LocalFirstTradingLedger-CS2026/`。根文档与源码没有混入同一提交。

## 2026-08-15 发布收口

- 源码 `main@baae5ab` 与 `origin/main` 同步后，以无冲突的双亲合并提交 `76213d4` 纳入两笔实现提交 `336a71d`、`e378d32`。
- 合并后的 `main` 新鲜复跑 73 files / 797 tests、typecheck、lint、production build、工作树与暂存区 `git diff --check`，全部通过。
- 源码中文 README 由 `0d0cb55` 同步 Week 13 UI 与首页交易活动区的主线事实；两个源码提交均已推送 `origin/main`。
- 本地 `zhennn/w13-main-ui-polish` 已在确认完全合并后删除；远端从未存在同名分支。源码当前留在 `main`，发布后独立核验为 clean、相对 `origin/main` 为 `0 / 0`。
- `03A`、本报告和三张截图纳入根文档仓库本次收口；源码与根文档仍分别提交、分别推送。

## 源码提交与回滚点

| 阶段 | 完整 commit | 标题 | 主要内容 | 变更规模 |
| --- | --- | --- | --- | --- |
| 1 | `336a71d41d3c4facddccc3a5cbaa15603975ebd6` | `feat: refine the home trading activity heatmap` | 365 日派生数据、资产/方向摘要、共享五级颜色、首页专用 React 日格、Tooltip、底部两卡与桌面 1:2 布局 | 9 files；531 insertions / 137 deletions |
| 2 | `e378d32043bd432f551666808da18230a8f47120` | `feat: locate transaction dates from the home heatmap` | `locateDate` / `filterDate` / `clearFilters` 语义分离，完整列表复位、平滑定位、同日多行双闪、reduced-motion 静态高亮、目标消失降级 | 14 files；659 insertions / 35 deletions |

真实浏览器复核没有发现需要改源码才能修复的明确尺寸、裁切或动画缺陷，因此未创建可选的第三笔视觉修正 commit，也没有改写前两笔历史。

## 实际实施结果

### 首页活动卡

- 首页标题为“最近 365 天交易活动”，入口为“查看全部交易”。
- 首页不再显示“最近交易”卡、最近四笔列表或相应入口。
- 1280px 及更宽桌面底部采用持仓约 1/3、活动约 2/3 的等高两卡布局。
- 首页活动网格为真实 365 个按钮式日格；周一第一行、周日第七行，最多 53 列，不补未来日期。
- 网格最大宽度为 636px并在卡片内居中；窄屏按可用宽度缩小，不丢日期。
- 五级颜色继续使用 `#eee9e2 / #f6d9b5 / #eab36f / #d9822b / #9c4f1a`；首页不显示月份、星期、年份栏或可见图例。
- `ChartsOverview` 的原完整 ECharts 语义保留，首页通过明确 `variant: "home"` 使用独立展示与交互。

### Tooltip 与活动摘要

- 有交易日 hover 显示 ISO 日期、总笔数、买入/卖出笔数；同资产同方向合并，按笔数、资产代码、买入/卖出稳定排序。
- 最多显示三组，剩余部分按隐藏的实际交易笔数显示“另有 N 笔交易”。
- Tooltip 不显示金额、手续费、估值或逐笔详情，也不使用资产代码拼 HTML。
- 空白日 hover 不显示；点击才显示 ISO 日期与“当天无交易”，且不导航。
- 鼠标离开、点击卡片外、点击另一日或页面切换会关闭 Tooltip。

### 日期定位

- 首页日格只发送 `locateDate`；原 `filterDate` 仍保持只筛一天的语义。
- 收到 `locateDate` 后，时间范围、准确日期、资产、类型筛选全部复位；详情、删除预备和临时反馈清理。
- 交易表按原排序定位该日期第一行，使用 `scrollIntoView({ behavior: "smooth", block: "center" })`。
- 目标日期的全部主行共享约 0.8 秒、两次暖色闪光；前后日期和完整列表继续存在，不自动展开详情。
- reduced-motion 使用 `behavior: "auto"` 与约 1.2 秒静态暖色高亮，不执行双闪。
- 目标事实在页面切换间发生变化时，保留完整列表并显示“该日期的交易已发生变化，已显示完整交易列表”。

## 自动验证记录

### 改动前基线

基线固定为 `baae5ab094068870e7390cb98dabd95357e00c79`，创建分支前源码工作树 clean，`main` 与 `origin/main` 为 `0 / 0`。

| 检查 | 结果 |
| --- | --- |
| `03A` 指定 9 个测试文件 | 9 files / 78 tests，PASS |
| `npm test` | 72 files / 785 tests，PASS |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0；0 warnings |
| `npm run build` | exit 0；Next.js 15.5.22，5 个静态页面；`/` 317 kB，First Load JS 420 kB |
| `git diff --check` | exit 0；源码 clean |

### 阶段提交前验证

| 阶段 | 定向测试 | 全量测试 | 静态与构建门禁 |
| --- | --- | --- | --- |
| commit 1 | 指定 9 files / 78 tests | 73 files / 789 tests | typecheck、lint、build、diff check 全部 exit 0；`/` 318 kB / 421 kB |
| commit 2 | 定位相关 5 files / 60 tests；指定 9 files / 86 tests | 73 files / 797 tests | typecheck、lint、build、diff check 全部 exit 0；`/` 319 kB / 422 kB |

commit 2 的第一次定向运行曾有 3 个测试时序失败：真实原因是 jsdom 暴露 `scrollend` 支持，而测试仍按 fallback timer 推进。测试随后改为派发真实 `scrollend`，目标消失断言也改为同步观察实际状态；没有删除测试、放宽行为合同或加入 `.skip` / `.only`。

### 最终独立重跑

| 命令 / 检查 | 最终结果 |
| --- | --- |
| `npm test --` 加 `03A` 指定 9 文件 | 9 files / 86 tests；PASS |
| `npm test` 第 1 轮 | 73 files / 797 tests；PASS |
| `npm test` 第 2 轮 | 73 files / 797 tests；PASS |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0；`eslint . --max-warnings=0` |
| `npm run build` | exit 0；Next.js 15.5.22；5 个静态页面；`/` 319 kB，First Load JS 422 kB |
| `git diff --check` | exit 0 |
| `git diff --check baae5ab...HEAD` | exit 0 |
| `.only` / `.skip` 扫描 | 无命中 |
| `debugger` / `console.log` 扫描 | 无命中 |

两轮全量 Vitest 都输出一次 `Not implemented: navigation to another Document`。这是 jsdom 对跨 Document 导航能力的既有提示；两轮退出码均为 0，没有失败或跳过。真实 Chrome 的实际导航链另行通过。

## 真实 Google Chrome 与原生文件验证

### 环境与虚构数据

| 项目 | 实际证据 |
| --- | --- |
| 浏览器 | 用户系统中的真实 Google Chrome，通过 Chrome 浏览器控制扩展操作；未使用 jsdom、组件测试或内嵌浏览器替代 |
| 服务 | 已通过 production build；`next start` 运行于 `http://127.0.0.1:3101` |
| 原生文件流程 | 在前台 Chrome 中以真实鼠标触发 `showSaveFilePicker`，再使用 macOS 原生 Save 窗口选择临时目录并创建文件 |
| V2 合同 | 新文件明文头直接确认 `fileFormatVersion: 2`；认证内容为 `ledgerSchemaVersion: 2` |
| 隔离 | 只使用 `/private/tmp/lftl-w13-ui.apeVgZ` 内本轮新建的虚构文件，未选择、打开或读取个人账本 |
| 清理 | 最终账本已锁定；Chrome 自动化标签页已结束；该临时目录与其中所有虚构 `.lftl` 已删除 |

日期控件在真实 Chrome 中不接受脚本式 `fill` 作为用户输入。第一次校准数据因此全部落在当天；发现后没有把它作为证据，而是锁定并放弃该中间文件，再通过 macOS 原生 Save picker 新建干净的 `w13-ui-final-fixture.lftl`。最终文件的数据全部由真实 Chrome 原生日期控件逐段输入，并在交易表逐行核对：

- `2025-12-31`：1 笔 BTC 买入，覆盖最近一年内的跨年边界。
- `2026-08-01`：1 笔 ADA 买入。
- `2026-08-02`：2 笔，BTC / ETH 买入。
- `2026-08-03`：3 笔，BTC / ETH / ADA 买入。
- `2026-08-04`：4 笔，BTC / ETH / ADA，且同时包含买入与卖出。
- 另保存 BTC / ETH / ADA 三项虚构手动价格，只用于让首页持仓卡与图表处于正常有数据状态。

最终共 11 笔虚构交易；1 / 2 / 3 / 4 笔日期分别呈现四个非零色阶，`2025-12-31` 与 `2026-08-01` 同属一级。没有使用个人数据、真实密码或真实金融事实。

### 四档视口与网格测量

| 视口 | document / 溢出 | 热力网格 | 结果 |
| --- | --- | --- | --- |
| 1280×800 | `scrollWidth = 1280`、`scrollHeight = 800`；无横向或纵向页面滚动 | 620.67×81.97px；365 cells / 53 columns / 7 rows；约 9.84×10.07px 日格 | 首页正常有数据状态完整落在一屏；底部持仓与活动两卡约 1:2、等高；无月份、星期、年份、图例或最近交易 |
| 1440×900 | `scrollWidth = 1440`、`scrollHeight = 900`；无横向溢出 | 达到最大宽度 636×84px；365 / 53 / 7 | 外壳最大宽度继续生效；网格居中且不继续拉伸 |
| 1100×800 | `scrollWidth = 1100`、`scrollHeight = 800`；无整页横向溢出 | 500.67×66.13px；365 / 53 / 7 | 重排边界稳定，活动卡与日格无裁切 |
| 390×844 | `scrollWidth = clientWidth = 390`；允许纵向滚动，`scrollHeight = 1974` | 314×41.47px；365 / 53 / 7 | 全部日期保留并自动缩小；整页无横向溢出 |

1280 实际非零日格颜色读取为：1 笔 `rgb(246, 217, 181)`、2 笔 `rgb(234, 179, 111)`、3 笔 `rgb(217, 130, 43)`、4 笔 `rgb(156, 79, 26)`，与五级颜色合同一致。

### Tooltip 真实交互

- hover `2026-08-04` 后，Tooltip 实际文本为：日期、`共 4 笔 · 买入 2 笔 · 卖出 2 笔`、`ADA 卖出 ×1`、`BTC 买入 ×1`、`BTC 卖出 ×1`、`另有 1 笔交易`。
- 该日位于网格右缘；Tooltip 左右边界为 `1042.91—1228px`，活动卡左右边界为 `580.33—1235px`，因此右缘约束有效，没有横向越出或被裁切。
- Tooltip 以绝对定位和高层级覆盖在活动区上方，不改变卡片或 1280×800 document 高度；其底边 `793.56px` 仍完整位于 800px 视口内。
- `2026-08-05` 空白日 hover 时 Tooltip 数量为 0；点击后只显示日期与“当天无交易”；点击卡片外后 Tooltip 数量回到 0。

### 日期定位真实交互

定位前预置旧筛选：时间“最近 1 年”、准确日期 `2026-08-02`、资产 BTC、类型买入，页面只显示 1 笔。

从首页点击 `2026-08-04` 后，真实结果为：

- 交易页恢复完整 11 行；`2026-08-04` 四行全部保留并位于列表顶部。
- 时间变为“全部时间”，准确日期为空，资产为“全部资产”，类型为“全部类型”。
- 首次动画捕获到 4 个 `[data-locate-highlight="flashing"]` 主行；四行计算样式的动画名均为 `ledger-trade-locate-flash`。
- 前后日期仍在；11 个“详情”按钮均保持收起；没有进入删除确认。
- 随后单独验证“查看全部交易”：同样恢复 11 行与全部筛选，但定位高亮数量为 0。

### 控制台与清理

- Chrome `error` / `warning` 日志读取结果为空数组。
- production 页面整个验证过程中没有应用 error、异常弹窗或文件写入错误。
- 最终先锁定账本，再删除 `/private/tmp/lftl-w13-ui.apeVgZ`；删除后以文件系统检查确认该路径不存在。
- 三张永久证据截图均为 1280×800 PNG；其余 1440、1100、390 和校准截图未写入根仓库。

## 永久截图

正常有数据首页：

![[03B_W13-main-首页交易活动区UI打磨1280x800.png]]

Tooltip 交互：

![[03B_W13-main-热力图Tooltip交互证据.png]]

交易日期定位：

![[03B_W13-main-交易日期定位高亮证据.png]]

## 业务与安全边界

| 边界 | 证据 | 结果 |
| --- | --- | --- |
| 365 日范围、跨年、闰日、未来事实、自然周排列 | `chartDataService` / `TradeHeatmapChart` 定向测试；真实 365 / 53 / 7 测量 | PASS |
| 相对色阶与极端分布 | 1/2/3/4、1/1/1/30、全零/同值测试；真实四级颜色读取 | PASS |
| `LedgerData`、交易模型、`.lftl`、BackupEnvelope、IndexedDB、加密合同不变 | baseline-to-HEAD 仅 19 个首页/导航/交易表 UI 与测试文件；禁止范围文件无 diff | PASS |
| 金额、持仓、P&L、价格与保存合同不变 | 沿用既有 selector / calculator / repository；全量 797 测试两轮通过 | PASS |
| 删除倒计时与依赖预检不变 | 交易表原测试继续通过；定位前会清理预备态但不改删除合同 | PASS |
| 页面摘要不持久化 | `activityGroups` 只存在于 `TradeHeatmapDay` 派生结构，没有进入账本或文件 | PASS |
| 个人账本不被读取 | 原生 picker 只进入本轮创建的明确临时目录；数据与密码全部虚构 | PASS |

## 偏差、限制与证据边界

1. 真实 Chrome 使用 1440×900，而不是 1440×800；这符合 `03A` 的“1440×800 或更宽”，并额外证明网格达到 636px 后不再拉伸。
2. 交易日期高亮为 0.8 秒动态双闪，永久截图只固定其中一帧；机器读取在动画期间确认 4 个目标行、`flashing` 模式与正确 CSS animation，完整时序由 fake timer 测试覆盖。
3. 本轮没有新增 axe、Playwright 或 Cypress 套件；响应式和交互证据来自现有 Vitest/Testing Library 加真实系统 Chrome，不声称穷尽所有浏览器或辅助技术组合。
4. 真实浏览器证据证明本机本轮固定成功链；目标消失、卸载清理和 reduced-motion 分支主要由自动测试覆盖。
5. 开发执行结束时，本报告、截图和 `03A` 按当时边界保持为根文档仓库未跟踪文件；2026-08-15 用户另行授权完整收口后，才纳入文档提交。

## 原执行边界与最终判定

原开发执行轮次没有 push、设置 upstream、创建 PR、merge、pull、rebase、cherry-pick、squash、amend、reset、tag 或删除分支；源码 `main`、`origin/main` 和根仓库 HEAD 当时均未移动。`.obsidian/app.json` 保持用户原有内容与未暂存状态，SHA-256 为 `9bf51938588cc38f4ac1617d096277c2501185cc7ed3b2796dcaf268fcb43d62`。后续发布操作来自 2026-08-15 的新授权，并按上一节单独记录。

最终判定为 **PASS（开发候选）**：`03A` 必需实现、两笔独立回滚点、最终自动门禁、真实 Google Chrome、原生 picker、虚构 V2 文件、四档视口、三张正式截图、Tooltip 和日期定位证据均已完成；业务、安全和双仓库边界未被削弱。该判定不得替代后续独立验收。
