# Week 13 main UI 重构执行计划

日期：2026-08-13

状态：`待后续编程 AI 执行；本文件已按 main@1a7ecb8 当前源码制定`

文档角色：程序员执行计划；说明基于当前代码具体怎么改、按什么顺序改、如何证明完成；不是产品设计记录、实现报告或验收报告

适用轨道：`01一些进度/产出/LocalFirstTradingLedger/` 的长期产品 `main`

当前源码基线：`main@1a7ecb81012594bb36b5fd22693f6fe45df844c7`

建议执行分支：`zhennn/w13-main-ui-refactor`

产品决定来源：`02A_W13-main-UI重构已确认设计记录.md`

视觉参考：`Codex 图像 2026年8月13日 00_08_19.jpg`

## 一、结论与计划状态

本计划把 02A 已确认的完整桌面端产品设计转换为八个可连续执行的工程阶段：先冻结基线与安全护栏，再依次完成入口与视觉地基、桌面外壳与解锁会话状态、首页、记账页、交易页、导入导出与设置，最后统一响应式、可访问性、反馈和真实 Chrome 验收。

实施以当前唯一的 `DashboardShell` 解锁会话为根，不为五个页面创建五套账本状态。`usePersistentLedger`、`LedgerSession`、文件 Repository、导入预检、交易校验、持仓与 P&L 计算、价格选择和 FeeRule 逻辑继续作为唯一业务与安全来源；新页面只重组展示、会话内草稿和导航意图。

本计划覆盖 02A 第三至第十四章的全部决定。第一轮必须完成完整外壳、五个入口、首页、记账、交易、导入导出、设置和安全回归，不能缩成“先做侧栏”或“先做首页”。精确 HEX、局部间距、SVG 路径、动效 easing、持仓小卡三字段和表格列宽仍是首版默认，只能在真实 1280×800 截图后微调，不能写成已确认产品合同。

本文件的创建不授权现在执行 UI 重构。真正执行时应从源码 `1a7ecb8` 新建本地功能分支；若 `main`、目录、合同或用户改动已经变化，先停止并重新核对本计划，不得把过期文件清单直接套到新现场。

## 二、输入依据与事实优先级

### 2.1 优先级

| 优先级 | 来源 | 本计划如何使用 |
| --- | --- | --- |
| 1 | 当前 `main` 源码、测试、`package.json` 和配置 | 决定现有文件、状态所有权、复用能力、测试位置和真实命令 |
| 2 | `02A_W13-main-UI重构已确认设计记录.md` | 唯一产品决定来源；决定页面、命名、交互和明确延期项 |
| 3 | `README.md`、`src/README.md`、当前开发状态 | 说明已验证能力、六区源码边界、证据边界和已知平台上限 |
| 4 | Paynix JPG | 只约束单屏网格、层级、柔和留白和卡片气质，不提供业务字段 |
| 5 | `01A_W13-main-源码目录重构执行计划.md` | 只参考“阶段—文件—检查—提交”的计划组织方式，不复制源码搬家内容 |

### 2.2 事实与目标的写法

- 下文标为“当前”的文件和行为已在 `main@1a7ecb8` 实际检查。
- 下文标为“计划新增”或“计划拆分”的文件是目标结构，不冒充当前已有文件。
- 59 个测试文件、737 项测试是 2026-08-12 最近一次已记录开发基线；本次只读制定计划没有重跑，不把历史数字写成本轮新证据。
- 项目当前没有 Playwright、Cypress 或其他正式端到端脚本；jsdom 组件测试、开发服务器观察和截图均不能替代真实 Chrome、系统 picker 和虚构 `.lftl` 流程。
- Paynix 参考中的紫色、纯图标导航、银行卡、搜索、通知、头像和 AI 助手不进入计划。

## 三、目标、范围与非目标

### 3.1 目标

1. 把解锁后的纵向长页改为固定左侧导航和右侧独立工作区。
2. 入口页、创建、解锁、重连、恢复和危险操作改用用户能理解的“账本”语义。
3. 让首页在 1280×800 正常有数据状态下一屏完成总览。
4. 让交易与价格记录成为独立记账页，并在同一解锁会话中保留草稿。
5. 让交易页具备明确筛选、详情、两次果冻确认、5 秒零写入倒计时、撤回和最终复核。
6. 把导入导出、Binance 映射、FeeRule 和清空账本移入各自低频工作区。
7. 所有写操作继续区分“内存已接受、正在保存、文件已认证保存、保存失败”。
8. 保持既有 390px 无整页横向溢出，完成键盘、焦点、减少动态效果和非颜色反馈。

### 3.2 允许修改

- `src/app/`：入口、访问 Gate、Dashboard 组合、工作区外壳、页面组合、会话级 UI 状态和持久化状态展示。
- `src/features/`：现有七个功能的 UI 拆分、只读展示选择器和对应测试；业务 Service 只在目标交互确实需要新的纯函数时扩展。
- `src/ui/`：通用卡片、图标、状态、表单和焦点等视觉积木。
- `src/app/globals.css`、`src/app/layout.tsx`、`tailwind.config.ts`：视觉 token、系统字体、元数据、语言和真实使用到的扫描范围。
- `src/platform/encryption/passphrasePolicy.ts` 及测试：唯一获准的既有校验阈值调整，8—128 个 Unicode code point。
- 与上述实现直接对应的现有测试和计划新增测试。

### 3.3 明确不修改

- 不改变 `LedgerData`、Trade、PriceSnapshot、FeeRule、Binance mapping、`.lftl V2`、BackupEnvelopeV2 或 IndexedDB connection record 格式。
- 不改变持仓、含费成本、现金影响、已实现 / 未实现盈亏、手续费规则匹配或价格选择口径。
- 不改变 PBKDF2、AES-GCM、认证元数据、current / previous、revision、readback、文件身份、权限、lease、Web Lock、恢复或安全释放合同。
- 不重写明文导入的 SHA-256 身份、零写入预检、可疑组确认、整本替换、补偿和 recovery-blocked 规则。
- 不实现交易编辑、资产页、行情中心、历史 K 线、搜索、通知、头像、账号、深色模式、Logo、密码管理器或 Touch ID。
- 不添加虚构涨跌率、收益率、占位业务数据、反向交易或静默数据修复。
- 第一轮不新增第三方 UI、图标或动画依赖，不修改 `package.json` 或 lockfile。
- 不进入 `LocalFirstTradingLedger-CS2026/`、`02_NLP/` 或 `00frappe-books-typescript/`。

## 四、当前实现基线

### 4.1 仓库与命令

| 项目 | 当前事实 |
| --- | --- |
| 源码 worktree | `01一些进度/产出/LocalFirstTradingLedger/` |
| 分支 / HEAD | `main` / `1a7ecb81012594bb36b5fd22693f6fe45df844c7` |
| 远端关系 | 当前检查 `main...origin/main = 0/0`，源码工作树 clean |
| 根文档仓库 | `main`，当前有用户改动 `.obsidian/app.json`，不得暂存或修改 |
| 框架 | Next `15.5.22`、React `19.2.8`、TypeScript、Tailwind `3.4.1`、ECharts `6.1.0` |
| 正式命令 | `npm test`、`npm run typecheck`、`npm run lint`、`npm run build`、`git diff --check` |
| 最近记录基线 | 59 test files / 737 tests，加 typecheck、lint、production build、whitespace 和真实 Chrome 虚构 V2 流程 |

### 4.2 当前页面、组件与责任

