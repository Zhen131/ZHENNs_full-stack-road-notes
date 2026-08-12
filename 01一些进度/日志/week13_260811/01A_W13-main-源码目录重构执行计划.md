# Week 13 main 源码目录重构执行计划

日期：2026-08-12

状态：待 Codex 目标模式执行

文档角色：开发执行输入；不是执行报告

源码轨道：`01一些进度/产出/LocalFirstTradingLedger/` 的长期产品 `main` 轨道

固定基线：`main@7481e781dffcd4f444e151d6baaf8778e5b9d170`

目标分支：`zhennn/w13-main-source-layout`

唯一执行报告：`01B_W13-main-源码目录重构执行报告.md`

## 结论

本批只整理 `LocalFirstTradingLedger/src` 的目录、文件位置、稳定入口、引用地址、结构守卫和源码说明，不改变任何业务逻辑或运行行为。执行 AI 必须从固定基线创建功能分支，按五个阶段完成搬家；每个阶段完整运行自动检查并形成一个独立回退提交。五阶段全部完成后，再使用真实 Google Chrome 和专用虚构 `.lftl` 做冒烟测试，最后生成 01B。

本文件只授权目标模式执行下文操作。它不授权合并、推送、修改源码 `main`、接触真实个人账本，也不允许把自动测试全绿替代真实 Chrome 证据。

## 一、最终交付与完成状态

执行成功时必须同时得到：

1. 源码仓库停留在本地分支 `zhennn/w13-main-source-layout`，以 `7481e78` 为唯一父基线，包含下文固定的五个独立提交。
2. `src` 只保留 `app / core / features / platform / ui / test-support` 六类职责区域和 `README.md`；功能目录保持扁平，不预建未实现模块。
3. 所有跨边界引用通过稳定入口；受 Git 管理的源码引用中不存在 `../` 和绕过入口的深层 import。
4. 既有 58 个测试文件、727 项测试不得减少；第五阶段新增结构测试后，总数必须高于基线。
5. 五阶段检查、最终重复检查和真实 Chrome 冒烟测试全部通过。
6. 根文档仓库新增中文 01B 并单独提交；源码分支与根文档仓库均不推送。

若存在无法消除的前置条件、自动检查或真实 Chrome 证据缺口，01B 必须写 `BLOCKED`。不得把部分搬完、测试没降或页面能打开写成 `PASS`。

## 二、不可突破的范围

### 2.1 允许修改

- 产品源码仓库中的 `src/**` 文件位置、文件间 import / export 地址和稳定入口文件。
- 为解析 `@/`、`@root/` 增加必要配置的 `tsconfig.json`、`vitest.config.ts`。
- 为结构守卫修改 `eslint.config.mjs`。
- 为新界面位置分阶段修改 `tailwind.config.ts` 的扫描路径。
- 根 `README.md` 的简短英文源码地图和新增英文 `src/README.md`。
- 永久结构测试，以及测试专用 `NoopEncryptionService` 的归位。
- 最终中文 01B；不得修改本文件来回填结果。

### 2.2 明确禁止

- 不改函数体、算法、数据类型、公开导出符号、错误语义、用户文案、CSS 样式、Tailwind class、运行流程或浏览器行为。
- 不改 `LedgerData`、`.lftl`、备份、IndexedDB connection record、加密、版本、手续费、P&L 或校验合同。
- 不处理下载文件名中的 `backup-v1`，不拆分巨型文件，不做 UI 美化，不顺手修复无关问题。
- 不删除生产代码、正式测试、安全检查、旧格式拒绝链或 legacy 兼容边界。
- 不增加依赖，不修改 `package.json`、`package-lock.json` 或其他 lockfile。
- 不进入或修改 `LocalFirstTradingLedger-CS2026/`、`02_NLP/`、外部参考项目和真实个人账本。
- 不生成 01C / 01D，不写 `99` 每日日志，不更新 `00-当前开发状态.md`。
- 禁止 tag、amend、squash、rebase、cherry-pick、reset、PR、分支删除、merge、push 和设置 upstream。

唯一允许的生产文件改名为：

```text
src/backup/backupContentIdentity.ts
→ src/platform/persistence/ledgerContentIdentity.ts
```