| 当前文件 | 当前事实 | UI 重构影响 |
| --- | --- | --- |
| `src/app/LedgerAccessGate.tsx` | 创建、选择、重连、解锁、恢复、锁定和会话发布；界面仍大量显示 `C`，创建密码前端写死 12—128 | 保留控制流，改入口文案和创建密码提示；不能重写 stale-operation、释放或恢复逻辑 |
| `src/app/ledgerFileAccessController.ts` | 创建 / 选择 / 解锁 `.lftl`，调用共享 passphrase policy，发布同一个 `LedgerSession` | 只随 8 字符策略补回归；文件选择和认证顺序不动 |
| `src/app/DashboardShell.tsx` | 约 1140 行；一次挂载 `usePersistentLedger`，同时组合图表、持仓、表单、FeeRule、交易列表、导入导出、清空和锁定 | 作为解锁后唯一根协调器保留，拆出外壳和五个页面，不复制 ledger state |
| `src/app/usePersistentLedger.ts` | 约 1823 行；唯一 `LedgerData` reducer、hydration、保存版本、dirty、retry、clear、import、session drain 和 stale-result 防护 | 继续是唯一持久化状态源；除必要的状态暴露或 UI 适配外不重写 |
| `src/features/trades/TradeForm.tsx` | 草稿是组件内 `useState`；类型下拉；日期初始空；金额手填；FeeRule 候选和认证保存反馈已接入 | 改为会话级受控草稿、买卖切换、日期默认、金额自动 / 手动模式；复用 Service、Validator、候选和版本反馈 |
| `src/features/prices/PriceForm.tsx` | 草稿是组件内 `useState`；日期初始空；保存后显示“已加入账本”，没有等待认证保存 | 改为会话级受控草稿，并接入 mutation / persisted version，成功只在认证保存后显示 |
| `src/features/market-data/MarketDataControls.tsx` | 同一组件同时负责估值模式、自动 / 手动刷新、状态、映射草稿和设置；`autoAttemptedRef` 只保证每次挂载一次 | 拆出会话级刷新控制和设置页映射 UI；自动刷新所有权上移，避免切页重新挂载触发 |
| `src/features/charts/ChartsOverview.tsx` | 一次显示分配、趋势和热力图；范围使用五个按钮；热力点击只筛当前长页交易表 | 拆成首页三块，保留现有 data service、option builder 和 EChart 生命周期；点击改为导航意图 |
| `src/features/portfolio/*` | `getPositionsFromLedger`、`buildLedgerPnlSummary`、`selectPriceAsOf` 提供当前持仓、P&L 和来源日期 | 首页、持仓详情和价格来源统一复用，不在页面重算 |
| `TradeTable`（当前在 `DashboardShell.tsx`） | 主行 9 列；有删除时 10 列；按账本数组顺序；详情字段全部平铺 | 移入 trades 功能，做 7 列主行、最新在前、筛选和展开详情 |
| `src/ui/ConfirmDeleteButton.tsx` | 通用两段确认；第二次点击立即执行回调；被普通 / 未来交易和 Binance 映射共用 | 不直接改成 5 秒删除；新增交易专用控制，避免破坏其他安全删除语义 |
| `src/features/backup/BackupControls.tsx` | 已有明文警告、8 MiB、零写入预检、可疑组、报告、整本替换和失败状态 | 只重排成导出 / 导入面板，保留状态机和 evidence，不复制预检逻辑 |
| `src/features/fees/FeeRuleManager.tsx` | 已有新增、冲突、版本替换、停用和认证保存反馈 | 改为设置页左右布局；旧版仍不可原地编辑或删除 |
| `src/app/globals.css` / `layout.tsx` | Slate 色、Arial fallback；metadata 仍是英文旧名；`html lang="en"` | 建立暖色 token、系统字体、等宽数字、中文 metadata 和 `zh-CN` |

### 4.3 当前安全能力必须复用

- `createValidatedTrade(...)` + `validateTradeDraft(...)`：唯一交易创建与金额容差入口。
- `validateTradeRemoval(...)`：删除前零写入时间线预检；最终删除前必须再次调用。
- `createValidatedPriceSnapshot(...)`：唯一手动价格事实创建入口。
- `matchFeeRules(...)`：精确 `platform + assetSymbol`、冲突 fail closed、用户明确采用候选。
- `getPositionsFromLedger(...)`、`buildLedgerPnlSummary(...)`、`buildHoldingAllocation(...)`、`buildHoldingHistory(...)`、`buildTradeHeatmap(...)`：首页唯一派生来源。
- `selectPriceAsOf(...)`：自动选择、优先手动、来源和日期的唯一口径。
- `refreshBinancePrices(...)` + `mergeBinancePriceRefresh(...)`：批量刷新、部分失败、旧响应丢弃和同日 upsert。
- `BackupControls` 背后的 `preflightBackupJson(...)`、preflight receipt、import evidence 和 `replaceLedgerFromBackup(...)`。
- `usePersistentLedger` 的 `mutationVersion / persistedVersion / persistenceStatus / isDirty / retryPersistence / clearLedger / drainForSessionQuiesce`。
- `LedgerSession`、`LedgerFileRepository` 和文件平台层全部安全合同。

## 五、目标页面与组件结构

### 5.1 解锁后组件树

```text
LedgerAccessGate
└── DashboardShell                       当前文件，保留唯一会话根
    ├── usePersistentLedger              当前 Hook，唯一 LedgerData / 保存链
    ├── useLedgerWorkspaceSession        计划新增，只保存会话级 UI 状态
    └── LedgerWorkspaceFrame             计划新增
        ├── LedgerSidebar                计划新增
        ├── LedgerWorkspaceHeader        计划新增，显示页名和真实文件状态
        └── 右侧工作区（一次显示一个）
            ├── HomeWorkspace            计划新增
            ├── RecordWorkspace          计划新增
            ├── TransactionsWorkspace    计划新增
            ├── TransferWorkspace        计划新增
            └── SettingsWorkspace        计划新增
```

`DashboardShell` 在五个页面切换时不能卸载，`usePersistentLedger` 不能重复创建。工作区页面可按当前页挂载，但交易草稿、价格草稿、Binance 自动刷新代次和页面跳转意图必须放在 `useLedgerWorkspaceSession` 或同级根状态中，不能再依赖子页面是否挂载。

### 5.2 计划新增的 app 文件

以下是目标文件，不是当前已有文件：

```text
src/app/LedgerWorkspaceFrame.tsx
src/app/LedgerWorkspaceFrame.test.tsx
src/app/useLedgerWorkspaceSession.ts
src/app/useLedgerWorkspaceSession.test.tsx
src/app/HomeWorkspace.tsx
src/app/HomeWorkspace.test.tsx
src/app/RecordWorkspace.tsx
src/app/TransactionsWorkspace.tsx
src/app/TransferWorkspace.tsx
src/app/SettingsWorkspace.tsx
```

页面组合属于 `app`；持仓表、图表、表单、交易表和配置面板仍属于各自 `features`。若实施时发现某个计划文件只剩转发层，可合并回 `DashboardShell.tsx`，但不得把业务 Service 搬进 app 页面。

### 5.3 计划拆分的 feature UI

| 功能 | 当前文件 | 目标拆分 |
| --- | --- | --- |
| charts | `ChartsOverview.tsx` | `PortfolioTrendChart.tsx`、`HoldingAllocationChart.tsx`、`TradeHeatmap.tsx`；保留 `EChart.tsx`、data service、option builders |
| portfolio | `ui.ts` 目前为空 | 计划新增 `HoldingsOverview.tsx`、`HoldingsDetails.tsx`，只消费既有派生结果 |
| trades | `TradeForm.tsx`；TradeTable 嵌在 Dashboard | 保留并重构 `TradeForm.tsx`；计划新增 `TradeTable.tsx`、`TradeDeleteControl.tsx` 及测试 |
| prices | `PriceForm.tsx` | 受控草稿、认证保存反馈；不新增第二套价格 Service |
| market-data | `MarketDataControls.tsx` | 计划拆为 `BinanceRefreshPanel.tsx` 与 `BinanceMappingSettings.tsx`；刷新会话状态由 app 根持有 |
| backup | `BackupControls.tsx` | 可在原文件内拆 `BackupExportPanel` / `BackupImportPanel`，共享同一个预检状态机 |
| fees | `FeeRuleManager.tsx` | 列表 / 新增详情布局，继续调用现有 reducer action 和认证版本 |

### 5.4 共享视觉积木

在 `src/ui/` 计划新增：

- `LedgerIcon.tsx`：项目内单色线性 SVG；图标名称是受控 union，不引入图标包。
- `SurfaceCard.tsx`：一级卡片边界、圆角和可选强调底；不封装业务文案。
- `FileStatusIndicator.tsx`：`已保存 / 正在保存 / 保存失败` 及非颜色图标 / 文字。
- `InlineFeedback.tsx`：就地成功、警告和错误语义。
- 对应测试，并从 `src/ui/index.ts` 走稳定入口。

不为每个按钮创建抽象层。只有至少两个页面共享且语义一致的样式才进入 `ui`。

## 六、状态所有权与页面间数据流

### 6.1 状态所有权

| 状态 | 唯一所有者 | 生命周期 | 是否持久化 |
| --- | --- | --- | --- |
| `LedgerData`、hydration、dirty、保存版本、import / clear | `usePersistentLedger` | 当前 `LedgerSession` | 仅按既有文件合同持久化 |
| 当前页面 | `useLedgerWorkspaceSession` | 当前解锁会话 | 否 |
| 交易草稿、金额自动 / 手动模式、备注展开 | `useLedgerWorkspaceSession` | 切页保留；认证保存、主动重置、锁定或切换账本清空 | 否 |
| 价格草稿、当次解锁记住的价格日期 | `useLedgerWorkspaceSession` | 切页保留；认证保存按规则清理；锁定或切换账本清空 | 否 |
| 估值价格模式、图表范围 | `useLedgerWorkspaceSession` | 当前解锁会话 | 否 |
| Binance 自动刷新是否已尝试、最近结果、进行中请求代次 | `useLedgerWorkspaceSession` + 现有 market-data Service | 每次解锁一次；切页不重置 | 价格成功结果仍走 LedgerData；控制状态不持久化 |
| 交易筛选、展开行、定位请求 | Transactions 页面状态 + 一次性导航意图 | 普通离开后清空；从首页进入时按意图建立 | 否 |
| 待删除 ID、armed、5 秒截止时间 | Transactions 页面 | 离页、锁定、页面隐藏或入口不可见立即取消 | 否，倒计时中零写入 |
| 持仓详情打开 / 触发焦点 | Home 页面 | 切页关闭 | 否 |
| 导入预检 receipt、可疑组确认、AbortController | 现有 `BackupControls` 状态机 | 当前选择与当前组件；取消 / 切页必须 revoke / abort | 否 |
| Binance 映射草稿、FeeRule 编辑草稿 | 对应设置面板 | 当前设置面板；不进入账本直到确认 action | 否 |

### 6.2 页面跳转意图

`useLedgerWorkspaceSession` 使用显式 union，不使用散落布尔值：

```text
{ page: "record"; focus: "trade" | "price" }
{ page: "transactions"; filterDate?: string; expandTradeId?: string }
{ page: "transactions"; clearFilters: true }
{ page: "home" | "transfer" | "settings" }
```

- 首页“记一笔交易”和空账本 CTA 只发 `{ page: "record", focus: "trade" }`。
- 缺价入口发 `{ page: "record", focus: "price" }`。
- 热力图发准确 `filterDate`；最近交易发 `expandTradeId`；查看全部发 `clearFilters`。
- Transactions 页面消费一次意图后清除 intent；普通离开再返回恢复全部交易。
- 页面切换必须先取消待删除倒计时并关闭持仓详情，再更新当前页。

### 6.3 写入与成功反馈

```text
表单 / 删除 / 设置操作
→ 现有 Service 或纯预检
→ applyLedgerAction / applyLedgerMutation
→ mutationVersion 增加，显示“正在保存…”
→ usePersistentLedger → LedgerFileRepository
→ write / close / same-handle readback / authentication
→ persistedVersion 追上 pending version 且 persistenceStatus = saved
→ 才显示“交易已保存 / 价格已保存 / 交易已删除 / 设置已保存”
```

`applyLedgerAction = applied` 只证明内存已接受，不证明文件已保存。保存失败时保留内存事实和草稿恢复线索，显示“仍在内存，文件尚未保存”，复用全局 `retryPersistence`；不能让用户通过再次提交制造重复事实。

## 七、分阶段执行计划

### 阶段 0：基线、分支与安全护栏

**结果**

冻结可比较的 UI、测试、Git 和安全基线；在任何生产修改前证明执行位置正确，并建立 02A 覆盖清单。本阶段不提交空 commit。

**文件范围**

- 只读核对 `AGENTS.md`、本计划、02A、源码 `README.md`、`src/README.md`、`package.json`。
- 定向复核本计划第四章列出的当前文件和测试。

**必须复用 / 禁止重写**

- 记录 `main@1a7ecb8`、source tree clean、`origin/main 0/0` 后再建分支。
- 若源码非 `main@1a7ecb8`、有用户改动或远端关系变化，停止；不得 pull、reset、stash 或吸收改动。
- 根文档 `.obsidian/app.json` 保留原样，未来源码执行不暂存根仓库任何文件。

**状态与数据流检查**

- 画出 `LedgerAccessGate → DashboardShell → usePersistentLedger → LedgerFileRepository` 现状调用链。
- 记录 TradeForm、PriceForm、MarketDataControls 当前局部状态，作为切页状态测试基线。

**测试与命令**

在源码仓库按顺序运行，不并行 build 与 typecheck：

```text
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

强制通过线：不得少于记录基线 59 files / 737 tests；若工具升级导致计数表达不同，必须逐文件证明没有测试被删、跳过或失去发现。全部命令和退出码写入执行报告或交付说明。

**浏览器通过线**

在开始重构前保存一张虚构空账本和一张虚构有数据长页的 1280×800 基线截图，只作为前后布局对照；截图不证明安全链。

**Git 边界**

从精确基线创建 `zhennn/w13-main-ui-refactor`，无 upstream，不 push、不 merge。分支创建前不修改源码。

### 阶段 1：入口文案、8 字符密码与共享视觉地基

**结果**

入口页面显示 `Zhenn's Ledger` 和统一账本语义；新建密码接受 8—128 个 Unicode 字符；建立暖白 / 淡奶油 / 香槟金 / 蜂蜜橙的首版 token、系统字体、等宽数字、卡片、图标和真实焦点样式。解锁前仍是居中单卡片，不显示侧栏。

**实际文件范围**

- 修改：`src/app/LedgerAccessGate.tsx`、`LedgerAccessGate.test.tsx`、`ledgerFileAccessController.test.ts`。
- 修改：`src/platform/encryption/passphrasePolicy.ts`、`passphrasePolicy.test.ts`。
- 修改：`src/app/globals.css`、`layout.tsx`；只有真实扫描需要变化时才改 `tailwind.config.ts`。
- 新增：`src/ui/LedgerIcon.tsx`、`SurfaceCard.tsx`、`FileStatusIndicator.tsx`、`InlineFeedback.tsx` 及测试；修改 `src/ui/index.ts`。

**必须复用**

- `LedgerAccessGate` 的 operation generation、密码清除、picker 顺序、reconnect、recovery、quiesce 和 release 原样保留。
- `validatePassphrase` 继续按 `Array.from(...).length` 计算 Unicode code point；不 trim、不 normalize，不改变 KDF 输入。

**组件、状态和数据流**

- 页面文案按 02A 第三章替换；`.lftl` 只在格式说明出现。
- `layout.tsx` 改 `lang="zh-CN"`、中文 metadata 和产品名；系统字体栈优先 `-apple-system, BlinkMacSystemFont, "PingFang SC"`，不联网加载字体。
- token 写入 `globals.css` CSS variables；首版精确色值、阴影和圆角标为可截图微调值。
- 图标必须配中文文字或准确 `aria-label`，不做纯图标导航。

**测试**

- 7 个 code point 拒绝、8 / 128 接受、129 拒绝；中文与 emoji 按 code point 验证。
- 前端与 controller 使用同一 policy，8 字符可真正进入 create，7 字符在 picker 前拒绝。
- 入口主次按钮、创建 / 解锁 / 重连 / 恢复文案无用户可见 `C`；错误信息不泄露密码。
- PasswordField 的按住查看、失焦 / disabled / submit 后恢复遮蔽回归继续通过。

**验证命令**

```text
npm test -- src/platform/encryption/passphrasePolicy.test.ts src/app/LedgerAccessGate.test.tsx src/app/ledgerFileAccessController.test.ts src/ui
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

**浏览器通过线**

- 真实 Chrome 中选择页、创建页、解锁页都是独立居中卡片；没有解锁后侧栏。
- 7 字符不打开 Save picker；8 字符 Unicode 密码可创建虚构 `.lftl`；锁定后可用同一密码重开。
- 主按钮是“选择账本”，次按钮是“新建账本”；无搜索、通知、头像或 Logo 假入口。

**独立提交**

```text
feat: establish ledger UI foundations
```

### 阶段 2：桌面应用外壳、导航与解锁会话状态

**结果**

解锁后出现固定 180—200px 中文左侧栏、右侧页名、真实文件状态和独立滚动工作区；五个页面切换不重建 `LedgerSession` 或 `usePersistentLedger`。交易 / 价格草稿、估值模式、图表范围和 Binance 自动刷新代次提升到解锁会话根。

**实际文件范围**

- 修改：`src/app/DashboardShell.tsx`、三个现有 Dashboard 测试。
- 新增：`LedgerWorkspaceFrame.tsx`、`LedgerWorkspaceFrame.test.tsx`、`useLedgerWorkspaceSession.ts`、`useLedgerWorkspaceSession.test.tsx`。
- 新增五个页面组合文件的最小真实骨架；骨架只能承载阶段后续会接入的现有能力，不显示假数据或禁用假入口。
- 拆分：`src/features/market-data/MarketDataControls.tsx` 为刷新面板与映射设置；更新 `ui.ts` 和现有测试。旧文件若变为无用入口应删除，不能保留第二套状态机。

**必须复用**

- `DashboardShell` 只调用一次 `usePersistentLedger`。
- Binance 继续使用现有 client、8 秒超时、无重试 / 轮询 / WebSocket 和 stale response 保护。
- 顶部保存状态完全来自 `persistenceStatus`、`persistenceError`、`isDirty` 和版本；不得用页面本地计时器伪造“已保存”。

**组件、状态和数据流**

- `useLedgerWorkspaceSession` 管理当前页、导航 intent、受控交易 / 价格草稿、估值模式、范围和 Binance refresh state。
- 页面切换只替换右侧内容；Dashboard、repository、session 和持久化 Hook 保持同一实例。
- `ledgerEpoch` 因整本导入或清空变化时，必须清除旧草稿、旧导航 intent、待删除状态和旧页面反馈，避免把旧资产草稿带进新账本内容。
- 自动刷新触发条件是“本次解锁首次进入 writable”，不是“记账或设置组件首次挂载”。切页不刷新；手动刷新始终可用。
- 锁定判断增加草稿：clean 且两份草稿空时一次锁定；有草稿、saving、dirty 或 error 时解释影响并确认。锁定开始立即取消倒计时、清空会话 UI 状态，再走原 drain / release。
- 页面间 intent 使用第六章 union；焦点移动在目标页完成挂载后执行并消费一次。
- 未选导航只显示图标和中文文字，当前项才使用低饱和金橙圆角条；锁定完成回到当前账本密码入口，不忘记连接、不清空文件，也不回到选择页。

**测试**

- 连续切换五页后 `usePersistentLedger` / repository 没有重新 hydrate，LedgerSession ID 不变。
- 交易和价格草稿切页返回仍存在；锁定或换账本后清空；草稿对象不出现在 backup / LedgerData。
- Binance 同一 `ledgerEpoch` / session 只自动调用一次；切五页仍一次；新解锁可再一次；旧请求在锁定、映射变化或账本变化时丢弃。
- clean lock 直接开始；草稿 / saving / error 显示准确确认；取消不 quiesce，确认仍使用原 `onFinalLock`。
- 顶部状态覆盖 idle、saving、saved、error、read-only、repository switch blocked。

**验证命令**

```text
npm test -- src/app/LedgerWorkspaceFrame.test.tsx src/app/useLedgerWorkspaceSession.test.tsx src/app/DashboardShell.interaction.test.tsx src/features/market-data/MarketDataControls.test.tsx src/app/usePersistentLedger.test.tsx
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