其导出符号名称必须原样保持。其他生产文件只移动，不改 basename。

## 三、执行前 Gate

### 3.1 分别核对两个 Git 仓库

开始前必须记录根文档仓库和源码仓库的绝对路径、branch、HEAD、status、staged / unstaged / untracked、diff 与相对各自 `origin/main` 跟踪引用的 ahead / behind。不得 fetch 或 pull 来改变现场。

源码写入只在以下条件全部成立时开始：

| 检查 | 强制通过线 |
| --- | --- |
| worktree | 绝对路径精确指向 `01一些进度/产出/LocalFirstTradingLedger/` |
| 当前分支 | `main` |
| 当前 HEAD | 完整提交精确等于 `7481e781dffcd4f444e151d6baaf8778e5b9d170` |
| 工作树 | clean，无 staged / unstaged / untracked 的源码相关改动 |
| 远端跟踪引用 | 本地记录 `origin/main` 与本地 `main` 为 `0/0`；若现场不同，停止，不自行同步 |
| 用户改动 | 不存在与本批重叠或来源不明的改动 |

任一项不符，立即停止源码写入并生成 `01B = BLOCKED`，写清实际现场。不得覆盖、吸收、暂存或清理用户改动。

### 3.2 搬家前基线

在源码 `main@7481e78` 依次运行，禁止并行运行 build 与 typecheck：

```text
npm test
npm run lint
npm run build
npm run typecheck
git diff --check
```

基线必须为 58 个测试文件、727 项测试，且其余检查全绿。若检查失败，先确认是否为环境问题；无法在不改源码的情况下取得基线时，生成 `01B = BLOCKED`。

基线通过后，从当前提交创建并切换到：

```text
zhennn/w13-main-source-layout
```

创建后确认分支无 upstream、HEAD 仍是 `7481e78`、工作树 clean。不得在 `main` 上移动任何源码文件。

## 四、最终目录与放置合同

```text
src/
├── app/              Next.js 入口、访问控制、Dashboard、运行期持久化流程
├── core/
│   ├── calculations/ 持仓、盈亏、现金影响
│   ├── catalog/      内置资产
│   ├── models/       账本数据类型
│   ├── policies/     事实与导入规则
│   ├── shared/       Decimal 与账本日期
│   ├── state/        初始账本与 reducer
│   └── validation/   运行期校验
├── features/
│   ├── backup/
│   ├── charts/
│   ├── fees/
│   ├── market-data/
│   ├── portfolio/
│   ├── prices/
│   └── trades/
├── platform/
│   ├── coordination/
│   ├── encryption/
│   ├── files/
│   ├── integrations/
│   ├── legacy/
│   └── persistence/
├── ui/               通用界面积木
├── test-support/     测试数据、替身和结构测试
└── README.md         详细源码放置规则
```

### 4.1 旧目录到新目录

| 现有职责 | 最终位置 |
| --- | --- |
| `calculators/*` | `core/calculations/` |
| `data/builtInAssets*` | `core/catalog/` |
| `models/*` | `core/models/` |
| `policies/*` 与 `services/ledgerFactCreationPolicy.test.ts` | `core/policies/` |
| `utils/*` | `core/shared/` |
| `state/initialLedgerData*`、`state/ledgerReducer*` | `core/state/` |
| `validators/*` | `core/validation/` |
| `test/*`、`encryption/noopEncryptionService*` | `test-support/` |
| 文件句柄、连接记录、文件 Repository、文件合同与文件加密 | `platform/files/` |
| `repositories/ledgerRepository*`、改名后的内容身份文件 | `platform/persistence/` |
| `cryptoEncoding*`、`ledgerKeyDerivation*`、`passphrasePolicy*` | `platform/encryption/` |
| Binance client 与 types | `platform/integrations/` |
| 文件会话协调器 | `platform/coordination/` |
| 旧 IndexedDB、旧 envelope / encryption service、`ledgerAccessController`、其 legacy repository 测试 | `platform/legacy/` |
| 备份逻辑和 `BackupControls*` | `features/backup/` |
| 图表组件、option builders、chart data service | `features/charts/` |
| `FeeRuleManager` 与 fee rule service | `features/fees/` |
| `MarketDataControls`、mapping 与 price refresh service | `features/market-data/` |
| P&L、position、price selection、valuation display | `features/portfolio/` |
| `PriceForm` 与 price snapshot service | `features/prices/` |
| `TradeForm`、trade service 与 trade removal service | `features/trades/` |
| Dashboard、访问 Gate、应用 composition、持久化 hook、hydration state | `app/` |
| `ConfirmDeleteButton*` | 扁平的 `ui/` |