**浏览器通过线**

- 1280px 左栏固定，右侧正常滚动；五个中文入口和左下“锁定账本”均可操作。
- 在记账页输入未保存草稿，切到首页再回来内容不丢；Network 只看到本次解锁的一轮自动 Binance 请求。
- 切页时顶部保存状态连续，不闪回 loading，不重新要求密码。

**独立提交**

```text
feat: add persistent ledger workspace navigation
```

### 阶段 3：首页总览

**结果**

完成四张摘要卡、总市值 / 剩余成本趋势、估值模式与范围、唯一快捷记账入口、资产分布、前三持仓、365 日热力图、最近交易和完整持仓详情。1280×800 正常有数据首页无右侧整页纵向滚动；不显示假指标。

**实际文件范围**

- 新增 / 完成：`src/app/HomeWorkspace.tsx`、`HomeWorkspace.test.tsx`。
- 拆分：`src/features/charts/ChartsOverview.tsx` 为趋势、分配和热力组件及测试；继续复用 `chartDataService.ts`、`chartOptionBuilders.ts`、`EChart.tsx`。
- 新增：`src/features/portfolio/HoldingsOverview.tsx`、`HoldingsDetails.tsx` 及测试；修改 `ui.ts`。
- 修改：`DashboardShell.tsx` 只负责派生数据并传给 Home，不在 JSX 中重写公式。

**必须复用**

- 当前总市值来自 `buildHoldingAllocation(...).totalMarketValue`，缺价列表来自同一结果。
- 剩余成本、已实现、未实现来自 `buildLedgerPnlSummary(...)`。
- 趋势、分配和热力继续使用既有纯数据 Service；价格来源使用 `selectPriceAsOf(...)`。
- 完整持仓字段继续来自 `getPositionsFromLedger(...)`，不存第二份 Position state。

**组件、状态和数据流**

- 四卡固定为当前总市值、剩余持仓成本、未实现盈亏、已实现盈亏；缺价时显示未计入资产，不把值补 0。
- 趋势右上两个 select：`自动选择 / 优先手动` 和五档范围；mode / range 留在会话状态。
- 每项资产显示最终价格来源与日期；不把来源选择写入 LedgerData。
- 趋势图的总市值使用蜂蜜橙实线和淡面积、剩余成本使用灰褐虚线；常态隐藏数据点，hover tooltip 才显示准确日期和金额。
- 快捷记账整张卡可点击且是首页唯一快捷入口。资产分布只展示，不承担持仓详情跳转。持仓概览按可用当前市值降序取前三；缺价不排名但显示提示。使用 decimal compare，不把 DecimalString 转 JS float 排序。
- 最近交易按确定性事实顺序倒序取 3—4 笔，不修改原数组；同日保持原账本稳定顺序。
- 持仓详情在右侧内容区覆盖 / 扩展，支持 `×`、Escape、点外部和焦点恢复；切页关闭；reduced-motion 直接显示。
- 首页三张底卡不产生自己的纵向滚动条；超出内容只通过“查看全部持仓”、热力跳转或“查看全部交易”进入完整视图。

**测试**

- 固定含费样例的四卡、趋势和完整持仓与现有 golden 数值一致。
- 部分缺价、全部缺价、零持仓、清仓历史、异币手续费和 legacy USD 均不制造假金额。
- 自动 / 手动价格模式、同日 Binance 优先和来源日期展示与现有 selector 一致。
- 首页 CTA 发正确 focus intent；热力发准确日期；最近交易发准确 ID；查看全部清除筛选。
- 持仓详情 Escape、点外部、切页、焦点恢复和 reduced-motion。
- 首页所有列表不修改 `LedgerData` 输入。

**验证命令**

```text
npm test -- src/app/HomeWorkspace.test.tsx src/features/charts src/features/portfolio src/app/DashboardShell.golden.test.tsx
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

**浏览器通过线**

- 1280×800 有完整虚构价格的数据：首页右侧 `scrollHeight <= clientHeight`，四卡、趋势、快捷入口、资产分布和三张底卡同时可见。
- 生成 1280×800 首页实际截图，与 Paynix 只对照网格、主次、圆角和留白；不得为更像参考图添加不存在功能。
- 空账本保留外壳并显示“还没有交易记录 / 记录第一笔交易”；已有交易缺价显示更新价格入口。
- 扩大窗口只增加留白，卡片不无限拉伸；图表 tooltip 显示准确日期和金额。

**独立提交**

```text
feat: build the ledger overview workspace
```

### 阶段 4：记账页、受控草稿与认证保存反馈

**结果**

完成“新增交易 + 更新当前价格”双栏工作区。默认值、公式、平台建议、FeeRule 候选、备注和保存反馈符合 02A；切页草稿不丢，保存失败不让用户重复新增。

**实际文件范围**

- 完成：`src/app/RecordWorkspace.tsx`，新增相应 app 交互测试或并入 Dashboard interaction test。
- 修改：`src/features/trades/TradeForm.tsx`，计划新增 `TradeForm.test.tsx`。
- 修改：`src/features/prices/PriceForm.tsx`，计划新增 `PriceForm.test.tsx`。
- 修改：`src/features/market-data/BinanceRefreshPanel.tsx` 及测试。
- 必要时在 `src/app/useLedgerWorkspaceSession.ts` 增加纯 draft action；不修改 `LedgerData` reducer。

**必须复用**

- `createValidatedTrade`、交易 Validator 的 DecimalString 一致性容差、FeeRule 候选和 `calculateTradeCashImpact`。
- `createValidatedPriceSnapshot` 和现有 future / currency 边界。
- `applyLedgerAction` 的 mutation / persisted version；不要另写保存 API。

**组件、状态和数据流**

- TradeForm 改为受控 `draft + onDraftChange + onReset`；PriceForm 同理。表单可保留局部校验错误和短暂视觉反馈，但事实草稿由 session 根持有。
- 双栏顶部用短说明明确：交易改变持仓和成本，价格只改变估值和图表。
- 交易日期首次 / 保存后为 `todayKey`；类型首次 / 保存后为 buy；保存后保留资产与平台，清金额、手续费、备注，金额模式恢复 auto。
- 数量和均价合法时用 decimal helper 计算 totalValue；用户编辑 totalValue 后切 manual，数量 / 均价变化不得覆盖；明确按钮恢复 auto 并重算。Validator 容差不改。
- 平台使用 `datalist` 或等价“建议 + 可手填”，候选来自已有 FeeRule 的去重平台；最终仍保存原 platform string。
- 规则正常时显示紧凑候选；冲突时展开并要求明确选择；实际手续费始终可见且最终事实优先。
- 交易备注默认收起为“＋ 添加备注”，展开输入后保持可见；FeeRule ID、公式和来源详情不占据日常表单主区。
- 价格日期首次为今天，认证保存后在同一解锁会话保留刚才日期；资产保留，价格和备注清空。
- 价格计价货币作为输入框右侧 suffix 显示，不保留独立只读输入框；Binance 段显示本次解锁最近更新时间、成功 / 失败和“立即更新”，一次更新所有有配置且非零持仓资产。
- 两种表单 submit 后立即锁按钮并显示“正在保存…”。只有 pending version 被认证保存后清字段和显示成功；保存失败保留足够信息并引导全局重试，禁止重复 submit。
- 认证成功后表单卡使用一次 180—220ms 的轻微回弹作为首版默认；失败不播放，reduced-motion 下直接显示文字和对勾。

**测试**

- buy / sell 切换不清字段，保存成功恢复 buy；交易日期不记忆旧日期。
- 自动金额、切 manual、后续输入不覆盖、显式重算、非法 Decimal 和原容差回归。
- 平台建议去重且仍可手填；FeeRule missing / match / conflict / override / source change 全部保持 fail closed。
- 双击 / Enter 重复 submit 在 pending 期间只创建一笔；认证成功后才清草稿；失败保留草稿和单一内存事实。
- 价格日期会话记忆、锁定重置、手动保存认证反馈、Binance 失败保留旧价格。
- 草稿不出现在明文导出、`.lftl` candidate、LedgerData 或 connection record。

**验证命令**

```text
npm test -- src/features/trades/TradeForm.test.tsx src/features/trades/tradeService.test.ts src/core/validation/tradeValidator.test.ts src/features/prices/PriceForm.test.tsx src/features/prices/priceSnapshotService.test.ts src/features/fees src/features/market-data src/app/DashboardShell.interaction.test.tsx
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

**浏览器通过线**

- 1280px 双栏同时可见；较窄视口自然上下排列，无整页横向溢出。
- 输入交易和价格草稿后切五页返回仍完整；锁定确认准确说明草稿会丢失。
- 使用受控延迟 / 失败 Repository 检查按钮防重复、失败无成功动画、重试后才显示认证成功。
- Network 中手动刷新可用，自动刷新没有因进入记账页再次触发。

**独立提交**

```text
feat: streamline trade and price entry
```

### 阶段 5：交易页、详情、筛选与延迟安全删除

**结果**

完成经典横表、会话筛选、固定筛选栏 / 表头、行详情，以及交易专用的两次果冻确认、零写入预检、5 秒倒计时、撤回、离页取消、最终复核和认证保存。

**实际文件范围**

- 完成：`src/app/TransactionsWorkspace.tsx`，新增测试。
- 从 `DashboardShell.tsx` 移出 TradeTable，新增：`src/features/trades/TradeTable.tsx`、`TradeTable.test.tsx`。
- 新增：`src/features/trades/TradeDeleteControl.tsx`、`TradeDeleteControl.test.tsx`；修改 `src/features/trades/ui.ts`。
- `src/ui/ConfirmDeleteButton.tsx` 继续服务未来事实和 Binance 映射；只在共享缺陷确有证据时修改。

**必须复用**

- 第一次预检和 5 秒结束后的最终复核都调用 `validateTradeRemoval(tradeId, latestLedgerData)`。
- 最终 mutation 仍调用 `applyLedgerAction({ type: "trade/delete" })`，保存由 `usePersistentLedger` 负责。
- 未来事实纠正模式继续走原有 ConfirmDeleteButton，不被普通交易 5 秒 UI 改写。

**组件、状态和数据流**

- 主行固定：日期、类型、资产、成交金额、手续费、详情、删除。数量、均价、平台、FeeRule 来源、现金影响和备注只在展开区。
- 显示列表是 ledger trades 的不可变排序副本：最新在上；同事实时间保持稳定原顺序。筛选支持全部 / 今天 / 最近 7 天 / 最近 1 年、准确单日、资产和类型；不加平台、金额或备注搜索。
- 漏斗旁直接显示 `时间：…｜日期：…｜资产：…｜类型：…`；只有存在筛选时显示“清除筛选”。
- 初始行尾是等宽灰色“详情”和红色“删除”。第一击只 armed，红色区域向左覆盖详情并显示“再次点击删除”；点该区域外空白或 Escape 取消。第二击先纯预检。通过后设 `pendingDeleteId + deadline`，行变灰并显示进度条和“撤回”，仍在 LedgerData，5 秒内撤回零 action / 零 save。
- 同时只能一笔倒计时。开始新确认前先取消旧 pending。倒计时行禁止详情和其他操作。
- 离开交易页、锁定、document hidden、组件卸载或撤回入口不再渲染时清 timer 和 pending；不能后台完成。
- timer 到期读取最新 LedgerData 再预检；失败恢复行并显示原因；通过才 dispatch。dispatch 后等待 pending version 被认证保存，才显示“交易已删除”。
- reduced-motion 取消弹性 transform，但两次确认、5 秒和撤回语义完全相同。

**测试**

- 筛选组合、准确日、清除、离开重置、首页日期 / trade ID intent、最新在前和原数组不可变。
- 行 / 详情按钮展开同一详情；Escape 收起和焦点恢复；无编辑假按钮。
- fake timers 精确证明 4999ms 零 action / 零 save，5000ms 才第二次预检；撤回、离页、锁定、hidden、unmount 全部零写入。
- 删除支撑后续卖出的买入在首次预检拒绝；等待期间账本变化导致最终复核失败；不存在 ID 清楚报错。
- 双击、键盘 repeat 和两个交易竞争只能有一个 pending；pending 行不可展开。
- dispatch 后 save failure 不显示“交易已删除”；重试认证后才成功；倒计时从未创建反向交易。

**验证命令**

```text
npm test -- src/app/TransactionsWorkspace.test.tsx src/features/trades/TradeTable.test.tsx src/features/trades/TradeDeleteControl.test.tsx src/features/trades/tradeRemovalService.test.ts src/ui/ConfirmDeleteButton.test.tsx src/app/DashboardShell.interaction.test.tsx
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

**浏览器通过线**

- 表格右侧工作区滚动，侧栏固定；约 8—10 行密度；宽表只在局部横向滚动。
- 热力图日跳转后只显示准确日期；最近交易跳转后定位并展开；返回首页再普通进入恢复全部。
- 删除安全交易：两击 → 5 秒 → 撤回零变化；再做一次等待结束并认证保存。删除依赖买入立即拒绝。
- 倒计时中切页和锁定均取消；reduced-motion 下无果冻但语义完整。

**独立提交**

```text
feat: add transaction browsing and safe delayed deletion
```

### 阶段 6：导入导出、设置与危险操作

**结果**

完成独立导入与导出页；设置页提供行情与交易对、手续费规则、危险操作三个文字切换。低频配置离开首页，但所有原错误、安全和只读状态继续可见。

**实际文件范围**

- 完成：`src/app/TransferWorkspace.tsx`、`SettingsWorkspace.tsx` 及测试。
- 修改 / 内部拆分：`src/features/backup/BackupControls.tsx`、`BackupControls.test.tsx`。
- 修改：`src/features/market-data/BinanceMappingSettings.tsx` 及现有 mapping 测试。
- 修改：`src/features/fees/FeeRuleManager.tsx`，计划新增 `FeeRuleManager.test.tsx`。
- 修改：`DashboardShell.tsx` 的清空 UI 组合；底层 `usePersistentLedger.ts`、`ledgerRepository.ts`、`ledgerFileRepository.ts` 原则上不改。

**必须复用**

- BackupControls 当前完整状态机、8 MiB、receipt revoke、AbortController、hard error、suspicious group、report 和 import evidence。
- `replaceLedgerFromBackup(...)` 的 session-bound authorization、空 C gate、整本 candidate、补偿、readback 和 fail closed。
- Mapping 的线上验证、旧响应丢弃、显式 null、保留历史 API 价。
- FeeRule 版本替换 / 停用 action 和认证保存。
- 清空的 `READY_LEDGER_CLEAR_CONFIRMATION_TEXT` 内部授权、current / previous 和认证复读。

**组件、状态和数据流**

- Transfer 顶部常驻明文警告；左窄导出、右宽导入。按钮改用户语义，但不能把 B 叫加密 `.lftl`。
- 导入同一面板渐进显示：选择 → 预检 → 可疑组 → 完整替换确认 → 写入 / 失败 / 成功；长报告使用面板滚动，不拆多个弹窗。
- 设置默认“行情与交易对”；三切换一次只渲染一类。映射表列出资产、当前交易对、验证状态、最近结果、操作；只展开正在编辑行。
- FeeRule 左 40% 列表、右 60% 新增 / 详情；不允许原地修改历史经济字段，不物理删除。
- 危险操作首屏只显示浅红按钮；展开后说明交易、价格、FeeRule 会清空，`.lftl` 文件不会删除。
- 展开区同时显示明文备份建议和确认输入；不增加“删除账本文件”能力。

**清空确认冲突的安全解法**

02A 首版用户确认词是 `清空账本`，当前底层固定授权词是 `READY_LEDGER_CLEAR_CONFIRMATION_TEXT = 清空当前C账本`。实施不得为了界面去掉 `C` 直接改写或删除底层授权合同：

1. Settings UI 只展示并精确校验用户确认词 `清空账本`。
2. 只有 UI 校验通过后，才调用现有 `clearLedger(...)` 并传入内部 `READY_LEDGER_CLEAR_CONFIRMATION_TEXT`。
3. 内部常量继续只用于 session-bound clear authorization，不再回显给用户。
4. 测试同时证明错误用户词零调用 / 零写入，以及正确用户词仍必须通过原 session、revision、current / previous、write、close、readback 和认证链。
5. 如果实施发现该适配需要削弱 branded authorization、绕过 session port 或把用户输入直接变成无门槛 clear，停止本阶段并报告冲突，不得完成视觉效果。

**测试**

- 明文警告常驻；导出按钮只称明文账本；download failure 不声称成功。
- 预检 hard error / 可疑组 / 报告复制 / stale selection / cancel / unmount / import failure / recovery-blocked 全部保留；失败当前账本不变。
- 新建空 C 才开放完整替换；非空 / 重开 C 按现有 capability 不显示可绕过按钮。
- Mapping 只发送公开 symbol 的说明可见；验证、保存、删除、失败和历史价保留回归。
- FeeRule 冲突顶部只在真实冲突时出现；创建新版本 / 停用认证后成功，旧规则不改写。
- 清空 public / internal 两层词、取消、错误词、save/readback failure、外部 revision、锁定竞态和 previous 保留回归。

**验证命令**

```text
npm test -- src/app/TransferWorkspace.test.tsx src/app/SettingsWorkspace.test.tsx src/features/backup src/features/market-data src/features/fees/FeeRuleManager.test.tsx src/app/usePersistentLedger.fileImport.test.tsx src/app/usePersistentLedger.fileCapabilities.test.tsx src/platform/files/ledgerFileRepository.test.ts
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