测试必须跟随被测职责进入同一区域。功能自己的界面、逻辑和测试放在同一功能目录，保持扁平；不额外建立 `components / services / tests` 子目录。`app/fonts`、`favicon.ico`、`globals.css` 和 Next.js 入口保持在 `app` 内。

## 五、稳定入口与引用合同

### 5.1 稳定入口

- `core` 与 `platform` 的每个二级区域提供 `index.ts`。
- 每个 `features/<feature>` 使用 `index.ts` 只暴露逻辑，使用 `ui.ts` 只暴露界面。
- `app/index.ts` 只暴露跨功能需要的稳定应用类型，优先使用 type-only export，避免运行期循环依赖。
- `ui/index.ts` 和 `test-support/index.ts` 提供各自稳定入口。
- 同一目录内使用 `./file`；跨边界只允许以下形式：

```text
@/core/<area>
@/platform/<area>
@/features/<feature>
@/features/<feature>/ui
@/app
@/ui
@/test-support
@root/package.json
```

### 5.2 禁止形式

- 任何跨父目录的 `../`。
- `@/core/<area>/<internal-file>`、`@/platform/<area>/<internal-file>`。
- 除 `/ui` 外的 `@/features/<feature>/<internal-file>`。
- `@/app/<internal-file>`、`@/ui/<internal-file>`、`@/test-support/<internal-file>`。
- `@root/` 读取除根 `package.json` 外的文件。

配置 `@/` 和 `@root/` 时必须同时覆盖 TypeScript、Next.js 和 Vitest 解析，不得靠测试中的特殊相对路径绕开合同。本批只建立稳定地址，不强制一套全新的依赖方向；保存层现有的备份预检证据安全核验必须原样保留。

## 六、五阶段执行

每阶段都遵循同一顺序：移动与修正引用 → 搜索残留 → 查看完整 diff → 运行全部检查 → 暂存本阶段 → 再查 staged diff → 提交 → 验证分支与工作树。检查失败必须在本阶段内修复并从头重跑；未全部通过不得提交。

### 阶段 1：Core 与测试地基

1. 在 `tsconfig.json` 保留 `@/*` 并增加 `@root/*`；在 `vitest.config.ts` 增加两类 alias 解析。
2. 按放置表移动 models、calculators、validators、policies、state、data、utils 及其测试。
3. 将 `src/test/*` 和测试专用 `NoopEncryptionService` 收入 `test-support`；生产 composition 不得新增对 Noop 的引用。
4. 为七个 core 二级区和 test-support 建立稳定入口。
5. 更新全仓引用；未搬区域可以暂时保留原位置，但引用新 core / test-support 时必须使用稳定入口。

阶段提交：

```text
refactor: establish core source boundaries
```

### 阶段 2：Platform

1. 将文件句柄、连接记录、文件 Repository、文件合同与文件加密归入 `platform/files`。
2. 将通用 Repository 和内容身份归入 `platform/persistence`；执行唯一生产改名 `backupContentIdentity.ts → ledgerContentIdentity.ts`，导出符号不变。
3. 将当前密码学工具归入 `platform/encryption`，文件会话协调归入 `platform/coordination`，Binance client 归入 `platform/integrations`。
4. 将旧 IndexedDB、旧加密 envelope / service、WebCrypto service、`composition/ledgerAccessController.ts` 和对应 legacy 测试归入 `platform/legacy`；不得删除或重新解释旧格式拒绝链。
5. 为六个 platform 二级区建立稳定入口并更新引用。

阶段提交：

```text
refactor: group storage and integrations under platform
```

### 阶段 3：Features