**浏览器通过线**

- 导出真实虚构 B，核对浏览器下载和明文风险；用另一个全新空虚构 C 执行预检与整本替换，成功摘要与文件状态一致。
- 非空 C 不显示可绕过的替换；损坏、未来、V1、可疑重复和取消路径不写当前文件。
- Binance 映射设置、FeeRule 创建 / 版本 / 停用真实保存后锁定重开仍存在。
- 清空只清当前虚构账本内容，不删文件；重开为空，previous / 恢复合同按既有测试保持。

**独立提交**

```text
feat: reorganize import export and ledger settings
```

### 阶段 7：响应式、可访问性、动效与反馈统一

**结果**

统一所有页面的 1280、约 1100 和 390px 行为；完成键盘、焦点、可访问名称、非颜色反馈、reduced-motion 和重要错误持久展示。只调整首版视觉数值，不改变前六阶段业务语义。

**实际文件范围**

- 修改：`src/app/globals.css`、工作区 frame、五个页面和阶段 1 的共享 UI。
- 修改：相关 feature UI 的 class、aria、focus 和响应式布局。
- 修改对应组件测试；不为截图通过改 Service、Repository、数据模型或格式。

**必须复用**

- 所有状态和业务结果继续来自前述唯一来源；CSS 不能隐藏错误、只读、兼容性、future facts、外部变化或 save failure。
- EChart 继续使用现有 ResizeObserver、dispose 和事件解绑适配。

**组件、状态和数据流**

- 1280×800：首页固定一屏，内容最大宽度控制，外层 12—16px 窄边和大圆角壳。
- `<1100px`：四摘要两行，中部 / 底部重排，右侧允许纵向滚动；左栏中文不折成纯图标。
- 390px：卡片纵向排列；应用 document 无横向滚动；交易、持仓、mapping 表只在自己的容器滚动。
- 所有 focus-visible 边界清楚；图标按钮有名称；disabled 邻近有原因。
- 盈亏、warning、error 同时用文字 / 图标 / 符号，不只靠红绿。
- 所有弹性和淡入在 `prefers-reduced-motion` 下取消 transform / transition，但进度、对勾、倒计时和文字仍存在。
- 普通成功数秒淡出；save failure、read-only、兼容性、缺价、外部 revision 和 recovery-blocked 不自动消失。

**测试**

- frame、页面、表格和对话面板 class / DOM 结构具备局部 overflow 与 breakpoint。
- axe 未配置，不伪造自动无障碍 PASS；用 Testing Library role / name / focus / keyboard 断言覆盖关键路径。
- Escape：持仓详情、交易详情 / armed、清空展开按各自合同关闭；焦点回到触发器。
- reduced-motion 下操作语义和回调次数不变。
- 390 document width、1280 首页高度必须在真实浏览器测量，jsdom 只锁结构，不能证明像素结果。

**验证命令**

```text
npm test -- src/app src/features/charts src/features/trades src/ui
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

**浏览器通过线**

- 1280×800、1100px 邻界和 390×844 分别测 `document.documentElement.scrollWidth === clientWidth`。
- 首页 1280×800 正常有数据无右侧整页纵向滚动；其余页面只在右侧滚动。
- 键盘可完成导航、记账、筛选、详情、删除撤回、导入确认和锁定；焦点不丢到 body。
- 开启系统减少动态效果后，所有关键路径仍有清楚反馈。

**独立提交**

```text
fix: complete responsive and accessible UI states
```

### 阶段 8：整体回归、真实 Chrome 验收与截图微调

**结果**

用自动测试、源码检查、production build、真实 Chrome、系统 picker、虚构 `.lftl` 和 1280×800 截图分别取得独立证据；只做低风险视觉微调，不把任何一种证据冒充另一种。

**文件范围**

- 原则上不新增业务文件。
- 若截图发现首版默认色值、间距、圆角、SVG、列宽、easing 或持仓小卡字段需要调整，只修改对应 UI / CSS 和测试。
- 不因验收失败改安全合同或删测试；业务 / 安全失败回到所属阶段形成新的修复 commit。

**自动验证**

```text
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
git diff --check 1a7ecb8..HEAD
```

- 记录最终测试文件数和测试项数；不得低于 59 / 737，且新增行为必须有永久测试。
- 扫描 `.only`、`.skip`、`debugger`、`console.log/debug`、冲突标记、旧用户可见 `C` 和未授权新依赖。
- `package.json`、lockfile、LedgerData 类型、文件 / 备份合同的 diff 必须为空；若确有非预期 diff，整批不通过。

**production 启动**

```text
npm run start -- --port 3101
```

只在 `npm run build` 成功后使用 `http://127.0.0.1:3101`。真实浏览器必须是系统 Google Chrome 和系统文件选择器；内嵌浏览器、jsdom、静态截图或开发服务器页面不能替代。

**虚构测试数据与文件隔离**

1. 在系统临时目录建立本轮唯一目录，记录绝对路径；系统 picker 只进入该目录。
2. 新建虚构 V2 `.lftl`，密码和数据不得来自个人账本；完成后先安全锁定 / 释放，再只清理已记录临时目录。
3. 固定有数据样例至少包含 BTC / ETH / ADA 买入、BTC 部分卖出、实际手续费、三项手动价格、一个 active FeeRule 和 Binance 映射；金额用既有 validator 可接受的 DecimalString。
4. 另建一个全新空虚构 C，专门验证 B 预检和完整替换；不在个人文件上测试导入或清空。

**真实 Chrome 固定路径**

```text
选择页主次与无 C 文案
→ 用 8 字符 Unicode 密码创建虚构 V2 .lftl
→ 五页导航与同一解锁会话
→ 记账草稿切页保留
→ 保存交易 / 价格并等待认证成功
→ 首页四卡、趋势、分配、持仓、热力、最近交易
→ 热力准确日期筛选与最近交易定位
→ 删除预检拒绝、5 秒撤回、最终安全删除和保存失败重试
→ 明文导出
→ 锁定并重开同一虚构文件
→ 新建空虚构 C，预检并完整替换刚才的 B
→ Binance mapping、FeeRule 版本、清空确认和锁定
→ 1280×800 / 390×844 / reduced-motion / keyboard / console
```

**证据边界**

| 证据 | 可以证明 | 不能证明 |
| --- | --- | --- |
| 单元 / 组件测试 | 状态机、纯函数、回调、版本和键盘语义 | 真实 CSS 尺寸、系统 picker、文件权限 |
| typecheck / lint / build | 类型、静态规则和 production 可构建 | 页面好用、文件真正保存 |
| 1280×800 截图 | 层级、留白、单屏结构和参考气质 | 交互、认证保存、删除零写入 |
| 真实 Chrome + 系统 picker | 当前机器上的真实入口、文件、交互和响应式成功链 | 进程死亡后原子回滚或独立审查 PASS |
| Repository 对抗测试 | revision、current / previous、补偿和 fail closed | 人工视觉质量 |

**最终微调提交**

只有实际产生低风险视觉 diff 时才提交；禁止空 commit：

```text
style: tune the ledger workspace from browser review
```

任何功能或安全修复必须使用说明具体问题的独立英文 commit，不能塞进 style commit。

## 八、安全回归矩阵