1. 按放置表归位 backup、charts、fees、market-data、portfolio、prices、trades 的界面、逻辑和测试。
2. 每个功能建立逻辑 `index.ts` 与界面 `ui.ts`；逻辑入口不得 re-export UI。
3. 功能内同目录引用使用 `./`；跨功能、core、platform、app、ui 必须走稳定入口。
4. `tailwind.config.ts` 暂时同时扫描尚未搬完的旧界面目录以及新 `features`，避免阶段中 CSS 被误裁剪。
5. 不建立 NLP、账户、桌面端或其他尚未实现的空功能目录。

阶段提交：

```text
refactor: organize product features
```

### 阶段 4：App、UI 与最终配置

1. 将 Dashboard、访问 Gate、应用 composition、持久化 hook 和 hydration state 移入 `app`；`ledgerAccessController` 仍留在 `platform/legacy`。
2. 将 `ConfirmDeleteButton*` 移入扁平 `ui`，建立 `ui/index.ts`。
3. 建立只暴露稳定应用类型的 `app/index.ts`，消除功能 UI 对 app 内部文件的深层引用。
4. 更新 Next.js 入口及全部调用者。
5. 将 Tailwind 最终扫描范围收紧为 `app / features / ui`，删除过期 `pages / components` 路径；不改任何 CSS 内容或 class。

阶段提交：

```text
refactor: align application shell and shared UI
```

### 阶段 5：结构守卫与说明收口

1. 在现有 ESLint 中使用 `no-restricted-imports` 阻止 `../`、深层内部引用和非法 `@root` 引用；不安装插件或依赖。
2. 新增 `src/test-support/sourceLayout.test.ts`，至少验证：
   - `src` 的受管理一级入口只有六个职责区域与 `README.md`；测试可忽略未受 Git 管理的操作系统点文件；
   - adapters、backup、calculators、components、composition、coordination、data、encryption、hooks、marketData、models、policies、repositories、services、state、test、utils、validators 等旧一级目录不存在；
   - 七个功能目录都同时存在 `index.ts` 与 `ui.ts`；
   - core / platform 各二级区域以及 app、ui、test-support 的稳定入口存在。
3. 根 `README.md` 增加简短英文六区源码地图；新增英文 `src/README.md`，记录放置规则、引用合同和“新增一个功能”的最小模板。
4. 合并现有 adapters、calculators、models、repositories、services、utils、validators 小 README 的仍有效内容，然后删除零散旧 README；不为六区各写一份重复说明。
5. 搜索并确认旧目录名、旧 import、`../`、深层 alias 和旧 `backupContentIdentity.ts` 路径没有受 Git 管理的残留。

阶段提交：

```text
chore: enforce and document source layout
```

## 七、每阶段质量 Gate 与 diff 审计

每阶段提交前依次运行：

```text
npm test
npm run lint
npm run build
npm run typecheck
git diff --check
```

不得并行运行 build 与 typecheck。每次运行必须记录命令、退出码、测试文件数和测试项数。第五阶段前不得少于 58 / 727；第五阶段加入结构测试后必须高于该基线。

提交前使用 rename-aware diff 和文本搜索证明：

- 生产文件只发生移动、唯一允许的文件改名、import / export 地址变化以及计划内配置 / README 变化。
- 生产函数体、类型合同、文案、CSS 和 Tailwind class 没有变化。
- 测试断言只因入口地址或结构测试而变化，不通过删测试、跳过测试、放宽断言获得绿灯。
- `package.json` 与 lockfile 无 diff。
- 没有进入 `CS2026` 或 `02_NLP`。

暂存只能显式包含本阶段文件。`git diff --cached --check` 和 staged diff 通过后才提交。每个 commit 后必须确认：

```text
branch = zhennn/w13-main-source-layout
worktree = clean
upstream = none
```

五阶段提交后，在干净分支再次完整重复五项自动检查，并记录最终 commit、五个阶段 commit 的顺序和 `7481e78..HEAD` 的完整范围。

## 八、真实 Google Chrome 冒烟测试

自动检查全部通过后才进入真实浏览器。必须使用系统 Google Chrome 和系统文件选择器；jsdom、组件测试、开发服务器静态查看、截图或内嵌浏览器不能替代。

### 8.1 隔离环境

1. 使用最终 production build，在 `127.0.0.1:3101` 启动 production server。
2. 用系统临时目录创建本轮唯一测试目录，记录其精确绝对路径。
3. 只在该目录新建一个全新、虚构、版本 2 的 `.lftl`。文件名、密码和交易数据均不得来自个人账本。
4. 系统 picker 中不得选择、浏览或接触任何真实个人 `.lftl`。

### 8.2 固定用户流程

```text
创建虚构 V2 .lftl
→ 设置虚构密码并进入 Dashboard
→ 新增 BTC 买入：quantity 0.1、price 65000、totalValue 6500 USDT、fee 5 USDT
→ 确认交易列表、持仓与含费结果正常显示并完成认证保存
→ 锁定并释放当前文件
→ 通过系统 picker 重新选择同一虚构文件
→ 使用同一虚构密码解锁
→ 确认交易、持仓和含费结果仍存在
```

同时在 1280px 和 390px 视口确认：页面保留完整样式、无整页横向溢出、无应用错误。记录 Chrome console 中的 error 状态，不得把已有单元测试结论当作浏览器证据。

完成后先让应用释放文件，再只清理本轮已记录的临时测试目录；不得使用宽泛路径、通配符或未解析变量清理。若真实 Chrome、系统 picker、新建 / 重开同一文件、持久化或双视口任一项无法完成，整批判 `BLOCKED`。

## 九、01B 输出合同

目标模式无论 `PASS` 还是最终 `BLOCKED`，都必须在根文档仓库新增：

```text
01一些进度/日志/week13_260811/01B_W13-main-源码目录重构执行报告.md
```

01B 使用中文，先写结论，至少包含：

- 最终判定：`PASS` 或 `BLOCKED`，以及该判定的直接原因。
- 根文档仓库与源码仓库的实际绝对路径、最终 branch、HEAD、status、ahead / behind、upstream、push / merge 状态。
- 源码 base commit、final commit 和五个阶段 commit 的完整 hash、标题、顺序。
- 基线、每阶段、五阶段结束后的最终自动检查结果；列出测试文件数和测试项数。
- 真实 Chrome 的 server 地址、临时文件范围、固定交易、保存 / 锁定 / 重开结果、1280 / 390 结果和 console 状态。
- 最终实际目录树、稳定入口、唯一改名及与本文计划的偏差。
- 未完成项、遗留风险和未取得的证据；不得隐藏临时失败或把 BLOCKED 改写为 PASS。

01B 完成自检后，只在根文档仓库显式暂存该文件并提交：

```text
docs: 记录 Week 13 源码目录重构执行结果
```

不得把源码变更混入根文档提交，不得推送。若根文档仓库存在用户的其他改动，保留并排除在本次暂存之外。

## 十、停止条件与最终自检

以下任一情况必须停止扩张范围，优先在现有授权内修复；确实无法取得证据时写 `BLOCKED`：

- 路径、worktree、分支、固定基线或干净状态不符。
- 发现必须修改业务逻辑、数据合同、UI、样式、依赖或 package / lockfile 才能继续。
- 原有测试减少，或只能通过删测试、跳过检查、放宽断言完成。
- 任一阶段未通过完整质量 Gate。
- 无法证明生产函数体、类型合同、文案和样式未变。
- 真实 Chrome 或系统 picker 不能提供完整固定流程证据。
- 需要接触真实个人账本、`CS2026`、`02_NLP` 或未授权 Git 操作。

成功结束时的唯一允许状态：

| 维护面 | 完成线 |
| --- | --- |
| 产品源码 | 本地 `zhennn/w13-main-source-layout`，五个独立 commit，clean，无 upstream，未 merge、未 push |
| 源码 `main` | 仍为 `7481e78`，本地与远端均未因本任务改变 |
| 根文档 | `main` 含独立 01A / 01B 中文提交，其他用户改动未混入，未 push |
| 结果文件 | 只生成 01B；不生成 01C / 01D，不更新当前状态，不写 99 日志 |

完成上述证据前，不得宣称源码搬家成功。