| 不变量 | 受影响入口 | 强制证据 | 失败处理 |
| --- | --- | --- | --- |
| 持仓、含费成本、realized / unrealized P&L 不变 | 首页、持仓详情、交易删除 | calculators / portfolio 全测 + golden 固定金额 + 浏览器样例 | 回退页面聚合，不改计算器凑 UI |
| `Trade.totalValue` 仍不含手续费 | 记账公式、交易主行 | trade Validator / Service、cash impact 测试 | UI 显示修复，容差和事实不改 |
| `LedgerData` / `.lftl V2` / BackupEnvelopeV2 不变 | 全部写入 | 类型 diff、contract / crypto / backup 测试、导出逐字段 | 整批阻塞，禁止格式迁移 |
| 密码只改创建下限为 8—128 Unicode | 入口 | policy、Gate、controller、真实创建 / 重开 | 不改 KDF、salt、iteration 或 normalize |
| 认证、current / previous、readback 不变 | 保存、删除、清空、导入 | file repository 与 capability 全测 | 不提前显示成功，恢复原安全调用 |
| 文件权限、身份、revision、防覆盖不变 | 重连、所有写操作 | access controller、双标签 / external revision 测试 | fail closed，保留用户文件 |
| 明文预检零写入、整本替换、失败零页面替换 | Transfer | backup / file import / repository 对抗测试 | 撤销 UI 重排，不绕过 receipt |
| 同一解锁会话只创建一套 controller | 五页导航 | app instance / hydration / session tests | 状态上移，不复制 Repository |
| 草稿不进文件、备份或导出 | Record | 序列化 / export 负断言 | 将 draft 从 LedgerData 路径移除 |
| Binance 每解锁自动一次 | Record / Settings | request-count、stale response、lock tests | 把 owner 保持在 session 根 |
| 5 秒删除期间零写入 | Transactions | fake timers + repository call count | timer 状态回退，不做先删后撤回 |
| 保存成功只在认证后显示 | 所有写操作 | mutation / persisted version、失败注入 | 保留 pending / error，不使用固定延时 |
| future facts、legacy USD / V1 / IndexedDB 退役边界不变 | 全局异常区、导入、入口 | 现有 correction / rejection 全测 | 保留可见错误，不能因布局隐藏 |

## 九、自动化验证策略

### 9.1 每阶段统一顺序

1. 先运行该阶段定向测试，快速关闭局部回归。
2. 再运行完整 `npm test`。
3. 顺序运行 typecheck、lint、production build。
4. 在源码仓库运行 `git diff --check`；提交后再验证工作树 clean。
5. build 与 typecheck 不并行；失败后修复本阶段并从定向测试重新开始。

### 9.2 测试放置

- 纯业务 / selector 测试跟随 `src/features/<feature>/`。
- 页面组合、导航 intent、同会话状态和持久化反馈测试放 `src/app/`。
- 通用 visual primitive 和 delete control 的独立 DOM 语义测试跟随组件。
- Repository、file、crypto 和 import contract 测试保持原位置；UI 重构不得把这些测试搬成 mock-only 页面测试。

### 9.3 不允许的绿灯方式

- 不删除、`.skip`、`.only`、放宽断言或用 snapshot 覆盖具体业务断言。
- 不把 `setTimeout` 成功提示当认证保存。
- 不 mock 掉整个 `usePersistentLedger` 来证明关键保存、import、clear 和 lock 路径。
- 不把 EChart option 测试当 1280×800 页面测量。
- 不把浏览器成功链写成独立 acceptance PASS；若后续需要 NNC / NND，必须另建并由独立执行者运行。

## 十、视觉、响应式、可访问性与动效验收

| 维度 | 通过线 |
| --- | --- |
| 品牌与命名 | `Zhenn's Ledger`；用户可见文案无开发代号 `C`；`.lftl` 只用于格式说明 |
| 风格 | 暖白 / 奶油 / 香槟金 / 蜂蜜橙，一级卡轻浮起，内部平整；无紫色照抄、重拟态、持续动画 |
| 首页 | 1280×800 正常有数据一屏；无假涨跌率；缺价明确未计入 |
| 导航 | 五个中文入口 + 左下锁定；图标只辅助；右侧页名和文件状态常驻 |
| 数字 | 金额两位与千分位是显示格式；数量按需；等宽数字；原始精度不改 |
| 1100 / 390 | 约 1100 开始重排；390 document 不横溢；宽表局部滚动；左栏文字仍可理解 |
| 键盘 | 全入口 Tab 可达；Enter / Space 不重复提交；Escape 与焦点恢复符合详情 / 删除 / 弹层合同 |
| 非颜色表达 | 盈亏、错误、warning、missing、save state 同时有文字或图标 |
| reduced-motion | 无弹性缩放 / 淡移依赖；倒计时、确认、撤回和进度仍完整 |
| 重要反馈 | save failure、read-only、compatibility、missing price、external revision 持续可见；普通成功才可淡出 |
| Console | production 全固定路径 0 application error；第三方 / 浏览器噪声单独记录，不隐藏 |

## 十一、风险、依赖与失败处理

| 风险 | 原因 | 控制方式 |
| --- | --- | --- |
| Dashboard 拆分造成第二份账本状态 | 当前 1140 行集中组合，容易在页面各自调用 Hook | 只允许 Dashboard 根调用 `usePersistentLedger`，页面只收 props / callbacks |
| 草稿上移引入 stale closure | 表单、保存版本和 ledgerEpoch 同时变化 | reducer 化 session UI state；callback 使用最新 ref / 明确 generation；锁 epoch 测试 |
| Binance 切页重复刷新 | 当前 once-per-mount ref | 自动刷新 owner 上移到解锁会话；page component 不拥有 auto flag |
| 成功提示早于文件认证 | PriceForm 当前只显示“加入账本” | 所有操作绑定 mutation / persisted version 和 persistenceStatus |
| 5 秒 timer 删除旧账本状态 | 等待期交易或 repository 可变化 | timer 到期读取最新 ledger 并再次预检；离页 / lock / hidden 取消 |
| 清空人话破坏内部授权 | 当前用户输入和内部 token 耦合 | UI 词与内部授权词分层；底层 constant、session port 和 readback 保留 |
| Import UI 拆分丢 receipt / abort | 当前状态机集中在 821 行组件 | 同一 owner 内渐进展示；拆 view 不拆 evidence；unmount revoke 回归 |
| 一屏目标挤压错误信息 | 重要安全 warning 可能推高页面 | 正常首页一屏只针对无 active 错误；重要错误可占空间并允许右侧滚动 |
| ECharts 在隐藏页尺寸错误 | 页面切换后容器尺寸变化 | 挂载目标页后 ResizeObserver / resize；保留 dispose；真实视口测量 |
| 视觉微调扩大范围 | Paynix 易诱导加入假功能 | 只对照结构 / 气质；02A non-goals 扫描；style commit 不含业务 |
| 正式 E2E 缺失 | 当前无 Playwright | 组件 / 集成自动化 + 固定真实 Chrome 手工证据；不虚构 E2E 绿灯 |

失败处理原则：

- 任一阶段定向或全量 Gate 失败，不提交该阶段；在同一阶段内修复后完整重跑。
- 不使用 `git reset --hard`、rebase、amend、squash 或覆盖用户改动。未提交问题用定向补丁修复；已提交问题用新的修复 commit，或在用户明确批准后 revert 整个独立 commit。
- 如果 02A 视觉决定与文件安全合同冲突，安全合同优先；记录冲突和缺失证据，不以 CSS 或文案绕过。
- 真实 Chrome 无法取得系统 picker、认证保存或虚构文件证据时，自动测试仍可报告通过，但整体 UI 交付只能写 `BLOCKED`，不能写最终完成。

## 十二、建议的源码提交批次

| 顺序 | 英文提交标题 | 独立回退范围 |
| --- | --- | --- |
| 1 | `feat: establish ledger UI foundations` | 入口人话、8 字符 policy、token、基础 UI |
| 2 | `feat: add persistent ledger workspace navigation` | 单会话外壳、五页导航、草稿 / refresh owner |
| 3 | `feat: build the ledger overview workspace` | 首页与持仓 / 图表拆分 |
| 4 | `feat: streamline trade and price entry` | 受控记账 / 价格草稿和认证反馈 |
| 5 | `feat: add transaction browsing and safe delayed deletion` | 交易表、筛选、详情和 5 秒删除 |
| 6 | `feat: reorganize import export and ledger settings` | Transfer、Settings、mapping、FeeRule、clear UI |
| 7 | `fix: complete responsive and accessible UI states` | 响应式、键盘、焦点、reduced-motion、反馈统一 |
| 8（可选） | `style: tune the ledger workspace from browser review` | 仅截图后低风险视觉数值；无 diff 不创建 |

每个提交前查看完整 diff 和 staged diff，只暂存该批文件。执行分支保持本地、无 upstream；本计划不授权 merge、push、PR、tag、分支删除或修改源码 `main`。根文档和源码不能混成一个提交。

## 十三、最终 Definition of Done

只有以下全部满足，后续执行者才可报告“UI 重构开发完成”：

- [ ] 源码从精确 `main@1a7ecb8` 的本地功能分支实施，用户原改动未被吸收。
- [ ] 入口页使用 `Zhenn's Ledger` 和账本语义；8—128 Unicode 创建密码真实可用。
- [ ] 解锁后五页固定导航存在，切页不重建 LedgerSession、repository 或 `usePersistentLedger`。
- [ ] 交易 / 价格草稿切页保留，锁定 / 换账清除，且不进 LedgerData、`.lftl` 或 backup。
- [ ] Binance 每次解锁自动一次，切页不重复，手动刷新和失败降级可用。
- [ ] 首页四卡、趋势、快捷记账、分配、持仓、热力、最近交易和完整持仓详情全部来自真实账本派生。
- [ ] 1280×800 正常有数据首页一屏，无假业务数据；已生成实际截图并完成结构 / 气质对照。
- [ ] 记账页双栏、默认值、金额 auto / manual、平台建议、FeeRule、备注和认证保存反馈全部通过。
- [ ] 交易页筛选、详情、两击、零写入预检、5 秒、撤回、离页取消、最终复核和认证保存全部通过。
- [ ] 导出明文警告、导入预检 / 可疑组 / 完整替换 / 失败零替换全部保留。
- [ ] Settings 三面板完整，Mapping / FeeRule / 清空没有削弱原安全合同；用户界面无 `C`。
- [ ] 390px 无整页横向溢出；必要宽表仅局部滚动；键盘、焦点、非颜色表达和 reduced-motion 通过。
- [ ] 所有写操作在认证前不显示完成，save failure 保留可操作错误和 retry。
- [ ] 完整测试不少于 59 files / 737 tests，新增行为有永久测试；typecheck、lint、build、diff-check 全绿。
- [ ] 真实 Google Chrome + 系统 picker + 专用虚构 V2 `.lftl` 完成固定全链；console application error 为 0。
- [ ] `LedgerData`、文件 / backup 格式、会计、加密、current / previous、revision、权限、import 合同和 package / lockfile 无未授权变化。
- [ ] 提交保持小批独立；没有 merge、push、PR、tag、amend、rebase、squash 或分支删除。

自动化全绿不等于视觉完成；截图好看不等于文件保存安全；真实 Chrome 成功链不等于独立验收 PASS。三类证据必须分别报告。

## 十四、02A 第三至第十四章覆盖矩阵

| 02A 条目 | 实施阶段 | 文件 / 证据 | 状态 |
| --- | --- | --- | --- |
| 3.1 产品名、账本语义、`.lftl` 边界 | 1 | AccessGate、layout、文案扫描、真实入口 | 强制实施 |
| 3.2 选择 / 新建、8—128 Unicode | 1 | passphrase policy、Gate、controller、Chrome 创建 | 强制实施 |
| 3.3 解锁、重连、恢复人话 | 1 | AccessGate 全状态测试 | 强制实施 |
| 4.1 Paynix 借鉴 / 禁止照搬 | 1、3、8 | token、首页截图对照 | 强制约束 |
| 4.2 暖色、盈亏 / 错误分色 | 1、7 | globals、非颜色反馈测试 | 首版值可微调 |
| 4.3 系统字体、圆角、数字格式 | 1、7 | layout、globals、显示 formatter | 首版值可微调，原精度不改 |
| 4.4 项目内 SVG | 1 | LedgerIcon、无新依赖 diff | 图形可微调 |
| 4.5 真实界面 / 截图审查节奏 | 0、8 | baseline + 1280×800 final screenshot | 强制证据 |
| 5.1 固定外壳、右侧滚动、全局状态 | 2、7 | Frame、FileStatus、视口测量 | 强制实施 |
| 5.2 五导航入口 | 2 | Sidebar、导航集成测试 | 强制实施 |
| 5.3 clean / draft / saving / error 锁定 | 2 | session state、原 drain / release 测试 | 强制实施 |
| 6.1 首页一屏网格 | 3、7、8 | Home、1280 高度测量 | 强制实施 |
| 6.2 四摘要卡、缺价不补零 | 3 | PnL / allocation 复用与固定样例 | 强制实施 |
| 6.3 趋势、两选择框、来源 / 日期 | 3 | chart / price selector 测试 | 强制实施 |
| 6.4 快捷记账、资产分布 | 3 | navigation intent、allocation | 强制实施 |
| 6.5 前三持仓、365 热力、最近交易 | 3 | Home selectors、准确跳转 | 强制实施；三字段为首版默认 |
| 6.6 空账本 / 缺价入口 | 3 | 空 / 缺价组件测试 + Chrome | 强制实施 |
| 6.7 完整持仓详情与焦点 | 3、7 | HoldingsDetails keyboard / motion | 强制实施 |
| 7.1 记账双栏 | 4 | RecordWorkspace | 强制实施 |
| 7.2 表单三段顺序 | 4 | TradeForm DOM / keyboard test | 强制实施 |
| 7.3 买入 / 卖出切换和恢复 buy | 4 | controlled draft tests | 强制实施；选中色为首版默认 |
| 7.4 日期、公式、手动覆盖 / 重算 | 4 | decimal helper + Validator 回归 | 强制实施 |
| 7.5 平台建议、实际费、候选、备注 | 4 | FeeRule match 全状态测试 | 强制实施 |
| 7.6 认证保存、失败和清理规则 | 4 | mutation / persisted version 故障注入 | 强制实施；动效数值可微调 |
| 7.7 Binance / 手动价格两段 | 2、4 | refresh panel、PriceForm | 强制实施 |
| 7.8 草稿与每解锁一次刷新 | 2、4 | session owner、request count、export 负断言 | 强制实施 |
| 8.1 横表、筛选、离开重置 | 5 | Transactions / TradeTable tests | 强制实施 |
| 8.2 7 列主行、详情、无编辑 | 5 | row / detail role assertions | 强制实施 |
| 8.3 两击、5 秒、撤回、离页取消 | 5 | fake timers、最新账本复核、Chrome | 强制实施；easing 可微调 |
| 9.1 明文安全警告与双栏 | 6 | Transfer layout / warning test | 强制实施 |
| 9.2 单一明文导出 | 6 | Backup download contract | 强制实施 |
| 9.3 预检、可疑组、整本替换 | 6、8 | 原 Backup / import 全链 | 强制实施 |
| 10 设置三切换 | 6 | SettingsWorkspace | 强制实施 |
| 10.1 Mapping 表、公开 symbol 隐私 | 6 | mapping UI / client request test | 强制实施 |
| 10.2 FeeRule 40/60、版本 / 停用 | 6 | FeeRuleManager UI + reducer 回归 | 强制实施 |
| 10.3 清空账本人话与影响 | 6 | public / internal 两层词 + file repo 回归 | 强制实施；用户词为首版默认 |
| 11.1 就地反馈 + 全局保存状态 | 1、2、4—7 | shared feedback + version tests | 强制实施 |
| 11.2 克制动效 / reduced-motion | 3—5、7 | CSS / DOM / browser setting | 强制实施；数值可微调 |
| 11.3 键盘、名称、焦点恢复 | 3、5、7 | Testing Library + Chrome keyboard | 强制实施 |
| 12 响应式 1280 / 1100 / 390 | 7、8 | real viewport measurements | 强制实施；非专门手机版 |
| 13 业务、数据、加密、持久化边界 | 0—8 | 安全矩阵与现有对抗测试 | 全阶段硬约束 |
| 13 同会话、草稿、refresh owner | 2、4 | app session state tests | 强制实施 |
| 13 无第三方 UI / 动画 / 图标依赖 | 1、8 | package / lockfile diff empty | 第一轮硬约束 |
| 14.1 明确延期功能 | 0、8 | DOM / 文案 / 文件扫描无假入口 | 明确非目标 |
| 14.2 可后调视觉细节 | 3、7、8 | 可选 style commit 与截图记录 | 不阻塞结构完成 |

## 十五、执行完成前自检

1. 逐行复核第十四章矩阵，没有“已确认决定”落入未实施或假入口。
2. 比较 `1a7ecb8..HEAD`，确认文件清单全部属于 app / features / ui / 入口 policy / 样式 / 对应测试。
3. 搜索用户可见 `C`；内部常量、历史测试语境可以保留，但 UI 文案必须清零。
4. 搜索 package / lockfile、LedgerData、`.lftl`、BackupEnvelope、crypto 和 repository contract diff；未授权变化为阻塞。
5. 分别记录源码仓库与根文档仓库的 branch、HEAD、status 和 diff；不得把 `.obsidian/app.json` 或根文档混入源码提交。
6. 报告自动化、开发检查、真实文件成功链、视觉截图和独立验收的不同证据边界。
7. 在用户明确授权前，功能分支不 merge、不 push、不建 PR、不删除。

完成这些证据前，不得把“页面已经能看”或“测试全绿”写成整个 UI 重构完成。
